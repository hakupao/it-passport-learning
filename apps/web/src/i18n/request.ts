// Phase 2 Step 12 — next-intl getRequestConfig server config (D-099 §2.4).
//
// Pulls the locale out of the matched [locale] segment, validates it against
// routing.locales (falls back to defaultLocale 'ja' on mismatch), and loads
// the matching message catalog from apps/web/messages/<locale>.json.
//
// Message catalogs are dynamic-imported (per-locale code-splitting); on a
// cold request only the active locale's JSON is loaded.

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
