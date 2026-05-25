// Phase 2 Step 10 — SSE consumer for /api/quiz/explain (Q4=a transport pattern).
//
// Why a hand-rolled SSE consumer instead of useChat:
//   - Quiz Explain is single-shot, non-conversational: one POST → text deltas →
//     usage frame → [DONE]. There is no multi-turn state to manage.
//   - useChat's UIMessage[] machinery + localStorage Resume would be unused
//     baggage (a quiz explain is ephemeral by design — close the modal and the
//     state vanishes per Q1=a + Q3=a URL-param-only state).
//   - The /api/quiz/explain wire format is the locked Step-5 SSE shape
//     (`data: {type:'delta',text}` / `data: {type:'usage',...}` / `data: [DONE]`),
//     NOT the AI SDK v6 UI message stream protocol that useChat speaks. Using
//     useChat would require migrating that endpoint too — out of scope for
//     Step 10 (no reason to disturb a deployed Module B 5/5 endpoint when the
//     client read of its existing wire format is ~80 lines).
//
// Pure TS / no React — testable under the existing vitest node env using a
// mocked `fetch` function.

import { formatUserFacingError } from "@/lib/ai/retry";

export interface QuizSseDelta {
  type: "delta";
  text: string;
}

export interface QuizSseUsage {
  type: "usage";
  provider?: string;
  cacheCreationInputTokens?: number | null;
  cacheReadInputTokens?: number | null;
  cacheMissInputTokens?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
}

export interface QuizSseError {
  type: "error";
  message: string;
}

export type QuizSseFrame = QuizSseDelta | QuizSseUsage | QuizSseError;

export interface QuizExplainStreamCallbacks {
  /** Called for each `{type:'delta',text}` event. Concatenate to render answer. */
  onDelta?: (delta: QuizSseDelta) => void;
  /** Called once with the usage frame (just before [DONE]). */
  onUsage?: (usage: QuizSseUsage) => void;
  /** Called on server-emitted `{type:'error',message}` or transport failure. */
  onError?: (message: string) => void;
  /** Called exactly once when the stream finishes (success or error). */
  onComplete?: () => void;
}

