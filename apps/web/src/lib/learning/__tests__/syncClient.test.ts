// D-180 §0-7 — client side of the owner sync. Network failure, a non-2xx status
// or a body that fails parseRecord → null + console.warn only (never throws,
// never logs the record). Uses a fake fetch; nothing leaves the process.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { deltaSince, emptyRecord, mergeRecords, type LearningRecord } from "../recordV1";
import { hideFlushPlan, KEEPALIVE_MAX_BYTES, onPageHide, pullRemote, pushRemote } from "../syncClient";

const REC: LearningRecord = {
  v: 1,
  questions: { "2009h21a-q054": { choice: "secret-choice", correct: false, at: 5 } },
  unitsRead: {},
};

const ok = (body: unknown): Response =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status: 200 });

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe("pullRemote", () => {
  it("GETs /api/learning without caching and returns the parsed record", async () => {
    const f = vi.fn(async () => ok(REC));
    expect(await pullRemote(f)).toEqual(REC);
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/learning");
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
  it("PUTs the record as JSON and returns the merged record from the response", async () => {
    const merged: LearningRecord = { ...REC, unitsRead: { u: 1 } };
    const f = vi.fn(async () => ok(merged));
    expect(await pushRemote(f, REC)).toEqual(merged);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/learning");
    expect(init.method).toBe("PUT");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual(REC);
    expect(init.keepalive).toBe(false);
  });

  it("keepalive: true is passed through to fetch (page-hide flush)", async () => {
    const f = vi.fn(async () => ok(REC));
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
    expect(warn).toHaveBeenCalledTimes(3);
    expect(JSON.stringify(warn.mock.calls)).not.toContain("secret-choice");
  });
});

/** `n` answered questions with ids long enough that the record grows past the keepalive cap. */
function bigRecord(n: number, at = 1_700_000_000_000): LearningRecord {
  const questions: LearningRecord["questions"] = {};
  for (let i = 0; i < n; i++) questions[`2009h21a-q${String(i).padStart(4, "0")}`] = { choice: "ア", correct: true, at: at + i };
  return { v: 1, questions, unitsRead: {} };
}

const bytes = (r: LearningRecord) => new TextEncoder().encode(JSON.stringify(r)).byteLength;

describe("hideFlushPlan (what the page-hide flush sends)", () => {
  it("small delta → only the delta since lastSynced, with keepalive", () => {
    const synced = bigRecord(2900); // ~200 KB, like a fully answered corpus
    expect(bytes(synced)).toBeGreaterThan(KEEPALIVE_MAX_BYTES);
    const current: LearningRecord = {
      ...synced,
      questions: { ...synced.questions, "2024r06-q001": { choice: "イ", correct: false, at: 9 } },
      unitsRead: { "management-08-25-u01": 5 },
    };
    const plan = hideFlushPlan(current, synced);
    expect(plan.keepalive).toBe(true);
    expect(plan.record).toEqual({
      v: 1,
      questions: { "2024r06-q001": { choice: "イ", correct: false, at: 9 } },
      unitsRead: { "management-08-25-u01": 5 },
    });
    // the server merge of the delta is the same as of the full record
    expect(mergeRecords(synced, plan.record)).toEqual(mergeRecords(synced, current));
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
