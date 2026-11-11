#!/usr/bin/env node
// Track L step L4-c (docs/phase5/PLAN_hosting_migration.md §3, D-221) — READ-ONLY proposal: wrap the Japanese in the
// memory hooks (terms[].hook_zh / hook_en of data/ip/textbook/units/*.json) in [[jp:…]], like body text.
// Writes nothing but evidence/phase5/hosting/L4c_hooks.json (--write). Never runs the merge or the patch tool
// (they write merged.json / batch/patches): the B3 replay is reproduced in memory with their exported functions.
//
// Detection (per hook, text outside existing [[jp:…]]):
//   en — every run of kanji / kana (+ ー 々 ・ inside a run): complete by construction.
//   zh — (a) a quoted segment 「」“”『』‘’"" whose content is Japanese: has kana or a non-GB2312 glyph, or equals a run
//        of the en sibling, or (2+ chars) occurs in the ja hook / headword; (b) an unquoted run of kana / non-GB2312
//        glyphs, grown over adjacent Han while the grown string occurs in the ja hook / headword. A quoted shared-glyph
//        word that only occurs in the ja hook needs a 日语 / 日文 / 写作 / 读作 cue in the 15 chars before (else it is a
//        Chinese gloss of an English word: “能力”). Dissections written only in shared glyphs without
//        quotes, kana or an en echo are NOT found: reported as residual (en has CJK, zh got no proposal).
// Checks per proposed hook: stripInline(after) = stripInline(before); inlineErrors(after) = []; no label inside a
// **…** span; compatText(after) = compatText(before) (else the glossary memory_hook changes); validateUnit (validateV2 +
// svg + copy) of the unit with all proposed hooks and re-derived compat fields has no new issue; zh-term warnings
// (B6) do not increase. Path: final loc part (journals) + active patches replayed = the units/ hook; the edit windows
// are unique and do not overlap an active patch's replaced text in that field; frozen_baseline units flagged.
// Run: node scripts/l4-hooks.ts [--write]

import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const imp = (p: string) => import(pathToFileURL(path.join(ROOT, p)).href);
const lib = await imp("scripts/lib/textbook-v2.mjs");
const { journalRows, pickFinal } = await imp("scripts/textbook-v2-merge.mjs");
const { applyPatches, applyUnitPatches, readPatches, readFrozen, v1Sha256, BATCH_DIR } = await imp("scripts/textbook-v2-patch.mjs");
const { validateUnit } = await imp("scripts/textbook-v2-validate.mjs");
const { stripInline, compatText, inlineErrors } = await imp("apps/web/src/lib/textbook/inline.ts");
const kit = await lib.loadKit();
const paths = lib.dataPaths();
const zhTable = lib.readJson(paths.zhTerms);
const frozen: Record<string, string> = readFrozen(BATCH_DIR);

const gbk = new TextDecoder("gbk");
const GB = new Set<string>();
for (let a = 0xb0; a <= 0xf7; a++)
  for (let b = 0xa1; b <= 0xfe; b++) {
    const s = gbk.decode(new Uint8Array([a, b]));
    if (s.length === 1) GB.add(s);
  }
const HAN = /\p{Script=Han}/u;
const sjis = new TextDecoder("shift_jis");
const SJ = new Set<string>();
for (let a = 0x81; a <= 0xfc; a++)
  for (let b = 0x40; b <= 0xfc; b++) {
    const s = sjis.decode(new Uint8Array([a, b]));
    if (s.length === 1 && s !== "\ufffd") SJ.add(s);
  }
const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}ー]/u;
const JPCH = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆]/u;
const jpGlyph = (c: string) => HAN.test(c) && !GB.has(c);
const isJpSignal = (c: string) => (KANA.test(c) && c !== "・") || jpGlyph(c);
const JA_CUE = /日语|日文|日本语|写作|读作/;

