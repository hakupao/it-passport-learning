// D-180 §0-7 — /api/learning owner-only sync contract: owner 403 → Redis 503 →
// body 400 (invalid JSON / schema / > 524288 bytes) → merge-and-store 200.
// A corrupt stored doc fails closed (500, nothing written). Redis is an
// in-memory fake via the loader mock; the real Upstash is never called.

import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { emptyRecord, mergeRecords, type LearningRecord } from "@/lib/learning/record";
import { makeFakeLearningRedis } from "@/lib/learning/__tests__/fakeLearningRedis";

const { redisHolder } = vi.hoisted(() => ({
  redisHolder: { current: null as ReturnType<typeof makeFakeLearningRedis> | null },
}));

vi.mock("@/lib/learning/syncStore", async () => {
  const actual = await vi.importActual<typeof import("@/lib/learning/syncStore")>(
    "@/lib/learning/syncStore",
  );
  return { ...actual, loadLearningRedis: async () => redisHolder.current };
});

import {
  CorruptStoredRecordError,
  LEARNING_REDIS_KEY,
  mergeAndStore,
  readStored,
} from "@/lib/learning/syncStore";

import { GET, PUT } from "../route";

const OWNER_KEY = "test-owner-key";
const OWNER_COOKIE_HEADER = `itp_owner=${createHash("sha256").update(OWNER_KEY).digest("hex")}`;
const URL_BASE = "http://localhost/api/learning";
const CAP = 524288;

function put(
  body: unknown,
  cookie: string | null = OWNER_COOKIE_HEADER,
  extraHeaders: Record<string, string> = {},
): Request {
  return new Request(URL_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}), ...extraHeaders },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function get(cookie: string | null = OWNER_COOKIE_HEADER): Request {
  return new Request(URL_BASE, { headers: cookie ? { cookie } : {} });
}

const deviceA: LearningRecord = {
  v: 1,
  questions: {
    "2016h28h-q033": { choice: "ア", correct: false, at: 100 },
    "2017h29a-q015": { choice: "イ", correct: true, at: 300 },
  },
  unitsRead: { "t-01-01": 50, "m-02-01": 70 },
};
const deviceB: LearningRecord = {
  v: 1,
  questions: {
    "2016h28h-q033": { choice: "エ", correct: true, at: 200 },
    "2019r01a-q001": { choice: "ウ", correct: false, at: 10 },
  },
  unitsRead: { "t-01-01": 20, "s-03-02": 5 },
};

/** A schema-valid record whose JSON body is exactly `bytes` UTF-8 bytes (ASCII padding). */
function recordOfBytes(bytes: number): string {
  const base = JSON.stringify({ v: 1, questions: { q: { choice: "", correct: true, at: 1 } }, unitsRead: {} });
  const body = JSON.stringify({
    v: 1,
    questions: { q: { choice: "x".repeat(bytes - base.length), correct: true, at: 1 } },
    unitsRead: {},
  });
  expect(new TextEncoder().encode(body).byteLength).toBe(bytes);
  return body;
}

let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.stubEnv("OWNER_KEY", OWNER_KEY);
  redisHolder.current = makeFakeLearningRedis();
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  errSpy.mockRestore();
});

describe("readStored", () => {
  it("missing key → emptyRecord()", async () => {
    expect(await readStored(redisHolder.current!)).toEqual(emptyRecord());
  });

  it("the fake's get() auto-deserializes a stored JSON string like @upstash/redis", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, JSON.stringify(deviceA));
    expect(await fake.get(LEARNING_REDIS_KEY)).toEqual(deviceA);
    fake.kv.set(LEARNING_REDIS_KEY, "{not json");
    expect(await fake.get(LEARNING_REDIS_KEY)).toBe("{not json");
    expect(fake.gets).toBe(2);
  });

  it("object and JSON-string shapes from get() give the same record", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, structuredClone(deviceA));
    const fromObject = await readStored(fake);
    // deserialization off: get() hands back the raw JSON string
    fake.autoDeserialize = false;
    fake.kv.set(LEARNING_REDIS_KEY, JSON.stringify(deviceA));
    expect(typeof (await fake.get(LEARNING_REDIS_KEY))).toBe("string");
    const fromString = await readStored(fake);
    expect(fromObject).toEqual(deviceA);
    expect(fromString).toEqual(fromObject);
  });

  it("a present but invalid value throws CorruptStoredRecordError", async () => {
    const fake = redisHolder.current!;
    for (const bad of ["{not json", JSON.stringify({ v: 2 }), { v: 1, questions: [] }, 42, "plain"]) {
      fake.kv.set(LEARNING_REDIS_KEY, bad);
      await expect(readStored(fake)).rejects.toBeInstanceOf(CorruptStoredRecordError);
    }
  });

  it("mergeAndStore writes nothing when the stored doc is corrupt", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, "{not json");
    await expect(mergeAndStore(fake, deviceA)).rejects.toBeInstanceOf(CorruptStoredRecordError);
    expect(fake.sets).toBe(0);
    expect(fake.kv.get(LEARNING_REDIS_KEY)).toBe("{not json");
  });
});

