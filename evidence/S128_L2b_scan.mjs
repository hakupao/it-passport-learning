// S128 L2b — read-only scans: ⑨ #16 bracket/minus glyphs, #22 tables, #19 figure_description numerics.
// Usage: node scan.mjs <repoRoot> <outJson>
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = process.argv[2];
const OUT = process.argv[3];
const P = (...s) => path.join(ROOT, ...s);
const HASH = {};
const readJson = (rel) => { const b = readFileSync(P(rel)); HASH[rel] = createHash("sha256").update(b).digest("hex").slice(0, 16); return JSON.parse(b.toString("utf-8")); };
const LETTERS = ["ア", "イ", "ウ", "エ"];

const QRAW = readJson("data/ip/quiz/questions.json").questions;
const Q = Array.isArray(QRAW) ? Object.fromEntries(QRAW.map((q) => [q.id, q])) : QRAW;
const EXAMS = readdirSync(P("data/ip/quiz/translations")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const TR = Object.fromEntries(EXAMS.map((e) => [e, readJson(`data/ip/quiz/translations/${e}.json`).questions]));
const BANK = new Map(readJson("data/ip/exams/question_bank.json").questions.map((b) => [b.id, b]));
const POP = readJson("evidence/phase5/stage_06_quiz_fidelity/full52_population_S118.json");
const POP_EXAMS = new Set(Object.values(POP.exams).map((x) => x.exam_id));
const EXCL = new Set(Object.values(POP.exams).flatMap((x) => x.excluded.map((e) => e.id)));
const sector = (id, ex) => (EXCL.has(id) ? "excluded" : POP_EXAMS.has(ex) ? "pop" : "13exam");

function fieldsOf(id) {
  const q = Q[id], ex = q.exam_id, tr = TR[ex]?.[id];
  const clean = typeof tr?.stem_jp_clean === "string" && tr.stem_jp_clean.trim() ? tr.stem_jp_clean : null;
  const f = [{ layer: "jp", field: "stem", text: clean ?? q.stem_jp ?? "" }];
  if (clean) f.push({ layer: "jp_raw", field: "stem", text: q.stem_jp ?? "" });
  for (const L of LETTERS) f.push({ layer: "jp", field: `choice.${L}`, text: q.choices_jp?.[L] ?? "" });
  for (const lang of ["zh", "en"]) {
    f.push({ layer: lang, field: "stem", text: tr?.stem?.[lang] ?? "" });
    for (const L of LETTERS) f.push({ layer: lang, field: `choice.${L}`, text: tr?.choices?.[L]?.[lang] ?? "" });
  }
  return f;
}
const IDS = Object.keys(Q).sort();
const ex8 = (id) => Q[id].exam_id;
const exc = (s, i, n, pad = 16) => { const a = Math.max(0, i - pad), b = Math.min(s.length, i + n + pad); return (a ? "…" : "") + s.slice(a, b).replace(/\n/g, "⏎") + (b < s.length ? "…" : ""); };

// ── #16 brackets ─────────────────────────────────────────────────────────────
const OPEN = "[［【〔", CLOSE = "]］】〕";
const NAME = { "[": "sq", "［": "fwsq", "【": "lent", "〔": "tort", "]": "sq", "］": "fwsq", "】": "lent", "〕": "tort" };
const RE_BR = /([\[［【〔])([^\[\]［］【】〔〕\n]{0,40})([\]］】〕])/g;
const RE_JPCH = /[ぁ-ゖァ-ヺー㐀-䶿一-鿿]/;
function brClass(inner, s, i, layer) {
  const t = inner.trim();
  if (/^[\s　]*([a-zA-Zａ-ｚＡ-Ｚ0-9０-９ア-エ①-⑳ⅰ-ⅻ]{0,3}|[ 　]*)[\s　]*$/.test(inner)) return "blank";
  if (/^(図|表|图|Figure|Fig\.|Table)\s*$/.test(t)) return "figtag_bare";
  if (/^(図|表|图|Figure|Fig\.|Table)/i.test(t)) return "figlabel";
  if (/プログラム|擬似|pseudo|program|程序/i.test(t)) return "program";
  const prev = s[i - 1];
  if (prev && /[A-Za-z0-9_\]）)]/.test(prev) && /^[^ぁ-ゖ]{1,12}$/.test(t) && !RE_JPCH.test(t.slice(0, 1))) return "index";
  if (layer === "en" ? /[A-Za-z]{2,}/.test(t) : RE_JPCH.test(t) || /[A-Za-z]{2,}/.test(t)) return "heading";
  return "other";
}
const brHits = [];
const RE_STRAY = /[\[［【〔][\[［【〔]|[\]］】〕][\]］】〕]/g;
for (const id of IDS) for (const f of fieldsOf(id)) {
  const s = f.text;
  for (const m of s.matchAll(RE_BR)) {
    const [all, o, inner, c] = m;
    const pair = NAME[o] === NAME[c] ? NAME[o] : `${NAME[o]}>${NAME[c]}`;
    const cls = brClass(inner, s, m.index, f.layer);
    const lineStart = m.index === 0 || s[m.index - 1] === "\n";
    const lineEnd = s.indexOf("\n", m.index); const rest = s.slice(m.index + all.length, lineEnd < 0 ? s.length : lineEnd).trim();
    let role = null;
    if (cls === "heading" || cls === "other") role = lineStart && rest === "" ? "heading_line" : lineStart ? "label_line" : "inline";
    brHits.push({ id, exam: ex8(id), sector: sector(id, ex8(id)), layer: f.layer, field: f.field, pair, cls, role, inner: inner.trim(), pos: lineStart ? "line" : "inline", text: all, excerpt: exc(s, m.index, all.length) });
  }
  for (const m of s.matchAll(RE_STRAY)) brHits.push({ id, exam: ex8(id), sector: sector(id, ex8(id)), layer: f.layer, field: f.field, pair: "stray", cls: "stray_double", pos: "-", text: m[0], excerpt: exc(s, m.index, 2) });
}

