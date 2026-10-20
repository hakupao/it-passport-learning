#!/usr/bin/env node
// S130 — explanation-content audit PILOT input builder (multi-exam, reusable).
//
// Builds a sample file in the same shape quiz-phase2-ruleA-prep.mjs emits (samples[] with
// stem_jp / choices_jp / correct_answer / has_figure / figure_png / figure_page_png /
// question_page_png / explanation), so scripts/quiz-phase2-ruleA.workflow.mjs can run on it.
//
// Population = every question in data/ip/quiz/questions.json that has an explanation, minus
// (with --exclude-audited) every question id mentioned in any
// evidence/phase5/stage_06_quiz_phase2/ruleA_result_*.json (audits[] ids + ids cited in
// summary-only files such as the S102 ones, which carry no audits[] array).
//
// Sampling = stratified by exam × has_figure, DETERMINISTIC (seeded mulberry32):
//   figure quota  = round(N * fig-ratio), non-figure quota = N - figure quota;
//   each quota is spread evenly over the exams that still have candidates in that stratum,
//   the remainder going to exams picked by a seeded shuffle; within a stratum, ids are sorted
//   then seeded-shuffled and the first k are taken. Shortfalls are re-spread to other exams.
//
// Display layer (what the learner sees): stem = translations/<exam>.json stem_jp_clean when
// non-empty (this is also where 中問 preambles are merged), else questions.json stem_jp — same
// rule as apps/web/src/lib/quiz/quizModel.ts. Choices = questions.json choices_jp (no clean
// override exists for choices). Figure page = source.figure_page_image ?? page_image (D-145).
//
// --ids-from <args.json> skips sampling and uses that file's items[].id (or ids[]) in its order
// (e.g. re-run the pilot ids as a calibration set). --batch-size K (>1) also writes per-batch
// manifests <out-prefix>_batches/batch_NNN.json (K ids each, in id order) and the args for
// scripts/quiz-expl-audit.workflow.mjs ({input_path, ids, batch_size, batch_dir, parts_dir, model, label}).
//
// --targeted (with --exclude-audited) replaces the stratified draw: ALL remaining figure questions
// (seeded cap at --n if they exceed it), then non-figure questions ranked by calculation / logic /
// procedure keywords in the displayed stem (distinct keywords desc, occurrences desc, seeded order)
// until --n. --exclude-s102-figures also drops every has_figure question of the three S102 exams,
// whose summary-only results record few ids although S102 audited all their figures.
//
// Run:  node scripts/quiz-expl-audit-prep-S130.mjs [--n 100] [--seed 130] [--fig-ratio 0.3]
//         [--exclude-audited] [--out-prefix eaudit_pilot]
//       node scripts/quiz-expl-audit-prep-S130.mjs --ids-from <args.json> --batch-size 5
//         --out-prefix ecal --label ecal [--model sonnet]

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const EXPL_DIR = path.join(ROOT, "data/ip/quiz/explanations");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const RAW_BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const FIG_DIR = path.join(ROOT, "data/ip/exams/figures");
const EXAMS_DIR = path.join(ROOT, "data/ip/exams");
const AUDIT_DIR = path.join(ROOT, "evidence/phase5/stage_06_quiz_phase2");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase2");

function fail(m) {
  console.error(`✗ quiz-expl-audit-prep-S130: ${m}`);
  process.exit(1);
}

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : dflt;
};
const N = Number(opt("n", 100));
const SEED = Number(opt("seed", 130));
const FIG_RATIO = Number(opt("fig-ratio", 0.3));
const EXCLUDE_AUDITED = argv.includes("--exclude-audited");
const TARGETED = argv.includes("--targeted");
const EXCLUDE_S102_FIG = argv.includes("--exclude-s102-figures");
const S102_EXAMS = ["2023r05", "2024r06", "2026r08"];
const OUT_PREFIX = opt("out-prefix", "eaudit_pilot");
const IDS_FROM = opt("ids-from", null);
const BATCH_SIZE = Number(opt("batch-size", 1));
const LABEL = opt("label", OUT_PREFIX);
const MODEL = opt("model", "sonnet");
if (!Number.isInteger(BATCH_SIZE) || BATCH_SIZE <= 0) fail(`bad --batch-size ${BATCH_SIZE}`);
if (!Number.isInteger(N) || N <= 0) fail(`bad --n ${N}`);
if (!Number.isInteger(SEED)) fail(`bad --seed ${SEED}`);

