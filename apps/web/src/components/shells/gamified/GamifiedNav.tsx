"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeSwitcher } from "../ThemeSwitcher";

const NAV_ITEMS = [
  { href: "/chat", key: "chat" },
  { href: "/quiz", key: "quiz" },
  { href: "/glossary", key: "glossary" },
  { href: "/tutor", key: "tutor" },
] as const;

export function GamifiedNav(): React.ReactElement {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  return (
    <nav className="sticky top-0 z-30 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/[.06]">
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-2 px-3 sm:px-4 h-14">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 bg-[#e94560] rounded-md flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">IP</div>
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "min-h-[36px] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#e94560] text-white transition-colors inline-flex items-center whitespace-nowrap"
                      : "min-h-[36px] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm text-white/60 hover:text-white/90 hover:bg-white/[.06] active:bg-white/[.1] transition-colors inline-flex items-center whitespace-nowrap"
                  }
                >
                  {tNav(item.key)}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-white/60 shrink-0">
          <ThemeSwitcher />
          <Suspense fallback={null}>
            <LocaleSwitcher />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