// inline mentions of a heading defined in the same question (any layer) → heading_ref
{ const hd = new Map(); for (const h of brHits) if (h.role === "heading_line") { const k = h.id + "|" + h.layer; if (!hd.has(k)) hd.set(k, new Set()); hd.get(k).add(h.inner); }
  for (const h of brHits) if (h.role === "inline" || h.role === "label_line") { if (hd.get(h.id + "|" + h.layer)?.has(h.inner)) h.role = "heading_ref"; else if (/^(の中|の|を|に|で|は|が|から|に関|における|について)/.test(h.excerpt.split(h.text)[1] ?? "") && h.inner.length >= 3) h.role = "heading_ref?"; } }
// ── #16 minus ────────────────────────────────────────────────────────────────
const MINUS = { "-": "U+002D", "−": "U+2212", "－": "U+FF0D", "‐": "U+2010", "‑": "U+2011", "‒": "U+2012", "–": "U+2013", "—": "U+2014", "―": "U+2015", "ー": "U+30FC", "△": "U+25B3", "▲": "U+25B2" };
const RE_MIN = /(^|[^0-9０-９A-Za-zＡ-Ｚａ-ｚぁ-ゖァ-ヺ㐀-䶿一-鿿\-−－‐‑‒–—―ー.])([\-−－‐‑‒–—―ー△▲])([0-9０-９]+(?:[.．][0-9０-９]+)?)/g;
const minHits = [];
for (const id of IDS) for (const f of fieldsOf(id)) {
  const s = f.text;
  for (const m of s.matchAll(RE_MIN)) {
    const i = m.index + m[1].length;
    const lineStart = i === 0 || s[i - 1] === "\n";
    // markdown separator / bullet "- 1" excluded by requiring a digit right after; "-1" at line start is ambiguous → tagged
    const inTable = (s.lastIndexOf("\n", i) < 0 ? s : s.slice(s.lastIndexOf("\n", i) + 1)).trimStart().startsWith("|");
    minHits.push({ id, exam: ex8(id), sector: sector(id, ex8(id)), layer: f.layer, field: f.field, glyph: MINUS[m[2]], ctx: inTable ? "table" : lineStart ? "line_start" : "prose", num: m[3], excerpt: exc(s, i, 1 + m[3].length) });
  }
}

