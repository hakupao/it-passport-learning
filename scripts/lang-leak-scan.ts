#!/usr/bin/env node
// Track L steps L2 / L5 (docs/phase5/PLAN_hosting_migration.md §3) — READ-ONLY trilingual leak scan + permanent gate.
// Never edits data, units, sidecars or messages.
//
// Run (Node ≥ 23 native type stripping, no tsx):
//   node --no-warnings scripts/lang-leak-scan.ts --gate
//     → L5 gate: writes nothing. Exit 0 when every gate hit is allow-listed (scripts/fixtures/lang-allow.json) and
//       messages zh / en have exactly the ja key set and no allow entry is stale; exit 1 otherwise, printing the
//       offending hits. WARN rules and punct-only runs never fail. `--allow <file>` replaces the fixture (tests).
//   node scripts/lang-leak-scan.ts [--out-dir evidence/phase5/hosting]
//     → report: <out-dir>/L5_scan.json (every hit) + <out-dir>/L5_scan.md (counts, allowances, examples). The committed
//       L2_scan.{json,md} are the L2 snapshot (schema 1, one hit per field) and are not rewritten.
//
// Sources and how a language field is recognised (the data says jp; reports say ja):
//   textbook-units   data/ip/textbook/units/*.json   X_jp / X_zh / X_en (strings, or string arrays index by index),
//                    {jp, zh, en} labels (figures), an unsuffixed X with X_zh / X_en siblings (term) = ja
//   textbook-index   data/ip/textbook/unit_index.json  same rules (major / major_zh / major_en, title_* …)
//   quiz-index       data/ip/quiz/quiz_index.json      same rules (topics major_* / medium_*; name_jp, exams label_jp = ja only)
//   quiz-questions   data/ip/quiz/questions.json      stem_jp, choices_jp.<ch> (ja only: the IPA source)
//   quiz-translations data/ip/quiz/translations/*.json stem.{zh,en}, choices.<ch>.{zh,en}; ja sibling = the displayed
//                    jp (stem_jp_clean when present, else questions.stem_jp; choices_jp.<ch>), compared only
//   quiz-explanations data/ip/quiz/explanations/*.json {jp, zh, en} objects; key_guard.*.note_jp (ja only)
//   ui-messages      apps/web/messages/{ja,zh,en}.json leaves at the same key path; a key missing in one file = R-empty
// Tags: content | derived (v1 compat fields the merge derives from the new fields; validateV2 checks they equal the
// derivation, and compatText turns [[jp:X]] into （X）, so their kana is the annotation's) | ja-only (no sibling).
// Rules and the gate: scripts/lib/lang-leak.ts.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  detect,
  emptyAllowance,
  gate,
  keySetDiff,
  RULES,
  SIMP_ONLY,
  WARN_RULES,
  type AllowFile,
  type Group,
  type Hit,
  type Lang,
  type Member,
  type RuleId,
  type Tag,
} from "./lib/lang-leak.ts";

export const ROOT = path.resolve(import.meta.dirname, "..");
export const ALLOW_FILE = "scripts/fixtures/lang-allow.json";

const LANG_OF: Record<string, Lang> = { jp: "ja", ja: "ja", zh: "zh", en: "en" };
const SUFFIX = /^(.*)_(jp|ja|zh|en)$/;
const SKIP_KEYS = new Set(["lang_status"]);
/** v1 compat fields (validateV2 "compat": equal to the value derived from the new fields). */
const DERIVED = /(^|\.)(terms\[\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))(\[\])?$/;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const pat = (p: string): string => p.replace(/\[\d+\]/g, "[]").replace(/\.\d{4}[a-z0-9]+-q\d+/g, ".<qid>").replace(/\.[アイウエ](?=\.|$)/g, ".<ch>");
const join = (at: string, k: string): string => (at ? `${at}.${k}` : k);
const readJson = (f: string): any => JSON.parse(readFileSync(path.join(ROOT, f), "utf-8"));
export const MESSAGE_FILES: Record<Lang, string> = { ja: "apps/web/messages/ja.json", zh: "apps/web/messages/zh.json", en: "apps/web/messages/en.json" };

