export const meta = {
  name: 'quiz-phase2-generate',
  description: 'Quiz Phase 2 (D-137): 過去問の解析 (正解理由+各誤答why-wrong+要点) を JP 先生成→翻訳。key-guard 内蔵 (図から正解を独立導出し keyed answer と照合、不一致=suspect だが照常生成)。writer(general-purpose)≠reviewer(code-reviewer) 写審分離 (Rule D)',
  phases: [
    { title: 'Generate', detail: 'general-purpose(opus): 図/stem から正解を独立導出(key-guard)し JP 解析を生成' },
    { title: 'Review', detail: 'code-reviewer(opus): JP 解析の妥当性+key-guard 誠実性核験 + repair≤2' },
    { title: 'Translate', detail: 'general-purpose(opus): JP 解析→zh/en (既存訳+glossary で用語一致)' },
    { title: 'TR-Review', detail: 'code-reviewer(opus): 訳忠実度核験 + repair≤2' },
    { title: 'Persist', detail: 'generate_result_<exam>.json を自己書込 (merge の権威 key_guard 源、S100 手動手順を turnkey 化)' },
  ],
}

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const jpPath = (id) => `${ROOT}/data/ip/quiz/.phase2/expl_jp_${id}.json`
const trPath = (id) => `${ROOT}/data/ip/quiz/.phase2/expl_tr_${id}.json`
const resultPath = (exam) => `${ROOT}/data/ip/quiz/.phase2/generate_result_${exam}.json`

const ZH_POLICY = `**zh は中国本土の標準 IT 用語を使い、日式借词を避ける** (成果物→交付物、妥当性確認→确认[验证=verification と対]、稼働→运行、解約→退订 等)。意味だけでなく本土読者に自然な語形を選ぶ。`
// JSON 直列化の安全策 (S94 q091 / S97 q082 教訓): 文字列値の中で生の ASCII 二重引用符 " を使うと
// ファイル Write 時に JSON が壊れる。引用が必要なら全角「」/『』/“” を使う。
const JSON_SAFE = `**JSON 安全**: 出力する文字列の中で生の半角二重引用符 " を使わない (引用は「」/“” で囲む)。半角 " は JSON を壊す。`

