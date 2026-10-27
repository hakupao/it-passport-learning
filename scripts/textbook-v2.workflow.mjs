export const meta = {
  name: 'textbook-v2',
  description: 'Stage 7 Phase 3 教科書 v2 生成 (D-196 §0-13): JP 執筆 → JP 審査 (≤2 輪) → zh/en 意訳・現地化 → 訳審査 (≤2 輪)。各 agent は part file を書き、計数だけを返す',
  whenToUse: 'scripts/textbook-v2-prep.mjs --unit <id> の後。args = {unit: "<unit_id>", run_tag: "<新しい tag>"} (または units: [...])。前回の草稿から始めるなら + seed_part / seed_journal / seed_review_round、JP はそのままで訳だけ改稿するなら + seed_loc_part / seed_loc_journal / seed_loc_review_round (B5)。終了後 textbook-v2-merge.mjs --unit <id> --journal <journal.jsonl>',
  phases: [
    { title: 'Write', detail: 'general-purpose (opus): manifest から JP part を書き、validate --part を 0 issue まで自分で回す', model: 'opus' },
    { title: 'Review', detail: 'oh-my-claudecode:critic (opus): D-195 清單 + 事実 (objective_jp・過去問正解)、REVISE なら執筆者が改稿、最大 2 輪', model: 'opus' },
    { title: 'Localize', detail: 'oh-my-claudecode:writer (opus): zh / en 意訳 + 現地化、構造は JP と完全一致、validate + parity を自分で回す', model: 'opus' },
    { title: 'TrReview', detail: 'oh-my-claudecode:code-reviewer (opus): 三語の意味一致・現地化・構造、REVISE なら訳者が改稿、最大 2 輪', model: 'opus' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 7 Phase 3 Task 9 Step 2. Roles (§0-13, Rule D — four different subagent types, all opus):
//   JP writer = general-purpose / JP review = oh-my-claudecode:critic /
//   localiser = oh-my-claudecode:writer (its default tier is not opus: model is pinned) /
//   translation review = oh-my-claudecode:code-reviewer.
// Files (all under data/ip/textbook/.planning/v2/<unit>/, gitignored):
//   manifest.json                  prep output (input of every agent)
//   parts/<run_tag>/<unit>.jp.r<N>.json   JP part, N = 0 first draft, N = k revision after review k
//   parts/<run_tag>/<unit>.loc.r<N>.json  localised part (= the JP part + _zh / _en, label zh / en; jp_round)
// args.run_tag is required and must be new for every run (the script cannot read a clock): parts are
// run-scoped, so a rerun never overwrites a part an earlier run's review approved (S135 M1).
// Every agent returns only {unit_id, stage, round, part?, sha256 / reviewed_sha256, counts / verdict,
// issues…} as StructuredOutput; the runtime logs it to journal.jsonl, which
// scripts/textbook-v2-merge.mjs reads to pick the final parts (S121: the journal is the record). The
// sha256 of each part file comes from `validate --part`; merge recomputes it, so the merged bytes are
// exactly the reviewed bytes. An agent reporting a part path other than the expected one stops the unit.
// Reviewers (critic / code-reviewer have no Write tool) return their findings in the StructuredOutput
// only; the revise prompt passes them on. The workflow's own return is counts + verdicts only.
// No fs / Date.now / Math.random here (resume): ROOT is hard-coded like quiz-expl-audit.workflow.mjs.
// ─────────────────────────────────────────────────────────────────────────────

const ROOT = '/Volumes/DevSSD/Project/IT-Passport-Learning'
const absolutize = (p) => (typeof p === 'string' && p.startsWith('/') ? p : `${ROOT}/${p}`)
const MODEL = 'opus'
const AGENT = {
  write: 'general-purpose',
  review: 'oh-my-claudecode:critic',
  localize: 'oh-my-claudecode:writer',
  trReview: 'oh-my-claudecode:code-reviewer',
}

const COUNTS = {
  type: 'object',
  required: ['terms', 'figs', 'steps', 'points', 'pairs', 'key_points', 'goals'],
  additionalProperties: false,
  properties: Object.fromEntries(['terms', 'figs', 'steps', 'points', 'pairs', 'key_points', 'goals'].map((k) => [k, { type: 'integer', minimum: 0 }])),
}
const PART_RESULT = (stage, seeded = false) => ({
  type: 'object',
  required: ['unit_id', 'stage', 'round', 'part', 'sha256', 'counts', 'validate_issues']
    .concat(stage === 'loc' ? ['jp_round', 'jp_sha256', 'parity_diff'] : [])
    .concat(seeded && stage === 'loc' ? ['jp_part'] : [])
    .concat(seeded ? ['seed_part', 'seed_sha256', 'seed_review_round'] : []),
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    stage: { type: "string", enum: [stage] },
    round: { type: 'integer', minimum: 0 },
    part: { type: 'string', description: '書いた part file の絶対パス' },
    sha256: { type: 'string', description: '最後の validate --part が出力した `sha256 <hex>` 行の hex (最後に Write した後の値)' },
    counts: { ...COUNTS, description: 'validate --part が最後に出力した `counts {...}` 行の JSON をそのまま' },
    validate_issues: { type: 'integer', minimum: 0, description: '最後の validate --part の issue 数 (0 が目標)' },
    ...(seeded
      ? {
          ...(stage === 'loc' ? { jp_part: { type: 'string', description: 'textbook-v2-seed.mjs が出力した jp_part 行のパス (そのまま再利用した JP part)' } } : {}),
          seed_part: { type: 'string', description: `種にした前回 run の ${stage === 'loc' ? '訳' : 'JP'} part` },
          seed_sha256: { type: 'string', description: 'textbook-v2-seed.mjs が出力した seed_sha256 行の hex (種のバイト列)' },
          seed_review_round: { type: 'integer', minimum: 1, description: `使った ${stage === 'loc' ? 'loc-review' : 'jp-review'} の round` },
        }
      : {}),
    ...(stage === 'loc'
      ? {
          jp_round: { type: 'integer', minimum: 0 },
          jp_sha256: { type: 'string', description: 'validate --part … --jp が出力した `jp_sha256 <hex>` 行の hex' },
          parity_diff: { type: 'integer', minimum: 0, description: '最後の parity --part の差分箇所数' },
        }
      : {}),
  },
})
const REVIEW_RESULT = (stage) => ({
  type: 'object',
  required: ['unit_id', 'stage', 'round', 'reviewed_round', 'reviewed_sha256', 'verdict', 'issues'],
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    stage: { type: "string", enum: [stage] },
    round: { type: 'integer', minimum: 1, description: '審査の回 (1 or 2)' },
    reviewed_round: { type: 'integer', minimum: 0, description: '審査した part の round' },
    reviewed_sha256: { type: 'string', description: '審査に使った validate --part の `sha256 <hex>` 行の hex (= 審査した part のバイト列)' },
    verdict: { type: 'string', enum: ['PASS', 'REVISE'], description: 'D-199: PASS = high / medium の issue が 0 (low だけなら PASS)' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'where', 'rule', 'detail_jp', 'fix_jp'],
        additionalProperties: false,
        properties: {
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          where: { type: 'string', description: 'JSON 上の位置 (例 terms[2].detail_jp / pairs[0].rows[1].b_zh)' },
          rule: { type: 'string', description: '根拠 (D-195 §N / 事実: 問題 id / 訳: 意味ずれ など)' },
          detail_jp: { type: 'string' },
          fix_jp: { type: 'string', description: '具体的な直し方' },
        },
      },
    },
  },
})

