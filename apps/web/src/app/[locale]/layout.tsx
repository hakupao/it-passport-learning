// Phase 2 Step 12 — [locale] segment layout (D-099 §2.5 LD-7).
// Stage 7 Task 7 (D-189 §3.4) — wraps children in the single server-rendered
// AppShell (replaces Stage 10's ShellProvider + three theme shells). No cookies
// are read here: the layout must stay static.
//
// Owns the <html> + <body> + NextIntlClientProvider chain so client components
// nested under /ja /zh /en have a locale context. The root app/layout.tsx is
// a pass-through; [locale]/layout.tsx is the effective root.
//
// Static rendering enabled via setRequestLocale per next-intl docs — without
// this the build would degrade to dynamic rendering for any RSC that calls
// useTranslations(), losing the static optimization of the static pages (every page under
// /[locale] is prerendered, D-217 H1-4 / H1-5, the two detail families included per D-223).

import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app/AppShell";
import { routing } from "@/i18n/routing";
import { SITE_ORIGIN } from "@/lib/seo/canonical";

import "../../fonts/fonts.css";
import "../globals.css";

// D-189 §3.2: BIZ UDPGothic site-wide; Noto Sans SC covers the simplified-Chinese glyphs BIZ UD
// lacks. Self-hosted since D-217 H1-5 (src/fonts/fonts.css: Google's unicode-range slices, no
// preload, --font-biz / --font-sc on :root) so the export build fetches nothing.

// D-220: Cloudflare Web Analytics beacon, only when the build has a site token (none → nothing is
// emitted, and the CSP in _headers allows no analytics host either; lib/export/headers.ts).
const CF_BEACON_TOKEN = process.env.CF_WEB_ANALYTICS_TOKEN?.trim() || null;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "ITパスポート 過去問ノート",
  description:
    "Trilingual (jp/zh/en) study companion for the Japanese IT Passport exam — α private build.",
};

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
        {CF_BEACON_TOKEN ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
          />
        ) : null}
      </body>
    </html>
  );
}
