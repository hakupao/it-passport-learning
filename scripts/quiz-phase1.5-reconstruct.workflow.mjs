export const meta = {
  name: 'quiz-phase1.5-reconstruct',
  description: 'Quiz Phase 1.5 (D-138): 腐敗した stem を源から再構成。figure問は図から逐セル忠実に三語 stem を再構成、非figure marked は元OCR backup と照合し意味脱落 (q034「あと」型) を復元。writer(general-purpose)≠独立 figure↔stem checker(critic) 写審分離',
  phases: [
    { title: 'Reconstruct', detail: 'general-purpose(opus): 図/backup から三語 stem を再構成' },
    { title: 'Check', detail: 'critic(opus): figure↔stem 逐セル / backup 照合 + key 支持 + 三語整合、repair≤2' },
  ],
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const outPath = (id) => `${ROOT}/data/ip/quiz/.phase1.5/stem_${id}.json`

const ZH_POLICY = `zh は中国本土の標準 IT 用語 (成果物→交付物、稼働→运行 等)。既存訳 current_tr と用語・言い回しを一致させる (問題文と解説で用語ブレ防止)。`
const JSON_SAFE = `**JSON 安全**: 文字列値に生の半角二重引用符 " を使わない (「」/“” で囲む)。半角 " は JSON を壊す。`

const RECON_SCHEMA = {
  type: 'object', required: ['id', 'stem_jp_clean', 'stem', 'changed', 'change_summary_jp'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    stem_jp_clean: { type: 'string', description: '図/backup に忠実な、表示用の正しい JP stem (markdown 表は figure 通りに、条件語を脱落させない)' },
    stem: { type: 'object', required: ['zh', 'en'], additionalProperties: false, properties: { zh: { type: 'string' }, en: { type: 'string' } } },
    changed: { type: 'boolean', description: '現行表示 (current_clean or raw) から実質的な訂正があったか' },
    change_summary_jp: { type: 'string', description: '何を直したか (例: 表の D の前提作業 A→B 訂正、条件語「あと」復元)。変更なしなら「忠実、変更なし」' },
    derived_answer: { type: 'string', description: '再構成 stem + choices から自分で導いた正解字母 (検算)' },
  },
}
const CHECK_SCHEMA = {
  type: 'object', required: ['id', 'verdict', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object', required: ['source_faithful', 'supports_key', 'trilingual_consistent', 'no_fabrication', 'no_choice_table_leak'], additionalProperties: false,
      properties: {
        source_faithful: { type: 'boolean', description: 'figure問: stem_jp_clean が図と逐セル一致 (値/行/条件、脱落・scramble・混入なし) / 非figure: backup の意味を保持し脱落復元が妥当' },
        supports_key: { type: 'boolean', description: '再構成 stem + choices から keyed answer が妥当に導ける' },
        trilingual_consistent: { type: 'boolean', description: 'zh/en が stem_jp_clean に忠実・用語整合・本土zh' },
        no_fabrication: { type: 'boolean', description: '図/源に無い値・行・条件を捏造していない' },
        no_choice_table_leak: { type: 'boolean', description: '解答選択肢の一覧 (ア/イ/ウ/エ を行とする組合せ表) が stem に混入していない (choices_jp で別表示=二重なので除去すべき。問題が参照するデータ表=ログイン記録/取引/損益表等はOK)' },
      },
    },
    issues: { type: 'array', items: { type: 'object', required: ['severity', 'detail_jp'], additionalProperties: false, properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, detail_jp: { type: 'string' } } } },
    recommendation_jp: { type: 'string' },
  },
}

function entryRef(inputPath, id) {
  return `対象問題は \`${inputPath}\` の questions[] 中 id==="${id}" のエントリ。Read して raw_stem / current_clean / stem_corrupted_backup / choices_jp / correct_answer / figure_png / figure_page_png / current_tr / glossary を取得。`
}

function reconPrompt(inputPath, id, klass, feedback) {
  const figureBlock = `## 図 (権威・真相源) を Read
\`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ、この問は問番号で特定。crop は端で列欠落しうるのでフルページを正とする) の**両方**を **Read**。
## 再構成方針 (figure 問)
- stem_jp_clean を **図に逐セル忠実**に再構成: 表の全行・全列・全値・条件文を図の通りに。current_clean / raw_stem に**図と食い違う誤り** (行 scramble・値 drift・行/条件の脱落・成功⇄失敗反転・図に無いデータ混入) があれば**図を正として訂正**。問題の設問文 (問い) は保持。
- markdown 表で図の表を正確に再現する (列順・行数・各セル値)。
- **重要 — 選択肢表を stem に含めない**: ア/イ/ウ/エ の**解答選択肢**は別途 \`choices_jp\` から表示される。図中で選択肢が表形式 (各行が ア/イ/ウ/エ で a,b 等の組合せを示す類) でも、その**選択肢の表は stem_jp_clean に入れない** (二重表示になる)。stem に含めるのは問題が**参照・計算するデータ表** (ログイン記録・取引表・損益表・仕様表など) のみ。穴埋め問は本文の [ a ][ b ] 等は保持するが選択肢一覧は出さない。`
  const nonfigBlock = `## backup (元OCR、修復前) と照合
\`stem_corrupted_backup\` (元OCR、数字等に garble あり) と current_clean/raw_stem を比較。s7x 修復が garble 数字を直す過程で**意味を担う内容を脱落/改変**していないか (条件語「あと/以前/以下/最も/少なくとも/を除く」、節、否定、主語)。
## 再構成方針 (非figure marked 問)
- backup が保持していて表示版が失った**意味**を復元する (例: 「あと」を戻す)。backup の garble 数字自体は修復済の正しい値を使う (両者一致が正)。脱落した条件語・節を復元。
- stem_jp_clean は keyed answer を支持する正しい設問文に。
- **重要 — 選択肢表を stem に含めない**: 組合せ問題で raw_stem/backup が ア/イ/ウ/エ を行とする組合せ表 (各行が a,b 等の値の組) を含んでいても、その**解答選択肢の表は stem_jp_clean に入れない** (choices_jp で別途表示され二重になる)。穴埋め本文の [ a ][ b ] 等は保持するが選択肢一覧表は出さない。stem に残すのは問題が参照・計算するデータ表のみ。`
  return `あなたは IT パスポート過去問の**設問文 (stem) を源から再構成**する担当です。表示用の正しい三語 stem を作ります。

## 入力
${entryRef(inputPath, id)}
${klass === 'figure' ? figureBlock : nonfigBlock}

## 翻訳 (zh/en)
- 訂正後の stem_jp_clean を zh/en に翻訳。current_tr (既存訳) と glossary の用語・言い回しを優先し一致させる。${ZH_POLICY}

## 出力
1. RECON_SCHEMA と同形の JSON を \`${outPath(id)}\` に Write (id="${id}"、stem_jp_clean、stem={zh,en}、changed、change_summary_jp、derived_answer)。${JSON_SAFE}
2. 同じ内容を StructuredOutput で返す。
${feedback ? `\n## 前ラウンドの指摘 (是正は FAIL/high/medium に限定)\n${feedback}\n` : ''}`
}