const LETTER_ENUM = ['ア', 'イ', 'ウ', 'エ']
const KEY_GUARD = {
  type: 'object', required: ['figure_derivable', 'derived_answer', 'matches_key', 'stem_corruption_suspected', 'note_jp'], additionalProperties: false,
  properties: {
    figure_derivable: { type: 'boolean', description: '正解を図/stem だけから確信を持って導出できるか (概念問で図が例示のみ・源データ欠落なら false)' },
    derived_answer: { type: 'string', enum: [...LETTER_ENUM, 'unsure'], description: 'あなたが図/stem から独立に導出した正解字母 (keyed answer を見る前に決める)' },
    matches_key: { type: 'boolean', description: 'derived_answer が stored correct_answer と一致するか' },
    stem_corruption_suspected: { type: 'boolean', description: 'stem の文言が源/図/選択肢/答えと矛盾し s7x/OCR 腐敗が疑われるか。**答えに影響しない cosmetic な腐敗 (例: 設問が「何分」だが選択肢は「%」、語句脱落) も true**。true なら note_jp に「腐敗箇所」と「正しい文言の推定」を明記' },
    note_jp: { type: 'string', description: '不一致/導出不可/stem 腐敗なら理由と (腐敗時は) 正しい文言の推定。一致なら簡潔に導出根拠' },
  },
}
const EXPL_JP_SCHEMA = {
  type: 'object', required: ['id', 'key_guard', 'correct_jp', 'distractors_jp', 'points_jp'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    key_guard: KEY_GUARD,
    correct_jp: { type: 'string', description: 'keyed answer がなぜ正しいか (図/論理から導出、学習者向けに簡潔明快)' },
    distractors_jp: {
      type: 'array', minItems: 3, maxItems: 3,
      items: { type: 'object', required: ['letter', 'why_wrong_jp'], additionalProperties: false, properties: { letter: { type: 'string', enum: LETTER_ENUM }, why_wrong_jp: { type: 'string' } } },
      description: '正解以外の3字母それぞれが、なぜ誤りか',
    },
    points_jp: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string' }, description: '1-2個の考点要点 (この問が問う核心知識)' },
  },
}
const JP_REVIEW_SCHEMA = {
  type: 'object', required: ['id', 'verdict', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object', required: ['correct_sound', 'distractors_covered', 'points_relevant', 'key_guard_honest', 'no_fabrication'], additionalProperties: false,
      properties: {
        correct_sound: { type: 'boolean', description: '正解理由が図/論理から妥当 (keyed answer 前提で筋が通る)' },
        distractors_covered: { type: 'boolean', description: '正解以外の3肢が全て正しく「なぜ誤り」説明されている (letter が正解以外の3つ)' },
        points_relevant: { type: 'boolean', description: '要点が問の考点に合致' },
        key_guard_honest: { type: 'boolean', description: 'key_guard が実際に図/stem を見た妥当な評価か (derived/matches/derivable が筋が通る、安易な matches_key=true でない)' },
        no_fabrication: { type: 'boolean', description: '図/源に無い数値・事実の捏造がない' },
      },
    },
    issues: { type: 'array', items: { type: 'object', required: ['severity', 'detail_jp'], additionalProperties: false, properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, detail_jp: { type: 'string' } } } },
    recommendation_jp: { type: 'string' },
  },
}
const EXPL_TR_SCHEMA = {
  type: 'object', required: ['id', 'correct', 'distractors', 'points'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    correct: { type: 'object', required: ['zh', 'en'], additionalProperties: false, properties: { zh: { type: 'string' }, en: { type: 'string' } } },
    distractors: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', required: ['letter', 'zh', 'en'], additionalProperties: false, properties: { letter: { type: 'string', enum: LETTER_ENUM }, zh: { type: 'string' }, en: { type: 'string' } } } },
    points: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'object', required: ['zh', 'en'], additionalProperties: false, properties: { zh: { type: 'string' }, en: { type: 'string' } } } },
  },
}
const TR_REVIEW_SCHEMA = {
  type: 'object', required: ['id', 'verdict', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['PASS', 'CONCERNS', 'FAIL'] },
    checks: {
      type: 'object', required: ['completeness', 'meaning_faithful', 'terminology_correct', 'no_drift'], additionalProperties: false,
      properties: {
        completeness: { type: 'boolean', description: 'correct+3 distractors+全 points に zh/en があり非空' },
        meaning_faithful: { type: 'boolean', description: 'zh/en が JP 解析の意味を正確に保持' },
        terminology_correct: { type: 'boolean', description: '専門用語が適切・glossary/既存訳と整合・本土 zh' },
        no_drift: { type: 'boolean', description: 'JP に無い情報の追加や改変がない' },
      },
    },
    issues: { type: 'array', items: { type: 'object', required: ['severity', 'lang', 'detail_jp'], additionalProperties: false, properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, lang: { type: 'string', enum: ['zh', 'en', 'both'] }, detail_jp: { type: 'string' } } } },
    recommendation_jp: { type: 'string' },
  },
}

function entryRef(inputPath, id) {
  return `対象問題のデータは \`${inputPath}\` の questions[] 中で **id === "${id}"** のエントリ。`
}

