#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.5 (Session 98, D-138 / Rule A) — audit-sample builder (deterministic).
//
// Builds the N-sample input for quiz-phase1.5-ruleA.workflow.mjs after a batch has been
// reconstructed + merged. Joins, per sampled id:
//   - reconstructed displayed stem (post-merge sidecar translations/<exam>.json: stem_jp_clean + stem.{zh,en})
//   - the reconstruction's `changed` / change_summary (from .phase1.5/stem_<id>.json)
//   - the SOURCE OF TRUTH: figure crop + authoritative full page (figure q) OR stem_corrupted_backup (nonfig)
//   - choices_jp + correct_answer
// so an INDEPENDENT auditor (≠ in-pipeline critic, ≠ writer) can re-verify figure-faithfulness /
// backup-consistency from the source.
//
// Stratified + DETERMINISTIC (no RNG, sorted by id): oversample CHANGED figure items (highest risk
// per S97 q066 — figure-table fidelity is not sample-certifiable, so weight the changed ones),
// then changed nonfig, then spot-check unchanged figure + unchanged nonfig. Forced ids appended.
//
// Run:  node scripts/quiz-phase1.5-ruleA-prep.mjs <batchLabel> [N] [id=<qid>...]   (default N=16)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const RAW_BANK = path.join(ROOT, "data/ip/exams/question_bank.json");
const FIG_DIR = path.join(ROOT, "data/ip/exams/figures");
const EXAMS_DIR = path.join(ROOT, "data/ip/exams");
const TR_DIR = path.join(ROOT, "data/ip/quiz/translations");
const PHASE15 = path.join(ROOT, "data/ip/quiz/.phase1.5");

function fail(m) { console.error(`✗ quiz-phase1.5-ruleA-prep: ${m}`); process.exit(1); }
function readJson(f) { if (!existsSync(f)) fail(`missing ${f}`); return JSON.parse(readFileSync(f, "utf-8")); }

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("id="));
const forcedIds = argv.filter((a) => a.startsWith("id=")).map((a) => a.slice(3));
const label = positional[0];
const N = Number(positional[1] ?? 16);
if (!label) fail("usage: quiz-phase1.5-ruleA-prep.mjs <batchLabel> [N] [id=<qid>...]");

const items = readJson(path.join(PHASE15, `items_batch_${label}.json`)); // [{id,klass}]
const qById = new Map(readJson(QUESTIONS).questions.map((q) => [q.id, q]));
const rawById = new Map();
for (const rq of (readJson(RAW_BANK).questions ?? [])) { const id = rq.id ?? rq.question_id; if (id) rawById.set(id, rq); }

// sidecar cache per exam (post-merge displayed stem)
const sidecarCache = new Map();
function sidecarEntry(id) {
  const exam = id.slice(0, id.lastIndexOf("-"));
  if (!sidecarCache.has(exam)) {
    const f = path.join(TR_DIR, `${exam}.json`);
    sidecarCache.set(exam, existsSync(f) ? readJson(f).questions : {});
  }
  return sidecarCache.get(exam)[id] ?? null;
}

// enrich each batch item with changed flag (from stem_<id>.json)
const enriched = [];
for (const it of items) {
  const stemFile = path.join(PHASE15, `stem_${it.id}.json`);
  if (!existsSync(stemFile)) continue; // not reconstructed (shouldn't happen post-merge)
  const recon = readJson(stemFile);
  enriched.push({ id: it.id, klass: it.klass, changed: Boolean(recon.changed), change_summary_jp: recon.change_summary_jp ?? "" });
}
if (!enriched.length) fail(`no reconstructed stems for batch ${label} (run reconstruct + merge first)`);

const byId = (a, b) => a.id.localeCompare(b.id);
const strata = {
  changedFig: enriched.filter((e) => e.klass === "figure" && e.changed).sort(byId),
  changedNonfig: enriched.filter((e) => e.klass === "nonfig_marked" && e.changed).sort(byId),
  unchFig: enriched.filter((e) => e.klass === "figure" && !e.changed).sort(byId),
  unchNonfig: enriched.filter((e) => e.klass === "nonfig_marked" && !e.changed).sort(byId),
};

