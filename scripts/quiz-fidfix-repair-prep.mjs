#!/usr/bin/env node
// Stage 6 / Quiz — post-fidelity-fix REPAIR prep (Session 109).
//
// After quiz-fidfix-S109 restores the JP display text to the IPA source, two derived layers
// can be left stale:
//   (1) the zh/en translation sidecar, which was translated FROM the corrupted JP;
//   (2) the Phase 2 explanation, which may quote or reason about the corrupted wording —
//       q014 is the worst case: its distractor ウ had been corrupted into a TRUE statement,
//       so the generator wrote a strained rationalisation for why a true statement is wrong.
//
// This builds the repair input: per affected question, the CORRECTED jp text, the current
// zh/en, the current explanation, and the exact list of edits that were applied.
//
// Run: node scripts/quiz-fidfix-repair-prep.mjs <exam_id> <evidence_json>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase2");

const examId = process.argv[2];
const evidencePath = process.argv[3];
if (!examId || !evidencePath) {
  console.error("✗ usage: node scripts/quiz-fidfix-repair-prep.mjs <exam_id> <evidence_json>");
  process.exit(1);
}

const ev = JSON.parse(readFileSync(path.resolve(ROOT, evidencePath), "utf-8"));
const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
const trPath = path.join(ROOT, `data/ip/quiz/translations/${examId}.json`);
const tr = JSON.parse(readFileSync(trPath, "utf-8")).questions;
const explPath = path.join(ROOT, `data/ip/quiz/explanations/${examId}.json`);
const expl = existsSync(explPath) ? JSON.parse(readFileSync(explPath, "utf-8")).questions : {};

// group the audited discrepancies by question
const byQ = new Map();
for (const d of ev.discrepancies) {
  if (!byQ.has(d.id)) byQ.set(d.id, []);
  byQ.get(d.id).push({ field: d.field, was: d.current_text, now: d.source_text, severity: d.severity, is_correct_choice: d.is_correct_choice });
}

const samples = [...byQ.entries()].sort().map(([id, edits]) => {
  const rec = byId.get(id);
  if (!rec) throw new Error(`${id}: not in question_bank`);
  const t = tr[id];
  return {
    id,
    correct_answer: rec.correct_answer,
    // POST-FIX japanese (what the learner now sees)
    corrected_stem_jp: t?.stem_jp_clean?.trim() || rec.stem_jp,
    corrected_choices_jp: rec.choices_jp,
    // current translations (may still reflect the pre-fix japanese)
    current_stem_tr: t?.stem ? { zh: t.stem.zh, en: t.stem.en } : null,
    current_choices_tr: t?.choices ?? null,
    // current explanation (may quote or reason about the pre-fix japanese)
    current_explanation: expl[id] ?? null,
    edits_applied: edits,
  };
});

const out = path.join(OUT_DIR, `fidfix_repair_input_${examId}.json`);
writeFileSync(out, JSON.stringify({ exam_id: examId, count: samples.length, samples }, null, 2) + "\n");
console.log(`✓ quiz-fidfix-repair-prep ${examId}`);
console.log(`  questions : ${samples.length} (${samples.map((s) => s.id.replace(examId + "-", "")).join(",")})`);
console.log(`  out       : ${path.relative(ROOT, out)}`);
