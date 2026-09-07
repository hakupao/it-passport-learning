#!/usr/bin/env node
// Stage 6 / Quiz — D-144 段 5 (S118): 2013h25a-q099 の jp/zh 表示 stem の先頭にある **孤立設問文** を除く (冪等)。
//
// 症状 (S118 reviewer HIGH-2 / D-144 段 3 の内容欠陥、S117 §28c の lightweight (a) 型):
//   quiz-chumon-lightweight-D144s3.mjs は section 型の前文を `text.indexOf("〔要望事項〕")` で切り出していた。
//   源設問 2013h25a-q097 の jp/zh は設問文自体に見出しを含む (「これで改善できる〔要望事項〕として, 適切なものはどれか。」)
//   ため、indexOf がそこに食いつき、前文が「〔要望事項〕として, 適切なものはどれか。\n\n〔要望事項〕\n(1)…」と汚染された。
//   その汚染前文が q099 に前置された結果、q099 の jp/zh は q097 の設問文で始まっている (en は原文に見出しが無いため無傷)。
// 是正: q099 の stem_jp_clean / stem.zh の **先頭の孤立文 1 文 + 空行** を削り、en と同じく〔要望事項〕見出しで始まる形に戻す。
//   生成器側 (quiz-chumon-groups-build.mjs) は「行頭の最後の見出し出現」に錨を打つよう修正済 (再発防止)。
// 範囲: translations sidecar の当該 2 フィールドのみ。en / choices / stem_jp_clean 以外 / raw 層 / questions.json は不変。
// Run: node scripts/quiz-chumon-fix-q099-S118.mjs [--dry-run]

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));

const ID = "2013h25a-q099";
const EXAM = "2013h25a";
// 削る孤立文 (逐字。後続は必ず空行 + 〔要望事項〕見出し)
const ORPHAN = {
  jp: "〔要望事項〕として, 適切なものはどれか。\n\n",
  zh: "〔需求事项〕中，恰当的是哪一项？\n\n",
};
const HEAD = { jp: "〔要望事項〕\n", zh: "〔需求事项〕\n" };

const trf = path.join(ROOT, "data/ip/quiz/translations", `${EXAM}.json`);
const doc = rj(trf);
const ent = doc.questions?.[ID];
if (!ent?.stem_jp_clean || !ent?.stem?.zh || !ent?.stem?.en) throw new Error(`${ID}: 3 言語 stem が揃っていない`);
const enBefore = ent.stem.en;
const choicesBefore = JSON.stringify(ent.choices ?? null);

let changed = 0;
for (const lang of ["jp", "zh"]) {
  const get = () => (lang === "jp" ? ent.stem_jp_clean : ent.stem.zh);
  const set = (v) => { if (lang === "jp") ent.stem_jp_clean = v; else ent.stem.zh = v; };
  const before = get();
  if (!before.startsWith(ORPHAN[lang])) {
    if (before.startsWith(HEAD[lang])) { console.log(`= ${ID} ${lang}: 既に見出しで始まる (冪等 no-op)`); continue; }
    throw new Error(`${ID} ${lang}: 先頭が想定外 ${JSON.stringify(before.slice(0, 40))}`);
  }
  // assert-once: 孤立文がもう 1 箇所に無いこと (末尾の設問文は【要望事項】表記なので別物)
  const occ = before.split(ORPHAN[lang]).length - 1;
  if (occ !== 1) throw new Error(`${ID} ${lang}: 孤立文が ${occ} 回出現 — 逐字削除は危険`);
  const after = before.slice(ORPHAN[lang].length);
  if (!after.startsWith(HEAD[lang])) throw new Error(`${ID} ${lang}: 削除後が見出しで始まらない ${JSON.stringify(after.slice(0, 30))}`);
  console.log(`${ID} ${lang}: 先頭の孤立文を削除 (${before.length} → ${after.length} 字)`);
  console.log(`  removed: ${JSON.stringify(ORPHAN[lang])}`);
  console.log(`  now starts: ${JSON.stringify(after.slice(0, 30))}`);
  set(after);
  changed++;
}
if (ent.stem.en !== enBefore) throw new Error(`${ID}: en に触れてしまった`);
if (JSON.stringify(ent.choices ?? null) !== choicesBefore) throw new Error(`${ID}: choices に触れてしまった`);
if (changed && !DRY) writeFileSync(trf, JSON.stringify(doc, null, 2) + "\n");
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-chumon-fix-q099-S118: ${changed} 言語を是正 / en 不変 (${enBefore.length} 字) / choices 不変`);
