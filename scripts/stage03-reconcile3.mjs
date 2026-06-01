#!/usr/bin/env node
/**
 * Stage 3 (G3) — final merge: agreed mappings + 3rd-pass tie-break decisions → _final.json.
 *
 * Inputs:
 *   - _reconcile.json : resolved[] (primary AGREE, mapping_status="agree")
 *   - tiebreak run dir(s) : journal.jsonl with {type:'result', result:{decisions:[...]}}
 *
 * Output: _final.json { refs:{<id>: syllabus_refs}, stats }
 *   tie-break items → mapping_status="reconciled", primary=chosen_primary, terms/secondary validated.
 *
 * Usage: node scripts/stage03-reconcile3.mjs <_reconcile.json> <_final.json> <tiebreak_run_dir> [...]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const REC = process.argv[2];
const OUT = process.argv[3];
const runDirs = process.argv.slice(4);
if (!REC || !OUT || !runDirs.length) { console.error('usage: node stage03-reconcile3.mjs <_reconcile.json> <_final.json> <run_dir> [...]'); process.exit(1); }
mkdirSync(dirname(OUT), { recursive: true });

const idx = JSON.parse(readFileSync(`${ROOT}/data/ip/syllabus/_mapping_index.json`, 'utf8'));
const validIds = new Set(idx.topics.map((t) => t.id));
const allTerms = new Set(idx.topics.flatMap((t) => t.terms));

const refs = {};
// 1) agreed
const rec = JSON.parse(readFileSync(REC, 'utf8'));
for (const r of rec.resolved) refs[r.id] = r.syllabus_refs;
const agreed = Object.keys(refs).length;

// 2) tie-break decisions from journals
const dec = {};
for (const dir of runDirs) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal at ${jp}`); continue; }
  for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    const r = o && o.type === 'result' ? o.result : null;
    if (!r || !Array.isArray(r.decisions)) continue;
    for (const d of r.decisions) if (d && d.id) dec[d.id] = d; // last write wins
  }
}

const bad = [];
let reconciled = 0;
for (const [id, d] of Object.entries(dec)) {
  if (!validIds.has(d.chosen_primary)) { bad.push(`${id}: invalid chosen_primary ${d.chosen_primary}`); continue; }
  const secondary = [...new Set(d.secondary_topics || [])].filter((s) => validIds.has(s) && s !== d.chosen_primary).slice(0, 2);
  const terms = [...new Set(d.terms || [])].filter((t) => allTerms.has(t));
  refs[id] = {
    primary_topic: d.chosen_primary,
    secondary_topics: secondary,
    terms,
    confidence: ['high', 'medium', 'low'].includes(d.confidence) ? d.confidence : 'medium',
    mapping_status: 'reconciled',
  };
  reconciled++;
}

const stats = { total: Object.keys(refs).length, agreed, reconciled, decisions_seen: Object.keys(dec).length, invalid_decisions: bad.length };
writeFileSync(OUT, JSON.stringify({ stats, refs }, null, 2));

console.log(`final merge → ${OUT}`);
console.log(`  total=${stats.total}  agreed=${agreed}  reconciled=${reconciled}  (need 2900)`);
if (bad.length) { console.log('  INVALID tie-break decisions:'); for (const b of bad) console.log('    ' + b); }
if (stats.total !== 2900) console.log(`  ⚠ total != 2900 — missing ${2900 - stats.total}`);
