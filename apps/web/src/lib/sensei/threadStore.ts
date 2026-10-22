// D-181 §0-6 — AI 先生 conversations: one thread per anchor, local to this
// browser (not synced via /api/learning).
//   index    `itp:sensei:index:v1` = { v: 1, threads: ThreadMeta[] }
//   messages `itp:sensei:thread:<id>:v1`, written through lib/chat/historyStore
//            (≤ MAX_PERSISTED_MESSAGES = 200 per thread)
// At most MAX_THREADS threads; the one with the oldest updatedAt is evicted
// together with its message key. A QuotaExceeded write evicts the oldest other
// thread and retries once; a second failure returns false (never throws).
// A corrupt index reads as empty and no other key is touched.

import type { UIMessage } from "ai";

import { clearChatHistory, loadChatHistory, saveChatHistory } from "@/lib/chat/historyStore";
import type { StorageLike } from "@/lib/storage";

export type ThreadKind = "question" | "review" | "term" | "unit" | "free";

export interface ThreadMeta {
  id: string;
  kind: ThreadKind;
  anchorId: string;
  title: string;
  updatedAt: string;
}

export const SENSEI_INDEX_STORAGE = "itp:sensei:index:v1";
export const MAX_THREADS = 30;

const KINDS: readonly string[] = ["question", "review", "term", "unit", "free"];

/** Deterministic thread id: the same kind + anchorId always reuses one thread. */
export function threadIdFor(kind: ThreadKind, anchorId: string): string {
  return `${kind}.${encodeURIComponent(anchorId)}`;
}

export function threadStorageKey(id: string): string {
  return `itp:sensei:thread:${id}:v1`;
}

function isMeta(x: unknown): x is ThreadMeta {
  if (!x || typeof x !== "object") return false;
  const t = x as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.kind === "string" &&
    KINDS.includes(t.kind) &&
    typeof t.anchorId === "string" &&
    typeof t.title === "string" &&
    typeof t.updatedAt === "string"
  );
}

/** Newest first; a stable sort keeps index order for equal timestamps. */
function readIndex(storage: StorageLike): ThreadMeta[] {
  let raw: string | null;
  try {
    raw = storage.getItem(SENSEI_INDEX_STORAGE);
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
  if (!parsed || typeof parsed !== "object") return [];
  const { v, threads } = parsed as { v?: unknown; threads?: unknown };
  if (v !== 1 || !Array.isArray(threads)) return [];
  return threads.filter(isMeta).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function writeIndex(storage: StorageLike, threads: ThreadMeta[]): boolean {
  try {
    storage.setItem(SENSEI_INDEX_STORAGE, JSON.stringify({ v: 1, threads }));
    return true;
  } catch {
    return false;
  }
}

/** Drop the oldest thread other than `keepId` (and its messages); null if none. */
function evictOldest(storage: StorageLike, threads: ThreadMeta[], keepId: string): ThreadMeta[] | null {
  for (let i = threads.length - 1; i >= 0; i--) {
    const t = threads[i]!;
    if (t.id === keepId) continue;
    clearChatHistory(storage, threadStorageKey(t.id));
    return threads.filter((_, j) => j !== i);
  }
  return null;
}

export function listThreads(storage: StorageLike): ThreadMeta[] {
  return readIndex(storage);
}

/** The thread for this kind + anchorId, created (and the cap enforced) if new. */
export function openThread(
  storage: StorageLike,
  init: { kind: ThreadKind; anchorId: string; title: string },
): ThreadMeta {
  const id = threadIdFor(init.kind, init.anchorId);
  const threads = readIndex(storage);
  const existing = threads.find((t) => t.id === id);
  if (existing) return existing;

  const meta: ThreadMeta = { id, ...init, updatedAt: new Date().toISOString() };
  let next = [meta, ...threads];
  while (next.length > MAX_THREADS) {
    const evicted = evictOldest(storage, next, id);
    if (!evicted) break;
    next = evicted;
  }
  writeIndex(storage, next);
  return meta;
}

export function loadThreadMessages(storage: StorageLike, id: string): UIMessage[] {
  return loadChatHistory(storage, threadStorageKey(id));
}

/** Save an indexed thread's messages and mark it newest. False when the thread is not
 *  in the index or storage refused the write. */
export function saveThreadMessages(storage: StorageLike, id: string, messages: UIMessage[]): boolean {
  // Only threads in the index are written: an unindexed message key could never be evicted.
  let threads = readIndex(storage);
  if (!threads.some((t) => t.id === id)) return false;

  // historyStore swallows setItem failures; observe them through a pass-through wrapper.
  let failed = false;
  const observed: StorageLike = {
    getItem: (k) => storage.getItem(k),
    removeItem: (k) => storage.removeItem(k),
    setItem: (k, v) => {
      try {
        storage.setItem(k, v);
      } catch (e) {
        failed = true;
        throw e;
      }
    },
  };
  const attempt = (): boolean => {
    failed = false;
    saveChatHistory(observed, messages, threadStorageKey(id));
    return !failed;
  };

  let saved = attempt();
  if (!saved) {
    const evicted = evictOldest(storage, threads, id);
    if (evicted) {
      threads = evicted;
      saved = attempt();
    }
  }

  const i = threads.findIndex((t) => t.id === id);
  if (saved) {
    const touched = { ...threads[i]!, updatedAt: new Date().toISOString() };
    threads = [touched, ...threads.filter((_, j) => j !== i)];
  }
  const indexed = writeIndex(storage, threads);
  return saved && indexed;
}

export function deleteThread(storage: StorageLike, id: string): void {
  clearChatHistory(storage, threadStorageKey(id));
  const threads = readIndex(storage);
  if (threads.some((t) => t.id === id)) {
    writeIndex(
      storage,
      threads.filter((t) => t.id !== id),
    );
  }
}
