import type { UIMessage } from "ai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StorageLike } from "@/lib/storage";

import { saveSenseiKey, SENSEI_KEY_STORAGE } from "../keyStore";
import {
  deleteThread,
  listThreads,
  loadThreadMessages,
  MAX_THREADS,
  openThread,
  saveThreadMessages,
  SENSEI_INDEX_STORAGE,
  threadStorageKey,
} from "../threadStore";

const KEY = "sk-ant-api03-thread-store-test-Q7w2";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

function quotaError(): Error {
  const e = new Error("The quota has been exceeded.");
  e.name = "QuotaExceededError";
  return e;
}

/** Throws QuotaExceeded on thread-message writes while `failures` > 0. */
function quotaStorage(failures: number) {
  const base = memoryStorage();
  const state = { failures };
  const s: StorageLike & { data: Map<string, string>; state: typeof state } = {
    data: base.data,
    state,
    getItem: base.getItem,
    removeItem: base.removeItem,
    setItem: (k, v) => {
      if (k.startsWith("itp:sensei:thread:") && state.failures > 0) {
        state.failures--;
        throw quotaError();
      }
      base.setItem(k, v);
    },
  };
  return s;
}

function msg(id: string, text: string): UIMessage {
  return { id, role: "user", parts: [{ type: "text", text }] };
}

let clock = Date.parse("2026-10-01T00:00:00.000Z");
function tick() {
  clock += 1000;
  vi.setSystemTime(clock);
}

