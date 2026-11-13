#!/usr/bin/env node
// S155 OQ-15 — gate 1: full-field diff HEAD (git show) vs working tree of every data/ip/textbook/units/*.json, the v1terms
// fixture, zh_terms.json and the two B3 patch files. Pass =
//   units: the changed fields are exactly the planned + merge-derived ones of scripts/oq15-apply.ts's report (fields +
//     derived_expected, each equal to its planned after); every changed field is zh; reversing the fix gives HEAD back
//     (technology-16-44-u03: swap 双工系统 ↔ 双重系统; technology-23-63-u05: 反潜回 → 防尾随, and the count of 尾随 not after 防
//     is unchanged); no other unit / field differs;
//   fixture: only technology-16-44-u03 デュアル / デュプレックス and technology-23-63-u05 アンチパスバック term_zh;
//   zh_terms.json: only terms アンチパスバック / デュアルシステム / デュプレックスシステム and excluded;
//   patch files: existing patches unchanged except p05 of technology-23-63-u05 (retired), the rest appended.
// Run: node --no-warnings scripts/oq15-verify.ts --report <oq15-apply report.json> --out <result.json>

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const arg = (k: string) => {
  const i = process.argv.indexOf(k);
  if (i < 0) throw new Error(`${k} is required`);
  return path.resolve(process.argv[i + 1]);
};
const rep = JSON.parse(readFileSync(arg("--report"), "utf-8"));
const OUT = arg("--out");
type Row = Record<string, any>;
const planned = new Map<string, Row>([...rep.fields, ...rep.derived_expected].map((f: Row) => [`${f.unit}|${f.path}`, f]));
const head = (rel: string) => execFileSync("git", ["show", `HEAD:${rel}`], { cwd: ROOT, encoding: "utf-8", maxBuffer: 1 << 28 });
const now = (rel: string) => readFileSync(path.join(ROOT, rel), "utf-8");
function diff(a: unknown, b: unknown, p: string, out: Row[]) {
  if (a === b) return out;
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a as object), ...Object.keys(b as object)])) diff((a as any)[k], (b as any)[k], Array.isArray(a) ? `${p}[${k}]` : p ? `${p}.${k}` : k, out);
    return out;
  }
  out.push({ path: p, old: a, new: b });
  return out;
}
const swapDual = (s: string) => s.replace(/双工系统|双重系统/g, (m) => (m === "双工系统" ? "双重系统" : "双工系统"));
const bareTail = (s: string) => (s.match(/(?<!防)尾随/g) ?? []).length;
const REVERSE: Record<string, (s: string) => string> = { "technology-16-44-u03": swapDual, "technology-23-63-u05": (s) => s.replaceAll("反潜回", "防尾随") };
const problems: string[] = [];

// ---- units
const DIR = "data/ip/textbook/units";
const changed: Row[] = [];
let files = 0;
for (const f of readdirSync(path.join(ROOT, DIR)).filter((x) => x.endsWith(".json")).sort()) {
  files++;
  const rel = `${DIR}/${f}`;
  const o = head(rel);
  const n = now(rel);
  if (o === n) continue;
  const unit = f.replace(/\.json$/, "");
  for (const x of diff(JSON.parse(o), JSON.parse(n), "", [])) {
    const k = `${unit}|${x.path}`;
    const p = planned.get(k);
    const rev = REVERSE[unit];
    const row = {
      unit, path: x.path, old: x.old, new: x.new,
      planned: !!p, derived: !!p && rep.derived_expected.some((d: Row) => `${d.unit}|${d.path}` === k),
      equals_plan: !!p && p.before === x.old && p.after === x.new,
      zh: /_zh(\[\d+\])?$/.test(x.path),
      reverse_equals_old: !!rev && typeof x.new === "string" && rev(x.new) === x.old,
      bare_尾随_kept: typeof x.new === "string" && typeof x.old === "string" && bareTail(x.new) === bareTail(x.old),
    };
    changed.push(row);
    if (!row.planned) problems.push(`unplanned change ${k}`);
    if (!row.equals_plan) problems.push(`not the planned value ${k}`);
    if (!row.zh) problems.push(`non-zh field changed ${k}`);
    if (!row.reverse_equals_old) problems.push(`reverse(new) ≠ old ${k}`);
    if (!row.bare_尾随_kept) problems.push(`尾随 (共連れ) count changed ${k}`);
  }
}
for (const k of planned.keys()) if (!changed.some((c) => `${c.unit}|${c.path}` === k)) problems.push(`planned field unchanged ${k}`);

