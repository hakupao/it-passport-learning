#!/usr/bin/env node
/**
 * Stage 3 (G3) — build a stratified Rule A audit-input file from resolved mappings.
 *
 * Selects N questions stratified across the 3 categories (proportional, deterministic by id sort),
 * and writes each with its question text + the PROPOSED mapping (primary id+name, secondary, terms)
 * so an independent auditor (code-reviewer, 3rd subagent_type, Rule D) can judge correctness.
 *
 * Usage: node scripts/stage03-build-audit.mjs <reconcile_or_refs.json> <out_audit.json> [N=20]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const SRC = process.argv[2];
const OUT = process.argv[3];
const N = parseInt(process.argv[4] || '20', 10);
if (!SRC || !OUT) { console.error('usage: node stage03-build-audit.mjs <src.json> <out.json> [N]'); process.exit(1); }
mkdirSync(dirname(OUT), { recursive: true });

const idx = JSON.parse(readFileSync(`${ROOT}/data/ip/syllabus/_mapping_index.json`, 'utf8'));
const tname = new Map(idx.topics.map((t) => [t.id, t.name_jp]));
const tcat = new Map(idx.topics.map((t) => [t.id, t.category]));
const qb = JSON.parse(readFileSync(`${ROOT}/data/ip/exams/question_bank.json`, 'utf8')).questions;
const qm = new Map(qb.map((q) => [q.id, q]));

const sj = JSON.parse(readFileSync(SRC, 'utf8'));
const resolved = (sj.refs && !Array.isArray(sj.refs))
  ? Object.entries(sj.refs).map(([id, sr]) => ({ id, sr }))
  : (sj.resolved || sj).map((r) => ({ id: r.id, sr: r.syllabus_refs }));

// stratify by category of primary_topic, proportional, deterministic (sort by id)
const byCat = { strategy: [], management: [], technology: [] };
for (const r of resolved) { const c = tcat.get(r.sr.primary_topic) || 'technology'; byCat[c].push(r); }
for (const c of Object.keys(byCat)) byCat[c].sort((a, b) => a.id.localeCompare(b.id));
const total = resolved.length;
const pick = [];
for (const c of Object.keys(byCat)) {
  const want = Math.max(1, Math.round(N * byCat[c].length / total));
  const step = Math.max(1, Math.floor(byCat[c].length / want));
  for (let i = 0, taken = 0; i < byCat[c].length && taken < want; i += step, taken++) pick.push(byCat[c][i]);
}
const items = pick.slice(0, N).map((r) => {
  const q = qm.get(r.id);
  return {
    id: r.id,
    stem_jp: q.stem_jp,
    choices_jp: q.choices_jp,
    correct_answer: q.correct_answer,
    has_figure: !!q.has_figure,
    figure_description: q.figure_description || null,
    proposed: {
      primary_topic: r.sr.primary_topic,
      primary_name: tname.get(r.sr.primary_topic),
      secondary_topics: (r.sr.secondary_topics || []).map((s) => `${s} (${tname.get(s)})`),
      terms: r.sr.terms || [],
    },
  };
});

writeFileSync(OUT, JSON.stringify({ n: items.length, items }, null, 2));
console.log(`audit input: ${items.length} items → ${OUT}`);
const dist = {}; for (const it of items) { const c = tcat.get(it.proposed.primary_topic); dist[c] = (dist[c] || 0) + 1; }
console.log('  category distribution:', JSON.stringify(dist));
