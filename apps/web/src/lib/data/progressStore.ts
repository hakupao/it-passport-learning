export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ChapterProgress {
  scrollY?: number;
  completedAt?: string;
}

export interface QuizProgress {
  lastAnswered: string;
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

export function emptyProgress(): BookProgress {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    chapters: {},
    quiz: {},
    updatedAt: new Date(0).toISOString(),
  };
}

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
    // Quota exceeded / private mode — swallow.
  }
}

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

export function isChapterCompleted(
  progress: BookProgress,
  nn: string,
): boolean {
  return Boolean(progress.chapters[nn]?.completedAt);
}

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

export function isChapterInProgress(
  progress: BookProgress,
  nn: string,
): boolean {
  const c = progress.chapters[nn];
  if (!c) return false;
  if (c.completedAt) return false;
  return typeof c.scrollY === "number" && c.scrollY > 0;
}

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
