#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 post-generate adjudication fixes (2013h25h), raw bank layer.
//
// Every fix below was flagged by the generate key-guard (STEM-CORRUPTION report,
// generate_result_2013h25h.json), then source-verified by 主 context on the original page
// (S112 §3 裁決: page-04 / 06 / 07 / 19 / 26 / 43 実読). correct_answer untouched — none of
// these change which letter is right; q093 restores the distractor ウ's referent (the stem
// must mention B14 for ウ's $B$14 to be a meaningful trap).
//
// question_bank.json is gitignored (raw exams stay local); this tracked script IS the
// durable record of the edit (S111 answerkey-fix 流儀).
//
// Run: node scripts/quiz-phase2-stemfix-S112.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const E = "2013h25h";
const q = (n) => `${E}-q${String(n).padStart(3, "0")}`;

const FIXES = [
  {
    id: q(7), field: "stem",
    from: "1 日の稼働時間を 18 時間とすると，",
    to: "1 日の稼働時間を 10 時間とするとき，",
    why: "page-04: 源は「10時間とするとき」。18時間だと 342×0.9≈308 でどの肢にも着地しない。clean は既正 (表示は無傷)、raw の罠を除去 (S110 layering: raw も語句特定できる場合は併修)",
  },
  {
    id: q(15), field: "choice:ウ",
    from: "生産工程問の在庫",
    to: "生産工程間の在庫",
    why: "page-06: 源は「生産工程間」(問/間 字形 OCR)。user-facing distractor",
  },
  {
    id: q(17), field: "choice:エ",
    from: "キャンペーン案内やチケット の予約販売",
    to: "キャンペーン案内やチケットの予約販売",
    why: "page-07: 源の行折り返し由来の語中空白。「チケットの」が正",
  },
  {
    id: q(46), field: "stem",
    from: "移植性などに分類した場 合",
    to: "移植性などに分類した場合",
    why: "page-19: 源の行折り返し由来の語中空白。「場合」が正",
  },
  {
    id: q(62), field: "choice:イ",
    from: "元に戻すための代金を利用者に要求すもるソフトウェア",
    to: "元に戻すための代金を利用者に要求するソフトウェア",
    why: "page-26: 源は「要求する」(衍字 OCR)。正解肢の本文",
  },
  {
    id: q(93), field: "stem",
    from: "セルD2には計算式「D1+C2-B2」が入力されており",
    to: "セルD2には計算式「B14+C2-B2」が入力されており",
    why: "page-43: 源は “B14＋C2－B2”。B14→D1 の抽出腐敗で、誤答肢ウ ($B$14) が参照先を失う内的不整合になっていた",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((x) => [x.id, x]));

let edits = 0;
for (const f of FIXES) {
  const rec = byId.get(f.id);
  if (!rec) throw new Error(`${f.id}: not in question_bank`);
  const isChoice = f.field.startsWith("choice:");
  const letter = isChoice ? f.field.split(":")[1] : null;
  const cur = isChoice ? rec.choices_jp[letter] : rec.stem_jp;
  if (cur == null) throw new Error(`${f.id}: ${f.field} missing`);
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.field}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  const next = cur.replace(f.from, f.to);
  if (isChoice) rec.choices_jp[letter] = next;
  else rec.stem_jp = next;
  edits++;
  console.log(`  ✓ ${f.id} [${f.field}] ${f.why}`);
}

writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S112: ${edits} edits (STEM 3 / CHOICE 3)`);
