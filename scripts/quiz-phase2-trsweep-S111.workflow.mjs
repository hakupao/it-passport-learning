export const meta = {
  name: 'quiz-phase2-trsweep-S111',
  description: '2013h25a の未抽検 72 問について JP↔訳文の項目単位照合を行い、失格したものだけを再訳→独立核験する',
  phases: [
    { title: 'Audit', detail: 'pr-review-toolkit:code-reviewer(opus): JP と項目単位で突合し保真を判定' },
    { title: 'Repair', detail: 'general-purpose(opus): 失格分のみ JP 源から全面再訳' },
    { title: 'Verify', detail: 'feature-dev:code-reviewer(opus): 再訳を項目単位で核験' },
  ],
}

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['id', 'faithful', 'checks', 'findings'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    faithful: { type: 'boolean', description: 'true = zh/en が JP の項目ごとの翻訳になっている' },
    checks: {
      type: 'object',
      required: ['count_matches', 'item_aligned', 'no_added_content', 'no_dropped_content'],
      additionalProperties: false,
      properties: {
        count_matches: { type: 'boolean' }, item_aligned: { type: 'boolean' },
        no_added_content: { type: 'boolean' }, no_dropped_content: { type: 'boolean' },
      },
    },
    findings: {
      type: 'array',
      items: {
        type: 'object', required: ['field', 'severity', 'detail_jp'], additionalProperties: false,
        properties: {
          field: { type: 'string', description: '"correct" | "distractors.ア" | "points.1" など' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          detail_jp: { type: 'string' },
        },
      },
    },
  },
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

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const QNUMS = parsed?.qnums
if (!Array.isArray(QNUMS) || !QNUMS.length) throw new Error('need {qnums:[...]}')
const IDS = QNUMS.map((n) => `${E}-q${String(n).padStart(3, '0')}`)

const CONTEXT = `## この監査が存在する理由 (S110 の実測)

同 exam の別サンプル 28 問中 **6 問 (21%)** で、zh/en が JP 源の翻訳になっていなかった。実例:

- **日付の系統的ドリフト** — JP が「9月初」と書く箇所を訳文が 6 箇所すべて「8月末」にしていた
  (ガントチャートを月目盛で読む設問だったので、解説が図と半月ずれた)
- **points 配列の項目入れ替わり** — points[0].zh が points_jp[1] の内容になっていた
- **points 要素のまるごと欠落** — JP 3 件に対し訳文 2 件
- **誤答の「成因」のすり替え** — JP が「こう誤解すると この値になる」と書いた成因を、
  訳文が別の成因に差し替えていた
- **論拠の差し替え** — JP が典拠 (作成ルール(5) の上限12件) を挙げているのに、
  訳文はそれを出さず別の理由付けで結論だけ合わせていた
- **JP に無い概念の追加** — 規格名・数値比較・具体例の捏造

**共通する性質**: 訳文は単体で読むと自然で、内容自体も概ね正しい。だから
「訳文を読んで妥当か」では絶対に見つからない。**JP の項目と 1 対 1 で突き合わせて初めて見える**。
前段の in-pipeline TR-Review はこれら全件を PASS / completeness=true で通している。`

const auditPrompt = (id) => `あなたは独立した**訳文保真監査者**です。甘く通さない。

${CONTEXT}

## 入力
- **JP 源 (唯一の正)**: \`${P2}/expl_jp_${id}.json\` を Read
  (correct_jp / distractors_jp[{letter, why_wrong_jp}] / points_jp[])
- **訳文 (監査対象)**: \`${P2}/expl_tr_${id}.json\` を Read
  (correct{zh,en} / distractors[{letter,zh,en}] / points[{zh,en}])

## 手順 (必ずこの順で)
1. **JP を先に読み、項目ごとに「何を主張しているか」を頭の中で列挙**する。
2. そのうえで訳文の同じ index / 同じ字母の項目と突き合わせる。
3. 訳文から読み始めない。訳文の自然さは合格の理由にならない。

## 判定
- **count_matches**: points の件数、distractors の字母集合が JP と一致するか。
- **item_aligned**: points[i] ↔ points_jp[i]、distractors[letter] ↔ distractors_jp[letter] が
  1 対 1 で対応しているか。**入れ替わり・混入・分割・統合が無いか**。i ごとに見ること。
- **no_added_content**: JP に無い概念・規格名・数値・具体例・論点を足していないか。
- **no_dropped_content**: JP にある論拠・成因・限定・括弧書き・対比節を落としていないか。
  **数値と時点表現は一つずつ JP と照合**すること。

\`faithful\` は 4 つの checks がすべて true のときだけ true。
軽微な語彙選択・文体・訳語揺れは **findings に low で記録するが faithful は下げない**。
faithful=false にするのは、上記 4 分類のいずれかに実際に該当する場合のみ。

StructuredOutput で AUDIT_SCHEMA に従って返してください。`

const repairPrompt = (id, audit) => `あなたは IT パスポート過去問**解説**の翻訳者です。

## 背景
\`${P2}/expl_tr_${id}.json\` の現行訳は、独立監査で **保真不成立** と判定されました。指摘:

\`\`\`json
${JSON.stringify(audit.findings ?? [], null, 2)}
\`\`\`

「訳文単体としては内容が正しいが、JP 源の当該項目の翻訳になっていない」型です。
**部分パッチでは項目対応のずれを回収できない**ため、JP 源から全面的に訳し直してください。

## 入力
1. **JP 源 (唯一の正)**: \`${P2}/expl_jp_${id}.json\` を Read
2. 用語参照: \`${P2}/input_${E}.json\` の questions[] 中 id==="${id}" の stem / choices / tr / glossary

## 鉄則
- \`points_jp[i]\` → \`points[i]\`、\`distractors_jp[letter]\` → \`distractors[letter]\` に **1 対 1**。
  **統合・分割・並べ替え・入れ替えをしない**。件数は JP と同じ。
- JP に無い概念・用語・規格名・具体例・数値比較を**足さない**。
- JP にある論拠・成因・限定・括弧書き・対比節を**落とさない**。
- 数値・時点表現は JP どおりに訳す (勝手に月末/月初を言い換えない)。
- zh は簡体字・大陸中国語。用語は input の tr と glossary に揃える。

StructuredOutput で TR_SCHEMA に従って返してください。`

const verifyPrompt = (id, proposal) => `あなたは独立した翻訳検証者です (Rule D: 翻訳者とも監査者とも別役割)。甘く通さない。

## 入力
- **JP 源 (唯一の正)**: \`${P2}/expl_jp_${id}.json\` を Read
- 設問データ: \`${P2}/input_${E}.json\` の questions[] 中 id==="${id}"
- 検証対象 = 以下の**再訳案** (disk 上の現行訳ではなく、これを見てください):

\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`

${CONTEXT}

## 検証項目
- **count_matches**: points 件数・distractors 字母集合が JP と一致するか。
- **item_aligned**: points[i] ↔ points_jp[i]、distractors[letter] ↔ distractors_jp[letter] が
  1 対 1 か。**i ごとに照合すること**。
- **meaning_faithful**: 各項目の意味が保たれ、JP に無いものを足していないか。
- **no_drift**: 論理の順序・強調・限定・因果・数値・時点表現が動いていないか。
- **terminology_correct**: zh は大陸中国語の標準用語か。input の設問訳と整合するか。

StructuredOutput で VERIFY_SCHEMA に従って返してください。`

const results = await pipeline(
  IDS,
  (id) => agent(auditPrompt(id), {
    label: `audit:${id}`, phase: 'Audit', schema: AUDIT_SCHEMA,
    model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
  }),
  async (audit, id) => {
    if (!audit) return { id, audit: null, repaired: false }
    if (audit.faithful !== false) return { id, audit, repaired: false }
    const tr = await agent(repairPrompt(id, audit), {
      label: `retr:${id}`, phase: 'Repair', schema: TR_SCHEMA,
      model: 'opus', agentType: 'general-purpose',
    })
    return { id, audit, retranslation: tr, repaired: true }
  },
  async (row) => {
    if (!row?.repaired || !row.retranslation) return row
    const v = await agent(verifyPrompt(row.id, row.retranslation), {
      label: `verify:${row.id}`, phase: 'Verify', schema: VERIFY_SCHEMA,
      model: 'opus', agentType: 'feature-dev:code-reviewer',
    })
    return { ...row, verification: v }
  },
)

const ok = results.filter(Boolean)
const unfaithful = ok.filter((r) => r.audit?.faithful === false)
const passed = unfaithful.filter((r) => r.verification?.verdict === 'PASS')
log(`監査 ${ok.length} 問 → 保真不成立 ${unfaithful.length} 問 → 再訳して PASS ${passed.length} 問`)

return {
  exam_id: E,
  audited: ok.length,
  unfaithfulCount: unfaithful.length,
  unfaithfulIds: unfaithful.map((r) => r.id),
  results: ok,
}
