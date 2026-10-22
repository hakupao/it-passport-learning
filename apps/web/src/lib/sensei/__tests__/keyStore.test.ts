import { describe, expect, it } from "vitest";

import type { StorageLike } from "@/lib/storage";

import { clearSenseiKey, loadSenseiKey, maskSenseiKey, saveSenseiKey, SENSEI_KEY_STORAGE } from "../keyStore";

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
    expect(saveSenseiKey(s, KEY)).toBe(true);
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
    expect(saveSenseiKey(s, "")).toBe(false);
    expect(saveSenseiKey(s, "   \n\t")).toBe(false);
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
    expect(saveSenseiKey(throwingStorage, KEY)).toBe(false);
    expect(() => clearSenseiKey(throwingStorage)).not.toThrow();
  });

  it("a refused write (quota) returns false and leaves the previous key in place", () => {
    const s = memoryStorage();
    saveSenseiKey(s, KEY);
    s.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    expect(saveSenseiKey(s, "sk-ant-api03-other-9999")).toBe(false);
    expect(loadSenseiKey(s)).toBe(KEY);
  });

  it("masks a key as … + its last 4 characters; a key shorter than 8 as … only", () => {
    expect(maskSenseiKey(KEY)).toBe("…abcd");
    expect(maskSenseiKey("12345678")).toBe("…5678");
    expect(maskSenseiKey("1234567")).toBe("…");
    expect(maskSenseiKey("abc")).toBe("…");
  });
});
