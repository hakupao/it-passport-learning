#!/usr/bin/env node
// Track L step L4 round 2 — apply evidence/phase5/hosting/L4_round2_final.json (`node scripts/l4-round2-proposal.ts --final --write`:
// the proposal with the Rule D review L4_round2_review.md + main-session decisions applied). Every planned field carries
// `before` (= the current value, checked) and `after`.
// Paths (as round 1, scripts/l4-r1-*.ts):
//   quiz explanations → data/ip/quiz/.phase2/expl_tr_<id>.json zh, then `node scripts/quiz-phase2-merge.mjs <exam>`;
//   quiz translations → the sidecar only (D-222.5);
//   units, loc-part fields → B3 patch (scripts/textbook-v2-patch.mjs CLI, --part final loc part): one patch per field = the minimal
//     unique window; overlapping an active patch's replaced text → retire it + register a composite; then merge dry-run and
//     in-place write of the new merged values of the target fields and their compat fields only;
//   unit_summary_zh → unit-level patch (--manifest); title_zh → units/ + unit_index.json directly (C18);
//   term_zh → manifest.v1_terms (gitignored, merge assembles term_zh from it) + units/ (via the merged value) +
//     apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json; zh_terms.json entries マイナンバー / マイナンバー法;
//   frozen units → direct edit (+ compat fields).
// Plan mode (default) simulates every unit's patch list in memory (replay = final, no other field changes) and checks every
// quiz before; --apply runs it. Run: node scripts/l4-r2-apply.ts [--apply] --out <report.json>

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const imp = (p: string) => import(pathToFileURL(path.join(ROOT, p)).href);
const lib = await imp("scripts/lib/textbook-v2.mjs");
const { journalRows, pickFinal, V1TERMS_FIXTURE } = await imp("scripts/textbook-v2-merge.mjs");
const { applyPatches, applyUnitPatches, readPatches, readFrozen, v1Sha256, BATCH_DIR } = await imp("scripts/textbook-v2-patch.mjs");
const { compatText } = await imp("apps/web/src/lib/textbook/inline.ts");
const kit = await lib.loadKit();
const paths = lib.dataPaths();
const frozen: Record<string, string> = readFrozen(BATCH_DIR);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
if (outAt < 0) throw new Error("--out <report.json> is required");
const OUT = path.resolve(process.argv[outAt + 1]);
const REASON = "S154 L4 round 2 (D-221 / D-222, Rule D L4_round2_review.md)";
type Row = Record<string, any>;
const clone = (v: unknown) => JSON.parse(JSON.stringify(v));
const occ = (s: string, sub: string) => (sub === "" ? 0 : s.split(sub).length - 1);
const P = (...s: string[]) => path.join(ROOT, ...s);

const plan = lib.readJson(P("evidence/phase5/hosting/L4_round2_final.json"));
if (!plan.final) throw new Error("L4_round2_final.json is not a --final output");
const fields: Row[] = plan.fields;
const report: Row = { mode: APPLY ? "apply" : "plan", quiz: [] as Row[], units: [] as Row[], special: [] as Row[] };

// ===================== quiz =====================
const qDocs = new Map<string, { raw: string; d: Row }>();
const qLoad = (f: string) => {
  if (!qDocs.has(f)) {
    const raw = readFileSync(f, "utf-8");
    qDocs.set(f, { raw, d: JSON.parse(raw) });
  }
  return qDocs.get(f)!.d;
};
const quizExams = new Set<string>();
for (const f of fields.filter((x) => x.target.startsWith("q:"))) {
  const [, qid, ...rest] = f.target.split(":");
  const w = rest.join(":");
  const exam = qid.split("-q")[0];
  const tr = w === "stem" || w.startsWith("c:");
  let o: Row;
  let file: string;
  if (tr) {
    file = P("data/ip/quiz/translations", `${exam}.json`);
    const q = qLoad(file).questions[qid];
    o = w === "stem" ? q.stem : q.choices[w.slice(2)];
  } else {
    file = P("data/ip/quiz/.phase2", `expl_tr_${qid}.json`);
    const d = qLoad(file);
    o = w === "correct" ? d.correct : w.startsWith("d:") ? d.distractors.find((x: Row) => x.letter === w.slice(2)) : d.points[Number(w.slice(2))];
    quizExams.add(exam);
  }
  if (o?.zh !== f.before) throw new Error(`${f.target}: current zh ≠ planned before (layer ${path.relative(ROOT, file)})`);
  o.zh = f.after;
  report.quiz.push({ target: f.target, layer: tr ? "translations" : "expl_tr", file: path.relative(ROOT, file) });
}
report.merge_exams = [...quizExams].sort();
const quizWritten: string[] = [];
for (const [f, { raw, d }] of qDocs) {
  const next = `${JSON.stringify(d, null, 2)}\n`;
  if (next === raw) continue;
  quizWritten.push(path.relative(ROOT, f));
  if (APPLY) writeFileSync(f, next);
}
report.quiz_files = quizWritten;

