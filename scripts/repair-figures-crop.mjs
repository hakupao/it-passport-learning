#!/usr/bin/env node
/**
 * Session 71 — Figure repair: deterministic crop step (main-loop, between ESTIMATE and VERIFY workflows).
 * Reads estimate results, applies programmatic padding, crops from source page PNG into a staging dir,
 * and emits a verify-manifest + ids file for the VERIFY workflow.
 *
 * Usage: node scripts/repair-figures-crop.mjs <round>
 *   expects: data/ip/exams/.tmp/repair/round<N>_estimates.json   ({results:[{id,is_figure,bbox,...}]})
 *            data/ip/exams/.tmp/repair/round<N>_input/{id}.json   (for page_path)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const REPAIR_DIR = `${ROOT}/data/ip/exams/.tmp/repair`;
const round = parseInt(process.argv[2] || '1', 10);

// padding (fraction of page dimension) — safety margin on top of agent's over-inclusive bbox
const PAD_X = parseFloat(process.env.PAD_X || '0.03');
const PAD_Y = parseFloat(process.env.PAD_Y || '0.03');

const est = JSON.parse(readFileSync(`${REPAIR_DIR}/round${round}_estimates.json`, 'utf8'));
const results = est.results || est;

const stagingDir = `${REPAIR_DIR}/round${round}`;
try { rmSync(stagingDir, { recursive: true, force: true }); } catch {}
mkdirSync(stagingDir, { recursive: true });

const realFigs = [];
const noFigs = [];

for (const r of results) {
  if (!r || !r.id) continue;
  if (!r.is_figure) { noFigs.push({ id: r.id, reason: r.old_bbox_problem || 'no figure' }); continue; }
  if (!r.bbox || [r.bbox.x1, r.bbox.y1, r.bbox.x2, r.bbox.y2].some((v) => typeof v !== 'number')) {
    noFigs.push({ id: r.id, reason: 'is_figure=true but bbox invalid → treat as no-fig pending manual' });
    continue;
  }
  // read page_path from per-figure input
  let inp;
  try { inp = JSON.parse(readFileSync(`${REPAIR_DIR}/round${round}_input/${r.id}.json`, 'utf8')); }
  catch { noFigs.push({ id: r.id, reason: 'input file missing' }); continue; }
  if (!inp.page_path || !existsSync(inp.page_path)) { noFigs.push({ id: r.id, reason: 'page_path missing' }); continue; }

  const pad = {
    x1: Math.max(0, r.bbox.x1 - PAD_X),
    y1: Math.max(0, r.bbox.y1 - PAD_Y),
    x2: Math.min(1, r.bbox.x2 + PAD_X),
    y2: Math.min(1, r.bbox.y2 + PAD_Y),
  };
  realFigs.push({
    id: r.id,
    page_path: inp.page_path,
    raw_bbox: r.bbox,
    padded_bbox: pad,
    confidence: r.confidence || null,
    output: `${stagingDir}/${r.id}.png`,
  });
}

// crop via PIL (same mechanism as crop-and-update.mjs)
let cropped = 0;
if (realFigs.length) {
  const py = [
    'import json, sys',
    'from PIL import Image',
    'jobs = json.load(sys.stdin)',
    'ok = 0',
    'for j in jobs:',
    '    try:',
    '        img = Image.open(j["page_path"]); w,h = img.size',
    '        b = j["padded_bbox"]',
    '        box = (max(0,int(b["x1"]*w)), max(0,int(b["y1"]*h)), min(w,int(b["x2"]*w)), min(h,int(b["y2"]*h)))',
    '        if box[2]>box[0] and box[3]>box[1]:',
    '            img.crop(box).save(j["output"]); ok += 1',
    '        else:',
    '            print(f"  [warn] {j[\'id\']}: invalid box {box}", file=sys.stderr)',
    '    except Exception as e:',
    '        print(f"  [error] {j[\'id\']}: {e}", file=sys.stderr)',
    'print(ok)',
  ].join('\n');
  const out = execFileSync('python3', ['-c', py], { input: JSON.stringify(realFigs), maxBuffer: 50 * 1024 * 1024 }).toString();
  cropped = parseInt(out.trim().split('\n').pop(), 10) || 0;
}

// verify-manifest: only successfully cropped figures
const verifyItems = realFigs.filter((f) => existsSync(f.output)).map((f) => ({
  id: f.id,
  crop_path: f.output,
  page_path: f.page_path,
  padded_bbox: f.padded_bbox,
  raw_bbox: f.raw_bbox,
}));

writeFileSync(`${REPAIR_DIR}/round${round}_crop_report.json`, JSON.stringify({
  round, pad: { PAD_X, PAD_Y },
  total_results: results.length,
  real_figures: realFigs.length,
  cropped,
  no_figure_candidates: noFigs,
  cropped_items: verifyItems.map((v) => ({ id: v.id, raw_bbox: v.raw_bbox, padded_bbox: v.padded_bbox })),
}, null, 2));

writeFileSync(`${REPAIR_DIR}/round${round}_verify_manifest.json`, JSON.stringify({ round, count: verifyItems.length, items: verifyItems }, null, 2));
// per-figure verify input + ids (mirror estimate prep)
const vInputDir = `${REPAIR_DIR}/round${round}_verify_input`;
try { rmSync(vInputDir, { recursive: true, force: true }); } catch {}
mkdirSync(vInputDir, { recursive: true });
for (const v of verifyItems) writeFileSync(`${vInputDir}/${v.id}.json`, JSON.stringify(v, null, 2));
writeFileSync(`${REPAIR_DIR}/round${round}_verify_ids.json`, JSON.stringify(verifyItems.map((v) => v.id), null, 2));

console.log(`[crop] round ${round}: ${cropped}/${realFigs.length} cropped → ${stagingDir}`);
console.log(`[crop] no-figure candidates: ${noFigs.length}${noFigs.length ? ' → ' + noFigs.map((n) => n.id).join(', ') : ''}`);
console.log(`[crop] verify manifest: ${verifyItems.length} items → round${round}_verify_ids.json`);
