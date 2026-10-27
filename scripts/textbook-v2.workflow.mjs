export const meta = {
  name: 'textbook-v2',
  description: 'Stage 7 Phase 3 教科書 v2 生成 (D-196 §0-13): JP 執筆 → JP 審査 (≤2 輪) → zh/en 意訳・現地化 → 訳審査 (≤2 輪)。各 agent は part file を書き、計数だけを返す',
  whenToUse: 'scripts/textbook-v2-prep.mjs --unit <id> の後。args = {unit: "<unit_id>"} (または {units: [...]})。終了後 textbook-v2-merge.mjs --unit <id> --journal <journal.jsonl>',
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
//   parts/<unit>.jp.r<N>.json      JP part, N = 0 first draft, N = k revision after review k
//   parts/<unit>.loc.r<N>.json     localised part (= the JP part + _zh / _en, label zh / en; jp_round)
// Every agent returns only {unit_id, stage, round, part?, counts / verdict, issues…} as StructuredOutput;
// the runtime logs it to journal.jsonl, which scripts/textbook-v2-merge.mjs reads to pick the final
// parts (S121: the journal is the record; the part's structure counts are cross-checked against it).
// Reviewers (critic / code-reviewer have no Write tool) return their findings in the StructuredOutput
// only; the revise prompt passes them on. The workflow's own return is counts + verdicts only.
// No fs / Date.now / Math.random here (resume): ROOT is hard-coded like quiz-expl-audit.workflow.mjs.
// ─────────────────────────────────────────────────────────────────────────────

const ROOT = '/Volumes/DevSSD/Project/IT-Passport-Learning'
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
const PART_RESULT = (stage) => ({
  type: 'object',
  required: ['unit_id', 'stage', 'round', 'part', 'counts', 'validate_issues'].concat(stage === 'loc' ? ['jp_round', 'parity_diff'] : []),
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    stage: { type: "string", enum: [stage] },
    round: { type: 'integer', minimum: 0 },
    part: { type: 'string', description: '書いた part file の絶対パス' },
    counts: { ...COUNTS, description: 'validate --part が最後に出力した `counts {...}` 行の JSON をそのまま' },
    validate_issues: { type: 'integer', minimum: 0, description: '最後の validate --part の issue 数 (0 が目標)' },
    ...(stage === 'loc'
      ? {
          jp_round: { type: 'integer', minimum: 0 },
          parity_diff: { type: 'integer', minimum: 0, description: '最後の parity --part の差分箇所数' },
        }
      : {}),
  },
})
const REVIEW_RESULT = (stage) => ({
  type: 'object',
  required: ['unit_id', 'stage', 'round', 'reviewed_round', 'verdict', 'issues'],
  additionalProperties: false,
  properties: {
    unit_id: { type: 'string' },
    stage: { type: "string", enum: [stage] },
    round: { type: 'integer', minimum: 1, description: '審査の回 (1 or 2)' },
    reviewed_round: { type: 'integer', minimum: 0, description: '審査した part の round' },
    verdict: { type: 'string', enum: ['PASS', 'REVISE'], description: 'PASS = high / medium の issue が 0' },
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
const partOf = (unit, stage, round) => `${dirOf(unit)}/parts/${unit}.${stage}.r${round}.json`
const validateCmd = (part, jp) => `node ${ROOT}/scripts/textbook-v2-validate.mjs --part ${part}${jp ? ` --jp ${jp}` : ''}`
const parityCmd = (part) => `node ${ROOT}/scripts/textbook-v2-parity.mjs --part ${part}`

const READ_MANIFEST = (unit) => `\`${manifestOf(unit)}\` を**全部** Read する (約 3,500 行: offset で分けて最後まで)。中身: d195 (D-195 全文 = 文体・構成・図の規則)、topic.objective_jp (シラバス)、terms (見出し語、順序固定)、v1 (現行版)、questions / term_questions (関連過去問: 題文・正解・解説要約・中問組 chumon_group)、figures (図種 kinds・types_ts = v2 の型定義・svg_available)、rules (validateV2 の上限と禁止句)、output_schema (JP part の JSON Schema)。`

function writerPrompt(unit, round, prev, review) {
  const part = partOf(unit, 'jp', round)
  const revise = prev
    ? `\n## 改稿 (round ${round})\n前稿 \`${prev}\` を Read し、下の審査指摘を**全部**直した版を書く。指摘されていない箇所は理由なく変えない。\n\`\`\`json\n${JSON.stringify(review.issues, null, 1)}\n\`\`\`\n`
    : ''
  return `あなたは IT パスポート試験の教科書執筆者です。単元 \`${unit}\` を D-195 の規則で**日本語で**書き直します (zh / en は後工程で意訳する。あなたは日本語だけ)。

## 入力
${READ_MANIFEST(unit)}
${revise}
## 書くもの = JP part (manifest.output_schema に従う JSON)
- \`unit_id\`="${unit}", \`stage\`="jp", \`round\`=${round}。
- terms: manifest.terms と**同じ見出し語・同じ順** (増減・改名禁止)。各用語: one_jp (一句話 1 文、キーワードは **語**) → fig (図: D-195 §2 で選ぶ。不要なら null) → detail_jp (展開 2〜3 文) → analogy_jp (比喩、平文。無理なら "") / hook_jp (記法: 定義の言い換え禁止、語源・字形・対比など別の手がかり。無ければ省略) → points (考点: kind "exam" は根拠の過去問 id を qids に必ず入れる、"mix" は易混) → quiz (この用語の過去問 id: manifest.term_questions[用語] から 1〜3 題、中問組員 chumon_group≠null は避ける)。
- goals_jp (学習目標 3 前後)、overview_cols_jp + overview_rows (用語総表: 用語ごと 1 行、one_line_jp + 列ごとのセル extra_jp)、pairs (易混組: a が b より用語順で前、決め手の行に key:true)、key_points_jp (要点 3〜5)、challenge_questions (確認題: 本 topic の過去問 id、中問組員を除いて 3〜5 題。v1.challenge_questions を基に見直してよい)。
- 図: kind / mode は figures.kinds の組合せだけ (svg / table / compare / flow / tree / network)。型は figures.types_ts の FigSpec。ラベルは \`{"jp": "…"}\` だけ、分段の caption は \`caption_jp\` だけ書く (zh / en は後工程)。flow / tree の段階図は ${'`'}mode:"steps"${'`'} で 3〜4 step。network (アローダイアグラム等) は mode "widget"、工期は 0〜99 の整数、始点・終点は 1 つずつ、並行作業はダミーで。svg を使うなら figures.svg_available のパスだけ。
- 行内標記は **語** と [[jp:語]] の 2 種のみ (analogy・総表 extra・図ラベル・caption は平文)。
- 事実: topic.objective_jp と関連過去問の正解・解説要約に反することを書かない。数値・用語の定義は過去問の解説と照合する。捏造しない。
- D-195 §9 禁止: 定型の締め句 (「〜と理解しておきましょう」「試験では〜が問われます」の常用 → 試験の話は考点枠でだけ)、同義の言い換えの反復、1 文に見出し語を 3 つ以上「・、」で羅列 (分類の数を明示する 1 文「〜には A・B・C・D の 4 つがある」だけ例外 = D-197)、根拠のない誇張語。

## 手順
1. manifest を全部読む。関連過去問で、各用語が実際にどう問われるかを把握する。
2. JP part を \`${part}\` に Write (親ディレクトリが無ければ作る)。
3. \`${validateCmd(part)}\` を実行。issue が出たら part を直して再実行、**0 issue になるまで**繰り返す (最後の出力の \`counts {...}\` 行を控える)。0 にできない issue があれば残数をそのまま返す。
4. StructuredOutput で {unit_id, stage:"jp", round:${round}, part:"${part}", counts: (最後の counts 行の JSON), validate_issues: (最後の issue 数)} を返す。本文は返さない。`
}

function reviewPrompt(unit, round, part, partRound) {
  return `あなたは独立した教科書審査者 (Rule D: 執筆者とは別役割) です。単元 \`${unit}\` の JP 草稿を批判的に審査します。甘く通さない。

## 入力
- ${READ_MANIFEST(unit)}
- 審査対象: \`${part}\` (JP part, round ${partRound})。
- 機械検査: \`${validateCmd(part)}\` を実行し結果も見る (0 issue でも内容の審査は別)。

## 審査観点
1. **事実**: 定義・説明・考点・図 (数値、工期、因果、分類) が topic.objective_jp と関連過去問の正解・解説要約に照らして正しいか。exam 考点の qids の題が本当にその点を問うているか。quiz / challenge_questions の題がその用語・単元に合っているか。
2. **D-195 清單**: §1 一句話 1 文 + 太字キーワード / 展開 2〜3 文 / §2 図の選び方 (過程→段階図、量・計算→操作部品、その他→静的、別名だけの用語は図なし、飾りの図は不可) / §3 学習目標 + 総表 / §4 易混対比は 2 つ目の直後 / §5 強調 4 種 / §6 比喩・記法が定義の言い換えでない / §7 要点 3〜5 / §9 禁止事項 (定型の締め句、言い換えの反復、羅列、誇張)。
3. **初学者に分かるか**: 結論先行、用語の前提が先に説明されているか、図と文が噛み合うか。

## 判定
- verdict: high / medium の issue が 0 なら PASS、1 つでもあれば REVISE。
- issues: 1 件ずつ severity・where (JSON 位置)・rule (根拠)・detail_jp・fix_jp (具体的な直し方)。
- StructuredOutput で {unit_id:"${unit}", stage:"jp-review", round:${round}, reviewed_round:${partRound}, verdict, issues} を返す。ファイルは書かない。`
}

function localizePrompt(unit, round, jpPart, jpRound, prev, review) {
  const part = partOf(unit, 'loc', round)
  const revise = prev
    ? `\n## 改訳 (round ${round})\n前訳 \`${prev}\` を Read し、下の訳審査の指摘を**全部**直した版を書く。日本語は変えない。\n\`\`\`json\n${JSON.stringify(review.issues, null, 1)}\n\`\`\`\n`
    : ''
  return `あなたは IT パスポート教科書の訳者です。審査済みの日本語 part を中国語 (簡体・中国大陸) と英語に**意訳 + 現地化**します (直訳しない: 各言語の学習者が自然に読める文に。D-195 §8)。

## 入力
- ${READ_MANIFEST(unit)} 特に d195 と v1_terms (見出し語の zh / en 訳 = term_zh / term_en。本文の訳語もこれに揃える)。
- 原文: \`${jpPart}\` (JP part, round ${jpRound})。
${revise}
## 書くもの = 訳 part
- 原文 JSON を**そのまま写し**、次だけを足す: \`stage\`="loc"、\`round\`=${round}、\`jp_round\`=${jpRound}; 各 \`X_jp\` の隣に \`X_zh\` / \`X_en\` (goals / overview_cols / key_points の配列は同じ要素数)、図ラベル \`{"jp": …}\` に \`"zh"\` / \`"en"\`、caption_jp の隣に caption_zh / caption_en。
- 日本語・id・kind・mode・qids・quiz・key・数値・配列の要素数と順序は**1 文字も変えない** (merge が「訳 part から zh / en を除くと JP part と一致」を検査する)。
- 行内標記: 原文で **語** の箇所は訳文でも **訳語**。zh / en 本文中で試験の日本語表記を示すところは [[jp:日本語]] を併記 (D-195 §5 日本語原語の明示: 見出し語や試験用語の初出など、多用しない)。analogy・総表 extra・図ラベル・caption は平文。
- 文数: detail は各言語でも 2〜3 文 (en は ". " で区切って数えられる)。D-195 §9 の禁止 (定型の締め句、"make sure to understand"、"非常重要"、羅列、誇張) は zh / en にも適用。

## 手順
1. 訳 part を \`${part}\` に Write。
2. \`${validateCmd(part, jpPart)}\` と \`${parityCmd(part)}\` を実行し、**両方 0** になるまで直して再実行 (validate の最後の \`counts {...}\` 行を控える)。
3. StructuredOutput で {unit_id, stage:"loc", round:${round}, jp_round:${jpRound}, part:"${part}", counts, validate_issues, parity_diff} を返す。本文は返さない。`
}

function trReviewPrompt(unit, round, part, partRound, jpPart) {
  return `あなたは独立した訳審査者 (Rule D: 訳者とは別役割) です。単元 \`${unit}\` の zh / en 訳を日本語原文と突き合わせて審査します。

## 入力
- ${READ_MANIFEST(unit)}
- 原文 JP part: \`${jpPart}\` / 訳 part: \`${part}\` (round ${partRound})。
- 機械検査: \`${validateCmd(part, jpPart)}\` と \`${parityCmd(part)}\` を実行し結果も見る。

## 審査観点
1. **意味の一致**: 各 zh / en が jp と同じ事実・同じ主張か (欠落・付加・数値ずれ・因果の逆転・考点の意味変化)。図ラベル・caption・総表・易混表も含む。
2. **現地化**: 直訳調でなく自然か。zh は中国大陸の簡体・IT 用語 (日式借词でない)、en は自然な学習者向け英語。見出し語の訳が v1_terms の term_zh / term_en と揃っているか。
3. **標記**: **語** が原文と対応、[[jp:…]] が試験の日本語表記を正しく示し、過剰でないか。
4. **構造**: 三語で文数・項目数・順序が揃うか (parity)。D-195 §9 の禁止事項が zh / en に出ていないか。

## 判定
- verdict: high / medium の issue が 0 なら PASS、1 つでもあれば REVISE。
- issues: severity・where (例 terms[1].detail_en)・rule・detail_jp・fix_jp。
- StructuredOutput で {unit_id:"${unit}", stage:"loc-review", round:${round}, reviewed_round:${partRound}, verdict, issues} を返す。ファイルは書かない。`
}

const sev = (issues) => (issues || []).reduce((m, i) => { m[i.severity] = (m[i.severity] || 0) + 1; return m }, {})

/** One unit through write → review (≤ maxRounds) → localize → translation review (≤ maxRounds). */
async function runUnit(unit, maxRounds) {
  const out = { unit, status: 'running', jp_rounds: 0, jp_verdict: null, jp_issues: {}, loc_rounds: 0, loc_verdict: null, loc_issues: {}, parts: [], validate_issues: null, parity_diff: null }

  // ---- JP: write, review, revise ----
  let jp = await agent(writerPrompt(unit, 0, null, null), { label: `write:${unit}#0`, phase: 'Write', schema: PART_RESULT('jp'), model: MODEL, agentType: AGENT.write })
  if (!jp) return { ...out, status: 'jp-write-failed' }
  out.parts.push(jp.part)
  out.jp_rounds = 1
  let review = null
  for (let r = 1; r <= maxRounds; r++) {
    review = await agent(reviewPrompt(unit, r, jp.part, jp.round), { label: `review:${unit}#${r}`, phase: 'Review', schema: REVIEW_RESULT('jp-review'), model: MODEL, agentType: AGENT.review })
    if (!review) return { ...out, status: 'jp-review-failed' }
    out.jp_verdict = review.verdict
    out.jp_issues = sev(review.issues)
    if (review.verdict === 'PASS' || r === maxRounds) break
    log(`${unit}: JP review #${r} REVISE ${JSON.stringify(out.jp_issues)} → rewrite #${r}`)
    const next = await agent(writerPrompt(unit, r, jp.part, review), { label: `rewrite:${unit}#${r}`, phase: 'Write', schema: PART_RESULT('jp'), model: MODEL, agentType: AGENT.write })
    if (!next) return { ...out, status: 'jp-write-failed' }
    jp = next
    out.parts.push(jp.part)
    out.jp_rounds += 1
  }
  if (review.verdict !== 'PASS') {
    log(`${unit}: JP review still REVISE after ${maxRounds} round(s) — stop (Rule B archive)`)
    return { ...out, status: 'jp-rejected' }
  }

  // ---- zh / en: localize, review, revise ----
  let loc = await agent(localizePrompt(unit, 0, jp.part, jp.round, null, null), { label: `localize:${unit}#0`, phase: 'Localize', schema: PART_RESULT('loc'), model: MODEL, agentType: AGENT.localize })
  if (!loc) return { ...out, status: 'loc-write-failed' }
  out.parts.push(loc.part)
  out.loc_rounds = 1
  let tr = null
  for (let r = 1; r <= maxRounds; r++) {
    tr = await agent(trReviewPrompt(unit, r, loc.part, loc.round, jp.part), { label: `tr-review:${unit}#${r}`, phase: 'TrReview', schema: REVIEW_RESULT('loc-review'), model: MODEL, agentType: AGENT.trReview })
    if (!tr) return { ...out, status: 'loc-review-failed' }
    out.loc_verdict = tr.verdict
    out.loc_issues = sev(tr.issues)
    if (tr.verdict === 'PASS' || r === maxRounds) break
    log(`${unit}: translation review #${r} REVISE ${JSON.stringify(out.loc_issues)} → re-localize #${r}`)
    const next = await agent(localizePrompt(unit, r, jp.part, jp.round, loc.part, tr), { label: `relocalize:${unit}#${r}`, phase: 'Localize', schema: PART_RESULT('loc'), model: MODEL, agentType: AGENT.localize })
    if (!next) return { ...out, status: 'loc-write-failed' }
    loc = next
    out.parts.push(loc.part)
    out.loc_rounds += 1
  }
  out.validate_issues = loc.validate_issues
  out.parity_diff = loc.parity_diff
  out.status = tr.verdict === 'PASS' ? 'ready-to-merge' : 'loc-rejected'
  return out
}

const parsed = typeof args === 'string' ? JSON.parse(args) : args
const units = Array.isArray(parsed?.units) ? parsed.units : parsed?.unit ? [parsed.unit] : []
if (!units.length) throw new Error('need args {unit: "<unit_id>"} or {units: [...]}')
if (units.some((u) => typeof u !== 'string' || !/^[a-z]+-\d{2}-\d{2}-u\d{2}$/.test(u))) throw new Error('unit ids look like "management-10-27-u02"')
const maxRounds = Math.min(2, Math.max(1, Number(parsed?.max_rounds ?? 2)))

const results = await pipeline(units, (unit) => runUnit(unit, maxRounds))
const summary = results.map((r, i) => r ?? { unit: units[i], status: 'crashed' })
for (const s of summary) {
  log(`${s.unit}: ${s.status} — JP ${s.jp_rounds} draft(s) ${s.jp_verdict ?? '-'} ${JSON.stringify(s.jp_issues ?? {})}, loc ${s.loc_rounds ?? 0} ${s.loc_verdict ?? '-'} ${JSON.stringify(s.loc_issues ?? {})}`)
  if (s.status === 'ready-to-merge') log(`next: node scripts/textbook-v2-merge.mjs --unit ${s.unit} --journal <this run's journal.jsonl>`)
}
return { units: summary }