// ===================== units =====================
const UNITS_DIR = P("data/ip/textbook/units");
const unitFields = new Map<string, Row[]>();
for (const f of fields.filter((x) => x.target.startsWith("u:"))) {
  const [, unit, ...rest] = f.target.split(":");
  unitFields.set(unit, [...(unitFields.get(unit) ?? []), { ...f, path: rest.join(":") }]);
}
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
/** minimal window of the change T → F, grown until unique in T. */
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
const COMPAT: [RegExp, (m: RegExpExecArray) => RegExp][] = [
  [/^terms\[(\d+)\]\.hook_zh$/, (m) => new RegExp(`^(terms\\[${m[1]}\\]\\.memory_hook_zh|summary\\.memory_hooks_zh(\\[\\d+\\])?)$`)],
  [/^terms\[(\d+)\]\.detail_zh$/, (m) => new RegExp(`^terms\\[${m[1]}\\]\\.explanation_zh$`)],
  [/^terms\[(\d+)\]\.one_zh$/, (m) => new RegExp(`^terms\\[${m[1]}\\]\\.definition_zh$`)],
  [/^goals_zh\[\d+\]$/, () => /^overview\.intro_zh$/],
  [/^terms\[(\d+)\]\.term_zh$/, () => /^summary\.memory_hooks_zh(\[\d+\])?$/], // hookLines() prefixes each hook with term_zh
  [/^key_points_zh\[(\d+)\]$/, (m) => new RegExp(`^summary\\.key_points_zh\\[${m[1]}\\]$`)],
];
const allowedFor = (targets: string[]) => (p: string) =>
  targets.some((t) => p === t || COMPAT.some(([re, mk]) => { const m = re.exec(t); return m && mk(m).test(p); }));

const fixture = lib.readJson(V1TERMS_FIXTURE);
const fixtureRaw = readFileSync(V1TERMS_FIXTURE, "utf-8");
const index = lib.readJson(paths.index);
const indexRaw = readFileSync(paths.index, "utf-8");
const zhRaw = readFileSync(paths.zhTerms, "utf-8");

