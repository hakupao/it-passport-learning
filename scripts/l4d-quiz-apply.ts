#!/usr/bin/env node
// S157 L4-d round C (D-230, W3C clreq §5.1) — the katakana middle dot ・ (U+30FB, JIS) in the quiz zh / en layers.
//   line-start bullet (after a newline, <br>, a table cell bar, or spaces) → • (U+2022), zh and en;
//   zh between coordinate items (incl. spelled-out kana and choice letters ア・ウ・エ) → 顿号「、」;
//   EXACT below = reviewed exceptions (nested lists where an outer 、 already separates items, a label separator, en).
// Layers (same as L4 round 2): translations = the sidecar data/ip/quiz/translations/<exam>.json directly, plus the same text
// in data/ip/quiz/.phase1/tr_<id>.json when present (that layer can lag the sidecar: fixed only if the text is there);
// explanations = data/ip/quiz/.phase2/expl_tr_<id>.json, then `node scripts/quiz-phase2-merge.mjs <exam>` rebuilds the
// sidecar. Before any write, every affected exam's merge must reproduce its committed sidecar byte for byte; after the
// write, the sidecar may differ only in the target fields, each equal to the planned value.
// Plan mode (default) writes nothing. Run: node --no-warnings scripts/l4d-quiz-apply.ts [--apply] --out <report.json>

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const P = (...s: string[]) => path.join(ROOT, ...s);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
if (outAt < 0) throw new Error("--out <report.json> is required");
const OUT = path.resolve(process.argv[outAt + 1]);
type Row = Record<string, any>;
const TR = P("data/ip/quiz/translations");
const EX = P("data/ip/quiz/explanations");
const PH1 = P("data/ip/quiz/.phase1");
const PH2 = P("data/ip/quiz/.phase2");
const read = (f: string) => JSON.parse(readFileSync(f, "utf-8"));
const occ = (s: string, sub: string) => s.split(sub).length - 1;

// [qid, where, lang, from, to] — `from` must occur exactly once in the field; applied before the generic rule.
const EXACT: [string, string, "zh" | "en", string, string][] = [
  ...["085", "086", "087", "088"].map((q): [string, string, "zh", string, string] => [`2014h26h-q${q}`, "stem", "zh", "预定销毁・退还日期", "预定销毁/退还日期"]),
  ["2010h22a-q010", "correct", "zh", "ASP・SaaS 型", "ASP/SaaS 型"],
  ["2010h22h-q061", "p:0", "zh", "（Why・作为组织的宣告）", "（Why：作为组织的宣告）"],
  ["2010h22h-q061", "p:0", "zh", "（What・应遵守的规则和水平）", "（What：应遵守的规则和水平）"],
  ["2010h22h-q061", "p:0", "zh", "（How・具体的作业步骤和手册）", "（How：具体的作业步骤和手册）"],
  ["2012h24h-q090", "p:0", "zh", "听课费・教材费・开课日", "听课费/教材费/开课日"],
  ["2015h27a-q097", "correct", "zh", "ア・イ 为3个词、ウ・エ 为4个词", "ア、イ 为3个词，ウ、エ 为4个词"],
  ["2016h28a-q082", "correct", "zh", "(数学35・英语85)", "(数学35/英语85)"],
  ["2016h28a-q082", "p:1", "zh", "B3・C3、D8 引用 B8・C8", "B3、C3，D8 引用 B8、C8"],
  ["2026r08-q032", "p:1", "zh", "扩大规模・抢占份额", "扩大规模并抢占份额"],
  ["2010h22a-q080", "correct", "en", "× ・ ○ ・ ○", "×, ○, ○"],
  ["2013h25a-q003", "p:1", "en", "Price・Earnings", "Price-Earnings"],
];
const isBullet = (v: string, i: number) => /(^|\n|<br>|\|)[ 　]*$/.test(v.slice(0, i)) || /〔[^〕]*〕 $/.test(v.slice(0, i));

function planValue(qid: string, where: string, lang: "zh" | "en", v: string) {
  let s = v;
  const used: string[] = [];
  for (const [q, w, l, from, to] of EXACT) {
    if (q !== qid || w !== where || l !== lang) continue;
    if (occ(s, from) !== 1) throw new Error(`${qid} ${where} ${lang}: «${from}» occurs ${occ(s, from)}×`);
    s = s.replace(from, () => to);
    used.push(from);
  }
  let out = "";
  const classes: string[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "・") { out += s[i]; continue; }
    if (isBullet(s, i)) { out += "•"; classes.push("bullet"); continue; }
    if (lang === "en") throw new Error(`${qid} ${where} en: inline ・ without an EXACT rule: …${s.slice(Math.max(0, i - 12), i + 12)}…`);
    out += "、";
    classes.push("inline");
  }
  return { after: out, classes, exact: used };
}

