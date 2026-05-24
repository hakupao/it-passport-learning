"use client";

import { useTranslations } from "next-intl";
import { QuizExplain } from "@/components/QuizExplain";
import { useQuizState } from "@/hooks/useQuizState";
import type { QuizSummary } from "@/lib/quiz/quizScope";

interface RetroQuizProps {
  summaries: QuizSummary[];
}

export function RetroQuiz({ summaries }: RetroQuizProps): React.ReactElement {
  const t = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const { activeSummary, handleSelect, handleClose } = useQuizState(summaries);

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
          <ul className="space-y-1">
            {summaries.map((s) => (
              <li
                key={s.questionId}
                className="bg-[#ffffcc] border border-[#808080] p-2 mb-1 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#808080]">
                    {t("pageEntity", {
                      page: s.page,
                      index: s.entityIndex + 1,
                    })}
                  </span>
                  {s.answerLetterJp && (
                    <span className="text-[10px] text-[#808080]">
                      {t("answerPrefix")}
                      {s.answerLetterJp}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-snug" lang="ja">
                  {s.stemJp}
                </p>

                <button
                  type="button"
                  onClick={() => handleSelect(s.questionId)}
                  className="self-start text-[10px] bg-[#c0c0c0] border-2 border-outset-retro px-2 py-0.5 active:border-inset-retro"
                >
                  {tCommon("explain")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <QuizExplain summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
