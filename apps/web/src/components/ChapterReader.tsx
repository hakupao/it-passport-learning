// Phase 3 Step 1 — <ChapterReader /> continuous chapter-page flow (D-101 §2.2).
//
// Renders an ordered, scrollable column of pages within a single chapter.
// LD-2/3 inline triggers (selection toolbar, 章末 chat+quiz, scroll-to-end
// gate) are deferred to Step 2 + Step 3 respectively. This component is
// the "shell" — page markers + entity body + prev/next sibling navigation
// at the footer.
//
// Content body is strictly ja per D-101 §2.3 (textbook authenticity); the
// surrounding chrome (page heading, prev/next buttons) follows the active
// chrome locale via next-intl. lang="ja" attribute on body text is
// preserved so screen readers + browser hyphenation handle Japanese
// content correctly.

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  projectRenderEntities,
  type ChapterSummary,
} from "@/lib/book/chapterScope";
import type { Page } from "@/lib/data/types";

interface ChapterReaderProps {
  summary: ChapterSummary;
  pages: Page[];
  siblings: { prevNn: string | null; nextNn: string | null };
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function ChapterReader({
  summary,
  pages,
  siblings,
}: ChapterReaderProps): React.ReactElement {
  const t = useTranslations("Book");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-col min-h-[calc(100vh-3rem)] max-w-3xl mx-auto p-4 sm:p-6 gap-6 focus:outline-none"
    >
      <header className="border-b border-black/[.08] dark:border-white/[.12] pb-3">
        <p className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
          {t("chapterBadge", { nn: summary.nn })}
        </p>
        <h1
          className="text-xl sm:text-2xl font-semibold tracking-tight mt-1"
          lang="ja"
        >
          {summary.title}
        </h1>
        <p className="text-xs sm:text-sm text-black/65 dark:text-white/65 mt-1">
          {t("pageRange", {
            first: summary.firstPage,
            last: summary.lastPage,
          })}{" "}
          · {t("pageCount", { count: summary.pageCount })}
        </p>
        <p className="mt-2">
          <Link
            href="/book"
            className={`inline-flex items-center text-xs text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white rounded-md px-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors ${FOCUS_RING}`}
          >
            {t("backToIndex")}
          </Link>
        </p>
      </header>

      {pages.length === 0 ? (
        <p className="text-center text-sm text-black/60 dark:text-white/60 py-12">
          {t("emptyHint")}
        </p>
      ) : (
        <ol className="flex flex-col gap-8">
          {pages.map((page) => {
            const entities = projectRenderEntities(page);
            return (
              <li
                key={page.page}
                id={`page-${page.page}`}
                className="flex flex-col gap-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-black/45 dark:text-white/45 border-b border-black/[.06] dark:border-white/[.08] pb-1">
                  {t("pageHeading", { page: page.page })}
                </p>

                {entities.length === 0 ? (
                  <p
                    className="text-sm italic text-black/55 dark:text-white/55"
                    lang="ja"
                  >
                    {t("noEntities")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {entities.map((e, i) => (
                      <EntityBlock key={i} entity={e} />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <footer className="flex items-center justify-between gap-3 border-t border-black/[.08] dark:border-white/[.12] pt-4 mt-4">
        <div>
          {siblings.prevNn && (
            <Link
              href={`/book/chapter/${siblings.prevNn}`}
              className={`inline-flex items-center text-sm rounded-lg border border-black/[.18] dark:border-white/[.22] px-3 py-1.5 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors ${FOCUS_RING}`}
            >
              {t("prevChapter")}
            </Link>
          )}
        </div>
        <div>
          {siblings.nextNn && (
            <Link
              href={`/book/chapter/${siblings.nextNn}`}
              className={`inline-flex items-center text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
            >
              {t("nextChapter")}
            </Link>
          )}
        </div>
      </footer>
    </main>
  );
}

function EntityBlock({
  entity,
}: {
  entity: ReturnType<typeof projectRenderEntities>[number];
}): React.ReactElement | null {
  if (!entity.textJp && !entity.imageRef) return null;

  // Section entities = headings; figure captions = italic line; default
  // body text = paragraph. Section number (e.g. "01-01") is shown as a
  // small chip above the heading so readers can cross-reference with the
  // physical textbook.
  if (entity.type === "section") {
    return (
      <div className="space-y-1">
        {entity.sectionNumber && (
          <p className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
            §{entity.sectionNumber}
          </p>
        )}
        {entity.textJp && (
          <h2
            className="text-base sm:text-lg font-semibold tracking-tight"
            lang="ja"
          >
            {entity.textJp}
          </h2>
        )}
      </div>
    );
  }

  if (entity.type === "figure") {
    return (
      <figure className="space-y-1">
        {entity.imageRef && (
          <p className="text-[10px] uppercase tracking-wider text-black/45 dark:text-white/45">
            {entity.imageRef}
          </p>
        )}
        {entity.textJp && (
          <figcaption
            className="text-sm italic text-black/75 dark:text-white/75"
            lang="ja"
          >
            {entity.textJp}
          </figcaption>
        )}
      </figure>
    );
  }

  // Default — generic text/explanation/answer block.
  return entity.textJp ? (
    <p
      className="text-sm sm:text-base leading-relaxed text-black/85 dark:text-white/85"
      lang="ja"
    >
      {entity.textJp}
    </p>
  ) : null;
}
