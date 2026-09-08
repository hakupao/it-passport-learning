export const meta = {
  name: 'quiz-s7x-fidelity',
  description: 'Quiz 表示テキスト保真核験: s7x resource 由来の stem/choices を源ページ画像と逐字照合し、意味的に成立するが源と異なる OCR 置換 (key-guard/reviewer/Rule A のいずれにも信号が出ない類) を捕捉する',
  phases: [
    { title: 'Fidelity', detail: '源ページ/前裁断 PNG を実読し displayed stem/choices を逐字 diff (model は args.model、既定 opus)' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// S119 U0 (D-146 §4) — 主 context は摘要のみ受信する。
//   Workflow 脚本の実行環境には **filesystem / Node.js API が無い** (workflow-authoring skill:
//   「No filesystem or Node.js API access」)。したがって `node:fs` の import で audit 全文を
//   脚本内から直接書き出すことはできない。代わりに:
//     - 各核験 agent が自分の audit JSON を `parts_dir/<id>.json` に **自分で Write** する
//       (agent は Write を持つ。新規 agent は増やさない = 追加 token ほぼ 0)。
//     - workflow の return からは `audits` を落とし、計数 + discrepancies の要約だけ返す。
//     - 全文 (従来と同じ形) は `scripts/quiz-fidelity-merge-parts.mjs` が part を束ねて
//       `out_path` に書く。主 context は run 完了後にこの 1 行を実行してから machdiff に掛ける。
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['id', 'verdict', 'discrepancies'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['CLEAN', 'DISCREPANT', 'UNREADABLE'], description: 'CLEAN=表示テキストが源と逐字一致 (句読点/全半角/空白の表記揺れは許容)。DISCREPANT=語句レベルの相違あり。UNREADABLE=源ページで当該設問を特定できない/判読不能' },
    discrepancies: {
      type: 'array',
      items: {
        type: 'object',
        required: ['field', 'current_text', 'source_text', 'severity', 'is_correct_choice', 'detail_jp'],
        additionalProperties: false,
        properties: {
          field: { type: 'string', description: '"stem" または "choice.ア" のような位置' },
          current_text: { type: 'string', description: 'dataset 側の該当箇所 (差分の周辺のみ、逐字)' },
          source_text: { type: 'string', description: '源ページ画像から読み取った正しい文言 (逐字)' },
          severity: { type: 'string', enum: ['cosmetic', 'semantic', 'answer_affecting'], description: 'cosmetic=表記のみ / semantic=語句の意味が変わる / answer_affecting=どの肢が正解に見えるかが変わる' },
          is_correct_choice: { type: 'boolean', description: 'この差分が正解肢 (correct_answer の字母) の本文に存在するか' },
          detail_jp: { type: 'string' },
        },
      },
    },
    source_transcript: {
      type: 'object',
      required: ['stem', 'choices'],
      additionalProperties: false,
      description: 'S117 ⑨: 源ページからの**逐字書き起こし** (dataset を見る前に確定させたもの)。CLEAN / DISCREPANT では必須、UNREADABLE では省略。主 context が正規化して displayed と機械 diff する。表は displayed と同じ形式 (選択肢は「[表] a: X, b: Y」、題幹の表は | 列 | 行) で書く。',
      properties: {
        stem: { type: 'string' },
        choices: { type: 'object', additionalProperties: false, properties: { 'ア': { type: 'string' }, 'イ': { type: 'string' }, 'ウ': { type: 'string' }, 'エ': { type: 'string' } }, description: '源から書き起こした各選択肢 (存在する字母だけ)' },
      },
    },
    notes_jp: { type: 'string' },
  },
}

function prompt(inputPath, id, partPath) {
  return `あなたは独立した**表示テキスト保真監査者**です。学習アプリが表示している過去問の日本語テキストが、IPA 原典ページと逐字一致しているかだけを検証します。解説の良し悪しは対象外です。

## 入力
\`${inputPath}\` を Read し、samples[] の中から id==="${id}" のエントリを取得してください。各エントリ:
- \`question_crop_png\`: **この設問だけを前裁断した画像**の絶対パス (存在しないことがある)
- \`source_page_png\`: 原典ページ画像の絶対パス (**権威**)
- \`prev_page_png\`: 直前ページの絶対パス (存在しないことがある。中問の共有前文はここに載る)
- \`question_number\`: このページ内で照合すべき問番号
- \`displayed_stem_jp\` / \`displayed_choices_jp\`: 現在アプリが表示している本文と選択肢
- \`correct_answer\`: 正解字母

## 手順 (必ずこの順で)
0. **切り出し画像は必ず一意のディレクトリに書く**: \`<scratchpad>/fid_${id}_<乱数6桁>/\` を作り、その配下にだけ書く。並行する他の監査 agent と scratchpad を共有しているため、\`crop.png\` \`stem.png\` のような汎用名を scratchpad 直下に書くと**他問の画像を読んでしまう** (S117 で 9 件発生)。Read した画像の寸法が自分の書き出し寸法と違ったら衝突と見なし、再生成する。
0b. **隔離 (S121、必読)**: **読んでよいのは次の 3 種だけ** — (i) 上記 manifest、(ii) そのエントリに書かれた画像パス (と \`page-(NN-1).png\`)、(iii) 自分の一意ディレクトリ配下。**それ以外のファイルは、Read / Grep / cat / find / sed / node など手段を問わず一切参照してはならない**。特に禁止: \`evidence/\` 配下の監査結果、\`fidparts/\` 配下の part file (他問のものも自分の問の過去分も)、\`explanations/\`・\`.phase2/generate_result_*.json\` (既判定と正解根拠を含む)、他 agent の出力、\`questions.json\` 等のデータ本体。S120 で先行監査を事前参照した agent と別問の part を読んだ agent が 8 件出た。本監査は原典画像だけを根拠にする独立読取であり、他の判定を見た時点で独立性が失われる。
1. **まず \`question_crop_png\` を Read** する (エントリに在る場合)。これは当該問だけを切り出した帯なので、通常はこれ 1 枚で設問文と全選択肢が読める。
   次のいずれかに当てはまるときだけ \`source_page_png\` (ページ全体) を Read すること: **判読不能** / 設問文や選択肢が**切れている** (末尾の肢が無い等) / 先頭の**問番号が \`question_number\` と違う**。
   **第 4 条 (必読)**: \`displayed_stem_jp\` に crop 画像内に無い**前文・表・図の記述**が含まれている場合 (中問の共有前文など) は、必ず \`source_page_png\` と \`prev_page_png\` (無ければ \`source_page_png\` と同じディレクトリの \`page-(NN-1).png\`) も Read してから書き起こすこと。
   **crop に無いというだけで「源に無い挿入」と判定してはならない**。前文は前ページに在るのが通常で、crop はその設問の帯しか含まない。この誤判定は正しい前文の削除に直結する。
   \`question_crop_png\` が無いエントリでは \`source_page_png\` を読む。いずれの場合も、文字が小さければ必ず拡大して読む (低解像度の一読は数字・記号を誤読する)。
   ページ全体を読む場合は同じページに複数の設問があるので、**問番号を必ず確認**すること。
2. **源を先に読み、設問文と全選択肢を逐字で書き起こし、\`source_transcript\` に確定させる** (dataset を見る前に)。dataset の文言に引きずられて「そう書いてあるように見える」読み方をしないこと。これが本監査の核心です。書き起こしは源の句読点・空白をそのまま写す (正規化は主 context が行う)。
3. その後で dataset 側の文字列と 1 文字ずつ突き合わせ、**書き起こしと dataset が語句レベルで違う箇所は漏れなく discrepancies に入れる**。S117 で「書き起こしは正しいのに差分に計上しない」漏検が 2 件出た。書き起こしに書いた文言と dataset の文言が違えば、それは必ず差分です。

## 判定基準
- **相違として報告するもの**: 語句の置換・脱落・追加、数値の相違、英単語の混入、記号や参照名 (図1 / (A∪B) / 〔…〕内の名称) の相違、下線・記号注記の位置の相違。
- **相違として報告するもの (S119 追加)**: **区切り記号 (読点・中点「・」・スラッシュ) の脱落**、**引用符の字種置換** (「」↔『』↔" "、〔〕↔［］)、**源に無い記号・語の挿入**。これらも差分として計上する。
- **報告しないもの (表記揺れとして許容)**: 全角/半角の違い、句読点の 「，」/「、」 の違い、空白の有無、改行位置、表を \`| 列 |\` 形式に整形したことによる体裁の差。
- **例外 (S118)**: 検索式 (AND 検索の語間空白)・正規表現・URL・コマンド・IPA 擬似言語ブロック内では**空白は構文**なので、空白の有無の差も DISCREPANT として報告する。逆に、これらの空白を「OCR 残渣」と決めつけないこと。
- **記述規則 (S118、機械 diff のため)**: \`source_transcript\` には「問N」などの見出し行を含めない (設問本文から始める)。\`current_text\` / \`source_text\` は「…」で省略せず、差分を含む文または選択肢を**丸ごと逐字**で書く。
- **記述規則 (S119、機械 diff のため)**: \`source_text\` / \`source_transcript\` に**注記・コメント・「(源では…)」のような説明を書かない。逐字だけ**を書く。説明は \`detail_jp\` / \`notes_jp\` に書く。
- **verdict の整合 (S119)**: \`discrepancies\` が 1 件以上あるなら verdict は**必ず DISCREPANT**。CLEAN と矛盾させないこと。差分が無いときだけ CLEAN。
- **重要**: 差分が「dataset 側の文も日本語として自然」「dataset 側の記述も内容的に真」であっても、源と異なるなら必ず DISCREPANT として報告してください。**本監査はまさにその種の差分を見つけるために存在します**。もっともらしさは一致の証拠になりません。
- \`is_correct_choice\`: その差分が \`correct_answer\` の字母の本文にある場合 true。
- \`severity\`: どの肢が正解に見えるかが変わるなら answer_affecting、語句の意味が変わるなら semantic、表記だけなら cosmetic。

源ページで当該問を特定できない場合のみ verdict=UNREADABLE とし、憶測で埋めないこと。

## 最後に (必須、2 つとも行うこと)
1. StructuredOutput で返すのと**完全に同一の JSON オブジェクト**を \`${partPath}\` に Write する (親ディレクトリが無ければ作る)。整形は自由だが**内容は 1 文字も変えない**こと。これが後段 fixer の読む全文記録になる。
2. StructuredOutput で AUDIT_SCHEMA に従って返す。`
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const inputPath = parsed?.input_path
const examId = parsed?.exam_id
const qnums = parsed?.qnums
if (!inputPath || !examId || !Array.isArray(qnums) || !qnums.length) {
  throw new Error('need {input_path, exam_id, qnums:[...]}')
}
const ids = qnums.map((n) => `${examId}-q${String(n).padStart(3, '0')}`)
// Pass 2 (independent re-read) runs a DIFFERENT agentType than pass 1 so the two readings
// are not the same reviewer twice (Rule D). Disagreements are adjudicated by 主 context.
const agentType = parsed?.agent_type ?? 'general-purpose'
const model = parsed?.model ?? 'opus'
const label = parsed?.label ?? 'S119'
const pass = parsed?.pass ?? 'gp'
// Write は絶対パスを要求する。workflow 脚本に cwd/fs は無いので、同類 workflow 4 本と同じく ROOT を直書きする。
const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning'
const absolutize = (p) => (p && p.startsWith('/') ? p : `${ROOT}/${p}`)
const outPath = absolutize(parsed?.out_path ?? `evidence/phase5/stage_06_quiz_fidelity/full52_fidelity_${label}_${examId}_${pass}.json`)
const partsDir = absolutize(parsed?.parts_dir ?? `data/ip/quiz/.phase2/fidparts/${label}_${examId}_${pass}`)

const audits = await parallel(
  ids.map((id) => () => agent(prompt(inputPath, id, `${partsDir}/${id}.json`), {
    label: `fidelity:${id}`, phase: 'Fidelity', schema: AUDIT_SCHEMA, model, agentType,
  })),
)

const clean = audits.filter(Boolean)
const discrepant = clean.filter((a) => a.verdict === 'DISCREPANT')
const unreadable = clean.filter((a) => a.verdict === 'UNREADABLE').map((a) => a.id)
const flat = discrepant.flatMap((a) => (a.discrepancies || []).map((d) => ({ id: a.id, ...d })))
const bySeverity = flat.reduce((m, d) => { m[d.severity] = (m[d.severity] || 0) + 1; return m }, {})
const onCorrectChoice = flat.filter((d) => d.is_correct_choice)
// D-146 §4: 主 context には要約だけ返す。逐字全文は part file → merge-parts.mjs → out_path。
const cut = (s) => { const t = String(s ?? ''); return t.length > 40 ? `${t.slice(0, 40)}…` : t }
const summary = flat.map((d) => ({
  id: d.id, field: d.field, severity: d.severity, is_correct_choice: d.is_correct_choice,
  current_text: cut(d.current_text), source_text: cut(d.source_text),
}))

log(`s7x 保真監査: ${clean.length} 問中 CLEAN ${clean.length - discrepant.length - unreadable.length} / DISCREPANT ${discrepant.length} / UNREADABLE ${unreadable.length}; 差分 ${flat.length} 件 ${JSON.stringify(bySeverity)}, 正解肢上 ${onCorrectChoice.length} 件`)
log(`全文は part file: ${partsDir}/  →  次に実行: node scripts/quiz-fidelity-merge-parts.mjs ${partsDir} ${inputPath} ${examId} ${outPath}`)

return {
  exam_id: examId,
  n: clean.length,
  cleanCount: clean.length - discrepant.length - unreadable.length,
  discrepantCount: discrepant.length,
  unreadable,
  bySeverity,
  onCorrectChoiceCount: onCorrectChoice.length,
  out_path: outPath,
  parts_dir: partsDir,
  merge_cmd: `node scripts/quiz-fidelity-merge-parts.mjs ${partsDir} ${inputPath} ${examId} ${outPath}`,
  discrepancies: summary,
}
