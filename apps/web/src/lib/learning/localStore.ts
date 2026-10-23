// D-180 §0-6 / D-190 — the learning record in localStorage: v2 wire
// (encodeRecord) at `itp:learn:v2`.
//
// Old tabs (pre-Stage-7 bundles still open) keep writing v1 at `itp:learn:v1`.
// That key is read-only here: loadLocal and the storage event parse it,
// upgrade it (upgradeV1, v2Since = the caller's `now`) and merge it in, but it
// is never written, copied or removed — so an old tab and a new tab never lose
// each other's answers during the upgrade window (Review Focus 1). An invalid
// v1 value is ignored (it is the old tab's to deal with).
//
// Every storage access is try/catch'd: private mode / quota / blocked storage
// behaves as "no storage" and never throws. A stored v2 value that fails
// JSON.parse or parseRecord is never silently dropped: its raw string is copied
// to `itp:learn:v2:corrupt` (only when that key is empty, so the first bad copy
// is kept) before it is treated as empty — the next save then replaces the
// main key.
//
// Multi-tab: saveLocal merges with whatever v2 value is stored (re-read at
// write time), so a tab that loaded before another tab's answer never drops
// it; the stored string is canonical (mergeRecords output), so re-saving the
// same content leaves the value unchanged and fires no storage event. Other
// tabs' writes (either key) reach this tab through the window "storage" event
// → applyStorageEvent.

import type { StorageLike } from "@/lib/storage";

import {
  emptyRecord,
  encodeRecord,
  LEARNING_STORAGE_KEY,
  mergeIfChanged,
  mergeRecords,
  parseRecord,
  type LearningRecord,
} from "./record";
import { LEARNING_V1_STORAGE_KEY, parseRecordV1, upgradeV1 } from "./recordV1";

export const LEARNING_CORRUPT_KEY = `${LEARNING_STORAGE_KEY}:corrupt`;

function read(storage: StorageLike, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function keepCorruptCopy(storage: StorageLike, raw: string): void {
  try {
    if (storage.getItem(LEARNING_CORRUPT_KEY) === null) storage.setItem(LEARNING_CORRUPT_KEY, raw);
  } catch {
    // storage unavailable — nothing more we can do
  }
}

function parseJson(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

/** The v2 record in a raw stored string, or null when it is missing or invalid. */
const parseStoredV2 = (raw: string | null): LearningRecord | null => parseRecord(parseJson(raw));

/** The upgraded v1 record in a raw stored string, or null when it is missing or invalid. */
function parseStoredV1(raw: string | null, now: number): LearningRecord | null {
  const r1 = parseRecordV1(parseJson(raw));
  // upgradeV1 output must itself be valid v2 (v1 accepts times past 8.64e15)
  return r1 ? parseRecord(encodeRecord(upgradeV1(r1, now))) : null;
}

/** The stored v2 record; an invalid value is backed up to LEARNING_CORRUPT_KEY and read as empty. */
function loadV2(storage: StorageLike): LearningRecord {
  const raw = read(storage, LEARNING_STORAGE_KEY);
  if (raw === null) return emptyRecord();
  const record = parseStoredV2(raw);
  if (record) return record;
  keepCorruptCopy(storage, raw);
  return emptyRecord();
}

/**
 * The stored v2 record merged with the upgraded v1 record an old tab wrote
 * (v2Since = `now` for that upgrade). Reads only — the v1 key is never touched.
 */
export function loadLocal(storage: StorageLike, now: number): LearningRecord {
  const v2 = loadV2(storage);
  const v1 = parseStoredV1(read(storage, LEARNING_V1_STORAGE_KEY), now);
  return v1 ? mergeRecords(v2, v1) : v2;
}

/**
 * Write mergeRecords(stored v2, r) to the v2 key only and return it. The
 * re-read keeps loadLocal's corrupt-value backup; the v1 key is not read here
 * (its content reached `r` at load / through the storage event). Storage
 * failure is swallowed (the in-memory record still works); the merged record
 * is returned either way.
 */
export function saveLocal(storage: StorageLike, r: LearningRecord): LearningRecord {
  const merged = mergeRecords(loadV2(storage), r);
  try {
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(encodeRecord(merged)));
  } catch {
    // quota exceeded / private mode
  }
  return merged;
}

/**
 * Fold another tab's write (a StorageEvent on the v2 key, or an old tab's on
 * the v1 key, upgraded with v2Since = `now`) into `prev`. Returns `prev` itself
 * for other keys, clear()/removal, an invalid value, or when nothing is new —
 * so the caller does not re-render or re-save.
 */
export function applyStorageEvent(
  prev: LearningRecord,
  e: { key: string | null; newValue: string | null },
  now: number,
): LearningRecord {
  const other =
    e.key === LEARNING_STORAGE_KEY
      ? parseStoredV2(e.newValue)
      : e.key === LEARNING_V1_STORAGE_KEY
        ? parseStoredV1(e.newValue, now)
        : null;
  return other ? mergeIfChanged(prev, other) : prev;
}
