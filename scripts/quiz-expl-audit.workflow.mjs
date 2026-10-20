export const meta = {
  name: 'quiz-expl-audit',
  description: 'Quiz 解説監査 (batched): quiz-phase2-ruleA と同じ核験観点・AUDIT_SCHEMA を batch_size 題ずつ 1 agent で回す安価版。正解理由+誤答説明+訳忠実度+key-guard 妥当性を独立核験',
  phases: [
    { title: 'Audit', detail: 'batch_size 題 (既定 5) を 1 critic が担当 (model は args.model、既定 sonnet)。figure 問は図と原典ページを Read' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// S130。核験内容は scripts/quiz-phase2-ruleA.workflow.mjs と同じ (AUDIT_SCHEMA・観点・agentType)。
// 構造は scripts/quiz-tr-fidelity.workflow.mjs と同じ:
//   - 各 batch は prep (scripts/quiz-expl-audit-prep-S130.mjs --batch-size K) が書いた小 manifest
//     `<batch_dir>/batch_NNN.json` だけを読む。分割順は prep と同じ (ids 順に batch_size 件ずつ)。
//   - 各 agent は題ごとに `parts_dir/<id>.json` を Write し、StructuredOutput でも同じ JSON を返す。
// figure 問の判定は manifest の has_figure で agent 側が行う (exam_sets 入力でも図の要否を落とさないため)。
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_SCHEMA = {
  type: 'object', required: ['id', 'accurate', 'severity', 'checks', 'issues'], additionalProperties: false,
  properties: {
    id: { type: 'string' },
    accurate: { type: 'boolean', description: '全体として解説が正しく忠実か (誤った正解根拠/誤答説明の誤り/捏造/訳ズレなし)' },
    severity: { type: 'string', enum: ['none', 'low', 'medium', 'high'], description: '最悪 issue の深刻度' },
    checks: {
      type: 'object', required: ['correct_sound', 'distractors_sound', 'translation_faithful', 'key_guard_valid'], additionalProperties: false,
      properties: {
        correct_sound: { type: 'boolean', description: '正解理由が図/論理から妥当 (keyed answer を正しく正当化)' },
        distractors_sound: { type: 'boolean', description: '各誤答肢の「なぜ誤り」説明が妥当 (3肢=正解以外)' },
        translation_faithful: { type: 'boolean', description: 'zh/en が JP 解説に忠実・本土 zh・用語整合' },
        key_guard_valid: { type: 'boolean', description: 'key_guard (suspect 判定) が図と照らして妥当 — 図と矛盾の見落とし(=false suspect=false) も誤検出(=不要 suspect)もない' },
      },
    },
    independent_answer: { type: 'string', description: 'あなたが図/stem から独立に導出した正解字母 (検算)' },
    issues: { type: 'array', items: { type: 'object', required: ['lang', 'severity', 'detail_jp'], additionalProperties: false, properties: { lang: { type: 'string', enum: ['zh', 'en', 'jp', 'both'] }, severity: { type: 'string', enum: ['low', 'medium', 'high'] }, detail_jp: { type: 'string' } } } },
  },
}

const BATCH_SCHEMA = {
  type: 'object',
  required: ['audits'],
  additionalProperties: false,
  properties: { audits: { type: 'array', items: AUDIT_SCHEMA, description: '担当した題 1 つにつき 1 要素 (manifest の samples と同じ順)' } },
}

function auditPrompt(inputPath, ids, partsDir) {
  const many = ids.length > 1
  const which = many
    ? `samples[] の**全エントリ** (${ids.length} 題: ${ids.join(', ')}) を 1 題ずつ独立に核験してください。題どうしの判定を混ぜないこと`
    : `samples[] の中から id==="${ids[0]}" のエントリを取得してください`
  const finish = many
    ? `1. 各題について、StructuredOutput の audits[] に入れるのと**完全に同一の JSON オブジェクト** (AUDIT 1 題分) を \`${partsDir}/<id>.json\` に Write する (例: \`${partsDir}/${ids[0]}.json\`。親ディレクトリが無ければ作る)。題ごとに 1 ファイル、計 ${ids.length} ファイル。内容は 1 文字も変えない。
2. StructuredOutput で {audits: [各題の AUDIT, …]} を返す (${ids.length} 要素、順序は manifest どおり)。`
    : `1. StructuredOutput で返すのと**完全に同一の JSON オブジェクト**を \`${partsDir}/${ids[0]}.json\` に Write する (親ディレクトリが無ければ作る)。内容は 1 文字も変えない。
2. StructuredOutput で AUDIT_SCHEMA に従って返す。`
  return `あなたは独立した解説監査者 (Rule A 意味抽検) です。過去問**解説**の正しさを、執筆者・前段レビュアーとは独立に批判的に核験します。甘く通さない。

## 入力
\`${inputPath}\` を Read し、${which}。各エントリ: stem_jp / choices_jp / correct_answer / has_figure / figure_png / choice_figure_pngs / figure_page_png / question_page_png / explanation{key_guard, correct{jp,zh,en}, distractors{字母:{jp,zh,en}}, points[{jp,zh,en}]}。

## 図 (題ごとに判断)
- **has_figure=true の題**: \`figure_png\` (裁剪図、null のこともある) と \`figure_page_png\` (原典フルページ=権威、crop は端で列欠落しうる) の**両方**を **Read** する。\`choice_figure_pngs\` が null でなければ各肢の図 (ア〜エ) も全て Read する。\`question_page_png\` が null でなければ (図と設問が別ページ) それも Read する。正解理由・誤答説明が図の数値/項目と一致するか、key_guard の評価が図と照らして妥当か核験。図の値は自分で読み直す (単一の読みは低解像度数字を誤読しうる — 拡大して確認)。
- **has_figure=false の題**: stem/論理から正解理由・誤答説明が妥当か核験。

## 核験観点
1. correct_sound: explanation.correct.jp が stored correct_answer を図/論理から妥当に正当化しているか (誤った根拠・図と不一致な数値でないか)。**まず自分で正解を独立導出** (independent_answer) し、解説の根拠と照合。
2. distractors_sound: 正解以外の3肢の「なぜ誤り」説明が各々妥当か (誤った理由付けでないか)。
3. translation_faithful: correct/distractors/points の zh/en が jp に忠実・本土 zh (日式借词でない)・用語整合。
4. key_guard_valid: key_guard が図と照らして妥当か。**特に suspect=false なのに図と矛盾 (見落とし) があれば key_guard_valid=false**。逆に不要な suspect=true も指摘。

accurate=全体として解説が正しく忠実か。severity=最悪 issue。independent_answer=あなたの独立導出字母。issues は lang+severity+detail_jp。

## 最後に (必須、2 つとも行うこと)
${finish}`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
// ids の与え方: ids[] > items[{id}] (quiz-phase2-ruleA と同形) > exam_sets [[exam_id, 除外 qnum[]], …] (q001〜q100 から除外分を除いた昇順)。
const ids = parsed?.ids ?? (Array.isArray(parsed?.items) ? parsed.items.map((it) => it.id) : undefined) ?? (Array.isArray(parsed?.exam_sets)
  ? parsed.exam_sets.flatMap(([e, skip]) => Array.from({ length: 100 }, (_, i) => i + 1)
    .filter((n) => !(skip ?? []).includes(n)).map((n) => `${e}-q${String(n).padStart(3, '0')}`))
  : undefined)
if (!inputPath || !Array.isArray(ids) || !ids.length) throw new Error('need {input_path, ids:[...]} or items / exam_sets')
if (ids.some((id) => typeof id !== 'string' || !/^\d{4}[a-z0-9]+-q\d{3}$/.test(id))) throw new Error('ids must be question ids like "2026r08-q070"')
const agentType = parsed?.agent_type ?? 'pr-review-toolkit:code-reviewer'
const model = parsed?.model ?? 'sonnet'
const label = parsed?.label ?? 'eaudit'
// Write は絶対パスを要求する。workflow 脚本に cwd/fs は無いので ROOT を直書きする (quiz-tr-fidelity と同じ)。
const ROOT = '/Volumes/DevSSD/Project/IT-Passport-Learning'
const absolutize = (p) => (p && p.startsWith('/') ? p : `${ROOT}/${p}`)
const partsDir = absolutize(parsed?.parts_dir ?? `data/ip/quiz/.phase2/eaudit_parts/${label}`)
const batchSize = Math.max(1, Number(parsed?.batch_size ?? 5))
const batchDir = parsed?.batch_dir ? absolutize(parsed.batch_dir) : null
if (batchSize > 1 && !batchDir) throw new Error('batch_size > 1 needs batch_dir (run quiz-expl-audit-prep-S130.mjs --batch-size)')
const batches = []
for (let i = 0; i < ids.length; i += batchSize) batches.push(ids.slice(i, i + batchSize))
const fileOf = (k) => (batchDir ? `${batchDir}/batch_${String(k + 1).padStart(3, '0')}.json` : absolutize(inputPath))

const results = await parallel(
  batches.map((b, k) => () => agent(auditPrompt(fileOf(k), b, partsDir), {
    label: b.length > 1 ? `audit:b${k + 1}:${b[0]}…` : `audit:${b[0]}`, phase: 'Audit',
    schema: b.length > 1 ? BATCH_SCHEMA : AUDIT_SCHEMA, model, agentType,
  })),
)
const want = new Set(ids)
const clean = results.filter(Boolean).flatMap((r) => (Array.isArray(r.audits) ? r.audits : [r])).filter((a) => a && want.has(a.id))

const accurate = clean.filter((a) => a.accurate).length
const bySeverity = clean.reduce((m, a) => { m[a.severity] = (m[a.severity] || 0) + 1; return m }, {})
const keyGuardMismatch = clean.filter((a) => a.checks && a.checks.key_guard_valid === false).map((a) => a.id)
const missing = ids.filter((id) => !clean.some((a) => a.id === id))
log(`解説監査 (${label}, ${model}, batch ${batchSize}): ${clean.length}/${ids.length} 題、accurate ${accurate}/${clean.length}, severity ${JSON.stringify(bySeverity)}, key_guard_invalid ${keyGuardMismatch.length}, missing ${missing.length}`)
log(`part file: ${partsDir}/`)
return { label, model, batch_size: batchSize, agents: batches.length, n: clean.length, missing, accurate, bySeverity, keyGuardMismatch, parts_dir: partsDir, audits: clean }
