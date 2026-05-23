// Phase 2 Step 6 — POST /api/quiz/explain (question scope, stateless single-turn SSE).
//
// Session 38 4Q-locked design:
//   Q1=a scope = question (page + entity pin per LOCKED D-089 §2.3 — assembleQuestion)
//   Q2=a body  = `{ question_id }` resolved via IndexV2.entity_by_id
//   Q3=a SSE response (reuses buildChatSseResponse from chat.ts)
//   Q4=a code first; chars/3 calibration + D-098 §2.2 v1.1 amend at Step 6 close
//
// D-097 firewall: gated by middleware Basic Auth (curl `-u claude:<pass>`).
// D-095 stable-prefix: question contextBlock → QUIZ_SYSTEM_INSTRUCTION → fixed prompt.
// D-088 §2.3 cache discipline: question scope yields a DIFFERENT prefix per
// question_id, so cross-question cache hits are NOT expected (per-question
// creation event each call). Within a single question_id, the prefix is stable
// so repeat calls SHOULD hit the cache.
//
// Runtime = nodejs (FsDataSource reads JSON via fs); maxDuration = 30s.

import { streamText } from "ai";
import { getDataSource, warmUp } from "@/lib/data";
import { assembleQuestion } from "@/lib/data/assembleScope";
import {
  buildMessagesWithStablePrefix,
  getActiveProvider,
  getModel,
  getPhase2ProviderOptions,
  readCacheUsage,
} from "@/lib/ai/provider";
import { buildChatSseResponse } from "@/lib/ai/chat";
import {
  QUIZ_EXPLAIN_USER_PROMPT,
  QUIZ_SYSTEM_INSTRUCTION,
  validateQuizExplainRequestBody,
} from "@/lib/ai/quiz";
import { STREAM_CONFIG } from "@/lib/ai/retry";
import { evaluateCacheTripwire, recordTripwireEvent } from "@/lib/ai/tripwire";
import { recordCapEvent } from "@/lib/ai/cap";

export const runtime = "nodejs";
export const maxDuration = 30;

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "invalid JSON body");
  }

  const parsed = validateQuizExplainRequestBody(rawBody);
  if (!parsed.ok) {
    return jsonError(400, parsed.error);
  }

  await warmUp();
  const ds = getDataSource();
  const idx = await ds.loadIndex();
  const ref = idx.entity_by_id[parsed.body.question_id];
  if (!ref) {
    return jsonError(
      404,
      `question_id "${parsed.body.question_id}" not found in entity index`,
    );
  }
  if (ref.type !== "question") {
    return jsonError(
      400,
      `entity "${parsed.body.question_id}" has type "${ref.type}", expected "question"`,
    );
  }

  let scope;
  try {
    scope = await assembleQuestion(ds, ref.page, ref.entity_index);
  } catch (err) {
    return jsonError(
      500,
      `assembleQuestion failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const provider = getActiveProvider();
  const result = streamText({
    model: getModel("quiz"),
    maxRetries: STREAM_CONFIG.maxRetries,
    // D-105 §2.1 — V4 flash with thinking enabled + reasoningEffort='high'
    // = legacy `deepseek-reasoner` parity. Anthropic SDK ignores the
    // `deepseek` namespace, so this is safe on either provider path.
    providerOptions: getPhase2ProviderOptions("quiz"),
    messages: buildMessagesWithStablePrefix(
      scope.contextBlock,
      QUIZ_SYSTEM_INSTRUCTION,
      QUIZ_EXPLAIN_USER_PROMPT,
    ),
    onFinish: ({ usage, providerMetadata }) => {
      console.log(
        "[quiz/explain]",
        JSON.stringify({
          provider,
          scope: "question",
          question_id: parsed.body.question_id,
          page: ref.page,
          entity_index: ref.entity_index,
          tokenEstimate: scope.tokenEstimate,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          providerMetadata,
        }),
      );
      const tripwire = evaluateCacheTripwire({
        usage: readCacheUsage(providerMetadata),
        totalInputTokens: typeof usage.inputTokens === "number"
          ? usage.inputTokens
          : null,
        route: "/api/quiz/explain",
      });
      if (tripwire !== null) recordTripwireEvent(tripwire);
      void recordCapEvent({
        route: "/api/quiz/explain",
        role: "quiz",
        usage: {
          inputTokens:
            typeof usage.inputTokens === "number" ? usage.inputTokens : null,
          outputTokens:
            typeof usage.outputTokens === "number" ? usage.outputTokens : null,
        },
        cache: readCacheUsage(providerMetadata),
      });
    },
  });

  return buildChatSseResponse({
    textStream: result.textStream,
    usagePromise: result.usage,
    providerMetadataPromise: result.providerMetadata as PromiseLike<
      Record<string, unknown> | undefined
    >,
    provider,
  });
}

export async function GET(): Promise<Response> {
  const provider = getActiveProvider();
  const expectedKey =
    provider === "anthropic" ? "ANTHROPIC_API_KEY" : "DEEPSEEK_API_KEY";
  return new Response(
    `POST { "question_id": "<entity_by_id key, e.g. page_042_entity_0>" } to this endpoint.\n` +
      `SSE response: text deltas as { type: 'delta', text }, then a final\n` +
      `{ type: 'usage', cacheCreationInputTokens, cacheReadInputTokens, ... } frame,\n` +
      `then [DONE].\n` +
      `Active provider (env LLM_PROVIDER): ${provider}\n` +
      `Active quiz model: ${
        provider === "anthropic"
          ? "claude-opus-4-7"
          : "deepseek-v4-flash (thinking enabled, reasoningEffort=high)"
      }\n` +
      `Required env var on this deploy: ${expectedKey}\n` +
      `D-097 firewall: request must include Basic Auth header.\n` +
      `D-095 stable-prefix: corpus (question + page context) → instruction → fixed prompt.\n` +
      `D-089 §2.3 scope: question entity + full page_context (other entities on same page).\n`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-LLM-Provider": provider,
      },
    },
  );
}
