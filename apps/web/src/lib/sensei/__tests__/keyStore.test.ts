import { describe, expect, it } from "vitest";

import type { StorageLike } from "@/lib/storage";

import { clearSenseiKey, loadSenseiKey, saveSenseiKey, SENSEI_KEY_STORAGE } from "../keyStore";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

const KEY = "sk-ant-api03-test-abcd";

describe("keyStore", () => {
  it("uses the §0-6 storage key", () => {
    expect(SENSEI_KEY_STORAGE).toBe("itp:sensei:key:v1");
  });

  it("reads back a saved key, stored in the §0-6 envelope", () => {
    const s = memoryStorage();
    saveSenseiKey(s, KEY);
    expect(loadSenseiKey(s)).toBe(KEY);
    const stored = JSON.parse(s.data.get("itp:sensei:key:v1") ?? "null");
    expect(stored.provider).toBe("anthropic");
    expect(stored.apiKey).toBe(KEY);
    expect(Number.isNaN(Date.parse(stored.savedAt))).toBe(false);
  });

  it("trims surrounding whitespace before saving", () => {
    const s = memoryStorage();
    saveSenseiKey(s, `  ${KEY}\n`);
    expect(loadSenseiKey(s)).toBe(KEY);
  });

  it("returns null after clear", () => {
    const s = memoryStorage();
    saveSenseiKey(s, KEY);
    clearSenseiKey(s);
    expect(loadSenseiKey(s)).toBeNull();
    expect(s.data.has("itp:sensei:key:v1")).toBe(false);
  });

  it("returns null when nothing is stored", () => {
    expect(loadSenseiKey(memoryStorage())).toBeNull();
  });

  it("returns null without throwing on corrupt JSON", () => {
    const s = memoryStorage();
    s.data.set("itp:sensei:key:v1", "{not json");
    expect(() => loadSenseiKey(s)).not.toThrow();
    expect(loadSenseiKey(s)).toBeNull();
  });

  it("returns null for a parsable value of the wrong shape", () => {
    const s = memoryStorage();
    for (const bad of ['"sk-ant-x"', "null", "[]", '{"provider":"deepseek","apiKey":"x"}', '{"provider":"anthropic","apiKey":""}', '{"provider":"anthropic","apiKey":42}']) {
      s.data.set("itp:sensei:key:v1", bad);
      expect(loadSenseiKey(s)).toBeNull();
    }
  });

  it("does not save an empty or whitespace-only key", () => {
    const s = memoryStorage();
    saveSenseiKey(s, "");
    saveSenseiKey(s, "   \n\t");
    expect(s.data.size).toBe(0);
    expect(loadSenseiKey(s)).toBeNull();
  });

  it("a blank save leaves an existing key untouched", () => {
    const s = memoryStorage();
    saveSenseiKey(s, KEY);
    saveSenseiKey(s, "  ");
    expect(loadSenseiKey(s)).toBe(KEY);
  });

  it("never throws when the storage throws; load returns null", () => {
    expect(loadSenseiKey(throwingStorage)).toBeNull();
    expect(() => saveSenseiKey(throwingStorage, KEY)).not.toThrow();
    expect(() => clearSenseiKey(throwingStorage)).not.toThrow();
  });
});