function checkPrompt(inputPath, id, klass, recon) {
  const srcBlock = klass === 'figure'
    ? `figure問: \`figure_png\` と \`figure_page_png\` (権威) を **Read** し、stem_jp_clean の表の**全セル・全行・条件**が図と一致するか逐項照合 (値/行順/行数/成功失敗/条件語の脱落・scramble・混入を厳しく見る)。答案 robust でも図と食い違えば source_faithful=false。`
    : `非figure問: \`stem_corrupted_backup\` と照合し、修復で脱落していた意味 (条件語/節) が正しく復元され、backup の意味を保持しているか。stem_jp_clean が keyed answer を支持するか。`
  return `あなたは独立した stem 再構成検証者 (Rule D: 再構成者と別役割) です。再構成された stem が源に忠実か厳しく核験します。

## 入力 (正)
${entryRef(inputPath, id)}
${srcBlock}

## 再構成 (検証対象)
\`\`\`json
${JSON.stringify(recon).slice(0, 8000)}
\`\`\`

## checks
1. source_faithful: 上記の通り (figure 逐セル / backup 意味保持)。
2. supports_key: 再構成 stem + choices から correct_answer が妥当に導ける。
3. trilingual_consistent: zh/en が stem_jp_clean に忠実・本土zh・用語整合。
4. no_fabrication: 図/源に無い値・行・条件の捏造なし。
5. no_choice_table_leak: 解答選択肢の一覧 (ア/イ/ウ/エ を行とする組合せ表) が stem_jp_clean (jp/zh/en) に混入していない (choices_jp で別表示=二重なので除去すべき。問題が参照するデータ表=ログイン記録/取引/損益表等は混入でなくOK)。混入していれば該当 check=false かつ FAIL/CONCERNS。

verdict: PASS(全 true・high なし) / CONCERNS(軽微) / FAIL(図と不一致・意味脱落残存・捏造・key 不支持)。issues は severity+detail_jp。StructuredOutput で CHECK_SCHEMA。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? [] // [{id, klass}]
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id,klass}]}')
const MAX_ROUNDS = 2

const results = await pipeline(
  items,
  (it) => agent(reconPrompt(inputPath, it.id, it.klass, null), { label: `recon:${it.id}`, phase: 'Reconstruct', schema: RECON_SCHEMA, model: 'opus', agentType: 'general-purpose' }),
  async (recon, it) => {
    if (!recon) return { id: it.id, klass: it.klass, status: 'reconstruct_failed' }
    let cur = recon, check = null
    const rounds = []
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      check = await agent(checkPrompt(inputPath, it.id, it.klass, cur), { label: `chk:${it.id}#${round}`, phase: 'Check', schema: CHECK_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:critic' })
      rounds.push(check?.verdict ?? 'null')
      if (!check || check.verdict === 'PASS' || round === MAX_ROUNDS) break
      const fb = [`verdict=${check.verdict}`, ...Object.entries(check.checks || {}).filter(([, v]) => !v).map(([k]) => `check FAIL: ${k}`), ...(check.issues || []).map((i) => `[${i.severity}] ${i.detail_jp}`), check.recommendation_jp ? `推奨: ${check.recommendation_jp}` : ''].filter(Boolean).join('\n')
      log(`recon-repair ${it.id} round ${round} (${check.verdict})`)
      const re = await agent(reconPrompt(inputPath, it.id, it.klass, fb), { label: `rerecon:${it.id}#${round}`, phase: 'Reconstruct', schema: RECON_SCHEMA, model: 'opus', agentType: 'general-purpose' })
      if (!re) break
      cur = re
    }
    return { id: it.id, klass: it.klass, verdict: check?.verdict ?? 'null', rounds, changed: cur.changed, change_summary_jp: cur.change_summary_jp, derived_answer: cur.derived_answer }
  },
)

const clean = results.filter(Boolean)
const byVerdict = clean.reduce((m, r) => { const k = r.verdict ?? r.status; m[k] = (m[k] || 0) + 1; return m }, {})
const changed = clean.filter((r) => r.changed)
log(`再構成完了 ${clean.length}/${items.length}: ${JSON.stringify(byVerdict)} | changed ${changed.length}`)
return { exam_id: parsed.exam_id, total: items.length, done: clean.length, byVerdict, changed: changed.map((r) => ({ id: r.id, summary: r.change_summary_jp })), results: clean }
