#!/usr/bin/env node
/**
 * Stage 3 (G3) — harvest Rule A audit verdicts from the audit workflow journal + write evidence.
 *
 * Reads <run_dir>/journal.jsonl ({type:'result', result:{verdicts:[...]}}), joins each verdict
 * back to the audit input (question + proposed mapping), computes correct/acceptable/wrong counts,
 * and writes a markdown evidence file.
 *
 * Usage: node scripts/stage03-audit-harvest.mjs <audit_input.json> <evidence_out.md> <run_dir> [<run_dir>...]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const AUDIT = process.argv[2];
const OUT = process.argv[3];
const runDirs = process.argv.slice(4);
if (!AUDIT || !OUT || !runDirs.length) { console.error('usage: node stage03-audit-harvest.mjs <audit_input.json> <out.md> <run_dir> [...]'); process.exit(1); }
mkdirSync(dirname(OUT), { recursive: true });

const input = JSON.parse(readFileSync(AUDIT, 'utf8'));
const itemById = new Map(input.items.map((it) => [it.id, it]));

const verdicts = new Map(); // id -> verdict (last write wins)
for (const dir of runDirs) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal at ${jp}`); continue; }
  for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    const r = o && o.type === 'result' ? o.result : null;
    if (!r || !Array.isArray(r.verdicts)) continue;
    for (const v of r.verdicts) if (v && v.id) verdicts.set(v.id, v);
  }
}

const all = [...verdicts.values()];
const c = { correct: 0, acceptable: 0, wrong: 0 };
const tv = { ok: 0, partial: 0, bad: 0, na: 0 };
for (const v of all) { c[v.primary_verdict] = (c[v.primary_verdict] || 0) + 1; tv[v.terms_verdict] = (tv[v.terms_verdict] || 0) + 1; }
const n = all.length;
const passRate = n ? +(100 * (c.correct + c.acceptable) / n).toFixed(1) : 0;

const lines = [];
lines.push('# Stage 3 — Rule A 映射監査 (code-reviewer, 第3 subagent_type, Rule D)');
lines.push('');
lines.push(`- 監査数: **${n}**`);
lines.push(`- primary: correct=${c.correct} / acceptable=${c.acceptable} / **wrong=${c.wrong}**  → 妥当率(correct+acceptable) **${passRate}%**`);
lines.push(`- terms: ok=${tv.ok} / partial=${tv.partial} / bad=${tv.bad} / na=${tv.na}`);
lines.push('');
lines.push('| id | primary_verdict | proposed | suggested | terms | notes |');
lines.push('|---|---|---|---|---|---|');
for (const v of all.sort((a, b) => a.id.localeCompare(b.id))) {
  const it = itemById.get(v.id) || {};
  const p = it.proposed || {};
  lines.push(`| ${v.id} | ${v.primary_verdict} | ${p.primary_topic || '?'} | ${v.suggested_primary || ''} | ${v.terms_verdict} | ${(v.notes || '').replace(/\|/g, '/')} |`);
}
const wrongs = all.filter((v) => v.primary_verdict === 'wrong');
if (wrongs.length) {
  lines.push('\n## ⚠ wrong 判定（要修正）');
  for (const v of wrongs) lines.push(`- ${v.id}: proposed ${itemById.get(v.id)?.proposed?.primary_topic} → suggested ${v.suggested_primary || '?'} — ${v.notes}`);
}
writeFileSync(OUT, lines.join('\n') + '\n');
console.log(`audit harvest: n=${n}  correct=${c.correct} acceptable=${c.acceptable} wrong=${c.wrong}  pass=${passRate}%`);
console.log(`terms: ok=${tv.ok} partial=${tv.partial} bad=${tv.bad} na=${tv.na}`);
if (wrongs.length) console.log('WRONG:', wrongs.map((v) => `${v.id}->${v.suggested_primary}`).join(', '));
console.log(`evidence: ${OUT}`);
