#!/usr/bin/env node
// Stage 6 / Quiz — answer_keys.json correction, batch S111.
//
// WHY THIS EXISTS
// data/ip/exams/answer_keys.json is **gitignored** (/data/ip/* — the raw IPA-derived records
// are kept local for copyright/size reasons). A correction applied by hand would therefore be
// invisible to git and would silently vanish on a fresh clone or a re-extraction. This script
// is the tracked, re-runnable record of the one correction we made to it.
//
// THE CORRECTION — 2009h21a-q091 (平成21年度 秋期 問91, 在庫引当)
// S110's corpus-wide cross-check (answer_keys.json ↔ questions.json, 2,900 comparisons) found
// 4 disagreements. Three were resolved in S110/S111; this was the last one left open.
// quiz-keyfix-S110.mjs deliberately did NOT touch it:
//
//   > answer_keys.json 側の抽出誤りと見られるが、公式解答冊子の画像を持っていないため
//   > **推測で公式記録を書き換えない**。
//
// That restraint was correct. What was missing was a route to actually settle it. In S111 §5
// we settled it the only way the evidence allowed — by putting the source in front of the user:
//
//   源 (pages/2009h21a/page-35.png 問91): 前日在庫 100 / 当日仕入なし
//     10:00 通常注文 80 / 10:30 優先注文 10 / 11:00 通常注文 40
//     選択肢 ア 7 / イ 10 / ウ 14 / エ 20
//   引当可能数量 = 100 − 80 − 10 = 10 = **イ**。優先注文を先に引当てる順序 (100 − 10 − 80)
//   でも同じ 10。**ウ = 14 は表のどの数からも導出できない**。
//
// Ruled out first — that answer_keys.json is offset by one question in this band. The
// neighbours agree (88–90, 92–94), and q92 (same page, 請求処理) re-derives independently to
// 90,000 = イ, matching answer_keys. So 91 is an isolated single-cell extraction error.
//
// ユーザー確認 (2026-08-11, S111): 「10 で正しい」。→ 是正実施。
//
// questions.json / question_bank.json already carry イ (fixed in S98, D-139-A), so this script
// only touches answer_keys.json and no corpus rebuild is needed. Post-fix invariant:
// answer_keys ↔ questions cross-check = 2,900 comparisons, 0 mismatches.
//
// Rule B archive: failures/quiz_phase1.5_S98_2009h21a-q091_answerkey_mismatch.md
//
// Run: node scripts/answerkey-fix-S111-2009h21a-q091.mjs   (idempotent)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AK = path.join(ROOT, "data/ip/exams/answer_keys.json");
const QJ = path.join(ROOT, "data/ip/quiz/questions.json");

const FIXES = [
  {
    exam: "2009h21a", q: "91", from: "ウ", to: "イ",
    why: "在庫引当 100 − 80(10:00 通常) − 10(10:30 優先) = 10 = イ。ウ=14 は源の表から導出不能。公式解答冊子の 1 セル抽出誤り (ユーザー確認済、S111 §5)",
  },
];

const keys = JSON.parse(readFileSync(AK, "utf-8"));
let changed = 0, dirty = false;

for (const f of FIXES) {
  const exam = keys[f.exam];
  if (!exam?.answers) throw new Error(`${f.exam}: not in answer_keys.json`);
  const cur = exam.answers[f.q];
  if (cur === f.to) { console.log(`  ~ ${f.exam} 問${f.q}: already ${f.to}, skip`); continue; }
  if (cur !== f.from) throw new Error(`${f.exam} 問${f.q}: expected "${f.from}" but found "${cur}" — aborting`);
  exam.answers[f.q] = f.to;
  dirty = true; changed++;
  console.log(`  ★ ${f.exam} 問${f.q}: ${f.from} → ${f.to} — ${f.why}`);
}

if (dirty) writeFileSync(AK, JSON.stringify(keys, null, 2) + "\n");

// Post-fix invariant: the cross-check that surfaced this in S110 must now be clean.
const qs = JSON.parse(readFileSync(QJ, "utf-8"));
const questions = Array.isArray(qs) ? qs : qs.questions;
let checked = 0;
const mismatches = [];
for (const q of questions) {
  const m = /^(.+)-q(\d{3})$/.exec(q.id);
  if (!m) continue;
  const stored = keys[m[1]]?.answers?.[String(Number(m[2]))];
  if (!stored) continue;
  checked++;
  if (stored !== q.correct_answer) mismatches.push(`${q.id}: questions=${q.correct_answer} / answer_keys=${stored}`);
}
if (mismatches.length) {
  console.error(`✗ answer_keys ↔ questions cross-check: ${mismatches.length} mismatch(es)`);
  for (const m of mismatches) console.error(`    ${m}`);
  process.exit(1);
}

console.log(`✓ answerkey-fix-S111: ${changed} edit(s)`);
console.log(`✓ answer_keys ↔ questions cross-check: ${checked} comparisons, 0 mismatches`);
