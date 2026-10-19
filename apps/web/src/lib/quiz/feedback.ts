// D-149 — owner-only per-question quiz feedback (Session 126).
//
// Storage = the existing Upstash Redis (Vercel KV integration, D-100). Layout:
//   quiz:feedback:rec:<id>            → FeedbackRecord (JSON; @upstash/redis
//                                       auto-serialises objects)
//   quiz:feedback:index               → ZSET  member=<id> score=created ms
//   quiz:feedback:q:<question_id>     → ZSET  member=<id> score=created ms
// The global index drives scripts/quiz-feedback.mjs (list / pull / resolve);
// the per-question set drives the in-quiz "existing reports" list.
//
// Env: UPSTASH_REDIS_REST_URL/TOKEN preferred, KV_REST_API_URL/TOKEN fallback
// (same precedence as lib/ai/cap.ts LD-11). Missing env ⇒ loader returns null
// and the route answers 503. Narrow `FeedbackRedis` interface so tests inject
// an in-memory fake. Categories / validation live in ./feedbackModel.

import type { FeedbackInput, FeedbackRecord } from "./feedbackModel";

export * from "./feedbackModel";

export const FEEDBACK_INDEX_KEY = "quiz:feedback:index";
export const feedbackRecordKey = (id: string): string => `quiz:feedback:rec:${id}`;
export const feedbackQuestionKey = (questionId: string): string =>
  `quiz:feedback:q:${questionId}`;

// ---------------------------------------------------------------------------
// Redis
// ---------------------------------------------------------------------------

/** Transaction (MULTI/EXEC) subset; commands queue until `exec()`. */
export interface FeedbackTx {
  set(key: string, value: unknown): FeedbackTx;
  zadd(key: string, entry: { score: number; member: string }): FeedbackTx;
  exec(): Promise<unknown[]>;
}

/** The subset of @upstash/redis used here. */
export interface FeedbackRedis {
  multi(): FeedbackTx;
  zrange(
    key: string,
    start: number,
    stop: number,
    opts?: { rev?: boolean },
  ): Promise<string[]>;
  mget<T>(...keys: string[]): Promise<(T | null)[]>;
}

let cachedRedis: FeedbackRedis | null | undefined = undefined;

export async function loadFeedbackRedis(): Promise<FeedbackRedis | null> {
  if (cachedRedis !== undefined) return cachedRedis;
  // `||` (not `??`): an empty string counts as unset, same as the CLI script.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    cachedRedis = null;
    return null;
  }
  const { Redis } = await import("@upstash/redis");
  cachedRedis = new Redis({ url, token }) as unknown as FeedbackRedis;
  return cachedRedis;
}

export interface FeedbackDeps {
  now: () => Date;
  newId: () => string;
}

const defaultDeps: FeedbackDeps = {
  now: () => new Date(),
  newId: () => crypto.randomUUID(),
};

export async function createFeedback(
  redis: FeedbackRedis,
  input: FeedbackInput,
  deps: FeedbackDeps = defaultDeps,
): Promise<FeedbackRecord> {
  const now = deps.now();
  const record: FeedbackRecord = {
    id: deps.newId(),
    question_id: input.question_id,
    locale: input.locale,
    category: input.category,
    note: input.note,
    status: "open",
    created_at: now.toISOString(),
    resolved_at: null,
    resolution_note: null,
  };
  const score = now.getTime();
  // One MULTI/EXEC: record + both indexes land together or not at all.
  await redis
    .multi()
    .set(feedbackRecordKey(record.id), record)
    .zadd(FEEDBACK_INDEX_KEY, { score, member: record.id })
    .zadd(feedbackQuestionKey(record.question_id), { score, member: record.id })
    .exec();
  return record;
}

/** That question's records, newest first. */
export async function listFeedbackForQuestion(
  redis: FeedbackRedis,
  questionId: string,
): Promise<FeedbackRecord[]> {
  const ids = await redis.zrange(feedbackQuestionKey(questionId), 0, -1, { rev: true });
  if (ids.length === 0) return [];
  const records = await redis.mget<FeedbackRecord>(...ids.map(feedbackRecordKey));
  return records.filter((r): r is FeedbackRecord => r !== null);
}
