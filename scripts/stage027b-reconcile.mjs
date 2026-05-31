#!/usr/bin/env node
/**
 * Stage 2.7b — harvest the double-blind hi-dpi reads (lanes A=explore, B=code-reviewer) from the
 * workflow journal and reconcile them against stored, deciding a disposition per question.
 *
 * Both lanes are INDEPENDENT blind reads of the SAME hi-dpi page bands (N + N+1), never shown stored
 * text → echo-proof. A low blind↔blind distance therefore corroborates a reading; agreement that also
 * rejects stored is a genuine defect (not an echo artifact). Same NFKC + char-bigram-Jaccard similarity
 * and thresholds as Stage 2.7 (AGREE=0.62, STORED_OK=0.82) for continuity.
 *
 * Dispositions:
 *   - confirmed         : A≈B AND authoritative≉stored (or stored field empty) → repair stem/choices.
 *   - regression_restore: stored choices EMPTY (s027 over-deleted) and we can't confirm via A≈B, but a
 *                         *_corrupted_backup exists → restore the backup (strictly better than empty).
 *   - figure_inherent   : both lanes say the four options are GRAPHS/IMAGES (choices_are_images) → the
 *                         stored text is a description, not transcribable text. Reclassify, DON'T rewrite.
 *   - cleared           : both lanes agree WITH stored (stored already faithful) → false-positive flag.
 *   - still_unresolved  : lanes disagree / not found / category conflict → keep flagged for a later pass.
 *
 * Usage: node scripts/stage027b-reconcile.mjs <wf_run_dir> [<wf_run_dir> ...]
 *        (run dir = .../subagents/workflows/wf_xxx ; reads its journal.jsonl)
 * Output: data/ip/exams/.tmp/s027b/_reconcile_b.json  + a printed summary.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const OUT = `${EXAMS}/.tmp/s027b`;
mkdirSync(OUT, { recursive: true });
const RMASTER = `${OUT}/_reads_master.json`; // accumulates reads across runs (self-heal)

const AGREE = 0.62;      // A↔B ≥ this ⇒ the two independent reads corroborate
const STORED_OK = 0.82;  // read↔stored ≥ this ⇒ stored already faithful

const STRIP = /[\s　，、。．,.・「」『』“”"'（）()［］\[\]｛｝{}：:；;！!？?ー―─\-_=＝　]/g;
const norm = (s) => (s || '').normalize('NFKC').replace(STRIP, '').toLowerCase();
function bigrams(s) { const g = new Set(); if (s.length < 2) { if (s) g.add(s); return g; } for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); return g; }
function sim(a, b) { const na = norm(a), nb = norm(b); if (!na && !nb) return 1; if (!na || !nb) return 0; if (na === nb) return 1; const A = bigrams(na), B = bigrams(nb); let x = 0; for (const g of A) if (B.has(g)) x++; return x / (A.size + B.size - x); }
const LBL = ['ア', 'イ', 'ウ', 'エ'];

// The question_bank convention (verified on 2,532 clean stems): stem_jp carries NEITHER a "問NN" number
// NOR a 〔category〕 header, and figures live in figure_description — NOT inline in the stem. The blind
// agents transcribe everything they see (header, number, and an inline [図]/[表] block), so before any
// comparison or storage we strip those to the bank's convention. This prevents spurious "fixes" that only
// add a prefix, and keeps repaired stems consistent with the other 2,800+ questions.
function cleanStem(s) {
  let t = (s || '').trim();
  t = t.replace(/^[〔［【]\s*(テクノロジ|マネジメント|ストラテジ)\s*[〕］】]\s*[\n\r　 ]*/, ''); // leading 〔category〕
  t = t.replace(/^問\s*\d+[　 :：.\．]*[　 ]*/, ''); // leading 問NN
  t = t.replace(/[\n\r]+\s*[\[［]\s*(図|表)[\s\S]*$/, ''); // trailing inline [図]/[表] description block
  return t.trim();
}
const cleanChoice = (s) => (s || '').replace(/[〔［【]\s*(テクノロジ|マネジメント|ストラテジ)\s*[〕］】]\s*$/, '').trim(); // trailing section-bleed
const cleanChoices = (c) => { if (!c) return c; const o = {}; for (const l of LBL) o[l] = cleanChoice(c[l] || ''); return o; };

