#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S107 (D-137 / D-140) — drift-proof STEM OCR
// corruption fixes for this session's exams (2017h29a; 2016h28a if any).
//
// Same contract as quiz-phase2-stemfix-S102..S106.mjs: every fix below was adjudicated
// by 主 context against the source page (q052 protocol / D-小6 full-page authority).
// Substring fixes assert the `from` occurs EXACTLY ONCE in stem_jp and replace only that
// substring; build-quiz-corpus.mjs then regenerates questions.json. correct_answer /
// quiz_index / translations are untouched by this script. Idempotent.
//
// Run:  node scripts/quiz-phase2-stemfix-S107.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
// All three are answer-preserving OCR number corruptions (key unchanged). q009 + q040
// are answer-affecting (literal corrupt stem yields NO matching choice); q016 rounds to
// the same key but the source value is 150, not 156. 主 context read source pages
// 05 (問9) / 08 (問16) / 17 (問40) of 2017h29a and confirmed each corrected value.
const STEM_FIXES = [
  // 2017h29a-q009 (source page-05 問9): 販売価格1,000円 / 10,000個 → 1,000千円 /
  //   12,000個 → 1,800千円. Marginal profit = (1,800−1,000)千 ÷ (12,000−10,000)個 =
  //   400円/個 → 変動費 = 1,000 − 400 = 600 = イ (key unchanged). Raw OCR bumped every
  //   figure (1,000→1,099 / 10,000→10,999 / 12,000→12,900 / 1,800→1,860).
  { id: "2017h29a-q009", from: "販売価格1,099円", to: "販売価格1,000円", why: "OCR 1,099→1,000 (販売価格)" },
  { id: "2017h29a-q009", from: "10, 999個", to: "10,000個", why: "OCR 10,999→10,000" },
  { id: "2017h29a-q009", from: "1, 099千円", to: "1,000千円", why: "OCR 1,099千→1,000千 (利益@10,000個)" },
  { id: "2017h29a-q009", from: "12, 900個", to: "12,000個", why: "OCR 12,900→12,000" },
  { id: "2017h29a-q009", from: "1, 860千円", to: "1,800千円", why: "OCR 1,860千→1,800千 (利益@12,000個)" },
  // 2017h29a-q016 (source page-08 問16): 固定費150万円. 変動費 = 400−50−150 = 200,
  //   限界利益率 = (400−200)/400 = 0.5, 損益分岐点 = 150 ÷ 0.5 = 300 = イ (key unchanged).
  //   Raw OCR 150→156. Non-answer-affecting (156 still rounds to the nearest choice 300).
  { id: "2017h29a-q016", from: "固定費が156万円", to: "固定費が150万円", why: "OCR 156→150 (固定費, source page-08)" },
  // 2017h29a-q040 (source page-17 問40): 20日. A:B:C=2:1:3; A+B rate=3 → work=3×20=60;
  //   A+C rate=5 → 60÷5=12 = ア (key unchanged). Raw OCR 20→26 (literal 26 gives 78÷5=
  //   15.6, matching no choice = answer-affecting).
  { id: "2017h29a-q040", from: "26日掛かる", to: "20日掛かる", why: "OCR 26→20 (作業日数, source page-17)" },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const questions = bank.questions ?? bank;
const byId = new Map(questions.map((q) => [q.id, q]));

let changed = 0;
for (const f of STEM_FIXES) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not in question_bank.json`);
  const cur = q.stem_jp;
  if (typeof cur !== "string") throw new Error(`${f.id}: stem_jp missing`);
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.id}: already fixed (${f.why}), skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting (drift guard)`);
  q.stem_jp = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id}: ${f.why}`);
}

if (changed > 0) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S107: ${changed} stem fix(es) applied → next: node scripts/build-quiz-corpus.mjs`);
