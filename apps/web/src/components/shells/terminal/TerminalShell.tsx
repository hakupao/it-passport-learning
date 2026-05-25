"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/shells/ThemeSwitcher";

const NAV_ITEMS = [
  { href: "/chat", key: "chat" },
  { href: "/quiz", key: "quiz" },
  { href: "/glossary", key: "glossary" },
  { href: "/tutor", key: "tutor" },
  { href: "/book", key: "book", disabled: true },
] as const;

export function TerminalShell({ children }: { children: ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  return (
    <div
      className="min-h-dvh bg-[#1e1e1e] font-mono text-[#d4d4d4] text-sm"
      data-shell="terminal"
    >
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#2d2d2d] border-b border-[#444]">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-2 px-3 sm:px-4 h-12 sm:h-10">
          {/* Left: macOS traffic lights */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"
                aria-hidden="true"
              />
              <span
                className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"
                aria-hidden="true"
              />
              <span
                className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"
                aria-hidden="true"
              />
            </div>
            {/* Tab bar */}
            <nav className="flex items-center gap-0 ml-3">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const isDisabled =
                  "disabled" in item && item.disabled;

                if (isDisabled) {
                  return (
                    <span
                      key={item.href}
                      aria-disabled="true"
                      title={tNav("bookLockedTooltip")}
                      className="min-h-[36px] px-3 py-2 sm:py-1 text-xs text-[#555] cursor-not-allowed select-none inline-flex items-center whitespace-nowrap"
                    >
                      {tNav(item.key)}
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "min-h-[36px] px-3 py-2 sm:py-1 text-xs text-[#4ec9b0] border-b border-[#4ec9b0] transition-colors inline-flex items-center whitespace-nowrap"
                        : "min-h-[36px] px-3 py-2 sm:py-1 text-xs text-[#888] hover:text-[#ccc] active:text-[#ccc] transition-colors inline-flex items-center whitespace-nowrap"
                    }
                  >
                    {tNav(item.key)}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: theme + locale + label */}
          <div className="flex items-center gap-2 shrink-0 text-[#888]">
            <ThemeSwitcher />
            <Suspense fallback={null}>
              <LocaleSwitcher />
            </Suspense>
            <span className="text-[#555] text-xs hidden sm:inline">you@itp:~</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="focus:outline-none max-w-5xl mx-auto"
      >
        {children}
      </main>
    </div>
  );
}
