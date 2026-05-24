// Phase 4 Module C — /[locale]/tutor route page (D-106 §2.1 standalone route).

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemedPage } from "@/components/shells/ThemedPage";
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
  const t = await getTranslations({ locale, namespace: "Tutor" });
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

export default async function TutorPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const chapters = await loadChapterSummaries(locale as AppLocale);
  return <ThemedPage page="tutor" props={{ chapters }} />;
}