type Span = { s: number; e: number; why: string };
/** [s, e) ranges of existing [[jp:…]] and **…** in the raw string. */
const ranges = (raw: string, re: RegExp) => [...raw.matchAll(re)].map((m) => ({ s: m.index ?? 0, e: (m.index ?? 0) + m[0].length }));
const inside = (sp: Span, rs: { s: number; e: number }[]) => rs.some((r) => sp.s < r.e && sp.e > r.s);

function enSpans(raw: string): Span[] {
  const jp = ranges(raw, /\[\[jp:.+?\]\]/g);
  const out: Span[] = [];
  const re = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆]+(?:・[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆]+)*/gu;
  for (const m of raw.matchAll(re)) {
    const sp = { s: m.index ?? 0, e: (m.index ?? 0) + m[0].length, why: "en: kanji / kana run" };
    if (!inside(sp, jp)) out.push(sp);
  }
  return out;
}

const QUOTES: [string, string][] = [["「", "」"], ["“", "”"], ["『", "』"], ["‘", "’"], ['"', '"']];

type Dropped = { text: string; before15: string; kind: string; judgement: string };
const ENG_GLOSS = /[A-Za-z]+[^“「『"]{0,8}(意为|是|为|就是|指|叫|的意思是)\s*$|意为\s*$|英语[^“「『"]{0,12}$/;
const NAME_CUE = /名称|简称|通称|名字|拆/;
/** Dropped candidates read and judged "mark" (Japanese name / word being dissected; S154 L4-c review of `dropped_zh_candidates`). */
const MANUAL: Record<string, string[]> = {
  "strategy-01-01-u11": ["特区"], "strategy-02-06-u03": ["独禁法", "金商法"], "strategy-02-06-u02": ["景品", "表示"], "management-11-30-u01": ["自家"],
  "strategy-05-14-u04": ["自治体"], "strategy-05-14-u02": ["勘定系"], "strategy-02-05-u01": ["匿名", "加工"], "strategy-07-23-u01": ["合意"],
  "technology-16-43-u02": ["二刀流"], "technology-23-63-u05": ["管理"],
};
function zhSpans(raw: string, enRuns: string[], jaText: string, dropped: Dropped[] = [], manual: string[] = []): Span[] {
  const jp = ranges(raw, /\[\[jp:.+?\]\]/g);
  const out: Span[] = [];
  const add = (sp: Span) => {
    if (sp.e <= sp.s || inside(sp, jp) || out.some((o) => sp.s < o.e && sp.e > o.s)) return;
    out.push(sp);
  };
  // (a) quoted
  for (const [o, c] of QUOTES) {
    for (let i = raw.indexOf(o); i !== -1; i = raw.indexOf(o, i + 1)) {
      const j = raw.indexOf(c, i + 1);
      if (j === -1) break;
      const inner = raw.slice(i + 1, j);
      if (inner === "" || [...inner].some((ch) => !JPCH.test(ch) && ch !== "・")) continue;
      const why = [...inner].some(isJpSignal)
        ? "zh: quoted, kana / Japanese glyph"
        : enRuns.includes(inner)
          ? "zh: quoted, = a CJK run of the en hook"
          : [...inner].length >= 2 && jaText.includes(inner) && JA_CUE.test(raw.slice(Math.max(0, i - 15), i))
            ? "zh: quoted, occurs in the ja hook / headword, after 日语 / 日文 / 写作 / 读作"
            : null;
      if (!why && manual.includes(inner)) {
        add({ s: i + 1, e: j, why: "zh: quoted, judged by reading (dropped-candidate review)" });
        continue;
      }
      if (!why && [...inner].length >= 2 && jaText.includes(inner)) {
        const b15 = raw.slice(Math.max(0, i - 15), i);
        dropped.push({ text: inner, before15: b15, kind: "quoted, in the ja hook, no 日语 cue", judgement: ENG_GLOSS.test(b15) ? "no mark: Chinese gloss of an English word" : NAME_CUE.test(raw.slice(Math.max(0, i - 15), j + 8)) ? "candidate: part of the Japanese name being dissected (review)" : "unsure (review)" });
      }
      if (why) add({ s: i + 1, e: j, why });
      if (o === c) i = j;
    }
  }
  // (b) unquoted kana / Japanese-glyph runs, grown over adjacent Han while the string occurs in the ja text
  const chars = [...raw];
  const at: number[] = [];
  let off = 0;
  for (const ch of chars) {
    at.push(off);
    off += ch.length;
  }
  at.push(off);
  for (let k = 0; k < chars.length; k++) {
    if (!isJpSignal(chars[k])) continue;
    let a = k;
    let b = k + 1;
    while (b < chars.length && (isJpSignal(chars[b]) || chars[b] === "ー" || (KANA.test(chars[b]) && chars[b] !== "・"))) b++;
    const grow = () => {
      let changed = true;
      while (changed) {
        changed = false;
        if (a > 0 && HAN.test(chars[a - 1]) && jaText.includes(chars.slice(a - 1, b).join(""))) {
          a--;
          changed = true;
        }
        if (b < chars.length && (HAN.test(chars[b]) || KANA.test(chars[b])) && jaText.includes(chars.slice(a, b + 1).join(""))) {
          b++;
          changed = true;
        }
      }
    };
    grow();
    add({ s: at[a], e: at[b], why: "zh: unquoted kana / Japanese glyph run" });
    k = b - 1;
  }
  for (const m of manual) {
    const i = raw.indexOf(m);
    if (i !== -1 && !out.some((o) => o.s <= i && o.e >= i + m.length)) add({ s: i, e: i + m.length, why: "zh: unquoted, judged by reading (dropped-candidate review)" });
  }
  // (c) an en-echo string outside quotes and labels is not wrapped (Chinese uses the same words: 本人 / 真正的); listed in `dropped`
  for (const r of [...new Set(enRuns)].filter((x) => [...x].length >= 2))
    for (let i = raw.indexOf(r); i !== -1; i = raw.indexOf(r, i + 1)) {
      const sp = { s: i, e: i + r.length, why: "" };
      if (inside(sp, jp) || out.some((o) => sp.s < o.e && sp.e > o.s)) continue;
      dropped.push({ text: r, before15: raw.slice(Math.max(0, i - 15), i), kind: "unquoted, = a CJK run of the en hook", judgement: "unsure (review): same characters may be Chinese here" });
    }
  return out.sort((x, y) => x.s - y.s);
}

