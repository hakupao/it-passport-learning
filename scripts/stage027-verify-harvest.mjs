#!/usr/bin/env node
/**
 * Stage 2.7 — accumulate verify transcriptions from verify workflow run dir(s) into a master map.
 * Lets the verify pass self-heal across session-limit interruptions (harvest → recompute unverified → run).
 * Usage: node scripts/stage027-verify-harvest.mjs <verify_run_dir> [<verify_run_dir> ...]
 * Output: .tmp/s027/repair/_verify_master.json  { id: {result}, ... }
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
const REPAIR = '/Users/bojiangzhang/MyProject/IT-Passport-Learning/data/ip/exams/.tmp/s027/repair';
mkdirSync(REPAIR, { recursive: true });
const MASTER = `${REPAIR}/_verify_master.json`;
const runDirs = process.argv.slice(2);
if (!runDirs.length) { console.error('usage: node stage027-verify-harvest.mjs <run_dir> [...]'); process.exit(1); }
const master = existsSync(MASTER) ? JSON.parse(readFileSync(MASTER, 'utf8')) : {};
let n = 0;
for (const dir of runDirs) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal ${jp}`); continue; }
  for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    if (o.type !== 'result' || !o.result || !o.result.id) continue;
    master[o.result.id] = o.result; n++;
  }
}
writeFileSync(MASTER, JSON.stringify(master, null, 2));
const cands = JSON.parse(readFileSync(`${REPAIR}/verify_cands.json`, 'utf8'));
const unver = cands.filter((c) => !master[c.id]);
writeFileSync(`${REPAIR}/_unverified.json`, JSON.stringify(unver.map((c) => c), null, 2));
console.log(`harvested ${n} → verify_master ${Object.keys(master).length} / ${cands.length} candidates | unverified ${unver.length}`);
