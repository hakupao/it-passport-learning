// Unit tests for the Phase 4 Module A tutor/tutorContext projection layer
// (A.1 + A.3). Mirrors the matrix used by book/__tests__/progressStore.test.ts.
//
// Pure logic — no jsdom, no React. Storage drove via StorageLike memory stub.

import { describe, expect, it } from "vitest";

import type { ChapterSummary } from "@/lib/book/chapterScope";
import {
  type StorageLike,
  emptyProgress,
  markChapterCompleted,
  recordChapterScroll,
  recordQuizAnswer,
  saveProgress,
} from "@/lib/book/progressStore";
import {
  DEFAULT_RECENT_QUIZ_LIMIT,
  loadTutorContext,
  projectChapterStatuses,
  projectRecentQuiz,
} from "../tutorContext";

function makeChapter(nn: string, firstPage: number, lastPage: number): ChapterSummary {
  return {
    nn,
    chapterId: `ch${nn}`,
    title: `第${nn}章`,
    firstPage,
    lastPage,
    pageCount: lastPage - firstPage + 1,
  };
}

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

const CHAPTERS_16: ChapterSummary[] = Array.from({ length: 16 }, (_, i) => {
  const nn = String(i).padStart(2, "0");
  return makeChapter(nn, i * 35 + 1, (i + 1) * 35);
});

// ===========================================================================
// projectChapterStatuses
// ===========================================================================

describe("projectChapterStatuses", () => {
  it("empty progress + chapters → every chapter in pending bucket", () => {
    const out = projectChapterStatuses(emptyProgress(), CHAPTERS_16);
    expect(out.completedChapters).toEqual([]);
    expect(out.inProgressChapters).toEqual([]);
    expect(out.pendingChapters).toHaveLength(16);
    expect(out.pendingChapters[0]?.nn).toBe("00");
    expect(out.pendingChapters[15]?.nn).toBe("15");
  });

  it("one chapter completed → completed bucket only", () => {
    let p = emptyProgress();
    p = markChapterCompleted(p, "03", "2026-05-22T10:00:00.000Z");
    const out = projectChapterStatuses(p, CHAPTERS_16);
    expect(out.completedChapters.map((c) => c.nn)).toEqual(["03"]);
    expect(out.inProgressChapters).toEqual([]);
    expect(out.pendingChapters).toHaveLength(15);
  });

  it("one chapter scrollY > 0 (no completedAt) → inProgress bucket", () => {
    let p = emptyProgress();
    p = recordChapterScroll(p, "07", 500);
    const out = projectChapterStatuses(p, CHAPTERS_16);
    expect(out.completedChapters).toEqual([]);
    expect(out.inProgressChapters.map((c) => c.nn)).toEqual(["07"]);
    expect(out.pendingChapters).toHaveLength(15);
  });

  it("chapter with scrollY AND completedAt lands in completed (not inProgress)", () => {
    let p = emptyProgress();
    p = recordChapterScroll(p, "05", 1234);
    p = markChapterCompleted(p, "05", "2026-05-22T11:00:00.000Z");
    const out = projectChapterStatuses(p, CHAPTERS_16);
    expect(out.completedChapters.map((c) => c.nn)).toEqual(["05"]);
    expect(out.inProgressChapters).toEqual([]);
  });

  it("mixed buckets — source order preserved within each bucket", () => {
    let p = emptyProgress();
    p = markChapterCompleted(p, "00", "2026-05-22T00:00:00.000Z");
    p = markChapterCompleted(p, "02", "2026-05-22T02:00:00.000Z");
    p = recordChapterScroll(p, "01", 200);
    p = recordChapterScroll(p, "04", 800);
    const out = projectChapterStatuses(p, CHAPTERS_16);
    expect(out.completedChapters.map((c) => c.nn)).toEqual(["00", "02"]);
    expect(out.inProgressChapters.map((c) => c.nn)).toEqual(["01", "04"]);
    expect(out.pendingChapters[0]?.nn).toBe("03");
    expect(out.pendingChapters.map((c) => c.nn)).toEqual([
      "03",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
    ]);
  });

  it("supplied chapter subset → never inflates beyond the subset", () => {
    const subset = CHAPTERS_16.slice(0, 3); // 00, 01, 02
    let p = emptyProgress();
    p = markChapterCompleted(p, "00", "2026-05-22T00:00:00.000Z");
    // Stale completion for a chapter NOT in the subset — must not appear.
    p = markChapterCompleted(p, "99", "2026-05-22T99:00:00.000Z");
    const out = projectChapterStatuses(p, subset);
    const total =
      out.completedChapters.length +
      out.inProgressChapters.length +
      out.pendingChapters.length;
    expect(total).toBe(3);
    expect(out.completedChapters.map((c) => c.nn)).toEqual(["00"]);
  });
});

// ===========================================================================
// projectRecentQuiz
// ===========================================================================

