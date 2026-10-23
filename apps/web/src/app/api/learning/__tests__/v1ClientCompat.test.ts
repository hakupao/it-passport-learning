// D-190 §0-3 (server first) — the OLD v1 client against the NEW route, end to
// end in-process: the frozen copy of the pre-Stage-7 client
// (lib/learning/__tests__/v1Client.ts — v1 model + GET without ?v / PUT v1
// body, parsed with parseRecordV1) talks to route.ts GET / PUT through a
// FetchLike shim (owner cookie set, Redis = the in-memory fake).
// `V1Device` reproduces the sync cycle of the pre-Stage-7 useLearningRecord.ts:
// GET once → applyRemote (lastSynced + mergeIfChanged); a change → PUT the
// full record when canonicalJson differs from lastSynced → applyRemote; page
// hide → hideFlushPlan(current, lastSynced) delta PUT with keepalive.
// e2e/learning-owner.spec.ts mocks /api/learning, so this is the check that an
// old tab keeps working after the server deploy (and after the v2 client ships:
// both kinds of tab share the server).

import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { encodeRecord, recordAttempt, emptyRecord as emptyRecordV2 } from "@/lib/learning/record";
import { parseRecordV1 as parseRecord, type LearningRecordV1 as LearningRecord } from "@/lib/learning/recordV1";
import type { FetchLike } from "@/lib/learning/syncClient";
import { makeFakeLearningRedis } from "@/lib/learning/__tests__/fakeLearningRedis";
import {
  canonicalJsonV1 as canonicalJson,
  emptyRecordV1 as emptyRecord,
  hideFlushPlanV1 as hideFlushPlan,
  mergeIfChangedV1 as mergeIfChanged,
  mergeRecordsV1 as mergeRecords,
  pullRemoteV1 as pullRemote,
  pushRemoteV1 as pushRemote,
  recordAnswerV1 as recordAnswer,
} from "@/lib/learning/__tests__/v1Client";

const { redisHolder } = vi.hoisted(() => ({
  redisHolder: { current: null as ReturnType<typeof makeFakeLearningRedis> | null },
}));

vi.mock("@/lib/learning/syncStore", async () => {
  const actual = await vi.importActual<typeof import("@/lib/learning/syncStore")>(
    "@/lib/learning/syncStore",
  );
  return { ...actual, loadLearningRedis: async () => redisHolder.current };
});

import { LEARNING_REDIS_KEY, LEARNING_REDIS_V1_KEY } from "@/lib/learning/syncStore";

import { GET, PUT } from "../route";

const OWNER_KEY = "test-owner-key";
const OWNER_COOKIE = `itp_owner=${createHash("sha256").update(OWNER_KEY).digest("hex")}`;
const ORIGIN = "http://localhost";
const NOW = Date.UTC(2026, 9, 23, 5, 0, 0);

interface Call {
  method: string;
  keepalive: boolean;
  body: unknown;
}

/** FetchLike that hands the request straight to the route handlers, as the owner. */
function routeFetch(calls: Call[]): FetchLike {
  return async (input, init) => {
    const method = init.method ?? "GET";
    const body = typeof init.body === "string" ? init.body : undefined;
    // the old client never asks for v2
    expect(input).toBe("/api/learning");
    calls.push({ method, keepalive: init.keepalive === true, body: body === undefined ? undefined : JSON.parse(body) });
    const headers = new Headers(init.headers);
    headers.set("cookie", OWNER_COOKIE);
    const request = new Request(ORIGIN + input, { method, headers, body, signal: init.signal ?? undefined });
    if (method === "GET") return GET(request);
    if (method === "PUT") return PUT(request);
    throw new Error(`unexpected method ${method}`);
  };
}

/** The owner provider's sync state machine (useLearningRecord.ts steps 2, 4, 5), without React. */
class V1Device {
  record: LearningRecord = emptyRecord();
  lastSynced: LearningRecord | null = null;
  lastSyncedJson: string | null = null;
  readonly calls: Call[] = [];
  private readonly fetch = routeFetch(this.calls);

