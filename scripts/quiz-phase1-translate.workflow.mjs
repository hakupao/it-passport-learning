export const meta = {
  name: 'quiz-phase1-translate',
  description: 'Quiz Phase 1 (D-136): 過去問 stem+choices を JP→zh/en 翻訳。figure問は図を見て JP garble も clean 化、教科書term glossary 束縛、writer(general-purpose)≠reviewer(code-reviewer) 写審分離',
  phases: [
    { title: 'Translate', detail: 'general-purpose(opus): JP→zh/en、figure問は figure_png を Read し stem_jp_clean も生成' },
    { title: 'Review', detail: 'code-reviewer(opus): 忠実度核験 (Rule D) + 最大2ラウンド repair' },
  ],
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const outPath = (id) => `${ROOT}/data/ip/quiz/.phase1/tr_${id}.json`

// Stage 4 (D-129-C) 本土 zh 用語方針。quiz/教科書で訳語一致 (D-136-D)。
const ZH_POLICY = `**zh は中国本土の標準 IT 用語を使い、日式借词を避ける**。例: 稼働率→「可用率/运行率」(×稼动率)、解約→「取消订阅/退订」(×解约)、定義要件→「定义要素」(×定义要件)、パリティ→「校验信息/奇偶校验」(×校验位)、稼働→「运行」(×稼动)、**成果物→「交付物」(×成果物)**、**妥当性確認(テスト)→「确认(测试)」**(確認=validation は本土標準で「确认」、検証=verification は「验证」と対にする)。意味だけでなく本土読者にとって自然な語形を選ぶ。`

const CHOICE = {
  type: 'object', required: ['letter', 'zh', 'en'], additionalProperties: false,
  properties: { letter: { type: 'string', enum: ['ア', 'イ', 'ウ', 'エ'] }, zh: { type: 'string' }, en: { type: 'string' } },
}
const TR_SCHEMA = {
  type: 'object', required: ['id', 'stem', 'choices'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    stem_jp_clean: { type: 'string', description: 'figure問のみ: 図OCR混入を除去したクリーンJP stem (正当な表は保持)。非figure問・garble無しは省略' },
    stem: { type: 'object', required: ['zh', 'en'], additionalProperties: false, properties: { zh: { type: 'string' }, en: { type: 'string' } } },
    choices: { type: 'array', minItems: 4, maxItems: 4, items: CHOICE },
  },
}
const REVIEW_SCHEMA = {
  type: 'object', required: ['id', 'verdict', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object', required: ['completeness', 'meaning_faithful', 'terminology_correct', 'no_drift_or_addition', 'clean_stem_ok'], additionalProperties: false,
      properties: {
        completeness: { type: 'boolean', description: 'stem+4choices 全てに zh/en があり非空' },
        meaning_faithful: { type: 'boolean', description: 'zh/en が JP の意味を正確に保持 (脱落/誤訳/逆転なし)' },
        terminology_correct: { type: 'boolean', description: 'IT パスポート専門用語が zh/en で適切、glossary と整合' },
        no_drift_or_addition: { type: 'boolean', description: '原文に無い情報の追加や数値改変がない' },
        clean_stem_ok: { type: 'boolean', description: 'figure問: stem_jp_clean が図OCR garble のみ除去し正当な表・本文を保持 (非figure問は true)' },
      },
    },
    issues: { type: 'array', items: { type: 'object', required: ['severity', 'lang', 'detail_jp'], additionalProperties: false, properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, lang: { type: 'string', enum: ['zh', 'en', 'jp', 'both'] }, detail_jp: { type: 'string' } } } },
    recommendation_jp: { type: 'string' },
  },
}

// Agents read each question's data from the prep input file by id (keeps workflow
// args tiny + scales across 29 exams without inlining 50KB/exam). The input entry
// has: id, stem_jp, choices_jp{ア..エ}, correct_answer, has_figure, figure_png, glossary[].
function entryRef(inputPath, id) {
  return `対象問題のデータは \`${inputPath}\` の questions[] 中で **id === "${id}"** のエントリ。`
}

function translatorPrompt(inputPath, id, feedback) {
  return `あなたは IT パスポート過去問の翻訳者です。日本語の過去問 (stem + 選択肢4) を簡体字中国語(zh)と英語(en)に翻訳します。

## 入力
${entryRef(inputPath, id)} まずそのファイルを Read し、id="${id}" のエントリ (stem_jp / choices_jp / has_figure / figure_png / glossary) を取得せよ。

## 図の扱い
- **has_figure=true の場合**: \`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ) の**両方**を **Read** して内容を理解せよ。
  - **フルページが権威**: 裁剪図は端がクロップされ表のヘッダ行・列が欠落していることがある (S88 実証)。表の列構成・ヘッダ・行数は \`figure_page_png\` 上の該当問題の図で必ず確認し、crop と食い違えばフルページを正とする。
  - raw stem_jp には OCR で**図や選択肢・表が stem に混入/破損** (garble) している場合がある (例: 取引表が壊れて発注/入荷など図に無い語が紛れる)。
  - **stem_jp_clean** を出力せよ = **図を正** として再構成した正しい純粋な stem。問題が必要とする正当なデータ表 (売掛金表・損益表・取引表など markdown \`|\` 表) は図の通りに保持/修正し (列の脱落・列順改変をしない)、stem に混入した重複・破損のみ除去。図は別途画像でも描画される。
  - zh/en の stem 翻訳は **clean 版**を訳す。
- **has_figure=false の場合**: stem_jp に OCR ノイズ (例:「a こ c」→「a〜c」、「挙げばた/挙げけた」→「挙げた」、「いわ ゆる」→「いわゆる」等の誤字・余分な空白・記号崩れ) があれば、**意味を変えずに**修正した **stem_jp_clean** を出力せよ。数値・選択肢ラベル・専門用語・問題の論理は厳密に保持し、明白な OCR 誤りのみ直す (推測で内容を足さない)。既に綺麗なら stem_jp_clean は省略。zh/en は綺麗な版を訳す。

## 翻訳方針
- **忠実第一**: 日本語の意味・専門概念を正確に保持。情報の追加・省略・改変をしない。問題の正誤判定が変わってはならない。
- **専門用語**: エントリの glossary の訳語 (jp→zh/en) を必ず優先 (D-136-D 教科書一致)。glossary に無い語は IT パスポート標準訳語。
- ${ZH_POLICY}
- en は平易な学習英語。zh は簡体字。選択肢は ア→イ→ウ→エ の順で4つ全て訳す (letter を正しく付す、選択肢の OCR ノイズ「[表]」等は訳に持ち込まない)。

## 出力
1. TR_SCHEMA と同形の JSON を \`${outPath(id)}\` に Write (id="${id}"、garble あれば stem_jp_clean 含む、stem={zh,en}、choices=[{letter,zh,en}×4])。
2. 同じ内容を StructuredOutput で返す。
${feedback ? `\n## 前ラウンドの Rule D 指摘 (是正必須)\n${feedback}\n` : ''}`
}

