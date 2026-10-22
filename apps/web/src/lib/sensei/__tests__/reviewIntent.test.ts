import { describe, expect, it } from "vitest";

import type { StorageLike } from "@/lib/storage";

import { REVIEW_INTENT_MAX_AGE_MS, REVIEW_INTENT_STORAGE, takeReviewIntent, writeReviewIntent } from "../reviewIntent";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const T = "technology-14-36";
const NOW = 1_800_000_000_000;

describe("review intent (D-181 Phase B m1)", () => {
  it("uses sessionStorage key itp:sensei:review-intent = { topicId, at } and a 30 s window", () => {
    expect(REVIEW_INTENT_STORAGE).toBe("itp:sensei:review-intent");
    expect(REVIEW_INTENT_MAX_AGE_MS).toBe(30_000);
    const s = memoryStorage();
    writeReviewIntent(s, T, NOW);
    expect(JSON.parse(s.data.get(REVIEW_INTENT_STORAGE)!)).toEqual({ topicId: T, at: NOW });
  });

  it("a fresh intent for this topic is taken once, then consumed", () => {
    const s = memoryStorage();
    writeReviewIntent(s, T, NOW);
    expect(takeReviewIntent(s, T, NOW + REVIEW_INTENT_MAX_AGE_MS)).toBe(true);
    expect(s.data.has(REVIEW_INTENT_STORAGE)).toBe(false);
    expect(takeReviewIntent(s, T, NOW + 1)).toBe(false);
  });

  it("no intent, a stale one, a future one, another topic or a corrupt value → false, and the key is removed", () => {
    const cases: [string, string | null][] = [
      ["none", null],
      ["stale", JSON.stringify({ topicId: T, at: NOW - REVIEW_INTENT_MAX_AGE_MS - 1 })],
      ["future", JSON.stringify({ topicId: T, at: NOW + 5_000 })],
      ["other topic", JSON.stringify({ topicId: "technology-21-54", at: NOW })],
      ["not json", "{"],
      ["wrong shape", JSON.stringify({ topicId: T, at: "now" })],
      ["array", "[]"],
    ];
    for (const [name, raw] of cases) {
      const s = memoryStorage();
      if (raw !== null) s.data.set(REVIEW_INTENT_STORAGE, raw);
      expect(takeReviewIntent(s, T, NOW), name).toBe(false);
      expect(s.data.has(REVIEW_INTENT_STORAGE), name).toBe(false);
    }
  });

  it("never throws when storage throws", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(() => writeReviewIntent(broken, T, NOW)).not.toThrow();
    expect(takeReviewIntent(broken, T, NOW)).toBe(false);
    expect(takeReviewIntent(null, T, NOW)).toBe(false);
    expect(() => writeReviewIntent(null, T, NOW)).not.toThrow();
  });
});
