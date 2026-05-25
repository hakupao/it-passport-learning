"use client";

import { useTranslations } from "next-intl";
import { QuizExplain } from "@/components/QuizExplain";
import { useQuizState } from "@/hooks/useQuizState";
import { groupQuizByChapter, useCollapsible } from "@/hooks/useGrouping";
import type { QuizSummary } from "@/lib/quiz/quizScope";
import type { ChapterRef } from "@/lib/data/types";

interface GamifiedQuizProps {
  summaries: QuizSummary[];
  chapters?: ChapterRef[];
}

export function GamifiedQuiz({ summaries, chapters = [] }: GamifiedQuizProps): React.ReactElement {
  const t = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const { activeSummary, handleSelect, handleClose } = useQuizState(summaries);
  const groups = groupQuizByChapter(summaries, chapters);
  const firstChapterId = groups[0]?.chapterId;
  const { isOpen, toggle } = useCollapsible(firstChapterId != null ? [firstChapterId] : []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-5">
      <header className="border-b border-white/[.08] pb-3">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-white/50 mt-1">
          {t("subtitle")}
        </p>
        <p className="text-[10px] text-white/30 mt-2">
          {summaries.length} questions · {groups.length > 0 ? `${groups.length} chapters` : "no chapters"}
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-center text-sm text-white/40 py-12">
          {t("emptyHint")}
        </p>
      ) : groups.length === 0 ? (
        // Fallback: flat list when no chapter data available
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summaries.map((s) => (
            <li
              key={s.questionId}
              className="border border-white/[.08] rounded-xl p-5 bg-white/[.03] flex flex-col gap-2 hover:border-[#e94560]/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  {t("pageEntity", { page: s.page, index: s.entityIndex + 1 })}
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
              {s.choices.length > 0 && (
                <ul className="flex flex-col gap-1 mt-1">
                  {s.choices.map((c) => (
                    <li
                      key={c.letterJp}
                      className={`text-xs leading-relaxed px-3 py-1.5 rounded-lg ${c.letterJp === s.answerLetterJp ? "bg-[#e94560]/15 text-white/90 border border-[#e94560]/30" : "text-white/60 bg-white/[.03]"}`}
                      lang="ja"
                    >
                      {c.text.jp}
                    </li>
                  ))}
                </ul>
              )}
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
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.chapterId} className="border border-white/[.08] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(group.chapterId)}
                className="w-full flex items-center justify-between px-5 py-3 bg-white/[.03] hover:bg-white/[.05] transition-colors text-left"
              >
                <span className="text-sm font-medium">{group.label}</span>
                <span className="text-xs text-white/40">
                  {group.items.length} questions {isOpen(group.chapterId) ? "▾" : "▸"}
                </span>
              </button>
              {isOpen(group.chapterId) && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {group.items.map((s) => (
                    <li
                      key={s.questionId}
                      className="border border-white/[.06] rounded-lg p-4 bg-white/[.02] flex flex-col gap-2 hover:border-[#e94560]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-white/40">
                          {t("pageEntity", { page: s.page, index: s.entityIndex + 1 })}
                        </span>
                        {s.answerLetterJp && (
                          <span className="text-[10px] text-white/50">
                            {t("answerPrefix")}{s.answerLetterJp}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-white/85" lang="ja">
                        {s.stemJp}
                      </p>
                      {s.choices.length > 0 && (
                        <ul className="flex flex-col gap-1 mt-1">
                          {s.choices.map((c) => (
                            <li
                              key={c.letterJp}
                              className={`text-xs leading-relaxed px-3 py-1.5 rounded-lg ${c.letterJp === s.answerLetterJp ? "bg-[#e94560]/15 text-white/90 border border-[#e94560]/30" : "text-white/60 bg-white/[.03]"}`}
                              lang="ja"
                            >
                              {c.text.jp}
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelect(s.questionId)}
                        className="mt-1 self-start text-xs font-medium rounded-lg bg-[#e94560] text-white h-8 px-4 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
                      >
                        {tCommon("explain")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <QuizExplain summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
