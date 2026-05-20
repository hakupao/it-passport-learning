// Phase 2 Step 12 — next-intl routing config (D-099 §2.2 i18n stack lock).
//
// Session 44 4Q-locked design:
//   Q2=a next-intl (Next.js 15 official-partner; App Router + SSR friendly).
//   Q3=a ja default + path-based /ja /zh /en routing.
//
// localePrefix = 'always' makes every locale explicitly prefixed (/ja, /zh,
// /en) including the default ja. Rejected alternatives:
//   - 'as-needed': default ja unprefixed (/) — cleaner URLs but blurs the
//     locale boundary and breaks the canonical-URL property we want for
//     Phase 3 SEO; user explicit choice in Q3=a is "ja default + /ja path".
//   - cookie-based: no path discrimination — search engines can't see zh/en
//     versions; locale-switch state not shareable via URL; rejected per Q3=a.
//   - ?lang= query: clashes with ?qid= / ?term= conventions already in use.

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "zh", "en"] as const,
  defaultLocale: "ja",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
