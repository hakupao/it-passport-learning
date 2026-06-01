#!/usr/bin/env node
/**
 * Stage 3 (G3) — coverage analysis (D-126 step 4).
 *
 * Given the final per-question syllabus_refs (from reconcile resolved + adjudicated escalations,
 * or directly from the enriched question_bank), count how many questions map to each of the 63
 * 小分類 (by primary_topic) and report 0-question gap nodes.
 *
 * Usage:
 *   node scripts/stage03-coverage.mjs <refs.json>     where refs.json = {resolved:[{id,syllabus_refs}],...}
 *   node scripts/stage03-coverage.mjs --bank          read enriched question_bank.json directly
 * Output: prints per-category coverage + gap list; writes evidence/phase5/stage_03_coverage.md
 */
import { readFileSync, writeFileSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const index = JSON.parse(readFileSync(`${ROOT}/data/ip/syllabus/_mapping_index.json`, 'utf8'));
const topics = index.topics;
const nameById = new Map(topics.map((t) => [t.id, t]));

const arg = process.argv[2];
let refs = []; // [{id, syllabus_refs}]
if (arg === '--bank') {
  const bank = JSON.parse(readFileSync(`${ROOT}/data/ip/exams/question_bank.json`, 'utf8'));
  refs = bank.questions.filter((q) => q.syllabus_refs && q.syllabus_refs.primary_topic)
    .map((q) => ({ id: q.id, syllabus_refs: q.syllabus_refs }));
} else if (arg) {
  const j = JSON.parse(readFileSync(arg, 'utf8'));
  if (j.refs && !Array.isArray(j.refs)) refs = Object.entries(j.refs).map(([id, sr]) => ({ id, syllabus_refs: sr }));
  else refs = (j.resolved || j).map((r) => ({ id: r.id, syllabus_refs: r.syllabus_refs }));
} else {
  console.error('usage: node stage03-coverage.mjs <refs.json|--bank>'); process.exit(1);
}

const primaryCount = new Map(topics.map((t) => [t.id, 0]));
const secondaryCount = new Map(topics.map((t) => [t.id, 0]));
for (const r of refs) {
  const sr = r.syllabus_refs;
  if (sr.primary_topic && primaryCount.has(sr.primary_topic)) primaryCount.set(sr.primary_topic, primaryCount.get(sr.primary_topic) + 1);
  for (const s of sr.secondary_topics || []) if (secondaryCount.has(s)) secondaryCount.set(s, secondaryCount.get(s) + 1);
}

const gaps = topics.filter((t) => primaryCount.get(t.id) === 0);
const lines = [];
lines.push(`# Stage 3 Coverage 分析`);
lines.push('');
lines.push(`- mapped questions: **${refs.length}** / 2900`);
lines.push(`- 63 小分類中、primary で 0 題の gap node: **${gaps.length}**`);
lines.push('');
lines.push('## カテゴリ別 primary 分布');
for (const cat of ['strategy', 'management', 'technology']) {
  const ts = topics.filter((t) => t.category === cat);
  const sum = ts.reduce((n, t) => n + primaryCount.get(t.id), 0);
  lines.push(`\n### ${cat} (${ts.length} topics, ${sum} questions)`);
  lines.push('| topic id | 小分類 | primary | secondary |');
  lines.push('|---|---|---:|---:|');
  for (const t of ts) lines.push(`| ${t.id} | ${t.name_jp} | ${primaryCount.get(t.id)} | ${secondaryCount.get(t.id)} |`);
}
if (gaps.length) {
  lines.push('\n## ⚠ gap nodes (primary 0 題)');
  for (const g of gaps) lines.push(`- ${g.id} — ${g.name_jp} (${g.category})`);
}

const out = `${ROOT}/evidence/phase5/stage_03_coverage.md`;
writeFileSync(out, lines.join('\n') + '\n');
console.log(`mapped=${refs.length}  gap_nodes=${gaps.length}/63`);
for (const cat of ['strategy', 'management', 'technology']) {
  const ts = topics.filter((t) => t.category === cat);
  const sum = ts.reduce((n, t) => n + primaryCount.get(t.id), 0);
  console.log(`  ${cat}: ${sum} questions across ${ts.length} topics`);
}
if (gaps.length) console.log('  gaps:', gaps.map((g) => g.id).join(', '));
console.log(`evidence: ${out}`);
