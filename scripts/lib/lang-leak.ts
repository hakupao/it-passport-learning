// Track L (PLAN_hosting_migration §3 L2 / L5) — pure detectors and the allow-list gate for the trilingual leak scan.
// Imported by scripts/lang-leak-scan.ts (fs side), scripts/l5-build-allowlist.ts and scripts/lang-leak-scan.test.ts.
// Pure: no fs, relative imports with the `.ts` extension, `import type` only, no enums (Node native type
// stripping, the same constraints as apps/web/src/lib/textbook/validateV2.ts).
//
// Character-class rules plus a word list: a Japanese sentence written in a zh field with kanji that are also
// Chinese (or the reverse) is invisible unless one of its words is in JP_WORDS — that gap belongs to sampled reads.

export type Lang = "ja" | "zh" | "en";
export type RuleId =
  | "R-zh-kana"
  | "R-en-cjk"
  | "R-ja-simp"
  | "R-ja-latin-run"
  | "R-empty"
  | "R-same"
  | "R-zh-jpform"
  | "R-zh-jpword"
  | "R-zh-jpword-ctx";
export const RULES: RuleId[] = ["R-zh-kana", "R-en-cjk", "R-ja-simp", "R-ja-latin-run", "R-empty", "R-same", "R-zh-jpform", "R-zh-jpword", "R-zh-jpword-ctx"];
/** WARN rules never fail the gate (L3 / L4: low precision, or a word that is ordinary Chinese in most uses). */
export const WARN_RULES = new Set<RuleId>(["R-ja-latin-run", "R-zh-jpword-ctx"]);

/** Kana as the brief defines it: hiragana + katakana blocks, katakana phonetic extensions, halfwidth katakana. */
const KANA_SRC = "\\u3040-\\u30FF\\u31F0-\\u31FF\\uFF66-\\uFF9F";
const KANA = new RegExp(`[${KANA_SRC}]`, "u");
const HAN = /\p{Script=Han}/u;
/** ・ (U+30FB) and ー (U+30FC): inside the kana block, but punctuation-like; runs made only of these are sub-tagged. */
const PUNCT_KANA = new Set(["・", "ー"]);
/**
 * Choice labels ア–エ standing alone, or joined by ・ (「ア・ウ」): no other kana on either side. 「选项ウ」「Choice ウ」
 * cite the choice. Known over-allowance: any lone ア–エ is let through, e.g. the イ of a LIKE pattern "%イ%ン_".
 */
const KANA_NO_DOT = "\\u3040-\\u30FA\\u30FC-\\u30FF\\u31F0-\\u31FF\\uFF66-\\uFF9F";
const CHOICE_LABEL = new RegExp(`(?<![${KANA_NO_DOT}])[アイウエ](?:・[アイウエ])*(?![${KANA_NO_DOT}])`, "gu");
/** inline.ts JP label: `[[jp:` … first `]]` (tokenize() closes at the first "]]"; empty labels are not markup). */
const JP_ANNOT = /\[\[jp:([\s\S]+?)\]\]/g;
const URL_RE = /https?:\/\/\S+/g;

/**
 * Simplified-only characters for R-ja-simp. Method (S154, L2): the candidate list of the Track L brief, each
 * character kept only when it is (a) outside Shift_JIS / Windows-31J (JIS X 0208 + NEC/IBM extensions, enumerated
 * with TextDecoder("shift_jis") over every double-byte code) and (b) absent from the IPA Japanese source text
 * (questions.json stem_jp + choices_jp, 2,900 questions). Dropped because they are ordinary Japanese characters
 * (in Shift_JIS; most also occur in the IPA text): 会 学 点 数 件 硬 理 准 网.
 */
export const SIMP_ONLY = [
  ..."这们说时为对发习题业务门问间关现产过还进经统络应设计认识让选择输质调编码软储处级线导开页电脑种类标规则风险资讯术语",
];
const SIMP_SET = new Set(SIMP_ONLY);

