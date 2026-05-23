// Phase 4 Module B Step B.4 — request-body validator for /api/tutor.
//
// Extracted from `app/api/tutor/route.ts` because Next.js route modules
// forbid non-route exports — only `GET / POST / HEAD / PUT / DELETE / PATCH /
// OPTIONS` + a small set of runtime config exports are allowed at the route
// module level. Extracting the validator here keeps the route file
// route-only while preserving testability via direct vitest imports.

import type { UIMessage } from "ai";
import type { TutorContext } from "@/lib/tutor/tutorContext";

export interface TutorRequestBody {
  tutorContext: TutorContext;
  messages: UIMessage[];
  escalate: boolean;
}

function isChapterSummaryArray(v: unknown): boolean {
  if (!Array.isArray(v)) return false;
  for (const item of v) {
    if (!item || typeof item !== "object") return false;
    const c = item as Record<string, unknown>;
    if (typeof c.nn !== "string") return false;
    if (typeof c.title !== "string") return false;
  }
  return true;
}

function isQuizAttemptArray(v: unknown): boolean {
  if (!Array.isArray(v)) return false;
  for (const item of v) {
    if (!item || typeof item !== "object") return false;
    const q = item as Record<string, unknown>;
    if (typeof q.questionId !== "string") return false;
    if (typeof q.lastAnswered !== "string") return false;
    if (typeof q.correct !== "boolean") return false;
  }
  return true;
}

/**
 * Validate the JSON body POSTed to `/api/tutor`. Defensive across the
 * `TutorContext` shape (chapter buckets + recentQuiz) + `messages` array
 * shape; returns either a typed `body` or a string `error` for jsonError
 * relay. Escalate normalises to a strict boolean (non-true → false).
 */
export function validateTutorRequestBody(
  raw: unknown,
): { ok: true; body: TutorRequestBody } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "request body must be a JSON object" };
  }
  const body = raw as Record<string, unknown>;

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return {
      ok: false,
      error: "`messages` must be a non-empty UIMessage[] array",
    };
  }

  const ctx = body.tutorContext;
  if (!ctx || typeof ctx !== "object") {
    return {
      ok: false,
      error: "`tutorContext` must be an object with chapter buckets + recentQuiz",
    };
  }
  const c = ctx as Record<string, unknown>;
  if (!isChapterSummaryArray(c.completedChapters)) {
    return { ok: false, error: "`tutorContext.completedChapters` invalid" };
  }
  if (!isChapterSummaryArray(c.inProgressChapters)) {
    return { ok: false, error: "`tutorContext.inProgressChapters` invalid" };
  }
  if (!isChapterSummaryArray(c.pendingChapters)) {
    return { ok: false, error: "`tutorContext.pendingChapters` invalid" };
  }
  if (!isQuizAttemptArray(c.recentQuiz)) {
    return { ok: false, error: "`tutorContext.recentQuiz` invalid" };
  }

  const escalate = body.escalate === true;
  return {
    ok: true,
    body: {
      tutorContext: ctx as TutorContext,
      messages: body.messages as UIMessage[],
      escalate,
    },
  };
}
