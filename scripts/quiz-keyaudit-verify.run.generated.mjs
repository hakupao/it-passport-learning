export const meta = {
  name: 'quiz-keyaudit-verify',
  description: 'Quiz Phase 1.6 (D-139-B) Phase B: bad-key 候補を独立 critic (≠deriver=general-purpose) が figure+忠実 stem から再盲推 (stored key も deriver の答も非開示)。各候補 2 票。主 context が最終裁決する前の独立第2/第3パス (写審分離 Rule D)。',
  phases: [
    { title: 'Verify', detail: 'critic(opus) ×2/候補: 図から独立に再盲推 + 一意性/曖昧性も判定' },
  ],
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['id', 'verified_answer', 'derivable', 'unique', 'confidence', 'reasoning_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verified_answer: { type: 'string', enum: ['ア', 'イ', 'ウ', 'エ', 'UNDERIVABLE'], description: '図+stem+choices から独立に導いた正解字母 (導出不能なら UNDERIVABLE)' },
    derivable: { type: 'boolean', description: '図+stem+choices だけで一意に正解が導けるか' },
    unique: { type: 'boolean', description: '正解が一意か。複数選択肢が同時に成立する/源データ腐敗で曖昧なら false' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning_jp: { type: 'string', description: '導出の根拠 (計算/図の読み取り) を簡潔に。曖昧なら何が曖昧かを明記' },
    second_candidate: { type: 'string', description: 'unique=false の場合に同時成立しうる別字母 (なければ空)' },
    figure_legible: { type: 'boolean', description: 'この問の図を実際に読めたか' },
  },
}

function verifyPrompt(inputPath, id, vote) {
  return `あなたは IT パスポート過去問の**独立答案検証者 (第${vote}検証)** です。ある問題について「保存されている答案キーが図と矛盾する」疑いが上がっています。**ただし、疑いの中身・元の盲推結果・保存キーは一切与えません (完全盲検)**。図と設問文と選択肢だけから、ゼロから自力で正解を導出し、検証してください。先入観を持たず、最も懐疑的・厳密に。

## 入力 (Read して id="${id}" のエントリを取得)
\`${inputPath}\` の questions[] 中 id==="${id}": stem_jp (表示用の設問文) / choices_jp (ア〜エ) / figure_png (裁剪図) / figure_page_png (原典フルページ=権威)。
**correct_answer は意図的に与えていません。**

## 手順 (厳密に)
1. \`figure_png\` と \`figure_page_png\` の**両方を Read**。**fine-grain な数値・○/−・式・グラフの傾き/切片/曲率・矢印の向き・表のセル値を、必要なら拡大して注意深く読む** (低解像度の早読みは誤判の元)。crop が端で欠落しうるので**フルページを正**とする。
2. stem + 図 + choices から、正解を**独立に計算/導出**する。計算問は必ず検算する。reasoning_jp に図から読み取った具体値・式・形状を引用して根拠を残す。
3. **一意性の判定**: 導いた正解以外の選択肢が同時に成立しないか吟味する。複数が真になる/源データの腐敗で確定できない場合は unique=false とし second_candidate に別字母、reasoning_jp に何が曖昧かを書く。一意に確定できなければ confidence を下げる。源データ欠落で導出不能なら verified_answer="UNDERIVABLE"、derivable=false。

## 出力
VERIFY_SCHEMA に従い StructuredOutput で返す (id="${id}")。ファイル書込は不要。`
}


// ===== GENERATED (D-139-B Phase B verify) — embedded, sandbox no FS =====
const inputPath = "/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/ip/quiz/.keyaudit/input_batch_FULL.json"
const candidates = [{"id":"2009h21a-q012"},{"id":"2009h21h-q096"},{"id":"2010h22a-q091"},{"id":"2012h24h-q091"},{"id":"2014h26h-q090"}]
const votes = 3
const tasks = []
for (const c of candidates) for (let v = 1; v <= votes; v++) tasks.push({ id: c.id, vote: v })
const results = await parallel(
  tasks.map((t) => () => agent(verifyPrompt(inputPath, t.id, t.vote), { label: `verify:${t.id}#${t.vote}`, phase: "Verify", schema: VERIFY_SCHEMA, model: "opus", agentType: "oh-my-claudecode:critic" })),
)
const clean = results.filter(Boolean)
const byId = {}
for (const r of clean) { (byId[r.id] ||= []).push(r) }
const summary = Object.entries(byId).map(([id, rs]) => ({ id, answers: rs.map((r) => r.verified_answer), unique: rs.map((r) => r.unique), conf: rs.map((r) => r.confidence) }))
log(`検証完了 ${clean.length}/${tasks.length}`)
return { candidates: candidates.length, votes, done: clean.length, summary, results: clean }
