// Phase 2 Step 10 — <QuizExplain /> modal (D-085 §2.4 Quiz Explain mode surface).
//
// Session 42 4Q-locked design:
//   Q1=a Modal triggered from quiz list, URL `?qid=` reactive backing.
//   Q2=a Skeleton + "AI 正在分析..." + indeterminate progress bar during the
//        22-42s deepseek-reasoner TTFT window (R1 reasoning latency).
//   Q3=a `?qid=page_NNN_entity_M` is the single source of truth; modal is
//        open ⇔ qid is present + matches the active question.
//   Q4=a Hand-rolled SSE consumer (quizSseTransport) — NOT useChat — because
//        quiz explain is single-shot non-conversational.
//
// D-085 §2.2 NO localStorage Resume for quiz explain (ephemeral; close modal
// = forget).
// D-088 §2.4 error surface = locked Chinese fallback via formatUserFacingError.
// D-097 firewall: browser HTTP auth cache carries Basic Auth from the first
// list-page load; fetch() inherits it automatically.

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { streamQuizExplain } from "@/lib/quiz/quizSseTransport";
import type { QuizSummary } from "@/lib/quiz/quizScope";

type StreamPhase = "idle" | "loading" | "streaming" | "done" | "error";

interface QuizExplainProps {
  /** The summary of the currently selected question; null when modal is closed. */
  summary: QuizSummary | null;
  /** Close handler: clears `?qid=` from URL and dismisses the modal. */
  onClose: () => void;
}

// Surface strings flow through useTranslations("QuizExplain") + Common.
// D-088 §2.4 locked Chinese error fallback is now D-099 §2.5 per-locale lock.

export function QuizExplain({
  summary,
  onClose,
}: QuizExplainProps): React.ReactElement | null {
  const t = useTranslations("QuizExplain");
  const tCommon = useTranslations("Common");
  const [phase, setPhase] = useState<StreamPhase>("idle");
  const [output, setOutput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [usageHint, setUsageHint] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef<number>(0);

  // Dismiss-on-ESC + scroll lock while modal open.
  useEffect(() => {
    if (!summary) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [summary, onClose]);

  const startStream = useCallback((questionId: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const mySeq = ++requestSeqRef.current;
    setPhase("loading");
    setOutput("");
    setErrorMessage("");
    setUsageHint("");

    void streamQuizExplain({
      questionId,
      signal: controller.signal,
      callbacks: {
        onDelta: (delta) => {
          if (requestSeqRef.current !== mySeq) return;
          setPhase((prev) => (prev === "loading" ? "streaming" : prev));
          setOutput((prev) => prev + delta.text);
        },
        onUsage: (usage) => {
          if (requestSeqRef.current !== mySeq) return;
          const hit = usage.cacheReadInputTokens ?? 0;
          const miss = usage.cacheMissInputTokens ?? usage.inputTokens ?? 0;
          const total = hit + miss;
          const ratio = total > 0 ? Math.round((hit / total) * 100) : 0;
          setUsageHint(
            `tokens in=${total} (cache hit ${ratio}%) · out=${
              usage.outputTokens ?? "?"
            }`,
          );
        },
        onError: (message) => {
          if (requestSeqRef.current !== mySeq) return;
          setPhase("error");
          setErrorMessage(message || tCommon("errorFallback"));
        },
        onComplete: () => {
          if (requestSeqRef.current !== mySeq) return;
          // "loading → error" transition catches the R1-empty-delta case
          // (Step 6 Session 38 observability finding): if the stream finishes
          // without emitting any delta, phase is still "loading" so we surface
          // a soft error rather than a silent empty modal.
          setPhase((prev) =>
            prev === "error" ? prev : prev === "loading" ? "error" : "done",
          );
        },
      },
    });
  }, [tCommon]);

  // Kick off / cancel the SSE stream as `summary` changes.
  useEffect(() => {
    if (!summary) {
      abortRef.current?.abort();
      setPhase("idle");
      setOutput("");
      setErrorMessage("");
      setUsageHint("");
      return;
    }
    startStream(summary.questionId);
    return () => {
      abortRef.current?.abort();
    };
  }, [summary, startStream]);

  if (!summary) return null;

  const correctAnswerLabel =
    summary.answerLetterJp != null
      ? `${t("answerPrefix")}${summary.answerLetterJp}`
      : null;
  const showEmptyHint =
    phase === "error" && output === "" && errorMessage === "";
  const busyText = t("busyText");
  const closeLabel = tCommon("close");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-explain-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-black border border-black/10 dark:border-white/[.14] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/[.08] dark:border-white/[.12] p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2
              id="quiz-explain-title"
              className="text-base sm:text-lg font-semibold tracking-tight"
            >
              {t("pageEntity", {
                page: summary.page,
                index: summary.entityIndex + 1,
              })}
            </h2>
            <p className="mt-1 text-xs text-black/60 dark:text-white/60 line-clamp-3">
              {summary.stem.jp}
            </p>
            {correctAnswerLabel && (
              <p className="mt-1 text-xs text-black/70 dark:text-white/70">
                {correctAnswerLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors"
          >
            ✕
          </button>
        </header>

        <div
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3"
          aria-live="polite"
        >
          {phase === "loading" && <BusySkeleton text={busyText} />}

          {(phase === "streaming" || phase === "done") && output && (
            <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
              {output}
            </article>
          )}

          {phase === "streaming" && (
            <p className="text-xs italic text-black/50 dark:text-white/50">
              {busyText}
            </p>
          )}

          {showEmptyHint && (
            <p
              role="alert"
              className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2"
            >
              {tCommon("emptyOutputHint")}
            </p>
          )}

          {phase === "error" && errorMessage && (
            <p
              role="alert"
              className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2"
            >
              {errorMessage}
            </p>
          )}

          {usageHint && phase === "done" && (
            <p className="text-[10px] uppercase tracking-wider text-black/40 dark:text-white/40 pt-2 border-t border-black/[.06] dark:border-white/[.08]">
              {usageHint}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-black/[.08] dark:border-white/[.12] p-3 sm:p-4">
          {phase === "error" && (
            <button
              type="button"
              onClick={() => startStream(summary.questionId)}
              className="text-sm rounded-lg border border-black/[.12] dark:border-white/[.14] px-3 py-1.5 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors"
            >
              {tCommon("retry")}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:opacity-90 transition-opacity"
          >
            {closeLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

function BusySkeleton({ text }: { text: string }): React.ReactElement {
  return (
    <div className="space-y-3" data-testid="quiz-explain-busy">
      <div className="space-y-2">
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] animate-pulse w-3/4" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] animate-pulse w-full" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] animate-pulse w-5/6" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] animate-pulse w-2/3" />
      </div>

      <div
        role="progressbar"
        aria-label={text}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 rounded bg-black/[.05] dark:bg-white/[.08] overflow-hidden relative"
      >
        <div className="quiz-explain-progress h-full bg-black/40 dark:bg-white/40 rounded" />
      </div>

      <p className="text-xs text-black/60 dark:text-white/60">{text}</p>

      <style>{`
        @keyframes quiz-explain-progress-keyframes {
          0%   { margin-left: -35%; width: 35%; }
          50%  { margin-left: 100%; width: 35%; }
          100% { margin-left: -35%; width: 35%; }
        }
        .quiz-explain-progress {
          animation: quiz-explain-progress-keyframes 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
