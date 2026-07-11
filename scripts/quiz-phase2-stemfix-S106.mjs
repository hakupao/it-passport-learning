#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S106 (D-137 / D-140) — drift-proof STEM + CHOICES
// OCR corruption fixes for this session's exams (2018h30h; 2017h29h if any).
//
// Same contract as quiz-phase2-stemfix-S102..S105.mjs: every fix below was adjudicated
// by 主 context against the source page (q052 protocol / D-小6 full-page authority).
// Substring fixes assert the `from` occurs EXACTLY ONCE and replace only that substring;
// the q047 truncation is an append (the corrupted value is a strict prefix of the
// corrected one, so a substring assert-replace is not idempotent — handled by an
// endsWith drift-guard instead). build-quiz-corpus.mjs then regenerates questions.json.
// correct_answer / quiz_index / translations are untouched by this script. Idempotent.
//
// Run:  node scripts/quiz-phase2-stemfix-S106.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
const STEM_FIXES = [
  {
    id: "2018h30h-q077",
    from: "599G",
    to: "500G",
    why: "OCR 599G→500G (source page-34 問77 = 「1台の HDD の容量が500G バイトのとき」). Flagged answer-affecting by generate key-guard (matches_key=false): literal 599G gives 3×599≈1.8T→エ, but official key ウ=1.5T holds only at 500G (3×500=1500G=1.5T). 主 context page read confirms 500G. Answer ウ unchanged (explanation already written for the 500G premise per D-137-C). tr sidecar stem_jp_clean/zh/en also fixed in trfix-S106.",
  },
];

// CHOICES substring fixes = {id, letter, from, to}. strip/swap only (from ⊇ to, or
// from/to non-containing) so assert-replace is idempotent. `from` must occur EXACTLY ONCE.
const CHOICE_FIXES = [
  {
    id: "2018h30h-q009",
    letter: "エ",
    from: "。デ洛 呈",
    to: "。",
    why: "Trailing OCR junk 「デ洛 呈」 (source page-05 問9: choice エ ends at 「…直ちにA氏に開示しなければならない。」). Distractor cosmetic, key ウ unchanged. zh/en already clean (no trfix).",
  },
  {
    id: "2018h30h-q051",
    letter: "ウ",
    from: "避次",
    to: "こと",
    why: "OCR 「避次」→「こと」 (source page-22 問51: choice ウ ends 「…実施できること」; all four choices end 「こと」). Distractor cosmetic, key ア unchanged. zh/en already clean.",
  },
  {
    id: "2018h30h-q067",
    letter: "ア",
    from: "。ぜい",
    to: "。",
    why: "Trailing OCR junk 「ぜい」 = furigana of 「脆」 in the NEXT choice イ 「脆弱性」 (source page-31 問67: choice ア ends 「…記録メディアをあさる。」). This IS the correct choice (key ア) but only the trailing ruby-bleed is stripped; meaning intact. zh/en already clean.",
  },
  // The next two were NOT flagged by generate's stem_corruption_suspected (key_guard had
  // matches_key=true), so they were absent from the merge STEM-CORRUPTION list — the
  // generator noted the OCR only in the explanation prose. Rule A (wf_28186bc3-d20) +
  // a systematic user-facing-caveat scan surfaced them; adjudicated against source.
  {
    id: "2018h30h-q040",
    letter: "ア",
    from: "1ITベンダ",
    to: "ITベンダ",
    why: "Leading OCR junk 「1」 (source page-18 問40: choice ア = 「IT ベンダが構築すべきものであり, それ以外の組織では必要ない。」). Distractor cosmetic, key ウ unchanged. zh/en already clean.",
  },
  {
    id: "2018h30h-q082",
    letter: "ウ",
    from: "規格ぜい",
    to: "規格",
    why: "Trailing OCR junk 「ぜい」 = furigana of 「脆」 in the NEXT choice エ 「脆弱性」 (source page-37 問82: choice ウ = 「工業製品や測定方法などの規格」). Distractor cosmetic, key エ unchanged. zh/en already clean.",
  },
];

// APPEND fixes (truncation) = {id, letter, endsCorrupt, appendText}. Not substring-safe
// (corrupted value is a strict prefix of corrected) → idempotent endsWith drift-guard.
const CHOICE_APPENDS = [
  {
    id: "2018h30h-q047",
    letter: "ウ",
    endsCorrupt: "事前に交代要員を確",
    endsFixed: "事前に交代要員を確保する。",
    appendText: "保する。",
    why: "OCR truncation: choice ウ cut off at 「…事前に交代要員を確」, source page-21 問47 = 「…事前に交代要員を確保する。」. Distractor cosmetic, key イ unchanged. zh/en already complete (translator inferred the full 確保する meaning).",
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
for (const f of CHOICE_APPENDS) {
  const q = byId.get(f.id);
  if (!q) throw new Error(`${f.id}: not found in raw bank`);
  const cur = q.choices_jp?.[f.letter];
  if (typeof cur !== "string") throw new Error(`${f.id}: choices_jp[${f.letter}] missing`);
  if (cur.endsWith(f.endsFixed)) { console.log(`  ~ ${f.id} ${f.letter}: already restored, skip`); continue; }
  if (!cur.endsWith(f.endsCorrupt)) throw new Error(`${f.id} ${f.letter}: unexpected ending — drift guard. Current:\n${cur}`);
  q.choices_jp[f.letter] = cur + f.appendText;
  changed++;
  console.log(`  ✓ ${f.id} ${f.letter}: append 「${f.appendText}」`);
}

if (changed > 0) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(`✓ quiz-phase2-stemfix-S106: ${changed} field(s) applied → run build-quiz-corpus.mjs`);
