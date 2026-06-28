#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S102 (D-137 / D-140) — drift-proof STEM + CHOICES
// OCR/s7x corruption fixes for the 28-exam scale (this batch: 2026r08 / 2024r06 / 2023r05).
//
// Same contract as quiz-phase2-stemfix.mjs (the S100 pilot tool), but scoped to THIS
// session's adjudicated fixes so the evidence trail stays per-session. Every fix below
// was adjudicated by 主 context against the source page at high magnification (q052
// protocol) and the zh/en translations were confirmed already-correct (Phase 1 translator
// saw through the garble) — so these are JP-only restorations of the DISPLAYED stem/choice.
//
// Drift-proof: assert the current substring occurs EXACTLY ONCE in the raw bank field,
// replace only that substring, then build-quiz-corpus.mjs regenerates questions.json.
// correct_answer / quiz_index / translations are untouched. Idempotent (re-running skips
// already-applied fixes).
//
// Run:  node scripts/quiz-phase2-stemfix-S102.mjs   (then: node scripts/build-quiz-corpus.mjs)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");

// STEM fixes = {id, from, to}. `from` must occur EXACTLY ONCE in stem_jp.
const STEM_FIXES = [
  {
    id: "2026r08-q001",
    from: "可能性のあるものはどれか。全て挙げたものはどれか。",
    to: "可能性のあるものだけを，全て挙げたものはどれか。",
    why: "OCR dropped 「だけを，」 and inserted spurious 「どれか。」. Source (page-02) = 「…可能性のあるものだけを，全て挙げたものはどれか。」(standard IPA 'select all' phrasing). cosmetic, key ア unchanged (a only requires permission; b/c are private-use). zh/en already clean.",
  },
  {
    id: "2023r05-q023",
    from: "ISO/IEC 19519",
    to: "ISO/IEC 19510",
    why: "OCR 19510→19519 (source page-10 = ISO/IEC 19510, BPMN's actual standard; 19519 does not exist). No stem_jp_clean → raw stem_jp is displayed. cosmetic, key イ (BPMN) unchanged. zh/en ALSO carry 19519 → fixed in trfix-S102.",
  },
];

// CHOICES fixes = {id, letter, from, to}. `from` must occur EXACTLY ONCE in choices_jp[letter].
const CHOICE_FIXES = [
  {
    id: "2023r05-q021",
    letter: "ア",
    from: "もっていればぱば",
    to: "もっていれば",
    why: "OCR duplicated 「ぱば」 (source page-10 = 「もっていれば」). distractor cosmetic, key ウ unchanged. zh already clean.",
  },
  {
    id: "2023r05-q056",
    letter: "イ",
    from: "クラウドサービス固有の管理策が適切に実施，実施されていることを認証するものを認証する組織はない。",
    to: "クラウドサービス固有の管理策が適切に実施されていることを認証するものである。",
    why: "OCR corruption (実施，実施 dup + 末尾「を認証するものを認証する組織はない」破損; literal contradicts key イ). Source page-25 = 「…適切に実施されていることを認証するものである。」. key イ unchanged (still the correct choice). zh/en already clean (translator saw the right meaning).",
  },
];

// Trailing OCR-noise strips = {id, letter, anchor}. Keep through the LAST `anchor`, drop the
// trailing run (must be only whitespace / 　 / ] / ・ OCR junk).
const TRAILING_STRIPS = [];

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
console.log(`✓ quiz-phase2-stemfix-S102: ${changed} field(s) applied → run build-quiz-corpus.mjs`);
