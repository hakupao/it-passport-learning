#!/usr/bin/env node
// S160 C25b (D-232) — generate evidence/phase5/hosting/c25b_edits.json for `tbjp-apply.ts --round c25b`.
// Population: bare [[jp:…]] labels (not right after a **keyword**) in zh content fields of data/ip/textbook/units
// (derived fields excluded: the merge re-derives them), where
//   (a) a U+0020 separates the label from a CJK neighbour (the 97 spaces of S159 C25b), or
//   (b) in a glossary-visible field (terms[].one / detail / hook) the label's Han edge touches Han text
//       (plain text = compatText would run the Japanese word into the Chinese sentence; partly reopens C17 KEEP).
// Each candidate gets a hand verdict in VERDICT (Fable consult S160: classify by function, not by script):
//   Q = a *mention* of the Japanese word → wrap in quotes, adjacent spaces dropped. Quote style follows the field:
//       「」 if the field already has 「, else “”.
//   D = annotation / kana-edged mention / reader-only gloss → drop the adjacent spaces only.
//   C = annotation inside a bracket group whose space is its only separator → the space before the label becomes「，」.
//   K = keep (annotation already delimited: 又称[[jp:X]]）).
// After the apply a re-run is the residual scan: 0 fields, and the applied ids are listed as stale_verdicts (expected —
// the ids count labels in the current text; the frozen record is evidence/phase5/hosting/c25b_table.json).
// Run: node --no-warnings scripts/c25b-edits.ts --out evidence/phase5/hosting/c25b_edits.json [--table <table.json>]

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const UNITS = path.join(ROOT, "data/ip/textbook/units");
const arg = (k: string) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : "");
const OUT = arg("--out");
if (!OUT) throw new Error("--out <c25b_edits.json> is required");
const TABLE = arg("--table");
const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_(zh|en)(\[\d+\])?$/;
const GLOSSARY = /^terms\[\d+\]\.(one|detail|hook)_zh$/;
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー，。、；：？！“”‘’《》（）【】「」『』…—～]/u;
const HAN = /\p{Script=Han}/u;

