#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — apply trsweep retranslations (S112 常設化, generalized from
// quiz-phase2-trfix-apply-S110.mjs).
//
// The trsweep workflow (quiz-phase2-trsweep.workflow.mjs) audits EVERY question's zh/en
// against the JP explanation item-by-item, retranslates only the unfaithful ones, and has
// a third subagent_type verify each retranslation (Rule D: three distinct roles). This
// script writes only entries that were repaired AND verified PASS with all five checks
// true, into data/ip/quiz/.phase2/expl_tr_<id>.json — BEFORE merge, so the merged sidecar
// is born clean. Pre-fix text is archived under failures/ first (Rule B). No LLM in this
// write path.
//
// Run: node scripts/quiz-phase2-trsweep-apply.mjs <trsweep_task_output> <exam_id> <session_tag>
//   e.g. node scripts/quiz-phase2-trsweep-apply.mjs /path/to/task.output.json 2013h25h S112
//   (then: node scripts/quiz-phase2-verify-result.mjs <exam_id> && node scripts/quiz-phase2-merge.mjs <exam_id>)

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);

const taskOut = process.argv[2];
const E = process.argv[3];
const TAG = process.argv[4];
if (!taskOut || !E || !TAG) {
  console.error("✗ usage: node scripts/quiz-phase2-trsweep-apply.mjs <trsweep_task_output> <exam_id> <session_tag>");
  process.exit(1);
}
const ARCHIVE = path.join(ROOT, "failures", `quiz_phase2_${TAG}_${E}_trsweep`);

const raw = JSON.parse(readFileSync(taskOut, "utf-8"));
const payload = raw.result ?? raw;
if (!Array.isArray(payload?.results)) throw new Error("task output has no results[] — aborting");
if (payload.exam_id && payload.exam_id !== E) throw new Error(`task output exam_id=${payload.exam_id} ≠ ${E} — aborting`);

const CHECKS = ["count_matches", "item_aligned", "meaning_faithful", "no_drift", "terminology_correct"];

let applied = 0, skipped = 0, cleanCount = 0, failedRepairs = [];
for (const entry of payload.results) {
  if (!entry?.id) { console.log("  ! malformed entry, skipped"); skipped++; continue; }
  const { id, audit, retranslation: tr, verification: v, repaired } = entry;

  // faithful (or null audit) → nothing to apply
  if (repaired !== true) { cleanCount++; continue; }

  if (!tr || !v || v.verdict !== "PASS" || CHECKS.some((k) => v.checks?.[k] !== true)) {
    const failing = v ? CHECKS.filter((k) => v.checks?.[k] !== true) : ["no-verification"];
    console.log(`  ! ${id}: verdict=${v?.verdict ?? "null"} failing=[${failing.join(",")}] → NOT written`);
    failedRepairs.push(id);
    skipped++;
    continue;
  }

  const trPath = P2(`expl_tr_${id}.json`);
  const jpPath = P2(`expl_jp_${id}.json`);
  if (!existsSync(trPath) || !existsSync(jpPath)) throw new Error(`${id}: expl file missing`);
  const doc = JSON.parse(readFileSync(trPath, "utf-8"));
  const jp = JSON.parse(readFileSync(jpPath, "utf-8"));

  // structural guards — the very defect class being repaired
  const jpPts = (jp.points_jp ?? []).length;
  if ((tr.points ?? []).length !== jpPts) {
    throw new Error(`${id}: retranslation has ${(tr.points ?? []).length} points but JP has ${jpPts} — refusing to write`);
  }
  const jpLetters = (jp.distractors_jp ?? []).map((d) => d.letter).sort().join("");
  const trLetters = (tr.distractors ?? []).map((d) => d.letter).sort().join("");
  if (jpLetters !== trLetters) {
    throw new Error(`${id}: distractor letters differ jp=[${jpLetters}] tr=[${trLetters}] — refusing to write`);
  }
  for (const p of tr.points) if (!p.zh?.trim() || !p.en?.trim()) throw new Error(`${id}: points[${p.index}] empty language`);
  for (const d of tr.distractors) if (!d.zh?.trim() || !d.en?.trim()) throw new Error(`${id}: distractor ${d.letter} empty language`);
  if (!tr.correct?.zh?.trim() || !tr.correct?.en?.trim()) throw new Error(`${id}: correct empty language`);

  // Rule B: keep the pre-fix text
  mkdirSync(ARCHIVE, { recursive: true });
  const archived = path.join(ARCHIVE, `expl_tr_${id}.BEFORE.json`);
  if (!existsSync(archived)) copyFileSync(trPath, archived);

  doc.correct.zh = tr.correct.zh;
  doc.correct.en = tr.correct.en;
  for (const d of tr.distractors) {
    const target = doc.distractors.find((x) => x.letter === d.letter);
    if (!target) throw new Error(`${id}: distractor ${d.letter} not present in expl_tr`);
    target.zh = d.zh;
    target.en = d.en;
  }
  doc.points = tr.points
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((p, i) => {
      if (p.index !== i) throw new Error(`${id}: points index gap at ${i}`);
      return { zh: p.zh, en: p.en };
    });

  writeFileSync(trPath, JSON.stringify(doc, null, 2) + "\n");
  applied++;
  console.log(`  ✓ ${id}: correct + ${tr.distractors.length} distractor(s) + ${tr.points.length} point(s) rewritten 1:1 from JP`);
}

// record the closed verdicts in generate_result (audit trail; note_jp is internal-only)
const grPath = P2(`generate_result_${E}.json`);
if (applied && existsSync(grPath)) {
  const gr = JSON.parse(readFileSync(grPath, "utf-8"));
  let grChanged = false;
  for (const entry of payload.results) {
    const { id, verification: v, repaired } = entry ?? {};
    if (!id || repaired !== true || v?.verdict !== "PASS") continue;
    const rec = gr.results.find((r) => r.id === id);
    if (!rec) continue;
    const note = `【${TAG} 訳文再生成】trsweep (JP↔訳文の項目単位照合) が保真不成立と判定したため zh/en を JP 源から全面再訳し、別 subagent_type が項目単位で核験して PASS (failures/quiz_phase2_${TAG}_${E}_trsweep/ に是正前テキストを保管)。`;
    if (!(rec.key_guard.note_jp ?? "").includes(`【${TAG} 訳文再生成】`)) {
      rec.key_guard.note_jp = `${rec.key_guard.note_jp ?? ""}\n${note}`;
      grChanged = true;
    }
  }
  if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");
}

console.log(`✓ quiz-phase2-trsweep-apply ${E}: faithful ${cleanCount}, applied ${applied}, skipped ${skipped}`);
if (failedRepairs.length) {
  console.error(`✗ repairs not verified PASS: ${failedRepairs.join(", ")} — re-run those before merging`);
  process.exit(1);
}
