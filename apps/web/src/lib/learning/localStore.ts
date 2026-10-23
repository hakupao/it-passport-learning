// D-180 §0-6 — the learning record in localStorage (key `itp:learn:v1`).
//
// Every storage access is try/catch'd: private mode / quota / blocked storage
// behaves as "no storage" and never throws. A stored value that fails JSON.parse
// or parseRecord is never silently dropped: its raw string is copied to
// `itp:learn:v1:corrupt` (only when that key is empty, so the first bad copy is
// kept) before an empty record is returned — the next save then replaces the
// main key.
//
// Multi-tab: saveLocal merges with whatever is stored (re-read at write time),
// so a tab that loaded before another tab's answer never drops it; the stored
// string is canonical (mergeRecords output), so re-saving the same content
// leaves the value unchanged and fires no storage event. Other tabs' writes
// reach this tab through the window "storage" event → applyStorageEvent.

import type { StorageLike } from "@/lib/storage";

import {
  emptyRecord,
  LEARNING_STORAGE_KEY,
  mergeIfChanged,
  mergeRecords,
  parseRecord,
  type LearningRecord,
} from "./recordV1";

export const LEARNING_CORRUPT_KEY = `${LEARNING_STORAGE_KEY}:corrupt`;

function keepCorruptCopy(storage: StorageLike, raw: string): void {
  try {
    if (storage.getItem(LEARNING_CORRUPT_KEY) === null) storage.setItem(LEARNING_CORRUPT_KEY, raw);
  } catch {
    // storage unavailable — nothing more we can do
  }
}

export function loadLocal(storage: StorageLike): LearningRecord {
  let raw: string | null;
  try {
    raw = storage.getItem(LEARNING_STORAGE_KEY);
  } catch {
    return emptyRecord();
  }
  if (raw === null) return emptyRecord();
  const record = parseStored(raw);
  if (record) return record;
  keepCorruptCopy(storage, raw);
  return emptyRecord();
}

/** The parsed record in a raw stored string, or null when it is missing or invalid. */
function parseStored(raw: string | null): LearningRecord | null {
  if (raw === null) return null;
  try {
    return parseRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Write mergeRecords(stored, r) and return it. Re-reading through loadLocal keeps
 * its corrupt-value backup. Storage failure is swallowed (the in-memory record
 * still works); the merged record is returned either way.
 */
export function saveLocal(storage: StorageLike, r: LearningRecord): LearningRecord {
  const merged = mergeRecords(loadLocal(storage), r);
  try {
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // quota exceeded / private mode
  }
  return merged;
}

/**
 * Fold another tab's write (a StorageEvent) into `prev`. Returns `prev` itself
 * for other keys, clear()/removal, an invalid value, or when nothing is new — so
 * the caller does not re-render or re-save.
 */
export function applyStorageEvent(
  prev: LearningRecord,
  e: { key: string | null; newValue: string | null },
): LearningRecord {
  if (e.key !== LEARNING_STORAGE_KEY) return prev;
  const other = parseStored(e.newValue);
  return other ? mergeIfChanged(prev, other) : prev;
}
