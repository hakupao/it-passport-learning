#!/usr/bin/env node
// Stage 6 / Quiz — S115e: `2010h22a-q042` stem の語中空白是正 (**Rule A が捕らえた未適用の是正**)。
//
// ══ なぜ単独スクリプトなのか ══
// explfix-S115 で私 (主 context) は q042 の裁決注記に
//   「stem『プロジェクトを立ち上げ た。』の行折り返し由来の空白を除去し『立ち上げた。』に是正
//    (fidfix-S115c、表示層 = raw)」
// と**是正済みであるかのように書いた**。しかし `quiz-fidfix-S115c-caveat.mjs` の FIXES 配列に
// q042 は**そもそも入っていなかった** (grep で 0 件)。`questions.json` の stem_jp は現在も
// 「…プロジェクトを立ち上げ た。」のままで、q042 は `stem_jp_clean` を持たないため
// **表示層 = raw、つまり学習者にそのまま空白入りで見えていた**。
//
// Rule A の critic (`pr-review-toolkit:code-reviewer`) がこれを medium で指摘した:
//   「同バッチの他問 (q025 革積→蓄積、q032 購 入者、q054 java→Java、q060 枯渦→枯渇、
//     q070 イン タフェース) はいずれも questions.json に反映済みであり、q042 だけ適用漏れ。
//     未適用の修正を『是正』と記載した完了宣言になっている点で Tier 3 のトレーサビリティ上 medium」
//
// これは CLAUDE.md の failure_mode_guards が禁じる「No fake completion」そのもので、
// **Rule A (写審分離) が無ければ出荷されていた**。注記を書き換えるのではなく、
// 宣言どおりに**実際に是正する**方向で解消する。
//
// 源 page-16 の 問42 は「…システム開発のプロジェクトを立ち上げた。」(空白なし)。
// key_guard note も「行折り返し由来で不要な空白に割れている (正しい文言の推定は
// 『プロジェクトを立ち上げた。』)」と一致。zh/en は既に正しく波及なし。key イ 不変。
//
// Run: node scripts/quiz-fidfix-S115e-q042.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const ID = "2010h22a-q042";
const FROM = "プロジェクトを立ち上げ た。";
const TO = "プロジェクトを立ち上げた。";

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const rec = (bank.questions ?? bank).find((x) => x.id === ID);
if (!rec) throw new Error(`${ID}: not in question_bank`);
if (rec.stem_jp.includes(TO) && !rec.stem_jp.includes(FROM)) {
  console.log(`  = ${ID}: 既に是正済 → skip`);
  process.exit(0);
}
const n = rec.stem_jp.split(FROM).length - 1;
if (n !== 1) throw new Error(`${ID}: «${FROM}» occurs ${n} times`);
if (rec.correct_answer !== "イ") throw new Error(`${ID}: correct_answer が イ でない (${rec.correct_answer})`);
rec.stem_jp = rec.stem_jp.replace(FROM, TO);
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`  ✓ ${ID} [raw / 表示層] 立ち上げ た。→ 立ち上げた。 (Rule A が捕らえた適用漏れ)`);
console.log(`✓ quiz-fidfix-S115e-q042: stem 1`);
