export const meta = {
  name: 'stage4-phaseA-planning',
  description: 'Stage 4 Phase A: per-topic LLM 規劃 pass (3 pilot 節点) → unit 分割/排列 + Rule D 核験',
  phases: [
    { title: 'Plan', detail: 'general-purpose(opus) が topic ごとに unit 分割/排列を構造化出力' },
    { title: 'Review', detail: 'code-reviewer(opus) が Rule D 核験 + 非PASS なら repair ループ' },
  ],
}

// ---- 構造化出力スキーマ ----
const PLAN_SCHEMA = {
  type: 'object',
  required: ['topic_id', 'planning_notes_jp', 'unit_order', 'units'],
  additionalProperties: false,
  properties: {
    topic_id: { type: 'string' },
    planning_notes_jp: { type: 'string', description: '全体の分割方針・概念依存の判断根拠' },
    unit_order: { type: 'array', items: { type: 'string' }, description: '推奨学習順の unit_id 配列' },
    units: {
      type: 'array',
      items: {
        type: 'object',
        required: ['unit_id', 'title_jp', 'summary_jp', 'rationale_jp', 'terms', 'prerequisites'],
        additionalProperties: false,
        properties: {
          unit_id: { type: 'string', description: '{topic_id}-u01 形式' },
          title_jp: { type: 'string', description: 'ユニット名(日本語、簡潔)' },
          summary_jp: { type: 'string', description: 'このユニットが扱う内容を一文で' },
          rationale_jp: { type: 'string', description: 'なぜこの term 群をまとめたか + なぜこの位置か' },
          terms: {
            type: 'array',
            items: {
              type: 'object',
              required: ['term', 'order_reason_jp'],
              additionalProperties: false,
              properties: {
                term: { type: 'string', description: '入力 terms の term 文字列と完全一致' },
                order_reason_jp: { type: 'string', description: 'この順に置いた理由(概念依存 or 頻度)' },
              },
            },
          },
          prerequisites: { type: 'array', items: { type: 'string' }, description: '先に学ぶべき同 topic 内 unit_id' },
        },
      },
    },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  required: ['topic_id', 'verdict', 'checks', 'issues', 'missing_terms', 'duplicate_terms', 'extra_terms', 'recommendation_jp'],
  additionalProperties: false,
  properties: {
    topic_id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object',
      required: ['all_terms_covered', 'no_duplicates', 'unit_sizes_ok', 'concept_order_sound', 'freq_order_aux', 'prereq_consistent'],
      additionalProperties: false,
      properties: {
        all_terms_covered: { type: 'boolean', description: '入力 term が全て1回ずつ出現' },
        no_duplicates: { type: 'boolean' },
        unit_sizes_ok: { type: 'boolean', description: '各 unit 5〜8 term (例外は要根拠)' },
        concept_order_sound: { type: 'boolean', description: '前置概念が依存先より前' },
        freq_order_aux: { type: 'boolean', description: 'unit内同格 term は高頻度が先' },
        prereq_consistent: { type: 'boolean', description: 'prerequisites と unit_order が矛盾しない' },
      },
    },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'detail_jp'],
        additionalProperties: false,
        properties: {
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          unit_id: { type: 'string' },
          detail_jp: { type: 'string' },
        },
      },
    },
    missing_terms: { type: 'array', items: { type: 'string' }, description: '入力にあるが plan に無い term' },
    duplicate_terms: { type: 'array', items: { type: 'string' } },
    extra_terms: { type: 'array', items: { type: 'string' }, description: '入力に無いが plan に現れた term(捏造)' },
    recommendation_jp: { type: 'string' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const inputPath = (t) => `${ROOT}/data/ip/textbook/.planning/input_${t}.json`
const planPath = (t) => `${ROOT}/data/ip/textbook/.planning/plan_${t}.json`

// ---- プロンプト ----
function plannerPrompt(topicId, feedback) {
  return `あなたは IT パスポート試験の教科書を設計する教育設計者です。1つの小分類(topic)の「学習ユニット分割と排列」を計画してください。これは Stage 4 Phase A の規劃 pass です。正文は生成しません — **骨格(目次)だけ**を作ります。

## 入力
ファイル \`${inputPath(topicId)}\` を Read してください。中身:
- topic_id / name_jp / objective_jp (この topic の学習目標)
- node_frequency (この節点の出題頻度 badge)
- terms[]: 各 term に { term(用語名), syllabus_order(シラバス自然順), freq_in_topic(この topic 内の直配過去問数), freq_global(全題库での出現数) }

## ルール (プロジェクト確定決策)
1. **5〜8 term/unit** (D-115: 1ユニット≈15分の原子単位)。逸脱(4 or 9)は強い概念的根拠がある場合のみ、rationale に明記。
2. **入力 terms を過不足なく使う**: 全 term をちょうど1回ずつ、いずれかの unit に入れる。term 文字列は入力と**完全一致**(改変・追加・削除・翻訳しない)。
3. **排列 = 概念依存を最優先、出題頻度を補助** (D-117):
   - unit の順序(unit_order): 前提概念を扱う unit を先に。
   - unit 内 term 順: 概念依存(基礎→応用)を優先し、同格なら freq_in_topic が高い term を先に。
   - prerequisites: 各 unit に、先に学ぶべき同 topic 内の unit_id を列挙(なければ空配列)。
4. **頻度は捏造しない** (D-131): freq は入力データのみ。難易度ラベルは存在しないので作らない。
5. unit_id = \`${topicId}-u01\`, \`${topicId}-u02\` … (ゼロ詰め2桁)。
6. title_jp / summary_jp / rationale_jp / order_reason_jp は日本語。簡潔かつ教育的根拠を示す。

## 思考の進め方
- objective_jp を読み、この topic の到達目標を把握。
- terms を「概念のまとまり」でグルーピング(例: 種類/方式 でまとめる、制度と契約を分ける 等)。意味理解で束ねること(機械的に syllabus 順で切らない)。
- グループ内・グループ間の概念依存を判断し、基礎→応用の流れに並べる。
- 各 unit が 5〜8 term になるよう調整。

## 出力
1. まず計画を熟考し、最終 plan を JSON で \`${planPath(topicId)}\` に Write してください(PLAN_SCHEMA と同形)。
2. その後、同じ内容を StructuredOutput ツールで返してください(PLAN_SCHEMA 準拠)。
${feedback ? `\n## 前ラウンドの Rule D 指摘 (必ず是正すること)\n${feedback}\n` : ''}`
}

function reviewerPrompt(topicId, plan) {
  return `あなたは独立した検証者(Rule D: 作成者とは別の役割)です。IT パスポート教科書の「ユニット分割計画」を**批判的に**核験します。

## 対象 topic: ${topicId}
入力(正解データ)を Read: \`${inputPath(topicId)}\`
検証対象の plan(下記 JSON):
\`\`\`json
${JSON.stringify(plan)}
\`\`\`

## 必ず機械的に検算する項目
1. **all_terms_covered**: 入力 terms の全 term が plan に**ちょうど1回**出現するか。漏れ=missing_terms、入力に無い term=extra_terms(捏造) に列挙。
2. **no_duplicates**: 同じ term が2回以上現れていないか(duplicate_terms)。
3. **unit_sizes_ok**: 各 unit が 5〜8 term か。逸脱があれば issue に unit_id と term 数を記載(rationale で正当化されているか評価)。
4. **concept_order_sound**: 前提概念が依存先より前にあるか(概念依存の妥当性)。明確な逆転は high。
5. **freq_order_aux**: unit 内で概念的に同格な term は freq_in_topic 高→低 になっているか(補助規則なので軽微)。
6. **prereq_consistent**: 各 unit の prerequisites が unit_order と矛盾しないか(後の unit を前提にしていないか)。

## verdict 基準
- **PASS**: term 過不足ゼロ + 重複ゼロ + 捏造ゼロ + サイズ規則充足 + 概念順に重大逆転なし。
- **CONCERNS**: term は健全だが排列・サイズに改善余地(medium/low issue のみ)。
- **FAIL**: term の過不足/重複/捏造、または概念順に重大逆転(high issue)。

issues は severity(high/medium/low) + unit_id(該当時) + detail_jp。recommendation_jp に是正の要点。
StructuredOutput ツールで REVIEW_SCHEMA に従い返してください。`
}

// ---- 実行: pipeline(plan → review&repair) ----
const topicIds = Array.isArray(args) && args.length ? args : ['strategy-02-04', 'management-11-29', 'technology-16-43']
const MAX_ROUNDS = 3

const results = await pipeline(
  topicIds,
  // Stage 1: 初回 plan (writer = general-purpose, Rule D の writer 側)
  (topicId) =>
    agent(plannerPrompt(topicId, null), {
      label: `plan:${topicId}`,
      phase: 'Plan',
      schema: PLAN_SCHEMA,
      model: 'opus',
      agentType: 'general-purpose',
    }),
  // Stage 2: Rule D review + repair ループ (reviewer = code-reviewer, read-only)
  async (plan, topicId) => {
    if (!plan) return null
    const history = []
    let current = plan
    let review = null
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      review = await agent(reviewerPrompt(topicId, current), {
        label: `review:${topicId}#${round}`,
        phase: 'Review',
        schema: REVIEW_SCHEMA,
        model: 'opus',
        agentType: 'code-reviewer',
      })
      history.push({ round, verdict: review?.verdict, plan: current, review })
      if (!review || review.verdict === 'PASS') break
      if (round === MAX_ROUNDS) break
      // repair: 指摘を注入して再 plan
      const fb = [
        `verdict=${review.verdict}`,
        review.missing_terms?.length ? `欠落 term: ${review.missing_terms.join(', ')}` : '',
        review.duplicate_terms?.length ? `重複 term: ${review.duplicate_terms.join(', ')}` : '',
        review.extra_terms?.length ? `捏造 term: ${review.extra_terms.join(', ')}` : '',
        ...(review.issues || []).map((i) => `[${i.severity}]${i.unit_id ? ' ' + i.unit_id : ''}: ${i.detail_jp}`),
        `推奨: ${review.recommendation_jp || ''}`,
      ].filter(Boolean).join('\n')
      log(`repair ${topicId} round ${round} (verdict=${review.verdict})`)
      const replanned = await agent(plannerPrompt(topicId, fb), {
        label: `replan:${topicId}#${round}`,
        phase: 'Plan',
        schema: PLAN_SCHEMA,
        model: 'opus',
        agentType: 'general-purpose',
      })
      if (!replanned) break
      current = replanned
    }
    return { topic_id: topicId, final_plan: current, final_review: review, rounds: history.length, history }
  }
)

const clean = results.filter(Boolean)
const summary = clean.map((r) => ({
  topic_id: r.topic_id,
  verdict: r.final_review?.verdict,
  rounds: r.rounds,
  units: r.final_plan?.units?.length,
  total_terms: r.final_plan?.units?.reduce((s, u) => s + (u.terms?.length || 0), 0),
}))
log(`Phase A 完了: ${summary.map((s) => `${s.topic_id}=${s.verdict}(${s.units}u/${s.total_terms}t,${s.rounds}r)`).join(' | ')}`)

return { summary, results: clean }
