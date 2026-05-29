#!/usr/bin/env node
/**
 * Stage 2.6 figure phase — finalize SINGLE figures (deterministic, main-loop, after verify converges).
 *   - PASS figures: re-crop (padded bbox, honoring page_image override) into figures/{id}.png,
 *     update question_bank + by_year (has_figure=true, figure_path, figure_bbox_pct,
 *     figure_repaired=true, source override if cross-page, clear figure_pending_crop_s72).
 *   - no_figure (demotions, e.g. truly-absent): strip figure fields, archive crop.
 * Old crops archived to figures/_rejected/ first (Rule B). Backs up question_bank.
 *
 * Input: data/ip/exams/.tmp/s026/fig/accumulated_pass.json ({pass:[{id,page_image,page_path,bbox}]})
 *   + optional .tmp/s026/fig/single_demote.json ({no_figure:[{id,reason}]})
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const FIGURES_DIR = `${EXAMS}/figures`;
const REJECTED_DIR = `${FIGURES_DIR}/_rejected`;
const BY_YEAR_DIR = `${EXAMS}/by_year`;
const BANK_FILE = `${EXAMS}/question_bank.json`;
const FIG_DIR = `${EXAMS}/.tmp/s026/fig`;

const acc = JSON.parse(readFileSync(`${FIG_DIR}/accumulated_pass.json`, 'utf8'));
const pass = acc.pass || [];
const demote = existsSync(`${FIG_DIR}/single_demote.json`)
  ? (JSON.parse(readFileSync(`${FIG_DIR}/single_demote.json`, 'utf8')).no_figure || []) : [];
mkdirSync(REJECTED_DIR, { recursive: true });

// backup bank once
const backup = `${BANK_FILE}.pre-s026-figsingle`;
if (!existsSync(backup)) copyFileSync(BANK_FILE, backup);

// archive existing crops we touch
const touched = [...pass, ...demote].map((x) => x.id);
let archived = 0;
for (const id of touched) {
  const cur = `${FIGURES_DIR}/${id}.png`;
  if (existsSync(cur)) { copyFileSync(cur, `${REJECTED_DIR}/${id}.pre-s73.png`); archived++; }
}

const relToAbs = (rel) => (rel ? `${EXAMS}/${rel.replace(/^.*?data\/ip\/exams\//, '')}` : null);

// re-crop PASS
let cropped = 0;
if (pass.length) {
  const jobs = pass.map((p) => ({
    id: p.id, page_path: p.page_path || relToAbs(p.page_image), bbox: p.bbox, output: `${FIGURES_DIR}/${p.id}.png`,
  }));
  const py = [
    'import json, sys',
    'from PIL import Image',
    'jobs = json.load(sys.stdin); ok = 0',
    'for j in jobs:',
    '    try:',
    '        img = Image.open(j["page_path"]); w,h = img.size; b = j["bbox"]',
    '        box = (max(0,int(b["x1"]*w)), max(0,int(b["y1"]*h)), min(w,int(b["x2"]*w)), min(h,int(b["y2"]*h)))',
    '        if box[2]>box[0] and box[3]>box[1]:',
    '            img.crop(box).save(j["output"]); ok += 1',
    '        else: print(f"  [warn] {j[\'id\']}: bad box {box}", file=sys.stderr)',
    '    except Exception as e: print(f"  [error] {j[\'id\']}: {e}", file=sys.stderr)',
    'print(ok)',
  ].join('\n');
  const out = execFileSync('python3', ['-c', py], { input: JSON.stringify(jobs), maxBuffer: 64 * 1024 * 1024 }).toString();
  cropped = parseInt(out.trim().split('\n').pop(), 10) || 0;
}

// remove demoted orphan crops
let removed = 0;
for (const n of demote) {
  const f = `${FIGURES_DIR}/${n.id}.png`;
  if (existsSync(f)) { try { renameSync(f, `${REJECTED_DIR}/${n.id}.demoted-s73.png`); removed++; } catch {} }
}

const passMap = new Map(pass.map((p) => [p.id, p]));
const demoteSet = new Set(demote.map((n) => n.id));

function apply(q) {
  if (passMap.has(q.id)) {
    const p = passMap.get(q.id);
    q.has_figure = true;
    q.figure_path = `figures/${q.id}.png`;
    q.figure_bbox_pct = p.bbox;
    q.figure_repaired = true;
    q.figure_repaired_s73 = true;
    if (q.figure_pending_crop_s72) delete q.figure_pending_crop_s72;
    if (p.page_image) {
      const cur = q.source?.page_image;
      if (cur !== p.page_image) {
        const m = /page-(\d+)\.png/.exec(p.page_image);
        q.source = { page_image: p.page_image, page_number: m ? parseInt(m[1], 10) : (q.source?.page_number ?? null) };
        q.figure_source_corrected = true;
      }
    }
    return 'pass';
  }
  if (demoteSet.has(q.id)) {
    q.has_figure = false;
    delete q.figure_path; delete q.figure_bbox_pct; delete q.figure_type; delete q.figure_description;
    if (q.figure_pending_crop_s72) delete q.figure_pending_crop_s72;
    q.figure_demoted_s73 = true;
    return 'demote';
  }
  return null;
}

const qb = JSON.parse(readFileSync(BANK_FILE, 'utf8'));
let qbPass = 0, qbDemote = 0;
for (const q of qb.questions) { const r = apply(q); if (r === 'pass') qbPass++; else if (r === 'demote') qbDemote++; }
writeFileSync(BANK_FILE, JSON.stringify(qb, null, 2) + '\n');

const exams = new Set(touched.map((id) => id.split('-')[0]));
let files = 0;
for (const exam of exams) {
  const f = `${BY_YEAR_DIR}/${exam}.json`;
  if (!existsSync(f)) continue;
  const data = JSON.parse(readFileSync(f, 'utf8'));
  for (const q of data.questions) apply(q);
  writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
  files++;
}

console.log('=== fig-finalize (single) ===');
console.log(`backup: ${backup}`);
console.log(`archived old crops: ${archived} | re-cropped PASS: ${cropped}/${pass.length} | demoted orphan crops removed: ${removed}`);
console.log(`question_bank: ${qbPass} figures attached, ${qbDemote} demoted`);
console.log(`by_year files updated: ${files}`);
