#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 99) — apply choices-fidelity fixes to raw bank (drift-proof).
// Reads .keyaudit/choices_apply_plan.json (id,L,from,to), asserts raw bank choices_jp[id][L]===from,
// sets =to. Then run build-quiz-corpus.mjs. correct_answer untouched (keys verified invariant).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const plan = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/.keyaudit/choices_apply_plan.json"), "utf-8"));
const bank = JSON.parse(readFileSync(RB, "utf-8"));
const arr = bank.questions ?? bank;
const byId = new Map(arr.map((q) => [(q.id ?? q.question_id), q]));
let applied = 0; const errs = [];
for (const p of plan) {
  const q = byId.get(p.id);
  if (!q) { errs.push(`${p.id}: not in raw bank`); continue; }
  const cur = q.choices_jp?.[p.L];
  if (cur !== p.from) { errs.push(`${p.id}.${p.L}: drift — expected [${p.from}] but raw bank has [${cur}]`); continue; }
  q.choices_jp[p.L] = p.to; applied++;
}
if (errs.length) { console.error("✗ drift/errors (NO write):"); errs.forEach((e) => console.error("  " + e)); process.exit(1); }
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ applied ${applied}/${plan.length} choice fixes to raw bank. Now: node scripts/build-quiz-corpus.mjs`);
