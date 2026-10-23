// UI-language switch, rendered as text links `日 / 中 / EN` (Stage 7 Task 7,
// D-189 §3.4; was a <select> dropdown, D-099 §2.5 LD-3).
//
// Same mechanics as before: a `replace` navigation to the same route in the other
// locale (/ja/glossary → /zh/glossary) with the query string kept
// (/ja/quiz?mode=exam&id=… → /zh/quiz?mode=exam&id=…). next-intl's <Link locale>
// does the locale-prefix rewrite; the links also work without JS.
//
// useSearchParams() needs a Suspense boundary on static pages: render
// <LocaleSwitcher /> inside <Suspense fallback={<LocaleSwitcherLinks />}> — the
// fallback is the same links without the query string.

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Fragment } from "react";

import styles from "@/components/app/app.module.css";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const SHORT_LABEL: Record<AppLocale, string> = { ja: "日", zh: "中", en: "EN" };

export function LocaleSwitcher(): React.ReactElement {
  const searchParams = useSearchParams();
  return <LocaleSwitcherLinks query={searchParams.toString()} />;
}

export function LocaleSwitcherLinks({ query = "" }: { query?: string }): React.ReactElement {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const tLocale = useTranslations("Locale");
  const target = query ? `${pathname}?${query}` : pathname;

  return (
    <div role="group" aria-label={tLocale("switcherLabel")} className={styles.locales}>
      {routing.locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {l === currentLocale ? (
            <strong aria-current="true" lang={l} className={styles.localeCurrent}>
              {SHORT_LABEL[l]}
            </strong>
          ) : (
            <Link
              href={target}
              locale={l}
              replace
              lang={l}
              hrefLang={l}
              aria-label={tLocale(l)}
              className={styles.localeLink}
            >
              {SHORT_LABEL[l]}
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