/** Every language group of the corpus, and the string leaves outside any group ("not scanned", by pattern). */
export function collect(): { groups: Group[]; unscanned: Map<string, number> } {
  const groups: Group[] = [];
  const unscanned = new Map<string, number>();

  function addGroup(source: string, file: string, base: string, tag: Tag | null, members: Partial<Record<Lang, Member>>): void {
    const p = pat(base);
    const only = Object.keys(members).length === 1 && members.ja;
    const t: Tag = tag ?? (DERIVED.test(p) ? "derived" : only ? "ja-only" : "content");
    groups.push({ source, file, pattern: p, tag: t, members });
  }

  /** Generic walk: suffixed keys, {jp,zh,en} objects, unsuffixed X with X_zh / X_en siblings. */
  function walk(source: string, file: string, v: unknown, at: string): void {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(source, file, x, `${at}[${i}]`));
    if (!isObj(v)) {
      if (typeof v === "string") unscanned.set(`${source} ${pat(at)}`, (unscanned.get(`${source} ${pat(at)}`) ?? 0) + 1);
      return;
    }
    const used = new Set<string>();
    // {jp, zh, en} object
    const labelKeys = Object.keys(v).filter((k) => LANG_OF[k] && (typeof v[k] === "string" || v[k] === undefined));
    if (labelKeys.some((k) => LANG_OF[k] !== "ja") || (labelKeys.length > 0 && ("zh" in v || "en" in v))) {
      const m: Partial<Record<Lang, Member>> = {};
      for (const k of labelKeys) {
        m[LANG_OF[k]] = { path: join(at, k), value: v[k], scan: true };
        used.add(k);
      }
      if (Object.keys(m).length >= 2) for (const l of ["ja", "zh", "en"] as Lang[]) m[l] ??= { path: join(at, l === "ja" ? "jp" : l), value: undefined, scan: true };
      addGroup(source, file, at, null, m);
    }
    // suffixed keys
    const bases = new Map<string, Partial<Record<Lang, string>>>();
    for (const k of Object.keys(v)) {
      const s = SUFFIX.exec(k);
      if (!s || SKIP_KEYS.has(k)) continue;
      const b = bases.get(s[1]) ?? {};
      b[LANG_OF[s[2]]] = k;
      bases.set(s[1], b);
    }
    for (const [b, keys] of bases) {
      if (!keys.ja && (keys.zh || keys.en) && b in v) keys.ja = b; // unsuffixed X = ja
      // two languages present, the third key absent → keep it as a member (R-empty "missing")
      if (Object.keys(keys).length === 2) for (const l of ["ja", "zh", "en"] as Lang[]) keys[l] ??= `${b}_${l === "ja" ? "jp" : l}`;
      const vals = Object.values(keys) as string[];
      if (vals.some((k) => isObj(v[k]))) continue; // not text: walk it as structure
      vals.forEach((k) => used.add(k));
      const arr = vals.some((k) => Array.isArray(v[k]));
      if (!arr) {
        const m: Partial<Record<Lang, Member>> = {};
        for (const [l, k] of Object.entries(keys) as [Lang, string][]) m[l] = { path: join(at, k), value: v[k], scan: true };
        addGroup(source, file, join(at, b), null, m);
      } else {
        const n = Math.max(...vals.map((k) => (Array.isArray(v[k]) ? (v[k] as unknown[]).length : 0)));
        for (let i = 0; i < n; i++) {
          const m: Partial<Record<Lang, Member>> = {};
          for (const [l, k] of Object.entries(keys) as [Lang, string][]) {
            const a = v[k];
            m[l] = { path: `${join(at, k)}[${i}]`, value: Array.isArray(a) ? a[i] : undefined, scan: true };
          }
          addGroup(source, file, `${join(at, b)}[${i}]`, null, m);
        }
      }
    }
    for (const [k, x] of Object.entries(v)) if (!used.has(k) && !SKIP_KEYS.has(k)) walk(source, file, x, join(at, k));
  }

  const UNITS_DIR = "data/ip/textbook/units";
  const unitFiles = readdirSync(path.join(ROOT, UNITS_DIR)).filter((f) => f.endsWith(".json")).sort();
  for (const f of unitFiles) walk("textbook-units", `${UNITS_DIR}/${f}`, readJson(`${UNITS_DIR}/${f}`), "");
  walk("textbook-index", "data/ip/textbook/unit_index.json", readJson("data/ip/textbook/unit_index.json"), "");
  // quiz_index topics major_* / medium_* are rendered by the browse page (L5 review L-2); name_jp / label_jp are ja-only
  walk("quiz-index", "data/ip/quiz/quiz_index.json", readJson("data/ip/quiz/quiz_index.json"), "");

  const QFILE = "data/ip/quiz/questions.json";
  const questions = new Map<string, any>();
  (readJson(QFILE).questions as any[]).forEach((q, i) => {
    questions.set(q.id, q);
    addGroup("quiz-questions", QFILE, `questions[${i}].source_label`, "ja-only", { ja: { path: `questions[${i}](${q.id}).source_label`, value: q.source_label, scan: true } });
    addGroup("quiz-questions", QFILE, `questions[${i}].stem_jp`, "ja-only", { ja: { path: `questions[${i}](${q.id}).stem_jp`, value: q.stem_jp, scan: true } });
    for (const [c, s] of Object.entries(q.choices_jp ?? {}))
      addGroup("quiz-questions", QFILE, `questions[${i}].choices_jp.${c}`, "ja-only", { ja: { path: `questions[${i}](${q.id}).choices_jp.${c}`, value: s, scan: true } });
  });

  const TR_DIR = "data/ip/quiz/translations";
  for (const f of readdirSync(path.join(ROOT, TR_DIR)).filter((x) => x.endsWith(".json")).sort()) {
    const file = `${TR_DIR}/${f}`;
    const tr = readJson(file);
    for (const [qid, e] of Object.entries(tr.questions as Record<string, any>)) {
      const q = questions.get(qid);
      const at = `questions.${qid}`;
      const clean = typeof e.stem_jp_clean === "string";
      const ja: Member = clean
        ? { path: `${at}.stem_jp_clean`, value: e.stem_jp_clean, scan: true }
        : { path: `${QFILE}#${qid}.stem_jp`, value: q?.stem_jp, scan: false };
      addGroup("quiz-translations", file, `${at}.stem`, "content", { ja, zh: { path: `${at}.stem.zh`, value: e.stem?.zh, scan: true }, en: { path: `${at}.stem.en`, value: e.stem?.en, scan: true } });
      for (const [c, x] of Object.entries((e.choices ?? {}) as Record<string, any>))
        addGroup("quiz-translations", file, `${at}.choices.${c}`, "content", {
          ja: { path: `${QFILE}#${qid}.choices_jp.${c}`, value: q?.choices_jp?.[c], scan: false },
          zh: { path: `${at}.choices.${c}.zh`, value: x?.zh, scan: true },
          en: { path: `${at}.choices.${c}.en`, value: x?.en, scan: true },
        });
    }
  }

  const EX_DIR = "data/ip/quiz/explanations";
  for (const f of readdirSync(path.join(ROOT, EX_DIR)).filter((x) => x.endsWith(".json")).sort()) {
    const file = `${EX_DIR}/${f}`;
    walk("quiz-explanations", file, readJson(file).questions, "questions");
  }

  const MSG = readMessages();
  {
    const leaves = new Map<string, Partial<Record<Lang, unknown>>>();
    const flat = (l: Lang, v: unknown, at: string): void => {
      if (isObj(v)) for (const [k, x] of Object.entries(v)) flat(l, x, join(at, k));
      else if (Array.isArray(v)) v.forEach((x, i) => flat(l, x, `${at}[${i}]`));
      else {
        const e = leaves.get(at) ?? {};
        e[l] = v;
        leaves.set(at, e);
      }
    };
    for (const l of ["ja", "zh", "en"] as Lang[]) flat(l, MSG[l], "");
    for (const [k, e] of leaves) {
      const m: Partial<Record<Lang, Member>> = {};
      for (const l of ["ja", "zh", "en"] as Lang[]) m[l] = { path: k, value: e[l], scan: true, file: MESSAGE_FILES[l] };
      addGroup("ui-messages", "apps/web/messages/{ja,zh,en}.json", k, "content", m);
    }
  }
  return { groups, unscanned };
}

