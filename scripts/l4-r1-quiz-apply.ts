#!/usr/bin/env node
// Track L step L4 round 1 (D-222, Rule D review evidence/phase5/hosting/L4_review.md "批准范围") — quiz zh word fixes.
// Source of the per-occurrence edits: evidence/phase5/hosting/L4b_hits.json (LEAK, proposed.before → proposed.after),
// restricted to the reviewer-approved IDs, plus the reviewer's corrections (检讨 → 探讨 / 考虑) and the additions
// M-1 (2014h26a-q100 会计负责人 → 财务负责人 ×4) and 2010h22a-q087 取入 → 引入 ×2.
// Layers (as efix5, minus what D-222 changed):
//   explanations → data/ip/quiz/.phase2/expl_tr_<id>.json (zh only), then `node scripts/quiz-phase2-merge.mjs <exam>`;
//   translations → the sidecar data/ip/quiz/translations/<exam>.json only (D-222.5: .phase1/tr_ is not touched).
// No per-question key_guard note (D-222.4: one summary note, recorded in evidence/phase5/hosting/L4_apply_round1.md).
// Every edit must find its `before` exactly once in the field at that moment (0 or >1 aborts the whole run; nothing
// is written unless every edit passes). Re-running after --apply aborts (the befores are gone): by design.
// Run: node scripts/l4-r1-quiz-apply.ts [--apply] [--out <edits.json>]

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const P = (...s: string[]) => path.join(ROOT, ...s);
const APPLY = process.argv.includes("--apply");
const outArg = process.argv.indexOf("--out");
const OUT = outArg > 0 ? process.argv[outArg + 1] : null;

type Hit = { id: string; source: string; file: string; path: string; word: string; classification: string; proposed: { before: string; after: string } | null };
const hits: Hit[] = JSON.parse(readFileSync(P("evidence/phase5/hosting/L4b_hits.json"), "utf-8")).hits;

// Excluded from round 1 (L4_review.md: H-1, H-2, LOW B0490; ui-messages wait for H1-3).
const EXCLUDE = new Set(["B0292", "B0386", "B0387", "B0388", "B0720", "B0781", "B0490"]);
// Reviewer LOW: 检讨 → 探讨 / 考虑 (read per occurrence).
const OVERRIDE: Record<string, { before: string; after: string }> = {
  B0469: { before: "检讨", after: "探讨" }, // 持续探讨以下事项 (FM の検討事項)
  B0560: { before: "检讨", after: "考虑" }, // 在考虑要把哪个成员配置到哪里时
  B0561: { before: "检讨", after: "探讨" }, // 探讨配置本身的阶段
  B0562: { before: "检讨", after: "考虑" }, // 为了考虑成员的角色配置
};
type Edit = { id: string; layer: "expl" | "tr"; qid: string; where: string; word: string; before: string; after: string };
const edits: Edit[] = [];
for (const h of hits) {
  if (h.classification !== "LEAK" || h.source === "textbook-units" || h.source === "ui-messages" || EXCLUDE.has(h.id) || h.word === "作成者") continue;
  const m = /^questions\.([^.]+)\.(.+)\.zh$/.exec(h.path);
  if (!m || !h.proposed) throw new Error(`${h.id}: unexpected path / no proposal ${h.path}`);
  const pr = OVERRIDE[h.id] ?? h.proposed;
  edits.push({ id: h.id, layer: h.source === "quiz-explanations" ? "expl" : "tr", qid: m[1], where: m[2], word: h.word, before: pr.before, after: pr.after });
}
const extra = (id: string, layer: "expl" | "tr", qid: string, where: string, word: string, before: string, after: string) => edits.push({ id, layer, qid, where, word, before, after });
// M-1 (L4_review.md): 経理担当者 is 财务负责人 in the shared stem after 担当者 → 负责人; q100 (4) and its explanation say 会计负责人.
extra("R1-M1a", "tr", "2014h26a-q100", "stem", "会计负责人", "(4) 会计负责人整体上", "(4) 财务负责人整体上");
extra("R1-M1b", "expl", "2014h26a-q100", "correct", "会计负责人", "(4) 会计负责人是", "(4) 财务负责人是");
extra("R1-M1c", "expl", "2014h26a-q100", "distractors.イ", "会计负责人", "(4) 中会计负责人缩短", "(4) 中财务负责人缩短");
extra("R1-M1d", "expl", "2014h26a-q100", "distractors.イ", "会计负责人", "审批人、会计负责人四方", "审批人、财务负责人四方");
// M-1 (L4_review.md): 2010h22a-q087 Japanese 取り込む left in the explanation.
extra("R1-q087a", "expl", "2010h22a-q087", "correct", "取入", "才取入的项目", "才引入的项目");
extra("R1-q087b", "expl", "2010h22a-q087", "points[1]", "取入", "从别的表取入的", "从别的表引入的");

