// Phase 2 Step 12 — /[locale]/glossary route (moved from /glossary).
//
// Server component loading the 908 GlossarySummary[] from the corpus glossary
// + hydrating the client <GlossaryList />. Metadata localized.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemedPage } from "@/components/shells/ThemedPage";
import { getDataSource, warmUp } from "@/lib/data";
import type { ChapterRef } from "@/lib/data/types";
import {
  listGlossarySummaries,
  type GlossarySummary,
} from "@/lib/glossary/glossaryScope";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GlossaryList" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

async function loadGlossaryData(): Promise<{ summaries: GlossarySummary[]; chapters: ChapterRef[] }> {
  await warmUp();
  const ds = getDataSource();
  const [glossary, idx] = await Promise.all([ds.loadGlossary(), ds.loadIndex()]);
  const summaries = listGlossarySummaries(glossary);
  const chapters: ChapterRef[] = idx.chapters ?? [];
  return { summaries, chapters };
}

export default async function GlossaryPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { summaries, chapters } = await loadGlossaryData();
  return <ThemedPage page="glossary" props={{ summaries, chapters }} />;
}
