#!/usr/bin/env node
// Stage 6 / Quiz — S127 A2b: 訳層照合 (quiz-tr-fidelity.workflow.mjs) の入力 manifest を作る (0 token、画像なし)。
// 1 sample = 1 題: jp 表示層 (stem_jp_clean 優先 / choices_jp、源検証済 = 正)、zh / en (stem / choices)、
// correct_answer、jp の是正履歴 (targets.json の jp_history: unit / 旧 jp → 新 jp)。
//
// Run: node scripts/quiz-tr-prep-S127.mjs <label> <targets.json> [--ids id1,id2,…] [--tr-rev <id>=<git rev> …] [--batch-size N] [--model sonnet] [--pass sn]
//   targets.json = quiz-a2b-targets-S127.mjs の出力 (questions[].id / jp_history を読む)
//   --ids       targets のうちこの id だけを載せる (スモーク用。targets に無い id も可 = 履歴なし)
//   --tr-rev    その id の zh / en を git rev 時点の translations から取る (スモーク: 是正前の訳を入れる)。jp は常に現行
//   → data/ip/quiz/.phase2/<label>_tr_input.json
//   --batch-size N  N 題ずつの小 manifest を <label>_tr_batches/batch_NNN.json に書き、args に batch_size / batch_dir を載せる
//                   (workflow は各 agent にその小 manifest だけを読ませる。分割順は ids 順に N 件ずつ = workflow と同じ)
//   → data/ip/quiz/.phase2/<label>_tr_workflow_args.json
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const argv = process.argv.slice(2);
const take = (name) => { const out = []; for (let i = argv.indexOf(name); i >= 0; i = argv.indexOf(name)) { out.push(argv[i + 1]); argv.splice(i, 2); } return out; };
const idsOpt = take("--ids")[0];
const trRev = new Map(take("--tr-rev").map((s) => { const k = s.indexOf("="); return [s.slice(0, k), s.slice(k + 1)]; }));
const batchSize = Number(take("--batch-size")[0] ?? 0);
const model = take("--model")[0] ?? "sonnet";
const pass = take("--pass")[0] ?? "sn";
if (argv.some((a) => a.startsWith("--")) || argv.length !== 2) {
  console.error("✗ usage: quiz-tr-prep-S127.mjs <label> <targets.json> [--ids a,b] [--tr-rev id=rev …] [--model sonnet] [--pass sn]"); process.exit(2);
}
const [label, targetsArg] = argv;
const abs = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
const targets = JSON.parse(readFileSync(abs(targetsArg), "utf-8"));
const tById = new Map((targets.questions ?? []).map((q) => [q.id, q]));
const ids = idsOpt ? idsOpt.split(",").map((s) => s.trim()).filter(Boolean) : [...tById.keys()];

const Q = new Map(JSON.parse(readFileSync(P("data/ip/quiz/questions.json"), "utf-8")).questions.map((q) => [q.id, q]));
const TR = new Map();
const trOf = (exam, rev) => {
  const k = `${rev ?? "current"}|${exam}`;
  if (!TR.has(k)) {
    const rel = `data/ip/quiz/translations/${exam}.json`;
    TR.set(k, JSON.parse(rev ? execFileSync("git", ["-C", ROOT, "show", `${rev}:${rel}`], { encoding: "utf-8", maxBuffer: 1 << 26 }) : readFileSync(P(rel), "utf-8")).questions);
  }
  return TR.get(k);
};

const samples = ids.map((id) => {
  const q = Q.get(id); if (!q) throw new Error(`${id}: questions.json に無い`);
  const cur = trOf(q.exam_id)[id] ?? {};
  const t = trRev.has(id) ? trOf(q.exam_id, trRev.get(id))[id] ?? {} : cur;
  const letters = Object.keys(q.choices_jp ?? {});
  const lang = (l) => ({ stem: t.stem?.[l] ?? "", choices: Object.fromEntries(letters.map((L) => [L, t.choices?.[L]?.[l] ?? ""])) });
  const s = {
    id, exam_id: q.exam_id, question_number: Number(id.slice(-3)), correct_answer: q.correct_answer, has_figure: !!q.has_figure,
    jp: { stem: cur.stem_jp_clean?.trim() ? cur.stem_jp_clean : q.stem_jp, choices: q.choices_jp },
    zh: lang("zh"), en: lang("en"),
    jp_history: (tById.get(id)?.jp_history ?? []).map(({ unit, field, old_jp, new_jp }) => ({ unit, field, old_jp, new_jp })),
  };
  if (trRev.has(id)) s.tr_snapshot = trRev.get(id);
  return s;
});
const rel = (f) => path.relative(ROOT, f);
const manifest = P("data/ip/quiz/.phase2", `${label}_tr_input.json`);
writeFileSync(manifest, JSON.stringify({ kind: "tr_fidelity_input", label, count: samples.length, samples }, null, 2) + "\n");
const wfArgs = {
  input_path: rel(manifest), ids: samples.map((s) => s.id), model, label, pass,
  out_path: `evidence/phase5/stage_06_quiz_fidelity/${label}_tr_fidelity_${pass}.json`,
  parts_dir: `data/ip/quiz/.phase2/trparts/${label}_${pass}`,
};
if (batchSize > 0) {
  const dir = P("data/ip/quiz/.phase2", `${label}_tr_batches`);
  rmSync(dir, { recursive: true, force: true });   // 本脚本の生成物だけの dir。前回の分割の残骸を残さない
  mkdirSync(dir, { recursive: true });
  for (let i = 0, k = 1; i < samples.length; i += batchSize, k++) {
    const part = samples.slice(i, i + batchSize);
    writeFileSync(path.join(dir, `batch_${String(k).padStart(3, "0")}.json`), JSON.stringify({ kind: "tr_fidelity_input", label, batch: k, count: part.length, samples: part }, null, 2) + "\n");
  }
  Object.assign(wfArgs, { batch_size: batchSize, batch_dir: rel(dir) });
}
const argsFile = P("data/ip/quiz/.phase2", `${label}_tr_workflow_args.json`);
writeFileSync(argsFile, JSON.stringify(wfArgs, null, 2) + "\n");
console.log(`✓ tr-prep [${label}] ${samples.length} samples (履歴あり ${samples.filter((s) => s.jp_history.length).length}${trRev.size ? `、zh/en を git rev から ${trRev.size}` : ""}) → ${rel(manifest)}`);
console.log(`  workflow args → ${rel(argsFile)}${batchSize > 0 ? ` (batch_size ${batchSize} → ${Math.ceil(samples.length / batchSize)} agent、小 manifest ${wfArgs.batch_dir}/)` : ""}`);
