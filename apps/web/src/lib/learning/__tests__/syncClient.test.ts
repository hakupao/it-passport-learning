// D-180 §0-7 / D-190 — client side of the owner sync, on record v2: GET
// /api/learning?v=2 (the route's v2 wire answer), PUT an encodeRecord body.
// Network failure, a non-2xx status or a body that fails parseRecord → null +
// console.warn only (never throws, never logs the record). Uses a fake fetch;
// nothing leaves the process.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  deltaSince,
  emptyRecord,
  encodeRecord,
  mergeRecords,
  recordAttempt,
  type LearningRecord,
} from "../record";
import { hideFlushPlan, KEEPALIVE_MAX_BYTES, onPageHide, pullRemote, pushRemote } from "../syncClient";

/** The question id doubles as the "never log the record" canary. */
const SECRET_QID = "secret-qid-2009h21a-q054";
const REC: LearningRecord = {
  ...recordAttempt(emptyRecord(), SECRET_QID, "ウ", false, 5),
  unitsRead: { "secret-unit": 7 },
  settings: { examDate: { value: "2026-12-01", at: 3 } },
  v2Since: 1,
};

const ok = (body: unknown): Response =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status: 200 });

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe("pullRemote", () => {
  it("pullRemote requests ?v=2 and parses v2 (no caching)", async () => {
    const f = vi.fn(async () => ok(encodeRecord(REC)));
    expect(await pullRemote(f)).toEqual(REC);
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/learning?v=2");
    expect(init.method ?? "GET").toBe("GET");
    expect(init.cache).toBe("no-store");
    expect(warn).not.toHaveBeenCalled();
  });

  it("rejection / non-2xx / bad body → null + one console.warn each", async () => {
    const cases: (() => Promise<Response>)[] = [
      async () => {
        throw new TypeError("Failed to fetch");
      },
      async () => new Response("{}", { status: 503 }),
      async () => new Response("{}", { status: 403 }),
      async () => ok("{not json"),
      async () => ok({ v: 2 }),
      // a v1 answer (what GET without ?v returns) is not accepted as v2
      async () => ok({ v: 1, questions: {}, unitsRead: {} }),
    ];
    for (const c of cases) expect(await pullRemote(c)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(cases.length);
    expect(JSON.stringify(warn.mock.calls)).toContain("[learning-sync]");
  });

  it("an aborted request returns null silently", async () => {
    const ac = new AbortController();
    ac.abort();
    const f = async () => {
      throw new DOMException("aborted", "AbortError");
    };
    expect(await pullRemote(f, ac.signal)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("pushRemote", () => {
  it("pushRemote body is v2 wire; returns the merged record parsed from the v2 response", async () => {
    const merged: LearningRecord = mergeRecords(REC, { ...emptyRecord(), unitsRead: { u: 1 } });
    const f = vi.fn(async () => ok(encodeRecord(merged)));
    expect(await pushRemote(f, REC)).toEqual(merged);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/learning");
    expect(init.method).toBe("PUT");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual(encodeRecord(REC));
    expect(JSON.parse(init.body as string)).toEqual({
      v: 2,
      a: { [SECRET_QID]: [[5, 2, 0, "p"]] },
      u: { "secret-unit": 7 },
      s: { examDate: ["2026-12-01", 3] },
      since: 1,
    });
    expect(init.keepalive).toBe(false);
  });

  it("keepalive: true is passed through to fetch (page-hide flush)", async () => {
    const f = vi.fn(async () => ok(encodeRecord(REC)));
    expect(await pushRemote(f, REC, { keepalive: true })).toEqual(REC);
    const [, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect(init.keepalive).toBe(true);
  });

  it("failure → null + console.warn that never contains the record", async () => {
    expect(await pushRemote(async () => new Response("", { status: 502 }), REC)).toBeNull();
    expect(
      await pushRemote(async () => {
        throw new TypeError("Failed to fetch");
      }, REC),
    ).toBeNull();
    expect(await pushRemote(async () => ok([]), emptyRecord())).toBeNull();
    // a v1 response (an old route) is rejected too
    expect(await pushRemote(async () => ok({ v: 1, questions: {}, unitsRead: {} }), REC)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(4);
    expect(JSON.stringify(warn.mock.calls)).not.toContain("secret");
  });
});

/** `n` answered questions, `k` attempts each — enough to grow the record past the keepalive cap. */
function bigRecord(n: number, at = 1_700_000_000_000, k = 1): LearningRecord {
  const attempts: LearningRecord["attempts"] = {};
  for (let i = 0; i < n; i++) {
    attempts[`2009h21a-q${String(i).padStart(4, "0")}`] = Array.from({ length: k }, (_, j) => ({
      at: at + i * 100 + j,
      choice: "ア" as const,
      correct: j % 2 === 0,
      src: "practice" as const,
    }));
  }
  return mergeRecords({ ...emptyRecord(), attempts }, emptyRecord());
}

/** Bytes on the wire (what pushRemote sends). */
const bytes = (r: LearningRecord) => new TextEncoder().encode(JSON.stringify(encodeRecord(r))).byteLength;

describe("hideFlushPlan (what the page-hide flush sends)", () => {
  it("small delta → only the delta since lastSynced, with keepalive", () => {
    const synced = bigRecord(2900); // a fully answered corpus
    expect(bytes(synced)).toBeGreaterThan(KEEPALIVE_MAX_BYTES);
    const current: LearningRecord = {
      ...recordAttempt(synced, "2024r06-q001", "イ", false, 9),
      unitsRead: { "management-08-25-u01": 5 },
    };
    const plan = hideFlushPlan(current, synced);
    expect(plan.keepalive).toBe(true);
    expect(plan.record).toEqual({
      v: 2,
      attempts: { "2024r06-q001": [{ at: 9, choice: "イ", correct: false, src: "practice" }] },
      unitsRead: { "management-08-25-u01": 5 },
      settings: {},
    });
    // the server merge of the delta is the same as of the full record
    expect(mergeRecords(synced, plan.record)).toEqual(mergeRecords(synced, current));
  });

  it("hideFlushPlan delta of a 50-attempt change stays under KEEPALIVE_MAX_BYTES", () => {
    // every question of a full-history record (K = 10 attempts each) is already synced;
    // a session then answers 50 of them again — each changed list is sent whole
    const synced = bigRecord(2900, 1_700_000_000_000, 10);
    const current: LearningRecord = { ...synced, attempts: { ...synced.attempts } };
    for (let i = 0; i < 50; i++) {
      const qid = `2009h21a-q${String(i).padStart(4, "0")}`;
      current.attempts[qid] = recordAttempt(synced, qid, "エ", false, 1_800_000_000_000 + i).attempts[qid]!;
    }
    const plan = hideFlushPlan(current, synced);
    expect(plan.keepalive).toBe(true);
    expect(Object.keys(plan.record.attempts)).toHaveLength(50);
    expect(Object.values(plan.record.attempts).every((l) => l.length === 10)).toBe(true);
    expect(bytes(plan.record)).toBeLessThanOrEqual(KEEPALIVE_MAX_BYTES);
    expect(mergeRecords(synced, plan.record)).toEqual(mergeRecords(synced, current));
  });

  it("the size check is on the wire form (encodeRecord), not the in-memory shape", () => {
    // a record whose wire form fits while its in-memory JSON does not → keepalive
    const mid = bigRecord(900);
    expect(new TextEncoder().encode(JSON.stringify(mid)).byteLength).toBeGreaterThan(KEEPALIVE_MAX_BYTES);
    expect(bytes(mid)).toBeLessThanOrEqual(KEEPALIVE_MAX_BYTES);
    expect(hideFlushPlan(mid, null).keepalive).toBe(true);
  });

  it("nothing synced yet → the whole record is the delta (keepalive while it fits)", () => {
    const plan = hideFlushPlan(REC, null);
    expect(plan).toEqual({ record: deltaSince(REC, null), keepalive: true });
  });

  it("delta over KEEPALIVE_MAX_BYTES → the full record without keepalive", () => {
    const current = bigRecord(2900);
    expect(bytes(deltaSince(current, null))).toBeGreaterThan(KEEPALIVE_MAX_BYTES);
    expect(hideFlushPlan(current, null)).toEqual({ record: current, keepalive: false });
    const synced = bigRecord(100);
    const plan = hideFlushPlan(current, synced);
    expect(plan.keepalive).toBe(false);
    expect(plan.record).toBe(current);
  });

  it("KEEPALIVE_MAX_BYTES stays under the 64 KiB keepalive budget", () => {
    expect(KEEPALIVE_MAX_BYTES).toBeLessThan(64 * 1024);
  });
});

describe("onPageHide (page-hide flush wiring)", () => {
  function fakeDoc(): EventTarget & { visibilityState: string } {
    return Object.assign(new EventTarget(), { visibilityState: "visible" });
  }

  it("fires on visibilitychange → hidden and on pagehide, not on → visible", () => {
    const win = new EventTarget();
    const doc = fakeDoc();
    const flush = vi.fn();
    onPageHide(win, doc, flush);

    doc.dispatchEvent(new Event("visibilitychange")); // still visible
    expect(flush).not.toHaveBeenCalled();
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(flush).toHaveBeenCalledTimes(1);
    win.dispatchEvent(new Event("pagehide"));
    expect(flush).toHaveBeenCalledTimes(2);
    // pagehide on the document / visibilitychange on the window are not listened to
    doc.dispatchEvent(new Event("pagehide"));
    win.dispatchEvent(new Event("visibilitychange"));
    expect(flush).toHaveBeenCalledTimes(2);
  });

  it("the returned cleanup removes both listeners", () => {
    const win = new EventTarget();
    const doc = fakeDoc();
    const flush = vi.fn();
    const off = onPageHide(win, doc, flush);
    off();
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    win.dispatchEvent(new Event("pagehide"));
    expect(flush).not.toHaveBeenCalled();
  });
});
