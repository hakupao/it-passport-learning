"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TermPopover } from "@/components/TermPopover";
import { useGlossaryState } from "@/hooks/useGlossaryState";
import { groupGlossaryByDomain, useCollapsible } from "@/hooks/useGrouping";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";
import type { ChapterRef } from "@/lib/data/types";

interface GamifiedGlossaryProps {
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

const DOMAIN_COLORS = {
  strategy: { accent: "#e94560", bg: "bg-[#e94560]/10", border: "border-[#e94560]/30", text: "text-[#e94560]" },
  management: { accent: "#4ecdc4", bg: "bg-[#4ecdc4]/10", border: "border-[#4ecdc4]/30", text: "text-[#4ecdc4]" },
  technology: { accent: "#569cd6", bg: "bg-[#569cd6]/10", border: "border-[#569cd6]/30", text: "text-[#569cd6]" },
} as const;

export function GamifiedGlossary({ summaries, chapters }: GamifiedGlossaryProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const tTerm = useTranslations("TermPopover");
  const { activeSummary, handleSelect, handleClose } = useGlossaryState(summaries);
  const [query, setQuery] = useState("");
  const filtered = filterSummaries(summaries, query);
  const domains = groupGlossaryByDomain(filtered, chapters);
  const { isOpen, toggle } = useCollapsible([]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-var(--nav-height,3.5rem))] max-w-5xl mx-auto p-3 sm:p-6 gap-4 sm:gap-5">
      <header className="border-b border-white/[.08] pb-3">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-white/50 mt-1">
          {t("subtitle")}
        </p>
      </header>

      {/* Search bar */}
      <div className="sticky z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-[#0f0f1a]/90 backdrop-blur border-b border-white/[.06]" style={{ top: "var(--nav-height)" }}>
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full h-10 sm:h-9 px-4 sm:px-3 rounded-xl sm:rounded-lg bg-white/[.06] border border-white/[.1] text-base sm:text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-[#e94560]/50 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-white/40 py-12">
          {query ? t("searchNoResults", { query }) : t("emptyHint")}
        </p>
      ) : (
        <div className="space-y-6">
          {domains.map((domain) => {
            const colors = DOMAIN_COLORS[domain.domain];
            const domainTermCount = domain.chapters.reduce((sum, ch) => sum + ch.items.length, 0);
            return (
              <section key={domain.domain}>
                {/* Domain header */}
                <button
                  type="button"
                  onClick={() => toggle(domain.domain)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg ${colors.bg} ${colors.border} border transition-colors hover:opacity-90`}
                >
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {t(`domain_${domain.domain}`)}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {t("termCount", { count: domainTermCount })}
                    {" "}
                    {isOpen(domain.domain) ? "▾" : "▸"}
                  </span>
                </button>

                {isOpen(domain.domain) && (
                  <div className="mt-3 space-y-5 pl-2">
                    {domain.chapters.map((ch) => (
                      <div key={ch.chapterId}>
                        <h3 className="text-xs font-medium text-white/50 mb-2 flex items-baseline gap-2">
                          <span>{ch.label}</span>
                          <span className="text-[10px] text-white/30">{t("termCount", { count: ch.items.length })}</span>
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {ch.items.map((s) => (
                            <li
                              key={s.id}
                              className="border border-white/[.08] rounded-xl p-4 bg-white/[.03] flex flex-col gap-1.5 hover:border-[#e94560]/50 transition-colors"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-sm font-medium tracking-tight text-white/90" lang="ja">
                                  {s.surfaceJp}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 shrink-0">
                                  {t("pageBadge", { page: s.firstPage })}
                                </span>
                              </div>

                              {s.kanaReading && (
                                <p className="text-[11px] text-white/50" lang="ja">
                                  {tTerm("readingPrefix")}
                                  {s.kanaReading}
                                </p>
                              )}

                              <p className="text-[11px] text-white/50 line-clamp-1">
                                <span lang="zh">{s.surfaceZh}</span>
                                {" · "}
                                <span lang="en">{s.surfaceEn}</span>
                              </p>

                              <button
                                type="button"
                                onClick={() => handleSelect(s.surfaceJp)}
                                className="mt-1 self-start min-h-[32px] h-8 px-3 rounded-md bg-[#e94560] text-white text-[11px] font-medium hover:opacity-90 active:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
                              >
                                {tCommon("explain")}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-20 w-10 h-10 rounded-full bg-[#e94560] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label={tCommon("backToTop")}
      >
        ↑
      </button>

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
