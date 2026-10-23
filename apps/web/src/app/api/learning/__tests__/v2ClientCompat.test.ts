// D-190 — the NEW v2 client (syncClient + localStore + record) against the
// route, end to end in-process, as the owner (Redis = the in-memory fake).
// `V2Device` reproduces the sync cycle of src/hooks/useLearningRecord.ts:
// loadLocal(storage, now) → GET ?v=2 once → applyRemote (lastSynced +
// mergeIfChanged); a change → PUT the full record when canonicalJson differs
// from lastSynced → applyRemote; every change is saved with saveLocal.
//
// The trap pinned here: while the server store holds only the old
// learn:owner:v1 doc, every GET ?v=2 upgrades it with the request time, so each
// response carries a different `since`. Merging takes the min, so the client
// sends at most one extra PUT (which moves the doc to learn:owner:v2 with the
// earliest since) and then settles — never a PUT loop.

import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyStorageEvent, loadLocal, saveLocal } from "@/lib/learning/localStore";
import {
  canonicalJson,
  emptyRecord,
  mergeIfChanged,
  mergeRecords,
  parseRecord,
  recordAttempt,
  type LearningRecord,
} from "@/lib/learning/record";
import { LEARNING_V1_STORAGE_KEY, type LearningRecordV1 } from "@/lib/learning/recordV1";
import { hideFlushPlan, pullRemote, pushRemote, type FetchLike } from "@/lib/learning/syncClient";
import { makeFakeLearningRedis } from "@/lib/learning/__tests__/fakeLearningRedis";
import type { StorageLike } from "@/lib/storage";

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
const T0 = Date.UTC(2026, 9, 23, 5, 0, 0);

interface Call {
  method: string;
  url: string;
  keepalive?: boolean;
  body?: unknown;
}

function routeFetch(calls: Call[]): FetchLike {
  return async (input, init) => {
    const method = init.method ?? "GET";
    const sent = typeof init.body === "string" ? (JSON.parse(init.body) as unknown) : undefined;
    calls.push({ method, url: input, ...(init.keepalive ? { keepalive: true } : {}), ...(sent ? { body: sent } : {}) });
    const headers = new Headers(init.headers);
    headers.set("cookie", OWNER_COOKIE);
    const body = typeof init.body === "string" ? init.body : undefined;
    const request = new Request(ORIGIN + input, { method, headers, body });
    if (method === "GET") return GET(request);
    if (method === "PUT") return PUT(request);
    throw new Error(`unexpected method ${method}`);
  };
}

