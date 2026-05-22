// Phase 3 Step 1 — <NavTabs /> refactor per D-101 LD-1.
//
// D-101 §2.1 makes /[locale]/book the canonical trunk; LD-1 keeps the
// chat/quiz/glossary routes as escape-hatch + book-internal jump targets
// but visually demotes them so Book reads as 主体 (textbook is the main
// body, not a peer tab).
//
// Visual contract (LD-1):
//   - Book tab: primary chip (filled when active, larger label, prominent).
//   - chat/quiz/glossary tabs: rendered after a "·" separator at a smaller
//     size + lighter colour (二级色调). Active styling still works for
//     escape-hatch direct navigation.
//   - LocaleSwitcher stays on the right (Phase 2 invariant).
//   - Focus-visible ring + aria-current preserved per Phase 2 Step 14
//     a11y polish (WCAG 1.4.11 + 2.4.7).

"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { Link, usePathname } from "@/i18n/navigation";

import { LocaleSwitcher } from "./LocaleSwitcher";

const PRIMARY_TAB = "/book" as const;
const SECONDARY_TAB_PATHS = ["/chat", "/quiz", "/glossary"] as const;
type SecondaryTabPath = (typeof SECONDARY_TAB_PATHS)[number];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function NavTabs(): React.ReactElement {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  // The Book tab is "active" for any path under /book (e.g.
  // /book/chapter/03). The /chat /quiz /glossary tabs are active only
  // on exact match — they are leaf single-route surfaces.
  const isBookActive =
    pathname === PRIMARY_TAB || pathname.startsWith(`${PRIMARY_TAB}/`);

  const secondaryLabels: Record<SecondaryTabPath, string> = {
    "/chat": tNav("chat"),
    "/quiz": tNav("quiz"),
    "/glossary": tNav("glossary"),
  };

  return (
    <nav
      className="sticky top-0 z-30 backdrop-blur bg-white/85 dark:bg-black/85 border-b border-black/[.08] dark:border-white/[.12]"
      aria-label={tNav("appTitle")}
    >
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-3 px-3 sm:px-4 h-12">
        <ol className="flex items-center gap-1 sm:gap-2 min-w-0">
          <li>
            <Link
              href={PRIMARY_TAB}
              aria-current={isBookActive ? "page" : undefined}
              className={
                isBookActive
                  ? `inline-flex items-center px-3 sm:px-4 h-8 rounded-full text-sm sm:text-base font-semibold bg-black text-white dark:bg-white dark:text-black transition-colors ${FOCUS_RING}`
                  : `inline-flex items-center px-3 sm:px-4 h-8 rounded-full text-sm sm:text-base font-semibold text-black/85 dark:text-white/85 hover:bg-black/[.06] dark:hover:bg-white/[.10] transition-colors ${FOCUS_RING}`
              }
            >
              {tNav("book")}
            </Link>
          </li>

          {/* Divider between primary trunk and secondary escape-hatch tabs */}
          <li
            aria-hidden="true"
            className="text-black/30 dark:text-white/30 text-sm sm:text-base px-1"
          >
            ·
          </li>

          {SECONDARY_TAB_PATHS.map((p) => {
            const isActive = pathname === p;
            return (
              <li key={p} className="min-w-0">
                <Link
                  href={p}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? `inline-flex items-center px-2 sm:px-2.5 h-7 rounded-full text-[11px] sm:text-xs font-medium bg-black/[.85] text-white dark:bg-white/[.85] dark:text-black transition-colors ${FOCUS_RING}`
                      : `inline-flex items-center px-2 sm:px-2.5 h-7 rounded-full text-[11px] sm:text-xs text-black/55 dark:text-white/55 hover:text-black/85 dark:hover:text-white/85 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors ${FOCUS_RING}`
                  }
                >
                  {secondaryLabels[p]}
                </Link>
              </li>
            );
          })}
        </ol>
        {/*
          LocaleSwitcher reads useSearchParams() to preserve ?qid= / ?term=
          across locale changes. Next.js requires that hook to live inside a
          <Suspense> boundary so the surrounding tree can prerender statically
          while the search-params subtree falls back to client-side hydration.
        */}
        <Suspense fallback={null}>
          <LocaleSwitcher />
        </Suspense>
      </div>
    </nav>
  );
}
