// D-180 §0-6 — the learning record in localStorage (key `itp:learn:v1`).
//
// Every storage access is try/catch'd: private mode / quota / blocked storage
// behaves as "no storage" and never throws. A stored value that fails JSON.parse
// or parseRecord is never silently dropped: its raw string is copied to
// `itp:learn:v1:corrupt` (only when that key is empty, so the first bad copy is
// kept) before an empty record is returned — the next save then replaces the
// main key.

import type { StorageLike } from "@/lib/storage";

import { emptyRecord, LEARNING_STORAGE_KEY, parseRecord, type LearningRecord } from "./record";

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
  let record: LearningRecord | null = null;
  try {
    record = parseRecord(JSON.parse(raw));
  } catch {
    record = null;
  }
  if (record) return record;
  keepCorruptCopy(storage, raw);
  return emptyRecord();
}

export function saveLocal(storage: StorageLike, r: LearningRecord): void {
  try {
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(r));
  } catch {
    // quota exceeded / private mode — the in-memory record still works
  }
}
