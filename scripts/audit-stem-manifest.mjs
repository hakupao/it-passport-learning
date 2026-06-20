#!/usr/bin/env node
// Pre-Phase-2 STEM-quality audit manifest (Session 97 follow-up, after pilot found
// q034/q066). Root cause = upstream stem OCR corruption propagating into explanations:
//   - figure Q whose DISPLAYED stem diverges from the figure (q066: Phase 1 left no
//     clean stem; the raw table is scrambled vs the figure)
//   - non-figure Q whose s7x repair altered meaning (q034: repair fixed garbled numbers
//     but DROPPED the word「あと」, flipping "additional" → "total" and the answer)
//
// Ground truth: the FIGURE (figure Q) and `stem_jp_corrupted_backup` (the original OCR,
// available for s7x-repaired Q — lets us see what the repair changed). No external web.
//
// Deterministic stratified sample (no RNG) + calibration controls (q034/q066 known-bad,
// q001/q026 known-clean). Emits a manifest the stem audit workflow consumes.
//
// Run:  node scripts/audit-stem-manifest.mjs [N]   (default 54)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const EXAM_ROOT = path.join(ROOT, "data/ip/exams");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const OUT_DIR = path.join(ROOT, "evidence/phase5/stage_06_quiz_stem_audit");
fs.mkdirSync(OUT_DIR, { recursive: true });

const N = Number(process.argv[2] || 54);
// per-stratum allocation (oversample the two pilot-confirmed risk classes), sums to N
const ALLOC = { figure_no_clean: 18, figure_clean: 10, nonfig_stem_marked: 18, nonfig_plain: 8 };
const CONTROLS = [
  { id: "2025r07-q034", expect: "BAD_STEM", note: "s7x repair dropped「あと」(backup has it) → answer interpretation flips. sensitivity control" },
  { id: "2025r07-q066", expect: "BAD_STEM", note: "figure Q, no clean stem; raw table scrambled vs figure. sensitivity control" },
  { id: "2025r07-q001", expect: "CLEAN", note: "non-figure plain, clean. specificity control" },
  { id: "2025r07-q026", expect: "CLEAN", note: "figure Q with figure-faithful clean stem (Phase 1). specificity control" },
];

const { questions } = JSON.parse(fs.readFileSync(BANK, "utf-8"));
const byId = new Map(questions.map((q) => [q.id, q]));
const H = (q, k) => q[k] !== undefined;

// displayed stem = stem_jp_clean from translation sidecar (figure de-garble / OCR clean), else raw
const cleanById = new Map();
for (const f of fs.readdirSync(TR_DIR)) {
  if (!f.endsWith(".json")) continue;
  const qs = JSON.parse(fs.readFileSync(path.join(TR_DIR, f), "utf-8")).questions;
  for (const [id, e] of Object.entries(qs)) if (e.stem_jp_clean?.trim()) cleanById.set(id, e.stem_jp_clean);
}

const stemMarked = (q) => H(q, "stem_resourced_s7x") || H(q, "stem_refixed_s7x") || H(q, "stem_resourced_s7xb") || H(q, "stem_jp_corrupted_backup");
const stratumOf = (q) => {
  if (q.has_figure) return cleanById.has(q.id) ? "figure_clean" : "figure_no_clean";
  return stemMarked(q) ? "nonfig_stem_marked" : "nonfig_plain";
};
const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

function pageAbs(q) {
  const rel = q.source?.page_image;
  if (!rel) return null;
  const p = path.join(EXAM_ROOT, rel);
  return fs.existsSync(p) ? p : null;
}
function figAbs(q) {
  if (!q.has_figure || !q.figure_path) return null;
  const p = path.join(EXAM_ROOT, q.figure_path);
  return fs.existsSync(p) ? p : null;
}