/**
 * Character sets for R-zh-jpform, enumerated once with TextDecoder (WHATWG gbk / shift_jis, built into Node):
 *   GB2312 = every double-byte GBK code A1A1–F7FE (symbols + the 6,763 hanzi), SJIS = every Shift_JIS double byte.
 * A Japanese glyph form = Han, outside GB2312, inside Shift_JIS (図 応 検 対 発 過 問 説 … and traditional forms).
 * Han outside both (rare Chinese characters) is not flagged: it is not evidence of Japanese.
 */
export const GB2312 = new Set<string>();
export const SJIS = new Set<string>();
{
  const gbk = new TextDecoder("gbk");
  for (let a = 0xa1; a <= 0xf7; a++)
    for (let b = 0xa1; b <= 0xfe; b++) {
      const s = gbk.decode(new Uint8Array([a, b]));
      if ([...s].length === 1 && s !== "�") GB2312.add(s);
    }
  const sjis = new TextDecoder("shift_jis");
  for (const a of [...Array(0x1f).keys()].map((i) => 0x81 + i).concat([...Array(0x1d).keys()].map((i) => 0xe0 + i)))
    for (let b = 0x40; b <= 0xfc; b++) {
      if (b === 0x7f) continue;
      const s = sjis.decode(new Uint8Array([a, b]));
      if ([...s].length === 1 && s !== "�") SJIS.add(s);
    }
}
/** Outside GB2312 but ordinary Chinese: 〇 (U+3007, the Chinese zero / placeholder), 瞭 (瞭望, 通用规范汉字表 2013). */
const JP_FORM_NOT = new Set(["〇", "瞭"]);
export const isJpForm = (c: string): boolean => HAN.test(c) && !GB2312.has(c) && SJIS.has(c) && !JP_FORM_NOT.has(c);
/** Han in GB2312 but not in Shift_JIS = a simplified form Japanese text cannot contain (这 们 计 …). */
const isSimplifiedHan = (c: string): boolean => HAN.test(c) && GB2312.has(c) && !SJIS.has(c);

/** ≥ 6 consecutive Latin words of ≥ 2 letters (space / comma separated). Low confidence: names and titles match too. */
const LATIN_RUN = /[A-Za-z][A-Za-z'’-]+(?:[ ,;:]+[A-Za-z][A-Za-z'’-]+){5,}/g;

/** What one rule let through: characters of its own class inside [[jp:…]], fields with such characters, choice labels, quiz brackets. */
export type Allowance = { annotChars: number; annotFields: number; choiceLabels: number; bracketChars: number };
export const emptyAllowance = (): Allowance => ({ annotChars: 0, annotFields: 0, choiceLabels: 0, bracketChars: 0 });

/** One maximal run of offending characters (or one word / one formula) at `index`. */
export type Run = { index: number; text: string };
export type CharHit = { index: number; chars: string[]; runs: Run[]; subtag?: "punct-only" };

const blank = (s: string): string => s.replace(/[^\n]/g, " ");

const isKana = (c: string): boolean => KANA.test(c);
const isKanaOrHan = (c: string): boolean => KANA.test(c) || HAN.test(c);

/**
 * Text with every [[jp:…]] replaced by spaces of the same length (indices kept), and how many characters
 * of the class `counted` (default: kana) were inside the annotations.
 */
export function maskAnnotations(s: string, counted: (c: string) => boolean = isKana): { text: string; annotChars: number; annotCount: number } {
  let annotChars = 0;
  let annotCount = 0;
  const text = s.replace(JP_ANNOT, (m, inner: string) => {
    annotCount++;
    for (const c of inner) if (counted(c)) annotChars++;
    return blank(m);
  });
  return { text, annotChars, annotCount };
}

