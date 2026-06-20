#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.5 (Session 97, D-138) — stem-reconstruction merge (deterministic).
//
// Folds the reconstructed stems (data/ip/quiz/.phase1.5/stem_<id>.json, each:
//   { id, stem_jp_clean, stem:{zh,en}, changed, change_summary_jp })
// INTO the committed translation sidecar data/ip/quiz/translations/<exam>.json:
//   entry.stem_jp_clean = recon.stem_jp_clean          (displayed JP — figure/backup faithful)
//   entry.stem.zh / entry.stem.en = recon.stem.{zh,en} (matching trilingual)
// Choices and all other fields are PRESERVED (stem-only update). The reader already
// consumes stem_jp_clean + stem.{zh,en}, so no code change (D-138-B). git diff shows
// exactly the stem corrections.
//
// Run:  node scripts/quiz-phase1.5-merge.mjs <exam_id>   (default 2025r07)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const PHASE15_DIR = path.join(ROOT, "data/ip/quiz/.phase1.5");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");

function fail(m) { console.error(`✗ quiz-phase1.5-merge: ${m}`); process.exit(1); }
function nonEmpty(s) { return typeof s === "string" && s.trim() !== ""; }

const examId = process.argv[2] ?? "2025r07";

const inputFile = path.join(PHASE15_DIR, `input_${examId}.json`);
if (!existsSync(inputFile)) fail(`missing ${inputFile} (run prep first)`);
const targetIds = JSON.parse(readFileSync(inputFile, "utf-8")).questions.map((q) => q.id);

const trFile = path.join(TR_DIR, `${examId}.json`);
if (!existsSync(trFile)) fail(`translation sidecar missing: ${trFile}`);
const sidecar = JSON.parse(readFileSync(trFile, "utf-8"));

const errors = [];
const missing = [];
let updated = 0, changed = 0;
const changeLog = [];

for (const id of targetIds) {
  const reconFile = path.join(PHASE15_DIR, `stem_${id}.json`);
  if (!existsSync(reconFile)) { missing.push(id); continue; }
  let recon;
  try { recon = JSON.parse(readFileSync(reconFile, "utf-8")); }
  catch (e) { errors.push(`${id}: unparseable recon (${e.message})`); continue; }
  if (recon.id !== id) errors.push(`${id}: recon.id mismatch '${recon.id}'`);
  if (!nonEmpty(recon.stem_jp_clean)) { errors.push(`${id}: empty stem_jp_clean`); continue; }
  if (!nonEmpty(recon.stem?.zh) || !nonEmpty(recon.stem?.en)) { errors.push(`${id}: empty stem zh/en`); continue; }

  const entry = sidecar.questions[id];
  if (!entry) { errors.push(`${id}: not in translation sidecar (Phase 1 must precede)`); continue; }

  const before = JSON.stringify({ c: entry.stem_jp_clean ?? null, z: entry.stem?.zh, e: entry.stem?.en });
  entry.stem_jp_clean = recon.stem_jp_clean;
  entry.stem = { zh: recon.stem.zh, en: recon.stem.en };
  const after = JSON.stringify({ c: entry.stem_jp_clean, z: entry.stem.zh, e: entry.stem.en });
  updated++;
  if (before !== after) { changed++; changeLog.push({ id, summary: recon.change_summary_jp ?? "" }); }
}

if (errors.length) fail(`validation errors:\n  ${errors.join("\n  ")}`);

// stamp provenance
sidecar.stem_reconstructed_s975 = true;
writeFileSync(trFile, JSON.stringify(sidecar, null, 2) + "\n");

console.log(`✓ quiz-phase1.5-merge ${examId}`);
console.log(`  targeted : ${targetIds.length}`);
console.log(`  updated  : ${updated} (stem fields written to sidecar)`);
console.log(`  changed  : ${changed} (differs from prior displayed stem)`);
console.log(`  missing  : ${missing.length}${missing.length ? " → " + missing.join(", ") : ""}`);
if (changeLog.length) {
  console.log(`  --- changes ---`);
  for (const c of changeLog) console.log(`   ${c.id}: ${c.summary.slice(0, 100)}`);
}
console.log(`  out      : ${path.relative(ROOT, trFile)} (git diff to review)`);