function jpGenPrompt(inputPath, id, feedback) {
  return `あなたは IT パスポート過去問の**解説 (解析) 執筆者**です。1 問の日本語解説を生成します。

## 入力
${entryRef(inputPath, id)} まず Read し、id="${id}" のエントリ (stem_jp / stem_jp_clean / choices_jp / correct_answer / has_figure / figure_png / figure_page_png / glossary) を取得。**stem_jp_clean があればそれを正とする** (OCR 除去済)。

## STEP 1 — key-guard (解説を書く前に、正解を独立導出)
- **has_figure=true**: \`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ=権威、crop は端で列欠落しうる) の**両方**を **Read**。
- 図/stem の情報だけから、**自分で正解を導出**せよ (計算問は計算、グラフ/図問はどの選択肢が図と整合するか)。stored \`correct_answer\` に引きずられず、まず白紙で解く。
- \`key_guard\` を出力: figure_derivable / derived_answer (あなたの導出字母) / matches_key (derived == correct_answer か) / note_jp (導出根拠、不一致なら図の何がそう言うか)。
- **重要 (D-137-C)**: matches_key=false でも、解説は **stored correct_answer (公式キー) 前提**で書く (suspect として後で人間が裁決する)。安易に matches_key=true としない — 図を実際に見て誠実に評価せよ。
- **STEM-CORRUPTION GUARD (最重要・D-小)**: stem は**書かれているとおり (literal)** に解釈せよ。入力に \`stem_jp_clean\` が無ければ \`stem_jp\` が唯一の正。**存在しない \`stem_jp_clean\` を仮定・捏造してはならない**。stored key を成立させるために stem の文言を読み替える/言葉を補う/「OCR 誤りだろう」と勝手に訂正する必要を感じたら、それは **stem 自体の腐敗 (s7x/OCR) の疑い**だ → **\`stem_corruption_suspected=true\`** とし、note_jp に「stem のどの語が源/図/選択肢/答えと矛盾するか」+「正しい文言の推定」を明記せよ (例: 設問が『いくつ』だが答えは『あと何個』前提 / 設問が『何分』だが選択肢は『%』)。
  - 腐敗が**答えを左右する**なら **matches_key=false** にもせよ (人間が裁決)。腐敗が **cosmetic で答えが一意**なら matches_key は実際の一致を反映 (true でよい) が、**\`stem_corruption_suspected=true\` は必ず立てる** (人間が表示 stem を是正する契機)。黙って辻褄を合わせるな。

## STEP 2 — 解説生成 (標準 schema, D-137-A)
- **correct_jp**: stored correct_answer (=「${id} の正解」) がなぜ正しいか。図/数値/論理から根拠を示し、学習者に簡潔明快に。
- **distractors_jp**: 正解以外の**3つ**の字母それぞれ、なぜ誤りか (letter を正しく付す。正解字母は含めない)。
- **points_jp**: この問が問う考点の要点 1-2 個 (用語の定義・公式・考え方)。
- 用語は glossary の訳語概念に沿った標準 IT パスポート用語。図/源に無い数値・事実を捏造しない。

## 出力
1. EXPL_JP_SCHEMA と同形の JSON を \`${jpPath(id)}\` に Write。${JSON_SAFE}
2. 同じ内容を StructuredOutput で返す。
${feedback ? `\n## 前ラウンドの Rule D 指摘 (是正は check FAIL + high/medium に限定、low 示唆は語義検証なしに採用しない)\n${feedback}\n` : ''}`
}

