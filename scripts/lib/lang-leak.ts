// Track L (PLAN_hosting_migration §3 L2) — pure detectors for the trilingual leak scan.
// Imported by scripts/lang-leak-scan.ts (fs side) and scripts/lang-leak-scan.test.ts (node:test).
// Pure: no fs, relative imports with the `.ts` extension, `import type` only, no enums (Node native type
// stripping, the same constraints as apps/web/src/lib/textbook/validateV2.ts).
//
// Character-class rules only: a Japanese sentence written in a zh field with kanji only (or the reverse)
// is invisible here — that gap belongs to the L3 sampled read, not to this module.

export type Lang = "ja" | "zh" | "en";
export type RuleId = "R-zh-kana" | "R-en-cjk" | "R-ja-simp" | "R-ja-latin-run" | "R-empty" | "R-same";

/** Kana as the brief defines it: hiragana + katakana blocks, katakana phonetic extensions, halfwidth katakana. */
const KANA_SRC = "\\u3040-\\u30FF\\u31F0-\\u31FF\\uFF66-\\uFF9F";
const KANA = new RegExp(`[${KANA_SRC}]`, "u");
const HAN = /\p{Script=Han}/u;
/** ・ (U+30FB) and ー (U+30FC): inside the kana block, but punctuation-like; hits made only of these are sub-tagged. */
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

/** ≥ 6 consecutive Latin words (space / comma separated). Low confidence: code, lists and titles also match. */
const LATIN_RUN = /[A-Za-z][A-Za-z'’-]*(?:[ ,;:]+[A-Za-z][A-Za-z'’-]*){5,}/g;

/** What one rule let through: characters of its own class inside [[jp:…]], fields with such characters, choice labels. */
export type Allowance = { annotChars: number; annotFields: number; choiceLabels: number };
export const emptyAllowance = (): Allowance => ({ annotChars: 0, annotFields: 0, choiceLabels: 0 });

export type CharHit = { index: number; chars: string[]; subtag?: "punct-only" };

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

function scriptHit(s: string, isBad: (c: string) => boolean, allow: Allowance): CharHit | null {
  const m = maskAnnotations(s, isBad);
  allow.annotChars += m.annotChars;
  if (m.annotChars > 0) allow.annotFields++;
  const text = m.text.replace(CHOICE_LABEL, (c) => {
    allow.choiceLabels += (c.length + 1) / 2;
    return blank(c);
  });
  let index = -1;
  const chars = new Set<string>();
  let i = 0;
  for (const c of text) {
    if (isBad(c)) {
      if (index < 0) index = i;
      chars.add(c);
    }
    i += c.length;
  }
  if (index < 0) return null;
  const list = [...chars];
  return list.every((c) => PUNCT_KANA.has(c)) ? { index, chars: list, subtag: "punct-only" } : { index, chars: list };
}

/** R-zh-kana: kana outside [[jp:…]] and outside lone choice labels (both counted into `allow`). */
export const zhKana = (s: string, allow: Allowance): CharHit | null => scriptHit(s, isKana, allow);

/** R-en-cjk: CJK ideographs or kana outside [[jp:…]] and lone choice labels. */
export const enCjk = (s: string, allow: Allowance): CharHit | null => scriptHit(s, isKanaOrHan, allow);

/** R-ja-simp: simplified-only characters (SIMP_ONLY). */
export function jaSimp(s: string): CharHit | null {
  const chars = [...new Set([...s].filter((c) => SIMP_SET.has(c)))];
  return chars.length === 0 ? null : { index: Math.min(...chars.map((c) => s.indexOf(c))), chars };
}

/** R-ja-latin-run: the first run of ≥ 6 Latin words (URLs and ** markers removed first). */
export function jaLatinRun(s: string): CharHit | null {
  const t = s.replace(URL_RE, blank).replace(/\*\*/g, "  ");
  LATIN_RUN.lastIndex = 0;
  const m = LATIN_RUN.exec(t);
  return m ? { index: m.index, chars: [m[0]] } : null;
}

export const isBlank = (v: unknown): boolean => typeof v !== "string" || v.trim() === "";
/** Has kana or Han: a sibling without either is code / numbers / ASCII and is excluded from R-same. */
export const hasCjk = (s: string): boolean => [...s].some((c) => KANA.test(c) || HAN.test(c));
const isUrlOnly = (s: string): boolean => /^\s*https?:\/\/\S+\s*$/.test(s);

/**
 * R-same: zh / en byte-identical to the ja sibling, longer than 12 characters.
 * "excluded" = identical but the ja text has no kana / Han (code, numbers, URL, ASCII-only text).
 */
export function sameAsJa(ja: string, other: string): "hit" | "excluded" | null {
  if (other !== ja || [...ja].length <= 12) return null;
  if (!hasCjk(ja) || isUrlOnly(ja)) return "excluded";
  return "hit";
}

/** ±r characters around `index`, newlines shown as ⏎. */
export function excerpt(s: string, index: number, r = 30): string {
  const a = Math.max(0, index - r);
  const b = Math.min(s.length, index + r);
  return `${a > 0 ? "…" : ""}${s.slice(a, b)}${b < s.length ? "…" : ""}`.replace(/\n/g, "⏎");
}
