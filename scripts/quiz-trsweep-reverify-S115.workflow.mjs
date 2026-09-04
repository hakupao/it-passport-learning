export const meta = {
  name: 'quiz-trsweep-reverify-S115',
  description: 'trsweep の再訳案に、独立核験が挙げた terminology 修正を適用した「是正版」を、さらに別 agentType で再核験する (Rule D)',
  phases: [{ title: 'Reverify', detail: 'oh-my-claudecode:code-reviewer(opus): 是正版を JP 源と突き合わせて再核験' }],
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'checks', 'issues', 'recommendation_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object',
      required: ['count_matches', 'item_aligned', 'meaning_faithful', 'no_drift', 'terminology_correct'],
      additionalProperties: false,
      properties: {
        count_matches: { type: 'boolean' },
        item_aligned: { type: 'boolean' },
        meaning_faithful: { type: 'boolean' },
        no_drift: { type: 'boolean' },
        terminology_correct: { type: 'boolean' },
      },
    },
    issues: {
      type: 'array',
      items: {
        type: 'object', required: ['severity', 'lang', 'detail_jp'], additionalProperties: false,
        properties: { severity: { type: 'string' }, lang: { type: 'string' }, detail_jp: { type: 'string' } },
      },
    },
    recommendation_jp: { type: 'string' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const P2 = `${ROOT}/data/ip/quiz/.phase2`
const parsed = typeof args === 'string' ? JSON.parse(args) : args
// 是正版の本体は大きいのでスクリプトには載せず、**エージェントにファイルを Read させる**
// (workflow スクリプトには fs が無い)。
const items = parsed?.items
if (!Array.isArray(items) || !items.length) throw new Error('need {items:[{id, exam_id, subs}]}')

const prompt = (it) => `あなたは独立した翻訳検証者です (Rule D: 翻訳者とも、1 回目の検証者とも別役割)。甘く通さない。

## 経緯
trsweep の監査が JP↔訳文の保真不成立を検出し、再訳案が作られた。1 回目の独立核験は
**terminology_correct = false** で CONCERNS を出し、具体的な修正案を示した。
主 context はその修正案を**機械的な文字列置換としてのみ**適用した (意味の書き換えはしていない)。
あなたはその「是正版」を、1 回目の核験結果に引きずられずゼロから検証する。

### 主 context が適用した置換 (これ自体の妥当性も検証対象)
${it.subs.map((s) => `- [${s.lang}] 「${s.from}」→「${s.to}」 (${s.n} 箇所) — 根拠: ${s.why}`).join('\n')}

## 入力
- **JP 源 (唯一の正)**: \`${P2}/expl_jp_${it.id}.json\` を Read
- 設問データ: \`${P2}/input_${it.exam_id}.json\` の questions[] 中 id==="${it.id}"
- **現行の disk 版訳** (比較参考): \`${P2}/expl_tr_${it.id}.json\` を Read
- **検証対象 = 是正版再訳**: \`${P2}/retr_fixed_${it.id}.json\` を Read
  (disk 上の現行訳 expl_tr_*.json ではなく、**こちらが検証対象**)

## 検証項目
- **count_matches**: points 件数・distractors 字母集合が JP と一致するか。
- **item_aligned**: points[i] ↔ points_jp[i]、distractors[letter] ↔ distractors_jp[letter] が 1 対 1 か。
- **meaning_faithful**: 各項目の意味が保たれ、JP に無いものを足していないか。
- **no_drift**: 論理の順序・強調・限定・因果・数値・時点表現が動いていないか。
- **terminology_correct**: zh は大陸中国語の標準用語か。input の設問訳・コーパス既存訳と整合するか。
  **置換によって新たな不整合が生じていないか**も必ず確認すること
  (例: 置換した語が周囲の助詞・語順と噛み合わなくなっていないか)。

**是正版が現行の disk 版より悪くなっている項目があれば必ず指摘すること。**
採用してよいと判断する場合のみ verdict=PASS。StructuredOutput で VERIFY_SCHEMA に従って返してください。`

const results = await parallel(
  items.map((it) => () => agent(prompt(it), {
    label: `reverify:${it.id}`, phase: 'Reverify', schema: VERIFY_SCHEMA,
    model: 'opus', agentType: 'oh-my-claudecode:code-reviewer',
  })),
)

const clean = results.filter(Boolean)
const byVerdict = clean.reduce((m, r) => { m[r.verdict] = (m[r.verdict] || 0) + 1; return m }, {})
log(`再核験 ${clean.length}/${items.length}: ${JSON.stringify(byVerdict)}`)
return { n: items.length, verdicts: byVerdict, results: clean }
