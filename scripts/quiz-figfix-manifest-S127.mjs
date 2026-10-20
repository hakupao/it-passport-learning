#!/usr/bin/env node
// Stage 6 / D-150 §2 C track C2 (Session 127) — figfix / figreverify の batch 入力 manifest。
//
// --stage fix      : C1 sweep (evidence/.../fig_sweep_S127.json) の matches_question=false を exam 昇順で 3 batch に分け、
//                    batch N の figfix 入力 (quiz-figfix.workflow.mjs 用、prior_finding 付き) を書く。
//                    shared group は 1 member でも陽性なら全 member を同じ batch に入れる (group として 1 件扱い)。
//                    batch の切れ目は exam 境界のうち k×総数/3 に最も近いもの。
// --stage reverify : batch N の figfix 結果 (--figfix-results、既定 figfix_results_S127_b<N>.json) のうち recrop / copy_from の
//                    項目について、apply 後の figure_png + 全頁 + stem + 前回 critic の figure_desc/bbox を
//                    quiz-figreverify.workflow.mjs 用に書く。apply 後に実行すること。
//
// Run from repo root:
//   node scripts/quiz-figfix-manifest-S127.mjs --stage fix --batch 1
//   node scripts/quiz-figfix-manifest-S127.mjs --stage reverify --batch 1 [--figfix-results <path>]
// Out: data/ip/quiz/.keyaudit/{figfix,figreverify}_{input,items}_S127_b<N>.json

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KA = path.join(ROOT, "data/ip/quiz/.keyaudit");
const BATCHES = 3;

const argVal = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const stage = argVal("--stage");
const batch = Number(argVal("--batch"));
if (!["fix", "reverify"].includes(stage) || !(batch >= 1 && batch <= BATCHES)) {
  console.error(`✗ usage: --stage fix|reverify --batch 1..${BATCHES} [--figfix-results <path>]`);
  process.exit(1);
}

const sweep = JSON.parse(readFileSync(path.join(ROOT, "evidence/phase5/stage_06_quiz_keyaudit/fig_sweep_S127.json"), "utf-8")).results;
const sweepById = new Map(sweep.map((r) => [r.id, r]));
const input = new Map(JSON.parse(readFileSync(path.join(KA, "figsweep_input_S127.json"), "utf-8")).questions.map((q) => [q.id, q]));
const examOf = (id) => id.replace(/-q\d+.*$/, "");

// 陽性 + 陽性 member を含む shared group の全 member
const ids = new Set(sweep.filter((r) => !r.matches_question).map((r) => r.id));
for (const id of [...ids]) for (const s of input.get(id)?.shared_with ?? []) if (input.has(s.id)) ids.add(s.id);
const sorted = [...ids].sort();

// exam 境界で 3 分割
const exams = [...new Set(sorted.map(examOf))];
const cum = []; let n = 0;
for (const e of exams) { n += sorted.filter((id) => examOf(id) === e).length; cum.push(n); }
const cuts = [];
for (let k = 1; k < BATCHES; k++) {
  const target = (k * sorted.length) / BATCHES;
  const cands = cum.map((c, i) => i).filter((i) => !cuts.includes(i) && (cuts.length ? i > cuts.at(-1) : true));
  cuts.push(cands.reduce((best, i) => (Math.abs(cum[i] - target) < Math.abs(cum[best] - target) ? i : best)));
}
const bounds = [-1, ...cuts, exams.length - 1];
const batchExams = exams.slice(bounds[batch - 1] + 1, bounds[batch] + 1);
const batchIds = sorted.filter((id) => batchExams.includes(examOf(id)));

const groupNote = (q) => q.figure_kind === "shared"
  ? `中問の共有図。member ${[q.id, ...q.shared_with.map((s) => s.id)].join(" / ")} は同じ図を各自の figure_png として持つ。group として 1 件扱い: 全 member の設問が必要とする範囲を含む同一の領域で判定し、recrop なら全 member に同じ bbox を出すこと。`
  : undefined;

let questions;
if (stage === "fix") {
  questions = batchIds.map((id) => {
    const q = input.get(id), s = sweepById.get(id);
    return {
      id,
      question_number: q.question_number,
      figure_kind: q.figure_kind,
      ...(q.shared_with ? { shared_with: q.shared_with, group_note: groupNote(q) } : {}),
      stem_jp: q.stem_jp,
      choices_jp: q.choices_jp,
      figure_png: q.figure_png,
      figure_page_png: q.figure_page_png,
      prior_finding: {
        matches_question: s.matches_question,
        issue: s.issue,
        crop_depicts: s.crop_depicts,
        correct_region_desc: s.correct_region_desc ?? "",
        notes_jp: s.notes_jp,
        confidence: s.confidence,
      },
    };
  });
} else {
  const fxPath = path.resolve(ROOT, argVal("--figfix-results") ?? path.join(KA, `figfix_results_S127_b${batch}.json`));
  if (!existsSync(fxPath)) { console.error(`✗ figfix results not found: ${path.relative(ROOT, fxPath)}`); process.exit(1); }
  const raw = JSON.parse(readFileSync(fxPath, "utf-8"));
  const fx = Array.isArray(raw) ? raw : raw.results;
  questions = fx.filter((r) => r.fix_type === "recrop" || r.copy_from).map((r) => {
    const q = input.get(r.id);
    if (!q) throw new Error(`${r.id} not in figsweep_input_S127.json`);
    return {
      id: r.id,
      question_number: q.question_number,
      figure_kind: q.figure_kind,
      ...(q.shared_with ? { shared_with: q.shared_with, group_note: groupNote(q) } : {}),
      stem_jp: q.stem_jp,
      choices_jp: q.choices_jp,
      figure_png: q.figure_png, // apply 後の再裁断図 (data/ip/exams/figures/<id>.png)
      figure_page_png: q.figure_page_png,
      prior_critic: { fix_type: r.fix_type, copy_from: r.copy_from, figure_desc: r.figure_desc ?? "", correct_bbox_pct: r.correct_bbox_pct, notes_jp: r.notes_jp },
    };
  });
}

const name = stage === "fix" ? "figfix" : "figreverify";
const inPath = path.join(KA, `${name}_input_S127_b${batch}.json`);
writeFileSync(inPath, JSON.stringify({ batch: `${name}_S127_b${batch}`, stage, exams: batchExams, count: questions.length, questions }, null, 2) + "\n");
writeFileSync(path.join(KA, `${name}_items_S127_b${batch}.json`), JSON.stringify(questions.map((q) => ({ id: q.id })), null, 2) + "\n");
console.log(`✓ ${name} b${batch}: ${questions.length} items, exams ${batchExams[0]} … ${batchExams.at(-1)} (${batchExams.length})`);
console.log(`  out: ${path.relative(ROOT, inPath)}`);
