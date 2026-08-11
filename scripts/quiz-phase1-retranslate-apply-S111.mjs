#!/usr/bin/env node
// Stage 6 / Quiz — write back the re-translated 2010h22a-q091 question text (S111).
//
// The JP for this question was restored by quiz-phase1-restore-S111-2010h22a-q091.mjs (it had
// been overwritten with a copy of 問89). Its zh/en still translated the 問89 duplicate, so they
// were regenerated from the restored JP (`wf_1a44079a-36d`) and checked by a different agent
// type against the source.
//
// The verifier returned CONCERNS, but not about the translation: all five content checks
// (table_values_match / all_choices_present / meaning_faithful / no_drift / terminology_correct)
// came back true, and it independently re-derived ア from 表1 to confirm the translation does
// not leak which row is wrong. The two CONCERNS were about how the payload must be written:
//   1. the agent returns `choices` as an array of {letter, zh, en}, but the sidecar stores a
//      dict keyed by letter — writing the array shape would break this one record's schema;
//   2. `stem_jp_clean` (restored JP) must not be clobbered.
// Both are this script's job, and both are asserted below.
//
// Run: node scripts/quiz-phase1-retranslate-apply-S111.mjs <task_output>

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = path.join(ROOT, "data/ip/quiz/translations/2010h22a.json");
const ID = "2010h22a-q091";
const LETTERS = ["ア", "イ", "ウ", "エ"];

const taskOut = process.argv[2];
if (!taskOut) {
  console.error("✗ usage: node scripts/quiz-phase1-retranslate-apply-S111.mjs <task_output>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(taskOut, "utf-8"));
const payload = raw.result ?? raw;
const tr = payload?.translation;
const v = payload?.verification;
if (!tr || tr.id !== ID) throw new Error(`translation payload missing or wrong id (${tr?.id})`);
if (!v) throw new Error("verification missing");

// content must be clean even though the verdict is CONCERNS (the concerns are write-format only)
for (const k of ["table_values_match", "all_choices_present", "meaning_faithful", "no_drift", "terminology_correct"]) {
  if (v.checks?.[k] !== true) throw new Error(`verification check ${k} is not true — refusing to write`);
}
if (v.verdict === "FAIL") throw new Error("verification verdict is FAIL — refusing to write");

// the table values are the answer-bearing part of this question — assert them explicitly
for (const lang of ["zh", "en"]) {
  const s = tr.stem?.[lang];
  if (typeof s !== "string") throw new Error(`stem.${lang} missing`);
  for (const row of ["| C | 60 | 5 | 1,400 |", "| C | 101 | 8 | 1,800 |", "| D | 60 | 5 | 2,350 |", "| D | 101 | 8 | 3,400 |"]) {
    if (!s.includes(row)) throw new Error(`stem.${lang} lost table row "${row}" — refusing to write`);
  }
}

// array → dict, and every letter must be present exactly once
const byLetter = {};
for (const c of tr.choices ?? []) {
  if (!LETTERS.includes(c.letter)) throw new Error(`unexpected choice letter ${c.letter}`);
  if (byLetter[c.letter]) throw new Error(`duplicate choice letter ${c.letter}`);
  if (!c.zh?.trim() || !c.en?.trim()) throw new Error(`choice ${c.letter} has an empty language`);
  byLetter[c.letter] = { zh: c.zh, en: c.en };
}
for (const L of LETTERS) if (!byLetter[L]) throw new Error(`choice ${L} missing from the payload`);

const doc = JSON.parse(readFileSync(TR, "utf-8"));
const entry = doc.questions?.[ID];
if (!entry) throw new Error(`${ID}: translation entry missing`);

const cleanBefore = entry.stem_jp_clean;
if (typeof cleanBefore !== "string" || !cleanBefore.includes("3辺計")) {
  throw new Error(`${ID}: stem_jp_clean does not look like the restored JP — run the restore script first`);
}

entry.stem = { zh: tr.stem.zh, en: tr.stem.en };
entry.choices = byLetter;

if (entry.stem_jp_clean !== cleanBefore) throw new Error(`${ID}: stem_jp_clean was modified — aborting`);

writeFileSync(TR, JSON.stringify(doc, null, 2) + "\n");
console.log(`  ✓ ${ID} stem.{zh,en} + choices.{ア,イ,ウ,エ}.{zh,en} written (choices normalised array → dict)`);
console.log(`  ✓ ${ID} stem_jp_clean preserved (${cleanBefore.length} chars)`);
console.log(`✓ quiz-phase1-retranslate-apply-S111 → next: node scripts/build-quiz-corpus.mjs`);
console.log(`  NOTE: 中問A (q089/q090/q091/q092) の「3辺計」訳語は 三边合计 / 三边之和、「地区」は District / Region で割れている (既存 drift)。用語統一は backlog。`);
