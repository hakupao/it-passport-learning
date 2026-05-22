// Phase 3 Step 1 — book/chapterScope: pure functions backing the
// /[locale]/book index + /[locale]/book/chapter/[nn] reader.
//
// D-101 §2.2 reading unit = Chapter (16 章 per index.v2.json chapters[]).
// LD-1: NavTabs keeps 4 tabs, Book is the visual 主体.
// Per CLAUDE.md "Phase/stage signaling": 实施阶段 entered Session 50.

import type { ChapterRef, IndexV2, Page } from "@/lib/data/types";

export type AppLocale = "ja" | "zh" | "en";

export interface ChapterSummary {
  /** Two-digit chapter number, derived from ChapterRef.chapter_id ("ch00" → "00"). */
  nn: string;
  /** Raw chapter_id ("ch00" .. "ch15"). */
  chapterId: string;
  /** Localized title (jp/zh/en). Falls back to jp if locale missing. */
  title: string;
  firstPage: number;
  lastPage: number;
  /** Inclusive count of pages this chapter spans in the corpus. */
  pageCount: number;
}

/**
 * Project the trilingual title shape onto the requested locale, with a
 * jp fallback. Mirrors the convention used by GlossarySummary.
 */
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

/**
 * Convert a `ChapterRef` from index.v2.json into a `ChapterSummary` ready
 * for client rendering. `nn` is the zero-padded chapter ordinal (used in
 * URLs `/[locale]/book/chapter/NN`).
 */
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

/** All 16 chapters as ChapterSummary[], stable in source order. */
export function buildAllChapterSummaries(
  index: IndexV2,
  locale: AppLocale,
): ChapterSummary[] {
  return index.chapters.map((c) => buildChapterSummary(c, locale, index));
}

/**
 * Parse a `[nn]` route segment (e.g. "00", "15") and resolve to the
 * canonical chapter_id ("ch00" .. "ch15"). Returns null on malformed input
 * or out-of-range numbers — callers should 404 on null.
 */
export function parseChapterNn(nn: string): string | null {
  if (!/^\d{2}$/.test(nn)) return null;
  const n = Number.parseInt(nn, 10);
  if (n < 0 || n > 15) return null;
  return `ch${nn}`;
}

/** Inverse of parseChapterNn — "ch07" → "07". */
export function chapterIdToNn(chapterId: string): string {
  const m = /^ch(\d{2})$/.exec(chapterId);
  if (!m || m[1] === undefined) {
    throw new Error(`chapterIdToNn: unexpected chapter_id "${chapterId}"`);
  }
  return m[1];
}

/**
 * Resolve siblings: previous + next chapter NN for the prev/next nav in
 * <ChapterReader />. Returns null for either end.
 */
export function getChapterSiblings(
  nn: string,
  index: IndexV2,
): { prevNn: string | null; nextNn: string | null } {
  const ordered = [...index.chapters].sort(
    (a, b) => a.first_page - b.first_page,
  );
  const idx = ordered.findIndex((c) => chapterIdToNn(c.chapter_id) === nn);
  if (idx === -1) return { prevNn: null, nextNn: null };
  const prevRef = idx > 0 ? ordered[idx - 1] : undefined;
  const nextRef = idx < ordered.length - 1 ? ordered[idx + 1] : undefined;
  return {
    prevNn: prevRef ? chapterIdToNn(prevRef.chapter_id) : null,
    nextNn: nextRef ? chapterIdToNn(nextRef.chapter_id) : null,
  };
}

/**
 * Find the chapter that contains a given page number, returning null if
 * no chapter covers it (e.g. front-matter pages between chapter ranges).
 */
export function findChapterByPage(
  page: number,
  index: IndexV2,
): ChapterRef | null {
  return (
    index.chapters.find(
      (c) => page >= c.first_page && page <= c.last_page,
    ) ?? null
  );
}

/** Render-friendly description of an entity inside a page. */
export interface RenderEntity {
  type: string;
  /** ja text for the section heading or figure caption. */
  textJp: string | null;
  sectionNumber: string | null;
  imageRef: string | null;
}

export function projectRenderEntities(page: Page): RenderEntity[] {
  return page.entities.map((e) => {
    const titleJp =
      (e.title && typeof e.title === "object" && (e.title as { jp?: string }).jp) ||
      null;
    const captionJp =
      (e.caption &&
        typeof e.caption === "object" &&
        (e.caption as { jp?: string }).jp) ||
      null;
    const imageRef =
      typeof e.image_ref === "string" ? e.image_ref : null;
    return {
      type: typeof e.type === "string" ? e.type : "unknown",
      textJp: titleJp ?? captionJp ?? null,
      sectionNumber: e.section_number ?? null,
      imageRef,
    } satisfies RenderEntity;
  });
}
