#!/usr/bin/env node
/**
 * Stage 2.7b — apply the second-pass dispositions from _reconcile_b.json (+ optional _manual_b.json).
 *
 * Applies to question_bank.json + by_year/<exam>.json with .pre-s027b backups.
 *   - confirmed / regression_restore : repair stem_jp / choices_jp; clear the residual flag.
 *   - figure_inherent                : clear the residual flag, set s027_figure_inherent=true (text untouched —
 *                                      the four options are graphs/images; stored description is the representation).
 *   - cleared                        : clear the residual flag, set s027b_verified_ok=true (text untouched).
 *   - still_unresolved               : leave flag + text as-is (set s027b_rechecked=true for the audit trail).
 *
 * INVARIANTS (never modified): correct_answer, answer_keys.json, figure_path/figure_bbox_pct/figure_type,
 * group_id, source. History chain preserved (Rule B): *_jp_corrupted_backup = ORIGINAL pre-s027 value (kept);
 * *_jp_s027b_prev = the value immediately before this pass (the s027 result).
 *
 * Usage:
 *   node scripts/stage027b-apply.mjs            # dry-run
 *   node scripts/stage027b-apply.mjs --commit   # write backups + apply
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const OUT = `${EXAMS}/.tmp/s027b`;
const COMMIT = process.argv.includes('--commit');

const recon = JSON.parse(readFileSync(`${OUT}/_reconcile_b.json`, 'utf8'));
let confirmed = [...recon.confirmed, ...recon.regression_restore];
if (existsSync(`${OUT}/_manual_b.json`)) {
  const manual = JSON.parse(readFileSync(`${OUT}/_manual_b.json`, 'utf8'));
  const arr = Array.isArray(manual) ? manual : (manual.fixes || []);
  confirmed = confirmed.concat(arr);
  console.log(`+ ${arr.length} manual (adjudicated) fixes`);
}

const qbPath = `${EXAMS}/question_bank.json`;
const qb = JSON.parse(readFileSync(qbPath, 'utf8'));
const byId = new Map(qb.questions.map((q) => [q.id, q]));
const byYearCache = new Map();
const loadByYear = (exam) => { if (!byYearCache.has(exam)) byYearCache.set(exam, JSON.parse(readFileSync(`${EXAMS}/by_year/${exam}.json`, 'utf8'))); return byYearCache.get(exam); };

const clearFlags = (q) => { delete q.s027_unresolved; delete q.s027_choice_anomaly; };

let stemFixes = 0, choiceFixes = 0, figInherent = 0, clearedN = 0, recheck = 0;
const applied = [];

function eachCopy(id, fn) { // apply fn to both question_bank entry and by_year entry
  const q = byId.get(id); if (!q) { console.error(`! ${id} not in question_bank`); return; }
  const exam = id.split('-')[0];
  const qy = loadByYear(exam).questions.find((x) => x.id === id);
  fn(q); if (qy) fn(qy);
}

// 1) repairs (confirmed + regression_restore + manual)
for (const f of confirmed) {
  const q = byId.get(f.id); if (!q) { console.error(`! ${f.id} not found`); continue; }
  const change = { id: f.id, disp: f.severity || 'fix', stem: false, choices: false };
  if (f.fix_stem && f.authoritative_stem) {
    change.stem = true; change.old_stem = q.stem_jp; change.new_stem = f.authoritative_stem; stemFixes++;
    if (COMMIT) eachCopy(f.id, (x) => {
      if (!x.stem_jp_corrupted_backup) x.stem_jp_corrupted_backup = x.stem_jp; // keep ORIGINAL
      x.stem_jp_s027b_prev = x.stem_jp; x.stem_jp = f.authoritative_stem;
      x.stem_resourced_s7xb = true; x.s027b_severity = f.severity; clearFlags(x);
    });
  }
  if (f.fix_choices && f.authoritative_choices) {
    change.choices = true; change.old_choices = q.choices_jp; change.new_choices = f.authoritative_choices; choiceFixes++;
    if (COMMIT) eachCopy(f.id, (x) => {
      if (!x.choices_jp_corrupted_backup) x.choices_jp_corrupted_backup = x.choices_jp;
      x.choices_jp_s027b_prev = x.choices_jp; x.choices_jp = f.authoritative_choices;
      x.choices_resourced_s7xb = true; x.s027b_severity = f.severity; clearFlags(x);
    });
  }
  applied.push(change);
}

// 2) figure_inherent → reclassify (text untouched)
for (const f of recon.figure_inherent) {
  figInherent++;
  if (COMMIT) eachCopy(f.id, (x) => { clearFlags(x); x.s027_figure_inherent = true; });
}
// 3) cleared → flag was a false positive (stored faithful)
for (const f of recon.cleared) {
  clearedN++;
  if (COMMIT) eachCopy(f.id, (x) => { clearFlags(x); x.s027b_verified_ok = true; });
}
// 4) still_unresolved → keep flag, mark rechecked for the audit trail
for (const f of recon.still_unresolved) {
  recheck++;
  if (COMMIT) eachCopy(f.id, (x) => { x.s027b_rechecked = true; });
}

console.log(`${COMMIT ? 'APPLYING' : 'DRY-RUN'}:`);
console.log(`  repairs: ${applied.length} questions | stem ${stemFixes} | choices ${choiceFixes}`);
console.log(`  figure_inherent reclassified: ${figInherent}`);
console.log(`  cleared (false-positive flag): ${clearedN}`);
console.log(`  still_unresolved (kept flagged): ${recheck}`);
for (const c of applied.slice(0, 30)) {
  console.log(`  ${c.id} [${c.disp}] stem:${c.stem} choices:${c.choices}`);
  if (c.stem) console.log(`     stem OLD ${JSON.stringify((c.old_stem || '').slice(0, 60))}\n          NEW ${JSON.stringify((c.new_stem || '').slice(0, 60))}`);
  if (c.choices) console.log(`     ch   OLD ${JSON.stringify(JSON.stringify(c.old_choices).slice(0, 60))}\n          NEW ${JSON.stringify(JSON.stringify(c.new_choices).slice(0, 60))}`);
}

if (COMMIT) {
  if (!existsSync(`${qbPath}.pre-s027b`)) copyFileSync(qbPath, `${qbPath}.pre-s027b`);
  writeFileSync(qbPath, JSON.stringify(qb, null, 2));
  for (const [exam, by] of byYearCache) {
    const p = `${EXAMS}/by_year/${exam}.json`;
    if (!existsSync(`${p}.pre-s027b`)) copyFileSync(p, `${p}.pre-s027b`);
    writeFileSync(p, JSON.stringify(by, null, 2));
  }
  writeFileSync(`${OUT}/_applied_b.json`, JSON.stringify({ stemFixes, choiceFixes, figInherent, clearedN, recheck, applied }, null, 2));
  console.log(`\ncommitted. backups: question_bank.json.pre-s027b + by_year/*.pre-s027b. log: _applied_b.json`);
} else {
  console.log('\n(dry-run — re-run with --commit to write)');
}
