#!/usr/bin/env node
/**
 * Stage 2.7 — reconcile candidates using DOUBLE-BLIND agreement (Rule D adversarial).
 *
 * Inputs (all keyed by question id):
 *   - stored:  question_bank.json (current data)
 *   - blind:   .tmp/s027/blind/_blind_master.json (1st independent Opus transcription, explore)
 *   - verify:  harvested from verify workflow run dir(s) journal (2nd independent Opus, code-reviewer)
 *   - cands:   .tmp/s027/blind/_candidates.json (the diff-flagged set)
 *
 * Decision per field (stem; choices as a unit):
 *   - CONFIRMED defect : verify≈blind (≥AGREE) AND verify≉stored (<STORED_OK) → authoritative = verify text.
 *   - FALSE POSITIVE   : verify≈stored (≥STORED_OK) → stored is fine; the 1st blind erred. (no change)
 *   - ESCALATE         : verify≉blind AND verify≉stored (3-way disagreement) OR verify not_found → main-loop adjudication.
 *
 * Usage: node scripts/stage027-reconcile.mjs <verify_run_dir> [<verify_run_dir> ...]
 * Output: .tmp/s027/repair/_reconcile.json  { confirmed[], false_positive[], escalate[] }
 *         prints summary + known-case check.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const REPAIR = `${EXAMS}/.tmp/s027/repair`;
mkdirSync(REPAIR, { recursive: true });

// verify vs blind ≥ AGREE ⇒ the two INDEPENDENT reads corroborate each other (same question, minor
// wording diffs). 0.62 (not 0.85): free-form JP re-transcriptions of the SAME printed text routinely
// differ in punctuation/whitespace/kana, so 0.85 spuriously escalated genuine double-reject defects.
// Safety: confirming still requires BOTH reads to reject stored (vs<STORED_OK); two independent reads
// agreeing (≥0.62) on text that rejects stored ⇒ stored really is wrong (a clean stored would have
// matched the 1st blind, so verify error alone can't reach vb≥0.62 + vs<0.82).
const AGREE = 0.62;
const STORED_OK = 0.82; // verify vs stored ≥ this ⇒ stored already matches the page (field is fine)

const runDirs = process.argv.slice(2); // empty ⇒ use _verify_master.json (the accumulated self-healing master)

// ── similarity (same normalization as blind-diff) ──────────────────────────────
const STRIP = /[\s　，、。．,.・「」『』“”"'（）()［］\[\]｛｝{}：:；;！!？?ー―─\-_=＝　]/g;
const norm = (s) => (s || '').normalize('NFKC').replace(STRIP, '').toLowerCase();
function bigrams(s) { const g = new Set(); if (s.length < 2) { if (s) g.add(s); return g; } for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); return g; }
function sim(a, b) { const na = norm(a), nb = norm(b); if (!na && !nb) return 1; if (!na || !nb) return 0; if (na === nb) return 1; const A = bigrams(na), B = bigrams(nb); let x = 0; for (const g of A) if (B.has(g)) x++; return x / (A.size + B.size - x); }
const choicesSim = (a, b) => ['ア', 'イ', 'ウ', 'エ'].map((l) => sim((a || {})[l] || '', (b || {})[l] || ''));
const minChoice = (a, b) => Math.min(...choicesSim(a, b));

// ── load ───────────────────────────────────────────────────────────────────
const Q = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8')).questions;
const stored = new Map(Q.map((q) => [q.id, q]));
const blind = JSON.parse(readFileSync(`${EXAMS}/.tmp/s027/blind/_blind_master.json`, 'utf8')).tx;
const cands = JSON.parse(readFileSync(`${EXAMS}/.tmp/s027/blind/_candidates.json`, 'utf8')).candidates;

// verify transcriptions: prefer the accumulated master (self-heals across runs), else harvest run dirs.
// Usage: node stage027-reconcile.mjs            ← uses _verify_master.json
//        node stage027-reconcile.mjs <run_dir>  ← harvest specific run dirs
let verify = {};
let vHarvested = 0;
const VMASTER = `${REPAIR}/_verify_master.json`;
if (!runDirs.length && existsSync(VMASTER)) {
  verify = JSON.parse(readFileSync(VMASTER, 'utf8'));
  vHarvested = Object.keys(verify).length;
} else {
  for (const dir of runDirs) {
    const jp = `${dir}/journal.jsonl`;
    if (!existsSync(jp)) { console.error(`! no journal at ${jp}`); continue; }
    for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
      let o; try { o = JSON.parse(ln); } catch { continue; }
      if (o.type !== 'result' || !o.result || !o.result.id) continue;
      verify[o.result.id] = o.result; vHarvested++;
    }
  }
}

// ── reconcile ────────────────────────────────────────────────────────────────
const confirmed = [], falsePositive = [], escalate = [];
for (const c of cands) {
  const id = c.id;
  const q = stored.get(id);
  const b = blind[id];
  const v = verify[id];
  if (!q) continue;
  if (!v) { escalate.push({ id, exam: c.exam, why: 'no_verify_result', stored_stem: q.stem_jp, blind_stem: b && b.printed_stem, stored_choices: q.choices_jp, blind_choices: b && b.printed_choices }); continue; }
  if (!v.found_on_page) { escalate.push({ id, exam: c.exam, why: 'verify_not_found_on_page', stored_stem: q.stem_jp, verify_legib: v.legibility }); continue; }

  // STEM
  const vbStem = b ? sim(v.printed_stem, b.printed_stem) : 0;
  const vsStem = sim(v.printed_stem, q.stem_jp);
  let stemVerdict;
  if (vsStem >= STORED_OK) stemVerdict = 'ok';
  else if (vbStem >= AGREE && vsStem < STORED_OK) stemVerdict = 'defect';
  else stemVerdict = 'escalate';

  // CHOICES (as a unit; min across the four)
  const vbCh = b ? minChoice(v.printed_choices, b.printed_choices) : 0;
  const vsCh = minChoice(v.printed_choices, q.choices_jp);
  let choiceVerdict;
  if (vsCh >= STORED_OK) choiceVerdict = 'ok';
  else if (vbCh >= AGREE && vsCh < STORED_OK) choiceVerdict = 'defect';
  else choiceVerdict = 'escalate';

  const rec = {
    id, exam: c.exam,
    stem: { verdict: stemVerdict, vb: +vbStem.toFixed(3), vs: +vsStem.toFixed(3) },
    choices: { verdict: choiceVerdict, vb: +vbCh.toFixed(3), vs: +vsCh.toFixed(3) },
    authoritative_stem: v.printed_stem,
    authoritative_choices: v.printed_choices,
    verify_legibility: v.legibility,
    stored_stem: q.stem_jp, stored_choices: q.choices_jp,
    blind_stem: b ? b.printed_stem : null, blind_choices: b ? b.printed_choices : null,
  };

  if (stemVerdict === 'escalate' || choiceVerdict === 'escalate') {
    escalate.push({ ...rec, why: '3way_disagreement' });
  } else if (stemVerdict === 'defect' || choiceVerdict === 'defect') {
    rec.fix_stem = stemVerdict === 'defect';
    rec.fix_choices = choiceVerdict === 'defect';
    // severity: very-low stored sim ⇒ content_mismatch-class; moderate ⇒ garble-class
    const minStoredSim = Math.min(rec.fix_stem ? vsStem : 1, rec.fix_choices ? vsCh : 1);
    rec.severity = minStoredSim < 0.4 ? 'content_mismatch' : 'ocr_garble_critical';
    confirmed.push(rec);
  } else {
    falsePositive.push({ id, exam: c.exam, vs_stem: +vsStem.toFixed(3), vs_choices: +vsCh.toFixed(3) });
  }
}

writeFileSync(`${REPAIR}/_reconcile.json`, JSON.stringify({
  params: { AGREE, STORED_OK }, verify_harvested: vHarvested,
  counts: { candidates: cands.length, confirmed: confirmed.length, false_positive: falsePositive.length, escalate: escalate.length },
  confirmed, false_positive: falsePositive, escalate,
}, null, 2));

console.log(`verify harvested: ${vHarvested}`);
console.log(`candidates ${cands.length} → confirmed ${confirmed.length} | false_positive ${falsePositive.length} | escalate ${escalate.length}`);
const sev = {}; for (const c of confirmed) sev[c.severity] = (sev[c.severity] || 0) + 1;
console.log('confirmed severity:', JSON.stringify(sev));
const fld = { stem: confirmed.filter((c) => c.fix_stem).length, choices: confirmed.filter((c) => c.fix_choices).length };
console.log('confirmed fields:', JSON.stringify(fld));
console.log('\nknown-case check:');
for (const id of ['2015h27h-q010', '2015h27h-q011', '2015h27h-q014', '2015h27h-q085', '2015h27h-q086']) {
  const inC = confirmed.find((x) => x.id === id), inE = escalate.find((x) => x.id === id), inF = falsePositive.find((x) => x.id === id);
  console.log(`  ${id}: ${inC ? 'CONFIRMED(' + inC.severity + ' stem=' + inC.fix_stem + ' choices=' + inC.fix_choices + ')' : inE ? 'ESCALATE(' + inE.why + ')' : inF ? 'false_positive' : 'NOT IN CANDIDATES'}`);
}
