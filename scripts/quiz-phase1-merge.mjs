#!/usr/bin/env node
// Stage 6 / Quiz Phase 1 (Session 87, D-136-B) — translation merge (deterministic).
//
// Assembles the committed per-exam translation sidecar
//   data/ip/quiz/translations/<exam>.json
// from the workflow's per-question outputs data/ip/quiz/.phase1/tr_<id>.json
// (each: { id, stem_jp_clean?, stem:{zh,en}, choices:[{letter,zh,en}×4] }).
//
// Validates every entry (id match, non-empty zh/en, all 4 canonical letters) and
// reports coverage vs the exam's questions. Missing translations are reported, NOT
// silently dropped (partial coverage = legitimate incremental backfill, but a half
// batch must be visible). choices array → object keyed by letter (sidecar schema).
//
// Run:  node scripts/quiz-phase1-merge.mjs <exam_id>   (default 2025r07)

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const PHASE1_DIR = path.join(ROOT, "data/ip/quiz/.phase1");
const TR_OUT_DIR = path.join(ROOT, "data/ip/quiz/translations");
const LETTERS = ["ア", "イ", "ウ", "エ"];

function fail(msg) {
  console.error(`✗ quiz-phase1-merge: ${msg}`);
  process.exit(1);
}
function nonEmpty(s) {
  return typeof s === "string" && s.trim() !== "";
}

const examId = process.argv[2] ?? "2025r07";

const allQuestions = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions;
const examQuestions = allQuestions.filter((q) => q.exam_id === examId);
if (!examQuestions.length) fail(`no questions for exam ${examId}`);
const figureIds = new Set(examQuestions.filter((q) => q.has_figure).map((q) => q.id));

const merged = {};
const missing = [];
const errors = [];

for (const q of examQuestions) {
  const trFile = path.join(PHASE1_DIR, `tr_${q.id}.json`);
  if (!existsSync(trFile)) {
    missing.push(q.id);
    continue;
  }
  let tr;
  try {
    tr = JSON.parse(readFileSync(trFile, "utf-8"));
  } catch (e) {
    errors.push(`${q.id}: unparseable tr file (${e.message})`);
    continue;
  }
  if (tr.id !== q.id) errors.push(`${q.id}: tr.id mismatch '${tr.id}'`);
  if (!nonEmpty(tr.stem?.zh) || !nonEmpty(tr.stem?.en)) errors.push(`${q.id}: empty stem zh/en`);
  if (!Array.isArray(tr.choices) || tr.choices.length !== 4) {
    errors.push(`${q.id}: choices not 4-array`);
    continue;
  }
  const choicesObj = {};
  for (const c of tr.choices) {
    if (!LETTERS.includes(c.letter)) errors.push(`${q.id}: bad choice letter '${c.letter}'`);
    if (!nonEmpty(c.zh) || !nonEmpty(c.en)) errors.push(`${q.id}: choice ${c.letter} empty zh/en`);
    choicesObj[c.letter] = { zh: c.zh, en: c.en };
  }
  for (const L of LETTERS) if (!(L in choicesObj)) errors.push(`${q.id}: missing choice ${L}`);

  const entry = { stem: { zh: tr.stem.zh, en: tr.stem.en }, choices: choicesObj };
  if (nonEmpty(tr.stem_jp_clean)) {
    entry.stem_jp_clean = tr.stem_jp_clean;
  } else if (figureIds.has(q.id)) {
    // A figure question without a clean stem is allowed (the raw stem may already be
    // clean), but worth surfacing so a silently-skipped de-garble is visible.
    console.warn(`  ⚠ ${q.id}: figure question with no stem_jp_clean (raw stem kept)`);
  }
  // stable key order: stem_jp_clean (if any) → stem → choices
  merged[q.id] = entry.stem_jp_clean
    ? { stem_jp_clean: entry.stem_jp_clean, stem: entry.stem, choices: entry.choices }
    : { stem: entry.stem, choices: entry.choices };
}

if (errors.length) {
  fail(`validation errors:\n  ${errors.join("\n  ")}`);
}

mkdirSync(TR_OUT_DIR, { recursive: true });
const outFile = path.join(TR_OUT_DIR, `${examId}.json`);
const sidecar = {
  schema_version: "quiz-tr-v1",
  exam_id: examId,
  source_note:
    "JP→zh/en 機械翻訳 (Claude opus, D-136)。figure 問は図を参照し OCR 混入を除去した stem_jp_clean を併記。出典は IPA 過去問 (改変=OCR修復+翻訳)。",
  count: Object.keys(merged).length,
  questions: merged,
};
writeFileSync(outFile, JSON.stringify(sidecar, null, 2) + "\n");

console.log(`✓ quiz-phase1-merge ${examId}`);
console.log(`  exam questions : ${examQuestions.length}`);
console.log(`  translated     : ${Object.keys(merged).length}`);
console.log(`  missing        : ${missing.length}${missing.length ? " → " + missing.slice(0, 8).join(", ") + (missing.length > 8 ? " …" : "") : ""}`);
console.log(`  with clean stem: ${Object.values(merged).filter((m) => m.stem_jp_clean).length}`);
console.log(`  out            : ${path.relative(ROOT, outFile)}`);
