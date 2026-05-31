#!/usr/bin/env node
/**
 * Stage 2.7 — harvest BLIND transcriptions from workflow run dir(s) and mechanically diff vs stored.
 *
 * The blind agents never saw stored text, so a low similarity between blind-printed and stored is a
 * genuine signal (content_mismatch / garble), not an echo artifact. We normalize (NFKC + strip
 * whitespace/punct) and score char-bigram Jaccard similarity for stem and each choice. Questions whose
 * stem or any choice diverges past a threshold become CANDIDATES for adjudication.
 *
 * Usage: node scripts/stage027-blind-diff.mjs <run_dir> [<run_dir> ...]
 * Output: data/ip/exams/.tmp/s027/blind/_blind_master.json  (merged transcriptions, keyed by id)
 *         data/ip/exams/.tmp/s027/blind/_candidates.json     (flagged questions + both texts + scores)
 *         prints candidate counts + per-exam distribution + known-case check
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const OUT = `${EXAMS}/.tmp/s027/blind`;
mkdirSync(OUT, { recursive: true });
const BMASTER = `${OUT}/_blind_master.json`;

const runDirs = process.argv.slice(2);
if (!runDirs.length) { console.error('usage: node stage027-blind-diff.mjs <run_dir> [...]'); process.exit(1); }

// ── normalization + similarity ────────────────────────────────────────────────
const STRIP = /[\s　，、。．,.・「」『』“”"'（）()［］\[\]｛｝{}：:；;！!？?ー―─\-_=＝　]/g;
function norm(s) {
  return (s || '').normalize('NFKC').replace(STRIP, '').toLowerCase();
}
function bigrams(s) {
  const g = new Set();
  if (s.length < 2) { if (s) g.add(s); return g; }
  for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2));
  return g;
}
function sim(a, b) {
  const na = norm(a), nb = norm(b);
  if (!na && !nb) return 1;
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const A = bigrams(na), B = bigrams(nb);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

// ── load stored ───────────────────────────────────────────────────────────────
const Q = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8')).questions;
const stored = new Map(Q.map((q) => [q.id, q]));

// ── harvest blind transcriptions (merge across run dirs; last write wins) ───────
const bmaster = existsSync(BMASTER) ? JSON.parse(readFileSync(BMASTER, 'utf8')) : { tx: {} };
let harvested = 0;
for (const dir of runDirs) {
  const jp = `${dir}/journal.jsonl`;
  if (!existsSync(jp)) { console.error(`! no journal at ${jp}`); continue; }
  for (const ln of readFileSync(jp, 'utf8').trim().split('\n').filter(Boolean)) {
    let o; try { o = JSON.parse(ln); } catch { continue; }
    if (o.type !== 'result' || !o.result || !o.result.transcriptions) continue;
    for (const t of o.result.transcriptions) {
      if (!t.id) continue;
      const q = stored.get(t.id);
      bmaster.tx[t.id] = { ...t, exam: t.id.split('-')[0], page_image: q ? q.source.page_image : null };
      harvested++;
    }
  }
}
writeFileSync(BMASTER, JSON.stringify(bmaster, null, 2));

// ── diff ────────────────────────────────────────────────────────────────────
const STEM_TH = 0.72;   // stem bigram-Jaccard below this ⇒ candidate
const CHOICE_TH = 0.70; // any choice below this ⇒ candidate
const candidates = [];
let scanned = 0;
for (const [id, t] of Object.entries(bmaster.tx)) {
  const q = stored.get(id);
  if (!q) continue;
  scanned++;
  if (!t.found_on_page) {
    candidates.push({ id, exam: t.exam, reason: 'not_found_on_page', stem_sim: null, choice_sims: null, legibility: t.legibility, stored_stem: q.stem_jp, blind_stem: '', stored_choices: q.choices_jp, blind_choices: t.printed_choices });
    continue;
  }
  const stemSim = sim(q.stem_jp, t.printed_stem);
  const labels = ['ア', 'イ', 'ウ', 'エ'];
  const choiceSims = labels.map((l) => sim((q.choices_jp || {})[l] || '', (t.printed_choices || {})[l] || ''));
  const minChoice = Math.min(...choiceSims);
  const stemBad = stemSim < STEM_TH;
  const choiceBad = minChoice < CHOICE_TH;
  if (stemBad || choiceBad) {
    candidates.push({
      id, exam: t.exam,
      reason: stemBad && choiceBad ? 'stem+choices' : stemBad ? 'stem' : 'choices',
      stem_sim: +stemSim.toFixed(3),
      choice_sims: choiceSims.map((s) => +s.toFixed(3)),
      legibility: t.legibility,
      stored_stem: q.stem_jp, blind_stem: t.printed_stem,
      stored_choices: q.choices_jp, blind_choices: t.printed_choices,
    });
  }
}
candidates.sort((a, b) => (a.stem_sim ?? 9) - (b.stem_sim ?? 9));
writeFileSync(`${OUT}/_candidates.json`, JSON.stringify({ scanned, candidate_count: candidates.length, stem_th: STEM_TH, choice_th: CHOICE_TH, candidates }, null, 2));

// ── report ──────────────────────────────────────────────────────────────────
const byExam = {};
for (const c of candidates) byExam[c.exam] = (byExam[c.exam] || 0) + 1;
const reasons = {};
for (const c of candidates) reasons[c.reason] = (reasons[c.reason] || 0) + 1;
console.log(`harvested ${harvested} blind transcriptions → ${Object.keys(bmaster.tx).length} unique; scanned ${scanned} vs stored`);
console.log(`CANDIDATES: ${candidates.length} (${(100 * candidates.length / Math.max(scanned, 1)).toFixed(1)}% of scanned)`);
console.log('reasons:', JSON.stringify(reasons));
console.log('by_exam:', JSON.stringify(byExam));
console.log('\n--- known-case check (expect all to appear as candidates) ---');
for (const id of ['2015h27h-q010', '2015h27h-q011', '2015h27h-q014', '2015h27h-q085', '2015h27h-q086']) {
  const c = candidates.find((x) => x.id === id);
  const t = bmaster.tx[id];
  console.log(`${id}: ${c ? 'CANDIDATE(' + c.reason + ', stem_sim=' + c.stem_sim + ', legib=' + c.legibility + ')' : 'NOT FLAGGED'}${t ? '' : ' [no blind tx]'}`);
}
