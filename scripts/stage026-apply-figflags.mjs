#!/usr/bin/env node
/**
 * Stage 2.6 — apply has_figure-flag consistency fixes (the "110" + 7 group orphans).
 * Reads merged triage: .tmp/s026/fig/triage_all.json { flag:[...], orphan:[...] }.
 *   genuine_figure + crop_ok=true       → has_figure=true (keep figure_path/bbox), flag has_figure_fixed_s73.
 *   spurious_crop                        → has_figure stays false; archive figure file → _rejected; strip figure_path/bbox/type/desc; flag figure_spurious_s73.
 *   crop_quality_issue / has_own_subfigure (recrop_needed) → NOT applied here; written to recrop_worklist.json for the estimate→crop→verify pass.
 *   group_only (orphan)                  → has_figure=false (keep group_id); flag figure_group_only_s73.
 * Backs up question_bank. Syncs by_year. Use --commit to write (dry-run by default prints the plan).
 * Usage: node scripts/stage026-apply-figflags.mjs [--commit]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, renameSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const FIG_DIR = `${EXAMS}/.tmp/s026/fig`;
const FIGURES = `${EXAMS}/figures`;
const REJECTED = `${FIGURES}/_rejected`;
const BY_YEAR_DIR = `${EXAMS}/by_year`;
const BANK_FILE = `${EXAMS}/question_bank.json`;
const COMMIT = process.argv.includes('--commit');

const tri = JSON.parse(readFileSync(`${FIG_DIR}/triage_all.json`, 'utf8'));
const flag = tri.flag || [];
const orphan = tri.orphan || [];

const setTrue = [];   // genuine + crop_ok
const spurious = [];  // spurious_crop
const recrop = [];    // crop_quality_issue / has_own_subfigure
const groupOnly = []; // orphan group_only

for (const r of flag) {
  if (r.classification === 'genuine_figure' && r.crop_ok) setTrue.push(r.id);
  else if (r.classification === 'spurious_crop') spurious.push(r.id);
  else if (r.recrop_needed || r.classification === 'crop_quality_issue') recrop.push({ id: r.id, page_image: r.recrop_page_image, bbox: r.recrop_bbox, reason: r.reasoning });
  else if (r.classification === 'genuine_figure' && !r.crop_ok) recrop.push({ id: r.id, page_image: r.recrop_page_image, bbox: r.recrop_bbox, reason: 'genuine but crop_ok=false' });
  else spurious.push(r.id); // fallback conservative? no — leave; but log
}
for (const r of orphan) {
  if (r.classification === 'has_own_subfigure' || r.recrop_needed) recrop.push({ id: r.id, page_image: r.recrop_page_image, bbox: r.recrop_bbox, reason: 'orphan own subfigure', orphan: true });
  else groupOnly.push(r.id);
}

console.log(`triage: flag=${flag.length} orphan=${orphan.length}`);
console.log(`plan: set_has_figure_true=${setTrue.length} | spurious_strip=${spurious.length} | recrop=${recrop.length} | group_only_demote=${groupOnly.length}`);
writeFileSync(`${FIG_DIR}/recrop_worklist.json`, JSON.stringify({ count: recrop.length, items: recrop }, null, 2));
console.log(`recrop worklist → ${FIG_DIR}/recrop_worklist.json (${recrop.length})`);

if (!COMMIT) { console.log('\n(dry-run; pass --commit to apply has_figure flips + spurious strips + group_only demotes)'); process.exit(0); }

mkdirSync(REJECTED, { recursive: true });
const backup = `${BANK_FILE}.pre-s026-figflags`;
if (!existsSync(backup)) copyFileSync(BANK_FILE, backup);

const trueSet = new Set(setTrue);
const spuSet = new Set(spurious);
const goSet = new Set(groupOnly);

// archive spurious crop files
let archived = 0;
for (const id of spurious) {
  const f = `${FIGURES}/${id}.png`;
  if (existsSync(f)) { try { renameSync(f, `${REJECTED}/${id}.spurious-s73.png`); archived++; } catch {} }
}

function apply(q) {
  if (trueSet.has(q.id)) { q.has_figure = true; q.has_figure_fixed_s73 = true; return 'true'; }
  if (spuSet.has(q.id)) { q.has_figure = false; delete q.figure_path; delete q.figure_bbox_pct; delete q.figure_type; delete q.figure_description; q.figure_spurious_s73 = true; return 'spurious'; }
  if (goSet.has(q.id)) { q.has_figure = false; q.figure_group_only_s73 = true; return 'group_only'; }
  return null;
}

const qb = JSON.parse(readFileSync(BANK_FILE, 'utf8'));
const c = { true: 0, spurious: 0, group_only: 0 };
for (const q of qb.questions) { const r = apply(q); if (r) c[r]++; }
writeFileSync(BANK_FILE, JSON.stringify(qb, null, 2) + '\n');

const touchedExams = new Set([...trueSet, ...spuSet, ...goSet].map((id) => id.split('-')[0]));
let files = 0;
for (const exam of touchedExams) {
  const f = `${BY_YEAR_DIR}/${exam}.json`;
  if (!existsSync(f)) continue;
  const data = JSON.parse(readFileSync(f, 'utf8'));
  for (const q of data.questions) apply(q);
  writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
  files++;
}
console.log('=== apply-figflags (COMMITTED) ===');
console.log(`backup: ${backup}`);
console.log(`has_figure=true set: ${c.true} | spurious stripped: ${c.spurious} (archived ${archived}) | group_only demoted: ${c.group_only}`);
console.log(`by_year files: ${files} | recrop pending: ${recrop.length}`);
