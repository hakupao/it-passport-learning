export const meta = {
  name: 'quiz-figfix',
  description: 'Quiz Phase 1.6 figure-display track Phase B: figcrop sweep が挙げた crop 候補を独立 critic が原典全頁から再検証 (写審分離: critic≠sweep の general-purpose)。偽陽性を除き、真の不一致には正しい図領域を bbox(%) で出す。図不要問は remove_figure。',
  phases: [{ title: 'VerifyFix', detail: 'critic(opus): crop 正否を独立判定 + 正しい図領域の bbox(%) / 図不要判定' }],
}

const SCHEMA = {
  type: 'object',
  required: ['id', 'current_crop_correct', 'fix_type', 'confidence', 'notes_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    current_crop_correct: { type: 'boolean', description: '現 figure_png が既にこの設問の正しい図か (true=sweep の偽陽性、修正不要)' },
    fix_type: { type: 'string', enum: ['recrop', 'remove_figure', 'none'], description: 'recrop=再裁剪要 / remove_figure=この設問は図不要(has_figure=false) / none=現状正しい' },
    correct_bbox_pct: {
      type: 'object', description: 'fix_type=recrop の時、原典全頁における正しい図領域の bbox (各値 0-100 のパーセント、図全体に小さい余白を含めた範囲)。recrop 以外は省略可', additionalProperties: false,
      properties: { x: { type: 'number' }, y: { type: 'number' }, w: { type: 'number' }, h: { type: 'number' } },
    },
    figure_desc: { type: 'string', description: 'recrop 対象の正しい図が何か (検証用)' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    notes_jp: { type: 'string' },
  },
}

function prompt(inputPath, id) {
  return `あなたは IT パスポート過去問のアプリ表示図の独立検証者 (critic) です。別の sweep が「この設問の裁剪図 figure_png が誤り」と疑いを挙げました。**疑いを鵜呑みにせず**、原典全頁から独立に再検証してください。

## 入力 (Read して id="${id}")
\`${inputPath}\` の questions[] 中 id==="${id}": stem_jp (設問文) / question_number / figure_png (現在アプリ表示の裁剪図) / figure_page_png (原典全頁=権威) / prior_finding (sweep の指摘=参考、鵜呑み禁止)。

## 手順
1. **stem_jp を読み、この設問が必要とする図**を把握 (図不要=純テキスト/選択肢のみの設問もある)。
2. **figure_png (現裁剪) を Read** し実際の内容を確認。
3. **figure_page_png (全頁) を Read** し、この設問 (問 ${id}) の正しい図が頁のどこにあるか確認。
4. 判定:
   - 現裁剪が既に正しい → current_crop_correct=true, fix_type=none (sweep の偽陽性)。
   - この設問は図が不要 (選択肢/純テキストのみで独立図表なし) → fix_type=remove_figure。
   - 現裁剪が誤り/不完全で、正しい図が頁に在る → fix_type=recrop。**correct_bbox_pct に正しい図領域を全頁に対するパーセント (x,y=左上, w,h=幅高さ, 各 0-100) で出す。図全体 (表なら全行・全列、図なら凡例まで) を含め、上下左右に少し余白**を取る (きつすぎる裁剪は禁物)。選択肢 (ア〜エ) が図の一部 (図中に描かれる) なら含め、純テキスト選択肢なら含めない。
5. confidence と根拠 (figure_desc=正しい図の内容、notes_jp=判定理由)。

## 出力
SCHEMA に従い StructuredOutput で返す (id="${id}")。`
}


const inputPath="/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/ip/quiz/.keyaudit/input_figreverify2.json"
const items=[{"id":"2011h23tokubetsu-q073"},{"id":"2011h23tokubetsu-q078"},{"id":"2014h26a-q087"}]
const results=await parallel(items.map((it)=>()=>agent(prompt(inputPath,it.id),{label:`rv2:${it.id}`,phase:"VerifyFix",schema:SCHEMA,model:"opus",agentType:"oh-my-claudecode:critic"})))
const clean=results.filter(Boolean)
const bad=clean.filter(r=>!r.current_crop_correct)
log(`rv2 ${clean.length}/${items.length}: ok ${clean.length-bad.length} / bad ${bad.length}`)
return {done:clean.length,still_bad:bad.map(r=>({id:r.id,bbox:r.correct_bbox_pct,note:(r.notes_jp||"").slice(0,200)})),results:clean}
