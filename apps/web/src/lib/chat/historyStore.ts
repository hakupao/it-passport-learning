// Phase 2 Step 9 — chat history persistence store (D-085 §2.2 Resume contract).
//
// Session 41 4Q-locked design (Q2=a localStorage cross-session + Q3=a pin-last):
//   - Backend = `Storage` shape (defaults to window.localStorage in <Chat />).
//   - Keyed by a single namespace constant (`itp:chat:history:v1`); bump the v1
//     suffix to invalidate corrupt or schema-incompatible stores after a future
//     UIMessage shape change.
//   - The store keeps ONLY the most-recent conversation thread — D-085 §2.2
//     locks `0 思考成本启动`, which is incompatible with surfacing a thread list
//     on α-now (per the rejected Q3=c selector pattern). A multi-thread history
//     surface is α-out-of-scope.
//   - Capped at MAX_PERSISTED_MESSAGES = 200 so that, even if an automated test
//     loop or a runaway user spams the chat, localStorage cannot overflow its
//     ~5 MB quota (200 × ~10 KB UIMessage ≈ 2 MB worst case).
//
// Decoupled from `window` on purpose: every fn takes a `Storage` arg so the
// node-env vitest can drive it with a small in-memory mock (see __tests__).

import type { UIMessage } from "ai";

/**
 * Storage subset we depend on. Avoids pulling in `lib: ["DOM"]` for the unit
 * tests (which run in node env per vitest.config.ts).
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface PersistedShape {
  version: 1;
  messages: UIMessage[];
  updatedAt: string;
}

export const HISTORY_STORAGE_KEY = "itp:chat:history:v1";
export const MAX_PERSISTED_MESSAGES = 200;

/**
 * Load history. Returns `[]` for every recoverable failure (no storage, key
 * absent, parse error, schema mismatch, corrupt shape). Storage corruption is a
 * UX inconvenience, not a contract violation — fall back to fresh state per
 * D-085 §5.3 (state corruption fallback = first-launch behaviour).
 */
export function loadChatHistory(
  storage: StorageLike,
  key: string = HISTORY_STORAGE_KEY,
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

  // We do not deep-validate every UIMessage field — the AI SDK's own
  // convertToModelMessages will reject pathological shapes on the next send,
  // and the user can `新しい会話` to clear. Over-validating here is α-now
  // over-engineering.
  return (parsed as PersistedShape).messages;
}

/**
 * Persist history. Last-N truncation keeps the store bounded; the truncated
 * tail (most recent messages) is what we keep — `slice(-N)` semantics.
 *
 * Empty `messages` is a no-op write (writes the empty envelope) rather than a
 * `removeItem`, because the UX of `setMessages([])` followed by a page reload
 * should not show a stale older thread. `clearChatHistory` is the explicit
 * delete path.
 */
export function saveChatHistory(
  storage: StorageLike,
  messages: UIMessage[],
  key: string = HISTORY_STORAGE_KEY,
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
    // The next reload will see whatever survived the last successful write.
  }
}

/**
 * Clear history. Explicit user action only — bound to the `新しい会話 / 新对话`
 * button in <Chat />.
 */
export function clearChatHistory(
  storage: StorageLike,
  key: string = HISTORY_STORAGE_KEY,
): void {
  try {
    storage.removeItem(key);
  } catch {
    // No-op: same rationale as saveChatHistory.
  }
}
