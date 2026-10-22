// D-181 §0-6 — the AI 先生 API key, kept only in this browser's localStorage
// (key `itp:sensei:key:v1`, value `{ provider: "anthropic", apiKey, savedAt }`).
// Read and written only by the AI 先生 settings panel; never synced to
// /api/learning or the conversation store.
//
// Every storage access is try/catch'd: private mode / quota / blocked storage
// behaves as "no key" and never throws. A missing, corrupt or wrong-shaped value
// reads as null.

import type { StorageLike } from "@/lib/storage";

export const SENSEI_KEY_STORAGE = "itp:sensei:key:v1";

interface StoredKey {
  provider: "anthropic";
  apiKey: string;
  savedAt: string;
}

export function loadSenseiKey(storage: StorageLike): string | null {
  let raw: string | null;
  try {
    raw = storage.getItem(SENSEI_KEY_STORAGE);
  } catch {
    return null;
  }
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const { provider, apiKey } = parsed as Partial<StoredKey>;
  if (provider !== "anthropic" || typeof apiKey !== "string" || apiKey === "") return null;
  return apiKey;
}

/** Save the trimmed key. A blank key is not saved (an existing key stays). */
export function saveSenseiKey(storage: StorageLike, apiKey: string): void {
  const trimmed = apiKey.trim();
  if (trimmed === "") return;
  const value: StoredKey = { provider: "anthropic", apiKey: trimmed, savedAt: new Date().toISOString() };
  try {
    storage.setItem(SENSEI_KEY_STORAGE, JSON.stringify(value));
  } catch {
    // quota exceeded / private mode
  }
}

export function clearSenseiKey(storage: StorageLike): void {
  try {
    storage.removeItem(SENSEI_KEY_STORAGE);
  } catch {
    // storage unavailable — nothing to remove
  }
}
