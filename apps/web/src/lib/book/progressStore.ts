// Phase 3 Step 3 — book/progressStore: localStorage-backed learning
// progress (D-101 §2.4 + LD-3).
//
// Schema (versioned, corrupt-tolerant — same posture as Phase 2's
// chat/historyStore.ts):
//
//   itp:book:progress:v1 → {
//     schemaVersion: 1,
//     chapters: {
//       [nn]: { scrollY?: number, completedAt?: string }
//     },
//     quiz: {
//       [qid]: { lastAnswered: string, correct: boolean }
//     },
//     updatedAt: string,
//   }
//
// LD-3 章节完成 criterion = scroll-to-end gate + 「我看完了」 button manual
// commit. `markChapterCompleted` is the only writer for `completedAt`; the
// gate is enforced in the UI (the button is disabled until the scroll
// sentinel hits the viewport).
//
// Storage decoupling matches D-085 §2.2 pattern: every fn takes a
// `StorageLike` arg so vitest can drive it in node env (no jsdom).
// Production callers pass `window.localStorage`.

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ChapterProgress {
  /** Last persisted scroll position within the chapter route (px). */
  scrollY?: number;
  /** ISO timestamp of the user's 「我看完了」 click. Absent = not yet completed. */
  completedAt?: string;
}

export interface QuizProgress {
  /** ISO timestamp of last answer submission. */
  lastAnswered: string;
  /** True if the last submitted answer matched the canonical answer letter. */
  correct: boolean;
}

export interface BookProgress {
  schemaVersion: 1;
  chapters: Record<string, ChapterProgress>;
  quiz: Record<string, QuizProgress>;
  updatedAt: string;
}

export const PROGRESS_STORAGE_KEY = "itp:book:progress:v1";
export const PROGRESS_SCHEMA_VERSION = 1;

/** Canonical empty state — used as fallback on every recoverable failure. */
export function emptyProgress(): BookProgress {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    chapters: {},
    quiz: {},
    updatedAt: new Date(0).toISOString(),
  };
}

/**
 * Load progress. Returns the canonical empty state for every recoverable
 * failure (missing storage / parse error / schema mismatch / corrupt
 * shape). Same posture as `loadChatHistory()` — corrupted storage is a UX
 * inconvenience, not a contract violation; fall back to first-launch.
 */
export function loadProgress(
  storage: StorageLike,
  key: string = PROGRESS_STORAGE_KEY,
): BookProgress {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return emptyProgress();
  }
  if (raw === null) return emptyProgress();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }

  if (!isValidShape(parsed)) return emptyProgress();
  return parsed;
}

function isValidShape(v: unknown): v is BookProgress {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (o.schemaVersion !== PROGRESS_SCHEMA_VERSION) return false;
  if (
    !o.chapters ||
    typeof o.chapters !== "object" ||
    Array.isArray(o.chapters)
  ) {
    return false;
  }
  if (!o.quiz || typeof o.quiz !== "object" || Array.isArray(o.quiz)) {
    return false;
  }
  if (typeof o.updatedAt !== "string") return false;
  return true;
}

/**
 * Persist progress. Always re-stamps `updatedAt` so the cross-tab "last
 * write wins" semantics are observable. Swallows quota / private-mode
 * failures like the chat history store.
 */
export function saveProgress(
  storage: StorageLike,
  progress: BookProgress,
  key: string = PROGRESS_STORAGE_KEY,
): void {
  const envelope: BookProgress = {
    ...progress,
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };
  try {
    storage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Quota exceeded / private mode — swallow. Next reload uses whatever
    // survived the last successful write.
  }
}

/** Explicit user-driven clear path (parallel to clearChatHistory). */
export function clearProgress(
  storage: StorageLike,
  key: string = PROGRESS_STORAGE_KEY,
): void {
  try {
    storage.removeItem(key);
  } catch {
    // Same swallow rationale.
  }
}

