export const meta = {
  name: 'quiz-chumon-sharedfig-S116',
  description: '中問の共有図を、図を持たない member のためにテキスト化する (Extract≠Verify、Rule D)。D-141 の前文に追記して自完結性を担保する',
  phases: [
    { title: 'Extract', detail: 'general-purpose(opus): 原典ページの共有図を jp/zh/en でテキスト化' },
    { title: 'Verify', detail: 'pr-review-toolkit:code-reviewer(opus): 原典と逐字照合 + 訳文の忠実度を独立核験' },
  ],
}

const FIG_SCHEMA = {
  type: 'object',
  required: ['key', 'figure_jp', 'figure_zh', 'figure_en', 'notes_jp'],
  additionalProperties: false,
  properties: {
    key: { type: 'string' },
    figure_jp: { type: 'string', description: '共有図を markdown 表 / 箇条書きでテキスト化した日本語。図キャプションと注記も含める' },
    figure_zh: { type: 'string', description: '同内容の中国語 (中国本土の標準 IT 用語)' },
    figure_en: { type: 'string', description: '同内容の英語' },
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
      required: ['values_verbatim', 'structure_preserved', 'no_fabrication', 'tr_faithful'],
      additionalProperties: false,
      properties: {
        values_verbatim: { type: 'boolean', description: '図中の全ての値・列名・見出しが原典と逐字一致' },
        structure_preserved: { type: 'boolean', description: '表の行列構成・箇条書きの階層が原典どおり' },
        no_fabrication: { type: 'boolean', description: '原典に無い列・行・値・説明の追加が無い' },
        tr_faithful: { type: 'boolean', description: 'zh/en が figure_jp に忠実で、数値・列名が保存されている' },
      },
    },
    issues_jp: { type: 'array', items: { type: 'string' } },
  },
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const items = parsed?.items
if (!Array.isArray(items) || !items.length) throw new Error('need {items:[{key, exam_id, page, what, needed_by, ref_id}]}')

const extractPrompt = (it) => `あなたは IPA 過去問の**中問 共有図のテキスト化担当**です。

## 背景
学習アプリは設問を 1 問ずつ単独で表示します。中問の共有図が「図が添付されている設問」にしか
無いと、**図を持たない member は解答不能**になります (D-141)。そこで共有図を原典から
テキスト化し、共有前文に追記して全 member を自完結にします。

## 対象
- グループ: ${it.key} (${it.exam_id})
- **原典ページ (権威)**: ${it.page}
- テキスト化する対象: **${it.what}**
- これを必要としている設問 (図が添付されていない): ${it.needed_by.join(', ')}
${it.ref_id ? `- 参考: 既に同じ図を本文に持つ設問 ${it.ref_id} が \`data/ip/quiz/translations/${it.exam_id}.json\` の questions["${it.ref_id}"] にある。**訳語と体裁を揃えるために Read してよいが、原典と食い違う場合は必ず原典を優先すること**。` : ''}

## 手順
1. 原典ページ画像を Read し、対象の図を**拡大して 1 セルずつ**読み取る。
   低解像度の一読で済ませないこと。数値は個別に再確認する。
2. markdown 表 (行列がある図) または箇条書き (構造図) でテキスト化する。
   **図キャプションと注記 (「注 網掛けの部分は，表示していない。」等) も含める**。
3. 原典に無い列・行・値・説明を**足さない**。網掛け (非表示) のセルは空欄のまま残す。
4. zh は中国本土の標準 IT 用語を使う。数値・列名・固有名は 3 言語で完全に一致させる。

StructuredOutput で FIG_SCHEMA に従って返してください。`

const verifyPrompt = (it, draft) => `あなたは独立した検証者です (Rule D: テキスト化担当とは別役割)。甘く通さない。

## 対象
- グループ: ${it.key} (${it.exam_id})、テキスト化対象: **${it.what}**
- **原典ページ (唯一の正)**: ${it.page} を Read すること

## 検証対象 (テキスト化担当の成果物)
\`\`\`json
${JSON.stringify(draft, null, 2)}
\`\`\`

## 検証項目
- **values_verbatim**: 図中の全ての値・列名・見出しが原典と逐字一致するか。
  **数値は 1 つずつ原典画像を拡大して確認すること**。読み飛ばさない。
- **structure_preserved**: 表の行列構成・箇条書きの階層・列の並び順が原典どおりか。
  網掛け (非表示) のセルが空欄として保たれているか。
- **no_fabrication**: 原典に無い列・行・値・説明・注記が足されていないか。
- **tr_faithful**: zh/en が figure_jp に忠実で、数値・列名・固有名が保存されているか。
  zh が中国本土の標準用語か。

1 つでも false があれば verdict は CONCERNS か FAIL とし、issues_jp に具体的に書いてください。
StructuredOutput で VERIFY_SCHEMA に従って返してください。`

const results = await pipeline(
  items,
  (it) => agent(extractPrompt(it), {
    label: `extract:${it.key}`, phase: 'Extract', schema: FIG_SCHEMA,
    model: 'opus', agentType: 'general-purpose',
  }),
  async (draft, it) => {
    if (!draft) return { key: it.key, draft: null, verification: null }
    const v = await agent(verifyPrompt(it, draft), {
      label: `verify:${it.key}`, phase: 'Verify', schema: VERIFY_SCHEMA,
      model: 'opus', agentType: 'pr-review-toolkit:code-reviewer',
    })
    return { key: it.key, exam_id: it.exam_id, draft, verification: v }
  },
)

const clean = results.filter(Boolean)
const verdicts = clean.reduce((m, r) => { const k = r.verification?.verdict ?? 'null'; m[k] = (m[k] || 0) + 1; return m }, {})
log(`共有図テキスト化 ${clean.length}/${items.length}: ${JSON.stringify(verdicts)}`)
return { n: items.length, verdicts, results: clean }
