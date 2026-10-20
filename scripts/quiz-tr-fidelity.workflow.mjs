export const meta = {
  name: 'quiz-tr-fidelity',
  description: 'Quiz 訳層照合 (D-150 §4 段 3、方式 D): 源検証済の jp 表示層を正として、zh / en の stem・選択肢の意味の相違を field 単位で報告する (画像なし)',
  phases: [
    { title: 'TrFidelity', detail: 'batch_size 題 (既定 1) を 1 agent が担当。manifest の jp / zh / en を読み、jp と意味が違う訳を列挙 (model は args.model、既定 sonnet)' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// S127 A2b。構造は quiz-s7x-fidelity.workflow.mjs (⑤-2) と同じ:
//   - 各 agent が自分の結果を `parts_dir/<id>.json` に Write し、StructuredOutput でも同じ JSON を返す。
//   - workflow の return は計数 + 要約だけ。全文は `scripts/quiz-fidelity-merge-parts.mjs <parts_dir> <input> <label> <out> --journal <j>`
//     で束ねる (verdict / discrepancies[] / id の検査は同じ。source_transcript は持たない)。
//   - 入力 manifest は scripts/quiz-tr-prep-S127.mjs が作る (jp / zh / en / correct_answer / jp_history)。
// 画像は使わない: jp は ⑤-2 / A2a で源と照合済みの表示層であり、それを正とする (D-150 §4 の理由)。
// ─────────────────────────────────────────────────────────────────────────────

const KINDS = ['number', 'proper_noun', 'abbreviation', 'addition', 'omission', 'corrected_distractor', 'ocr_guess', 'meaning_shift']

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'discrepancies'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['CLEAN', 'DISCREPANT'], description: 'CLEAN=zh / en とも jp と意味が一致 (自然な訳し方の差は許容)。DISCREPANT=意味の相違が 1 件以上' },
    discrepancies: {
      type: 'array',
      items: {
        type: 'object',
        required: ['field', 'lang', 'jp_text', 'tr_text', 'kind', 'severity', 'is_correct_choice', 'detail_jp'],
        additionalProperties: false,
        properties: {
          field: { type: 'string', description: '"stem" または "choice.ア" のような位置' },
          lang: { type: 'string', enum: ['zh', 'en'] },
          jp_text: { type: 'string', description: 'jp 側の該当文 (逐字、省略しない)' },
          tr_text: { type: 'string', description: '訳側の該当文 (逐字、省略しない)' },
          kind: { type: 'string', enum: KINDS, description: 'number=数字・単位の相違 / proper_noun=固有名・ラベル (A 社・表名等) の相違 / abbreviation=略語・規格番号の相違 / addition=jp に無い情報の付加 / omission=訳抜け / corrected_distractor=jp の誤答肢の誤りを訳が「正して」いる / ocr_guess=jp の旧 OCR 崩れを推測した訳が残っている / meaning_shift=その他の意味の相違' },
          severity: { type: 'string', enum: ['cosmetic', 'semantic', 'answer_affecting'], description: 'answer_affecting=訳だけを読むとどの肢が正解に見えるかが変わる / semantic=語句の意味が変わる / cosmetic=意味は同じだが表記上の問題' },
          is_correct_choice: { type: 'boolean', description: 'この相違が correct_answer の字母の選択肢にあるか' },
          detail_jp: { type: 'string' },
        },
      },
    },
    notes_jp: { type: 'string' },
  },
}

// batch_size > 1 のとき: 1 agent が複数題を照合し、{audits:[AUDIT, …]} で返す (題ごとの part file も書く)
const BATCH_SCHEMA = {
  type: 'object',
  required: ['audits'],
  additionalProperties: false,
  properties: { audits: { type: 'array', items: AUDIT_SCHEMA, description: '担当した題 1 つにつき 1 要素 (manifest の samples と同じ順)' } },
}

