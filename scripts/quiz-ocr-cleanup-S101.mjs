#!/usr/bin/env node
// Stage 6 / Quiz (Session 101, D-140 scale 方針) — drift-proof OCR-garble cleanup APPLIER.
//
// Reads the adjudicated + independently-verified fix list
//   evidence/phase5/stage_06_quiz_ocr_cleanup/ocr_cleanup_fixes_S101.json
// (produced by scripts/quiz-ocr-cleanup-S101.fixes.mjs; each {id,letter,from,to} blind-
// re-derived & confirmed by the S101 verification workflow) and applies each as a FULL-
// FIELD replacement on the raw bank data/ip/exams/question_bank.json (gitignored):
//   assert choices_jp[letter] === from  →  set to.
// Then run build-quiz-corpus.mjs to regenerate the committed questions.json. JP-only:
// zh/en translations were verified already-clean, so they are untouched; correct_answer /
// quiz_index / stems are never written here.
//
// Idempotent: a field already === to is skipped. Drift guard: any field whose current
// value !== from (and !== to) aborts the whole run (no partial writes).
//
// Run:  node scripts/quiz-ocr-cleanup-S101.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const FIXES = path.join(ROOT, "evidence/phase5/stage_06_quiz_ocr_cleanup/ocr_cleanup_fixes_S101.json");

const { fixes } = JSON.parse(readFileSync(FIXES, "utf-8"));
const bank = JSON.parse(readFileSync(BANK, "utf-8"));
const byId = new Map(bank.questions.map((q) => [q.id, q]));

// Validate everything first (no writes until all checks pass) — atomic apply.
const planned = [];
for (const f of fixes) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not found in raw bank`);
  const cur = q.choices_jp?.[f.letter];
  if (typeof cur !== "string") throw new Error(`${f.id} ${f.letter}: choices_jp missing`);
  if (cur === f.to) { console.log(`  ~ ${f.id} ${f.letter}: already clean, skip`); continue; }
  if (cur !== f.from) {
    throw new Error(
      `${f.id} ${f.letter}: DRIFT — current value does not match expected 'from'.\n` +
      `  expected: ${JSON.stringify(f.from)}\n  current : ${JSON.stringify(cur)}`,
    );
  }
  planned.push({ q, f });
}

for (const { q, f } of planned) {
  q.choices_jp[f.letter] = f.to;
  console.log(`  ✓ ${f.id} ${f.letter} [${f.cls}]`);
}

if (planned.length > 0) writeFileSync(BANK, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-ocr-cleanup-S101: applied ${planned.length}/${fixes.length} field(s) → run build-quiz-corpus.mjs`);