// ---- fixture
const FIX = "apps/web/src/lib/textbook/__fixtures__/v2-units.v1terms.json";
const fixDiff = diff(JSON.parse(head(FIX)), JSON.parse(now(FIX)), "", []);
const fixOk = (d: Row) => /^technology-16-44-u03\[[01]\]\.term_zh$/.test(d.path) || /^technology-23-63-u05\[3\]\.term_zh$/.test(d.path);
for (const d of fixDiff) if (!fixOk(d)) problems.push(`fixture: unexpected change ${d.path}`);
if (fixDiff.length !== 3) problems.push(`fixture: ${fixDiff.length} changes (expected 3)`);

// ---- zh_terms
const ZT = "data/ip/textbook/zh_terms.json";
const zDiff = diff(JSON.parse(head(ZT)), JSON.parse(now(ZT)), "", []);
const zOk = new Set(["terms.アンチパスバック", "terms.デュアルシステム", "terms.デュプレックスシステム", "excluded.デュアルシステム", "excluded.デュプレックスシステム"]);
for (const d of zDiff) if (!zOk.has(d.path)) problems.push(`zh_terms: unexpected change ${d.path}`);
const ztNow = JSON.parse(now(ZT));
if (ztNow.terms["アンチパスバック"] !== "反潜回（Anti-passback）" || ztNow.terms["デュアルシステム"] !== "双重系统" || ztNow.terms["デュプレックスシステム"] !== "双工系统" || Object.keys(ztNow.excluded).length) problems.push("zh_terms: end values");
const keys = Object.keys(ztNow.terms);
if (JSON.stringify(keys) !== JSON.stringify([...keys].sort())) problems.push("zh_terms: terms keys not sorted");

// ---- patch files
const patchRows: Row[] = [];
for (const unit of Object.keys(REVERSE)) {
  const rel = `evidence/phase5/stage_07_ui/phase3/batch/patches/${unit}.json`;
  const o = JSON.parse(head(rel)).patches as Row[];
  const n = JSON.parse(now(rel)).patches as Row[];
  const modified = o.map((p, i) => ({ id: p.id, d: diff(p, n[i], "", []) })).filter((x) => x.d.length);
  const appended = n.slice(o.length);
  for (const m of modified) {
    const okRetire = unit === "technology-23-63-u05" && m.id === "p05" && m.d.every((d: Row) => d.path === "status" || d.path === "retired_reason") && n.find((p) => p.id === "p05")!.status === "retired";
    if (!okRetire) problems.push(`${rel}: existing patch ${m.id} changed`);
  }
  if (appended.some((p) => p.status !== "active")) problems.push(`${rel}: appended patch not active`);
  patchRows.push({ file: rel, before: o.length, after: n.length, appended: appended.map((p) => ({ id: p.id, field: p.field, before: p.before, after: p.after })), modified: modified.map((m) => ({ id: m.id, paths: m.d.map((d: Row) => d.path) })) });
}

const result = {
  units_compared: files,
  units_changed: new Set(changed.map((c) => c.unit)).size,
  fields_changed: changed.length,
  planned_fields: rep.fields.length,
  derived_fields: rep.derived_expected.length,
  non_zh_changed: changed.filter((c) => !c.zh).length,
  fixture_changes: fixDiff,
  zh_terms_changes: zDiff,
  patch_files: patchRows,
  pass: problems.length === 0,
  problems,
  changed,
};
writeFileSync(OUT, `${JSON.stringify(result, null, 1)}\n`);
console.log(JSON.stringify({ ...result, changed: undefined, patch_files: patchRows.map((p) => ({ file: p.file, before: p.before, after: p.after, modified: p.modified })) }, null, 1));
process.exit(result.pass ? 0 : 1);
