#!/usr/bin/env node
// S161 C26 (D-233) — generate evidence/phase5/hosting/c26_edits.json for `tbjp-apply.ts --round c26`.
// Population: every 「」 in the zh content fields of data/ip/textbook/units (derived fields excluded: the merge
// re-derives them). Rule (D-233, GB/T 15834-2011 horizontal-text quotes; clause number not checked): zh quotes are “” with ‘’ for a quote nested inside one.
// Mapping by nesting depth over both styles: a 「 or “ opened at depth 0 → “ … ”, at depth ≥ 1 → ‘ … ’.
// An existing depth-0 “” is never rewritten; a 「」 inside a “” is reported as `nested` and becomes ‘’. An existing “
// inside a quote (needs ‘’ by hand), an unbalanced field or an interleaved close (「…“…」…”) throws (S161 Rule D L2).
// Each edit = the whole field ([unit, path, [[before, after]]]); `tbjp-apply --round c26` checks quoteSwapOnly.
// Run: node --no-warnings scripts/c26-edits.ts --out evidence/phase5/hosting/c26_edits.json [--table <table.json>]

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const UNITS = path.join(ROOT, "data/ip/textbook/units");
const arg = (k: string) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : "");
const OUT = arg("--out");
if (!OUT) throw new Error("--out <c26_edits.json> is required");
const TABLE = arg("--table");
const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_(zh|en)(\[\d+\])?$/;
const ZH = /(_zh|\.zh)(\[\d+\])?$/;

type Walk = (p: string, s: string) => void;
const walk = (o: unknown, p: string, cb: Walk): void => {
  if (typeof o === "string") cb(p, o);
  else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${p}[${i}]`, cb));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, cb);
};

/** 「」 → “” / ‘’ by depth; returns the new string and whether any nesting was seen. */
export function convert(s: string): { out: string; nested: boolean } {
  const stack: [string, string][] = []; // [original closer, closer to emit] for each open quote (S161 Rule D L2)
  let out = "";
  let nested = false;
  for (const ch of s) {
    if (ch === "「" || ch === "“") {
      if (stack.length) nested = true;
      const inner = stack.length > 0;
      if (ch === "「") (out += inner ? "‘" : "“"), stack.push(["」", inner ? "’" : "”"]);
      else if (inner) throw new Error(`existing “ nested inside a quote (needs ‘’ by hand) in «${s}»`);
      else (out += ch), stack.push(["”", "”"]); // an existing depth-0 “ is kept as-is
    } else if (ch === "」" || ch === "”") {
      const top = stack.pop();
      if (top === undefined || top[0] !== ch) throw new Error(`unbalanced / interleaved close ${ch} in «${s}»`);
      out += top[1];
    } else out += ch;
  }
  if (stack.length) throw new Error(`unbalanced open in «${s}»`);
  return { out, nested };
}

const edits: [string, string, [string, string][]][] = [];
const table: Record<string, unknown>[] = [];
let marks = 0;
for (const f of readdirSync(UNITS).filter((f) => f.endsWith(".json")).sort()) {
  const unit = f.replace(/\.json$/, "");
  const u = JSON.parse(readFileSync(path.join(UNITS, f), "utf8"));
  walk(u, "", (p, s) => {
    if (!ZH.test(p) || DERIVED.test(p) || !s.includes("「")) return;
    const { out, nested } = convert(s);
    const n = (s.match(/「/g) ?? []).length;
    marks += n;
    edits.push([unit, p, [[s, out]]]);
    table.push({ unit, path: p, marks: n, nested, jp_label: (s.match(/「\[\[jp:[^\]]*\]\]」/g) ?? []).length });
  });
}
writeFileSync(OUT, `${JSON.stringify(edits, null, 1)}\n`);
if (TABLE) writeFileSync(TABLE, `${JSON.stringify(table, null, 1)}\n`);
console.log(JSON.stringify({ fields: edits.length, units: new Set(edits.map((e) => e[0])).size, marks, nested: table.filter((t) => t.nested).length, jp_label: table.reduce((n, t) => n + (t.jp_label as number), 0) }));
