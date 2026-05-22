// Phase 3 Step 2 — <ChapterEndPanel /> 章末固定区 (LD-2).
//
// Always-visible panel pinned at the bottom of <ChapterReader />. Two
// primary actions:
//   1. 问本章 → opens <ChapterChatModal /> seeded with the chapter scope
//      marker (composeChapterScopePreface), reusing /api/chat with the
//      stable-prefix invariant intact.
//   2. 测本章 → opens <ChapterQuizPicker /> with the pre-computed list of
//      question entities for this chapter; selecting a card opens the
//      existing <QuizExplain /> modal (Phase 2 Step 10 component reused
//      verbatim).
//
// The panel itself is a client component because both actions open
// stateful modals; the question summaries are pre-computed server-side
// in the chapter route and passed in as a plain serializable prop.

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ChapterChatModal } from "./ChapterChatModal";
import { ChapterQuizPicker } from "./ChapterQuizPicker";
import type { ChapterScopeArgs } from "@/lib/book/translatePrompt";
import type { QuizSummary } from "@/lib/quiz/quizScope";

interface ChapterEndPanelProps {
  scope: ChapterScopeArgs;
  questions: QuizSummary[];
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function ChapterEndPanel({
  scope,
  questions,
}: ChapterEndPanelProps): React.ReactElement {
  const t = useTranslations("Book");
  const [chatOpen, setChatOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <section
        aria-label={t("chapterEndPanelLabel")}
        className="border border-black/[.08] dark:border-white/[.14] rounded-xl p-4 bg-black/[.02] dark:bg-white/[.04] flex flex-col gap-3"
      >
        <h2 className="text-sm sm:text-base font-semibold tracking-tight">
          {t("chapterEndPanelTitle")}
        </h2>
        <p className="text-xs text-black/65 dark:text-white/65">
          {t("chapterEndPanelHint")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className={`text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-2 font-medium hover:opacity-90 transition-opacity ${FOCUS_RING}`}
          >
            {t("askChapter")}
          </button>
          <button
            type="button"
            onClick={() => setQuizOpen(true)}
            disabled={questions.length === 0}
            className={`text-sm rounded-lg border border-black/[.18] dark:border-white/[.22] px-3 py-2 font-medium hover:bg-black/[.04] dark:hover:bg-white/[.08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${FOCUS_RING}`}
          >
            {t("quizChapter", { count: questions.length })}
          </button>
        </div>
      </section>

      <ChapterChatModal
        scope={chatOpen ? scope : null}
        onClose={() => setChatOpen(false)}
      />
      <ChapterQuizPicker
        open={quizOpen}
        questions={questions}
        onClose={() => setQuizOpen(false)}
      />
    </>
  );
}
