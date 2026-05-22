// Phase 4 Module A Step A.1 + A.3 — tutor/tutorContext: pure projection of
// the Phase 3 progressStore into the input shape consumed by the AI 学习助手
// (D-102 §2.1 + §7.1 form lock).
//
// Phase 4 Module A scope (per `docs/phase4/PLAN.md` §1):
//   - A.1 (this file, top section): TutorContext types + projection helpers
//   - A.3 (this file, bottom section): loadTutorContext() composer
//
// Design rationale:
//   - LD-Module-A-2 (A.1): TutorContext projects existing ChapterSummary[]
//     (Phase 3 LD-Step1) into 3 mutually-exclusive status buckets —
//     completed / inProgress / pending. recentQuiz is a sorted-by-
//     lastAnswered-desc slice projected to {questionId, lastAnswered,
//     correct}. Pure projection — no I/O.
//   - LD-Module-A-3 (A.3): loadTutorContext() composes loadProgress() +
//     the A.1 projection helpers. SSR-safe via StorageLike so it can be
//     called from a client component's useEffect (after mount-gate per
//     Phase 3 LD-Step3-D) without breaking hydration.
//
// Phase 4 Module B will consume TutorContext to build the SYSTEM_INSTRUCTION
// stable preamble block (Anthropic ephemeral cache target per D-103 §2.4).
// This module has NO LLM cost — A.1+A.3 are pure logic.

import type { ChapterSummary } from "@/lib/book/chapterScope";
import {
  type BookProgress,
  type StorageLike,
  isChapterCompleted,
  isChapterInProgress,
  loadProgress,
} from "@/lib/book/progressStore";

/** One quiz answer attempt, projected for tutor consumption. */
export interface QuizAttempt {
  /** entity_by_id key shape `page_NNN_entity_M`. */
  questionId: string;
  /** ISO timestamp of the user's self-report click. */
  lastAnswered: string;
  /** User-self-reported outcome. */
  correct: boolean;
}

/**
 * Snapshot of the user's learning state, projected from progressStore. The
 * AI 学习助手 (Phase 4) consumes this to ground its responses in WHERE the
 * user is in the 16-chapter textbook trunk.
 *
 * Chapter buckets are mutually exclusive and exhaustive — every chapter in
 * the supplied `ChapterSummary[]` lands in exactly one of {completed,
 * inProgress, pending}. Source order is preserved within each bucket so the
 * tutor sees chapters in textbook reading order.
 */
export interface TutorContext {
  /** Chapters the user has explicitly marked complete via the LD-3 gate. */
  completedChapters: ChapterSummary[];
  /** Chapters the user has scrolled into but not yet completed (scrollY > 0). */
  inProgressChapters: ChapterSummary[];
  /** Chapters the user has not yet touched. */
  pendingChapters: ChapterSummary[];
  /** Recent quiz attempts (most recent first), capped by `recentQuizLimit`. */
  recentQuiz: QuizAttempt[];
}

/** Default cap on `recentQuiz.length` — enough signal, low enough cost. */
export const DEFAULT_RECENT_QUIZ_LIMIT = 10;

// ---------------------------------------------------------------------------
// A.1 — Projection helpers (pure; no I/O)
// ---------------------------------------------------------------------------

/**
 * Split chapters into completed / inProgress / pending buckets based on the
 * current progress state. Source order is preserved within each bucket.
 *
 * A chapter with `completedAt` set lands in `completed` regardless of its
 * `scrollY` (a completed chapter the user re-scrolls is still completed —
 * matches the isChapterInProgress contract in progressStore).
 */
export function projectChapterStatuses(
  progress: BookProgress,
  chapters: ChapterSummary[],
): {
  completedChapters: ChapterSummary[];
  inProgressChapters: ChapterSummary[];
  pendingChapters: ChapterSummary[];
} {
  const completedChapters: ChapterSummary[] = [];
  const inProgressChapters: ChapterSummary[] = [];
  const pendingChapters: ChapterSummary[] = [];

  for (const c of chapters) {
    if (isChapterCompleted(progress, c.nn)) {
      completedChapters.push(c);
    } else if (isChapterInProgress(progress, c.nn)) {
      inProgressChapters.push(c);
    } else {
      pendingChapters.push(c);
    }
  }

  return { completedChapters, inProgressChapters, pendingChapters };
}

/**
 * Project the quiz dict into a sorted (most-recent-first) attempts list,
 * capped by `limit`. Stable behavior on ties (deterministic order via
 * questionId tiebreaker) so snapshot tests can lock the shape.
 */
export function projectRecentQuiz(
  progress: BookProgress,
  limit: number = DEFAULT_RECENT_QUIZ_LIMIT,
): QuizAttempt[] {
  const entries: QuizAttempt[] = Object.entries(progress.quiz).map(
    ([questionId, { lastAnswered, correct }]) => ({
      questionId,
      lastAnswered,
      correct,
    }),
  );

  entries.sort((a, b) => {
    if (a.lastAnswered !== b.lastAnswered) {
      // Most-recent first (desc).
      return a.lastAnswered < b.lastAnswered ? 1 : -1;
    }
    // Tiebreaker on questionId (asc) for deterministic order.
    return a.questionId < b.questionId ? -1 : 1;
  });

  if (limit < 0) return [];
  return entries.slice(0, limit);
}

// ---------------------------------------------------------------------------
// A.3 — loadTutorContext composer (reads progressStore via StorageLike)
// ---------------------------------------------------------------------------

export interface LoadTutorContextOptions {
  /** Override the default recent-quiz cap. */
  recentQuizLimit?: number;
}

/**
 * Read progress from `storage` and emit the projected `TutorContext`.
 *
 * SSR-safe via StorageLike: in production the client component passes
 * `window.localStorage` inside `useEffect` (after the mount-gate per Phase 3
 * LD-Step3-D); under vitest, callers pass a memory storage stub so the
 * function tests in node env without jsdom.
 *
 * Fallback posture: if the storage read fails or the persisted shape is
 * corrupt, `loadProgress` returns `emptyProgress()` and we project an empty
 * TutorContext with everything in `pendingChapters`. This matches the
 * Phase 3 first-launch posture from progressStore.
 */
export function loadTutorContext(
  storage: StorageLike,
  chapters: ChapterSummary[],
  options: LoadTutorContextOptions = {},
): TutorContext {
  const progress = loadProgress(storage);
  const buckets = projectChapterStatuses(progress, chapters);
  const recentQuiz = projectRecentQuiz(
    progress,
    options.recentQuizLimit ?? DEFAULT_RECENT_QUIZ_LIMIT,
  );

  return {
    completedChapters: buckets.completedChapters,
    inProgressChapters: buckets.inProgressChapters,
    pendingChapters: buckets.pendingChapters,
    recentQuiz,
  };
}
