// D-180 §0-7 — client half of the owner-only sync with /api/learning.
//
// Both calls return the server's record (parsed at the trust boundary) or null.
// Any failure — network error, non-2xx, a body that fails parseRecord — is a
// console.warn naming the method and status / error name only (never the
// record); the caller keeps working from localStorage. An aborted request
// (component unmounted) returns null without a warning.

import { deltaSince, parseRecord, type LearningRecord } from "./recordV1";

export const LEARNING_API_PATH = "/api/learning";

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

async function call(
  fetchImpl: FetchLike,
  method: "GET" | "PUT",
  init: RequestInit,
  signal?: AbortSignal,
): Promise<LearningRecord | null> {
  try {
    const res = await fetchImpl(LEARNING_API_PATH, { ...init, method, cache: "no-store", signal });
    if (!res.ok) {
      console.warn(`[learning-sync] ${method} failed: HTTP ${res.status}`);
      return null;
    }
    const record = parseRecord(await res.json());
    if (!record) console.warn(`[learning-sync] ${method} failed: invalid record in response`);
    return record;
  } catch (err) {
    if (signal?.aborted) return null;
    console.warn(`[learning-sync] ${method} failed: ${err instanceof Error ? err.name : typeof err}`);
    return null;
  }
}

/** The stored server record, or null on any failure. */
export function pullRemote(fetchImpl: FetchLike, signal?: AbortSignal): Promise<LearningRecord | null> {
  return call(fetchImpl, "GET", {}, signal);
}

/**
 * Send `r` (a full or partial record; the server merges it with its copy).
 * Returns the merged record, or null on any failure. `keepalive` lets the
 * request outlive the page (browsers cap keepalive bodies at ~64 KB in total).
 */
export function pushRemote(
  fetchImpl: FetchLike,
  r: LearningRecord,
  { signal, keepalive = false }: { signal?: AbortSignal; keepalive?: boolean } = {},
): Promise<LearningRecord | null> {
  return call(
    fetchImpl,
    "PUT",
    { headers: { "Content-Type": "application/json" }, body: JSON.stringify(r), keepalive },
    signal,
  );
}

/** Largest delta body (UTF-8 bytes) sent with keepalive; below the ~64 KB browser cap. */
export const KEEPALIVE_MAX_BYTES = 60 * 1024;

/**
 * What to PUT when the page is hidden: the delta since the last synced record
 * with keepalive when it fits in KEEPALIVE_MAX_BYTES, else the full record
 * without keepalive (may be cut off by unload, but is never rejected for size).
 */
export function hideFlushPlan(
  current: LearningRecord,
  synced: LearningRecord | null,
): { record: LearningRecord; keepalive: boolean } {
  const delta = deltaSince(current, synced);
  return new TextEncoder().encode(JSON.stringify(delta)).byteLength <= KEEPALIVE_MAX_BYTES
    ? { record: delta, keepalive: true }
    : { record: current, keepalive: false };
}

type ListenerTarget = Pick<EventTarget, "addEventListener" | "removeEventListener">;

/**
 * Call `flush` when the page is being hidden: `visibilitychange` to "hidden"
 * on `doc`, or `pagehide` on `win`. Returns the cleanup that removes both listeners.
 */
export function onPageHide(
  win: ListenerTarget,
  doc: ListenerTarget & { readonly visibilityState: string },
  flush: () => void,
): () => void {
  const onVisibility = () => {
    if (doc.visibilityState === "hidden") flush();
  };
  doc.addEventListener("visibilitychange", onVisibility);
  win.addEventListener("pagehide", flush);
  return () => {
    doc.removeEventListener("visibilitychange", onVisibility);
    win.removeEventListener("pagehide", flush);
  };
}
