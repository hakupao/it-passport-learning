#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.5 (Session 98, D-138) — integrated-batch combiner (deterministic).
//
// The reconstruct workflow takes a SINGLE input_path plus items[] {id,klass} spanning a
// whole batch of exams (ids are globally unique). To stay under the 1000-agent/WF cap we
// run ~8 exams per batch. This combiner concats the per-exam prep outputs
// (.phase1.5/input_<exam>.json) into one batch input + items list. Pure concat, no RNG,
// no mutation — a dropped/duplicate question fails loud here, not silently in a workflow.
//
//   reads  .phase1.5/input_<exam>.json   (from quiz-phase1.5-prep.mjs, FULL at-risk)
//   writes .phase1.5/input_batch_<label>.json  {batch,exams,count,questions}
//   writes .phase1.5/items_batch_<label>.json  [{id,klass}]
//
// SKIP-EXISTING (default ON): a question whose reconstructed stem_<id>.json already exists
// on disk is EXCLUDED from items[] (but kept in the combined input for context). This makes
// the run resumable AND auto-dedups the 2025r07 pilot's 16 figure stems (already committed).
// Pass --all to force every at-risk question back into items[].
//
// Run:  node scripts/quiz-phase1.5-batch.mjs S98-B1 2026r08 2025r07 2024r06 ...
//       node scripts/quiz-phase1.5-batch.mjs S98-B1 2026r08 ... --all

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHASE15 = path.join(ROOT, "data/ip/quiz/.phase1.5");

function fail(m) { console.error(`✗ quiz-phase1.5-batch: ${m}`); process.exit(1); }
function readJson(f) { if (!existsSync(f)) fail(`missing ${f} (run quiz-phase1.5-prep.mjs first)`); return JSON.parse(readFileSync(f, "utf-8")); }

const argv = process.argv.slice(2);
const all = argv.includes("--all");
const positional = argv.filter((a) => !a.startsWith("--"));
const label = positional[0];
const exams = positional.slice(1);
if (!label || !exams.length) fail("usage: quiz-phase1.5-batch.mjs <batchLabel> <exam...> [--all]");

const stemPath = (id) => path.join(PHASE15, `stem_${id}.json`);

const questions = [];
const seen = new Set();
for (const e of exams) {
  const j = readJson(path.join(PHASE15, `input_${e}.json`));
  if (!Array.isArray(j.questions) || !j.questions.length) fail(`no questions in input_${e}.json`);
  for (const q of j.questions) {
    if (seen.has(q.id)) fail(`duplicate id '${q.id}' across batch ${label}`);
    seen.add(q.id);
    questions.push(q);
  }
}

const items = [];
let skipped = 0;
for (const q of questions) {
  if (!all && existsSync(stemPath(q.id))) { skipped++; continue; }
  items.push({ id: q.id, klass: q.klass });
}

const inputFile = path.join(PHASE15, `input_batch_${label}.json`);
const itemsFile = path.join(PHASE15, `items_batch_${label}.json`);
writeFileSync(inputFile, JSON.stringify({ batch: label, exams, count: questions.length, questions }, null, 2) + "\n");
writeFileSync(itemsFile, JSON.stringify(items, null, 2) + "\n");

const figItems = items.filter((i) => i.klass === "figure").length;
console.log(`✓ quiz-phase1.5-batch ${label} (${exams.join(", ")})`);
console.log(`  at-risk total : ${questions.length}`);
console.log(`  items (to WF) : ${items.length} (figure ${figItems} / nonfig ${items.length - figItems})${all ? " [--all]" : ""}`);
console.log(`  skipped(done) : ${skipped}${skipped ? " (stem_<id>.json already exists)" : ""}`);
console.log(`  input_path    : ${inputFile}`);
console.log(`  items_path    : ${itemsFile}`);