const report: Row = { mode: APPLY ? "apply" : "plan", fields: [] as Row[] };
const exactHit = new Set<string>();
// translations
const trDocs = new Map<string, { raw: string; d: Row }>();
for (const f of readdirSync(TR).filter((x) => x.endsWith(".json")).sort()) {
  const raw = readFileSync(path.join(TR, f), "utf-8");
  const d = JSON.parse(raw);
  for (const [qid, q] of Object.entries<Row>(d.questions ?? {})) {
    const slots: [string, Row][] = [["stem", q.stem], ...Object.entries<Row>(q.choices ?? {}).map(([c, o]): [string, Row] => [`c:${c}`, o])];
    for (const [where, o] of slots) for (const lang of ["zh", "en"] as const) {
      const v = o?.[lang];
      if (typeof v !== "string" || !v.includes("・")) continue;
      const r = planValue(qid, where, lang, v);
      r.exact.forEach((x) => exactHit.add(`${qid}|${where}|${lang}|${x}`));
      if (r.after === v) continue;
      report.fields.push({ layer: "translations", exam: f.replace(".json", ""), qid, where, lang, before: v, after: r.after, classes: r.classes, exact: r.exact });
      o[lang] = r.after;
    }
  }
  trDocs.set(f, { raw, d });
}
// explanations (.phase2 is the source; the sidecar is checked equal first)
const exFiles = new Map<string, Row>();
for (const f of readdirSync(EX).filter((x) => x.endsWith(".json")).sort()) {
  const d = read(path.join(EX, f));
  for (const [qid, q] of Object.entries<Row>(d.questions ?? {})) {
    const slots: [string, Row][] = [["correct", q.correct], ...Object.entries<Row>(q.distractors ?? {}).map(([k, o]): [string, Row] => [`d:${k}`, o]), ...(q.points ?? []).map((o: Row, i: number): [string, Row] => [`p:${i}`, o])];
    for (const [where, o] of slots) for (const lang of ["zh", "en"] as const) {
      const v = o?.[lang];
      if (typeof v !== "string" || !v.includes("・")) continue;
      const r = planValue(qid, where, lang, v);
      r.exact.forEach((x) => exactHit.add(`${qid}|${where}|${lang}|${x}`));
      if (r.after === v) continue;
      report.fields.push({ layer: "explanations", exam: f.replace(".json", ""), qid, where, lang, before: v, after: r.after, classes: r.classes, exact: r.exact });
    }
  }
  exFiles.set(f, d);
}
for (const [q, w, l, from] of EXACT) if (!exactHit.has(`${q}|${w}|${l}|${from}`)) throw new Error(`EXACT rule not used: ${q} ${w} ${l} «${from}»`);

// invariant: apart from EXACT windows, only ・ → 、/• (same length, same other chars)
for (const f of report.fields) {
  let b = f.before as string;
  let a = f.after as string;
  for (const [q, w, l, from, to] of EXACT) if (q === f.qid && w === f.where && l === f.lang) { b = b.replace(from, "\u0000"); a = a.replace(to, "\u0000"); }
  const ok = b.length === a.length && [...b].every((c, i) => c === a[i] || (c === "・" && (a[i] === "、" || a[i] === "•")));
  if (!ok) throw new Error(`${f.qid} ${f.where} ${f.lang}: change outside ・ → 、/• and the EXACT windows`);
}

const exExams = [...new Set(report.fields.filter((f: Row) => f.layer === "explanations").map((f: Row) => f.exam as string))].sort();
const trWritten = [...trDocs].filter(([, { raw, d }]) => `${JSON.stringify(d, null, 2)}\n` !== raw).map(([f]) => f);
report.summary = {
  fields: report.fields.length,
  translations_fields: report.fields.filter((f: Row) => f.layer === "translations").length,
  explanations_fields: report.fields.filter((f: Row) => f.layer === "explanations").length,
  bullets: report.fields.reduce((n: number, f: Row) => n + f.classes.filter((c: string) => c === "bullet").length, 0),
  inline: report.fields.reduce((n: number, f: Row) => n + f.classes.filter((c: string) => c === "inline").length, 0),
  exact: EXACT.length,
  translation_files: trWritten,
  explanation_exams: exExams,
};

