#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 99) — merge re-translated zh/en choices into translation sidecars.
// Reads .keyaudit/choicestr_results.json (per id, per changed letter {zh,en}) and updates
// data/ip/quiz/translations/<exam>.json questions[id].choices[letter] = {zh,en}.
// Only the changed letters are touched (stem + other choices untouched).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRDIR = path.join(ROOT, "data/ip/quiz/translations");
const res = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/.keyaudit/choicestr_results.json"), "utf-8")).results;
const byExam = {};
for (const r of res) { const exam = r.id.replace(/-q\d+$/, ""); (byExam[exam] ??= []).push(r); }
let touched = 0, files = 0;
for (const exam of Object.keys(byExam)) {
  const f = path.join(TRDIR, `${exam}.json`);
  const tr = JSON.parse(readFileSync(f, "utf-8"));
  for (const r of byExam[exam]) {
    const tq = tr.questions[r.id];
    if (!tq) { console.error(`✗ ${r.id} not in ${exam}.json`); process.exit(1); }
    tq.choices ??= {};
    for (const pl of (r.per_letter || [])) {
      tq.choices[pl.letter] = { zh: pl.zh, en: pl.en };
      touched++;
    }
  }
  writeFileSync(f, JSON.stringify(tr, null, 2) + "\n");
  files++;
}
console.log(`✓ choicestr merge: ${touched} letter translations across ${res.length} questions / ${files} sidecar files updated`);
