export const meta = {
  name: 'quiz-stemctx',
  description: 'Quiz Phase 1.6 incomplete-source 是正: 中問 (大問形式) の共通前提が standalone 抽出で欠落した問に、原典の中問イントロ文脈を stem へ注入し answerable 化。trilingual (jp clean + zh + en)。writer (general-purpose) → critic verify (写審分離)。',
  phases: [
    { title: 'Author', detail: 'general-purpose(opus): 原典中問イントロを読み欠落文脈を stem に注入した trilingual stem を生成' },
    { title: 'Verify', detail: 'critic(opus): 注入文脈が原典に忠実か + self-contained で answerable か + 三語整合' },
  ],
}

const AUTHOR_SCHEMA = {
  type: 'object', required: ['id', 'stem_jp_clean', 'stem_zh', 'stem_en', 'derived_answer', 'notes_jp'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    stem_jp_clean: { type: 'string', description: '中問イントロの欠落文脈を注入した、self-contained な日本語 stem (元の設問文+表は保持)' },
    stem_zh: { type: 'string', description: '簡体中文訳' },
    stem_en: { type: 'string', description: '英訳' },
    derived_answer: { type: 'string', enum: ['ア', 'イ', 'ウ', 'エ'], description: '注入後 self-contained stem から導いた正解 (検算)' },
    notes_jp: { type: 'string', description: '注入した文脈と出典 (どのページの中問イントロか) + 導出根拠' },
  },
}
const VERIFY_SCHEMA = {
  type: 'object', required: ['id', 'context_faithful', 'self_contained', 'trilingual_consistent', 'derived_answer', 'verdict', 'notes_jp'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    context_faithful: { type: 'boolean', description: '注入文脈が原典中問イントロに忠実か' },
    self_contained: { type: 'boolean', description: '注入後 stem だけで answerable か' },
    trilingual_consistent: { type: 'boolean', description: 'jp/zh/en が整合か' },
    derived_answer: { type: 'string', enum: ['ア', 'イ', 'ウ', 'エ'], description: '独立に導いた正解' },
    verdict: { type: 'string', enum: ['APPROVE', 'DISPUTE'] },
    notes_jp: { type: 'string' },
  },
}

const ITEMS = [
  {
    id: '2010h22a-q094',
    pages: ['data/ip/exams/pages/2010h22a/page-38.png', 'data/ip/exams/pages/2010h22a/page-40.png'],
    missing_ctx: '中問B (page-38) の「設定の形式」が欠落。形式1=「ポリシ｜許可区分」(既定ポリシ行)、形式2=「施設｜許可区分｜対象区分」(例外行、同一施設で許可区分が同じ複数対象区分はコンマ区切りで1行)。許可区分は ACCEPT/DENY。設定=形式1を1行目+形式2を2行目以降。表は ○=許可/×=不許可。この前提を q094 の stem に注入し self-contained 化せよ。',
    current_stem: '次の表に示す許可区分の設定について，ポリシの許可区分を DENY にしたときの設定の記述は，形式1を記述する行を含めて，最低何行必要か。(+ 施設×対象区分の○×表)',
  },
  {
    id: '2015h27a-q100',
    pages: ['data/ip/exams/pages/2015h27a/page-45.png', 'data/ip/exams/pages/2015h27a/page-47.png'],
    missing_ctx: '中問D (page-45) の「Aさんが処分する機器」が欠落: ①8GバイトのHDDを内蔵したデスクトップPC本体1台 ②X社製ブラウン管ディスプレイ1台 ③40GバイトのHDDを内蔵した液晶ディスプレイ一体型PC 1台。HDD を内蔵するのは①(8G)と③(40G)。q100 は専用ソフト処理速度 (デスクトップPC 200M/分、液晶一体型PC 400M/分) で全HDD処理時間を問う。HDD容量(8G/40G)を stem に注入し self-contained 化せよ (1G=1000Mバイトで計算)。',
    current_stem: 'Aさんが処分するPCに内蔵されている全てのHDDの処理に掛かる時間は合わせて何分か。(+ PC×処理速度表)',
  },
]

const authorPrompt = (it) => `あなたは IT パスポート過去問の編集者です。この問は本来 **中問 (大問形式、共通前提付き)** の一部でしたが、standalone 抽出で共通前提が欠落し、単独では解けません。原典の中問イントロを読み、欠落文脈を stem に**忠実に注入**して self-contained (単独で解ける) な trilingual stem を作ってください。

## 対象 id="${it.id}"
- 原典ページ (Read せよ、権威): ${it.pages.join(' , ')}
- 欠落している中問文脈: ${it.missing_ctx}
- 現在の standalone stem (不完全): ${it.current_stem}

## 手順
1. 原典ページ (中問イントロ + 設問ページ) を Read し、欠落文脈の正確な内容 (定義・数値・形式) を確認。
2. 欠落文脈を**簡潔かつ忠実に**冒頭へ補い、元の設問文と表を保持した self-contained な stem_jp_clean を作る (中問全体をコピペせず、当該設問の解答に必要な前提のみ)。
3. その stem だけで正解を**検算** (derived_answer)。
4. stem_zh (簡体中文) / stem_en を生成 (既存訳の用語・様式に整合、表は markdown 保持)。

## 出力
AUTHOR_SCHEMA に従い StructuredOutput で返す (id="${it.id}")。`

const verifyPrompt = (it, authored) => `あなたは独立検証者 (critic) です。別 agent が、中問前提が欠落した問 id="${it.id}" の stem に文脈を注入しました。原典から独立に検証してください。

## 入力
- 原典ページ (Read、権威): ${it.pages.join(' , ')}
- 注入された stem (検証対象):
stem_jp_clean: ${JSON.stringify(authored?.stem_jp_clean)}
stem_zh: ${JSON.stringify(authored?.stem_zh)}
stem_en: ${JSON.stringify(authored?.stem_en)}
author の derived_answer: ${JSON.stringify(authored?.derived_answer)}

## 検証
1. 原典ページを読み、注入文脈が中問イントロに**忠実**か (context_faithful)。捏造・歪曲がないか。
2. 注入後 stem **だけで answerable** か (self_contained)。
3. jp/zh/en が**整合**か (trilingual_consistent)。
4. stem から正解を**独立に導出** (derived_answer)。author の値に引きずられないこと。
5. 全て満たせば APPROVE、問題あれば DISPUTE。

## 出力
VERIFY_SCHEMA に従い StructuredOutput で返す (id="${it.id}")。`

const out = await pipeline(
  ITEMS,
  (it) => agent(authorPrompt(it), { label: `author:${it.id}`, phase: 'Author', schema: AUTHOR_SCHEMA, model: 'opus', agentType: 'general-purpose' }),
  (authored, it) => agent(verifyPrompt(it, authored), { label: `verify:${it.id}`, phase: 'Verify', schema: VERIFY_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:critic' })
    .then((v) => ({ id: it.id, authored, verify: v })),
)
const clean = out.filter(Boolean)
log(`stemctx 完了 ${clean.length}/${ITEMS.length}: APPROVE ${clean.filter((r) => r.verify?.verdict === 'APPROVE').length}`)
return { results: clean }