export const readMessages = (): Record<Lang, unknown> => ({ ja: readJson(MESSAGE_FILES.ja), zh: readJson(MESSAGE_FILES.zh), en: readJson(MESSAGE_FILES.en) });

/**
 * Derived-field guard (scope exclusion "derived" is not blind): every character of a derived run must also occur, in
 * the same file and language, inside a [[jp:…]] annotation or a run of a content field. A derived field cannot then
 * carry Japanese that its gated source field does not.
 */
export function derivedGuard(groups: Group[], hits: Hit[]): Hit[] {
  const seen = new Map<string, Set<string>>(); // file|lang → chars
  const add = (k: string, s: string) => {
    const set = seen.get(k) ?? new Set<string>();
    for (const c of s) set.add(c);
    seen.set(k, set);
  };
  for (const g of groups) {
    if (g.tag !== "content") continue;
    for (const [l, m] of Object.entries(g.members) as [Lang, Member][]) {
      if (typeof m.value !== "string" || !m.value.includes("[[jp:")) continue;
      for (const x of m.value.matchAll(/\[\[jp:([\s\S]+?)\]\]/g)) add(`${m.file ?? g.file}|${l}`, x[1]);
    }
  }
  for (const h of hits) if (h.tag === "content") add(`${h.file}|${h.lang}`, h.text);
  return hits.filter((h) => h.tag === "derived" && !WARN_RULES.has(h.rule) && h.subtag !== "punct-only" && ![...h.text].every((c) => seen.get(`${h.file}|${h.lang}`)?.has(c)));
}

