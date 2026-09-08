#!/usr/bin/env node
// Stage 6 / Quiz — S119 U0 (D-146 §4): 保真核験 workflow の **part file** を束ねて、従来と同じ形の全文結果 JSON を書く。
//
// なぜ必要か: Workflow 脚本の実行環境には filesystem / Node.js API が無い (workflow-authoring skill:
//   「No filesystem or Node.js API access」) ため、脚本内から audit 全文をファイルへ直接書けない。
//   そこで各核験 agent が自分の audit を `<parts_dir>/<id>.json` に Write し、本脚本が 0 token で束ねる。
//   workflow の return は計数 + 要約だけになり、主 context に audit 全文 (1 run 1〜2 万字) が流れ込まなくなる。
//
// Run: node scripts/quiz-fidelity-merge-parts.mjs <parts_dir> <fidelity_input.json> <exam_id> <out_path> [--journal <journal.jsonl>]
//   --journal (S121 ⑨): workflow の journal.jsonl (`{"type":"result","result":{…}}` 行 = agent の StructuredOutput、
//     schema 検証済) を**正**として読む。S120 U1 で part が壊れた 2/68 (Write の途中切断・末尾余分文字) と、
//     part ≠ StructuredOutput 31/68 (notes_jp の言い回し差) が出たため、journal に在る id は journal を採り、
//     無い id だけ part file に回退する (どちらを採ったかは stdout に出す)。
//   出力: out_path に {exam_id, n, cleanCount, discrepantCount, unreadable, bySeverity,
//                      onCorrectChoiceCount, discrepancies, audits} (= S118 までと同一の形)
//   exit 1 = part 欠落 / 壊れた part / id 不一致 / verdict 不正 → machdiff に掛ける前に要対応。
//   --journal 時: journal に在る id の part 欠落/壊れは**警告表示のみで exit 0** (journal が正)。journal にも無い id だけ exit 1。

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
let journalArg = null;
const jIdx = argv.indexOf("--journal");
if (jIdx >= 0) {
  journalArg = argv[jIdx + 1];
  if (!journalArg || journalArg.startsWith("--")) { console.error("✗ --journal には journal.jsonl のパスが必要"); process.exit(2); }
  argv.splice(jIdx, 2);
  if (argv.includes("--journal")) { console.error("✗ --journal は 1 回だけ"); process.exit(2); }
}
const [partsDirArg, inputPath, examId, outPathArg] = argv;
if (!partsDirArg || !inputPath || !examId || !outPathArg || argv.length > 4) {
  console.error("usage: quiz-fidelity-merge-parts.mjs <parts_dir> <fidelity_input.json> <exam_id> <out_path> [--journal <journal.jsonl>]");
  process.exit(2);
}
const abs = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
const partsDir = abs(partsDirArg), outPath = abs(outPathArg);
if (!existsSync(partsDir)) { console.error(`✗ parts_dir not found: ${partsDirArg}`); process.exit(1); }

const input = JSON.parse(readFileSync(abs(inputPath), "utf-8"));
const wantIds = input.samples.map((s) => s.id);

// --journal: journal.jsonl の result 行を id → result で索引する (同 id が複数行なら最後の行を採る = resume 時の再実行分)
const journal = new Map();
if (journalArg) {
  const jp = abs(journalArg);
  if (!existsSync(jp)) { console.error(`✗ journal not found: ${journalArg}`); process.exit(1); }
  let lineNo = 0, badLines = 0;
  for (const line of readFileSync(jp, "utf-8").split("\n")) {
    lineNo++;
    if (!line.trim()) continue;
    let rec;
    try { rec = JSON.parse(line); } catch { badLines++; continue; }
    if (rec?.type !== "result" || !rec.result || typeof rec.result !== "object") continue;
    // 失敗行の防御: 現行 journal は失敗を type:"failed" で別行に書くが、result 行に成否印が付く形式にも備える (S121 MINOR-4)
    if (rec.is_error === true || (rec.subtype && rec.subtype !== "success")) continue;
    const r = rec.result.result && typeof rec.result.result === "object" ? rec.result.result : rec.result;
    if (typeof r.id === "string") journal.set(r.id, r);
  }
  console.log(`journal: ${journal.size} result(s) from ${path.relative(ROOT, jp)}${badLines ? ` (${badLines} unparseable line(s) skipped)` : ""}`);
}

const VERDICTS = new Set(["CLEAN", "DISCREPANT", "UNREADABLE"]);
let bad = 0, fromJournal = 0, fromPart = 0, partMissingUnderJournal = 0;
const audits = [];
for (const id of wantIds) {
  let a, src;
  if (journal.has(id)) {
    a = journal.get(id); src = "journal";
    // journal が正でも、part が無い/壊れているのは agent の Write 失敗なので数えて出す (S121 MINOR-5)
    const f = path.join(partsDir, `${id}.json`);
    if (!existsSync(f)) { console.log(`? ${id}: part file 無し (journal を採用)`); partMissingUnderJournal++; }
    else { try { JSON.parse(readFileSync(f, "utf-8")); } catch { console.log(`? ${id}: part file 壊れ (journal を採用)`); partMissingUnderJournal++; } }
  } else {
    const f = path.join(partsDir, `${id}.json`);
    if (!existsSync(f)) { console.log(`✗ MISSING part ${id}${journalArg ? " (journal にも無し)" : ""}`); bad++; continue; }
    try { a = JSON.parse(readFileSync(f, "utf-8")); }
    catch (e) { console.log(`✗ UNPARSEABLE part ${id}: ${e.message}`); bad++; continue; }
    if (a && a.result) a = a.result;                       // agent が {result:…} で包んだ場合の救済
    if (journalArg) console.log(`? ${id}: journal に無いため part file に回退`);
    src = "part";
  }
  if (!a || typeof a !== "object") { console.log(`✗ BAD part ${id}: not an object`); bad++; continue; }
  if (a.id !== id) { console.log(`✗ ID MISMATCH ${id}: part says "${a.id}"`); bad++; continue; }
  if (!VERDICTS.has(a.verdict)) { console.log(`✗ BAD verdict ${id}: "${a.verdict}"`); bad++; continue; }
  if (!Array.isArray(a.discrepancies)) { console.log(`✗ BAD part ${id}: discrepancies is not an array`); bad++; continue; }
  if (a.verdict !== "UNREADABLE" && !a.source_transcript) console.log(`? ${id}: no source_transcript (machdiff will flag)`);
  if (src === "journal") fromJournal++; else fromPart++;   // 検証通過後に加算 (S121 NIT-5)
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
console.log(`✓ merge-parts ${examId}: ${audits.length}/${wantIds.length} audits → ${path.relative(ROOT, outPath)}${journalArg ? ` (journal ${fromJournal} / part ${fromPart}; journal 採用のうち part 欠落/壊れ ${partMissingUnderJournal})` : ""}`);
console.log(`  CLEAN ${out.cleanCount} / DISCREPANT ${out.discrepantCount} / UNREADABLE ${unreadable.length}; 差分 ${flat.length} 件 ${JSON.stringify(bySeverity)}, 正解肢上 ${onCorrectChoiceCount} 件`);
