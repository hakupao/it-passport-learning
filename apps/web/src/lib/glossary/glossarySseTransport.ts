// Phase 2 Step 11 — SSE consumer for /api/glossary/hover (Q4=a transport pattern).
//
// Direct clone-adapt of `quizSseTransport.ts` (Step 10, Session 42), differing
// only in:
//   - request body shape: `{ surface_jp }` instead of `{ question_id }`
//   - default endpoint: `/api/glossary/hover` instead of `/api/quiz/explain`
//
// The wire format is the locked Step-5 SSE shape shared by all three single-
// shot endpoints (chat / quiz/explain / glossary/hover) via
// `buildChatSseResponse` — i.e. `data: {type:'delta',text}` /
// `data: {type:'usage',...}` / `data: [DONE]`. That symmetry is why a literal
// clone is the right move at α; Step 12 cleanup will collapse the two consumers
// into one shared module per LD-5 (in-source amend, no D-NNN).
//
// `resolveEndpoint` carries forward the Session 42 Rule B fix
// (`failures/step_10_attempt_1_document_baseuri_credentials_pollution.md`) —
// when the page is loaded via a credentialed URL like
// `https://claude:<pass>@host/glossary`, `document.baseURI` retains the `@`
// form even after `history.replaceState`. Constructing the fetch URL against
// `window.location.origin` (which IS strip-respecting per the URL spec)
// sidesteps `document.baseURI` entirely.
//
// Pure TS / no React — testable under the existing vitest node env using a
// mocked `fetch` function.

import { formatUserFacingError } from "@/lib/ai/retry";

export interface GlossarySseDelta {
  type: "delta";
  text: string;
}

export interface GlossarySseUsage {
  type: "usage";
  provider?: string;
  cacheCreationInputTokens?: number | null;
  cacheReadInputTokens?: number | null;
  cacheMissInputTokens?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
}

export interface GlossarySseError {
  type: "error";
  message: string;
}

export type GlossarySseFrame =
  | GlossarySseDelta
  | GlossarySseUsage
  | GlossarySseError;

export interface GlossaryHoverStreamCallbacks {
  /** Called for each `{type:'delta',text}` event. Concatenate to render tooltip. */
  onDelta?: (delta: GlossarySseDelta) => void;
  /** Called once with the usage frame (just before [DONE]). */
  onUsage?: (usage: GlossarySseUsage) => void;
  /** Called on server-emitted `{type:'error',message}` or transport failure. */
  onError?: (message: string) => void;
  /** Called exactly once when the stream finishes (success or error). */
  onComplete?: () => void;
}

export interface GlossaryHoverStreamArgs {
  surfaceJp: string;
  /** Defaults to `/api/glossary/hover`; overridable for tests. */
  endpoint?: string;
  /** AbortSignal for caller-driven cancellation (modal close). */
  signal?: AbortSignal;
  /** Injectable fetch for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  callbacks: GlossaryHoverStreamCallbacks;
}

const DEFAULT_ENDPOINT = "/api/glossary/hover";

/**
 * Resolve `endpoint` to an absolute URL the browser can fetch without going
 * through `document.baseURI` (Step 10 Session 42 Rule B carry-over). See the
 * module header above for the full rationale. On Node (vitest env), `window`
 * is undefined and we fall through to the raw endpoint.
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
export function parseSseFrame(rawData: string): GlossarySseFrame | null {
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
    return { ...(obj as unknown as GlossarySseUsage), type: "usage" };
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
 * POST to /api/glossary/hover and stream the response body, dispatching frames
 * to the callbacks. Resolves once `[DONE]` is seen, the server emits an error
 * frame, or the underlying fetch errors out. `onComplete` fires exactly once.
 */
export async function streamGlossaryHover(
  args: GlossaryHoverStreamArgs,
): Promise<void> {
  const {
    surfaceJp,
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
      body: JSON.stringify({ surface_jp: surfaceJp }),
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
        // reader.cancel() throws on some platforms during a pending abort;
        // treat any read-time exception during a pending abort as a clean
        // cancel rather than an error to surface.
        if (signal?.aborted) break;
        throw err;
      }
      const { done, value } = chunk;
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { frames, remainder } = splitSseChunks(buffer);
      buffer = remainder;
      for (const rawData of frames) {
        if (rawData === "[DONE]") continue;
        const frame = parseSseFrame(rawData);
        if (!frame) continue;
        if (frame.type === "delta") callbacks.onDelta?.(frame);
        else if (frame.type === "usage") callbacks.onUsage?.(frame);
        else if (frame.type === "error") {
          callbacks.onError?.(frame.message);
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
        if (rawData === "[DONE]") continue;
        const frame = parseSseFrame(rawData);
        if (frame?.type === "delta") callbacks.onDelta?.(frame);
        else if (frame?.type === "usage") callbacks.onUsage?.(frame);
        else if (frame?.type === "error") callbacks.onError?.(frame.message);
      }
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
