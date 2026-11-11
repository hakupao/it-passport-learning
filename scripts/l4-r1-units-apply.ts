#!/usr/bin/env node
// Track L step L4 round 1 (D-221 / D-222, Rule D review evidence/phase5/hosting/L4_review.md "批准范围") — textbook units.
// Edits: L4-c round-1 hooks (evidence/phase5/hosting/L4c_hooks_round1.json, `node scripts/l4-hooks.ts --round1 --write --out …`)
// + L4-b textbook LEAK (evidence/phase5/hosting/L4b_hits.json: 担当人员 → 工作人员 ×5, 立案 → 规划 ×1).
// Path (C17 / C18): B3 loc-part patches registered with scripts/textbook-v2-patch.mjs (CLI) on the final loc part; a field
// whose edit window overlaps an active patch's replaced text → retire the overlapping patch(es) + register one composite
// patch (minimal window of the whole field change). Then merge dry-run (journals) → merged.json; only the target fields and
// their compat fields are copied into units/ in place (never --write). Frozen units (frozen_baseline.json): direct edit of
// units/ (hook + memory_hook + summary.memory_hooks), before / after recorded.
// Gates: the whole plan is simulated in memory first (replay with retired / new patches = the intended end state; any
// mismatch aborts before any CLI call); per unit merged-vs-units diff before (baseline) and after (must be the baseline set).
// Run: node scripts/l4-r1-units-apply.ts [--apply] --out <report.json>

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const imp = (p: string) => import(pathToFileURL(path.join(ROOT, p)).href);
const lib = await imp("scripts/lib/textbook-v2.mjs");
const { journalRows, pickFinal } = await imp("scripts/textbook-v2-merge.mjs");
const { applyPatches, readPatches, readFrozen, BATCH_DIR } = await imp("scripts/textbook-v2-patch.mjs");
const { compatText } = await imp("apps/web/src/lib/textbook/inline.ts");
const kit = await lib.loadKit();
const paths = lib.dataPaths();
const frozen: Record<string, string> = readFrozen(BATCH_DIR);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
if (outAt < 0) throw new Error("--out <report.json> is required");
const OUT = path.resolve(process.argv[outAt + 1]);
const REASON_C = "S154 L4-c round 1 (D-221): [[jp:]] on the Japanese in the memory hook";
const REASON_B = "S154 L4-b round 1 (D-222): Japanese word in zh";

type Row = Record<string, any>;
const clone = (v: unknown) => JSON.parse(JSON.stringify(v));
const occ = (s: string, sub: string) => (sub === "" ? 0 : s.split(sub).length - 1);

// ---- edits per unit / field: { field (loc-part path with (term)), edits: [{before, after}], final } ----
type FieldPlan = { unit: string; field: string; kind: "L4-c" | "L4-b"; ids: string[]; edits: { before: string; after: string }[]; unitsBefore: string; final: string };
const plans = new Map<string, FieldPlan[]>();
const add = (p: FieldPlan) => plans.set(p.unit, [...(plans.get(p.unit) ?? []), p]);
const UNITS_DIR = path.join(ROOT, "data/ip/textbook/units");
const unitsOf = new Map<string, Row>();
const unitDoc = (u: string) => {
  if (!unitsOf.has(u)) unitsOf.set(u, lib.readJson(path.join(UNITS_DIR, `${u}.json`)));
  return unitsOf.get(u)!;
};
const getPath = (o: Row, p: string) => p.replace(/\(([^)]*)\)/g, "").split(/\.|\[|\]/).filter(Boolean).reduce((a: any, k) => a?.[/^\d+$/.test(k) ? +k : k], o);

