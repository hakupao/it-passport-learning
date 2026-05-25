// Phase 3 Step 2 — <ChapterQuizPicker /> chapter-scoped quiz modal (LD-2).
//
// Compact picker listing all question entities whose page falls within the
// active chapter's range. Clicking a card opens <QuizExplain /> with the
// chosen QuizSummary (reuses the Phase 2 modal verbatim — no /api change).
// The picker itself is a lightweight overlay; QuizExplain stacks on top
// at a higher z-index when a question is selected.

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { QuizExplain } from "./QuizExplain";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import type { QuizSummary } from "@/lib/quiz/quizScope";

interface ChapterQuizPickerProps {
  open: boolean;
  questions: QuizSummary[];
  onClose: () => void;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function ChapterQuizPicker({
  open,
  questions,
  onClose,
}: ChapterQuizPickerProps): React.ReactElement | null {
  const t = useTranslations("Book");
  const tQuiz = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const [activeSummary, setActiveSummary] = useState<QuizSummary | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(open && activeSummary === null, dialogRef);

  // Reset selected question whenever the picker reopens.
  useEffect(() => {
    if (!open) setActiveSummary(null);
  }, [open]);

  // ESC + scroll lock while picker open (handed off to QuizExplain when
  // it stacks on top).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && activeSummary === null) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, activeSummary]);

  if (!open) return null;

  const closeLabel = tCommon("close");

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-quiz-title"
        ref={dialogRef}
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="w-full sm:max-w-2xl bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/[.14] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-black/[.08] dark:border-white/[.12] p-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <h2
                id="chapter-quiz-title"
                className="text-base sm:text-lg font-semibold tracking-tight"
              >
                {t("quizChapterModalTitle")}
              </h2>
              <p className="mt-1 text-xs text-black/65 dark:text-white/65">
                {t("quizChapterCount", { count: questions.length })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className={`shrink-0 rounded-md px-2 py-1 text-sm text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors ${FOCUS_RING}`}
            >
              ✕
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3">
            {questions.length === 0 ? (
              <p className="text-center text-sm text-black/60 dark:text-white/60 py-8">
                {t("quizChapterEmptyHint")}
              </p>
            ) : (
              <ul className="space-y-2">
                {questions.map((q) => (
                  <li
                    key={q.questionId}
                    className="border border-black/[.08] dark:border-white/[.14] rounded-xl p-3 bg-white dark:bg-black/40 hover:border-black/30 dark:hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
                        {tQuiz("pageEntity", {
                          page: q.page,
                          index: q.entityIndex + 1,
                        })}
                      </span>
                      {q.answerLetterJp && (
                        <span className="text-xs text-black/65 dark:text-white/65">
                          {tQuiz("answerPrefix")}
                          {q.answerLetterJp}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm leading-snug text-black/85 dark:text-white/85 line-clamp-2"
                      lang="ja"
                    >
                      {q.stemJp}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSummary(q)}
                      className={`mt-2 text-xs rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
                    >
                      {tCommon("explain")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-black/[.08] dark:border-white/[.12] p-3 sm:p-4">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
            >
              {closeLabel}
            </button>
          </footer>
        </div>
      </div>
      <QuizExplain
        summary={activeSummary}
        onClose={() => setActiveSummary(null)}
      />
    </>
  );
}