const choiceSims = (a, b) => LBL.map((l) => sim((a || {})[l] || '', (b || {})[l] || ''));
const minChoice = (a, b) => Math.min(...choiceSims(a, b));
const choicesEmpty = (c) => !c || LBL.every((l) => !((c[l] || '').trim()));
const choicesAllPresent = (c) => c && LBL.every((l) => (c[l] || '').trim());
const totalLen = (c) => c ? LBL.reduce((n, l) => n + (c[l] || '').length, 0) : 0;

// ── load stored + stored_ref (backups, flags) ──────────────────────────────────
const Q = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8')).questions;
const stored = new Map(Q.map((q) => [q.id, q]));
const ref = JSON.parse(readFileSync(`${OUT}/stored_ref.json`, 'utf8'));

// ── harvest reads from journal(s); key by composite "<id>__<lane>" → master ─────
const master = existsSync(RMASTER) ? JSON.parse(readFileSync(RMASTER, 'utf8')) : {};
let harvested = 0;
for (const dir of process.argv.slice(2)) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal at ${jp}`); continue; }
  for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    if (o.type !== 'result' || !o.result || !o.result.key) continue;
    master[o.result.key] = o.result; harvested++;
  }
}
writeFileSync(RMASTER, JSON.stringify(master, null, 2));

// pick the more authoritative of two CLEANED stems (prefer 'clear' legibility, then longer)
function pickStem(sa, sb, la, lb) {
  if (la && !lb) return sa;
  if (lb && !la) return sb;
  return (sa || '').length >= (sb || '').length ? sa : sb;
}
function pickChoices(ca, cb, la, lb) {
  const pa = choicesAllPresent(ca), pb = choicesAllPresent(cb);
  if (pa && !pb) return ca;
  if (pb && !pa) return cb;
  if (la && !lb) return ca;
  if (lb && !la) return cb;
  return totalLen(ca) >= totalLen(cb) ? ca : cb;
}

// ── reconcile per flagged question ──────────────────────────────────────────────
const confirmed = [], regressionRestore = [], figureInherent = [], cleared = [], stillUnresolved = [];
const ids = Object.keys(ref);
for (const id of ids) {
  const q = stored.get(id);
  const r = ref[id];
  const A = master[`${id}__A`], B = master[`${id}__B`];
  const exam = id.split('-')[0];
  const base = { id, exam, flag: r.flag };

  if (!A || !B) { stillUnresolved.push({ ...base, why: 'missing_read', haveA: !!A, haveB: !!B }); continue; }
  if (!A.found && !B.found) { stillUnresolved.push({ ...base, why: 'both_not_found' }); continue; }

  const catConflict = (A.category === 'figure_choices') !== (B.category === 'figure_choices');
  const bothFigChoices = A.choices_are_images && B.choices_are_images;
  const laClear = A.legibility === 'clear', lbClear = B.legibility === 'clear';

  // STEM (compare CLEANED text — bank convention: no 問NN / 〔category〕 / inline figure block)
  const aStem = cleanStem(A.printed_stem), bStem = cleanStem(B.printed_stem);
  const abStem = sim(aStem, bStem);
  const authStem = pickStem(aStem, bStem, laClear, lbClear);
  const vsStem = sim(authStem, q.stem_jp);
  const stemAgree = abStem >= AGREE && aStem.trim() && bStem.trim();
  const stemDefect = stemAgree && vsStem < STORED_OK;

  // CHOICES (strip trailing section-bleed)
  const aCh = cleanChoices(A.printed_choices), bCh = cleanChoices(B.printed_choices);
  const storedChEmpty = choicesEmpty(q.choices_jp);
  let choiceDefect = false, authChoices = null, abCh = 0, vsCh = 1;
  if (!bothFigChoices) {
    abCh = minChoice(aCh, bCh);
    authChoices = pickChoices(aCh, bCh, laClear, lbClear);
    vsCh = storedChEmpty ? 0 : minChoice(authChoices, q.choices_jp);
    const choiceAgree = abCh >= AGREE && choicesAllPresent(aCh) && choicesAllPresent(bCh);
    choiceDefect = choiceAgree && (vsCh < STORED_OK || storedChEmpty);
  }

  const detail = {
    ...base,
    ab_stem: +abStem.toFixed(3), vs_stem: +vsStem.toFixed(3),
    ab_choices: +abCh.toFixed(3), vs_choices: +vsCh.toFixed(3),
    legibility: [A.legibility, B.legibility],
    category: [A.category, B.category],
    found_pages: [A.found_pages, B.found_pages],
  };

  if (stemDefect || choiceDefect) {
    const minStoredSim = Math.min(stemDefect ? vsStem : 1, choiceDefect ? vsCh : 1);
    confirmed.push({
      ...detail,
      fix_stem: stemDefect, fix_choices: choiceDefect,
      authoritative_stem: authStem, authoritative_choices: authChoices,
      severity: minStoredSim < 0.4 ? 'content_mismatch' : 'ocr_garble_critical',
    });
  } else if (storedChEmpty && !bothFigChoices && r.choices_backup && !choicesEmpty(r.choices_backup)) {
    // regression: s027 emptied choices and the blind reads couldn't agree → restore the original backup
    regressionRestore.push({ ...detail, fix_choices: true, authoritative_choices: r.choices_backup, severity: 'regression_restore', note: 'restored *_corrupted_backup (blind reads did not corroborate; backup beats empty)' });
  } else if (bothFigChoices && !storedChEmpty) {
    figureInherent.push({ ...detail, note: 'both lanes: options are graphs/images; stored description retained' });
  } else if (vsStem >= STORED_OK && (bothFigChoices || vsCh >= STORED_OK)) {
    cleared.push({ ...detail, note: 'both reads corroborate stored; flag was conservative' });
  } else {
    stillUnresolved.push({ ...detail, why: catConflict ? 'category_conflict' : (abStem < AGREE && abCh < AGREE ? 'lanes_disagree' : 'low_confidence') });
  }
}

const result = {
  params: { AGREE, STORED_OK }, harvested, reads_seen: Object.keys(master).length, flagged: ids.length,
  counts: { confirmed: confirmed.length, regression_restore: regressionRestore.length, figure_inherent: figureInherent.length, cleared: cleared.length, still_unresolved: stillUnresolved.length },
  confirmed, regression_restore: regressionRestore, figure_inherent: figureInherent, cleared, still_unresolved: stillUnresolved,
};
writeFileSync(`${OUT}/_reconcile_b.json`, JSON.stringify(result, null, 2));

console.log(`harvested ${harvested} reads → master ${Object.keys(master).length} (expect ${ids.length * 2})`);
console.log(`reconcile of ${ids.length} flagged:`);
console.log(`  confirmed ........... ${confirmed.length}  (stem ${confirmed.filter(c => c.fix_stem).length} / choices ${confirmed.filter(c => c.fix_choices).length})`);
console.log(`  regression_restore .. ${regressionRestore.length}`);
console.log(`  figure_inherent ..... ${figureInherent.length}`);
console.log(`  cleared (fp flag) ... ${cleared.length}`);
console.log(`  still_unresolved .... ${stillUnresolved.length}`);
const sev = {}; for (const c of confirmed) sev[c.severity] = (sev[c.severity] || 0) + 1;
console.log('  confirmed severity:', JSON.stringify(sev));
console.log('\nknown regression check (choices were emptied by s027):');
for (const id of ['2014h26a-q099', '2015h27a-q086']) {
  const where = ['confirmed', 'regression_restore', 'figure_inherent', 'cleared', 'still_unresolved'].find((k) => result[k].some((x) => x.id === id));
  console.log(`  ${id}: ${where || 'NOT FOUND'}`);
}
// coverage of reads
const missing = ids.filter((id) => !master[`${id}__A`] || !master[`${id}__B`]);
if (missing.length) console.log(`\n! incomplete reads for ${missing.length} ids: ${missing.join(', ')}`);
