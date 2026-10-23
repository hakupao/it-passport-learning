// Stage 7 Phase 1 Task 13 (DESIGN §4, D-190 §0-17) — /[locale]/quiz: the old quiz list / set views
// are gone; this route stays as a static client redirect so bookmarks and old in-app links keep
// working. The target depends on the `#<question_id>` fragment, which never reaches the server, so
// the page reads no searchParams / cookies / data (prerendered per locale) and LegacyQuizRedirect
// computes legacyQuizTarget(location.search, location.hash) in the browser.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegacyQuizRedirect } from "@/components/practice/LegacyQuizRedirect";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Practice" });
  return { title: t("browseTitle"), robots: { index: false } };
}

export default async function LegacyQuizPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegacyQuizRedirect locale={locale} />;
}
