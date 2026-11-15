#!/usr/bin/env node
// S158 C19b — the 18 zh headwords of data/ip/textbook/zh_terms.json written with ASCII parens (e.g. RAD(快速应用开发)) take
// full-width （ ） like the rest of the corpus (zh_terms 278 vs 18, units zh 10,067 vs 119, quiz zh 21,327 vs 4,907). One family
// = every exact occurrence of the headword string, changed together so the headword, the body and the quiz term highlight
// (ExplanationPane matches card.gloss = term_zh inside the explanation text) stay equal:
//   units: term_zh → manifest.v1_terms (gitignored, the merge assembles term_zh from it) + the v1terms fixture + units (merged
//     value); other zh content fields → B3 loc-part patches (minimal unique window; overlap → retire + composite, C17);
//     derived fields follow through the merge (only allowed when the change is the paren width alone);
//   data/ip/textbook/zh_terms.json values; scripts/textbook-v2-zh-terms.test.mjs (the one assertion on real data);
//   quiz: translations sidecar (+ .phase1 tr_ when equal), explanations via .phase2/expl_tr + quiz-phase2-merge.mjs (the
//     merge must reproduce the committed sidecar first; afterwards the sidecar = before + the planned fields).
// Plan mode (default) simulates the unit patch lists; --apply writes. Run: node --no-warnings scripts/c19b-apply.ts [--apply] --out <report.json>

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const imp = (p: string) => import(pathToFileURL(path.join(ROOT, p)).href);
const lib = await imp("scripts/lib/textbook-v2.mjs");
const { journalRows, pickFinal, V1TERMS_FIXTURE } = await imp("scripts/textbook-v2-merge.mjs");
const { applyPatches, readPatches, readFrozen, BATCH_DIR } = await imp("scripts/textbook-v2-patch.mjs");
const paths = lib.dataPaths();
const frozen: Record<string, string> = readFrozen(BATCH_DIR);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
if (outAt < 0) throw new Error("--out <report.json> is required");
const OUT = path.resolve(process.argv[outAt + 1]);
const REASON = "S158 C19b: zh headword ASCII ( ) → full-width （ ） with zh_terms / fixture / quiz (corpus norm)";
type Row = Record<string, any>;
const clone = (v: unknown) => JSON.parse(JSON.stringify(v));
const occ = (s: string, sub: string) => (sub === "" ? 0 : s.split(sub).length - 1);
const P = (...s: string[]) => path.join(ROOT, ...s);
const ser2 = (o: unknown) => `${JSON.stringify(o, null, 2)}\n`;

// ---------- the family: every zh_terms string with an ASCII paren ----------
const zhRaw = readFileSync(paths.zhTerms, "utf-8");
const zt = JSON.parse(zhRaw);
const HEADS = new Set<string>();
(function walk(o: unknown, k = ""): void {
  if (typeof o === "string") { if (k !== "note" && o.includes("(")) HEADS.add(o); }
  else if (o && typeof o === "object") for (const [kk, v] of Object.entries(o)) walk(v, kk);
})(zt);
const FW = (h: string) => h.replace("(", "（").replace(")", "）");
for (const h of HEADS) if (occ(h, "(") !== 1 || occ(h, ")") !== 1 || !h.endsWith(")")) throw new Error(`headword shape: ${h}`);
const HEAD_LIST = [...HEADS].sort((a, b) => b.length - a.length);
const fix = (s: string) => HEAD_LIST.reduce((t, h) => t.split(h).join(FW(h)), s);
const parenOnly = (a: unknown, b: unknown) => typeof a === "string" && typeof b === "string" && a !== b && a.replace(/（/g, "(").replace(/）/g, ")") === b.replace(/（/g, "(").replace(/）/g, ")");
const report: Row = { mode: APPLY ? "apply" : "plan", heads: [...HEADS].sort(), units: [] as Row[], quiz: [] as Row[], special: [] as Row[] };