const wrap = (raw: string, sps: Span[]) => {
  let s = raw;
  for (const sp of [...sps].sort((x, y) => y.s - x.s)) s = `${s.slice(0, sp.s)}[[jp:${s.slice(sp.s, sp.e)}]]${s.slice(sp.e)}`;
  return s;
};
/** Edit window around one span: smallest raw slice containing it that occurs once in the hook. */
function windowOf(raw: string, sp: Span) {
  for (let r = 0; r < 30; r++) {
    const a = Math.max(0, sp.s - r);
    const b = Math.min(raw.length, sp.e + r);
    const w = raw.slice(a, b);
    if (raw.split(w).length - 1 === 1) return { a, b, before: w };
  }
  return { a: 0, b: raw.length, before: raw };
}

// --round1 (L4 round 1, L4_review.md "批准范围"): keep only the en labels and the zh labels detected by kana /
// Japanese glyph form; サブロク协定 waits for the D-222.7 redo (round 2). Output goes to --out, never L4c_hooks.json.
const ROUND1 = process.argv.includes("--round1");
const R1_WHY = new Set(["en: kanji / kana run", "zh: quoted, kana / Japanese glyph", "zh: unquoted kana / Japanese glyph run"]);
const R1_EXCLUDE = new Set(["サブロク协定"]);
const outAt = process.argv.indexOf("--out");
const OUT_FILE = outAt > 0 ? path.resolve(process.argv[outAt + 1]) : ROUND1 ? null : path.join(ROOT, "evidence/phase5/hosting/L4c_hooks.json");

