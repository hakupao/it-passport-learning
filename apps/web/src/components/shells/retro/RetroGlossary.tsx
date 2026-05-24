"use client";

import { useTranslations } from "next-intl";
import { TermPopover } from "@/components/TermPopover";
import { useGlossaryState } from "@/hooks/useGlossaryState";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

interface RetroGlossaryProps {
  summaries: GlossarySummary[];
}

export function RetroGlossary({ summaries }: RetroGlossaryProps): React.ReactElement {
  const t = useTranslations("GlossaryList");
  const tCommon = useTranslations("Common");
  const tTerm = useTranslations("TermPopover");
  const { activeSummary, handleSelect, handleClose } = useGlossaryState(summaries);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] p-2 gap-2 text-black">
      {/* Header */}
      <div className="border-b-2 border-[#808080] pb-1">
        <h1 className="text-sm font-bold">{t("title")}</h1>
        <p className="text-[10px] text-[#808080]">{t("subtitle")}</p>
      </div>

      {/* List area */}
      <div className="flex-1 border-2 border-inset-retro bg-white p-1 overflow-y-auto">
        {summaries.length === 0 ? (
          <p className="text-center text-[11px] text-[#808080] py-8">
            {t("emptyHint")}
          </p>
        ) : (
          <ul>
            {summaries.map((s) => (
              <li
                key={s.id}
                className="border-b border-[#808080] p-2 flex items-start justify-between gap-2"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-bold" lang="ja">
                    {s.surfaceJp}
                  </span>
                  {s.kanaReading && (
                    <span className="text-[10px] text-[#808080]" lang="ja">
                      {tTerm("readingPrefix")}
                      {s.kanaReading}
                    </span>
                  )}
                  <span className="text-[10px] text-[#808080] truncate">
                    <span lang="zh">{s.surfaceZh}</span>
                    {" · "}
                    <span lang="en">{s.surfaceEn}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(s.surfaceJp)}
                  className="shrink-0 text-[10px] bg-[#c0c0c0] border-2 border-outset-retro px-2 py-0.5 active:border-inset-retro"
                >
                  {tCommon("explain")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TermPopover summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
