// Phase 2 Step 5 / Step 9 — single-shot SSE encoder for /api/{hello-ai,
// quiz/explain, glossary/hover}.
//
// Originally Step 5 hosted both an `/api/chat` request validator and a custom
// SSE encoder here. Step 9 migrated `/api/chat` to the AI SDK v6 UI message
// stream protocol (consumed by useChat), so the validator + ChatRequestBody
// type were retired (no other caller).
//
// The single-shot encoder below is still in use by 3 routes whose UIs (Step 10
// modal, Step 11 popover) are NOT multi-turn chat surfaces and have nothing to
// gain from the AI SDK data-stream protocol. The wire format remains:
//   `data: {...}\n\n` events on text/event-stream
//     - delta:   { "type": "delta", "text": "..." }
//     - usage:   { "type": "usage", ...cache metadata + token totals }
//     - done:    `data: [DONE]\n\n`
//     - error:   { "type": "error", "message": <locked Chinese surface> }
//
// This module is decoupled from the AI SDK type surface on purpose — it
// accepts a plain `{ textStream, usagePromise, providerMetadataPromise }`
// shape so vitest can drive it with mock async iterables + promises.

import type { ProviderKind, CacheUsageReport } from "./provider";
import { readCacheUsage } from "./provider";
import { formatUserFacingError } from "./retry";

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
        // D-088 §2.4 user-surface contract: emit the locked Chinese fallback
        // message, NOT the raw err.message (which may leak provider internals
        // or appear as an inscrutable English stack trace). The original error
        // is still console.error'd below so debugging via `vercel logs`
        // remains intact.
        console.error("[buildChatSseResponse] stream error", err);
        const errFrame: ChatErrorFrame = {
          type: "error",
          message: formatUserFacingError(err),
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
