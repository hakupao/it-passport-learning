#!/usr/bin/env node
// S155 tb-jp-unmarked — gate 1: full-field diff of every data/ip/textbook/units/*.json, HEAD (git show) vs working tree.
// Pass = the changed string fields are exactly the planned ones (scripts/tbjp-apply.ts EDITS, read from its report) and each
// change only inserts [[jp:…]] around existing text (stripInline(new) === stripInline(old), old has fewer marks, and
// removing the `[[jp:` / `]]` tokens added by the change gives old back); no other field / file differs.
// A field the report marks `exact` (tbjp-apply --round b: S155 minor decision, a text change) must equal its planned
// after-value exactly instead of the marks-only rule.
// Run: node --no-warnings scripts/tbjp-verify.ts --report <tbjp-apply report.json> [--report <more>] --out <result.json>

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const { stripInline } = await import(pathToFileURL(path.join(ROOT, "apps/web/src/lib/textbook/inline.ts")).href);
const arg = (k: string) => {
  const i = process.argv.indexOf(k);
  if (i < 0) throw new Error(`${k} is required`);
  return path.resolve(process.argv[i + 1]);
};
const reports = process.argv.flatMap((a, i) => (a === "--report" ? [path.resolve(process.argv[i + 1])] : []));
if (!reports.length) throw new Error("--report is required");
const plan = { fields: reports.flatMap((r) => JSON.parse(readFileSync(r, "utf-8")).fields) };
const OUT = arg("--out");
const planned = new Map<string, { before: string; after: string; exact?: boolean }>(plan.fields.map((f: any) => [`${f.unit}|${f.path}`, f]));
const DIR = "data/ip/textbook/units";
const occ = (s: string, sub: string) => s.split(sub).length - 1;

function diff(a: unknown, b: unknown, p: string, out: { path: string; old: unknown; new: unknown }[]) {
  if (a === b) return;
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a as object), ...Object.keys(b as object)])) diff((a as any)[k], (b as any)[k], Array.isArray(a) ? `${p}[${k}]` : p ? `${p}.${k}` : k, out);
    return;
  }
  out.push({ path: p, old: a, new: b });
}

const changed: any[] = [];
const problems: string[] = [];
let files = 0;
for (const f of readdirSync(path.join(ROOT, DIR)).filter((x) => x.endsWith(".json")).sort()) {
  files++;
  const rel = `${DIR}/${f}`;
  const now = readFileSync(path.join(ROOT, rel), "utf-8");
  const old = execFileSync("git", ["show", `HEAD:${rel}`], { cwd: ROOT, encoding: "utf-8", maxBuffer: 1 << 28 });
  if (now === old) continue;
  const d: any[] = [];
  diff(JSON.parse(old), JSON.parse(now), "", d);
  const unit = f.replace(/\.json$/, "");
  for (const x of d) {
    const k = `${unit}|${x.path}`;
    const p = planned.get(k);
    const marksOnly = typeof x.old === "string" && typeof x.new === "string" && stripInline(x.new) === stripInline(x.old) && occ(x.new, "[[jp:") > occ(x.old, "[[jp:");
    // removing the added marks gives old back: delete every `[[jp:` / `]]` that the old text did not have, by position
    const unmarked = typeof x.new === "string" ? x.new.replace(/\[\[jp:([^\]]*)\]\]/g, (m: string, inner: string) => (x.old.includes(m) ? m : inner)) : null;
    const row = { file: rel, path: x.path, old: x.old, new: x.new, planned: !!p, exact: !!p?.exact, equals_plan: !!p && p.before === x.old && p.after === x.new, marks_only: marksOnly, unmark_equals_old: unmarked === x.old };
    changed.push(row);
    if (!row.planned) problems.push(`unplanned change ${k}`);
    if (!row.equals_plan) problems.push(`not the planned value ${k}`);
    if (!row.exact && (!row.marks_only || !row.unmark_equals_old)) problems.push(`not marks-only ${k}`);
  }
}
for (const k of planned.keys()) if (!changed.some((c) => `${c.file.split("/").pop().replace(/\.json$/, "")}|${c.path}` === k)) problems.push(`planned field unchanged ${k}`);
// --html <out dir> (gate 5): each added mark renders as <span lang="ja" data-inline="jp" …>X</span> between the text
// before and after it, on <out>/<locale>/textbook/<unit>.html of the field's language; no literal `[[jp:` anywhere in <out>.
let html: any = null;
const htmlAt = process.argv.indexOf("--html");
if (htmlAt >= 0) {
  const outDir = path.resolve(process.argv[htmlAt + 1]);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const marks: any[] = [];
  for (const f of plan.fields) {
    const loc = /_zh(\[\d+\])?$/.test(f.path) ? "zh" : "en";
    const page = readFileSync(path.join(outDir, loc, "textbook", `${f.unit}.html`), "utf-8");
    for (const m of f.after.matchAll(/\[\[jp:([^\]]*)\]\]/g)) {
      if (f.before.includes(m[0])) continue;
      // the plain text on both sides of the mark (up to the next marker); at a cell start the previous tag must end right before
      const pre = f.after.slice(0, m.index).split(/\*\*|\]\]/).at(-1)!.slice(-4);
      const post = f.after.slice(m.index! + m[0].length).split(/\*\*|\[\[jp:/)[0].slice(0, 4);
      const re = new RegExp(`${pre ? reEsc(esc(pre)) : ">"}<span lang="ja" data-inline="jp"[^>]*>${reEsc(esc(m[1]))}</span>${post ? reEsc(esc(post)) : "<"}`);
      marks.push({ unit: f.unit, path: f.path, locale: loc, mark: m[1], context: `${pre}|${post}`, rendered: re.test(page) });
    }
  }
  let literal = 0;
  const literalFiles: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|txt|json|js|rsc)$/.test(e.name)) {
        const n = occ(readFileSync(p, "utf-8"), "[[jp:");
        if (n) (literal += n, literalFiles.push(path.relative(outDir, p)));
      }
    }
  };
  walk(outDir);
  html = { out_dir: path.relative(ROOT, outDir), marks_checked: marks.length, marks_rendered: marks.filter((m) => m.rendered).length, literal_jp_open_in_out: literal, literal_files: literalFiles.slice(0, 20), marks };
  if (html.marks_rendered !== marks.length) problems.push("a mark is not rendered as lang=ja");
  if (literal) problems.push(`literal [[jp: in out/: ${literal}`);
}
const result = { files_compared: files, files_changed: new Set(changed.map((c) => c.file)).size, fields_changed: changed.length, planned_fields: planned.size, pass: problems.length === 0, problems, html, changed };
writeFileSync(OUT, `${JSON.stringify(result, null, 1)}\n`);
console.log(JSON.stringify({ ...result, changed: undefined }, null, 1));
process.exit(result.pass ? 0 : 1);
