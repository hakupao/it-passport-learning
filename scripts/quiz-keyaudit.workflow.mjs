export const meta = {
  name: 'quiz-keyaudit',
  description: 'Quiz Phase 1.6 (D-139-B): 図題の答案を figure+忠実 stem から盲推 (stored key 非開示) し、別途 questions.json の key と比対して bad key を検出。併せて choices_jp↔figure の忠実度も照合。deriver=general-purpose、mismatch 検証は別途 (写審分離)。',
  phases: [
    { title: 'Derive', detail: 'general-purpose(opus): 図から正解を盲推 + choices↔figure 照合' },
  ],
}

const DERIVE_SCHEMA = {
  type: 'object', required: ['id', 'derived_answer', 'derivable', 'confidence', 'reasoning_jp', 'choices_faithful'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    derived_answer: { type: 'string', enum: ['ア', 'イ', 'ウ', 'エ', 'UNDERIVABLE'], description: '図+stem+choices から独立に導いた正解字母 (導出不能なら UNDERIVABLE)' },
    derivable: { type: 'boolean', description: '図+stem+choices だけで一意に正解が導けるか (源データ欠落等で不能なら false)' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning_jp: { type: 'string', description: '導出の根拠 (計算/図の読み取り) を簡潔に' },
    choices_faithful: { type: 'boolean', description: 'choices_jp の各選択肢テキストが figure と一致 (図に選択肢が描かれる問: 図の各選択肢と逐字; 値/式/ラベルの腐敗や取り違えがないか)' },
    choices_issues: { type: 'array', items: { type: 'object', required: ['choice', 'detail_jp'], additionalProperties: false, properties: { choice: { type: 'string' }, detail_jp: { type: 'string' } } } },
  },
}

function derivePrompt(inputPath, id) {
  return `あなたは IT パスポート過去問の独立答案検証者です。**正解は与えられていません (盲推)**。図と設問文と選択肢だけから、自力で正解を導出してください。既存の答案に引きずられないこと。

## 入力 (Read して id="${id}" のエントリを取得)
\`${inputPath}\` の questions[] 中 id==="${id}": stem_jp (表示用の設問文) / choices_jp (ア〜エ) / figure_png (裁剪図) / figure_page_png (原典フルページ=権威)。
**correct_answer は意図的に与えていません。**

## 手順
1. \`figure_png\` と \`figure_page_png\` (権威、crop は端で欠落しうるのでフルページを正とする) の**両方を Read**。fine-grain な数値・○/−・式・グラフ形状は注意深く読む。
2. stem + 図 + choices から、正解を**独立に計算/導出**する。計算問は検算する。reasoning_jp に根拠を残す。一意に導けなければ derived_answer="UNDERIVABLE"、derivable=false (源データ欠落等)。
3. **choices↔figure 照合**: 図に選択肢 (ア/イ/ウ/エ) が値・式・表・グラフ・回路図として描かれている問では、choices_jp の各テキストが図の対応選択肢と一致するか逐字照合。値の腐敗・列の取り違え・選択肢間の swap・別問の混入があれば choices_faithful=false とし choices_issues に {choice, detail_jp} で記す。図に選択肢が描かれない (choices が純テキスト) 問は choices_faithful=true (照合対象外)。

## 出力
1. DERIVE_SCHEMA と同形の JSON を \`/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/ip/quiz/.keyaudit/result_${id}.json\` に **Write** (resume + 比対用、id="${id}")。
2. 同じ内容を DERIVE_SCHEMA に従い StructuredOutput で返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? [] // [{id}]
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id}]}')

const results = await parallel(
  items.map((it) => () => agent(derivePrompt(inputPath, it.id), { label: `derive:${it.id}`, phase: 'Derive', schema: DERIVE_SCHEMA, model: 'opus', agentType: 'general-purpose' })),
)

const clean = results.filter(Boolean)
const byConf = clean.reduce((m, r) => { m[r.confidence] = (m[r.confidence] || 0) + 1; return m }, {})
const und101 = clean.filter((r) => !r.derivable).map((r) => r.id)
const choicesBad = clean.filter((r) => r.choices_faithful === false).map((r) => r.id)
log(`盲推完了 ${clean.length}/${items.length}: confidence ${JSON.stringify(byConf)} | underivable ${und101.length} | choices-issue ${choicesBad.length}`)
return { total: items.length, done: clean.length, byConfidence: byConf, underivable: und101, choices_issues: choicesBad, results: clean }
