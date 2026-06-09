#!/usr/bin/env node
// Stage 6 / Quiz Phase 1 (Session 87, D-136 / Rule A) — audit-sample builder.
//
// Builds the N-sample input for quiz-phase1-ruleA.workflow.mjs by joining the raw
// JP source (data/ip/quiz/questions.json) with the translated sidecar
// (data/ip/quiz/translations/<exam>.json). Stratified + DETERMINISTIC (sorted by id):
// all figure questions first, then garble-cleaned (stem_jp_clean) questions, then
// evenly-spaced plain questions, deduped, capped at N. No RNG (reproducible audit).
//
// Run:  node scripts/quiz-phase1-ruleA-prep.mjs <exam_id> [N]   (defaults 2025r07 12)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const FIG_DIR = path.join(ROOT, "data/ip/exams/figures");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase1");

function fail(m) {
  console.error(`✗ quiz-phase1-ruleA-prep: ${m}`);
  process.exit(1);
}

const examId = process.argv[2] ?? "2025r07";
const N = Number(process.argv[3] ?? 12);

const examQuestions = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions
  .filter((q) => q.exam_id === examId)
  .sort((a, b) => a.id.localeCompare(b.id));
if (!examQuestions.length) fail(`no questions for ${examId}`);
const trFile = path.join(TR_DIR, `${examId}.json`);
if (!existsSync(trFile)) fail(`sidecar missing: ${trFile} (run quiz-phase1-merge first)`);
const sidecar = JSON.parse(readFileSync(trFile, "utf-8")).questions;

const translated = examQuestions.filter((q) => sidecar[q.id]);
if (!translated.length) fail("no translated questions in sidecar");

// strata (deterministic order)
const figures = translated.filter((q) => q.has_figure);
const cleaned = translated.filter((q) => !q.has_figure && sidecar[q.id].stem_jp_clean);
const plain = translated.filter((q) => !q.has_figure && !sidecar[q.id].stem_jp_clean);

const picked = [];
const seen = new Set();
const take = (arr, k) => {
  if (k <= 0 || !arr.length) return;
  // evenly spaced across the (sorted) stratum
  const step = Math.max(1, Math.floor(arr.length / k));
  for (let i = 0; i < arr.length && picked.length < N; i += step) {
    const q = arr[i];
    if (!seen.has(q.id)) { seen.add(q.id); picked.push(q); }
  }
};
// budget: ~half figures, ~quarter cleaned, rest plain — but never exceed availability
take(figures, Math.min(figures.length, Math.ceil(N / 2)));
take(cleaned, Math.min(cleaned.length, Math.ceil(N / 4)));
take(plain, N - picked.length);
// top up from anything still untaken if strata were thin
for (const q of translated) {
  if (picked.length >= N) break;
  if (!seen.has(q.id)) { seen.add(q.id); picked.push(q); }
}
picked.sort((a, b) => a.id.localeCompare(b.id));

const samples = picked.map((q) => {
  const tr = sidecar[q.id];
  return {
    id: q.id,
    stem_jp: q.stem_jp,
    choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
    correct_answer: q.correct_answer,
    has_figure: q.has_figure,
    figure_png: q.has_figure ? path.join(FIG_DIR, `${q.figure}.png`) : null,
    translation: { stem_jp_clean: tr.stem_jp_clean ?? null, stem: tr.stem, choices: tr.choices },
  };
});

const outFile = path.join(OUT_DIR, `ruleA_samples_${examId}.json`);
writeFileSync(outFile, JSON.stringify({ exam_id: examId, n: samples.length, samples }, null, 2) + "\n");

console.log(`✓ quiz-phase1-ruleA-prep ${examId}`);
console.log(`  translated : ${translated.length} (figure ${figures.length} / cleaned ${cleaned.length} / plain ${plain.length})`);
console.log(`  sampled    : ${samples.length} → fig ${samples.filter((s) => s.has_figure).length}, clean ${samples.filter((s) => s.translation.stem_jp_clean).length}`);
console.log(`  ids        : ${samples.map((s) => s.id.replace(examId + "-", "")).join(", ")}`);
console.log(`  out        : ${path.relative(ROOT, outFile)}`);
