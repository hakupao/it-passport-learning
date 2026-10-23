// Stage 7 Phase 1 Task 8 — pure helpers of the practice question face (bundler-safe, no I/O).
//
//   - choiceLayout (§0-15): every choice's JP text has ≤ 12 code points once whitespace is removed,
//     no newline, is not a table (isTableChoice), and there are no choice_figures → "row4" (4 columns,
//     the exam booklet's short-choice layout) — but only when no choice contains an unbreakable run
//     (UNBREAKABLE_MIN or more consecutive code points that are neither CJK nor whitespace, e.g.
//     「①and②and③」: such a run cannot wrap inside a ~110px cell, Rule A audit attempt 1);
//     choice_figures → "grid2" (2 × 2); otherwise "list".
//   - explanationTitle (§0-16): the part of points[0] before the first 「。」 (the whole point when it
//     has none), shown when it is 1–30 code points; otherwise null (the title is only 「問 N」).
//   - sourceNumber: the question number of the source exam (the NNN of `<exam_id>-qNNN`, which is the
//     問N of source_label — pinned for all 2900 by choiceLayout.test.ts).

import { isTableChoice } from "@/components/quiz/QuizRichText";
import { CHOICE_LETTERS, type QuizQuestion } from "@/lib/quiz/quizModel";

/** BCP 47 tag of a UI locale's text (lang attributes of the face and the explanation) */
export const LANG_TAG: Record<string, string> = { ja: "ja", zh: "zh-Hans", en: "en" };

export type ChoiceLayout = "row4" | "grid2" | "list";

const SHORT_MAX = 12;
/** a run of this many non-CJK, non-whitespace code points makes a choice too wide for row4 */
export const UNBREAKABLE_MIN = 6;

/**
 * Characters a browser can break between in Japanese text: Han (\p{Script=Han}), the Hiragana block
 * U+3040–309F, the Katakana block U+30A0–30FF (incl. ー and ・), Katakana Phonetic Extensions
 * U+31F0–31FF, CJK Symbols and Punctuation U+3000–303F (、。「」〔〕 and U+3000), and Halfwidth and
 * Fullwidth Forms U+FF00–FFEF (，（）：ａＡ１ and half-width katakana). Everything else — ASCII,
 * circled digits ①… (Enclosed Alphanumerics), arrows, math symbols — counts as non-CJK.
 */
const CJK = /[\p{Script=Han}\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\u3000-\u303F\uFF00-\uFFEF]/u;

/** Longest run of code points that are neither CJK nor whitespace. */
export function longestUnbreakableRun(text: string): number {
  let best = 0;
  let run = 0;
  for (const ch of text) {
    if (CJK.test(ch) || /\s/u.test(ch)) run = 0;
    else best = Math.max(best, ++run);
  }
  return best;
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
      longestUnbreakableRun(t) < UNBREAKABLE_MIN &&
      !isTableChoice(t, t)
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
