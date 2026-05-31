#!/usr/bin/env node
/**
 * Stage 2.7b — build per-question audit input files (POST-apply) for the Rule A independent audit.
 *
 * Audit set = ALL confirmed repairs (the rewrites — Rule A applies to these) + a sample of the other
 * dispositions (cleared incl. the reCI-contested 2018h30a-q090, figure_inherent) to validate those calls.
 * Each file carries the APPLIED stem/choices + correct_answer + hi-dpi image paths so the auditor can
 * check (1) faithful transcription and (2) that the preserved answer LETTER still maps to the right option
 * — the key risk when a content_mismatch swap replaces a whole choice set.
 *
 * Output: data/ip/exams/.tmp/s027b/audit_in/<id>.json + _audit_ids.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const OUT = `${EXAMS}/.tmp/s027b`;
const AUDIT_IN = `${OUT}/audit_in`;
mkdirSync(AUDIT_IN, { recursive: true });

const recon = JSON.parse(readFileSync(`${OUT}/_reconcile_b.json`, 'utf8'));
const manifest = JSON.parse(readFileSync(`${OUT}/manifest_blind.json`, 'utf8'));
const imgsById = new Map(manifest.map((m) => [m.id, m.images]));
const Q = new Map(JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8')).questions.map((q) => [q.id, q]));

// deterministic sample (no RNG): every other cleared, every other figure_inherent, capped
const sample = (arr, n) => arr.filter((_, i) => i % Math.max(1, Math.floor(arr.length / n)) === 0).slice(0, n);
const clearedSample = [...new Set(['2018h30a-q090', ...sample(recon.cleared.map((x) => x.id), 6)])]; // force-include the reCI-contested one
const figSample = sample(recon.figure_inherent.map((x) => x.id), 4);

const set = [];
for (const x of recon.confirmed) set.push({ id: x.id, disposition: 'confirmed:' + x.severity });
for (const id of clearedSample) set.push({ id, disposition: 'cleared' });
for (const id of figSample) set.push({ id, disposition: 'figure_inherent' });

const ids = [];
for (const { id, disposition } of set) {
  const q = Q.get(id);
  if (!q) { console.error(`! ${id} not found`); continue; }
  writeFileSync(`${AUDIT_IN}/${id}.json`, JSON.stringify({
    id, qn: q.question_number, page_number: q.source && q.source.page_number,
    disposition,
    applied_stem: q.stem_jp,
    applied_choices: q.choices_jp,
    correct_answer: q.correct_answer,
    images: imgsById.get(id) || [],
  }));
  ids.push(id);
}
writeFileSync(`${OUT}/_audit_ids.json`, JSON.stringify(ids));
console.log(`audit set: ${ids.length} (confirmed ${recon.confirmed.length} + cleared ${clearedSample.length} + figure_inherent ${figSample.length})`);
console.log('ids:', JSON.stringify(ids));