const picked = [];
const seen = new Set();
const take = (arr, k) => {
  if (k <= 0 || !arr.length) return;
  const step = Math.max(1, Math.floor(arr.length / k));
  for (let i = 0; i < arr.length && picked.length < N; i += step) {
    const e = arr[i];
    if (!seen.has(e.id)) { seen.add(e.id); picked.push(e); }
  }
};
// budget: changed figure ≈ half (highest risk), changed nonfig ≈ quarter, then spot unchanged
take(strata.changedFig, Math.min(strata.changedFig.length, Math.ceil(N / 2)));
take(strata.changedNonfig, Math.min(strata.changedNonfig.length, Math.ceil(N / 4)));
take(strata.unchFig, Math.min(strata.unchFig.length, Math.ceil(N / 6)));
take(strata.unchNonfig, N - picked.length);
// top up from anything still untaken (thin strata)
for (const e of [...strata.changedFig, ...strata.changedNonfig, ...strata.unchFig, ...strata.unchNonfig]) {
  if (picked.length >= N) break;
  if (!seen.has(e.id)) { seen.add(e.id); picked.push(e); }
}
// forced ids (must be in batch)
for (const fid of forcedIds) {
  const e = enriched.find((x) => x.id === fid);
  if (!e) fail(`forced id '${fid}' not reconstructed in batch ${label}`);
  if (!seen.has(fid)) { seen.add(fid); picked.push(e); }
}
picked.sort(byId);

const samples = picked.map((e) => {
  const q = qById.get(e.id);
  if (!q) fail(`${e.id} not in questions.json`);
  const isFig = Boolean(q.has_figure && q.figure);
  const rq = rawById.get(e.id);
  const figurePng = isFig ? path.join(FIG_DIR, `${q.figure}.png`) : null;
  const pageRel = rq?.source?.page_image;
  const figurePagePng = isFig && pageRel ? path.join(EXAMS_DIR, pageRel) : null;
  const sc = sidecarEntry(e.id);
  if (!sc) fail(`${e.id} not in sidecar (merge first)`);
  return {
    id: e.id,
    klass: e.klass,
    changed: e.changed,
    change_summary_jp: e.change_summary_jp,
    choices_jp: { ア: q.choices_jp.ア, イ: q.choices_jp.イ, ウ: q.choices_jp.ウ, エ: q.choices_jp.エ },
    correct_answer: q.correct_answer,
    figure_png: figurePng,
    figure_page_png: figurePagePng,
    stem_corrupted_backup: rq?.stem_jp_corrupted_backup ?? null,
    reconstructed: { stem_jp_clean: sc.stem_jp_clean ?? null, stem: sc.stem ?? null },
  };
});

const outFile = path.join(PHASE15, `ruleA_samples_${label}.json`);
writeFileSync(outFile, JSON.stringify({ batch: label, n: samples.length, samples }, null, 2) + "\n");

const fig = samples.filter((s) => s.klass === "figure").length;
const chg = samples.filter((s) => s.changed).length;
console.log(`✓ quiz-phase1.5-ruleA-prep ${label}`);
console.log(`  reconstructed pool : ${enriched.length} (changedFig ${strata.changedFig.length} / changedNonfig ${strata.changedNonfig.length} / unchFig ${strata.unchFig.length} / unchNonfig ${strata.unchNonfig.length})`);
console.log(`  sampled            : ${samples.length} (figure ${fig} / nonfig ${samples.length - fig} ; changed ${chg}${forcedIds.length ? ` ; forced ${forcedIds.length}` : ""})`);
console.log(`  ids                : ${samples.map((s) => s.id).join(", ")}`);
console.log(`  out                : ${path.relative(ROOT, outFile)}`);
