#!/usr/bin/env node
// Track L step L2 (docs/phase5/PLAN_hosting_migration.md §3) — READ-ONLY trilingual leak scan.
// Writes nothing but its two reports; never edits data, units, sidecars or messages.
//
// Run (Node ≥ 23 native type stripping, no tsx):
//   node scripts/lang-leak-scan.ts [--out-dir evidence/phase5/hosting]
//   → <out-dir>/L2_scan.json (every hit) + <out-dir>/L2_scan.md (counts, allowances, examples, limits)
//
// Sources and how a language field is recognised (the data says jp; reports say ja):
//   textbook-units   data/ip/textbook/units/*.json   X_jp / X_zh / X_en (strings, or string arrays index by index),
//                    {jp, zh, en} labels (figures), an unsuffixed X with X_zh / X_en siblings (term) = ja
//   textbook-index   data/ip/textbook/unit_index.json  same rules (major / major_zh / major_en, title_* …)
//   quiz-questions   data/ip/quiz/questions.json      stem_jp, choices_jp.<ch> (ja only: the IPA source)
//   quiz-translations data/ip/quiz/translations/*.json stem.{zh,en}, choices.<ch>.{zh,en}; ja sibling = the displayed
//                    jp (stem_jp_clean when present, else questions.stem_jp; choices_jp.<ch>), compared only
//   quiz-explanations data/ip/quiz/explanations/*.json {jp, zh, en} objects; key_guard.*.note_jp (ja only)
//   ui-messages      apps/web/messages/{ja,zh,en}.json leaves at the same key path; a key missing in one file = R-empty
// Tags: content | derived (v1 compat fields the merge derives from the new fields; validateV2 checks they equal the
// derivation, and compatText turns [[jp:X]] into （X）, so their kana is the annotation's) | ja-only (no sibling).
// Rules: scripts/lib/lang-leak.ts.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  emptyAllowance,
  enCjk,
  excerpt,
  isBlank,
  jaLatinRun,
  jaSimp,
  sameAsJa,
  SIMP_ONLY,
  zhKana,
  type Allowance,
  type CharHit,
  type Lang,
  type RuleId,
} from "./lib/lang-leak.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const argOut = process.argv.indexOf("--out-dir");
const OUT_DIR = path.resolve(ROOT, argOut > 0 ? process.argv[argOut + 1] : "evidence/phase5/hosting");

type Tag = "content" | "derived" | "ja-only";
type Member = { path: string; value: unknown; scan: boolean; file?: string };
type Group = { source: string; file: string; pattern: string; tag: Tag; members: Partial<Record<Lang, Member>> };
type Hit = {
  source: string;
  file: string;
  path: string;
  pattern: string;
  lang: Lang;
  rule: RuleId;
  tag: Tag;
  subtag?: string;
  confidence: "normal" | "low";
  chars: string[];
  excerpt: string;
};

const LANG_OF: Record<string, Lang> = { jp: "ja", ja: "ja", zh: "zh", en: "en" };
const SUFFIX = /^(.*)_(jp|ja|zh|en)$/;
const SKIP_KEYS = new Set(["lang_status"]);
/** v1 compat fields (validateV2 "compat": equal to the value derived from the new fields). */
const DERIVED = /(^|\.)(terms\[\]\.(definition|explanation|memory_hook)|overview\.intro|summary\.(key_points|memory_hooks))(\[\])?$/;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const pat = (p: string): string => p.replace(/\[\d+\]/g, "[]").replace(/\.\d{4}[a-z0-9]+-q\d+/g, ".<qid>").replace(/\.[アイウエ](?=\.|$)/g, ".<ch>");
const join = (at: string, k: string): string => (at ? `${at}.${k}` : k);
const readJson = (f: string): any => JSON.parse(readFileSync(path.join(ROOT, f), "utf-8"));

const groups: Group[] = [];
/** String leaves that are not in any language group (reported as "not scanned", by pattern). */
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

// ---- collect ----------------------------------------------------------------------

