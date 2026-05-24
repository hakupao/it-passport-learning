"use client";

import { useTranslations } from "next-intl";
import { QuizExplain } from "@/components/QuizExplain";
import { useQuizState } from "@/hooks/useQuizState";
import type { QuizSummary } from "@/lib/quiz/quizScope";

interface GamifiedQuizProps {
  summaries: QuizSummary[];
}

export function GamifiedQuiz({ summaries }: GamifiedQuizProps): React.ReactElement {
  const t = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const { activeSummary, handleSelect, handleClose } = useQuizState(summaries);

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
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summaries.map((s) => (
            <li
              key={s.questionId}
              className="border border-white/[.08] rounded-xl p-5 bg-white/[.03] flex flex-col gap-2 hover:border-[#e94560]/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  {t("pageEntity", {
                    page: s.page,
                    index: s.entityIndex + 1,
                  })}
                </span>
                {s.answerLetterJp && (
                  <span className="text-xs text-white/50">
                    {t("answerPrefix")}
                    {s.answerLetterJp}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-white/85" lang="ja">
                {s.stemJp}
              </p>

              <button
                type="button"
                onClick={() => handleSelect(s.questionId)}
                className="mt-1 self-start h-8 px-4 rounded-lg bg-[#e94560] text-white text-xs font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
              >
                {tCommon("explain")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <QuizExplain summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