function memStorage(seed: Record<string, string> = {}): StorageLike & { map: Map<string, string> } {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

/** Advance the fake clock so every server request upgrades the v1 doc with a new `now`. */
const tick = (ms = 1000) => vi.setSystemTime(Date.now() + ms);

/** One page load of the owner provider (useLearningRecord.ts steps 1–5), without React. */
class V2Device {
  record: LearningRecord = emptyRecord();
  lastSynced: LearningRecord | null = null;
  lastSyncedJson: string | null = null;
  readonly calls: Call[] = [];
  private readonly fetch = routeFetch(this.calls);

  constructor(readonly storage: StorageLike) {}

  private set(next: LearningRecord): void {
    if (next !== this.record) {
      this.record = next;
      saveLocal(this.storage, next);
    }
  }

  private applyRemote(remote: LearningRecord): void {
    this.lastSynced = remote;
    this.lastSyncedJson = canonicalJson(remote);
    this.set(mergeIfChanged(this.record, remote));
  }

  /** (1) local load (now = Date.now()), then `gapMs` later (2) the GET ?v=2. */
  async load(gapMs = 1000): Promise<LearningRecord> {
    this.set(mergeRecords(this.record, loadLocal(this.storage, Date.now())));
    tick(gapMs);
    const remote = await pullRemote(this.fetch);
    expect(remote).not.toBeNull();
    this.applyRemote(remote!);
    return remote!;
  }

  answer(qid: string, choice: "ア" | "イ" | "ウ" | "エ", correct: boolean): void {
    this.set(recordAttempt(this.record, qid, choice, correct, Date.now()));
  }

  /** (3a) another tab's write reached this one (window "storage" event, now = Date.now()). */
  onStorage(key: string, newValue: string | null): void {
    this.set(applyStorageEvent(this.record, { key, newValue }, Date.now()));
  }

  /** (5) the page-hide flush: delta since lastSynced (keepalive while it fits). */
  async hideFlush(): Promise<{ sent: LearningRecord; keepalive: boolean; response: LearningRecord }> {
    const plan = hideFlushPlan(this.record, this.lastSynced);
    const response = await pushRemote(this.fetch, plan.record, { keepalive: plan.keepalive });
    expect(response).not.toBeNull();
    this.applyRemote(response!);
    return { sent: plan.record, keepalive: plan.keepalive, response: response! };
  }

  /** (4) the debounced PUT; null when the record equals lastSynced. */
  async sync(): Promise<LearningRecord | null> {
    if (canonicalJson(this.record) === this.lastSyncedJson) return null;
    const response = await pushRemote(this.fetch, this.record);
    expect(response).not.toBeNull();
    this.applyRemote(response!);
    return response!;
  }

  /** Debounce fires until nothing is left to send; returns the number of PUTs. */
  async settle(maxRounds = 5): Promise<number> {
    let puts = 0;
    for (let i = 0; i < maxRounds; i++) {
      tick();
      if ((await this.sync()) === null) return puts;
      puts++;
    }
    return puts;
  }
}

const LEGACY: LearningRecordV1 = {
  v: 1,
  questions: { "2016h28h-q033": { choice: "ア", correct: false, at: T0 - 86_400_000 } },
  unitsRead: { "t-01-01": T0 - 90_000_000 },
};

let warnSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(T0);
  vi.stubEnv("OWNER_KEY", OWNER_KEY);
  redisHolder.current = makeFakeLearningRedis();
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  expect(warnSpy).not.toHaveBeenCalled();
  expect(errSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
  errSpy.mockRestore();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("v2 client × route", () => {
  it("GETs ?v=2 and PUTs v2 wire; the server stores it at learn:owner:v2", async () => {
    const d = new V2Device(memStorage());
    expect(await d.load()).toEqual(emptyRecord());
    tick();
    d.answer("2020r02o-q010", "ウ", true);
    expect(await d.settle()).toBe(1);
    expect(d.calls.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: "GET", url: "/api/learning?v=2" },
      { method: "PUT", url: "/api/learning" },
    ]);
    const stored = parseRecord(JSON.parse(redisHolder.current!.kv.get(LEARNING_REDIS_KEY) as string));
    expect(stored).toEqual(mergeRecords(d.record, emptyRecord()));
    expect(redisHolder.current!.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
  });

  it("premise: while only learn:owner:v1 exists, each GET ?v=2 returns a different since", async () => {
    redisHolder.current!.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(LEGACY));
    const a = await pullRemote(routeFetch([]));
    tick();
    const b = await pullRemote(routeFetch([]));
    expect(a!.v2Since).toBe(T0);
    expect(b!.v2Since).toBe(T0 + 1000);
    expect(redisHolder.current!.writtenKeys).toEqual([]);
  });

  it("v1-only server + nothing local: no PUT on the first page; one PUT on the next; then none (no loop)", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(LEGACY));
    const storage = memStorage();

    // page 1: the GET's record (since = its request time) becomes the local one; it equals lastSynced
    const p1 = new V2Device(storage);
    const since1 = (await p1.load()).v2Since!;
    expect(since1).toBe(T0 + 1000);
    expect(p1.record.v2Since).toBe(since1);
    expect(await p1.settle()).toBe(0);
    expect(fake.writtenKeys).toEqual([]);

    // page 2 (later): local since T0 < the GET's since → exactly one PUT
    tick(60_000);
    const p2 = new V2Device(storage);
    const remote2 = await p2.load();
    expect(remote2.v2Since).toBeGreaterThan(since1);
    expect(p2.record.v2Since).toBe(since1);
    expect(await p2.settle()).toBe(1);
    expect(fake.writtenKeys).toEqual([LEARNING_REDIS_KEY]);

    // page 3: the server now holds the earliest since → nothing to send
    tick(60_000);
    const p3 = new V2Device(storage);
    expect((await p3.load()).v2Since).toBe(since1);
    expect(await p3.settle()).toBe(0);
    expect(fake.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
    expect(fake.kv.get(LEARNING_REDIS_V1_KEY)).toBe(JSON.stringify(LEGACY)); // never written
  });

  it("v1-only server + an old tab's itp:learn:v1 locally: one PUT carries both, then the drift settles", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(LEGACY));
    const oldTab: LearningRecordV1 = {
      v: 1,
      questions: { "2019r01a-q001": { choice: "イ", correct: true, at: T0 - 5000 } },
      unitsRead: {},
    };
    const storage = memStorage({ [LEARNING_V1_STORAGE_KEY]: JSON.stringify(oldTab) });

    const d = new V2Device(storage);
    expect((await d.load()).v2Since).toBe(T0 + 1000); // loadLocal at T0 (since T0), GET at T0 + 1000
    expect(d.record.v2Since).toBe(T0);
    expect(await d.settle()).toBe(1); // one PUT; further debounces see nothing new
    expect(d.calls.map((c) => c.method)).toEqual(["GET", "PUT"]);
    const stored = parseRecord(JSON.parse(fake.kv.get(LEARNING_REDIS_KEY) as string))!;
    expect(Object.keys(stored.attempts).sort()).toEqual(["2016h28h-q033", "2019r01a-q001"]);
    expect(stored.v2Since).toBe(T0);

    // later answers: one PUT each, still no loop
    d.answer("2021r03h-q077", "エ", false);
    expect(await d.settle()).toBe(1);
    expect(d.calls.map((c) => c.method)).toEqual(["GET", "PUT", "PUT"]);
    expect(storage.map.get(LEARNING_V1_STORAGE_KEY)).toBe(JSON.stringify(oldTab)); // v1 key untouched
  });

  it("v1-only server, nothing local: a hide-flush delta PUT stores the since the client got from its GET", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(LEGACY));
    const d = new V2Device(memStorage());
    const getSince = (await d.load()).v2Since!; // upgraded at the GET's request time
    expect(getSince).toBe(T0 + 1000);
    tick();
    d.answer("2021r03h-q077", "エ", false);
    tick(60_000); // the page is hidden much later: the server would upgrade with a later now
    const flush = await d.hideFlush();
    expect(flush.keepalive).toBe(true);
    expect(Object.keys(flush.sent.attempts)).toEqual(["2021r03h-q077"]); // a delta
    expect(flush.sent.v2Since).toBe(getSince); // ...that still carries since
    expect(d.calls.at(-1)).toMatchObject({ method: "PUT", keepalive: true });
    const stored = parseRecord(JSON.parse(fake.kv.get(LEARNING_REDIS_KEY) as string))!;
    expect(stored.v2Since).toBe(getSince);
    expect(Object.keys(stored.attempts).sort()).toEqual(["2016h28h-q033", "2021r03h-q077"]);
    // the response equals the record: nothing more to send
    expect(await d.settle()).toBe(0);
    expect(d.calls.map((c) => c.method)).toEqual(["GET", "PUT"]);
  });

  it("an old v1 tab writes itp:learn:v1 after load: the answer reaches learn:owner:v2 with exactly one PUT", async () => {
    const fake = redisHolder.current!;
    fake.kv.set(LEARNING_REDIS_V1_KEY, JSON.stringify(LEGACY));
    const storage = memStorage();
    const d = new V2Device(storage);
    await d.load();
    expect(await d.settle()).toBe(0);

    // the old tab (pre-Stage-7 bundle) answers and writes its v1 record
    tick();
    const oldTab: LearningRecordV1 = {
      v: 1,
      questions: { "2018h30a-q050": { choice: "ウ", correct: true, at: Date.now() } },
      unitsRead: {},
    };
    const v1Raw = JSON.stringify(oldTab);
    storage.map.set(LEARNING_V1_STORAGE_KEY, v1Raw);
    d.onStorage(LEARNING_V1_STORAGE_KEY, v1Raw);
    expect(d.record.attempts["2018h30a-q050"]).toEqual([
      { at: oldTab.questions["2018h30a-q050"]!.at, choice: "ウ", correct: true, src: "v1" },
    ]);

    expect(await d.settle()).toBe(1);
    expect(d.calls.map((c) => c.method)).toEqual(["GET", "PUT"]);
    const stored = parseRecord(JSON.parse(fake.kv.get(LEARNING_REDIS_KEY) as string))!;
    expect(Object.keys(stored.attempts).sort()).toEqual(["2016h28h-q033", "2018h30a-q050"]);
    expect(fake.writtenKeys).toEqual([LEARNING_REDIS_KEY]);
    // the same v1 value arriving again (another event / reload of the old tab) sends nothing
    d.onStorage(LEARNING_V1_STORAGE_KEY, v1Raw);
    expect(await d.settle()).toBe(0);
    expect(storage.map.get(LEARNING_V1_STORAGE_KEY)).toBe(v1Raw); // never rewritten
  });
});
