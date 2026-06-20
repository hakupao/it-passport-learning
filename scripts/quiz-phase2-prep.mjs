#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 (Session 97, D-137) — explanation prep.
//
// Builds the per-exam explanation INPUT for the Phase 2 generate workflow:
//   data/ip/quiz/.phase2/input_<exam>.json
// holding, per question, what an explanation-writer agent needs:
//   - id / topic_id / stem_jp (raw) + stem_jp_clean (from the Phase 1 sidecar, if any)
//   - choices_jp{ア..エ} / correct_answer
//   - has_figure + figure_png + figure_page_png (ABS paths; agents Read for vision +
//     the embedded key-guard re-derivation, D-137-C / D-小6 full-page authority)
//   - tr: the existing Phase 1 translation {stem:{zh,en}, choices:{L:{zh,en}}} | null
//     (so the JP-clean stem is used and zh/en terminology stays consistent with the
//     already-shipped question text, D-137-B)
//   - glossary: textbook unit terms (jp/zh/en) relevant to this question (D-136-D)
//
// .phase2/ is intermediate (gitignored). Workflow outputs land in
// .phase2/expl_jp_<id>.json + .phase2/expl_tr_<id>.json; quiz-phase2-merge.mjs
// assembles the committed sidecar data/ip/quiz/explanations/<exam>.json.
//
// Run:  node scripts/quiz-phase2-prep.mjs <exam_id>   (default 2025r07)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const RAW_BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const UNIT_INDEX = path.join(ROOT, "data/ip/textbook/unit_index.json");
const UNITS_DIR = path.join(ROOT, "data/ip/textbook/units");
const FIG_DIR = path.join(ROOT, "data/ip/exams/figures");
const EXAMS_DIR = path.join(ROOT, "data/ip/exams");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase2");

const GLOSSARY_CAP = 20;

function fail(msg) {
  console.error(`✗ quiz-phase2-prep: ${msg}`);
  process.exit(1);
}
function readJson(f) {
  if (!existsSync(f)) fail(`missing ${f}`);
  return JSON.parse(readFileSync(f, "utf-8"));
}

const examId = process.argv[2] ?? "2025r07";

const allQuestions = readJson(QUESTIONS).questions;
const questions = allQuestions.filter((q) => q.exam_id === examId);
if (!questions.length) fail(`no questions for exam ${examId}`);

// existing Phase 1 translation sidecar (optional; gives clean stem + zh/en for consistency)
const trFile = path.join(TR_DIR, `${examId}.json`);
const trSidecar = existsSync(trFile) ? readJson(trFile).questions : {};

// id → full source page PNG (D-小6: figure crops can clip table headers at edges).
const rawBank = readJson(RAW_BANK);
const pageById = new Map();
for (const rq of rawBank.questions ?? rawBank) {
  const rid = rq.id ?? rq.question_id;
  if (rid && rq.source?.page_image) pageById.set(rid, path.join(EXAMS_DIR, rq.source.page_image));
}

// topic_id → [{jp,zh,en}] from textbook units (dedup by jp)
const unitIndex = readJson(UNIT_INDEX);
const topicGlossary = new Map();
for (const t of unitIndex.topics) {
  const seen = new Set();
  const terms = [];
  for (const u of t.units) {
    const uf = path.join(UNITS_DIR, `${u.unit_id}.json`);
    if (!existsSync(uf)) continue;
    const uj = JSON.parse(readFileSync(uf, "utf-8"));
    for (const term of uj.terms ?? []) {
      if (!term.term || seen.has(term.term)) continue;
      seen.add(term.term);
      terms.push({ jp: term.term, zh: term.term_zh ?? "", en: term.term_en ?? "" });
    }
  }
  topicGlossary.set(t.topic_id, terms);
}

let withFigure = 0;
let withTr = 0;
const projected = questions.map((q) => {
  const topicTerms = topicGlossary.get(q.topic_id) ?? [];
  const haystack = q.stem_jp + " " + Object.values(q.choices_jp ?? {}).join(" ");
  const tagged = new Set(Array.isArray(q.terms) ? q.terms : []);
  const relevant = topicTerms.filter((t) => tagged.has(t.jp) || haystack.includes(t.jp));
  const glossary = relevant.slice(0, GLOSSARY_CAP);

  const hasFigure = Boolean(q.has_figure && q.figure);
  if (hasFigure) withFigure += 1;
  const figurePng = hasFigure ? path.join(FIG_DIR, `${q.figure}.png`) : null;
  if (figurePng && !existsSync(figurePng)) fail(`figure PNG missing for ${q.id}: ${figurePng}`);
  const figurePagePng = hasFigure ? pageById.get(q.id) ?? null : null;
  if (hasFigure && !figurePagePng) fail(`source page unknown for figure question ${q.id}`);
  if (figurePagePng && !existsSync(figurePagePng)) fail(`page PNG missing for ${q.id}: ${figurePagePng}`);

  const tr = trSidecar[q.id];
  if (tr) withTr += 1;

  return {
    id: q.id,
    topic_id: q.topic_id,
    stem_jp: q.stem_jp,
    stem_jp_clean: tr?.stem_jp_clean ?? null,
    choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
    correct_answer: q.correct_answer,
    has_figure: hasFigure,
    figure_png: figurePng,
    figure_page_png: figurePagePng,
    tr: tr ? { stem: tr.stem, choices: tr.choices } : null,
    glossary,
  };
});

mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `input_${examId}.json`);
writeFileSync(outFile, JSON.stringify({ exam_id: examId, count: projected.length, questions: projected }, null, 2) + "\n");

console.log(`✓ quiz-phase2-prep ${examId}`);
console.log(`  questions : ${projected.length}`);
console.log(`  figure    : ${withFigure}`);
console.log(`  with tr   : ${withTr}/${projected.length} (existing Phase 1 translation)`);
console.log(`  glossary  : avg ${(projected.reduce((s, p) => s + p.glossary.length, 0) / projected.length).toFixed(1)} terms/q, max ${Math.max(...projected.map((p) => p.glossary.length))}`);
console.log(`  out       : ${path.relative(ROOT, outFile)}`);