const dirOf = (unit) => `${ROOT}/data/ip/textbook/.planning/v2/${unit}`
const manifestOf = (unit) => `${dirOf(unit)}/manifest.json`
const partOf = (unit, stage, round) => `${dirOf(unit)}/parts/${RUN_TAG}/${unit}.${stage}.r${round}.json`
const validateCmd = (part, jp) => `node ${ROOT}/scripts/textbook-v2-validate.mjs --part ${part}${jp ? ` --jp ${jp}` : ''}`
const parityCmd = (part) => `node ${ROOT}/scripts/textbook-v2-parity.mjs --part ${part}`
const seedCmd = (seed) => `node ${ROOT}/scripts/textbook-v2-seed.mjs --part ${seed.part} --journal ${seed.journal} --review-round ${seed.reviewRound}`
const SEED_ERROR = 'SEED-ERROR'

const READ_MANIFEST = (unit) => `\`${manifestOf(unit)}\` を**全部** Read する (数千行: offset で分けて最後まで)。中身: d195_lines (D-195 全文)、topic.objective_jp (シラバス)、terms (見出し語、順序固定)、v1 (現行版)、questions / term_questions (関連過去問: 題文 [行の配列]・選択肢・正解記号のみ。解説は渡さない = D-198)、chumon_members (中問組員)、figures (図種 kinds・types_ts_lines = v2 の型定義・svg_available)、rules (validateV2 の上限と禁止句)、output_schema (JP part の JSON Schema)。加えて原本を直接 Read する: \`${ROOT}/docs/decisions/D-195-textbook-writing-and-figure-rules.md\`、\`${ROOT}/apps/web/src/lib/textbook/types.ts\`、\`${ROOT}/apps/web/src/lib/textbook/figureSpec.ts\`。`
const D198 = '写しの基準 (D-198): 写し = (i) 正規化 (標記・空白・句読点・記号を除去) して 20 字以上の一致、(ii) 題文・選択肢との正規化 12 字以上の連続一致、(iii) 特定の題の具体例の流用 (数値・場面設定・例の列挙とその順序)。写しでない = 標準的な定義・計算規則・原則を一般的な表現で述べること (正解選択肢が同じ原則を述べていても可)。(i)(ii) は validate が `copy` issue として機械検出する (見出し語・用語そのものは数えない)。'
const D200 = 'D-200: 考点は 1 用語 3 個まで、各考点の日本語は 2 文以内・100 字以内 (標記・空白を除く)。validate が `points` issue として検査する。'
const QUESTIONS_JSON = `${ROOT}/data/ip/quiz/questions.json`

