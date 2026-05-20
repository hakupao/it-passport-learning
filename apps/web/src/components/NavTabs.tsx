// Phase 2 Step 12 — <NavTabs /> top sticky tab nav (D-099 §2.5 LD-1).
//
// Session 44 4Q-locked design:
//   Q1=a Top sticky tab nav + locale switcher right; consistent across
//        /chat /quiz /glossary; mirrors the /quiz + /glossary modal-discovery
//        UX shape.
//
// Tabs are <Link> from next-intl/navigation so locale-aware routing applies
// — clicking "問題集" when the locale is /zh routes to /zh/quiz, not /ja/quiz.
// Active styling derives from `usePathname()` matched against the per-locale
// internal pathnames ("/chat", "/quiz", "/glossary").

"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { Link, usePathname } from "@/i18n/navigation";

import { LocaleSwitcher } from "./LocaleSwitcher";

const TAB_PATHS = ["/chat", "/quiz", "/glossary"] as const;
type TabPath = (typeof TAB_PATHS)[number];

export function NavTabs(): React.ReactElement {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  const labels: Record<TabPath, string> = {
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
        <ol className="flex items-center gap-1 sm:gap-2">
          {TAB_PATHS.map((p) => {
            const isActive = pathname === p;
            return (
              <li key={p}>
                <Link
                  href={p}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "inline-flex items-center px-2.5 sm:px-3 h-8 rounded-full text-xs sm:text-sm font-medium bg-black text-white dark:bg-white dark:text-black transition-colors"
                      : "inline-flex items-center px-2.5 sm:px-3 h-8 rounded-full text-xs sm:text-sm text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors"
                  }
                >
                  {labels[p]}
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
