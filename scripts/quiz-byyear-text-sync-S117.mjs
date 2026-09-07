#!/usr/bin/env node
// Stage 6 / Quiz — S117: 最上流 `data/ip/exams/by_year/*.json` の stem_jp / choices_jp を question_bank.json に同期する。
//
// 背景: パイプラインは by_year → merge-question-bank.mjs → question_bank.json → build → questions.json。
// S117 実測で question_bank ≡ questions.json (stem_jp / choices_jp / correct_answer で差 0) だが、
// **by_year は 284 問で旧 OCR 文のまま** (S99〜S117 の是正の多くが by_year まで届いていない; S115g / S117 keyfix / fidfix は
// 対象 id だけ by_year を直したが全量は見ていなかった)。merge を再実行すると 284 問が退行する (S115g が指摘した退行リスクの全量版)。
// 方針: question_bank を正とし、by_year の stem_jp / choices_jp を機械的に一致させる (LLM なし・決定的)。
// correct_answer は S117 keyfix で既に同期済 (crosscheck B3 が監視)。以後は crosscheck B5 が 3 層一致を常時監視する。
// Run: node scripts/quiz-byyear-text-sync-S117.mjs [--dry-run]

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const rj = (f) => JSON.parse(readFileSync(f, "utf-8"));
const BY = path.join(ROOT, "data/ip/exams/by_year");
const bank = new Map(rj(path.join(ROOT, "data/ip/exams/question_bank.json")).questions.map((q) => [q.id, q]));
const Q = new Map(rj(path.join(ROOT, "data/ip/quiz/questions.json")).questions.map((q) => [q.id, q]));
// 前提検査: bank ≡ questions.json (ここが崩れていたら bank を正にできない)
let pre = 0;
for (const [id, q] of Q) { const b = bank.get(id); if (!b) { pre++; continue; } if (b.stem_jp !== q.stem_jp) pre++; for (const L of new Set([...Object.keys(q.choices_jp ?? {}), ...Object.keys(b.choices_jp ?? {})])) if (b.choices_jp?.[L] !== q.choices_jp?.[L]) pre++; }
if (pre) { console.error(`✗ question_bank と questions.json が ${pre} フィールドで不一致 — 先にそちらを解決すること`); process.exit(1); }
let qChanged = 0, fields = 0; const perExam = {};
for (const f of readdirSync(BY).filter((x) => x.endsWith(".json")).sort()) {
  const p = path.join(BY, f); const d = rj(p); let touched = false;
  for (const y of d.questions) {
    const b = bank.get(y.id); if (!b) continue; let qt = false;
    if (y.stem_jp !== b.stem_jp) { y.stem_jp = b.stem_jp; fields++; qt = true; }
    for (const L of new Set([...Object.keys(y.choices_jp ?? {}), ...Object.keys(b.choices_jp ?? {})])) {
      if (y.choices_jp?.[L] !== b.choices_jp?.[L]) { y.choices_jp ??= {}; if (b.choices_jp?.[L] === undefined) delete y.choices_jp[L]; else y.choices_jp[L] = b.choices_jp[L]; fields++; qt = true; }
    }
    if (qt) { qChanged++; touched = true; perExam[d.exam_id] = (perExam[d.exam_id] || 0) + 1; }
  }
  if (touched && !DRY) writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
}
console.log(JSON.stringify(perExam));
console.log(`${DRY ? "(dry-run) " : "✓ "}by_year text sync: ${qChanged} 問 / ${fields} フィールドを question_bank に同期`);
