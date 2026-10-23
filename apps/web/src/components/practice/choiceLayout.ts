// Stage 7 Phase 1 Task 8 — pure helpers of the practice question face (bundler-safe, no I/O).
//
//   - choiceLayout (§0-15): every choice's JP text has ≤ 12 code points once whitespace is removed,
//     no newline, is not a table (isTableChoice), and there are no choice_figures → "row4" (4 columns,
//     the exam booklet's short-choice layout); choice_figures → "grid2" (2 × 2); otherwise "list".
//   - explanationTitle (§0-16): the part of points[0] before the first 「。」 (the whole point when it
//     has none), shown when it is 1–30 code points; otherwise null (the title is only 「問 N」).
//   - sourceNumber: the question number of the source exam (the NNN of `<exam_id>-qNNN`, which is the
//     問N of source_label — pinned for all 2900 by choiceLayout.test.ts).

import { isTableChoice } from "@/components/quiz/QuizRichText";
import { CHOICE_LETTERS, type QuizQuestion } from "@/lib/quiz/quizModel";

export type ChoiceLayout = "row4" | "grid2" | "list";

const SHORT_MAX = 12;
const TITLE_MAX = 30;

const codePoints = (s: string): number => [...s].length;

export function choiceLayout(q: QuizQuestion): ChoiceLayout {
  if (q.choice_figures) return "grid2";
  const short = CHOICE_LETTERS.every((L) => {
    const t = q.choices_jp[L] ?? "";
    return !t.includes("\n") && codePoints(t.replace(/\s/g, "")) <= SHORT_MAX && !isTableChoice(t, t);
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