const r1 = lib.readJson(path.join(ROOT, "evidence/phase5/hosting/L4c_hooks_round1.json"));
if (!r1.round1) throw new Error("L4c_hooks_round1.json is not a --round1 output");
for (const h of r1.hooks as Row[]) {
  if (!h.labels.length) continue;
  add({ unit: h.unit, field: `terms[${h.term_index}](${h.term}).hook_${h.lang}`, kind: "L4-c", ids: h.labels.map((l: Row) => l.text), edits: h.edits, unitsBefore: h.before, final: h.after });
}
const hits = lib.readJson(path.join(ROOT, "evidence/phase5/hosting/L4b_hits.json")).hits as Row[];
const tb = hits.filter((x) => x.source === "textbook-units" && x.classification === "LEAK");
const tbByField = new Map<string, Row[]>();
for (const x of tb) {
  const u = path.basename(x.file, ".json");
  const k = `${u}|${x.path}`;
  tbByField.set(k, [...(tbByField.get(k) ?? []), x]);
}
for (const [k, xs] of tbByField) {
  const [u, p] = k.split("|");
  const doc = unitDoc(u);
  const m = /^terms\[(\d+)\]/.exec(p);
  const field = m ? p.replace(/^terms\[(\d+)\]/, `terms[$1](${doc.terms[Number(m[1])].term})`) : p;
  const before = getPath(doc, p);
  let s = before;
  for (const x of xs) {
    if (occ(s, x.proposed.before) !== 1) throw new Error(`${x.id}: before not unique`);
    s = s.replace(x.proposed.before, () => x.proposed.after);
  }
  add({ unit: u, field, kind: "L4-b", ids: xs.map((x) => x.id), edits: xs.map((x) => x.proposed), unitsBefore: before, final: s });
}

// ---- deep diff (leaf paths) ----
function diffPaths(a: unknown, b: unknown, p = "", out: string[] = []): string[] {
  if (a === b) return out;
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
    for (const k of keys) diffPaths((a as Row)[k], (b as Row)[k], Array.isArray(a) ? `${p}[${k}]` : p ? `${p}.${k}` : k, out);
    return out;
  }
  out.push(p);
  return out;
}
const journalsOf = (unit: string) => {
  const dir = paths.planning(unit);
  return existsSync(dir) ? readdirSync(dir).filter((x) => /^journal\..*\.jsonl$/.test(x)).sort().map((x) => path.join(dir, x)) : [];
};
function mergeDry(unit: string): Row {
  const js = journalsOf(unit);
  const mf = paths.merged(unit);
  const t0 = existsSync(mf) ? statSync(mf).mtimeMs : 0;
  let exit = 0;
  try {
    execFileSync("node", ["--no-warnings", "scripts/textbook-v2-merge.mjs", "--unit", unit, ...js.flatMap((j) => ["--journal", j])], { cwd: ROOT, stdio: "pipe" });
  } catch (e) {
    exit = (e as { status: number }).status;
  }
  if (!existsSync(mf) || statSync(mf).mtimeMs === t0) throw new Error(`${unit}: merge dry-run did not write merged.json (exit ${exit})`);
  return { merged: lib.readJson(mf), exit };
}
const cli = (args: string[]) => execFileSync("node", ["--no-warnings", "scripts/textbook-v2-patch.mjs", ...args], { cwd: ROOT, encoding: "utf8" }).trim();

