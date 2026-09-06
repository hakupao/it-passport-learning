#!/usr/bin/env node
// Stage 6 / Quiz — S117: by_year (最上流) の correct_answer を確定済み key に同期する。
//
// `quiz-keys-crosscheck.mjs` (S117 新設、backlog ⑥) の初回実行が B3 で 3 件を捕捉した:
//   2011h23a-q100  by_year=イ  確定 key=ウ  (D-139-A, S98 ユーザー承認の bad key 是正)
//   2014h26h-q100  by_year=イ  確定 key=ア  (S110、stem 2,900→2,000 是正に伴う key 裁決)
//   2015h27h-q100  by_year=エ  確定 key=ア  (D-139-A, S98 ユーザー承認の bad key 是正)
// いずれも question_bank / answer_keys / questions.json は既に確定値で一致しており、
// by_year だけが是正前の抽出値のまま残っていた (S98/S110 の是正は by_year を対象にしていなかった。
// by_year を層に含めたのは S115 が最初)。S115 の教訓「最上流も直さないと再生成で退行する」に従い同期する。
// **新しい key 裁決ではない** — 既に承認済みの値へ揃えるだけ。
//
// Run: node scripts/quiz-keyfix-S117-byyear-sync.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIX = [
  { id: "2011h23a-q100", from: "イ", to: "ウ", ref: "D-139-A (S98)" },
  { id: "2014h26h-q100", from: "イ", to: "ア", ref: "S110 §3" },
  { id: "2015h27h-q100", from: "エ", to: "ア", ref: "D-139-A (S98)" },
];
const questions = new Map(JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8")).questions.map((q) => [q.id, q.correct_answer]));

let changed = 0;
for (const f of FIX) {
  if (questions.get(f.id) !== f.to) throw new Error(`${f.id}: questions.json has ${questions.get(f.id)}, expected confirmed key ${f.to} — abort`);
  const exam = f.id.split("-q")[0];
  const fp = path.join(ROOT, "data/ip/exams/by_year", `${exam}.json`);
  const doc = JSON.parse(readFileSync(fp, "utf-8"));
  const arr = Array.isArray(doc) ? doc : (doc.questions ?? Object.values(doc));
  const rec = arr.find((x) => x.id === f.id);
  if (!rec) throw new Error(`${f.id}: not in by_year`);
  if (rec.correct_answer === f.to) { console.log(`  = ${f.id}: by_year 既に ${f.to}`); continue; }
  if (rec.correct_answer !== f.from) throw new Error(`${f.id}: by_year has ${rec.correct_answer}, expected ${f.from} — abort`);
  rec.correct_answer = f.to;
  writeFileSync(fp, JSON.stringify(doc, null, 2) + "\n");
  changed++;
  console.log(`  ✓ ${f.id}: by_year ${f.from} → ${f.to} (${f.ref})`);
}
console.log(`✓ quiz-keyfix-S117-byyear-sync: ${changed} 件同期`);
