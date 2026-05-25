"use client";

import { useTranslations } from "next-intl";
import { QuizExplain } from "@/components/QuizExplain";
import { useQuizState } from "@/hooks/useQuizState";
import { groupQuizByChapter, useCollapsible } from "@/hooks/useGrouping";
import type { QuizSummary } from "@/lib/quiz/quizScope";
import type { ChapterRef } from "@/lib/data/types";

interface RetroQuizProps {
  summaries: QuizSummary[];
  chapters?: ChapterRef[];
}

export function RetroQuiz({ summaries, chapters = [] }: RetroQuizProps): React.ReactElement {
  const t = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const { activeSummary, handleSelect, handleClose } = useQuizState(summaries);
  const groups = groupQuizByChapter(summaries, chapters);
  const firstChapterId = groups[0]?.chapterId;
  const { isOpen, toggle } = useCollapsible(firstChapterId != null ? [firstChapterId] : []);

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
        ) : groups.length === 0 ? (
          // Fallback: flat list when no chapter data available
          <ul className="space-y-1">
            {summaries.map((s) => (
              <li
                key={s.questionId}
                className="bg-[#ffffcc] border border-[#808080] p-3 mb-2 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#808080]">
                    {t("pageEntity", { page: s.page, index: s.entityIndex + 1 })}
                  </span>
                  {s.answerLetterJp && (
                    <span className="text-[10px] text-[#808080]">
                      {t("answerPrefix")}
                      {s.answerLetterJp}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-snug" lang="ja">{s.stemJp}</p>
                {s.choices.length > 0 && (
                  <ul className="flex flex-col gap-0.5 mt-1">
                    {s.choices.map((c) => (
                      <li
                        key={c.letterJp}
                        className={`text-[11px] leading-snug px-1.5 py-0.5 ${c.letterJp === s.answerLetterJp ? "bg-[#ccffcc] border border-[#009900] font-bold" : "bg-[#f0f0f0] border border-[#c0c0c0]"}`}
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
                  className="self-start text-[10px] bg-[#c0c0c0] border-2 border-outset-retro px-2 py-0.5 active:border-inset-retro"
                >
                  {tCommon("explain")}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-1">
            {groups.map((group) => (
              <div key={group.chapterId} className="mb-1">
                {/* Group header — outset border button like a retro folder tab */}
                <button
                  type="button"
                  onClick={() => toggle(group.chapterId)}
                  className="w-full flex items-center justify-between bg-[#c0c0c0] border-2 border-outset-retro px-2 py-1 text-left active:border-inset-retro"
                >
                  <span className="text-[11px] font-bold">{group.label}</span>
                  <span className="text-[10px] text-[#444]">
                    {group.items.length}問 {isOpen(group.chapterId) ? "▾" : "▸"}
                  </span>
                </button>
                {isOpen(group.chapterId) && (
                  <div className="border-2 border-inset-retro bg-white p-1 mt-0.5">
                    <ul className="space-y-1">
                      {group.items.map((s) => (
                        <li
                          key={s.questionId}
                          className="bg-[#ffffcc] border border-[#808080] p-2 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-[#808080]">
                              {t("pageEntity", { page: s.page, index: s.entityIndex + 1 })}
                            </span>
                            {s.answerLetterJp && (
                              <span className="text-[10px] text-[#808080]">
                                {t("answerPrefix")}{s.answerLetterJp}
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-snug" lang="ja">{s.stemJp}</p>
                          {s.choices.length > 0 && (
                            <ul className="flex flex-col gap-0.5 mt-1">
                              {s.choices.map((c) => (
                                <li
                                  key={c.letterJp}
                                  className={`text-[11px] leading-snug px-1.5 py-0.5 ${c.letterJp === s.answerLetterJp ? "bg-[#ccffcc] border border-[#009900] font-bold" : "bg-[#f0f0f0] border border-[#c0c0c0]"}`}
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
                            className="self-start text-[10px] bg-[#c0c0c0] border-2 border-outset-retro px-2 py-0.5 active:border-inset-retro"
                          >
                            {tCommon("explain")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <QuizExplain summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