function prompt(inputPath, ids, partsDir) {
  const many = ids.length > 1
  const which = many
    ? `samples[] の**全エントリ** (${ids.length} 題: ${ids.join(', ')}) を 1 題ずつ照合してください。題どうしの判定を混ぜないこと`
    : `samples[] の中から id==="${ids[0]}" のエントリを取得してください`
  const finish = many
    ? `1. 各題について、StructuredOutput の audits[] に入れるのと**完全に同一の JSON オブジェクト** (AUDIT 1 題分) を \`${partsDir}/<id>.json\` に Write する (例: \`${partsDir}/${ids[0]}.json\`。親ディレクトリが無ければ作る)。題ごとに 1 ファイル、計 ${ids.length} ファイル。内容は 1 文字も変えない。
2. StructuredOutput で {audits: [各題の AUDIT, …]} を返す (${ids.length} 要素、順序は manifest どおり)。`
    : `1. StructuredOutput で返すのと**完全に同一の JSON オブジェクト**を \`${partsDir}/${ids[0]}.json\` に Write する (親ディレクトリが無ければ作る)。内容は 1 文字も変えない。
2. StructuredOutput で AUDIT_SCHEMA に従って返す。`
  return `あなたは独立した**訳層照合監査者**です。学習アプリが表示している過去問の中国語 (zh)・英語 (en) 訳が、日本語 (jp) 原文と同じ意味かだけを検証します。画像は使いません。

## 入力
\`${inputPath}\` を Read し、${which}。各エントリ:
- \`jp.stem\` / \`jp.choices\`: 日本語の表示テキスト。**IPA 原典と照合済みで、これを正とする**
- \`zh\` / \`en\`: 同じ構造の訳 (stem / choices)
- \`correct_answer\`: 正解の字母
- \`jp_history\`: この題の jp が過去に源照合で是正された履歴 (field / old_jp = 是正前 / new_jp = 是正後)。空のこともある。
  **訳は是正前の jp から作られている可能性がある**。old_jp の誤り (OCR 崩れ・推測語・誤った数字) が訳に残っていないかを重点的に見ること。

## 隔離 (必読)
読んでよいのは上記 manifest だけです。それ以外のファイル (questions.json・translations・explanations・evidence・他 agent の part file 等) は、手段を問わず一切参照してはならない。判定は manifest の jp を正とした独立読取です。

## 手順
1. jp の stem と各選択肢を読み、意味 (数字・単位・固有名・ラベル・否定・条件・主語) を確定させる。
2. zh・en の同じ field を 1 つずつ jp と突き合わせる。stem・全選択肢・両言語を漏れなく見ること。
3. 相違を discrepancies に入れる。1 件 = 1 field × 1 言語。

## 報告するもの (kind)
- number: 数字・単位・桁・割合の相違 (例: jp 9001 → 訳 9091)
- proper_noun: 固有名・ラベル・表名・記号 (A 社 / C 社 / 「顧客」表 / a〜d) の相違や欠落
- abbreviation: 略語・規格名の相違 (ISO ↔ OSI 等)
- addition: jp に無い情報の付加 (説明の付け足しで意味が変わるもの)
- omission: 訳抜け (語句・条件・選択肢の一部が訳に無い)
- corrected_distractor: jp の**誤答肢**が意図的に誤っているのに、訳が正しい内容に「直して」いる (誤答肢の誤りは問題の一部。例: jp「ISO が定めた…」を訳が OSI に置き換え、誤答肢が正しい記述に見える)
- ocr_guess: jp_history の old_jp の崩れを推測して訳した痕跡が残っている (例: old_jp「模僚を防ぐ」→ 訳「防止再次发生 / preventing recurrence」、新 jp は「模倣」)
- meaning_shift: 上記以外で意味が変わるもの (否定の反転・主語の取り違え・別語への置換)

## 報告しないもの
- 訳し方の自然な差: 語順、敬体/常体、「2人で」→ together、「最も適切なもの」→ the most appropriate、助数詞の省略、受動/能動の言い換え
- 句読点・括弧・引用符・空白・全角半角の違い
- 用語の慣用訳 (USB メモリ → U 盘、OS → 操作系统) で意味が同じもの
- jp 自体の誤りの指摘 (jp は正とする)

## severity / is_correct_choice
- answer_affecting: 訳だけを読む学習者にとって、どの肢が正解に見えるかが変わる (誤答肢が正しく見える、正解肢が誤って見える、計算結果が変わる数字)
- semantic: 語句の意味が変わるが正解は変わらない
- cosmetic: 意味は同じだが表記上の問題 (例: 見出し番号の混入)
- is_correct_choice: 相違が correct_answer の字母の選択肢にあるとき true (stem は false)

\`jp_text\` / \`tr_text\` は「…」で省略せず、相違を含む文 (または選択肢全体) を逐字で書く。相違が無ければ verdict=CLEAN・discrepancies=[]。相違が 1 件以上なら必ず verdict=DISCREPANT。

## 最後に (必須、2 つとも行うこと)
${finish}`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
// S130 T1: 全題 exam の ids を args に列挙せずに済むよう、exam_sets [[exam_id, 除外 qnum[]], …] (順序 = prep の ids 順) も受ける。
// 各 exam は q001〜q100 から除外分を除いた昇順。ids があれば ids を優先する。
const ids = parsed?.ids ?? (Array.isArray(parsed?.exam_sets)
  ? parsed.exam_sets.flatMap(([e, skip]) => Array.from({ length: 100 }, (_, i) => i + 1)
    .filter((n) => !(skip ?? []).includes(n)).map((n) => `${e}-q${String(n).padStart(3, '0')}`))
  : undefined)
if (!inputPath || !Array.isArray(ids) || !ids.length) throw new Error('need {input_path, ids:[...]}')
if (ids.some((id) => typeof id !== 'string' || !/^\d{4}[a-z0-9]+-q\d{3}$/.test(id))) throw new Error('ids must be question ids like "2026r08-q070"')
const agentType = parsed?.agent_type ?? 'general-purpose'
const model = parsed?.model ?? 'sonnet'
const label = parsed?.label ?? 'a2b'
const pass = parsed?.pass ?? 'sn'
// Write は絶対パスを要求する。workflow 脚本に cwd/fs は無いので、quiz-s7x-fidelity.workflow.mjs と同じく ROOT を直書きする。
const ROOT = '/Volumes/DevSSD/Project/IT-Passport-Learning'
const absolutize = (p) => (p && p.startsWith('/') ? p : `${ROOT}/${p}`)
const outPath = absolutize(parsed?.out_path ?? `evidence/phase5/stage_06_quiz_fidelity/${label}_tr_fidelity_${pass}.json`)
const partsDir = absolutize(parsed?.parts_dir ?? `data/ip/quiz/.phase2/trparts/${label}_${pass}`)
// S127 A2b: batch_size 件ずつ 1 agent に渡す (既定 1 = 1 題 1 agent)。agent 1 体ごとの固定費 (system prompt・tool 定義) を割る。
// batch_dir があれば、各 batch は prep (quiz-tr-prep-S127.mjs --batch-size) が書いた小 manifest
// `<batch_dir>/batch_NNN.json` だけを読む (全 manifest を毎回読ませない)。分割順は prep と同じ (ids 順に batch_size 件ずつ)。
const batchSize = Math.max(1, Number(parsed?.batch_size ?? 1))
const batchDir = parsed?.batch_dir ? absolutize(parsed.batch_dir) : null
const batches = []
for (let i = 0; i < ids.length; i += batchSize) batches.push(ids.slice(i, i + batchSize))
const fileOf = (k) => (batchDir ? `${batchDir}/batch_${String(k + 1).padStart(3, '0')}.json` : inputPath)

const results = await parallel(
  batches.map((b, k) => () => agent(prompt(fileOf(k), b, partsDir), {
    label: b.length > 1 ? `tr:b${k + 1}:${b[0]}…` : `tr:${b[0]}`, phase: 'TrFidelity',
    schema: b.length > 1 ? BATCH_SCHEMA : AUDIT_SCHEMA, model, agentType,
  })),
)
const want = new Set(ids)
const audits = results.filter(Boolean).flatMap((r) => (Array.isArray(r.audits) ? r.audits : [r])).filter((a) => a && want.has(a.id))

const done = audits.filter(Boolean)
const discrepant = done.filter((a) => a.verdict === 'DISCREPANT')
const flat = discrepant.flatMap((a) => (a.discrepancies || []).map((d) => ({ id: a.id, ...d })))
const tally = (k) => flat.reduce((m, d) => { m[d[k]] = (m[d[k]] || 0) + 1; return m }, {})
const cut = (s) => { const t = String(s ?? ''); return t.length > 40 ? `${t.slice(0, 40)}…` : t }
const mergeCmd = `node scripts/quiz-fidelity-merge-parts.mjs ${partsDir} ${inputPath} ${label} ${outPath} --journal <journal.jsonl>`

log(`訳層照合: ${done.length}/${ids.length} 題、CLEAN ${done.length - discrepant.length} / DISCREPANT ${discrepant.length}; 相違 ${flat.length} 件 kind ${JSON.stringify(tally('kind'))} severity ${JSON.stringify(tally('severity'))} lang ${JSON.stringify(tally('lang'))}`)
log(`全文は part file: ${partsDir}/  →  次に実行: ${mergeCmd}`)

return {
  label,
  batch_size: batchSize,
  agents: batches.length,
  n: done.length,
  missing: ids.filter((id) => !done.some((a) => a.id === id)),
  cleanCount: done.length - discrepant.length,
  discrepantCount: discrepant.length,
  byKind: tally('kind'),
  bySeverity: tally('severity'),
  byLang: tally('lang'),
  onCorrectChoiceCount: flat.filter((d) => d.is_correct_choice).length,
  out_path: outPath,
  parts_dir: partsDir,
  merge_cmd: mergeCmd,
  discrepancies: flat.map((d) => ({ id: d.id, field: d.field, lang: d.lang, kind: d.kind, severity: d.severity, is_correct_choice: d.is_correct_choice, jp_text: cut(d.jp_text), tr_text: cut(d.tr_text) })),
}
