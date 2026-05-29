#!/usr/bin/env node
/**
 * Stage 2.6 Phase C — stratified random sampler (deterministic seed → reproducible).
 * Draws N≈100 for L1 (re-solve) + L2 (cross-field); a ~30 calc subsample for L5 (numeric);
 * a ~30 mixed subsample for L-ext (external cross-check). Oversamples figure + calc questions,
 * guarantees ≥1 per exam, folds in known seeds. syllabus_refs unavailable pre-Stage-3, so strata =
 * era × has_figure × calc-heuristic.
 * Usage: node scripts/stage026-phaseC-sample.mjs
 * Output: .tmp/s026/phaseC/sample_main.json (N100), sample_L5.json (~30), sample_Lext.json (~30) + manifest
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const EXAMS = `${ROOT}/data/ip/exams`;
const OUT = `${EXAMS}/.tmp/s026/phaseC`;
mkdirSync(OUT, { recursive: true });

// deterministic PRNG (mulberry32)
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rng = mulberry32(20260529);
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const qb = JSON.parse(readFileSync(`${EXAMS}/question_bank.json`, 'utf8'));
const Q = qb.questions;

const CALC_RE = /(計算|求め|何円|何個|何日|何時間|幾つ|いくつ|何%|百分率|平均|標準偏差|割合|金額|単価|総額|台数|人数|回数|確率|速度|ビット|バイト|進数|0x|２進|二進|何ビット|スループット|稼働率|MTBF|MTTR)/;
function isCalc(q) { return CALC_RE.test(q.stem_jp || '') || /[＝=].*[＋－×÷+\-*/]/.test(JSON.stringify(q.choices_jp || {})); }
function era(fy) { if (fy <= 2013) return 'e1_09-13'; if (fy <= 2018) return 'e2_14-18'; if (fy <= 2023) return 'e3_19-23'; return 'e4_24-26'; }

// fiscal_year is not stored on questions; derive gregorian year from the exam-id prefix (e.g. 2009h21a → 2009)
const fyOf = (q) => parseInt(String(q.id).slice(0, 4), 10);
const tagged = Q.map((q) => ({
  id: q.id, exam: q.id.split('-')[0], fy: fyOf(q), qn: q.question_number,
  has_figure: !!q.has_figure, group_id: q.group_id || null, calc: isCalc(q),
  figure_repaired_s73: !!q.figure_repaired_s73, figure_repaired: !!q.figure_repaired,
  era: era(fyOf(q)),
}));

// known seeds to force-include (recently-touched / flagged)
const SEEDS = [
  '2015h27h-q085', // stem呼称疑い (Phase B → Phase C follow-up)
  '2010h22h-q072', // residual stem OCR noise spotted (A」地点/C。地点)
  '2009h21a-q099', '2018h30h-q001', '2010h22h-q045', // stem-recovered
  '2018h30h-q008', '2018h30h-q100', '2009h21a-q088', '2010h22a-q008', // duplicate_extraction fixes
  '2015h27a-q059', '2015h27h-q094', // choice_swap / mismatch fixes
  '2022r04-q017', '2014h26a-q009', '2019r01a-q049', // choice_ocr fixes
];
const byId = new Map(tagged.map((t) => [t.id, t]));
const picked = new Set();
const sample = [];
function add(t, stratum) { if (t && !picked.has(t.id)) { picked.add(t.id); sample.push({ ...t, stratum }); } }

for (const s of SEEDS) add(byId.get(s), 'seed');

// guarantee >=1 per exam (prefer a figure or calc question for coverage value)
const byExam = {};
for (const t of tagged) (byExam[t.exam] ||= []).push(t);
for (const exam of Object.keys(byExam).sort()) {
  if (sample.some((s) => s.exam === exam)) continue;
  const pool = shuffle(byExam[exam]);
  const pref = pool.find((t) => t.has_figure) || pool.find((t) => t.calc) || pool[0];
  add(pref, 'per_exam');
}

// oversample figure questions (target ~30 figure in sample)
const figs = shuffle(tagged.filter((t) => t.has_figure));
for (const t of figs) { if (sample.filter((s) => s.has_figure).length >= 30) break; add(t, 'figure'); }
// oversample calc (non-figure) (target ~25 calc)
const calcs = shuffle(tagged.filter((t) => t.calc && !t.has_figure));
for (const t of calcs) { if (sample.filter((s) => s.calc).length >= 30) break; add(t, 'calc'); }
// fill to 100 with uniform random across eras
const rest = shuffle(tagged.filter((t) => !picked.has(t.id)));
for (const t of rest) { if (sample.length >= 100) break; add(t, 'random'); }

// L5 numeric subsample (~30): calc questions in the main sample, else draw more calc
const L5 = sample.filter((s) => s.calc).slice(0, 30);
if (L5.length < 30) { for (const t of shuffle(tagged.filter((t) => t.calc && !L5.some((x) => x.id === t.id)))) { if (L5.length >= 30) break; L5.push({ ...t, stratum: 'L5_extra' }); } }

// L-ext subsample (~30): prefer terminology/factual (non-calc, non-figure) from main sample for external lookup value
const extPref = sample.filter((s) => !s.calc && !s.has_figure);
const Lext = shuffle(extPref).slice(0, 30);
if (Lext.length < 30) { for (const t of shuffle(sample.filter((s) => !Lext.some((x) => x.id === s.id)))) { if (Lext.length >= 30) break; Lext.push(t); } }

const dist = (arr, key) => arr.reduce((m, x) => { const k = typeof key === 'function' ? key(x) : x[key]; m[k] = (m[k] || 0) + 1; return m; }, {});
const manifest = {
  seed: 20260529, total_questions: Q.length,
  main_n: sample.length,
  main_dist: { era: dist(sample, 'era'), has_figure: dist(sample, (s) => String(s.has_figure)), calc: dist(sample, (s) => String(s.calc)), stratum: dist(sample, 'stratum') },
  exams_covered: new Set(sample.map((s) => s.exam)).size,
  L5_n: L5.length, Lext_n: Lext.length,
};
writeFileSync(`${OUT}/sample_main.json`, JSON.stringify({ manifest, sample }, null, 2));
writeFileSync(`${OUT}/sample_L5.json`, JSON.stringify({ n: L5.length, sample: L5 }, null, 2));
writeFileSync(`${OUT}/sample_Lext.json`, JSON.stringify({ n: Lext.length, sample: Lext }, null, 2));
writeFileSync(`${OUT}/sample_manifest.json`, JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
