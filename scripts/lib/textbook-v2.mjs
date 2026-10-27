// Stage 7 Phase 3 Task 9 (D-196 §0-9 / §0-13) — shared helpers of the textbook v2 pipeline
// (textbook-v2-prep / -validate / -merge / -parity). Plain .mjs, no deps.
//
// The validator itself is NOT here: every check lives in apps/web/src/lib/textbook/validateV2.ts,
// imported with Node's native type stripping (loadV2). This module only
//   - resolves paths under one data root (`--data-root`, default <repo>/data/ip) so tests can
//     point every read and write at a temp copy,
//   - turns a writer part (JP-only or localised) + the prep manifest into a full v2 unit whose
//     v1-compat fields are derived with validateV2's own exported formulas (stripInline /
//     introOf / hookLines), i.e. the same assembly the merge script writes,
//   - counts per-language structure for the parity script,
//   - reads the workflow journal.jsonl (S121: the journal is the record of what each agent returned).

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const LANGS = ["jp", "zh", "en"];
export const V1_SCHEMA = "stage4-unit-v1-trilingual";
export const MANIFEST_SCHEMA = "textbook-v2-manifest-1";
export const UNIT_ID_RE = /^[a-z]+-\d{2}-\d{2}-u\d{2}$/;

export const readJson = (f) => JSON.parse(readFileSync(f, "utf-8"));
/** sha256 (hex) of a file's bytes: the identity of a part across journal rows, reviews and merge. */
export const sha256File = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
/** Workflow run tag (parts/<tag>/…): a rerun with a new tag never overwrites a reviewed part. */
export const RUN_TAG_RE = /^[A-Za-z0-9_-]{1,40}$/;
export const jsonText = (o) => `${JSON.stringify(o, null, 2)}\n`;

/** `--name value` / `--flag` parser; unknown flags throw. spec = { name: "string" | "bool" | "list" } (list = repeatable). */
export function parseArgs(argv, spec) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`unexpected argument ${a}`);
    const k = a.slice(2);
    if (!(k in spec)) throw new Error(`unknown option ${a}`);
    if (spec[k] === "bool") out[k] = true;
    else {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
      if (spec[k] === "list") (out[k] ??= []).push(v);
      else out[k] = v;
    }
  }
  return out;
}

/** Every path the pipeline touches, under one data root (= data/ip). */
export function dataPaths(dataRoot = path.join(REPO, "data/ip")) {
  const tb = path.join(dataRoot, "textbook");
  const planning = (unit) => path.join(tb, ".planning/v2", unit);
  return {
    root: dataRoot,
    tb,
    index: path.join(tb, "unit_index.json"),
    unit: (unit) => path.join(tb, "units", `${unit}.json`),
    questions: path.join(dataRoot, "quiz/questions.json"),
    chumon: path.join(dataRoot, "quiz/chumon_groups.json"),
    explanations: (exam) => path.join(dataRoot, "quiz/explanations", `${exam}.json`),
    translations: (exam) => path.join(dataRoot, "quiz/translations", `${exam}.json`),
    planning,
    manifest: (unit) => path.join(planning(unit), "manifest.json"),
    parts: (unit, tag) => path.join(planning(unit), "parts", tag),
    merged: (unit) => path.join(planning(unit), "merged.json"),
    v1Original: (unit) => path.join(planning(unit), "v1-original.json"),
  };
}

let v2mod = null;
/** apps/web/src/lib/textbook/validateV2.ts (native type stripping; Node ≥ 22.18 / 23.6). */
export async function loadV2() {
  v2mod ??= await import(pathToFileURL(path.join(REPO, "apps/web/src/lib/textbook/validateV2.ts")).href);
  return v2mod;
}
/** What assemble() needs: validateV2 formulas + stripInline + V2_SCHEMA (from the web modules). */
export async function loadKit() {
  const v2 = await loadV2();
  const { stripInline } = await import(pathToFileURL(path.join(REPO, "apps/web/src/lib/textbook/inline.ts")).href);
  const { V2_SCHEMA } = await import(pathToFileURL(path.join(REPO, "apps/web/src/lib/textbook/types.ts")).href);
  return { v2, stripInline, introOf: v2.introOf, hookLines: v2.hookLines, V2_SCHEMA };
}

// ---- parts ----------------------------------------------------------------------

/** Fields a part carries besides content (removed before assembly). */
export const PART_META = ["unit_id", "stage", "round", "jp_round"];

const isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

