// Stage 7 Task 7 (D-189 §3.4, plan item 22) — the top nav of the single AppShell.
// Client component only for the active state (usePathname). Phase 1 items =
// 今日 / 练习 / 教科书 / 辞典; Phase 2 adds 「记录」 (§0-10). 「模拟考试」 is not a nav item:
// it is linked from 今日 and the practice setup page.

"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import styles from "./app.module.css";

export const APP_NAV = [
  { href: "/", key: "today" },
  { href: "/practice", key: "practice" },
  { href: "/textbook", key: "textbook" },
  { href: "/glossary", key: "glossary" },
  { href: "/record", key: "record" },
] as const;

const LOCALE_PREFIX = new RegExp(`^/(?:${routing.locales.join("|")})(?=/|$)`);

/**
 * Whether the nav item `href` is the current section. Accepts next-intl's
 * locale-less pathname (`/practice/mistakes`) as well as a locale-prefixed one
 * (`/ja/practice/mistakes`). `/` only matches the home page; any other href
 * matches itself and everything below it.
 */
export function isNavActive(pathname: string, href: string): boolean {
  const path = pathname.replace(LOCALE_PREFIX, "").replace(/\/+$/, "") || "/";
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

export function AppNav(): React.ReactElement {
  const pathname = usePathname();
  const t = useTranslations("App");

  return (
    <nav aria-label={t("navLabel")} className={styles.nav}>
      {APP_NAV.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
          >
            {t(`nav.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
