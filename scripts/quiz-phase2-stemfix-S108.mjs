#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S108 (D-137 / D-140) — drift-proof STEM + CHOICES
// OCR corruption fixes for this session's exams (2016h28h; 2015h27a if any).
//
// Same contract as quiz-phase2-stemfix-S102..S107.mjs: every fix below was adjudicated
// by 主 context against the source page (q052 protocol / D-小6 full-page authority). All
// key-invariant (correct_answer unchanged). STEM substring fixes assert `from` occurs
// EXACTLY ONCE in stem_jp; CHOICE fixes assert `from` occurs EXACTLY ONCE in the letter's
// choices_jp value (strip/swap only, idempotent). build-quiz-corpus.mjs then regenerates
// questions.json. correct_answer / quiz_index / translations untouched here.
//
// Run:  node scripts/quiz-phase2-stemfix-S108.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
const STEM_FIXES = [
  // 2016h28h-q016 (source page-08 問16): 「ISO 9001」(品質マネジメント規格). Raw OCR 0→9
  //   gives 「ISO 9991」(存在しない規格). stem_jp_clean is null → raw stem_jp is the JP
  //   display, so fixed here. key エ (品質管理の標準化) unchanged. zh/en fixed in trfix-S108.
  { id: "2016h28h-q016", from: "ISO 9991", to: "ISO 9001", why: "OCR 9991→9001 (source page-08)" },
  // 2015h27a-q092 (source page-41 問92): 「単価を50円値引きして」. Raw OCR 0→6 gives 「56円」.
  //   answer-affecting: 50円→(800−50)−430=320, 27,750÷320=86.7→87=ウ (key); 56円→314→88.4→89
  //   (no choice). stem_jp_clean carries 56 too (fixed in trfix-S108); zh/en also (trfix). key ウ 不変。
  { id: "2015h27a-q092", from: "単価を56円値引き", to: "単価を50円値引き", why: "OCR 56→50 (source page-41)" },
];

// CHOICE substring fixes = {id, letter, from, to}. strip/swap only (from ⊇ to, or
// from/to non-containing) so assert-replace is idempotent. `from` must occur EXACTLY ONCE.
const CHOICE_FIXES = [
  // 2016h28h-q005 (source page-03 問5): choice エ ends 「…特化したシステムである。」; raw has
  //   trailing OCR junk 「= 吐」. Distractor cosmetic, key ウ unchanged. zh/en clean.
  { id: "2016h28h-q005", letter: "エ", from: "。= 吐", to: "。", why: "strip trailing OCR junk 「= 吐」" },
  // 2016h28h-q009 (source page-05 問9): 下請法 60-day rule. All four choices read 「60 日」in
  //   source; raw OCR corrupted three: ア「69」/ ウ「6」/ エ「66」→ 60. ア is the CORRECT choice
  //   (key ア), so its displayed number is restored to 60. イ already reads 60. zh/en clean (60).
  { id: "2016h28h-q009", letter: "ア", from: "69 日以内", to: "60 日以内", why: "OCR 69→60 (正解肢, source page-05)" },
  { id: "2016h28h-q009", letter: "ウ", from: "6 日間", to: "60 日間", why: "OCR 6→60 (source page-05)" },
  { id: "2016h28h-q009", letter: "エ", from: "66 日後", to: "60 日後", why: "OCR 66→60 (source page-05)" },
  // 2016h28h-q061 (source page-28 問61): choice ウ 「利用者がキーボードから入力した情報を…」;
  //   raw has spurious 「人」→「人入力」. Distractor cosmetic, key ア unchanged. zh/en clean.
  { id: "2016h28h-q061", letter: "ウ", from: "人入力", to: "入力", why: "OCR 余分な「人」除去 (source page-28)" },
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
    console.log(`  ~ ${f.id} stem: already fixed (${f.why}), skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} stem: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting`);
  q.stem_jp = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} stem: ${f.why}`);
}

for (const f of CHOICE_FIXES) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not in question_bank.json`);
  const cur = q.choices_jp?.[f.letter];
  if (typeof cur !== "string") throw new Error(`${f.id} choice ${f.letter}: missing`);
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.id} ${f.letter}: already fixed (${f.why}), skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.letter}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting`);
  q.choices_jp[f.letter] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} ${f.letter}: ${f.why}`);
}

if (changed > 0) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S108: ${changed} fix(es) applied → next: node scripts/build-quiz-corpus.mjs`);
