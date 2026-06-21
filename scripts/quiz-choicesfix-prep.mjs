#!/usr/bin/env node
// Stage 6 / Quiz Phase 1.6 (Session 99) — choices-fidelity track prep.
// Builds input for the choices-fix proposer over the 28 choices_faithful=false + 3 underivable
// questions found by the full key-audit sweep. Each entry: current stem + choices_jp + figure paths
// + the deriver's choices_issues (reference only; proposer must independently re-read the PAGE).
//   → data/ip/quiz/.keyaudit/input_choicesfix.json
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KA = path.join(ROOT, "data/ip/quiz/.keyaudit");
const FULL = JSON.parse(readFileSync(path.join(KA, "input_batch_FULL.json"), "utf-8"));
const byId = new Map(FULL.questions.map((q) => [q.id, q]));

const CHOICES_FLAGGED = ["2009h21a-q036","2010h22a-q061","2010h22a-q064","2010h22a-q066","2010h22a-q097","2010h22h-q005","2010h22h-q077","2010h22h-q079","2011h23a-q089","2011h23tokubetsu-q070","2011h23tokubetsu-q099","2012h24a-q023","2012h24h-q100","2013h25h-q068","2014h26h-q087","2014h26h-q090","2016h28h-q001","2016h28h-q012","2016h28h-q080","2016h28h-q096","2017h29a-q092","2017h29h-q069","2018h30h-q081","2019r01a-q099","2020r02o-q011","2024r06-q057","2024r06-q081","2025r07-q078"];
const UNDERIVABLE = ["2010h22a-q094","2012h24h-q087","2015h27a-q100"];

const out = [];
for (const id of [...CHOICES_FLAGGED, ...UNDERIVABLE]) {
  const q = byId.get(id);
  if (!q) { console.error("missing in FULL:", id); continue; }
  let issues = [];
  const rf = path.join(KA, `result_${id}.json`);
  if (existsSync(rf)) { const r = JSON.parse(readFileSync(rf, "utf-8")); issues = r.choices_issues || []; }
  out.push({ id, kind: UNDERIVABLE.includes(id) ? "underivable" : "choices", stem_jp: q.stem_jp, choices_jp: q.choices_jp, figure_png: q.figure_png, figure_page_png: q.figure_page_png, deriver_issues: issues });
}
writeFileSync(path.join(KA, "input_choicesfix.json"), JSON.stringify({ count: out.length, questions: out }, null, 2) + "\n");
console.log(`✓ choicesfix prep: ${out.length} (${CHOICES_FLAGGED.length} choices + ${UNDERIVABLE.length} underivable) → .keyaudit/input_choicesfix.json`);
