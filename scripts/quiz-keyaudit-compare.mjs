#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 98, D-139-B) — compare blind-derived answers vs stored keys.
//
// Reads the per-id blind-derivation results (data/ip/quiz/.keyaudit/result_<id>.json, written
// by quiz-keyaudit.workflow.mjs) and compares derived_answer against the STORED correct_answer
// in data/ip/quiz/questions.json (the key was never shown to the deriver). Reports:
//   - bad-key candidates (derivable && derived != stored key)  → 主 context が figure 高倍率実読で裁決
//   - choices_faithful=false                                   → choices 腐敗 backlog
//   - underivable / low-confidence                             → incomplete-source / 要確認
//
// Run:  node scripts/quiz-keyaudit-compare.mjs            (all result_*.json on disk)
//       node scripts/quiz-keyaudit-compare.mjs <exam_id>  (filter to one exam)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEYAUDIT = path.join(ROOT, "data/ip/quiz/.keyaudit");
const QUESTIONS = path.join(ROOT, "data/ip/quiz/questions.json");

const examFilter = process.argv[2] ?? null;
const Q = new Map(JSON.parse(readFileSync(QUESTIONS, "utf-8")).questions.map((q) => [q.id, q.correct_answer]));

if (!existsSync(KEYAUDIT)) { console.error("✗ no .keyaudit dir (run prep + workflow first)"); process.exit(1); }
const files = readdirSync(KEYAUDIT).filter((f) => /^result_.+\.json$/.test(f));
const results = [];
for (const f of files) {
  const id = f.slice(7, -5);
  if (examFilter && !id.startsWith(examFilter + "-")) continue;
  try { results.push(JSON.parse(readFileSync(path.join(KEYAUDIT, f), "utf-8"))); } catch (e) { console.error(`  unparseable ${f}: ${e.message}`); }
}
results.sort((a, b) => String(a.id).localeCompare(String(b.id)));

const norm = (s) => { const m = String(s).match(/[アイウエ]/); return m ? m[0] : ""; };
const badKey = [], choicesBad = [], underiv = [], lowConf = [];
for (const r of results) {
  const key = Q.get(r.id);
  const d = norm(r.derived_answer);
  if (r.derivable && d && key && d !== key) badKey.push({ id: r.id, derived: d, key, conf: r.confidence });
  if (r.choices_faithful === false) choicesBad.push({ id: r.id, issues: (r.choices_issues || []).map((i) => `${i.choice}:${i.detail_jp}`) });
  if (!r.derivable || r.derived_answer === "UNDERIVABLE") underiv.push(r.id);
  if (r.confidence === "low") lowConf.push(r.id);
}

console.log(`=== quiz-keyaudit-compare${examFilter ? " " + examFilter : ""} ===`);
console.log(`results: ${results.length}`);
console.log(`\n🔴 bad-key candidates (derived != stored key): ${badKey.length}`);
for (const b of badKey) console.log(`   ${b.id}  derived=${b.derived}  key=${b.key}  conf=${b.conf}`);
console.log(`\n⚠️  choices_faithful=false (choices 腐敗): ${choicesBad.length}`);
for (const c of choicesBad) { console.log(`   ${c.id}`); for (const i of c.issues) console.log(`       ${i.slice(0, 120)}`); }
console.log(`\n⚪ underivable (incomplete-source 疑い): ${underiv.length}${underiv.length ? " → " + underiv.join(", ") : ""}`);
console.log(`⚪ low-confidence: ${lowConf.length}${lowConf.length ? " → " + lowConf.join(", ") : ""}`);
console.log(`\n→ bad-key candidates は 独立 critic 再導出 + 主 context figure 高倍率実読 で裁決 (D-139-B 写審分離)。confirmed のみ D-139-A 同方式で是正。`);