describe("projectRecentQuiz", () => {
  it("empty quiz dict → empty array", () => {
    expect(projectRecentQuiz(emptyProgress())).toEqual([]);
  });

  it("single entry → 1-element array preserving correct flag", () => {
    let p = emptyProgress();
    p = recordQuizAnswer(p, "page_042_entity_0", true, "2026-05-22T10:00:00.000Z");
    const out = projectRecentQuiz(p);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({
      questionId: "page_042_entity_0",
      lastAnswered: "2026-05-22T10:00:00.000Z",
      correct: true,
    });
  });

  it("multiple entries — most recent first (desc by lastAnswered)", () => {
    let p = emptyProgress();
    p = recordQuizAnswer(p, "page_001_entity_0", true, "2026-05-22T01:00:00.000Z");
    p = recordQuizAnswer(p, "page_003_entity_0", false, "2026-05-22T03:00:00.000Z");
    p = recordQuizAnswer(p, "page_002_entity_0", true, "2026-05-22T02:00:00.000Z");
    const out = projectRecentQuiz(p);
    expect(out.map((q) => q.questionId)).toEqual([
      "page_003_entity_0",
      "page_002_entity_0",
      "page_001_entity_0",
    ]);
  });

  it("ties on lastAnswered broken by questionId asc (deterministic)", () => {
    let p = emptyProgress();
    p = recordQuizAnswer(p, "page_010_entity_2", true, "2026-05-22T05:00:00.000Z");
    p = recordQuizAnswer(p, "page_010_entity_1", false, "2026-05-22T05:00:00.000Z");
    p = recordQuizAnswer(p, "page_010_entity_0", true, "2026-05-22T05:00:00.000Z");
    const out = projectRecentQuiz(p);
    expect(out.map((q) => q.questionId)).toEqual([
      "page_010_entity_0",
      "page_010_entity_1",
      "page_010_entity_2",
    ]);
  });

  it("limit honored — slice to first N most recent", () => {
    let p = emptyProgress();
    for (let i = 0; i < 5; i++) {
      p = recordQuizAnswer(
        p,
        `page_${String(i).padStart(3, "0")}_entity_0`,
        i % 2 === 0,
        `2026-05-22T0${i}:00:00.000Z`,
      );
    }
    const out = projectRecentQuiz(p, 3);
    expect(out).toHaveLength(3);
    // Most recent are i=4, 3, 2.
    expect(out.map((q) => q.questionId)).toEqual([
      "page_004_entity_0",
      "page_003_entity_0",
      "page_002_entity_0",
    ]);
  });

  it("default limit is DEFAULT_RECENT_QUIZ_LIMIT", () => {
    let p = emptyProgress();
    for (let i = 0; i < DEFAULT_RECENT_QUIZ_LIMIT + 5; i++) {
      p = recordQuizAnswer(
        p,
        `page_${String(i).padStart(3, "0")}_entity_0`,
        true,
        `2026-05-22T${String(i).padStart(2, "0")}:00:00.000Z`,
      );
    }
    expect(projectRecentQuiz(p)).toHaveLength(DEFAULT_RECENT_QUIZ_LIMIT);
  });

  it("negative limit → empty array", () => {
    let p = emptyProgress();
    p = recordQuizAnswer(p, "page_001_entity_0", true, "2026-05-22T01:00:00.000Z");
    expect(projectRecentQuiz(p, -1)).toEqual([]);
  });
});

// ===========================================================================
// loadTutorContext
// ===========================================================================

describe("loadTutorContext", () => {
  it("cold storage → all chapters pending + empty recentQuiz", () => {
    const s = makeMemoryStorage();
    const ctx = loadTutorContext(s, CHAPTERS_16);
    expect(ctx.completedChapters).toEqual([]);
    expect(ctx.inProgressChapters).toEqual([]);
    expect(ctx.pendingChapters).toHaveLength(16);
    expect(ctx.recentQuiz).toEqual([]);
  });

  it("round-trips full state from progressStore via storage", () => {
    const s = makeMemoryStorage();
    let p = emptyProgress();
    p = markChapterCompleted(p, "00", "2026-05-22T00:00:00.000Z");
    p = recordChapterScroll(p, "01", 400);
    p = recordQuizAnswer(p, "page_042_entity_0", true, "2026-05-22T03:00:00.000Z");
    p = recordQuizAnswer(p, "page_050_entity_1", false, "2026-05-22T04:00:00.000Z");
    saveProgress(s, p);
    const ctx = loadTutorContext(s, CHAPTERS_16);
    expect(ctx.completedChapters.map((c) => c.nn)).toEqual(["00"]);
    expect(ctx.inProgressChapters.map((c) => c.nn)).toEqual(["01"]);
    expect(ctx.pendingChapters).toHaveLength(14);
    expect(ctx.recentQuiz.map((q) => q.questionId)).toEqual([
      "page_050_entity_1",
      "page_042_entity_0",
    ]);
  });

  it("storage read failure → empty TutorContext (everything pending)", () => {
    const s: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError — private mode");
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    const ctx = loadTutorContext(s, CHAPTERS_16);
    expect(ctx.completedChapters).toEqual([]);
    expect(ctx.inProgressChapters).toEqual([]);
    expect(ctx.pendingChapters).toHaveLength(16);
    expect(ctx.recentQuiz).toEqual([]);
  });

  it("corrupt persisted shape → empty TutorContext", () => {
    const s = makeMemoryStorage();
    s.setItem("itp:book:progress:v1", "{not json");
    const ctx = loadTutorContext(s, CHAPTERS_16);
    expect(ctx.pendingChapters).toHaveLength(16);
    expect(ctx.recentQuiz).toEqual([]);
  });

  it("options.recentQuizLimit honored end-to-end", () => {
    const s = makeMemoryStorage();
    let p = emptyProgress();
    for (let i = 0; i < 6; i++) {
      p = recordQuizAnswer(
        p,
        `page_${String(i).padStart(3, "0")}_entity_0`,
        true,
        `2026-05-22T${String(i).padStart(2, "0")}:00:00.000Z`,
      );
    }
    saveProgress(s, p);
    const ctx = loadTutorContext(s, CHAPTERS_16, { recentQuizLimit: 2 });
    expect(ctx.recentQuiz).toHaveLength(2);
    expect(ctx.recentQuiz.map((q) => q.questionId)).toEqual([
      "page_005_entity_0",
      "page_004_entity_0",
    ]);
  });
});