function pack(q, extra = {}) {
  return {
    id: q.id,
    exam: q.id.split("-")[0],
    question_number: q.question_number,
    stratum: stratumOf(q),
    severity: (q.s027_severity || "none").split(";")[0],
    has_figure: q.has_figure,
    figure_type: q.figure_type || null,
    figure_bbox_pct: q.figure_bbox_pct || null,
    displayed_stem: cleanById.get(q.id) || q.stem_jp,   // what the app shows
    raw_stem: q.stem_jp,
    stem_corrupted_backup: q.stem_jp_corrupted_backup ?? null, // original OCR (compare what repair changed)
    has_clean_stem: cleanById.has(q.id),
    choices_jp: q.choices_jp,
    correct_answer: q.correct_answer,
    page_abs: pageAbs(q),
    crop_abs: figAbs(q),
    markers: { stem_resourced_s7x: H(q, "stem_resourced_s7x"), has_backup: H(q, "stem_jp_corrupted_backup") },
    ...extra,
  };
}

const controlIds = new Set(CONTROLS.map((c) => c.id));
const pool = questions.filter((q) => !controlIds.has(q.id));
const buckets = { figure_no_clean: [], figure_clean: [], nonfig_stem_marked: [], nonfig_plain: [] };
for (const q of pool) buckets[stratumOf(q)].push(q);

const sample = [];
for (const [stratum, want] of Object.entries(ALLOC)) {
  const cand = buckets[stratum].slice().sort((a, b) => hash(a.id) - hash(b.id));
  // prefer higher-severity within stratum, then hash order
  cand.sort((a, b) => {
    const rank = (q) => (["ocr_garble_critical", "content_mismatch"].includes((q.s027_severity || "").split(";")[0]) ? 0 : 1);
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    return hash(a.id) - hash(b.id);
  });
  for (let i = 0; i < want && i < cand.length; i++) sample.push(pack(cand[i], { role: "rate" }));
}

const controls = CONTROLS.map((c) => {
  const q = byId.get(c.id);
  if (!q) { console.warn(`WARN: control ${c.id} not found`); return null; }
  return pack(q, { role: "control", control_expect: c.expect, control_note: c.note });
}).filter(Boolean);

const all = [...sample, ...controls];
const manifest = {
  generated_for: "Pre-Phase-2 stem-quality audit (Rule A). Ground truth = figure (figure Q) + stem_jp_corrupted_backup (s7x-repaired Q).",
  population_note: "figure 467 (clean-stem 254 / no-clean 213) + non-figure stem-marked 71 + non-figure plain ~2362",
  definitions: {
    bad_stem: "the DISPLAYED stem has a MEANING-CHANGING corruption: a figure Q whose stem diverges from the figure (wrong/missing values, scrambled rows), or a non-figure Q where the s7x repair dropped/altered meaning-bearing content (a condition word like「あと」, a number, a clause) such that the question's intent or answer changes. This is the rate numerator.",
    cosmetic_only: "garble that does NOT change meaning (spacing, a stray glyph in a non-load-bearing spot). Logged, not counted.",
    clean: "displayed stem faithfully represents the question (matches figure / preserves the backup's meaning) and supports the keyed answer.",
  },
  sample_size: sample.length,
  allocation: ALLOC,
  composition: {
    by_stratum: Object.fromEntries(Object.entries(ALLOC).map(([s]) => [s, sample.filter((x) => x.stratum === s).length])),
    with_backup: sample.filter((x) => x.stem_corrupted_backup).length,
    figure: sample.filter((x) => x.has_figure).length,
  },
  image_coverage: { with_page: all.filter((x) => x.page_abs).length, with_crop: all.filter((x) => x.crop_abs).length },
  control_count: controls.length,
  items: all,
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("STEM AUDIT manifest");
console.log("  sample:", sample.length, "| controls:", controls.length);
console.log("  composition:", JSON.stringify(manifest.composition));
console.log("  image coverage:", JSON.stringify(manifest.image_coverage));
console.log("  wrote", path.relative(ROOT, path.join(OUT_DIR, "manifest.json")));
