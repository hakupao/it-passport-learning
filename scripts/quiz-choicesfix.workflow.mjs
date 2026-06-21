export const meta = {
  name: 'quiz-choicesfix',
  description: 'Quiz Phase 1.6 choices-fidelity track: 各問の原典フルページ(権威)から ア〜エ の選択肢を独立に逐字転写し、現 choices_jp と比対して figure-faithful な修正案を出す。deriver の choices_issues は参考のみ (独立再読)。answer-affecting と underivable も判定。',
  phases: [
    { title: 'Propose', detail: 'general-purpose(opus): 権威ページから選択肢を逐字転写 → 修正案 + answer-affecting 判定' },
  ],
}

const PROPOSE_SCHEMA = {
  type: 'object',
  required: ['id', 'figure_legible', 'choices_form', 'per_choice', 'needs_fix', 'answer_affecting', 'confidence', 'notes_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    figure_legible: { type: 'boolean', description: 'この問の図/選択肢を原典ページで実際に読めたか' },
    choices_form: { type: 'string', enum: ['text', 'figure_drawn', 'mixed'], description: '選択肢の形態: text=純テキスト(ページ印字)/figure_drawn=図(グラフ・表・回路・配置図)/mixed' },
    per_choice: {
      type: 'array', description: 'ア イ ウ エ の 4 要素', items: {
        type: 'object', required: ['letter', 'faithful_text', 'current_text', 'matches'], additionalProperties: false,
        properties: {
          letter: { type: 'string', enum: ['ア', 'イ', 'ウ', 'エ'] },
          faithful_text: { type: 'string', description: '原典ページ/図から逐字転写した正しい選択肢テキスト (図選択肢なら図内容を忠実に記述/値・式・表セル・ラベルを逐字)' },
          current_text: { type: 'string', description: '入力 choices_jp の現在値' },
          matches: { type: 'boolean', description: 'faithful_text と current_text が意味的に一致するか (軽微な表記揺れは true)' },
        },
      },
    },
    needs_fix: { type: 'boolean', description: 'いずれかの選択肢に figure と異なる腐敗があり修正すべきか (false=deriver 偽陽性で現状正しい)' },
    corrected_choices: {
      type: 'object', description: 'needs_fix=true の場合の修正後 全4選択肢 (ア〜エ)。各値は figure-faithful。needs_fix=false なら省略可', additionalProperties: false,
      properties: { 'ア': { type: 'string' }, 'イ': { type: 'string' }, 'ウ': { type: 'string' }, 'エ': { type: 'string' } },
    },
    answer_affecting: { type: 'boolean', description: '腐敗が「どの字母が正解か」を変えうるか (選択肢間 swap で正解字母の指す内容が変わる等)。true なら主 context が key も再確認' },
    underivable_resolved: {
      type: 'object', description: 'kind=underivable の問のみ: 原典ページに解答に必要なデータが揃っているか', additionalProperties: false,
      properties: { answerable_from_page: { type: 'boolean' }, missing: { type: 'string', description: '欠けている情報 (なければ空)' } },
    },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    notes_jp: { type: 'string', description: '判定根拠 (図のどこをどう読んだか)。answer-affecting や key への含意があれば明記' },
  },
}

function proposePrompt(inputPath, id) {
  return `あなたは IT パスポート過去問の選択肢忠実度の独立検証者です。ある問について「選択肢テキスト (choices_jp) が図/原典と食い違う」疑いがあります。**疑いの中身に引きずられず**、原典フルページから ア〜エ を自力で逐字転写し、現テキストと比対してください。

## 入力 (Read して id="${id}" のエントリを取得)
\`${inputPath}\` の questions[] 中 id==="${id}": stem_jp / choices_jp (現在値 ア〜エ) / figure_png (裁剪図) / figure_page_png (**原典フルページ=権威、stem+図+選択肢が全て印字されている**) / kind ("choices" or "underivable") / deriver_issues (**参考のみ、鵜呑み禁止**)。

## 手順
1. **\`figure_page_png\` を Read (権威)**。必要なら figure_png も。選択肢が小さい数値/式/表セル/○−/グラフ形状の場合は注意深く (低解像度の早読みは誤判)。
2. **ア〜エ の各選択肢を、受験者が見る通りに原典ページから逐字転写** (faithful_text)。
   - 選択肢が純テキスト → 印字テキストを逐字。
   - 選択肢が図 (グラフ/表/回路/配置図) → 図内容を忠実に記述 (値・式・表の全セル・ラベル・矢印の向き・グラフの傾き/切片を逐字反映)。choices_form を判定。
3. 各選択肢で current_text (入力 choices_jp) と比対し matches を判定 (軽微な表記揺れ=true、値/式/構造/取り違え=false)。
4. **needs_fix**: 1 つでも腐敗があれば true。**deriver_issues が指摘していても、原典で現テキストが正しければ matches=true・needs_fix への不算入** (deriver 偽陽性を捕捉)。
5. needs_fix=true なら **corrected_choices に figure-faithful な全4選択肢**を出す (腐敗のない選択肢は現値のまま)。
6. **answer_affecting**: 腐敗が「どの字母が正解か」を変えうるか (例: 選択肢間の内容 swap で正解字母の指す中身が別物になる)。判断に迷えば true。
7. kind=="underivable" なら underivable_resolved も埋める (原典ページに解答必要データが揃うか)。

## 出力
PROPOSE_SCHEMA に従い StructuredOutput で返す (id="${id}")。ファイル書込不要。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? []
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id}]}')

const results = await parallel(
  items.map((it) => () => agent(proposePrompt(inputPath, it.id), { label: `cfix:${it.id}`, phase: 'Propose', schema: PROPOSE_SCHEMA, model: 'opus', agentType: 'general-purpose' })),
)
const clean = results.filter(Boolean)
const needFix = clean.filter((r) => r.needs_fix)
const falsePos = clean.filter((r) => !r.needs_fix)
const ansAff = clean.filter((r) => r.answer_affecting)
log(`提案完了 ${clean.length}/${items.length}: needs_fix ${needFix.length} | 偽陽性(現状正) ${falsePos.length} | answer-affecting ${ansAff.length}`)
return { total: items.length, done: clean.length, needs_fix: needFix.map((r) => r.id), false_positive: falsePos.map((r) => r.id), answer_affecting: ansAff.map((r) => r.id), results: clean }
