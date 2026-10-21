// D-180 §0-7 — client half of the owner-only sync with /api/learning.
//
// Both calls return the server's record (parsed at the trust boundary) or null.
// Any failure — network error, non-2xx, a body that fails parseRecord — is a
// console.warn naming the method and status / error name only (never the
// record); the caller keeps working from localStorage. An aborted request
// (component unmounted) returns null without a warning.

import { parseRecord, type LearningRecord } from "./record";

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

/** Send `r`; the server merges it with its copy. Returns the merged record, or null on any failure. */
export function pushRemote(
  fetchImpl: FetchLike,
  r: LearningRecord,
  signal?: AbortSignal,
): Promise<LearningRecord | null> {
  return call(
    fetchImpl,
    "PUT",
    { headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) },
    signal,
  );
}
