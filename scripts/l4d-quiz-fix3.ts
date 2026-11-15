#!/usr/bin/env node
// S157 L4-d round C follow-up 3 (advisor check of the rendered bullets): in en, U+2022 has no built-in spacing, so the
// line-start bullets written by l4d-quiz-apply.ts read "•The results…". Insert one space after a line-start • in the en
// fields that round C changed (zh keeps "•记录数" — no space, as CJK). Translations: sidecar + .phase1 tr_ when equal;
// explanations: .phase2 then quiz-phase2-merge.mjs, each rebuilt sidecar = before + these fields only.
// Run: node --no-warnings scripts/l4d-quiz-fix3.ts [--apply]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");
type Row = Record<string, any>;
const rep = JSON.parse(readFileSync(path.join(ROOT, "evidence/phase5/hosting/l4d_quiz_apply.json"), "utf-8"));
const fix = (s: string) => s.replace(/(^|\n|<br>|\|)([ 　]*)•(?=\S)/g, "$1$2• ");
const pickEx = (o: Row, where: string, sidecar: boolean) =>
  where === "correct" ? o.correct : where.startsWith("d:") ? (sidecar ? o.distractors[where.slice(2)] : o.distractors.find((x: Row) => x.letter === where.slice(2))) : o.points[Number(where.slice(2))];
const pickTr = (q: Row, where: string) => (where === "stem" ? q.stem : q.choices[where.slice(2)]);
const fields = rep.fields.filter((f: Row) => f.lang === "en" && f.classes.includes("bullet"));
const out: Row[] = [];
const indentOf = (raw: string) => (raw.startsWith("{\n  ") ? 2 : 0);
const exams = new Map<string, string>();
for (const f of fields) {
  if (f.layer === "translations") {
    const file = path.join(ROOT, "data/ip/quiz/translations", `${f.exam}.json`);
    const d = JSON.parse(readFileSync(file, "utf-8"));
    const o = pickTr(d.questions[f.qid], f.where);
    if (o.en !== f.after) throw new Error(`${f.qid} ${f.where}: sidecar ≠ round C after`);
    const after = fix(o.en);
    out.push({ ...f, before: o.en, after, after_c: undefined, classes: undefined });
    if (!APPLY) continue;
    o.en = after;
    writeFileSync(file, `${JSON.stringify(d, null, 2)}\n`);
    const p1 = path.join(ROOT, "data/ip/quiz/.phase1", `tr_${f.qid}.json`);
    if (existsSync(p1)) {
      const raw = readFileSync(p1, "utf-8");
      const d1 = JSON.parse(raw);
      const o1 = pickTr(d1, f.where);
      if (o1?.en === f.after) { o1.en = after; writeFileSync(p1, `${JSON.stringify(d1, null, indentOf(raw))}${raw.endsWith("\n") ? "\n" : ""}`); }
    }
  } else {
    const p2 = path.join(ROOT, "data/ip/quiz/.phase2", `expl_tr_${f.qid}.json`);
    const raw = readFileSync(p2, "utf-8");
    const d2 = JSON.parse(raw);
    const o = pickEx(d2, f.where, false);
    if (o.en !== f.after) throw new Error(`${f.qid} ${f.where}: .phase2 ≠ round C after`);
    const after = fix(o.en);
    out.push({ layer: f.layer, exam: f.exam, qid: f.qid, where: f.where, lang: "en", before: o.en, after });
    if (!APPLY) continue;
    if (!exams.has(f.exam)) exams.set(f.exam, readFileSync(path.join(ROOT, "data/ip/quiz/explanations", `${f.exam}.json`), "utf-8"));
    o.en = after;
    writeFileSync(p2, `${JSON.stringify(d2, null, indentOf(raw))}${raw.endsWith("\n") ? "\n" : ""}`);
  }
}
for (const [exam, before] of exams) {
  execFileSync("node", ["scripts/quiz-phase2-merge.mjs", exam], { cwd: ROOT, stdio: "pipe" });
  const want = JSON.parse(before);
  for (const f of out.filter((x) => x.layer === "explanations" && x.exam === exam)) pickEx(want.questions[f.qid], f.where, true).en = f.after;
  if (JSON.stringify(JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/explanations", `${exam}.json`), "utf-8"))) !== JSON.stringify(want)) throw new Error(`${exam}: rebuilt sidecar ≠ before + these fields`);
}
console.log(JSON.stringify({ mode: APPLY ? "apply" : "plan", fields: out.map(({ layer, exam, qid, where, before, after }) => ({ layer, exam, qid, where, before, after })) }, null, 1));
