// Phase 2 Step 8 — single-retry, no-fallback retry policy per D-088 §2.4.
//
// Behaviour locked by D-088 §2.4 (retained by D-095 §2.4 across provider
// switch):
//   - 1 retry beyond the initial call (= 2 attempts total) on transient
//     transport failures (5xx / 429 / overloaded_error / timeout / network).
//   - Same model on retry; NO cross-model fallback (Plan B = surface error).
//   - Backoff handled by the AI SDK (exponential, 2s → 4s style).
//   - User-facing terminal failure message: 「AI 暂时不可用，请稍后重试。」
//
// Wiring: each /api endpoint passes `STREAM_CONFIG.maxRetries` to its
// `streamText` call. AI SDK v6 `maxRetries` is "retries beyond initial",
// so `1` matches the D-088 §2.4 diagram (initial + 1 retry = 2 attempts).
//
// `isRetryableError` is exported as documentation of which error shapes the
// SDK's built-in retry layer is expected to recover from. The classifier is
// NOT in the hot path (the SDK already retries internally); it is reused by
// the SSE encoder's catch branch to keep the user-facing surface aligned
// with the policy.

export interface StreamConfig {
  readonly maxRetries: 1;
}

/** Single immutable config shared by all 4 /api endpoints. */
export const STREAM_CONFIG: StreamConfig = Object.freeze({
  maxRetries: 1,
});

/** Terminal-failure user surface — Chinese per project i18n default for α. */
export const USER_FACING_LLM_UNAVAILABLE_MESSAGE = "AI 暂时不可用，请稍后重试。";

/**
 * Classify a thrown value as transient-retryable or terminal. Per D-088 §2.4:
 *
 *   transient (retry once):   5xx, 429, overloaded_error, timeouts, network
 *   terminal (do not retry):  4xx (validation/auth/not-found), unknown shapes
 *
 * The function is intentionally defensive across multiple provider error
 * shapes (Anthropic `AI_APICallError`, DeepSeek OpenAI-compatible wrapped
 * Errors, fetch `TypeError`, Node net `code` fields).
 */
export function isRetryableError(err: unknown): boolean {
  if (err === null || err === undefined) return false;

  if (err instanceof TypeError) {
    const msg = err.message;
    if (msg.includes("fetch failed") || msg.includes("network")) return true;
  }

  if (err instanceof Error) {
    const withCode = err as Error & { code?: unknown };
    if (
      withCode.code === "ECONNRESET" ||
      withCode.code === "ETIMEDOUT" ||
      withCode.code === "ECONNREFUSED" ||
      withCode.code === "EAI_AGAIN" ||
      withCode.code === "EPIPE"
    ) {
      return true;
    }

    const withStatus = err as Error & { statusCode?: unknown };
    if (typeof withStatus.statusCode === "number") {
      if (withStatus.statusCode === 429) return true;
      if (withStatus.statusCode >= 500 && withStatus.statusCode < 600) {
        return true;
      }
    }

    const responseBody = (err as { responseBody?: unknown }).responseBody;
    if (
      typeof responseBody === "string" &&
      responseBody.includes("overloaded_error")
    ) {
      return true;
    }

    const msg = err.message;
    if (
      msg.includes("503") ||
      msg.includes("overloaded") ||
      msg.includes("timeout")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Translate any thrown value into the project's locked user-facing surface
 * text per D-088 §2.4. Callers should still `console.error(err)` separately
 * so the original error remains visible in server logs for debugging.
 */
export function formatUserFacingError(err: unknown): string {
  void err;
  return USER_FACING_LLM_UNAVAILABLE_MESSAGE;
}
