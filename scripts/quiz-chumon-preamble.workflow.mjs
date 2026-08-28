export const meta = {
  name: 'quiz-chumon-preamble',
  description: '中問 (問89〜100 の連問) の共有前文を原典から起こし、jp/zh/en の 3 言語で返す。D-141: 各設問は単独表示されるため、共有前文はグループの全設問に埋め込んで自完結にする',
  phases: [
    { title: 'Extract', detail: 'general-purpose(opus): 原典ページを実読し共有前文を jp/zh/en で起草' },
    { title: 'Verify', detail: 'code-reviewer(opus): 原典と逐字照合 + 訳文の忠実度を独立核験' },
  ],
}

const PREAMBLE_SCHEMA = {
  type: 'object',
  required: ['key', 'preamble_jp', 'preamble_zh', 'preamble_en', 'notes_jp'],
  additionalProperties: false,
  properties: {
    key: { type: 'string' },
    preamble_jp: { type: 'string', description: '原典の共有記述を逐字で起こした日本語。各設問固有の設問文は含めない。図の再現も含めない (図は設問ごとに添付済み)' },
    preamble_zh: { type: 'string', description: '同内容の中国語 (中国本土の標準 IT 用語)' },
    preamble_en: { type: 'string', description: '同内容の英語' },
    notes_jp: { type: 'string', description: '含めた範囲と除外した範囲の判断理由' },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['key', 'verdict', 'issues_jp'],
  additionalProperties: false,
  properties: {
    key: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object',
      required: ['jp_verbatim', 'no_question_sentence', 'no_fabrication', 'tr_faithful'],
      additionalProperties: false,
      properties: {
        jp_verbatim: { type: 'boolean', description: 'preamble_jp が原典ページの共有記述と逐字一致 (表記揺れは許容)' },
        no_question_sentence: { type: 'boolean', description: '各設問固有の設問文が混入していない' },
        no_fabrication: { type: 'boolean', description: '原典に無い見出し・説明・値の追加が無い' },
        tr_faithful: { type: 'boolean', description: 'zh/en が preamble_jp に忠実で、数値・固有名が保存されている' },
      },
    },
    issues_jp: { type: 'array', items: { type: 'string' } },
  },
}

function extractPrompt(g) {
  return `あなたは IPA 過去問の**中問 共有前文の起草者**です。

## 背景
学習アプリは設問を 1 問ずつ単独で表示します。中問 (連問) の共有記述が設問レコードに含まれていないと、
学習者はその問を**解答不能**になります (D-141)。そこで共有前文を原典から起こし、
グループの各設問に埋め込みます。

## 対象
- グループ: ${g.key} (${g.exam_id})、設問 ${g.member_ids.join(', ')}
- 原典ページ (**権威**): ${g.preamble_pages.join(' , ')}
${g.head_id ? `- 既にこの前文を持つ先頭問 (訳語・体裁の参考にする): ${g.head_id}` : '- 先頭問にも前文は存在しない (ゼロから起草)'}
- 参考: 既存訳の用語を揃えるため \`data/ip/quiz/translations/${g.exam_id}.json\` の
  questions["${g.head_id || g.member_ids[0]}"] を Read してよい。

## 手順
1. 原典ページを **Read** し、文字が小さければ拡大して読む。
2. **中問の共有記述だけ**を逐字で書き起こす。
   - **含める**: 状況設定の本文、〔…〕で括られた仕様・条件・手順・概要などのブロック、
     およびそれらに属する箇条書き。数値・固有名は 1 文字も変えない。
   - **含めない**: ①「中問X ○○に関する次の記述を読んで，問NN 〜 NN に答えよ。」の見出し行
     (corpus 規約では設問本文に前置しない)、②各設問固有の設問文、
     ③図やフローチャートの再現 (図は設問ごとに画像が添付されている)、
     ④分野見出し〔テクノロジ〕等。
   - 表が含まれる場合は markdown の \`| 列 |\` 形式に整形してよい (体裁差は許容)。
3. 同内容の **zh** と **en** を作る。zh は中国本土の標準 IT 用語を用い日式借词を避ける。
   先頭問の既存訳がある場合はその用語・人名表記に合わせる。
4. **JSON 安全**: 文字列値の中で生の半角二重引用符 " を使わない (引用は「」/“” を使う)。

StructuredOutput で PREAMBLE_SCHEMA に従って返してください。`
}

function verifyPrompt(g, draft) {
  return `あなたは独立した**核験者**です。他者が起草した中問共有前文が原典どおりかだけを検証します。

## 対象
- グループ: ${g.key} (${g.exam_id})
- 原典ページ (**権威**): ${g.preamble_pages.join(' , ')}

## 起草物
### preamble_jp
${draft.preamble_jp}

### preamble_zh
${draft.preamble_zh}

### preamble_en
${draft.preamble_en}

## 検証手順
1. 原典ページを **Read** し、**起草物を見る前に**共有記述を自分で書き起こす。
2. その後 preamble_jp と突き合わせる。以下を個別に判定:
   - jp_verbatim: 語句の置換・脱落・追加・数値相違が無いか (全半角/句読点/表の整形は許容)。
   - no_question_sentence: 各設問固有の設問文 (「〜適切なものはどれか。」等) が混入していないか。
   - no_fabrication: 原典に無い見出し・注記・説明・値が足されていないか。
     **「中問X …問NN 〜 NN に答えよ。」の見出し行は意図的に除外する規約なので、無いことは正しい**。
   - tr_faithful: zh/en が preamble_jp と同義で、数値・固有名・箇条書き番号が保存されているか。
3. 1 つでも false があれば verdict は CONCERNS または FAIL とし、issues_jp に具体的に書く。

StructuredOutput で VERIFY_SCHEMA に従って返してください。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const groups = parsed?.groups
if (!Array.isArray(groups) || !groups.length) throw new Error('need {groups:[{key,exam_id,preamble_pages,head_id,member_ids}]}')

const results = await pipeline(
  groups,
  (g) => agent(extractPrompt(g), {
    label: `extract:${g.key}`, phase: 'Extract', schema: PREAMBLE_SCHEMA,
    model: 'opus', agentType: 'general-purpose',
  }),
  async (draft, g) => {
    if (!draft) return { key: g.key, draft: null, verification: null }
    const v = await agent(verifyPrompt(g, draft), {
      label: `verify:${g.key}`, phase: 'Verify', schema: VERIFY_SCHEMA,
      model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
    })
    return { key: g.key, exam_id: g.exam_id, member_ids: g.member_ids, draft, verification: v }
  },
)

const ok = results.filter(Boolean)
const verdicts = ok.reduce((m, r) => { const k = r.verification?.verdict ?? 'null'; m[k] = (m[k] || 0) + 1; return m }, {})
log(`中問共有前文 ${ok.length} グループ → 核験 ${JSON.stringify(verdicts)}`)

return { n: ok.length, verdicts, results: ok }