/** Maximal runs of `isBad` characters in `text` (code-point aware, indices in UTF-16 units). */
function runsOf(text: string, isBad: (c: string) => boolean): Run[] {
  const runs: Run[] = [];
  let cur: Run | null = null;
  let i = 0;
  for (const c of text) {
    if (isBad(c)) {
      if (cur) cur.text += c;
      else runs.push((cur = { index: i, text: c }));
    } else cur = null;
    i += c.length;
  }
  return runs;
}

const isPunctRun = (t: string): boolean => [...t].every((c) => PUNCT_KANA.has(c));

function toHit(runs: Run[]): CharHit | null {
  if (runs.length === 0) return null;
  const chars = [...new Set(runs.flatMap((r) => [...r.text]))];
  const h: CharHit = { index: runs[0].index, chars, runs };
  return runs.every((r) => isPunctRun(r.text)) ? { ...h, subtag: "punct-only" } : h;
}

function scriptHit(s: string, isBad: (c: string) => boolean, allow: Allowance): CharHit | null {
  const m = maskAnnotations(s, isBad);
  allow.annotChars += m.annotChars;
  if (m.annotChars > 0) allow.annotFields++;
  const text = m.text.replace(CHOICE_LABEL, (c) => {
    allow.choiceLabels += (c.length + 1) / 2;
    return blank(c);
  });
  return toHit(runsOf(text, isBad));
}

/** R-zh-kana: kana outside [[jp:…]] and outside lone choice labels (both counted into `allow`). */
export const zhKana = (s: string, allow: Allowance): CharHit | null => scriptHit(s, isKana, allow);

/** R-en-cjk: CJK ideographs or kana outside [[jp:…]] and lone choice labels. */
export const enCjk = (s: string, allow: Allowance): CharHit | null => scriptHit(s, isKanaOrHan, allow);

/**
 * R-ja-simp: simplified-only characters — the SIMP_ONLY list, or any Han in GB2312 but not in Shift_JIS (isSimplifiedHan:
 * 东 车 库 …, L5 review M-1). Japanese text written in JIS characters can contain neither.
 */
export const jaSimp = (s: string): CharHit | null => toHit(runsOf(s, (c) => SIMP_SET.has(c) || isSimplifiedHan(c)));

/** R-ja-latin-run: runs of ≥ 6 Latin words of ≥ 2 letters (URLs and ** markers removed first). */
export function jaLatinRun(s: string): CharHit | null {
  const t = s.replace(URL_RE, blank).replace(/\*\*/g, "  ");
  const runs = [...t.matchAll(LATIN_RUN)].map((m) => ({ index: m.index ?? 0, text: m[0] }));
  return runs.length ? { index: runs[0].index, chars: runs.map((r) => r.text), runs } : null;
}

/**
 * Quiz bracketed Japanese originals: the inside of （…）(…)「…」『…』“…” in the quiz sidecars, the convention for
 * 「浪费（ムダ）」/「共通框架（共通フレーム）」. Only brackets with no simplified-only Han (isSimplifiedHan) are
 * masked, so Chinese text in brackets is still read.
 */
const BR = "（）()「」『』“”";
const INNER = new RegExp(`（[^${BR}\\n]*）|\\([^${BR}\\n]*\\)|「[^${BR}\\n]*」|『[^${BR}\\n]*』|“[^${BR}\\n]*”`, "g");
/** Placeholder for the brackets of a span that stays readable (BMP, 1 UTF-16 unit like the brackets: indices kept). */
const KEPT = "\uE000";
export function maskQuizBrackets(s: string, counted: (c: string) => boolean): { text: string; masked: number } {
  let masked = 0;
  let text = s;
  // innermost first: 「…」 inside （…）, （…） inside “…”
  for (let prev = ""; prev !== text; ) {
    prev = text;
    text = text.replace(INNER, (m) => {
      if ([...m].some(isSimplifiedHan)) return KEPT + m.slice(1, -1) + KEPT;
      for (const c of m) if (counted(c)) masked++;
      return blank(m);
    });
  }
  return { text, masked };
}