/** Deep copy without zh / en: drops `*_zh` / `*_en` keys and the zh / en of {jp, zh, en} labels. */
export function stripLangs(v) {
  if (Array.isArray(v)) return v.map(stripLangs);
  if (!isObj(v)) return v;
  const out = {};
  for (const [k, x] of Object.entries(v)) {
    if (/_(zh|en)$/.test(k) || k === "zh" || k === "en") continue;
    out[k] = stripLangs(x);
  }
  return out;
}

/** Deep copy with zh / en filled from jp (JP-only part → a unit validateV2 can read). */
export function mirrorJp(v) {
  if (Array.isArray(v)) return v.map(mirrorJp);
  if (!isObj(v)) return v;
  const out = {};
  for (const [k, x] of Object.entries(v)) {
    out[k] = mirrorJp(x);
    if (k.endsWith("_jp")) {
      const base = k.slice(0, -3);
      out[`${base}_zh`] = mirrorJp(x);
      out[`${base}_en`] = mirrorJp(x);
    } else if (k === "jp" && typeof x === "string") {
      out.zh = x;
      out.en = x;
    }
  }
  return out;
}

const sortKeys = (v) =>
  Array.isArray(v) ? v.map(sortKeys) : isObj(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v;
export const canon = (v) => JSON.stringify(sortKeys(v));

/**
 * Localised part vs the JP part it was made from: identical once zh / en are removed
 * (same structure, same ids / kinds / qids / keys, Japanese untouched). [] = same.
 */
export function locVsJp(loc, jp) {
  const strip = (p) => {
    const o = stripLangs(p);
    for (const k of PART_META) delete o[k];
    return o;
  };
  const a = strip(loc);
  const b = strip(jp);
  if (canon(a) === canon(b)) return [];
  // name the first differing paths
  const diffs = [];
  const walk = (x, y, at) => {
    if (diffs.length >= 10) return;
    if (canon(x) === canon(y)) return;
    if (Array.isArray(x) && Array.isArray(y)) {
      if (x.length !== y.length) return void diffs.push(`${at}: ${x.length} items ≠ JP ${y.length}`);
      x.forEach((_, i) => walk(x[i], y[i], `${at}[${i}]`));
    } else if (isObj(x) && isObj(y)) {
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
        if (!(k in x)) diffs.push(`${at}.${k}: missing (JP has it)`);
        else if (!(k in y)) diffs.push(`${at}.${k}: not in the JP part`);
        else walk(x[k], y[k], `${at}.${k}`);
      }
    } else diffs.push(`${at}: ${JSON.stringify(x)?.slice(0, 60)} ≠ JP ${JSON.stringify(y)?.slice(0, 60)}`);
  };
  walk(a, b, "part");
  return diffs;
}

// ---- assembly (merge + validate --part) ------------------------------------------

/**
 * Every stored JP prose string of a part / unit, with its location: goals, 総表 (one_line, extra),
 * per term one / detail / analogy / hook / 考点, 易混 rows (label / a / b), key points.
 * (Figure labels / captions are not prose: they are left out.)
 */
export function jpProse(p) {
  const out = [];
  const add = (field, v) => {
    if (typeof v === "string" && v !== "") out.push([field, v]);
  };
  const list = (field, v) => (Array.isArray(v) ? v.forEach((x, i) => add(`${field}[${i}]`, x)) : undefined);
  list("goals_jp", p.goals_jp);
  (Array.isArray(p.overview_rows) ? p.overview_rows : []).forEach((r, i) => {
    add(`overview_rows[${i}].one_line_jp`, r?.one_line_jp);
    list(`overview_rows[${i}].extra_jp`, r?.extra_jp);
  });
  (Array.isArray(p.terms) ? p.terms : []).forEach((t, i) => {
    const at = `terms[${i}](${t?.term})`;
    for (const b of ["one", "detail", "analogy", "hook"]) add(`${at}.${b}_jp`, t?.[`${b}_jp`]);
    (Array.isArray(t?.points) ? t.points : []).forEach((x, k) => add(`${at}.points[${k}].text_jp`, x?.text_jp));
  });
  (Array.isArray(p.pairs) ? p.pairs : []).forEach((pr, i) =>
    (Array.isArray(pr?.rows) ? pr.rows : []).forEach((r, k) => {
      for (const b of ["label", "a", "b"]) add(`pairs[${i}].rows[${k}].${b}_jp`, r?.[`${b}_jp`]);
    }),
  );
  list("key_points_jp", p.key_points_jp);
  return out;
}

/**
 * est_minutes (§0-13, coordinator decision S135 M4): all stored JP prose except the 総表 (one + detail
 * + analogy + hook + 考点 + 易混 rows + key points + goals), markers and whitespace removed, at the
 * v1 measured pace of 80 字/分 (v1 p50 ≈ 85), rounded up, at least 3:
 *   est_minutes = max(3, ceil(n / 80))
 */
