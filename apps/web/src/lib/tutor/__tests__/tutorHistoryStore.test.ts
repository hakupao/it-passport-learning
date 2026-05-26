// Unit tests for the localStorage-backed tutor history store (Phase 4 Module C, D-106 §2.2).

import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";

import type { StorageLike } from "@/lib/data/progressStore";
import {
  TUTOR_HISTORY_STORAGE_KEY,
  MAX_PERSISTED_MESSAGES,
  clearTutorHistory,
  loadTutorHistory,
  saveTutorHistory,
} from "../tutorHistoryStore";

function mockStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => {
      store.set(k, v);
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
}

function makeUserMessage(id: string, text: string): UIMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text }],
  } as UIMessage;
}

describe("loadTutorHistory", () => {
  it("returns [] when storage is empty (cold start)", () => {
    const s = mockStorage();
    expect(loadTutorHistory(s)).toEqual([]);
  });

  it("round-trips messages written by saveTutorHistory under the default key", () => {
    const s = mockStorage();
    const msgs = [makeUserMessage("u1", "DNS とは？")];
    saveTutorHistory(s, msgs);
    const restored = loadTutorHistory(s);
    expect(restored).toHaveLength(1);
    expect(restored[0]!.id).toBe("u1");
    expect(restored[0]!.role).toBe("user");
  });

  it("returns [] when the stored value is not valid JSON", () => {
    const s = mockStorage();
    s.setItem(TUTOR_HISTORY_STORAGE_KEY, "{this is not json");
    expect(loadTutorHistory(s)).toEqual([]);
  });

  it("returns [] when the envelope schema version does not match", () => {
    const s = mockStorage();
    s.setItem(
      TUTOR_HISTORY_STORAGE_KEY,
      JSON.stringify({
        version: 999,
        messages: [makeUserMessage("u1", "x")],
        updatedAt: "2026-05-23T00:00:00.000Z",
      }),
    );
    expect(loadTutorHistory(s)).toEqual([]);
  });

  it("returns [] when messages is not an array (shape corruption)", () => {
    const s = mockStorage();
    s.setItem(
      TUTOR_HISTORY_STORAGE_KEY,
      JSON.stringify({ version: 1, messages: "not-array", updatedAt: "x" }),
    );
    expect(loadTutorHistory(s)).toEqual([]);
  });

  it("returns [] when getItem throws (e.g. private-mode storage denial)", () => {
    const s: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError: storage denied");
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    expect(loadTutorHistory(s)).toEqual([]);
  });

  it("honours a custom key when supplied", () => {
    const s = mockStorage();
    const msgs = [makeUserMessage("u1", "x")];
    saveTutorHistory(s, msgs, "itp:tutor:session:test");
    expect(loadTutorHistory(s, "itp:tutor:session:test")).toHaveLength(1);
    expect(loadTutorHistory(s)).toEqual([]);
  });
});

describe("saveTutorHistory", () => {
  it("writes a versioned envelope with version:1 + updatedAt + messages", () => {
    const s = mockStorage();
    const msgs = [makeUserMessage("u1", "hi")];
    saveTutorHistory(s, msgs);
    const raw = s.getItem(TUTOR_HISTORY_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(1);
    expect(parsed.messages).toHaveLength(1);
    expect(parsed.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("persists empty messages as an empty envelope (NOT removeItem)", () => {
    const s = mockStorage();
    saveTutorHistory(s, [makeUserMessage("u1", "x")]);
    saveTutorHistory(s, []);
    const raw = s.getItem(TUTOR_HISTORY_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.messages).toEqual([]);
  });

  it(`caps stored messages at MAX_PERSISTED_MESSAGES (${MAX_PERSISTED_MESSAGES}) and keeps the most-recent tail`, () => {
    const s = mockStorage();
    const overflowing = Array.from({ length: MAX_PERSISTED_MESSAGES + 5 }, (_, i) =>
      makeUserMessage(`u${i}`, `msg-${i}`),
    );
    saveTutorHistory(s, overflowing);
    const restored = loadTutorHistory(s);
    expect(restored).toHaveLength(MAX_PERSISTED_MESSAGES);
    expect(restored[0]!.id).toBe("u5");
    expect(restored[MAX_PERSISTED_MESSAGES - 1]!.id).toBe(
      `u${MAX_PERSISTED_MESSAGES + 4}`,
    );
  });

  it("swallows setItem throws (quota exceeded / private mode)", () => {
    const setItemSpy = vi.fn(() => {
      throw new Error("QuotaExceededError");
    });
    const s: StorageLike = {
      getItem: () => null,
      setItem: setItemSpy,
      removeItem: () => undefined,
    };
    expect(() => saveTutorHistory(s, [makeUserMessage("u1", "x")])).not.toThrow();
    expect(setItemSpy).toHaveBeenCalledOnce();
  });
});

describe("clearTutorHistory", () => {
  it("removes the default-key entry", () => {
    const s = mockStorage();
    saveTutorHistory(s, [makeUserMessage("u1", "x")]);
    clearTutorHistory(s);
    expect(s.getItem(TUTOR_HISTORY_STORAGE_KEY)).toBeNull();
    expect(loadTutorHistory(s)).toEqual([]);
  });

  it("is idempotent when called on an empty store (no throw on missing)", () => {
    const s = mockStorage();
    expect(() => clearTutorHistory(s)).not.toThrow();
    expect(loadTutorHistory(s)).toEqual([]);
  });

  it("swallows removeItem throws", () => {
    const s: StorageLike = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => {
        throw new Error("storage broken");
      },
    };
    expect(() => clearTutorHistory(s)).not.toThrow();
  });
});
