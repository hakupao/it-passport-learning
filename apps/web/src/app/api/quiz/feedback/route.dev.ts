// D-149 — /api/quiz/feedback (owner-only per-question problem reports).
//
//   POST { question_id, locale, category, note? } → 201 FeedbackRecord
//   GET  ?question_id=<id>                        → 200 { records } (newest first)
//
// Check order: owner (D-148 cookie, 403) → Redis configured (503) → body /
// query validation (400) → Redis failure (502). Records are consumed + resolved offline by
// scripts/quiz-feedback.mjs (D-149 §4 repair loop).

import { isOwnerRequest } from "@/lib/owner";
import {
  QUESTION_ID_RE,
  createFeedback,
  listFeedbackForQuestion,
  loadFeedbackRedis,
  validateFeedbackInput,
} from "@/lib/quiz/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Redis/network failure → 502. Logs the error message only (no env / creds). */
function storeError(method: string, err: unknown): Response {
  console.error(
    "[quiz-feedback-store-error]",
    JSON.stringify({ method, error: err instanceof Error ? err.message : String(err) }),
  );
  return json(502, { error: "feedback store error" });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await isOwnerRequest(request))) return json(403, { error: "forbidden" });
  const redis = await loadFeedbackRedis();
  if (!redis) return json(503, { error: "feedback store not configured" });

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json(400, { error: "invalid JSON body" });
  }
  const parsed = validateFeedbackInput(rawBody);
  if (!parsed.ok) return json(400, { error: parsed.error });

  try {
    const record = await createFeedback(redis, parsed.value);
    return json(201, record);
  } catch (err) {
    return storeError("POST", err);
  }
}

export async function GET(request: Request): Promise<Response> {
  if (!(await isOwnerRequest(request))) return json(403, { error: "forbidden" });
  const redis = await loadFeedbackRedis();
  if (!redis) return json(503, { error: "feedback store not configured" });

  const questionId = new URL(request.url).searchParams.get("question_id") ?? "";
  if (!QUESTION_ID_RE.test(questionId)) {
    return json(400, { error: "invalid question_id" });
  }
  try {
    const records = await listFeedbackForQuestion(redis, questionId);
    return json(200, { records });
  } catch (err) {
    return storeError("GET", err);
  }
}
