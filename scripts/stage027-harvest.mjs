#!/usr/bin/env node
/**
 * Stage 2.7 Step 2 — harvest collation verdicts from a workflow run's journal.jsonl.
 *
 * The collation workflow runs read-only `explore` agents (Rule D); their structured outputs are
 * persisted by the workflow runtime to <run_dir>/journal.jsonl as {type:'result', result:{...}}.
 * This harvester reads one or more run dirs, dedupes by unit_id (last write wins), merges into a
 * master scan keyed by unit_id, and cross-checks the vision verdicts against the Step-1 heuristic.
 *
 * Usage: node scripts/stage027-harvest.mjs <run_dir> [<run_dir> ...]
 * Output: data/ip/exams/.tmp/s027/scan/_master.json  (merged, all units seen so far)
 *         prints class counts + heuristic agreement + the defect list
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const SCAN = `${ROOT}/data/ip/exams/.tmp/s027/scan`;
mkdirSync(SCAN, { recursive: true });
const MASTER = `${SCAN}/_master.json`;

const runDirs = process.argv.slice(2);
if (!runDirs.length) { console.error('usage: node stage027-harvest.mjs <run_dir> [...]'); process.exit(1); }

// load existing master (merge across invocations)
const master = existsSync(MASTER) ? JSON.parse(readFileSync(MASTER, 'utf8')) : { units: {} };

let harvested = 0;
for (const dir of runDirs) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal at ${jp}`); continue; }
  const lines = readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean);
  for (const ln of lines) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    if (o.type !== 'result' || !o.result || !o.result.unit_id) continue;
    master.units[o.result.unit_id] = o.result; // last write wins
    harvested++;
  }
}

writeFileSync(MASTER, JSON.stringify(master, null, 2));

// ── analysis ──────────────────────────────────────────────────────────────────
const heur = JSON.parse(readFileSync(`${ROOT}/evidence/phase5/stage_027_heuristic_garble.json`, 'utf8'));
const heurFlagged = new Set(heur.results.filter((r) => r.flagged).map((r) => r.id));

const units = Object.values(master.units);
const verdicts = units.flatMap((u) => u.verdicts || []);
const classCounts = {};
for (const v of verdicts) classCounts[v.classification] = (classCounts[v.classification] || 0) + 1;

const CRITICAL = new Set(['ocr_garble_critical', 'content_mismatch', 'choices_garble', 'page_mismatch']);
const criticals = verdicts.filter((v) => CRITICAL.has(v.classification));
const minors = verdicts.filter((v) => v.classification === 'ocr_garble_minor');

// heuristic agreement: of vision-critical, how many were heuristic-flagged? of vision-clean, how many heuristic-flagged (false positives)?
const visCriticalIds = new Set(criticals.map((v) => v.id));
const critAlsoHeur = criticals.filter((v) => heurFlagged.has(v.id)).length;
const cleanIds = verdicts.filter((v) => v.classification === 'clean').map((v) => v.id);
const cleanButHeurFlagged = cleanIds.filter((id) => heurFlagged.has(id)).length;
// heuristic-flagged in THIS scan's coverage that vision says clean/minor (heuristic false-positive candidates)
const coveredIds = new Set(verdicts.map((v) => v.id));
const heurInScope = [...heurFlagged].filter((id) => coveredIds.has(id));
const heurMissedByVision = heurInScope.filter((id) => !visCriticalIds.has(id)); // heur flagged but vision !critical

console.log(`=== harvested ${harvested} result records → ${units.length} units, ${verdicts.length} verdicts ===`);
console.log('class_counts:', JSON.stringify(classCounts));
console.log(`criticals (to repair): ${criticals.length} | minors (triage): ${minors.length}`);
console.log(`\nheuristic cross-check (within scanned scope):`);
console.log(`  vision-critical also heuristic-flagged: ${critAlsoHeur}/${criticals.length}`);
console.log(`  heuristic-flagged but vision NOT critical (likely heur false-positives, e.g. clean markdown tables): ${heurMissedByVision.length}`);
console.log(`  vision-clean but heuristic-flagged: ${cleanButHeurFlagged}`);

console.log(`\n--- CRITICAL defect list (${criticals.length}) ---`);
for (const v of criticals.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(`${v.classification}\t${v.id}\t[${v.confidence}]\t${(v.issue || '').slice(0, 100)}`);
}
console.log(`\n--- low-confidence verdicts (need adjudication) ---`);
for (const v of verdicts.filter((v) => v.confidence === 'low')) {
  console.log(`${v.classification}\t${v.id}\t${(v.issue || v.notes || '').slice(0, 90)}`);
}