// ── #22 tables ───────────────────────────────────────────────────────────────
const isRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isSep = (l) => /^\s*\|(\s*:?-{2,}:?\s*\|)+\s*$/.test(l);
const cells = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isNumCell = (c) => /^[\-−－△]?[0-9０-９,，.．]+\s*[%％万円千百億個人名秒分時日月年件台本]*$/.test(c);
function commonPrefixGroup(arr) {
  // ≥2 cells "<prefix><space><label>" sharing the same prefix (flattened merged header)
  const m = new Map();
  for (const c of arr) { const g = /^(.{2,}?)[\s　]+([A-ZＡ-Ｚa-z0-9０-９ア-エ①-⑳]{1,3})$/.exec(c); if (g) m.set(g[1], (m.get(g[1]) ?? 0) + 1); }
  return [...m.entries()].filter(([, n]) => n >= 2).map(([k, n]) => `${k}×${n}`);
}
const tblHits = [];
const tblStats = { blocks: 0, byLayer: {} };
for (const id of IDS) for (const f of fieldsOf(id)) {
  const lines = f.text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!isRow(lines[i])) continue;
    let j = i; while (j < lines.length && isRow(lines[j])) j++;
    const block = lines.slice(i, j);
    const sepIdx = block.findIndex(isSep);
    tblStats.blocks++; tblStats.byLayer[f.layer] = (tblStats.byLayer[f.layer] ?? 0) + 1;
    const flags = [];
    const rows = block.map((l, k) => ({ k, sep: isSep(l), c: cells(l) }));
    const hdr = sepIdx > 0 ? rows.slice(0, sepIdx) : [];
    const body = rows.filter((r) => !r.sep && r.k > sepIdx);
    const ncol = (sepIdx >= 0 ? rows[sepIdx] : rows[0]).c.length;
    if (sepIdx < 0) flags.push("NO_SEP");
    if (sepIdx > 1) flags.push("H2_MULTI_HEADER_ROWS");
    if (rows.some((r) => !r.sep && r.c.length !== ncol)) flags.push("RAGGED");
    for (const h of hdr) {
      const ne = h.c.filter((x) => x !== "").length;
      if (h.c.slice(1).some((x) => x === "") && ne >= 1) flags.push("HDR_EMPTY_CELL");
      if (h.c.some((x, k) => k > 0 && x !== "" && x === h.c[k - 1])) flags.push("HDR_REPEAT_ADJ");
      const g = commonPrefixGroup(h.c); if (g.length) flags.push(`HDR_PREFIX_EXPANDED(${g.join(",")})`);
    }
    if (body.length) {
      const b0 = body[0].c;
      if (b0.length >= 3 && b0.slice(1).every((x) => x !== "" && !isNumCell(x)) && body.slice(1).some((r) => r.c.slice(1).some(isNumCell)) && (b0[0] === "" || hdr.some((h) => h.c.slice(1).some((x) => x === ""))))
        flags.push("BODY0_LOOKS_HEADER");
      const col0 = body.map((r) => r.c[0] ?? "");
      const allc0 = rows.filter((r) => !r.sep).map((r) => r.c[0] ?? "");
      if (allc0.some((x, k) => k > 0 && x !== "" && x === allc0[k - 1])) flags.push("COL0_REPEAT (row-span expanded?)");
      const g = commonPrefixGroup(col0); if (g.length) flags.push(`COL0_PREFIX_EXPANDED(${g.join(",")})`);
      if (body.some((r, k) => k > 0 && r.c[0] === "" && r.c.slice(1).some((x) => x !== "")) && col0[0] !== "") flags.push("COL0_EMPTY_CONT (row-span?)");
    }
    for (const r of rows) if (!r.sep && ncol >= 3 && r.c.filter((x) => x !== "").length === 1 && r.c[0] !== "" && r.k !== 0) flags.push("SPAN_ROW (caption/section row inside table)");
    // caption line directly above (skip ≤1 blank line)
    let p = i - 1; if (p >= 0 && lines[p].trim() === "") p--;
    const above = p >= 0 ? lines[p].trim() : "";
    let capType = null;
    if (above && !isRow(above) && above.length <= 40 && !/[。.？?]$/.test(above)) capType = /^単位|^单位|^Unit/i.test(above) ? "unit" : /^[\[［【〔(（]?\s*(表|図|图|Table|Figure)/i.test(above) ? "figlabel" : "caption";
    if (capType) flags.push(`ABOVE_${capType.toUpperCase()}`);
    const structural = flags.filter((x) => !x.startsWith("ABOVE_"));
    tblHits.push({ id, exam: ex8(id), sector: sector(id, ex8(id)), layer: f.layer, field: f.field, ncol, nrow: body.length, hdrRows: Math.max(sepIdx, 0), flags: [...new Set(flags)], structural: structural.length > 0, above, header: hdr.map((h) => h.c.join(" | ")).join(" ⏎ ").slice(0, 160) });
    i = j - 1;
  }
}