  constructor(local: LearningRecord = emptyRecord()) {
    this.record = mergeRecords(this.record, local);
  }

  /** applyRemote: remember as synced, merge in; returns whether the record object stayed the same. */
  private applyRemote(remote: LearningRecord): boolean {
    this.lastSynced = remote;
    this.lastSyncedJson = canonicalJson(remote);
    const prev = this.record;
    this.record = mergeIfChanged(prev, remote);
    return this.record === prev;
  }

  /** (2) the initial GET. */
  async load(): Promise<LearningRecord> {
    const remote = await pullRemote(this.fetch);
    expect(remote).not.toBeNull();
    this.applyRemote(remote!);
    return remote!;
  }

  answer(qid: string, choice: string, correct: boolean, at: number): void {
    this.record = recordAnswer(this.record, qid, choice, correct, at);
  }

  /** (4) the debounced PUT: none when the record equals lastSynced. Returns the response, or null when no PUT. */
  async sync(): Promise<{ response: LearningRecord; unchanged: boolean } | null> {
    if (canonicalJson(this.record) === this.lastSyncedJson) return null;
    const response = await pushRemote(this.fetch, this.record);
    expect(response).not.toBeNull();
    return { response: response!, unchanged: this.applyRemote(response!) };
  }

  /** (5) the page-hide flush. */
  async hideFlush(): Promise<{ sent: LearningRecord; keepalive: boolean; response: LearningRecord }> {
    const plan = hideFlushPlan(this.record, this.lastSynced);
    const response = await pushRemote(this.fetch, plan.record, { keepalive: plan.keepalive });
    expect(response).not.toBeNull();
    this.applyRemote(response!);
    return { sent: plan.record, keepalive: plan.keepalive, response: response! };
  }
}

/** What a v1 GET returns right now (outside any device's state). */
async function serverV1(): Promise<LearningRecord> {
  const r = await pullRemote(routeFetch([]));
  expect(r).not.toBeNull();
  return r!;
}

let warnSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  vi.stubEnv("OWNER_KEY", OWNER_KEY);
  redisHolder.current = makeFakeLearningRedis();
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  // the old client never hit a failure path (non-2xx / unparsable response)
  expect(warnSpy).not.toHaveBeenCalled();
  expect(errSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
  errSpy.mockRestore();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("v1 client × v2 route", () => {
  it("empty store: GET → v1 record; answer → full PUT; response adds nothing → no further PUT", async () => {
    const d = new V1Device();
    const remote = await d.load();
    expect(remote).toEqual(emptyRecord());
    expect(parseRecord(remote)).toEqual(remote);

    d.answer("2020r02o-q010", "ウ", true, NOW - 5000);
    const local = d.record;
    const put = await d.sync();
    expect(put).not.toBeNull();
    expect(d.calls.map((c) => c.method)).toEqual(["GET", "PUT"]);
    expect(d.calls[1]!.body).toEqual(local); // full record
    expect(put!.unchanged).toBe(true); // mergeIfChanged returned prev itself
    expect(d.record).toBe(local);
    expect(canonicalJson(put!.response)).toBe(canonicalJson(local));
    expect(await d.sync()).toBeNull(); // no ping-pong
    expect(d.calls).toHaveLength(2);
    expect(redisHolder.current!.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
  });

  it("legacy doc only at learn:owner:v1: GET returns it; PUT adds an answer; v1 key unchanged, v2 key holds both", async () => {
    const fake = redisHolder.current!;
    const legacy: LearningRecord = {
      v: 1,
      questions: { "2016h28h-q033": { choice: "ア", correct: false, at: NOW - 86_400_000 } },
      unitsRead: { "t-01-01": NOW - 90_000_000 },
    };
    const legacyJson = JSON.stringify(legacy);
    fake.kv.set(LEARNING_REDIS_V1_KEY, legacyJson);

    const d = new V1Device();
    expect(await d.load()).toEqual(legacy);
    expect(d.record).toEqual(legacy);

    d.answer("2019r01a-q001", "イ", true, NOW - 1000);
    const put = await d.sync();
    expect(put!.unchanged).toBe(true);
    expect(put!.response).toEqual(d.record);
    expect(Object.keys(put!.response.questions).sort()).toEqual(["2016h28h-q033", "2019r01a-q001"]);

    expect(fake.kv.get(LEARNING_REDIS_V1_KEY)).toBe(legacyJson);
    expect(fake.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
    const stored = JSON.parse(fake.kv.get(LEARNING_REDIS_KEY) as string) as { a: Record<string, unknown> };
    expect(Object.keys(stored.a).sort()).toEqual(["2016h28h-q033", "2019r01a-q001"]);
    // a fresh v1 tab sees both
    expect(await serverV1()).toEqual(d.record);
  });

  it("a v2 device's newer attempts for another question show up in the v1 device's GET", async () => {
    const d1 = new V1Device();
    await d1.load();
    d1.answer("2016h28h-q033", "ア", false, NOW - 9000);
    await d1.sync();

    // device 2 (v2 client) answers another question twice, the latest wrong
    let v2 = recordAttempt(emptyRecordV2(), "2017h29a-q015", "イ", true, NOW - 3000);
    v2 = recordAttempt(v2, "2017h29a-q015", "エ", false, NOW - 2000);
    const res = await PUT(
      new Request(`${ORIGIN}/api/learning`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", cookie: OWNER_COOKIE },
        body: JSON.stringify(encodeRecord(v2)),
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).v).toBe(2);

    // device 1 reloads (new page): GET, then merge
    const remote = await d1.load();
    expect(parseRecord(remote)).toEqual(remote);
    expect(remote.questions["2017h29a-q015"]).toEqual({ choice: "エ", correct: false, at: NOW - 2000 });
    expect(d1.record.questions["2017h29a-q015"]).toEqual({ choice: "エ", correct: false, at: NOW - 2000 });
    expect(d1.record.questions["2016h28h-q033"]).toEqual({ choice: "ア", correct: false, at: NOW - 9000 });
    expect(await d1.sync()).toBeNull(); // nothing new to send
  });

  it("page-hide delta PUT (keepalive) → response = v1 mergeRecords(server before, full local)", async () => {
    const d = new V1Device();
    await d.load();
    d.answer("2016h28h-q033", "ア", false, NOW - 9000);
    d.answer("2017h29a-q015", "イ", true, NOW - 8000);
    await d.sync();

    // meanwhile another v1 tab / device writes (server moves past d.lastSynced)
    const other = new V1Device();
    await other.load();
    other.answer("2019r01a-q001", "ウ", false, NOW - 7000);
    other.answer("2017h29a-q015", "エ", false, NOW - 7500); // newer than d's answer
    await other.sync();

    // d answers more (one re-answer, one new question), then the page is hidden
    d.answer("2016h28h-q033", "イ", true, NOW - 4000);
    d.answer("2021r03h-q077", "エ", true, NOW - 3000);
    const fullLocal = d.record;
    const serverBefore = await serverV1();
    const flush = await d.hideFlush();

    expect(flush.keepalive).toBe(true);
    expect(d.calls.at(-1)).toMatchObject({ method: "PUT", keepalive: true });
    expect(Object.keys(flush.sent.questions).sort()).toEqual(["2016h28h-q033", "2021r03h-q077"]); // delta only
    expect(flush.response).toEqual(mergeRecords(serverBefore, fullLocal));
    expect(flush.response.questions["2017h29a-q015"]).toEqual({ choice: "エ", correct: false, at: NOW - 7500 });
    expect(d.record).toEqual(mergeRecords(serverBefore, fullLocal));
    expect(await serverV1()).toEqual(flush.response);
  });
});