type Row = Record<string, unknown>;
const rows: Row[] = [];
const residual: Row[] = [];
const droppedAll: Row[] = [];
const unitReports: Row[] = [];
const clone = (v: unknown) => JSON.parse(JSON.stringify(v));

const UNITS_DIR = path.join(ROOT, "data/ip/textbook/units");
for (const f of readdirSync(UNITS_DIR).filter((x) => x.endsWith(".json")).sort()) {
  const unit = f.replace(/\.json$/, "");
  const u = lib.readJson(path.join(UNITS_DIR, f));
  if (!Array.isArray(u.terms)) continue;
  const mod = clone(u);
  const changes: Row[] = [];
  u.terms.forEach((t: Row, i: number) => {
    if (typeof t.hook_zh !== "string" || typeof t.hook_en !== "string") return;
    const enMasked = (t.hook_en as string).replace(/\[\[jp:(.+?)\]\]/g, (m) => " ".repeat(m.length));
    const enRuns = [...enMasked.matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々〆]+/gu)].map((m) => m[0]);
    const jaText = `${String(t.term ?? "")} ${String(t.hook_jp ?? "")} ${String(t.reading ?? "")}`;
    for (const l of ["zh", "en"] as const) {
      const raw = t[`hook_${l}`] as string;
      const drop: Dropped[] = [];
      const all = l === "en" ? enSpans(raw) : zhSpans(raw, enRuns, jaText, drop, MANUAL[unit] ?? []);
      const sps = ROUND1 ? all.filter((sp) => R1_WHY.has(sp.why) && !R1_EXCLUDE.has(raw.slice(sp.s, sp.e))) : all;
      for (const d of drop) droppedAll.push({ unit, path: `terms[${i}](${t.term}).hook_zh`, ...d, final: "no mark (read in the S154 review: Chinese gloss / Chinese word, or a translated part of the name)", hook_zh: raw });
      if (sps.length === 0) {
        if (l === "zh" && enRuns.length > 0) residual.push({ unit, path: `terms[${i}](${t.term}).hook_zh`, en_runs: enRuns, hook_zh: raw, hook_en: t.hook_en });
        continue;
      }
      const bold = ranges(raw, /\*\*[^*]+?\*\*/g);
      const inBold = sps.filter((sp) => inside(sp, bold));
      const ok = sps.filter((sp) => !inside(sp, bold));
      const after = wrap(raw, ok);
      const checks = {
        strip_equal: stripInline(after) === stripInline(raw),
        inline_errors: inlineErrors(after),
        labels_inside_keyword: inBold.map((sp) => raw.slice(sp.s, sp.e)),
        compat_equal: compatText(after, l) === compatText(raw, l),
        labels_with_simplified_glyph: ok.map((sp) => raw.slice(sp.s, sp.e)).filter((x) => [...x].some((ch) => HAN.test(ch) && !SJ.has(ch))),
      };
      if (ok.length) {
        mod.terms[i][`hook_${l}`] = after;
        mod.terms[i][`memory_hook_${l}`] = compatText(after, l);
      }
      changes.push({
        unit,
        term_index: i,
        term: t.term,
        lang: l,
        path: `terms[${i}](${t.term}).hook_${l}`,
        before: raw,
        after: ok.length ? after : raw,
        labels: ok.map((sp) => ({ text: raw.slice(sp.s, sp.e), why: sp.why })),
        edits: ok.map((sp) => {
          const w = windowOf(raw, sp);
          // the window must not swallow another span (each edit is one label)
          return { before: w.before, after: wrap(w.before, [{ s: sp.s - w.a, e: sp.e - w.a, why: "" }]), _a: w.a, _b: w.b };
        }),
        checks,
      });
    }
  });
  if (changes.length === 0) continue;
  for (const l of ["zh", "en"] as const) if (mod.summary) mod.summary[`memory_hooks_${l}`] = kit.hookLines(mod, l);

  // ---- validation of the end state ----
  const manifest = lib.readJson(paths.manifest(unit));
  const key = (i: Row) => `${i.code}|${i.field}|${i.message}`;
  const before = new Set((await validateUnit(u, manifest, paths)).map(key));
  const afterIssues = (await validateUnit(mod, manifest, paths)).filter((i: Row) => !before.has(key(i)));
  const zhB = lib.zhTermWarnings(u, zhTable).length;
  const zhA = lib.zhTermWarnings(mod, zhTable);
  const zhBset = new Set(lib.zhTermWarnings(u, zhTable).map((w: Row) => `${w.field}|${w.term}`));
  const zhNew = zhA.filter((w: Row) => !zhBset.has(`${w.field}|${w.term}`));

  // ---- B3 path: final loc part + active patches → must equal units/; edit windows registrable ----
  const dir = paths.planning(unit);
  const journals = existsSync(dir) ? readdirSync(dir).filter((x) => /^journal\..*\.jsonl$/.test(x)).sort().map((x) => path.join(dir, x)) : [];
  let pathInfo: Row = {};
  try {
    const fin = pickFinal(unit, journalRows(journals), null);
    const locPart = lib.readJson(fin.loc.part);
    const locSha = lib.sha256File(fin.loc.part);
    const patchList = readPatches(BATCH_DIR, unit).patches as Row[];
    applyPatches(locPart, patchList, locSha);
    const active = patchList.filter((p) => p.status === "active");
    for (const c of changes) {
      const lt = locPart.terms?.[c.term_index as number];
      const patched = lt?.[`hook_${c.lang}`];
      const fieldPatches = active.filter((p) => String(p.field).replace(/\(.*?\)/, "") === `terms[${c.term_index}].hook_${c.lang}`);
      const overlap = (c.edits as Row[]).filter((e) => fieldPatches.some((p) => {
        const s = String(patched).indexOf(String(p.after));
        return s !== -1 && (e._a as number) < s + String(p.after).length && (e._b as number) > s;
      }));
      c.b3 = {
        loc_part: path.relative(ROOT, fin.loc.part),
        base_sha256: locSha,
        loc_term_matches: lt?.term === c.term,
        patched_loc_equals_units: patched === c.before,
        active_patches_on_field: fieldPatches.map((p) => p.id),
        edits_unique: (c.edits as Row[]).every((e) => String(patched).split(String(e.before)).length - 1 === 1),
        edits_overlapping_active_patch: overlap.length,
        route: frozen[unit] ? "frozen: reviewed direct edit of units/ (merge --write refused)" : overlap.length ? "retire + composite re-register (C17 pattern)" : "register (B3 loc-part patch)",
      };
    }
    // in-memory replay with the proposed edits as extra patches → hook / compat fields must equal the end state
    const loc2 = lib.readJson(fin.loc.part);
    const extra = changes.flatMap((c) => (c.edits as Row[]).map((e, k) => ({ id: `L4c${k}`, status: "active", base_sha256: locSha, field: `terms[${c.term_index}](${c.term}).hook_${c.lang}`, before: e.before, after: e.after })));
    let replay = "ok";
    try {
      applyPatches(loc2, [...patchList, ...extra], locSha);
      const asm = lib.assemble(loc2, manifest, kit);
      applyUnitPatches(asm, patchList, v1Sha256(manifest));
      const diff: string[] = [];
      asm.terms.forEach((t: Row, i: number) => {
        for (const k of ["hook_zh", "hook_en", "memory_hook_zh", "memory_hook_en"]) if (t[k] !== mod.terms[i]?.[k]) diff.push(`terms[${i}].${k}`);
      });
      for (const k of ["memory_hooks_zh", "memory_hooks_en"]) if (JSON.stringify(asm.summary?.[k]) !== JSON.stringify(mod.summary?.[k])) diff.push(`summary.${k}`);
      replay = diff.length ? `differs: ${diff.join(", ")}` : "ok";
    } catch (e) {
      replay = `refused: ${(e as Error).message}`;
    }
    pathInfo = { loc_part: path.relative(ROOT, fin.loc.part), journals: journals.map((j) => path.relative(ROOT, j)), replay_with_proposed_patches: replay };
  } catch (e) {
    pathInfo = { error: (e as Error).message, journals: journals.map((j) => path.relative(ROOT, j)) };
    for (const c of changes) c.b3 = { route: frozen[unit] ? "frozen: reviewed direct edit of units/" : `unknown (${(e as Error).message})` };
  }
  for (const c of changes) {
    c.edits = (c.edits as Row[]).map(({ before, after }) => ({ before, after }));
    rows.push(c);
  }
  unitReports.push({ unit, frozen: frozen[unit] ?? null, hooks_changed: changes.filter((c) => (c.labels as unknown[]).length).length, new_validate_issues: afterIssues, zh_term_warnings_before: zhB, zh_term_warnings_new: zhNew, ...pathInfo });
}

