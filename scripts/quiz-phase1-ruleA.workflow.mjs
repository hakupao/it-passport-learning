export const meta = {
  name: 'quiz-phase1-ruleA',
  description: 'Quiz Phase 1 Rule A: 翻訳サイドカーの N-sample 独立意味抽検 (critic = writer/in-pipeline reviewer と別 subagent_type)。忠実度+用語+clean stem を核験',
  phases: [
    { title: 'Audit', detail: 'critic(opus) が JP源 vs 翻訳を独立核験' },
  ],
}

const AUDIT_SCHEMA = {
  type: 'object', required: ['id', 'accurate', 'severity', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    accurate: { type: 'boolean', description: '全体として翻訳が JP に忠実か (誤訳/脱落/捏造/正誤判定変化なし)' },
    severity: { type: 'string', enum: ['none', 'low', 'medium', 'high'], description: '最悪 issue の深刻度' },
    checks: {
      type: 'object', required: ['faithful_zh', 'faithful_en', 'terminology_ok', 'clean_stem_faithful'], additionalProperties: false,
      properties: {
        faithful_zh: { type: 'boolean' },
        faithful_en: { type: 'boolean' },
        terminology_ok: { type: 'boolean', description: '専門用語が適切・glossary 整合・本土 zh' },
        clean_stem_faithful: { type: 'boolean', description: 'stem_jp_clean 有: OCR 誤りのみ修正で意味保持 / 無: true' },
      },
    },
    issues: { type: 'array', items: { type: 'object', required: ['lang', 'severity', 'detail_jp'], additionalProperties: false, properties: { lang: { type: 'string', enum: ['zh', 'en', 'jp', 'both'] }, severity: { type: 'string', enum: ['low', 'medium', 'high'] }, detail_jp: { type: 'string' } } } },
  },
}

function auditPrompt(inputPath, sidecarPath, id, hasFigure) {
  const figureNote = hasFigure
    ? `\nこの問は figure 問。input エントリの \`figure_png\` (裁剪図) と \`figure_page_png\` (原典フルページ=権威、crop は端でヘッダ/列が欠落しうる) の**両方**を **Read**。stem_jp_clean が図を正として OCR garble/破損表を除去・再構成し、フルページ上の図の数値・項目・表の列構成 (脱落/列順改変なし) と一致しているか核験 (clean_stem_faithful)。`
    : `\nfigure無し問。translation に stem_jp_clean があれば OCR 誤字のみ修正で意味保持か核験 (無ければ clean_stem_faithful=true)。`
  return `あなたは独立した翻訳監査者 (Rule A 意味抽検) です。過去問 JP→zh/en 翻訳の忠実度を、翻訳者・前段レビュアーとは独立に批判的に核験します。甘く通さない。

## 入力 (両方 Read して id="${id}" のデータを取得)
1. **JP 源 (正)**: \`${inputPath}\` の questions[] 中 id==="${id}" のエントリ (stem_jp / choices_jp / correct_answer / has_figure / figure_png / glossary)。
2. **翻訳 (検証対象)**: \`${sidecarPath}\` の questions["${id}"] (stem_jp_clean? / stem{zh,en} / choices{ア..エ:{zh,en}})。
${figureNote}

## 核験観点
1. faithful_zh / faithful_en: zh/en が JP の意味を正確に保持。脱落・誤訳・逆転がないか。**特に正解 (correct_answer) の根拠が変わらないか** (選択肢の訳ミスで正誤が崩れないか)。
2. terminology_ok: 専門用語が適切・自然・本土 zh (日式借词でない)、glossary 整合。
3. clean_stem_faithful: stem_jp_clean が (figure問) 図と一致 / (非figure) OCR 誤りのみ修正で数値・論理・選択肢ラベル保持 (内容追加・改変なし)。

accurate=全体忠実か。severity=最悪 issue。issues は lang+severity+detail_jp。StructuredOutput で AUDIT_SCHEMA に従い返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const sidecarPath = parsed?.sidecar_path
const items = parsed?.items ?? [] // [{id, has_figure}]
if (!inputPath || !sidecarPath || !Array.isArray(items) || !items.length) throw new Error('need {input_path, sidecar_path, items:[{id,has_figure}]}')

const audits = await parallel(
  items.map((it) => () => agent(auditPrompt(inputPath, sidecarPath, it.id, it.has_figure), { label: `audit:${it.id}`, phase: 'Audit', schema: AUDIT_SCHEMA, model: 'opus', agentType: 'oh-my-claudecode:critic' })),
)

const clean = audits.filter(Boolean)
const accurate = clean.filter((a) => a.accurate).length
const bySeverity = clean.reduce((m, a) => { m[a.severity] = (m[a.severity] || 0) + 1; return m }, {})
log(`Rule A 監査完了: accurate ${accurate}/${clean.length}, severity ${JSON.stringify(bySeverity)}`)
return { n: clean.length, accurate, bySeverity, audits: clean }
