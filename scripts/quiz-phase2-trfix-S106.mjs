#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S106 (D-137 / D-140) — drift-proof TRANSLATION
// SIDECAR fix for an OCR corruption the Phase 1 translator carried into the displayed
// clean stem + zh/en.
//
// Same contract as quiz-phase2-trfix-S102..S104.mjs. Adjudicated against the source
// page (q052 protocol). Asserts the `from` substring occurs EXACTLY ONCE in the field.
// correct_answer is never touched.
//
// Run:  node scripts/quiz-phase2-trfix-S106.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = (exam) => path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);

// {exam, id, field, from, to}.
// field = "stem_jp_clean" | "stem.zh" | "stem.en" | "choices.<letter>.zh" | "choices.<letter>.en"
const FIXES = [
  // 2018h30h-q077: OCR 599G→500G in the RAID5 stem (source page-34 = 「1台の HDD の
  // 容量が500G バイトのとき」). Phase 1 carried 599 into the displayed clean stem + zh +
  // en. JP raw fixed in stemfix-S106. key ウ (=1.5T at 500G) unchanged.
  { exam: "2018h30h", id: "2018h30h-q077", field: "stem_jp_clean", from: "599G", to: "500G" },
  { exam: "2018h30h", id: "2018h30h-q077", field: "stem.zh", from: "599G", to: "500G" },
  { exam: "2018h30h", id: "2018h30h-q077", field: "stem.en", from: "599 GB", to: "500 GB" },
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
  if (n !== 1) throw new Error(`${f.id} ${f.field}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting (drift guard)`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} ${f.field}`);
}

for (const [exam, doc] of byExam) writeFileSync(TR(exam), JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-phase2-trfix-S106: ${changed} field(s) applied`);
