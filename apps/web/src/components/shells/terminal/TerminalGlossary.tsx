"use client";

import { useTranslations } from "next-intl";
import { TermPopover } from "@/components/TermPopover";
import { useGlossaryState } from "@/hooks/useGlossaryState";
import { groupGlossaryByLetter } from "@/hooks/useGrouping";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

interface TerminalGlossaryProps {
  summaries: GlossarySummary[];
}

export function TerminalGlossary({ summaries }: TerminalGlossaryProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const groups = groupGlossaryByLetter(summaries);
  const { activeSummary, handleSelect, handleClose } = useGlossaryState(summaries);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 gap-3 font-mono text-sm">
      {/* Header */}
      <div className="border-b border-[#444] pb-2">
        <div className="text-[#4ec9b0] font-semibold"># {t("title")}</div>
        <div className="text-[#555] text-xs">{t("subtitle")}</div>
      </div>

      {/* grep-style output grouped by kana row */}
      <div className="flex-1 overflow-y-auto">
        {summaries.length === 0 ? (
          <div className="text-[#555] py-8 px-2">
            <span className="text-[#6a9955]"># </span>
            {t("emptyHint")}
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.letter}>
                {/* Section heading */}
                <div className="text-[#6a9955] text-xs py-0.5 px-1 mb-1">
                  ## {group.letter}行 ({group.items.length})
                </div>
                <ul className="space-y-0">
                  {group.items.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(s.surfaceJp)}
                        className="w-full text-left py-0.5 px-1 hover:bg-white/[.03] transition-colors group"
                        aria-label={`${tCommon("explain")}: ${s.surfaceJp}`}
                      >
                        <span className="text-[#555]">glossary:</span>
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

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
