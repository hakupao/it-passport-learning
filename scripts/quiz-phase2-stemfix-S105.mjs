#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S105 (D-137 / D-140) — drift-proof CHOICES
// OCR corruption fixes for this session's exams (2019h31h).
//
// Same contract as quiz-phase2-stemfix-S102/S103/S104.mjs: every fix below was
// adjudicated by 主 context against the source page (q052 protocol). Fixes assert the
// current substring occurs EXACTLY ONCE in the raw bank field, replace only that
// substring, then build-quiz-corpus.mjs regenerates questions.json. correct_answer /
// quiz_index / translations are untouched by this script. Idempotent.
//
// Run:  node scripts/quiz-phase2-stemfix-S105.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
const STEM_FIXES = [];

// CHOICES fixes = {id, letter, from, to}. `from` must occur EXACTLY ONCE in choices_jp[letter].
const CHOICE_FIXES = [
  {
    id: "2019h31h-q100",
    letter: "ア",
    from: "05 のログインパスワード",
    to: "OS のログインパスワード",
    why: "OCR OS→05 (source page-41: choice ア = 「…PC には，OS のログインパスワードを設定してもらう。」). Flagged by generate key-guard (stem_corruption_suspected), adjudicated by 主 context page read. Distractor cosmetic (key ウ=ディジタル署名 unchanged). zh/en already say OS (=clean, no trfix).",
  },
  {
    id: "2019h31h-q100",
    letter: "エ",
    from: "注文データを暗号化してから送ってもらう。> 渦一",
    to: "注文データを暗号化してから送ってもらう。",
    why: "Trailing OCR junk 「> 渦一」 = page-41 footer/column bleed (source: choice エ ends at 「…送ってもらう。」). Distractor cosmetic, key ウ unchanged. zh/en already clean.",
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
console.log(`✓ quiz-phase2-stemfix-S105: ${changed} field(s) applied → run build-quiz-corpus.mjs`);