beforeEach(() => {
  vi.useFakeTimers();
  clock = Date.parse("2026-10-01T00:00:00.000Z");
  vi.setSystemTime(clock);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("threadStore", () => {
  it("uses the §0-6 keys", () => {
    expect(SENSEI_INDEX_STORAGE).toBe("itp:sensei:index:v1");
    expect(MAX_THREADS).toBe(30);
    const s = memoryStorage();
    const t = openThread(s, { kind: "question", anchorId: "2024r06_q01", title: "問1" });
    expect(threadStorageKey(t.id)).toBe(`itp:sensei:thread:${t.id}:v1`);
    const index = JSON.parse(s.data.get("itp:sensei:index:v1") ?? "null");
    expect(index).toEqual({ v: 1, threads: [t] });
    expect(t).toEqual({
      id: t.id,
      kind: "question",
      anchorId: "2024r06_q01",
      title: "問1",
      updatedAt: "2026-10-01T00:00:00.000Z",
    });
  });

  it("reuses the thread for the same kind + anchorId", () => {
    const s = memoryStorage();
    const a = openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    tick();
    const b = openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    expect(b.id).toBe(a.id);
    const c = openThread(s, { kind: "term", anchorId: "q1", title: "q1" });
    expect(c.id).not.toBe(a.id);
    expect(listThreads(s)).toHaveLength(2);
  });

  it("saves and loads messages per thread, newest thread first", () => {
    const s = memoryStorage();
    const a = openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    tick();
    const b = openThread(s, { kind: "question", anchorId: "q2", title: "問2" });
    tick();
    expect(saveThreadMessages(s, a.id, [msg("m1", "なぜ？")])).toBe(true);
    expect(loadThreadMessages(s, a.id)).toEqual([msg("m1", "なぜ？")]);
    expect(loadThreadMessages(s, b.id)).toEqual([]);
    expect(listThreads(s).map((t) => t.id)).toEqual([a.id, b.id]);
    expect(listThreads(s)[0]!.updatedAt).toBe("2026-10-01T00:00:02.000Z");
  });

  it("the 31st thread evicts the oldest one together with its message key", () => {
    const s = memoryStorage();
    const ids: string[] = [];
    for (let i = 1; i <= MAX_THREADS; i++) {
      const t = openThread(s, { kind: "question", anchorId: `q${i}`, title: `問${i}` });
      saveThreadMessages(s, t.id, [msg(`m${i}`, `質問${i}`)]);
      ids.push(t.id);
      tick();
    }
    // touch the first thread so the oldest is now q2
    saveThreadMessages(s, ids[0]!, [msg("m1", "質問1"), msg("m1b", "追問")]);
    tick();
    openThread(s, { kind: "question", anchorId: "q31", title: "問31" });
    const list = listThreads(s);
    expect(list).toHaveLength(MAX_THREADS);
    expect(list.map((t) => t.anchorId)).not.toContain("q2");
    expect(list.map((t) => t.anchorId)).toContain("q1");
    expect(s.data.has(threadStorageKey(ids[1]!))).toBe(false);
    expect(s.data.has(threadStorageKey(ids[0]!))).toBe(true);
  });

  it("at the cap, the oldest review thread is evicted first, even when a question thread is older", () => {
    const s = memoryStorage();
    const opened: { id: string; anchorId: string }[] = [];
    for (let i = 1; i <= MAX_THREADS; i++) {
      // threads 5 and 9 are daily review threads; thread 1 (a question) is the oldest
      const kind = i === 5 || i === 9 ? "review" : "question";
      const anchorId = kind === "review" ? `technology-14-36:2026-10-0${i === 5 ? 1 : 2}` : `q${i}`;
      const t = openThread(s, { kind, anchorId, title: `T${i}` });
      saveThreadMessages(s, t.id, [msg(`m${i}`, `質問${i}`)]);
      opened.push({ id: t.id, anchorId });
      tick();
    }
    openThread(s, { kind: "question", anchorId: "q31", title: "問31" });
    let anchors = listThreads(s).map((t) => t.anchorId);
    expect(anchors).toHaveLength(MAX_THREADS);
    expect(anchors).not.toContain("technology-14-36:2026-10-01"); // the oldest review thread
    expect(anchors).toContain("technology-14-36:2026-10-02");
    expect(anchors).toContain("q1"); // older, but not a review thread
    expect(s.data.has(threadStorageKey(opened[4]!.id))).toBe(false);
    tick();

    // a new review thread evicts the other review thread, never itself
    openThread(s, { kind: "review", anchorId: "technology-14-36:2026-10-03", title: "R" });
    anchors = listThreads(s).map((t) => t.anchorId);
    expect(anchors).toHaveLength(MAX_THREADS);
    expect(anchors).not.toContain("technology-14-36:2026-10-02");
    expect(anchors).toContain("technology-14-36:2026-10-03");
    expect(anchors).toContain("q1");
    tick();

    // no review thread left other than the new one → the oldest thread of any kind
    openThread(s, { kind: "question", anchorId: "q32", title: "問32" });
    anchors = listThreads(s).map((t) => t.anchorId);
    expect(anchors).not.toContain("technology-14-36:2026-10-03"); // the only review thread goes first
    tick();
    openThread(s, { kind: "question", anchorId: "q33", title: "問33" });
    anchors = listThreads(s).map((t) => t.anchorId);
    expect(anchors).toHaveLength(MAX_THREADS);
    expect(anchors).not.toContain("q1"); // no review thread left → the oldest one
    expect(anchors).toContain("q2");
    expect(s.data.has(threadStorageKey(opened[0]!.id))).toBe(false);
  });

  it("at the cap, the oldest free thread goes first, then the oldest review thread, then the oldest of any kind", () => {
    const s = memoryStorage();
    for (let i = 1; i <= MAX_THREADS; i++) {
      // thread 1 (a question) is the oldest; 3 is a review thread; 6 and 8 are free threads
      const kind = i === 3 ? "review" : i === 6 || i === 8 ? "free" : "question";
      const t = openThread(s, { kind, anchorId: `a${i}`, title: `T${i}` });
      saveThreadMessages(s, t.id, [msg(`m${i}`, `質問${i}`)]);
      tick();
    }
    const anchors = () => listThreads(s).map((t) => t.anchorId);

    openThread(s, { kind: "question", anchorId: "a31", title: "T31" });
    expect(anchors()).toHaveLength(MAX_THREADS);
    expect(anchors()).not.toContain("a6"); // the oldest free thread, though review a3 and question a1 are older
    expect(anchors()).toEqual(expect.arrayContaining(["a1", "a3", "a8"]));
    expect(s.data.has(threadStorageKey("free.a6"))).toBe(false);
    tick();

    // a new free thread evicts the other free thread, never itself
    openThread(s, { kind: "free", anchorId: "a32", title: "T32" });
    expect(anchors()).not.toContain("a8");
    expect(anchors()).toEqual(expect.arrayContaining(["a1", "a3", "a32"]));
    tick();

    // a question thread: the one free thread left (a32) goes; then, with no free thread, the review thread
    openThread(s, { kind: "question", anchorId: "a33", title: "T33" });
    expect(anchors()).not.toContain("a32");
    tick();
    openThread(s, { kind: "question", anchorId: "a34", title: "T34" });
    expect(anchors()).not.toContain("a3");
    expect(anchors()).toContain("a1");
    tick();

    // neither free nor review left → the oldest thread of any kind
    openThread(s, { kind: "question", anchorId: "a35", title: "T35" });
    expect(anchors()).toHaveLength(MAX_THREADS);
    expect(anchors()).not.toContain("a1");
    expect(anchors()).toContain("a2");
  });

  it("on QuotaExceeded evicts the oldest other thread and retries once", () => {
    const s = quotaStorage(0);
    const old = openThread(s, { kind: "question", anchorId: "old", title: "old" });
    saveThreadMessages(s, old.id, [msg("o", "old")]);
    tick();
    const cur = openThread(s, { kind: "question", anchorId: "cur", title: "cur" });
    tick();
    s.state.failures = 1;
    expect(saveThreadMessages(s, cur.id, [msg("c", "cur")])).toBe(true);
    expect(loadThreadMessages(s, cur.id)).toEqual([msg("c", "cur")]);
    expect(listThreads(s).map((t) => t.id)).toEqual([cur.id]);
    expect(s.data.has(threadStorageKey(old.id))).toBe(false);
  });

  it("gives up with false (no throw) when the retry also fails", () => {
    const s = quotaStorage(0);
    const old = openThread(s, { kind: "question", anchorId: "old", title: "old" });
    tick();
    const cur = openThread(s, { kind: "question", anchorId: "cur", title: "cur" });
    s.state.failures = 99;
    expect(() => saveThreadMessages(s, cur.id, [msg("c", "cur")])).not.toThrow();
    s.state.failures = 99;
    expect(saveThreadMessages(s, cur.id, [msg("c", "cur")])).toBe(false);
    expect(listThreads(s).map((t) => t.id)).not.toContain(old.id);
  });

  it("returns false when there is nothing to evict", () => {
    const s = quotaStorage(99);
    const only = openThread(s, { kind: "free", anchorId: "f1", title: "f1" });
    expect(saveThreadMessages(s, only.id, [msg("c", "x")])).toBe(false);
  });

  it("never throws when storage itself throws", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw quotaError();
      },
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(listThreads(broken)).toEqual([]);
    const t = openThread(broken, { kind: "question", anchorId: "q1", title: "問1" });
    expect(t.anchorId).toBe("q1");
    expect(saveThreadMessages(broken, t.id, [msg("m", "x")])).toBe(false);
    expect(loadThreadMessages(broken, t.id)).toEqual([]);
    expect(() => deleteThread(broken, t.id)).not.toThrow();
  });

  it("treats a corrupt index as empty and leaves every other key alone", () => {
    const s = memoryStorage();
    s.data.set(SENSEI_INDEX_STORAGE, "{not json");
    s.data.set("itp:learning:v1", '{"questions":{}}');
    s.data.set("itp:sensei:thread:question.q9:v1", '{"version":1,"messages":[]}');
    saveSenseiKey(s, KEY);
    expect(listThreads(s)).toEqual([]);
    s.data.set(SENSEI_INDEX_STORAGE, JSON.stringify({ v: 1, threads: [{ id: 3 }, "x", null] }));
    expect(listThreads(s)).toEqual([]);
    s.data.set(SENSEI_INDEX_STORAGE, JSON.stringify({ v: 2, threads: [] }));
    expect(listThreads(s)).toEqual([]);
    openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    expect(listThreads(s)).toHaveLength(1);
    expect(s.data.get("itp:learning:v1")).toBe('{"questions":{}}');
    expect(s.data.has("itp:sensei:thread:question.q9:v1")).toBe(true);
    expect(s.data.has(SENSEI_KEY_STORAGE)).toBe(true);
  });

  it("does not write messages for a thread that is not in the index (no orphan keys)", () => {
    const s = memoryStorage();
    expect(saveThreadMessages(s, "question.never-opened", [msg("m", "x")])).toBe(false);
    expect(s.data.has(threadStorageKey("question.never-opened"))).toBe(false);
    // index unwritable at open time → the save is skipped too
    const failingIndex = memoryStorage();
    const set = failingIndex.setItem;
    failingIndex.setItem = (k, v) => {
      if (k === SENSEI_INDEX_STORAGE) throw quotaError();
      set(k, v);
    };
    const t = openThread(failingIndex, { kind: "question", anchorId: "q1", title: "問1" });
    expect(saveThreadMessages(failingIndex, t.id, [msg("m", "x")])).toBe(false);
    expect([...failingIndex.data.keys()].some((k) => k.startsWith("itp:sensei:thread:"))).toBe(false);
  });

  it("openThread: an index write refused once evicts the oldest thread and retries (the new thread is kept)", () => {
    const s = memoryStorage();
    const oldest = openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    saveThreadMessages(s, oldest.id, [msg("m1", "x")]);
    tick();
    const newer = openThread(s, { kind: "question", anchorId: "q2", title: "問2" });
    saveThreadMessages(s, newer.id, [msg("m2", "y")]);
    tick();

    let refusals = 1;
    const set = s.setItem;
    s.setItem = (k, v) => {
      if (k === SENSEI_INDEX_STORAGE && refusals > 0) {
        refusals--;
        throw quotaError();
      }
      set(k, v);
    };
    const fresh = openThread(s, { kind: "question", anchorId: "q3", title: "問3" });

    expect(listThreads(s).map((t) => t.id)).toEqual([fresh.id, newer.id]);
    expect(s.data.has(threadStorageKey(oldest.id))).toBe(false);
    expect(loadThreadMessages(s, newer.id)).toEqual([msg("m2", "y")]);
    // the new thread is indexed, so its first save goes through
    expect(saveThreadMessages(s, fresh.id, [msg("m3", "z")])).toBe(true);
  });

  it("openThread: index refused twice → returns the meta without throwing; the new thread stays unindexed and the evicted thread's messages are gone while its (stale) index entry remains", () => {
    const s = memoryStorage();
    const oldest = openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    expect(saveThreadMessages(s, oldest.id, [msg("m1", "x")])).toBe(true);
    tick();
    const set = s.setItem;
    s.setItem = (k, v) => {
      if (k === SENSEI_INDEX_STORAGE) throw quotaError();
      set(k, v);
    };
    let fresh: ReturnType<typeof openThread> | undefined;
    expect(() => {
      fresh = openThread(s, { kind: "question", anchorId: "q2", title: "問2" });
    }).not.toThrow();
    expect(fresh?.anchorId).toBe("q2");
    // the retry evicted the oldest thread's message key before its index write was refused
    expect(s.data.has(threadStorageKey(oldest.id))).toBe(false);
    expect(loadThreadMessages(s, oldest.id)).toEqual([]);
    // the index on disk is unchanged: the old entry is still listed, the new one is not
    expect(listThreads(s).map((t) => t.id)).toEqual([oldest.id]);
    expect(s.data.has(threadStorageKey(fresh!.id))).toBe(false);
  });

  it("keeps anchorIds with a choice suffix as distinct threads (A4: <question_id>:<choice|reveal>)", () => {
    const s = memoryStorage();
    const a = openThread(s, { kind: "question", anchorId: "2024r06_q01:イ", title: "問1" });
    const b = openThread(s, { kind: "question", anchorId: "2024r06_q01:reveal", title: "問1" });
    expect(a.id).not.toBe(b.id);
    expect(saveThreadMessages(s, a.id, [msg("m", "x")])).toBe(true);
    expect(loadThreadMessages(s, b.id)).toEqual([]);
    expect(listThreads(s).map((t) => t.anchorId).sort()).toEqual(["2024r06_q01:reveal", "2024r06_q01:イ"]);
  });

  it("deleteThread removes the index entry and the messages", () => {
    const s = memoryStorage();
    const t = openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    saveThreadMessages(s, t.id, [msg("m", "x")]);
    deleteThread(s, t.id);
    expect(listThreads(s)).toEqual([]);
    expect(s.data.has(threadStorageKey(t.id))).toBe(false);
  });

  it("never writes the API key into the index or the thread messages", () => {
    const s = memoryStorage();
    saveSenseiKey(s, KEY);
    const t = openThread(s, { kind: "question", anchorId: "q1", title: "問1" });
    saveThreadMessages(s, t.id, [msg("m1", "なぜ？"), { id: "a1", role: "assistant", parts: [{ type: "text", text: "結論" }] }]);
    for (const [k, v] of s.data) {
      if (k === SENSEI_KEY_STORAGE) continue;
      expect(v).not.toContain(KEY);
    }
    expect(s.data.get(threadStorageKey(t.id))).not.toContain("sk-ant-");
  });
});
