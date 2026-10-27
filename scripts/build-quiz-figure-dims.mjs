#!/usr/bin/env node
// OQ-14 (S135) — figure size manifest.
//
// Reads every committed apps/web/public/quiz-figures/*.webp and writes their intrinsic
// [width, height] to apps/web/src/lib/quiz/figureDims.json, so the practice face can give each
// <img> width / height and keep its space before it loads (a lazy figure of height 0 let the
// answer scroll run too early, then pushed the page down). Kept out of public/ (not served).
// build-quiz-figures.mjs runs this at its end; figureDims.test.ts guards drift.
//
// Run from repo root:  node scripts/build-quiz-figure-dims.mjs

import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(ROOT, "apps/web/package.json"));
const sharp = require("sharp");

const FIGURES = path.join(ROOT, "apps/web/public/quiz-figures");
const OUT = path.join(ROOT, "apps/web/src/lib/quiz/figureDims.json");

const dims = {};
for (const f of readdirSync(FIGURES).filter((x) => x.endsWith(".webp")).sort()) {
  const { width, height } = await sharp(path.join(FIGURES, f)).metadata();
  dims[f.slice(0, -".webp".length)] = [width, height];
}
writeFileSync(OUT, JSON.stringify(dims) + "\n");

console.log("✓ build-quiz-figure-dims");
console.log(`  figures : ${Object.keys(dims).length}`);
console.log(`  out     : apps/web/src/lib/quiz/figureDims.json`);
