// Stage 7 Phase 1 Task 10 (D-189 §4) — /[locale]/practice/browse: browse by field / topic and by exam
// year (BrowseList), the successor of the old /quiz landing. Reads only quiz_index.json and needs no
// learning record (no provider, no cookies), so it stays static.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BrowseList, browseModel } from "@/components/practice/BrowseList";
import { loadQuizIndex } from "@/lib/quiz/quizReader";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Practice" });
  return { title: t("browseTitle") };
}

export default async function BrowsePage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const index = await loadQuizIndex();
  return <BrowseList {...browseModel(index, locale)} />;
}
