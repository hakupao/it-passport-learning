import type { ChapterRef, IndexV2 } from "./types";

export type AppLocale = "ja" | "zh" | "en";

export interface ChapterSummary {
  nn: string;
  chapterId: string;
  title: string;
  firstPage: number;
  lastPage: number;
  pageCount: number;
}

export function pickTitle(ref: ChapterRef, locale: AppLocale): string {
  switch (locale) {
    case "zh":
      return ref.title_zh || ref.title_jp;
    case "en":
      return ref.title_en || ref.title_jp;
    case "ja":
    default:
      return ref.title_jp;
  }
}

export function chapterIdToNn(chapterId: string): string {
  const m = /^ch(\d{2})$/.exec(chapterId);
  if (!m || m[1] === undefined) {
    throw new Error(`chapterIdToNn: unexpected chapter_id "${chapterId}"`);
  }
  return m[1];
}

export function buildChapterSummary(
  ref: ChapterRef,
  locale: AppLocale,
  index: IndexV2,
): ChapterSummary {
  const nn = chapterIdToNn(ref.chapter_id);
  const pageCount = index.pages.filter(
    (p) => p.page >= ref.first_page && p.page <= ref.last_page,
  ).length;
  return {
    nn,
    chapterId: ref.chapter_id,
    title: pickTitle(ref, locale),
    firstPage: ref.first_page,
    lastPage: ref.last_page,
    pageCount,
  };
}

export function buildAllChapterSummaries(
  index: IndexV2,
  locale: AppLocale,
): ChapterSummary[] {
  return index.chapters.map((c) => buildChapterSummary(c, locale, index));
}
