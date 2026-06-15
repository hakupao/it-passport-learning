#!/usr/bin/env node
// Stage 6 / Quiz Phase 1 (D-136, D-小5) — integrated-batch combiner (deterministic).
//
// The translate + ruleA workflows each take a SINGLE input_path/sidecar_path plus an
// items[] spanning the whole batch (D-小5: ids are globally unique, so 3 exams run in
// one workflow for rate-limit efficiency). S88–S90 built these combined files inline;
// this script makes it reproducible for the remaining batches. No RNG, no mutation of
// per-exam artifacts — pure concat of the prep / merge / ruleA-prep outputs, with
// invariant assertions (count, unique ids) so a dropped question fails loud here
// rather than being silently skipped by a workflow.
//
// Modes:
//   translate <batchLabel> <exam...>   reads .phase1/input_<exam>.json  (from prep)
//                                       → .phase1/input_batch_<label>.json  {batch,exams,count,questions}
//                                       → .phase1/items_batch_<label>.json  [{id,has_figure}]
//   ruleA     <batchLabel> <exam...>   reads translations/<exam>.json   (from merge)
//                                       → .phase1/sidecar_batch_<label>.json {schema_version,batch,count,questions}
//                                     reads .phase1/ruleA_samples_<exam>.json (from ruleA-prep)
//                                       → .phase1/ruleA_items_<label>.json  [{id,has_figure}]
//                                       (extra forced ids: pass after exams as id=<qid>; figure flag from questions.json)
//
// Run:  node scripts/quiz-phase1-batch.mjs translate S91 2018h30h 2017h29a 2017h29h
//       node scripts/quiz-phase1-batch.mjs ruleA     S91 2018h30h 2017h29a 2017h29h [id=2018h30h-q045 ...]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHASE1 = path.join(ROOT, "data/ip/quiz/.phase1");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");

function fail(m) {
  console.error(`✗ quiz-phase1-batch: ${m}`);
  process.exit(1);
}
function readJson(f) {
  if (!existsSync(f)) fail(`missing ${f}`);
  return JSON.parse(readFileSync(f, "utf-8"));
}
function assertUnique(ids, where) {
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) fail(`duplicate id '${id}' in ${where}`);
    seen.add(id);
  }
}

const mode = process.argv[2];
const label = process.argv[3];
const rest = process.argv.slice(4);
const exams = rest.filter((a) => !a.startsWith("id="));
const forcedIds = rest.filter((a) => a.startsWith("id=")).map((a) => a.slice(3));
if (!["translate", "ruleA"].includes(mode) || !label || !exams.length) {
  fail("usage: quiz-phase1-batch.mjs <translate|ruleA> <batchLabel> <exam...> [id=<qid>...]");
}

// figure flag per id (authoritative from derived corpus)
const figureById = new Map(readJson(QUESTIONS).questions.map((q) => [q.id, Boolean(q.has_figure && q.figure)]));

if (mode === "translate") {
  const questions = [];
  for (const e of exams) {
    const j = readJson(path.join(PHASE1, `input_${e}.json`));
    if (!Array.isArray(j.questions) || !j.questions.length) fail(`no questions in input_${e}.json (run prep first)`);
    questions.push(...j.questions);
  }
  assertUnique(questions.map((q) => q.id), "combined input");
  const items = questions.map((q) => ({ id: q.id, has_figure: Boolean(q.has_figure) }));

  const inputFile = path.join(PHASE1, `input_batch_${label}.json`);
  const itemsFile = path.join(PHASE1, `items_batch_${label}.json`);
  writeFileSync(inputFile, JSON.stringify({ batch: label, exams, count: questions.length, questions }, null, 2) + "\n");
  writeFileSync(itemsFile, JSON.stringify(items, null, 2) + "\n");

  console.log(`✓ quiz-phase1-batch translate ${label} (${exams.join(", ")})`);
  console.log(`  questions : ${questions.length}  figures : ${items.filter((i) => i.has_figure).length}`);
  console.log(`  input     : ${path.relative(ROOT, inputFile)}`);
  console.log(`  items     : ${path.relative(ROOT, itemsFile)}`);
} else {
  // sidecar: concat the committed per-exam translation sidecars
  const merged = {};
  for (const e of exams) {
    const sc = readJson(path.join(TR_DIR, `${e}.json`));
    for (const [id, entry] of Object.entries(sc.questions || {})) {
      if (merged[id]) fail(`duplicate sidecar id '${id}'`);
      merged[id] = entry;
    }
  }
  const sidecarFile = path.join(PHASE1, `sidecar_batch_${label}.json`);
  writeFileSync(
    sidecarFile,
    JSON.stringify({ schema_version: "quiz-tr-v1", batch: label, count: Object.keys(merged).length, questions: merged }, null, 2) + "\n",
  );

  // ruleA items: union of per-exam ruleA samples + forced ids, deterministic by id
  const ids = new Set();
  for (const e of exams) {
    const sp = readJson(path.join(PHASE1, `ruleA_samples_${e}.json`));
    for (const s of sp.samples || []) ids.add(s.id);
  }
  for (const fid of forcedIds) {
    if (!figureById.has(fid)) fail(`forced id '${fid}' not in questions.json`);
    if (!merged[fid]) fail(`forced id '${fid}' not in combined sidecar (not translated this batch)`);
    ids.add(fid);
  }
  const items = [...ids].sort((a, b) => a.localeCompare(b)).map((id) => ({ id, has_figure: figureById.get(id) ?? false }));
  const itemsFile = path.join(PHASE1, `ruleA_items_${label}.json`);
  writeFileSync(itemsFile, JSON.stringify(items, null, 2) + "\n");

  console.log(`✓ quiz-phase1-batch ruleA ${label} (${exams.join(", ")})`);
  console.log(`  sidecar   : ${Object.keys(merged).length} translations → ${path.relative(ROOT, sidecarFile)}`);
  console.log(`  ruleA     : ${items.length} samples (figure ${items.filter((i) => i.has_figure).length}${forcedIds.length ? `, forced ${forcedIds.length}: ${forcedIds.join(", ")}` : ""}) → ${path.relative(ROOT, itemsFile)}`);
}
