"use client";

import { useTranslations } from "next-intl";
import { TermPopover } from "@/components/TermPopover";
import { useGlossaryState } from "@/hooks/useGlossaryState";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

interface GamifiedGlossaryProps {
  summaries: GlossarySummary[];
}

export function GamifiedGlossary({ summaries }: GamifiedGlossaryProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const tTerm = useTranslations("TermPopover");
  const { activeSummary, handleSelect, handleClose } = useGlossaryState(summaries);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-4">
      <header className="border-b border-white/[.08] pb-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          {t("subtitle")}
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-center text-sm text-white/40 py-12">
          {t("emptyHint")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {summaries.map((s) => (
            <li
              key={s.id}
              className="border border-white/[.08] rounded-xl p-3 bg-white/[.03] flex flex-col gap-1.5 hover:border-[#e94560]/50 transition-colors"
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
                className="mt-1 self-start text-[11px] rounded-md bg-[#e94560] text-white px-2.5 py-1 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
              >
                {tCommon("explain")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
