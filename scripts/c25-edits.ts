#!/usr/bin/env node
// S159 C25 (D-231) — generate evidence/phase5/hosting/c25_edits.json for `tbjp-apply.ts --round c25`.
// zh content fields of data/ip/textbook/units (derived fields excluded: the merge re-derives them). A half-width space at a
// **keyword** edge is dropped when both characters around it are Han / kana / Chinese punctuation:
//   text「汉 」+ key「X」 / key「X」+ text「 汉」 / key「X」+ text「 」+ jp「Y」(zh).
// Kept: Han–Latin spaces (clreq §6.3.3), keywords that are formulas (an operator inside), operator / ・ neighbours,
// bare [[jp:]] neighbours (C25b), unmarked text except the one listed in EXTRA.
// Each edit = the whole field [before, after]; the generator checks that only the chosen U+0020 are removed and that the
// token contents (keyword / jp label) are unchanged.
// Run: node --no-warnings scripts/c25-edits.ts --out evidence/phase5/hosting/c25_edits.json [--keep-out <keep.json>]

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const UNITS = path.join(ROOT, "data/ip/textbook/units");
const arg = (k: string) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : "");
const OUT = arg("--out");
if (!OUT) throw new Error("--out <c25_edits.json> is required");
const KEEP_OUT = arg("--keep-out");
const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_(zh|en)(\[\d+\])?$/;
const isZh = (p: string) => /(_zh|\.zh)(\[\d+\])?$/.test(p);
const CJK = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー，。、；：？！“”‘’《》（）【】「」『』…—～]$/u;
const HANKANA = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]$/u;
const FORMULA = /[=＝+＋−－×÷]/;
// unmarked exception (D-231): a space after a closing quote before Chinese text.
const EXTRA: Record<string, [string, string]> = {
  "strategy-01-01-u06 terms[1].hook_zh": ["” 来管理", "”来管理"],
};

type Tok = { t: "text" | "key" | "jp"; s: string };
/** inline.ts tokenize (same rules); raw = the source text of the token. */
function tokenize(src: string): (Tok & { raw: string })[] {
  const out: (Tok & { raw: string })[] = [];
  let text = "";
  const flush = () => {
    if (text !== "") out.push({ t: "text", s: text, raw: text });
    text = "";
  };
  let i = 0;
  while (i < src.length) {
    const key = src.startsWith("**", i);
    const jp = !key && src.startsWith("[[jp:", i);
    if (key || jp) {
      const open = key ? "**" : "[[jp:";
      const close = key ? "**" : "]]";
      const j = src.indexOf(close, i + open.length);
      if (j === -1 || j === i + open.length) {
        text += open;
        i += open.length;
        continue;
      }
      const inner = src.slice(i + open.length, j);
      if (inner.includes("**") || inner.includes("[[") || inner.includes("]]")) text += src.slice(i, j + close.length);
      else {
        flush();
        out.push({ t: key ? "key" : "jp", s: inner, raw: src.slice(i, j + close.length) });
      }
      i = j + close.length;
      continue;
    }
    text += src[i];
    i += 1;
  }
  flush();
  return out;
}
const first = (s: string) => [...s][0] ?? "";
const last = (s: string) => [...s].at(-1) ?? "";

const edits: [string, string, [string, string][]][] = [];
const keep: Record<string, unknown>[] = [];
let removed = 0;
function field(unit: string, p: string, src: string) {
  const toks = tokenize(src);
  if (toks.map((t) => t.raw).join("") !== src) throw new Error(`${unit} ${p}: tokenizer does not round-trip`);
  const parts = toks.map((t) => t.raw);
  let n = 0;
  toks.forEach((t, k) => {
    if (t.t !== "text") return;
    const prev = toks[k - 1];
    const next = toks[k + 1];
    const formula = (x?: Tok) => x?.t === "key" && FORMULA.test(x.s);
    // key + " " + jp
    if (t.s === " " && prev?.t === "key" && next?.t === "jp") {
      if (CJK.test(last(prev.s)) && HANKANA.test(first(next.s)) && !formula(prev)) (parts[k] = ""), n++;
      return;
    }
    let s = t.s;
    if (prev?.t === "key" && s.startsWith(" ") && !s.startsWith("  ") && s.length > 1) {
      const ok = CJK.test(last(prev.s)) && HANKANA.test(first(s.slice(1)));
      if (ok && !formula(prev)) (s = s.slice(1)), n++;
      else if (ok) keep.push({ unit, p, why: "formula keyword", key: prev.s });
    }
    if (next?.t === "key" && s.endsWith(" ") && !s.endsWith("  ") && s.length > 1) {
      const ok = CJK.test(last(s.slice(0, -1))) && HANKANA.test(first(next.s));
      if (ok && !formula(next)) (s = s.slice(0, -1)), n++;
      else if (ok) keep.push({ unit, p, why: "formula keyword", key: next.s });
    }
    parts[k] = s;
  });
  let after = parts.join("");
  const ex = EXTRA[`${unit} ${p}`];
  if (ex && !(after.includes(ex[1]) && !after.includes(ex[0]))) { // already applied → nothing (re-run = residual scan)
    if (after.split(ex[0]).length !== 2) throw new Error(`${unit} ${p}: EXTRA «${ex[0]}» not found once`);
    after = after.replace(ex[0], ex[1]);
    n++;
  }
  if (after === src) return;
  // checks: only U+0020 removed, n of them; keyword / jp contents identical
  if (src.length - after.length !== n || src.replace(/ /g, "") !== after.replace(/ /g, "")) throw new Error(`${unit} ${p}: not a pure space deletion`);
  const inner = (x: string) => JSON.stringify(tokenize(x).filter((t) => t.t !== "text").map((t) => [t.t, t.s]));
  if (inner(src) !== inner(after)) throw new Error(`${unit} ${p}: marker contents changed`);
  removed += n;
  edits.push([unit, p, [[src, after]]]);
}
function walk(o: unknown, p: string, unit: string) {
  if (typeof o === "string") {
    if (isZh(p) && !DERIVED.test(p)) field(unit, p, o);
    return;
  }
  if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`, unit));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, unit);
}
for (const f of readdirSync(UNITS).filter((x) => x.endsWith(".json")).sort()) walk(JSON.parse(readFileSync(path.join(UNITS, f), "utf8")), "", f.replace(/\.json$/, ""));
writeFileSync(path.resolve(OUT), `${JSON.stringify(edits, null, 1)}\n`);
if (KEEP_OUT) writeFileSync(path.resolve(KEEP_OUT), `${JSON.stringify(keep, null, 1)}\n`);
console.log(JSON.stringify({ fields: edits.length, units: new Set(edits.map((e) => e[0])).size, spaces_removed: removed, kept_formula: keep.length }));
