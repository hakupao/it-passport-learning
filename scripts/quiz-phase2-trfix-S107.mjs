#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S107 (D-137 / D-140) — drift-proof TRANSLATION
// SIDECAR fixes for OCR corruptions the Phase 1 translator carried into the displayed
// clean stem + zh/en (2017h29a q009 / q016 / q040).
//
// Same contract as quiz-phase2-trfix-S102..S106.mjs. Adjudicated against the source
// page (q052 protocol). Asserts the `from` substring occurs EXACTLY ONCE in the field.
// correct_answer is never touched. JP raw stems fixed in stemfix-S107.
//
//   q009: 販売価格1,099→1,000 / 10,999→10,000個 / 1,099→1,000千 / 12,900→12,000個 /
//         1,860→1,800千 (source page-05). stem_jp_clean IS the JP display authority here.
//   q016: 固定費 156→150万円 (source page-08). stem_jp_clean is null (JP display = raw,
//         fixed via stemfix-S107) so only zh/en are patched here.
//   q040: 26→20日 (source page-17).
//
// Run:  node scripts/quiz-phase2-trfix-S107.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = (exam) => path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);

// {exam, id, field, from, to}.
// field = "stem_jp_clean" | "stem.zh" | "stem.en" | "choices.<letter>.zh" | "choices.<letter>.en"
const FIXES = [
  // --- q009: five OCR figures in the clean JP stem + zh + en ---
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem_jp_clean", from: "販売価格1,099円", to: "販売価格1,000円" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem_jp_clean", from: "10,999個", to: "10,000個" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem_jp_clean", from: "1,099千円", to: "1,000千円" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem_jp_clean", from: "12,900個", to: "12,000個" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem_jp_clean", from: "1,860千円", to: "1,800千円" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.zh", from: "销售价格为1,099日元", to: "销售价格为1,000日元" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.zh", from: "售出10,999个", to: "售出10,000个" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.zh", from: "1,099千日元", to: "1,000千日元" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.zh", from: "售出12,900个", to: "售出12,000个" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.zh", from: "1,860千日元", to: "1,800千日元" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.en", from: "selling price of 1,099 yen", to: "selling price of 1,000 yen" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.en", from: "selling 10,999 units", to: "selling 10,000 units" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.en", from: "profit of 1,099 thousand yen", to: "profit of 1,000 thousand yen" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.en", from: "selling 12,900 units", to: "selling 12,000 units" },
  { exam: "2017h29a", id: "2017h29a-q009", field: "stem.en", from: "profit of 1,860 thousand yen", to: "profit of 1,800 thousand yen" },
  // --- q016: 固定費 156→150 (zh/en only; stem_jp_clean is null) ---
  { exam: "2017h29a", id: "2017h29a-q016", field: "stem.zh", from: "固定成本为 156 万日元", to: "固定成本为 150 万日元" },
  { exam: "2017h29a", id: "2017h29a-q016", field: "stem.en", from: "fixed costs of 1.56 million yen", to: "fixed costs of 1.5 million yen" },
  // --- q040: 26→20日 in clean JP + zh + en ---
  { exam: "2017h29a", id: "2017h29a-q040", field: "stem_jp_clean", from: "26日掛かる", to: "20日掛かる" },
  { exam: "2017h29a", id: "2017h29a-q040", field: "stem.zh", from: "需要26天", to: "需要20天" },
  { exam: "2017h29a", id: "2017h29a-q040", field: "stem.en", from: "takes 26 days", to: "takes 20 days" },
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
console.log(`✓ quiz-phase2-trfix-S107: ${changed} field(s) applied`);
