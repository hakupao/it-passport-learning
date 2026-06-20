#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 (Session 97, D-137) — explanation merge (deterministic).
//
// Assembles the committed per-exam explanation sidecar
//   data/ip/quiz/explanations/<exam>.json
// from the workflow's per-question outputs
//   data/ip/quiz/.phase2/expl_jp_<id>.json  ({id, key_guard, correct_jp, distractors_jp:[{letter,why_wrong_jp}×3], points_jp:[..]})
//   data/ip/quiz/.phase2/expl_tr_<id>.json  ({id, correct:{zh,en}, distractors:[{letter,zh,en}×3], points:[{zh,en}]})
//
// Zips JP + zh/en into one trilingual entry keyed by letter, validates structure
// (3 distractors = the non-correct letters, equal points length, non-empty), and
// emits the suspect list (key_guard.matches_key=false OR figure_derivable=false) for
// human adjudication (D-137-C). Missing questions reported, not silently dropped.
//
// Run:  node scripts/quiz-phase2-merge.mjs <exam_id>   (default 2025r07)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const PHASE2_DIR = path.join(ROOT, "data/ip/quiz/.phase2");
const OUT_DIR = path.join(ROOT, "data/ip/quiz/explanations");
const LETTERS = ["ア", "イ", "ウ", "エ"];

function fail(msg) {
  console.error(`✗ quiz-phase2-merge: ${msg}`);
  process.exit(1);
}
function nonEmpty(s) {
  return typeof s === "string" && s.trim() !== "";
}

const examId = process.argv[2] ?? "2025r07";

const examQuestions = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions.filter((q) => q.exam_id === examId);
if (!examQuestions.length) fail(`no questions for exam ${examId}`);

// Authoritative key_guard source = the generate workflow's StructuredOutput result
// (schema-validated). The free-form expl_jp file Write occasionally omits key_guard
// (21/100 in the 2025r07 pilot), so the file is NOT a reliable suspect source — the
// persisted result is REQUIRED (no silent fallback to a lossy source). Persist the
// generate workflow's return to this path before merging.
const resultFile = path.join(PHASE2_DIR, `generate_result_${examId}.json`);
if (!existsSync(resultFile)) {
  fail(`missing ${path.relative(ROOT, resultFile)} — persist the generate workflow result there first (authoritative key_guard)`);
}
const kgById = new Map();
for (const r of JSON.parse(readFileSync(resultFile, "utf-8")).results ?? []) {
  if (r?.id && r.key_guard) kgById.set(r.id, r.key_guard);
}
console.log(`  key_guard source: generate_result (${kgById.size} entries)`);

const merged = {};
const missing = [];
const errors = [];
const suspects = [];