// ---------- units ----------
const UNITS_DIR = P("data/ip/textbook/units");
const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_zh(\[\d+\])?$/;
const getPath = (o: Row, p: string) => p.replace(/\(([^)]*)\)/g, "").split(/\.|\[|\]/).filter(Boolean).reduce((a: any, k) => a?.[/^\d+$/.test(k) ? +k : k], o);
const setPath = (o: Row, p: string, v: unknown) => {
  const ks = p.split(/\.|\[|\]/).filter(Boolean).map((k) => (/^\d+$/.test(k) ? +k : k));
  let c: any = o;
  for (const k of ks.slice(0, -1)) c = c[k];
  c[ks.at(-1)!] = v;
};
function diffPaths(a: unknown, b: unknown, p = "", out: string[] = []): string[] {
  if (a === b) return out;
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a as object), ...Object.keys(b as object)])) diffPaths((a as Row)[k], (b as Row)[k], Array.isArray(a) ? `${p}[${k}]` : p ? `${p}.${k}` : k, out);
    return out;
  }
  out.push(p);
  return out;
}
const journalsOf = (unit: string) => {
  const dir = paths.planning(unit);
  return existsSync(dir) ? readdirSync(dir).filter((x) => /^journal\..*\.jsonl$/.test(x)).sort().map((x) => path.join(dir, x)) : [];
};
function mergeDry(unit: string) {
  const mf = paths.merged(unit);
  const t0 = existsSync(mf) ? statSync(mf).mtimeMs : 0;
  let exit = 0;
  try {
    execFileSync("node", ["--no-warnings", "scripts/textbook-v2-merge.mjs", "--unit", unit, ...journalsOf(unit).flatMap((j) => ["--journal", j])], { cwd: ROOT, stdio: "pipe" });
  } catch (e) {
    exit = (e as { status: number }).status;
  }
  if (!existsSync(mf) || statSync(mf).mtimeMs === t0) throw new Error(`${unit}: merge dry-run did not write merged.json (exit ${exit})`);
  return { merged: lib.readJson(mf), exit };
}
const cli = (args: string[]) => execFileSync("node", ["--no-warnings", "scripts/textbook-v2-patch.mjs", ...args], { cwd: ROOT, encoding: "utf8" }).trim();
function windowOf(T: string, F: string) {
  let pre = 0;
  while (pre < T.length && pre < F.length && T[pre] === F[pre]) pre++;
  let suf = 0;
  while (suf < T.length - pre && suf < F.length - pre && T[T.length - 1 - suf] === F[F.length - 1 - suf]) suf++;
  let a = pre;
  let b = T.length - suf;
  let fb = F.length - suf;
  while (a > 0 && (b - a === 0 || occ(T, T.slice(a, b)) !== 1)) a--;
  while (b < T.length && occ(T, T.slice(a, b)) !== 1) (b++, fb++);
  return { a, b, before: T.slice(a, b), after: F.slice(a, fb) };
}
const loc2field = (u: Row, p: string) => p.replace(/^terms\[(\d+)\]/, (_m, i) => `terms[${i}](${u.terms[Number(i)].term})`);
const isTerm = (p: string) => /^terms\[\d+\]\.term_zh$/.test(p);

const unitFields = new Map<string, Row[]>();
for (const f of readdirSync(UNITS_DIR).filter((x) => x.endsWith(".json")).sort()) {
  const unit = f.replace(/\.json$/, "");
  const u = lib.readJson(path.join(UNITS_DIR, f));
  (function walk(o: unknown, p: string): void {
    if (typeof o === "string") {
      if (!/(_zh|\.zh)(\[\d+\])?$/.test(p) || DERIVED.test(p)) return;
      const after = fix(o);
      if (after === o) return;
      if (/^(title_zh|unit_summary_zh)$/.test(p)) throw new Error(`${unit} ${p}: route not prepared`);
      unitFields.set(unit, [...(unitFields.get(unit) ?? []), { unit, path: p, before: o, after }]);
      return;
    }
    if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k);
  })(u, "");
}

const fixture = lib.readJson(V1TERMS_FIXTURE);
const fixtureRaw = readFileSync(V1TERMS_FIXTURE, "utf-8");
if (ser2(JSON.parse(fixtureRaw)) !== fixtureRaw || ser2(JSON.parse(zhRaw)) !== zhRaw) throw new Error("fixture / zh_terms not 2-space JSON");

