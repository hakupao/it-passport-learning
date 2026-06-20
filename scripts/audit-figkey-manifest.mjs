#!/usr/bin/env node
// Phase 2 pre-flight: figure answer-KEY audit manifest builder.
// Population = 247 at-risk figure questions (choices re-sourced via s7x OR figure repaired).
// Selects a deterministic stratified ~40 sample (rate denominator) + a separate calibration
// control set, resolves authoritative image paths (full page + crop), and emits a manifest
// the vision audit workflow consumes. Deterministic (no RNG) for Rule A reproducibility.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BANK = path.join(ROOT, 'data/ip/exams/question_bank.json');
const EXAM_ROOT = path.join(ROOT, 'data/ip/exams');
const OUT_DIR = path.join(ROOT, 'evidence/phase5/stage_06_quiz_figkey_audit');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_TARGET = Number(process.argv[2] || 40);
// per-severity allocation (oversample content_mismatch + ocr_garble_critical), sums to 40
const ALLOC = { content_mismatch: 14, ocr_garble_critical: 12, escalate_resolved: 8, none: 6 };
// calibration controls: forced ids tagged separately (NOT in rate denominator)
const CONTROLS = [
  { id: '2010h22h-q002', expect: 'CLEAN', note: 'S96 fixed (s7x anti-figure swap reverted in raw bank) — specificity control' },
  { id: '2013h25a-q052', expect: 'CLEAN', note: 'S94 fixed (figure 0.10 restored) — specificity control' },
  { id: '2010h22h-q077', expect: 'UNKNOWN_BACKLOG', note: 'backlog "figure<->key reversal" SUSPECTED; main-context pre-read suggests key=イ (series y=p²) is figure-correct — adjudication control, not a guaranteed positive' },
];
// POISONED controls: real figure + real choices, but correct_answer deliberately flipped to a
// definitively-WRONG letter. Auditor MUST flag BAD_KEY → measures sensitivity (true-positive rate).
// Synthetic only — never written back to the bank.
const POISON = [
  { base_id: '2009h21a-q013', wrong_key: 'ア', real_key: 'ウ', note: 'break-even = 120/0.4 = 300 = ウ (verified); planted key ア(=160) is wrong — sensitivity control' },
];

const { questions } = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const byId = new Map(questions.map((q) => [q.id, q]));
const H = (q, k) => q[k] !== undefined;
const isChoicesS7x = (q) => H(q, 'choices_resourced_s7x') || H(q, 'choices_refixed_s7x') || H(q, 'choices_resourced_s7xb');
const isFR = (q) => H(q, 'figure_repaired') || H(q, 'figure_repaired_s73');
const atRisk = questions.filter((q) => q.has_figure && (isChoicesS7x(q) || isFR(q)));
if (atRisk.length !== 247) console.warn(`WARN: at-risk count ${atRisk.length} != 247 (data drift?)`);

const sevB = (q) => {
  const s = q.s027_severity || 'none';
  if (s.startsWith('content_mismatch')) return 'content_mismatch';
  if (s.startsWith('ocr_garble_critical')) return 'ocr_garble_critical';
  if (s.startsWith('escalate_resolved')) return 'escalate_resolved';
  return 'none';
};
// FNV-1a hash for deterministic ordering
const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

function resolvePaths(q) {
  const pageRel = q.source?.page_image;          // e.g. pages/2009h21a/page-07.png
  const cropRel = q.figure_path;                 // e.g. figures/2009h21a-q013.png
  const pageAbs = pageRel ? path.join(EXAM_ROOT, pageRel) : null;
  const cropAbs = cropRel ? path.join(EXAM_ROOT, cropRel) : null;
  return {
    page_abs: pageAbs && fs.existsSync(pageAbs) ? pageAbs : null,
    crop_abs: cropAbs && fs.existsSync(cropAbs) ? cropAbs : null,
    page_rel: pageRel || null,
    crop_rel: cropRel || null,
  };
}

function pack(q, extra = {}) {
  const p = resolvePaths(q);
  return {
    id: q.id,
    exam: q.id.split('-')[0],
    question_number: q.question_number,
    severity: sevB(q),
    severity_raw: q.s027_severity || null,
    figure_type: q.figure_type || null,
    figure_bbox_pct: q.figure_bbox_pct || null,
    figure_description: q.figure_description || null,
    markers: {
      choices_resourced_s7x: isChoicesS7x(q),
      figure_repaired: isFR(q),
      has_choices_corrupted_backup: H(q, 'choices_jp_corrupted_backup'),
      has_stem_corrupted_backup: H(q, 'stem_jp_corrupted_backup'),
    },
    stem_jp: q.stem_jp,
    choices_jp: q.choices_jp,
    correct_answer: q.correct_answer,
    ...p,
    ...extra,
  };
}

