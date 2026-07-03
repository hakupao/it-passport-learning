#!/usr/bin/env node
// Stage 6 / Quiz Phase 2 SCALE batch S103 (D-137 / D-140) — drift-proof TRANSLATION
// SIDECAR fix for OCR corruptions the Phase 1 translator carried into zh/en.
//
// Same contract as quiz-phase2-trfix-S102.mjs, extended with choices.<letter>.<lang>
// field support (S103 need: choice-value contamination, not stem). Each fix is
// adjudicated against the source page at high magnification (q052 protocol) and
// asserts the `from` substring occurs EXACTLY ONCE in the targeted field.
// correct_answer is never touched.
//
// Run:  node scripts/quiz-phase2-trfix-S103.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TR = (exam) => path.join(ROOT, `data/ip/quiz/translations/${exam}.json`);

// {exam, id, field, from, to}.
// field = "stem_jp_clean" | "stem.zh" | "stem.en" | "choices.<letter>.zh" | "choices.<letter>.en"
const FIXES = [
  // 2022r04-q092 ウ: Bluetooth 3.6 → 3.0 (source page-42 at 5x = 3.0; 3.6 does not
  // exist). Phase 1 translator carried the OCR digit into zh/en. JP fixed in raw bank
  // (stemfix-S103). key イ unchanged.
  { exam: "2022r04", id: "2022r04-q092", field: "choices.ウ.zh", from: "Bluetooth 3.6", to: "Bluetooth 3.0" },
  { exam: "2022r04", id: "2022r04-q092", field: "choices.ウ.en", from: "Bluetooth 3.6", to: "Bluetooth 3.0" },
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
console.log(`✓ quiz-phase2-trfix-S103: ${changed} field(s) applied across ${byExam.size} sidecar(s)`);
