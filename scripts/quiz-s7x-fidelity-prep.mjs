#!/usr/bin/env node
// Stage 6 / Quiz — s7x DISPLAY-TEXT FIDELITY prep (Session 109, D-140 lineage).
//
// Why this exists (S109 finding): the Phase 2 generate key-guard, the in-pipeline reviewer
// and the Rule A critic all audit the explanation against the stem/choices AS GIVEN. None of
// them re-reads the source page for non-figure questions. So a choice whose text was
// corrupted into something that is still well-formed — and, in the worst case, still TRUE —
// produces no signal anywhere. 2015h27h-q062 ウ ("(A∩B) は B の部分集合" for the source's
// "(A∩B) は (A∪B) の部分集合") slipped through every gate that way, and it was the CORRECT
// choice. The S101 deterministic detector cannot see this class either (no 0/O-style tell).
//
// The highest-risk population is the questions whose stem/choices were REPLACED from an s7x
// resource during Phase 1 (`stem_resourced_s7x` / `choices_resourced_s7x` in the raw bank) —
// every semantic corruption found by hand in S109 sits in that set.
//
// This builds the audit input: per question, the DISPLAYED text (stem_jp_clean when present,
// else stem_jp — matching quizModel.ts) plus choices_jp, plus the absolute source page PNG,
// so an independent agent can transcribe from the image and diff verbatim.
//
// Run:  node scripts/quiz-s7x-fidelity-prep.mjs <exam_id>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const EXAMS_DIR = path.join(ROOT, "data/ip/exams");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase2");

const examId = process.argv[2];
if (!examId) { console.error("✗ usage: node scripts/quiz-s7x-fidelity-prep.mjs <exam_id>"); process.exit(1); }

const bank = JSON.parse(readFileSync(RB, "utf-8"));
const all = (bank.questions ?? bank).filter((q) => q.id.startsWith(`${examId}-`));
if (!all.length) { console.error(`✗ no questions for ${examId}`); process.exit(1); }

const trFile = path.join(TR_DIR, `${examId}.json`);
const tr = existsSync(trFile) ? JSON.parse(readFileSync(trFile, "utf-8")).questions : {};

const targets = all
  .filter((q) => q.stem_resourced_s7x === true || q.choices_resourced_s7x === true)
  .sort((a, b) => a.question_number - b.question_number);

const samples = targets.map((q) => {
  const pageRel = q.source?.page_image;
  const pagePng = pageRel ? path.join(EXAMS_DIR, pageRel) : null;
  if (!pagePng || !existsSync(pagePng)) throw new Error(`${q.id}: source page image missing (${pageRel})`);
  return {
    id: q.id,
    question_number: q.question_number,
    source_page_png: pagePng,
    resourced: { stem: q.stem_resourced_s7x === true, choices: q.choices_resourced_s7x === true },
    // what the learner actually sees (quizModel.ts prefers stem_jp_clean)
    displayed_stem_jp: tr[q.id]?.stem_jp_clean?.trim() || q.stem_jp,
    displayed_choices_jp: q.choices_jp,
    correct_answer: q.correct_answer,
  };
});

const out = path.join(OUT_DIR, `s7x_fidelity_input_${examId}.json`);
writeFileSync(out, JSON.stringify({ exam_id: examId, count: samples.length, samples }, null, 2) + "\n");

console.log(`✓ quiz-s7x-fidelity-prep ${examId}`);
console.log(`  s7x-resourced : ${samples.length}/${all.length} (stem ${targets.filter((q) => q.stem_resourced_s7x).length} / choices ${targets.filter((q) => q.choices_resourced_s7x).length})`);
console.log(`  qnums         : ${samples.map((s) => s.question_number).join(",")}`);
console.log(`  out           : ${path.relative(ROOT, out)}`);
