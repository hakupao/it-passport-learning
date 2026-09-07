#!/usr/bin/env node
// Stage 6 / Quiz — S117: 任意の問番号集合に対する保真核験 input を作る (quiz-s7x-fidelity.workflow.mjs 互換)。
// s7x prep は `*_resourced_s7x` の問に固定されているため、note 起点掃引 (S114〜S116 常設順序 ④) の掛け直しや
// ① pilot の B 側 (S117 log §5) で「s7x と無関係な問番号」を渡すのに使う。是正後テキストで作り直せるよう毎回生成する。
//
// Run:  node scripts/quiz-fidelity-prep-any.mjs <exam_id> <label> <qnums: 1,2,3 | s7x | all>
//   → data/ip/quiz/.phase2/<label>_fidelity_input_<exam_id>.json

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [examId, label, spec] = process.argv.slice(2);
if (!examId || !label || !spec) { console.error("✗ usage: quiz-fidelity-prep-any.mjs <exam_id> <label> <qnums|s7x|all>"); process.exit(1); }

const bank = JSON.parse(readFileSync(path.join(ROOT, "data/ip/exams/question_bank.json"), "utf-8"));
const all = (bank.questions ?? bank).filter((q) => q.id.startsWith(`${examId}-`)).sort((a, b) => a.question_number - b.question_number);
if (!all.length) { console.error(`✗ no questions for ${examId}`); process.exit(1); }
const trFile = path.join(ROOT, "data/ip/quiz/translations", `${examId}.json`);
const tr = existsSync(trFile) ? JSON.parse(readFileSync(trFile, "utf-8")).questions : {};

let targets;
if (spec === "all") targets = all;
else if (spec === "s7x") targets = all.filter((q) => q.stem_resourced_s7x === true || q.choices_resourced_s7x === true);
else { const want = new Set(spec.split(",").map((n) => parseInt(n, 10))); targets = all.filter((q) => want.has(q.question_number)); if (targets.length !== want.size) console.warn(`  ⚠ ${want.size - targets.length} qnums not found`); }

const samples = targets.map((q) => {
  const pageRel = q.source?.page_image;
  const pagePng = pageRel ? path.join(ROOT, "data/ip/exams", pageRel) : null;
  if (!pagePng || !existsSync(pagePng)) throw new Error(`${q.id}: source page image missing (${pageRel})`);
  return {
    id: q.id, question_number: q.question_number, source_page_png: pagePng,
    resourced: { stem: q.stem_resourced_s7x === true, choices: q.choices_resourced_s7x === true },
    displayed_stem_jp: tr[q.id]?.stem_jp_clean?.trim() || q.stem_jp,
    displayed_choices_jp: q.choices_jp, correct_answer: q.correct_answer,
  };
});
const out = path.join(ROOT, "data/ip/quiz/.phase2", `${label}_fidelity_input_${examId}.json`);
writeFileSync(out, JSON.stringify({ exam_id: examId, label, count: samples.length, samples }, null, 2) + "\n");
console.log(`✓ quiz-fidelity-prep-any ${examId} [${label}] ${samples.length}/${all.length} → ${path.relative(ROOT, out)}`);
console.log(`  qnums: ${samples.map((s) => s.question_number).join(",")}`);
