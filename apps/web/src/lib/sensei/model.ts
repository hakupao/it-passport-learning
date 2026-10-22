// D-181 §0-1 — the AI 先生 model: Anthropic `claude-sonnet-5-5`, called straight
// from the browser with the learner's own key (BYOK). Sonnet 5.5 cannot turn
// thinking off, so depth is steered with `providerOptions.anthropic.effort`:
// "low" normally, "high" when shouldEscalate() fires (escalation.ts).
// maxOutputTokens includes thinking; answer length is controlled by the prompt.

import { createAnthropic } from "@ai-sdk/anthropic";

export const MODEL_ID = "claude-sonnet-5-5";
export const EFFORT_DEFAULT = "low";
export const EFFORT_ESCALATED = "high";
export const MAX_OUTPUT_TOKENS = 4000;

/** The browser-direct Anthropic model. `fetchImpl` is for tests (no network). */
export function createSenseiModel(apiKey: string, fetchImpl?: typeof fetch) {
  return createAnthropic({
    apiKey,
    headers: { "anthropic-dangerous-direct-browser-access": "true" },
    fetch: fetchImpl,
  })(MODEL_ID);
}
