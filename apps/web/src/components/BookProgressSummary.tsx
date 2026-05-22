// Phase 3 Step 3 — <BookProgressSummary /> client island for <BookIndex />.
//
// Reads localStorage on mount and renders:
//   1. A "X / total" badge above the chapter grid (header inline overlay).
//   2. A per-chapter pill mounted inside each card by nn — completed
//      / in-progress / not-started.
//
// Kept as a single mount-once provider via a useState so we don't pay
// repeated read costs per card.

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  type BookProgress,
  countCompletedChapters,
  emptyProgress,
  isChapterCompleted,
  isChapterInProgress,
  loadProgress,
} from "@/lib/book/progressStore";

interface BookProgressSummaryProps {
  nns: string[];
}

export function BookProgressSummary({
  nns,
}: BookProgressSummaryProps): React.ReactElement | null {
  const t = useTranslations("Book");
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<BookProgress>(emptyProgress);

  useEffect(() => {
    setMounted(true);
    setProgress(loadProgress(window.localStorage));
  }, []);

  if (!mounted) return null;
  const done = countCompletedChapters(progress, nns);

  return (
    <p
      role="status"
      aria-live="polite"
      className="text-xs sm:text-sm text-black/65 dark:text-white/65 mt-1"
    >
      {t("progressSummary", { done, total: nns.length })}
    </p>
  );
}

interface ChapterProgressPillProps {
  nn: string;
}

/** Pill rendered inside each BookIndex card — completed / in-progress / not-started. */
export function ChapterProgressPill({
  nn,
}: ChapterProgressPillProps): React.ReactElement | null {
  const t = useTranslations("Book");
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<BookProgress>(emptyProgress);

  useEffect(() => {
    setMounted(true);
    setProgress(loadProgress(window.localStorage));
  }, []);

  if (!mounted) return null;

  if (isChapterCompleted(progress, nn)) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-emerald-600/15 text-emerald-700 dark:text-emerald-300">
        <span aria-hidden="true">✓</span>
        {t("chapterCompleted")}
      </span>
    );
  }

  if (isChapterInProgress(progress, nn)) {
    return (
      <span className="inline-flex items-center text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300">
        {t("chapterInProgress")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-black/[.06] dark:bg-white/[.10] text-black/55 dark:text-white/55">
      {t("chapterNotStarted")}
    </span>
  );
}