for (const [unit, fps] of [...unitFields].sort()) {
  if (frozen[unit]) throw new Error(`${unit}: frozen (route not prepared)`);
  const u = lib.readJson(path.join(UNITS_DIR, `${unit}.json`));
  const ur: Row = { unit, fields: fps.map((f) => ({ path: f.path, before: f.before, after: f.after })), steps: [] as Row[] };
  report.units.push(ur);
  const loc = fps.filter((f) => !isTerm(f.path));
  const termFs = fps.filter((f) => isTerm(f.path));
  const fin = pickFinal(unit, journalRows(journalsOf(unit)), null);
  const partFile = fin.loc.part;
  const locSha = lib.sha256File(partFile);
  const manifestFile = paths.manifest(unit);
  const manifest = lib.readJson(manifestFile);
  ur.loc_part = path.relative(ROOT, partFile);
  const doc = readPatches(BATCH_DIR, unit);
  const sim = clone(doc.patches) as Row[];
  const full = lib.readJson(partFile);
  applyPatches(full, doc.patches, locSha);
  for (const fp of loc) {
    const field0 = loc2field(u, fp.path);
    const same = sim.filter((p) => p.status === "active" && String(p.field).replace(/\(.*?\)/g, "") === fp.path);
    const fieldStr = same[0]?.field ?? field0;
    const cur = (() => { const l = lib.readJson(partFile); applyPatches(l, sim, locSha); return getPath(l, fp.path) as string; })();
    if (cur !== fp.before) throw new Error(`${unit} ${fp.path}: patched loc part ≠ units`);
    const retired = new Set<string>();
    for (;;) {
      const l = lib.readJson(partFile);
      applyPatches(l, sim.map((p) => (retired.has(p.id) ? { ...p, status: "retired" } : p)), locSha);
      const T0 = getPath(l, fp.path) as string;
      const w = windowOf(T0, fp.after);
      const hit = same.filter((q) => !retired.has(q.id)).filter((q) => {
        const i = T0.indexOf(q.after);
        return q.after !== "" && i >= 0 && w.a < i + q.after.length && i < w.b;
      });
      if (hit.length) { for (const q of hit) retired.add(q.id); continue; }
      for (const id of retired) {
        ur.steps.push({ op: "retire", id, reason: `${REASON}: superseded by a composite patch (C17 pattern)` });
        sim.find((p) => p.id === id)!.status = "retired";
      }
      ur.steps.push({ op: "register", field: fieldStr, before: w.before, after: w.after, reason: retired.size ? `${REASON} (composite of ${[...retired].join(", ")} + this edit)` : REASON });
      sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: locSha, field: fieldStr, before: w.before, after: w.after });
      break;
    }
  }
  const simLoc = lib.readJson(partFile);
  applyPatches(simLoc, sim, locSha);
  for (const fp of loc) if (getPath(simLoc, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: simulated replay ≠ final`);
  const stray = diffPaths(full, simLoc).filter((p) => !loc.some((f) => f.path === p));
  if (stray.length) throw new Error(`${unit}: simulated replay changes other fields: ${stray.join(", ")}`);
  for (const t of termFs) {
    const term = u.terms[Number(/\d+/.exec(t.path)![0])].term;
    const vt = manifest.v1_terms.find((x: Row) => x.term === term);
    const ft = fixture[unit]?.find((x: Row) => x.term === term);
    if (vt?.term_zh !== t.before) throw new Error(`${unit} ${term}: manifest term_zh ≠ before`);
    ur.fixture_has_term = ur.fixture_has_term ?? {};
    ur.fixture_has_term[term] = ft ? ft.term_zh === t.before : "absent";
    if (ft && ft.term_zh !== t.before) throw new Error(`${unit} ${term}: fixture term_zh ≠ before`);
  }
  if (!APPLY) continue;

  const m0 = mergeDry(unit);
  ur.merge_exit_before = m0.exit;
  ur.baseline_diff = diffPaths(m0.merged, u);
  if (termFs.length) {
    const man2 = lib.readJson(manifestFile);
    for (const t of termFs) {
      const term = u.terms[Number(/\d+/.exec(t.path)![0])].term;
      man2.v1_terms.find((x: Row) => x.term === term).term_zh = t.after;
      const ft = fixture[unit]?.find((x: Row) => x.term === term);
      if (ft) ft.term_zh = t.after;
    }
    writeFileSync(manifestFile, lib.jsonText(man2));
  }
  for (const s of ur.steps) {
    const o = s.op === "retire"
      ? cli(["--unit", unit, "--retire", s.id, "--reason", s.reason])
      : cli(["--unit", unit, "--register", "--part", partFile, "--field", s.field, "--before", s.before, "--after", s.after, "--reason", s.reason]);
    (ur.cli ??= []).push(o);
  }
  const m1 = mergeDry(unit);
  ur.merge_exit_after = m1.exit;
  const targets = fps.map((f) => f.path);
  const newDiff = diffPaths(m1.merged, u).filter((p) => !ur.baseline_diff.includes(p));
  ur.new_diff = newDiff;
  const followers = newDiff.filter((p) => !targets.includes(p) && DERIVED.test(p) && parenOnly(getPath(u, p), getPath(m1.merged, p)));
  ur.derived_followers = followers;
  const bad = newDiff.filter((p) => !targets.includes(p) && !followers.includes(p));
  if (bad.length) throw new Error(`${unit}: merged differs outside the targets: ${bad.join(", ")} (patches registered; units/ NOT written)`);
  const mod = clone(u);
  for (const p of newDiff) setPath(mod, p, getPath(m1.merged, p));
  for (const fp of fps) if (getPath(mod, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: end value ≠ final`);
  writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
  const after = diffPaths(m1.merged, lib.readJson(path.join(UNITS_DIR, `${unit}.json`)));
  ur.diff_after_equals_baseline = JSON.stringify([...after].sort()) === JSON.stringify([...ur.baseline_diff].sort());
  if (!ur.diff_after_equals_baseline) throw new Error(`${unit}: after the write merged-vs-units ≠ baseline`);
}