// mulberry32 — tiny seeded PRNG, reproducible across Node versions.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const questions = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions;
const exams = [...new Set(questions.map((q) => q.exam_id))].sort();

// sidecars per exam
const explById = {};
const trById = {};
for (const e of exams) {
  const ef = path.join(EXPL_DIR, `${e}.json`);
  if (!existsSync(ef)) fail(`explanation sidecar missing: ${ef}`);
  Object.assign(explById, JSON.parse(readFileSync(ef, "utf-8")).questions);
  const tf = path.join(TR_DIR, `${e}.json`);
  if (existsSync(tf)) Object.assign(trById, JSON.parse(readFileSync(tf, "utf-8")).questions);
}
const displayStem = (q) => trById[q.id]?.stem_jp_clean?.trim() ? trById[q.id].stem_jp_clean : q.stem_jp;

// D-145 page lookup
const rawBank = JSON.parse(readFileSync(RAW_BANK, "utf-8"));
const figPageById = new Map();
const qPageById = new Map();
for (const rq of rawBank.questions ?? rawBank) {
  const rid = rq.id ?? rq.question_id;
  const s = rq.source;
  if (!rid || !s?.page_image) continue;
  qPageById.set(rid, path.join(EXAMS_DIR, s.page_image));
  figPageById.set(rid, path.join(EXAMS_DIR, s.figure_page_image ?? s.page_image));
}

// already-audited ids
const audited = new Set();
const auditFiles = readdirSync(AUDIT_DIR).filter((f) => /^ruleA_result_.*\.json$/.test(f)).sort();
for (const f of auditFiles) {
  const text = readFileSync(path.join(AUDIT_DIR, f), "utf-8");
  for (const m of text.match(/\b20\d\d[a-z0-9]+-q\d{3}\b/g) ?? []) audited.add(m);
}

const missingExpl = questions.filter((q) => !explById[q.id]).map((q) => q.id);
const s102Fig = (q) => EXCLUDE_S102_FIG && q.has_figure && S102_EXAMS.includes(q.exam_id);
const population = questions
  .filter((q) => explById[q.id] && !(EXCLUDE_AUDITED && audited.has(q.id)) && !s102Fig(q))
  .sort((a, b) => a.id.localeCompare(b.id));

// strata: exam × has_figure
const strata = {};
for (const e of exams) strata[e] = { fig: [], plain: [] };
for (const q of population) strata[q.exam_id][q.has_figure ? "fig" : "plain"].push(q);

// allocate `quota` over exams evenly with seeded remainder, capped by stratum size,
// re-spreading any shortfall until the quota is met or candidates run out.
function allocate(kind, quota) {
  const alloc = Object.fromEntries(exams.map((e) => [e, 0]));
  let left = quota;
  while (left > 0) {
    const open = exams.filter((e) => strata[e][kind].length > alloc[e]);
    if (!open.length) break;
    const base = Math.floor(left / open.length);
    const extra = new Set(shuffle([...open].sort()).slice(0, left % open.length));
    let given = 0;
    for (const e of open) {
      const want = base + (extra.has(e) ? 1 : 0);
      const add = Math.min(want, strata[e][kind].length - alloc[e]);
      alloc[e] += add;
      given += add;
    }
    left -= given;
    if (given === 0) break;
  }
  return alloc;
}
const figQuota = Math.round(N * FIG_RATIO);
const figAlloc = allocate("fig", figQuota);
const plainAlloc = allocate("plain", N - figQuota);

