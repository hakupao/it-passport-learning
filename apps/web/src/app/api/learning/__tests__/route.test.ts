// D-180 §0-7 / D-190 §0-3 — /api/learning owner-only sync contract, speaking
// both record versions (server first: old v1 clients keep working):
//   owner 403 → Redis 503 → body 400 (invalid JSON / neither v1 nor v2 /
//   > 1048576 bytes) → merge-and-store 200.
//   - PUT answers in the body's version (v1 body → merged, downgraded v1);
//     GET answers v1 unless ?v=2.
//   - Storage is v2 wire at learn:owner:v2; when that key is missing the old
//     learn:owner:v1 doc is read and upgraded, and never written.
// A corrupt stored doc (either key) fails closed (500, nothing written). Redis
// is an in-memory fake via the loader mock; the real Upstash is never called.

import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  emptyRecord,
  encodeRecord,
  mergeRecords,
  parseRecord,
  recordAttempt,
  type LearningRecord,
} from "@/lib/learning/record";
import { downgradeToV1, parseRecordV1, upgradeV1, type LearningRecordV1 } from "@/lib/learning/recordV1";
import { makeFakeLearningRedis } from "@/lib/learning/__tests__/fakeLearningRedis";
import { emptyRecordV1, mergeRecordsV1 } from "@/lib/learning/__tests__/v1Client";

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
  LEARNING_REDIS_V1_KEY,
  mergeAndStore,
  readStored,
} from "@/lib/learning/syncStore";

import { GET, PUT } from "../route";

const OWNER_KEY = "test-owner-key";
const OWNER_COOKIE_HEADER = `itp_owner=${createHash("sha256").update(OWNER_KEY).digest("hex")}`;
const URL_BASE = "http://localhost/api/learning";
const CAP = 1048576;
/** Server clock during each test (fake Date + setSystemTime): the `now` of every v1 upgrade. */
const NOW = Date.UTC(2026, 9, 23, 5, 0, 0);

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

function get(cookie: string | null = OWNER_COOKIE_HEADER, query = ""): Request {
  return new Request(URL_BASE + query, { headers: cookie ? { cookie } : {} });
}

const deviceA: LearningRecordV1 = {
  v: 1,
  questions: {
    "2016h28h-q033": { choice: "ア", correct: false, at: 100 },
    "2017h29a-q015": { choice: "イ", correct: true, at: 300 },
  },
  unitsRead: { "t-01-01": 50, "m-02-01": 70 },
};
const deviceB: LearningRecordV1 = {
  v: 1,
  questions: {
    "2016h28h-q033": { choice: "エ", correct: true, at: 200 },
    "2019r01a-q001": { choice: "ウ", correct: false, at: 10 },
  },
  unitsRead: { "t-01-01": 20, "s-03-02": 5 },
};

/** A v2 record with several attempts on one question, a setting and v2Since. */
const v2Doc: LearningRecord = mergeRecords(
  {
    v: 2,
    attempts: {
      "2016h28h-q033": [
        { at: 400, choice: "イ", correct: true, src: "practice" },
        { at: 100, choice: "ア", correct: false, src: "v1" },
      ],
      "2018h30h-q050": [{ at: 250, choice: "エ", correct: false, src: "mock" }],
    },
    unitsRead: { "t-01-01": 40 },
    settings: { dailyReviewCap: { value: 40, at: 9 } },
    v2Since: 90,
  },
  emptyRecord(),
);

/** Stored form of a v2 record: what mergeAndStore writes. */
const storedForm = (r: LearningRecord): string => JSON.stringify(encodeRecord(r));

/** The stored v2 doc, parsed. */
function storedV2(): LearningRecord | null {
  const raw = redisHolder.current!.kv.get(LEARNING_REDIS_KEY);
  return typeof raw === "string" ? parseRecord(JSON.parse(raw)) : null;
}

/** A valid v1 record whose JSON body is exactly `bytes` UTF-8 bytes (ASCII padding in a unit id). */
function recordOfBytes(bytes: number): string {
  const base = JSON.stringify({ v: 1, questions: {}, unitsRead: { "": 1 } });
  const body = JSON.stringify({ v: 1, questions: {}, unitsRead: { ["u".repeat(bytes - base.length)]: 1 } });
  expect(new TextEncoder().encode(body).byteLength).toBe(bytes);
  return body;
}

let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] }); // Date only: stream reads still run on real timers
  vi.setSystemTime(NOW); // upgradeV1's `now` is deterministic
  vi.stubEnv("OWNER_KEY", OWNER_KEY);
  redisHolder.current = makeFakeLearningRedis();
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  errSpy.mockRestore();
});