export const EST_CHARS_PER_MIN = 80;
export const EST_MIN = 3;
export function estMinutes(p, stripInline) {
  const n = jpProse(p)
    .filter(([f]) => !f.startsWith("overview_rows"))
    .reduce((a, [, s]) => a + stripInline(s).replace(/\s/g, "").length, 0);
  return Math.max(EST_MIN, Math.ceil(n / EST_CHARS_PER_MIN));
}

/**
 * Copy guard (S135 M3): past-question text must not be reproduced. Normalised = markers, whitespace,
 * punctuation and symbols removed. Any run of COPY_MIN normalised characters of a stored JP prose
 * string that also occurs in a manifest question's stem / choices / explanation → one `copy` issue
 * per prose string (the first hit, with the question id).
 */
export const COPY_MIN = 20;
export const normCopy = (s, stripInline) => stripInline(s).replace(/[\s\p{P}\p{S}]/gu, "");
/** The manifest question texts (stem / choices / explanation), joined back from their line arrays. */
export function questionTexts(manifest) {
  const out = [];
  for (const [id, q] of Object.entries(manifest.questions ?? {})) {
    const join = (v) => (Array.isArray(v) ? v.join("") : typeof v === "string" ? v : "");
    out.push([id, join(q.stem_jp)], [id, join(q.expl_correct_jp)]);
    for (const c of Object.values(q.choices_jp ?? {})) out.push([id, join(c)]);
    for (const p of q.expl_points_jp ?? []) out.push([id, join(p)]);
  }
  return out;
}
export function copyIssues(p, manifest, stripInline, unitId = p.unit_id) {
  const grams = new Map();
  for (const [id, text] of questionTexts(manifest)) {
    const n = normCopy(text, stripInline);
    for (let i = 0; i + COPY_MIN <= n.length; i++) if (!grams.has(n.slice(i, i + COPY_MIN))) grams.set(n.slice(i, i + COPY_MIN), id);
  }
  const out = [];
  for (const [field, s] of jpProse(p)) {
    const n = normCopy(s, stripInline);
    for (let i = 0; i + COPY_MIN <= n.length; i++) {
      const id = grams.get(n.slice(i, i + COPY_MIN));
      if (id) {
        out.push({ unitId, code: "copy", field, message: `${COPY_MIN}+ characters copied from ${id}: 「${n.slice(i, i + COPY_MIN)}…」 — write your own sentence` });
        break;
      }
    }
  }
  return out;
}

/** Long text → lines for the manifest (Read truncates long lines): split at newlines, then after 。 beyond 200 chars. */
export function toLines(s) {
  if (typeof s !== "string") return s;
  const out = [];
  for (const line of s.split("\n")) {
    let cur = "";
    for (const ch of line) {
      cur += ch;
      if (cur.length >= 200 && ch === "。") {
        out.push(cur);
        cur = "";
      }
    }
    if (cur !== "" || line === "") out.push(cur);
  }
  return out;
}

/** v1 `figure` object for an svg path, from the v1 unit (any term), else a minimal v1-shaped one. */
function v1FigureFor(v1, svgPath) {
  for (const t of v1.terms ?? []) if (t.figure?.svg_path === svgPath) return t.figure;
  return { mermaid: "", svg_path: svgPath, rendered: true };
}

/**
 * A full v2 unit from a part (all three languages; for a JP-only part pass a mirrorJp copy) and
 * the manifest. Carried from the v1 original: ids, titles, unit_summary_*, order_in_topic,
 * prerequisites, source_figures, freq_badge, term_zh / term_en (manifest v1_terms). Compat fields
 * derived exactly as validateV2 checks them.
 */
