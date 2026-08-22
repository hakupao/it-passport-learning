#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — stem fix S113b (2012h24h-q030 追補).
//
// stemfix-S113 の裁決一致性の追補: q030 は flagged (stem_corruption_suspected=true) かつ
// clean なし = raw stem_jp が表示層で、熟語内空白「ものはど れか」が露出している。
// q022「設 定」を是正して q030 を放置するのは同一クラス内の不整合 → 併せて是正。
// 半角読点「, 」(57 問に分布) は corpus 一律の正規化差として不動 (S112 引用符 precedent)。
//
// Run: node scripts/quiz-phase2-stemfix-S113b.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const bank = JSON.parse(readFileSync(RB, "utf-8"));
const rec = (bank.questions ?? bank).find((x) => x.id === "2012h24h-q030");
if (!rec) throw new Error("q030 not found");

const FROM = "ものはど れか";
const TO = "ものはどれか";
const n = rec.stem_jp.split(FROM).length - 1;
if (n === 0 && rec.stem_jp.includes(TO)) {
  console.log("  = q030 already fixed");
} else if (n !== 1) {
  throw new Error(`q030: expected 1 occurrence of «${FROM}», found ${n}`);
} else {
  rec.stem_jp = rec.stem_jp.replace(FROM, TO);
  writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
  console.log("  ✓ q030 [stem] 熟語内空白「ど れか」→「どれか」(page-11 実読、q022 と同クラス)");
}
console.log("✓ quiz-phase2-stemfix-S113b");
