// D-181 — the AI 先生 ChatTransport: every LLM call happens in the browser.
// sendMessages() reads the key (localStorage, via getKey) and the anchor at
// send time, converts the UI messages, and runs AI SDK streamText against
// Anthropic directly; useChat consumes result.toUIMessageStream() as usual.
//
// Errors: streamText's default onError console.error()s the error object
// (APICallError carries request data), so it is replaced with a no-op; stream
// errors reach the UI only as formatSenseiError() text with the key masked.
// No key → onMissingKey() and an auth error, without touching the network.

import { convertToModelMessages, streamText, type ChatTransport, type UIMessage } from "ai";

import { shouldEscalate } from "@/lib/tutor/escalation";

import { formatSenseiError, toSenseiError } from "./errors";
import { createSenseiModel, EFFORT_DEFAULT, EFFORT_ESCALATED, MAX_OUTPUT_TOKENS } from "./model";
import { buildSenseiMessages } from "./prompt";

export function createBrowserTransport(opts: {
  getKey(): string | null;
  getAnchor(): string;
  onMissingKey(): void;
  /** Test seams (never the network in unit tests). */
  deps?: { streamText?: typeof streamText; createModel?: typeof createSenseiModel };
}): ChatTransport<UIMessage> {
  const run = opts.deps?.streamText ?? streamText;
  const createModel = opts.deps?.createModel ?? createSenseiModel;
  return {
    async sendMessages({ messages, abortSignal }) {
      const apiKey = opts.getKey();
      if (!apiKey) {
        opts.onMissingKey();
        throw new Error(formatSenseiError({ kind: "auth", message: "API key is not set" }));
      }
      const effort = shouldEscalate(messages) ? EFFORT_ESCALATED : EFFORT_DEFAULT;
      const conversation = await convertToModelMessages(messages);
      const result = run({
        model: createModel(apiKey),
        messages: buildSenseiMessages(opts.getAnchor(), conversation),
        providerOptions: { anthropic: { effort } },
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        maxRetries: 1,
        abortSignal,
        onError: () => {},
      });
      return result.toUIMessageStream({ onError: (e) => formatSenseiError(toSenseiError(e, apiKey)) });
    },
    async reconnectToStream() {
      return null;
    },
  };
}