/** R-zh-jpform: runs of Japanese glyph forms outside [[jp:…]] (and, when `quizBrackets`, outside quiz brackets). */
export function zhJpForm(s: string, allow: Allowance, quizBrackets: boolean): CharHit | null {
  const m = maskAnnotations(s, isJpForm);
  allow.annotChars += m.annotChars;
  if (m.annotChars > 0) allow.annotFields++;
  let text = m.text;
  if (quizBrackets) {
    const b = maskQuizBrackets(text, isJpForm);
    allow.bracketChars += b.masked;
    text = b.text;
  }
  return toHit(runsOf(text, isJpForm));
}

/**
 * R-zh-jpword: Japanese-only (or Japanese-sense) words in zh fields, simplified spelling. Source:
 * evidence/phase5/hosting/L4b_wordlist.md 採用 table (S154) + 传票 / 决裁 (L4 review M-4). 试制品 is not listed: 试制 = trial manufacture is
 * standard Chinese (D-222 keeps 「试制品（原型）」).
 *   fail — the words judged LEAK in L4 (now fixed), the words kept by decision (each occurrence allow-listed with
 *          its reason), and the 0-hit watch list. Context-dependent stems are narrowed to their Japanese sense.
 *   warn — stems that are ordinary Chinese in most uses (要件 = 法律の构成要件, 担当 = 担任, 案件 = 法律上の事件) and
 *          Japanese words whose every S154 use is a bracketed original (下请法 / 景品表示法 …). Reported, never fail.
 * `jaSibling`: the word counts only when the ja sibling has it too (部署 = 部门 vs the Chinese 部署 = デプロイ).
 */
export type JpWord = { w: string; re: RegExp; tier: "fail" | "warn"; jaSibling?: RegExp };
const W = (w: string, tier: "fail" | "warn", re = new RegExp(w, "gu"), jaSibling?: RegExp): JpWord => ({ w, re, tier, ...(jaSibling ? { jaSibling } : {}) });
export const JP_WORDS: JpWord[] = [
  // judged LEAK in L4 (fixed): any new occurrence fails
  W("正解", "fail"),
  W("立案", "fail"),
  W("分野", "fail"),
  W("正答", "fail"),
  W("系统要件", "fail"),
  W("担当者", "fail", /担当(?:者|人员)/gu),
  W("作成者", "fail"),
  W("部署", "fail", /部署/gu, /部署/u),
  W("社员", "fail"),
  W("检讨", "fail"),
  W("提携", "fail"),
  W("实装", "fail"),
  W("结合测试", "fail"),
  W("单体测试", "fail"),
  W("试作", "fail", /试作(?!业)/gu),
  W("二重化", "fail"),
  W("指摘", "fail"),
  W("利用者", "fail"),
  W("责任者", "fail"),
  W("不正", "fail", /不正(?![当常确规对])/gu),
  W("番号", "fail"),
  W("传票", "fail"),
  W("决裁", "fail"),
  W("记忆装置", "fail"),
  // kept by decision (D-222 / L4 review): every current occurrence is an allow-list entry with its reason
  W("过去问", "fail"),
  W("多重化", "fail"),
  W("误答", "fail", /(?<!错)误答/gu),
  W("事业者", "fail"),
  W("满足度", "fail"),
  W("利害关系者", "fail"),
  // L4b watch list (simplified spelling, 0 hits at S154)
  ...["见积", "纳期", "纳品", "发注", "缔切", "仕组", "组入", "届出", "配列", "构造体", "文字列", "二分木", "木构造", "分岐",
    "曜日", "选择肢", "受验", "配点", "满点", "大切", "配虑", "卖上", "卸卖", "贩路", "棚卸", "出荷", "入荷", "部品", "工场", "残业", "出张", "课长", "割赋",
    "贷借对照", "偿却", "初期化", "信赖性", "真正性", "否认防止", "携带电话", "情报处理", "个人情报", "暗号化", "论理回路", "制御", "回线", "稼动"].map((w) => W(w, "fail")),
  // context-dependent stems and bracketed-original words: WARN
  W("要件", "warn", /(?<!系统)要件/gu),
  W("担当", "warn", /担当(?!者|人员)/gu),
  W("案件", "warn", /(?<!提)案件/gu),
  W("景品", "warn"),
  W("株式", "warn"),
  W("会社", "warn"),
  W("役员", "warn"),
  W("下请", "warn"),
  W("独占禁止", "warn"),
  W("内制", "warn", /内制(?![造定作冷])/gu),
  W("生体认证", "warn"),
  W("受注", "warn", /(?<!接)受注/gu),
  W("引当", "warn", /(?<!指)引当(?!场)/gu),
  W("受入", "warn", /(?<!免)受入(?!侵)/gu),
  W("工数", "warn", /(?<![加员人])工数/gu),
];

