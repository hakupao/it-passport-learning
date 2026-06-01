#!/usr/bin/env node
/**
 * Stage 3 (G3) — reconcile the two independent mapping passes (Rule D double-blind).
 *
 * Decision per question id (D-126):
 *   - primary AGREE (A.primary === B.primary)  → confirmed; mapping_status="agree".
 *   - primary DISAGREE                          → escalate (3rd pass / main-loop adjudication).
 *   secondary_topics = union(A,B) minus primary, ranked (both-pass first), capped at 2.
 *   terms            = union(A,B), validated against index term lists, deduped.
 *   confidence (agree): both high→high; any low→low; else medium.
 *
 * Usage: node scripts/stage03-reconcile.mjs <master.json> <out_reconcile.json>
 * Output: <out_reconcile.json> { stats, resolved:[{id,syllabus_refs}], escalate:[{id,A,B}] }
 *         prints agree% + escalation list.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const MASTER = process.argv[2];
const OUT = process.argv[3];
if (!MASTER || !OUT) { console.error('usage: node stage03-reconcile.mjs <master.json> <out_reconcile.json>'); process.exit(1); }
mkdirSync(dirname(OUT), { recursive: true });

const index = JSON.parse(readFileSync(`${ROOT}/data/ip/syllabus/_mapping_index.json`, 'utf8'));
const validIds = new Set(index.topics.map((t) => t.id));
const allTerms = new Set(index.topics.flatMap((t) => t.terms));

const master = JSON.parse(readFileSync(MASTER, 'utf8'));
const A = new Map((master.passA || []).map((m) => [m.id, m]));
const B = new Map((master.passB || []).map((m) => [m.id, m]));
const ids = [...new Set([...A.keys(), ...B.keys()])].sort();

const rankSecondary = (a, b, primary) => {
  const count = new Map();
  for (const s of (a.secondary_topics || [])) count.set(s, (count.get(s) || 0) + 1);
  for (const s of (b.secondary_topics || [])) count.set(s, (count.get(s) || 0) + 1);
  count.delete(primary);
  return [...count.entries()]
    .filter(([s]) => validIds.has(s))
    .sort((x, y) => y[1] - x[1])
    .map(([s]) => s)
    .slice(0, 2);
};
const unionTerms = (a, b) => {
  const out = [];
  for (const t of [...(a.terms || []), ...(b.terms || [])]) {
    if (allTerms.has(t) && !out.includes(t)) out.push(t);
  }
  return out;
};
const combineConf = (a, b) => {
  const c = [a.confidence, b.confidence];
  if (c.includes('low')) return 'low';
  if (c.every((x) => x === 'high')) return 'high';
  return 'medium';
};

const resolved = [], escalate = [], onlyOne = [];
for (const id of ids) {
  const a = A.get(id), b = B.get(id);
  if (!a || !b) { onlyOne.push({ id, has: a ? 'A' : 'B' }); continue; }
  if (a.primary_topic === b.primary_topic) {
    resolved.push({
      id,
      syllabus_refs: {
        primary_topic: a.primary_topic,
        secondary_topics: rankSecondary(a, b, a.primary_topic),
        terms: unionTerms(a, b),
        confidence: combineConf(a, b),
        mapping_status: 'agree',
      },
    });
  } else {
    escalate.push({
      id,
      A: { primary: a.primary_topic, secondary: a.secondary_topics, terms: a.terms, confidence: a.confidence },
      B: { primary: b.primary_topic, secondary: b.secondary_topics, terms: b.terms, confidence: b.confidence },
    });
  }
}

const total = ids.length;
const agree = resolved.length;
const stats = {
  total, agree, escalate: escalate.length, only_one_pass: onlyOne.length,
  agree_pct: total ? +(100 * agree / total).toFixed(1) : 0,
};
writeFileSync(OUT, JSON.stringify({ stats, resolved, escalate, onlyOne }, null, 2));

console.log(`reconcile: ${MASTER}`);
console.log(`  total=${total}  agree=${agree} (${stats.agree_pct}%)  escalate=${escalate.length}  only_one_pass=${onlyOne.length}`);
if (escalate.length) {
  console.log('  escalations (id: A.primary vs B.primary):');
  for (const e of escalate.slice(0, 40)) console.log(`    ${e.id}: ${e.A.primary}  vs  ${e.B.primary}`);
  if (escalate.length > 40) console.log(`    ... +${escalate.length - 40} more`);
}
if (onlyOne.length) console.log('  only-one-pass ids:', onlyOne.slice(0, 10).map((x) => `${x.id}(${x.has})`).join(', '));
