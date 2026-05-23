// Phase 2 Step 9 — POST /api/chat (whole-book scope, AI SDK v6 data stream).
//
// Session 41 4Q-locked design (Q1=a AI SDK data stream + useChat):
//   - Request body shape changed from the Step 5 `{scope, userMessage}` envelope
//     to the AI SDK v6 `{messages: UIMessage[]}` shape that the `useChat` hook
//     auto-posts. Multi-turn conversation history is now preserved client-side
//     in localStorage (D-085 §2.2 Resume contract) and shipped on every call.
//   - The Step 5 stable-prefix layout (corpus → SYSTEM_INSTRUCTION → user) is
//     inlined here rather than going through `buildMessagesWithStablePrefix`,
//     because that helper signs against a single `userMessage: string`; the
//     conversation `UIMessage[]` is spread after the two system messages so the
//     cached prefix (corpus + instruction) stays byte-identical across turns,
//     which is the precondition for DeepSeek's automatic prefix cache and
//     Anthropic's ephemeral block cache (D-095 §2.3).
//   - SSE wire format is now AI SDK v6's UI message stream protocol (managed by
//     `toUIMessageStreamResponse`), NOT the Step 5 custom `{type:"delta",text}`
//     framing. `useChat` consumes this natively.
//   - D-088 §2.4 user-surface contract honoured via `toUIMessageStreamResponse`
//     `onError` returning the locked Chinese fallback through `formatUserFacingError`.
//   - D-091 §2.5(β) cache-hit tripwire eval retained in `onFinish` —
//     `toUIMessageStreamResponse({ onFinish })` exposes `usage` +
//     `providerMetadata` so tripwire telemetry survives the migration.
//   - The other 3 routes (`/api/{hello-ai, quiz/explain, glossary/hover}`)
//     remain on the Step 5 `buildChatSseResponse` encoder because their UI
//     consumers (Step 10 modal, Step 11 popover) are single-shot, not useChat-
//     based, and would gain nothing from the AI SDK data-stream protocol
//     overhead.
//
// Runtime = nodejs (FsDataSource reads JSON via fs); maxDuration = 30s.

import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getDataSource, warmUp } from "@/lib/data";
import { assembleWholeBook } from "@/lib/data/assembleScope";
import {
  getActiveProvider,
  getModel,
  getPhase2ProviderOptions,
  readCacheUsage,
} from "@/lib/ai/provider";
import { STREAM_CONFIG, formatUserFacingError } from "@/lib/ai/retry";
import { evaluateCacheTripwire, recordTripwireEvent } from "@/lib/ai/tripwire";
import { recordCapEvent } from "@/lib/ai/cap";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_INSTRUCTION = [
  "You are a tutor for Japanese IT Passport (ITパスポート) exam learners.",
  "The corpus block above is the trilingual (jp+zh+en) whole-book content:",
  "all 554 pages plus the locked glossary index.",
  "Use it as the single source of truth — do not invent facts not grounded in",
  "the corpus.",
  "Reply in Japanese unless the user writes primarily in English or Chinese,",
  "in which case mirror the user's language.",
  "Keep replies concise (≤200 tokens) unless explicitly asked to expand.",
].join("\n");

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

interface ChatRequestBody {
  messages: UIMessage[];
}

function validateRequestBody(raw: unknown): ChatRequestBody | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as { messages?: unknown };
  if (!Array.isArray(body.messages) || body.messages.length === 0) return null;
  return { messages: body.messages as UIMessage[] };
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "invalid JSON body");
  }

  const parsed = validateRequestBody(rawBody);
  if (!parsed) {
    return jsonError(
      400,
      'request body must include a non-empty `messages: UIMessage[]` array',
    );
  }

  await warmUp();
  const ds = getDataSource();
  const wholeBook = await assembleWholeBook(ds);

  const provider = getActiveProvider();
  const conversation = await convertToModelMessages(parsed.messages);

  const result = streamText({
    model: getModel("chat"),
    maxRetries: STREAM_CONFIG.maxRetries,
    abortSignal: request.signal,
    // D-105 §2.1 — V4 flash with thinking disabled = legacy `deepseek-chat`
    // non-thinking parity. Anthropic SDK ignores the `deepseek` namespace,
    // so the same options object is safe to pass on either provider path.
    providerOptions: getPhase2ProviderOptions("chat"),
    messages: [
      {
        role: "system",
        content: wholeBook.contextBlock,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      {
        role: "system",
        content: SYSTEM_INSTRUCTION,
      },
      ...conversation,
    ],
    onFinish: ({ usage, providerMetadata }) => {
      console.log(
        "[chat]",
        JSON.stringify({
          provider,
          scope: "whole-book",
          turnCount: parsed.messages.length,
          tokenEstimate: wholeBook.tokenEstimate,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          providerMetadata,
        }),
      );
      const tripwire = evaluateCacheTripwire({
        usage: readCacheUsage(providerMetadata),
        totalInputTokens:
          typeof usage.inputTokens === "number" ? usage.inputTokens : null,
        route: "/api/chat",
      });
      if (tripwire !== null) recordTripwireEvent(tripwire);
      void recordCapEvent({
        route: "/api/chat",
        role: "chat",
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

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      // D-088 §2.4 user-surface contract: emit the locked Chinese fallback
      // message, NOT the raw provider error. The raw error is still logged
      // separately for debug visibility via `vercel logs`.
      console.error("[/api/chat] stream error", error);
      return formatUserFacingError(error);
    },
    headers: {
      "X-LLM-Provider": provider,
    },
  });
}

export async function GET(): Promise<Response> {
  const provider = getActiveProvider();
  const expectedKey =
    provider === "anthropic" ? "ANTHROPIC_API_KEY" : "DEEPSEEK_API_KEY";
  return new Response(
    `POST { "messages": UIMessage[] } to this endpoint.\n` +
      `SSE response: AI SDK v6 UI message stream protocol (text-delta, ` +
      `start, finish frames). Consume via @ai-sdk/react useChat hook.\n` +
      `Active provider (env LLM_PROVIDER): ${provider}\n` +
      `Required env var on this deploy: ${expectedKey}\n` +
      `D-097 firewall: request must include Basic Auth header.\n` +
      `D-095 stable-prefix layout (corpus → instruction → conversation) is applied.\n`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-LLM-Provider": provider,
      },
    },
  );
}