/** R-zh-jpword / R-zh-jpword-ctx occurrences on the [[jp:…]]-masked text (one Run per occurrence, text = the match). */
export function zhJpWords(s: string, ja: string): { fail: Run[]; warn: Run[] } {
  const t = maskAnnotations(s).text;
  const out = { fail: [] as Run[], warn: [] as Run[] };
  for (const { re, tier, jaSibling } of JP_WORDS) {
    if (jaSibling && !jaSibling.test(ja)) continue;
    for (const m of t.matchAll(re)) out[tier].push({ index: m.index ?? 0, text: m[0] });
  }
  return out;
}

export const isBlank = (v: unknown): boolean => typeof v !== "string" || v.trim() === "";
/** Has kana or Han: a sibling without either is code / numbers / ASCII and is excluded from R-same. */
export const hasCjk = (s: string): boolean => [...s].some((c) => KANA.test(c) || HAN.test(c));
const isUrlOnly = (s: string): boolean => /^\s*https?:\/\/\S+\s*$/.test(s);

/**
 * R-same: zh / en byte-identical to the ja sibling, longer than `minLen` characters (12 for data; ui-messages 0).
 * "excluded" = identical but the ja text has no kana / Han (code, numbers, URL, ASCII-only text).
 */
export function sameAsJa(ja: string, other: string, minLen = 12): "hit" | "excluded" | null {
  if (other !== ja || [...ja].length <= minLen) return null;
  if (!hasCjk(ja) || isUrlOnly(ja)) return "excluded";
  return "hit";
}

/** ±r characters around `index`, newlines shown as ⏎. */
export function excerpt(s: string, index: number, r = 30): string {
  const a = Math.max(0, index - r);
  const b = Math.min(s.length, index + r);
  return `${a > 0 ? "…" : ""}${s.slice(a, b)}${b < s.length ? "…" : ""}`.replace(/\n/g, "⏎");
}

// ---- groups and detection (pure; the fs side builds the groups) ------------------------------------------

export type Tag = "content" | "derived" | "ja-only";
export type Member = { path: string; value: unknown; scan: boolean; file?: string };
export type Group = { source: string; file: string; pattern: string; tag: Tag; members: Partial<Record<Lang, Member>> };
/** One hit = one run (char rules), one word occurrence (jpword) or one field (R-same / R-empty). */
export type Hit = {
  source: string;
  file: string;
  path: string;
  pattern: string;
  lang: Lang;
  rule: RuleId;
  tag: Tag;
  subtag?: string;
  confidence: "normal" | "low";
  /** The allow-list key text: the run, the word, the whole value (R-same) or "" (R-empty). */
  text: string;
  index: number;
  excerpt: string;
};

const QUIZ_SOURCES = new Set(["quiz-translations", "quiz-explanations"]);
/** ui-messages R-same has no length floor (L3: short copied labels were invisible); data keeps 12. */
const SAME_MIN: Record<string, number> = { "ui-messages": 0 };

