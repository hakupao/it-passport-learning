#!/usr/bin/env node
// Stage 6 / Quiz — apply the quiz-fidfix-repair workflow output DETERMINISTICALLY (S109).
//
// The repair agents return {translation_updates, explanation_updates} as structured field
// replacements; this script does the writing. Same principle as quiz-phase2-persist.mjs
// (S105): no LLM in the write path, every target field asserted to exist before replacement.
//
// Field grammar
//   translations/<exam>.json : "stem.zh" | "stem.en" | "choices.<letter>.zh|en"
//   explanations (.phase2)   : "correct.jp|zh|en"
//                              "distractors.<letter>.jp|zh|en"
//                              "points.<index>.jp|zh|en"
//
// Run: node scripts/quiz-fidfix-repair-apply.mjs <task_output_file> <exam_id>
//      (then: node scripts/quiz-phase2-merge.mjs <exam_id>)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P2 = (f) => path.join(ROOT, "data/ip/quiz/.phase2", f);

const [taskOut, examId] = process.argv.slice(2);
if (!taskOut || !examId) {
  console.error("✗ usage: node scripts/quiz-fidfix-repair-apply.mjs <task_output_file> <exam_id>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(taskOut, "utf-8"));
const payload = raw.result ?? raw;
if (!payload || !Array.isArray(payload.results)) throw new Error("task output has no results[] — aborting");

const TR = path.join(ROOT, `data/ip/quiz/translations/${examId}.json`);
const trDoc = JSON.parse(readFileSync(TR, "utf-8"));
let trDirty = false;
const explDocs = new Map();
const loadExpl = (file) => {
  if (!explDocs.has(file)) {
    if (!existsSync(P2(file))) throw new Error(`missing ${file}`);
    explDocs.set(file, JSON.parse(readFileSync(P2(file), "utf-8")));
  }
  return explDocs.get(file);
};

function trTarget(entry, field) {
  if (field === "stem.zh") return [entry.stem, "zh"];
  if (field === "stem.en") return [entry.stem, "en"];
  const m = field.match(/^choices\.(.+)\.(zh|en)$/);
  if (m) return [entry.choices?.[m[1]], m[2]];
  throw new Error(`unknown translation field "${field}"`);
}

// key_guard.note_jp is special: quiz-phase2-merge reads key_guard from generate_result, NOT
// from expl_jp, so a note rewritten only in expl_jp would never reach the shipped sidecar.
// Write it to generate_result (final + round1) and mirror it into expl_jp when present.
function applyKeyGuardNote(id, text) {
  let hit = false;
  const gr = loadGenerateResult();
  const rec = gr.results.find((r) => r.id === id);
  if (!rec?.key_guard) throw new Error(`${id}: key_guard missing in generate_result`);
  for (const kg of [rec.key_guard, rec.key_guard_round1]) {
    if (kg && kg.note_jp !== text) { kg.note_jp = text; hit = true; }
  }
  if (hit) grDirty = true;
  const file = `expl_jp_${id}.json`;
  if (existsSync(P2(file))) {
    const doc = loadExpl(file);
    if (doc.key_guard && doc.key_guard.note_jp !== text) {
      doc.key_guard.note_jp = text;
      touchedExpl.add(file);
      hit = true;
    }
  }
  return hit;
}

function explTarget(id, field) {
  const lang = field.split(".").pop();
  if (!["jp", "zh", "en"].includes(lang)) throw new Error(`unknown explanation field "${field}"`);
  const jp = lang === "jp";
  const doc = loadExpl(jp ? `expl_jp_${id}.json` : `expl_tr_${id}.json`);
  if (field.startsWith("correct.")) return jp ? [doc, "correct_jp"] : [doc.correct, lang];
  let m = field.match(/^distractors\.(.+)\.(jp|zh|en)$/);
  if (m) {
    const L = m[1];
    return jp
      ? [doc.distractors_jp?.find((d) => d.letter === L), "why_wrong_jp"]
      : [doc.distractors?.find((d) => d.letter === L), lang];
  }
  m = field.match(/^points\.(\d+)\.(jp|zh|en)$/);
  if (m) {
    const i = Number(m[1]);
    if (jp) {
      if (!Array.isArray(doc.points_jp) || typeof doc.points_jp[i] !== "string") throw new Error(`${id}: points_jp[${i}] missing`);
      return [doc.points_jp, String(i)];
    }
    return [doc.points?.[i], lang];
  }
  throw new Error(`unknown explanation field "${field}"`);
}

let trCount = 0, exCount = 0, skipped = 0;
const touchedExpl = new Set();
let grDoc = null;
let grDirty = false;
const GR = P2(`generate_result_${examId}.json`);
const loadGenerateResult = () => {
  if (!grDoc) {
    if (!existsSync(GR)) throw new Error(`missing generate_result_${examId}.json`);
    grDoc = JSON.parse(readFileSync(GR, "utf-8"));
  }
  return grDoc;
};

for (const r of payload.results) {
  if (!r?.id) continue;
  const entry = trDoc.questions?.[r.id];

  for (const u of r.translation_updates ?? []) {
    if (!entry) throw new Error(`${r.id}: not in translations/${examId}.json`);
    const [obj, key] = trTarget(entry, u.field);
    if (!obj || typeof obj[key] !== "string") throw new Error(`${r.id} ${u.field}: target missing`);
    if (!u.new_text?.trim()) throw new Error(`${r.id} ${u.field}: empty new_text`);
    if (obj[key] === u.new_text) { skipped++; continue; }
    obj[key] = u.new_text;
    trDirty = true; trCount++;
    console.log(`  ✓ tr   ${r.id} ${u.field}`);
  }

  for (const u of r.explanation_updates ?? []) {
    if (!u.new_text?.trim()) throw new Error(`${r.id} ${u.field}: empty new_text`);
    if (u.field === "key_guard.note_jp") {
      if (applyKeyGuardNote(r.id, u.new_text)) { exCount++; console.log(`  ✓ expl ${r.id} key_guard.note_jp (generate_result + expl_jp)`); }
      else skipped++;
      continue;
    }
    const [obj, key] = explTarget(r.id, u.field);
    if (!obj || typeof obj[key] !== "string") throw new Error(`${r.id} ${u.field}: target missing`);
    if (!u.new_text?.trim()) throw new Error(`${r.id} ${u.field}: empty new_text`);
    if (obj[key] === u.new_text) { skipped++; continue; }
    obj[key] = u.new_text;
    exCount++;
    touchedExpl.add(u.field.endsWith(".jp") ? `expl_jp_${r.id}.json` : `expl_tr_${r.id}.json`);
    console.log(`  ✓ expl ${r.id} ${u.field}`);
  }
}

if (trDirty) writeFileSync(TR, JSON.stringify(trDoc, null, 2) + "\n");
if (grDirty) writeFileSync(GR, JSON.stringify(grDoc, null, 2) + "\n");
for (const file of touchedExpl) writeFileSync(P2(file), JSON.stringify(explDocs.get(file), null, 2) + "\n");

console.log(`✓ quiz-fidfix-repair-apply ${examId}: translations ${trCount} / explanations ${exCount} (already-current ${skipped})`);
console.log(`  next: node scripts/quiz-phase2-merge.mjs ${examId}`);