// calculation / logic / procedure cues in the displayed stem. `式` / `セル` skip common
// non-formula compounds (方式・形式・株式… / キャンセル・セルフ).
const KEYWORDS = ["求め", "幾つ", "いくら", "幾ら", "何%", "何％", "何円", "何時間", "何日", "何件", "何個", "何ビット", "何バイト", "流れ図", "擬似言語", "関数", "式", "セル", "表計算", "論理式", "真理値", "処理手順", "アルゴリズム", "期待値", "損益", "利益", "原価", "稼働率", "MTBF"];
const NOISE = { 式: /(方|形|株|様|正|儀|図|書|旧|新|一)式|式典/g, セル: /キャンセル|セルフ|セールス/g };
function keywordScore(stem) {
  const matched = [];
  let hits = 0;
  for (const k of KEYWORDS) {
    const text = NOISE[k] ? stem.replace(NOISE[k], "") : stem;
    const n = text.split(k).length - 1;
    if (n > 0) { matched.push(k); hits += n; }
  }
  return { distinct: matched.length, hits, matched };
}
const kwById = new Map();
let targetedMeta = null;
let picked = [];
if (IDS_FROM) {
  const src = JSON.parse(readFileSync(path.resolve(ROOT, IDS_FROM), "utf-8"));
  const wanted = src.ids ?? (src.items ?? []).map((it) => it.id);
  if (!wanted.length) fail(`no ids in ${IDS_FROM}`);
  const byId = new Map(questions.map((q) => [q.id, q]));
  picked = wanted.map((id) => byId.get(id) ?? fail(`unknown id ${id} in ${IDS_FROM}`));
  if (new Set(wanted).size !== wanted.length) fail(`duplicate ids in ${IDS_FROM}`);
  if (picked.some((q) => !explById[q.id])) fail(`id without explanation in ${IDS_FROM}`);
} else if (TARGETED) {
  const figs = population.filter((q) => q.has_figure);
  picked = figs.length > N ? shuffle(figs).slice(0, N) : [...figs];
  const scored = shuffle(population.filter((q) => !q.has_figure))
    .map((q, order) => ({ q, order, ...keywordScore(displayStem(q)) }))
    .filter((x) => x.distinct > 0)
    .sort((a, b) => b.distinct - a.distinct || b.hits - a.hits || a.order - b.order);
  for (const x of scored.slice(0, Math.max(0, N - picked.length))) {
    picked.push(x.q);
    kwById.set(x.q.id, x.matched);
  }
  targetedMeta = { fig_pool: figs.length, plain_candidates: scored.length, plain_min_distinct: picked.length > figs.length ? kwById.get(picked.at(-1).id).length : null };
  picked.sort((a, b) => a.id.localeCompare(b.id));
} else {
  for (const e of exams) {
    for (const [kind, alloc] of [["fig", figAlloc], ["plain", plainAlloc]]) {
      picked.push(...shuffle(strata[e][kind]).slice(0, alloc[e]));
    }
  }
  picked.sort((a, b) => a.id.localeCompare(b.id));
}

const figPng = (name) => {
  const p = path.join(FIG_DIR, `${name}.png`);
  if (!existsSync(p)) fail(`figure png missing: ${p}`);
  return p;
};
const samples = picked.map((q) => {
  const figPage = q.has_figure ? figPageById.get(q.id) ?? null : null;
  const qPage = qPageById.get(q.id) ?? null;
  if (q.has_figure && (!figPage || !existsSync(figPage))) fail(`figure page missing for ${q.id}: ${figPage}`);
  return {
    id: q.id,
    exam_id: q.exam_id,
    stem_jp: displayStem(q),
    stem_source: trById[q.id]?.stem_jp_clean?.trim() ? "stem_jp_clean" : "questions.stem_jp",
    choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
    correct_answer: q.correct_answer,
    has_figure: q.has_figure,
    figure_type: q.figure_type ?? null,
    figure_png: q.has_figure && q.figure ? figPng(q.figure) : null,
    choice_figure_pngs: q.choice_figures
      ? Object.fromEntries(Object.entries(q.choice_figures).map(([k, v]) => [k, figPng(v)]))
      : null,
    figure_page_png: figPage,
    question_page_png: q.has_figure && figPage && qPage && figPage !== qPage ? qPage : null,
    ...(TARGETED ? { target_reason: q.has_figure ? "figure" : `keywords:${kwById.get(q.id).join("|")}` } : {}),
    explanation: explById[q.id],
  };
});

