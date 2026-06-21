#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 98, D-139-B) — key+choices integrity audit prep (BLIND).
//
// Builds per-exam BLIND input for the key-audit workflow over FIGURE questions:
//   data/ip/quiz/.keyaudit/input_<exam>.json
// Each entry gives the auditor the displayed (Phase 1.5-faithful) stem + choices + figure,
// but DELIBERATELY OMITS correct_answer so the deriver cannot rationalize toward the stored
// key (S98 q092 lesson: writers given the key drift toward it). The stored key is kept OUT
// of the workflow and compared AFTER, by quiz-keyaudit-compare.mjs.
//
// Run:  node scripts/quiz-keyaudit-prep.mjs <exam_id>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const RAW_BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const FIG_DIR = path.join(ROOT, "data/ip/exams/figures");
const EXAMS_DIR = path.join(ROOT, "data/ip/exams");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.keyaudit");

function fail(m) { console.error(`✗ quiz-keyaudit-prep: ${m}`); process.exit(1); }
function readJson(f) { if (!existsSync(f)) fail(`missing ${f}`); return JSON.parse(readFileSync(f, "utf-8")); }

const examId = process.argv[2];
if (!examId) fail("usage: quiz-keyaudit-prep.mjs <exam_id>");

const questions = readJson(QUESTIONS).questions.filter((q) => q.exam_id === examId && q.has_figure && q.figure);
if (!questions.length) fail(`no figure questions for ${examId}`);

const trFile = path.join(TR_DIR, `${examId}.json`);
const tr = existsSync(trFile) ? readJson(trFile).questions : {};
const rawById = new Map();
for (const rq of (readJson(RAW_BANK).questions ?? [])) { const id = rq.id ?? rq.question_id; if (id) rawById.set(id, rq); }

const projected = [];
for (const q of questions) {
  const rq = rawById.get(q.id);
  const figurePng = path.join(FIG_DIR, `${q.figure}.png`);
  if (!existsSync(figurePng)) fail(`figure PNG missing for ${q.id}`);
  const pageRel = rq?.source?.page_image;
  const figurePagePng = pageRel ? path.join(EXAMS_DIR, pageRel) : null;
  if (!figurePagePng || !existsSync(figurePagePng)) fail(`page PNG missing for ${q.id}`);
  // displayed stem = Phase 1.5-faithful clean stem if present, else raw stem
  const displayedStem = tr[q.id]?.stem_jp_clean ?? q.stem_jp;
  projected.push({
    id: q.id,
    question_number: q.question_number,
    stem_jp: displayedStem,
    choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
    figure_png: figurePng,
    figure_page_png: figurePagePng,
    // correct_answer intentionally OMITTED (blind audit)
  });
}

mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `input_${examId}.json`);
writeFileSync(outFile, JSON.stringify({ exam_id: examId, count: projected.length, questions: projected }, null, 2) + "\n");
console.log(`✓ quiz-keyaudit-prep ${examId}: ${projected.length} figure questions (blind, no key) → ${path.relative(ROOT, outFile)}`);
