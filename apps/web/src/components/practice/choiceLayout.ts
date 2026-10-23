// Stage 7 Phase 1 Task 8 — pure helpers of the practice question face (bundler-safe, no I/O).
//
//   - choiceLayout (§0-15): every choice's JP text has ≤ 12 code points once whitespace is removed,
//     no newline, is not a table (isTableChoice), there are no choice_figures, AND every choice fits
//     the row4 text column without breaking inside a word (estimated width below, Rule A attempts
//     1–2) → "row4" (4 columns, the exam booklet's short-choice layout); choice_figures → "grid2"
//     (2 × 2); otherwise "list". (PracticeQuestion also falls back to "list" while a translation is
//     shown.)
//   - Width estimate (Rule A attempt 3): a choice is cut into unbreakable segments the way a browser
//     breaks Japanese text — whitespace breaks; between two CJK characters, and between CJK and
//     non-CJK, a break is allowed; non-CJK characters stick together (「A→B→C」, 「￥A￥B」,
//     「①and②」); kinsoku: closing punctuation / small kana / ー・ stick to the character before,
//     opening brackets to the character after. A segment's width is the sum of per-character em
//     widths measured in BIZ UDPGothic (CHAR_EM). A pairs choice (組合せ問, ChoiceBody "pairs") is
//     judged per cell: key badge (KEY_EM) + the widest segment of the value. The widest segment must
//     be ≤ ROW4_LIMIT_EM.
//   - ROW4_LIMIT_EM: measured on the built practice page (1440 × 1000 viewport, content capped at
//     1240px): a row4 cell is 112px, its text column 58px, choice font 15px → 3.87em; minus a
//     0.3em margin → 3.55em.
//   - explanationTitle (§0-16): the part of points[0] before the first 「。」 (the whole point when it
//     has none), shown when it is 1–30 code points; otherwise null (the title is only 「問 N」).
//   - sourceNumber: the question number of the source exam (the NNN of `<exam_id>-qNNN`, which is the
//     問N of source_label — pinned for all 2900 by choiceLayout.test.ts).

import { isTableChoice } from "@/components/quiz/QuizRichText";
import { CHOICE_LETTERS, type QuizQuestion } from "@/lib/quiz/quizModel";
import { parseChoiceWithHint } from "@/lib/quiz/quizRichText";

/** BCP 47 tag of a UI locale's text (lang attributes of the face and the explanation) */
export const LANG_TAG: Record<string, string> = { ja: "ja", zh: "zh-Hans", en: "en" };

export type ChoiceLayout = "row4" | "grid2" | "list";

const SHORT_MAX = 12;

/** row4 text column 58px / 15px = 3.87em, minus a 0.3em margin (see header) */
export const ROW4_LIMIT_EM = 3.55;
/** pair key badge + its gap, 1-character key (measured 1.71em at 15px); +0.55em per extra key character */
export const KEY_EM = 1.75;

/**
 * CJK = characters a browser may break before and after: Han, Hiragana U+3040–309F, Katakana
 * U+30A0–30FF, Katakana Phonetic Extensions U+31F0–31FF, CJK Symbols and Punctuation U+3000–303F,
 * and Halfwidth and Fullwidth Forms U+FF00–FFDF / U+FFEF (U+FFE0–FFEE — ￠￡￢￣￤￥￦ and the
 * half-width symbols — are excluded: ￥ is a prefix (UAX #14 PR) that does not break from the letter
 * after it). Everything else is non-CJK and sticks to its non-CJK neighbours.
 */
const CJK = /[\p{Script=Han}\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\u3000-\u303F\uFF00-\uFFDF\uFFEF]/u;
/** no break before (kinsoku: closing punctuation, small kana, iteration / prolonged marks) */
const CLOSE = new Set([..."、。，．：；！？）〕］｝〉》」』】〙〗・ー゛゜ゝゞヽヾ々〻ぁぃぅぇぉっゃゅょゎゕゖァィゥェォッャュョヮヵヶㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ‐–〜～…‥％"]);
/** no break after (kinsoku: opening brackets) */
const OPEN = new Set([..."（〔［｛〈《「『【〘〖"]);
const SPACE = /\s/u;

/** Estimated advance of one character in em (BIZ UDPGothic, measured S132 attempt 3; rounded up). */
export function charEm(ch: string): number {
  if (/[A-Z]/.test(ch)) return ch === "M" || ch === "W" ? 1.0 : 0.8;
  if (/[a-z]/.test(ch)) return ch === "m" || ch === "w" ? 0.95 : 0.65;
  if (/[0-9]/.test(ch)) return 0.76;
  if (/[!-~]/.test(ch)) return /[.,:;'|!`il]/.test(ch) ? 0.35 : 0.6; // other printable ASCII
  if (/[\uFF61-\uFF9F]/.test(ch)) return 0.5; // half-width katakana
  return 1.0; // CJK, full-width forms, and every other non-ASCII glyph (→ ① × − ￥ …)
}

/** Widths (em) of the unbreakable segments of a text (see header). */
export function segmentWidths(text: string): number[] {
  const out: number[] = [];
  let cur = 0;
  let open = false; // a segment is being built
  let prev: string | null = null;
  for (const ch of text) {
    if (SPACE.test(ch)) {
      if (open) out.push(cur);
      cur = 0;
      open = false;
      prev = null;
      continue;
    }
    const glue =
      prev !== null &&
      (CLOSE.has(ch) || OPEN.has(prev) || (!CJK.test(prev) && !CJK.test(ch)));
    if (open && !glue) {
      out.push(cur);
      cur = 0;
    }
    cur += charEm(ch);
    open = true;
    prev = ch;
  }
  if (open) out.push(cur);
  return out;
}

const widest = (text: string): number => Math.max(0, ...segmentWidths(text));

/** Widest unbreakable piece of a choice as ChoiceBody lays it out (pairs: badge + value per cell). */
export function choiceMinEm(text: string): number {
  const c = parseChoiceWithHint(text, text);
  if (c.kind === "pairs") {
    return Math.max(
      0,
      ...c.cells.map((cell) =>
        cell.key ? KEY_EM + 0.55 * ([...cell.key].length - 1) + widest(cell.value) : widest(cell.value),
      ),
    );
  }
  return widest(text);
}

const TITLE_MAX = 30;

const codePoints = (s: string): number => [...s].length;

export function choiceLayout(q: QuizQuestion): ChoiceLayout {
  if (q.choice_figures) return "grid2";
  const short = CHOICE_LETTERS.every((L) => {
    const t = q.choices_jp[L] ?? "";
    return (
      !t.includes("\n") &&
      codePoints(t.replace(/\s/g, "")) <= SHORT_MAX &&
      !isTableChoice(t, t) &&
      choiceMinEm(t) <= ROW4_LIMIT_EM
    );
  });
  return short ? "row4" : "list";
}

export function explanationTitle(points: readonly string[]): string | null {
  const p = points[0];
  if (p === undefined) return null;
  const i = p.indexOf("。");
  const head = (i < 0 ? p : p.slice(0, i)).trim();
  return head !== "" && codePoints(head) <= TITLE_MAX ? head : null;
}

export function sourceNumber(q: Pick<QuizQuestion, "id">): number {
  const m = /-q(\d+)$/.exec(q.id);
  if (!m) throw new Error(`question id without a question number: ${q.id}`);
  return Number(m[1]);
}
