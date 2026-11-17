#!/usr/bin/env node
// S162 C20 (D-234) — minimal translation-fidelity patches to quiz explanations (zh / en; jp only for a jp-error).
// Input: evidence/phase5/hosting/c20/patches.json {patches:[{id, where: correct|d:ア|p:0, lang: jp|zh|en, from, to}]}.
// `from` must occur exactly once in the current field; patches on one field apply in order.
// Source layer = data/ip/quiz/.phase2/expl_{jp,tr}_<id>.json; `node scripts/quiz-phase2-merge.mjs <exam>` rebuilds the
// sidecar data/ip/quiz/explanations/<exam>.json. Before any write each affected exam's merge must reproduce its committed
// sidecar byte for byte; after the write the rebuilt sidecar may differ only in the patched fields, each = planned value.
// Plan mode (default) writes nothing. Run: node --no-warnings scripts/c20-quiz-apply.ts [--apply] [--patches <file>] --out <report.json>
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const P = (...s: string[]) => path.join(ROOT, ...s);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
if (outAt < 0) throw new Error("--out <report.json> is required");
const OUT = path.resolve(process.argv[outAt + 1]!);
type Row = Record<string, any>;
type Lang = "jp" | "zh" | "en";
type Patch = { id: string; where: string; lang: Lang; from: string; to: string };
const EX = P("data/ip/quiz/explanations");
const TRD = P("data/ip/quiz/translations");
const PH1 = P("data/ip/quiz/.phase1");
const isTr = (where: string) => where === "stem" || where.startsWith("c:");
const PH2 = P("data/ip/quiz/.phase2");
const read = (f: string) => JSON.parse(readFileSync(f, "utf-8"));
const occ = (s: string, sub: string) => s.split(sub).length - 1;
const examOf = (id: string) => id.slice(0, id.indexOf("-q"));
const slot = (q: Row, where: string): Row => {
  if (where === "stem") return q.stem;
  if (where.startsWith("c:")) return q.choices[where.slice(2)];
  if (where === "correct") return q.correct;
  if (where.startsWith("d:")) return q.distractors[where.slice(2)];
  if (where.startsWith("p:")) return q.points[Number(where.slice(2))];
  throw new Error(`bad where ${where}`);
};

// Upstream sources of the translations sidecar (gitignored): .phase1/tr_<id>.json (stem + choices[] {letter, zh, en})
// and, for stems, .phase1.5/stem_<id>.json (stem {zh, en}, overrides phase1). A source is rewritten only when it holds
// exactly the pre-patch text; otherwise it is left and reported.
const PH15 = P("data/ip/quiz/.phase1.5");
function syncUpstream(fl: Row): Row {
  const one = (file: string, pick: (t: Row) => Row | undefined) => {
    let raw: string;
    try { raw = readFileSync(file, "utf-8"); } catch (e) { if ((e as { code?: string }).code === "ENOENT") return "no file"; throw e; }
    const t = JSON.parse(raw);
    const o = pick(t);
    if (o?.[fl.lang] !== fl.before) return "differs (left)";
    o[fl.lang] = fl.after;
    writeFileSync(file, `${JSON.stringify(t, null, raw.startsWith("{\n  ") ? 2 : 0)}${raw.endsWith("\n") ? "\n" : ""}`);
    return "fixed";
  };
  const letter = fl.where.slice(2);
  const out: Row = {
    phase1: one(path.join(PH1, `tr_${fl.id}.json`), (t) =>
      fl.where === "stem" ? t.stem : Array.isArray(t.choices) ? t.choices.find((c: Row) => c.letter === letter) : t.choices?.[letter]),
  };
  if (fl.where === "stem") out.phase1_5 = one(path.join(PH15, `stem_${fl.id}.json`), (t) => t.stem);
  return out;
}

const pAt = process.argv.indexOf("--patches");
const patches: Patch[] = read(pAt < 0 ? P("evidence/phase5/hosting/c20/patches.json") : path.resolve(process.argv[pAt + 1]!)).patches;
const sides = new Map<string, Row>();
const side = (exam: string) => {
  if (!sides.has(exam)) sides.set(exam, read(path.join(EX, `${exam}.json`)));
  return sides.get(exam)!;
};
const trs = new Map<string, Row>();
const trSide = (exam: string) => {
  if (!trs.has(exam)) trs.set(exam, read(path.join(TRD, `${exam}.json`)));
  return trs.get(exam)!;
};
// plan: per field, apply patches in order on the current sidecar value
const fields = new Map<string, Row>();
for (const p of patches) {
  if (!p.from || p.from === p.to) throw new Error(`${p.id} ${p.where} ${p.lang}: empty or no-op patch`);
  const key = `${p.id}|${p.where}|${p.lang}`;
  if (!fields.has(key)) {
    if (isTr(p.where) && p.lang === "jp") throw new Error(`${key}: jp stem/choices are out of scope`);
    const q = (isTr(p.where) ? trSide(examOf(p.id)) : side(examOf(p.id))).questions[p.id];
    if (!q) throw new Error(`${p.id}: no such question`);
    const before = slot(q, p.where)?.[p.lang];
    if (typeof before !== "string") throw new Error(`${key}: no field`);
    fields.set(key, { id: p.id, exam: examOf(p.id), layer: isTr(p.where) ? "translations" : "explanations", where: p.where, lang: p.lang, before, after: before, patches: 0 });
  }
  const f = fields.get(key)!;
  const n = occ(f.after, p.from);
  if (n !== 1) throw new Error(`${key}: «${p.from.slice(0, 30)}» occurs ${n}×`);
  f.after = f.after.replace(p.from, () => p.to);
  f.patches++;
}
const changedChars = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  let j = 0;
  while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
  return Math.max(a.length - i - j, b.length - i - j);
};
const report: Row = { mode: APPLY ? "apply" : "plan", fields: [...fields.values()] };
for (const f of report.fields) f.changed_ratio = Number((changedChars(f.before, f.after) / f.before.length).toFixed(3));
const exams = [...new Set(report.fields.filter((f: Row) => f.layer === "explanations").map((f: Row) => f.exam as string))].sort();
report.summary = {
  patches: patches.length,
  fields: report.fields.length,
  questions: new Set(report.fields.map((f: Row) => f.id)).size,
  by_lang: Object.fromEntries(["jp", "zh", "en"].map((l) => [l, report.fields.filter((f: Row) => f.lang === l).length])),
  over_half: report.fields.filter((f: Row) => f.changed_ratio > 0.5).map((f: Row) => `${f.id} ${f.where} ${f.lang} ${f.changed_ratio}`),
  exams,
};