const UNITS_DIR = "data/ip/textbook/units";
const unitFiles = readdirSync(path.join(ROOT, UNITS_DIR)).filter((f) => f.endsWith(".json")).sort();
for (const f of unitFiles) walk("textbook-units", `${UNITS_DIR}/${f}`, readJson(`${UNITS_DIR}/${f}`), "");
walk("textbook-index", "data/ip/textbook/unit_index.json", readJson("data/ip/textbook/unit_index.json"), "");

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

const MSG: Record<Lang, any> = { ja: readJson("apps/web/messages/ja.json"), zh: readJson("apps/web/messages/zh.json"), en: readJson("apps/web/messages/en.json") };
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
    for (const l of ["ja", "zh", "en"] as Lang[]) m[l] = { path: k, value: e[l], scan: true, file: `apps/web/messages/${l}.json` };
    addGroup("ui-messages", "apps/web/messages/{ja,zh,en}.json", k, "content", m);
  }
}

// ---- detect -----------------------------------------------------------------------

const hits: Hit[] = [];
const allowance = new Map<string, Allowance>(); // "<source>|<rule>"
const allowFor = (source: string, rule: RuleId): Allowance => {
  const k = `${source}|${rule}`;
  if (!allowance.has(k)) allowance.set(k, emptyAllowance());
  return allowance.get(k) as Allowance;
};
const excludedSame = new Map<string, number>();
const fieldsScanned = new Map<string, number>();
const inc = (m: Map<string, number>, k: string, n = 1) => m.set(k, (m.get(k) ?? 0) + n);

for (const g of groups) {
  const push = (lang: Lang, mem: Member, rule: RuleId, h: CharHit | null, extra: Partial<Hit> = {}, text = String(mem.value ?? "")) =>
    hits.push({
      source: g.source,
      file: mem.file ?? g.file,
      path: mem.path,
      pattern: g.pattern,
      lang,
      rule,
      tag: g.tag,
      confidence: rule === "R-ja-latin-run" ? "low" : "normal",
      chars: h?.chars ?? [],
      excerpt: excerpt(text, h?.index ?? 0),
      ...(h?.subtag ? { subtag: h.subtag } : {}),
      ...extra,
    });
  for (const [lang, mem] of Object.entries(g.members) as [Lang, Member][]) {
    if (!mem.scan || typeof mem.value !== "string") continue;
    inc(fieldsScanned, `${g.source}|${lang}|${g.tag}`);
    const s = mem.value;
    if (lang === "zh") {
      const h = zhKana(s, allowFor(g.source, "R-zh-kana"));
      if (h) push(lang, mem, "R-zh-kana", h);
    } else if (lang === "en") {
      const h = enCjk(s, allowFor(g.source, "R-en-cjk"));
      if (h) push(lang, mem, "R-en-cjk", h);
    } else {
      const h = jaSimp(s);
      if (h) push(lang, mem, "R-ja-simp", h);
      const r = jaLatinRun(s);
      if (r) push(lang, mem, "R-ja-latin-run", r);
    }
  }
  const present = (Object.entries(g.members) as [Lang, Member][]).filter(([, m]) => !isBlank(m.value));
  if (Object.keys(g.members).length > 1 && present.length > 0) {
    for (const [lang, mem] of Object.entries(g.members) as [Lang, Member][]) {
      if (!isBlank(mem.value)) continue;
      const [sl, sm] = present[0];
      push(lang, mem, "R-empty", null, { subtag: mem.value === undefined ? "missing" : "blank", excerpt: `${sl}: ${excerpt(String(sm.value), 0)}` }, "");
    }
  }
  const ja = g.members.ja;
  if (ja && typeof ja.value === "string") {
    for (const l of ["zh", "en"] as Lang[]) {
      const o = g.members[l];
      if (!o || typeof o.value !== "string") continue;
      const r = sameAsJa(ja.value, o.value);
      if (r === "hit") push(l, o, "R-same", null, {}, o.value);
      else if (r === "excluded") inc(excludedSame, g.source);
    }
  }
}

// ---- report -----------------------------------------------------------------------

const RULES: RuleId[] = ["R-zh-kana", "R-en-cjk", "R-ja-simp", "R-ja-latin-run", "R-empty", "R-same"];
const SOURCES = ["textbook-units", "textbook-index", "quiz-questions", "quiz-translations", "quiz-explanations", "ui-messages"];
const TAGS: Tag[] = ["content", "derived", "ja-only"];
const count = (f: (h: Hit) => boolean) => hits.filter(f).length;

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

