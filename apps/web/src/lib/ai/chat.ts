// Phase 2 Step 5 — SSE encoder + request validator for /api/chat.
//
// Session 37 4Q-locked design (Q2=a stateless single-turn SSE):
//   wire format = `data: {...}\n\n` events on text/event-stream
//     - delta:   { "type": "delta", "text": "..." }
//     - usage:   { "type": "usage", ...cache metadata + token totals }
//     - done:    `data: [DONE]\n\n`
//
// This module is decoupled from the AI SDK type surface on purpose — it
// accepts a plain `{ textStream, usagePromise, providerMetadataPromise }`
// shape so vitest can drive it with mock async iterables + promises.

import type { ProviderKind, CacheUsageReport } from "./provider";
import { readCacheUsage } from "./provider";

export interface ChatRequestBody {
  scope: "whole-book";
  userMessage: string;
}

export type ChatBodyValidation =
  | { ok: true; body: ChatRequestBody }
  | { ok: false; error: string };

/** Step 5 hard cap; whole-book corpus prefix already dominates the input. */
export const USER_MESSAGE_MAX_LENGTH = 8192;

export function validateChatRequestBody(raw: unknown): ChatBodyValidation {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "request body must be a JSON object" };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.scope !== "whole-book") {
    return {
      ok: false,
      error:
        `unsupported scope "${String(obj.scope)}": Step 5 supports only "whole-book"`,
    };
  }
  if (typeof obj.userMessage !== "string") {
    return { ok: false, error: "userMessage must be a string" };
  }
  if (obj.userMessage.length === 0) {
    return { ok: false, error: "userMessage must be a non-empty string" };
  }
  if (obj.userMessage.length > USER_MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `userMessage exceeds ${USER_MESSAGE_MAX_LENGTH} character limit`,
    };
  }
  return {
    ok: true,
    body: { scope: "whole-book", userMessage: obj.userMessage },
  };
}

export interface ChatDeltaFrame {
  type: "delta";
  text: string;
}

export interface ChatUsageFrame {
  type: "usage";
  provider: CacheUsageReport["provider"];
  cacheCreationInputTokens: number | null;
  cacheReadInputTokens: number | null;
  cacheMissInputTokens: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}

export interface ChatErrorFrame {
  type: "error";
  message: string;
}

export interface StreamTokenUsage {
  inputTokens?: number | undefined;
  outputTokens?: number | undefined;
  totalTokens?: number | undefined;
}

export interface BuildChatSseArgs {
  textStream: AsyncIterable<string>;
  /**
   * `PromiseLike` rather than `Promise` because the AI SDK exposes its
   * settled-resolution properties (`result.usage`, `result.providerMetadata`)
   * as `PromiseLike<T>` to allow synchronous unwrap in some adapters.
   * We only need `await` + `Promise.all` here, both of which accept
   * `PromiseLike`.
   */
  usagePromise: PromiseLike<StreamTokenUsage>;
  providerMetadataPromise: PromiseLike<Record<string, unknown> | undefined>;
  provider: ProviderKind;
}

function encode(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

const DONE_FRAME = new TextEncoder().encode("data: [DONE]\n\n");

function numericOrNull(n: number | undefined): number | null {
  return typeof n === "number" ? n : null;
}

export function buildChatSseResponse(args: BuildChatSseArgs): Response {
  const { textStream, usagePromise, providerMetadataPromise, provider } = args;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of textStream) {
          if (chunk) {
            const frame: ChatDeltaFrame = { type: "delta", text: chunk };
            controller.enqueue(encode(frame));
          }
        }
        const [usage, providerMetadata] = await Promise.all([
          usagePromise,
          providerMetadataPromise,
        ]);
        const cacheUsage = readCacheUsage(providerMetadata);
        const usageFrame: ChatUsageFrame = {
          type: "usage",
          provider: cacheUsage.provider,
          cacheCreationInputTokens: cacheUsage.cacheCreationInputTokens,
          cacheReadInputTokens: cacheUsage.cacheReadInputTokens,
          cacheMissInputTokens: cacheUsage.cacheMissInputTokens,
          inputTokens: numericOrNull(usage.inputTokens),
          outputTokens: numericOrNull(usage.outputTokens),
          totalTokens: numericOrNull(usage.totalTokens),
        };
        controller.enqueue(encode(usageFrame));
        controller.enqueue(DONE_FRAME);
      } catch (err) {
        const errFrame: ChatErrorFrame = {
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        };
        controller.enqueue(encode(errFrame));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-LLM-Provider": provider,
    },
  });
}
