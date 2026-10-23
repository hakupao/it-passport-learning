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
// useTranslations(), losing the static optimization on /[locale]/page.tsx.

import type { Metadata, Viewport } from "next";
import { BIZ_UDPGothic, Noto_Sans_SC } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AppShell } from "@/components/app/AppShell";
import { routing } from "@/i18n/routing";

import "../globals.css";

// D-189 §3.2: BIZ UDPGothic site-wide; Noto Sans SC covers the simplified-Chinese
// glyphs BIZ UD lacks. CJK files are large and Google serves them in unicode-range
// slices, so no preload (preload: false also lifts the subsets requirement).
// The .variable classes go on <html>: Tailwind resolves --font-sans and
// --default-font-family on :root, so --font-biz / --font-sc must exist there.
const bizUDPGothic = BIZ_UDPGothic({
  weight: ["400", "700"],
  variable: "--font-biz",
  display: "swap",
  preload: false,
});

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "700"],
  variable: "--font-sc",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "IT パスポート 三語学習",
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
    <html lang={locale} className={`${bizUDPGothic.variable} ${notoSansSC.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <AppShell>{children}</AppShell>
          <Analytics />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
