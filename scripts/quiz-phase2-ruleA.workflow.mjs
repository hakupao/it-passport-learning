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

function auditPrompt(inputPath, id, hasFigure, inputOnly, promptV2) {
  const figureNote = hasFigure
    ? `\nこの問は figure 問。input サンプルの \`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ=権威、crop は端で列欠落しうる) の**両方**を **Read** し、正解理由・誤答説明が図の数値/項目と一致するか、key_guard の評価が図と照らして妥当か核験。図の値は自分で読み直す (単一の読みは低解像度数字を誤読しうる — 拡大して確認)。`
    : `\nfigure無し問。stem/論理から正解理由・誤答説明が妥当か核験。`
  const inputOnlyNote = inputOnly
    ? `\n**読んでよいのは上記 input ファイルと、その sample が指す PNG だけ**。repo の corpus (data/ip/quiz/ 配下の questions.json / explanations/ / translations/ 等) や他の evidence は読まない・比較しない (解説そのものを自分の推論で核験する監査であり、別の写しとの照合ではない)。`
    : ''
  // S131 D-174: ecal2 植錯較正の見逃し 5 件 (結論不変の局所誤り・他 field に手掛かり無し) に当てた明示検査項目
  const v2Note = promptV2
    ? `\n\n## 追加の必須検査 (結論が正しくても省略しない)
5. 題幹の前提・条件 (値の範囲、障害の有無、対象の限定など) を列挙し、正解理由・各誤答説明・points のすべての記述がそれと矛盾しないか一文ずつ確かめる。
6. 解説が選択肢の内容に言及する箇所は、その選択肢本文 (数値・語・組合せ) と逐語で照合する。文として正しい知識でも、選択肢本文と食い違えば誤り。
7. 解説中の数値・式・合計・中間値は、結論に影響しないものも含めてすべて自分で再計算する。図の値は図から読み直す。
8. 用語・概念の定義や例示の誤り (類似概念との混同、不適切な例) は、結論が変わらなくても学習者に誤った知識を教えるため **medium** とする。low は表記揺れ・訳語の好み・冗長さに限る。`
    : ''
  return `あなたは独立した解説監査者 (Rule A 意味抽検) です。過去問**解説**の正しさを、執筆者・前段レビュアーとは独立に批判的に核験します。甘く通さない。

## 入力 (Read して id="${id}" のサンプルを取得)
\`${inputPath}\` の samples[] 中 id==="${id}" のエントリ: stem_jp / choices_jp / correct_answer / has_figure / figure_png / figure_page_png / explanation{key_guard, correct{jp,zh,en}, distractors{字母:{jp,zh,en}}, points[{jp,zh,en}]}。
${figureNote}${inputOnlyNote}

## 核験観点
1. correct_sound: explanation.correct.jp が stored correct_answer を図/論理から妥当に正当化しているか (誤った根拠・図と不一致な数値でないか)。**まず自分で正解を独立導出** (independent_answer) し、解説の根拠と照合。
2. distractors_sound: 正解以外の3肢の「なぜ誤り」説明が各々妥当か (誤った理由付けでないか)。
3. translation_faithful: correct/distractors/points の zh/en が jp に忠実・本土 zh (日式借词でない)・用語整合。
4. key_guard_valid: key_guard が図と照らして妥当か。**特に suspect=false なのに図と矛盾 (見落とし) があれば key_guard_valid=false**。逆に不要な suspect=true も指摘。${v2Note}

accurate=全体として解説が正しく忠実か。severity=最悪 issue。independent_answer=あなたの独立導出字母。issues は lang+severity+detail_jp。StructuredOutput で AUDIT_SCHEMA に従い返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
// S131 D-174: prompt_version=2 で追加検査 5〜8 を有効化 (既定は従来 prompt)
// S131 D-173: input_only=true は監査者の読み取りを input + PNG に限定する (植錯較正で corpus との diff を封じる)
let items = parsed?.items // [{id, has_figure}]
// Compact spec (transcription-safe): build items from {exam_id, qnums, figure_nums}.
// The Rule A sample is a non-contiguous subset, so pass explicit qnums (question numbers).
if ((!items || !items.length) && parsed?.exam_id && Array.isArray(parsed?.qnums)) {
  const figSet = new Set(parsed.figure_nums ?? [])
  items = parsed.qnums.map((n) => ({ id: `${parsed.exam_id}-q${String(n).padStart(3, '0')}`, has_figure: figSet.has(n) }))
}
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id,has_figure}]} or {input_path, exam_id, qnums, figure_nums}')

const audits = await parallel(
  items.map((it) => () => agent(auditPrompt(inputPath, it.id, it.has_figure, parsed?.input_only === true, parsed?.prompt_version === 2), { label: `audit:${it.id}`, phase: 'Audit', schema: AUDIT_SCHEMA, model: 'opus', agentType: 'pr-review-toolkit:code-reviewer' })),
)

const clean = audits.filter(Boolean)
const accurate = clean.filter((a) => a.accurate).length
const bySeverity = clean.reduce((m, a) => { m[a.severity] = (m[a.severity] || 0) + 1; return m }, {})
const keyGuardMismatch = clean.filter((a) => a.checks && a.checks.key_guard_valid === false).map((a) => a.id)
log(`Rule A 監査完了: accurate ${accurate}/${clean.length}, severity ${JSON.stringify(bySeverity)}, key_guard_invalid ${keyGuardMismatch.length}`)
return { n: clean.length, accurate, bySeverity, keyGuardMismatch, audits: clean }
