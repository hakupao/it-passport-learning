#!/usr/bin/env node
// S155 OQ-15 (textbook side) — two v1 term_zh mistranslations carried into v2 units:
//   technology-16-44-u03: デュアルシステム / デュプレックスシステム zh swapped → 双重系统 (dual) / 双工系统 (duplex), as D-175 and
//     technology-16-43-u02 (every 双工系统 ↔ 双重系统 in the unit's zh text, simultaneous swap);
//   technology-23-63-u05: アンチパスバック zh 防尾随 → 反潜回 (the quiz layer's S130 name; 尾随 = 共連れ stays).
// Units half of scripts/l4-r2-apply.ts (S154 L4 round 2), same routes:
//   loc-part fields → one B3 patch each (scripts/textbook-v2-patch.mjs CLI, --part = the final loc part), the minimal unique window;
//     overlapping an active patch's replaced text → retire it + register a composite (C17 pattern);
//   term_zh → manifest.v1_terms (gitignored; merge assembles term_zh from it; manifest.v1 untouched) +
//     apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json + units (via the merged value);
//   zh_terms.json: アンチパスバック → 反潜回（Anti-passback）, デュアルシステム / デュプレックスシステム from excluded (OQ-15) into terms
//     (= what seedTable derives from the corrected units);
//   then merge dry-run (never --write) and in-place write of the merged values of the target fields and their compat fields only.
// Planned fields = every non-derived zh string of the unit containing the old name (derived: definition / explanation /
// memory_hook, summary.*, overview.intro_zh — they follow through the merge, COMPAT allow-list as in l4-r2-apply).
// Plan mode (default) simulates the patch lists in memory; --apply runs it.
// Run: node --no-warnings scripts/oq15-apply.ts [--apply] --out <report.json>

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
const REASON = "S155 OQ-15: v1 term_zh mistranslation — デュアル = 双重系统 / デュプレックス = 双工系统 (D-175), アンチパスバック = 反潜回 (quiz S130)";
type Row = Record<string, any>;
const clone = (v: unknown) => JSON.parse(JSON.stringify(v));
const occ = (s: string, sub: string) => (sub === "" ? 0 : s.split(sub).length - 1);
const P = (...s: string[]) => path.join(ROOT, ...s);

const swapDual = (s: string) => s.replace(/双工系统|双重系统/g, (m) => (m === "双工系统" ? "双重系统" : "双工系统"));
const antiPassback = (s: string) => s.replaceAll("防尾随", "反潜回");
const UNITS: Record<string, { hit: RegExp; fix: (s: string) => string }> = {
  "technology-16-44-u03": { hit: /双工系统|双重系统/, fix: swapDual },
  "technology-23-63-u05": { hit: /防尾随/, fix: antiPassback },
};
const DERIVED = /(^summary\.|^overview\.intro_zh$|\.(definition|explanation|memory_hook)_zh$)/;

const UNITS_DIR = P("data/ip/textbook/units");
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
function strings(o: unknown, p = "", out: [string, string][] = []): [string, string][] {
  if (typeof o === "string") out.push([p, o]);
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) strings(v, Array.isArray(o) ? `${p}[${k}]` : p ? `${p}.${k}` : k, out);
  return out;
}
const isZh = (p: string) => /_zh(\[\d+\])?$/.test(p);
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

const report: Row = { mode: APPLY ? "apply" : "plan", fields: [] as Row[], derived_expected: [] as Row[], units: [] as Row[], special: [] as Row[] };
const fixture = lib.readJson(V1TERMS_FIXTURE);
const fixtureRaw = readFileSync(V1TERMS_FIXTURE, "utf-8");
const zhRaw = readFileSync(paths.zhTerms, "utf-8");