// ---------- zh_terms.json, fixture, zh-terms test ----------
const zt2 = JSON.parse(zhRaw);
let ztN = 0;
(function walk(o: Row): void {
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string" && k !== "note" && HEADS.has(v)) { o[k] = FW(v); ztN++; }
    else if (v && typeof v === "object") walk(v as Row);
  }
})(zt2);
report.special.push({ file: "data/ip/textbook/zh_terms.json", values_changed: ztN });
const fixtureLeft = HEAD_LIST.filter((h) => JSON.stringify(fixture).includes(h)); // Rule D L5: an always-truthy prefix removed
report.special.push({ file: path.relative(ROOT, V1TERMS_FIXTURE), heads_left_after: APPLY ? fixtureLeft : "plan" });
const ZT_TEST = P("scripts/textbook-v2-zh-terms.test.mjs");
const ztTestRaw = readFileSync(ZT_TEST, "utf-8");
const realLine = `assert.deepEqual(t.per_unit["MBO"], { "strategy-01-01-u06": "MBO(目标管理)", "strategy-03-09-u04": "管理层收购（MBO）" });`;
if (occ(ztTestRaw, realLine) !== 1) throw new Error("zh-terms test: real-data assertion not found once");
report.special.push({ file: "scripts/textbook-v2-zh-terms.test.mjs", change: "the real-data per_unit MBO assertion (synthetic fixtures in other tests unchanged)" });

// ---------- quiz ----------
const TRD = P("data/ip/quiz/translations");
const EXD = P("data/ip/quiz/explanations");
const trDocs = new Map<string, Row>();
for (const f of readdirSync(TRD).filter((x) => x.endsWith(".json")).sort()) {
  const d = JSON.parse(readFileSync(path.join(TRD, f), "utf-8"));
  let n = 0;
  for (const [qid, q] of Object.entries<Row>(d.questions ?? {})) {
    for (const [where, o] of [["stem", q.stem], ...Object.entries<Row>(q.choices ?? {}).map(([c, v]) => [`c:${c}`, v])] as [string, Row][]) {
      if (typeof o?.zh !== "string") continue;
      const a = fix(o.zh);
      if (a === o.zh) continue;
      report.quiz.push({ layer: "translations", exam: f.replace(".json", ""), qid, where, before: o.zh, after: a });
      o.zh = a;
      n++;
    }
  }
  if (n) trDocs.set(f, d);
}
const exExams = new Set<string>();
for (const f of readdirSync(EXD).filter((x) => x.endsWith(".json")).sort()) {
  const d = JSON.parse(readFileSync(path.join(EXD, f), "utf-8"));
  for (const [qid, q] of Object.entries<Row>(d.questions ?? {})) {
    const slots = [["correct", q.correct], ...Object.entries<Row>(q.distractors ?? {}).map(([k, v]) => [`d:${k}`, v]), ...(q.points ?? []).map((v: Row, i: number) => [`p:${i}`, v])] as [string, Row][];
    for (const [where, o] of slots) {
      if (typeof o?.zh !== "string") continue;
      const a = fix(o.zh);
      if (a === o.zh) continue;
      report.quiz.push({ layer: "explanations", exam: f.replace(".json", ""), qid, where, before: o.zh, after: a });
      exExams.add(f.replace(".json", ""));
    }
  }
}
const pick = (o: Row, where: string, sidecar: boolean) =>
  where === "correct" ? o.correct : where.startsWith("d:") ? (sidecar ? o.distractors[where.slice(2)] : o.distractors.find((x: Row) => x.letter === where.slice(2))) : o.points[Number(where.slice(2))];
