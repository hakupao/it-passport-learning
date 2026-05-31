#!/usr/bin/env node
/**
 * Stage 2.7b — harvest the Rule A audit verdicts from the audit workflow journal and report.
 * Flags any verdict=mismatch OR answer_consistent=false for main-loop adjudication.
 * Usage: node scripts/stage027b-audit-harvest.mjs <wf_run_dir> [<wf_run_dir> ...]
 * Output: data/ip/exams/.tmp/s027b/_audit_b.json + printed summary.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const OUT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/ip/exams/.tmp/s027b';
mkdirSync(OUT, { recursive: true });
const recon = JSON.parse(readFileSync(`${OUT}/_reconcile_b.json`, 'utf8'));
const disp = new Map();
for (const x of recon.confirmed) disp.set(x.id, 'confirmed:' + x.severity);
for (const x of recon.cleared) disp.set(x.id, 'cleared');
for (const x of recon.figure_inherent) disp.set(x.id, 'figure_inherent');

const master = {};
let n = 0;
for (const dir of process.argv.slice(2)) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal ${jp}`); continue; }
  for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    if (o.type !== 'result' || !o.result || !o.result.id) continue;
    master[o.result.id] = o.result; n++;
  }
}
const rows = Object.values(master);
const verdicts = {}; for (const r of rows) verdicts[r.verdict] = (verdicts[r.verdict] || 0) + 1;
const answerBad = rows.filter((r) => r.answer_consistent === false);
const mism = rows.filter((r) => r.verdict === 'mismatch');
const minor = rows.filter((r) => r.verdict === 'minor_diff');

writeFileSync(`${OUT}/_audit_b.json`, JSON.stringify({ harvested: n, audited: rows.length, verdicts, results: rows }, null, 2));

console.log(`=== Stage 2.7b Rule A audit: ${rows.length} audited ===`);
console.log('verdicts:', JSON.stringify(verdicts));
const matchN = verdicts.match || 0;
console.log(`match ${matchN} | minor_diff ${minor.length} | mismatch ${mism.length} → ${((100 * (matchN + minor.length) / Math.max(rows.length, 1))).toFixed(0)}% match-or-minor`);
console.log(`answer_consistent=false: ${answerBad.length}`);
if (mism.length) { console.log('\n--- MISMATCH (need adjudication) ---'); for (const r of mism) console.log(`  ${r.id} [${disp.get(r.id) || '?'}] stem_ok=${r.stem_ok} choices_ok=${r.choices_ok} ans=${r.answer_consistent}\n     ${(r.issue || '').slice(0, 160)}`); }
if (answerBad.length) { console.log('\n--- ANSWER INCONSISTENT (CRITICAL) ---'); for (const r of answerBad) console.log(`  ${r.id} [${disp.get(r.id) || '?'}]\n     ${(r.issue || '').slice(0, 160)}`); }
if (minor.length) { console.log('\n--- minor_diff ---'); for (const r of minor) console.log(`  ${r.id} [${disp.get(r.id) || '?'}] ${(r.issue || '').slice(0, 120)}`); }
const missing = [...disp.keys()].filter((id) => master[id]).length;
console.log(`\ncoverage: ${rows.length} verdicts; dispositions audited: ${[...disp.keys()].filter((id) => master[id]).length}`);
