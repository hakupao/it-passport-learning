#!/usr/bin/env node
// Stage 6 / Quiz — cross-exam correct_answer adjudication, batch S110.
//
// WHY THIS EXISTS
// A corpus-wide cross-check of data/ip/exams/answer_keys.json against
// data/ip/quiz/questions.json (2,900 comparisons) surfaced **4 disagreements**. Until S110
// nothing in the pipeline had ever compared these two files — the Phase 2 key-guard only
// re-derives the answer from the stem, and it happened to trip on one of them (2014h26h-q100).
//
// 主 context adjudicated all four by reading the IPA source pages and re-deriving the answer.
// The four turned out to have THREE DIFFERENT root causes — which is exactly why a blanket
// "trust answer_keys.json" fix would have been wrong:
//
//  1. 2014h26h-q100  questions=イ / answer_keys=ア  → **questions.json was wrong**
//     Fixed in quiz-phase2-stemfix-S110.mjs (same batch, alongside its 2,900→2,000 stem OCR).
//     Source-derived: 10^5 × 5% = 5,000; S = 2,000 − 500 dup = 1,500; total 6,500 = ア.
//
//  2. 2009h21a-q012  questions=ウ / answer_keys=ア  → **questions.json is wrong** → FIXED HERE
//     源 (page-06) の図は ①→②→③→④→[実行計画策定]。並べる 4 工程のうち、実行計画策定の
//     直前 (=④) に来られるのは「重要成功要因の抽出」だけ (CSF は戦略から抽出され、実行計画の
//     入力になる)。①〜③ の順序をどう取っても ④ = ア は動かない。stored「ウ」は ③ の答え。
//
//  3. 2009h21a-q091  questions=イ / answer_keys=ウ  → **answer_keys.json looks wrong** → NOT FIXED
//     源 (page-35) の表: 前日在庫 100 / 10:00 通常 80 / 10:30 優先 10 / 11:00 通常 40。
//     11:00 の注文に引当可能なのは 100 − 80 − 10 = **10 = イ** で questions.json が正しい。
//     「14」を導く読み方は無い (20 なら優先注文を無視した場合)。answer_keys.json 側の抽出
//     誤りと見られるが、公式解答冊子の画像を持っていないため**推測で公式記録を書き換えない**。
//     アプリが読むのは questions.json なので利用者影響は無い。要調査として記録に留める。
//
//  4. 2010h22a-q091  questions=エ / answer_keys=ア  → **Phase 1 抽出欠陥** → NOT FIXED
//     これは key の誤りですらない。dataset の q089 と q091 は**同一の題面**を持つ重複で、
//     源 (page-36 の問89) の内容が q091 にもコピーされている。源 page-37 の**本物の問91**
//     「次の表は，テストデータ（地区，3辺計，重量）を用いて実際にテストを行った結果の一部
//     である。この結果の判断として，適切なものはどれか。」(ア〜エ + 結果表) は dataset に
//     **存在しない**。answer_keys の「ア」はその本物の問91 に対する解答である。
//     ここで correct_answer を ア に変えると、問89 の題面に問91 の答えが付くという最悪の
//     組合せになる。正しい対処は Phase 1 の再抽出 (欠落 1 問の復元 + 重複の除去) であり、
//     backlog に高優先で登録する。
//
// Run: node scripts/quiz-keyfix-S110.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

const KEY_FIXES = [
  {
    id: "2009h21a-q012", from: "ウ", to: "ア",
    why: "誤登録。源 page-06 の図 ①→②→③→④→[実行計画策定] で ④ は「重要成功要因の抽出」= ア。公式 answer_keys.json も ア。stored「ウ」(ビジネス戦略の立案) は ③ の答え",
  },
];

// The q012 stem carried a mangled inline rendering of the figure that also leaked all four
// choice labels into the stem body. Replace it with a faithful, readable linearisation.
const TEXT_FIXES = [
  {
    id: "2009h21a-q012", target: "raw",
    from: "| @ | [ 生計画定 - ア 重要成功要因の抽出 . イ.・ ビジネス下境の分析\nウ ビジネス戦略の立案 エ . ビジョンの設定",
    to: "［図］ ① → ② → ③ → ④ → 実行計画策定",
    why: "図の線形化が OCR で崩壊し、かつ 4 択の文言が設問本文に漏れ出していた。源 (page-06) の図は 5 ノードの一本鎖",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));
let changed = 0, dirty = false;

for (const f of TEXT_FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank.json`);
  const field = f.target === "raw" ? "stem_jp" : f.target;
  const cur = rec[field];
  if (typeof cur !== "string") throw new Error(`${f.id} ${field}: missing`);
  if (cur.includes(f.to) && !cur.includes(f.from)) { console.log(`  ~ ${f.id} ${field}: already fixed, skip`); continue; }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${field}: expected exactly 1 occurrence but found ${n} — aborting`);
  rec[field] = cur.replace(f.from, f.to);
  dirty = true; changed++;
  console.log(`  ✓ ${f.id} ${field}: ${f.why}`);
}

for (const k of KEY_FIXES) {
  const rec = byId.get(k.id);
  if (!rec) throw new Error(`${k.id}: not in question_bank.json`);
  if (rec.correct_answer === k.to) { console.log(`  ~ ${k.id} correct_answer: already ${k.to}, skip`); continue; }
  if (rec.correct_answer !== k.from) throw new Error(`${k.id} correct_answer: expected "${k.from}" but found "${rec.correct_answer}" — aborting`);
  rec.correct_answer = k.to;
  dirty = true; changed++;
  console.log(`  ★ ${k.id} correct_answer: ${k.from} → ${k.to} — ${k.why}`);
}

if (dirty) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-keyfix-S110: ${changed} edit(s) → run: node scripts/build-quiz-corpus.mjs`);
console.log("  NOT fixed (see header): 2009h21a-q091 (answer_keys side suspect), 2010h22a-q091 (Phase 1 duplicate/missing-question defect)");
