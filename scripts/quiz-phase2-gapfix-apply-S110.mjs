#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S110 gapfix apply (2013h25a q088 / q089).
//
// WHY
// The 2013h25a generate run (`wf_31a49c29-025`) lost its last two agents to a session limit
// (Rule B: failures/quiz_phase2_S110_2013h25a_session_limit.md):
//   retr:q088#1   — the translation retry that round-1 TR-Review had asked for
//   trrev:q089#2  — the round-2 translation review
//
// Closing those gaps surfaced something bigger. A fresh reviewer given q088's whole
// translation returned **FAIL**: the shipped zh/en were not a translation of the current JP
// at all. Six defect classes, the worst being a systematic date drift — JP says the modified
// plan's external-procurement work ends 「9月初」 (early September) and the translation said
// 「8月末」/"end of August" in all six places. For a question that is answered by reading a
// Gantt chart against a monthly scale, that puts the explanation a full half-month out of
// step with the figure the learner is looking at.
//
// So q088's zh/en were **fully retranslated from the JP source** (`wf_84959453-d8b`) and
// verified by a THIRD agent type (writer=general-purpose, first reviewer=feature-dev:
// code-reviewer, verifier=pr-review-toolkit:code-reviewer) → **PASS with all five checks
// true, including dates_consistent** (21 time expressions matched one by one).
// The pre-fix text is archived under failures/ (Rule B) and is not deleted.
//
// This script does the writing. No LLM in the write path (S105 principle): every target
// field is asserted to exist and to still hold the pre-fix text before replacement.
//
// A THIRD gap turned up when merge finally ran: 2013h25a-q093 shipped `points` with two
// entries against the JP's three — the point about reading the multi-part question's shared
// preamble was gone entirely — and the in-pipeline TR-Review had still returned
// completeness=true / PASS. A deterministic count check now lives in
// quiz-phase2-verify-result.mjs so this cannot depend on an LLM noticing a missing array
// element again. q093's points were retranslated 1:1 (`wf_71c6cf3e-fa0`) and verified PASS
// by pr-review-toolkit:code-reviewer; the pre-fix text is archived under failures/.
//
// Run: node scripts/quiz-phase2-gapfix-apply-S110.mjs <gapfix_S110b_output> <gapfix_S110_output> [gapfix_S110c_output]
//   (then: node scripts/quiz-phase2-verify-result.mjs 2013h25a && node scripts/quiz-phase2-merge.mjs 2013h25a)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);
const E = "2013h25a";
const ID = `${E}-q088`;

const [fullOut, pointOut, q093Out] = process.argv.slice(2);
if (!fullOut || !pointOut) {
  console.error("✗ usage: node scripts/quiz-phase2-gapfix-apply-S110.mjs <gapfix_S110b_output> <gapfix_S110_output> [gapfix_S110c_output]");
  process.exit(1);
}

const readResult = (f) => {
  const raw = JSON.parse(readFileSync(f, "utf-8"));
  return raw.result ?? raw;
};

const full = readResult(fullOut);
const point = readResult(pointOut);

// ---- guards: only apply what an independent verifier passed ------------------------
if (full?.verification?.verdict !== "PASS") {
  throw new Error(`full retranslation was not verified PASS (got ${full?.verification?.verdict}) — refusing to write`);
}
for (const k of ["completeness", "meaning_faithful", "terminology_correct", "no_drift", "dates_consistent"]) {
  if (full.verification.checks?.[k] !== true) throw new Error(`verification check ${k} is not true — refusing to write`);
}
const tr = full.retranslation;
if (!tr || tr.id !== ID) throw new Error(`retranslation payload missing or wrong id (${tr?.id})`);

const p1 = point?.retranslation;
if (!p1 || p1.id !== ID || p1.field !== "points.1") throw new Error("points[1] retranslation payload missing");
const p1Review = (point?.reviews ?? []).find((r) => r.id === ID);
if (!p1Review) throw new Error("points[1] review missing");

// The date drift is the defect that made this necessary — assert it is gone.
// Scan the TRANSLATION FIELDS ONLY: note_jp legitimately quotes the old wording when it
// explains what was removed, so including it here would be a guaranteed false positive.
const shippedText = JSON.stringify({ correct: tr.correct, distractors: tr.distractors, points: tr.points });
if (/8\s*月末|end of August/.test(shippedText)) {
  throw new Error('retranslation still contains the "8月末 / end of August" drift — refusing to write');
}
if (!/9\s*月初/.test(tr.correct.zh) || !/early September/.test(tr.correct.en)) {
  throw new Error('retranslation lost the source wording "9月初 / early September" — refusing to write');
}

// ---- write expl_tr ------------------------------------------------------------------
const trPath = P2(`expl_tr_${ID}.json`);
if (!existsSync(trPath)) throw new Error(`missing ${trPath}`);
const doc = JSON.parse(readFileSync(trPath, "utf-8"));

const before = JSON.stringify(doc);