function writerPrompt(unit, round, prev, review, seed) {
  const part = partOf(unit, 'jp', round)
  const revise = seed
    ? `\n## 改稿 (round ${round}: 前回 run の草稿を種にする)\n1. まず \`${seedCmd(seed)}\` を実行する。種 \`${seed.part}\` の sha256 (\`seed_sha256 <hex>\` 行) と、その草稿そのものを審査した jp-review #${seed.reviewRound} の指摘 (JSON) が出る。**exit が 0 でなければ** part を書かずに StructuredOutput で part:"${SEED_ERROR}" を返して終わる (seed_part / seed_review_round は指定値、他の数値は 0、文字列は空)。\n2. 種を Read し、その指摘の high / medium を**全部**直した版を書く (D-199: low は直さなくてもよい。直すなら新しい high / medium を生まないこと)。指摘されていない箇所も、下の「書き方」に反していれば直す。\n`
    : prev
      ? `\n## 改稿 (round ${round})\n前稿 \`${prev}\` を Read し、下の審査指摘の high / medium を**全部**直した版を書く (D-199: low は直さなくてもよい。直すなら新しい high / medium を生まないこと)。指摘されていない箇所も、下の「書き方」に反していれば直す。\n\`\`\`json\n${JSON.stringify(review.issues, null, 1)}\n\`\`\`\n`
      : ''
  return `あなたは IT パスポート試験の教科書執筆者です。単元 \`${unit}\` を D-195 の規則で**日本語で**書き直します (zh / en は後工程で意訳する。あなたは日本語だけ)。

## 入力
${READ_MANIFEST(unit)}
${revise}
## 書くもの = JP part (manifest.output_schema に従う JSON)
- \`unit_id\`="${unit}", \`stage\`="jp", \`round\`=${round}。
- terms: manifest.terms と**同じ見出し語・同じ順** (増減・改名禁止)。各用語: one_jp (一句話 1 文、キーワードは **語**) → fig (図: D-195 §2 で選ぶ。不要なら null) → detail_jp (展開 2〜3 文) → analogy_jp (比喩、平文。無理なら "") / hook_jp (記法: 定義の言い換え禁止、語源・字形・対比など別の手がかり。無ければ省略) → points (考点: kind "exam" は根拠の過去問 id を qids に必ず入れる、"mix" は易混。${D200}) → quiz (この用語の過去問 id: manifest.term_questions[用語] から 1〜3 題、manifest.chumon_members の題 (中問組員) は避ける)。
- goals_jp (学習目標 3 前後)、overview_cols_jp + overview_rows (用語総表: 用語ごと 1 行、one_line_jp + 列ごとのセル extra_jp)、pairs (易混組: a が b より用語順で前、決め手の行に key:true)、key_points_jp (要点 3〜5)、challenge_questions (確認題: 本 topic の過去問 id、中問組員を除いて 3〜5 題。v1.challenge_questions を基に見直してよい)。
- 図: kind / mode は figures.kinds の組合せだけ (svg / table / compare / flow / tree / network)。型は figures.types_ts_lines (原本 apps/web/src/lib/textbook/types.ts) の FigSpec。ラベルは \`{"jp": "…"}\` だけ、分段の caption は \`caption_jp\` だけ書く (zh / en は後工程)。flow / tree の段階図は ${'`'}mode:"steps"${'`'} で 3〜4 step。network (アローダイアグラム等) は mode "widget"、工期は 0〜99 の整数、始点・終点は 1 つずつ、並行作業はダミーで。svg を使うなら figures.svg_available のパスだけ。
- 行内標記は **語** だけ。[[jp:…]] は zh / en 専用なので**日本語の本文には使わない** (validate が markup issue にする)。analogy・総表 extra・図ラベル・caption は平文。
- 事実: topic.objective_jp と関連過去問の正解に反することを書かない。捏造しない。
- ${D198}

## 書き方 (attempt 1・2 の不合格理由 = 過去問の文・具体例への寄りかかり・考点と正解の矛盾・未定義語・言い切り過ぎ。必ず守る)
1. **二段階で書く**: 用語ごとに、まず topic.objective_jp と見出し語と D-195 だけを見て草稿を書く (この段階では questions / term_questions を**開かない**)。草稿ができてから過去問を開き、事実の確認と qids の付与にだけ使う。
2. **写さない**: ${D198} 標準的な定義・規則は自分の言葉で一般的に述べればよい。具体例 (数値・場面・例の並び) は自分で作る。
3. **exam 考点は引用題と突き合わせる**: 各 exam 考点について、qids の題をそれぞれ読み直し、主張がその題の正解 (correct_answer の選択肢と題文) と一致することを確かめる。データが支持しない規則 (「必ず〜」「〜は 1 つだけ」等) を作らない。合わなければ主張を直す (qid を外すだけで済ませない)。
4. **定義してから使う**: 専門語 (例: 結合点・矢線・最遅結合点時刻) は、それを使う考点・図・易混表より前に、定義する 1 文を本文 (one_jp / detail_jp) に置く。
5. **網羅的に言い切らない**: 分類・規則・構成要素を「〜は A と B である」「必ず〜」と網羅的に書くのは、引用した qids の題がすべてそれを支持するときだけ。そうでなければ「例えば」で書く。
6. **図を考点・原則と突き合わせる**: 書き終える前に、各用語の図の caption とラベルを同じ用語の考点と本文の原則に照らして読み直す (例: WBS の分解例には成果物を作る作業そのものが入っていること、caption の数値・順序が本文と一致すること)。
- D-195 §9 禁止: 定型の締め句 (「〜と理解しておきましょう」「試験では〜が問われます」の常用 → 試験の話は考点枠でだけ)、同義の言い換えの反復、1 文に見出し語を 3 つ以上「・、」で羅列 (分類の数を明示する 1 文「〜には A・B・C・D の 4 つがある」だけ例外 = D-197)、根拠のない誇張語。

## 手順
1. manifest を全部読む (questions / term_questions は「書き方 1」の順で、草稿の後に開く)。
2. JP part を \`${part}\` に Write (親ディレクトリが無ければ作る)。書いたら「書き方 1〜4」を用語ごとに自分で点検する。
3. \`${validateCmd(part)}\` を実行。issue が出たら part を直して再実行、**0 issue になるまで**繰り返す (最後の出力の \`counts {...}\` 行と \`sha256 <hex>\` 行を控える。part を書き換えたら必ず validate を再実行し、最後の値を使う)。0 にできない issue があれば残数をそのまま返す。
4. StructuredOutput で {unit_id, stage:"jp", round:${round}, part:"${part}", sha256: (最後の sha256 行の hex), counts: (最後の counts 行の JSON), validate_issues: (最後の issue 数)${seed ? `, seed_part:"${seed.part}", seed_sha256: (seed コマンドの seed_sha256 行の hex), seed_review_round:${seed.reviewRound}` : ''}} を返す。本文は返さない。`
}

