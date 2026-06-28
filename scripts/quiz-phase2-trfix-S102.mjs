#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S102 (D-137 / D-140) — drift-proof TRANSLATION
// SIDECAR fix for OCR number corruptions the Phase 1 translator carried into zh/en
// (and into stem_jp_clean for the ja display).
//
// Most OCR garble is JP-only (the translator saw through it), handled by
// quiz-phase2-stemfix-S102.mjs on the raw bank. But when the garble is a plain NUMBER
// (e.g. 306 vs 300, ISO/IEC 19519 vs 19510), the translator faithfully translated the
// wrong number, so zh/en (and stem_jp_clean when present) carry it too. This script
// fixes those displayed-translation fields directly in
//   data/ip/quiz/translations/<exam>.json
// (the sidecar is read directly by the app — no rebuild needed). Each fix is adjudicated
// against the source page at high magnification (q052 protocol) and asserts the `from`
// substring occurs EXACTLY ONCE in the targeted field. correct_answer is never touched.
//
// Run:  node scripts/quiz-phase2-trfix-S102.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = (exam) => path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);

// {exam, id, field, from, to}. field = "stem_jp_clean" | "stem.zh" | "stem.en".
const FIXES = [
  // 2023r05-q004: 利用料 306→300万円/年 (source page-03 = 300; only 300 makes a listed
  // choice consistent: X>1000 → イ=1,000). Displayed ja = stem_jp_clean; zh/en carried 306.
  { exam: "2023r05", id: "2023r05-q004", field: "stem_jp_clean", from: "利用料は306万円/年", to: "利用料は300万円/年" },
  { exam: "2023r05", id: "2023r05-q004", field: "stem.zh", from: "306 万日元/年", to: "300 万日元/年" },
  { exam: "2023r05", id: "2023r05-q004", field: "stem.en", from: "3,060,000 yen/year (306 ten-thousand yen/year)", to: "3,000,000 yen/year (300 ten-thousand yen/year)" },
  // 2023r05-q023: ISO/IEC 19519→19510 (source page-10 = 19510, BPMN's actual standard).
  // ja fixed in raw bank (no stem_jp_clean); zh/en carried 19519.
  { exam: "2023r05", id: "2023r05-q023", field: "stem.zh", from: "ISO/IEC 19519", to: "ISO/IEC 19510" },
  { exam: "2023r05", id: "2023r05-q023", field: "stem.en", from: "ISO/IEC 19519", to: "ISO/IEC 19510" },
];

function getField(entry, field) {
  if (field === "stem_jp_clean") return { obj: entry, key: "stem_jp_clean" };
  if (field === "stem.zh") return { obj: entry.stem, key: "zh" };
  if (field === "stem.en") return { obj: entry.stem, key: "en" };
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
  if (!obj || typeof obj[key] !== "string") throw new Error(`${f.id} ${f.field}: not a string`);
  const cur = obj[key];
  if (cur.includes(f.to) && !cur.includes(f.from)) { console.log(`  ~ ${f.id} ${f.field}: already applied, skip`); continue; }
  const n = cur.split(f.from).length - 1;
  if (n !== 1) throw new Error(`${f.id} ${f.field}: expected exactly 1 occurrence of "${f.from}" but found ${n} — aborting (drift guard). Current:\n${cur}`);
  obj[key] = cur.replace(f.from, f.to);
  changed++;
  console.log(`  ✓ ${f.id} ${f.field}: 「${f.from}」→「${f.to}」`);
}

if (changed > 0) for (const [exam, doc] of byExam) writeFileSync(TR(exam), JSON.stringify(doc, null, 2) + "\n");
console.log(`✓ quiz-phase2-trfix-S102: ${changed} field(s) applied across ${byExam.size} sidecar(s)`);
