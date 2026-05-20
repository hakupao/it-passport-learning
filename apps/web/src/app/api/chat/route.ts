// Phase 2 Step 5 — POST /api/chat (whole-book scope, stateless single-turn SSE).
//
// Session 37 4Q-locked design:
//   Q1=a scope = whole-book only (assembleWholeBook from Step 3)
//   Q2=a stateless single-turn SSE { scope, userMessage } → text deltas + final
//        usage frame
//   Q3=a curl-only smoke this session; UI deferred to Module C
//   Q4=a code green + N≥3 真 call retro 轻 (cache hit baseline + chars/N calibration)
//
// D-097 firewall: route at `/api/chat` is gated by middleware Basic Auth;
// smoke calls require `-u claude:<pass>` header.
//
// D-095 stable-prefix: whole-book corpus block goes first as system, then the
// short per-session instruction, then user message. Maximises DeepSeek server-
// side automatic prefix cache + Anthropic ephemeral block cache (via the
// providerOptions.anthropic namespace on the corpus message) simultaneously.
//
// Runtime = nodejs (FsDataSource reads JSON via fs); maxDuration = 30s.

import { streamText } from "ai";
import { getDataSource, warmUp } from "@/lib/data";
import { assembleWholeBook } from "@/lib/data/assembleScope";
import {
  buildMessagesWithStablePrefix,
  getActiveProvider,
  getModel,
} from "@/lib/ai/provider";
import {
  buildChatSseResponse,
  validateChatRequestBody,
} from "@/lib/ai/chat";

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

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "invalid JSON body");
  }

  const parsed = validateChatRequestBody(rawBody);
  if (!parsed.ok) {
    return jsonError(400, parsed.error);
  }

  await warmUp();
  const ds = getDataSource();
  const wholeBook = await assembleWholeBook(ds);

  const provider = getActiveProvider();
  const result = streamText({
    model: getModel("chat"),
    messages: buildMessagesWithStablePrefix(
      wholeBook.contextBlock,
      SYSTEM_INSTRUCTION,
      parsed.body.userMessage,
    ),
    onFinish: ({ usage, providerMetadata }) => {
      console.log(
        "[chat]",
        JSON.stringify({
          provider,
          scope: "whole-book",
          tokenEstimate: wholeBook.tokenEstimate,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          providerMetadata,
        }),
      );
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
    `POST { "scope": "whole-book", "userMessage": "<text>" } to this endpoint.\n` +
      `SSE response: text deltas as { type: 'delta', text }, then a final\n` +
      `{ type: 'usage', cacheCreationInputTokens, cacheReadInputTokens, ... } frame,\n` +
      `then [DONE].\n` +
      `Active provider (env LLM_PROVIDER): ${provider}\n` +
      `Required env var on this deploy: ${expectedKey}\n` +
      `D-097 firewall: request must include Basic Auth header.\n` +
      `D-095 stable-prefix layout (corpus → instruction → user) is applied.\n`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-LLM-Provider": provider,
      },
    },
  );
}
