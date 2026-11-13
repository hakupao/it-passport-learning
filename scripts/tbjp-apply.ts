#!/usr/bin/env node
// S155 follow-up of D-221 — mark the 18 textbook "tb-jp-unmarked" fields with [[jp:…]] (lang-allow.json category
// tb-jp-unmarked; terms[4].term_en of technology-21-55-u01 is a plain-string headword and is not marked, see
// evidence/phase5/hosting/tb_jp_unmarked_apply.md). Units half of scripts/l4-r2-apply.ts (S154 L4 round 2), units only:
//   each field = one B3 loc-part patch (scripts/textbook-v2-patch.mjs CLI, --part = the final loc part), the minimal
//   unique window; overlapping an active patch's replaced text → retire it + register a composite (C17 pattern);
//   then merge dry-run (never --write) and in-place write of the target fields' merged values only.
//   No derived-field allowance: a mark that is not right after a **keyword** leaves compatText unchanged, so the
//   merge diff must be exactly the target paths.
// Each EDIT inserts [[jp:…]] around existing text: `from` must occur once in the current value, `to` = `from` with marks.
// Plan mode (default) simulates every unit's patch list in memory; --apply registers and writes.
// Run: node --no-warnings scripts/tbjp-apply.ts [--round b] [--apply] --out <report.json>

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const imp = (p: string) => import(pathToFileURL(path.join(ROOT, p)).href);
const lib = await imp("scripts/lib/textbook-v2.mjs");
const { journalRows, pickFinal } = await imp("scripts/textbook-v2-merge.mjs");
const { applyPatches, readPatches, readFrozen, BATCH_DIR } = await imp("scripts/textbook-v2-patch.mjs");
const { stripInline } = await imp("apps/web/src/lib/textbook/inline.ts");
const paths = lib.dataPaths();
const frozen: Record<string, string> = readFrozen(BATCH_DIR);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
if (outAt < 0) throw new Error("--out <report.json> is required");
const OUT = path.resolve(process.argv[outAt + 1]);
// --round b (S155 main-session minor decision): the 日语名称 row of technology-13-34-u02 shows the Japanese form in zh too —
// a text change (simplified 值 / 频 → 値 / 頻 + mark), exact after-values, these 2 fields only.
const ROUND_B = process.argv.includes("--round") && process.argv[process.argv.indexOf("--round") + 1] === "b";
const REASON = ROUND_B
  ? "S155 minor decision (main session): 日语名称 row shows the Japanese form in zh as in en — 中央值 / 最频值 → [[jp:中央値]] / [[jp:最頻値]]"
  : "S155 D-221 follow-up: tb-jp-unmarked — [[jp:]] mark around intended Japanese (lang-allow tb-jp-unmarked removed)";
type Row = Record<string, any>;
const clone = (v: unknown) => JSON.parse(JSON.stringify(v));
const occ = (s: string, sub: string) => (sub === "" ? 0 : s.split(sub).length - 1);
const P = (...s: string[]) => path.join(ROOT, ...s);

// [unit, path, [from, to][]]
const EDITS: [string, string, [string, string][]][] = [
  ["strategy-03-09-u04", "terms[2].detail_en", [["(公開)", "([[jp:公開]])"]]],
  ["strategy-03-09-u05", "terms[3].detail_zh", [["“共食い”", "“[[jp:共食い]]”"]]],
  ["strategy-03-10-u07", "pairs[0].rows[3].a_zh", [["上澄み吸収価格戦略（", "[[jp:上澄み吸収価格戦略]]（"]]],
  ["strategy-03-10-u07", "pairs[0].rows[3].a_en", [["上澄み吸収価格戦略 (", "[[jp:上澄み吸収価格戦略]] ("]]],
  ["strategy-03-10-u07", "pairs[0].rows[3].b_zh", [["市場浸透価格戦略（", "[[jp:市場浸透価格戦略]]（"]]],
  ["strategy-03-10-u07", "pairs[0].rows[3].b_en", [["市場浸透価格戦略 (", "[[jp:市場浸透価格戦略]] ("]]],
  ["technology-13-34-u02", "pairs[1].rows[0].a_en", [["中央値 (", "[[jp:中央値]] ("]]],
  ["technology-13-34-u02", "pairs[1].rows[0].b_en", [["最頻値 (", "[[jp:最頻値]] ("]]],
  ["technology-13-34-u06", "goals_en[1]", [["(エッジ)", "([[jp:エッジ]])"], ["(辺)", "([[jp:辺]])"]]],
  ["technology-13-34-u06", "terms[3].detail_en", [["the term 辺 is", "the term [[jp:辺]] is"]]],
  ["technology-14-37-u03", "terms[1].detail_en", [["word 手続 can", "word [[jp:手続]] can"]]],
  ["technology-14-37-u03", "terms[1].detail_zh", [["“手続”", "“[[jp:手続]]”"]]],
  ["technology-20-53-u03", "terms[3].detail_zh", [["“拡張”", "“[[jp:拡張]]”"]]],
  ["technology-20-53-u03", "terms[5].detail_zh", [["“複合”", "“[[jp:複合]]”"]]],
  ["technology-22-60-u06", "terms[0].detail_zh", [["“マイモ”", "“[[jp:マイモ]]”"]]],
  ["technology-23-62-u05", "terms[1].one_zh", [["“シーサート”", "“[[jp:シーサート]]”"]]],
  ["technology-23-62-u05", "terms[2].one_zh", [["“ソック”", "“[[jp:ソック]]”"]]],
  ["technology-23-63-u10", "terms[6].detail_en", [["either 本人拒否率 or", "either [[jp:本人拒否率]] or"]]],
];
const EDITS_B: [string, string, [string, string][]][] = [
  ["technology-13-34-u02", "pairs[1].rows[0].a_zh", [["中央值（中位数）", "[[jp:中央値]]（中位数）"]]],
  ["technology-13-34-u02", "pairs[1].rows[0].b_zh", [["最频值（众数）", "[[jp:最頻値]]（众数）"]]],
];

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

