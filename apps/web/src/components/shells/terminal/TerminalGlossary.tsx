"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TermPopover } from "@/components/TermPopover";
import { useGlossaryState } from "@/hooks/useGlossaryState";
import { groupGlossaryByDomain, useCollapsible } from "@/hooks/useGrouping";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";
import type { ChapterRef } from "@/lib/data/types";

interface TerminalGlossaryProps {
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

const DOMAIN_PREFIXES = {
  strategy: "STR",
  management: "MGT",
  technology: "TEC",
} as const;

export function TerminalGlossary({ summaries, chapters }: TerminalGlossaryProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const { activeSummary, handleSelect, handleClose } = useGlossaryState(summaries);
  const [query, setQuery] = useState("");
  const filtered = filterSummaries(summaries, query);
  const domains = groupGlossaryByDomain(filtered, chapters);
  const { isOpen, toggle } = useCollapsible(domains.map((d) => d.domain));

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 gap-3 font-mono text-sm">
      {/* Header */}
      <div className="border-b border-[#444] pb-2">
        <div className="text-[#4ec9b0] font-semibold"># {t("title")}</div>
        <div className="text-[#555] text-xs">{t("subtitle")}</div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#6a9955]">$</span>
        <span className="text-[#569cd6]">grep</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 bg-transparent border-b border-[#444] text-[#d4d4d4] placeholder:text-[#444] outline-none py-0.5"
        />
      </div>

      {/* Domain sections */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-[#555] py-8 px-2">
            <span className="text-[#6a9955]"># </span>
            {query ? t("searchNoResults", { query }) : t("emptyHint")}
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => {
              const prefix = DOMAIN_PREFIXES[domain.domain];
              const domainTermCount = domain.chapters.reduce((sum, ch) => sum + ch.items.length, 0);
              return (
                <div key={domain.domain}>
                  {/* Domain header */}
                  <button
                    type="button"
                    onClick={() => toggle(domain.domain)}
                    className="w-full text-left py-1 px-1 hover:bg-white/[.03] transition-colors"
                  >
                    <span className="text-[#c586c0]">▸ </span>
                    <span className="text-[#4ec9b0] font-bold">[{prefix}]</span>
                    <span className="text-[#d4d4d4]"> {t(`domain_${domain.domain}`)}</span>
                    <span className="text-[#555]"> ({domainTermCount})</span>
                    <span className="text-[#555] ml-2">{isOpen(domain.domain) ? "[-]" : "[+]"}</span>
                  </button>

                  {isOpen(domain.domain) && (
                    <div className="pl-4 space-y-3 mt-1">
                      {domain.chapters.map((ch) => (
                        <div key={ch.chapterId}>
                          <div className="text-[#6a9955] text-xs py-0.5 px-1 mb-1">
                            ## {ch.label} ({ch.items.length})
                          </div>
                          <ul className="space-y-0">
                            {ch.items.map((s) => (
                              <li key={s.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelect(s.surfaceJp)}
                                  className="w-full text-left py-0.5 px-1 hover:bg-white/[.03] transition-colors group"
                                  aria-label={`${tCommon("explain")}: ${s.surfaceJp}`}
                                >
                                  <span className="text-[#555]">{prefix.toLowerCase()}:</span>
                                  <span className="text-[#ce9178]">{s.id}</span>
                                  <span className="text-[#555]">:</span>
                                  <span className="text-[#d4d4d4] group-hover:text-[#4ec9b0] transition-colors" lang="ja">
                                    {s.surfaceJp}
                                  </span>
                                  <span className="text-[#555]">{"  ("}</span>
                                  <span className="text-[#6a9955]" lang="zh">{s.surfaceZh}</span>
                                  <span className="text-[#555]"> / </span>
                                  <span className="text-[#569cd6]" lang="en">{s.surfaceEn}</span>
                                  <span className="text-[#555]">{")"}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
