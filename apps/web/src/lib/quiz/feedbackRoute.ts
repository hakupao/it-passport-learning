// D-149 — /api/quiz/feedback (owner-only per-question problem reports).
//
//   POST { question_id, locale, category, note? } → 201 FeedbackRecord
//   GET  ?question_id=<id>                        → 200 { records } (newest first)
//
// Check order: POST from another site (`Sec-Fetch-Site` present and not same-origin, 403) →
// owner (D-148 cookie, 403) → Redis configured (503) → POST Content-Type not application/json (415)
// → POST body over FEEDBACK_MAX_BODY_BYTES (declared or read) / not UTF-8 (400) → body / query
// validation (400) → Redis failure (502). The 415 / cap / cross-site checks are D-217 H3 (lib/apiGuards.ts). Records are consumed + resolved offline by
// scripts/quiz-feedback.mjs (D-149 §4 repair loop).
//
// D-217 H3: the handlers live here so the `next dev` route (app/api/quiz/feedback/route.dev.ts) and
// the Cloudflare Worker (worker/index.ts) run the same code; env is read from process.env in both.

import { isCrossSiteWrite, isJsonContentType, readCappedBody } from "@/lib/apiGuards";
import { isOwnerRequest } from "@/lib/owner";
import {
  QUESTION_ID_RE,
  createFeedback,
  listFeedbackForQuestion,
  loadFeedbackRedis,
  validateFeedbackInput,
} from "@/lib/quiz/feedback";

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Redis/network failure → 502. Logs the error name only, like /api/learning (D-217 H3): an
 * UpstashError message embeds the command (`command was: [...]`, i.e. the record and its note) and
 * a parse error embeds the response body.
 */
function storeError(method: string, err: unknown): Response {
  console.error(
    "[quiz-feedback-store-error]",
    JSON.stringify({ method, error: err instanceof Error ? err.name : typeof err }),
  );
  return json(502, { error: "feedback store error" });
}

/** A valid body is ≤ ~3.2 KB (note ≤ 1000 chars × ≤ 3 UTF-8 bytes + the fields); 8 KiB leaves room. */
export const FEEDBACK_MAX_BODY_BYTES = 8192;

export async function POST(request: Request): Promise<Response> {
  if (isCrossSiteWrite(request)) return json(403, { error: "cross-site request" });
  if (!(await isOwnerRequest(request))) return json(403, { error: "forbidden" });
  const redis = await loadFeedbackRedis();
  if (!redis) return json(503, { error: "feedback store not configured" });
  if (!isJsonContentType(request)) return json(415, { error: "content-type must be application/json" });

  const text = await readCappedBody(request, FEEDBACK_MAX_BODY_BYTES);
  if (text === null) return json(400, { error: "invalid or oversized body" });
  let rawBody: unknown;
  try {
    rawBody = JSON.parse(text) as unknown;
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