function reviewPrompt(unit, round, part, partRound) {
  return `あなたは独立した教科書審査者 (Rule D: 執筆者とは別役割) です。単元 \`${unit}\` の JP 草稿を批判的に審査します。甘く通さない。

## 入力
- ${READ_MANIFEST(unit)}
- 審査対象: \`${part}\` (JP part, round ${partRound})。
- 機械検査: \`${validateCmd(part)}\` を実行し結果も見る (0 issue でも内容の審査は別)。出力の \`sha256 <hex>\` が審査したバイト列の印 (reviewed_sha256)。

## 審査観点
1. **事実**: 定義・説明・考点・図 (数値、工期、因果、分類) が topic.objective_jp と関連過去問の正解に照らして正しいか。網羅的な言い切り (「〜は A と B である」「必ず〜」) が引用題すべてに支持されているか。図の caption が考点・本文と一致するか。exam 考点の qids の題が本当にその点を問うているか。quiz / challenge_questions の題がその用語・単元に合っているか。
2. **D-195 清單**: §1 一句話 1 文 + 太字キーワード / 展開 2〜3 文 / §2 図の選び方 (過程→段階図、量・計算→操作部品、その他→静的、別名だけの用語は図なし、飾りの図は不可) / §3 学習目標 + 総表 / §4 易混対比は 2 つ目の直後 / §5 強調 4 種 / §6 比喩・記法が定義の言い換えでない / §7 要点 3〜5 / §9 禁止事項 (定型の締め句、言い換えの反復、羅列、誇張) / ${D200} 超過は medium。
3. **初学者に分かるか**: 結論先行、図と文が噛み合うか。**定義してから使う**: 専門語 (例: 結合点・矢線・最遅結合点時刻) が、それを定義する文より前に考点・図・易混表で使われていたら指摘する。
4. **写していないか**: ${D198} (i)(ii)(iii) に当たれば high。標準的な定義・計算規則・原則を一般的な表現で述べた文は、正解選択肢が同じ原則を述べていても写しとして指摘しない。
5. **考点と引用題の正解**: 各 exam 考点の qids の題だけを \`${QUESTIONS_JSON}\` から Read し (id で検索、題文・選択肢・correct_answer)、主張がその題の正解と一致するか、データが支持しない規則を作っていないかを確かめる。矛盾は high。
6. **標記**: 日本語の本文に [[jp:…]] (zh / en 専用) があれば指摘する。

## 判定
- verdict (D-199): high / medium の issue が 0 なら PASS、1 つでもあれば REVISE。low だけなら PASS を返す (low も issues に全部書く。記録され、改稿は任意)。workflow も issues の severity から同じ規則で判定する。
- issues: 1 件ずつ severity・where (JSON 位置)・rule (根拠)・detail_jp・fix_jp (具体的な直し方)。
- StructuredOutput で {unit_id:"${unit}", stage:"jp-review", round:${round}, reviewed_round:${partRound}, reviewed_sha256: (validate の sha256 行の hex), verdict, issues} を返す。ファイルは書かない。`
}