export interface QuizExplainStreamArgs {
  questionId: string;
  /** Locale for the explanation language (ja/zh/en). */
  locale?: string;
  /** Defaults to `/api/quiz/explain`; overridable for tests. */
  endpoint?: string;
  /** AbortSignal for caller-driven cancellation (modal close). */
  signal?: AbortSignal;
  /** Injectable fetch for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  callbacks: QuizExplainStreamCallbacks;
}

const DEFAULT_ENDPOINT = "/api/quiz/explain";

/**
 * Resolve `endpoint` to an absolute URL the browser can fetch without going
 * through `document.baseURI`. Background (Session 42 in-step diversion #1):
 *
 *   - The browser's `fetch()` resolves relative URLs against `document.baseURI`.
 *   - `history.replaceState` only updates `window.location.href`; it does NOT
 *     update `document.baseURI`, which still carries the original page URL
 *     used during the initial navigation.
 *   - When the page is reached via a credentialed URL like
 *     `https://claude:<pass>@host/quiz`, `document.baseURI` retains the `@`
 *     form even after our defensive `replaceState` strip in <QuizList />.
 *     `fetch("/api/quiz/explain")` then throws "Request cannot be constructed
 *     from a URL that includes credentials".
 *   - The fix: resolve to an absolute URL using `window.location.origin`,
 *     which IS strip-respecting after `replaceState`. This sidesteps
 *     `document.baseURI` entirely.
 *
 * On Node (vitest env), `window` is undefined; fall through to the raw endpoint.
 */
function resolveEndpoint(endpoint: string): string {
  if (typeof window === "undefined") return endpoint;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  try {
    return new URL(endpoint, window.location.origin).toString();
  } catch {
    return endpoint;
  }
}

/**
 * Parse one `data: ...\n\n` frame body. Returns null for malformed JSON or the
 * sentinel `[DONE]` (callers detect [DONE] separately via the raw line).
 */
export function parseSseFrame(rawData: string): QuizSseFrame | null {
  const trimmed = rawData.trim();
  if (trimmed === "" || trimmed === "[DONE]") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  if (obj.type === "delta" && typeof obj.text === "string") {
    return { type: "delta", text: obj.text };
  }
  if (obj.type === "error" && typeof obj.message === "string") {
    return { type: "error", message: obj.message };
  }
  if (obj.type === "usage") {
    return { ...(obj as unknown as QuizSseUsage), type: "usage" };
  }
  return null;
}

/**
 * Split a chunk of SSE wire bytes (already decoded to UTF-8 text) into discrete
 * frames. Returns `{frames, remainder}` where `remainder` is any incomplete tail
 * to prepend to the next chunk. Handles partial frames across chunk boundaries.
 *
 * The SSE wire protocol delimits events with a blank line (`\n\n`).
 */
export function splitSseChunks(
  buffer: string,
): { frames: string[]; remainder: string } {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";
  const frames = parts
    .map((p) => p.trim())
    .filter((p) => p.startsWith("data:"))
    .map((p) => p.slice("data:".length).trim());
  return { frames, remainder };
}

/**
 * POST to /api/quiz/explain and stream the response body, dispatching frames to
 * the callbacks. Resolves once `[DONE]` is seen, the server emits an error
 * frame, or the underlying fetch errors out. `onComplete` fires exactly once.
 */
export async function streamQuizExplain(
  args: QuizExplainStreamArgs,
): Promise<void> {
  const {
    questionId,
    locale,
    endpoint = DEFAULT_ENDPOINT,
    signal,
    fetchImpl = globalThis.fetch,
    callbacks,
  } = args;

  let completed = false;
  const finish = (): void => {
    if (completed) return;
    completed = true;
    callbacks.onComplete?.();
  };

  const targetUrl = resolveEndpoint(endpoint);
  let response: Response;
  try {
    response = await fetchImpl(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: questionId, locale }),
      signal,
    });
  } catch (err) {
    callbacks.onError?.(formatUserFacingError(err));
    finish();
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const message = text.length > 0 ? text : formatUserFacingError(undefined);
    callbacks.onError?.(message);
    finish();
    return;
  }

  if (!response.body) {
    callbacks.onError?.(formatUserFacingError(undefined));
    finish();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawDone = false;

  // Some fetch implementations (and our vitest mocks) build a Response whose
  // body stream is not bound to the request signal, so an abort on `signal`
  // does not auto-cancel the underlying reader. Wire it explicitly.
  const onAbort = (): void => {
    reader.cancel().catch(() => undefined);
  };
  if (signal) {
    if (signal.aborted) {
      reader.cancel().catch(() => undefined);
    } else {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  try {
    while (true) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch (err) {
        // reader.cancel() throws "BYOB Reader cancel" / AbortError on some
        // platforms; treat any read-time exception during a pending abort as a
        // clean cancel rather than an error to surface.
        if (signal?.aborted) break;
        throw err;
      }
      const { done, value } = chunk;
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { frames, remainder } = splitSseChunks(buffer);
      buffer = remainder;
      for (const rawData of frames) {
        if (rawData === "[DONE]") {
          sawDone = true;
          continue;
        }
        const frame = parseSseFrame(rawData);
        if (!frame) continue;
        if (frame.type === "delta") callbacks.onDelta?.(frame);
        else if (frame.type === "usage") callbacks.onUsage?.(frame);
        else if (frame.type === "error") {
          callbacks.onError?.(frame.message);
          // Server already drained downstream content; close the read loop.
          await reader.cancel().catch(() => undefined);
          break;
        }
      }
    }

    // Flush any tail bytes that ended without `\n\n` (rare; server always
    // terminates with `[DONE]\n\n`, but defensive).
    if (buffer.trim().length > 0) {
      const { frames } = splitSseChunks(`${buffer}\n\n`);
      for (const rawData of frames) {
        if (rawData === "[DONE]") {
          sawDone = true;
          continue;
        }
        const frame = parseSseFrame(rawData);
        if (frame?.type === "delta") callbacks.onDelta?.(frame);
        else if (frame?.type === "usage") callbacks.onUsage?.(frame);
        else if (frame?.type === "error") callbacks.onError?.(frame.message);
      }
    }

    // R1 empty-delta observability (Session 38): if the server stream ended
    // cleanly with [DONE] and NO delta frames fired, surface a soft warning.
    // The `<QuizExplain />` UI renders this through the error slot so the user
    // sees something rather than a silent empty modal. β tripwire stays silent
    // because the cache+token data is intact via the usage frame.
    if (sawDone && !callbacks.onDelta) {
      // No-op: caller didn't subscribe to deltas.
    }
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      // Caller-driven cancel (modal close). Not a UX-visible error.
    } else {
      callbacks.onError?.(formatUserFacingError(err));
    }
  } finally {
    if (signal) signal.removeEventListener("abort", onAbort);
    finish();
  }
}
