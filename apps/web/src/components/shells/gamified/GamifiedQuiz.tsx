"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { QuizExplain } from "@/components/QuizExplain";
import { useQuizState } from "@/hooks/useQuizState";
import { groupQuizByChapter, useCollapsible } from "@/hooks/useGrouping";
import type { QuizSummary } from "@/lib/quiz/quizScope";
import type { ChapterRef } from "@/lib/data/types";
import { trilingualFor } from "@/lib/data/types";

interface GamifiedQuizProps {
  summaries: QuizSummary[];
  chapters?: ChapterRef[];
}

export function GamifiedQuiz({ summaries, chapters = [] }: GamifiedQuizProps): React.ReactElement {
  const t = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { activeSummary, handleSelect, handleClose } = useQuizState(summaries);
  const groups = groupQuizByChapter(summaries, chapters);
  const firstChapterId = groups[0]?.chapterId;
  const { isOpen, toggle } = useCollapsible(firstChapterId != null ? [firstChapterId] : []);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);

  const allQuestions = groups.flatMap((g) => g.items);

  const handlePrev = useCallback(() => {
    setFocusIndex((i) => Math.max(0, i - 1));
  }, []);
  const handleNext = useCallback(() => {
    setFocusIndex((i) => Math.min(allQuestions.length - 1, i + 1));
  }, [allQuestions.length]);

  function toggleReveal(qid: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }

  function renderItemContent(s: QuizSummary) {
    const stemTranslation = trilingualFor(s.stem, locale);
    const shown = revealed.has(s.questionId);
    return (
      <>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/40">
            {t("pageEntity", { page: s.page, index: s.entityIndex + 1 })}
          </span>
          {s.answerLetterJp && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleReveal(s.questionId); }}
              className="text-[10px] text-white/50 hover:text-white/70 transition-colors"
            >
              {shown ? `${t("answerPrefix")}${s.answerLetterJp}` : t("showAnswer")}
            </button>
          )}
        </div>
        <p className="text-sm leading-relaxed text-white/85" lang="ja">{s.stemJp}</p>
        {locale !== "ja" && stemTranslation && (
          <p className="text-xs leading-relaxed text-white/50 mt-0.5" lang={locale}>{stemTranslation}</p>
        )}
        {s.choices.length > 0 && (
          <ul className="flex flex-col gap-1 mt-1">
            {s.choices.map((c) => {
              const choiceTranslation = trilingualFor(c.text, locale);
              return (
                <li
                  key={c.letterJp}
                  className={`text-xs leading-relaxed px-3 py-1.5 rounded-lg ${shown && c.letterJp === s.answerLetterJp ? "bg-[#e94560]/15 text-white/90 border border-[#e94560]/30" : "text-white/60 bg-white/[.03]"}`}
                >
                  <span lang="ja">{c.text.jp}</span>
                  {locale !== "ja" && choiceTranslation && (
                    <span className="text-white/40 ml-2" lang={locale}>({choiceTranslation})</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <button
          type="button"
          onClick={() => handleSelect(s.questionId)}
          className="mt-1 self-start h-8 px-4 rounded-lg bg-[#e94560] text-white text-xs font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
        >
          {tCommon("explain")}
        </button>
      </>
    );
  }

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
          {groups.length > 0
            ? t("totalSummary", { questions: summaries.length, chapters: groups.length })
            : `${summaries.length > 0 ? t("questionCount", { count: summaries.length }) + " · " : ""}${t("noChapters")}`}
        </p>
      </header>

      {/* Chapter gap note + mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-white/30 italic">
          {t("chapterGapNote")}
        </p>
        <button
          type="button"
          onClick={() => { setFocusMode((v) => !v); setFocusIndex(0); }}
          className="text-[10px] px-3 py-1 rounded-full border border-white/[.12] text-white/50 hover:text-white/80 hover:border-white/[.2] transition-colors"
        >
          {focusMode ? t("listMode") : t("focusMode")}
        </button>
      </div>

      {focusMode && allQuestions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={focusIndex === 0}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/[.12] text-white/60 hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t("prevQuestion")}
            </button>
            <span className="text-xs text-white/40">
              {t("questionProgress", { current: focusIndex + 1, total: allQuestions.length })}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={focusIndex === allQuestions.length - 1}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/[.12] text-white/60 hover:text-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t("nextQuestion")}
            </button>
          </div>
          <div className="border border-white/[.08] rounded-xl p-5 bg-white/[.03] flex flex-col gap-2">
            {allQuestions[focusIndex] && renderItemContent(allQuestions[focusIndex]!)}
          </div>
        </div>
      ) : (
        <>
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
                  {renderItemContent(s)}
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
                      {t("questionCount", { count: group.items.length })} {isOpen(group.chapterId) ? "▾" : "▸"}
                    </span>
                  </button>
                  {isOpen(group.chapterId) && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                      {group.items.map((s) => (
                        <li
                          key={s.questionId}
                          className="border border-white/[.06] rounded-lg p-4 bg-white/[.02] flex flex-col gap-2 hover:border-[#e94560]/40 transition-colors"
                        >
                          {renderItemContent(s)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!focusMode && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-20 w-10 h-10 rounded-full bg-[#e94560] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label={tCommon("backToTop")}
        >
          ↑
        </button>
      )}

      <QuizExplain summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
