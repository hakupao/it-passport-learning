#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 figure-display fix apply (Session 99; S127 C track で引数化).
// Reads --results <figfix results JSON> (critic verify+bbox). For each:
//   copy_from     → (結果 JSON 側の任意 field) 既知の正しい兄弟 crop を複製 (共有図)
//   recrop        → re-extract correct region from the figure page PNG (bbox %) → figures/<id>.png (backup orig)
//                   裁断元 = 結果 JSON の figure_page_override ?? source.figure_page_image ?? source.page_image
//   remove_figure → raw bank has_figure=false (+ figure cleared)
//   none          → false positive, skip
// Usage: node scripts/quiz-figfix-apply.mjs --results <path> [--backup-dir <dir>] [--dry]
//   --results は quiz-figfix.workflow.mjs の戻り値 JSON ({results:[…]}) か、その results 配列そのもの
//   --backup-dir 既定 data/ip/quiz/.keyaudit/figfix_backup_S127/。退避先に同名 png が既にあれば何も書かず停止。
// Then run: node scripts/build-quiz-figures.mjs && node scripts/build-quiz-corpus.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(path.join(ROOT, "apps/web/package.json"))("sharp");
const EXAMS = path.join(ROOT, "data/ip/exams");
const FIGDIR = path.join(EXAMS, "figures");
const RB = path.join(ROOT, "data/ip/exams/question_bank.json");
const argVal = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const RESULTS = argVal("--results");
if (!RESULTS) { console.error("✗ --results <figfix results JSON> is required"); process.exit(1); }
const BK = path.resolve(ROOT, argVal("--backup-dir") ?? "data/ip/quiz/.keyaudit/figfix_backup_S127");
const resultsRaw = JSON.parse(readFileSync(path.resolve(ROOT, RESULTS), "utf-8"));
const results = Array.isArray(resultsRaw) ? resultsRaw : resultsRaw.results; // workflow の戻り値 {results:[…]} / journal 由来の配列のどちらも可
const bank = JSON.parse(readFileSync(RB, "utf-8"));
const arr = bank.questions ?? bank;
const byId = new Map(arr.map((q) => [(q.id ?? q.question_id), q]));

// D-145: sharp に渡す裁断元は **図ページ** = `figure_page_image ?? page_image` (結果 JSON の figure_page_override が最優先)
const figurePageRel = (q) => q?.source?.figure_page_image ?? q?.source?.page_image;

// 既存の退避を上書きしない (S99 figfix_backup/ 等を守る): 退避対象が 1 つでも既にあれば何も書かずに停止
const toBackup = results.filter((r) => r.copy_from || r.fix_type === "recrop").map((r) => r.id)
  .filter((id) => existsSync(path.join(FIGDIR, `${id}.png`)));
const clash = toBackup.filter((id) => existsSync(path.join(BK, `${id}.png`)));
if (clash.length) { console.error(`✗ backup already exists in ${path.relative(ROOT, BK)}: ${clash.join(", ")} — STOP (nothing written)`); process.exit(1); }

const DRY = process.argv.includes("--dry");
if (!DRY) mkdirSync(BK, { recursive: true });
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
  if (r.copy_from) {
    const src = path.join(FIGDIR, `${r.copy_from}.png`);
    const fig = path.join(FIGDIR, `${r.id}.png`);
    if (!existsSync(src)) { console.error(`✗ ${r.id} copy-source ${src} missing — SKIP`); continue; }
    log.push(`copy ${r.id} ← ${r.copy_from} (shared figure)`);
    if (!DRY) { if (existsSync(fig)) copyFileSync(fig, path.join(BK, `${r.id}.png`)); copyFileSync(src, fig); }
    copied++;
    continue;
  }
  if (r.fix_type === "recrop") {
    const b = r.correct_bbox_pct;
    if (!b || [b.x, b.y, b.w, b.h].some((v) => typeof v !== "number")) { console.error(`✗ ${r.id} recrop without valid bbox — SKIP`); continue; }
    const pageRel = r.figure_page_override ?? figurePageRel(q);
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
