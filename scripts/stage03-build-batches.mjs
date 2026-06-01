#!/usr/bin/env node
/**
 * Stage 3 (G3) — split question_bank.json into per-batch input files for the mapping workflow.
 *
 * Each batch file holds only what a mapper needs to classify (stem + choices + answer +
 * figure_description for figure questions). The mapper Reads the batch file + _mapping_index.json
 * and returns structured mappings keyed by question id.
 *
 * Also emits a stratified pilot id list (spread across all 29 exams + 3 categories-by-question-number
 * heuristic + figure/non-figure) so G3-2 can validate the pipeline before the full run.
 *
 * Output:
 *   data/ip/exams/.tmp/s03/batches/batch_NNN.json   (full run, BATCH_SIZE per file)
 *   data/ip/exams/.tmp/s03/_batch_manifest.json      (list of batch files + ids)
 *   data/ip/exams/.tmp/s03/_pilot_ids.json           (stratified pilot subset)
 *
 * Deterministic. Usage: node scripts/stage03-build-batches.mjs [BATCH_SIZE=25] [PILOT_N=50]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const QB = `${ROOT}/data/ip/exams/question_bank.json`;
const OUTDIR = `${ROOT}/data/ip/exams/.tmp/s03`;
const BATCHDIR = `${OUTDIR}/batches`;
mkdirSync(BATCHDIR, { recursive: true });

const BATCH_SIZE = parseInt(process.argv[2] || '25', 10);
const PILOT_N = parseInt(process.argv[3] || '50', 10);

const bank = JSON.parse(readFileSync(QB, 'utf8'));
const questions = bank.questions;

// projection: only fields a mapper needs (keep stem+choices; answer aids disambiguation; figure desc for figure Qs)
const proj = (q) => ({
  id: q.id,
  question_number: q.question_number,
  stem_jp: q.stem_jp,
  choices_jp: q.choices_jp,
  correct_answer: q.correct_answer,
  has_figure: !!q.has_figure,
  figure_description: q.figure_description || null,
});

// ---- full-run batches (preserve bank order; deterministic) ----
const batches = [];
for (let i = 0; i < questions.length; i += BATCH_SIZE) {
  const slice = questions.slice(i, i + BATCH_SIZE);
  const n = String(batches.length).padStart(3, '0');
  const file = `${BATCHDIR}/batch_${n}.json`;
  const items = slice.map(proj);
  writeFileSync(file, JSON.stringify({ batch: n, count: items.length, items }, null, 2));
  batches.push({ batch: n, file: `batches/batch_${n}.json`, ids: items.map((x) => x.id) });
}

writeFileSync(`${OUTDIR}/_batch_manifest.json`, JSON.stringify({
  batch_size: BATCH_SIZE,
  total_questions: questions.length,
  batch_count: batches.length,
  batches,
}, null, 2));

// ---- stratified pilot subset ----
// stratify by exam (29) so every exam is represented, then bias toward including figure Qs.
const byExam = new Map();
for (const q of questions) {
  const exam = q.id.replace(/-q\d+$/, '');
  if (!byExam.has(exam)) byExam.set(exam, []);
  byExam.get(exam).push(q);
}
const exams = [...byExam.keys()].sort();
const pilot = [];
// Round 1: guarantee EVERY exam (29) is represented — pick its lowest-qnum question.
for (const exam of exams) {
  const qs = byExam.get(exam).slice().sort((a, b) => a.question_number - b.question_number);
  pilot.push(qs[0].id);
}
// Round 2: bias remaining slots toward figure questions (one per exam, deterministic) until PILOT_N.
for (const exam of exams) {
  if (pilot.length >= PILOT_N) break;
  const qs = byExam.get(exam).slice().sort((a, b) => a.question_number - b.question_number);
  const fig = qs.find((q) => q.has_figure && !pilot.includes(q.id));
  if (fig) pilot.push(fig.id);
}
const pilotIds = [...new Set(pilot)].slice(0, PILOT_N);
writeFileSync(`${OUTDIR}/_pilot_ids.json`, JSON.stringify({ n: pilotIds.length, strategy: 'round1=1/exam(all29) + round2=figure-Q/exam until N', ids: pilotIds }, null, 2));

// ---- pilot batch files (dedicated; pilot ids are scattered across the contiguous full batches) ----
const PILOTDIR = `${OUTDIR}/pilot`;
mkdirSync(PILOTDIR, { recursive: true });
const byId = new Map(questions.map((q) => [q.id, q]));
const pilotBatches = [];
for (let i = 0; i < pilotIds.length; i += BATCH_SIZE) {
  const slice = pilotIds.slice(i, i + BATCH_SIZE).map((id) => proj(byId.get(id)));
  const n = String(pilotBatches.length).padStart(3, '0');
  writeFileSync(`${PILOTDIR}/batch_${n}.json`, JSON.stringify({ batch: `pilot_${n}`, count: slice.length, items: slice }, null, 2));
  pilotBatches.push(`pilot/batch_${n}.json`);
}
writeFileSync(`${OUTDIR}/_pilot_manifest.json`, JSON.stringify({ batch_size: BATCH_SIZE, total: pilotIds.length, batch_count: pilotBatches.length, batches: pilotBatches }, null, 2));

console.log(`batches: ${batches.length} files of <=${BATCH_SIZE}  (total ${questions.length} q)`);
console.log(`pilot ids: ${pilotIds.length} (stratified across ${exams.length} exams)`);
console.log(`manifest: ${OUTDIR}/_batch_manifest.json`);
