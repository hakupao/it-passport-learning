"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/shells/ThemeSwitcher";
import { NAV_ITEMS } from "@/components/shells/navItems";
import { useNavScroll } from "@/components/shells/useNavScroll";

export function RetroMenuBar(): React.ReactElement {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");
  const navRef = useNavScroll<HTMLDivElement>();

  return (
    <nav className="bg-[#c0c0c0] border-b border-[#808080] flex items-center justify-between px-1">
      {/* Only the menu items scroll on a phone (useNavScroll); the switchers stay pinned on screen. */}
      <div ref={navRef} className="flex items-center min-w-0 overflow-x-auto scrollbar-hide nav-fade">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label = tNav(item.key);
          const firstChar = label.charAt(0);
          const rest = label.slice(1);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "min-h-[32px] px-3 py-1.5 sm:py-0.5 text-xs relative inline-flex items-center whitespace-nowrap focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current",
                isActive
                  ? "bg-[#000080] text-white"
                  : "text-black hover:bg-[#000080] hover:text-white active:bg-[#000080] active:text-white",
              ].join(" ")}
            >
              <span className="underline">{firstChar}</span>
              {rest}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-2 pr-1 shrink-0">
        <ThemeSwitcher />
        <Suspense fallback={null}>
          <LocaleSwitcher />
        </Suspense>
      </div>
    </nav>
  );
}