function localizePrompt(unit, round, jpPart, jpRound, prev, review, seedLoc) {
  const part = partOf(unit, 'loc', round)
  const jpRef = seedLoc ? '(seed コマンドの `jp_part` 行のパス)' : jpPart
  const revise = seedLoc
    ? `\n## 改訳 (round ${round}: 前回 run の訳を種にする。JP part は審査済みのものをそのまま使う)\n1. まず \`${seedCmd(seedLoc)}\` を実行する。種 \`${seedLoc.part}\` の sha256 (\`seed_sha256 <hex>\` 行)、その訳が作られた JP part (\`jp_part <path>\` 行、sha256 照合済み)、その訳そのものを審査した loc-review #${seedLoc.reviewRound} の指摘 (JSON) が出る。**exit が 0 でなければ** part を書かずに StructuredOutput で part:"${SEED_ERROR}" を返して終わる (seed_part / seed_review_round は指定値、他の数値は 0、文字列は空)。\n2. 以下「原文」は jp_part の JP part。種を Read し、その指摘の high / medium を**全部**直した版を書く (D-199: low は直さなくてもよい。直すなら新しい high / medium を生まないこと)。JP part は**書き換えない**、訳 part の日本語は**1 文字も変えない**。\n`
    : prev
    ? `\n## 改訳 (round ${round})\n前訳 \`${prev}\` を Read し、下の訳審査の指摘の high / medium を**全部**直した版を書く (D-199: low は直さなくてもよい。直すなら新しい high / medium を生まないこと)。日本語は変えない。\n\`\`\`json\n${JSON.stringify(review.issues, null, 1)}\n\`\`\`\n`
    : ''
  return `あなたは IT パスポート教科書の訳者です。審査済みの日本語 part を中国語 (簡体・中国大陸) と英語に**意訳 + 現地化**します (直訳しない: 各言語の学習者が自然に読める文に。D-195 §8)。

## 入力
- ${READ_MANIFEST(unit)} 特に d195 と v1_terms (見出し語の zh / en 訳 = term_zh / term_en。本文の訳語もこれに揃える)。
- 原文: \`${jpRef}\` (JP part, round ${seedLoc ? '= 種の jp_round' : jpRound})。
${revise}
## 書くもの = 訳 part
- 原文 JSON を**そのまま写し**、次だけを足す: \`stage\`="loc"、\`round\`=${round}、\`jp_round\`=${seedLoc ? '(種と同じ値)' : jpRound}; 各 \`X_jp\` の隣に \`X_zh\` / \`X_en\` (goals / overview_cols / key_points の配列は同じ要素数)、図ラベル \`{"jp": …}\` に \`"zh"\` / \`"en"\`、caption_jp の隣に caption_zh / caption_en。
- 日本語・id・kind・mode・qids・quiz・key・数値・配列の要素数と順序は**1 文字も変えない** (merge が「訳 part から zh / en を除くと JP part と一致」を検査する)。
- 行内標記: 原文で **語** の箇所は訳文でも **訳語**。zh / en 本文中で試験の日本語表記を示すところは [[jp:日本語]] を併記 (D-195 §5 日本語原語の明示: 見出し語や試験用語の初出など、多用しない)。analogy・総表 extra・図ラベル・caption は平文。
- 文数: detail は各言語でも 2〜3 文 (en は ". " で区切って数えられる)。D-195 §9 の禁止 (定型の締め句、"make sure to understand"、"非常重要"、羅列、誇張) は zh / en にも適用。
- 訳文も過去問 (questions の題文・選択肢・解説、translations の既存訳) の文を写さない。事実と数値だけを使い、文は自分で書く。

## 手順
1. 訳 part を \`${part}\` に Write。
2. \`${validateCmd(part, seedLoc ? '<jp_part>' : jpPart)}\`${seedLoc ? ' (<jp_part> = seed コマンドの jp_part 行のパス)' : ''} と \`${parityCmd(part)}\` を実行し、**両方 0** になるまで直して再実行 (validate の最後の \`counts {...}\`・\`sha256 <hex>\`・\`jp_sha256 <hex>\` 行を控える。part を書き換えたら必ず再実行し最後の値を使う)。原文 JP part は**書き換えない**。
3. StructuredOutput で {unit_id, stage:"loc", round:${round}, jp_round:${seedLoc ? '(種の jp_round)' : jpRound}, part:"${part}", sha256, jp_sha256, counts, validate_issues, parity_diff${seedLoc ? `, jp_part: (seed コマンドの jp_part 行のパス), seed_part:"${seedLoc.part}", seed_sha256: (seed コマンドの seed_sha256 行の hex), seed_review_round:${seedLoc.reviewRound}` : ''}} を返す。本文は返さない。`
}

