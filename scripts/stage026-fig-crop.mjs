#!/usr/bin/env node
/**
 * Stage 2.6 figure phase — deterministic crop (main-loop, between ESTIMATE and VERIFY).
 * Reads round<N>_estimates.json, honors a per-figure page_image OVERRIDE (figure may live on an
 * adjacent page to the recorded source), applies padding, crops from the page PNG into staging,
 * emits verify-manifest + per-figure verify inputs + ids. Isolated under .tmp/s026/fig/.
 *
 * Usage: node scripts/stage026-fig-crop.mjs <round>
 *   expects: .tmp/s026/fig/round<N>_estimates.json  ({results:[{id,is_figure,page_image?,bbox}]})
 *            .tmp/s026/fig/round<N>_input/{id}.json  (fallback page_path)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const FIG_DIR = `${ROOT}/data/ip/exams/.tmp/s026/fig`;
const round = parseInt(process.argv[2] || '1', 10);
const PAD_X = parseFloat(process.env.PAD_X || '0.03');
const PAD_Y = parseFloat(process.env.PAD_Y || '0.03');

const est = JSON.parse(readFileSync(`${FIG_DIR}/round${round}_estimates.json`, 'utf8'));
const results = est.results || est;

const stagingDir = `${FIG_DIR}/round${round}`;
try { rmSync(stagingDir, { recursive: true, force: true }); } catch {}
mkdirSync(stagingDir, { recursive: true });

const relToAbs = (rel) => (rel ? `${ROOT}/data/ip/exams/${rel.replace(/^.*?data\/ip\/exams\//, '')}` : null);

const realFigs = [];
const noFigs = [];
for (const r of results) {
  if (!r || !r.id) continue;
  if (!r.is_figure) { noFigs.push({ id: r.id, reason: r.reasoning || 'agent: no figure' }); continue; }
  if (!r.bbox || ['x1', 'y1', 'x2', 'y2'].some((k) => typeof r.bbox[k] !== 'number')) {
    noFigs.push({ id: r.id, reason: 'is_figure=true but bbox invalid' });
    continue;
  }
  let inp = {};
  try { inp = JSON.parse(readFileSync(`${FIG_DIR}/round${round}_input/${r.id}.json`, 'utf8')); } catch {}
  // page override: estimate page_image wins (figure may be on adjacent page); else input page
  const pageRel = r.page_image || inp.page_image;
  const pagePath = r.page_image ? relToAbs(r.page_image) : (inp.page_path || relToAbs(pageRel));
  if (!pagePath || !existsSync(pagePath)) { noFigs.push({ id: r.id, reason: `page missing: ${pageRel}` }); continue; }
  const pad = {
    x1: Math.max(0, r.bbox.x1 - PAD_X),
    y1: Math.max(0, r.bbox.y1 - PAD_Y),
    x2: Math.min(1, r.bbox.x2 + PAD_X),
    y2: Math.min(1, r.bbox.y2 + PAD_Y),
  };
  realFigs.push({
    id: r.id, page_path: pagePath, page_image: pageRel, raw_bbox: r.bbox,
    padded_bbox: pad, confidence: r.confidence ?? null, output: `${stagingDir}/${r.id}.png`,
  });
}

let cropped = 0;
if (realFigs.length) {
  const py = [
    'import json, sys',
    'from PIL import Image',
    'jobs = json.load(sys.stdin); ok = 0',
    'for j in jobs:',
    '    try:',
    '        img = Image.open(j["page_path"]); w,h = img.size; b = j["padded_bbox"]',
    '        box = (max(0,int(b["x1"]*w)), max(0,int(b["y1"]*h)), min(w,int(b["x2"]*w)), min(h,int(b["y2"]*h)))',
    '        if box[2]>box[0] and box[3]>box[1]:',
    '            img.crop(box).save(j["output"]); ok += 1',
    '        else: print(f"  [warn] {j[\'id\']}: bad box {box}", file=sys.stderr)',
    '    except Exception as e: print(f"  [error] {j[\'id\']}: {e}", file=sys.stderr)',
    'print(ok)',
  ].join('\n');
  const out = execFileSync('python3', ['-c', py], { input: JSON.stringify(realFigs), maxBuffer: 64 * 1024 * 1024 }).toString();
  cropped = parseInt(out.trim().split('\n').pop(), 10) || 0;
}

const verifyItems = realFigs.filter((f) => existsSync(f.output)).map((f) => ({
  id: f.id, crop_path: f.output, page_path: f.page_path, page_image: f.page_image,
  padded_bbox: f.padded_bbox, raw_bbox: f.raw_bbox,
}));

writeFileSync(`${FIG_DIR}/round${round}_crop_report.json`, JSON.stringify({
  round, pad: { PAD_X, PAD_Y }, total_results: results.length, real_figures: realFigs.length, cropped,
  no_figure_candidates: noFigs,
  cropped_items: verifyItems.map((v) => ({ id: v.id, page_image: v.page_image, raw_bbox: v.raw_bbox, padded_bbox: v.padded_bbox })),
}, null, 2));
writeFileSync(`${FIG_DIR}/round${round}_verify_manifest.json`, JSON.stringify({ round, count: verifyItems.length, items: verifyItems }, null, 2));
const vIn = `${FIG_DIR}/round${round}_verify_input`;
try { rmSync(vIn, { recursive: true, force: true }); } catch {}
mkdirSync(vIn, { recursive: true });
for (const v of verifyItems) writeFileSync(`${vIn}/${v.id}.json`, JSON.stringify(v, null, 2));
writeFileSync(`${FIG_DIR}/round${round}_verify_ids.json`, JSON.stringify(verifyItems.map((v) => v.id), null, 2));

console.log(`[fig-crop] round ${round}: ${cropped}/${realFigs.length} cropped → ${stagingDir}`);
console.log(`[fig-crop] no-figure candidates: ${noFigs.length}${noFigs.length ? ' → ' + noFigs.map((n) => n.id).join(', ') : ''}`);
console.log(`[fig-crop] verify: ${verifyItems.length} items`);
