#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 — S112 translation-layer fixes (2013h25h).
//
// q093: the stem's cell-D2 formula was corrupted B14→D1 at extraction; the zh/en stem
// translations were made from the corrupted JP and carry the same wrong formula literal.
// The formula is a verbatim token, so this is a deterministic replacement — no LLM needed
// (same class as quiz-phase2-trfix-S107 numeric fixes).
//
// Run: node scripts/quiz-phase2-trfix-S112.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const E = "2013h25h";
const TR = path.join(ROOT, `data/ip/quiz/translations/${E}.json`);

const FIXES = [
  { id: `${E}-q093`, field: "zh", from: "计算公式「D1+C2-B2」", to: "计算公式「B14+C2-B2」" },
  { id: `${E}-q093`, field: "en", from: 'the formula "D1+C2-B2"', to: 'the formula "B14+C2-B2"' },
];

const doc = JSON.parse(readFileSync(TR, "utf-8"));
let edits = 0;
for (const f of FIXES) {
  const t = doc.questions[f.id];
  if (!t?.stem?.[f.field]) throw new Error(`${f.id}: stem.${f.field} missing`);
  const cur = t.stem[f.field];
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} stem.${f.field}: expected exactly 1 occurrence of «${f.from}», found ${n}`);
  t.stem[f.field] = cur.replace(f.from, f.to);
  edits++;
  console.log(`  ✓ ${f.id} stem.${f.field}`);
}
writeFileSync(TR, JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-phase2-trfix-S112: ${edits} fields`);