// ---- load layers ----
const examOf = (qid: string) => qid.split("-q")[0];
const LOADED = new Map<string, string>();
const docs = new Map<string, any>();
const load = (f: string) => {
  if (!docs.has(f)) {
    const raw = readFileSync(f, "utf-8");
    LOADED.set(f, raw);
    docs.set(f, JSON.parse(raw));
  }
  return docs.get(f);
};
function locate(e: Edit): [any, string, string] {
  if (e.layer === "expl") {
    const f = P("data/ip/quiz/.phase2", `expl_tr_${e.qid}.json`);
    const d = load(f);
    if (e.where === "correct") return [d.correct, "zh", f];
    const dm = /^distractors\.(.)$/.exec(e.where);
    if (dm) return [d.distractors.find((x: any) => x.letter === dm[1]), "zh", f];
    const pm = /^points\[(\d+)\]$/.exec(e.where);
    if (pm) return [d.points[Number(pm[1])], "zh", f];
    throw new Error(`${e.id}: where ${e.where}`);
  }
  const f = P("data/ip/quiz/translations", `${examOf(e.qid)}.json`);
  const q = load(f).questions[e.qid];
  if (!q) throw new Error(`${e.id}: ${e.qid} not in sidecar`);
  if (e.where === "stem") return [q.stem, "zh", f];
  const cm = /^choices\.(.)$/.exec(e.where);
  if (cm) return [q.choices[cm[1]], "zh", f];
  throw new Error(`${e.id}: where ${e.where}`);
}
const occ = (s: string, sub: string) => s.split(sub).length - 1;
const report: any[] = [];
for (const e of edits) {
  const [o, k, f] = locate(e);
  const s = o?.[k];
  if (typeof s !== "string") throw new Error(`${e.id}: no string at ${e.qid}.${e.where}.zh`);
  const n = occ(s, e.before);
  if (n !== 1) throw new Error(`${e.id}: "${e.before}" occurs ${n}× in ${e.qid}.${e.where}.zh — abort (nothing written)`);
  const next = s.replace(e.before, () => e.after);
  o[k] = next;
  report.push({ ...e, file: path.relative(ROOT, f), field_before_len: s.length, field_after_len: next.length });
}

const written: string[] = [];
for (const [f, d] of docs) {
  // keep each file's own serialisation: .phase2 / sidecars are JSON.stringify(…, null, 2) + "\n"
  const next = `${JSON.stringify(d, null, 2)}\n`;
  if (next === LOADED.get(f)) continue;
  written.push(path.relative(ROOT, f));
  if (APPLY) writeFileSync(f, next);
}
const byWord: Record<string, number> = {};
for (const e of edits) byWord[e.word] = (byWord[e.word] ?? 0) + 1;
const exams = [...new Set(edits.filter((e) => e.layer === "expl").map((e) => examOf(e.qid)))].sort();
console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", edits: edits.length, expl: edits.filter((e) => e.layer === "expl").length, tr: edits.filter((e) => e.layer === "tr").length, by_word: byWord, files: written.length, merge_exams: exams }, null, 1));
if (OUT) writeFileSync(OUT, `${JSON.stringify({ edits: report, files: written, merge_exams: exams }, null, 1)}\n`);
