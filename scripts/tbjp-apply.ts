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
// Run: node --no-warnings scripts/tbjp-apply.ts [--round b|c22|l4d|c19a|c24|c25|c25b|c26 [--edits <file>]] [--apply] --out <report.json>

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const imp = (p: string) => import(pathToFileURL(path.join(ROOT, p)).href);
const lib = await imp("scripts/lib/textbook-v2.mjs");
const { journalRows, pickFinal } = await imp("scripts/textbook-v2-merge.mjs");
const { applyPatches, applyUnitPatches, readPatches, readFrozen, v1Sha256, BATCH_DIR } = await imp("scripts/textbook-v2-patch.mjs");
const { stripInline, compatText } = await imp("apps/web/src/lib/textbook/inline.ts");
const paths = lib.dataPaths();
const frozen: Record<string, string> = readFrozen(BATCH_DIR);
const APPLY = process.argv.includes("--apply");
const outAt = process.argv.indexOf("--out");
if (outAt < 0) throw new Error("--out <report.json> is required");
const OUT = path.resolve(process.argv[outAt + 1]);
// --round b (S155 main-session minor decision): the 日语名称 row of technology-13-34-u02 shows the Japanese form in zh too —
// a text change (simplified 值 / 频 → 値 / 頻 + mark), exact after-values, these 2 fields only.
const ROUND = process.argv.includes("--round") ? process.argv[process.argv.indexOf("--round") + 1] : "";
const ROUND_B = ROUND === "b";
// --round c22 (S156 minor decision): the exam pseudo-language type name 整数型 explained in en (lang-allow tb-data) — marks only.
const ROUND_C22 = ROUND === "c22";
// --round l4d (S157 D-230, W3C clreq §5.1): zh「・」(U+30FB, JIS) between coordinate items → 顿号「、」. Not inside [[jp:…]]
// (Japanese names), not the Gantt figure of management-10-27-u02 terms[3] (「・ = 作業なし」, a defined symbol), not derived
// fields (the merge re-derives them; their diff must be the same ・ → 、 only). Titles are direct edits (C18 pattern, not here).
const ROUND_L4D = ROUND === "l4d";
// --round c19a (S158, C19 minor D): ASCII ( ) used as an annotation in zh (gloss, 例, value note) → full-width （ ）, the space
// before it dropped and「例: 」→「例：」(corpus: zh （ 10,067 / ( 119, "X（" 1,448 / "X （" 0). The reviewed list of 39 pairs
// is evidence/phase5/hosting/c19a_edits.json (from c19_table.json); math, tuples, logic and pseudo-code keep ASCII; headwords
// (term_zh in zh_terms.json) are C19b. Invariant: before = after once （）： map back to ():, and a space before ( is ignored.
const ROUND_C19A = ROUND === "c19a";
// --round c24 (S158, C24 minor D): a space between a full-width closing paren and a Chinese character is dropped
// (corpus 「）漢字」4,469 / 「） 漢字」4), also after a keyword ending in ）(「）** 是」→「）**是」, 82 in content: compatText drops
// the ** and leaves「） 是」in the derived fields). Spaces around operators stay. Also a keyword + its JP gloss before a space (c24_edits3.json).
// Edits: c24_edits.json, c24_edits2.json, c24_edits3.json.
const ROUND_C24 = ROUND === "c24";
// --round c25 (S159 D-231): zh space at a **keyword** edge dropped when both neighbours are Han / kana / Chinese punctuation
// (edits = whole fields from scripts/c25-edits.ts). Check: after = before minus U+0020 only (positional), for targets and derived followers.
const ROUND_C25 = ROUND === "c25";
// --round c25b (S160 D-232): bare [[jp:]] neighbours in zh — a mention gets quotes “”/「」, other spaces dropped, one
// annotation space → 「，」 (edits = whole fields from scripts/c25b-edits.ts). Check: only U+0020 removed and “”「」， added.
const ROUND_C25B = ROUND === "c25b";
// --round c26 (S161 D-233): zh 「」 → “” (‘’ when nested), whole fields from scripts/c26-edits.ts. Check: same length,
// only 「→“/‘ and 」→”/’ (quoteSwapOnly), derived followers by the same check.
const ROUND_C26 = ROUND === "c26";
const REASON = ROUND_C26
  ? "S161 C26 D-233: zh quotation marks 「」 → “” (‘’ nested), GB/T 15834-2011 horizontal text"
  : ROUND_C25
  ? "S159 C25 D-231: zh no space at a keyword edge between Chinese characters (corpus norm, clreq §6.3.1)"
  : ROUND_C25B
  ? "S160 C25b D-232: zh bare [[jp:]] — a mention quoted, spaces between Chinese characters dropped"
  : ROUND_C24
  ? "S158 C24: zh no space between a full-width ） and a Chinese character (corpus norm)"
  : ROUND_C19A
  ? "S158 C19a: zh annotation parentheses ASCII ( ) → full-width （ ） (corpus norm), math / logic / pseudo-code keep ASCII"
  : ROUND_L4D
  ? "S157 L4-d D-230: zh katakana middle dot ・ (JIS) between coordinate items → 顿号 、 (W3C clreq §5.1)"
  : ROUND_C22
  ? "S156 C22: exam pseudo-language type name 整数型 explained in en — [[jp:]] marks (lang-allow tb-data entry removed)"
  : ROUND_B
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
const EDITS_C22: [string, string, [string, string][]][] = [
  ["technology-14-37-u03", "terms[2].detail_en", [["○整数型: functionName(整数型: name), where 整数型 is", "○[[jp:整数型]]: functionName([[jp:整数型]]: name), where [[jp:整数型]] is"]]],
];

