// Phase 2 Step 11 — <GlossaryList /> client component (D-085 §2.4 term-hover mode).
//
// Session 43 4Q-locked design:
//   - Renders all 908 glossary cards in 50音 (Intl.Collator('ja')) order.
//   - URL `?term=<encodeURIComponent(surface_jp)>` is the single source of truth
//     for the active term (Q1=a / Q2=a / LD-2):
//       - Browser back/forward toggles the popover naturally.
//       - The URL is shareable + reload-survives.
//       - Closing the popover calls `router.replace` to clear `?term=` without
//         growing the history stack.
//
// Pure client component; the server <GlossaryListPage /> hydrates it with the
// pre-built GlossarySummary[] derived from the corpus glossary.
//
// Session 46 Step 14 a11y polish (Full WCAG 2.1 AA):
//   - Contrast: text-black/50 → /60 (emptyHint) / text-black/40 → /55 (page
//     badge).
//   - Focus: uniform focus-visible ring on the Explain button (LD-4).
//   - <main id="main-content" tabIndex={-1}> is the SkipLink target (LD-8).

"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { TermPopover } from "./TermPopover";
import {
  findSummaryBySurface,
  parseTermParam,
  type GlossarySummary,
} from "@/lib/glossary/glossaryScope";

interface GlossaryListProps {
  summaries: GlossarySummary[];
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function GlossaryList({
  summaries,
}: GlossaryListProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const tTerm = useTranslations("TermPopover");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTerm = parseTermParam(searchParams.get("term"));

  // Defensive URL-credential strip (Session 41 Rule B archive 2 carry-over;
  // re-applied for Step 11 by LD-5). See <QuizList />'s identical comment for
  // the full rationale: history.replaceState here cleans window.location.href
  // for any subsequent fetch the popover constructs against window.location.
  // Note: glossarySseTransport.resolveEndpoint() ALSO sidesteps document.baseURI
  // via window.location.origin, so this strip is a defence-in-depth measure.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.href.includes("@")) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.search + window.location.hash,
      );
    }
  }, []);

  const activeSummary = useMemo(() => {
    if (!activeTerm) return null;
    return findSummaryBySurface(summaries, activeTerm);
  }, [activeTerm, summaries]);

  const handleSelect = useCallback(
    (surfaceJp: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("term", surfaceJp);
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleClose = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("term");
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [router, searchParams]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-4 focus:outline-none"
    >
      <header className="border-b border-black/[.08] dark:border-white/[.12] pb-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-black/65 dark:text-white/65 mt-1">
          {t("subtitle")}
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-center text-sm text-black/60 dark:text-white/60 py-12">
          {t("emptyHint")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {summaries.map((s) => (
            <li
              key={s.id}
              className="border border-black/[.08] dark:border-white/[.14] rounded-xl p-3 bg-white dark:bg-black/40 flex flex-col gap-1.5 hover:border-black/30 dark:hover:border-white/30 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium tracking-tight" lang="ja">
                  {s.surfaceJp}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55 shrink-0">
                  {t("pageBadge", { page: s.firstPage })}
                </span>
              </div>

              {s.kanaReading && (
                <p className="text-[11px] text-black/60 dark:text-white/60" lang="ja">
                  {tTerm("readingPrefix")}
                  {s.kanaReading}
                </p>
              )}

              <p className="text-[11px] text-black/60 dark:text-white/60 line-clamp-1">
                <span lang="zh">{s.surfaceZh}</span>
                {" · "}
                <span lang="en">{s.surfaceEn}</span>
              </p>

              <button
                type="button"
                onClick={() => handleSelect(s.surfaceJp)}
                className={`mt-1 self-start text-[11px] rounded-md bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
              >
                {tCommon("explain")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </main>
  );
}