if (APPLY) {
  writeFileSync(paths.zhTerms, ser2(zt2));
  writeFileSync(V1TERMS_FIXTURE, ser2(fixture));
  writeFileSync(ZT_TEST, ztTestRaw.replace(realLine, realLine.replace("MBO(目标管理)", "MBO（目标管理）")));
  for (const [f, d] of trDocs) writeFileSync(path.join(TRD, f), ser2(d));
  for (const fl of report.quiz.filter((x: Row) => x.layer === "translations")) {
    const p1 = P("data/ip/quiz/.phase1", `tr_${fl.qid}.json`);
    if (!existsSync(p1)) { fl.phase1 = "no file"; continue; }
    const raw = readFileSync(p1, "utf-8");
    const d = JSON.parse(raw);
    const o = fl.where === "stem" ? d.stem : d.choices?.[fl.where.slice(2)];
    if (o?.zh === fl.before) { o.zh = fl.after; writeFileSync(p1, `${JSON.stringify(d, null, raw.startsWith("{\n  ") ? 2 : 0)}${raw.endsWith("\n") ? "\n" : ""}`); fl.phase1 = "fixed"; }
    else fl.phase1 = "differs (left)";
  }
  const merge = (exam: string) => execFileSync("node", ["scripts/quiz-phase2-merge.mjs", exam], { cwd: ROOT, stdio: "pipe" });
  const before = new Map<string, string>();
  for (const exam of exExams) {
    const f = path.join(EXD, `${exam}.json`);
    const raw = readFileSync(f, "utf-8");
    merge(exam);
    if (readFileSync(f, "utf-8") !== raw) { writeFileSync(f, raw); throw new Error(`${exam}: merge does not reproduce the sidecar (restored)`); }
    before.set(exam, raw);
  }
  for (const fl of report.quiz.filter((x: Row) => x.layer === "explanations")) {
    const p2 = P("data/ip/quiz/.phase2", `expl_tr_${fl.qid}.json`);
    const raw = readFileSync(p2, "utf-8");
    const d = JSON.parse(raw);
    const o = pick(d, fl.where, false);
    if (o.zh !== fl.before) throw new Error(`${fl.qid} ${fl.where}: .phase2 ≠ sidecar`);
    o.zh = fl.after;
    writeFileSync(p2, `${JSON.stringify(d, null, raw.startsWith("{\n  ") ? 2 : 0)}${raw.endsWith("\n") ? "\n" : ""}`);
  }
  for (const exam of exExams) {
    merge(exam);
    const want = JSON.parse(before.get(exam)!);
    for (const fl of report.quiz.filter((x: Row) => x.layer === "explanations" && x.exam === exam)) pick(want.questions[fl.qid], fl.where, true).zh = fl.after;
    if (JSON.stringify(JSON.parse(readFileSync(path.join(EXD, `${exam}.json`), "utf-8"))) !== JSON.stringify(want)) throw new Error(`${exam}: rebuilt sidecar ≠ before + planned`);
  }
}
report.summary = {
  heads: HEADS.size,
  units: report.units.length,
  unit_fields: report.units.reduce((n: number, u: Row) => n + u.fields.length, 0),
  term_zh: report.units.reduce((n: number, u: Row) => n + u.fields.filter((f: Row) => isTerm(f.path)).length, 0),
  registrations: report.units.reduce((n: number, u: Row) => n + u.steps.filter((s: Row) => s.op === "register").length, 0),
  retirements: report.units.reduce((n: number, u: Row) => n + u.steps.filter((s: Row) => s.op === "retire").length, 0),
  zh_terms_values: ztN,
  quiz_fields: report.quiz.length,
  quiz_exams_remerged: [...exExams].length,
};
console.log(JSON.stringify(report.summary, null, 1));
writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`);
