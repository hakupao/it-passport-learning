"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TermPopover } from "@/components/TermPopover";
import { useGlossaryState } from "@/hooks/useGlossaryState";
import { groupGlossaryByDomain, useCollapsible } from "@/hooks/useGrouping";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";
import type { ChapterRef } from "@/lib/data/types";

interface RetroGlossaryProps {
  summaries: GlossarySummary[];
  chapters: ChapterRef[];
}

function filterSummaries(summaries: GlossarySummary[], query: string): GlossarySummary[] {
  if (!query) return summaries;
  const q = query.toLowerCase();
  return summaries.filter(
    (s) =>
      s.surfaceJp.toLowerCase().includes(q) ||
      s.surfaceZh.toLowerCase().includes(q) ||
      s.surfaceEn.toLowerCase().includes(q) ||
      (s.kanaReading && s.kanaReading.toLowerCase().includes(q)),
  );
}

export function RetroGlossary({ summaries, chapters }: RetroGlossaryProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const tTerm = useTranslations("TermPopover");
  const { activeSummary, handleSelect, handleClose } = useGlossaryState(summaries);
  const [query, setQuery] = useState("");
  const filtered = filterSummaries(summaries, query);
  const domains = groupGlossaryByDomain(filtered, chapters);
  const { isOpen, toggle } = useCollapsible([]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] p-2 gap-2 text-black">
      {/* Header */}
      <div className="border-b-2 border-[#808080] pb-1">
        <h1 className="text-sm font-bold">{t("title")}</h1>
        <p className="text-[10px] text-[#808080]">{t("subtitle")}</p>
      </div>

      {/* Search bar */}
      <div className="border-2 border-inset-retro bg-white px-1 py-0.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full text-[11px] bg-transparent outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 border-2 border-inset-retro bg-white p-2">
          <p className="text-center text-[11px] text-[#808080] py-8">
            {query ? t("searchNoResults", { query }) : t("emptyHint")}
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {domains.map((domain) => {
            const domainTermCount = domain.chapters.reduce((sum, ch) => sum + ch.items.length, 0);
            return (
              <div key={domain.domain} className="border-2 border-outset-retro bg-[#c0c0c0]">
                {/* Domain header */}
                <button
                  type="button"
                  onClick={() => toggle(domain.domain)}
                  className="w-full flex items-center justify-between px-2 py-1 bg-gradient-to-r from-[#000080] to-[#1084d0] text-white text-[11px] font-bold"
                >
                  <span>{t(`domain_${domain.domain}`)}</span>
                  <span className="text-[10px] font-normal">
                    {t("termCount", { count: domainTermCount })}
                    {" "}
                    {isOpen(domain.domain) ? "▼" : "►"}
                  </span>
                </button>

                {isOpen(domain.domain) && (
                  <div className="p-1 space-y-2">
                    {domain.chapters.map((ch) => (
                      <div key={ch.chapterId}>
                        <div className="text-[10px] font-bold text-[#000080] px-1 py-0.5 border-b border-[#808080]">
                          {ch.label}
                          <span className="font-normal text-[#808080] ml-1">({t("termCount", { count: ch.items.length })})</span>
                        </div>
                        <div className="bg-white border-2 border-inset-retro mt-0.5">
                          <table className="w-full text-[11px]">
                            <tbody>
                              {ch.items.map((s, i) => (
                                <tr
                                  key={s.id}
                                  className={`${i % 2 === 0 ? "bg-white" : "bg-[#f0f0f0]"} hover:bg-[#000080] hover:text-white group`}
                                >
                                  <td className="px-1 py-0.5 font-bold" lang="ja">{s.surfaceJp}</td>
                                  <td className="px-1 py-0.5 text-[#808080] group-hover:text-[#aaa]" lang="zh">{s.surfaceZh}</td>
                                  <td className="px-1 py-0.5 text-[#808080] group-hover:text-[#aaa]" lang="en">{s.surfaceEn}</td>
                                  <td className="px-1 py-0.5 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleSelect(s.surfaceJp)}
                                      className="border border-outset-retro bg-[#c0c0c0] text-black group-hover:text-black px-1.5 text-[10px] active:border-inset-retro"
                                    >
                                      {tCommon("explain")}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