export type Detection = {
  hits: Hit[];
  allowance: Map<string, Allowance>;
  excludedSame: Map<string, number>;
  fieldsScanned: Map<string, number>;
};

export function detect(groups: Group[]): Detection {
  const hits: Hit[] = [];
  const allowance = new Map<string, Allowance>();
  const allowFor = (source: string, rule: RuleId): Allowance => {
    const k = `${source}|${rule}`;
    if (!allowance.has(k)) allowance.set(k, emptyAllowance());
    return allowance.get(k) as Allowance;
  };
  const excludedSame = new Map<string, number>();
  const fieldsScanned = new Map<string, number>();
  const inc = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);

  for (const g of groups) {
    const base = (lang: Lang, mem: Member, rule: RuleId) => ({ source: g.source, file: mem.file ?? g.file, path: mem.path, pattern: g.pattern, lang, rule, tag: g.tag, confidence: (rule === "R-ja-latin-run" ? "low" : "normal") as Hit["confidence"] });
    const pushRuns = (lang: Lang, mem: Member, rule: RuleId, runs: Run[], s: string) => {
      for (const r of runs) hits.push({ ...base(lang, mem, rule), ...(isPunctRun(r.text) && (rule === "R-zh-kana" || rule === "R-en-cjk") ? { subtag: "punct-only" } : {}), text: r.text, index: r.index, excerpt: excerpt(s, r.index) });
    };
    const jaVal = typeof g.members.ja?.value === "string" ? (g.members.ja.value as string) : "";
    for (const [lang, mem] of Object.entries(g.members) as [Lang, Member][]) {
      if (!mem.scan || typeof mem.value !== "string") continue;
      inc(fieldsScanned, `${g.source}|${lang}|${g.tag}`);
      const s = mem.value;
      if (lang === "zh") {
        pushRuns(lang, mem, "R-zh-kana", zhKana(s, allowFor(g.source, "R-zh-kana"))?.runs ?? [], s);
        pushRuns(lang, mem, "R-zh-jpform", zhJpForm(s, allowFor(g.source, "R-zh-jpform"), QUIZ_SOURCES.has(g.source))?.runs ?? [], s);
        const w = zhJpWords(s, jaVal);
        pushRuns(lang, mem, "R-zh-jpword", w.fail, s);
        pushRuns(lang, mem, "R-zh-jpword-ctx", w.warn, s);
      } else if (lang === "en") {
        pushRuns(lang, mem, "R-en-cjk", enCjk(s, allowFor(g.source, "R-en-cjk"))?.runs ?? [], s);
      } else {
        pushRuns(lang, mem, "R-ja-simp", jaSimp(s)?.runs ?? [], s);
        pushRuns(lang, mem, "R-ja-latin-run", jaLatinRun(s)?.runs ?? [], s);
      }
    }
    const present = (Object.entries(g.members) as [Lang, Member][]).filter(([, m]) => !isBlank(m.value));
    if (Object.keys(g.members).length > 1 && present.length > 0) {
      for (const [lang, mem] of Object.entries(g.members) as [Lang, Member][]) {
        if (!isBlank(mem.value)) continue;
        const [sl, sm] = present[0];
        hits.push({ ...base(lang, mem, "R-empty"), subtag: mem.value === undefined ? "missing" : "blank", text: "", index: 0, excerpt: `${sl}: ${excerpt(String(sm.value), 0)}` });
      }
    }
    const ja = g.members.ja;
    if (ja && typeof ja.value === "string") {
      for (const l of ["zh", "en"] as Lang[]) {
        const o = g.members[l];
        if (!o || typeof o.value !== "string") continue;
        const r = sameAsJa(ja.value, o.value, SAME_MIN[g.source] ?? 12);
        if (r === "hit") hits.push({ ...base(l, o, "R-same"), text: o.value, index: 0, excerpt: excerpt(o.value, 0) });
        else if (r === "excluded") inc(excludedSame, g.source);
      }
    }
  }
  return { hits, allowance, excludedSame, fieldsScanned };
}

