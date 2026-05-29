#!/usr/bin/env node
/**
 * Stage 2.6 figure phase — collect a round's verify results (main-loop, after VERIFY workflow).
 * Accumulates PASS (with page + padded bbox actually used) into accumulated_pass.json,
 * writes round<N>_fails.json for the next round's prep. Isolated under .tmp/s026/fig/.
 * Usage: node scripts/stage026-fig-collect.mjs <round>
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const FIG_DIR = `${ROOT}/data/ip/exams/.tmp/s026/fig`;
const round = parseInt(process.argv[2] || '1', 10);

const verify = JSON.parse(readFileSync(`${FIG_DIR}/round${round}_verify_results.json`, 'utf8'));
const cropReport = JSON.parse(readFileSync(`${FIG_DIR}/round${round}_crop_report.json`, 'utf8'));
const results = verify.results || verify;

const meta = new Map((cropReport.cropped_items || []).map((c) => [c.id, { bbox: c.padded_bbox, page_image: c.page_image }]));
function inputOf(id) {
  for (const sub of ['round' + round + '_verify_input', 'round' + round + '_input']) {
    try { return JSON.parse(readFileSync(`${FIG_DIR}/${sub}/${id}.json`, 'utf8')); } catch {}
  }
  return {};
}

const acc = existsSync(`${FIG_DIR}/accumulated_pass.json`)
  ? JSON.parse(readFileSync(`${FIG_DIR}/accumulated_pass.json`, 'utf8')) : { pass: [] };
const accIds = new Set(acc.pass.map((p) => p.id));

const fails = {};
let newPass = 0;
for (const r of results) {
  if (!r || !r.id) continue;
  if (r.verdict === 'PASS') {
    if (!accIds.has(r.id)) {
      const m = meta.get(r.id) || {};
      acc.pass.push({ id: r.id, page_image: m.page_image || inputOf(r.id).page_image, page_path: inputOf(r.id).page_path, bbox: m.bbox, round });
      accIds.add(r.id);
      newPass++;
    }
  } else {
    fails[r.id] = r.suggested_fix || r.reasoning || 'FAIL (no hint)';
  }
}
writeFileSync(`${FIG_DIR}/accumulated_pass.json`, JSON.stringify(acc, null, 2));
writeFileSync(`${FIG_DIR}/round${round}_fails.json`, JSON.stringify(fails, null, 2));

console.log(`=== fig-collect round ${round} ===`);
console.log(`PASS this round (new): ${newPass} | accumulated PASS total: ${acc.pass.length}`);
console.log(`FAIL this round: ${Object.keys(fails).length}${Object.keys(fails).length ? ' → ' + Object.keys(fails).join(', ') : ''}`);
const noBbox = acc.pass.filter((p) => !p.bbox).map((p) => p.id);
if (noBbox.length) console.log(`WARNING accumulated PASS missing bbox: ${noBbox.join(', ')}`);
