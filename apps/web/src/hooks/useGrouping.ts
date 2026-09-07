import { useState } from "react";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

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
