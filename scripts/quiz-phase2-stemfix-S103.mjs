#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S103 (D-137 / D-140) — drift-proof CHOICES
// OCR corruption fixes for this session's exams (2022r04 / 2021r03).
//
// Same contract as quiz-phase2-stemfix-S102.mjs: every fix below was adjudicated by
// 主 context against the source page at high magnification (q052 protocol). Fixes
// assert the current substring occurs EXACTLY ONCE in the raw bank field, replace only
// that substring, then build-quiz-corpus.mjs regenerates questions.json.
// correct_answer / quiz_index / translations are untouched by this script. Idempotent.
//
// Run:  node scripts/quiz-phase2-stemfix-S103.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
const STEM_FIXES = [
  // 2021r03-q036: three 0→9 OCR corruptions in one stem (ANSWER-AFFECTING as flagged:
  // literal 19か月/1,900万円/49% is arithmetically broken — EAC=600/0.49≈1,224 < 1,900
  // means no budget overrun, matching NO choice). Source page-17 at 4x = 10か月 /
  // 1,000万円 / 40%. Correct values give EAC=600/0.40=1,500, overrun=500万円=エ=stored
  // key (internally consistent). zh/en/stem_jp_clean ALSO carry 19/1,900(19,000,000)/49
  // → fixed in trfix-S103. Explanation was already written with correct values.
  { id: "2021r03-q036", from: "開発期間 19 か月", to: "開発期間 10 か月", why: "source page-17 4x = 10か月" },
  { id: "2021r03-q036", from: "人件費予算 1,900 万円", to: "人件費予算 1,000 万円", why: "source page-17 4x = 1,000万円" },
  { id: "2021r03-q036", from: "49%が完成", to: "40%が完成", why: "source page-17 4x = 40%" },
];

// CHOICES fixes = {id, letter, from, to}. `from` must occur EXACTLY ONCE in choices_jp[letter].
const CHOICE_FIXES = [
  {
    id: "2022r04-q039",
    letter: "エ",
    from: "文字の代わりに自分で作成したアイコンも利用可能である。の 18 ey",
    to: "文字の代わりに自分で作成したアイコンも利用可能である。",
    why: "Trailing OCR junk 「の 18 ey」 = page footer 「— 18 —」 bleed (source page-18: choice ends at 「…利用可能である。」). distractor cosmetic, key ア unchanged. zh/en already clean.",
  },
  {
    id: "2022r04-q091",
    letter: "エ",
    from: "バッファをあぶふれさせ",
    to: "バッファをあふれさせ",
    why: "OCR duplicated glyph 「ぶ」 (source page-41 at 3x = 「バッファをあふれさせ」). distractor cosmetic, key イ unchanged. zh/en already clean (缓冲区溢出 / buffer overflow).",
  },
  {
    id: "2022r04-q091",
    letter: "エ",
    from: "不正にプログラムを実行させる。王 4 ご",
    to: "不正にプログラムを実行させる。",
    why: "Trailing OCR junk 「王 4 ご」 not present in source page-41 (choice ends at 「…実行させる。」). distractor cosmetic, key イ unchanged.",
  },
  {
    id: "2022r04-q092",
    letter: "ウ",
    from: "Bluetooth 3.6以前",
    to: "Bluetooth 3.0以前",
    why: "OCR 3.0→3.6 (source page-42 at 5x = 「Bluetooth 3.0以前」; 3.6 does not exist). distractor cosmetic (ウ stays wrong either way: BLE is not compatible with Classic BT), key イ unchanged. zh/en ALSO carry 3.6 → fixed in trfix-S103.",
  },
  {
    id: "2021r03-q005",
    letter: "エ",
    from: "複数馬のコンピュータ",
    to: "複数台のコンピュータ",
    why: "OCR 台→馬 (source page-03 = 「複数台のコンピュータ」). distractor cosmetic, key ウ unchanged. zh/en already clean (多台 / multiple computers).",
  },
];

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const byId = new Map((bank.questions ?? bank).map((q) => [q.id, q]));

function assertReplace(obj, key, from, to, label) {
  const cur = obj[key];
  if (typeof cur !== "string") throw new Error(`${label}: not a string — aborting`);
  if (cur.includes(to) && !cur.includes(from)) {
    console.log(`  ~ ${label}: target already present, skip`);
    return false;
  }
  const n = cur.split(from).length - 1;
  if (n !== 1) throw new Error(`${label}: expected exactly 1 occurrence of "${from}" but found ${n} — aborting (drift guard). Current:\n${cur}`);
  obj[key] = cur.replace(from, to);
  return true;
}

let changed = 0;
for (const f of STEM_FIXES) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not found in raw bank`);
  if (assertReplace(q, "stem_jp", f.from, f.to, `${f.id} stem`)) { changed++; console.log(`  ✓ ${f.id} stem: 「${f.from}」→「${f.to}」`); }
}
for (const f of CHOICE_FIXES) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not found in raw bank`);
  if (!q.choices_jp || typeof q.choices_jp[f.letter] !== "string") throw new Error(`${f.id}: choices_jp[${f.letter}] missing`);
  if (assertReplace(q.choices_jp, f.letter, f.from, f.to, `${f.id} ${f.letter}`)) { changed++; console.log(`  ✓ ${f.id} ${f.letter}: 「${f.from}」→「${f.to}」`); }
}

if (changed > 0) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S103: ${changed} field(s) applied → run build-quiz-corpus.mjs`);
