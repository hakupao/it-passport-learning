// D-217 H1-3 — what /[locale]/mock/run shows for a URL query, worked out in the browser from the
// static data (lib/staticData) as the server page did:
//   - parseMockScope over index.json; none → "notFound" when `exam=` was given (an unknown exam),
//     else "replace" back to /mock (was a server redirect).
//   - the exam's ids (examMockIds) or the drawn ids → the exam shards without explanations (§0-3:
//     the result's rows link to /practice/q/<id>); every id must resolve to a question (R3), else
//     "notFound".
//   - ★ per topic, the exam label, the 中問 fold points (index.json's groups).
// A failed load rejects (the view shows the load error).

import type { StaticData } from "../staticData/client";
import type { StaticLocale } from "../staticData/shards";
import type { QuizQuestion } from "../quiz/quizModel";
import { topicStars, type Stars } from "../practice/practiceIndex";
import { foldPlan, type SearchParams } from "../practice/practiceSession";
import { examMockIds } from "./mockModel";
import { parseMockScope } from "./mockScope";

export type MockData = Pick<StaticData, "fetchQuizIndex" | "fetchQuestions">;

export interface MockRunView {
  kind: "run";
  /** one MockRun per question list */
  key: string;
  scopeKind: "exam" | "random";
  examId: string | null;
  examLabel: string | null;
  questions: QuizQuestion[];
  folds: Record<string, number>;
  stars: Record<string, Stars>;
}

export type MockView = MockRunView | { kind: "notFound" } | { kind: "replace"; href: "/mock" };

export async function resolveMockView(sp: SearchParams, locale: StaticLocale, data: MockData): Promise<MockView> {
  const index = await data.fetchQuizIndex();
  const base = index.questions.map(([id, exam_id]) => ({ id, exam_id }));
  const validExams = new Set(index.exams.map((e) => e.exam_id));
  const scope = parseMockScope(sp, new Set(base.map((q) => q.id)), validExams);
  if (!scope) return sp.exam !== undefined ? { kind: "notFound" } : { kind: "replace", href: "/mock" };

  const ids = scope.kind === "exam" ? examMockIds(scope.examId, base) : scope.ids;
  const questions = ids.length === 0 ? [] : await data.fetchQuestions(ids, locale, { explanations: false });
  if (ids.length === 0 || questions.length !== ids.length) return { kind: "notFound" };

  const allStars = topicStars(index);
  const stars: Record<string, Stars> = {};
  for (const q of questions) stars[q.topic_id] = allStars[q.topic_id] ?? 1;
  const examId = scope.kind === "exam" ? scope.examId : null;
  return {
    kind: "run",
    key: ids.join(","),
    scopeKind: scope.kind,
    examId,
    examLabel: examId === null ? null : (index.exams.find((e) => e.exam_id === examId)?.label_jp ?? examId),
    questions,
    folds: foldPlan(ids, index.chumonGroups),
    stars,
  };
}
