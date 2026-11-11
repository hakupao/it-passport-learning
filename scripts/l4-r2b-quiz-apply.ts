#!/usr/bin/env node
// Track L step L4 round 2 追加施工 (main session accepted the two "要主 session 確認" wordings of L4_apply_round2.md):
//   2010h22a-q006「（ringi 决裁）」系 3 処 → 会签审批 / 要点 1「审批与最终核准」; 2009h21a q097〜q100「请求书（发票）」8 処 → 请款单（发票）.
// Same layers as round 2: explanations via data/ip/quiz/.phase2/expl_tr_<id>.json then quiz-phase2-merge; translations sidecar only.
// Each `before` must occur exactly once in its field at that moment (else abort, nothing written).
// Run: node scripts/l4-r2b-quiz-apply.ts [--apply] [--out <edits.json>]
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const P = (...s: string[]) => path.join(ROOT, ...s);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
type E = [string, string, string, string];
const EDITS: E[] = [
  ["2010h22a-q006", "c:ア", "到审批（rin-gi 决裁）的一系列流程", "到会签审批的一系列流程"],
  ["2010h22a-q006", "correct", "会签审批（ringi 决裁）→ 归档", "会签审批 → 归档"],
  ["2010h22a-q006", "correct", "到审批（rin-gi 决裁）的一系列流程", "到会签审批的一系列流程"],
  ["2010h22a-q006", "p:0", "审批（决裁）等", "审批与最终核准等"],
  ...["097", "098", "099", "100"].flatMap((q): E[] => [
    [`2009h21a-q${q}`, "stem", "**图2 请求书（发票）的格式**", "**图2 请款单（发票）的格式**"],
    [`2009h21a-q${q}`, "stem", "- 标题：请求书（发票）", "- 标题：请款单（发票）"],
  ]),
];
const docs = new Map<string, { raw: string; d: any }>();
const load = (f: string) => {
  if (!docs.has(f)) {
    const raw = readFileSync(f, "utf-8");
    docs.set(f, { raw, d: JSON.parse(raw) });
  }
  return docs.get(f)!.d;
};
const report: any[] = [];
for (const [qid, w, before, after] of EDITS) {
  const tr = w === "stem" || w.startsWith("c:");
  let o: any;
  let f: string;
  if (tr) {
    f = P("data/ip/quiz/translations", `${qid.split("-q")[0]}.json`);
    const q = load(f).questions[qid];
    o = w === "stem" ? q.stem : q.choices[w.slice(2)];
  } else {
    f = P("data/ip/quiz/.phase2", `expl_tr_${qid}.json`);
    const d = load(f);
    o = w === "correct" ? d.correct : w.startsWith("d:") ? d.distractors.find((x: any) => x.letter === w.slice(2)) : d.points[Number(w.slice(2))];
  }
  const n = o.zh.split(before).length - 1;
  if (n !== 1) throw new Error(`${qid} ${w}: "${before}" occurs ${n}× — abort`);
  o.zh = o.zh.replace(before, () => after);
  report.push({ qid, where: w, layer: tr ? "translations" : "expl_tr", before, after });
}
const written: string[] = [];
for (const [f, { raw, d }] of docs) {
  const next = `${JSON.stringify(d, null, 2)}\n`;
  if (next === raw) continue;
  written.push(path.relative(ROOT, f));
  if (APPLY) writeFileSync(f, next);
}
console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", edits: report.length, files: written }, null, 1));
if (outAt > 0) writeFileSync(path.resolve(process.argv[outAt + 1]), `${JSON.stringify({ edits: report, files: written }, null, 1)}\n`);