const report: Row = { mode: APPLY ? "apply" : "plan", fields: [] as Row[], units: [] as Row[] };
const unitFields = new Map<string, Row[]>();
for (const [unit, p, subs] of ROUND_B ? EDITS_B : EDITS) {
  const u = lib.readJson(path.join(UNITS_DIR, `${unit}.json`));
  const before = getPath(u, p);
  if (typeof before !== "string") throw new Error(`${unit} ${p}: not a string`);
  let after = before;
  for (const [from, to] of subs) {
    if (occ(after, from) !== 1) throw new Error(`${unit} ${p}: «${from}» occurs ${occ(after, from)}×`);
    if (!ROUND_B && stripInline(to) !== from) throw new Error(`${unit} ${p}: «${to}» is not «${from}» plus marks`);
    after = after.replace(from, to);
  }
  if (!ROUND_B && stripInline(after) !== stripInline(before)) throw new Error(`${unit} ${p}: strip(after) ≠ strip(before)`);
  const f = { unit, path: p, before, after, ...(ROUND_B ? { exact: true } : {}) };
  report.fields.push(f);
  unitFields.set(unit, [...(unitFields.get(unit) ?? []), f]);
}

for (const [unit, fps] of [...unitFields].sort()) {
  if (frozen[unit]) throw new Error(`${unit}: frozen (direct edit not prepared)`);
  const u = lib.readJson(path.join(UNITS_DIR, `${unit}.json`));
  const ur: Row = { unit, fields: [] as Row[], steps: [] as Row[] };
  report.units.push(ur);
  const fin = pickFinal(unit, journalRows(journalsOf(unit)), null);
  const partFile = fin.loc.part;
  const locSha = lib.sha256File(partFile);
  ur.loc_part = path.relative(ROOT, partFile);
  const doc = readPatches(BATCH_DIR, unit);
  const sim = clone(doc.patches) as Row[];
  const full = lib.readJson(partFile);
  applyPatches(full, doc.patches, locSha);
  for (const fp of fps) {
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
      ur.steps.push({ op: "register", field: fieldStr, before: w.before, after: w.after, reason: retired.size ? `${REASON} (composite of ${[...retired].join(", ")} + this edit)` : REASON });
      sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: locSha, field: fieldStr, before: w.before, after: w.after });
      ur.fields.push({ path: fp.path, route: retired.size ? "retire + composite" : "register", retired: [...retired] });
      break;
    }
  }
  const simLoc = lib.readJson(partFile);
  applyPatches(simLoc, sim, locSha);
  for (const fp of fps) if (getPath(simLoc, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: simulated replay ≠ final`);
  const stray = diffPaths(full, simLoc).filter((p) => !fps.some((f) => f.path === p));
  if (stray.length) throw new Error(`${unit}: simulated replay changes other fields: ${stray.join(", ")}`);
  if (!APPLY) continue;

  const m0 = mergeDry(unit);
  ur.merge_exit_before = m0.exit;
  ur.baseline_diff = diffPaths(m0.merged, u);
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
  const bad = newDiff.filter((p) => !targets.includes(p));
  if (bad.length) throw new Error(`${unit}: merged differs outside the targets: ${bad.join(", ")} (patches registered; units/ NOT written)`);
  const mod = clone(u);
  for (const p of newDiff) setPath(mod, p, getPath(m1.merged, p));
  for (const fp of fps) if (getPath(mod, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: end value ≠ final`);
  writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
  const after = diffPaths(m1.merged, lib.readJson(path.join(UNITS_DIR, `${unit}.json`)));
  ur.diff_after_write = after;
  ur.diff_after_equals_baseline = JSON.stringify([...after].sort()) === JSON.stringify([...ur.baseline_diff].sort());
  if (!ur.diff_after_equals_baseline) throw new Error(`${unit}: after the write merged-vs-units ≠ baseline`);
}

const all = report.units as Row[];
report.summary = {
  units: all.length,
  unit_fields: all.reduce((n, u) => n + u.fields.length, 0),
  registrations: all.reduce((n, u) => n + u.steps.filter((s: Row) => s.op === "register").length, 0),
  retirements: all.reduce((n, u) => n + u.steps.filter((s: Row) => s.op === "retire").length, 0),
  composites: all.reduce((n, u) => n + u.fields.filter((f: Row) => f.route === "retire + composite").length, 0),
};
console.log(JSON.stringify(report.summary, null, 1));
writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`);
