#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.5 (Session 97, D-138) — stem-reconstruction prep.
//
// Builds the per-exam input for the stem reconstruction workflow:
//   data/ip/quiz/.phase1.5/input_<exam>.json
// covering the AT-RISK stems of the exam:
//   - every figure question (rebuild stem FROM the figure; full set — figure-table
//     fidelity is not sample-certifiable per the S97 stem audit q066 miss)
//   - non-figure questions with stem corruption markers (s7x / corrupted_backup):
//     reconcile the repaired stem vs the original-OCR backup + answer-derivability
//
// Per question the writer agent needs: raw stem, current clean stem (Phase 1, if any,
// possibly WRONG — q050), original-OCR backup (non-fig ground truth), choices,
// correct_answer, figure crop + authoritative full page, existing zh/en translation
// (term/style consistency), glossary.
//
// Run:  node scripts/quiz-phase1.5-prep.mjs <exam_id> [--figure-only]
//   default exam 2025r07. --figure-only restricts to figure questions (pilot).

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
const OUT_DIR = path.join(ROOT, "data/ip/quiz/.phase1.5");
const GLOSSARY_CAP = 20;

function fail(m) { console.error(`✗ quiz-phase1.5-prep: ${m}`); process.exit(1); }
function readJson(f) { if (!existsSync(f)) fail(`missing ${f}`); return JSON.parse(readFileSync(f, "utf-8")); }

const examId = process.argv[2] ?? "2025r07";
const figureOnly = process.argv.includes("--figure-only");

const questions = readJson(QUESTIONS).questions.filter((q) => q.exam_id === examId);
if (!questions.length) fail(`no questions for exam ${examId}`);

const trFile = path.join(TR_DIR, `${examId}.json`);
const tr = existsSync(trFile) ? readJson(trFile).questions : {};

// raw bank: page image + stem_jp_corrupted_backup + stem markers
const rawById = new Map();
for (const rq of (readJson(RAW_BANK).questions ?? [])) {
  const id = rq.id ?? rq.question_id;
  if (id) rawById.set(id, rq);
}
const H = (q, k) => q && q[k] !== undefined;
const stemMarked = (rq) => H(rq, "stem_resourced_s7x") || H(rq, "stem_refixed_s7x") || H(rq, "stem_resourced_s7xb") || H(rq, "stem_jp_corrupted_backup");

// topic glossary (jp/zh/en)
const topicGlossary = new Map();
for (const t of readJson(UNIT_INDEX).topics) {
  const seen = new Set(); const terms = [];
  for (const u of t.units) {
    const uf = path.join(UNITS_DIR, `${u.unit_id}.json`);
    if (!existsSync(uf)) continue;
    for (const term of (JSON.parse(readFileSync(uf, "utf-8")).terms ?? [])) {
      if (!term.term || seen.has(term.term)) continue;
      seen.add(term.term); terms.push({ jp: term.term, zh: term.term_zh ?? "", en: term.term_en ?? "" });
    }
  }
  topicGlossary.set(t.topic_id, terms);
}

const projected = [];
for (const q of questions) {
  const rq = rawById.get(q.id);
  const isFig = Boolean(q.has_figure && q.figure);
  const marked = !isFig && stemMarked(rq);
  if (figureOnly && !isFig) continue;
  if (!isFig && !marked) continue; // plain non-figure → not reconstructed (low risk, D-138)

  const figurePng = isFig ? path.join(FIG_DIR, `${q.figure}.png`) : null;
  if (figurePng && !existsSync(figurePng)) fail(`figure PNG missing for ${q.id}`);
  const pageRel = rq?.source?.page_image;
  const figurePagePng = isFig && pageRel ? path.join(EXAMS_DIR, pageRel) : null;
  if (isFig && (!figurePagePng || !existsSync(figurePagePng))) fail(`page PNG missing for figure question ${q.id}`);

  const topicTerms = topicGlossary.get(q.topic_id) ?? [];
  const haystack = q.stem_jp + " " + Object.values(q.choices_jp ?? {}).join(" ");
  const tagged = new Set(Array.isArray(q.terms) ? q.terms : []);
  const glossary = topicTerms.filter((t) => tagged.has(t.jp) || haystack.includes(t.jp)).slice(0, GLOSSARY_CAP);

  projected.push({
    id: q.id,
    question_number: q.question_number,
    klass: isFig ? "figure" : "nonfig_marked",
    raw_stem: q.stem_jp,
    current_clean: tr[q.id]?.stem_jp_clean ?? null, // Phase 1 clean stem (may be WRONG, e.g. q050)
    stem_corrupted_backup: rq?.stem_jp_corrupted_backup ?? null, // non-fig ground truth
    choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
    correct_answer: q.correct_answer,
    figure_png: figurePng,
    figure_page_png: figurePagePng,
    current_tr: tr[q.id] ? { stem: tr[q.id].stem, choices: tr[q.id].choices } : null,
    glossary,
  });
}

mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `input_${examId}.json`);
writeFileSync(outFile, JSON.stringify({ exam_id: examId, count: projected.length, questions: projected }, null, 2) + "\n");

const fig = projected.filter((p) => p.klass === "figure").length;
console.log(`✓ quiz-phase1.5-prep ${examId}${figureOnly ? " (figure-only)" : ""}`);
console.log(`  at-risk    : ${projected.length} (figure ${fig} / nonfig_marked ${projected.length - fig})`);
console.log(`  with backup: ${projected.filter((p) => p.stem_corrupted_backup).length}`);
console.log(`  out        : ${path.relative(ROOT, outFile)}`);
