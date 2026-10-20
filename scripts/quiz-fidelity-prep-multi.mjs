#!/usr/bin/env node
// Stage 6 / Quiz — S127 A2a: 複数 exam にまたがる保真核験 input を 1 本の manifest にまとめる。
// 各 exam は既存の quiz-fidelity-prep-any.mjs をそのまま子プロセスで回す (precrop の較正は exam 単位のまま)。
// その出力 `<label>_fidelity_input_<exam>.json` の samples を exam 順・問番号順に連結し、
// `<label>_fidelity_input_multi.json` に書く。sample の形は単 exam manifest と同一 (id は exam 接頭辞付きで一意)。
// あわせて workflow に渡す args (ids 配列) を `<label>_workflow_args_multi.json` に書く。
//
// Run: node scripts/quiz-fidelity-prep-multi.mjs <label> <targets.json> [--precrop] [--model sonnet] [--pass sn]
//   targets.json は { exams: { "<exam_id>": [qnum, …] } } を持つ JSON (例 data/ip/quiz/.phase2/a2a_targets_S127.json)
//   → data/ip/quiz/.phase2/<label>_fidelity_input_<exam>.json (exam ごと、prep-any の通常出力)
//   → data/ip/quiz/.phase2/<label>_fidelity_input_multi.json
//   → data/ip/quiz/.phase2/<label>_workflow_args_multi.json
// 後段: workflow (args.ids) → quiz-fidelity-merge-parts.mjs (exam_id 引数は "multi") → quiz-fidelity-machdiff.mjs。
// どちらも manifest の samples を id で引くだけなので多 exam manifest をそのまま扱える。
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf(name); if (i < 0) return dflt; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const model = opt("--model", "sonnet");
const pass = opt("--pass", "sn");
const precrop = argv.includes("--precrop");
const pos = argv.filter((a) => !a.startsWith("--"));
const unknown = argv.filter((a) => a.startsWith("--") && a !== "--precrop");
if (unknown.length || pos.length !== 2) { console.error("✗ usage: quiz-fidelity-prep-multi.mjs <label> <targets.json> [--precrop] [--model sonnet] [--pass sn]"); process.exit(2); }
const [label, targetsArg] = pos;
const abs = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
const targets = JSON.parse(readFileSync(abs(targetsArg), "utf-8"));
const exams = Object.entries(targets.exams ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
if (!exams.length) { console.error("✗ targets.json に exams が無い"); process.exit(1); }

const samples = [];
for (const [exam, qnums] of exams) {
  const args = [path.join(ROOT, "scripts/quiz-fidelity-prep-any.mjs"), exam, label, [...qnums].sort((a, b) => a - b).join(",")];
  if (precrop) args.push("--precrop");
  process.stdout.write(execFileSync(process.execPath, args, { cwd: ROOT, encoding: "utf-8" }));
  const one = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/.phase2", `${label}_fidelity_input_${exam}.json`), "utf-8"));
  if (one.samples.length !== qnums.length) throw new Error(`${exam}: prep-any ${one.samples.length} samples ≠ targets ${qnums.length}`);
  samples.push(...one.samples.map((s) => ({ exam_id: exam, ...s })));
}
const ids = samples.map((s) => s.id);
if (new Set(ids).size !== ids.length) throw new Error("重複 id");

const rel = (f) => path.relative(ROOT, f);
const manifest = path.join(ROOT, "data/ip/quiz/.phase2", `${label}_fidelity_input_multi.json`);
writeFileSync(manifest, JSON.stringify({ exam_id: "multi", exam_ids: exams.map(([e]) => e), label, count: samples.length, samples }, null, 2) + "\n");
const wfArgs = {
  input_path: rel(manifest), exam_id: "multi", ids, model, label, pass,
  out_path: `evidence/phase5/stage_06_quiz_fidelity/${label}_fidelity_multi_${pass}.json`,
  parts_dir: `data/ip/quiz/.phase2/fidparts/${label}_multi_${pass}`,
};
const argsFile = path.join(ROOT, "data/ip/quiz/.phase2", `${label}_workflow_args_multi.json`);
writeFileSync(argsFile, JSON.stringify(wfArgs, null, 2) + "\n");
const cropped = samples.filter((s) => s.question_crop_png).length;
console.log(`✓ prep-multi [${label}] ${samples.length} samples / ${exams.length} exams${precrop ? ` (precrop ${cropped}/${samples.length})` : ""} → ${rel(manifest)}`);
console.log(`  workflow args → ${rel(argsFile)}`);