export function assemble(part, manifest, { stripInline, introOf, hookLines, V2_SCHEMA }) {
  const v1 = manifest.v1;
  const gl = new Map(manifest.v1_terms.map((t) => [t.term, t]));
  const terms = (part.terms ?? []).map((t) => {
    const g = gl.get(t.term) ?? {};
    const out = { term: t.term, term_zh: g.term_zh, term_en: g.term_en };
    for (const base of ["one", "detail", "analogy", "hook"]) {
      for (const l of LANGS) if (t[`${base}_${l}`] !== undefined && t[`${base}_${l}`] !== null) out[`${base}_${l}`] = t[`${base}_${l}`];
    }
    // analogy_* is shared with the v1 compat field: always plain (markup a writer added is dropped)
    for (const l of LANGS) if (typeof out[`analogy_${l}`] === "string") out[`analogy_${l}`] = stripInline(out[`analogy_${l}`]);
    out.points = t.points;
    out.fig = t.fig ?? null;
    out.quiz = t.quiz;
    for (const l of LANGS) out[`definition_${l}`] = stripInline(t[`one_${l}`] ?? "");
    for (const l of LANGS) out[`explanation_${l}`] = stripInline(t[`detail_${l}`] ?? "");
    for (const l of LANGS) out[`memory_hook_${l}`] = typeof out[`hook_${l}`] === "string" ? stripInline(out[`hook_${l}`]) : "";
    out.inline_quiz = t.quiz;
    out.inline_fallback = false;
    out.figure = out.fig?.kind === "svg" ? v1FigureFor(v1, out.fig.data?.path) : null;
    return out;
  });
  const u = {
    schema_version: V2_SCHEMA,
    unit_id: v1.unit_id,
    topic_id: v1.topic_id,
    category: v1.category,
    title_jp: v1.title_jp,
    title_zh: v1.title_zh,
    title_en: v1.title_en,
    unit_summary_jp: v1.unit_summary_jp,
    unit_summary_zh: v1.unit_summary_zh,
    unit_summary_en: v1.unit_summary_en,
    order_in_topic: v1.order_in_topic,
    prerequisites: v1.prerequisites,
  };
  for (const l of LANGS) u[`goals_${l}`] = part[`goals_${l}`];
  for (const l of LANGS) u[`overview_cols_${l}`] = part[`overview_cols_${l}`];
  u.overview_rows = part.overview_rows;
  u.terms = terms;
  u.pairs = part.pairs;
  for (const l of LANGS) u[`key_points_${l}`] = part[`key_points_${l}`];
  const ov = {};
  for (const l of LANGS) ov[`intro_${l}`] = Array.isArray(part[`goals_${l}`]) ? introOf(part[`goals_${l}`], l) : "";
  ov.freq_badge = v1.overview?.freq_badge;
  ov.est_minutes = estMinutes(part, stripInline);
  u.overview = ov;
  const sum = {};
  for (const l of LANGS) sum[`key_points_${l}`] = Array.isArray(part[`key_points_${l}`]) ? part[`key_points_${l}`].map(stripInline) : [];
  for (const l of LANGS) sum[`memory_hooks_${l}`] = hookLines(u, l);
  u.summary = sum;
  u.challenge_questions = part.challenge_questions;
  u.source_figures = v1.source_figures ?? [];
  u.lang_status = { jp: "generated", zh: "generated", en: "generated" };
  return u;
}

/** Script-side check validateV2 cannot do (no fs): every svg a unit points at exists. */
export function svgProblems(unit, tbRoot) {
  const out = [];
  (unit.terms ?? []).forEach((t, i) => {
    for (const p of [t.fig?.kind === "svg" ? t.fig.data?.path : null, t.figure?.svg_path]) {
      if (typeof p === "string" && !existsSync(path.join(tbRoot, p))) {
        out.push({ unitId: unit.unit_id, code: "svg-file", field: `terms[${i}](${t.term}).fig`, message: `${p} does not exist under data/ip/textbook/` });
      }
    }
  });
  return out;
}

/** The V2Context for a unit: index + questions from the data root, v1Terms + members from the manifest. */
export function contextFor(v2, paths, manifest) {
  const index = readJson(paths.index);
  const questions = readJson(paths.questions).questions;
  const ctx = v2.v2Context(index, questions, manifest.unit_id, manifest.v1_terms, new Set(manifest.chumon_members));
  if (!ctx) throw new Error(`${manifest.unit_id}: not in unit_index.json`);
  return ctx;
}

/**
 * Issues of a mirrored JP-only part that only concern zh / en (the placeholders are copies
 * of the Japanese): fields ending in _zh / _en (or a label's .zh / .en), and `sentences`
 * reports that do not mention jp (Japanese text is one "sentence" to the en splitter).
 */
export function jpOnlyIssues(issues) {
  return issues.filter((i) => {
    if (/(_(zh|en)(\[\d+\])?|\.(zh|en))$/.test(i.field)) return false;
    if (i.code === "sentences") return /\bjp=/.test(i.message);
    return true;
  });
}

// ---- parity -----------------------------------------------------------------------

const ne = (s) => typeof s === "string" && s.trim() !== "";
const has3 = (o, l) => isObj(o) && ne(o[l]);

/** Text3 labels of a fig's data (all language-labelled leaves). */
function figLabels(d) {
  const out = [];
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (isObj(v)) {
      if (typeof v.jp === "string") out.push(v);
      else Object.values(v).forEach(walk);
    }
  };
  walk(d);
  return out;
}