mkdirSync(OUT_DIR, { recursive: true });
const json = {
  schema: "lang-leak-scan-1",
  generated_at: new Date().toISOString(),
  command: "node scripts/lang-leak-scan.ts",
  read_only: true,
  simp_only_chars: SIMP_ONLY.join(""),
  fields_scanned: Object.fromEntries(fieldsScanned),
  totals,
  subtags,
  allowance: Object.fromEntries(allowance),
  r_same_excluded_no_cjk: Object.fromEntries(excludedSame),
  hit_count: hits.length,
  hits,
};
writeFileSync(path.join(OUT_DIR, "L2_scan.json"), `${JSON.stringify(json, null, 1)}\n`);

const md: string[] = [];
const row = (cells: (string | number)[]) => md.push(`| ${cells.join(" | ")} |`);
md.push("# L2 三言語混入走査 (読み取り専用)", "");
md.push(`- 生成: \`node scripts/lang-leak-scan.ts\` (${json.generated_at})、全件 = \`L2_scan.json\` (${hits.length} 件)`);
md.push("- 規則と除外の定義 = `scripts/lib/lang-leak.ts`、対象と欄の認識方法 = `scripts/lang-leak-scan.ts` 冒頭", "");
md.push("## 件数 (規則 × 対象、content / derived / ja-only)", "");
md.push(
  "- content = derived でも ja-only でもない言語欄 (表示されるかどうかは本走査では確かめていない)。",
  "- derived = v1 互換欄 (terms[].definition / explanation / memory_hook、overview.intro、summary.key_points / memory_hooks)。merge が新欄から `compatText` で派生し、validateV2 の `compat` が派生値との一致を検査する。`compatText` は `[[jp:X]]` を「（X）」/「 (X)」に展開するので、注記の中の日本語が印なしで残り、ここに当たる。glossary / TodayTerms がこの欄を表示する (S154 C17 の記録)。",
  "- ja-only = 兄弟言語の無い欄 (questions.json の IPA 原文 stem_jp / choices_jp / source_label、unit_index の rationale_jp 等、解説の key_guard.note_jp)。`key_guard.note_jp` は web が読まない (`apps/web/src/lib/quiz/quizModel.ts` が使うのは key_guard.suspect だけ)。",
  "",
);
row(["rule", ...SOURCES]);
row(["---", ...SOURCES.map(() => "---")]);
for (const r of RULES) row([r, ...SOURCES.map((s) => TAGS.map((t) => totals[r][s][t]).join(" / "))]);
md.push("", "### 副分類", "");
row(["rule subtag", "件数"]);
row(["---", "---"]);
for (const [k, n] of Object.entries(subtags).sort()) row([k, n]);
md.push("", "punct-only = 当たりの字が ・ (U+30FB) / ー (U+30FC) だけ。missing = その言語のキー自体が無い、blank = 空文字・空白のみ。", "");

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
row(["対象", "規則", "[[jp:…]] 内でその規則の字種に当たる字数", "その字を含む欄", "単独の選択肢記号 ア〜エ (個数)"]);
row(["---", "---", "---", "---", "---"]);
for (const s of SOURCES)
  for (const r of ["R-zh-kana", "R-en-cjk"] as RuleId[]) {
    const a = allowance.get(`${s}|${r}`) ?? emptyAllowance();
    row([s, r, a.annotChars, a.annotFields, a.choiceLabels]);
  }
