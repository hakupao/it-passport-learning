#!/usr/bin/env node
// Stage 6 / Quiz 接過去問 Phase 0 (Session 86, D-134) — projection script.
//
// raw `data/ip/exams/question_bank.json` (2900 Q, IPA-copyrighted, gitignored,
// carries pipeline repair-trail cruft like *_corrupted_backup / s027_*) is the
// SOURCE. This script projects a CLEAN derived corpus to `data/ip/quiz/`
// (un-gitignored per D-134) holding only what the web app needs:
//   - quiz_index.json : 63 topic labels (trilingual, joined from textbook
//                       unit_index.json) + 29 exam labels + counts
//   - questions.json  : 2900 projected questions (JP stem/choices + 出典 +
//                       figure ref + syllabus_refs subset)
//
// Deterministic transform (no LLM): IPA terms (FAQ) permit educational reuse of
// past questions with 出典明記 + 改変明記, so every question carries a derived
// `source_label` (出典) and the UI shows a global modification notice.
//
// NOT done here (intentional): stem garble cleanup. 249/467 figure-stems contain
// "|" but most are LEGITIMATE markdown tables the question needs (損益計算資料,
// 生産性表); only some are OCR noise. The split is semantic, not pattern-based,
// so deterministic stripping would delete real content. Deferred to Phase 1
// (LLM translation produces clean trilingual text). v1 shows raw JP stems.
//
// Run from repo root:  node scripts/build-quiz-corpus.mjs
// Idempotent: overwrites data/ip/quiz/*.json. Figures handled separately
// (scripts/build-quiz-figures.mjs).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const UNIT_INDEX = path.join(ROOT, "data/ip/textbook/unit_index.json");
const OUT_DIR = path.join(ROOT, "data/ip/quiz");
const FIG_SRC_DIR = path.join(ROOT, "data/ip/exams/figures");

const CHOICE_LETTERS = ["ア", "イ", "ウ", "エ"];
// D-114 recommended learning path order (matches textbook reader CATEGORY_ORDER).
const CATEGORY_ORDER = ["technology", "management", "strategy"];
// Exam-id suffix → 期 (verified: 2019 h31h=平成31春 + r01a=令和元秋; 2011 h23a +
// tokubetsu because 2011 春 was 震災-cancelled). Empty = 通年 (CBT, 2021r03+).
const SEASON = { h: "春期", a: "秋期", tokubetsu: "特別試験", o: "" };
const SEASON_ORDER = { h: 0, a: 1, tokubetsu: 2, o: 3, "": 4 };

function fail(msg) {
  console.error(`✗ build-quiz-corpus: ${msg}`);
  process.exit(1);
}

function readJson(file) {
  if (!existsSync(file)) fail(`missing input ${file}`);
  return JSON.parse(readFileSync(file, "utf-8"));
}

/** Parse exam id like "2009h21a" / "2019r01a" / "2021r03" / "2011h23tokubetsu". */
function parseExamId(examId) {
  const m = examId.match(/^(\d{4})(h|r)(\d+)([a-z]*)$/);
  if (!m) fail(`unparseable exam_id ${JSON.stringify(examId)}`);
  const [, gregorian, eraLetter, eraNumStr, suffix] = m;
  const era = eraLetter === "h" ? "平成" : "令和";
  const eraNum = Number(eraNumStr);
  const wayear = eraNum === 1 ? "元" : String(eraNum);
  const wareki = `${era}${wayear}年度`;
  // Fail loud on an unrecognized season suffix rather than silently labelling it
  // 通年 — keeps the deterministic 出典 contract honest (Rule D LOW, Session 86).
  // "" (no suffix, CBT 通年 since 2021) is the one valid non-keyed case.
  if (suffix !== "" && !(suffix in SEASON)) {
    fail(`unknown season suffix ${JSON.stringify(suffix)} in exam_id ${examId}`);
  }
  const season = SEASON[suffix] ?? "";
  return { gregorian: Number(gregorian), era, eraNum, wareki, suffix, season };
}

