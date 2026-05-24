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
  { href: "/book", key: "book", disabled: true },
] as const;

export function GamifiedNav(): React.ReactElement {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  return (
    <nav className="sticky top-0 z-30 bg-[#1a1a2e] border-b border-white/[.06]">
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-3 px-3 sm:px-4 h-12">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#e94560] rounded-md flex items-center justify-center text-white text-[10px] font-extrabold">IP</div>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const isDisabled = "disabled" in item && item.disabled;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-disabled={isDisabled || undefined}
                  className={
                    isActive
                      ? "px-3 py-1 rounded-full text-xs font-semibold bg-[#e94560] text-white transition-colors"
                      : isDisabled
                        ? "px-3 py-1 rounded-full text-xs text-white/30 cursor-not-allowed"
                        : "px-3 py-1 rounded-full text-xs text-white/60 hover:text-white/90 hover:bg-white/[.06] transition-colors"
                  }
                >
                  {tNav(item.key)}{isDisabled ? " 🔒" : ""}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <ThemeSwitcher />
          <Suspense fallback={null}>
            <LocaleSwitcher />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
