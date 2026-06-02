export const meta = {
  name: 'stage4-phaseB-translate',
  description: 'Stage 4 Phase B: 12 unit を日語固定源から zh/en 二次翻訳 (D-129-C) + Rule D 核験',
  phases: [
    { title: 'Translate', detail: 'general-purpose(opus) が日語源→zh/en 翻訳' },
    { title: 'Review', detail: 'code-reviewer(opus) が忠実度核験 + 非PASS は repair' },
  ],
}

const BI = { type: 'object', required: ['zh', 'en'], additionalProperties: false, properties: { zh: { type: 'string' }, en: { type: 'string' } } }

const TRANSLATION_SCHEMA = {
  type: 'object',
  required: ['unit_id', 'title', 'unit_summary', 'overview_intro', 'terms', 'summary'],
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    title: BI,
    unit_summary: BI,
    overview_intro: BI,
    terms: {
      type: 'array',
      items: {
        type: 'object',
        required: ['term_jp', 'term_zh', 'term_en', 'definition', 'explanation', 'analogy', 'memory_hook'],
        additionalProperties: false,
        properties: {
          term_jp: { type: 'string', description: '日語 term と完全一致 (整合キー、同順)' },
          term_zh: { type: 'string' },
          term_en: { type: 'string' },
          definition: BI,
          explanation: BI,
          analogy: BI,
          memory_hook: BI,
        },
      },
    },
    summary: {
      type: 'object',
      required: ['key_points', 'memory_hooks'],
      additionalProperties: false,
      properties: {
        key_points: { type: 'array', items: BI },
        memory_hooks: { type: 'array', items: BI },
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
      required: ['term_alignment', 'completeness', 'meaning_faithful', 'terminology_correct', 'no_drift_or_addition'],
      additionalProperties: false,
      properties: {
        term_alignment: { type: 'boolean', description: 'term_jp が日語源と同数・同順・同一文字列' },
        completeness: { type: 'boolean', description: '全フィールドに zh/en があり非空' },
        meaning_faithful: { type: 'boolean', description: '日語の意味を正確に保持(脱落/誤訳なし)' },
        terminology_correct: { type: 'boolean', description: 'IT パスポート専門用語が zh/en で適切' },
        no_drift_or_addition: { type: 'boolean', description: '原文に無い情報の追加や改変がない' },
      },
    },
    issues: {
      type: 'array',
      items: { type: 'object', required: ['severity', 'lang', 'detail_jp'], additionalProperties: false, properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, lang: { type: 'string', enum: ['zh', 'en', 'both'] }, term: { type: 'string' }, detail_jp: { type: 'string' } } },
    },
    recommendation_jp: { type: 'string' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const unitPath = (u) => `${ROOT}/data/ip/textbook/units/${u}.json`
const transPath = (u) => `${ROOT}/data/ip/textbook/.planning/translation_${u}.json`

function translatorPrompt(unitId, feedback) {
  return `あなたは IT パスポート教科書の翻訳者です。確定済みの**日本語(権威源)**を、簡体字中国語(zh)と英語(en)に翻訳します(D-129-C: 日語固定源→二次翻訳)。

## 入力
\`${unitPath(unitId)}\` を Read。翻訳対象の日語フィールド:
- title_jp / unit_summary_jp / overview.intro_jp
- terms[] の各: term / definition_jp / explanation_jp / analogy_jp / memory_hook_jp
- summary.key_points_jp[] / summary.memory_hooks_jp[]

## 翻訳方針
- **忠実第一**: 日語の意味・ニュアンス・教育的意図を正確に保持。情報の追加・省略・改変をしない。
- **専門用語**: IT パスポートの標準的な zh/en 専門用語を使う(例: 著作権法=著作权法/Copyright Act、特許=专利/patent、仮想化=虚拟化/virtualization、可用性=可用性/availability)。
- **zh は中国本土の標準 IT 用語を使い、日式借词を避ける** (pilot Rule A の学び)。例: 稼働率→「可用率/运行率」(×稼动率)、解約→「取消订阅/退订」(×解约)、定義要件→「定义要素」(×定义要件)、パリティ→「校验信息/奇偶校验」(×校验位)、稼働→「运行」(×稼动)。意味だけでなく本土読者にとって自然な語形を選ぶ。
- **term_jp**: 日語 term をそのままキーとして保持(同数・同順・同一文字列)。加えて term_zh / term_en に訳語を付す。
- **記憶フック**: 「○○といえば××」のニーモニック性を各言語で自然に再現 (zh 例「说到○○就是××」/ en 例「○○ → ××」or「Think of ○○ as ××」)。意味の核を保つ。
- 文体: 学習者向けにやさしく、但し正確に。zh は簡体字。en は平易な学習英語。

## 出力
1. TRANSLATION_SCHEMA と同形の JSON を \`${transPath(unitId)}\` に Write。
2. 同じ内容を StructuredOutput で返す。
${feedback ? `\n## 前ラウンドの Rule D 指摘 (是正必須)\n${feedback}\n` : ''}`
}

function reviewerPrompt(unitId, trans) {
  return `あなたは独立した翻訳検証者(Rule D: 翻訳者と別役割)です。日本語源→zh/en 翻訳の**忠実度**を批判的に核験します。

## 対象 unit: ${unitId}
日語源(正): \`${unitPath(unitId)}\` を Read (title_jp/overview.intro_jp/terms[*].{term,definition_jp,explanation_jp,analogy_jp,memory_hook_jp}/summary)。
翻訳(検証対象, JSON):
\`\`\`json
${JSON.stringify(trans).slice(0, 16000)}
\`\`\`

## 検査
1. **term_alignment**: terms[].term_jp が日語源 terms と同数・同順・同一文字列。
2. **completeness**: 全対象フィールドに zh/en があり非空 (title/unit_summary/overview_intro/各term4項/summary各項)。
3. **meaning_faithful**: zh/en が日語の意味を正確に保持。脱落・誤訳・逆の意味がないか(特に専門概念の核)。
4. **terminology_correct**: IT パスポート専門用語が zh/en で適切・自然。
5. **no_drift_or_addition**: 原文に無い説明の追加や数値・事実の改変がない。

## verdict
- PASS: 全 check true、high issue なし。
- CONCERNS: 軽微な用語選択・自然さの改善余地のみ(meaning は保持)。
- FAIL: term 不整合/欠落、誤訳・意味逆転(high)、原文に無い情報の追加。

issues は severity + lang(zh/en/both) + term(該当時) + detail_jp。StructuredOutput で REVIEW_SCHEMA に従い返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const unitIds = Array.isArray(parsed) && parsed.length ? parsed : []
if (!unitIds.length) throw new Error('unitIds empty: ' + JSON.stringify(args).slice(0, 200))
const MAX_ROUNDS = 2

const results = await pipeline(
  unitIds,
  (unitId) =>
    agent(translatorPrompt(unitId, null), { label: `tr:${unitId}`, phase: 'Translate', schema: TRANSLATION_SCHEMA, model: 'opus', agentType: 'general-purpose' }),
  async (trans, unitId) => {
    if (!trans) return null
    const history = []
    let current = trans
    let review = null
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      review = await agent(reviewerPrompt(unitId, current), { label: `trrev:${unitId}#${round}`, phase: 'Review', schema: REVIEW_SCHEMA, model: 'opus', agentType: 'code-reviewer' })
      history.push({ round, verdict: review?.verdict })
      if (!review || review.verdict === 'PASS') break
      if (round === MAX_ROUNDS) break
      const fb = [
        `verdict=${review.verdict}`,
        ...Object.entries(review.checks).filter(([, v]) => !v).map(([k]) => `check FAIL: ${k}`),
        ...(review.issues || []).map((i) => `[${i.severity}/${i.lang}]${i.term ? ' ' + i.term : ''}: ${i.detail_jp}`),
        `推奨: ${review.recommendation_jp || ''}`,
      ].filter(Boolean).join('\n')
      log(`repair tr ${unitId} round ${round} (${review.verdict})`)
      const retr = await agent(translatorPrompt(unitId, fb), { label: `retr:${unitId}#${round}`, phase: 'Translate', schema: TRANSLATION_SCHEMA, model: 'opus', agentType: 'general-purpose' })
      if (!retr) break
      current = retr
    }
    return { unit_id: unitId, final_translation: current, final_review: review, rounds: history.length }
  }
)

const clean = results.filter(Boolean)
const summary = clean.map((r) => ({ unit_id: r.unit_id, verdict: r.final_review?.verdict, rounds: r.rounds, terms: r.final_translation?.terms?.length }))
log(`翻訳完了: ${summary.map((s) => `${s.unit_id}=${s.verdict}(${s.terms}t)`).join(' | ')}`)
return { summary, results: clean }
