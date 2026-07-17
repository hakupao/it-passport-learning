#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S108 (D-137 / D-140) — drift-proof TRANSLATION
// SIDECAR fixes (2016h28h q016 / q018).
//
// Same contract as quiz-phase2-trfix-S102..S107.mjs. Adjudicated against the source page.
// Asserts `from` occurs EXACTLY ONCE in the field. correct_answer never touched.
//
//   q016: ISO 9991→9001 propagated into stem.zh + stem.en (source page-08). JP raw stem
//         fixed in stemfix-S108 (stem_jp_clean is null).
//   q018: stem_jp_clean IS the JP display authority; source (page-09) reads 「組立生産される
//         製品」but clean dropped 「生産」→「組立される製品」. Restore. zh/en render the concept
//         faithfully (组装 / assembly) so are left unchanged. Answer (Z=20=ウ) unchanged.
//
// Run:  node scripts/quiz-phase2-trfix-S108.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = (exam) => path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);

// {exam, id, field, from, to}. field = "stem_jp_clean" | "stem.zh" | "stem.en" | "choices.<letter>.zh|en"
const FIXES = [
  { exam: "2016h28h", id: "2016h28h-q016", field: "stem.zh", from: "ISO 9991", to: "ISO 9001" },
  { exam: "2016h28h", id: "2016h28h-q016", field: "stem.en", from: "ISO 9991", to: "ISO 9001" },
  { exam: "2016h28h", id: "2016h28h-q018", field: "stem_jp_clean", from: "組立される製品", to: "組立生産される製品" },
];

function getField(entry, field) {
  if (field === "stem_jp_clean") return { obj: entry, key: "stem_jp_clean" };
  if (field === "stem.zh") return { obj: entry.stem, key: "zh" };
  if (field === "stem.en") return { obj: entry.stem, key: "en" };
  const m = field.match(/^choices\.(.+)\.(zh|en)$/);
  if (m) return { obj: entry.choices?.[m[1]], key: m[2] };
  throw new Error(`unknown field ${field}`);
}

const byExam = new Map();
for (const f of FIXES) {
  if (!byExam.has(f.exam)) byExam.set(f.exam, JSON.parse(readFileSync(TR(f.exam), "utf-8")));
}

let changed = 0;
for (const f of FIXES) {
  const doc = byExam.get(f.exam);
  const entry = doc.questions?.[f.id];
  if (!entry) throw new Error(`${f.id}: not in translations/${f.exam}.json`);
  const { obj, key } = getField(entry, f.field);
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.id} ${f.field}: field missing`);
  const cur = obj[key];
  if (cur.includes(f.to) && !cur.includes(f.from)) {
    console.log(`  ~ ${f.id} ${f.field}: already fixed, skip`);
    continue;
  }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.field}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} ${f.field}`);
}

for (const [exam, doc] of byExam) writeFileSync(TR(exam), JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-phase2-trfix-S108: ${changed} field(s) applied`);
