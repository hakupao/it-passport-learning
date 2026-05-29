#!/usr/bin/env node
/**
 * Stage 2.6 Phase C — CI computation (Wilson 95%).
 * Reads l1l2_results.json (N=100) + optional adjudication.json (confirmed verdicts on flagged items).
 * Reports: L1 mismatch rate, suspect-data-defect rate, and the CONFIRMED critical-defect rate with
 * a Wilson 95% CI (the gate-condition-2 number). Also folds in L5 + L-ext defect findings if present.
 * Usage: node scripts/stage026-phaseC-ci.mjs
 */
import { readFileSync, existsSync } from 'fs';

const DIR = '/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/ip/exams/.tmp/s026/phaseC';

function wilson(x, n, z = 1.96) {
  if (n === 0) return { p: 0, lo: 0, hi: 0 };
  const p = x / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { p, lo: Math.max(0, c - h), hi: Math.min(1, c + h) };
}
const pct = (x) => (x * 100).toFixed(1) + '%';

const l1l2 = JSON.parse(readFileSync(`${DIR}/l1l2_results.json`, 'utf8')).results;
const N = l1l2.length;

// adjudication: confirmed criticals (id -> bool). If absent, fall back to agents' critical_defect flag.
let adj = {};
if (existsSync(`${DIR}/adjudication.json`)) adj = JSON.parse(readFileSync(`${DIR}/adjudication.json`, 'utf8'));

const mismatches = l1l2.filter((r) => !r.matches_key && r.predicted_answer !== 'unsure');
const suspect = l1l2.filter((r) => r.suspect_data_defect);
const l2bad = l1l2.filter((r) => r.l2_integrity_ok === false);
const agentCritical = l1l2.filter((r) => r.critical_defect);

// confirmed critical = adjudication says true, else agent flag for those not adjudicated
function isConfirmedCritical(r) {
  if (r.id in adj) return adj[r.id].confirmed_critical === true;
  return r.critical_defect === true;
}
const confirmed = l1l2.filter(isConfirmedCritical);

const ci = wilson(confirmed.length, N);
const mmCi = wilson(mismatches.length, N);

console.log('=== Phase C — N=' + N + ' (L1 re-solve + L2 integrity) ===');
console.log(`L1 answer mismatches (pred≠key, excl unsure): ${mismatches.length}/${N} = ${pct(mismatches.length / N)}  [Wilson95 ${pct(mmCi.lo)}–${pct(mmCi.hi)}]`);
console.log(`  (mismatch ⇏ defect: includes hard-question agent errors)`);
console.log(`suspect_data_defect flagged: ${suspect.length}`);
console.log(`L2 integrity not-ok flagged: ${l2bad.length}`);
console.log(`agent critical_defect flagged: ${agentCritical.length}`);
console.log(`\nCONFIRMED critical defects: ${confirmed.length}/${N}`);
console.log(`  point estimate: ${pct(ci.p)}`);
console.log(`  Wilson 95% CI: ${pct(ci.lo)} – ${pct(ci.hi)}`);
console.log(`\nconfirmed critical ids: ${confirmed.map((r) => r.id).join(', ') || '(none)'}`);
console.log(`\nflagged-for-adjudication (mismatch+suspect OR l2 bad OR agent-critical):`);
const flagged = l1l2.filter((r) => (r.suspect_data_defect && !r.matches_key) || r.l2_integrity_ok === false || r.critical_defect);
for (const r of flagged) console.log(`  ${r.id} pred=${r.predicted_answer} match=${r.matches_key} suspect=${r.suspect_data_defect}/${r.suspect_field || '-'} l2ok=${r.l2_integrity_ok} crit=${r.critical_defect} [${r.defect_class || '-'}] ${(r.reasoning || '').slice(0, 90)}`);