md.push("", "R-same の除外 (ja が同一だが仮名・漢字を含まない = コード・数字・URL・ASCII のみ): " + SOURCES.map((s) => `${s} ${excludedSame.get(s) ?? 0}`).join("、"), "");
md.push(
  "",
  "- `[[jp:…]]` の中は R-zh-kana (仮名) / R-en-cjk (漢字・仮名) の対象外。ー もこの中に限り対象外。字数は規則ごとに、その規則の字種で数えた。",
  "- **指示書からの拡張**: 前後に (・ 以外の) 仮名の無い ア / イ / ウ / エ (「选项ウ」「Choice ウ」「ア・ウ」) は選択肢記号として対象外にし、個数だけ数えた。quiz の sidecar には `[[jp:` が 1 件も無いため、この除外が無いと解説の zh / en がほぼ全件当たる。**過剰な許容**: 選択肢の引用でない単独の ア〜エ も通る (例: 2011h23a-q073 の LIKE パターン \"%イ%ン_\" の イ。この欄は ン で当たっている)。",
  "- R-same は ja 側に仮名・漢字が無い文字列 (コード・数字・URL・ASCII のみ) を対象外とし、件数だけ数えた。",
  "",
);

md.push("## 例 (規則ごとに最大 10 件、content 優先・punct-only は後回し・対象を巡回)", "");
for (const r of RULES) {
  md.push(`### ${r}${r === "R-ja-latin-run" ? " (低信頼)" : ""}`, "");
  const rank = (h: Hit) => TAGS.indexOf(h.tag) * 2 + (h.subtag === "punct-only" ? 1 : 0);
  const pool = hits.filter((h) => h.rule === r).sort((a, b) => rank(a) - rank(b));
  const bySrc = SOURCES.map((s) => pool.filter((h) => h.source === s && h.tag === "content"));
  const pick: Hit[] = [];
  for (let i = 0; pick.length < 10 && bySrc.some((l) => l.length > i); i++) for (const l of bySrc) if (l[i] && pick.length < 10) pick.push(l[i]);
  for (const h of pool) if (pick.length < 10 && !pick.includes(h)) pick.push(h);
  if (pick.length === 0) md.push("(0 件)", "");
  else {
    row(["file", "path", "lang", "tag", "chars", "excerpt"]);
    row(["---", "---", "---", "---", "---", "---"]);
    for (const h of pick) row([h.file, `\`${h.path}\``, h.lang, h.tag + (h.subtag ? ` ${h.subtag}` : ""), h.chars.join("").replace(/\|/g, "\\|").slice(0, 40), h.excerpt.replace(/\|/g, "\\|")]);
    md.push("");
  }
}

md.push("## 走査しなかった文字列欄 (言語の印が無い、パターン別)", "");
row(["対象 パターン", "件数"]);
row(["---", "---"]);
for (const [k, n] of [...unscanned].sort((a, b) => b[1] - a[1])) row([`\`${k}\``, n]);
md.push(
  "",
  "- `lang_status.{jp,zh,en}` は状態値であり本文ではないので対象外。",
  "- quiz-questions と quiz-translations は欄を明示して走査したので、この表に出ない。走査しなかった欄: questions.json の id / exam_id / topic_id / category / correct_answer / figure / figure_type / terms[] / choice_figures、sidecar 最上位の schema_version / exam_id / source_note。",
  "",
);

md.push(
  "## 限界",
  "",
  "- 文字種の規則は、zh 欄に漢字だけで書かれた日本語の文、ja 欄に簡体字表に無い字だけで書かれた中国語の文を見分けられない (ja と zh が共に漢字だけの文)。この穴は本走査ではなく **L3 の無作為抽出の通読** (当たり以外から 60 欄、各言語 20) が受け持つ。",
  "- R-ja-simp の表は保守的 (Shift_JIS 外かつ IPA 原文に出ない字のみ)。表に無い簡体字 (例: 个・么・吗 など) を含む中国語は見えない。",
  "- R-ja-latin-run は英単語 6 語以上の連なり。疑似言語・英文の固有名・規格名でも当たる (低信頼)。",
  "- 当たりは混入の候補であり、内容が誤りだとは言っていない。分類 (本当の混入 / 正当な混在) は L3。",
  "",
);
writeFileSync(path.join(OUT_DIR, "L2_scan.md"), `${md.join("\n")}\n`);

console.log(`groups ${groups.length}, hits ${hits.length} → ${path.relative(ROOT, OUT_DIR)}/L2_scan.{json,md}`);
for (const r of RULES) console.log(r.padEnd(16), SOURCES.map((s) => `${s}=${TAGS.map((t) => totals[r][s][t]).join("/")}`).join("  "));
console.log("allowance", JSON.stringify(Object.fromEntries(allowance)));