if (APPLY) {
  const merge = (exam: string) => execFileSync("node", ["scripts/quiz-phase2-merge.mjs", exam], { cwd: ROOT, stdio: "pipe" });
  for (const exam of exams) {
    const f = path.join(EX, `${exam}.json`);
    const before = readFileSync(f, "utf-8");
    merge(exam);
    if (readFileSync(f, "utf-8") !== before) {
      writeFileSync(f, before);
      throw new Error(`${exam}: quiz-phase2-merge does not reproduce the committed sidecar (restored, nothing written)`);
    }
  }
  const ph2 = new Map<string, { raw: string; d: Row }>();
  const doc = (file: string) => {
    if (!ph2.has(file)) { const raw = readFileSync(file, "utf-8"); ph2.set(file, { raw, d: JSON.parse(raw) }); }
    return ph2.get(file)!.d;
  };
  for (const fl of report.fields) {
    if (fl.layer === "translations") continue;
    if (fl.lang === "jp") {
      const d = doc(path.join(PH2, `expl_jp_${fl.id}.json`));
      const get = () => fl.where === "correct" ? d.correct_jp : fl.where.startsWith("d:") ? d.distractors_jp.find((x: Row) => x.letter === fl.where.slice(2)).why_wrong_jp : d.points_jp[Number(fl.where.slice(2))];
      if (get() !== fl.before) throw new Error(`${fl.id} ${fl.where} jp: .phase2 ≠ sidecar`);
      if (fl.where === "correct") d.correct_jp = fl.after;
      else if (fl.where.startsWith("d:")) d.distractors_jp.find((x: Row) => x.letter === fl.where.slice(2)).why_wrong_jp = fl.after;
      else d.points_jp[Number(fl.where.slice(2))] = fl.after;
    } else {
      const d = doc(path.join(PH2, `expl_tr_${fl.id}.json`));
      const o = fl.where === "correct" ? d.correct : fl.where.startsWith("d:") ? d.distractors.find((x: Row) => x.letter === fl.where.slice(2)) : d.points[Number(fl.where.slice(2))];
      if (o[fl.lang] !== fl.before) throw new Error(`${fl.id} ${fl.where} ${fl.lang}: .phase2 ≠ sidecar`);
      o[fl.lang] = fl.after;
    }
  }
  for (const [file, { raw, d }] of ph2) writeFileSync(file, `${JSON.stringify(d, null, raw.startsWith("{\n  ") ? 2 : 0)}${raw.endsWith("\n") ? "\n" : ""}`);
  // translations sidecar (direct) + .phase1 tr_<id> when it holds the same text
  const ph1: Row[] = [];
  for (const exam of [...new Set(report.fields.filter((f: Row) => f.layer === "translations").map((f: Row) => f.exam as string))]) {
    const d = trSide(exam);
    for (const fl of report.fields.filter((x: Row) => x.layer === "translations" && x.exam === exam)) {
      slot(d.questions[fl.id], fl.where)[fl.lang] = fl.after;
      ph1.push({ id: fl.id, where: fl.where, lang: fl.lang, ...syncUpstream(fl) });
    }
    writeFileSync(path.join(TRD, `${exam}.json`), `${JSON.stringify(d, null, 2)}\n`);
  }
  report.phase1 = ph1;
  for (const exam of exams) {
    const want = JSON.parse(JSON.stringify(side(exam)));
    for (const fl of report.fields.filter((x: Row) => x.layer === "explanations" && x.exam === exam)) slot(want.questions[fl.id], fl.where)[fl.lang] = fl.after;
    merge(exam);
    if (JSON.stringify(read(path.join(EX, `${exam}.json`))) !== JSON.stringify(want)) throw new Error(`${exam}: rebuilt sidecar ≠ planned (only target fields may change)`);
  }
  report.verified = "merge reproduced every affected sidecar before; after the write each rebuilt sidecar = before + planned fields";
}
console.log(JSON.stringify(report.summary, null, 1));
writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`);
