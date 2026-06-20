export const meta = {
  name: 'audit-stem',
  description: 'Pre-Phase-2 stem-quality audit: is each DISPLAYED stem a faithful representation of the question? figure Q checked vs the figure; non-figure Q checked vs its original-OCR backup + answer-derivability. Flags MEANING-CHANGING corruption; adversarially verifies flags.',
  phases: [
    { title: 'Audit', detail: 'one agent per question: figure Q vs figure / non-figure Q vs backup + derivability' },
    { title: 'Verify', detail: 'independent skeptical critics re-check flagged/uncertain/control items' },
  ],
}

const VERDICTS = ['CLEAN', 'BAD_STEM', 'COSMETIC_ONLY', 'UNCERTAIN']
const AUDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['id', 'stem_legible', 'ground_truth', 'faithful', 'affects_answer', 'verdict', 'confidence', 'finding'],
  properties: {
    id: { type: 'string' },
    stem_legible: { type: 'boolean' },
    ground_truth: { type: 'string', enum: ['figure', 'backup', 'derivability', 'none'], description: '何を基準に faithful 判定したか' },
    faithful: { type: 'boolean', description: 'displayed stem が問題を忠実に表しているか (figure/backup の意味を保持し、keyed answer を支持)' },
    affects_answer: { type: 'boolean', description: '腐敗がある場合、問の意図/正解解釈を変えるか (true=meaning-changing)' },
    verdict: { type: 'string', enum: VERDICTS },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    finding: { type: 'string', description: '具体: figure問=stem が図とどう食い違うか / 非figure問=repair が backup から何を脱落/改変したか (例: 条件語「あと」脱落)。clean なら「忠実」と一言' },
    derived_answer: { type: 'string', description: 'stem+図/choices から自分で導いた正解字母 (検算、任意)' },
  },
}
const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['id', 'agrees_bad', 'verifier_verdict', 'confidence', 'reasoning'],
  properties: {
    id: { type: 'string' },
    agrees_bad: { type: 'boolean', description: 'auditor の BAD_STEM 判定に独立に同意するか' },
    verifier_verdict: { type: 'string', enum: VERDICTS },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning: { type: 'string' },
  },
}

const LESSON = `背景 (pilot q034/q066 の教訓): ① s7x の OCR 修復が、garble 数字を直す過程で**意味を担う語を脱落/改変**しうる (q034: 「少なくとも**あと**何個」→「少なくともいくつ」に化け、追加数↔総数が反転し正解が変わった)。元 OCR (backup) を見ると脱落語が分かる。② figure 問で Phase 1 が clean stem を作らなかった場合、表示 stem (raw 表) が**図と食い違う** (q066: 行が scramble)。**figure/backup が真相源**。単一の読みは低解像度や思い込みで誤りうる — 具体的な語/値を引用し、自信が無ければ UNCERTAIN。`

function auditPrompt(it) {
  if (it.has_figure) {
    return `あなたは IT パスポート過去問の**設問文 (stem) 品質**を監査します。この figure 問の「表示用 stem」が**図に忠実**かを核験。

${LESSON}

## 画像を Read (両方)
- crop (裁剪図): ${it.crop_abs || '(none)'}
- FULL PAGE (権威、複数問あり、この問は 問${it.question_number}): ${it.page_abs || '(none)'}

## 表示用 stem (検証対象)
"""
${it.displayed_stem}
"""
${it.has_clean_stem ? '(これは Phase 1 が図から再構成した clean stem)' : '(Phase 1 未清書 = raw stem をそのまま表示。図とのズレに注意=q066 型)'}
choices: ${JSON.stringify(it.choices_jp)} / 正解(key): ${it.correct_answer}

## 判定
- 表示 stem の数値・表の行/列・条件が**図と一致**するか。図に在る行/値の脱落、scramble、図に無いデータの混入、意味を変える garble を探す。
- keyed answer が図+stem から妥当に導けるか (derived_answer)。
- verdict: CLEAN(図に忠実) / BAD_STEM(図と食い違い、意味/正解に影響=affects_answer true) / COSMETIC_ONLY(軽微 garble、意味不変) / UNCERTAIN。
- ground_truth="figure"。finding に図とのズレを具体的に。`
  }
  return `あなたは IT パスポート過去問の**設問文 (stem) 品質**を監査します。この非 figure 問の「表示用 stem」が、元 OCR から**意味を担う内容を失っていない**か、かつ **keyed answer を支持**するかを核験。

${LESSON}

## 表示用 stem (検証対象 = s7x 修復後)
"""
${it.displayed_stem}
"""
## 元 OCR backup (修復前、garble 含む)${it.stem_corrupted_backup ? '' : ' = なし'}
${it.stem_corrupted_backup ? `"""\n${it.stem_corrupted_backup}\n"""` : '(backup 無し。stem 内部の整合性と keyed answer 支持性で判定)'}
choices: ${JSON.stringify(it.choices_jp)} / 正解(key): ${it.correct_answer}

## 判定
- backup と表示 stem を比較し、**修復が意味を担う内容を脱落/改変したか**を探す: 条件語 (あと/以前/以下/最も/少なくとも/を除く 等)、数値、節、否定。**backup の garble 文字 (数字化け等) 自体は欠陥でない** — 修復が直すべきもの。着目は「意味の脱落/反転」。
- keyed answer が表示 stem + choices から妥当に導けるか (derived_answer)。stem が答えを支持しないなら腐敗の疑い。
- verdict: CLEAN / BAD_STEM(意味変化、affects_answer) / COSMETIC_ONLY / UNCERTAIN。
- ground_truth = backup があれば "backup"、無ければ "derivability"。finding に脱落/改変を具体的に。`
}