function sourceLabel(parsed, questionNumber) {
  const seg = parsed.season ? `${parsed.wareki} ${parsed.season}` : parsed.wareki;
  return `${seg} ITパスポート試験 問${questionNumber}`;
}

function examLabel(parsed) {
  return parsed.season ? `${parsed.wareki} ${parsed.season}` : parsed.wareki;
}

// ---- load --------------------------------------------------------------------

const bank = readJson(BANK);
const questionsRaw = bank.questions;
if (!Array.isArray(questionsRaw)) fail("question_bank.json has no questions[]");

const unitIndex = readJson(UNIT_INDEX);
const topicById = new Map();
for (const t of unitIndex.topics) {
  topicById.set(t.topic_id, {
    topic_id: t.topic_id,
    category: t.category,
    major_jp: t.major,
    major_zh: t.major_zh ?? t.major,
    major_en: t.major_en ?? t.major,
    medium_jp: t.medium,
    medium_zh: t.medium_zh ?? t.medium,
    medium_en: t.medium_en ?? t.medium,
    name_jp: t.name_jp,
    question_count: 0,
  });
}

// ---- project -----------------------------------------------------------------

const projected = [];
const examAgg = new Map(); // exam_id → { parsed, count }
const figureIds = [];
let withFigure = 0;

for (const q of questionsRaw) {
  const topicId = q.syllabus_refs?.primary_topic;
  const topic = topicById.get(topicId);
  if (!topic) fail(`question ${q.id} primary_topic ${topicId} not in unit_index`);

  const examId = q.id.replace(/-q\d+$/, "");
  const parsed = parseExamId(examId);

  // choices: keep object, but assert all 4 canonical letters present + answer valid.
  const choices = q.choices_jp ?? {};
  for (const L of CHOICE_LETTERS) {
    if (typeof choices[L] !== "string" || choices[L].trim() === "") {
      fail(`question ${q.id} missing choice ${L}`);
    }
  }
  if (!CHOICE_LETTERS.includes(q.correct_answer)) {
    fail(`question ${q.id} invalid correct_answer ${JSON.stringify(q.correct_answer)}`);
  }
  const cleanChoices = {};
  for (const L of CHOICE_LETTERS) cleanChoices[L] = choices[L];

  const hasFigure = Boolean(q.has_figure && q.figure_path);
  let figure = null;
  if (hasFigure) {
    // figure_path is like "figures/<id>.png"; the figure file is named by id.
    figure = q.id;
    figureIds.push(q.id);
    withFigure += 1;
  }

  const stem = typeof q.stem_jp === "string" ? q.stem_jp : "";
  if (stem.trim() === "") fail(`question ${q.id} empty stem_jp`);

  const label = sourceLabel(parsed, q.question_number);
  if (!label || label.includes("undefined") || label.includes("NaN")) {
    fail(`question ${q.id} bad source_label ${JSON.stringify(label)}`);
  }

  projected.push({
    id: q.id,
    exam_id: examId,
    topic_id: topicId,
    category: topic.category,
    source_label: label,
    stem_jp: stem,
    choices_jp: cleanChoices,
    correct_answer: q.correct_answer,
    has_figure: hasFigure,
    figure, // figure image basename (=id) or null; PNG served from /quiz-figures
    figure_type: hasFigure ? (q.figure_type ?? null) : null,
    terms: Array.isArray(q.syllabus_refs?.terms) ? q.syllabus_refs.terms : [],
  });

  topic.question_count += 1;
  const agg = examAgg.get(examId) ?? { parsed, count: 0 };
  agg.count += 1;
  examAgg.set(examId, agg);
}

// ---- index (topics + exams, ordered) ----------------------------------------

const topics = [...topicById.values()].sort((a, b) => {
  const ca = CATEGORY_ORDER.indexOf(a.category);
  const cb = CATEGORY_ORDER.indexOf(b.category);
  if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb);
  return a.topic_id.localeCompare(b.topic_id);
});

