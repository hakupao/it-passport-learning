#!/usr/bin/env node
// Stage 6 / Quiz — S116c: `2009h21a-q069` 選択肢の表断片を自完結形式に正規化。
//
// ══ 保真核験が CLEAN と言ったのに直す理由 ══
// caveat 掛け直しの双 pass は q069 を **CLEAN** と判定した。源との**語句の一致**は保たれて
// いるからで、この判定は正しい。しかし generate の `key_guard.note_jp` は別の観点で指摘していた:
//
//   > 腐敗箇所は stem ではなく choices_jp の「ア」で、原典の表ヘッダ行 (|①|②|③|) が
//   > ア の選択肢セル内に混入している。…表示上はア も他選択肢と同じく
//   > 「① POP3　② POP3　③ POP3」の 1 行に是正するのが正しい文言。
//
// **保真監査 (源との一致) と表示体裁 (単独表示で読めるか) は別ゲート**という S114 §1b の
// 構図がここでも出た。源は 4 行 × 3 列の 1 つの表で、①②③ の見出しは 4 肢が共有している。
// アプリは選択肢を**単独で**表示するので、見出しを持たない イ/ウ/エ は
// 「| イ | POP3 | SMTP | POP3 |」という**どの列が何か分からない断片**になり、
// 見出しを持つ ア だけが表全体の残骸を抱える、という歪んだ形になっていた。
//
// zh / en は既に「① POP3　② POP3　③ POP3」/「(1) POP3　(2) POP3　(3) POP3」と
// **自完結形式に整えられており、JP だけが表断片のまま**だった。JP を訳文に合わせる。
//
// これは源の語句を変えるものではない (SMTP / POP3 の並びは不変)。表の線形化のしかたを
// 「単独表示で読める形」に直すだけである。key ウ 不変。
//
// Run: node scripts/quiz-fidfix-S116c-q069.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const ID = "2009h21a-q069";

// 現在値 → 是正値。値 (SMTP/POP3 の並び) は一切変えない。
const FIXES = {
  "ア": ["[表] | | ① | ② | ③ |\n|---|---|---|---|\n| ア | POP3 | POP3 | POP3 |", "① POP3　② POP3　③ POP3"],
  "イ": ["[表] | イ | POP3 | SMTP | POP3 |", "① POP3　② SMTP　③ POP3"],
  "ウ": ["[表] | ウ | SMTP | POP3 | SMTP |", "① SMTP　② POP3　③ SMTP"],
  "エ": ["[表] | エ | SMTP | SMTP | SMTP |", "① SMTP　② SMTP　③ SMTP"],
};

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const rec = (bank.questions ?? bank).find((x) => x.id === ID);
if (!rec) throw new Error(`${ID}: not in question_bank`);
if (rec.correct_answer !== "ウ") throw new Error(`${ID}: correct_answer が ウ でない (${rec.correct_answer})`);

// 値の保存を assert: 是正前後で SMTP/POP3 の出現順が一致すること
const seq = (s) => (s.match(/SMTP|POP3/g) ?? []).join(",");
let n = 0;
for (const [L, [from, to]] of Object.entries(FIXES)) {
  const cur = rec.choices_jp[L];
  if (cur === to) { console.log(`  = ${ID}.${L}: 既に是正済`); continue; }
  if (cur !== from) throw new Error(`${ID}.${L}: 想定外の現在値\n  expected: ${JSON.stringify(from)}\n  actual:   ${JSON.stringify(cur)}`);
  if (seq(from) !== seq(to)) throw new Error(`${ID}.${L}: プロトコルの並びが変わる (${seq(from)} → ${seq(to)}) — 中止`);
  rec.choices_jp[L] = to;
  n++;
  console.log(`  ✓ ${ID}.${L}: 表断片 → 自完結形式 (並び ${seq(to)} は不変)`);
}
writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-fidfix-S116c-q069: choice ${n} (key ウ 不変・値の並び不変)`);
