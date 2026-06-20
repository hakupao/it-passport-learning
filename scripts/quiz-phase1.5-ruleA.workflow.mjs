export const meta = {
  name: 'quiz-phase1.5-ruleA',
  description: 'Quiz Phase 1.5 Rule A: 再構成済 stem の N-sample 独立抽検。auditor=code-reviewer (in-pipeline critic とも writer とも別 subagent_type=Rule D)。figure問は図↔再構成 stem を逐セル再照合、非fig は backup 照合、+ 解答選択肢表 (ア/イ/ウ/エ 行) の混入 (回帰) も検出',
  phases: [
    { title: 'Audit', detail: 'code-reviewer(opus) が源 (figure/backup) vs 再構成 stem を独立核験' },
  ],
}

const AUDIT_SCHEMA = {
  type: 'object', required: ['id', 'faithful', 'severity', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    faithful: { type: 'boolean', description: '再構成 stem が源 (図/backup) に忠実か (逐セル一致・意味保持・捏造なし・正誤不変)' },
    severity: { type: 'string', enum: ['none', 'low', 'medium', 'high'], description: '最悪 issue の深刻度 (answer-affecting=high)' },
    checks: {
      type: 'object', required: ['source_faithful', 'supports_key', 'trilingual_consistent', 'no_choice_table_leak'], additionalProperties: false,
      properties: {
        source_faithful: { type: 'boolean', description: 'figure: stem の表が図と逐セル一致 (値/行数/行順/成功失敗/条件語、脱落・scramble・混入なし) / 非fig: backup の意味保持・脱落復元妥当' },
        supports_key: { type: 'boolean', description: '再構成 stem + choices から correct_answer が妥当に導ける' },
        trilingual_consistent: { type: 'boolean', description: 'zh/en が stem_jp_clean に忠実・本土zh・用語整合' },
        no_choice_table_leak: { type: 'boolean', description: '解答選択肢 (ア/イ/ウ/エ の一覧表) が stem に混入していない (問題データ表はOK)' },
      },
    },
    independent_answer: { type: 'string', description: '監査者が再構成 stem + choices から独立に導いた正解字母' },
    issues: { type: 'array', items: { type: 'object', required: ['severity', 'detail_jp'], additionalProperties: false, properties: { severity: { type: 'string', enum: ['low', 'medium', 'high'] }, detail_jp: { type: 'string' } } } },
  },
}

function auditPrompt(inputPath, id, klass) {
  const srcBlock = klass === 'figure'
    ? `この問は figure 問。input エントリの \`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ=権威、crop は端で列/行が欠落しうる) の**両方**を **Read**。再構成された \`reconstructed.stem_jp_clean\` の表 (markdown) を、図の**全セル・全行・行順・条件語**と逐項照合。答案が robust でも図と食い違えば source_faithful=false (S97 q066 教訓: 図表腐敗は答案非依存でも欠陥)。`
    : `figure 無し問。\`stem_corrupted_backup\` (元OCR、修復前) と \`reconstructed.stem_jp_clean\` を照合し、s7x 修復で脱落していた意味 (条件語「あと/以前/最も/だけ/を除く」・否定・節) が正しく復元され backup の意味を保持しているか。`
  return `あなたは独立した stem 再構成監査者 (Rule A 意味抽検) です。再構成者 (writer) とも in-pipeline 検証者 (critic) とも別人格として、再構成された設問文が源に忠実か批判的に核験します。甘く通さない。

## 入力 (Read して id="${id}" のデータを取得)
\`${inputPath}\` の samples[] 中 id==="${id}" のエントリ: choices_jp / correct_answer / figure_png / figure_page_png / stem_corrupted_backup / reconstructed{stem_jp_clean, stem{zh,en}} / change_summary_jp。
${srcBlock}

## 核験観点 (checks)
1. source_faithful: 上記 (figure 逐セル / backup 意味保持)。
2. supports_key: 再構成 stem + choices から correct_answer (=正解) が妥当に導ける。independent_answer に自分の導出字母を記す。
3. trilingual_consistent: zh/en が stem_jp_clean に忠実・本土zh・用語整合。
4. no_choice_table_leak: **解答選択肢の一覧 (ア/イ/ウ/エ を行とする表)** が stem_jp_clean に混入していない (回帰検出。問題が参照するデータ表=ログイン記録/取引表等は混入でなくOK)。

faithful=全体忠実か。severity=最悪 issue (正誤に影響=high / 意味ずれ=medium / 字面=low / 無=none)。issues は severity+detail_jp。StructuredOutput で AUDIT_SCHEMA に従い返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? [] // [{id, klass}]
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id,klass}]}')

const audits = await parallel(
  items.map((it) => () => agent(auditPrompt(inputPath, it.id, it.klass), { label: `audit:${it.id}`, phase: 'Audit', schema: AUDIT_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:code-reviewer' })),
)

const clean = audits.filter(Boolean)
const faithful = clean.filter((a) => a.faithful).length
const bySeverity = clean.reduce((m, a) => { m[a.severity] = (m[a.severity] || 0) + 1; return m }, {})
const leaks = clean.filter((a) => a.checks && a.checks.no_choice_table_leak === false).map((a) => a.id)
const keyMismatch = clean.filter((a) => a.independent_answer && a.checks && a.checks.supports_key === false).map((a) => a.id)
log(`Rule A 監査完了: faithful ${faithful}/${clean.length}, severity ${JSON.stringify(bySeverity)}${leaks.length ? `, choice-table-leak ${leaks.join(",")}` : ""}${keyMismatch.length ? `, key-unsupported ${keyMismatch.join(",")}` : ""}`)
return { n: clean.length, faithful, bySeverity, leaks, keyMismatch, audits: clean }