for (const [unit, { hit, fix }] of Object.entries(UNITS)) {
  if (frozen[unit]) throw new Error(`${unit}: frozen (direct edit not prepared)`);
  const u = lib.readJson(path.join(UNITS_DIR, `${unit}.json`));
  const fps: Row[] = [];
  for (const [p, s] of strings(u)) {
    if (!isZh(p) || !hit.test(s)) continue;
    if (DERIVED.test(p)) {
      report.derived_expected.push({ unit, path: p, before: s, after: fix(s) });
      continue;
    }
    const f = { unit, path: p, before: s, after: fix(s) };
    fps.push(f);
    report.fields.push(f);
  }
  const ur: Row = { unit, fields: [] as Row[], steps: [] as Row[] };
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
      const hitP = same.filter((q) => !retired.has(q.id)).filter((q) => {
        const i = T0.indexOf(q.after);
        return q.after !== "" && i >= 0 && w.a < i + q.after.length && i < w.b;
      });
      if (hitP.length) {
        for (const q of hitP) retired.add(q.id);
        continue;
      }
      for (const id of retired) {
        ur.steps.push({ op: "retire", id, reason: `${REASON}: superseded by a composite patch (C17 pattern)` });
        sim.find((p) => p.id === id)!.status = "retired";
      }
      ur.steps.push({ op: "register", field: fieldStr, before: w.before, after: w.after, reason: retired.size ? `${REASON} (composite of ${[...retired].join(", ")} + this edit)` : REASON });
      sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: locSha, field: fieldStr, before: w.before, after: w.after });
      ur.fields.push({ path: fp.path, route: retired.size ? "retire + composite" : "register", retired: [...retired] });
      break;
    }
  }
  const simLoc = lib.readJson(partFile);
  applyPatches(simLoc, sim, locSha);
  for (const fp of loc) if (getPath(simLoc, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: simulated replay ≠ final`);
  const stray = diffPaths(full, simLoc).filter((p) => !loc.some((f) => f.path === p));
  if (stray.length) throw new Error(`${unit}: simulated replay changes other fields: ${stray.join(", ")}`);
  const manifestChange: Row[] = [];
  for (const t of termFs) {
    const term = u.terms[Number(/\d+/.exec(t.path)![0])].term;
    const vt = manifest.v1_terms.find((x: Row) => x.term === term);
    const ft = fixture[unit]?.find((x: Row) => x.term === term);
    if (vt?.term_zh !== t.before || ft?.term_zh !== t.before) throw new Error(`${unit} ${term}: manifest / fixture term_zh ≠ before`);
    ur.fields.push({ path: t.path, route: "term_zh: manifest.v1_terms + fixture + units (merged)" });
    manifestChange.push({ file: path.relative(ROOT, manifestFile), path: `v1_terms[${manifest.v1_terms.indexOf(vt)}].term_zh`, term, before: t.before, after: t.after });
  }
  ur.manifest_change = manifestChange;
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
      : cli(["--unit", unit, "--register", "--part", partFile, "--field", s.field, "--before", s.before, "--after", s.after, "--reason", s.reason]);
    (ur.cli ??= []).push(out);
  }
  const m1 = mergeDry(unit);
  ur.merge_exit_after = m1.exit;
  const targets = fps.map((f) => f.path);
  const newDiff = diffPaths(m1.merged, u).filter((p) => !ur.baseline_diff.includes(p));
  ur.new_diff = newDiff;
  const bad = newDiff.filter((p) => !allowedFor(targets)(p));
  if (bad.length) throw new Error(`${unit}: merged differs outside the targets: ${bad.join(", ")} (patches registered; units/ NOT written)`);
  const mod = clone(u);
  for (const p of newDiff) setPath(mod, p, getPath(m1.merged, p));
  for (const fp of fps) if (getPath(mod, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: end value ≠ final`);
  // every derived field the old name reached must now carry the fixed text (exactly fix(before))
  for (const d of report.derived_expected.filter((x: Row) => x.unit === unit)) {
    if (getPath(mod, d.path) !== d.after) throw new Error(`${unit} ${d.path}: derived value ≠ fix(before): ${getPath(mod, d.path)}`);
  }
  writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
  const after = diffPaths(m1.merged, lib.readJson(path.join(UNITS_DIR, `${unit}.json`)));
  ur.diff_after_write = after;
  ur.diff_after_equals_baseline = JSON.stringify([...after].sort()) === JSON.stringify([...ur.baseline_diff].sort());
  if (!ur.diff_after_equals_baseline) throw new Error(`${unit}: after the write merged-vs-units ≠ baseline`);
}

// ===================== zh_terms / fixture =====================
const zt = JSON.parse(zhRaw);
const ztBefore = { アンチパスバック: zt.terms["アンチパスバック"], excluded: clone(zt.excluded) };
if (zt.terms["アンチパスバック"] !== "防尾随（Anti-passback）") throw new Error("zh_terms アンチパスバック ≠ 防尾随（Anti-passback）");
for (const k of ["デュアルシステム", "デュプレックスシステム"]) {
  if (!/OQ-15/.test(zt.excluded[k] ?? "") || k in zt.terms) throw new Error(`zh_terms ${k}: not the OQ-15 excluded entry`);
  delete zt.excluded[k];
}
const terms = { ...zt.terms, アンチパスバック: "反潜回（Anti-passback）", デュアルシステム: "双重系统", デュプレックスシステム: "双工系统" };
zt.terms = Object.fromEntries(Object.keys(terms).sort().map((k) => [k, terms[k]]));
report.special.push({ file: "data/ip/textbook/zh_terms.json", before: ztBefore, after: { アンチパスバック: zt.terms["アンチパスバック"], デュアルシステム: zt.terms["デュアルシステム"], デュプレックスシステム: zt.terms["デュプレックスシステム"], excluded: zt.excluded } });
if (APPLY) {
  const ser = (o: unknown) => `${JSON.stringify(o, null, 2)}\n`;
  for (const [f, raw, o] of [[paths.zhTerms, zhRaw, zt], [V1TERMS_FIXTURE, fixtureRaw, fixture]] as const) {
    if (ser(JSON.parse(raw)) !== raw) throw new Error(`${f}: not 2-space JSON, refusing to re-serialise`);
    writeFileSync(f, ser(o));
    report.special.push({ file: path.relative(ROOT, f), written: true });
  }
}
const all = report.units as Row[];
report.summary = {
  units: all.length,
  planned_fields: report.fields.length,
  derived_expected: report.derived_expected.length,
  registrations: all.reduce((n, u) => n + u.steps.filter((s: Row) => s.op === "register").length, 0),
  retirements: all.reduce((n, u) => n + u.steps.filter((s: Row) => s.op === "retire").length, 0),
  composites: all.reduce((n, u) => n + u.fields.filter((f: Row) => f.route === "retire + composite").length, 0),
  term_zh: all.reduce((n, u) => n + u.manifest_change.length, 0),
};
console.log(JSON.stringify(report.summary, null, 1));
writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`);
