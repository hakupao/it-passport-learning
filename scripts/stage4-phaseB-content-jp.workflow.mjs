export const meta = {
  name: 'stage4-phaseB-content-jp',
  description: 'Stage 4 Phase B: バッチ unit の日語正文生成 (四段 D-115) + Rule D 核験 (args=unit id 配列)',
  phases: [
    { title: 'Write', detail: 'general-purpose(opus) が日語正文(概要/用語講解/まとめ+Mermaid)を生成' },
    { title: 'Review', detail: 'code-reviewer(opus) Rule D 核験 + 非PASS は repair' },
  ],
}

const CONTENT_SCHEMA = {
  type: 'object',
  required: ['unit_id', 'topic_id', 'overview_jp', 'terms', 'summary_jp'],
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    topic_id: { type: 'string' },
    overview_jp: {
      type: 'object',
      required: ['intro_jp'],
      additionalProperties: false,
      properties: { intro_jp: { type: 'string', description: 'ユニット概要 一段(~80〜150字): 何を学ぶか + なぜ重要か' } },
    },
    terms: {
      type: 'array',
      items: {
        type: 'object',
        required: ['term', 'definition_jp', 'explanation_jp', 'analogy_jp', 'memory_hook_jp', 'needs_figure', 'mermaid'],
        additionalProperties: false,
        properties: {
          term: { type: 'string', description: '入力 unit の term と完全一致(順序も)' },
          definition_jp: { type: 'string', description: '一行定義 ~30〜60字' },
          explanation_jp: { type: 'string', description: 'やさしい解説 2〜3段 ~150〜300字。試験で問われる観点を含める' },
          analogy_jp: { type: 'string', description: '身近な例え ~50〜120字' },
          memory_hook_jp: { type: 'string', description: '記憶フック。必ず「○○といえば××」形式 (D-116)' },
          needs_figure: { type: 'boolean', description: '図解が理解を助けるか(構造/関係/過程の概念は true)' },
          mermaid: { type: ['string', 'null'], description: 'needs_figure=true なら Mermaid source、else null' },
        },
      },
    },
    summary_jp: {
      type: 'object',
      required: ['memory_hooks', 'key_points_jp'],
      additionalProperties: false,
      properties: {
        memory_hooks: { type: 'array', items: { type: 'string' }, description: '全 term の記憶フック一覧(「term: ○○といえば××」)' },
        key_points_jp: { type: 'array', items: { type: 'string' }, description: 'このユニットの要点 3〜5個' },
      },
    },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  required: ['unit_id', 'verdict', 'checks', 'issues', 'recommendation_jp'],
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object',
      required: ['terms_exact_and_ordered', 'all_fields_present', 'memory_hook_format', 'mermaid_valid', 'factually_sound', 'no_fabricated_terms'],
      additionalProperties: false,
      properties: {
        terms_exact_and_ordered: { type: 'boolean', description: '入力 term が同一順・同一文字列で全て出現' },
        all_fields_present: { type: 'boolean', description: '各 term の定義/解説/例え/記憶フックが非空かつ妥当な長さ' },
        memory_hook_format: { type: 'boolean', description: '全記憶フックが「…といえば…」形式' },
        mermaid_valid: { type: 'boolean', description: 'needs_figure=true の mermaid が graph/flowchart で構文妥当・日本語ラベルは引用符' },
        factually_sound: { type: 'boolean', description: '定義・解説に明白な事実誤りがない(IT パスポート水準)' },
        no_fabricated_terms: { type: 'boolean', description: '入力に無い term を勝手に追加していない' },
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
          term: { type: 'string' },
          detail_jp: { type: 'string' },
        },
      },
    },
    recommendation_jp: { type: 'string' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const idxPath = `${ROOT}/data/ip/textbook/unit_index.json`
const contentPath = (u) => `${ROOT}/data/ip/textbook/.planning/content_${u}.json`

function writerPrompt(unitId, feedback) {
  return `あなたは IT パスポート試験の教科書執筆者です。1ユニットの**日本語正文**を執筆します(三語のうち日語が権威源、翻訳は後工程)。

## 入力
\`${idxPath}\` を Read し、unit_id=\`${unitId}\` の unit を見つけてください。取得物:
- 親 topic の objective_jp / name_jp / node_frequency.badge
- unit の title_jp / summary_jp / terms[] (**この順序・文字列のまま使う**。各 term に freq_in_topic あり=出題頻度の目安)

## 出力する正文 (四段構造 D-115、本工程は日語のみ)
1. **overview_jp.intro_jp**: ユニット概要を一段(~80〜150字)。何を学ぶ単元か + 試験での重要性。
2. **terms[]**: 入力 terms と同一順・同一文字列で、各 term に:
   - **definition_jp**: 一行定義 (~30〜60字)。正確で簡潔に。
   - **explanation_jp**: やさしい解説 (2〜3段, ~150〜300字)。初学者にも分かる言葉で、**試験で問われる観点**(他概念との違い・典型例)を織り込む。
   - **analogy_jp**: 身近な例え (~50〜120字)。日常の比喩で直感的に。
   - **memory_hook_jp**: 記憶フック。**必ず「○○といえば××」形式** (D-116)。例「RAIDといえば複数ディスクで冗長化」。
   - **needs_figure**: 構造/関係/過程を持つ概念(例: RAID 構成・仮想化方式・インシデント→問題のフロー・権利の体系)は true。単純な定義語は false。**ユニット全体で約30%の term が true** を目安(6語なら1〜2個)。
   - **mermaid**: needs_figure=true なら Mermaid source、false なら null。
3. **summary_jp.memory_hooks**: 全 term の記憶フック一覧(「term: ○○といえば××」)。
4. **summary_jp.key_points_jp**: ユニット要点 3〜5個。

## Mermaid 規則 (mmdc でレンダ可能なこと)
- 先頭は \`graph TD\` または \`graph LR\` または \`flowchart TD\`。
- 日本語ラベルは必ずダブルクォートで囲む: \`A["著作権法"]\`。
- ノード数 ≤ 8、シンプルに。\`;\` 区切り or 改行。括弧・特殊記号をラベル生テキストに入れない(引用符内に収める)。
- 構文が壊れるとレンダ失敗 → 不要な複雑さを避ける。

## 事実性 (Rule A 精神)
- 定義・数値・法令名は正確に。曖昧なら一般的・保守的な記述に留め、捏造しない。IT パスポート水準。

## 手順
1. unit データを把握。
2. 日語正文を熟考して執筆。
3. CONTENT_SCHEMA と同形の JSON を \`${contentPath(unitId)}\` に Write。
4. 同じ内容を StructuredOutput で返す。
${feedback ? `\n## 前ラウンドの Rule D 指摘 (必ず是正)\n${feedback}\n` : ''}`
}

function reviewerPrompt(unitId, content) {
  return `あなたは独立検証者(Rule D: 執筆者と別役割)です。IT パスポート教科書の1ユニット日語正文を**批判的に**核験します。

## 対象 unit: ${unitId}
入力(term の正解リスト): \`${idxPath}\` を Read し unit_id=\`${unitId}\` の terms[] を取得。
検証対象 content(JSON):
\`\`\`json
${JSON.stringify(content).slice(0, 14000)}
\`\`\`

## 検査項目
1. **terms_exact_and_ordered**: 入力 terms が同一順・同一文字列で全て出現(過不足・改変・順序ずれ無し)。
2. **all_fields_present**: 各 term の definition/explanation/analogy/memory_hook が非空で長さ妥当(定義が長すぎ/解説が短すぎ等は issue)。
3. **memory_hook_format**: 全 memory_hook_jp が「…といえば…」形式。
4. **mermaid_valid**: needs_figure=true の term の mermaid が graph/flowchart 始まり・日本語ラベルが引用符付き・ノード数妥当で構文が壊れていないか。false なのに mermaid 非null、true なのに null も指摘。
5. **factually_sound**: 定義・解説に**明白な事実誤り**がないか(IT パスポート水準。法令名・技術定義・数値)。疑わしい点は term 付きで issue 化。
6. **no_fabricated_terms**: 入力に無い term を追加していないか。

## verdict
- PASS: 全 check true、high issue なし。
- CONCERNS: 軽微(medium/low)な改善余地のみ。
- FAIL: term の過不足/順序崩れ/捏造、明白な事実誤り(high)、記憶フック形式の広範な逸脱、mermaid 構文崩れ。

issues は severity + term(該当時) + detail_jp。StructuredOutput で REVIEW_SCHEMA に従い返す。`
}

// args は JSON 文字列で届く場合があるため頑健にパース
const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
const unitIds = Array.isArray(parsedArgs) && parsedArgs.length ? parsedArgs : []
if (!unitIds.length) throw new Error('unitIds empty — args not received as array: ' + JSON.stringify(args).slice(0, 200))
const MAX_ROUNDS = 2

const results = await pipeline(
  unitIds,
  (unitId) =>
    agent(writerPrompt(unitId, null), {
      label: `write:${unitId}`,
      phase: 'Write',
      schema: CONTENT_SCHEMA,
      model: 'opus',
      agentType: 'general-purpose',
    }),
  async (content, unitId) => {
    if (!content) return null
    const history = []
    let current = content
    let review = null
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      review = await agent(reviewerPrompt(unitId, current), {
        label: `review:${unitId}#${round}`,
        phase: 'Review',
        schema: REVIEW_SCHEMA,
        model: 'opus',
        agentType: 'code-reviewer',
      })
      history.push({ round, verdict: review?.verdict })
      if (!review || review.verdict === 'PASS') break
      if (round === MAX_ROUNDS) break
      const fb = [
        `verdict=${review.verdict}`,
        ...Object.entries(review.checks).filter(([, v]) => !v).map(([k]) => `check FAIL: ${k}`),
        ...(review.issues || []).map((i) => `[${i.severity}]${i.term ? ' ' + i.term : ''}: ${i.detail_jp}`),
        `推奨: ${review.recommendation_jp || ''}`,
      ].filter(Boolean).join('\n')
      log(`repair ${unitId} round ${round} (verdict=${review.verdict})`)
      const rewritten = await agent(writerPrompt(unitId, fb), {
        label: `rewrite:${unitId}#${round}`,
        phase: 'Write',
        schema: CONTENT_SCHEMA,
        model: 'opus',
        agentType: 'general-purpose',
      })
      if (!rewritten) break
      current = rewritten
    }
    return { unit_id: unitId, final_content: current, final_review: review, rounds: history.length, history }
  }
)

const clean = results.filter(Boolean)
const summary = clean.map((r) => ({
  unit_id: r.unit_id,
  verdict: r.final_review?.verdict,
  rounds: r.rounds,
  terms: r.final_content?.terms?.length,
  figures: r.final_content?.terms?.filter((t) => t.needs_figure && t.mermaid).length,
}))
log(`Phase B 日語生成完了: ${summary.map((s) => `${s.unit_id}=${s.verdict}(${s.terms}t/${s.figures}fig)`).join(' | ')}`)

return { summary, results: clean }