if (APPLY) {
  // 1. every affected exam's merge reproduces its sidecar before any write
  const merge = (exam: string) => execFileSync("node", ["scripts/quiz-phase2-merge.mjs", exam], { cwd: ROOT, stdio: "pipe" });
  for (const exam of exExams) {
    const f = path.join(EX, `${exam}.json`);
    const before = readFileSync(f, "utf-8");
    merge(exam);
    if (readFileSync(f, "utf-8") !== before) {
      writeFileSync(f, before);
      throw new Error(`${exam}: quiz-phase2-merge does not reproduce the committed sidecar (restored, nothing written)`);
    }
  }
  // 2. .phase2 sources
  const ph2 = new Map<string, { raw: string; d: Row }>();
  for (const fl of report.fields.filter((x: Row) => x.layer === "explanations")) {
    const file = path.join(PH2, `expl_tr_${fl.qid}.json`);
    if (!ph2.has(file)) { const raw = readFileSync(file, "utf-8"); ph2.set(file, { raw, d: JSON.parse(raw) }); }
    const d = ph2.get(file)!.d;
    const o = fl.where === "correct" ? d.correct : fl.where.startsWith("d:") ? d.distractors.find((x: Row) => x.letter === fl.where.slice(2)) : d.points[Number(fl.where.slice(2))];
    if (o[fl.lang] !== fl.before) throw new Error(`${fl.qid} ${fl.where} ${fl.lang}: .phase2 ≠ sidecar`);
    o[fl.lang] = fl.after;
  }
  for (const [file, { raw, d }] of ph2) {
    const indent = raw.startsWith("{\n  ") ? 2 : 0;
    writeFileSync(file, `${JSON.stringify(d, null, indent)}${raw.endsWith("\n") ? "\n" : ""}`);
  }
  // 3. translations sidecar + .phase1 tr_ (if the text is there)
  for (const [f, { d }] of trDocs) if (trWritten.includes(f)) writeFileSync(path.join(TR, f), `${JSON.stringify(d, null, 2)}\n`);
  const ph1: Row[] = [];
  for (const fl of report.fields.filter((x: Row) => x.layer === "translations")) {
    const file = path.join(PH1, `tr_${fl.qid}.json`);
    if (!existsSync(file)) { ph1.push({ qid: fl.qid, where: fl.where, lang: fl.lang, phase1: "no file" }); continue; }
    const raw = readFileSync(file, "utf-8");
    const d = JSON.parse(raw);
    const o = fl.where === "stem" ? d.stem : d.choices?.[fl.where.slice(2)];
    if (o?.[fl.lang] === fl.before) {
      o[fl.lang] = fl.after;
      writeFileSync(file, `${JSON.stringify(d, null, raw.startsWith("{\n  ") ? 2 : 0)}${raw.endsWith("\n") ? "\n" : ""}`);
      ph1.push({ qid: fl.qid, where: fl.where, lang: fl.lang, phase1: "fixed" });
    } else ph1.push({ qid: fl.qid, where: fl.where, lang: fl.lang, phase1: "differs (left)" });
  }
  report.phase1 = ph1;
  // 4. rebuild the explanation sidecars, then only the target fields may differ
  for (const exam of exExams) {
    const before = exFiles.get(`${exam}.json`)!;
    merge(exam);
    const after = read(path.join(EX, `${exam}.json`));
    const want = JSON.parse(JSON.stringify(before));
    for (const fl of report.fields.filter((x: Row) => x.layer === "explanations" && x.exam === exam)) {
      const q = want.questions[fl.qid];
      const o = fl.where === "correct" ? q.correct : fl.where.startsWith("d:") ? q.distractors[fl.where.slice(2)] : q.points[Number(fl.where.slice(2))];
      o[fl.lang] = fl.after;
    }
    if (JSON.stringify(after) !== JSON.stringify(want)) throw new Error(`${exam}: rebuilt sidecar ≠ planned (only target fields may change)`);
  }
  report.verified = "merge reproduced every affected sidecar before; after the write each rebuilt sidecar = before + planned fields";
}
console.log(JSON.stringify(report.summary, null, 1));
writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`);
