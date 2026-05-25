"use client";

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

export function RetroMenuBar(): React.ReactElement {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  return (
    <nav className="bg-[#c0c0c0] border-b border-[#808080] flex items-center justify-between px-1">
      <div className="flex items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isDisabled = "disabled" in item && item.disabled;
          const label = tNav(item.key as "chat" | "quiz" | "glossary" | "tutor" | "book");
          const firstChar = label.charAt(0);
          const rest = label.slice(1);

          if (isDisabled) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                className="px-3 py-0.5 text-xs relative text-[#808080] cursor-not-allowed select-none"
              >
                <span className="underline">{firstChar}</span>
                {rest} 🔒
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "px-3 py-0.5 text-xs relative",
                isActive
                  ? "bg-[#000080] text-white"
                  : "text-black hover:bg-[#000080] hover:text-white",
              ].join(" ")}
            >
              <span className="underline">{firstChar}</span>
              {rest}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-2 pr-1">
        <ThemeSwitcher />
        <Suspense fallback={null}>
          <LocaleSwitcher />
        </Suspense>
      </div>
    </nav>
  );
}