function jpReviewerPrompt(inputPath, id, hasFigure, jp) {
  const figureNote = hasFigure
    ? `\n**figure問**: \`figure_png\` と \`figure_page_png\` (権威) の両方を Read し、correct_jp の根拠とした図の数値・項目が図と一致するか、key_guard の評価 (derived_answer/matches_key/figure_derivable) が図と照らして筋が通るか核験。`
    : `\nfigure無し問。stem/論理から correct_jp の根拠が妥当か核験。`
  return `あなたは独立した解説検証者 (Rule D: 執筆者と別役割) です。JP 解説の妥当性を批判的に核験します。甘く通さない。

## 入力 (正)
${entryRef(inputPath, id)} Read して stem_jp(_clean) / choices_jp / correct_answer / glossary を取得。
${figureNote}

## 解説 (検証対象)
\`\`\`json
${JSON.stringify(jp).slice(0, 8000)}
\`\`\`

## 検査 (checks)
1. correct_sound: correct_jp が stored correct_answer を図/論理から妥当に正当化 (誤った根拠でないか)。
2. distractors_covered: 正解以外の**3肢**が全て正しく「なぜ誤り」説明されている (letter が正解以外の3つで過不足なし)。
3. points_relevant: 要点が考点に合致。
4. key_guard_honest: key_guard が実際に図/stem を見た誠実な評価か (安易な matches_key=true や、明らかな不一致の見落としがない)。**特に: 存在しない stem_jp_clean を仮定したり、stem の文言を無根拠に読み替えて (例: 『いくつ』を『あと何個』、『何分』を『何%』と勝手に解釈) matches_key=true にして stem 腐敗を黙殺していないか。stem を literal に解釈した上で答えと矛盾があれば matches_key=false であるべき。**
5. no_fabrication: 図/源に無い数値・事実の捏造がない。

## verdict
- PASS: 全 check true、high issue なし。
- CONCERNS: 軽微な明瞭さ/網羅の改善余地のみ。
- FAIL: 誤った正解根拠 (high)、誤答肢の説明欠落/誤り、捏造、key_guard の不誠実 (図と矛盾を matches_key=true にした等)。

issues は severity + detail_jp。StructuredOutput で JP_REVIEW_SCHEMA に従い返す。`
}

function translatorPrompt(inputPath, id) {
  return `あなたは IT パスポート過去問**解説**の翻訳者です。確定した日本語解説を簡体字中国語(zh)と英語(en)に翻訳します。

## 入力
1. JP 解説 (翻訳対象): \`${jpPath(id)}\` を Read (correct_jp / distractors_jp[{letter,why_wrong_jp}] / points_jp[])。
2. 用語参照: ${entryRef(inputPath, id)} Read して glossary と **tr** (既存の問題文翻訳 {stem:{zh,en}, choices:{ア..エ:{zh,en}}}) を取得。**解説の用語・選択肢の言い回しは既存訳 tr と一致させる** (学習者が見る問題文と解説で用語がブレない)。

## 方針
- **忠実第一**: JP 解説の意味を正確に。情報の追加・省略・改変をしない。
- 専門用語は glossary と既存訳 tr を優先。${ZH_POLICY}
- en は平易な学習英語、zh は簡体字。distractors は letter を保持し3つ全て訳す。points は JP と同数。

## 出力
1. EXPL_TR_SCHEMA と同形の JSON を \`${trPath(id)}\` に Write (id="${id}"、correct{zh,en}、distractors[{letter,zh,en}×3]、points[{zh,en}])。${JSON_SAFE}
2. 同じ内容を StructuredOutput で返す。`
}

function trReviewerPrompt(id, jp, tr) {
  return `あなたは独立した翻訳検証者 (Rule D) です。解説 JP→zh/en 翻訳の忠実度を核験します。

## JP 源 (正)
\`\`\`json
${JSON.stringify(jp).slice(0, 6000)}
\`\`\`
## 翻訳 (検証対象)
\`\`\`json
${JSON.stringify(tr).slice(0, 6000)}
\`\`\`

## 検査
1. completeness: correct + 3 distractors + 全 points に zh/en があり非空。
2. meaning_faithful: zh/en が JP 解説の意味を正確に保持 (脱落/誤訳/逆転なし)。
3. terminology_correct: 専門用語が適切・本土 zh (日式借词でない)。
4. no_drift: JP に無い情報の追加・改変がない。

verdict = PASS / CONCERNS / FAIL。issues は severity+lang+detail_jp。StructuredOutput で TR_REVIEW_SCHEMA に従い返す。`
}

// ---- run ---------------------------------------------------------------------
const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
let items = parsed?.items // [{id, has_figure}]
// Compact spec (preferred at scale, transcription-safe): build items from
// {exam_id, count, figure_nums}. Requires contiguous zero-padded q001..qNNN ids
// (verified per-exam before launch). Explicit items[] still works (back-compat).
if ((!items || !items.length) && parsed?.exam_id && parsed?.count) {
  const figSet = new Set(parsed.figure_nums ?? [])
  items = Array.from({ length: parsed.count }, (_, i) => {
    const n = i + 1
    return { id: `${parsed.exam_id}-q${String(n).padStart(3, '0')}`, has_figure: figSet.has(n) }
  })
}
if (!inputPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, items:[{id,has_figure}]} or {input_path, exam_id, count, figure_nums}: ' + JSON.stringify(args).slice(0, 200))
const MAX_ROUNDS = 2