// ── #19 figure_description numerics ──────────────────────────────────────────
const toAscii = (s) => String(s).replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0)).replace(/．/g, ".").replace(/，/g, ",");
const nums = (s) => [...toAscii(s).replace(/(\d),(?=\d{3})/g, "$1").matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
const SZ = "0689";
function szNeighbors(n) {
  const out = new Set();
  for (let k = 0; k < n.length; k++) if (SZ.includes(n[k])) for (const d of SZ) if (d !== n[k]) out.add(n.slice(0, k) + d + n.slice(k + 1));
  return out;
}
const figHits = [];
let figN = 0;
for (const id of IDS) {
  const b = BANK.get(id); const fd = b?.figure_description; if (!fd) continue; figN++;
  const f = fieldsOf(id);
  const jpDisp = f.filter((x) => x.layer === "jp").map((x) => x.text).join("\n");
  const jpRaw = f.find((x) => x.layer === "jp_raw")?.text ?? "";
  const S = new Set(nums(jpDisp)), F = nums(fd), FS = new Set(F);
  const figOnly = [...new Set(F)].filter((n) => !S.has(n));
  const sz = figOnly.map((n) => ({ n, to: [...szNeighbors(n)].filter((m) => S.has(m)) })).filter((x) => x.to.length);
  const stemOnly = [...S].filter((n) => !FS.has(n));
  const flags = [];
  if (sz.length) flags.push("SLASHED_ZERO_PAIR");
  if (figOnly.length) flags.push("FIG_ONLY_NUM");
  if (/[?？]/.test(fd)) flags.push("QMARK");
  if (/単位[：:]/.test(fd) && !/単位[：:]/.test(jpDisp)) flags.push("UNIT_COLON_DRIFT");
  figHits.push({ id, exam: ex8(id), sector: sector(id, ex8(id)), has_figure_q: !!Q[id].has_figure, figNums: F.length, stemNums: S.size, figOnly, slashedZero: sz, stemOnlyCount: stemOnly.length, flags, fd: fd.slice(0, 200), inRawOnly: figOnly.filter((n) => nums(jpRaw).includes(n)) });
}

// textbook unit copies vs bank
const unitDir = P("data/ip/textbook/units");
const unitCopy = { units: 0, refs: 0, withDesc: 0, differFromBank: [], ids: new Set() };
for (const fn of readdirSync(unitDir).filter((x) => x.endsWith(".json")).sort()) {
  const u = JSON.parse(readFileSync(path.join(unitDir, fn), "utf-8"));
  if (!u.source_figures?.length) continue; unitCopy.units++;
  for (const s of u.source_figures) {
    unitCopy.refs++; if (s.figure_description) { unitCopy.withDesc++; unitCopy.ids.add(s.question_id); }
    const bd = BANK.get(s.question_id)?.figure_description ?? null;
    if (s.figure_description && s.figure_description !== bd) unitCopy.differFromBank.push({ unit: fn, qid: s.question_id, src: s.source });
  }
}
unitCopy.ids = [...unitCopy.ids].sort();

writeFileSync(OUT, JSON.stringify({ inputs: HASH, brHits, minHits, tblHits, tblStats, figN, figHits, unitCopy }, null, 1));
console.log("brackets", brHits.length, "minus", minHits.length, "tables", tblHits.length, "fig", figN, "unitrefs", unitCopy.refs);
