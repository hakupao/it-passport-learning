// Phase 2 Step 12 — /[locale]/quiz route (moved from /quiz under [locale]).
//
// Server component loading the 254 QuizSummary[] from corpus + hydrating the
// client <QuizList />. Metadata localized via getTranslations.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThemedPage } from "@/components/shells/ThemedPage";
import { getDataSource, warmUp } from "@/lib/data";
import { buildQuizSummary, type QuizSummary } from "@/lib/quiz/quizScope";
import type { ChapterRef } from "@/lib/data/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "QuizList" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

async function loadQuizData(): Promise<{ summaries: QuizSummary[]; chapters: ChapterRef[] }> {
  await warmUp();
  const ds = getDataSource();
  const idx = await ds.loadIndex();

  const chapters: ChapterRef[] = idx.chapters ?? [];

  const refs = Object.entries(idx.entity_by_id)
    .filter(([, ref]) => ref.type === "question")
    .map(([questionId, ref]) => ({
      questionId,
      page: ref.page,
      entityIndex: ref.entity_index,
    }))
    .sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      return a.entityIndex - b.entityIndex;
    });

  const uniquePages = Array.from(new Set(refs.map((r) => r.page)));
  const pageEntries = await Promise.all(
    uniquePages.map(async (p) => [p, await ds.loadPage(p)] as const),
  );
  const pageById = new Map(pageEntries);

  const summaries: QuizSummary[] = [];
  for (const ref of refs) {
    const page = pageById.get(ref.page);
    if (!page) continue;
    const summary = buildQuizSummary(ref.questionId, page, ref.entityIndex);
    if (summary) summaries.push(summary);
  }
  return { summaries, chapters };
}

export default async function QuizPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { summaries, chapters } = await loadQuizData();
  return <ThemedPage page="quiz" props={{ summaries, chapters }} />;
}
