export const meta = {
  name: 'quiz-figreverify',
  description: 'Quiz figure-display track 再検証: figfix-apply で再裁断した figure_png が、その設問の図を欠けなく正しく写しているかを、figfix critic とは別 type の verifier が原典全頁から独立に確認 (S99 quiz-figreverify.run.generated.mjs の汎用化、S127 C track)。まだ誤りなら bbox(%) を出し直す。',
  phases: [{ title: 'Reverify', detail: 'verifier(opus): 再裁断図 vs 設問 vs 全頁 → 正否 + 必要なら bbox 再提示' }],
}

// figfix と同じ SCHEMA: still-bad の結果をそのまま figfix-apply の --results に渡せる
const SCHEMA = {
  type: 'object',
  required: ['id', 'current_crop_correct', 'fix_type', 'confidence', 'notes_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    current_crop_correct: { type: 'boolean', description: '再裁断後の figure_png がこの設問の正しい図を欠けなく写しているか' },
    fix_type: { type: 'string', enum: ['recrop', 'remove_figure', 'none'], description: 'none=再裁断は正しい / recrop=まだ誤り・不完全で再々裁断が要る / remove_figure=この設問は図不要' },
    correct_bbox_pct: {
      type: 'object', description: 'fix_type=recrop の時、原典全頁における正しい図領域の bbox (各値 0-100 のパーセント、図全体に小さい余白を含めた範囲)。recrop 以外は省略可', additionalProperties: false,
      properties: { x: { type: 'number' }, y: { type: 'number' }, w: { type: 'number' }, h: { type: 'number' } },
    },
    figure_desc: { type: 'string', description: '正しい図が何か (検証用)' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    notes_jp: { type: 'string' },
  },
}

function prompt(inputPath, id) {
  return `あなたは IT パスポート過去問のアプリ表示図の独立再検証者です。この設問の裁剪図 figure_png は、前回の critic の指示 (prior_critic) で原典全頁から**再裁断されたもの**です。再裁断が正しく完全か、**前回の判断を鵜呑みにせず**原典全頁から独立に確認してください。

## 入力 (Read して id="${id}")
\`${inputPath}\` の questions[] 中 id==="${id}": stem_jp (設問文) / question_number / figure_png (再裁断後の図、検証対象) / figure_page_png (原典全頁=権威) / prior_critic (前回 critic の figure_desc・bbox・理由=参考)。group_note (中問の共有図) があればそれに従い、shared_with の題が必要とする範囲も含めて判定する。

## 手順
1. **stem_jp を読み、この設問が必要とする図**を把握。
2. **figure_png (再裁断後) を Read** し、実際に何が写っているか確認。
3. **figure_page_png (全頁) を Read** し、この設問 (問 ${id}) の正しい図が頁のどこにあるか確認。
4. **図の完全性**: 全頁の当該図と比べ、図・表の外周の罫線/枠が閉じているか、表なら見出し行から最終行・最終列まで、図ならすべての要素とラベル・凡例・注記が crop 内にあるか、四辺のどこかで切断されていないか。隣の設問の図・本文が主要部分として入っていないか。
5. 判定:
   - 正しく完全 → current_crop_correct=true, fix_type=none (軽微な余白・隣接文字の断片は可)。
   - まだ誤り/不完全 → current_crop_correct=false, fix_type=recrop。**correct_bbox_pct に正しい図領域を全頁に対するパーセント (x,y=左上, w,h=幅高さ, 各 0-100) で出す。図全体を含め、上下左右に少し余白**を取る。
   - この設問は図が不要 → fix_type=remove_figure。
6. confidence と根拠 (figure_desc=正しい図の内容、notes_jp=判定理由。prior_critic と判断が違う場合はその理由)。

## 出力
SCHEMA に従い StructuredOutput で返す (id="${id}")。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? []
const model = parsed?.model ?? 'opus'
const agentType = parsed?.agent_type ?? 'oh-my-claudecode:verifier'
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id}], model?, agent_type?}')
const results = await parallel(
  items.map((it) => () => agent(prompt(inputPath, it.id), { label: `reverify:${it.id}`, phase: 'Reverify', schema: SCHEMA, model, agentType })),
)
const clean = results.filter(Boolean)
const stillBad = clean.filter((r) => !r.current_crop_correct)
log(`re-verify ${clean.length}/${items.length}: now-correct ${clean.length - stillBad.length} / still-bad ${stillBad.length}`)
return { total: items.length, done: clean.length, still_bad: stillBad.map((r) => ({ id: r.id, fix_type: r.fix_type, bbox: r.correct_bbox_pct })), results: clean }
