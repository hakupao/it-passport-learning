#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 98, D-139-B) — key-audit batch combiner (deterministic).
//
// Concats per-exam blind inputs (.keyaudit/input_<exam>.json from quiz-keyaudit-prep.mjs) into
// one batch input + items[] {id} for quiz-keyaudit.workflow.mjs. SKIP-EXISTING (default ON):
// a question whose result_<id>.json already exists is excluded from items[] (kept in input for
// context) — makes the run resumable AND auto-skips the pilot's already-derived 34. Pass --all
// to force every figure question back into items[].
//
// Run:  node scripts/quiz-keyaudit-batch.mjs <batchLabel> <exam...> [--all]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEYAUDIT = path.join(ROOT, "data/ip/quiz/.keyaudit");

function fail(m) { console.error(`✗ quiz-keyaudit-batch: ${m}`); process.exit(1); }
function readJson(f) { if (!existsSync(f)) fail(`missing ${f} (run quiz-keyaudit-prep.mjs first)`); return JSON.parse(readFileSync(f, "utf-8")); }

const argv = process.argv.slice(2);
const all = argv.includes("--all");
const pos = argv.filter((a) => !a.startsWith("--"));
const label = pos[0];
const exams = pos.slice(1);
if (!label || !exams.length) fail("usage: quiz-keyaudit-batch.mjs <batchLabel> <exam...> [--all]");

const questions = [];
const seen = new Set();
for (const e of exams) {
  const j = readJson(path.join(KEYAUDIT, `input_${e}.json`));
  for (const q of (j.questions || [])) { if (seen.has(q.id)) fail(`dup ${q.id}`); seen.add(q.id); questions.push(q); }
}
const items = [];
let skipped = 0;
for (const q of questions) {
  if (!all && existsSync(path.join(KEYAUDIT, `result_${q.id}.json`))) { skipped++; continue; }
  items.push({ id: q.id });
}
writeFileSync(path.join(KEYAUDIT, `input_batch_${label}.json`), JSON.stringify({ batch: label, exams, count: questions.length, questions }, null, 2) + "\n");
writeFileSync(path.join(KEYAUDIT, `items_batch_${label}.json`), JSON.stringify(items, null, 2) + "\n");
console.log(`✓ quiz-keyaudit-batch ${label} (${exams.join(", ")})`);
console.log(`  figure total : ${questions.length}`);
console.log(`  items (to WF): ${items.length}${all ? " [--all]" : ""}`);
console.log(`  skipped(done): ${skipped}`);
console.log(`  input_path   : ${path.join(KEYAUDIT, `input_batch_${label}.json`)}`);
