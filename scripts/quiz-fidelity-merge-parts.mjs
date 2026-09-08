#!/usr/bin/env node
// Stage 6 / Quiz — S119 U0 (D-146 §4): 保真核験 workflow の **part file** を束ねて、従来と同じ形の全文結果 JSON を書く。
//
// なぜ必要か: Workflow 脚本の実行環境には filesystem / Node.js API が無い (workflow-authoring skill:
//   「No filesystem or Node.js API access」) ため、脚本内から audit 全文をファイルへ直接書けない。
//   そこで各核験 agent が自分の audit を `<parts_dir>/<id>.json` に Write し、本脚本が 0 token で束ねる。
//   workflow の return は計数 + 要約だけになり、主 context に audit 全文 (1 run 1〜2 万字) が流れ込まなくなる。
//
// Run: node scripts/quiz-fidelity-merge-parts.mjs <parts_dir> <fidelity_input.json> <exam_id> <out_path>
//   出力: out_path に {exam_id, n, cleanCount, discrepantCount, unreadable, bySeverity,
//                      onCorrectChoiceCount, discrepancies, audits} (= S118 までと同一の形)
//   exit 1 = part 欠落 / 壊れた part / id 不一致 / verdict 不正 → machdiff に掛ける前に要対応。

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [partsDirArg, inputPath, examId, outPathArg] = process.argv.slice(2);
if (!partsDirArg || !inputPath || !examId || !outPathArg) {
  console.error("usage: quiz-fidelity-merge-parts.mjs <parts_dir> <fidelity_input.json> <exam_id> <out_path>");
  process.exit(2);
}
const abs = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
const partsDir = abs(partsDirArg), outPath = abs(outPathArg);
if (!existsSync(partsDir)) { console.error(`✗ parts_dir not found: ${partsDirArg}`); process.exit(1); }

const input = JSON.parse(readFileSync(abs(inputPath), "utf-8"));
const wantIds = input.samples.map((s) => s.id);

const VERDICTS = new Set(["CLEAN", "DISCREPANT", "UNREADABLE"]);
let bad = 0;
const audits = [];
for (const id of wantIds) {
  const f = path.join(partsDir, `${id}.json`);
  if (!existsSync(f)) { console.log(`✗ MISSING part ${id}`); bad++; continue; }
  let a;
  try { a = JSON.parse(readFileSync(f, "utf-8")); }
  catch (e) { console.log(`✗ UNPARSEABLE part ${id}: ${e.message}`); bad++; continue; }
  if (a && a.result) a = a.result;                       // agent が {result:…} で包んだ場合の救済
  if (!a || typeof a !== "object") { console.log(`✗ BAD part ${id}: not an object`); bad++; continue; }
  if (a.id !== id) { console.log(`✗ ID MISMATCH ${id}: part says "${a.id}"`); bad++; continue; }
  if (!VERDICTS.has(a.verdict)) { console.log(`✗ BAD verdict ${id}: "${a.verdict}"`); bad++; continue; }
  if (!Array.isArray(a.discrepancies)) { console.log(`✗ BAD part ${id}: discrepancies is not an array`); bad++; continue; }
  if (a.verdict !== "UNREADABLE" && !a.source_transcript) console.log(`? ${id}: no source_transcript (machdiff will flag)`);
  audits.push(a);
}
const extra = readdirSync(partsDir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((id) => !wantIds.includes(id));
if (extra.length) console.log(`? ${extra.length} part file(s) not in input manifest (ignored): ${extra.slice(0, 5).join(", ")}${extra.length > 5 ? " …" : ""}`);

// 集計は workflow 側と同じ定義 (S118 までの evidence ファイルと同形にするため)
const discrepant = audits.filter((a) => a.verdict === "DISCREPANT");
const unreadable = audits.filter((a) => a.verdict === "UNREADABLE").map((a) => a.id);
const flat = discrepant.flatMap((a) => (a.discrepancies || []).map((d) => ({ id: a.id, ...d })));
const bySeverity = flat.reduce((m, d) => { m[d.severity] = (m[d.severity] || 0) + 1; return m; }, {});
const onCorrectChoiceCount = flat.filter((d) => d.is_correct_choice).length;

// 欠落/壊れた part があるまま out_path を書くと、machdiff の coverage 検査を通過してしまう
// 「一見完全な不完全ファイル」ができる。書かずに落とす (S119 U0 Rule D m-1)。
if (bad) {
  console.log(`✗ merge-parts ${examId}: ${bad} bad part(s) — ${path.relative(ROOT, outPath)} は書きません (part を直してから再実行)`);
  process.exit(1);
}

const out = {
  exam_id: examId,
  n: audits.length,
  cleanCount: audits.length - discrepant.length - unreadable.length,
  discrepantCount: discrepant.length,
  unreadable,
  bySeverity,
  onCorrectChoiceCount,
  discrepancies: flat,
  audits,
};
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`✓ merge-parts ${examId}: ${audits.length}/${wantIds.length} audits → ${path.relative(ROOT, outPath)}`);
console.log(`  CLEAN ${out.cleanCount} / DISCREPANT ${out.discrepantCount} / UNREADABLE ${unreadable.length}; 差分 ${flat.length} 件 ${JSON.stringify(bySeverity)}, 正解肢上 ${onCorrectChoiceCount} 件`);