describe("storage keys", () => {
  it("v2 key learn:owner:v2, old v1 key learn:owner:v1", () => {
    expect(LEARNING_REDIS_KEY).toBe("learn:owner:v2");
    expect(LEARNING_REDIS_V1_KEY).toBe("learn:owner:v1");
  });
});

describe("readStored", () => {
  it("both keys missing → emptyRecord() (v2 key read first, then v1)", async () => {
    const fake = redisHolder.current!;
    expect(await readStored(fake, NOW)).toEqual(emptyRecord());
    expect(fake.readKeys).toEqual([LEARNING_REDIS_KEY, LEARNING_REDIS_V1_KEY]);
  });

  it("the fake's get() auto-deserializes a stored JSON string like @upstash/redis", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, storedForm(v2Doc));
    expect(await fake.get(LEARNING_REDIS_KEY)).toEqual(encodeRecord(v2Doc));
    fake.kv.set(LEARNING_REDIS_KEY, "{not json");
    expect(await fake.get(LEARNING_REDIS_KEY)).toBe("{not json");
    expect(fake.gets).toBe(2);
  });

  it("v2 key present → that record; the v1 key is not read", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, storedForm(v2Doc));
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(deviceB));
    expect(await readStored(fake, NOW)).toEqual(v2Doc);
    expect(fake.readKeys).toEqual([LEARNING_REDIS_KEY]);
  });

  it("v2 key missing → the v1 doc upgraded with v2Since = now", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(deviceA));
    expect(await readStored(fake, NOW)).toEqual(upgradeV1(deviceA, NOW));
    expect(fake.sets).toBe(0);
  });

  it("object and JSON-string shapes from get() give the same record (both keys)", async () => {
    for (const [key, doc, expected] of [
      [LEARNING_REDIS_KEY, encodeRecord(v2Doc), v2Doc],
      [LEARNING_REDIS_V1_KEY, deviceA, upgradeV1(deviceA, NOW)],
    ] as const) {
      const fake = makeFakeLearningRedis();
      fake.kv.set(key, structuredClone(doc));
      const fromObject = await readStored(fake, NOW);
      // deserialization off: get() hands back the raw JSON string
      fake.autoDeserialize = false;
      fake.kv.set(key, JSON.stringify(doc));
      expect(typeof (await fake.get(key))).toBe("string");
      const fromString = await readStored(fake, NOW);
      expect(fromObject).toEqual(expected);
      expect(fromString).toEqual(fromObject);
    }
  });

  it("a present but invalid v2 doc throws CorruptStoredRecordError — no fallback to the v1 key", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(deviceA));
    const bad: unknown[] = [
      "{not json",
      JSON.stringify({ v: 2 }),
      { v: 2, a: { q: [[1, 4, 1, "p"]] }, u: {}, s: {} },
      JSON.stringify(deviceA), // a v1 doc is not valid at the v2 key
      42,
      "plain",
    ];
    for (const x of bad) {
      fake.kv.set(LEARNING_REDIS_KEY, x);
      await expect(readStored(fake, NOW)).rejects.toBeInstanceOf(CorruptStoredRecordError);
    }
    expect(fake.readKeys.every((k) => k === LEARNING_REDIS_KEY)).toBe(true);
  });

  it("v2 key missing and an invalid v1 doc throws CorruptStoredRecordError", async () => {
    const fake = redisHolder.current!;
    const bad: unknown[] = [
      "{not json",
      { v: 1, questions: [] },
      storedForm(v2Doc), // a v2 doc is not valid at the v1 key
      { v: 1, questions: { q: { choice: "ア", correct: true, at: 1e300 } }, unitsRead: {} }, // not upgradable
      42,
    ];
    for (const x of bad) {
      fake.kv.set(LEARNING_REDIS_V1_KEY, x);
      await expect(readStored(fake, NOW)).rejects.toBeInstanceOf(CorruptStoredRecordError);
    }
  });

  it("mergeAndStore writes only the v2 key, in v2 wire form", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(deviceA));
    const incoming = upgradeV1(deviceB, NOW);
    const merged = await mergeAndStore(fake, incoming, NOW);
    expect(merged).toEqual(mergeRecords(upgradeV1(deviceA, NOW), incoming));
    expect(fake.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
    expect(fake.kv.get(LEARNING_REDIS_KEY)).toBe(storedForm(merged));
    expect(fake.kv.get(LEARNING_REDIS_V1_KEY)).toBe(JSON.stringify(deviceA));
  });

  it("mergeAndStore writes nothing when either stored doc is corrupt", async () => {
    for (const key of [LEARNING_REDIS_KEY, LEARNING_REDIS_V1_KEY]) {
      const fake = makeFakeLearningRedis();
      fake.kv.set(key, "{not json");
      await expect(mergeAndStore(fake, upgradeV1(deviceA, NOW), NOW)).rejects.toBeInstanceOf(
        CorruptStoredRecordError,
      );
      expect(fake.sets).toBe(0);
      expect(fake.kv.get(key)).toBe("{not json");
    }
  });
});

