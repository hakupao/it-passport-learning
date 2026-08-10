#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — apply the S110 translation-fidelity retranslations (2013h25a).
//
// Rule A (`wf_3d4d2800-04f`) audited 28 of this exam's 100 explanations and returned
// translation_faithful=false on four of them (q048 / q052 / q086 / q095). Together with
// q088 — caught separately when the session-limit gap-fill put a fresh reviewer on it — that
// is **5 of 28 sampled**, all the same shape: the zh/en read as competent standalone prose
// but are not a translation of the JP item they sit against. points arrays swapped between
// entries, distractor rationales replaced with different ones, load-bearing evidence dropped.
//
// Every one of these passed the in-pipeline TR-Review. A reviewer reading zh/en that is
// internally coherent has little to push against; only a JP-vs-translation item-by-item
// comparison surfaces it.
//
// Each retranslation here was produced from the JP source by general-purpose and then
// verified item-by-item by pr-review-toolkit:code-reviewer (Rule D: three distinct roles).
// Only entries whose verification returned PASS with all five checks true are written.
// Pre-fix text is archived under failures/ first (Rule B). No LLM in this write path.
//
// Run: node scripts/quiz-phase2-trfix-apply-S110.mjs <trfix_task_output>
//   (then: node scripts/quiz-phase2-verify-result.mjs 2013h25a && node scripts/quiz-phase2-merge.mjs 2013h25a)

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2013h25a";
const ARCHIVE = path.join(ROOT, "failures", `quiz_phase2_S110_${E}_trfix`);

const taskOut = process.argv[2];
if (!taskOut) {
  console.error("✗ usage: node scripts/quiz-phase2-trfix-apply-S110.mjs <trfix_task_output>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(taskOut, "utf-8"));
const payload = raw.result ?? raw;
if (!Array.isArray(payload?.results)) throw new Error("task output has no results[] — aborting");

const CHECKS = ["count_matches", "item_aligned", "meaning_faithful", "no_drift", "terminology_correct"];

mkdirSync(ARCHIVE, { recursive: true });

let applied = 0, skipped = 0;
for (const entry of payload.results) {
  const { id, retranslation: tr, verification: v } = entry ?? {};
  if (!id || !tr || !v) { console.log(`  ! malformed entry, skipped`); skipped++; continue; }

  if (v.verdict !== "PASS" || CHECKS.some((k) => v.checks?.[k] !== true)) {
    const failing = CHECKS.filter((k) => v.checks?.[k] !== true);
    console.log(`  ! ${id}: verdict=${v.verdict}${failing.length ? ` failing=[${failing.join(",")}]` : ""} → NOT written`);
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

// record the closed verdicts
const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));
let grChanged = false;
for (const entry of payload.results) {
  const { id, verification: v } = entry ?? {};
  if (!id || v?.verdict !== "PASS") continue;
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) continue;
  const note = "【S110 訳文再生成】Rule A が translation_faithful=false と判定したため zh/en を JP 源から全面再訳し、別 subagent_type が項目単位で核験して PASS (failures/quiz_phase2_S110_2013h25a_trfix/ に是正前テキストを保管)。";
  if (!(rec.key_guard.note_jp ?? "").includes("【S110 訳文再生成】")) {
    rec.key_guard.note_jp = `${rec.key_guard.note_jp ?? ""}\n${note}`;
    grChanged = true;
  }
}
if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-trfix-apply-S110: applied ${applied}, skipped ${skipped}`);
if (skipped) { console.error("✗ some entries were not verified PASS — re-run those before merging"); process.exit(1); }
console.log(`  next: node scripts/quiz-phase2-verify-result.mjs ${E} && node scripts/quiz-phase2-merge.mjs ${E}`);
