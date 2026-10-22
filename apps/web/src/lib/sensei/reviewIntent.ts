// D-181 Phase B (review m1) — the click intent behind `?review=1`.
//
// The quiz landing's review card writes sessionStorage `itp:sensei:review-intent`
// = { topicId, at } when a row is clicked; the topic set's ReviewLauncher sends the
// review opener only when it arrives with `?review=1` AND takes a matching intent no
// older than 30 s. A bookmark or a copied link carries the flag but no intent, so it
// only opens the panel (the opener is offered as a suggestion, not sent).
// takeReviewIntent always removes the key (consumed once). Never throws.

import type { StorageLike } from "@/lib/storage";

export const REVIEW_INTENT_STORAGE = "itp:sensei:review-intent";
export const REVIEW_INTENT_MAX_AGE_MS = 30_000;

/** window.sessionStorage, or null where reading the property itself throws (blocked storage). */
export function reviewIntentStorage(): StorageLike | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function writeReviewIntent(storage: StorageLike | null, topicId: string, now: number): void {
  try {
    storage?.setItem(REVIEW_INTENT_STORAGE, JSON.stringify({ topicId, at: now }));
  } catch {
    // blocked storage: the set page then only opens the panel
  }
}

/** True when a click intent for `topicId` from the last 30 s was stored; removes it either way. */
export function takeReviewIntent(storage: StorageLike | null, topicId: string, now: number): boolean {
  if (!storage) return false;
  let raw: string | null;
  try {
    raw = storage.getItem(REVIEW_INTENT_STORAGE);
    storage.removeItem(REVIEW_INTENT_STORAGE);
  } catch {
    return false;
  }
  if (raw === null) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!parsed || typeof parsed !== "object") return false;
  const { topicId: id, at } = parsed as { topicId?: unknown; at?: unknown };
  if (id !== topicId || typeof at !== "number") return false;
  const age = now - at;
  return age >= 0 && age <= REVIEW_INTENT_MAX_AGE_MS;
}
