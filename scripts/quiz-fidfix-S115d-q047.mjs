#!/usr/bin/env node
// Stage 6 / Quiz — S115d: `2010h22a-q047` 選択肢イ (**正解肢**) の OCR 誤字是正。
//
// ══ 発見の経緯 ══
// session limit からの `resumeFromRunId` 再開後、最終 `generate_result` の
// `key_guard.note_jp` を再走査したところ、q047 の note が
// 「選択肢 イ の『新システムに切り夫えるための』の『切り夫える』は OCR の字形誤読で、
//  正しい文言の推定は『切り替える』(stem 冒頭では正しく『切り替える』と出ている)」
// と報告していた。**1 回目の走査 (中断前の journal) には無かった指摘**で、
// 再開後に走った round のエージェントが新たに捕らえたもの。
//
// 主 context が源 page-18 を実読して確認:
//   問47 選択肢イ = 「新システムに切り替えるためのスケジュール及び体制」
// dataset の「切り夫える」は日本語として存在しない。しかも**同じ設問文の冒頭**では
// 「現行システムを新システムに切り替えるに当たり」と正しく出ており、設問内で表記が割れていた。
// correct_answer = イ なので **正解肢の上の欠陥**。
//
// zh「切换到新系统的进度安排及组织体制」/ en "switching over to the new system" は
// 既に正しく、訳文への波及なし。
//
// Run: node scripts/quiz-fidfix-S115d-q047.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const ID = "2010h22a-q047";
const FROM = "新システムに切り夫えるためのスケジュール及び体制";
const TO = "新システムに切り替えるためのスケジュール及び体制";

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const rec = (bank.questions ?? bank).find((x) => x.id === ID);
if (!rec) throw new Error(`${ID}: not in question_bank`);
const cur = rec.choices_jp["イ"];
if (cur === TO) { console.log(`  = ${ID} イ: 既に是正済 → skip`); process.exit(0); }
if (cur !== FROM) throw new Error(`${ID} イ: expected «${FROM}», found «${cur}»`);
if (rec.correct_answer !== "イ") throw new Error(`${ID}: correct_answer が イ でない (${rec.correct_answer}) — 想定外`);
rec.choices_jp["イ"] = TO;
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`  ✓ ${ID} [choice イ / **正解肢**] 切り夫える → 切り替える (源 page-18 実読)`);
console.log(`✓ quiz-fidfix-S115d-q047: choice 1`);
