#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 99, D-139-B → D-139-A 同方式) — apply 2 CONFIRMED bad-key fixes.
//
// Drift-proof: edit raw bank `data/ip/exams/question_bank.json` (gitignored) correct_answer ONLY,
// with current-value assertions, then `build-quiz-corpus.mjs` regenerates committed questions.json.
// Confirmed by 5 independent passes each (3 critic + deriver + 主 context high-res read), see
// evidence/phase5/stage_06_quiz_keyaudit/rule_a_audit_S99_fullsweep.md.
//
//   2009h21a-q012: ア → ウ  (④ before 実行計画策定 must be 戦略立案; CSF抽出=③)
//   2010h22a-q091: ア → エ  (表2 = 4×3×3 = 36 exhaustive combos = 網羅)
//
// Run:  node scripts/quiz-keyaudit-fix-S99.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

const FIXES = [
  { id: "2009h21a-q012", from: "ア", to: "ウ" },
  { id: "2010h22a-q091", from: "ア", to: "エ" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const arr = bank.questions ?? bank;
for (const f of FIXES) {
  const q = arr.find((x) => (x.id ?? x.question_id) === f.id);
  if (!q) throw new Error(`raw bank: ${f.id} not found`);
  if (q.correct_answer !== f.from) throw new Error(`${f.id}: expected current correct_answer="${f.from}" but found "${q.correct_answer}" — aborting (drift guard)`);
  q.correct_answer = f.to;
  console.log(`✓ ${f.id}: ${f.from} → ${f.to}`);
}
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ raw bank written (${arr.length} questions). Now run: node scripts/build-quiz-corpus.mjs`);
