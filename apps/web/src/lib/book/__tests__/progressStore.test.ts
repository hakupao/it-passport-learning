// Unit tests for the localStorage-backed Phase 3 progress store (Step 3,
// D-101 §2.4 + LD-3). Mirrors the matrix used by chat/historyStore.test.ts.

import { describe, expect, it } from "vitest";

import {
  PROGRESS_SCHEMA_VERSION,
  PROGRESS_STORAGE_KEY,
  type BookProgress,
  type StorageLike,
  clearProgress,
  countCompletedChapters,
  emptyProgress,
  isChapterCompleted,
  isChapterInProgress,
  loadProgress,
  markChapterCompleted,
  recordChapterScroll,
  recordQuizAnswer,
  saveProgress,
} from "../progressStore";

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

describe("emptyProgress", () => {
  it("returns a canonical empty shape with schemaVersion + epoch updatedAt", () => {
    const p = emptyProgress();
    expect(p.schemaVersion).toBe(PROGRESS_SCHEMA_VERSION);
    expect(p.chapters).toEqual({});
    expect(p.quiz).toEqual({});
    expect(p.updatedAt).toBe(new Date(0).toISOString());
  });
});

describe("loadProgress", () => {
  it("returns empty state when storage is cold", () => {
    const s = makeMemoryStorage();
    expect(loadProgress(s)).toEqual(emptyProgress());
  });

  it("round-trips a persisted envelope under the default key", () => {
    const s = makeMemoryStorage();
    let p = emptyProgress();
    p = markChapterCompleted(p, "07", "2026-05-22T10:00:00.000Z");
    saveProgress(s, p);
    const restored = loadProgress(s);
    expect(restored.chapters["07"]?.completedAt).toBe(
      "2026-05-22T10:00:00.000Z",
    );
  });

  it("returns empty state when stored JSON is malformed", () => {
    const s = makeMemoryStorage();
    s.setItem(PROGRESS_STORAGE_KEY, "{not json");
    expect(loadProgress(s)).toEqual(emptyProgress());
  });

  it("discards data when schemaVersion does not match", () => {
    const s = makeMemoryStorage();
    s.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 999,
        chapters: { "07": { completedAt: "x" } },
        quiz: {},
        updatedAt: "x",
      }),
    );
    expect(loadProgress(s)).toEqual(emptyProgress());
  });

  it("discards data when chapters field is not an object", () => {
    const s = makeMemoryStorage();
    s.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: PROGRESS_SCHEMA_VERSION,
        chapters: "not-object",
        quiz: {},
        updatedAt: "x",
      }),
    );
    expect(loadProgress(s)).toEqual(emptyProgress());
  });

  it("discards data when chapters is an array (looks like object to JSON.parse)", () => {
    const s = makeMemoryStorage();
    s.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: PROGRESS_SCHEMA_VERSION,
        chapters: [],
        quiz: {},
        updatedAt: "x",
      }),
    );
    expect(loadProgress(s)).toEqual(emptyProgress());
  });

  it("returns empty state when getItem throws (storage denied)", () => {
    const s: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    expect(loadProgress(s)).toEqual(emptyProgress());
  });

  it("honours a custom storage key", () => {
    const s = makeMemoryStorage();
    let p = emptyProgress();
    p = markChapterCompleted(p, "00", "2026-05-22T00:00:00.000Z");
    saveProgress(s, p, "itp:book:progress:test");
    expect(
      loadProgress(s, "itp:book:progress:test").chapters["00"]?.completedAt,
    ).toBeDefined();
    expect(loadProgress(s).chapters["00"]).toBeUndefined();
  });
});