// ---------------------------------------------------------------------------
// Pure state-mutation helpers (return new state — never mutate in place).
// ---------------------------------------------------------------------------

/**
 * Stamp the chapter `completedAt` with the current time. Idempotent — if
 * the chapter is already completed, returns the same state object (no
 * timestamp overwrite). Callers gate the button via the scroll-to-end
 * observer per LD-3.
 */
export function markChapterCompleted(
  progress: BookProgress,
  nn: string,
  nowIso: string = new Date().toISOString(),
): BookProgress {
  const existing = progress.chapters[nn];
  if (existing?.completedAt) return progress;
  return {
    ...progress,
    chapters: {
      ...progress.chapters,
      [nn]: { ...existing, completedAt: nowIso },
    },
  };
}

/**
 * Persist the user's current scroll offset within the chapter route. Used
 * for resume-where-you-left-off on subsequent visits. Pure replace
 * semantics (no high-water mark) so the user can scroll back up and have
 * that position remembered.
 */
export function recordChapterScroll(
  progress: BookProgress,
  nn: string,
  scrollY: number,
): BookProgress {
  return {
    ...progress,
    chapters: {
      ...progress.chapters,
      [nn]: { ...progress.chapters[nn], scrollY },
    },
  };
}

/**
 * Record a quiz answer outcome (called from <QuizExplain /> when the user
 * confirms a choice — wired in Step 3). Overwrites any earlier record for
 * the same qid (the user can retry).
 */
export function recordQuizAnswer(
  progress: BookProgress,
  qid: string,
  correct: boolean,
  nowIso: string = new Date().toISOString(),
): BookProgress {
  return {
    ...progress,
    quiz: {
      ...progress.quiz,
      [qid]: { lastAnswered: nowIso, correct },
    },
  };
}

/** Is the given chapter `nn` completed? */
export function isChapterCompleted(
  progress: BookProgress,
  nn: string,
): boolean {
  return Boolean(progress.chapters[nn]?.completedAt);
}

/**
 * Count how many of the supplied chapter `nn` values are completed.
 * Iterating over the supplied list (rather than `Object.keys(chapters)`)
 * keeps the count bound to the canonical 16-chapter set, so stale entries
 * for chapters that no longer exist (corpus update edge case) don't
 * inflate the X/16 display.
 */
export function countCompletedChapters(
  progress: BookProgress,
  nns: string[],
): number {
  let n = 0;
  for (const nn of nns) {
    if (isChapterCompleted(progress, nn)) n++;
  }
  return n;
}

/** Has the user scrolled / interacted with this chapter at all? */
export function isChapterInProgress(
  progress: BookProgress,
  nn: string,
): boolean {
  const c = progress.chapters[nn];
  if (!c) return false;
  if (c.completedAt) return false;
  return typeof c.scrollY === "number" && c.scrollY > 0;
}

/**
 * Convenience wrapper for the common quiz-self-report case (Phase 4 Module A
 * Step A.2): read current state, record the outcome, persist back. Used by
 * `<QuizExplain />`'s self-report footer once the AI explanation streams
 * (phase === "done"). Returns the new `BookProgress` so callers can keep
 * the in-memory state in sync without an extra `loadProgress` roundtrip.
 *
 * Storage failures are swallowed inside the underlying `saveProgress` —
 * a user in private mode still sees the self-report take effect in the
 * current modal session, the persistence layer just no-ops.
 *
 * Idempotent at the storage level via `recordQuizAnswer` overwrite
 * semantics — a user re-self-reporting (wrong → right, or vice versa)
 * ends up with the most recent outcome on disk.
 */
export function persistQuizOutcome(
  storage: StorageLike,
  qid: string,
  correct: boolean,
  key: string = PROGRESS_STORAGE_KEY,
): BookProgress {
  const current = loadProgress(storage, key);
  const next = recordQuizAnswer(current, qid, correct);
  saveProgress(storage, next, key);
  return next;
}
