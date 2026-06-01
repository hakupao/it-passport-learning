#!/usr/bin/env node
/**
 * Stage 3 (G3) — harvest mapping StructuredOutputs from a workflow run's journal.jsonl.
 *
 * stage03-map.workflow.mjs agents return {pass, batch, mappings:[{id,primary_topic,secondary_topics,terms,confidence}]}.
 * The workflow runtime persists each agent's raw StructuredOutput to <run_dir>/journal.jsonl as
 * {type:'result', result:{...}}. This harvester reads one or more run dirs, separates the two passes,
 * and writes a master keyed by `${pass}::${id}` (last write wins, so re-runs supersede).
 *
 * Usage: node scripts/stage03-harvest.mjs <out_master.json> <run_dir> [<run_dir> ...]
 *   e.g. node scripts/stage03-harvest.mjs data/ip/exams/.tmp/s03/pilot/_master.json /path/to/run
 * Output: <out_master.json> { byPassId: {"A::<id>":mapping,...}, passA:[...], passB:[...], stats }
 *         prints per-pass counts + any invalid primary_topic / unknown-term flags.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const OUT = process.argv[2];
const runDirs = process.argv.slice(3);
if (!OUT || !runDirs.length) { console.error('usage: node stage03-harvest.mjs <out_master.json> <run_dir> [...]'); process.exit(1); }
mkdirSync(dirname(OUT), { recursive: true });

// valid topic ids + term sets from the mapping index (for validation flags)
const index = JSON.parse(readFileSync(`${ROOT}/data/ip/syllabus/_mapping_index.json`, 'utf8'));
const validIds = new Set(index.topics.map((t) => t.id));
const termsByTopic = new Map(index.topics.map((t) => [t.id, new Set(t.terms)]));
const allTerms = new Set(index.topics.flatMap((t) => t.terms));

const master = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { byPassId: {} };
master.byPassId = master.byPassId || {};

let harvested = 0;
for (const dir of runDirs) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal at ${jp}`); continue; }
  const lines = readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean);
  for (const ln of lines) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    const r = o && o.type === 'result' ? o.result : null;
    if (!r || !r.pass || !Array.isArray(r.mappings)) continue;
    for (const m of r.mappings) {
      if (!m || !m.id) continue;
      master.byPassId[`${r.pass}::${m.id}`] = { ...m, pass: r.pass, batch: r.batch };
      harvested++;
    }
  }
}

// split + validate
const passA = [], passB = [];
const flags = { invalid_primary: [], invalid_secondary: [], unknown_terms: [], primary_in_secondary: [] };
for (const [k, m] of Object.entries(master.byPassId)) {
  (m.pass === 'A' ? passA : m.pass === 'B' ? passB : passA).push(m);
  if (!validIds.has(m.primary_topic)) flags.invalid_primary.push(`${k} -> ${m.primary_topic}`);
  for (const s of m.secondary_topics || []) {
    if (!validIds.has(s)) flags.invalid_secondary.push(`${k} -> ${s}`);
    if (s === m.primary_topic) flags.primary_in_secondary.push(k);
  }
  for (const t of m.terms || []) {
    if (!allTerms.has(t)) flags.unknown_terms.push(`${k} -> ${t}`);
  }
}

master.passA = passA;
master.passB = passB;
master.stats = {
  harvested, run_dirs: runDirs.length,
  passA: passA.length, passB: passB.length,
  invalid_primary: flags.invalid_primary.length,
  invalid_secondary: flags.invalid_secondary.length,
  unknown_terms: flags.unknown_terms.length,
  primary_in_secondary: flags.primary_in_secondary.length,
};
master.flags = flags;
writeFileSync(OUT, JSON.stringify(master, null, 2));

console.log(`harvested ${harvested} mappings → ${OUT}`);
console.log(`pass A: ${passA.length}  pass B: ${passB.length}`);
console.log(`flags: invalid_primary=${flags.invalid_primary.length} invalid_secondary=${flags.invalid_secondary.length} unknown_terms=${flags.unknown_terms.length} primary_in_secondary=${flags.primary_in_secondary.length}`);
if (flags.invalid_primary.length) console.log('  invalid_primary sample:', flags.invalid_primary.slice(0, 5));
if (flags.unknown_terms.length) console.log('  unknown_terms sample:', flags.unknown_terms.slice(0, 5));