const fbFromReview = (review) => [
  `verdict=${review.verdict}`,
  ...Object.entries(review.checks || {}).filter(([, v]) => !v).map(([k]) => `check FAIL: ${k}`),
  ...(review.issues || []).map((i) => `[${i.severity}${i.lang ? '/' + i.lang : ''}]: ${i.detail_jp}`),
  review.recommendation_jp ? `推奨: ${review.recommendation_jp}` : '',
].filter(Boolean).join('\n')

const results = await pipeline(
  items,
  // Stage 1 — JP generation (with key-guard)
  (it) => agent(jpGenPrompt(inputPath, it.id, null), { label: `gen:${it.id}`, phase: 'Generate', schema: EXPL_JP_SCHEMA, model: 'opus', agentType: 'general-purpose' }),
  // Stage 2 — JP review-loop → translate → TR review-loop
  async (jp, it) => {
    if (!jp) return { id: it.id, status: 'gen_failed' }
    // Round-1 (pre-repair) key_guard = the HONEST blind derivation. Repair re-runs the
    // generator and can overwrite curJp.key_guard, papering over a real mismatch (the
    // generator may invent agreement). Suspect detection must therefore union round-1
    // with the final, so repair can never mask a flag (D-小 stem-corruption guard).
    const kg1 = jp.key_guard
    const isSuspect = (kgF) => !kg1?.matches_key || !kg1?.figure_derivable || !kgF?.matches_key || !kgF?.figure_derivable
    // JP review + repair
    let curJp = jp, jpReview = null
    const jpRounds = []
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      jpReview = await agent(jpReviewerPrompt(inputPath, it.id, it.has_figure, curJp), { label: `rev:${it.id}#${round}`, phase: 'Review', schema: JP_REVIEW_SCHEMA, model: 'opus', agentType: 'feature-dev:code-reviewer' })
      jpRounds.push(jpReview?.verdict ?? 'null')
      if (!jpReview || jpReview.verdict === 'PASS' || round === MAX_ROUNDS) break
      log(`jp-repair ${it.id} round ${round} (${jpReview.verdict})`)
      const regen = await agent(jpGenPrompt(inputPath, it.id, fbFromReview(jpReview)), { label: `regen:${it.id}#${round}`, phase: 'Generate', schema: EXPL_JP_SCHEMA, model: 'opus', agentType: 'general-purpose' })
      if (!regen) break
      curJp = regen
    }
    // Translate
    let curTr = await agent(translatorPrompt(inputPath, it.id), { label: `tr:${it.id}`, phase: 'Translate', schema: EXPL_TR_SCHEMA, model: 'opus', agentType: 'general-purpose' })
    if (!curTr) return { id: it.id, key_guard: curJp.key_guard, key_guard_round1: kg1, suspect: isSuspect(curJp.key_guard), jp_verdict: jpReview?.verdict ?? 'null', jp_rounds: jpRounds, status: 'translate_failed', has_figure: it.has_figure }
    // TR review + repair
    let trReview = null
    const trRounds = []
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      trReview = await agent(trReviewerPrompt(it.id, curJp, curTr), { label: `trrev:${it.id}#${round}`, phase: 'TR-Review', schema: TR_REVIEW_SCHEMA, model: 'opus', agentType: 'feature-dev:code-reviewer' })
      trRounds.push(trReview?.verdict ?? 'null')
      if (!trReview || trReview.verdict === 'PASS' || round === MAX_ROUNDS) break
      log(`tr-repair ${it.id} round ${round} (${trReview.verdict})`)
      const retr = await agent(translatorPrompt(inputPath, it.id), { label: `retr:${it.id}#${round}`, phase: 'Translate', schema: EXPL_TR_SCHEMA, model: 'opus', agentType: 'general-purpose' })
      if (!retr) break
      curTr = retr
    }
    const kg = curJp.key_guard
    return { id: it.id, key_guard: kg, key_guard_round1: kg1, suspect: isSuspect(kg), jp_verdict: jpReview?.verdict ?? 'null', tr_verdict: trReview?.verdict ?? 'null', jp_rounds: jpRounds, tr_rounds: trRounds, has_figure: it.has_figure }
  },
)