function trReviewPrompt(unit, round, part, partRound, jpPart) {
  return `あなたは独立した訳審査者 (Rule D: 訳者とは別役割) です。単元 \`${unit}\` の zh / en 訳を日本語原文と突き合わせて審査します。

## 入力
- ${READ_MANIFEST(unit)}
- 原文 JP part: \`${jpPart}\` / 訳 part: \`${part}\` (round ${partRound})。
- 機械検査: \`${validateCmd(part, jpPart)}\` と \`${parityCmd(part)}\` を実行し結果も見る。出力の \`sha256 <hex>\` が審査したバイト列の印 (reviewed_sha256)。

## 審査観点
1. **意味の一致**: 各 zh / en が jp と同じ事実・同じ主張か (欠落・付加・数値ずれ・因果の逆転・考点の意味変化)。図ラベル・caption・総表・易混表も含む。
2. **現地化**: 直訳調でなく自然か。zh は中国大陸の簡体・IT 用語 (日式借词でない)、en は自然な学習者向け英語。見出し語の訳が v1_terms の term_zh / term_en と揃っているか。
3. **標記**: **語** が原文と対応、[[jp:…]] が試験の日本語表記を正しく示し、過剰でないか。
4. **構造**: 三語で文数・項目数・順序が揃うか (parity)。D-195 §9 の禁止事項が zh / en に出ていないか。

## 判定
- verdict (D-199): high / medium の issue が 0 なら PASS、1 つでもあれば REVISE。low だけなら PASS を返す (low も issues に全部書く。記録され、改稿は任意)。workflow も issues の severity から同じ規則で判定する。
- issues: severity・where (例 terms[1].detail_en)・rule・detail_jp・fix_jp。
- StructuredOutput で {unit_id:"${unit}", stage:"loc-review", round:${round}, reviewed_round:${partRound}, reviewed_sha256: (validate の sha256 行の hex), verdict, issues} を返す。ファイルは書かない。`
}

/** D-199: a review passes iff none of its issues is high or medium (low issues are reported, not blocking). */
const gatePass = (review) => !(review.issues || []).some((i) => i.severity === 'high' || i.severity === 'medium')
/** The gate's verdict; a reviewer word that disagrees with its own issues is logged, the issues decide. */
function gate(unit, label, review) {
  const v = gatePass(review) ? 'PASS' : 'REVISE'
  if (review.verdict !== v) log(`${unit}: ${label} returned verdict ${review.verdict} but its issues give ${v} under D-199 (high/medium block, low reported) — using ${v}`)
  return v
}
const sev = (issues) => (issues || []).reduce((m, i) => { m[i.severity] = (m[i.severity] || 0) + 1; return m }, {})

