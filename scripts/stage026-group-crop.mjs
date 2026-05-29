#!/usr/bin/env node
/**
 * Stage 2.6 F-2 (D-120) — crop shared preamble figures into staging for verification.
 * Reads group_discover.json (workflow result). For each group with shared_figure.present:
 *   - owner_qid set  → reuse existing figures/<owner>.png (copy into staging for the verifier).
 *   - owner_qid null → crop shared_figure.bbox from its page into staging/<group_id>.png.
 * Emits a verify manifest + per-group verify inputs + ids. Nothing in real data is touched yet.
 * Usage: node scripts/stage026-group-crop.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const FIG_DIR = `${EXAMS}/.tmp/s026/fig`;
const STAGING = `${FIG_DIR}/groups_staging`;
const FIGURES = `${EXAMS}/figures`;

const disc = JSON.parse(readFileSync(`${FIG_DIR}/group_discover.json`, 'utf8'));
const cands = JSON.parse(readFileSync(`${FIG_DIR}/group_candidates.json`, 'utf8')).groups;
const ownerOf = new Map(cands.map((g) => [g.group_id, g.owner_qid]));
const results = disc.results || disc;

try { rmSync(STAGING, { recursive: true, force: true }); } catch {}
mkdirSync(STAGING, { recursive: true });
const PAD_X = 0.025, PAD_Y = 0.025;
const relToAbs = (rel) => `${EXAMS}/${rel.replace(/^.*?data\/ip\/exams\//, '')}`;

const cropJobs = [];
const verifyItems = [];
const noFig = [];

for (const r of results) {
  if (!r || !r.group_id) continue;
  const owner = ownerOf.get(r.group_id) || null;
  const sf = r.shared_figure || {};
  if (!sf.present) { noFig.push({ group_id: r.group_id, reason: r.reasoning || 'no shared figure' }); continue; }
  const out = `${STAGING}/${r.group_id}.png`;
  if (owner) {
    // reuse the owner's already-cropped figure for verification
    const ownerPng = `${FIGURES}/${owner}.png`;
    if (existsSync(ownerPng)) copyFileSync(ownerPng, out);
    verifyItems.push({ group_id: r.group_id, owner_qid: owner, crop_path: out, page_path: sf.page_image ? relToAbs(sf.page_image) : null, page_image: sf.page_image || null, bbox: sf.bbox || null, caption: sf.caption || null, member_qids: r.member_qids });
    continue;
  }
  if (!sf.bbox || ['x1', 'y1', 'x2', 'y2'].some((k) => typeof sf.bbox[k] !== 'number') || !sf.page_image) {
    noFig.push({ group_id: r.group_id, reason: 'present but bbox/page invalid' });
    continue;
  }
  const pad = {
    x1: Math.max(0, sf.bbox.x1 - PAD_X), y1: Math.max(0, sf.bbox.y1 - PAD_Y),
    x2: Math.min(1, sf.bbox.x2 + PAD_X), y2: Math.min(1, sf.bbox.y2 + PAD_Y),
  };
  const pagePath = relToAbs(sf.page_image);
  cropJobs.push({ group_id: r.group_id, page_path: pagePath, padded_bbox: pad, output: out });
  verifyItems.push({ group_id: r.group_id, owner_qid: null, crop_path: out, page_path: pagePath, page_image: sf.page_image, bbox: pad, caption: sf.caption || null, member_qids: r.member_qids });
}

let cropped = 0;
if (cropJobs.length) {
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
    '        else: print(f"  [warn] {j[\'group_id\']}: bad box {box}", file=sys.stderr)',
    '    except Exception as e: print(f"  [error] {j[\'group_id\']}: {e}", file=sys.stderr)',
    'print(ok)',
  ].join('\n');
  const out = execFileSync('python3', ['-c', py], { input: JSON.stringify(cropJobs), maxBuffer: 64 * 1024 * 1024 }).toString();
  cropped = parseInt(out.trim().split('\n').pop(), 10) || 0;
}

const vIn = `${FIG_DIR}/group_verify_input`;
try { rmSync(vIn, { recursive: true, force: true }); } catch {}
mkdirSync(vIn, { recursive: true });
const liveItems = verifyItems.filter((v) => existsSync(v.crop_path));
for (const v of liveItems) writeFileSync(`${vIn}/${v.group_id}.json`, JSON.stringify(v, null, 2));
writeFileSync(`${FIG_DIR}/group_verify_ids.json`, JSON.stringify(liveItems.map((v) => v.group_id), null, 2));
writeFileSync(`${FIG_DIR}/group_crop_report.json`, JSON.stringify({ cropped, owner_reused: liveItems.filter((v) => v.owner_qid).length, no_figure: noFig, items: liveItems }, null, 2));

console.log(`[group-crop] new crops: ${cropped} | owner-reused: ${liveItems.filter((v) => v.owner_qid).length} | verify items: ${liveItems.length}`);
console.log(`[group-crop] no-shared-figure: ${noFig.length}${noFig.length ? ' → ' + noFig.map((n) => n.group_id).join(', ') : ''}`);
