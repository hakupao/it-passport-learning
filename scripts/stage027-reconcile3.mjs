#!/usr/bin/env node
/**
 * Stage 2.7 — 3-way majority reconcile for the escalate set (blind + verify + third independent reads).
 *
 * For each escalate question and each field (stem, choices), among the 3 independent Opus reads:
 *   - count how many REJECT stored (sim_to_stored < STORED_OK).
 *   - if ≥2 reject AND ≥2 of the reads agree with EACH OTHER (sim ≥ AGREE) → CONFIRMED defect;
 *       authoritative = that agreeing consensus text.
 *   - if ≤1 rejects → stored is fine (majority matches print) → field ok.
 *   - if ≥2 reject but no 2 reads agree → AMBIGUOUS (text uncertain) → leave flagged.
 *
 * Appends new confirmed fixes into _manual.json (dedup by id; hand fixes there take precedence).
 * Writes _still_ambiguous.json for the unresolved tail.
 *
 * Usage: node scripts/stage027-reconcile3.mjs <third_run_dir> [<third_run_dir> ...]
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const REPAIR = `${EXAMS}/.tmp/s027/repair`;
const AGREE = 0.62, STORED_OK = 0.82;

const runDirs = process.argv.slice(2);
if (!runDirs.length) { console.error('usage: node stage027-reconcile3.mjs <third_run_dir> [...]'); process.exit(1); }

const STRIP = /[\s　，、。．,.・「」『』“”"'（）()［］\[\]｛｝{}：:；;！!？?ー―─\-_=＝　]/g;
const norm = (s) => (s || '').normalize('NFKC').replace(STRIP, '').toLowerCase();
function bg(s) { const g = new Set(); if (s.length < 2) { if (s) g.add(s); return g; } for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); return g; }
function sim(a, b) { const na = norm(a), nb = norm(b); if (!na && !nb) return 1; if (!na || !nb) return 0; if (na === nb) return 1; const A = bg(na), B = bg(nb); let x = 0; for (const g of A) if (B.has(g)) x++; return x / (A.size + B.size - x); }
const chSim = (a, b) => Math.min(...['ア', 'イ', 'ウ', 'エ'].map((l) => sim((a || {})[l] || '', (b || {})[l] || '')));

const Q = new Map(JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8')).questions.map((q) => [q.id, q]));
const blind = JSON.parse(readFileSync(`${EXAMS}/.tmp/s027/blind/_blind_master.json`, 'utf8')).tx;
const verify = JSON.parse(readFileSync(`${REPAIR}/_verify_master.json`, 'utf8'));
const recon = JSON.parse(readFileSync(`${REPAIR}/_reconcile.json`, 'utf8'));
const escalateIds = recon.escalate.map((e) => e.id);

// harvest 3rd reads
const third = {};
for (const dir of runDirs) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal ${jp}`); continue; }
  for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    if (o.type === 'result' && o.result && o.result.id) third[o.result.id] = o.result;
  }
}

// for a field: reads = [{text, found}], stored. returns {verdict:'ok'|'defect'|'ambiguous', text}
function resolveField(reads, storedText, simFn) {
  const present = reads.filter((r) => r.found && r.text);
  if (present.length < 2) return { verdict: 'ambiguous', text: null }; // not enough reads
  const rejects = present.filter((r) => simFn(r.text, storedText) < STORED_OK);
  if (rejects.length < 2) return { verdict: 'ok', text: null }; // majority matches stored
  // ≥2 reject stored: find a pair among rejecters that agree
  let best = null;
  for (let i = 0; i < rejects.length; i++) for (let j = i + 1; j < rejects.length; j++) {
    const s = simFn(rejects[i].text, rejects[j].text);
    if (!best || s > best.s) best = { s, a: rejects[i], b: rejects[j] };
  }
  if (best && best.s >= AGREE) {
    // consensus text: prefer the 'verify' or 'third' read in the agreeing pair (careful reads)
    const pick = [best.a, best.b].find((r) => r.src === 'verify') || [best.a, best.b].find((r) => r.src === 'third') || best.a;
    return { verdict: 'defect', text: pick.text };
  }
  return { verdict: 'ambiguous', text: null };
}

const newFixes = [], ambiguous = [];
for (const id of escalateIds) {
  const q = Q.get(id); if (!q) continue;
  const b = blind[id], v = verify[id], t = third[id];
  const stemReads = [
    { src: 'blind', found: b && b.found_on_page, text: b && b.printed_stem },
    { src: 'verify', found: v && v.found_on_page, text: v && v.printed_stem },
    { src: 'third', found: t && t.found_on_page, text: t && t.printed_stem },
  ];
  const chReads = [
    { src: 'blind', found: b && b.found_on_page, text: b && b.printed_choices },
    { src: 'verify', found: v && v.found_on_page, text: v && v.printed_choices },
    { src: 'third', found: t && t.found_on_page, text: t && t.printed_choices },
  ];
  const stemR = resolveField(stemReads, q.stem_jp, sim);
  const chR = resolveField(chReads, q.choices_jp, chSim);

  if (stemR.verdict === 'defect' || chR.verdict === 'defect') {
    const fix = { id, refixed: false, severity: 'escalate_resolved', fix_stem: stemR.verdict === 'defect', fix_choices: chR.verdict === 'defect' };
    if (fix.fix_stem) fix.authoritative_stem = stemR.text;
    if (fix.fix_choices) fix.authoritative_choices = chR.text;
    // if one field is ambiguous but the other is a defect, only fix the confirmed field
    newFixes.push(fix);
    if (stemR.verdict === 'ambiguous' || chR.verdict === 'ambiguous') fix.partial_ambiguous = true;
  } else if (stemR.verdict === 'ambiguous' || chR.verdict === 'ambiguous') {
    ambiguous.push({ id, stem: stemR.verdict, choices: chR.verdict });
  }
  // else both ok → false positive (stored fine), no action
}

// merge into _manual.json (hand fixes take precedence — don't overwrite an existing id)
let manual = existsSync(`${REPAIR}/_manual.json`) ? JSON.parse(readFileSync(`${REPAIR}/_manual.json`, 'utf8')) : [];
const have = new Set(manual.map((m) => m.id));
let added = 0;
for (const f of newFixes) if (!have.has(f.id)) { manual.push(f); have.add(f.id); added++; }
writeFileSync(`${REPAIR}/_manual.json`, JSON.stringify(manual, null, 2));
writeFileSync(`${REPAIR}/_still_ambiguous.json`, JSON.stringify(ambiguous, null, 2));

console.log(`3rd reads harvested: ${Object.keys(third).length}`);
console.log(`escalate ${escalateIds.length} → newly confirmed (3-way majority): ${newFixes.length} (added ${added} to _manual) | still ambiguous: ${ambiguous.length} | false-positive(stored ok): ${escalateIds.length - newFixes.length - ambiguous.length}`);
const f = { stem: newFixes.filter((x) => x.fix_stem).length, choices: newFixes.filter((x) => x.fix_choices).length };
console.log(`newly confirmed fields: stem ${f.stem}, choices ${f.choices}`);
console.log(`_manual.json now has ${manual.length} fixes total`);