const report: Row = { mode: APPLY ? "apply" : "plan", units: [] as Row[] };
for (const [unit, fps] of [...plans].sort()) {
  const u = unitDoc(unit);
  const ur: Row = { unit, frozen: frozen[unit] ?? null, fields: [] as Row[] };
  report.units.push(ur);
  for (const fp of fps) if (getPath(u, fp.field) !== fp.unitsBefore) throw new Error(`${unit} ${fp.field}: units value ≠ proposal before`);

  if (frozen[unit]) {
    // direct edit (merge --write refused for frozen units): the field + its compat fields
    const mod = clone(u);
    for (const fp of fps) {
      const m = /^terms\[(\d+)\]\([^)]*\)\.hook_(zh|en)$/.exec(fp.field);
      if (!m) throw new Error(`${unit}: frozen direct edit only for hooks (${fp.field})`);
      mod.terms[Number(m[1])][`hook_${m[2]}`] = fp.final;
      mod.terms[Number(m[1])][`memory_hook_${m[2]}`] = compatText(fp.final, m[2]);
      ur.fields.push({ field: fp.field, kind: fp.kind, route: "frozen direct edit", before: fp.unitsBefore, after: fp.final });
    }
    for (const l of ["zh", "en"]) if (mod.summary) mod.summary[`memory_hooks_${l}`] = kit.hookLines(mod, l);
    ur.diff_paths = diffPaths(u, mod);
    if (APPLY) writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
    continue;
  }

  const fin = pickFinal(unit, journalRows(journalsOf(unit)), null);
  const partFile = fin.loc.part;
  const locSha = lib.sha256File(partFile);
  ur.loc_part = path.relative(ROOT, partFile);
  ur.base_sha256 = locSha;
  const doc = readPatches(BATCH_DIR, unit);
  const actives = (doc.patches as Row[]).filter((p) => p.status === "active");
  const full = lib.readJson(partFile);
  applyPatches(full, doc.patches, locSha);

  // plan per field: per-edit registrations, or retire + composite
  const sim = clone(doc.patches) as Row[];
  const steps: Row[] = [];
  for (const fp of fps) {
    const same = actives.filter((p) => String(p.field).replace(/\(.*?\)/, "") === fp.field.replace(/\(.*?\)/, ""));
    const fieldStr = same[0]?.field ?? fp.field;
    const T = getPath(full, fp.field) as string;
    if (T !== fp.unitsBefore) throw new Error(`${unit} ${fp.field}: patched loc part ≠ units`);
    // overlap of each edit window with an active patch's replaced text (as the tool checks it)
    let cur = T;
    let overlaps = new Set<string>();
    for (const e of fp.edits) {
      const at = cur.indexOf(e.before);
      if (occ(cur, e.before) !== 1) throw new Error(`${unit} ${fp.field}: window not unique`);
      for (const q of same) {
        const i = cur.indexOf(q.after);
        if (q.after !== "" && i >= 0 && at < i + q.after.length && i < at + e.before.length) overlaps.add(q.id);
      }
      cur = cur.replace(e.before, () => e.after);
    }
    if (cur !== fp.final) throw new Error(`${unit} ${fp.field}: edits do not reach the final value`);
    if (overlaps.size === 0) {
      for (const e of fp.edits) {
        steps.push({ op: "register", field: fieldStr, before: e.before, after: e.after, reason: fp.kind === "L4-c" ? REASON_C : REASON_B });
        sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: locSha, field: fieldStr, before: e.before, after: e.after });
      }
      ur.fields.push({ field: fieldStr, kind: fp.kind, ids: fp.ids, route: "register", n: fp.edits.length });
      continue;
    }
    // composite: retire the overlapping actives (grow the set while the composite window overlaps another active's text)
    for (;;) {
      const loc = lib.readJson(partFile);
      const kept = sim.map((p) => (overlaps.has(p.id) ? { ...p, status: "retired" } : p));
      applyPatches(loc, kept, locSha);
      const T0 = getPath(loc, fp.field) as string;
      const F = fp.final;
      let pre = 0;
      while (pre < T0.length && pre < F.length && T0[pre] === F[pre]) pre++;
      let suf = 0;
      while (suf < T0.length - pre && suf < F.length - pre && T0[T0.length - 1 - suf] === F[F.length - 1 - suf]) suf++;
      let a = pre;
      let b = T0.length - suf;
      let fb = F.length - suf;
      while (a > 0 && (b - a === 0 || occ(T0, T0.slice(a, b)) !== 1)) a--;
      while (b < T0.length && occ(T0, T0.slice(a, b)) !== 1) (b++, fb++);
      const before = T0.slice(a, b);
      const after = F.slice(a, fb);
      const more = same.filter((q) => !overlaps.has(q.id)).filter((q) => {
        const i = T0.indexOf(q.after);
        return q.after !== "" && i >= 0 && a < i + q.after.length && i < b;
      });
      if (more.length) {
        for (const q of more) overlaps.add(q.id);
        continue;
      }
      for (const id of overlaps) steps.push({ op: "retire", id, reason: `${fp.kind === "L4-c" ? REASON_C : REASON_B}: superseded by a composite patch (C17 pattern)` });
      for (const p of sim) if (overlaps.has(p.id)) p.status = "retired";
      steps.push({ op: "register", field: fieldStr, before, after, reason: `${fp.kind === "L4-c" ? REASON_C : REASON_B} (composite of ${[...overlaps].join(", ")} + this edit)` });
      sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: locSha, field: fieldStr, before, after });
      ur.fields.push({ field: fieldStr, kind: fp.kind, ids: fp.ids, route: "retire + composite", retired: [...overlaps], composite: { before, after } });
      break;
    }
  }
  // simulate the whole plan: replay sim on the loc part → each target = final, every other field unchanged
  const simLoc = lib.readJson(partFile);
  applyPatches(simLoc, sim, locSha);
  for (const fp of fps) if (getPath(simLoc, fp.field) !== fp.final) throw new Error(`${unit} ${fp.field}: simulated replay ≠ final`);
  const simDiff = diffPaths(full, simLoc).map((p) => p);
  const targets = new Set(fps.map((fp) => fp.field.replace(/\(.*?\)/, "")));
  const stray = simDiff.filter((p) => !targets.has(p));
  if (stray.length) throw new Error(`${unit}: simulated replay changes other fields: ${stray.join(", ")}`);
  ur.steps = steps;

  if (!APPLY) continue;
  // baseline merged-vs-units diff (before registration)
  const m0 = mergeDry(unit);
  ur.merge_exit_before = m0.exit;
  ur.baseline_diff = diffPaths(m0.merged, u);
  for (const s of steps) {
    const out = s.op === "retire"
      ? cli(["--unit", unit, "--retire", s.id, "--reason", s.reason])
      : cli(["--unit", unit, "--register", "--part", partFile, "--field", s.field, "--before", s.before, "--after", s.after, "--reason", s.reason]);
    (ur.cli ??= []).push(out);
  }
  const m1 = mergeDry(unit);
  ur.merge_exit_after = m1.exit;
  const newDiff = diffPaths(m1.merged, u).filter((p) => !ur.baseline_diff.includes(p));
  // allowed: the target fields and their compat fields
  const allowed = (p: string) => {
    for (const t of targets) {
      const m = /^terms\[(\d+)\]\.(hook|detail|one)_(zh|en)$/.exec(t);
      if (p === t) return true;
      if (m && m[2] === "hook" && (p === `terms[${m[1]}].memory_hook_${m[3]}` || p.startsWith(`summary.memory_hooks_${m[3]}`))) return true;
      if (m && m[2] === "detail" && p === `terms[${m[1]}].explanation_${m[3]}`) return true;
    }
    return false;
  };
  const bad = newDiff.filter((p) => !allowed(p));
  ur.new_diff = newDiff;
  if (bad.length) throw new Error(`${unit}: merged differs from units outside the targets: ${bad.join(", ")} (patches registered; units/ NOT written)`);
  const mod = clone(u);
  for (const p of newDiff) {
    const keys = p.split(/\.|\[|\]/).filter(Boolean).map((k) => (/^\d+$/.test(k) ? +k : k));
    let o: any = mod;
    let s: any = m1.merged;
    for (const k of keys.slice(0, -1)) (o = o[k], s = s[k]);
    o[keys.at(-1)!] = s[keys.at(-1)!];
  }
  for (const fp of fps) if (getPath(mod, fp.field) !== fp.final) throw new Error(`${unit} ${fp.field}: merged value ≠ final`);
  writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
  const after = diffPaths(m1.merged, lib.readJson(path.join(UNITS_DIR, `${unit}.json`)));
  ur.diff_after_write = after;
  ur.diff_after_equals_baseline = JSON.stringify([...after].sort()) === JSON.stringify([...ur.baseline_diff].sort());
  if (!ur.diff_after_equals_baseline) throw new Error(`${unit}: after the in-place write merged-vs-units ≠ baseline`);
}
const all = report.units as Row[];
report.summary = {
  units: all.length,
  fields: all.reduce((n, u) => n + u.fields.length, 0),
  registrations: all.reduce((n, u) => n + (u.steps ?? []).filter((s: Row) => s.op === "register").length, 0),
  retirements: all.reduce((n, u) => n + (u.steps ?? []).filter((s: Row) => s.op === "retire").length, 0),
  composite_fields: all.reduce((n, u) => n + u.fields.filter((f: Row) => f.route === "retire + composite").length, 0),
  frozen_fields: all.reduce((n, u) => n + u.fields.filter((f: Row) => f.route === "frozen direct edit").length, 0),
};
console.log(JSON.stringify(report.summary, null, 1));
writeFileSync(OUT, `${JSON.stringify(report, null, 1)}\n`);
