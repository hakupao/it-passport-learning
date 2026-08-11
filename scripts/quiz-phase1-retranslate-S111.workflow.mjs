export const meta = {
  name: 'quiz-phase1-retranslate-S111',
  description: '2010h22a-q091: 復元された設問文と選択肢の zh/en を作り直し、別 subagent_type が源 JP と突合して核験する',
  phases: [
    { title: 'Translate', detail: 'general-purpose(opus): 復元後の JP から zh/en を作成' },
    { title: 'Verify', detail: 'pr-review-toolkit:code-reviewer(opus): JP と 1 対 1 で突合' },
  ],
}

const TR_SCHEMA = {
  type: 'object',
  required: ['id', 'stem', 'choices', 'note_jp'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    stem: {
      type: 'object', required: ['zh', 'en'], additionalProperties: false,
      properties: { zh: { type: 'string' }, en: { type: 'string' } },
    },
    choices: {
      type: 'array',
      items: {
        type: 'object', required: ['letter', 'zh', 'en'], additionalProperties: false,
        properties: { letter: { type: 'string' }, zh: { type: 'string' }, en: { type: 'string' } },
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
      required: ['table_values_match', 'all_choices_present', 'meaning_faithful', 'no_drift', 'terminology_correct'],
      additionalProperties: false,
      properties: {
        table_values_match: { type: 'boolean' }, all_choices_present: { type: 'boolean' },
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
const ID = '2010h22a-q091'

const JP_STEM = `次の表は，テストデータ（地区，3辺計，重量）を用いて実際にテストを行った結果の一部である。この結果の判断として，適切なものはどれか。

| 地区 | 3辺計（cm） | 重量（kg） | 出力結果（円） |
|---|---|---|---|
| C | 60 | 5 | 1,400 |
| C | 101 | 8 | 1,800 |
| D | 60 | 5 | 2,350 |
| D | 101 | 8 | 3,400 |`

const JP_CHOICES = {
  ア: '3辺計が60cmで重量が5kgのときの出力結果に誤りがある。',
  イ: 'サイズ区分が区分3のときの出力結果に誤りがある。',
  ウ: '出力結果に誤りはない。',
  エ: '地区Cの出力結果だけに誤りがある。',
}

const CONTEXT = `## 背景
この設問 (2010h22a 問91) は、上流の自動「修復」処理によって**隣の問89 の複製で上書きされていた**。
S111 で s7x 前バックアップ + 原典 page-37 の実読から復元した。訳文は上書きされていた頃のまま
(問89 の内容を訳したもの) なので、復元後の JP から作り直す必要がある。

## 設問の文脈 (中問A、問89〜92 共通)
宅配料金計算プログラムのテスト。料金は「サイズ区分 × 発送先地区」で表1 から求める。
サイズ区分は 3辺計 (cm) と 重量 (kg) の**どちらか大きい方の区分**を適用する
(区分1: 3辺計80まで/重量5まで、区分2: 100まで/10まで、区分3: 140まで/20まで)。
本問はその出力結果表の一部を見せ、誤りがどこにあるかを判断させる。
表の「出力結果」は**プログラムが実際に出した値**であって正解料金ではない (誤りを含む)。`

const translatePrompt = `あなたは IT パスポート過去問の**設問文と選択肢**の翻訳者です。

${CONTEXT}

## 翻訳対象 (JP = 唯一の正)

### 設問文
\`\`\`
${JP_STEM}
\`\`\`

### 選択肢
${Object.entries(JP_CHOICES).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## 用語・体裁の参照
- \`${ROOT}/data/ip/quiz/translations/2010h22a.json\` の questions["2010h22a-q089"] / ["2010h22a-q090"] /
  ["2010h22a-q092"] を Read し、**同じ中問の既訳と用語・表記を揃える**
  (地区 / 3辺計 / 重量 / サイズ区分 / 出力結果 / 予想出力 などの訳語)。

## 原則
- **表は markdown のまま維持し、数値・単位・行順を一切変えない**
  (C 60 5 1,400 / C 101 8 1,800 / D 60 5 2,350 / D 101 8 3,400)。
  桁区切りのカンマも JP どおり。
- 選択肢は 4 つすべて。字母 ア/イ/ウ/エ はそのまま返す。
- JP に無い説明・補足を足さない (とくに「どこが誤りか」を訳文でほのめかさない —
  それを判断させるのが本問である)。
- zh は簡体字・大陸中国語。

StructuredOutput で TR_SCHEMA に従って返してください。`

const verifyPrompt = (proposal) => `あなたは独立した翻訳検証者です (Rule D: 翻訳者と別役割)。甘く通さない。

${CONTEXT}

## JP 源 (唯一の正)

### 設問文
\`\`\`
${JP_STEM}
\`\`\`

### 選択肢
${Object.entries(JP_CHOICES).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## 検証対象 (訳文案)
\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

## 検証項目
- **table_values_match**: 訳文の表が JP と**同じ行順・同じ数値**か。
  4 行 × (地区 / 3辺計 / 重量 / 出力結果) を一つずつ照合すること。
  C-60-5-1,400 / C-101-8-1,800 / D-60-5-2,350 / D-101-8-3,400。
- **all_choices_present**: ア/イ/ウ/エ の 4 つが揃い、各字母の内容が JP の同じ字母と対応しているか。
- **meaning_faithful**: 意味が保たれているか。**JP に無い示唆 (どの行が誤りか等) を足していないか**。
- **no_drift**: 限定・条件が動いていないか (例: エ「地区Cの出力結果**だけ**に誤りがある」の
  「だけ」が落ちていないか)。
- **terminology_correct**: zh は大陸中国語の標準用語で、同じ中問の既訳
  (\`${ROOT}/data/ip/quiz/translations/2010h22a.json\` の q089/q090/q092) と整合するか。Read して確認。

StructuredOutput で VERIFY_SCHEMA に従って返してください。`

phase('Translate')
const tr = await agent(translatePrompt, {
  label: `tr:${ID}`, phase: 'Translate', schema: TR_SCHEMA,
  model: 'opus', agentType: 'general-purpose',
})

phase('Verify')
const verdict = await agent(verifyPrompt(tr), {
  label: `verify:${ID}`, phase: 'Verify', schema: VERIFY_SCHEMA,
  model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
})

log(`${ID} 再翻訳 → 検証 verdict=${verdict?.verdict}`)

return { id: ID, translation: tr, verification: verdict }
