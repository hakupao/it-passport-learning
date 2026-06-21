export const meta = {
  name: 'quiz-choicesverify',
  description: 'Quiz Phase 1.6 choices-fidelity track Phase B: proposer の修正案 (corrected_choices) を独立 critic が原典フルページから検証。各選択肢が figure-faithful か + 修正後に stored key が依然 figure 正解を指すか。写審分離 (proposer≠critic≠主 context)。',
  phases: [{ title: 'Verify', detail: 'critic(opus): 修正案を図と逐字照合 + key 整合性確認' }],
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['id', 'figure_legible', 'all_proposed_faithful', 'key_still_correct', 'verdict', 'confidence', 'notes_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    figure_legible: { type: 'boolean' },
    per_choice_ok: {
      type: 'array', description: 'ア イ ウ エ: 提案テキストが図と一致するか', items: {
        type: 'object', required: ['letter', 'proposed_ok'], additionalProperties: false,
        properties: { letter: { type: 'string' }, proposed_ok: { type: 'boolean' }, corrected_text: { type: 'string', description: 'proposed_ok=false の場合の critic 自身の正しい転写 (なければ空)' } },
      },
    },
    all_proposed_faithful: { type: 'boolean', description: 'proposer の corrected_choices 全4が図に忠実か' },
    key_still_correct: { type: 'boolean', description: '修正後の選択肢で stored_key (字母) が依然 figure の正解を指すか' },
    verdict: { type: 'string', enum: ['APPROVE', 'APPROVE_WITH_EDIT', 'DISPUTE'], description: 'APPROVE=提案そのまま採用可 / APPROVE_WITH_EDIT=per_choice_ok の corrected_text で微修正して採用 / DISPUTE=主 context 裁決要' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    notes_jp: { type: 'string' },
  },
}

function verifyPrompt(inputPath, id) {
  return `あなたは IT パスポート過去問の選択肢修正案の独立検証者 (critic) です。別の agent が出した「修正後選択肢 (proposed_choices)」が原典の図/ページに忠実か、独立に再読して検証してください。提案を鵜呑みにせず、自力で図から読み直すこと。

## 入力 (Read して id="${id}")
\`${inputPath}\` の questions[] 中 id==="${id}": stem_jp / current_choices (腐敗疑いの現値) / **proposed_choices (検証対象の修正案 ア〜エ)** / stored_key (現在の正解字母) / figure_png / figure_page_png (権威) / answer_affecting。

## 手順
1. **figure_page_png を Read** (権威、必要なら figure_png + 拡大)。
2. ア〜エ 各選択肢について、**図/ページの実際の内容**を独立に読み、proposed_choices[letter] がそれに忠実か (proposed_ok) を判定。忠実でなければ corrected_text に critic 自身の正しい転写を書く。
3. **all_proposed_faithful**: 4つ全て忠実なら true。
4. **key_still_correct**: 修正後の選択肢構成で、stored_key の字母が指す内容が figure の正解かを確認 (図から正解を自力導出して字母照合)。
5. **verdict**: 全忠実+key 整合=APPROVE / 一部に軽微誤りがあり corrected_text で直せる=APPROVE_WITH_EDIT / 図と大きく食い違う・key が破れる=DISPUTE。

## 出力
VERIFY_SCHEMA に従い StructuredOutput で返す (id="${id}")。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? []
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id}]}')
const results = await parallel(
  items.map((it) => () => agent(verifyPrompt(inputPath, it.id), { label: `cverify:${it.id}`, phase: 'Verify', schema: VERIFY_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:critic' })),
)
const clean = results.filter(Boolean)
const approve = clean.filter((r) => r.verdict === 'APPROVE')
const edit = clean.filter((r) => r.verdict === 'APPROVE_WITH_EDIT')
const dispute = clean.filter((r) => r.verdict === 'DISPUTE')
const keyBreak = clean.filter((r) => !r.key_still_correct)
log(`検証完了 ${clean.length}/${items.length}: APPROVE ${approve.length} / WITH_EDIT ${edit.length} / DISPUTE ${dispute.length} | key 破れ ${keyBreak.length}`)
return { total: items.length, done: clean.length, approve: approve.map((r) => r.id), with_edit: edit.map((r) => r.id), dispute: dispute.map((r) => r.id), key_break: keyBreak.map((r) => r.id), results: clean }