for (const [unit, fps] of [...unitFields].sort()) {
  const u = lib.readJson(path.join(UNITS_DIR, `${unit}.json`));
  const ur: Row = { unit, frozen: frozen[unit] ?? null, fields: [] as Row[], steps: [] as Row[] };
  report.units.push(ur);
  for (const fp of fps) if (getPath(u, fp.path) !== fp.before) throw new Error(`${unit} ${fp.path}: units ≠ planned before`);
  const loc = fps.filter((f) => !isTerm(f.path) && f.path !== "title_zh" && f.path !== "unit_summary_zh");
  const sumF = fps.find((f) => f.path === "unit_summary_zh");
  const titleF = fps.find((f) => f.path === "title_zh");
  const termFs = fps.filter((f) => isTerm(f.path));

  if (frozen[unit]) {
    const mod = clone(u);
    for (const fp of fps) {
      if (!/^terms\[\d+\]\.(hook|one|detail)_zh$/.test(fp.path)) throw new Error(`${unit}: frozen direct edit not prepared for ${fp.path}`);
      setPath(mod, fp.path, fp.after);
      ur.fields.push({ path: fp.path, route: "frozen direct edit", before: fp.before, after: fp.after });
    }
    mod.terms.forEach((t: Row) => {
      t.definition_zh = compatText(t.one_zh ?? "", "zh");
      t.explanation_zh = compatText(t.detail_zh ?? "", "zh");
      if (typeof t.hook_zh === "string") t.memory_hook_zh = compatText(t.hook_zh, "zh");
    });
    mod.summary.memory_hooks_zh = kit.hookLines(mod, "zh");
    ur.diff_paths = diffPaths(u, mod);
    if (APPLY) writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
    continue;
  }

  const fin = pickFinal(unit, journalRows(journalsOf(unit)), null);
  const partFile = fin.loc.part;
  const locSha = lib.sha256File(partFile);
  const manifestFile = paths.manifest(unit);
  const manifest = lib.readJson(manifestFile);
  const vSha = v1Sha256(manifest);
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
      if (hit.length) {
        for (const q of hit) retired.add(q.id);
        continue;
      }
      for (const id of retired) {
        ur.steps.push({ op: "retire", id, reason: `${REASON}: superseded by a composite patch (C17 pattern)` });
        sim.find((p) => p.id === id)!.status = "retired";
      }
      ur.steps.push({ op: "register", kind: "part", field: fieldStr, before: w.before, after: w.after, reason: retired.size ? `${REASON} (composite of ${[...retired].join(", ")} + this edit)` : REASON });
      sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: locSha, field: fieldStr, before: w.before, after: w.after });
      ur.fields.push({ path: fp.path, route: retired.size ? "retire + composite" : "register", retired: [...retired] });
      break;
    }
  }
  if (sumF) {
    const T = manifest.v1.unit_summary_zh;
    const a = clone({ unit_summary_zh: T });
    applyUnitPatches(a, sim, vSha);
    if (a.unit_summary_zh !== sumF.before) throw new Error(`${unit}: unit_summary replay ≠ units`);
    if (sim.some((p) => p.status === "active" && p.field === "unit.unit_summary_zh")) throw new Error(`${unit}: unit_summary_zh already has an active unit-level patch (composite not prepared)`);
    const w = windowOf(sumF.before, sumF.after);
    ur.steps.push({ op: "register", kind: "unit", field: "unit.unit_summary_zh", before: w.before, after: w.after, reason: REASON });
    sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: vSha, field: "unit.unit_summary_zh", before: w.before, after: w.after });
    ur.fields.push({ path: "unit_summary_zh", route: "unit-level patch" });
  }
  // simulate: loc replay + assemble-free checks
  const simLoc = lib.readJson(partFile);
  applyPatches(simLoc, sim, locSha);
  for (const fp of loc) if (getPath(simLoc, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: simulated replay ≠ final`);
  const stray = diffPaths(full, simLoc).filter((p) => !loc.some((f) => f.path === p));
  if (stray.length) throw new Error(`${unit}: simulated replay changes other fields: ${stray.join(", ")}`);
  if (sumF) {
    const a = { unit_summary_zh: manifest.v1.unit_summary_zh };
    applyUnitPatches(a, sim, vSha);
    if (a.unit_summary_zh !== sumF.after) throw new Error(`${unit}: simulated unit_summary ≠ final`);
  }
  for (const t of termFs) {
    const term = u.terms[Number(/\d+/.exec(t.path)![0])].term;
    const vt = manifest.v1_terms.find((x: Row) => x.term === term);
    const ft = fixture[unit]?.find((x: Row) => x.term === term);
    if (vt?.term_zh !== t.before || ft?.term_zh !== t.before) throw new Error(`${unit} ${term}: manifest / fixture term_zh ≠ before`);
    ur.fields.push({ path: t.path, route: "term_zh: manifest.v1_terms + fixture + units (merged)" });
  }
  if (titleF) {
    const it = (function find(o: any): any { if (o && typeof o === "object") { if (o.unit_id === unit && "title_zh" in o) return o; for (const v of Object.values(o)) { const r = find(v); if (r) return r; } } return null; })(index);
    if (it?.title_zh !== titleF.before) throw new Error(`${unit}: unit_index title_zh ≠ before`);
    ur.fields.push({ path: "title_zh", route: "direct: units + unit_index.json" });
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
      fixture[unit].find((x: Row) => x.term === term).term_zh = t.after;
    }
    writeFileSync(manifestFile, lib.jsonText(man2));
  }
  for (const s of ur.steps) {
    const out = s.op === "retire"
      ? cli(["--unit", unit, "--retire", s.id, "--reason", s.reason])
      : cli(["--unit", unit, "--register", ...(s.kind === "unit" ? ["--manifest", manifestFile] : ["--part", partFile]), "--field", s.field, "--before", s.before, "--after", s.after, "--reason", s.reason]);
    (ur.cli ??= []).push(out);
  }
  const m1 = mergeDry(unit);
  ur.merge_exit_after = m1.exit;
  const targets = fps.filter((f) => f.path !== "title_zh").map((f) => f.path);
  const newDiff = diffPaths(m1.merged, u).filter((p) => !ur.baseline_diff.includes(p));
  ur.new_diff = newDiff;
  const bad = newDiff.filter((p) => !allowedFor(targets)(p));
  if (bad.length) throw new Error(`${unit}: merged differs outside the targets: ${bad.join(", ")} (patches registered; units/ NOT written)`);
  const mod = clone(u);
  for (const p of newDiff) setPath(mod, p, getPath(m1.merged, p));
  if (titleF) mod.title_zh = titleF.after;
  for (const fp of fps) if (getPath(mod, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: end value ≠ final`);
  writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
  const after = diffPaths(m1.merged, lib.readJson(path.join(UNITS_DIR, `${unit}.json`)));
  const expect = [...ur.baseline_diff, ...(titleF && !ur.baseline_diff.includes("title_zh") ? ["title_zh"] : [])];
  ur.diff_after_write = after;
  ur.diff_after_equals_expected = JSON.stringify([...after].sort()) === JSON.stringify([...expect].sort());
  if (!ur.diff_after_equals_expected) throw new Error(`${unit}: after the write merged-vs-units ≠ baseline (+ title_zh)`);
  if (titleF) {
    const it = (function find(o: any): any { if (o && typeof o === "object") { if (o.unit_id === unit && "title_zh" in o) return o; for (const v of Object.values(o)) { const r = find(v); if (r) return r; } } return null; })(index);
    it.title_zh = titleF.after;
  }
}