const UNITS_DIR = P("data/ip/textbook/units");
const DERIVED = /(^|\.)(terms\[\d+\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))_(zh|en)(\[\d+\])?$/;
/** c19a: equal once full-width （）： are mapped back and the space before ( is dropped. */
const parenNorm = (s: string) => s.replace(/（/g, "(").replace(/）/g, ")").replace(/例：/g, "例: ").replace(/ \(/g, "(");
// also a keyword ending in ） (`**MBO（目标管理）** 是`): the space after the closing ** is the same gap once rendered / derived.
const c24Norm = (s: string) => s.replace(/） (?=[\u4E00-\u9FFF])/g, "）").replace(/）\*\* (?=[\u4E00-\u9FFF])/g, "）**")
  // a keyword + its JP gloss (`**响应时间** [[jp:レスポンスタイム]] 是`): compatText derives「响应时间（レスポンスタイム） 是」
  .replace(/(\*\* ?\[\[jp:[^\]]+\]\]) (?=[\u4E00-\u9FFF])/g, "$1");
const c24Only = (a: unknown, b: unknown) => typeof a === "string" && typeof b === "string" && a !== b && c24Norm(a) === c24Norm(b) && c24Norm(a) === b;
/** c25: b is a with some U+0020 deleted and nothing else (positional subsequence). */
const spaceDelOnly = (a: unknown, b: unknown) => {
  if (typeof a !== "string" || typeof b !== "string" || a === b || b.length >= a.length) return false;
  let j = 0;
  for (let i = 0; i < a.length; i++) {
    if (j < b.length && a[i] === b[j]) j++;
    else if (a[i] !== " ") return false;
  }
  return j === b.length;
};
/** c25b: b = a with some U+0020 deleted and some “”「」， inserted, nothing else (positional; S160 Rule D L1). */
const quoteSpaceOnly = (a: unknown, b: unknown) => {
  if (typeof a !== "string" || typeof b !== "string" || a === b) return false;
  // greedy alignment is exact here: a deletable char (space) never equals an insertable one (“”「」，)
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) (i++, j++);
    else if (i < a.length && a[i] === " ") i++;
    else if (j < b.length && "“”「」，".includes(b[j])) j++;
    else return false;
  }
  return true;
};
/** c26: same length, a and b equal except 「 → “/‘ and 」 → ”/’ (at least one). */
const quoteSwapOnly = (a: unknown, b: unknown) => {
  if (typeof a !== "string" || typeof b !== "string" || a === b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    if (!((a[i] === "「" && "“‘".includes(b[i])) || (a[i] === "」" && "”’".includes(b[i])))) return false;
  }
  // S161 Rule D L1: b's quotes pair up, ‘ never at depth 0, no “ inside a quote (D-233 rule 1)
  const st: string[] = [];
  for (const ch of b) {
    if (ch === "“") { if (st.length) return false; st.push("”"); }
    else if (ch === "‘") { if (!st.length) return false; st.push("’"); }
    else if ((ch === "”" || ch === "’") && st.pop() !== ch) return false;
  }
  return st.length === 0;
};
const parenOnly = (a: unknown, b: unknown) => typeof a === "string" && typeof b === "string" && a !== b && parenNorm(a) === parenNorm(b);
/** l4d: a and b differ only where a has ・ and b has 、 or ，(same length, every other char equal). */
const dotOnly = (a: unknown, b: unknown) =>
  typeof a === "string" && typeof b === "string" && a.length === b.length && [...a].every((c, i) => c === b[i] || (c === "・" && (b[i] === "、" || b[i] === "，")));
