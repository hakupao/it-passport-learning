// Phase 3 Step 1 — /[locale]/book/chapter/[nn] route (D-101 §2.2).
//
// Server component:
//   1. Parses NN segment via parseChapterNn(); 404 on malformed/out-of-range.
//   2. Loads the chapter's pages eagerly through DataSource.loadChapter().
//   3. Projects ChapterSummary + sibling NN's for prev/next nav.
//   4. Hydrates the server-rendered <ChapterReader /> shell.
//
// Step 2 will overlay 章末固定区 + selection toolbar; Step 3 will add
// progressStore "我看完了" gate + scroll-restore. This file's contract
// stays the same across all three steps.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChapterReader } from "@/components/ChapterReader";
import {
  buildChapterSummary,
  chapterIdToNn,
  getChapterSiblings,
  parseChapterNn,
  type AppLocale,
} from "@/lib/book/chapterScope";
import { getDataSource, warmUp } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; nn: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, nn } = await params;
  const chapterId = parseChapterNn(nn);
  if (!chapterId) {
    return { title: "Not found" };
  }
  await warmUp();
  const ds = getDataSource();
  const index = await ds.loadIndex();
  const ref = index.chapters.find((c) => c.chapter_id === chapterId);
  if (!ref) return { title: "Not found" };
  const summary = buildChapterSummary(ref, locale as AppLocale, index);
  const t = await getTranslations({ locale, namespace: "Book" });
  return {
    title: t("chapterTitle", { nn: summary.nn, title: summary.title }),
    description: t("pageRange", {
      first: summary.firstPage,
      last: summary.lastPage,
    }),
  };
}

export default async function ChapterPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale, nn } = await params;
  setRequestLocale(locale);

  const chapterId = parseChapterNn(nn);
  if (!chapterId) notFound();

  await warmUp();
  const ds = getDataSource();
  const index = await ds.loadIndex();
  const ref = index.chapters.find((c) => c.chapter_id === chapterId);
  if (!ref) notFound();

  const summary = buildChapterSummary(ref, locale as AppLocale, index);
  const pages = await ds.loadChapter(chapterId);
  const siblings = getChapterSiblings(chapterIdToNn(chapterId), index);

  return <ChapterReader summary={summary} pages={pages} siblings={siblings} />;
}
