#!/usr/bin/env node
// Stage 6 / Quiz Phase 0 (Session 86, D-134) — figure optimizer.
//
// Reads the 467 referenced exam figure PNGs (data/ip/exams/figures/, gitignored)
// and writes downscaled LOSSLESS WebP to apps/web/public/quiz-figures/
// (committed, statically served at /quiz-figures/<id>.webp).
// IPA-permitted educational reuse; 出典 carried per-question in the corpus.
//
// Lossless WebP (no compression artifacts on labels/numbers in diagrams/tables);
// downscale to ≤900px width only (figures scanned at ~1200px, web renders
// ≤700px) — resolution trim, not lossy recompression. Lossless WebP beats PNG.
//
// Run from repo root:  node scripts/build-quiz-figures.mjs

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// sharp is a devDependency of apps/web; resolve it from there (pnpm workspace).
const require = createRequire(path.join(ROOT, "apps/web/package.json"));
const sharp = require("sharp");

const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");
const SRC = path.join(ROOT, "data/ip/exams/figures");
const OUT = path.join(ROOT, "apps/web/public/quiz-figures");
const MAX_WIDTH = 900; // figures render ≤~700px on web; 900 stays crisp, trims size

function dirSize(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((s, f) => s + statSync(path.join(dir, f)).size, 0);
}
const mb = (n) => (n / 1024 / 1024).toFixed(1) + "M";

if (!existsSync(QUESTIONS)) {
  console.error("✗ run build-quiz-corpus.mjs first (questions.json missing)");
  process.exit(1);
}
const ids = JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions
  .map((q) => q.figure)
  .filter(Boolean);

// Idempotent: rebuild the output dir from scratch.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let srcTotal = 0;
let done = 0;
const failures = [];

for (const id of ids) {
  const srcFile = path.join(SRC, `${id}.png`);
  const outFile = path.join(OUT, `${id}.webp`);
  try {
    srcTotal += statSync(srcFile).size;
    const img = sharp(srcFile);
    const meta = await img.metadata();
    const pipeline = meta.width && meta.width > MAX_WIDTH
      ? img.resize({ width: MAX_WIDTH, withoutEnlargement: true })
      : img;
    await pipeline
      .webp({ lossless: true, effort: 6 })
      .toFile(outFile);
    done += 1;
  } catch (err) {
    failures.push({ id, error: String(err?.message ?? err) });
  }
}

const outTotal = dirSize(OUT);

console.log("✓ build-quiz-figures");
console.log(`  optimized : ${done}/${ids.length}`);
console.log(`  size      : ${mb(srcTotal)} → ${mb(outTotal)}  (${(100 * (1 - outTotal / srcTotal)).toFixed(0)}% smaller)`);
console.log(`  out       : apps/web/public/quiz-figures/`);
if (failures.length) {
  console.error(`  ✗ ${failures.length} failures, e.g.`, failures.slice(0, 3));
  process.exit(1);
}
