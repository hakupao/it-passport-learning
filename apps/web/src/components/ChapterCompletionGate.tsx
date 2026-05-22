// Phase 3 Step 3 — <ChapterCompletionGate /> (LD-3).
//
// Renders inside <ChapterReader /> after the body content. Provides:
//   1. A 1×1 sentinel <div> at the top of the gate panel. An
//      IntersectionObserver fires once the sentinel scrolls into view —
//      i.e. the user has scrolled past the chapter body. Once tripped,
//      the gate state stays open (sticky) so scrolling back up doesn't
//      re-disable the button.
//   2. A 「我看完了」 / "Mark as read" button that is disabled until the
//      gate is open. Clicking calls progressStore.markChapterCompleted()
//      + saveProgress(window.localStorage, …). Idempotent — repeat clicks
//      are no-ops; the first commit's timestamp is preserved.
//   3. After commit (or if the chapter was already completed in a previous
//      session), the button is replaced by a "✓ 完了 · {localizedDate}"
//      badge.
//
// Mount-gate pattern: localStorage is only read after the component has
// mounted on the client, so the server-rendered HTML doesn't depend on
// browser storage (avoiding hydration mismatch). Before mount, the button
// is shown in disabled-loading state.

"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type BookProgress,
  emptyProgress,
  isChapterCompleted,
  loadProgress,
  markChapterCompleted,
  saveProgress,
} from "@/lib/book/progressStore";

interface ChapterCompletionGateProps {
  nn: string;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function ChapterCompletionGate({
  nn,
}: ChapterCompletionGateProps): React.ReactElement {
  const t = useTranslations("Book");
  const format = useFormatter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [progress, setProgress] = useState<BookProgress>(emptyProgress);

  // Mount + initial load. Defers localStorage access until after hydration
  // so SSR HTML stays deterministic.
  useEffect(() => {
    setMounted(true);
    setProgress(loadProgress(window.localStorage));
  }, []);

  // Scroll-to-end sentinel observer. Sticky once triggered.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // If the chapter is already completed there's no need to gate.
    if (isChapterCompleted(progress, nn)) {
      setScrolledToEnd(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setScrolledToEnd(true);
            obs.disconnect();
            return;
          }
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [progress, nn]);

  const completedAt = progress.chapters[nn]?.completedAt;
  const isCompleted = Boolean(completedAt);

  const handleCommit = useCallback((): void => {
    setProgress((prev) => {
      const next = markChapterCompleted(prev, nn);
      // Only persist if something actually changed (idempotent guard).
      if (next !== prev) saveProgress(window.localStorage, next);
      return next;
    });
  }, [nn]);

  const localizedCompletedAt = completedAt
    ? format.dateTime(new Date(completedAt), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Pre-mount: render the panel shell with a placeholder. Keeps the layout
  // stable across hydration without revealing the actual completion state.
  const buttonDisabled = !mounted || !scrolledToEnd || isCompleted;
  const buttonLabel = isCompleted
    ? t("completedBadge")
    : t("markCompleted");
  const hintText = isCompleted
    ? t("completedAt", { date: localizedCompletedAt ?? "" })
    : scrolledToEnd
      ? t("markCompletedReady")
      : t("markCompletedGateHint");

  return (
    <section
      aria-label={t("completionPanelLabel")}
      className="border border-black/[.08] dark:border-white/[.14] rounded-xl p-4 bg-black/[.02] dark:bg-white/[.04] flex flex-col gap-3"
    >
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-px" />
      <h2 className="text-sm sm:text-base font-semibold tracking-tight">
        {t("completionPanelTitle")}
      </h2>
      <p className="text-xs text-black/65 dark:text-white/65">{hintText}</p>
      <div>
        <button
          type="button"
          onClick={handleCommit}
          disabled={buttonDisabled}
          aria-disabled={buttonDisabled}
          aria-live="polite"
          className={
            isCompleted
              ? `inline-flex items-center gap-1 text-sm rounded-lg bg-emerald-600 text-white px-3 py-2 font-medium cursor-default ${FOCUS_RING}`
              : `inline-flex items-center gap-1 text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-2 font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`
          }
        >
          {isCompleted && <span aria-hidden="true">✓</span>}
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