/** One unit through write → review (≤ maxRounds) → localize → translation review (≤ maxRounds). */
async function runUnit(unit, maxRounds) {
  const out = { unit, run_tag: RUN_TAG, status: 'running', jp_rounds: 0, jp_verdict: null, jp_issues: {}, jp_validate_issues: null, loc_rounds: 0, loc_verdict: null, loc_issues: {}, parts: [], validate_issues: null, parity_diff: null }
  /** A writing agent; null + out.status set when it died or wrote somewhere else than told (S135 L4). */
  const write = async (prompt, label, phase, stage, round, agentType, seeded = false) => {
    const res = await agent(prompt, { label, phase, schema: PART_RESULT(stage, seeded), model: MODEL, agentType })
    if (!res) {
      out.status = `${stage}-write-failed`
      return null
    }
    if (seeded && (res.part === SEED_ERROR || !/^[0-9a-f]{64}$/.test(res.seed_sha256 ?? ''))) {
      const s = stage === 'loc' ? SEED_LOC : SEED
      log(`${unit}: the seed did not verify (no ${stage}-review #${s.reviewRound} of ${s.part} in ${s.journal}, or its JP part changed) — stop`)
      out.status = 'seed-invalid'
      return null
    }
    // B5: the reused JP part must be the one next to the seed (same run), at the seed's jp_round
    if (seeded && stage === 'loc' && res.jp_part !== `${SEED_LOC.part.slice(0, SEED_LOC.part.lastIndexOf('/'))}/${unit}.jp.r${res.jp_round}.json`) {
      log(`${unit}: the loc seed reported JP part ${res.jp_part}, not the seed run's ${unit}.jp.r${res.jp_round}.json — stop`)
      out.status = 'seed-invalid'
      return null
    }
    const want = partOf(unit, stage, round)
    if (res.part !== want) {
      log(`${unit}: ${label} reported part ${res.part}, expected ${want} — stop`)
      out.status = 'part-path-mismatch'
      return null
    }
    out.parts.push(res.part)
    return res
  }

  // ---- B5 loc seed: the seed run's reviewed JP part as-is, only zh / en revised ----
  if (SEED_LOC) return locStage(unit, maxRounds, out, write, null)

  // ---- JP: write (or revise the seed), review, revise ----
  let jp = await write(writerPrompt(unit, 0, null, null, SEED), `${SEED ? 'seed-rewrite' : 'write'}:${unit}#0`, 'Write', 'jp', 0, AGENT.write, !!SEED)
  if (!jp) return out
  if (SEED) out.seed = { part: SEED.part, sha256: jp.seed_sha256, review_round: SEED.reviewRound }
  out.jp_rounds = 1
  let review = null
  for (let r = 1; r <= maxRounds; r++) {
    review = await agent(reviewPrompt(unit, r, jp.part, jp.round), { label: `review:${unit}#${r}`, phase: 'Review', schema: REVIEW_RESULT('jp-review'), model: MODEL, agentType: AGENT.review })
    if (!review) return { ...out, status: 'jp-review-failed' }
    out.jp_verdict = gate(unit, `JP review #${r}`, review)
    out.jp_issues = sev(review.issues)
    if (out.jp_verdict === 'PASS' || r === maxRounds) break
    log(`${unit}: JP review #${r} REVISE ${JSON.stringify(out.jp_issues)} → rewrite #${r}`)
    const next = await write(writerPrompt(unit, r, jp.part, review), `rewrite:${unit}#${r}`, 'Write', 'jp', r, AGENT.write)
    if (!next) return out
    jp = next
    out.jp_rounds += 1
  }
  out.jp_validate_issues = jp.validate_issues
  if (out.jp_verdict !== 'PASS') {
    log(`${unit}: JP review still REVISE after ${maxRounds} round(s) — stop (Rule B archive)`)
    return { ...out, status: 'jp-rejected' }
  }

  return locStage(unit, maxRounds, out, write, jp)
}