// id = unit|path|k (k = index of the label among the field's [[jp:]] labels). Glossary-visible fields only;
// reader-only candidates (points / key_points / goals) are all D.
const VERDICT: Record<string, "Q" | "D" | "C" | "K"> = {
  "management-08-25-u04|terms[0].one_zh|1": "K",
  "management-09-26-u05|terms[0].hook_zh|0": "Q",
  "management-10-27-u01|terms[0].hook_zh|0": "Q",
  "management-11-29-u02|terms[4].hook_zh|0": "D",
  "management-11-29-u02|terms[4].hook_zh|1": "D",
  "management-12-31-u01|terms[4].hook_zh|0": "Q",
  "strategy-01-02-u09|terms[4].one_zh|1": "D",
  "strategy-01-02-u10|terms[0].hook_zh|0": "Q",
  "strategy-01-02-u10|terms[1].hook_zh|0": "Q",
  "strategy-01-02-u13|terms[1].one_zh|1": "K",
  "strategy-01-02-u13|terms[7].hook_zh|0": "Q",
  "strategy-01-02-u14|terms[2].hook_zh|0": "Q",
  "strategy-01-02-u14|terms[5].hook_zh|0": "Q",
  "strategy-01-03-u01|terms[2].hook_zh|0": "Q",
  "strategy-01-03-u01|terms[3].hook_zh|0": "Q",
  "strategy-01-03-u03|terms[0].hook_zh|0": "Q",
  "strategy-01-03-u03|terms[3].hook_zh|0": "Q",
  "strategy-01-03-u03|terms[4].hook_zh|0": "Q",
  "strategy-01-03-u03|terms[4].hook_zh|2": "Q",
  "strategy-02-07-u01|terms[0].detail_zh|0": "Q",
  "strategy-02-07-u01|terms[0].hook_zh|0": "D",
  "strategy-02-07-u01|terms[2].hook_zh|0": "D",
  "strategy-02-07-u01|terms[3].hook_zh|0": "D",
  "strategy-03-09-u03|terms[3].hook_zh|0": "Q",
  "strategy-03-09-u04|terms[2].detail_zh|0": "Q",
  "strategy-03-10-u01|terms[1].hook_zh|0": "D",
  "strategy-03-10-u04|terms[1].hook_zh|0": "D",
  "strategy-03-10-u04|terms[2].hook_zh|0": "D",
  "strategy-03-10-u04|terms[3].hook_zh|0": "Q",
  "strategy-03-10-u04|terms[4].detail_zh|0": "Q",
  "strategy-03-10-u07|terms[0].detail_zh|0": "Q",
  "strategy-03-10-u07|terms[1].detail_zh|0": "Q",
  "strategy-05-14-u02|terms[0].hook_zh|1": "Q",
  "strategy-05-14-u04|terms[0].hook_zh|0": "D",
  "strategy-07-22-u01|terms[0].hook_zh|0": "Q",
  "strategy-07-22-u01|terms[4].hook_zh|0": "Q",
  "technology-13-35-u02|terms[0].hook_zh|0": "Q",
  "technology-13-35-u02|terms[0].hook_zh|3": "Q",
  "technology-13-35-u05|terms[2].one_zh|1": "K",
  "technology-13-35-u05|terms[3].hook_zh|0": "Q",
  "technology-15-41-u01|terms[2].hook_zh|0": "Q",
  "technology-15-41-u01|terms[3].hook_zh|0": "Q",
  "technology-16-44-u01|terms[2].detail_zh|0": "D",
  "technology-16-44-u04|terms[0].hook_zh|0": "D",
  "technology-16-44-u04|terms[1].hook_zh|0": "D",
  "technology-16-44-u04|terms[2].one_zh|0": "C",
  "technology-17-46-u01|terms[3].one_zh|1": "K",
  "technology-17-46-u01|terms[5].detail_zh|1": "K",
  "technology-17-47-u01|terms[2].hook_zh|0": "D",
  "technology-18-49-u03|terms[0].hook_zh|0": "D",
  "technology-19-50-u01|terms[2].hook_zh|0": "Q",
  "technology-19-51-u02|terms[2].hook_zh|0": "Q",
  "technology-20-52-u01|terms[3].one_zh|1": "Q",
  "technology-20-52-u01|terms[4].one_zh|1": "Q",
  "technology-20-52-u06|terms[0].detail_zh|1": "K",
  "technology-21-55-u01|terms[2].hook_zh|0": "Q",
  "technology-22-58-u03|terms[5].detail_zh|1": "D",
  "technology-22-60-u03|terms[1].hook_zh|0": "Q",
  "technology-22-60-u04|terms[6].hook_zh|0": "Q",
  "technology-22-60-u05|terms[0].hook_zh|0": "D",
  "technology-22-60-u05|terms[1].hook_zh|0": "Q",
  "technology-22-60-u05|terms[1].hook_zh|2": "Q",
  "technology-23-63-u03|terms[2].hook_zh|0": "D",
  "technology-23-63-u04|terms[2].hook_zh|0": "Q",
  "technology-23-63-u05|terms[1].hook_zh|0": "Q",
  "technology-23-63-u05|terms[2].hook_zh|0": "Q",
  "technology-23-63-u05|terms[2].hook_zh|1": "Q",
  "technology-23-63-u06|terms[0].hook_zh|0": "Q",
  "technology-23-63-u06|terms[1].hook_zh|0": "Q",
  "technology-23-63-u09|terms[0].hook_zh|0": "Q",
  "technology-23-63-u11|terms[1].detail_zh|0": "Q",
  "technology-23-63-u11|terms[1].detail_zh|1": "Q",
  "technology-23-63-u11|terms[1].detail_zh|2": "Q",
  "technology-23-63-u11|terms[5].detail_zh|0": "Q",
  "technology-23-63-u11|terms[5].detail_zh|1": "Q",
};
// Non-candidates quoted with a candidate of the same list (parallel mentions, one rule for the pair).
const ALSO_Q: Record<string, true> = {
  "technology-22-60-u05|terms[1].hook_zh|3": true, // 、[[jp:郵便局]]（邮局） next to 和[[jp:放送局]]（广播电台）
  "technology-22-60-u04|terms[6].hook_zh|1": true, // 里的[[jp:ファイバ]] next to 就是[[jp:光ファイバ]]
};

type Row = { id: string; unit: string; path: string; label: string; verdict: string; glossary: boolean; before: string; after: string };
const table: Row[] = [];
const edits: [string, string, [string, string][]][] = [];
const seen = new Set<string>();