const exams = [...examAgg.entries()]
  .map(([exam_id, { parsed, count }]) => ({
    exam_id,
    gregorian: parsed.gregorian,
    wareki: parsed.wareki,
    season: parsed.season,
    label_jp: examLabel(parsed),
    question_count: count,
  }))
  .sort((a, b) => {
    if (a.gregorian !== b.gregorian) return a.gregorian - b.gregorian;
    const sa = SEASON_ORDER[a.exam_id.match(/^\d{4}(?:h|r)\d+([a-z]*)$/)[1]] ?? 9;
    const sb = SEASON_ORDER[b.exam_id.match(/^\d{4}(?:h|r)\d+([a-z]*)$/)[1]] ?? 9;
    return sa - sb;
  });

// ---- invariants --------------------------------------------------------------

const TOTAL = questionsRaw.length;
if (projected.length !== TOTAL) fail(`projected ${projected.length} ≠ source ${TOTAL}`);
const topicSum = topics.reduce((s, t) => s + t.question_count, 0);
if (topicSum !== TOTAL) fail(`topic counts sum ${topicSum} ≠ ${TOTAL}`);
const examSum = exams.reduce((s, e) => s + e.question_count, 0);
if (examSum !== TOTAL) fail(`exam counts sum ${examSum} ≠ ${TOTAL}`);
const figFilesMissing = figureIds.filter(
  (id) => !existsSync(path.join(FIG_SRC_DIR, `${id}.png`)),
);
if (figFilesMissing.length) {
  fail(`${figFilesMissing.length} figure PNGs missing in source, e.g. ${figFilesMissing[0]}`);
}
// Guard the has_figure/figure_path pairing so a figure is never silently dropped
// (has_figure:true without figure_path would otherwise project to has_figure:false
// with no warning — Rule D LOW, Session 86).
const droppedFigures = questionsRaw.filter((q) => q.has_figure && !q.figure_path);
if (droppedFigures.length) {
  fail(
    `${droppedFigures.length} questions have has_figure but no figure_path ` +
      `(figure would be silently dropped), e.g. ${droppedFigures[0].id}`,
  );
}

// ---- write -------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });

const quizIndex = {
  schema_version: "quiz-v1",
  generated_from: `question_bank.json (${TOTAL} questions, ${exams.length} exams)`,
  attribution:
    "本問題は IPA 公開の過去問題を基にしています。著作権は IPA に帰属します。" +
    "OCR 抽出・整形・シラバス分類を行っており、原文から改変されています（翻訳は後日追加）。",
  stats: {
    questions: TOTAL,
    topics: topics.length,
    exams: exams.length,
    with_figure: withFigure,
  },
  topics,
  exams,
};

writeFileSync(path.join(OUT_DIR, "quiz_index.json"), JSON.stringify(quizIndex, null, 2) + "\n");
writeFileSync(
  path.join(OUT_DIR, "questions.json"),
  JSON.stringify({ schema_version: "quiz-v1", questions: projected }, null, 2) + "\n",
);
// (No _figure_ids.json intermediate: build-quiz-figures.mjs derives the figure
// list from questions.json, so nothing extra lands in the served quiz dir —
// keeps the route's nft trace to exactly the 2 runtime JSONs. Rule D, Session 86.)

console.log("✓ build-quiz-corpus");
console.log(`  questions : ${projected.length}`);
console.log(`  topics    : ${topics.length} (sum ${topicSum})`);
console.log(`  exams     : ${exams.length} (${exams[0].exam_id} … ${exams[exams.length - 1].exam_id})`);
console.log(`  with_fig  : ${withFigure}`);
console.log(`  out       : ${path.relative(ROOT, OUT_DIR)}/{quiz_index,questions}.json`);
console.log(`  sample 出典: ${projected[0].source_label}  |  ${projected.find((p) => p.exam_id === "2019r01a")?.source_label ?? "—"}`);
