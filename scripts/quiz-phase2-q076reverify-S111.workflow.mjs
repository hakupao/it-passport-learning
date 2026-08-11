export const meta = {
  name: 'quiz-phase2-q076reverify-S111',
  description: '2013h25a-q076: 語法パッチ後の訳文を、パッチを当てた側とは別の subagent_type が改めて核験する',
  phases: [{ title: 'Verify', detail: 'pr-review-toolkit:code-reviewer(opus): JP と項目単位で再核験' }],
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'checks', 'issues'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object',
      required: ['count_matches', 'item_aligned', 'meaning_faithful', 'no_drift', 'terminology_correct'],
      additionalProperties: false,
      properties: {
        count_matches: { type: 'boolean' }, item_aligned: { type: 'boolean' },
        meaning_faithful: { type: 'boolean' }, no_drift: { type: 'boolean' },
        terminology_correct: { type: 'boolean' },
      },
    },
    issues: {
      type: 'array',
      items: {
        type: 'object', required: ['severity', 'lang', 'detail_jp'], additionalProperties: false,
        properties: {
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          lang: { type: 'string' },
          detail_jp: { type: 'string' },
        },
      },
    },
    recommendation_jp: { type: 'string' },
  },
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const P2 = `${ROOT}/data/ip/quiz/.phase2`
const ID = '2013h25a-q076'

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const proposal = parsed?.proposal
if (!proposal) throw new Error('need {proposal}')

const prompt = `あなたは独立した翻訳検証者です。甘く通さない。

## 経緯
この設問の訳文は、JP 源から再訳したのち前段の検証で **CONCERNS** となった。
指摘は意味ではなく**中国語の語法**で、次の 2 点が medium だった:

1. \`distractors.イ\` の zh 「但这个值却**少数**了 1 个比特」— 「少数」は shǎoshù (少数派) であって
   「少なく数える」という動詞にならず、JP「1ビット少なく数えた値」の中核ロジックが伝わらない。
2. \`points[0]\` の zh 「n 个比特能**表现**的状态」— 「表现」は振る舞い/成績の意で、データを「表す」
   意味では「表示」を用いる。しかも同じ訳文の correct 側は「表示」を使っており内部不統一。

主 context がこの 2 点だけを機械的に置換した (少数了→少算了 / 能表现的→能表示的)。
**低位の任意提案 (en の語順、zh「而且」→「再说」) は方針により採用していない**。

## あなたの仕事
パッチ後の訳文を **JP 源と項目単位で改めて核験**すること。パッチの当否だけでなく、
**前段が合格とした保真性 (件数・項目対応・意味・ドリフト) が崩れていないかも独立に確認**すること。
「前段が OK と言ったから」は根拠にならない。

## 入力
- **JP 源 (唯一の正)**: \`${P2}/expl_jp_${ID}.json\` を Read
  (correct_jp / distractors_jp[{letter, why_wrong_jp}] / points_jp[])
- 設問データ: \`${P2}/input_2013h25a.json\` の questions[] 中 id==="${ID}"
- 検証対象 (パッチ後):

\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

## 検証項目
- **count_matches**: points 件数・distractors 字母集合が JP と一致するか。
- **item_aligned**: points[i] ↔ points_jp[i]、distractors[letter] ↔ distractors_jp[letter] が
  1 対 1 か。i ごとに照合すること。
- **meaning_faithful**: 各項目の意味が保たれ、JP に無い概念・数値・具体例を足していないか。
- **no_drift**: 論理の順序・強調・限定・因果・数値が動いていないか。
  本問は情報量の計算問なので **数値 (8 / 16 / 65,536 / 32,768 / 32,000 / 64,000 / 1,024 / 64、
  2 の 6・10・15・16 乗) を一つずつ JP と照合**すること。
- **terminology_correct**: zh が大陸中国語として成立しているか。
  とくに上記 2 箇所のパッチが語法として正しく、訳文内部で「表示」に統一されているかを確認。

StructuredOutput で VERIFY_SCHEMA に従って返してください。`

phase('Verify')
const v = await agent(prompt, {
  label: `reverify:${ID}`, phase: 'Verify', schema: VERIFY_SCHEMA,
  model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
})

log(`${ID} パッチ後の再核験 verdict=${v?.verdict}`)
return { id: ID, retranslation: proposal, verification: v }