describe("saveProgress", () => {
  it("writes a versioned envelope with refreshed updatedAt", () => {
    const s = makeMemoryStorage();
    const p = emptyProgress();
    saveProgress(s, p);
    const raw = s.getItem(PROGRESS_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(PROGRESS_SCHEMA_VERSION);
    expect(parsed.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    // The empty-state epoch value should have been rewritten on save.
    expect(parsed.updatedAt).not.toBe(new Date(0).toISOString());
  });

  it("forces schemaVersion to the current constant even if caller tampered", () => {
    const s = makeMemoryStorage();
    const evil = {
      ...emptyProgress(),
      schemaVersion: 7,
    } as unknown as BookProgress;
    saveProgress(s, evil);
    const parsed = JSON.parse(s.getItem(PROGRESS_STORAGE_KEY)!);
    expect(parsed.schemaVersion).toBe(PROGRESS_SCHEMA_VERSION);
  });

  it("swallows setItem throws (quota exceeded / private mode)", () => {
    const s: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => undefined,
    };
    expect(() => saveProgress(s, emptyProgress())).not.toThrow();
  });
});

describe("clearProgress", () => {
  it("removes the default-key entry", () => {
    const s = makeMemoryStorage();
    saveProgress(s, emptyProgress());
    expect(s.getItem(PROGRESS_STORAGE_KEY)).not.toBeNull();
    clearProgress(s);
    expect(s.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("is idempotent on an empty store", () => {
    const s = makeMemoryStorage();
    expect(() => clearProgress(s)).not.toThrow();
  });

  it("swallows removeItem throws", () => {
    const s: StorageLike = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(() => clearProgress(s)).not.toThrow();
  });
});

describe("markChapterCompleted", () => {
  it("stamps completedAt for a previously-untouched chapter", () => {
    const out = markChapterCompleted(
      emptyProgress(),
      "03",
      "2026-05-22T11:00:00.000Z",
    );
    expect(out.chapters["03"]?.completedAt).toBe(
      "2026-05-22T11:00:00.000Z",
    );
  });

  it("is idempotent — does not overwrite an existing completedAt", () => {
    let p = markChapterCompleted(
      emptyProgress(),
      "03",
      "2026-05-22T11:00:00.000Z",
    );
    const before = p;
    p = markChapterCompleted(p, "03", "2026-05-22T12:00:00.000Z");
    expect(p).toBe(before); // same reference — no rewrite
    expect(p.chapters["03"]?.completedAt).toBe("2026-05-22T11:00:00.000Z");
  });

  it("preserves an existing scrollY value when stamping completion", () => {
    let p = recordChapterScroll(emptyProgress(), "05", 1234);
    p = markChapterCompleted(p, "05", "2026-05-22T13:00:00.000Z");
    expect(p.chapters["05"]?.scrollY).toBe(1234);
    expect(p.chapters["05"]?.completedAt).toBe(
      "2026-05-22T13:00:00.000Z",
    );
  });

  it("does not collide across distinct chapters", () => {
    let p = markChapterCompleted(
      emptyProgress(),
      "01",
      "2026-05-22T01:00:00.000Z",
    );
    p = markChapterCompleted(p, "02", "2026-05-22T02:00:00.000Z");
    expect(p.chapters["01"]?.completedAt).toBe(
      "2026-05-22T01:00:00.000Z",
    );
    expect(p.chapters["02"]?.completedAt).toBe(
      "2026-05-22T02:00:00.000Z",
    );
  });
});

describe("recordChapterScroll", () => {
  it("stores scrollY for a new chapter entry", () => {
    const out = recordChapterScroll(emptyProgress(), "10", 980);
    expect(out.chapters["10"]?.scrollY).toBe(980);
  });

  it("overwrites a previous scrollY (no high-water mark)", () => {
    let p = recordChapterScroll(emptyProgress(), "10", 980);
    p = recordChapterScroll(p, "10", 120);
    expect(p.chapters["10"]?.scrollY).toBe(120);
  });

  it("preserves completedAt when updating scrollY post-completion", () => {
    let p = markChapterCompleted(
      emptyProgress(),
      "10",
      "2026-05-22T10:00:00.000Z",
    );
    p = recordChapterScroll(p, "10", 555);
    expect(p.chapters["10"]?.completedAt).toBe(
      "2026-05-22T10:00:00.000Z",
    );
    expect(p.chapters["10"]?.scrollY).toBe(555);
  });
});

describe("recordQuizAnswer", () => {
  it("records a correct answer", () => {
    const out = recordQuizAnswer(
      emptyProgress(),
      "ent-q-042",
      true,
      "2026-05-22T11:00:00.000Z",
    );
    expect(out.quiz["ent-q-042"]).toEqual({
      lastAnswered: "2026-05-22T11:00:00.000Z",
      correct: true,
    });
  });

  it("overwrites a previous record for the same qid (retries supported)", () => {
    let p = recordQuizAnswer(
      emptyProgress(),
      "ent-q-042",
      false,
      "2026-05-22T11:00:00.000Z",
    );
    p = recordQuizAnswer(p, "ent-q-042", true, "2026-05-22T12:00:00.000Z");
    expect(p.quiz["ent-q-042"]).toEqual({
      lastAnswered: "2026-05-22T12:00:00.000Z",
      correct: true,
    });
  });
});

describe("isChapterCompleted / isChapterInProgress / countCompletedChapters", () => {
  it("isChapterCompleted: false for untouched, true after mark", () => {
    let p = emptyProgress();
    expect(isChapterCompleted(p, "00")).toBe(false);
    p = markChapterCompleted(p, "00", "2026-05-22T00:00:00.000Z");
    expect(isChapterCompleted(p, "00")).toBe(true);
  });

  it("isChapterInProgress: true when scrollY > 0 and not yet completed", () => {
    let p = recordChapterScroll(emptyProgress(), "04", 350);
    expect(isChapterInProgress(p, "04")).toBe(true);
    p = markChapterCompleted(p, "04", "2026-05-22T04:00:00.000Z");
    expect(isChapterInProgress(p, "04")).toBe(false);
  });

  it("isChapterInProgress: false for scrollY === 0 or absent", () => {
    expect(isChapterInProgress(emptyProgress(), "04")).toBe(false);
    const p = recordChapterScroll(emptyProgress(), "04", 0);
    expect(isChapterInProgress(p, "04")).toBe(false);
  });

  it("countCompletedChapters: iterates the supplied NN list (stale entries ignored)", () => {
    let p = emptyProgress();
    p = markChapterCompleted(p, "00", "2026-05-22T00:00:00.000Z");
    p = markChapterCompleted(p, "05", "2026-05-22T05:00:00.000Z");
    // Stale chapter id that is NOT in the supplied list — must not count.
    p = markChapterCompleted(p, "99", "2026-05-22T99:00:00.000Z");
    const nns = ["00", "01", "02", "03", "04", "05"];
    expect(countCompletedChapters(p, nns)).toBe(2);
  });
});