/**
 * Per-language structure counts of a unit (or a localised part): location → {jp, zh, en}.
 * A count is how many items have non-empty text in that language, so a missing translation
 * shows up as a lower count for that language.
 */
export function parityCounts(u) {
  const rows = [];
  const add = (loc, f) => rows.push([loc, Object.fromEntries(LANGS.map((l) => [l, f(l)]))]);
  const len = (v) => (Array.isArray(v) ? v.length : 0);
  const terms = Array.isArray(u.terms) ? u.terms : [];
  add("goals", (l) => len(u[`goals_${l}`]));
  add("key_points", (l) => len(u[`key_points_${l}`]));
  add("overview_cols", (l) => len(u[`overview_cols_${l}`]));
  const ovr = Array.isArray(u.overview_rows) ? u.overview_rows : [];
  add("overview_rows", (l) => ovr.filter((r) => ne(r?.[`one_line_${l}`])).length);
  ovr.forEach((r, i) => add(`overview_rows[${i}].extra`, (l) => len(r?.[`extra_${l}`])));
  add("terms", (l) => terms.filter((t) => ne(t?.[`one_${l}`]) && ne(t?.[`detail_${l}`])).length);
  add("terms.analogy", (l) => terms.filter((t) => ne(t?.[`analogy_${l}`])).length);
  add("terms.hook", (l) => terms.filter((t) => ne(t?.[`hook_${l}`])).length);
  add("figs", (l) => terms.filter((t) => t?.fig && figLabels(t.fig.data).every((x) => has3(x, l))).length);
  terms.forEach((t, i) => {
    const at = `terms[${i}](${t?.term})`;
    add(`${at}.points`, (l) => (Array.isArray(t?.points) ? t.points.filter((p) => ne(p?.[`text_${l}`])).length : 0));
    if (t?.fig) {
      add(`${at}.fig.labels`, (l) => figLabels(t.fig.data).filter((x) => has3(x, l)).length);
      if (Array.isArray(t.fig.steps)) add(`${at}.fig.steps`, (l) => t.fig.steps.filter((s) => ne(s?.[`caption_${l}`])).length);
    }
  });
  const pairs = Array.isArray(u.pairs) ? u.pairs : [];
  const rowOk = (r, l) => ne(r?.[`label_${l}`]) && ne(r?.[`a_${l}`]) && ne(r?.[`b_${l}`]);
  add("pairs", (l) => pairs.filter((p) => Array.isArray(p?.rows) && p.rows.length > 0 && p.rows.every((r) => rowOk(r, l))).length);
  pairs.forEach((p, i) => add(`pairs[${i}].rows`, (l) => (Array.isArray(p?.rows) ? p.rows.filter((r) => rowOk(r, l)).length : 0)));
  return rows;
}

/** Locations whose counts differ between languages. */
export function parityDiff(u) {
  return parityCounts(u).filter(([, c]) => !(c.jp === c.zh && c.zh === c.en));
}

/** Structure counts of a part (journal cross-check): language-neutral, from the JP side. */
export function partCounts(p) {
  const terms = Array.isArray(p.terms) ? p.terms : [];
  return {
    terms: terms.length,
    figs: terms.filter((t) => t?.fig).length,
    steps: terms.reduce((a, t) => a + (Array.isArray(t?.fig?.steps) ? t.fig.steps.length : 0), 0),
    points: terms.reduce((a, t) => a + (Array.isArray(t?.points) ? t.points.length : 0), 0),
    pairs: Array.isArray(p.pairs) ? p.pairs.length : 0,
    key_points: Array.isArray(p.key_points_jp) ? p.key_points_jp.length : 0,
    goals: Array.isArray(p.goals_jp) ? p.goals_jp.length : 0,
  };
}

// ---- journal ------------------------------------------------------------------------

/**
 * Successful agent results of a workflow journal.jsonl, in order (as quiz-fidelity-merge-parts:
 * `type:"result"` rows, result.result unwrapped, error rows skipped). Unparseable lines are counted.
 */
export function readJournal(file) {
  const results = [];
  let bad = 0;
  for (const line of readFileSync(file, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    let rec;
    try {
      rec = JSON.parse(line);
    } catch {
      bad++;
      continue;
    }
    if (rec?.type !== "result" || !isObj(rec.result)) continue;
    if (rec.is_error === true || (rec.subtype && rec.subtype !== "success")) continue;
    results.push(isObj(rec.result.result) ? rec.result.result : rec.result);
  }
  return { results, bad };
}
