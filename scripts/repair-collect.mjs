#!/usr/bin/env node
/**
 * Session 71 — Figure repair: collect a round's verify results.
 * Reads round<N>_verify_results.json + round<N>_crop_report.json, then:
 *   - appends PASS figures (with the padded bbox actually used) to accumulated_pass.json
 *   - writes round<N>_fails.json  ({id: suggested_fix})  for the next round's prep
 *   - prints a summary
 * Usage: node scripts/repair-collect.mjs <round>
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const DIR = `${ROOT}/data/ip/exams/.tmp/repair`;
const round = parseInt(process.argv[2] || '1', 10);

const verify = JSON.parse(readFileSync(`${DIR}/round${round}_verify_results.json`, 'utf8'));
const cropReport = JSON.parse(readFileSync(`${DIR}/round${round}_crop_report.json`, 'utf8'));
const results = verify.results || verify;

// padded bbox per id (the bbox that produced the crop just judged)
const bboxOf = new Map((cropReport.cropped_items || []).map((c) => [c.id, c.padded_bbox]));
// page_path per id from the round input
function pagePath(id) {
  try { return JSON.parse(readFileSync(`${DIR}/round${round}_input/${id}.json`, 'utf8')).page_path; }
  catch {
    try { return JSON.parse(readFileSync(`${DIR}/round${round}_verify_input/${id}.json`, 'utf8')).page_path; }
    catch { return null; }
  }
}

const acc = existsSync(`${DIR}/accumulated_pass.json`)
  ? JSON.parse(readFileSync(`${DIR}/accumulated_pass.json`, 'utf8'))
  : { pass: [] };
const accIds = new Set(acc.pass.map((p) => p.id));

const fails = {};
let newPass = 0;
for (const r of results) {
  if (!r || !r.id) continue;
  if (r.verdict === 'PASS') {
    if (!accIds.has(r.id)) {
      acc.pass.push({ id: r.id, page_path: pagePath(r.id), bbox: bboxOf.get(r.id), round });
      accIds.add(r.id);
      newPass++;
    }
  } else {
    fails[r.id] = r.suggested_fix || r.reason || 'FAIL (no hint)';
  }
}

writeFileSync(`${DIR}/accumulated_pass.json`, JSON.stringify(acc, null, 2));
writeFileSync(`${DIR}/round${round}_fails.json`, JSON.stringify(fails, null, 2));

console.log(`=== collect round ${round} ===`);
console.log(`PASS this round (new): ${newPass} | accumulated PASS total: ${acc.pass.length}`);
console.log(`FAIL this round: ${Object.keys(fails).length}`);
console.log(`FAIL ids: ${Object.keys(fails).join(', ')}`);
// quick missing-bbox guard
const noBbox = acc.pass.filter((p) => !p.bbox || !p.page_path).map((p) => p.id);
if (noBbox.length) console.log(`WARNING accumulated PASS missing bbox/page: ${noBbox.join(', ')}`);
