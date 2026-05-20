// Phase 2 Step 12 — <LocaleSwitcher /> dropdown (D-099 §2.5 LD-3).
//
// Switches locale via `router.replace(pathname, {locale})` from next-intl so
// the active route stays the same and only the [locale] prefix changes
// (/ja/chat → /zh/chat). useSearchParams() preserves the query string
// (?qid=, ?term=) across the switch.
//
// Renders as a native <select> for a11y + zero-CSS dropdown styling work; the
// learning-tool audience is small and a richer combobox is Step 14 polish.
//
// Session 46 Step 14 a11y polish:
//   - Replaced focus:border-black/40 (2.85:1, fails 1.4.11) with uniform
//     focus-visible ring (LD-4) on the <select> control.

"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type ChangeEvent, useTransition } from "react";

import { routing, type AppLocale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher(): React.ReactElement {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tLocale = useTranslations("Locale");
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextLocale = event.target.value as AppLocale;
    if (nextLocale === currentLocale) return;
    const qs = searchParams.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.replace(target, { locale: nextLocale });
    });
  };

  return (
    <label className="flex items-center gap-1.5 text-xs sm:text-sm text-black/75 dark:text-white/75">
      <span className="sr-only">{tLocale("switcherLabel")}</span>
      <span aria-hidden="true">🌐</span>
      <select
        value={currentLocale}
        onChange={handleChange}
        disabled={isPending}
        aria-label={tLocale("switcherLabel")}
        className="bg-transparent border border-black/[.18] dark:border-white/[.22] rounded-md px-1.5 py-1 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white disabled:opacity-60"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {tLocale(l)}
          </option>
        ))}
      </select>
    </label>
  );
}
