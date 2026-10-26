// Stage 7 Phase 2 §0-1 (D-193) — /api/quiz/questions: the full text of the AI 先生 topic review's
// wrong questions (the topic page sends light rows only, lib/practice/topicRows).
//
//   GET ?topic=<topic_id>&ids=<question_id>,…
//     → 200 { questions: QuizQuestion[] } (translations + explanations merged, request order)
//
// Empty id segments are dropped; then 0 ids or more than REVIEW_MAX_WRONG, an id that is not
// QUESTION_ID_RE-shaped or not a question of `topic`, or an unknown topic → 400. Always
// `no-store` (the review is opened rarely and per learner). Read-only: the committed corpus
// (memoized loaders) — no LLM, no owner gate, no cookies. A failed load → 500; the log names
// the error type only.

import { loadQuestionsByIds } from "@/lib/practice/practiceReader";
import { QUESTION_ID_RE } from "@/lib/quiz/feedbackModel";
import { loadBaseQuestions, loadQuizIndex } from "@/lib/quiz/quizReader";
import { REVIEW_MAX_WRONG } from "@/lib/sensei/anchors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const topic = params.get("topic") ?? "";
  const ids = (params.get("ids") ?? "").split(",").filter((id) => id !== "");
  if (ids.length === 0) return json(400, { error: "ids required" });
  if (ids.length > REVIEW_MAX_WRONG) return json(400, { error: `at most ${REVIEW_MAX_WRONG} ids` });
  if (!ids.every((id) => QUESTION_ID_RE.test(id))) return json(400, { error: "invalid id" });

  try {
    const [index, base] = await Promise.all([loadQuizIndex(), loadBaseQuestions()]);
    if (!index.topics.some((t) => t.topic_id === topic)) return json(400, { error: "unknown topic" });
    const inTopic = new Set(base.filter((q) => q.topic_id === topic).map((q) => q.id));
    if (!ids.every((id) => inTopic.has(id))) return json(400, { error: "id not in topic" });
    return json(200, { questions: await loadQuestionsByIds(ids) });
  } catch (err) {
    console.error("[quiz-questions-error]", JSON.stringify({ error: err instanceof Error ? err.name : typeof err }));
    return json(500, { error: "questions unavailable" });
  }
}
