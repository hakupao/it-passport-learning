#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 (Session 100, D-137 / D-140) — drift-proof STEM + CHOICES
// OCR/s7x corruption fix.
//
// Phase 2's hardened key-guard reads the authoritative source page for every question
// and flags `stem_corruption_suspected` when the displayed JP text disagrees with the
// source/figure/choices/answer. Each fix below is adjudicated by 主 context against the
// source page at high magnification (q052 protocol) BEFORE landing here, and the zh/en
// translations are verified to already be correct (the Phase 1 translator saw through
// the OCR garble) so this is a JP-only restoration.
//
// Drift-proof: assert the current substring occurs EXACTLY ONCE, replace ONLY that
// substring in the raw bank `data/ip/exams/question_bank.json` (gitignored) field, then
// `build-quiz-corpus.mjs` regenerates the committed questions.json. correct_answer /
// quiz_index / translations are untouched.
//
// Run:  node scripts/quiz-phase2-stemfix.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
const STEM_FIXES = [
  {
    id: "2025r07-q034",
    from: "少なくともいくつ販売すればよいか",
    to: "少なくともあと何個販売すればよいか",
    why: "s7x dropped 「あと」: official (page-15) = 「あと何個」(additional). ANSWER-AFFECTING. Key イ=1,200 correct.",
  },
  {
    id: "2025r07-q012",
    from: "商標活における",
    to: "商標法における",
    why: "OCR 法→活 (page-06 confirmed 「商標法」). cosmetic, key エ unchanged.",
  },
  {
    id: "2025r07-q054",
    from: "何分短縮できたか",
    to: "何%短縮できたか",
    why: "s7x flipped 何%→何分 (page-25 confirmed 「何%短縮」; choices+table are %). cosmetic, key ア=30 unchanged.",
  },
  {
    id: "2025r07-q054",
    from: "全体の60%5分",
    to: "全体の60%",
    why: "table cell OCR junk 「5分」 (page-25 confirmed 「全体の60%」). cosmetic.",
  },
];

// CHOICES fixes = {id, letter, from, to}. `from` must occur EXACTLY ONCE in choices_jp[letter].
const CHOICE_FIXES = [
  { id: "2025r07-q019", letter: "ア", from: "によって。,防災訓練", to: "によって,防災訓練", why: "OCR spurious 「。」(page-09)." },
  { id: "2025r07-q019", letter: "イ", from: "重ねて試し首", to: "重ねて試し置きできる。", why: "OCR truncation/garble 試し首→試し置きできる (page-09)." },
  { id: "2025r07-q040", letter: "ア", from: "変更管理和要員会では", to: "変更管理委員会では", why: "OCR 委員→和要員 (page-19)." },
  { id: "2025r07-q040", letter: "イ", from: "却下してよUN。", to: "却下してよい。", why: "OCR い→UN (page-19)." },
  { id: "2025r07-q040", letter: "ウ", from: "委員会は。 スコープ", to: "委員会は, スコープ", why: "OCR 、→。 (page-19)." },
  { id: "2025r07-q040", letter: "エ", from: "変更要求は. 全て", to: "変更要求は, 全て", why: "OCR 、→. (page-19)." },
  { id: "2025r07-q051", letter: "エ", from: "の従業員ーー 23 os", to: "の従業員", why: "OCR page-number junk 「ーー 23 os」 (page-23)." },
  // Run 3 (S100): 4 more non-figure choices OCR corruptions (zh/en already clean).
  { id: "2025r07-q047", letter: "ア", from: "0S とパネル", to: "OS とパネル", why: "OCR digit-zero 0S→OS (page-22; zh/en=OS)." },
  { id: "2025r07-q047", letter: "ウ", from: "ハードウェアと0S の", to: "ハードウェアとOS の", why: "OCR digit-zero 0S→OS (page-22; zh/en=OS)." },
  { id: "2025r07-q064", letter: "ア", from: "定義むするための", to: "定義するための", why: "OCR spurious 「む」 (page-30; zh/en=定义/defining)." },
];

// Trailing OCR-noise strips = {id, letter, anchor}. Keep through the LAST occurrence of
// `anchor`, drop the trailing run (must be only whitespace / 　 / ] / ・ OCR junk).
const TRAILING_STRIPS = [
  { id: "2025r07-q020", letter: "ア", anchor: "見積り", why: "trailing spaces + 「]」 (page-10)." },
  { id: "2025r07-q084", letter: "エ", anchor: "必要がある。", why: "trailing spaces + 「・」 (page-39)." },
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
for (const f of TRAILING_STRIPS) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not found in raw bank`);
  const cur = q.choices_jp?.[f.letter];
  if (typeof cur !== "string") throw new Error(`${f.id} ${f.letter}: choices_jp missing`);
  const idx = cur.lastIndexOf(f.anchor);
  if (idx < 0) throw new Error(`${f.id} ${f.letter}: anchor "${f.anchor}" not found — aborting`);
  const cut = idx + f.anchor.length;
  const tail = cur.slice(cut);
  if (tail === "") { console.log(`  ~ ${f.id} ${f.letter}: no trailing junk, skip`); continue; }
  if (!/^[\s　\]・]+$/.test(tail)) throw new Error(`${f.id} ${f.letter}: trailing tail is not pure OCR junk (got ${JSON.stringify(tail)}) — aborting (drift guard)`);
  q.choices_jp[f.letter] = cur.slice(0, cut);
  changed++;
  console.log(`  ✓ ${f.id} ${f.letter}: stripped trailing ${JSON.stringify(tail)}`);
}

if (changed > 0) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix: ${changed} field(s) applied → run build-quiz-corpus.mjs`);