/** zh / en: localize (or re-localize the loc seed), translation review, revise. jp = null → from SEED_LOC. */
async function locStage(unit, maxRounds, out, write, jp) {
  let loc = jp
    ? await write(localizePrompt(unit, 0, jp.part, jp.round, null, null), `localize:${unit}#0`, 'Localize', 'loc', 0, AGENT.localize)
    : await write(localizePrompt(unit, 0, null, null, null, null, SEED_LOC), `seed-relocalize:${unit}#0`, 'Localize', 'loc', 0, AGENT.localize, true)
  if (!loc) return out
  if (!jp) {
    jp = { part: loc.jp_part, round: loc.jp_round, validate_issues: null }
    out.jp_verdict = 'reused'
    out.seed_loc = { part: SEED_LOC.part, sha256: loc.seed_sha256, review_round: SEED_LOC.reviewRound, jp_part: loc.jp_part }
  }
  out.loc_rounds = 1
  let tr = null
  for (let r = 1; r <= maxRounds; r++) {
    tr = await agent(trReviewPrompt(unit, r, loc.part, loc.round, jp.part), { label: `tr-review:${unit}#${r}`, phase: 'TrReview', schema: REVIEW_RESULT('loc-review'), model: MODEL, agentType: AGENT.trReview })
    if (!tr) return { ...out, status: 'loc-review-failed' }
    out.loc_verdict = gate(unit, `translation review #${r}`, tr)
    out.loc_issues = sev(tr.issues)
    if (out.loc_verdict === 'PASS' || r === maxRounds) break
    log(`${unit}: translation review #${r} REVISE ${JSON.stringify(out.loc_issues)} → re-localize #${r}`)
    const next = await write(localizePrompt(unit, r, jp.part, jp.round, loc.part, tr), `relocalize:${unit}#${r}`, 'Localize', 'loc', r, AGENT.localize)
    if (!next) return out
    loc = next
    out.loc_rounds += 1
  }
  out.validate_issues = loc.validate_issues
  out.parity_diff = loc.parity_diff
  // S135 L1: a PASS with machine issues left is not mergeable (merge --write would refuse anyway).
  // A reused JP part (B5) has no JP-only check in this run: the loc validate covers the whole unit.
  const clean = (jp.validate_issues === 0 || jp.validate_issues === null) && loc.validate_issues === 0 && loc.parity_diff === 0
  out.status = out.loc_verdict !== 'PASS' ? 'loc-rejected' : clean ? 'ready-to-merge' : 'needs-fix'
  return out
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const units = Array.isArray(parsed?.units) ? parsed.units : parsed?.unit ? [parsed.unit] : []
if (!units.length) throw new Error('need args {unit: "<unit_id>", run_tag: "<tag>"} or {units: [...], run_tag}')
if (units.some((u) => typeof u !== 'string' || !/^[a-z]+-\d{2}-\d{2}-u\d{2}$/.test(u))) throw new Error('unit ids look like "management-10-27-u02"')
// required: no clock in a workflow script, and a default tag would let a rerun overwrite reviewed parts
const RUN_TAG = parsed?.run_tag
if (typeof RUN_TAG !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(RUN_TAG)) throw new Error('need args.run_tag (new per run, [A-Za-z0-9_-]{1,40}, e.g. "20261027a")')
const maxRounds = Math.min(2, Math.max(1, Number(parsed?.max_rounds ?? 2)))
// Seeded start (S135 u02 attempt 2): round 0 revises an earlier run's JP part with the review of exactly
// that part (textbook-v2-seed.mjs checks the hash) instead of drafting from blank; ≤ maxRounds reviews
// still apply to this run. The seed is provenance only: merge approves the final part's own hash.
const seedKeys = ['seed_part', 'seed_journal', 'seed_review_round'].filter((k) => parsed?.[k] !== undefined)
if (seedKeys.length !== 0 && seedKeys.length !== 3) throw new Error('seed_part, seed_journal and seed_review_round go together')
const SEED = seedKeys.length === 3 ? { part: absolutize(parsed.seed_part), journal: absolutize(parsed.seed_journal), reviewRound: Number(parsed.seed_review_round) } : null
if (SEED && (!Number.isInteger(SEED.reviewRound) || SEED.reviewRound < 1)) throw new Error('seed_review_round: an integer ≥ 1')
if (SEED && units.length !== 1) throw new Error('a seeded run takes one unit')
if (SEED && !SEED.part.includes(`/${units[0]}.jp.r`)) throw new Error(`seed_part must be a JP part of ${units[0]}`)
if (SEED && SEED.part.includes(`/parts/${RUN_TAG}/`)) throw new Error('seed_part is from this run_tag: use a new run_tag')
// B5 loc seed (D-201 §0-2 loc-rejected): the JP part of the seed's run is reused as-is (the seed script checks its sha256
// against the seed's journal row); round 0 re-localises the seed with the translation review of exactly that part.
// merge then takes --journal <seed run> --journal <this run> (JP row + its PASS review are in the seed run).
const seedLocKeys = ['seed_loc_part', 'seed_loc_journal', 'seed_loc_review_round'].filter((k) => parsed?.[k] !== undefined)
if (seedLocKeys.length !== 0 && seedLocKeys.length !== 3) throw new Error('seed_loc_part, seed_loc_journal and seed_loc_review_round go together')
const SEED_LOC = seedLocKeys.length === 3 ? { part: absolutize(parsed.seed_loc_part), journal: absolutize(parsed.seed_loc_journal), reviewRound: Number(parsed.seed_loc_review_round) } : null
if (SEED && SEED_LOC) throw new Error('a JP seed or a loc seed, not both')
if (SEED_LOC && (!Number.isInteger(SEED_LOC.reviewRound) || SEED_LOC.reviewRound < 1)) throw new Error('seed_loc_review_round: an integer ≥ 1')
if (SEED_LOC && units.length !== 1) throw new Error('a seeded run takes one unit')
if (SEED_LOC && !SEED_LOC.part.includes(`/${units[0]}.loc.r`)) throw new Error(`seed_loc_part must be a loc part of ${units[0]}`)
if (SEED_LOC && SEED_LOC.part.includes(`/parts/${RUN_TAG}/`)) throw new Error('seed_loc_part is from this run_tag: use a new run_tag')

const results = await pipeline(units, (unit) => runUnit(unit, maxRounds))
const summary = results.map((r, i) => r ?? { unit: units[i], status: 'crashed' })
for (const s of summary) {
  log(`${s.unit}: ${s.status} — JP ${s.jp_rounds} draft(s) ${s.jp_verdict ?? '-'} ${JSON.stringify(s.jp_issues ?? {})}, loc ${s.loc_rounds ?? 0} ${s.loc_verdict ?? '-'} ${JSON.stringify(s.loc_issues ?? {})}, validate jp ${s.jp_validate_issues ?? '-'} / loc ${s.validate_issues ?? '-'}, parity ${s.parity_diff ?? '-'}`)
  if (s.status === 'ready-to-merge') log(`next: node scripts/textbook-v2-merge.mjs --unit ${s.unit} --journal <this run's journal.jsonl>`)
}
return { units: summary }
