#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 (Session 105, D-137) — DETERMINISTIC persist of the generate
// workflow's result. Replaces the LLM 'Persist' agent that quiz-phase2-generate.workflow
// .mjs used to spawn (removed S105 after the S104 lossy-persist incident, Rule B:
// failures/quiz_phase2_S104_2019r01a_persist_lossy*).
//
// Mechanism (no LLM in the serialization path):
//   1. The generate workflow returns the full per-question results as its script return
//      value.
//   2. The harness writes that return VERBATIM to the background task's output file, as
//      the top-level `.result` field (probe-confirmed S105: the same file S104 recovered
//      151KB from).
//   3. This script reads that file's `.result` and writes
//        data/ip/quiz/.phase2/generate_result_<exam>.json = {exam_id,total,done,results}
//      byte-deterministically. quiz-phase2-verify-result.mjs then validates it.
//
// The task output file path is the <output-file> in the workflow's <task-notification>
// (…/tasks/<taskId>.output). On a resumed run (resumeFromRunId), use the FINAL run's
// notification — its `.result` already contains cached+live merged results.
//
// Run:  node scripts/quiz-phase2-persist.mjs <task_output_file> <exam_id>

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHASE2_DIR = path.join(ROOT, "data/ip/quiz/.phase2");

function fail(msg) {
  console.error(`✗ quiz-phase2-persist: ${msg}`);
  process.exit(1);
}

const outputFile = process.argv[2];
const examId = process.argv[3];
if (!outputFile || !examId) fail("usage: quiz-phase2-persist.mjs <task_output_file> <exam_id>");

let payload;
try {
  payload = JSON.parse(readFileSync(outputFile, "utf-8"));
} catch (e) {
  fail(`cannot read/parse task output file ${outputFile}: ${e.message}`);
}

// The workflow's return value. If the harness truncated a huge result to a string, or the
// wrong file was passed, this guard trips before we clobber the generate_result.
const result = payload.result;
if (!result || typeof result !== "object" || Array.isArray(result)) {
  fail(`task output '.result' is not an object (truncated / wrong file / workflow errored?): ${JSON.stringify(result).slice(0, 120)}`);
}
if (result.exam_id !== examId) {
  fail(`exam_id mismatch: task output .result.exam_id='${result.exam_id}' but requested '${examId}' — wrong task output file?`);
}
if (!Array.isArray(result.results) || !result.results.length) {
  fail(`.result.results missing or empty (${result.results?.length ?? "n/a"}) — generate did not complete`);
}

const out = {
  exam_id: result.exam_id,
  total: result.total ?? result.results.length,
  done: result.done ?? result.results.length,
  results: result.results,
};

mkdirSync(PHASE2_DIR, { recursive: true });
const outPath = path.join(PHASE2_DIR, `generate_result_${examId}.json`);
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

// Advisory summary (verify-result is the authoritative gate).
const flagged = result.results.filter((r) =>
  r.suspect === true ||
  r.key_guard?.stem_corruption_suspected === true || r.key_guard_round1?.stem_corruption_suspected === true ||
  r.key_guard?.matches_key === false || r.key_guard_round1?.matches_key === false ||
  r.key_guard?.figure_derivable === false || r.key_guard_round1?.figure_derivable === false).length;
const emptyNotes = result.results.filter((r) => !(r.key_guard?.note_jp?.trim()) || !(r.key_guard_round1?.note_jp?.trim())).length;
const noVerdict = result.results.filter((r) => !("jp_verdict" in r)).length;

console.log(`✓ quiz-phase2-persist ${examId}`);
console.log(`  source   : ${outputFile}`);
console.log(`  results  : ${out.results.length} (total ${out.total} / done ${out.done})`);
console.log(`  flagged  : ${flagged} (suspect|stem-corrupt|mismatch|non-derivable)`);
console.log(`  empty-note results: ${emptyNotes}  |  missing jp_verdict: ${noVerdict}  (both should be ~0; verify-result enforces)`);
console.log(`  out      : ${path.relative(ROOT, outPath)}  → next: node scripts/quiz-phase2-verify-result.mjs ${examId}`);
