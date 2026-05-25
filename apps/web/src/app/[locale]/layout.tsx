// Phase 2 Step 12 — [locale] segment layout (D-099 §2.5 LD-7).
// Stage 10 update — wraps children in ShellProvider; NavTabs/SkipLink
// removed (navigation is now owned by each shell chrome).
//
// Owns the <html> + <body> + NextIntlClientProvider chain so client components
// nested under /ja /zh /en have a locale context. The root app/layout.tsx is
// a pass-through; [locale]/layout.tsx is the effective root.
//
// Static rendering enabled via setRequestLocale per next-intl docs — without
// this the build would degrade to dynamic rendering for any RSC that calls
// useTranslations(), losing the static optimization on /[locale]/page.tsx.

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ShellProvider } from "@/components/shells/ShellProvider";
import { routing } from "@/i18n/routing";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
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
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ShellProvider>
            {children}
          </ShellProvider>
          <Analytics />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