const changed = rows.filter((r) => (r.labels as unknown[]).length);
const count = (l: string) => changed.filter((r) => r.lang === l).length;
const summary = {
  hooks_with_labels_zh: count("zh"),
  hooks_with_labels_en: count("en"),
  labels_zh: changed.filter((r) => r.lang === "zh").reduce((n, r) => n + (r.labels as unknown[]).length, 0),
  labels_en: changed.filter((r) => r.lang === "en").reduce((n, r) => n + (r.labels as unknown[]).length, 0),
  units: unitReports.length,
  blocked_by_keyword: rows.filter((r) => ((r.checks as Row).labels_inside_keyword as unknown[]).length).map((r) => `${r.unit} ${r.path}: ${((r.checks as Row).labels_inside_keyword as string[]).join(", ")}`),
  labels_with_simplified_glyph: rows.filter((r) => ((r.checks as Row).labels_with_simplified_glyph as unknown[]).length).map((r) => `${r.unit} ${r.path}: ${((r.checks as Row).labels_with_simplified_glyph as string[]).join(", ")}`),
  check_failures: changed.filter((r) => { const c = r.checks as Row; return !c.strip_equal || (c.inline_errors as unknown[]).length || (c.labels_inside_keyword as unknown[]).length; }).length,
  compat_changes: changed.filter((r) => !(r.checks as Row).compat_equal).length,
  units_with_new_validate_issues: unitReports.filter((u) => (u.new_validate_issues as unknown[]).length).length,
  units_with_new_zh_term_warnings: unitReports.filter((u) => (u.zh_term_warnings_new as unknown[]).length).length,
  replay_not_ok: unitReports.filter((u) => u.replay_with_proposed_patches !== "ok").map((u) => `${u.unit}: ${u.replay_with_proposed_patches ?? u.error}`),
  routes: Object.fromEntries([...new Set(changed.map((r) => String((r.b3 as Row)?.route)))].map((k) => [k, changed.filter((r) => String((r.b3 as Row)?.route) === k).length])),
  residual_zh_without_proposal: residual.length,
  dropped_zh_candidates: Object.fromEntries([...new Set(droppedAll.map((d) => String(d.judgement)))].map((k) => [k, droppedAll.filter((d) => d.judgement === k).length])),
};
console.log(JSON.stringify(summary, null, 1));
if (process.argv.includes("--write") && OUT_FILE)
  writeFileSync(
    OUT_FILE,
    `${JSON.stringify({ schema: "l4c-hooks-1", generated_at: new Date().toISOString(), command: `node scripts/l4-hooks.ts ${process.argv.slice(2).join(" ")}`, read_only: true, decision: "D-221", round1: ROUND1, summary, units: unitReports, hooks: rows, residual_zh: residual, dropped_zh_candidates: droppedAll }, null, 1)}\n`,
  );