for (const q of examQuestions) {
  const jpFile = path.join(PHASE2_DIR, `expl_jp_${q.id}.json`);
  const trFile = path.join(PHASE2_DIR, `expl_tr_${q.id}.json`);
  if (!existsSync(jpFile) || !existsSync(trFile)) {
    missing.push(q.id);
    continue;
  }
  let jp, tr;
  try {
    jp = JSON.parse(readFileSync(jpFile, "utf-8"));
    tr = JSON.parse(readFileSync(trFile, "utf-8"));
  } catch (e) {
    errors.push(`${q.id}: unparseable expl file (${e.message})`);
    continue;
  }
  if (jp.id !== q.id) errors.push(`${q.id}: expl_jp.id mismatch '${jp.id}'`);
  if (tr.id !== q.id) errors.push(`${q.id}: expl_tr.id mismatch '${tr.id}'`);

  const expectDistractors = LETTERS.filter((L) => L !== q.correct_answer); // 3 non-correct
  // correct
  if (!nonEmpty(jp.correct_jp) || !nonEmpty(tr.correct?.zh) || !nonEmpty(tr.correct?.en)) {
    errors.push(`${q.id}: empty correct jp/zh/en`);
  }
  // distractors → keyed object
  const distractors = {};
  const jpD = new Map((jp.distractors_jp ?? []).map((d) => [d.letter, d.why_wrong_jp]));
  const trD = new Map((tr.distractors ?? []).map((d) => [d.letter, d]));
  for (const L of expectDistractors) {
    if (!jpD.has(L)) { errors.push(`${q.id}: distractor ${L} missing in jp`); continue; }
    if (!trD.has(L)) { errors.push(`${q.id}: distractor ${L} missing in tr`); continue; }
    const jpw = jpD.get(L), trw = trD.get(L);
    if (!nonEmpty(jpw) || !nonEmpty(trw.zh) || !nonEmpty(trw.en)) errors.push(`${q.id}: distractor ${L} empty`);
    distractors[L] = { jp: jpw, zh: trw.zh, en: trw.en };
  }
  if (jpD.has(q.correct_answer)) errors.push(`${q.id}: distractors_jp includes the correct letter ${q.correct_answer}`);
  // points (index-aligned, equal length)
  const jpP = jp.points_jp ?? [];
  const trP = tr.points ?? [];
  if (jpP.length !== trP.length || jpP.length < 1) {
    errors.push(`${q.id}: points length mismatch jp=${jpP.length} tr=${trP.length}`);
  }
  const points = jpP.map((p, i) => ({ jp: p, zh: trP[i]?.zh ?? "", en: trP[i]?.en ?? "" }));
  if (points.some((p) => !nonEmpty(p.jp) || !nonEmpty(p.zh) || !nonEmpty(p.en))) errors.push(`${q.id}: empty point`);

  // key_guard (authoritative = workflow result, not the lossy file)
  const kg = kgById.get(q.id);
  if (!kg) { errors.push(`${q.id}: no key_guard in generate_result`); continue; }
  const suspect = kg.matches_key === false || kg.figure_derivable === false;
  if (suspect) suspects.push({ id: q.id, has_figure: q.has_figure, correct_answer: q.correct_answer, key_guard: kg });

  merged[q.id] = {
    key_guard: {
      figure_derivable: kg.figure_derivable ?? null,
      derived_answer: kg.derived_answer ?? null,
      matches_key: kg.matches_key ?? null,
      suspect,
      note_jp: kg.note_jp ?? "",
    },
    correct: { jp: jp.correct_jp, zh: tr.correct?.zh ?? "", en: tr.correct?.en ?? "" },
    distractors,
    points,
  };
}

if (errors.length) {
  fail(`validation errors:\n  ${errors.join("\n  ")}`);
}

mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `${examId}.json`);
const sidecar = {
  schema_version: "quiz-expl-v1",
  exam_id: examId,
  source_note:
    "解説 (正解理由+各誤答肢の誤り+要点) を JP 先生成→zh/en 翻訳 (Claude opus, D-137)。key_guard=図から正解を独立導出した自己検査 (suspect=keyed answer と不一致/導出不可、要人手裁決)。出典は IPA 過去問 (改変=解説生成)。",
  count: Object.keys(merged).length,
  suspect_count: suspects.length,
  questions: merged,
};
writeFileSync(outFile, JSON.stringify(sidecar, null, 2) + "\n");

// suspect report (gitignored intermediate, for adjudication)
const suspectFile = path.join(PHASE2_DIR, `suspects_${examId}.json`);
writeFileSync(suspectFile, JSON.stringify({ exam_id: examId, count: suspects.length, suspects }, null, 2) + "\n");

console.log(`✓ quiz-phase2-merge ${examId}`);
console.log(`  exam questions : ${examQuestions.length}`);
console.log(`  explained      : ${Object.keys(merged).length}`);
console.log(`  missing        : ${missing.length}${missing.length ? " → " + missing.slice(0, 8).join(", ") + (missing.length > 8 ? " …" : "") : ""}`);
console.log(`  SUSPECT (key-guard): ${suspects.length}${suspects.length ? " → " + suspects.map((s) => s.id.replace(examId + "-", "")).join(", ") : ""}`);
console.log(`  out            : ${path.relative(ROOT, outFile)}`);
if (suspects.length) console.log(`  suspects report: ${path.relative(ROOT, suspectFile)}`);
