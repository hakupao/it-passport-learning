"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { QuizExplain } from "@/components/QuizExplain";
import { useQuizState } from "@/hooks/useQuizState";
import { groupQuizByChapter, useCollapsible } from "@/hooks/useGrouping";
import type { QuizSummary } from "@/lib/quiz/quizScope";
import type { ChapterRef } from "@/lib/data/types";
import { trilingualFor } from "@/lib/data/types";

interface TerminalQuizProps {
  summaries: QuizSummary[];
  chapters?: ChapterRef[];
}

export function TerminalQuiz({ summaries, chapters = [] }: TerminalQuizProps): React.ReactElement {
  const t = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { activeSummary, handleSelect, handleClose } = useQuizState(summaries);
  const groups = groupQuizByChapter(summaries, chapters);
  const firstChapterId = groups[0]?.chapterId;
  const { isOpen, toggle } = useCollapsible(firstChapterId != null ? [firstChapterId] : []);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function toggleReveal(qid: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }

  function renderStemTranslation(s: QuizSummary) {
    const stemTranslation = trilingualFor(s.stem, locale);
    if (locale === "ja" || !stemTranslation) return null;
    return (
      <div className="pl-1 text-[#888] text-xs mt-0.5" lang={locale}>{stemTranslation}</div>
    );
  }

  function renderChoices(s: QuizSummary) {
    if (s.choices.length === 0) return null;
    const shown = revealed.has(s.questionId);
    return (
      <>
        <ul className="pl-4 mt-0.5 space-y-0.5">
          {s.choices.map((c) => {
            const choiceTranslation = trilingualFor(c.text, locale);
            return (
              <li
                key={c.letterJp}
                className={`text-xs ${shown && c.letterJp === s.answerLetterJp ? "text-[#4ec9b0]" : "text-[#888]"}`}
              >
                <span lang="ja">{c.text.jp}</span>
                {locale !== "ja" && choiceTranslation && (
                  <span className="text-[#666] ml-1" lang={locale}>({choiceTranslation})</span>
                )}
                {shown && c.letterJp === s.answerLetterJp && <span className="ml-1 text-[#6a9955]">✓</span>}
              </li>
            );
          })}
        </ul>
        {s.answerLetterJp && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleReveal(s.questionId); }}
            className="pl-4 mt-0.5 text-xs text-[#569cd6] hover:text-[#9cdcfe] transition-colors"
          >
            <span className="text-[#808080]">$ </span>
            {shown ? t("hideAnswer") : t("showAnswer")}
          </button>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3rem)] max-w-5xl mx-auto p-4 gap-3 font-mono text-sm">
      {/* Header */}
      <div className="border-b border-[#444] pb-2">
        <div className="text-[#4ec9b0] font-semibold"># {t("title")}</div>
        <div className="text-[#555] text-xs">{t("subtitle")}</div>
      </div>

      {/* ls -la style listing */}
      <div className="flex-1 overflow-y-auto">
        {summaries.length === 0 ? (
          <div className="text-[#555] py-8 px-2">
            <span className="text-[#6a9955]"># </span>
            {t("emptyHint")}
          </div>
        ) : groups.length === 0 ? (
          // Fallback: flat file list when no chapter data available
          <div className="space-y-0">
            <div className="text-[#555] text-xs pb-1">{t("questionCount", { count: summaries.length })}</div>
            <ul className="space-y-3">
              {summaries.map((s) => (
                <li key={s.questionId} className="border-l-2 border-[#333] pl-2">
                  <button
                    type="button"
                    onClick={() => handleSelect(s.questionId)}
                    className="w-full text-left flex items-baseline gap-2 py-0.5 hover:bg-white/[.03] px-1 transition-colors group"
                  >
                    <span className="text-[#ce9178] shrink-0 text-xs">p.{s.page}</span>
                    <span className="text-[#d4d4d4] text-xs group-hover:text-[#4ec9b0] transition-colors" lang="ja">
                      {s.stemJp}
                    </span>
                  </button>
                  {renderStemTranslation(s)}
                  {renderChoices(s)}
                </li>
              ))}
            </ul>
            <div className="text-[#555] text-xs pt-2">
              <span className="text-[#808080]">$ </span>
              <span className="text-[#d4d4d4]">{tCommon("explain")} &lt;question&gt;</span>
            </div>
          </div>
        ) : (
          // Chapter-grouped directory listing
          <div className="space-y-1">
            <div className="text-[#555] text-xs pb-1">
              {t("totalSummary", { questions: summaries.length, chapters: groups.length })}
            </div>
            {groups.map((group) => (
              <div key={group.chapterId}>
                {/* Directory row — click to expand/collapse */}
                <button
                  type="button"
                  onClick={() => toggle(group.chapterId)}
                  className="w-full text-left flex items-baseline gap-2 py-0.5 hover:bg-[#2a2a2a] px-1 transition-colors group"
                >
                  <span className="text-[#555] shrink-0 text-xs">drwxr-xr-x</span>
                  <span className="text-[#555] shrink-0 text-xs">-</span>
                  <span className="text-[#569cd6] shrink-0 text-xs">itp</span>
                  <span className="text-[#555] shrink-0 text-xs">staff</span>
                  <span className="text-[#ce9178] shrink-0 text-xs w-12 text-right">
                    {group.items.length}
                  </span>
                  <span className="text-[#4ec9b0] text-xs group-hover:text-[#9cdcfe] transition-colors">
                    {group.chapterId}/
                  </span>
                  <span className="text-[#555] text-xs truncate">
                    {group.label.replace(/^Ch\.\w+\s/, "")}
                  </span>
                  <span className="text-[#555] text-xs shrink-0 ml-auto">
                    {isOpen(group.chapterId) ? "[-]" : "[+]"}
                  </span>
                </button>
                {isOpen(group.chapterId) && (
                  <ul className="pl-4 border-l border-[#333] ml-2 mt-0.5 mb-1">
                    {group.items.map((s) => (
                      <li key={s.questionId} className="mb-2">
                        <button
                          type="button"
                          onClick={() => handleSelect(s.questionId)}
                          className="w-full text-left flex items-baseline gap-2 py-0.5 hover:bg-[#2a2a2a] px-1 transition-colors group"
                        >
                          <span className="text-[#ce9178] shrink-0 text-xs">
                            p.{s.page}
                          </span>
                          <span className="text-[#d4d4d4] text-xs group-hover:text-[#4ec9b0] transition-colors" lang="ja">
                            {s.stemJp}
                          </span>
                        </button>
                        {renderStemTranslation(s)}
                        {renderChoices(s)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="text-[#555] text-xs pt-2">
              <span className="text-[#808080]">$ </span>
              <span className="text-[#d4d4d4]">{tCommon("explain")} &lt;question&gt;</span>
            </div>
          </div>
        )}
      </div>

      <QuizExplain summary={activeSummary} onClose={handleClose} />
    </div>
  );
}
