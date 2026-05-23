// Phase 4 Module B Step B.4 — POST /api/tutor (AI 学習助手 endpoint).
//
// Ships the tutor brain end-to-end:
//   - 3-way env-routable model selection per D-104 §2.1 (DeepSeek V4 pro
//     default / Anthropic Sonnet 4.6 toggle / OpenAI reserved-stub) via
//     `getTutorModel` + `getTutorProviderOptions`.
//   - `buildTutorMessages(ctx, conversation)` composes the nested-breakpoint
//     cache layout per D-103 §2.4 + LD-Module-B-5: SYSTEM (outer cache
//     breakpoint) + preamble (inner breakpoint) + conversation suffix.
//     LD-Module-B-13 SYSTEM bulk ensures Anthropic's 1024-token cache
//     threshold is engaged on the toggle path.
//   - AI SDK v6 UI message stream protocol (`toUIMessageStreamResponse`) so
//     the Module C `<Tutor />` surface can drive it via `useChat`. Same
//     wire-format posture as `/api/chat` (Phase 2 Step 9 D-097-firewall-
//     compatible).
//   - Tripwire + cap recording on `onFinish` (β cache-hit tripwire +
//     D-103 §2.5 cost tripwire G7).
//
// Request body shape (validated below):
//   {
//     "tutorContext": TutorContext,                        // user state from progressStore
//     "messages": UIMessage[],                             // useChat conversation history
//     "escalate"?: boolean                                 // optional reasoning bump per D-104 §2.2
//   }
//
// D-097 firewall (middleware Basic Auth) passes through; tutor route is not
// in the public allowlist so it sits behind the same gate as Phase 2 routes.
//
// Runtime = nodejs (Anthropic / DeepSeek SDK + future provider fan-out);
// maxDuration = 60s (tutor turns are longer than Phase 2 routes — V4 pro
// thinking:high observed ~28-31s/call in B.3 dry-run; Anthropic ~7-8s/call;
// 60s ceiling absorbs the upper-bound for a single turn with retry).

import { convertToModelMessages, streamText } from "ai";
import {
  getActiveTutorProvider,
  getTutorModel,
  getTutorProviderOptions,
  readCacheUsage,
} from "@/lib/ai/provider";
import { buildTutorMessages } from "@/lib/ai/tutorPrompt";
import { validateTutorRequestBody } from "@/lib/ai/tutorRequest";
import { STREAM_CONFIG, formatUserFacingError } from "@/lib/ai/retry";
import { evaluateCacheTripwire, recordTripwireEvent } from "@/lib/ai/tripwire";
import { recordCapEvent } from "@/lib/ai/cap";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const parsed = validateTutorRequestBody(rawBody);
  if (!parsed.ok) {
    return jsonError(400, parsed.error);
  }

  const provider = getActiveTutorProvider();
  const conversation = await convertToModelMessages(parsed.body.messages);
  const tutorMessages = buildTutorMessages(parsed.body.tutorContext, conversation);

  // D-104 §2.2 — escalation semantics differ by provider:
  //   - DeepSeek: reasoningEffort: high → max (same model)
  //   - Anthropic: Sonnet 4.6 → Opus 4.7 (model swap)
  // Both are wired through the same `escalate` flag below; getTutorModel +
  // getTutorProviderOptions encapsulate the provider-specific dispatch.
  const modelOpts = { escalate: parsed.body.escalate };

  const result = streamText({
    model: getTutorModel(modelOpts),
    maxRetries: STREAM_CONFIG.maxRetries,
    abortSignal: request.signal,
    providerOptions: getTutorProviderOptions(modelOpts),
    messages: tutorMessages,
    onFinish: ({ usage, providerMetadata }) => {
      console.log(
        "[tutor]",
        JSON.stringify({
          provider,
          turnCount: parsed.body.messages.length,
          escalate: parsed.body.escalate,
          ctxCompleted: parsed.body.tutorContext.completedChapters.length,
          ctxInProgress: parsed.body.tutorContext.inProgressChapters.length,
          ctxPending: parsed.body.tutorContext.pendingChapters.length,
          ctxRecentQuiz: parsed.body.tutorContext.recentQuiz.length,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          providerMetadata,
        }),
      );
      const cacheUsage = readCacheUsage(providerMetadata);
      const tripwire = evaluateCacheTripwire({
        usage: cacheUsage,
        totalInputTokens:
          typeof usage.inputTokens === "number" ? usage.inputTokens : null,
        route: "/api/tutor",
      });
      if (tripwire !== null) recordTripwireEvent(tripwire);
      void recordCapEvent({
        route: "/api/tutor",
        role: "tutor",
        usage: {
          inputTokens:
            typeof usage.inputTokens === "number" ? usage.inputTokens : null,
          outputTokens:
            typeof usage.outputTokens === "number" ? usage.outputTokens : null,
        },
        cache: cacheUsage,
      });
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("[/api/tutor] stream error", error);
      return formatUserFacingError(error);
    },
    headers: {
      "X-LLM-Provider": provider,
      "X-LLM-Role": "tutor",
    },
  });
}

export async function GET(): Promise<Response> {
  const provider = getActiveTutorProvider();
  const expectedKey =
    provider === "anthropic"
      ? "ANTHROPIC_API_KEY"
      : provider === "openai"
        ? "n/a (reserved-stub — throws at POST time per LD-Module-B-11)"
        : "DEEPSEEK_API_KEY";
  const activeModel =
    provider === "anthropic"
      ? "claude-sonnet-4-6 (escalation → claude-opus-4-7)"
      : provider === "openai"
        ? "(none — LD-Module-B-11 reserved Phase 5 stub)"
        : "deepseek-v4-pro (thinking enabled, reasoningEffort=high; escalate → max)";
  return new Response(
    `POST { "tutorContext": TutorContext, "messages": UIMessage[], "escalate"?: boolean } to this endpoint.\n` +
      `SSE response: AI SDK v6 UI message stream protocol (text-delta, ` +
      `start, finish frames). Consume via @ai-sdk/react useChat hook.\n` +
      `Active tutor provider (env LLM_PROVIDER_TUTOR): ${provider}\n` +
      `Active tutor model: ${activeModel}\n` +
      `Required env var on this deploy: ${expectedKey}\n` +
      `D-097 firewall: request must include Basic Auth header.\n` +
      `D-103 §2.4 nested-breakpoint cache layout applied (SYSTEM outer + preamble inner).\n` +
      `D-104 §2.1 3-way env-routable matrix; D-104 §2.5 separate LLM_PROVIDER_TUTOR env.\n`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-LLM-Provider": provider,
        "X-LLM-Role": "tutor",
      },
    },
  );
}
