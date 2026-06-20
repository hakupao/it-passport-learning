export const meta = {
  name: 'quiz-phase2-ruleA',
  description: 'Quiz Phase 2 Rule A: 解説サイドカーの N-sample 独立意味抽検 (critic = writer/in-pipeline reviewer と別 subagent_type)。正解理由の妥当性+誤答説明+訳忠実度+key-guard 妥当性を独立核験',
  phases: [
    { title: 'Audit', detail: 'critic(opus) が JP源/図 vs 解説を独立核験' },
  ],
}

const AUDIT_SCHEMA = {
  type: 'object', required: ['id', 'accurate', 'severity', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    accurate: { type: 'boolean', description: '全体として解説が正しく忠実か (誤った正解根拠/誤答説明の誤り/捏造/訳ズレなし)' },
    severity: { type: 'string', enum: ['none', 'low', 'medium', 'high'], description: '最悪 issue の深刻度' },
    checks: {
      type: 'object', required: ['correct_sound', 'distractors_sound', 'translation_faithful', 'key_guard_valid'], additionalProperties: false,
      properties: {
        correct_sound: { type: 'boolean', description: '正解理由が図/論理から妥当 (keyed answer を正しく正当化)' },
        distractors_sound: { type: 'boolean', description: '各誤答肢の「なぜ誤り」説明が妥当 (3肢=正解以外)' },
        translation_faithful: { type: 'boolean', description: 'zh/en が JP 解説に忠実・本土 zh・用語整合' },
        key_guard_valid: { type: 'boolean', description: 'key_guard (suspect 判定) が図と照らして妥当 — 図と矛盾の見落とし(=false suspect=false) も誤検出(=不要 suspect)もない' },
      },
    },
    independent_answer: { type: 'string', description: 'あなたが図/stem から独立に導出した正解字母 (検算)' },
    issues: { type: 'array', items: { type: 'object', required: ['lang', 'severity', 'detail_jp'], additionalProperties: false, properties: { lang: { type: 'string', enum: ['zh', 'en', 'jp', 'both'] }, severity: { type: 'string', enum: ['low', 'medium', 'high'] }, detail_jp: { type: 'string' } } } },
  },
}

function auditPrompt(inputPath, id, hasFigure) {
  const figureNote = hasFigure
    ? `\nこの問は figure 問。input サンプルの \`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ=権威、crop は端で列欠落しうる) の**両方**を **Read** し、正解理由・誤答説明が図の数値/項目と一致するか、key_guard の評価が図と照らして妥当か核験。図の値は自分で読み直す (単一の読みは低解像度数字を誤読しうる — 拡大して確認)。`
    : `\nfigure無し問。stem/論理から正解理由・誤答説明が妥当か核験。`
  return `あなたは独立した解説監査者 (Rule A 意味抽検) です。過去問**解説**の正しさを、執筆者・前段レビュアーとは独立に批判的に核験します。甘く通さない。

## 入力 (Read して id="${id}" のサンプルを取得)
\`${inputPath}\` の samples[] 中 id==="${id}" のエントリ: stem_jp / choices_jp / correct_answer / has_figure / figure_png / figure_page_png / explanation{key_guard, correct{jp,zh,en}, distractors{字母:{jp,zh,en}}, points[{jp,zh,en}]}。
${figureNote}

## 核験観点
1. correct_sound: explanation.correct.jp が stored correct_answer を図/論理から妥当に正当化しているか (誤った根拠・図と不一致な数値でないか)。**まず自分で正解を独立導出** (independent_answer) し、解説の根拠と照合。
2. distractors_sound: 正解以外の3肢の「なぜ誤り」説明が各々妥当か (誤った理由付けでないか)。
3. translation_faithful: correct/distractors/points の zh/en が jp に忠実・本土 zh (日式借词でない)・用語整合。
4. key_guard_valid: key_guard が図と照らして妥当か。**特に suspect=false なのに図と矛盾 (見落とし) があれば key_guard_valid=false**。逆に不要な suspect=true も指摘。

accurate=全体として解説が正しく忠実か。severity=最悪 issue。independent_answer=あなたの独立導出字母。issues は lang+severity+detail_jp。StructuredOutput で AUDIT_SCHEMA に従い返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? [] // [{id, has_figure}]
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id,has_figure}]}')

const audits = await parallel(
  items.map((it) => () => agent(auditPrompt(inputPath, it.id, it.has_figure), { label: `audit:${it.id}`, phase: 'Audit', schema: AUDIT_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:critic' })),
)

const clean = audits.filter(Boolean)
const accurate = clean.filter((a) => a.accurate).length
const bySeverity = clean.reduce((m, a) => { m[a.severity] = (m[a.severity] || 0) + 1; return m }, {})
const keyGuardMismatch = clean.filter((a) => a.checks && a.checks.key_guard_valid === false).map((a) => a.id)
log(`Rule A 監査完了: accurate ${accurate}/${clean.length}, severity ${JSON.stringify(bySeverity)}, key_guard_invalid ${keyGuardMismatch.length}`)
return { n: clean.length, accurate, bySeverity, keyGuardMismatch, audits: clean }
