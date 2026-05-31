#!/usr/bin/env node
/**
 * Stage 2.7 Step 2 prep — build per-page collation unit files.
 *
 * Groups all 2,900 questions by source.page_image → one "page unit" per distinct page (1208 units).
 * Each unit file inlines the STORED stem/choices (so the vision agent compares against exact bytes,
 * not a re-parse) plus absolute paths to the page image, per-question figure crop, and group shared
 * figure. The Step 2 workflow assigns ONE read-only `explore` agent per unit file (max OCR accuracy:
 * 1 page image / agent, ~2.4 questions). Output is gitignored under data/.../.tmp/s027/units/.
 *
 * Usage: node scripts/stage027-build-manifest.mjs
 * Output: data/ip/exams/.tmp/s027/units/<exam>__page-NN.json (×1208)
 *         data/ip/exams/.tmp/s027/page_units_index.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const UNITS = `${EXAMS}/.tmp/s027/units`;
mkdirSync(UNITS, { recursive: true });

const qb = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8'));
const Q = qb.questions;
const groups = JSON.parse(readFileSync(`${EXAMS}/groups.json`, 'utf8'));
const groupById = new Map(groups.groups.map((g) => [g.group_id, g]));
const heur = JSON.parse(readFileSync(`${ROOT}/evidence/phase5/stage_027_heuristic_garble.json`, 'utf8'));
const heurById = new Map(heur.results.map((r) => [r.id, r]));

const abs = (rel) => (rel ? `${EXAMS}/${rel}` : null);

// group by page image
const byPage = new Map();
for (const q of Q) {
  const pi = q.source.page_image;
  if (!byPage.has(pi)) byPage.set(pi, []);
  byPage.get(pi).push(q);
}

const index = [];
let nUnits = 0;
for (const [pageImage, qs] of byPage) {
  const exam = pageImage.split('/')[1];
  const pageNum = qs[0].source.page_number;
  // unit key from the actual filename so collisions across page_number quirks are impossible
  const pageBase = pageImage.split('/').pop().replace(/\.png$/, ''); // page-NN
  const unitId = `${exam}__${pageBase}`;
  qs.sort((a, b) => a.question_number - b.question_number);

  const questions = qs.map((q) => {
    const h = heurById.get(q.id) || {};
    const g = q.group_id ? groupById.get(q.group_id) : null;
    return {
      id: q.id,
      qn: q.question_number,
      stored_stem: q.stem_jp,
      stored_choices: q.choices_jp,
      correct_answer: q.correct_answer, // shown to agent ONLY as context; never to be changed
      has_figure: !!q.has_figure,
      figure_abs: abs(q.figure_path || null),
      group_id: q.group_id || null,
      group_shared_figure_abs: g ? abs(g.shared_figure.path) : null,
      group_header_quote: g ? g.header_quote : null,
      heur_score: h.score ?? 0,
      heur_flags: h.flags ? Object.keys(h.flags) : [],
    };
  });

  const unit = {
    unit_id: unitId,
    exam,
    page_image_rel: pageImage,
    page_image_abs: abs(pageImage),
    page_number: pageNum,
    questions,
  };
  const file = `${UNITS}/${unitId}.json`;
  writeFileSync(file, JSON.stringify(unit, null, 2));
  index.push({ unit_id: unitId, exam, page_image_rel: pageImage, file, n_questions: questions.length, qids: questions.map((q) => q.id) });
  nUnits++;
}

index.sort((a, b) => a.unit_id.localeCompare(b.unit_id));
const byExam = {};
for (const u of index) (byExam[u.exam] ||= []).push(u.unit_id);

writeFileSync(`${EXAMS}/.tmp/s027/page_units_index.json`, JSON.stringify({
  total_units: nUnits,
  total_questions: Q.length,
  exams: Object.keys(byExam).length,
  units_per_exam: Object.fromEntries(Object.entries(byExam).map(([k, v]) => [k, v.length])),
  index,
}, null, 2));

console.log(`built ${nUnits} page units across ${Object.keys(byExam).length} exams`);
console.log(`questions covered: ${index.reduce((s, u) => s + u.n_questions, 0)} / ${Q.length}`);
console.log(`index → data/ip/exams/.tmp/s027/page_units_index.json`);
