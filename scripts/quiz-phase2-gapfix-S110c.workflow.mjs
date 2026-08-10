export const meta = {
  name: 'quiz-phase2-gapfix-S110c',
  description: 'S110 / 2013h25a-q093: 訳文の points が JP の 3 件に対し 2 件しかない (1 件まるごと欠落) → 全 3 件を JP から再訳し、別 subagent_type が独立核験',
  phases: [
    { title: 'Retranslate', detail: 'general-purpose(opus): points_jp[0..2] を 1:1 で再訳' },
    { title: 'Verify', detail: 'pr-review-toolkit:code-reviewer(opus): 件数と 1:1 対応を含めて核験' },
  ],
}

const TR_SCHEMA = {
  type: 'object',
  required: ['id', 'points', 'note_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    points: {
      type: 'array',
      items: {
        type: 'object', required: ['index', 'zh', 'en'], additionalProperties: false,
        properties: { index: { type: 'number' }, zh: { type: 'string' }, en: { type: 'string' } },
      },
    },
    note_jp: { type: 'string' },
  },
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
      required: ['count_matches', 'one_to_one', 'meaning_faithful', 'no_drift', 'terminology_correct'],
      additionalProperties: false,
      properties: {
        count_matches: { type: 'boolean' }, one_to_one: { type: 'boolean' },
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
const ID = '2013h25a-q093'

const retranslatePrompt = `あなたは IT パスポート過去問**解説**の翻訳者です。

## 背景
\`${P2}/expl_tr_${ID}.json\` の \`points\` は **2 件**しかありませんが、JP 源
\`${P2}/expl_jp_${ID}.json\` の \`points_jp\` は **3 件**あります。
すなわち **1 件がまるごと訳出漏れ**しており、しかも残る 2 件も JP の 3 件を再構成した内容に
なっているため、単純に 1 件足すだけでは対応が取れません。

## やること
1. \`${P2}/expl_jp_${ID}.json\` を Read し、\`points_jp\` の **3 件すべて**を取得。
2. 用語参照として \`${P2}/input_2013h25a.json\` の questions[] 中 id==="${ID}" の
   stem / choices / tr / glossary、および同 \`expl_tr_${ID}.json\` の correct・distractors
   (これらは訳出済みで対象外) を読み、**訳語と文体を揃える**。
3. \`points_jp[0]\` / \`[1]\` / \`[2]\` を **1 対 1 で** zh (簡体字・大陸中国語) と en に訳す。
   - **統合・分割・並べ替えをしない**。JP の 3 件はそれぞれ独立した要点である。
   - JP に無い概念・用語・例示を足さない。JP にある限定・条件を落とさない。
   - とくに \`points_jp[0]\` は「中問形式では冒頭の共通記述 (〔業務報告書の作成ルール〕表1) の
     命名規則を正確に読み取りそのまま適用することが鍵」という**中問の読み方**に関する要点で、
     現行訳から完全に欠落している。これを必ず独立した 1 件として訳出すること。
   - \`points_jp[1]\` は桁数とゼロ埋めの規則、\`points_jp[2]\` は引用符と ＋ 記号の扱い。

\`points\` には index 0 / 1 / 2 の **3 件すべて**を返してください。
StructuredOutput で TR_SCHEMA に従って返してください。`

const verifyPrompt = (proposal) => `あなたは独立した翻訳検証者です (Rule D: 翻訳者と別役割)。甘く通さない。

## 入力
- **JP 源 (唯一の正)**: \`${P2}/expl_jp_${ID}.json\` を Read (points_jp は 3 件)
- 設問データ: \`${P2}/input_2013h25a.json\` の questions[] 中 id==="${ID}"
- 検証対象 = 以下の再訳案 (disk 上の現行訳ではなく、これを見てください):

\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

## 背景
現行訳は points が 2 件しかなく、JP の 3 件のうち 1 件 (points_jp[0]: 中問形式での共通記述の
読み取りが鍵、という要点) が**まるごと欠落**していました。しかも前段の TR-Review は
completeness=true で PASS を出しており、**配列要素の欠落を見逃しています**。同じ見逃しを
繰り返さないでください。

## 検証項目
- **count_matches**: 再訳の points が JP の points_jp と**同じ件数 (3 件)** か。index は 0,1,2 か。
- **one_to_one**: points[i] が points_jp[i] に 1 対 1 で対応しているか。
  **統合・分割・並べ替えが起きていないか**を i ごとに JP と突き合わせて確認すること。
- **meaning_faithful**: 各件の意味が保たれているか。JP に無い概念を足していないか。
- **no_drift**: 限定・条件・強調が動いていないか
  (例: 「1桁指定の項目をゼロ埋めしてはいけない」という逆方向の注意が落ちていないか)。
- **terminology_correct**: zh は大陸中国語の標準用語か。input の設問訳と整合するか。

StructuredOutput で VERIFY_SCHEMA に従って返してください。`

phase('Retranslate')
const tr = await agent(retranslatePrompt, {
  label: `retr-points:${ID}`, phase: 'Retranslate', schema: TR_SCHEMA,
  model: 'opus', agentType: 'general-purpose',
})

phase('Verify')
const verdict = await agent(verifyPrompt(tr), {
  label: `verify:${ID}`, phase: 'Verify', schema: VERIFY_SCHEMA,
  model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
})

log(`q093 points 再訳 (${tr?.points?.length} 件) → 検証 verdict=${verdict?.verdict}`)

return { retranslation: tr, verification: verdict }