function verifyPrompt(it, audit, lens) {
  const imgs = it.has_figure ? `\n図を Read: crop ${it.crop_abs || '(none)'} / FULL PAGE ${it.page_abs || '(none)'} (問${it.question_number})。` : ''
  return `独立した懐疑的検証者です。stem 品質監査の BAD/UNCERTAIN 判定を、自分で一から再核験します。${lens}

${LESSON}

auditor 判定: verdict=${audit.verdict} (conf ${audit.confidence}) / finding: ${audit.finding}
${imgs}
## 表示用 stem
"""
${it.displayed_stem}
"""
${it.has_figure ? '' : `## 元 OCR backup\n${it.stem_corrupted_backup ? '"""\n' + it.stem_corrupted_backup + '\n"""' : '(なし)'}`}
choices: ${JSON.stringify(it.choices_jp)} / key: ${it.correct_answer}

意味を変える腐敗 (figure 問=図とのズレ / 非figure=backup からの意味脱落) が**明確**な場合のみ BAD_STEM。低解像度の数字や cosmetic garble を過剰に BAD としない。verifier_verdict + agrees_bad + reasoning (具体的な語/値を引用) を返す。`
}
const LENS_RECHECK = 'LENS: 図/backup を自分で読み直し、auditor の指摘語/値が本当にズレているか一次確認。'
const LENS_STEELMAN = 'LENS: 表示 stem を最も善意に読み、意味変化が無いと言えないか (=CLEAN を steelman)。それでも崩れる時のみ BAD_STEM。'

const items = (args && args.items) || []
log(`stem audit: ${items.length} items`)

const records = await pipeline(
  items,
  (it) => agent(auditPrompt(it), { label: `audit:${it.id}`, phase: 'Audit', agentType: 'general-purpose', schema: AUDIT_SCHEMA }),
  async (audit, it, index) => {
    if (!audit) return { id: it.id, role: it.role, stratum: it.stratum, control_expect: it.control_expect || null, audit: null, verifiers: [], final_status: 'AUDIT_FAILED' }
    const force = it.role !== 'rate'
    const run = (lens) => agent(verifyPrompt(it, audit, lens), { label: `verify:${it.id}`, phase: 'Verify', agentType: 'oh-my-claudecode:critic', schema: VERIFY_SCHEMA })
    let verifiers = []
    if (audit.verdict === 'BAD_STEM') verifiers = (await parallel([() => run(LENS_RECHECK), () => run(LENS_STEELMAN)])).filter(Boolean)
    else if (audit.verdict === 'UNCERTAIN') verifiers = (await parallel([() => run(LENS_RECHECK)])).filter(Boolean)
    else if (audit.verdict === 'CLEAN' && (force || index % 4 === 0)) verifiers = (await parallel([() => run(LENS_RECHECK)])).filter(Boolean)
    else if (audit.verdict === 'COSMETIC_ONLY' && force) verifiers = (await parallel([() => run(LENS_RECHECK)])).filter(Boolean)

    const vBad = verifiers.filter((v) => v.verifier_verdict === 'BAD_STEM').length
    const vClean = verifiers.filter((v) => v.verifier_verdict === 'CLEAN').length
    let final_status
    if (audit.verdict === 'BAD_STEM') {
      if (vBad >= 2) final_status = 'CONFIRMED_BAD_STEM'
      else if (vBad === 1) final_status = 'DISPUTED_BAD_STEM'
      else final_status = 'CLEAN_AUDITOR_FALSE_POSITIVE'
    } else if (audit.verdict === 'UNCERTAIN') {
      final_status = vBad >= 1 ? 'DISPUTED_BAD_STEM' : 'UNCERTAIN'
    } else if (audit.verdict === 'COSMETIC_ONLY') {
      final_status = vBad >= 1 ? 'DISPUTED_BAD_STEM' : 'COSMETIC_ONLY'
    } else {
      if (verifiers.length === 0) final_status = 'CLEAN_SINGLE_PASS'
      else if (vBad >= 1) final_status = 'DISPUTED_BAD_STEM'
      else final_status = 'CLEAN_VERIFIED'
    }
    return { id: it.id, role: it.role, stratum: it.stratum, has_figure: it.has_figure, control_expect: it.control_expect || null, audit, verifiers, final_status }
  },
)

const ok = records.filter(Boolean)
const rate = ok.filter((r) => r.role === 'rate')
const tally = (arr) => arr.reduce((m, r) => ((m[r.final_status] = (m[r.final_status] || 0) + 1), m), {})
const summary = {
  total: ok.length,
  rate_n: rate.length,
  rate_by_status: tally(rate),
  rate_by_stratum_bad: rate.filter((r) => r.final_status === 'CONFIRMED_BAD_STEM').reduce((m, r) => ((m[r.stratum] = (m[r.stratum] || 0) + 1), m), {}),
  confirmed_bad: rate.filter((r) => r.final_status === 'CONFIRMED_BAD_STEM').length,
  disputed: rate.filter((r) => r.final_status.startsWith('DISPUTED')).map((r) => r.id),
  controls: ok.filter((r) => r.role === 'control').map((r) => ({ id: r.id, expect: r.control_expect, got: r.final_status, audit: r.audit?.verdict })),
}
log(`stem audit done: ${JSON.stringify(summary.rate_by_status)}; confirmed_bad=${summary.confirmed_bad}; controls=${JSON.stringify(summary.controls)}`)
return { summary, records: ok }
