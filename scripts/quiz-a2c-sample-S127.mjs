#!/usr/bin/env node
// Stage 6 / Quiz — S127 A track **A2c** (D-150 §4 段 2 = 方式 B の抽検) の標本 (0 token、冪等、読み取り専用)。
// 母集団 = pop (⑤-2 母数内 1,208 題) のうち、jp 表示層 (stem = stem_jp_clean 優先 / choices_jp) のどこかに数字
// (NFKC 後の [0-9]) を含む題。exam で層化し、比例配分 (最大剰余法、同点は exam 名順) で計 N 題を無作為抽出する。
// 乱数は seed 固定の mulberry32 (exam ごとに seed と exam 名から派生) → 何度実行しても同じ標本。
// ⑤-2 で同じ題を照合済みなので、⑤-2 の結果 (各 result JSON の verdict / 差分 field) を evidence 用リストに併記する。
//
// Run: node scripts/quiz-a2c-sample-S127.mjs [--n 60] [--seed 20261020]
//   → data/ip/quiz/.phase2/a2c_targets_S127.json (quiz-fidelity-prep-multi.mjs の入力: exams → qnums)
//   → evidence/phase5/stage_06_quiz_fidelity/a2c_targets_S127.json (同内容の写し)
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const P = (...s) => path.join(ROOT, ...s);
const argv = process.argv.slice(2);
const opt = (name, d) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : d; };
const N = Number(opt("--n", 60));
const SEED = Number(opt("--seed", 20261020));
const OUTS = ["data/ip/quiz/.phase2/a2c_targets_S127.json", "evidence/phase5/stage_06_quiz_fidelity/a2c_targets_S127.json"];
const FID_DIR = "evidence/phase5/stage_06_quiz_fidelity";

const POP = JSON.parse(readFileSync(P(FID_DIR, "full52_population_S118.json"), "utf-8"));
const POP_EXAMS = new Set(Object.values(POP.exams).map((x) => x.exam_id));
const EXCLUDED = new Set(Object.values(POP.exams).flatMap((x) => x.excluded.map((e) => e.id)));
const Q = JSON.parse(readFileSync(P("data/ip/quiz/questions.json"), "utf-8")).questions;
const TR = {};
const hasDigit = (s) => /[0-9]/.test(String(s ?? "").normalize("NFKC"));

const eligible = new Map();   // exam → [{id, fields}]
for (const q of Q) {
  if (!POP_EXAMS.has(q.exam_id) || EXCLUDED.has(q.id)) continue;
  TR[q.exam_id] ??= JSON.parse(readFileSync(P("data/ip/quiz/translations", `${q.exam_id}.json`), "utf-8")).questions;
  const c = TR[q.exam_id][q.id]?.stem_jp_clean;
  const fields = { stem: c?.trim() ? c : q.stem_jp, ...Object.fromEntries(Object.entries(q.choices_jp ?? {}).map(([k, v]) => [`choice.${k}`, v])) };
  const dig = Object.keys(fields).filter((f) => hasDigit(fields[f]));
  if (!dig.length) continue;
  if (!eligible.has(q.exam_id)) eligible.set(q.exam_id, []);
  eligible.get(q.exam_id).push({ id: q.id, question_number: Number(q.id.slice(-3)), digit_fields: dig });   // questions.json に question_number は無い
}
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const examsSorted = [...eligible.keys()].sort(cmp);
const total = examsSorted.reduce((n, e) => n + eligible.get(e).length, 0);

// 比例配分 (最大剰余法)
const quota = examsSorted.map((e) => { const x = (N * eligible.get(e).length) / total; return { e, k: Math.floor(x), r: x - Math.floor(x) }; });
let rest = N - quota.reduce((n, x) => n + x.k, 0);
for (const x of [...quota].sort((a, b) => b.r - a.r || cmp(a.e, b.e))) { if (rest <= 0) break; x.k++; rest--; }

// seed 固定の mulberry32
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const strHash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const picked = [];
for (const { e, k } of quota) {
  const pool = [...eligible.get(e)].sort((a, b) => a.question_number - b.question_number);
  const rnd = mulberry32((SEED ^ strHash(e)) >>> 0);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  picked.push(...pool.slice(0, k).map((x) => ({ ...x, exam_id: e })));
}

// ⑤-2 の結果 (全 result JSON の audits) を id で索引
const FIVE2 = new Map();
for (const f of readdirSync(P(FID_DIR)).filter((f) => /^full52_fidelity_.*\.json$/.test(f)).sort()) {
  let r = JSON.parse(readFileSync(P(FID_DIR, f), "utf-8"));
  if (!r.audits && r.result) r = r.result;   // 波 2・3 の一部は workflow 出力の {result:{…}} 包みのまま (machdiff と同じ救済)
  for (const a of r.audits ?? []) {
    if (!FIVE2.has(a.id)) FIVE2.set(a.id, []);
    FIVE2.get(a.id).push({ file: f, verdict: a.verdict, discrepancy_fields: [...new Set((a.discrepancies ?? []).map((d) => d.field))] });
  }
}
const questions = picked.sort((a, b) => cmp(a.exam_id, b.exam_id) || a.question_number - b.question_number)
  .map((x) => ({ id: x.id, exam_id: x.exam_id, question_number: x.question_number, digit_fields: x.digit_fields, five2: FIVE2.get(x.id) ?? [] }));
const exams = {};
for (const q of questions) (exams[q.exam_id] ??= []).push(q.question_number);
const five2Verdict = (q) => (q.five2.some((r) => r.verdict === "DISCREPANT") ? "DISCREPANT" : q.five2.length ? q.five2[0].verdict : "none");
const out = {
  schema: "a2c_targets/1",
  script: "scripts/quiz-a2c-sample-S127.mjs",
  decision: "D-150 §4 段 2 (方式 B) の抽検",
  sampling: { n: N, seed: SEED, prng: "mulberry32(seed ^ fnv1a(exam_id))、exam 内 Fisher-Yates", stratification: "exam 比例配分 (最大剰余法)", population: "pop (母数内、excluded 除く) かつ jp 表示層 (stem_jp_clean 優先 / choices_jp) に NFKC 後の数字を含む題" },
  population_by_exam: Object.fromEntries(examsSorted.map((e) => [e, eligible.get(e).length])),
  population_total: total,
  allocation: Object.fromEntries(quota.map(({ e, k }) => [e, k])),
  five2_summary: { DISCREPANT: questions.filter((q) => five2Verdict(q) === "DISCREPANT").length, CLEAN: questions.filter((q) => five2Verdict(q) === "CLEAN").length, other: questions.filter((q) => !["DISCREPANT", "CLEAN"].includes(five2Verdict(q))).length },
  exams,
  questions,
};
const body = JSON.stringify(out, null, 1) + "\n";
for (const o of OUTS) writeFileSync(P(o), body);
console.log(`A2c sample: ${questions.length} / 母集団 ${total} 題 (${examsSorted.length} exam)、⑤-2 判定 DISCREPANT ${out.five2_summary.DISCREPANT} / CLEAN ${out.five2_summary.CLEAN} / その他 ${out.five2_summary.other}`);
console.log(`  配分: ${quota.map(({ e, k }) => `${e}=${k}/${eligible.get(e).length}`).join(" ")}`);
for (const o of OUTS) console.log(`  → ${o}`);