function reviewerPrompt(inputPath, id, hasFigure, tr) {
  const figureNote = hasFigure
    ? `\n**figure問**: \`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ=権威、crop は端欠落しうる) の両方を Read し、stem_jp_clean が (a) 図を正として OCR garble/破損表を除去・再構成し (b) フルページ上の図の数値・項目・**表の列構成 (脱落/列順改変なし)** と一致しているか核験 (clean_stem_ok)。`
    : `\nfigure無し問。stem_jp_clean が**有る**場合: OCR 誤字のみ修正し意味・数値・選択肢ラベルを保持しているか核験 (内容の改変・追加があれば clean_stem_ok=false)。**無い**場合: clean_stem_ok=true。`
  return `あなたは独立した翻訳検証者 (Rule D: 翻訳者と別役割) です。過去問 JP→zh/en 翻訳の**忠実度**を批判的に核験します。

## 入力
JP 源 (正): ${entryRef(inputPath, id)} Read して id="${id}" の stem_jp / choices_jp / correct_answer / glossary を取得。

## 翻訳 (検証対象)
\`\`\`json
${JSON.stringify(tr).slice(0, 8000)}
\`\`\`
${figureNote}

## 検査 (checks)
1. completeness: stem + 4選択肢 全てに zh/en があり非空。
2. meaning_faithful: zh/en が JP の意味を正確に保持 (脱落/誤訳/逆転なし、特に正誤判定に関わる核心)。
3. terminology_correct: 専門用語が zh/en で適切、glossary と整合、本土 zh 用語 (日式借词でない)。
4. no_drift_or_addition: 原文に無い情報の追加・数値/事実の改変がない。
5. clean_stem_ok: 上記の図/OCR 方針通り。

## verdict
- PASS: 全 check true、high issue なし。
- CONCERNS: 軽微な用語/自然さの改善余地のみ (意味は保持)。
- FAIL: 欠落・誤訳/意味逆転 (high)、原文に無い情報追加、図と不一致な表、正当な内容の誤削除。

issues は severity + lang(zh/en/jp/both) + detail_jp。StructuredOutput で REVIEW_SCHEMA に従い返す。`
}

// ---- run ---------------------------------------------------------------------
const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const items = parsed?.items ?? [] // [{id, has_figure}]
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id,has_figure}]}: ' + JSON.stringify(args).slice(0, 200))
const MAX_ROUNDS = 2

const results = await pipeline(
  items,
  (it) => agent(translatorPrompt(inputPath, it.id, null), { label: `tr:${it.id}`, phase: 'Translate', schema: TR_SCHEMA, model: 'opus', agentType: 'general-purpose' }),
  async (tr, it) => {
    if (!tr) return { id: it.id, status: 'translate_failed' }
    let current = tr
    let review = null
    const rounds = []
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      review = await agent(reviewerPrompt(inputPath, it.id, it.has_figure, current), { label: `rev:${it.id}#${round}`, phase: 'Review', schema: REVIEW_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:code-reviewer' })
      rounds.push(review?.verdict ?? 'null')
      if (!review || review.verdict === 'PASS') break
      if (round === MAX_ROUNDS) break
      const fb = [
        `verdict=${review.verdict}`,
        ...Object.entries(review.checks || {}).filter(([, v]) => !v).map(([k]) => `check FAIL: ${k}`),
        ...(review.issues || []).map((i) => `[${i.severity}/${i.lang}]: ${i.detail_jp}`),
        review.recommendation_jp ? `推奨: ${review.recommendation_jp}` : '',
      ].filter(Boolean).join('\n')
      log(`repair ${it.id} round ${round} (${review.verdict})`)
      const retr = await agent(translatorPrompt(inputPath, it.id, fb), { label: `retr:${it.id}#${round}`, phase: 'Translate', schema: TR_SCHEMA, model: 'opus', agentType: 'general-purpose' })
      if (!retr) break
      current = retr
    }
    return { id: it.id, verdict: review?.verdict ?? 'null', rounds, has_figure: it.has_figure }
  },
)

const clean = results.filter(Boolean)
const byVerdict = clean.reduce((m, r) => { m[r.verdict ?? r.status] = (m[r.verdict ?? r.status] || 0) + 1; return m }, {})
log(`翻訳完了 ${clean.length}/${items.length}: ${JSON.stringify(byVerdict)}`)
return { exam_id: parsed.exam_id, total: items.length, done: clean.length, byVerdict, results: clean }