// l4d exceptions: exact replacement for one occurrence (not a coordinate pair).
const L4D_EXACT: Record<string, [string, string]> = {
  "strategy-04-13-u03 terms[2].fig.data.rows[0].cells[1].zh": ["森健太・38 岁", "森健太，38 岁"],
};
function l4dEdits(): [string, string, [string, string][]][] {
  const out: [string, string, [string, string][]][] = [];
  const walk = (o: unknown, p: string, unit: string) => {
    if (typeof o === "string") {
      if (!/(_zh|\.zh)(\[\d+\])?$/.test(p) || !o.includes("・") || DERIVED.test(p) || /^(title_zh|unit_summary_zh)$/.test(p)) return; // title = direct (C18), summary = unit-level patch (--manifest, by hand)
      if (unit === "management-10-27-u02" && p.startsWith("terms[3].fig.")) return;
      let after = "";
      let depth = 0;
      for (let i = 0; i < o.length; i++) {
        if (o.startsWith("[[jp:", i)) depth++;
        else if (o.startsWith("]]", i) && depth > 0) depth--;
        after += o[i] === "・" && depth === 0 ? "、" : o[i];
      }
      const ex = L4D_EXACT[`${unit} ${p}`];
      if (ex) {
        if (o.split(ex[0]).length !== 2) throw new Error(`${unit} ${p}: exception «${ex[0]}» not found once`);
        after = o.replace(ex[0], ex[1]);
      }
      if (after !== o) out.push([unit, p, [[o, after]]]);
      return;
    }
    if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`, unit));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k, unit);
  };
  for (const f of readdirSync(UNITS_DIR).filter((x) => x.endsWith(".json")).sort()) walk(lib.readJson(path.join(UNITS_DIR, f)), "", f.replace(/\.json$/, ""));
  return out;
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

const report: Row = { mode: APPLY ? "apply" : "plan", fields: [] as Row[], units: [] as Row[] };
const unitFields = new Map<string, Row[]>();
// --edits <file> (default c19a_edits.json): a later reviewed addition is applied as its own list (S158 Rule D M1: c19a_edits2.json).
const EDITS_FILE = process.argv.includes("--edits") ? path.resolve(process.argv[process.argv.indexOf("--edits") + 1]) : P(ROUND_C26 ? "evidence/phase5/hosting/c26_edits.json" : ROUND_C25B ? "evidence/phase5/hosting/c25b_edits.json" : ROUND_C25 ? "evidence/phase5/hosting/c25_edits.json" : ROUND_C24 ? "evidence/phase5/hosting/c24_edits.json" : "evidence/phase5/hosting/c19a_edits.json");
const c19aEdits = (): [string, string, [string, string][]][] => JSON.parse(readFileSync(EDITS_FILE, "utf-8"));
for (const [unit, p, subs] of ROUND_C19A || ROUND_C24 || ROUND_C25 || ROUND_C25B || ROUND_C26 ? c19aEdits() : ROUND_L4D ? l4dEdits() : ROUND_C22 ? EDITS_C22 : ROUND_B ? EDITS_B : EDITS) {
  const u = lib.readJson(path.join(UNITS_DIR, `${unit}.json`));
  const before = getPath(u, p);
  if (typeof before !== "string") throw new Error(`${unit} ${p}: not a string`);
  let after = before;
  for (const [from, to] of subs) {
    if (occ(after, from) !== 1) throw new Error(`${unit} ${p}: «${from}» occurs ${occ(after, from)}×`);
    if (ROUND_L4D && !dotOnly(from, to)) throw new Error(`${unit} ${p}: l4d edit is not ・ → 、/， only`);
    if (ROUND_C19A && parenNorm(from) !== parenNorm(to)) throw new Error(`${unit} ${p}: c19a edit is not a paren-width change`);
    if (ROUND_C25 && !spaceDelOnly(from, to)) throw new Error(`${unit} ${p}: c25 edit is not a space deletion`);
    if (ROUND_C25B && !quoteSpaceOnly(from, to)) throw new Error(`${unit} ${p}: c25b edit is not a space / quote change`);
    if (ROUND_C26 && !quoteSwapOnly(from, to)) throw new Error(`${unit} ${p}: c26 edit is not a 「」 → “”/‘’ swap`);
    if (ROUND_C24 && c24Norm(from) !== to) throw new Error(`${unit} ${p}: c24 edit is not a dropped space after ）`);
    if (!ROUND_B && !ROUND_L4D && !ROUND_C19A && !ROUND_C24 && !ROUND_C25 && !ROUND_C25B && !ROUND_C26 && stripInline(to) !== from) throw new Error(`${unit} ${p}: «${to}» is not «${from}» plus marks`);
    after = after.replace(from, to);
  }
  if (!ROUND_B && !ROUND_L4D && !ROUND_C19A && !ROUND_C24 && !ROUND_C25 && !ROUND_C25B && !ROUND_C26 && stripInline(after) !== stripInline(before)) throw new Error(`${unit} ${p}: strip(after) ≠ strip(before)`);
  const f = { unit, path: p, before, after, ...(ROUND_B ? { exact: true } : {}) };
  report.fields.push(f);
  unitFields.set(unit, [...(unitFields.get(unit) ?? []), f]);
}

for (const [unit, fps] of [...unitFields].sort()) {
  // c25b: a frozen unit (D-201 §0-4, merge --write refused) takes a reviewed direct edit of its glossary fields + the zh
  // compat fields re-derived (l4-r2-apply.ts route, S154); derived changes must pass the same check.
  if (frozen[unit] && (ROUND_C25B || ROUND_C26)) {
    const u = lib.readJson(path.join(UNITS_DIR, `${unit}.json`));
    const mod = clone(u);
    const ur: Row = { unit, frozen: frozen[unit], fields: [] as Row[], steps: [] as Row[] };
    report.units.push(ur);
    for (const fp of fps) {
      if (!/^terms\[\d+\]\.(hook|one|detail)_zh$/.test(fp.path)) throw new Error(`${unit}: frozen direct edit not prepared for ${fp.path}`);
      setPath(mod, fp.path, fp.after);
      ur.fields.push({ path: fp.path, route: "frozen direct edit" });
    }
    mod.terms.forEach((t: Row) => {
      t.definition_zh = compatText(t.one_zh ?? "", "zh");
      t.explanation_zh = compatText(t.detail_zh ?? "", "zh");
      if (typeof t.hook_zh === "string") t.memory_hook_zh = compatText(t.hook_zh, "zh");
    });
    mod.summary.memory_hooks_zh = (await lib.loadKit()).hookLines(mod, "zh");
    const changed = diffPaths(u, mod);
    const targets = fps.map((f) => f.path);
    const bad = changed.filter((p) => !targets.includes(p) && !(DERIVED.test(p) && (ROUND_C26 ? quoteSwapOnly : quoteSpaceOnly)(getPath(u, p), getPath(mod, p))));
    if (bad.length) throw new Error(`${unit}: frozen direct edit changes ${bad.join(", ")}`);
    ur.derived_followers = changed.filter((p) => !targets.includes(p));
    if (APPLY) writeFileSync(path.join(UNITS_DIR, `${unit}.json`), lib.jsonText(mod));
    continue;
  }
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
  // c26: unit_summary_zh is carried from manifest.v1 → a unit-level patch (--manifest), l4-r2-apply.ts route (S154).
  const sumF = ROUND_C26 ? fps.find((f) => f.path === "unit_summary_zh") : undefined;
  const locFps = fps.filter((f) => f !== sumF);
  const manifestFile = paths.manifest(unit);
  const manifest = sumF ? lib.readJson(manifestFile) : null;
  const vSha = manifest ? v1Sha256(manifest) : "";
  for (const fp of locFps) {
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
  if (sumF) {
    const a = { unit_summary_zh: manifest.v1.unit_summary_zh };
    applyUnitPatches(a, sim, vSha);
    if (a.unit_summary_zh !== sumF.before) throw new Error(`${unit}: unit_summary replay ≠ units`);
    if (sim.some((p) => p.status === "active" && p.field === "unit.unit_summary_zh")) throw new Error(`${unit}: unit_summary_zh already has an active unit-level patch (composite not prepared)`);
    const w = windowOf(sumF.before, sumF.after);
    ur.steps.push({ op: "register", kind: "unit", field: "unit.unit_summary_zh", before: w.before, after: w.after, reason: REASON });
    sim.push({ id: `sim${sim.length + 1}`, status: "active", base_sha256: vSha, field: "unit.unit_summary_zh", before: w.before, after: w.after });
    ur.fields.push({ path: "unit_summary_zh", route: "unit-level patch" });
    const b = { unit_summary_zh: manifest.v1.unit_summary_zh };
    applyUnitPatches(b, sim, vSha);
    if (b.unit_summary_zh !== sumF.after) throw new Error(`${unit}: simulated unit_summary ≠ final`);
  }
  const simLoc = lib.readJson(partFile);
  applyPatches(simLoc, sim, locSha);
  for (const fp of locFps) if (getPath(simLoc, fp.path) !== fp.after) throw new Error(`${unit} ${fp.path}: simulated replay ≠ final`);
  const stray = diffPaths(full, simLoc).filter((p) => !locFps.some((f) => f.path === p));
  if (stray.length) throw new Error(`${unit}: simulated replay changes other fields: ${stray.join(", ")}`);
  if (!APPLY) continue;

  const m0 = mergeDry(unit);
  ur.merge_exit_before = m0.exit;
  ur.baseline_diff = diffPaths(m0.merged, u);
  for (const s of ur.steps) {
    const out = s.op === "retire"
      ? cli(["--unit", unit, "--retire", s.id, "--reason", s.reason])
      : cli(["--unit", unit, "--register", ...(s.kind === "unit" ? ["--manifest", manifestFile] : ["--part", partFile]), "--field", s.field, "--before", s.before, "--after", s.after, "--reason", s.reason]);
    (ur.cli ??= []).push(out);
  }
  const m1 = mergeDry(unit);
  ur.merge_exit_after = m1.exit;
  const targets = fps.map((f) => f.path);
  const newDiff = diffPaths(m1.merged, u).filter((p) => !ur.baseline_diff.includes(p));
  ur.new_diff = newDiff;
  // l4d: a derived field may follow its source, but only by the same ・ → 、 change.
  const followers = ROUND_L4D || ROUND_C19A || ROUND_C24 || ROUND_C25 || ROUND_C25B || ROUND_C26
    ? newDiff.filter((p) => !targets.includes(p) && DERIVED.test(p) && (ROUND_L4D ? dotOnly : ROUND_C26 ? quoteSwapOnly : ROUND_C25B ? quoteSpaceOnly : ROUND_C25 ? spaceDelOnly : ROUND_C24 ? c24Only : parenOnly)(getPath(u, p), getPath(m1.merged, p)))
    : [];
  ur.derived_followers = followers;
  const bad = newDiff.filter((p) => !targets.includes(p) && !followers.includes(p));
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
