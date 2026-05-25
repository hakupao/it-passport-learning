"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { TermPopover } from "@/components/TermPopover";
import { useGlossaryState } from "@/hooks/useGlossaryState";
import { groupGlossaryByLetter } from "@/hooks/useGrouping";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

interface GamifiedGlossaryProps {
  summaries: GlossarySummary[];
}

export function GamifiedGlossary({ summaries }: GamifiedGlossaryProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const tTerm = useTranslations("TermPopover");
  const { activeSummary, handleSelect, handleClose } = useGlossaryState(summaries);
  const groups = groupGlossaryByLetter(summaries);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const scrollToLetter = (letter: string) => {
    const el = sectionRefs.current.get(letter);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-5">
      <header className="border-b border-white/[.08] pb-3">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-white/50 mt-1">
          {t("subtitle")}
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-center text-sm text-white/40 py-12">
          {t("emptyHint")}
        </p>
      ) : (
        <>
          {/* Sticky alphabet jump nav */}
          <div className="sticky z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-[#0f0f1a]/90 backdrop-blur border-b border-white/[.06]" style={{ top: "var(--nav-height)" }}>
            <div className="flex flex-wrap gap-1">
              {groups.map((g) => (
                <button
                  key={g.letter}
                  type="button"
                  onClick={() => scrollToLetter(g.letter)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/[.04] hover:bg-[#e94560]/20 hover:text-[#e94560] text-white/60 transition-colors"
                >
                  {g.letter}
                </button>
              ))}
            </div>
          </div>

          {/* Letter sections */}
          <div className="space-y-8">
            {groups.map((group) => (
              <section
                key={group.letter}
                ref={(el) => {
                  if (el) sectionRefs.current.set(group.letter, el);
                  else sectionRefs.current.delete(group.letter);
                }}
              >
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#e94560] mb-3 border-b border-white/[.06] pb-1">
                  {t("rowLabel", { letter: group.letter })}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((s) => (
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
                        className="mt-1 self-start h-7 px-3 rounded-md bg-[#e94560] text-white text-[11px] font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
                      >
                        {tCommon("explain")}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
