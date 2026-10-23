// Stage 7 Task 7 (D-189 §3.4) — the one global frame that replaces the three theme
// shells (gamified / retro / terminal). Server component: no cookies, no client
// state, so [locale]/layout.tsx stays static. Only the nav (active state) and the
// language switch are client components.
//
// Layout (mockup A4-Home header): 4px ink top rule; site name left; text nav;
// `日 / 中 / EN` + 設定 on the right; 1px rule under the header; content max 1240px
// with 32px side padding. Pages keep their own <main> landmark, so the content
// frame is a plain <div> (the skip-link target).

import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { LocaleSwitcher, LocaleSwitcherLinks } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

import { AppNav } from "./AppNav";
import styles from "./app.module.css";

type Props = {
  locale: AppLocale;
  children: React.ReactNode;
};

export function AppShell({ locale, children }: Props): React.ReactElement {
  const t = useTranslations("App");

  return (
    <div className={styles.frame} data-locale={locale}>
      <a href="#main-content" className={styles.skipLink}>
        {t("skipToContent")}
      </a>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link href="/" className={styles.siteName}>
            {t("siteName")}
          </Link>
          <AppNav />
          <div className={styles.tools}>
            {/* useSearchParams needs a Suspense boundary on static pages; the
                fallback is the same links without the query string */}
            <Suspense fallback={<LocaleSwitcherLinks />}>
              <LocaleSwitcher />
            </Suspense>
            <Link href="/settings" className={styles.toolLink}>
              {t("settings")}
            </Link>
          </div>
        </div>
      </header>
      <div id="main-content" tabIndex={-1} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