function runGate(allowPath: string): number {
  const { groups } = collect();
  const { hits, allowance } = detect(groups);
  const allow = JSON.parse(readFileSync(path.resolve(ROOT, allowPath), "utf-8")) as AllowFile;
  const res = gate(hits, allow);
  const derivedBad = derivedGuard(groups, hits);
  const keys = keySetDiff(readMessages());
  const keyBad = keys.some((k) => k.missing.length || k.extra.length);

  const show = (h: Hit) => `  ${h.rule}  ${h.file}  ${h.path}  [${h.lang}]  «${h.text.replace(/\n/g, "⏎").slice(0, 60)}»  ${h.excerpt}`;
  console.log(`lang-leak gate (${path.relative(ROOT, path.resolve(ROOT, allowPath))}, ${allow.entries.length} entries): groups ${groups.length}, hits ${hits.length}`);
  console.log(`  allowed ${res.allowed} · scope-excluded ${[...res.excluded].map(([k, n]) => `${k}=${n}`).join(" ")} · punct-only ${res.punct.length} · warn ${res.warn.length} (${[...WARN_RULES].map((r) => `${r}=${res.warn.filter((h) => h.rule === r).length}`).join(" ")})`);
  // what the rules themselves let through (not allow-list entries): [[jp:…]], lone choice labels ア〜エ, quiz brackets (jpform)
  const tot = { annotChars: 0, annotFields: 0, choiceLabels: 0, bracketChars: 0 };
  for (const a of allowance.values()) for (const k of Object.keys(tot) as (keyof typeof tot)[]) tot[k] += a[k];
  console.log(`  rule allowances (summed over rules): [[jp:]] chars ${tot.annotChars} in ${tot.annotFields} fields · choice labels ${tot.choiceLabels} · quiz-bracket jpform chars ${tot.bracketChars}`);
  if (res.stale.length) {
    console.log(`  FAIL stale allow entries (fewer occurrences than count — a fixed leak must not stay allowed at its path): ${res.stale.length}`);
    for (const s of res.stale.slice(0, 20)) console.log(`    ${s.entry.rule} ${s.entry.file} ${s.entry.path} «${s.entry.text}» count ${s.entry.count}, found ${s.found}`);
    console.log("  refresh: node --no-warnings scripts/l5-build-allowlist.ts --write   (drops / lowers the stale entries; read the - lines)");
  }
  for (const k of keys) console.log(`  messages key set ${k.lang} vs ja: missing ${k.missing.length}, extra ${k.extra.length}${k.missing.length || k.extra.length ? `  ${[...k.missing.map((x) => `-${x}`), ...k.extra.map((x) => `+${x}`)].slice(0, 20).join(" ")}` : ""}`);
  if (derivedBad.length) {
    console.log(`  FAIL derived fields with Japanese not present in their unit's content / [[jp:]]: ${derivedBad.length}`);
    for (const h of derivedBad.slice(0, 50)) console.log(show(h));
  }
  if (res.failures.length) {
    const byRule = RULES.map((r) => `${r}=${res.failures.filter((h) => h.rule === r).length}`).filter((x) => !x.endsWith("=0"));
    console.log(`  FAIL not allow-listed: ${res.failures.length} (${byRule.join(" ")})`);
    for (const h of res.failures) console.log(show(h));
  }
  const ok = !res.failures.length && !derivedBad.length && !keyBad && !res.stale.length;
  console.log(ok ? "lang-leak gate: PASS" : "lang-leak gate: FAIL");
  return ok ? 0 : 1;
}

