#!/usr/bin/env node
// Stage 6 / Quiz Phase 1 (Session 87, D-136) — translation prep.
//
// Builds the per-exam translation INPUT for the Phase 1 translate workflow:
//   data/ip/quiz/.phase1/input_<exam>.json
// holding, per question, exactly what a translator agent needs (D-136-D term
// binding + D-136-C figure vision):
//   - id / topic_id / stem_jp (raw) / choices_jp / correct_answer
//   - has_figure + figure_png (ABS path to the raw PNG; agents Read it for vision)
//   - glossary: the textbook unit terms (jp/zh/en) RELEVANT to this question
//     (tagged terms + terms whose JP appears in the stem/choices), capped + deduped
//
// The .phase1/ tree is an intermediate (gitignored). The workflow's per-question
// outputs land in .phase1/tr_<id>.json, then quiz-phase1-merge.mjs assembles the
// committed sidecar data/ip/quiz/translations/<exam>.json.
//
// Run:  node scripts/quiz-phase1-prep.mjs <exam_id>   (default 2025r07)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const UNIT_INDEX = path.join(ROOT, "data/ip/textbook/unit_index.json");
const UNITS_DIR = path.join(ROOT, "data/ip/textbook/units");
const FIG_DIR = path.join(ROOT, "data/ip/exams/figures");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase1");

const GLOSSARY_CAP = 20;

function fail(msg) {
  console.error(`✗ quiz-phase1-prep: ${msg}`);
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

// --- build topic_id → [{jp,zh,en}] from textbook units (dedup by jp) ----------
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

// --- project each question + relevant glossary --------------------------------
let withFigure = 0;
// Field names follow the DERIVED corpus (data/ip/quiz/questions.json): topic_id,
// terms[], has_figure, figure (basename = id) — NOT the raw bank's syllabus_refs.*.
const projected = questions.map((q) => {
  const topicTerms = topicGlossary.get(q.topic_id) ?? [];
  const haystack = q.stem_jp + " " + Object.values(q.choices_jp ?? {}).join(" ");
  const tagged = new Set(Array.isArray(q.terms) ? q.terms : []);
  // Relevance: question-tagged terms first, then any unit term literally present in
  // the stem/choices. Keeps the glossary small + on-topic (the topic-wide list can
  // be 90+ terms; the translator only needs the ones actually in play).
  const relevant = topicTerms.filter((t) => tagged.has(t.jp) || haystack.includes(t.jp));
  const glossary = relevant.slice(0, GLOSSARY_CAP);

  const hasFigure = Boolean(q.has_figure && q.figure);
  if (hasFigure) withFigure += 1;
  const figurePng = hasFigure ? path.join(FIG_DIR, `${q.figure}.png`) : null;
  if (figurePng && !existsSync(figurePng)) fail(`figure PNG missing for ${q.id}: ${figurePng}`);

  return {
    id: q.id,
    topic_id: q.topic_id,
    stem_jp: q.stem_jp,
    choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
    correct_answer: q.correct_answer,
    has_figure: hasFigure,
    figure_png: figurePng,
    glossary,
  };
});

mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `input_${examId}.json`);
writeFileSync(outFile, JSON.stringify({ exam_id: examId, count: projected.length, questions: projected }, null, 2) + "\n");

console.log(`✓ quiz-phase1-prep ${examId}`);
console.log(`  questions : ${projected.length}`);
console.log(`  figure    : ${withFigure}`);
console.log(`  glossary  : avg ${(projected.reduce((s, p) => s + p.glossary.length, 0) / projected.length).toFixed(1)} terms/q, max ${Math.max(...projected.map((p) => p.glossary.length))}`);
console.log(`  out       : ${path.relative(ROOT, outFile)}`);
