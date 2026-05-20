// Unit tests for the localStorage-backed chat history store (Step 9, D-085 §2.2).
//
// Coverage matrix:
//   - load: cold (empty storage) / round-trip / parse error / schema mismatch
//   - save: empty messages / single message / cap enforcement at MAX_PERSISTED_MESSAGES
//   - clear: explicit delete + idempotent re-clear
//   - resilience: storage throwing setItem / getItem / removeItem (quota / private mode)
//
// All run in vitest's node env via an in-memory StorageLike mock — no jsdom needed.

import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";

import {
  HISTORY_STORAGE_KEY,
  MAX_PERSISTED_MESSAGES,
  type StorageLike,
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
} from "../historyStore";

function makeMemoryStorage(): StorageLike & { _map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    _map: map,
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
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

describe("loadChatHistory", () => {
  it("returns [] when storage is empty (cold start)", () => {
    const s = makeMemoryStorage();
    expect(loadChatHistory(s)).toEqual([]);
  });

  it("round-trips messages written by saveChatHistory under the default key", () => {
    const s = makeMemoryStorage();
    const msgs = [makeUserMessage("u1", "DNS とは？")];
    saveChatHistory(s, msgs);
    const restored = loadChatHistory(s);
    expect(restored).toHaveLength(1);
    expect(restored[0]!.id).toBe("u1");
    expect(restored[0]!.role).toBe("user");
  });

  it("returns [] when the stored value is not valid JSON", () => {
    const s = makeMemoryStorage();
    s.setItem(HISTORY_STORAGE_KEY, "{this is not json");
    expect(loadChatHistory(s)).toEqual([]);
  });

  it("returns [] when the envelope schema version does not match", () => {
    const s = makeMemoryStorage();
    s.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify({
        version: 999,
        messages: [makeUserMessage("u1", "x")],
        updatedAt: "2026-05-20T00:00:00.000Z",
      }),
    );
    expect(loadChatHistory(s)).toEqual([]);
  });

  it("returns [] when messages is not an array", () => {
    const s = makeMemoryStorage();
    s.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify({ version: 1, messages: "not-array", updatedAt: "x" }),
    );
    expect(loadChatHistory(s)).toEqual([]);
  });

  it("returns [] when getItem throws (e.g. private-mode storage denial)", () => {
    const s: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError: storage denied");
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    expect(loadChatHistory(s)).toEqual([]);
  });

  it("honours a custom key when supplied", () => {
    const s = makeMemoryStorage();
    const msgs = [makeUserMessage("u1", "x")];
    saveChatHistory(s, msgs, "itp:chat:history:test");
    expect(loadChatHistory(s, "itp:chat:history:test")).toHaveLength(1);
    // Default key untouched.
    expect(loadChatHistory(s)).toEqual([]);
  });
});

describe("saveChatHistory", () => {
  it("writes a versioned envelope with messages + updatedAt ISO timestamp", () => {
    const s = makeMemoryStorage();
    const msgs = [makeUserMessage("u1", "hi")];
    saveChatHistory(s, msgs);
    const raw = s.getItem(HISTORY_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(1);
    expect(parsed.messages).toHaveLength(1);
    expect(parsed.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("persists empty messages as an empty envelope (NOT removeItem)", () => {
    const s = makeMemoryStorage();
    saveChatHistory(s, [makeUserMessage("u1", "x")]);
    saveChatHistory(s, []);
    const raw = s.getItem(HISTORY_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.messages).toEqual([]);
  });

  it(`caps stored messages at MAX_PERSISTED_MESSAGES (${MAX_PERSISTED_MESSAGES}) and keeps the most-recent tail`, () => {
    const s = makeMemoryStorage();
    const overflowing = Array.from({ length: MAX_PERSISTED_MESSAGES + 5 }, (_, i) =>
      makeUserMessage(`u${i}`, `msg-${i}`),
    );
    saveChatHistory(s, overflowing);
    const restored = loadChatHistory(s);
    expect(restored).toHaveLength(MAX_PERSISTED_MESSAGES);
    // Tail-keep: first restored is the earliest of the last MAX_PERSISTED_MESSAGES.
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
    // Must not throw.
    expect(() => saveChatHistory(s, [makeUserMessage("u1", "x")])).not.toThrow();
    expect(setItemSpy).toHaveBeenCalledOnce();
  });
});

describe("clearChatHistory", () => {
  it("removes the default-key entry", () => {
    const s = makeMemoryStorage();
    saveChatHistory(s, [makeUserMessage("u1", "x")]);
    clearChatHistory(s);
    expect(s.getItem(HISTORY_STORAGE_KEY)).toBeNull();
    expect(loadChatHistory(s)).toEqual([]);
  });

  it("is idempotent when called on an empty store", () => {
    const s = makeMemoryStorage();
    expect(() => clearChatHistory(s)).not.toThrow();
    expect(loadChatHistory(s)).toEqual([]);
  });

  it("swallows removeItem throws", () => {
    const s: StorageLike = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => {
        throw new Error("storage broken");
      },
    };
    expect(() => clearChatHistory(s)).not.toThrow();
  });
});