// ---- report (the L2 layout, extended with the L5 rules) --------------------------------------------------------

function runReport(outDir: string): void {
  const { groups, unscanned } = collect();
  const { hits, allowance, excludedSame, fieldsScanned } = detect(groups);
  const SOURCES = ["textbook-units", "textbook-index", "quiz-index", "quiz-questions", "quiz-translations", "quiz-explanations", "ui-messages"];
  const TAGS: Tag[] = ["content", "derived", "ja-only"];
  const count = (f: (h: Hit) => boolean) => hits.filter(f).length;
  const inc = (m: Map<string, number>, k: string, n = 1) => m.set(k, (m.get(k) ?? 0) + n);

  const totals: Record<string, Record<string, Record<string, number>>> = {};
  for (const r of RULES) {
    totals[r] = {};
    for (const s of SOURCES) {
      totals[r][s] = {};
      for (const t of TAGS) totals[r][s][t] = count((h) => h.rule === r && h.source === s && h.tag === t);
    }
  }
  const subtags: Record<string, number> = {};
  for (const h of hits) if (h.subtag) subtags[`${h.rule} ${h.subtag}`] = (subtags[`${h.rule} ${h.subtag}`] ?? 0) + 1;

  mkdirSync(outDir, { recursive: true });
  const json = {
    schema: "lang-leak-scan-2",
    generated_at: new Date().toISOString(),
    command: "node scripts/lang-leak-scan.ts",
    read_only: true,
    unit: "one hit = one run of offending characters / one word occurrence / one field (R-same, R-empty)",
    simp_only_chars: SIMP_ONLY.join(""),
    fields_scanned: Object.fromEntries(fieldsScanned),
    totals,
    subtags,
    allowance: Object.fromEntries(allowance),
    r_same_excluded_no_cjk: Object.fromEntries(excludedSame),
    hit_count: hits.length,
    hits,
  };
  writeFileSync(path.join(outDir, "L5_scan.json"), `${JSON.stringify(json, null, 1)}\n`);

  const md: string[] = [];
  const row = (cells: (string | number)[]) => md.push(`| ${cells.join(" | ")} |`);
  md.push("# 三言語混入走査 (読み取り専用)", "");
  md.push(`- 生成: \`node scripts/lang-leak-scan.ts\` (${json.generated_at})、全件 = \`L5_scan.json\` (${hits.length} 件、1 件 = 1 連 / 1 語 / 1 欄)`);
  md.push("- 規則と除外の定義 = `scripts/lib/lang-leak.ts`、対象と欄の認識方法 = `scripts/lang-leak-scan.ts` 冒頭、関門 = `--gate`", "");
  md.push("## 件数 (規則 × 対象、content / derived / ja-only)", "");
  row(["rule", ...SOURCES]);
  row(["---", ...SOURCES.map(() => "---")]);
  for (const r of RULES) row([r + (WARN_RULES.has(r) ? " (WARN)" : ""), ...SOURCES.map((s) => TAGS.map((t) => totals[r][s][t]).join(" / "))]);
  md.push("", "### 副分類", "");
  row(["rule subtag", "件数"]);
  row(["---", "---"]);
  for (const [k, n] of Object.entries(subtags).sort()) row([k, n]);
  md.push("", "punct-only = 連の字が ・ (U+30FB) / ー (U+30FC) だけ。missing = その言語のキー自体が無い、blank = 空文字・空白のみ。", "");

  md.push("## パターン別の上位 (content、punct-only を除く、規則ごとに 8 件)", "");
  row(["rule", "対象", "パターン", "lang", "件数"]);
  row(["---", "---", "---", "---", "---"]);
  for (const r of RULES) {
    const m = new Map<string, number>();
    for (const h of hits) if (h.rule === r && h.tag === "content" && h.subtag !== "punct-only") inc(m, `${h.source}\t${h.pattern}\t${h.lang}`);
    for (const [k, n] of [...m].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
      const [s, p, l] = k.split("\t");
      row([r, s, `\`${p}\``, l, n]);
    }
  }

  md.push("", "## 走査した欄の数", "");
  row(["対象", "言語", "tag", "欄数"]);
  row(["---", "---", "---", "---"]);
  for (const [k, n] of [...fieldsScanned].sort()) row([...k.split("|"), n]);

  md.push("", "## 除外 (許容) の大きさ", "");
  row(["対象", "規則", "[[jp:…]] 内でその規則の字種に当たる字数", "その字を含む欄", "単独の選択肢記号 ア〜エ (個数)", "quiz の括弧内 (jpform)"]);
  row(["---", "---", "---", "---", "---", "---"]);
  for (const s of SOURCES)
    for (const r of ["R-zh-kana", "R-en-cjk", "R-zh-jpform"] as RuleId[]) {
      const a = allowance.get(`${s}|${r}`) ?? emptyAllowance();
      row([s, r, a.annotChars, a.annotFields, a.choiceLabels, a.bracketChars]);
    }
  md.push("", "R-same の除外 (ja が同一だが仮名・漢字を含まない = コード・数字・URL・ASCII のみ): " + SOURCES.map((s) => `${s} ${excludedSame.get(s) ?? 0}`).join("、"), "");

  md.push("## 例 (規則ごとに最大 10 件、content 優先・punct-only は後回し・対象を巡回)", "");
  for (const r of RULES) {
    md.push(`### ${r}${WARN_RULES.has(r) ? " (WARN)" : ""}`, "");
    const rank = (h: Hit) => TAGS.indexOf(h.tag) * 2 + (h.subtag === "punct-only" ? 1 : 0);
    const pool = hits.filter((h) => h.rule === r).sort((a, b) => rank(a) - rank(b));
    const bySrc = SOURCES.map((s) => pool.filter((h) => h.source === s && h.tag === "content"));
    const pick: Hit[] = [];
    for (let i = 0; pick.length < 10 && bySrc.some((l) => l.length > i); i++) for (const l of bySrc) if (l[i] && pick.length < 10) pick.push(l[i]);
    for (const h of pool) if (pick.length < 10 && !pick.includes(h)) pick.push(h);
    if (pick.length === 0) md.push("(0 件)", "");
    else {
      row(["file", "path", "lang", "tag", "text", "excerpt"]);
      row(["---", "---", "---", "---", "---", "---"]);
      for (const h of pick) row([h.file, `\`${h.path}\``, h.lang, h.tag + (h.subtag ? ` ${h.subtag}` : ""), h.text.replace(/\|/g, "\\|").replace(/\n/g, "⏎").slice(0, 40), h.excerpt.replace(/\|/g, "\\|")]);
      md.push("");
    }
  }

  md.push("## 走査しなかった文字列欄 (言語の印が無い、パターン別)", "");
  row(["対象 パターン", "件数"]);
  row(["---", "---"]);
  for (const [k, n] of [...unscanned].sort((a, b) => b[1] - a[1])) row([`\`${k}\``, n]);
  md.push("");
  writeFileSync(path.join(outDir, "L5_scan.md"), `${md.join("\n")}\n`);

  console.log(`groups ${groups.length}, hits ${hits.length} → ${path.relative(ROOT, outDir)}/L5_scan.{json,md}`);
  for (const r of RULES) console.log(r.padEnd(16), SOURCES.map((s) => `${s}=${TAGS.map((t) => totals[r][s][t]).join("/")}`).join("  "));
}

if (import.meta.filename === path.resolve(process.argv[1] ?? "")) {
  const arg = (k: string): string | undefined => {
    const i = process.argv.indexOf(k);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  if (process.argv.includes("--gate")) process.exit(runGate(arg("--allow") ?? ALLOW_FILE));
  runReport(path.resolve(ROOT, arg("--out-dir") ?? "evidence/phase5/hosting"));
}
