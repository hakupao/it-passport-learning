#!/usr/bin/env node
// Stage 6 / Quiz — S117 N5: raw stem_jp の残穴 6 題を clean (translations.stem_jp_clean、源画像照合済) に揃える。
// 対象は S117 Rule D 審閲 (log §18b MINOR-2 / NIT-1、§20 NIT-5) が挙げた 6 題。いずれも表示層は clean が優先されるため
// 学習者への影響は無いが、raw を放置すると (a) 2021r03-q095 のように raw の数値で計算すると答えが翻る、(b) 再抽出・再生成
// 系の工程が raw を読んだ瞬間に腐敗が戻る。3 層 (questions / question_bank / by_year) を同時に更新し crosscheck B5 を保つ。
// 併せて 2026r08-q085 の clean に残っていた「余り が」(源は「余りが」) の空白を translations + .phase1 で除去する。
// Run: node scripts/quiz-fidfix-S117-n5.mjs [--dry-run]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path"; import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const DRY = process.argv.includes("--dry-run");
const P = (...s) => path.join(ROOT, ...s); const rj = (f) => JSON.parse(readFileSync(f, "utf-8")); const wj = (f, d) => { if (!DRY) writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
const IDS = ["2021r03-q095", "2019h31h-q068", "2016h28a-q082", "2016h28a-q092", "2021r03-q062", "2026r08-q085"];
const CLEAN_FIX = { "2026r08-q085": [["余り が", "余りが"]] };
let applied = 0, skipped = 0;
const exams = [...new Set(IDS.map((i) => i.split("-q")[0]))];
const Qd = rj(P("data/ip/quiz/questions.json")), Bd = rj(P("data/ip/exams/question_bank.json"));
const BY = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/exams/by_year", `${e}.json`))])); const TR = Object.fromEntries(exams.map((e) => [e, rj(P("data/ip/quiz/translations", `${e}.json`))]));
for (const id of IDS) {
  const e = id.split("-q")[0]; const t = TR[e].questions[id]; const t1f = P("data/ip/quiz/.phase1", `tr_${id}.json`); const t1 = existsSync(t1f) ? rj(t1f) : null;
  let t1Changed = false;
  for (const [from, to] of CLEAN_FIX[id] ?? []) for (const [o, w] of [[t, "translations"], [t1, ".phase1"]]) { if (o?.stem_jp_clean?.includes(from)) { o.stem_jp_clean = o.stem_jp_clean.split(from).join(to); applied++; if (w === ".phase1") t1Changed = true; console.log(`  ✓ ${id} ${w}.stem_jp_clean 「${from}」→「${to}」`); } else skipped++; }
  if (t1 && t1Changed) wj(t1f, t1);
  const clean = t.stem_jp_clean; if (!clean) throw new Error(`${id}: no stem_jp_clean`);
  for (const [o, w] of [[Qd.questions.find((q) => q.id === id), "questions"], [Bd.questions.find((q) => q.id === id), "question_bank"], [BY[e].questions.find((q) => q.id === id), "by_year"]]) {
    if (!o) throw new Error(`${id}: missing in ${w}`);
    if (o.stem_jp === clean) { skipped++; continue; } o.stem_jp = clean; applied++; console.log(`  ✓ ${id} ${w}.stem_jp := stem_jp_clean`);
  }
}
wj(P("data/ip/quiz/questions.json"), Qd); wj(P("data/ip/exams/question_bank.json"), Bd);
for (const e of exams) { wj(P("data/ip/exams/by_year", `${e}.json`), BY[e]); wj(P("data/ip/quiz/translations", `${e}.json`), TR[e]); }
console.log(`${DRY ? "(dry-run) " : "✓ "}quiz-fidfix-S117-n5: applied ${applied}, skipped ${skipped}`);
