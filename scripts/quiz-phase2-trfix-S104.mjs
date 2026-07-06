#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S104 (D-137 / D-140) — drift-proof TRANSLATION
// SIDECAR fix for an OCR corruption the Phase 1 translator carried into zh/en.
//
// Same contract as quiz-phase2-trfix-S102/S103.mjs. The fix is adjudicated against
// the source page (q052 protocol) and asserts the `from` substring occurs EXACTLY
// ONCE in the targeted field. correct_answer is never touched.
//
// Run:  node scripts/quiz-phase2-trfix-S104.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = (exam) => path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);

// {exam, id, field, from, to}.
// field = "stem_jp_clean" | "stem.zh" | "stem.en" | "choices.<letter>.zh" | "choices.<letter>.en"
const FIXES = [
  // 2019r01a-q026: OCR 量→書 in the stem opening (source page-12 = 「製品 A の
  // 生産計画量，」). Phase 1 carried it into stem_jp_clean + zh (生产计划书 = plan
  // *document*) + en ("production plan"). JP raw fixed in stemfix-S104. key ア
  // unchanged (table values were always correct).
  { exam: "2019r01a", id: "2019r01a-q026", field: "stem_jp_clean", from: "製品Aの生産計画書，", to: "製品Aの生産計画量，" },
  { exam: "2019r01a", id: "2019r01a-q026", field: "stem.zh", from: "产品A的生产计划书、", to: "产品A的生产计划量、" },
  { exam: "2019r01a", id: "2019r01a-q026", field: "stem.en", from: "the production plan for product A", to: "the planned production quantity for product A" },
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
console.log(`✓ quiz-phase2-trfix-S104: ${changed} field(s) applied`);
