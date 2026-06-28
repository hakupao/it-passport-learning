#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 (Session 102, D-137) — deterministic post-check for the
// generate workflow's self-persisted generate_result_<exam>.json.
//
// The 'Persist' phase of quiz-phase2-generate.workflow.mjs has an agent write the
// result file verbatim. This script independently validates that the file is
// well-formed and complete BEFORE merge consumes it as the authoritative key_guard
// source — catching any transcription garble (truncated array, malformed key_guard,
// out-of-enum letters) deterministically. Exits non-zero on any problem.
//
// It also cross-checks the result ids against the on-disk expl_jp_<id>.json files
// (every persisted id must have produced an explanation file) so a silently-dropped
// question is caught here, not in merge.
//
// Run:  node scripts/quiz-phase2-verify-result.mjs <exam_id> [expected_count]

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const PHASE2_DIR = path.join(ROOT, "data/ip/quiz/.phase2");
const LETTERS = new Set(["ア", "イ", "ウ", "エ"]);
const DERIVED_OK = new Set(["ア", "イ", "ウ", "エ", "unsure"]);

function fail(msg) {
  console.error(`✗ quiz-phase2-verify-result: ${msg}`);
  process.exit(1);
}

const examId = process.argv[2];
if (!examId) fail("usage: quiz-phase2-verify-result.mjs <exam_id> [expected_count]");

const resultFile = path.join(PHASE2_DIR, `generate_result_${examId}.json`);
if (!existsSync(resultFile)) fail(`missing ${path.relative(ROOT, resultFile)} (Persist phase did not run / agent failed)`);

let data;
try {
  data = JSON.parse(readFileSync(resultFile, "utf-8"));
} catch (e) {
  fail(`unparseable generate_result (transcription garble?): ${e.message}`);
}

const results = data.results;
if (!Array.isArray(results) || !results.length) fail("results[] missing or empty");

// Expected count = exam's question count (or explicit override).
const examQuestionIds = new Set(
  JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions
    .filter((q) => q.exam_id === examId)
    .map((q) => q.id),
);
const expected = Number(process.argv[3] ?? examQuestionIds.size);

const problems = [];
const seen = new Set();
let flagged = 0;

const checkKg = (kg, id, which) => {
  if (kg === null || typeof kg !== "object") return `${id}: ${which} key_guard not an object`;
  if (typeof kg.figure_derivable !== "boolean") return `${id}: ${which}.figure_derivable not boolean`;
  if (typeof kg.matches_key !== "boolean") return `${id}: ${which}.matches_key not boolean`;
  if (!DERIVED_OK.has(kg.derived_answer)) return `${id}: ${which}.derived_answer '${kg.derived_answer}' not in {ア,イ,ウ,エ,unsure}`;
  if (typeof kg.stem_corruption_suspected !== "boolean") return `${id}: ${which}.stem_corruption_suspected not boolean`;
  if (typeof kg.note_jp !== "string") return `${id}: ${which}.note_jp not string`;
  return null;
};

for (const r of results) {
  if (!r || typeof r.id !== "string") { problems.push(`entry without string id: ${JSON.stringify(r).slice(0, 80)}`); continue; }
  if (seen.has(r.id)) problems.push(`${r.id}: duplicate id`);
  seen.add(r.id);
  if (!examQuestionIds.has(r.id)) problems.push(`${r.id}: id not in exam ${examId}`);
  const e1 = checkKg(r.key_guard, r.id, "final"); if (e1) problems.push(e1);
  const e2 = checkKg(r.key_guard_round1, r.id, "round1"); if (e2) problems.push(e2);
  if (typeof r.suspect !== "boolean") problems.push(`${r.id}: suspect not boolean`);
  // expl files must exist for every persisted question (merge reads them)
  if (!existsSync(path.join(PHASE2_DIR, `expl_jp_${r.id}.json`))) problems.push(`${r.id}: expl_jp file missing`);
  if (!existsSync(path.join(PHASE2_DIR, `expl_tr_${r.id}.json`))) problems.push(`${r.id}: expl_tr file missing`);
  const kg = r.key_guard, kg1 = r.key_guard_round1;
  if (r.suspect || kg?.stem_corruption_suspected || kg1?.stem_corruption_suspected ||
      kg?.matches_key === false || kg1?.matches_key === false || kg?.figure_derivable === false || kg1?.figure_derivable === false) flagged += 1;
}

const missingFromResults = [...examQuestionIds].filter((id) => !seen.has(id));

if (problems.length) {
  fail(`validation problems (${problems.length}):\n  ${problems.slice(0, 30).join("\n  ")}${problems.length > 30 ? "\n  …" : ""}`);
}
if (results.length !== expected) {
  fail(`count mismatch: results=${results.length} expected=${expected}${missingFromResults.length ? " missing: " + missingFromResults.slice(0, 12).join(", ") : ""}`);
}

console.log(`✓ quiz-phase2-verify-result ${examId}`);
console.log(`  results        : ${results.length}/${expected}`);
console.log(`  flagged (suspect|stem-corrupt|mismatch|non-derivable): ${flagged}`);
console.log(`  every result has well-formed final+round1 key_guard, in-exam id, expl files present.`);
