// Stage 7 Phase 2 §0-1 (D-193) — the topic page's light row. The page sends these instead of the
// full questions (the full text + explanations of ≤ 217 questions were the bulk of the 2.32 MB
// payload); the AI 先生 review fetches the full text of its ≤ REVIEW_MAX_WRONG wrong questions on
// open (GET /api/quiz/questions). Pure, client-safe.

import type { QuizQuestion } from "@/lib/quiz/quizModel";

export type TopicRow = Pick<QuizQuestion, "id" | "exam_id" | "source_label" | "correct_answer" | "terms">;

export function toTopicRow(q: QuizQuestion): TopicRow {
  return { id: q.id, exam_id: q.exam_id, source_label: q.source_label, correct_answer: q.correct_answer, terms: q.terms };
}
