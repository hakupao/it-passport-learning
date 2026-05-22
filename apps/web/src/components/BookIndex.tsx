// Phase 3 Step 1 — <BookIndex /> 16-chapter TOC (D-101 §2.2).
//
// Server component-friendly (zero client hooks). Receives the projected
// ChapterSummary[] from the /[locale]/book route and renders chapter
// rows linking to /[locale]/book/chapter/NN. Chapter title is localized
// to the active chrome locale per pickTitle().
//
// LD-1 visual contract: Book is the primary surface; this index is the
// landing page. Cards are sized to read as the main content (not a side
// rail).

import { useTranslations } from "next-intl";

import {
  BookProgressSummary,
  ChapterProgressPill,
} from "./BookProgressSummary";
import { Link } from "@/i18n/navigation";
import type { ChapterSummary } from "@/lib/book/chapterScope";

interface BookIndexProps {
  chapters: ChapterSummary[];
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function BookIndex({ chapters }: BookIndexProps): React.ReactElement {
  const t = useTranslations("Book");
  const nns = chapters.map((c) => c.nn);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-5 focus:outline-none"
    >
      <header className="border-b border-black/[.08] dark:border-white/[.12] pb-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-black/65 dark:text-white/65 mt-1">
          {t("subtitle")}
        </p>
        <BookProgressSummary nns={nns} />
      </header>

      {chapters.length === 0 ? (
        <p className="text-center text-sm text-black/60 dark:text-white/60 py-12">
          {t("emptyHint")}
        </p>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chapters.map((c) => (
            <li
              key={c.chapterId}
              className="border border-black/[.08] dark:border-white/[.14] rounded-xl p-4 bg-white dark:bg-black/40 flex flex-col gap-2 hover:border-black/30 dark:hover:border-white/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
                  {t("chapterBadge", { nn: c.nn })}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
                  {t("pageRange", { first: c.firstPage, last: c.lastPage })}
                </span>
              </div>

              <ChapterProgressPill nn={c.nn} />

              <p
                className="text-sm sm:text-base leading-snug text-black/90 dark:text-white/90 font-medium"
                lang="ja"
              >
                {c.title}
              </p>

              <p className="text-xs text-black/60 dark:text-white/60">
                {t("pageCount", { count: c.pageCount })}
              </p>

              <Link
                href={`/book/chapter/${c.nn}`}
                className={`mt-1 self-start text-xs rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
              >
                {t("open")}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
