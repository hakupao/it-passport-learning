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
