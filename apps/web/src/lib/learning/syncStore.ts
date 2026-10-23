// D-180 §0-7 — owner-only server copy of the learning record.
//
// Storage = the existing Upstash Redis (D-100), one JSON document at
// `learn:owner:v1`. Env precedence mirrors lib/quiz/feedback.ts:
// UPSTASH_REDIS_REST_URL/TOKEN preferred, KV_REST_API_URL/TOKEN fallback;
// missing env ⇒ loader returns null and the route answers 503. Narrow
// `LearningRedis` interface so tests inject an in-memory fake.
//
// Fail closed: a missing key is an empty record, but a present value that does
// not parse is CorruptStoredRecordError — never silently replaced by an empty
// record (a following merge-and-write would wipe the stored history).

import { emptyRecord, mergeRecords, parseRecord, type LearningRecord } from "./recordV1";

export const LEARNING_REDIS_KEY = "learn:owner:v1";

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
 * The stored record. `@upstash/redis` `get` auto-deserializes JSON, so the
 * value arrives as an object or (deserialization off / unparsable) a string;
 * both are normalized before `parseRecord`. Missing → emptyRecord(); present
 * but invalid → CorruptStoredRecordError.
 */
export async function readStored(redis: LearningRedis): Promise<LearningRecord> {
  const raw = await redis.get(LEARNING_REDIS_KEY);
  if (raw === null || raw === undefined) return emptyRecord();
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      throw new CorruptStoredRecordError();
    }
  }
  const record = parseRecord(value);
  if (!record) throw new CorruptStoredRecordError();
  return record;
}

/** Merge `incoming` into the stored record, write it back, return the merged record. */
export async function mergeAndStore(
  redis: LearningRedis,
  incoming: LearningRecord,
): Promise<LearningRecord> {
  const merged = mergeRecords(await readStored(redis), incoming);
  await redis.set(LEARNING_REDIS_KEY, JSON.stringify(merged));
  return merged;
}
