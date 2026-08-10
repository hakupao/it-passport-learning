export const meta = {
  name: 'quiz-phase2-trfix-S110',
  description: 'S110 / 2013h25a: Rule A が translation_faithful=false と判定した 4 問の訳文を JP 源から全面再訳し、別 subagent_type が独立核験する',
  phases: [
    { title: 'Retranslate', detail: 'general-purpose(opus): correct / 誤答 / points を JP から 1:1 再訳' },
    { title: 'Verify', detail: 'pr-review-toolkit:code-reviewer(opus): 項目単位で JP と突合' },
  ],
}

const TR_SCHEMA = {
  type: 'object',
  required: ['id', 'correct', 'distractors', 'points', 'note_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    correct: {
      type: 'object', required: ['zh', 'en'], additionalProperties: false,
      properties: { zh: { type: 'string' }, en: { type: 'string' } },
    },
    distractors: {
      type: 'array',
      items: {
        type: 'object', required: ['letter', 'zh', 'en'], additionalProperties: false,
        properties: { letter: { type: 'string' }, zh: { type: 'string' }, en: { type: 'string' } },
      },
    },
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
const E = '2013h25a'

// Rule A (`wf_3d4d2800-04f`) の指摘要旨。再訳者に「何がどうずれていたか」を具体的に渡す。
const FINDINGS = {
  [`${E}-q048`]:
    'points[] の jp と zh/en が項目間でずれている。points[0].jp 後半は「『初期設定』『環境整備』『据付け』という語が出たら導入と判断する」というキーワード判別指針だが、' +
    'zh/en の points[0] 後半は「開発(含結合)→導入→受入れ→運用→保守」というライフサイクル順序 (本来 points[1].jp の内容) になっている。' +
    'さらに points[1].zh/en は「誰がやるか・いつやるかで区別する」という points[1].jp に存在しない記述に置き換わっている。' +
    'また correct の zh/en は jp 末尾の他肢対比 (結合でも受入れでも保守でもない→ウ) を落とし、代わりに jp に無い JIS X 0160 への言及と具体例を足している。',
  [`${E}-q052`]:
    'distractors ウ / エ の zh/en が jp と別の誤答成因を述べている。' +
    'ウ: jp は「0.10 = 並列にすれば稼働率が 1.00 になると誤解した場合の 1.00−0.90」+「装置Bの0.8を掛ける操作も抜けて二重に誤り」だが、' +
    'zh/en は「0.10 = 装置A1台の停止確率 1−0.9 をそのまま低下量とみなした値」+ jp に無い 0.99−0.90＝0.09 を追加している。' +
    'エ: jp は「並列冗長を外すと稼働率が半分になると誤解して 0.9×0.5＝0.45」という成因の括弧書きを持つが、zh/en はこれを落とし jp に無い「0.45 は 6 倍超」の比較を足している。',
  [`${E}-q086`]:
    'points[] の jp と zh/en が入れ替わっている。points[0].jp は「守秘義務契約＝機密性を契約で担保する仕組み。再委託可否・指揮命令関係・著作権帰属はそれぞれ別の契約条項が扱う」だが、' +
    'zh/en の points[0] は「正式受注前の見積依頼・RFP 段階でも自社情報を渡すことになる」という別の要点になっている。',
  [`${E}-q095`]:
    'zh/en が jp の決め手をすり替えている。jp は原典 page-39 の〔業務報告書の作成ルール〕(5)「関連資料として保管できるファイル数の上限は一つの業務報告書につき 12」を根拠に' +
    '「1桁の n では 10 件目以降に付番できない」と論じているが、zh/en は上限 12 の根拠を一切出さずに別の理由付けで結論だけ合わせている。',
}

const IDS = Object.keys(FINDINGS)

const retranslatePrompt = (id) => `あなたは IT パスポート過去問**解説**の翻訳者です。

## 背景
\`${P2}/expl_tr_${id}.json\` の現行訳は、独立監査 (Rule A) で **translation_faithful=false** と
判定されました。指摘の要旨:

> ${FINDINGS[id]}

いずれも「訳文単体としては内容が正しいが、JP 源の当該項目の翻訳になっていない」という型です。
**部分パッチでは項目対応のずれを回収できない**ため、JP 源から全面的に訳し直してください。

## 入力
1. **JP 源 (唯一の正)**: \`${P2}/expl_jp_${id}.json\` を Read
   (correct_jp / distractors_jp[{letter, why_wrong_jp}] / points_jp[])
2. 用語参照: \`${P2}/input_${E}.json\` の questions[] 中 id==="${id}" の
   stem / choices / tr (既存の設問訳) / glossary
3. 文体参照 (**内容は真似しない**): \`${ROOT}/data/ip/quiz/explanations/2014h26h.json\`

## 訳出対象と原則
- \`correct\` の zh / en
- \`distractors\` の JP にある字母すべての zh / en
- \`points\` の **JP と同じ件数**を index 0 から順に

**鉄則**:
- \`points_jp[i]\` は \`points[i]\` に、\`distractors_jp[letter]\` は \`distractors[letter]\` に
  **1 対 1 で対応**させる。**統合・分割・並べ替え・入れ替えをしない**。
- JP に無い概念・用語・規格名・具体例・数値比較を**足さない**。
- JP にある論拠・対比・括弧書きの補足を**落とさない**。とくに JP が誤答の「成因」
  (なぜその数値/選択肢を選んでしまうか) を書いている場合、その成因をそのまま訳すこと。
- zh は簡体字・大陸中国語。用語は input の tr と glossary に揃える。

StructuredOutput で TR_SCHEMA に従って返してください。`

const verifyPrompt = (id, proposal) => `あなたは独立した翻訳検証者です (Rule D: 翻訳者と別役割)。甘く通さない。

## 入力
- **JP 源 (唯一の正)**: \`${P2}/expl_jp_${id}.json\` を Read
- 設問データ: \`${P2}/input_${E}.json\` の questions[] 中 id==="${id}"
- 検証対象 = 以下の**再訳案** (disk 上の現行訳ではなく、これを見てください):

\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

## 背景 — 現行訳が落ちた理由
> ${FINDINGS[id]}

つまり「訳文単体は正しいが JP の当該項目の翻訳になっていない」型です。
**内容が正しそうに読めることは合格の理由になりません**。JP の項目と一つずつ突き合わせてください。

## 検証項目
- **count_matches**: points の件数、distractors の字母集合が JP と一致するか。
- **item_aligned**: points[i] ↔ points_jp[i]、distractors[letter] ↔ distractors_jp[letter] が
  **1 対 1 で対応**しているか。入れ替わり・混入・分割・統合が無いか。**i ごとに照合すること**。
- **meaning_faithful**: 各項目の意味が保たれているか。JP に無い概念・規格名・数値比較を
  足していないか。JP にある論拠・成因・括弧書きを落としていないか。
- **no_drift**: 論理の順序・強調・限定が動いていないか。
- **terminology_correct**: zh は大陸中国語の標準用語か。input の設問訳と整合するか。

StructuredOutput で VERIFY_SCHEMA に従って返してください。`

const results = await pipeline(
  IDS,
  (id) => agent(retranslatePrompt(id), {
    label: `retr:${id}`, phase: 'Retranslate', schema: TR_SCHEMA,
    model: 'opus', agentType: 'general-purpose',
  }),
  (tr, id) => agent(verifyPrompt(id, tr), {
    label: `verify:${id}`, phase: 'Verify', schema: VERIFY_SCHEMA,
    model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
  }).then((v) => ({ id, retranslation: tr, verification: v })),
)

const ok = results.filter(Boolean)
log(`再訳 ${ok.length}/${IDS.length} → ${ok.map((r) => `${r.id.slice(-4)}=${r.verification?.verdict}`).join(' ')}`)

return { results: ok }
