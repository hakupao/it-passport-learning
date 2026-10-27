// Stage 7 Phase 1 Task 8 — pure helpers of the practice question face (bundler-safe, no I/O).
//
//   - choiceLayout (§0-15, OQ-13 / D-194): choice_figures → "grid2" (2 × 2); otherwise "list" (one
//     choice per line). The 4-column "row4" and its width / line estimate (OQ-09 / OQ-10, D-191) are
//     gone: the answer screen is one column and a text choice always has the full width.
//   - explanationTitle (§0-16): the part of points[0] before the first 「。」 (the whole point when it
//     has none), shown when it is 1–30 code points; otherwise null (the title is only 「問 N」).
//   - sourceNumber: the question number of the source exam (the NNN of `<exam_id>-qNNN`, which is the
//     問N of source_label — pinned for all 2900 by choiceLayout.test.ts).

import type { QuizQuestion } from "@/lib/quiz/quizModel";

/** BCP 47 tag of a UI locale's text (lang attributes of the face and the explanation) */
export const LANG_TAG: Record<string, string> = { ja: "ja", zh: "zh-Hans", en: "en" };

export type ChoiceLayout = "grid2" | "list";

const TITLE_MAX = 30;

const codePoints = (s: string): number => [...s].length;

export function choiceLayout(q: QuizQuestion): ChoiceLayout {
  return q.choice_figures ? "grid2" : "list";
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
