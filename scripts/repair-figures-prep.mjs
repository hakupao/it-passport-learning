#!/usr/bin/env node
/**
 * Session 71 — Figure repair prep.
 * Builds a manifest for the ESTIMATE workflow from _fails_canonical.json + question_bank.
 * Usage: node scripts/repair-figures-prep.mjs [round] [ids-comma-separated]
 *   round 1 (default): all canonical FAILs
 *   round N with ids: only those ids (carry-over FAILs), reading prior verifier feedback
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const REPAIR_DIR = `${ROOT}/data/ip/exams/.tmp/repair`;
mkdirSync(REPAIR_DIR, { recursive: true });

const round = parseInt(process.argv[2] || '1', 10);
const idFilter = (process.argv[3] || '').split(',').map(s => s.trim()).filter(Boolean);

const canonical = JSON.parse(readFileSync(`${ROOT}/data/ip/exams/figures/_fails_canonical.json`, 'utf8'));
const qb = JSON.parse(readFileSync(`${ROOT}/data/ip/exams/question_bank.json`, 'utf8'));
const byId = new Map(qb.questions.map(q => [q.id, q]));

// carry-over feedback + prior-round estimate bbox (if present)
let feedback = {};
let priorBbox = {};
if (round > 1) {
  try {
    feedback = JSON.parse(readFileSync(`${REPAIR_DIR}/round${round - 1}_fails.json`, 'utf8'));
  } catch { feedback = {}; }
  try {
    const pe = JSON.parse(readFileSync(`${REPAIR_DIR}/round${round - 1}_estimates.json`, 'utf8'));
    for (const r of (pe.results || [])) if (r.bbox) priorBbox[r.id] = r.bbox;
  } catch { priorBbox = {}; }
}

let items = canonical.fails;
if (idFilter.length) items = items.filter(x => idFilter.includes(x.id));

const manifest = items.map(f => {
  const q = byId.get(f.id);
  const pageRel = q?.source?.page_image; // e.g. pages/2009h21a/page-06.png
  return {
    id: f.id,
    exam: f.exam,
    page_path: pageRel ? `${ROOT}/data/ip/exams/${pageRel}` : null,
    page_number: q?.source?.page_number ?? null,
    old_bbox: priorBbox[f.id] || q?.figure_bbox_pct || f.current_bbox_pct || null,
    figure_type: q?.figure_type || f.figure_type || null,
    figure_description: q?.figure_description || f.figure_description || null,
    stem_jp: (q?.stem_jp || '').slice(0, 400),
    prior_fail_reason: f.fail_reason || null,
    verifier_feedback: feedback[f.id] || null, // round>1: specific fix hint
  };
});

const out = {
  round,
  generated_for: 'ESTIMATE workflow',
  count: manifest.length,
  staging_dir: `${REPAIR_DIR}/round${round}`,
  figures: manifest,
};
const path = `${REPAIR_DIR}/round${round}_manifest.json`;
writeFileSync(path, JSON.stringify(out, null, 2));
mkdirSync(`${REPAIR_DIR}/round${round}`, { recursive: true });

// Per-figure input files (each estimate agent reads only its own) + ids file
const inputDir = `${REPAIR_DIR}/round${round}_input`;
try { rmSync(inputDir, { recursive: true, force: true }); } catch {}
mkdirSync(inputDir, { recursive: true });
for (const m of manifest) writeFileSync(`${inputDir}/${m.id}.json`, JSON.stringify(m, null, 2));
writeFileSync(`${REPAIR_DIR}/round${round}_ids.json`, JSON.stringify(manifest.map(m => m.id), null, 2));
console.log(`[prep] per-figure inputs → ${inputDir}/{id}.json`);
console.log(`[prep] ids → ${REPAIR_DIR}/round${round}_ids.json`);

const missing = manifest.filter(m => !m.page_path).map(m => m.id);
console.log(`[prep] round ${round}: ${manifest.length} figures → ${path}`);
console.log(`[prep] staging: ${REPAIR_DIR}/round${round}`);
if (missing.length) console.log(`[prep] WARNING missing page_path: ${missing.join(', ')}`);
else console.log('[prep] all figures have page_path ✓');
