// D-180 §0-7 / D-190 §0-3 — owner-only server copy of the learning record.
//
// Storage = the existing Upstash Redis (D-100), one JSON document in the v2
// wire form (encodeRecord) at `learn:owner:v2`. When that key is missing the
// old v1 document at `learn:owner:v1` is read and upgraded (upgradeV1, v2Since
// = now); the v1 key is never written or deleted, so the first merge-and-write
// moves the data to the v2 key. Env precedence mirrors lib/quiz/feedback.ts:
// UPSTASH_REDIS_REST_URL/TOKEN preferred, KV_REST_API_URL/TOKEN fallback;
// missing env ⇒ loader returns null and the route answers 503. Narrow
// `LearningRedis` interface so tests inject an in-memory fake.
//
// Fail closed: a missing key is an empty record, but a present value that does
// not parse (v2 wire at the v2 key, v1 at the v1 key) is
// CorruptStoredRecordError — never silently replaced by an empty record or by
// the other key (a following merge-and-write would wipe the stored history).

import { emptyRecord, encodeRecord, mergeRecords, parseRecord, type LearningRecord } from "./record";
import { parseAnyRecord } from "./recordV1";

export const LEARNING_REDIS_KEY = "learn:owner:v2";
/** Pre-Stage-7 document: read once as the fallback, never written. */
export const LEARNING_REDIS_V1_KEY = "learn:owner:v1";

/** The subset of @upstash/redis used here. */
export interface LearningRedis {
  get(key: string): Promise<unknown>;
  set(key: string, value: string): Promise<unknown>;
}

/** The stored document exists but is not a valid LearningRecord. */
export class CorruptStoredRecordError extends Error {
  constructor() {
    super("stored learning record is corrupt");
    this.name = "CorruptStoredRecordError";
  }
}

let cachedRedis: LearningRedis | null | undefined = undefined;

export async function loadLearningRedis(): Promise<LearningRedis | null> {
  if (cachedRedis !== undefined) return cachedRedis;
  // `||` (not `??`): an empty string counts as unset.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    cachedRedis = null;
    return null;
  }
  const { Redis } = await import("@upstash/redis");
  cachedRedis = new Redis({ url, token }) as unknown as LearningRedis;
  return cachedRedis;
}

/**
 * `get(key)` normalized to a JSON value: `@upstash/redis` `get`
 * auto-deserializes JSON, so the value arrives as an object or
 * (deserialization off / unparsable) a string. undefined when the key is
 * missing; an unparsable string → CorruptStoredRecordError.
 */
async function getJson(redis: LearningRedis, key: string): Promise<unknown> {
  const raw = await redis.get(key);
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new CorruptStoredRecordError();
  }
}

/**
 * The stored record: the v2 key; missing → the v1 key upgraded with v2Since =
 * `now`; both missing → emptyRecord(). A present but invalid value (at the key
 * that is used) → CorruptStoredRecordError. Reads only, never writes.
 */
export async function readStored(redis: LearningRedis, now: number): Promise<LearningRecord> {
  const v2 = await getJson(redis, LEARNING_REDIS_KEY);
  if (v2 !== undefined) {
    const record = parseRecord(v2);
    if (!record) throw new CorruptStoredRecordError();
    return record;
  }
  const v1 = await getJson(redis, LEARNING_REDIS_V1_KEY);
  if (v1 === undefined) return emptyRecord();
  const parsed = parseAnyRecord(v1, now);
  if (!parsed || parsed.version !== 1) throw new CorruptStoredRecordError();
  return parsed.record;
}

/** Merge `incoming` into the stored record, write it to the v2 key (v2 wire), return the merged record. */
export async function mergeAndStore(
  redis: LearningRedis,
  incoming: LearningRecord,
  now: number,
): Promise<LearningRecord> {
  const merged = mergeRecords(await readStored(redis, now), incoming);
  await redis.set(LEARNING_REDIS_KEY, JSON.stringify(encodeRecord(merged)));
  return merged;
}