const clean = results.filter(Boolean)
const jpV = clean.reduce((m, r) => { const k = r.jp_verdict ?? r.status; m[k] = (m[k] || 0) + 1; return m }, {})
const trV = clean.reduce((m, r) => { const k = r.tr_verdict ?? r.status; m[k] = (m[k] || 0) + 1; return m }, {})
const suspects = clean.filter((r) => r.suspect).map((r) => ({ id: r.id, key_guard: r.key_guard }))
log(`Phase2 生成完了 ${clean.length}/${items.length}: jp ${JSON.stringify(jpV)} | tr ${JSON.stringify(trV)} | suspect ${suspects.length}`)

// ---- Persist generate_result (authoritative key_guard for merge) -------------
// merge.mjs REQUIRES generate_result_<exam>.json (round-1 + final key_guard for
// suspect/bad-key/stem-corruption detection). Workflow scripts have no fs, so a
// dedicated agent writes it verbatim. Payload is compact: flagged questions keep
// the full key_guard (note_jp needed for adjudication); clean questions are trimmed
// (note_jp='' — internal-only, never UI-rendered) so the file is small + reliably
// transcribable. quiz-phase2-verify-result.mjs deterministically validates it after.
phase('Persist')
const isFlagged = (r) => Boolean(r.suspect) || r.key_guard?.stem_corruption_suspected === true || r.key_guard_round1?.stem_corruption_suspected === true
const trimKg = (kg) => kg ? { figure_derivable: kg.figure_derivable ?? null, derived_answer: kg.derived_answer ?? null, matches_key: kg.matches_key ?? null, stem_corruption_suspected: kg.stem_corruption_suspected ?? false, note_jp: '' } : null
const compactResults = clean.map((r) => isFlagged(r)
  ? { id: r.id, key_guard: r.key_guard ?? null, key_guard_round1: r.key_guard_round1 ?? null, suspect: Boolean(r.suspect) }
  : { id: r.id, key_guard: trimKg(r.key_guard), key_guard_round1: trimKg(r.key_guard_round1), suspect: Boolean(r.suspect) })
const persistPayload = JSON.stringify({ exam_id: parsed.exam_id, total: items.length, done: clean.length, results: compactResults }, null, 2)
const outPath = resultPath(parsed.exam_id)
await agent(
  `あなたはデータ永続化エージェントです。**創作・要約・改変は一切しない**。以下の JSON を**バイト単位でそのまま (verbatim)** ファイル \`${outPath}\` に Write せよ。\n`
  + `- JSON 文字列を一字一句変えず、キー順・空白・エスケープも保ったまま書き込む。\n`
  + `- 末尾に改行 1 つを付けてよい。それ以外の追記・コメント・コードフェンスは禁止。\n`
  + `- 書き込んだら、書いた results の件数 (= ${compactResults.length}) を StructuredOutput で返す。\n\n`
  + '```json\n' + persistPayload + '\n```',
  { label: `persist:${parsed.exam_id}`, phase: 'Persist', agentType: 'general-purpose', schema: { type: 'object', required: ['written'], additionalProperties: false, properties: { written: { type: 'integer' }, path: { type: 'string' } } } },
)
log(`generate_result persisted → ${outPath} (${compactResults.length} results)`)

return { exam_id: parsed.exam_id, total: items.length, done: clean.length, jpVerdict: jpV, trVerdict: trV, suspects, results: clean }
