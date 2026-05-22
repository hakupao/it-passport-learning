// Phase 3 Step 1 — /[locale]/book route (D-101 §2.1 canonical trunk).
//
// Server component loading the 16 ChapterRefs from index.v2.json,
// projecting them to ChapterSummary[] for the active locale, and
// hydrating the (server-rendered) <BookIndex /> TOC.
//
// Same dynamic + Metadata pattern as Phase 2's /chat /quiz /glossary
// routes for consistency.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BookIndex } from "@/components/BookIndex";
import {
  buildAllChapterSummaries,
  type AppLocale,
  type ChapterSummary,
} from "@/lib/book/chapterScope";
import { getDataSource, warmUp } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Book" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

async function loadChapterSummaries(
  locale: AppLocale,
): Promise<ChapterSummary[]> {
  await warmUp();
  const ds = getDataSource();
  const index = await ds.loadIndex();
  return buildAllChapterSummaries(index, locale);
}

export default async function BookIndexPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const chapters = await loadChapterSummaries(locale as AppLocale);
  return <BookIndex chapters={chapters} />;
}
