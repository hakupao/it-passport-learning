import { useState } from "react";
import type { QuizSummary } from "@/lib/quiz/quizScope";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

export interface QuizGroup {
  label: string;
  chapterId: string;
  items: QuizSummary[];
}

export interface GlossaryGroup {
  letter: string;
  items: GlossarySummary[];
}

export interface GlossaryChapterGroup {
  chapterId: string;
  label: string;
  items: GlossarySummary[];
}

export interface GlossaryDomainGroup {
  domain: "strategy" | "management" | "technology";
  chapters: GlossaryChapterGroup[];
}

type ChapterInfo = { chapter_id: string; title_jp: string; first_page: number; last_page: number };

/**
 * Group quiz summaries by chapter based on page ranges.
 * chapters is an array of { chapter_id, title_jp, first_page, last_page }.
 */
export function groupQuizByChapter(
  summaries: QuizSummary[],
  chapters: Array<{ chapter_id: string; title_jp: string; first_page: number; last_page: number }>,
): QuizGroup[] {
  const groups: QuizGroup[] = [];
  for (const ch of chapters) {
    const items = summaries.filter(
      (s) => s.page >= ch.first_page && s.page <= ch.last_page,
    );
    if (items.length > 0) {
      const nn = ch.chapter_id.replace("ch", "");
      groups.push({
        label: `Ch.${nn} ${ch.title_jp}`,
        chapterId: ch.chapter_id,
        items,
      });
    }
  }
  return groups;
}

const DOMAIN_CHAPTERS: Record<GlossaryDomainGroup["domain"], string[]> = {
  strategy: ["ch00", "ch01", "ch02", "ch03", "ch04", "ch05"],
  management: ["ch06", "ch07", "ch08"],
  technology: ["ch09", "ch10", "ch11", "ch12", "ch13", "ch14", "ch15"],
};

export function groupGlossaryByDomain(
  summaries: GlossarySummary[],
  chapters: ChapterInfo[],
): GlossaryDomainGroup[] {
  const chapterGroups = groupGlossaryByChapterInternal(summaries, chapters);
  const domains: GlossaryDomainGroup[] = [];
  for (const [domain, chapterIds] of Object.entries(DOMAIN_CHAPTERS) as Array<[GlossaryDomainGroup["domain"], string[]]>) {
    const matched = chapterGroups.filter((g) => chapterIds.includes(g.chapterId));
    if (matched.length > 0) {
      domains.push({ domain, chapters: matched });
    }
  }
  return domains;
}

function groupGlossaryByChapterInternal(
  summaries: GlossarySummary[],
  chapters: ChapterInfo[],
): GlossaryChapterGroup[] {
  const groups: GlossaryChapterGroup[] = [];
  for (const ch of chapters) {
    const items = summaries
      .filter((s) => s.firstPage >= ch.first_page && s.firstPage <= ch.last_page)
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount);
    if (items.length > 0) {
      const nn = ch.chapter_id.replace("ch", "");
      groups.push({
        chapterId: ch.chapter_id,
        label: `Ch.${nn} ${ch.title_jp}`,
        items,
      });
    }
  }
  return groups;
}

/**
 * Group glossary summaries by first kana character (or first char of surfaceJp).
 * Uses the kanaReading if available, otherwise surfaceJp.
 */
export function groupGlossaryByLetter(summaries: GlossarySummary[]): GlossaryGroup[] {
  const map = new Map<string, GlossarySummary[]>();
  for (const s of summaries) {
    const source = s.kanaReading ?? s.surfaceJp;
    const firstChar = source.charAt(0);
    // Map to kana row (あ行, か行, etc.) or keep as-is for Latin/other
    const letter = getKanaRow(firstChar) ?? firstChar.toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(s);
  }
  return Array.from(map.entries()).map(([letter, items]) => ({ letter, items }));
}

function getKanaRow(char: string): string | null {
  const rows: [string, string][] = [
    ["あ", "あいうえお"],
    ["か", "かきくけこがぎぐげご"],
    ["さ", "さしすせそざじずぜぞ"],
    ["た", "たちつてとだぢづでど"],
    ["な", "なにぬねの"],
    ["は", "はひふへほばびぶべぼぱぴぷぺぽ"],
    ["ま", "まみむめも"],
    ["や", "やゆよ"],
    ["ら", "らりるれろ"],
    ["わ", "わをん"],
  ];
  for (const [label, chars] of rows) {
    if (chars.includes(char)) return label;
  }
  // Check katakana by converting to hiragana
  const code = char.charCodeAt(0);
  if (code >= 0x30a0 && code <= 0x30ff) {
    const hiragana = String.fromCharCode(code - 0x60);
    for (const [label, chars] of rows) {
      if (chars.includes(hiragana)) return label;
    }
  }
  return null;
}

/**
 * Hook for collapsible groups.
 */
export function useCollapsible(initialOpen: string[] = []) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(initialOpen));

  const toggle = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isOpen = (id: string) => openGroups.has(id);

  return { isOpen, toggle };
}
