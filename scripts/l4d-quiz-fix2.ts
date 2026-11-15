#!/usr/bin/env node
// S157 L4-d round C follow-up (Rule D l4d_C_review.md MEDIUM-1, LOW-1, LOW-2) — three explanation fields that
// scripts/l4d-quiz-apply.ts already changed (・ → 、) and that read better otherwise. l4d-quiz-apply.ts cannot be rerun
// (no ・ left), so this edits .phase2/expl_tr_<id>.json directly, rebuilds the three exams with quiz-phase2-merge.mjs and
// checks that each sidecar differs from its pre-run bytes in exactly the target field.
// Run: node --no-warnings scripts/l4d-quiz-fix2.ts [--apply]
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");
type Row = Record<string, any>;
// [exam, qid, where, from, to] (zh)
const FIX: [string, string, string, string, string][] = [
  ["2013h25a", "2013h25a-q003", "p:1", "Price、Earnings", "Price-Earnings"], // MEDIUM-1: PER, one indicator (en already Price-Earnings)
  ["2011h23tokubetsu", "2011h23tokubetsu-q067", "d:イ", "AND、OR、NOT 等逻辑运算", "AND/OR/NOT 等逻辑运算"], // LOW-1: inside an outer 、 list
  ["2010h22a", "2010h22a-q010", "p:1", "（ASP、SaaS 形态）", "（ASP/SaaS 形态）"], // LOW-2: same question's correct says ASP/SaaS 型
];
const pick = (o: Row, where: string, sidecar: boolean) =>
  where === "correct" ? o.correct : where.startsWith("d:") ? (sidecar ? o.distractors[where.slice(2)] : o.distractors.find((x: Row) => x.letter === where.slice(2))) : o.points[Number(where.slice(2))];
const out: Row[] = [];
for (const [exam, qid, where, from, to] of FIX) {
  const f2 = path.join(ROOT, "data/ip/quiz/.phase2", `expl_tr_${qid}.json`);
  const fs = path.join(ROOT, "data/ip/quiz/explanations", `${exam}.json`);
  const raw2 = readFileSync(f2, "utf-8");
  const d2 = JSON.parse(raw2);
  const o2 = pick(d2, where, false);
  const sideBefore = readFileSync(fs, "utf-8");
  const s = JSON.parse(sideBefore);
  if (pick(s.questions[qid], where, true).zh !== o2.zh) throw new Error(`${qid} ${where}: .phase2 ≠ sidecar`);
  if (o2.zh.split(from).length !== 2) throw new Error(`${qid} ${where}: «${from}» not once`);
  const after = o2.zh.replace(from, () => to);
  out.push({ exam, qid, where, before: o2.zh, after });
  if (!APPLY) continue;
  o2.zh = after;
  writeFileSync(f2, `${JSON.stringify(d2, null, raw2.startsWith("{\n  ") ? 2 : 0)}${raw2.endsWith("\n") ? "\n" : ""}`);
  execFileSync("node", ["scripts/quiz-phase2-merge.mjs", exam], { cwd: ROOT, stdio: "pipe" });
  const want = JSON.parse(sideBefore);
  pick(want.questions[qid], where, true).zh = after;
  if (JSON.stringify(JSON.parse(readFileSync(fs, "utf-8"))) !== JSON.stringify(want)) throw new Error(`${exam}: rebuilt sidecar ≠ before + this field`);
}
console.log(JSON.stringify({ mode: APPLY ? "apply" : "plan", fields: out }, null, 1));