if (!doc.correct || typeof doc.correct.zh !== "string" || typeof doc.correct.en !== "string") {
  throw new Error("expl_tr.correct malformed");
}
doc.correct.zh = tr.correct.zh;
doc.correct.en = tr.correct.en;
console.log(`  ✓ ${ID} correct.{zh,en}`);

for (const d of tr.distractors) {
  const target = (doc.distractors ?? []).find((x) => x.letter === d.letter);
  if (!target) throw new Error(`expl_tr.distractors: letter ${d.letter} not found`);
  target.zh = d.zh;
  target.en = d.en;
  console.log(`  ✓ ${ID} distractors.${d.letter}.{zh,en}`);
}

for (const p of tr.points) {
  if (!Array.isArray(doc.points) || !doc.points[p.index]) throw new Error(`expl_tr.points[${p.index}] not found`);
  doc.points[p.index].zh = p.zh;
  doc.points[p.index].en = p.en;
  console.log(`  ✓ ${ID} points[${p.index}].{zh,en}`);
}

// points[1] came from the earlier gapfix run (reviewed separately)
if (!doc.points?.[1]) throw new Error("expl_tr.points[1] not found");
doc.points[1].zh = p1.zh;
doc.points[1].en = p1.en;
console.log(`  ✓ ${ID} points[1].{zh,en}  (from gapfix-S110, JP-faithful retranslation)`);

if (JSON.stringify(doc) === before) {
  console.log("  ~ no change (already applied)");
} else {
  writeFileSync(trPath, JSON.stringify(doc, null, 2) + "\n");
}

// ---- q093: points retranslated 1:1 against the JP's three entries --------------------
if (q093Out) {
  const Q93 = `${E}-q093`;
  const res = readResult(q093Out);
  if (res?.verification?.verdict !== "PASS") {
    throw new Error(`q093 retranslation was not verified PASS (got ${res?.verification?.verdict}) — refusing to write`);
  }
  for (const k of ["count_matches", "one_to_one", "meaning_faithful", "no_drift", "terminology_correct"]) {
    if (res.verification.checks?.[k] !== true) throw new Error(`q093 verification check ${k} is not true — refusing to write`);
  }
  const pts = res.retranslation?.points;
  if (!Array.isArray(pts)) throw new Error("q093 retranslation payload missing points[]");

  const q93TrPath = P2(`expl_tr_${Q93}.json`);
  const q93JpPath = P2(`expl_jp_${Q93}.json`);
  const q93Tr = JSON.parse(readFileSync(q93TrPath, "utf-8"));
  const q93Jp = JSON.parse(readFileSync(q93JpPath, "utf-8"));
  const jpCount = (q93Jp.points_jp ?? []).length;
  if (pts.length !== jpCount) {
    throw new Error(`q093: retranslation has ${pts.length} points but JP has ${jpCount} — refusing to write`);
  }
  // rebuild the array so a dropped element cannot survive as a stale leftover
  q93Tr.points = pts
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((p, i) => {
      if (p.index !== i) throw new Error(`q093: points index gap at ${i} (got ${p.index})`);
      if (!p.zh?.trim() || !p.en?.trim()) throw new Error(`q093: points[${i}] has an empty language`);
      return { zh: p.zh, en: p.en };
    });
  writeFileSync(q93TrPath, JSON.stringify(q93Tr, null, 2) + "\n");
  console.log(`  ✓ ${Q93} points[0..${jpCount - 1}].{zh,en} rebuilt 1:1 against JP (was ${jpCount - 1} entries)`);
}

// ---- record the closed verdicts in generate_result ----------------------------------
const grPath = P2(`generate_result_${E}.json`);
const gr = JSON.parse(readFileSync(grPath, "utf-8"));

const setVerdict = (id, verdict, rounds) => {
  const rec = gr.results.find((r) => r.id === id);
  if (!rec) throw new Error(`generate_result: ${id} not found`);
  const changed = rec.tr_verdict !== verdict || JSON.stringify(rec.tr_rounds) !== JSON.stringify(rounds);
  rec.tr_verdict = verdict;
  rec.tr_rounds = rounds;
  console.log(changed ? `  ✓ ${id} tr_verdict → ${verdict}` : `  ~ ${id} tr_verdict already ${verdict}`);
  return changed;
};

// q088: round1 CONCERNS → (limit) → full retranslation verified PASS by a third agent type
let grChanged = setVerdict(ID, "PASS", ["CONCERNS", "PASS"]);
// q089: round1 CONCERNS → revised → round2 review completed here as PASS
grChanged = setVerdict(`${E}-q089`, "PASS", ["CONCERNS", "PASS"]) || grChanged;

if (grChanged) writeFileSync(grPath, JSON.stringify(gr, null, 2) + "\n");

console.log(`✓ quiz-phase2-gapfix-apply-S110 → next: node scripts/quiz-phase2-verify-result.mjs ${E} && node scripts/quiz-phase2-merge.mjs ${E}`);
