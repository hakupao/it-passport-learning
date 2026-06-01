#!/usr/bin/env node
/**
 * Stage 3 (G3) — build tie-break input for escalated mappings (D-126: disagreement → 3rd pass).
 *
 * Reads _reconcile.json (escalate[] + onlyOne[]) + question_bank + index, writes one input file
 * with each contested question's text + the candidate primaries (A and B, with names) so a 3rd
 * independent adjudicator can choose the best primary (or a different valid id if both are wrong).
 *
 * Usage: node scripts/stage03-build-tiebreak.mjs <reconcile.json> <out_tiebreak.json>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const REC = process.argv[2];
const OUT = process.argv[3];
if (!REC || !OUT) { console.error('usage: node stage03-build-tiebreak.mjs <reconcile.json> <out.json>'); process.exit(1); }
mkdirSync(dirname(OUT), { recursive: true });

const idx = JSON.parse(readFileSync(`${ROOT}/data/ip/syllabus/_mapping_index.json`, 'utf8'));
const tname = new Map(idx.topics.map((t) => [t.id, t.name_jp]));
const validIds = new Set(idx.topics.map((t) => t.id));
const qb = JSON.parse(readFileSync(`${ROOT}/data/ip/exams/question_bank.json`, 'utf8')).questions;
const qm = new Map(qb.map((q) => [q.id, q]));
const rec = JSON.parse(readFileSync(REC, 'utf8'));

const nm = (id) => `${id} (${tname.get(id) || '??INVALID??'})`;
const items = [];
for (const e of rec.escalate) {
  const q = qm.get(e.id);
  items.push({
    id: e.id, stem_jp: q.stem_jp, choices_jp: q.choices_jp, correct_answer: q.correct_answer,
    has_figure: !!q.has_figure, figure_description: q.figure_description || null,
    candidates: [
      { src: 'A', primary: nm(e.A.primary), valid: validIds.has(e.A.primary), terms: e.A.terms || [] },
      { src: 'B', primary: nm(e.B.primary), valid: validIds.has(e.B.primary), terms: e.B.terms || [] },
    ],
  });
}
// only-one-pass: single candidate; adjudicator confirms or corrects
const master = JSON.parse(readFileSync(REC.replace('_reconcile.json', '_master.json'), 'utf8'));
const aById = new Map((master.passA || []).map((m) => [m.id, m]));
const bById = new Map((master.passB || []).map((m) => [m.id, m]));
for (const o of rec.onlyOne || []) {
  const q = qm.get(o.id);
  const m = (o.has === 'A' ? aById : bById).get(o.id);
  items.push({
    id: o.id, stem_jp: q.stem_jp, choices_jp: q.choices_jp, correct_answer: q.correct_answer,
    has_figure: !!q.has_figure, figure_description: q.figure_description || null,
    candidates: [{ src: o.has, primary: nm(m.primary_topic), valid: validIds.has(m.primary_topic), terms: m.terms || [] }],
  });
}

writeFileSync(OUT, JSON.stringify({ n: items.length, items }, null, 2));
console.log(`tiebreak input: ${items.length} items → ${OUT}`);
console.log(`  escalate=${rec.escalate.length} + onlyOne=${(rec.onlyOne || []).length}`);