// ===================== zh_terms / fixture / index =====================
const zt = JSON.parse(zhRaw);
const ZT = zt.terms ?? zt;
const ztChange = { "マイナンバー": ["个人番号（My Number）", "个人编号（My Number）"], "マイナンバー法": ["我的编号法", "个人编号法"] } as const;
for (const [k, [b, a]] of Object.entries(ztChange)) {
  if (ZT[k] !== b) throw new Error(`zh_terms ${k} ≠ ${b}`);
  ZT[k] = a;
}
report.special.push({ file: "data/ip/textbook/zh_terms.json", change: ztChange });
if (APPLY) {
  // keep each file's serialisation (2-space JSON + newline): verified equal to its raw form before writing
  const ser = (o: unknown) => `${JSON.stringify(o, null, 2)}\n`;
  for (const [f, raw, o] of [[paths.zhTerms, zhRaw, zt], [V1TERMS_FIXTURE, fixtureRaw, fixture], [paths.index, indexRaw, index]] as const) {
    if (ser(JSON.parse(raw)) !== raw) throw new Error(`${f}: not 2-space JSON, refusing to re-serialise`);
    writeFileSync(f, ser(o));
    report.special.push({ file: path.relative(ROOT, f), written: true });
  }
}
const all = report.units as Row[];
report.summary = {
  quiz_fields: report.quiz.length,
  quiz_files: quizWritten.length,
  merge_exams: report.merge_exams.length,
  units: all.length,
  unit_fields: all.reduce((n, u) => n + u.fields.length, 0),
  registrations: all.reduce((n, u) => n + u.steps.filter((s: Row) => s.op === "register").length, 0),
  retirements: all.reduce((n, u) => n + u.steps.filter((s: Row) => s.op === "retire").length, 0),
  composites: all.reduce((n, u) => n + u.fields.filter((f: Row) => f.route === "retire + composite").length, 0),
  frozen_units: all.filter((u) => u.frozen).length,
};
console.log(JSON.stringify(report.summary, null, 1));
writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`);
