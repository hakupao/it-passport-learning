#!/usr/bin/env node
/**
 * Stage 3 (G3) — apply final syllabus_refs into question_bank.json + regenerate by_year/*.
 *
 * Replaces each question's empty `syllabus_refs: []` with the resolved object:
 *   { primary_topic, secondary_topics[], terms[], confidence, mapping_status }
 *
 * Hard guarantees (abort on any violation):
 *   - INVARIANTS unchanged for every question: stem_jp, choices_jp, correct_answer,
 *     has_figure, figure_description, figure_path, figure_bbox_pct, figure_type, group_id, source.
 *   - VALIDITY: every primary_topic ∈ 63 ids; every secondary ∈ ids and ≠ primary; terms ⊆ index terms.
 *   - COMPLETENESS: all 2900 questions present in the refs (no question left with []).
 *   - answer_keys.json is NOT touched.
 *
 * Backup: question_bank.json → question_bank.json.pre-s03 (only if absent).
 *
 * Usage:
 *   node scripts/stage03-apply.mjs <final.json> [--dry]
 *     final.json = {refs:{<id>:syllabus_refs}}  OR  {resolved:[{id,syllabus_refs}], escalate?:[...]}
 *   --dry : validate + report, do NOT write.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const QB = `${EXAMS}/question_bank.json`;
const BACKUP = `${EXAMS}/question_bank.json.pre-s03`;
const BYYEAR = `${EXAMS}/by_year`;

const finalArg = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!finalArg) { console.error('usage: node stage03-apply.mjs <final.json> [--dry]'); process.exit(1); }

const index = JSON.parse(readFileSync(`${ROOT}/data/ip/syllabus/_mapping_index.json`, 'utf8'));
const validIds = new Set(index.topics.map((t) => t.id));
const allTerms = new Set(index.topics.flatMap((t) => t.terms));

// build refs map {id: syllabus_refs}
const fj = JSON.parse(readFileSync(finalArg, 'utf8'));
const refs = new Map();
if (fj.refs) for (const [id, sr] of Object.entries(fj.refs)) refs.set(id, sr);
if (fj.resolved) for (const r of fj.resolved) refs.set(r.id, r.syllabus_refs);

const bank = JSON.parse(readFileSync(QB, 'utf8'));
const INVARIANTS = ['stem_jp', 'choices_jp', 'correct_answer', 'has_figure', 'figure_description', 'figure_path', 'figure_bbox_pct', 'figure_type', 'group_id', 'source'];

const errors = [];
const missing = [];
const statusCount = {};
const confCount = {};

for (const q of bank.questions) {
  const sr = refs.get(q.id);
  if (!sr) { missing.push(q.id); continue; }
  // validity
  if (!validIds.has(sr.primary_topic)) errors.push(`${q.id}: invalid primary_topic ${sr.primary_topic}`);
  for (const s of sr.secondary_topics || []) {
    if (!validIds.has(s)) errors.push(`${q.id}: invalid secondary ${s}`);
    if (s === sr.primary_topic) errors.push(`${q.id}: secondary repeats primary`);
  }
  for (const t of sr.terms || []) if (!allTerms.has(t)) errors.push(`${q.id}: unknown term "${t}"`);
  if (!['high', 'medium', 'low'].includes(sr.confidence)) errors.push(`${q.id}: bad confidence ${sr.confidence}`);
  if (!['agree', 'reconciled', 'escalated'].includes(sr.mapping_status)) errors.push(`${q.id}: bad mapping_status ${sr.mapping_status}`);
  statusCount[sr.mapping_status] = (statusCount[sr.mapping_status] || 0) + 1;
  confCount[sr.confidence] = (confCount[sr.confidence] || 0) + 1;
}
if (missing.length) errors.push(`COMPLETENESS: ${missing.length} questions missing from refs (e.g. ${missing.slice(0, 8).join(', ')})`);

if (errors.length) {
  console.error(`ABORT — ${errors.length} validation errors:`);
  for (const e of errors.slice(0, 40)) console.error('  ' + e);
  if (errors.length > 40) console.error(`  ... +${errors.length - 40} more`);
  process.exit(1);
}

// snapshot invariants before
const before = new Map(bank.questions.map((q) => [q.id, JSON.stringify(Object.fromEntries(INVARIANTS.map((k) => [k, q[k]])))]));

// apply
for (const q of bank.questions) {
  q.syllabus_refs = refs.get(q.id);
}

// verify invariants unchanged
let invViolations = 0;
for (const q of bank.questions) {
  const now = JSON.stringify(Object.fromEntries(INVARIANTS.map((k) => [k, q[k]])));
  if (now !== before.get(q.id)) { invViolations++; if (invViolations <= 5) console.error(`INVARIANT CHANGED: ${q.id}`); }
}
if (invViolations) { console.error(`ABORT — ${invViolations} invariant violations`); process.exit(1); }

console.log(`validation OK: 2900/2900 mapped, 0 invariant changes`);
console.log(`  mapping_status: ${JSON.stringify(statusCount)}`);
console.log(`  confidence: ${JSON.stringify(confCount)}`);

if (DRY) { console.log('--dry: not writing.'); process.exit(0); }

// backup once
if (!existsSync(BACKUP)) { writeFileSync(BACKUP, readFileSync(QB)); console.log(`backup → ${BACKUP}`); }
else console.log(`backup exists (kept): ${BACKUP}`);

writeFileSync(QB, JSON.stringify(bank, null, 2));
console.log(`wrote ${QB}`);

// update by_year/*.json IN PLACE — preserve each file's existing schema
// (exam_id / year_label / fiscal_year / question_count / ...), only fill syllabus_refs per question.
let yearFiles = 0, yearQs = 0;
for (const fname of readdirSync(BYYEAR).filter((f) => f.endsWith('.json'))) {
  const path = `${BYYEAR}/${fname}`;
  const doc = JSON.parse(readFileSync(path, 'utf8'));
  const qs = doc.questions || [];
  for (const q of qs) { const sr = refs.get(q.id); if (sr) { q.syllabus_refs = sr; yearQs++; } }
  writeFileSync(path, JSON.stringify(doc, null, 2));
  yearFiles++;
}
console.log(`updated by_year in place: ${yearFiles} files, ${yearQs} questions filled`);
