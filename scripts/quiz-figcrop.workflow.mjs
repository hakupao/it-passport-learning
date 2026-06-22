export const meta = {
  name: 'quiz-figcrop',
  description: 'Quiz Phase 1.6 figure-display track: 各図題の裁剪図 (figure_png=アプリ表示) が、その設問に対応する正しい図かを検証。隣問の図混入・部分欠け・無関係領域を検出 (S90 q061 型: crop が隣の問62 RAID 図を写すズレ)。figure_page_png (権威全頁) と stem を照合。',
  phases: [{ title: 'FigCheck', detail: 'general-purpose(opus): crop vs 設問 vs 全頁を照合し crop 正否を判定' }],
}

const SCHEMA = {
  type: 'object',
  required: ['id', 'crop_legible', 'crop_depicts', 'matches_question', 'issue', 'confidence', 'notes_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    crop_legible: { type: 'boolean', description: 'figure_png (裁剪) が読めるか' },
    crop_depicts: { type: 'string', description: 'figure_png が実際に描いている内容を簡潔に' },
    matches_question: { type: 'boolean', description: 'figure_png が、この設問 (stem) が必要とする図に対応しているか' },
    issue: { type: 'string', enum: ['ok', 'wrong_question_figure', 'partial_crop_missing_content', 'extra_neighbor_content', 'no_figure_content', 'other'], description: 'ok 以外は問題種別' },
    correct_region_desc: { type: 'string', description: 'matches_question=false の場合、全頁のどこに正しい図があるか (位置・内容)。なければ空' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    notes_jp: { type: 'string' },
  },
}

function prompt(inputPath, id) {
  return `あなたは IT パスポート過去問のアプリ表示図の検証者です。アプリは各設問に \`figure_png\` (裁剪図) を表示します。この裁剪図が**その設問に対応する正しい図**か検証してください (隣の設問の図が混入していないか等)。

## 入力 (Read して id="${id}")
\`${inputPath}\` の questions[] 中 id==="${id}": stem_jp (設問文) / question_number (問番号) / figure_png (アプリ表示の裁剪図、検証対象) / figure_page_png (原典フルページ=権威、複数設問が載る)。

## 手順
1. **stem_jp を読み、この設問がどんな図を必要とするか**を把握 (例: 問61=稼働率の式、問62=RAID 構成 など)。
2. **figure_png (裁剪) を Read** し、実際に何が描かれているか (crop_depicts)。
3. **figure_page_png (全頁) を Read** し、問 ${id} (question_number) の図が頁のどこにあるか確認。裁剪図が問 ${id} の図と一致するか、それとも隣の設問の図・部分欠け・無関係領域かを判定。
4. matches_question を判定。false なら issue 種別 + correct_region_desc (全頁の正しい図の位置/内容)。**裁剪が正しければ issue="ok"・matches_question=true**。

## 出力
SCHEMA に従い StructuredOutput で返す (id="${id}")。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? []
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id}]}')
const results = await parallel(
  items.map((it) => () => agent(prompt(inputPath, it.id), { label: `fig:${it.id}`, phase: 'FigCheck', schema: SCHEMA, model: 'opus', agentType: 'general-purpose' })),
)
const clean = results.filter(Boolean)
const bad = clean.filter((r) => !r.matches_question)
log(`figcrop 完了 ${clean.length}/${items.length}: 不一致 ${bad.length} (${bad.map((r) => r.id + ':' + r.issue).join(', ') || 'none'})`)
return { total: items.length, done: clean.length, mismatches: bad.map((r) => ({ id: r.id, issue: r.issue, correct_region_desc: r.correct_region_desc, conf: r.confidence })), results: clean }
