#!/usr/bin/env node
/**
 * Stage 2.6 figure phase — prep for the SINGLE-question figures (add_figure_single).
 * Reads figure_worklist.json + question_bank, emits per-figure input JSON the ESTIMATE
 * vision agents read (one each), plus an ids list. Mirrors Session-71 repair-figures-prep
 * but sourced from the worklist and isolated under .tmp/s026/fig/ (Session-71 artifacts untouched).
 *
 * Usage: node scripts/stage026-fig-prep.mjs [round] [ids-comma-separated]
 *   round 1 (default): all 16 add_figure_single
 *   round N + ids: carry-over fails, reads round<N-1>_fails.json hints + prior estimate bbox
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';

const ROOT = '/Users/bojiangzhang/MyProject/IT-Passport-Learning';
const FIG_DIR = `${ROOT}/data/ip/exams/.tmp/s026/fig`;
mkdirSync(FIG_DIR, { recursive: true });

const round = parseInt(process.argv[2] || '1', 10);
const idFilter = (process.argv[3] || '').split(',').map((s) => s.trim()).filter(Boolean);

const worklist = JSON.parse(readFileSync(`${ROOT}/data/ip/exams/.tmp/s026/figure_worklist.json`, 'utf8'));
const qb = JSON.parse(readFileSync(`${ROOT}/data/ip/exams/question_bank.json`, 'utf8'));
const byId = new Map(qb.questions.map((q) => [q.id, q]));

let feedback = {};
let priorBbox = {};
if (round > 1) {
  try { feedback = JSON.parse(readFileSync(`${FIG_DIR}/round${round - 1}_fails.json`, 'utf8')); } catch {}
  try {
    const pe = JSON.parse(readFileSync(`${FIG_DIR}/round${round - 1}_estimates.json`, 'utf8'));
    for (const r of (pe.results || [])) if (r.bbox) priorBbox[r.id] = r.bbox;
  } catch {}
}

let items = worklist.add_figure_single;
if (idFilter.length) items = items.filter((x) => idFilter.includes(x.qid));

const manifest = items.map((w) => {
  const q = byId.get(w.qid);
  const pageRel = q?.source?.page_image || w.page;
  const pagePath = pageRel ? `${ROOT}/data/ip/exams/${pageRel}` : null;
  return {
    id: w.qid,
    exam: w.qid.split('-')[0],
    page_path: pagePath,
    page_image: pageRel,
    page_number: q?.source?.page_number ?? null,
    note: w.note,
    old_bbox: priorBbox[w.qid] || q?.figure_bbox_pct || null,
    has_figure: q?.has_figure ?? null,
    figure_path: q?.figure_path ?? null,
    figure_type: q?.figure_type || null,
    stem_jp: (q?.stem_jp || '').slice(0, 500),
    choices_jp: q?.choices_jp || null,
    verifier_feedback: feedback[w.qid] || null,
  };
});

const inputDir = `${FIG_DIR}/round${round}_input`;
try { rmSync(inputDir, { recursive: true, force: true }); } catch {}
mkdirSync(inputDir, { recursive: true });
for (const m of manifest) writeFileSync(`${inputDir}/${m.id}.json`, JSON.stringify(m, null, 2));
writeFileSync(`${FIG_DIR}/round${round}_ids.json`, JSON.stringify(manifest.map((m) => m.id), null, 2));
writeFileSync(`${FIG_DIR}/round${round}_manifest.json`, JSON.stringify({ round, count: manifest.length, figures: manifest }, null, 2));

const missingPage = manifest.filter((m) => !m.page_path || !existsSync(m.page_path)).map((m) => m.id);
console.log(`[fig-prep] round ${round}: ${manifest.length} single figures → ${inputDir}/{id}.json`);
console.log(`[fig-prep] ids → ${FIG_DIR}/round${round}_ids.json`);
if (missingPage.length) console.log(`[fig-prep] WARNING missing/absent page_path: ${missingPage.join(', ')}`);
else console.log('[fig-prep] all page paths exist ✓');
