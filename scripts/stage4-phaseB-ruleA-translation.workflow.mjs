export const meta = {
  name: 'stage4-phaseB-ruleA-translation',
  description: 'Stage 4 Phase B 翻訳 Rule A 忠実度抽检 (N=8, critic/opus 独立)',
  phases: [{ title: 'Audit', detail: 'critic(opus) が zh/en の日語源忠実度を独立核験' }],
}

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['unit_id', 'term', 'faithful', 'severity', 'checks', 'issues_jp', 'suggested_fix_jp'],
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    term: { type: 'string' },
    faithful: { type: 'boolean', description: 'zh/en が日語の意味を正確に保持し専門用語も適切か' },
    severity: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
    checks: {
      type: 'object',
      required: ['zh_faithful', 'en_faithful', 'terminology_natural', 'no_omission_or_addition'],
      additionalProperties: false,
      properties: {
        zh_faithful: { type: 'boolean' },
        en_faithful: { type: 'boolean' },
        terminology_natural: { type: 'boolean', description: 'zh/en の専門用語が自然・正確' },
        no_omission_or_addition: { type: 'boolean' },
      },
    },
    issues_jp: { type: 'array', items: { type: 'string' } },
    suggested_fix_jp: { type: 'string' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'

function auditPrompt(unitId, term) {
  return `あなたは独立した翻訳監査者(翻訳者・構造レビュアーとは別役割・別視点)です。1用語の **zh/en 翻訳が日本語源に忠実か** を批判的に核験します。

## 対象
unit: ${unitId} / 用語:「${term}」
\`${ROOT}/data/ip/textbook/units/${unitId}.json\` を Read し、terms[] から term=「${term}」を見つけ、以下を比較してください:
- definition_jp ↔ definition_zh ↔ definition_en
- explanation_jp ↔ explanation_zh ↔ explanation_en
- analogy_jp ↔ analogy_zh ↔ analogy_en
- memory_hook_jp ↔ memory_hook_zh ↔ memory_hook_en

## 監査観点
1. **zh_faithful**: 中文が日語の意味を正確に保持(脱落・誤訳・意味逆転なし)。特に専門概念の核(例: 自動発生/登録、無審査、可用性等)。
2. **en_faithful**: 英語が日語の意味を正確に保持。
3. **terminology_natural**: zh/en の IT パスポート専門用語が自然・正確(直訳調で不自然/中国本土で使われない語形でないか)。
4. **no_omission_or_addition**: 原文に無い情報の追加や、原文の要点の欠落がない。

## 判定
- faithful=true: 意味は正確(low の自然さ改善余地はあってよい)。
- faithful=false: 誤訳・意味逆転・重大な欠落/追加がある。
- severity: none/low(自然さ)/medium(誤解を招く)/high(明白な誤訳・逆転)。

記憶のみでなく一般的な IT パスポート知識に照らして判断。確信なき指摘は severity を上げない。StructuredOutput で AUDIT_SCHEMA に従い返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const samples = (Array.isArray(parsed) ? parsed : []).map((s) => { const [unit_id, term] = s.split('::'); return { unit_id, term } })
if (!samples.length) throw new Error('no samples')

const results = await parallel(
  samples.map((s) => () => agent(auditPrompt(s.unit_id, s.term), { label: `traudit:${s.unit_id}:${s.term}`, phase: 'Audit', schema: AUDIT_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:critic' }))
)
const clean = results.filter(Boolean)
const faithful = clean.filter((r) => r.faithful).length
const bySev = { none: 0, low: 0, medium: 0, high: 0 }
clean.forEach((r) => { bySev[r.severity] = (bySev[r.severity] || 0) + 1 })
const flagged = clean.filter((r) => !r.faithful || r.severity === 'medium' || r.severity === 'high')
log(`Rule A 翻訳: N=${clean.length} faithful=${faithful} (${Math.round((faithful / clean.length) * 100)}%) sev=${JSON.stringify(bySev)}`)
return { n: clean.length, faithful, faithful_pct: Math.round((faithful / clean.length) * 100), severity: bySev, flagged: flagged.map((r) => ({ unit_id: r.unit_id, term: r.term, severity: r.severity, faithful: r.faithful, issues_jp: r.issues_jp, suggested_fix_jp: r.suggested_fix_jp })), all: clean }
