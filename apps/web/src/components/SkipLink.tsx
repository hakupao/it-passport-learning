// Phase 2 Step 14 — SkipLink (Session 46 LD-2).
//
// WCAG 2.4.1 Bypass Blocks: keyboard users tabbing into the page from the
// browser chrome hit this link first, can press Enter to jump straight to the
// main content, bypassing the NavTabs tab bar.
//
// The link is visually hidden by default (sr-only) and becomes visible on
// focus (focus:not-sr-only + absolute positioning + high z-index). This is
// the canonical pattern from a11yproject.com / inclusive-components.
//
// href="#main-content" targets the `id="main-content" tabIndex={-1}` element
// on each page's <main>. Per LD-8 every page sets that id.

"use client";

import { useTranslations } from "next-intl";

export function SkipLink(): React.ReactElement {
  const tCommon = useTranslations("Common");
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white"
    >
      {tCommon("skipToMain")}
    </a>
  );
}