const inputFile = path.join(OUT_DIR, `${OUT_PREFIX}_input.json`);
const argsFile = path.join(OUT_DIR, `${OUT_PREFIX}_workflow_args.json`);
const meta = {
  generated_by: "scripts/quiz-expl-audit-prep-S130.mjs",
  ids_from: IDS_FROM,
  targeted: TARGETED ? { ...targetedMeta, keywords: KEYWORDS } : null,
  exclude_s102_figures: EXCLUDE_S102_FIG,
  n_requested: N,
  seed: SEED,
  prng: "mulberry32",
  fig_ratio: FIG_RATIO,
  exclude_audited: EXCLUDE_AUDITED,
  audit_files: auditFiles.length,
  audited_ids: audited.size,
  corpus: questions.length,
  missing_explanation: missingExpl.length,
  population: population.length,
  population_fig: population.filter((q) => q.has_figure).length,
  alloc: IDS_FROM || TARGETED ? null : Object.fromEntries(exams.map((e) => [e, { fig: figAlloc[e], plain: plainAlloc[e], pop_fig: strata[e].fig.length, pop_plain: strata[e].plain.length }])),
};
writeFileSync(inputFile, JSON.stringify({ ...meta, n: samples.length, samples }, null, 2) + "\n");
let wfArgs = { input_path: path.relative(ROOT, inputFile), items: samples.map((s) => ({ id: s.id, has_figure: s.has_figure })) };
let batchDir = null;
if (BATCH_SIZE > 1) {
  batchDir = path.join(OUT_DIR, `${OUT_PREFIX}_batches`);
  rmSync(batchDir, { recursive: true, force: true });
  mkdirSync(batchDir, { recursive: true });
  for (let i = 0, k = 1; i < samples.length; i += BATCH_SIZE, k++) {
    const part = samples.slice(i, i + BATCH_SIZE);
    writeFileSync(path.join(batchDir, `batch_${String(k).padStart(3, "0")}.json`), JSON.stringify({ batch: k, n: part.length, samples: part }, null, 2) + "\n");
  }
  wfArgs = {
    input_path: path.relative(ROOT, inputFile),
    ids: samples.map((s) => s.id),
    batch_size: BATCH_SIZE,
    batch_dir: path.relative(ROOT, batchDir),
    parts_dir: `data/ip/quiz/.phase2/eaudit_parts/${LABEL}`,
    model: MODEL,
    label: LABEL,
  };
}
writeFileSync(argsFile, JSON.stringify(wfArgs, null, 2) + "\n");

const nFig = samples.filter((s) => s.has_figure).length;
console.log(`✓ quiz-expl-audit-prep-S130 (seed ${SEED}, mulberry32)`);
console.log(`  corpus ${questions.length} / missing expl ${missingExpl.length} / audited ids ${audited.size} (${auditFiles.length} files)`);
console.log(`  population ${population.length} (fig ${meta.population_fig})`);
console.log(`  sampled ${samples.length} → fig ${nFig} (${((100 * nFig) / samples.length).toFixed(1)}%), exams ${new Set(samples.map((s) => s.exam_id)).size}, stem_jp_clean ${samples.filter((s) => s.stem_source === "stem_jp_clean").length}, choice-figure ${samples.filter((s) => s.choice_figure_pngs).length}`);
console.log(`  out  ${path.relative(ROOT, inputFile)}`);
console.log(`  args ${path.relative(ROOT, argsFile)}`);
if (batchDir) console.log(`  batches ${Math.ceil(samples.length / BATCH_SIZE)} × ≤${BATCH_SIZE} → ${path.relative(ROOT, batchDir)}/ (label ${LABEL}, model ${MODEL})`);