describe("owner gate (403) and Redis config (503)", () => {
  it("non-owner GET / PUT → 403 and nothing is written", async () => {
    for (const cookie of [null, "itp_owner=nope"]) {
      expect((await GET(get(cookie))).status).toBe(403);
      expect((await PUT(put(deviceA, cookie))).status).toBe(403);
    }
    vi.stubEnv("OWNER_KEY", "");
    expect((await GET(get())).status).toBe(403);
    expect((await PUT(put(deviceA))).status).toBe(403);
    expect(redisHolder.current!.sets).toBe(0);
    expect(redisHolder.current!.gets).toBe(0);
    expect(redisHolder.current!.kv.size).toBe(0);
  });

  it("403 takes precedence over a malformed or oversized body", async () => {
    expect((await PUT(put("not json", null))).status).toBe(403);
    expect((await PUT(put("x".repeat(600 * 1024), null))).status).toBe(403);
    expect(redisHolder.current!.gets).toBe(0);
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("redis null → 503 for GET and PUT", async () => {
    redisHolder.current = null;
    expect((await GET(get())).status).toBe(503);
    expect((await PUT(put(deviceA))).status).toBe(503);
  });
});

describe("GET /api/learning", () => {
  it("returns an empty record when nothing is stored", async () => {
    const res = await GET(get());
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.json()).toEqual(emptyRecord());
  });

  it("returns the stored record", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_KEY, structuredClone(deviceA));
    const res = await GET(get());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(deviceA);
  });

  it("corrupt stored doc → 500 and a log naming the failure only", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_KEY, "{\"v\":1,\"secret-choice\"");
    const res = await GET(get());
    expect(res.status).toBe(500);
    expect(errSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(errSpy.mock.calls);
    expect(logged).toContain("[learning-sync-error]");
    expect(logged).not.toContain("secret-choice");
    expect(logged).not.toContain("itp_owner");
  });
});

describe("PUT /api/learning", () => {
  it("merges two devices' records: stored value = mergeRecords(a, b), response = stored", async () => {
    const r1 = await PUT(put(deviceA));
    expect(r1.status).toBe(200);
    expect(await r1.json()).toEqual(deviceA);

    const r2 = await PUT(put(deviceB));
    expect(r2.status).toBe(200);
    const expected = mergeRecords(deviceA, deviceB);
    const stored = redisHolder.current!.kv.get(LEARNING_REDIS_KEY);
    expect(stored).toBe(JSON.stringify(expected));
    expect(await r2.json()).toEqual(JSON.parse(stored as string));
    // order-independent: B then A stores the identical document
    const other = makeFakeLearningRedis();
    redisHolder.current = other;
    await PUT(put(deviceB));
    await PUT(put(deviceA));
    expect(other.kv.get(LEARNING_REDIS_KEY)).toBe(stored);
  });

  it("merges with a stored doc that get() returns as an object", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_KEY, structuredClone(deviceA));
    const res = await PUT(put(deviceB));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mergeRecords(deviceA, deviceB));
  });

  it("400 on invalid JSON / schema mismatch, nothing written", async () => {
    expect((await PUT(put("not json"))).status).toBe(400);
    expect((await PUT(put({ v: 2, questions: {}, unitsRead: {} }))).status).toBe(400);
    expect((await PUT(put({ ...deviceA, unitsRead: { u: -1 } }))).status).toBe(400);
    expect((await PUT(put(""))).status).toBe(400);
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("600 KB body → 400, nothing written", async () => {
    const res = await PUT(put("x".repeat(600 * 1024)));
    expect(res.status).toBe(400);
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("caps on bytes actually read, not on Content-Length or string length", async () => {
    // a lying small Content-Length does not let an oversized body through
    expect((await PUT(put(recordOfBytes(CAP + 1), OWNER_COOKIE_HEADER, { "content-length": "10" }))).status).toBe(400);
    // multi-byte: 200k chars of "ア" = 600k UTF-8 bytes
    const wide = JSON.stringify({
      v: 1,
      questions: { q: { choice: "ア".repeat(200_000), correct: true, at: 1 } },
      unitsRead: {},
    });
    expect(wide.length).toBeLessThan(CAP);
    expect((await PUT(put(wide))).status).toBe(400);
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("an oversized Content-Length is rejected up front", async () => {
    expect((await PUT(put(deviceA, OWNER_COOKIE_HEADER, { "content-length": String(CAP + 1) }))).status).toBe(400);
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("a body of exactly 524288 bytes is accepted", async () => {
    const res = await PUT(put(recordOfBytes(CAP)));
    expect(res.status).toBe(200);
    expect(redisHolder.current!.sets).toBe(1);
  });

  it("corrupt stored doc → 500 and the stored value is left unchanged", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, "{corrupt");
    const res = await PUT(put(deviceA));
    expect(res.status).toBe(500);
    expect(fake.sets).toBe(0);
    expect(fake.kv.get(LEARNING_REDIS_KEY)).toBe("{corrupt");
  });

  it("Redis failure → 502, logging the error name only", async () => {
    const fake = redisHolder.current!;
    fake.get = async () => {
      throw new Error("ECONNRESET body={\"secret-choice\":1}");
    };
    expect((await PUT(put(deviceA))).status).toBe(502);
    expect((await GET(get())).status).toBe(502);
    expect(fake.sets).toBe(0);
    const logged = JSON.stringify(errSpy.mock.calls);
    expect(logged).toContain("[learning-sync-error]");
    expect(logged).not.toContain("secret-choice");
  });
});