// ---- the L5 gate ------------------------------------------------------------------------------------------

/** scripts/fixtures/lang-allow.json */
export type AllowEntry = { rule: RuleId; source: string; file: string; path: string; text: string; count: number; category: string; reason: string };
export type ScopeExclusion = { id: string; source: string; tag?: Tag; path_re?: string; reason: string };
export type AllowFile = { schema: string; categories: Record<string, string>; scope_exclusions: ScopeExclusion[]; entries: AllowEntry[] };

export const allowKey = (h: { rule: string; file: string; path: string; text: string }): string => `${h.rule}\u0001${h.file}\u0001${h.path}\u0001${h.text}`;

export type GateResult = {
  /** Gate-failing hits: not allow-listed, or more occurrences at the key than the entry's count. */
  failures: Hit[];
  allowed: number;
  warn: Hit[];
  punct: Hit[];
  excluded: Map<string, number>;
  /** Entries whose key has fewer occurrences than `count` (0 = the text is gone). The CLI fails on them (L5 review L-4). */
  stale: { entry: AllowEntry; found: number }[];
};

export function exclusionOf(h: Hit, ex: ScopeExclusion[]): ScopeExclusion | undefined {
  return ex.find((e) => e.source === h.source && (e.tag === undefined || e.tag === h.tag) && (e.path_re === undefined || new RegExp(e.path_re, "u").test(h.path)));
}

export function gate(hits: Hit[], allow: AllowFile): GateResult {
  const res: GateResult = { failures: [], allowed: 0, warn: [], punct: [], excluded: new Map(), stale: [] };
  const byKey = new Map<string, Hit[]>();
  for (const h of hits) {
    // a scope exclusion never hides a blank / missing or copied field (glossary and TodayTerms display derived fields)
    const ex = h.rule === "R-empty" || h.rule === "R-same" ? undefined : exclusionOf(h, allow.scope_exclusions);
    if (ex) {
      res.excluded.set(ex.id, (res.excluded.get(ex.id) ?? 0) + 1);
      continue;
    }
    if (WARN_RULES.has(h.rule)) res.warn.push(h);
    else if (h.subtag === "punct-only") res.punct.push(h);
    else {
      const k = allowKey(h);
      byKey.set(k, [...(byKey.get(k) ?? []), h]);
    }
  }
  const entries = new Map(allow.entries.map((e) => [allowKey(e), e]));
  for (const [k, hs] of byKey) {
    const e = entries.get(k);
    if (e && e.rule !== "R-empty" && hs.length <= e.count) res.allowed += hs.length;
    else res.failures.push(...hs);
  }
  for (const [k, e] of entries) {
    const found = byKey.get(k)?.length ?? 0;
    if (found < e.count) res.stale.push({ entry: e, found });
  }
  return res;
}

/** Leaf key paths of a messages object (objects recursed, arrays indexed). */
export function leafKeys(v: unknown, at = ""): string[] {
  if (typeof v === "object" && v !== null) {
    const kv: [string, unknown][] = Array.isArray(v) ? v.map((x, i) => [`[${i}]`, x]) : Object.entries(v);
    return kv.flatMap(([k, x]) => leafKeys(x, Array.isArray(v) ? `${at}${k}` : at ? `${at}.${k}` : k));
  }
  return [at];
}

/** ui-messages key set: zh / en must have exactly the leaf keys of ja (both directions). */
export function keySetDiff(msg: Record<Lang, unknown>): { lang: Lang; missing: string[]; extra: string[] }[] {
  const ja = new Set(leafKeys(msg.ja));
  return (["zh", "en"] as Lang[]).map((l) => {
    const o = new Set(leafKeys(msg[l]));
    return { lang: l, missing: [...ja].filter((k) => !o.has(k)), extra: [...o].filter((k) => !ja.has(k)) };
  });
}
