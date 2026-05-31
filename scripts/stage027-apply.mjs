#!/usr/bin/env node
/**
 * Stage 2.7 — apply confirmed stem/choices repairs (D-122/D-123/D-124).
 *
 * Reads .tmp/s027/repair/_reconcile.json (confirmed[]) plus an optional .tmp/s027/repair/_manual.json
 * (main-loop-adjudicated escalations, same shape: {id, fix_stem, fix_choices, authoritative_stem,
 * authoritative_choices, severity}). Applies to question_bank.json + by_year/<exam>.json with backups.
 *
 * INVARIANTS (never modified): correct_answer, answer_keys.json, figure_path/figure_bbox_pct/figure_type,
 * group_id, source. Only stem_jp / choices_jp are repaired. Originals preserved in *_corrupted_backup.
 *
 * Usage:
 *   node scripts/stage027-apply.mjs            # dry-run: print what would change
 *   node scripts/stage027-apply.mjs --commit   # write backups + apply
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const REPAIR = `${EXAMS}/.tmp/s027/repair`;
const COMMIT = process.argv.includes('--commit');

const recon = JSON.parse(readFileSync(`${REPAIR}/_reconcile.json`, 'utf8'));
let fixes = recon.confirmed.slice();
if (existsSync(`${REPAIR}/_manual.json`)) {
  const manual = JSON.parse(readFileSync(`${REPAIR}/_manual.json`, 'utf8'));
  const arr = Array.isArray(manual) ? manual : (manual.fixes || []);
  fixes = fixes.concat(arr);
  console.log(`+ ${arr.length} manual (adjudicated) fixes`);
}

const qbPath = `${EXAMS}/question_bank.json`;
const qb = JSON.parse(readFileSync(qbPath, 'utf8'));
const byId = new Map(qb.questions.map((q) => [q.id, q]));

const byYearCache = new Map();
const loadByYear = (exam) => {
  if (!byYearCache.has(exam)) byYearCache.set(exam, JSON.parse(readFileSync(`${EXAMS}/by_year/${exam}.json`, 'utf8')));
  return byYearCache.get(exam);
};

let stemFixes = 0, choiceFixes = 0; const applied = [];
for (const f of fixes) {
  const q = byId.get(f.id);
  if (!q) { console.error(`! ${f.id} not found in question_bank`); continue; }
  const exam = f.id.split('-')[0];
  const byYear = loadByYear(exam);
  const qy = byYear.questions.find((x) => x.id === f.id);
  const change = { id: f.id, severity: f.severity, stem: false, choices: false };

  // backup guard: preserve the ORIGINAL stored value. On a re-fix of an already-resourced question,
  // do NOT clobber the existing *_corrupted_backup (which holds the original) with the flawed v1 text.
  if (f.fix_stem && f.authoritative_stem) {
    change.stem = true; change.old_stem = q.stem_jp; change.new_stem = f.authoritative_stem; stemFixes++;
    if (COMMIT) {
      if (!q.stem_jp_corrupted_backup) q.stem_jp_corrupted_backup = q.stem_jp;
      q.stem_jp = f.authoritative_stem; q.stem_resourced_s7x = true; q.s027_severity = f.severity; if (f.refixed) q.stem_refixed_s7x = true;
      if (qy) { if (!qy.stem_jp_corrupted_backup) qy.stem_jp_corrupted_backup = qy.stem_jp; qy.stem_jp = f.authoritative_stem; qy.stem_resourced_s7x = true; qy.s027_severity = f.severity; if (f.refixed) qy.stem_refixed_s7x = true; }
    }
  }
  if (f.fix_choices && f.authoritative_choices) {
    change.choices = true; change.old_choices = q.choices_jp; change.new_choices = f.authoritative_choices; choiceFixes++;
    if (COMMIT) {
      if (!q.choices_jp_corrupted_backup) q.choices_jp_corrupted_backup = q.choices_jp;
      q.choices_jp = f.authoritative_choices; q.choices_resourced_s7x = true; q.s027_severity = f.severity; if (f.refixed) q.choices_refixed_s7x = true;
      if (qy) { if (!qy.choices_jp_corrupted_backup) qy.choices_jp_corrupted_backup = qy.choices_jp; qy.choices_jp = f.authoritative_choices; qy.choices_resourced_s7x = true; qy.s027_severity = f.severity; if (f.refixed) qy.choices_refixed_s7x = true; }
    }
  }
  applied.push(change);
}

console.log(`${COMMIT ? 'APPLYING' : 'DRY-RUN'}: ${applied.length} questions | stem fixes ${stemFixes} | choice fixes ${choiceFixes}`);
for (const c of applied.slice(0, 12)) {
  console.log(`  ${c.id} [${c.severity}] stem:${c.stem} choices:${c.choices}`);
  if (c.stem) console.log(`     stem  OLD: ${JSON.stringify((c.old_stem || '').slice(0, 70))}\n            NEW: ${JSON.stringify((c.new_stem || '').slice(0, 70))}`);
}

if (COMMIT) {
  if (!existsSync(`${qbPath}.pre-s027`)) copyFileSync(qbPath, `${qbPath}.pre-s027`);
  writeFileSync(qbPath, JSON.stringify(qb, null, 2));
  for (const [exam, by] of byYearCache) {
    const p = `${EXAMS}/by_year/${exam}.json`;
    if (!existsSync(`${p}.pre-s027`)) copyFileSync(p, `${p}.pre-s027`);
    writeFileSync(p, JSON.stringify(by, null, 2));
  }
  writeFileSync(`${REPAIR}/_applied.json`, JSON.stringify({ stemFixes, choiceFixes, applied }, null, 2));
  console.log(`committed. backups: question_bank.json.pre-s027 + by_year/*.pre-s027. log: _applied.json`);
} else {
  console.log('(dry-run — re-run with --commit to write)');
}
