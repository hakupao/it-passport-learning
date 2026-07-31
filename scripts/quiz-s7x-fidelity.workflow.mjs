export const meta = {
  name: 'quiz-s7x-fidelity',
  description: 'Quiz 表示テキスト保真核験: s7x resource 由来の stem/choices を源ページ画像と逐字照合し、意味的に成立するが源と異なる OCR 置換 (key-guard/reviewer/Rule A のいずれにも信号が出ない類) を捕捉する',
  phases: [
    { title: 'Fidelity', detail: 'general-purpose(opus): 源ページ PNG を実読し displayed stem/choices を逐字 diff' },
  ],
}

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'discrepancies'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['CLEAN', 'DISCREPANT', 'UNREADABLE'], description: 'CLEAN=表示テキストが源と逐字一致 (句読点/全半角/空白の表記揺れは許容)。DISCREPANT=語句レベルの相違あり。UNREADABLE=源ページで当該設問を特定できない/判読不能' },
    discrepancies: {
      type: 'array',
      items: {
        type: 'object',
        required: ['field', 'current_text', 'source_text', 'severity', 'is_correct_choice', 'detail_jp'],
        additionalProperties: false,
        properties: {
          field: { type: 'string', description: '"stem" または "choice.ア" のような位置' },
          current_text: { type: 'string', description: 'dataset 側の該当箇所 (差分の周辺のみ、逐字)' },
          source_text: { type: 'string', description: '源ページ画像から読み取った正しい文言 (逐字)' },
          severity: { type: 'string', enum: ['cosmetic', 'semantic', 'answer_affecting'], description: 'cosmetic=表記のみ / semantic=語句の意味が変わる / answer_affecting=どの肢が正解に見えるかが変わる' },
          is_correct_choice: { type: 'boolean', description: 'この差分が正解肢 (correct_answer の字母) の本文に存在するか' },
          detail_jp: { type: 'string' },
        },
      },
    },
    notes_jp: { type: 'string' },
  },
}

function prompt(inputPath, id) {
  return `あなたは独立した**表示テキスト保真監査者**です。学習アプリが表示している過去問の日本語テキストが、IPA 原典ページと逐字一致しているかだけを検証します。解説の良し悪しは対象外です。

## 入力
\`${inputPath}\` を Read し、samples[] の中から id==="${id}" のエントリを取得してください。各エントリ:
- \`source_page_png\`: 原典ページ画像の絶対パス (**権威**)
- \`question_number\`: このページ内で照合すべき問番号
- \`displayed_stem_jp\` / \`displayed_choices_jp\`: 現在アプリが表示している本文と選択肢
- \`correct_answer\`: 正解字母

## 手順 (必ずこの順で)
1. \`source_page_png\` を **Read** し、\`question_number\` の設問を見つける。文字が小さい場合は必ず拡大して読む (低解像度の一読は数字・記号を誤読する)。同じページに複数の設問があるので、問番号を必ず確認すること。
2. **源を先に読み、頭の中で書き起こしてから** dataset 側の文字列と突き合わせる。dataset の文言に引きずられて「そう書いてあるように見える」読み方をしないこと。これが本監査の核心です。
3. 設問文と 4 つの選択肢すべてを 1 文字ずつ照合する。

## 判定基準
- **相違として報告するもの**: 語句の置換・脱落・追加、数値の相違、英単語の混入、記号や参照名 (図1 / (A∪B) / 〔…〕内の名称) の相違、下線・記号注記の位置の相違。
- **報告しないもの (表記揺れとして許容)**: 全角/半角の違い、句読点の 「，」/「、」 の違い、空白の有無、改行位置、表を \`| 列 |\` 形式に整形したことによる体裁の差。
- **重要**: 差分が「dataset 側の文も日本語として自然」「dataset 側の記述も内容的に真」であっても、源と異なるなら必ず DISCREPANT として報告してください。**本監査はまさにその種の差分を見つけるために存在します**。もっともらしさは一致の証拠になりません。
- \`is_correct_choice\`: その差分が \`correct_answer\` の字母の本文にある場合 true。
- \`severity\`: どの肢が正解に見えるかが変わるなら answer_affecting、語句の意味が変わるなら semantic、表記だけなら cosmetic。

源ページで当該問を特定できない場合のみ verdict=UNREADABLE とし、憶測で埋めないこと。StructuredOutput で AUDIT_SCHEMA に従って返してください。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const examId = parsed?.exam_id
const qnums = parsed?.qnums
if (!inputPath || !examId || !Array.isArray(qnums) || !qnums.length) {
  throw new Error('need {input_path, exam_id, qnums:[...]}')
}
const ids = qnums.map((n) => `${examId}-q${String(n).padStart(3, '0')}`)
// Pass 2 (independent re-read) runs a DIFFERENT agentType than pass 1 so the two readings
// are not the same reviewer twice (Rule D). Disagreements are adjudicated by 主 context.
const agentType = parsed?.agent_type ?? 'general-purpose'

const audits = await parallel(
  ids.map((id) => () => agent(prompt(inputPath, id), {
    label: `fidelity:${id}`, phase: 'Fidelity', schema: AUDIT_SCHEMA, model: 'opus', agentType,
  })),
)

const clean = audits.filter(Boolean)
const discrepant = clean.filter((a) => a.verdict === 'DISCREPANT')
const unreadable = clean.filter((a) => a.verdict === 'UNREADABLE').map((a) => a.id)
const flat = discrepant.flatMap((a) => (a.discrepancies || []).map((d) => ({ id: a.id, ...d })))
const bySeverity = flat.reduce((m, d) => { m[d.severity] = (m[d.severity] || 0) + 1; return m }, {})
const onCorrectChoice = flat.filter((d) => d.is_correct_choice)

log(`s7x 保真監査: ${clean.length} 問中 CLEAN ${clean.length - discrepant.length - unreadable.length} / DISCREPANT ${discrepant.length} / UNREADABLE ${unreadable.length}; 差分 ${flat.length} 件 ${JSON.stringify(bySeverity)}, 正解肢上 ${onCorrectChoice.length} 件`)

return {
  exam_id: examId,
  n: clean.length,
  cleanCount: clean.length - discrepant.length - unreadable.length,
  discrepantCount: discrepant.length,
  unreadable,
  bySeverity,
  onCorrectChoiceCount: onCorrectChoice.length,
  discrepancies: flat,
  audits: clean,
}
