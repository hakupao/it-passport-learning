export const meta = {
  name: 'stage4-phaseB-ruleA-audit',
  description: 'Stage 4 Phase B 日語正文 Rule A 意味抽检 (N=15, critic/opus 独立監査)',
  phases: [{ title: 'Audit', detail: 'critic(opus) が事実正確性を独立核験' }],
}

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['unit_id', 'term', 'accurate', 'severity', 'checks', 'issues_jp', 'suggested_fix_jp'],
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    term: { type: 'string' },
    accurate: { type: 'boolean', description: '事実誤りが無く IT パスポート教材として妥当か' },
    severity: { type: 'string', enum: ['none', 'low', 'medium', 'high'], description: '最も重い問題の深刻度' },
    checks: {
      type: 'object',
      required: ['definition_correct', 'explanation_correct', 'analogy_sound', 'memory_hook_correct'],
      additionalProperties: false,
      properties: {
        definition_correct: { type: 'boolean' },
        explanation_correct: { type: 'boolean' },
        analogy_sound: { type: 'boolean' },
        memory_hook_correct: { type: 'boolean' },
      },
    },
    issues_jp: { type: 'array', items: { type: 'string' }, description: '具体的な事実誤り・誤解を招く記述 (無ければ空)' },
    suggested_fix_jp: { type: 'string', description: '是正案 (問題なければ空文字)' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'

function auditPrompt(unitId, term) {
  return `あなたは IT パスポート試験の教材を検証する独立監査者です(執筆者・構造レビュアーとは別の役割・別視点)。1つの用語の日本語解説の**事実正確性**を批判的に核験します。

## 対象
unit: ${unitId} / 用語: 「${term}」
\`${ROOT}/data/ip/textbook/units/${unitId}.json\` を Read し、terms[] から term=「${term}」のエントリを見つけ、その definition_jp / explanation_jp / analogy_jp / memory_hook_jp を読んでください。

## 監査観点 (IT パスポート試験 シラバス Ver.6.5 水準)
1. **definition_correct**: 一行定義が技術的・法的に正確か。誤った定義・範囲の取り違えが無いか。
2. **explanation_correct**: 解説中の主張(数値・法令・他概念との違い・典型例)が正しいか。特に**保護期間などの数値、法令名、「審査の有無」「自動発生か登録か」等の断定**を厳密にチェック。誤りや誤解を招く表現を issues_jp に列挙。
3. **analogy_sound**: 例えが概念を歪めていないか(直感優先でも本質を誤らせないか)。
4. **memory_hook_correct**: 記憶フック「○○といえば××」の××が正しい特徴を述べているか。

## 判定
- accurate=true: 事実誤りなし(low の表現改善余地はあってよい)。
- accurate=false: 明白な事実誤り or 受験者を誤誘導する記述がある。
- severity: none(問題なし)/low(表現・完備性)/medium(誤解を招くが致命的でない)/high(明白な事実誤り)。

記憶のみに依拠せず、IT パスポートの一般的な公式知識に照らして判断してください。確信が持てない指摘は severity を上げないこと。StructuredOutput で AUDIT_SCHEMA に従い返してください。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const samples = (Array.isArray(parsed) ? parsed : []).map((s) => {
  const [unit_id, term] = s.split('::')
  return { unit_id, term }
})
if (!samples.length) throw new Error('no samples: ' + JSON.stringify(args).slice(0, 200))

const results = await parallel(
  samples.map((s) => () =>
    agent(auditPrompt(s.unit_id, s.term), {
      label: `audit:${s.unit_id}:${s.term}`,
      phase: 'Audit',
      schema: AUDIT_SCHEMA,
      model: 'opus',
      agentType: 'critic',
    })
  )
)

const clean = results.filter(Boolean)
const accurate = clean.filter((r) => r.accurate).length
const bySev = { none: 0, low: 0, medium: 0, high: 0 }
clean.forEach((r) => { bySev[r.severity] = (bySev[r.severity] || 0) + 1 })
const flagged = clean.filter((r) => !r.accurate || r.severity === 'medium' || r.severity === 'high')

log(`Rule A: N=${clean.length} accurate=${accurate} (${Math.round((accurate / clean.length) * 100)}%) | severity ${JSON.stringify(bySev)}`)

return {
  n: clean.length,
  accurate,
  accuracy_pct: Math.round((accurate / clean.length) * 100),
  severity: bySev,
  flagged: flagged.map((r) => ({ unit_id: r.unit_id, term: r.term, severity: r.severity, accurate: r.accurate, issues_jp: r.issues_jp, suggested_fix_jp: r.suggested_fix_jp })),
  all: clean,
}
