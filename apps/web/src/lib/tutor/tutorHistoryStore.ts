// Phase 4 Module C — tutor history persistence per D-106 §2.2 (single global thread, resume-style UX).

import type { UIMessage } from "ai";

import type { StorageLike } from "@/lib/book/progressStore";

interface PersistedShape {
  version: 1;
  messages: UIMessage[];
  updatedAt: string;
}

export const TUTOR_HISTORY_STORAGE_KEY = "itp:tutor:session:v1";
export const MAX_PERSISTED_MESSAGES = 200;

export function loadTutorHistory(
  storage: StorageLike,
  key: string = TUTOR_HISTORY_STORAGE_KEY,
): UIMessage[] {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return [];
  }
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as PersistedShape).version !== 1 ||
    !Array.isArray((parsed as PersistedShape).messages)
  ) {
    return [];
  }

  return (parsed as PersistedShape).messages;
}

export function saveTutorHistory(
  storage: StorageLike,
  messages: UIMessage[],
  key: string = TUTOR_HISTORY_STORAGE_KEY,
): void {
  const trimmed =
    messages.length > MAX_PERSISTED_MESSAGES
      ? messages.slice(-MAX_PERSISTED_MESSAGES)
      : messages;

  const envelope: PersistedShape = {
    version: 1,
    messages: trimmed,
    updatedAt: new Date().toISOString(),
  };

  try {
    storage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Quota exceeded / private-browsing storage denial / etc. — swallow.
  }
}

export function clearTutorHistory(
  storage: StorageLike,
  key: string = TUTOR_HISTORY_STORAGE_KEY,
): void {
  try {
    storage.removeItem(key);
  } catch {
    // No-op: same rationale as saveTutorHistory.
  }
}