describe("owner gate (403) and Redis config (503)", () => {
  it("non-owner GET / PUT → 403 and nothing is written", async () => {
    for (const cookie of [null, "itp_owner=nope"]) {
      expect((await GET(get(cookie))).status).toBe(403);
      expect((await GET(get(cookie, "?v=2"))).status).toBe(403);
      expect((await PUT(put(deviceA, cookie))).status).toBe(403);
      expect((await PUT(put(encodeRecord(v2Doc), cookie))).status).toBe(403);
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
    expect((await PUT(put("x".repeat(CAP + 1), null))).status).toBe(403);
    expect(redisHolder.current!.gets).toBe(0);
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("redis null → 503 for GET and PUT", async () => {
    redisHolder.current = null;
    expect((await GET(get())).status).toBe(503);
    expect((await GET(get(OWNER_COOKIE_HEADER, "?v=2"))).status).toBe(503);
    expect((await PUT(put(deviceA))).status).toBe(503);
  });
});

describe("GET /api/learning", () => {
  it("returns an empty record when nothing is stored (v1 by default, v2 with ?v=2)", async () => {
    const res = await GET(get());
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.json()).toEqual(emptyRecordV1());
    const res2 = await GET(get(OWNER_COOKIE_HEADER, "?v=2"));
    expect(res2.status).toBe(200);
    expect(await res2.json()).toEqual({ v: 2, a: {}, u: {}, s: {} });
  });

  it("GET without ?v returns a v1 record (downgraded)", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_KEY, storedForm(v2Doc));
    const expected = downgradeToV1(v2Doc);
    // the latest attempt per question; settings / v2Since have no v1 form
    expect(expected).toEqual({
      v: 1,
      questions: {
        "2016h28h-q033": { choice: "イ", correct: true, at: 400 },
        "2018h30h-q050": { choice: "エ", correct: false, at: 250 },
      },
      unitsRead: { "t-01-01": 40 },
    });
    for (const query of ["", "?v=1", "?v=3", "?v=", "?v=2x"]) {
      const res = await GET(get(OWNER_COOKIE_HEADER, query));
      expect(res.status).toBe(200);
      const body: unknown = await res.json();
      expect(body).toEqual(expected);
      // the v1 client's trust boundary accepts it unchanged
      expect(parseRecordV1(body)).toEqual(expected);
    }
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("GET ?v=2 returns v2 wire", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_KEY, storedForm(v2Doc));
    const res = await GET(get(OWNER_COOKIE_HEADER, "?v=2"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const text = await res.text();
    expect(text).toBe(storedForm(v2Doc));
    expect(parseRecord(JSON.parse(text))).toEqual(v2Doc);
  });

  it("first read falls back to learn:owner:v1 and never writes it", async () => {
    const fake = redisHolder.current!;
    const v1Stored = JSON.stringify(deviceA);
    fake.kv.set(LEARNING_REDIS_V1_KEY, v1Stored);

    const r1 = await GET(get());
    expect(r1.status).toBe(200);
    expect(await r1.json()).toEqual(deviceA);
    const r2 = await GET(get(OWNER_COOKIE_HEADER, "?v=2"));
    expect(await r2.text()).toBe(storedForm(upgradeV1(deviceA, NOW)));
    expect(fake.writtenKeys).toEqual([]); // GET never migrates

    // the first PUT writes the merged doc to the v2 key only
    const r3 = await PUT(put(deviceB));
    expect(r3.status).toBe(200);
    expect(await r3.json()).toEqual(mergeRecordsV1(deviceA, deviceB));
    expect(fake.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
    expect(fake.kv.get(LEARNING_REDIS_V1_KEY)).toBe(v1Stored);
    expect(storedV2()).toEqual(mergeRecords(upgradeV1(deviceA, NOW), upgradeV1(deviceB, NOW)));

    // from now on the v1 key is not read
    fake.readKeys.length = 0;
    expect(await (await GET(get())).json()).toEqual(mergeRecordsV1(deviceA, deviceB));
    expect(fake.readKeys).toEqual([LEARNING_REDIS_KEY]);
    expect(fake.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
  });

  it("corrupt stored v2 doc → 500 and a log naming the failure only", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_KEY, "{\"v\":2,\"secret-choice\"");
    for (const query of ["", "?v=2"]) {
      errSpy.mockClear();
      const res = await GET(get(OWNER_COOKIE_HEADER, query));
      expect(res.status).toBe(500);
      expect(errSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.stringify(errSpy.mock.calls);
      expect(logged).toContain("[learning-sync-error]");
      expect(logged).toContain("CorruptStoredRecordError");
      expect(logged).not.toContain("secret-choice");
      expect(logged).not.toContain("itp_owner");
    }
  });

  it("corrupt stored v1 doc (v2 key missing) → 500 and a log naming the failure only", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_V1_KEY, "{\"v\":1,\"secret-choice\"");
    const res = await GET(get());
    expect(res.status).toBe(500);
    expect(errSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(errSpy.mock.calls);
    expect(logged).toContain("[learning-sync-error]");
    expect(logged).not.toContain("secret-choice");
    expect(logged).not.toContain("itp_owner");
    expect(redisHolder.current!.sets).toBe(0);
  });
});

describe("PUT /api/learning", () => {
  it('PUT v1 body → 200 v1 body; stored v2 doc gains a src "v1" attempt', async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, storedForm(v2Doc));
    const res = await PUT(put(deviceA));
    expect(res.status).toBe(200);
    const body: unknown = await res.json();

    const merged = mergeRecords(v2Doc, upgradeV1(deviceA, NOW));
    expect(storedV2()).toEqual(merged);
    expect(fake.kv.get(LEARNING_REDIS_KEY)).toBe(storedForm(merged));
    // the new v1 answer is stored as a "v1" attempt next to the existing ones
    expect(merged.attempts["2017h29a-q015"]).toEqual([{ at: 300, choice: "イ", correct: true, src: "v1" }]);
    expect(merged.attempts["2016h28h-q033"]).toEqual(v2Doc.attempts["2016h28h-q033"]); // (100, ア, ✗) deduped
    expect(merged.settings).toEqual(v2Doc.settings);
    expect(merged.v2Since).toBe(90); // min(stored 90, upgrade now)

    // response: the merged record downgraded, accepted by the v1 client as-is
    expect(body).toEqual(downgradeToV1(merged));
    expect(parseRecordV1(body)).toEqual(body);
    expect((body as LearningRecordV1).questions["2016h28h-q033"]).toEqual({ choice: "イ", correct: true, at: 400 });
  });

  it("PUT v2 body → 200 v2 wire", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(deviceB));
    const incoming = recordAttempt(v2Doc, "2019r01a-q001", "ア", true, 500);
    const res = await PUT(put(encodeRecord(incoming)));
    expect(res.status).toBe(200);
    const text = await res.text();
    const merged = mergeRecords(upgradeV1(deviceB, NOW), incoming);
    expect(text).toBe(storedForm(merged));
    expect(fake.kv.get(LEARNING_REDIS_KEY)).toBe(text);
    expect(parseRecord(JSON.parse(text))).toEqual(merged);
    expect(merged.v2Since).toBe(90);
    // a v1 tab then sees the v2 answer as its latest
    expect((await (await GET(get())).json()).questions["2019r01a-q001"]).toEqual({
      choice: "ア",
      correct: true,
      at: 500,
    });
  });

  it("v1 client round-trip: two PUTs for different questions, then GET shows both as sent", async () => {
    const first: LearningRecordV1 = {
      v: 1,
      questions: { "2020r02o-q010": { choice: "ウ", correct: true, at: NOW - 5000 } },
      unitsRead: { "t-02-03": NOW - 9000 },
    };
    const second: LearningRecordV1 = {
      v: 1,
      questions: { "2021r03h-q077": { choice: "エ", correct: false, at: NOW - 1000 } },
      unitsRead: {},
    };
    const p1 = await PUT(put(first));
    expect(p1.status).toBe(200);
    expect(await p1.json()).toEqual(first);
    const p2 = await PUT(put(second));
    expect(p2.status).toBe(200);
    const both = mergeRecordsV1(first, second);
    expect(await p2.json()).toEqual(both);

    const res = await GET(get());
    expect(res.status).toBe(200);
    const body = parseRecordV1(await res.json());
    expect(body).not.toBeNull();
    expect(body!.questions["2020r02o-q010"]).toEqual(first.questions["2020r02o-q010"]);
    expect(body!.questions["2021r03h-q077"]).toEqual(second.questions["2021r03h-q077"]);
    expect(body).toEqual(both);
    // stored as two "v1" attempts in the v2 doc
    expect(Object.values(storedV2()!.attempts).flat().map((a) => a.src)).toEqual(["v1", "v1"]);
  });

  it("v1 devices merge as before: response = v1 mergeRecords(a, b); stored doc order-independent", async () => {
    const r1 = await PUT(put(deviceA));
    expect(r1.status).toBe(200);
    expect(await r1.json()).toEqual(deviceA);

    const r2 = await PUT(put(deviceB));
    expect(r2.status).toBe(200);
    expect(await r2.json()).toEqual(mergeRecordsV1(deviceA, deviceB));
    const stored = redisHolder.current!.kv.get(LEARNING_REDIS_KEY);
    expect(stored).toBe(storedForm(mergeRecords(upgradeV1(deviceA, NOW), upgradeV1(deviceB, NOW))));
    // B then A stores the identical document
    const other = makeFakeLearningRedis();
    redisHolder.current = other;
    await PUT(put(deviceB));
    await PUT(put(deviceA));
    expect(other.kv.get(LEARNING_REDIS_KEY)).toBe(stored);
  });

  it("merges with a stored doc that get() returns as an object", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_KEY, encodeRecord(upgradeV1(deviceA, NOW)));
    const res = await PUT(put(deviceB));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mergeRecordsV1(deviceA, deviceB));
  });

  it("400 on invalid JSON / neither v1 nor v2, nothing written", async () => {
    const bad: unknown[] = [
      "not json",
      "",
      { v: 2, questions: {}, unitsRead: {} },
      { ...deviceA, unitsRead: { u: -1 } },
      { v: 2, a: { q: [[1, 4, 1, "p"]] }, u: {}, s: {} },
      { v: 2, a: {}, u: {}, s: { examDate: ["2026-02-30", 1] } },
      { v: 1, questions: { q: { choice: "ア", correct: true, at: 1e300 } }, unitsRead: {} }, // not upgradable
      { v: 3, a: {}, u: {}, s: {} },
    ];
    for (const x of bad) expect((await PUT(put(x))).status).toBe(400);
    expect(redisHolder.current!.sets).toBe(0);
  });

  it("body of 1048576 bytes accepted, 1048577 → 400", async () => {
    const ok = await PUT(put(recordOfBytes(CAP)));
    expect(ok.status).toBe(200);
    expect(redisHolder.current!.sets).toBe(1);
    expect((await PUT(put(recordOfBytes(CAP + 1)))).status).toBe(400);
    expect(redisHolder.current!.sets).toBe(1);
  });

  it("caps on bytes actually read, not on Content-Length or string length", async () => {
    // a lying small Content-Length does not let an oversized body through
    expect((await PUT(put(recordOfBytes(CAP + 1), OWNER_COOKIE_HEADER, { "content-length": "10" }))).status).toBe(400);
    // multi-byte: 400k chars of "ア" = 1.2M UTF-8 bytes
    const wide = JSON.stringify({
      v: 1,
      questions: { q: { choice: "ア".repeat(400_000), correct: true, at: 1 } },
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

  it("corrupt stored v2 doc → 500 and the stored value is left unchanged", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_KEY, "{corrupt");
    for (const body of [deviceA, encodeRecord(v2Doc)]) {
      const res = await PUT(put(body));
      expect(res.status).toBe(500);
    }
    expect(fake.sets).toBe(0);
    expect(fake.kv.get(LEARNING_REDIS_KEY)).toBe("{corrupt");
  });

  it("corrupt stored v1 doc (v2 key missing) → 500, nothing written", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, "{corrupt");
    for (const body of [deviceA, encodeRecord(v2Doc)]) {
      const res = await PUT(put(body));
      expect(res.status).toBe(500);
    }
    expect(fake.sets).toBe(0);
    expect(fake.kv.get(LEARNING_REDIS_V1_KEY)).toBe("{corrupt");
    expect(fake.kv.has(LEARNING_REDIS_KEY)).toBe(false);
  });

  it("Redis failure → 502, logging the error name only", async () => {
    const fake = redisHolder.current!;
    fake.get = async () => {
      throw new Error("ECONNRESET body={\"secret-choice\":1}");
    };
    expect((await PUT(put(deviceA))).status).toBe(502);
    expect((await PUT(put(encodeRecord(v2Doc)))).status).toBe(502);
    expect((await GET(get())).status).toBe(502);
    expect((await GET(get(OWNER_COOKIE_HEADER, "?v=2"))).status).toBe(502);
    expect(fake.sets).toBe(0);
    const logged = JSON.stringify(errSpy.mock.calls);
    expect(logged).toContain("[learning-sync-error]");
    expect(logged).not.toContain("secret-choice");
    expect(logged).not.toContain("ECONNRESET");
  });
});