function field(unit: string, p: string, s: string) {
  const gl = GLOSSARY.test(p);
  type Op = { a: number; b: number; rep: string };
  const ops: Op[] = [];
  let k = -1;
  for (const m of s.matchAll(/\[\[jp:([^\]]+)\]\]/g)) {
    k++;
    const a = m.index!, b = a + m[0].length, L = m[1];
    const id = `${unit}|${p}|${k}`;
    if (/\*\* ?$/.test(s.slice(0, a))) continue; // keyword gloss (compatText parenthesises it)
    if ((s[a - 1] === "“" && s[b] === "”") || (s[a - 1] === "「" && s[b] === "」")) continue; // already quoted (re-run = residual scan)
    const pre = s[a - 1] === " " && CJK.test(s[a - 2] ?? "");
    const post = s[b] === " " && (CJK.test(s[b + 1] ?? "") || (s.startsWith("[[jp:", b + 1) && CJK.test(s[b + 6] ?? "")));
    const gpre = gl && !pre && HAN.test(s[a - 1] ?? "") && HAN.test([...L][0]);
    const gpost = gl && !post && HAN.test(s[b] ?? "") && HAN.test([...L].at(-1)!);
    const ginit = gl && !pre && (a === 0 || /[。，；：！？]/.test(s[a - 1])) && HAN.test(s[b] ?? "") && HAN.test([...L].at(-1)!);
    const cand = pre || post || gpre || gpost || ginit;
    if (!cand && !ALSO_Q[id]) continue;
    seen.add(id);
    const v = ALSO_Q[id] ? "Q" : gl ? VERDICT[id] : pre || post ? "D" : undefined;
    if (!v) throw new Error(`${id}: candidate without a verdict`);
    const A = pre ? a - 1 : a, B = post ? b + 1 : b;
    const open = s.includes("「") ? "「" : "“", close = open === "「" ? "」" : "”";
    // nesting: inside an open “…” / 「…」 (none expected; fail loudly so it is looked at — S160 Rule D L2)
    const depth = (o: string, c: string) => s.slice(0, a).split(o).length - s.slice(0, a).split(c).length;
    if (v === "Q" && (depth("“", "”") > 0 || depth("「", "」") > 0)) throw new Error(`${id}: inside a quotation`);
    const rep = v === "Q" ? `${open}${m[0]}${close}` : v === "D" ? m[0] : v === "C" ? `，${m[0]}` : s.slice(A, B);
    if (v === "C" && !pre) throw new Error(`${id}: C needs a space before`);
    ops.push({ a: A, b: B, rep });
    table.push({ id, unit, path: p, label: L, verdict: v, glossary: gl, before: s.slice(Math.max(0, A - 12), B + 12), after: "" });
  }
  if (!ops.length) return;
  let out = s;
  for (const o of [...ops].sort((x, y) => y.a - x.a)) out = out.slice(0, o.a) + o.rep + out.slice(o.b);
  if (out === s) return;
  // checks: labels and their order unchanged; only U+0020 removed and “”「」， added
  const labels = (x: string) => JSON.stringify([...x.matchAll(/\[\[jp:([^\]]+)\]\]/g)].map((m) => m[1]));
  if (labels(s) !== labels(out)) throw new Error(`${unit} ${p}: labels changed`);
  const strip = (x: string) => x.replace(/[ “”「」，]/g, "");
  if (strip(s) !== strip(out)) throw new Error(`${unit} ${p}: not a space / quote / comma change`);
  edits.push([unit, p, [[s, out]]]);
}
function walk(o: unknown, p: string, unit: string) {
  if (typeof o === "string") {
    if (/_zh(\[\d+\])?$/.test(p) && !DERIVED.test(p) && o.includes("[[jp:")) field(unit, p, o);
    return;
  }
  if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`, unit));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, unit);
}
for (const f of readdirSync(UNITS).filter((x) => x.endsWith(".json")).sort()) walk(JSON.parse(readFileSync(path.join(UNITS, f), "utf8")), "", f.replace(/\.json$/, ""));
const stale = Object.keys(VERDICT).filter((id) => !seen.has(id));
writeFileSync(path.resolve(OUT), `${JSON.stringify(edits, null, 1)}\n`);
if (TABLE) writeFileSync(path.resolve(TABLE), `${JSON.stringify(table, null, 1)}\n`);
const count = (v: string) => table.filter((r) => r.verdict === v).length;
console.log(JSON.stringify({ fields: edits.length, units: new Set(edits.map((e) => e[0])).size, candidates: table.length, Q: count("Q"), D: count("D"), C: count("C"), K: count("K"), stale_verdicts: stale }));
