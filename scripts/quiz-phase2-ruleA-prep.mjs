#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 (Session 97, D-137 / Rule A) — explanation audit-sample builder.
//
// Joins the JP source (data/ip/quiz/questions.json) with the explanation sidecar
// (data/ip/quiz/explanations/<exam>.json). Stratified + DETERMINISTIC (sorted by id):
// figures first (vision-heavy), then key-guard suspects (must be audited), then
// evenly-spaced plain questions, deduped, capped at N. No RNG (reproducible).
//
// Run:  node scripts/quiz-phase2-ruleA-prep.mjs <exam_id> [N]   (defaults 2025r07 12)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const EXPL_DIR = path.join(ROOT, "data/ip/quiz/explanations");
const RAW_BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const FIG_DIR = path.join(ROOT, "data/ip/exams/figures");
const EXAMS_DIR = path.join(ROOT, "data/ip/exams");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase2");

function fail(m) {
  console.error(`✗ quiz-phase2-ruleA-prep: ${m}`);
  process.exit(1);
}

const examId = process.argv[2] ?? "2025r07";
const N = Number(process.argv[3] ?? 12);

const examQuestions = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions
  .filter((q) => q.exam_id === examId)
  .sort((a, b) => a.id.localeCompare(b.id));
if (!examQuestions.length) fail(`no questions for ${examId}`);
const explFile = path.join(EXPL_DIR, `${examId}.json`);
if (!existsSync(explFile)) fail(`sidecar missing: ${explFile} (run quiz-phase2-merge first)`);
const sidecar = JSON.parse(readFileSync(explFile, "utf-8")).questions;

// The critic must audit the DISPLAYED stem (the clean one shown in-app), not the raw
// garbled stem — auditing raw text produced a false "stem mismatch" high on q026 in the
// pilot. Pull stem_jp_clean from the Phase 1 translation sidecar when present.
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const trFile = path.join(TR_DIR, `${examId}.json`);
const trSidecar = existsSync(trFile) ? JSON.parse(readFileSync(trFile, "utf-8")).questions : {};
const displayStem = (q) => trSidecar[q.id]?.stem_jp_clean?.trim() || q.stem_jp;

// id → full source page PNG (for figure full-page authority)
const rawBank = JSON.parse(readFileSync(RAW_BANK, "utf-8"));
const pageById = new Map();
for (const rq of rawBank.questions ?? rawBank) {
  const rid = rq.id ?? rq.question_id;
  if (rid && rq.source?.page_image) pageById.set(rid, path.join(EXAMS_DIR, rq.source.page_image));
}

const explained = examQuestions.filter((q) => sidecar[q.id]);
if (!explained.length) fail("no explained questions in sidecar");

// suspects (figure or not) MUST all be audited; then figures, then plain.
const suspects = explained.filter((q) => sidecar[q.id].key_guard?.suspect);
const figures = explained.filter((q) => q.has_figure && !sidecar[q.id].key_guard?.suspect);
const plain = explained.filter((q) => !q.has_figure && !sidecar[q.id].key_guard?.suspect);

const picked = [];
const seen = new Set();
const take = (arr, k) => {
  if (k <= 0 || !arr.length) return;
  const step = Math.max(1, Math.floor(arr.length / k));
  for (let i = 0; i < arr.length && picked.length < N; i += step) {
    const q = arr[i];
    if (!seen.has(q.id)) { seen.add(q.id); picked.push(q); }
  }
};
// budget: ALL suspects first (forced), then ~half figures, rest plain
take(suspects, suspects.length);
take(figures, Math.min(figures.length, Math.ceil(N / 2)));
take(plain, N - picked.length);
for (const q of explained) {
  if (picked.length >= N) break;
  if (!seen.has(q.id)) { seen.add(q.id); picked.push(q); }
}
picked.sort((a, b) => a.id.localeCompare(b.id));

const samples = picked.map((q) => ({
  id: q.id,
  stem_jp: displayStem(q), // the DISPLAYED (clean) stem, so the critic audits what users see
  choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
  correct_answer: q.correct_answer,
  has_figure: q.has_figure,
  figure_png: q.has_figure ? path.join(FIG_DIR, `${q.figure}.png`) : null,
  figure_page_png: q.has_figure ? pageById.get(q.id) ?? null : null,
  explanation: sidecar[q.id],
}));

const outFile = path.join(OUT_DIR, `ruleA_samples_${examId}.json`);
writeFileSync(outFile, JSON.stringify({ exam_id: examId, n: samples.length, samples }, null, 2) + "\n");

console.log(`✓ quiz-phase2-ruleA-prep ${examId}`);
console.log(`  explained : ${explained.length} (figure ${figures.length} / suspect ${suspects.length} / plain ${plain.length})`);
console.log(`  sampled   : ${samples.length} → fig ${samples.filter((s) => s.has_figure).length}, suspect ${samples.filter((s) => s.explanation.key_guard?.suspect).length}`);
console.log(`  ids       : ${samples.map((s) => s.id.replace(examId + "-", "")).join(", ")}`);
console.log(`  out       : ${path.relative(ROOT, outFile)}`);
