#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 figure-display fix apply (Session 99).
// Reads .keyaudit/figfix_results.json (critic verify+bbox). For each:
//   recrop        → re-extract correct region from the page PNG (bbox %) → figures/<id>.png (backup orig)
//   remove_figure → raw bank has_figure=false (+ figure cleared)
//   none          → false positive, skip
// Then run: node scripts/build-quiz-figures.mjs && node scripts/build-quiz-corpus.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "/Users/bojiangzhang/MyProject/IT-Passport-Learning/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXAMS = path.join(ROOT, "data/ip/exams");
const FIGDIR = path.join(EXAMS, "figures");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const BK = path.join(ROOT, "data/ip/quiz/.keyaudit/figfix_backup");
const results = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/.keyaudit/figfix_results.json"), "utf-8")).results;
const bank = JSON.parse(readFileSync(RB, "utf-8"));
const arr = bank.questions ?? bank;
const byId = new Map(arr.map((q) => [(q.id ?? q.question_id), q]));
mkdirSync(BK, { recursive: true });

// Cross-page cases (critic: bbox is relative to a DIFFERENT page than source.page_image):
const PAGE_OVERRIDE = { "2010h22h-q090": "pages/2010h22h/page-38.png" };
// Copy a known-good sibling crop instead of re-cropping (q099 shares 図1 with q097):
const COPY_FROM = { "2014h26h-q099": "2014h26h-q097" };

const DRY = process.argv.includes("--dry");
let recropped = 0, removed = 0, skipped = 0, copied = 0;
const log = [];
for (const r of results) {
  const q = byId.get(r.id);
  if (!q) { console.error(`✗ ${r.id} not in raw bank`); continue; }
  if (r.fix_type === "none") { skipped++; continue; }
  if (r.fix_type === "remove_figure") {
    log.push(`remove_figure ${r.id} (was has_figure=${q.has_figure})`);
    if (!DRY) { q.has_figure = false; }
    removed++;
    continue;
  }
  if (COPY_FROM[r.id]) {
    const src = path.join(FIGDIR, `${COPY_FROM[r.id]}.png`);
    const fig = path.join(FIGDIR, `${r.id}.png`);
    if (!existsSync(src)) { console.error(`✗ ${r.id} copy-source ${src} missing — SKIP`); continue; }
    log.push(`copy ${r.id} ← ${COPY_FROM[r.id]} (shared figure)`);
    if (!DRY) { if (existsSync(fig)) copyFileSync(fig, path.join(BK, `${r.id}.png`)); copyFileSync(src, fig); }
    copied++;
    continue;
  }
  if (r.fix_type === "recrop") {
    const b = r.correct_bbox_pct;
    if (!b || [b.x, b.y, b.w, b.h].some((v) => typeof v !== "number")) { console.error(`✗ ${r.id} recrop without valid bbox — SKIP`); continue; }
    const pageRel = PAGE_OVERRIDE[r.id] ?? q.source?.page_image;
    const page = pageRel ? path.join(EXAMS, pageRel) : null;
    const fig = path.join(FIGDIR, `${r.id}.png`);
    if (!page || !existsSync(page)) { console.error(`✗ ${r.id} page missing — SKIP`); continue; }
    log.push(`recrop ${r.id} bbox=${JSON.stringify(b)} page=${pageRel}`);
    if (!DRY) {
      if (existsSync(fig)) copyFileSync(fig, path.join(BK, `${r.id}.png`)); // backup orig
      const meta = await sharp(page).metadata();
      const left = Math.max(0, Math.round((b.x / 100) * meta.width));
      const top = Math.max(0, Math.round((b.y / 100) * meta.height));
      const width = Math.min(meta.width - left, Math.round((b.w / 100) * meta.width));
      const height = Math.min(meta.height - top, Math.round((b.h / 100) * meta.height));
      await sharp(page).extract({ left, top, width, height }).png().toFile(fig);
    }
    recropped++;
  }
}
if (!DRY) writeFileSync(RB, JSON.stringify(bank, null, 2) + "\n");
console.log(log.join("\n"));
console.log(`\n${DRY ? "[DRY] " : ""}✓ figfix-apply: recrop ${recropped} / copy ${copied} / remove_figure ${removed} / skip(none) ${skipped}`);
console.log(`Next: node scripts/build-quiz-figures.mjs && node scripts/build-quiz-corpus.mjs`);