// ---- stratified selection ----
const controlIds = new Set(CONTROLS.map((c) => c.id));
const pool = atRisk.filter((q) => !controlIds.has(q.id));
const buckets = { content_mismatch: [], ocr_garble_critical: [], escalate_resolved: [], none: [] };
for (const q of pool) buckets[sevB(q)].push(q);

const sample = [];
for (const [sev, want] of Object.entries(ALLOC)) {
  const byType = {};
  for (const q of buckets[sev]) (byType[q.figure_type || 'none'] ||= []).push(q);
  // deterministic intra-type order: prefer choices_resourced_s7x (q002 mode), then hash
  for (const t of Object.keys(byType)) {
    byType[t].sort((a, b) => {
      const ca = isChoicesS7x(a) ? 0 : 1, cb = isChoicesS7x(b) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return hash(a.id) - hash(b.id);
    });
  }
  // proportional-by-type allocation with floor 1 (coverage of rare types), largest-remainder
  const types = Object.keys(byType);
  const total = buckets[sev].length;
  const quota = {};
  let assigned = 0;
  for (const t of types) { quota[t] = Math.min(byType[t].length, 1); assigned += quota[t]; } // floor 1
  const remaining0 = Math.max(0, want - assigned);
  const fracs = types.map((t) => ({ t, frac: (byType[t].length / total) * remaining0, cap: byType[t].length - quota[t] }))
    .sort((a, b) => b.frac - a.frac);
  let left = remaining0;
  for (const { t, frac, cap } of fracs) { const add = Math.min(cap, Math.floor(frac)); quota[t] += add; left -= add; }
  for (const { t, cap } of fracs) { if (left <= 0) break; const room = cap - (quota[t] - Math.min(byType[t].length, 1)); if (room > 0) { quota[t]++; left--; } }
  for (const t of types) for (let i = 0; i < quota[t] && byType[t].length; i++) sample.push(pack(byType[t].shift(), { stratum: sev, role: 'rate' }));
}

const controls = CONTROLS.map((c) => {
  const q = byId.get(c.id);
  if (!q) { console.warn(`WARN: control ${c.id} not found`); return null; }
  return pack(q, { stratum: sevB(q), role: 'control', control_expect: c.expect, control_note: c.note });
}).filter(Boolean);

const poisoned = POISON.map((p) => {
  const q = byId.get(p.base_id);
  if (!q) { console.warn(`WARN: poison base ${p.base_id} not found`); return null; }
  return pack(q, {
    id: `POISON-${p.base_id}`,
    role: 'poison',
    stratum: sevB(q),
    correct_answer: p.wrong_key, // deliberately wrong key the auditor must catch
    control_expect: 'BAD_KEY',
    control_note: p.note,
    poison_real_key: p.real_key,
  });
}).filter(Boolean);

const all = [...sample, ...controls, ...poisoned];
const missingImg = all.filter((x) => !x.page_abs && !x.crop_abs);

const manifest = {
  generated_for: 'Phase 5 Stage 6 Quiz — pre-Phase-2 figure answer-KEY audit (Rule A semantic sampling)',
  population: { name: 'at-risk figure questions (choices_resourced_s7x OR figure_repaired)', size: atRisk.length },
  definitions: {
    bad_key_strict: 'choices_jp[correct_answer] is NOT the answer the figure supports (the keyed letter points to content the figure contradicts). This is the rate numerator.',
    choices_swap_only: 'figure-correct value still sits under correct_answer letter, but OTHER choices are mislabeled/anti-figure. Logged + corpus-fix candidate; NOT a bad key.',
    not_derivable: 'answer cannot be determined from the figure alone (conceptual q, or figure/source data missing). Excluded from rate; flagged for manual.',
  },
  sample_size: sample.length,
  allocation: ALLOC,
  control_count: controls.length,
  poison_count: poisoned.length,
  composition: {
    by_severity: Object.fromEntries(Object.entries(ALLOC).map(([s]) => [s, sample.filter((x) => x.stratum === s).length])),
    by_figure_type: sample.reduce((m, x) => ((m[x.figure_type || 'none'] = (m[x.figure_type || 'none'] || 0) + 1), m), {}),
    choices_resourced_s7x_in_sample: sample.filter((x) => x.markers.choices_resourced_s7x).length,
    exams_covered: [...new Set(sample.map((x) => x.exam))].length,
  },
  image_coverage: { with_page: all.filter((x) => x.page_abs).length, with_crop: all.filter((x) => x.crop_abs).length, missing_both: missingImg.map((x) => x.id) },
  items: all,
};

const outPath = path.join(OUT_DIR, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log('AT-RISK population:', atRisk.length);
console.log('SAMPLE (rate):', sample.length, '| CONTROLS:', controls.length);
console.log('composition:', JSON.stringify(manifest.composition, null, 2));
console.log('image coverage:', JSON.stringify(manifest.image_coverage));
console.log('wrote', path.relative(ROOT, outPath));
