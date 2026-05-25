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
//
// Session 46 Step 14 a11y polish (Full WCAG 2.1 AA):
//   - Contrast: text-black/40 → /55 / text-black/50 → /60.
//   - Focus trap + restore via useFocusTrap (LD-5; 2.4.3); initial focus on
//     close button so a keyboard user can dismiss with one keypress.
//   - aria-busy on content area (LD-7) while phase is loading/streaming.
//   - prefers-reduced-motion gate on skeleton pulse + indeterminate progress
//     bar (LD-6) via `motion-safe:animate-pulse` and a wrapped media query.
//   - Uniform focus-visible ring (LD-4) on close / retry / footer-close.

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Markdown } from "@/components/Markdown";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { loadProgress, persistQuizOutcome } from "@/lib/book/progressStore";
import { streamQuizExplain } from "@/lib/quiz/quizSseTransport";
import type { QuizSummary } from "@/lib/quiz/quizScope";

type StreamPhase = "idle" | "loading" | "streaming" | "done" | "error";

interface QuizExplainProps {
  /** The summary of the currently selected question; null when modal is closed. */
  summary: QuizSummary | null;
  /** Close handler: clears `?qid=` from URL and dismisses the modal. */
  onClose: () => void;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

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
  // Phase 4 Module A Step A.2 — self-report wire (LD-Module-A-1).
  // "unset" until user clicks one of the two buttons; rehydrated from
  // progressStore on summary change so a reopened modal shows the prior pick.
  const [selfReport, setSelfReport] = useState<"unset" | "correct" | "wrong">(
    "unset",
  );
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef<number>(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap + restore (LD-5; WCAG 2.4.3). Engaged only when summary is set.
  useFocusTrap(summary !== null, dialogRef);

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

  // Phase 4 Module A Step A.2 — rehydrate self-report state from storage
  // when summary changes (LD-Module-A-1). Mount-gate via useEffect lets us
  // touch window.localStorage safely on the client without SSR fallout.
  useEffect(() => {
    if (!summary) {
      setSelfReport("unset");
      return;
    }
    if (typeof window === "undefined") return;
    const existing = loadProgress(window.localStorage).quiz[summary.questionId];
    setSelfReport(
      existing ? (existing.correct ? "correct" : "wrong") : "unset",
    );
  }, [summary]);

  const handleSelfReport = useCallback(
    (correct: boolean) => {
      if (!summary) return;
      if (typeof window === "undefined") return;
      persistQuizOutcome(window.localStorage, summary.questionId, correct);
      setSelfReport(correct ? "correct" : "wrong");
    },
    [summary],
  );

  if (!summary) return null;

  const correctAnswerLabel =
    summary.answerLetterJp != null
      ? `${t("answerPrefix")}${summary.answerLetterJp}`
      : null;
  const showEmptyHint =
    phase === "error" && output === "" && errorMessage === "";
  const busyText = t("busyText");
  const closeLabel = tCommon("close");
  const isBusy = phase === "loading" || phase === "streaming";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-explain-title"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/[.14] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
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
            <p className="mt-1 text-xs text-black/65 dark:text-white/65 line-clamp-3" lang="ja">
              {summary.stem.jp}
            </p>
            {correctAnswerLabel && (
              <p className="mt-1 text-xs text-black/75 dark:text-white/75">
                {correctAnswerLabel}
              </p>
            )}
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

        <div
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3"
          aria-live="polite"
          aria-busy={isBusy}
        >
          {phase === "loading" && <BusySkeleton text={busyText} />}

          {(phase === "streaming" || phase === "done") && output && (
            <Markdown className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-sm prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-1.5 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5">
              {output}
            </Markdown>
          )}

          {phase === "streaming" && (
            <p className="text-xs italic text-black/60 dark:text-white/60">
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
            <p className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55 pt-2 border-t border-black/[.06] dark:border-white/[.08]">
              {usageHint}
            </p>
          )}

          {phase === "done" && (
            <div
              className="pt-3 mt-1 border-t border-black/[.06] dark:border-white/[.08] space-y-2"
              role="group"
              aria-label={t("selfReportPrompt")}
            >
              <p className="text-xs text-black/65 dark:text-white/65">
                {t("selfReportPrompt")}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelfReport(true)}
                  aria-pressed={selfReport === "correct"}
                  className={`text-xs rounded-lg px-3 py-1.5 border transition-colors ${FOCUS_RING} ${
                    selfReport === "correct"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-black/[.18] dark:border-white/[.22] hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                  }`}
                >
                  {selfReport === "correct" ? "✓ " : ""}
                  {t("selfReportCorrect")}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelfReport(false)}
                  aria-pressed={selfReport === "wrong"}
                  className={`text-xs rounded-lg px-3 py-1.5 border transition-colors ${FOCUS_RING} ${
                    selfReport === "wrong"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "border-black/[.18] dark:border-white/[.22] hover:bg-black/[.04] dark:hover:bg-white/[.08]"
                  }`}
                >
                  {selfReport === "wrong" ? "✗ " : ""}
                  {t("selfReportWrong")}
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-black/[.08] dark:border-white/[.12] p-3 sm:p-4">
          {phase === "error" && (
            <button
              type="button"
              onClick={() => startStream(summary.questionId)}
              className={`text-sm rounded-lg border border-black/[.18] dark:border-white/[.22] px-3 py-1.5 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors ${FOCUS_RING}`}
            >
              {tCommon("retry")}
            </button>
          )}
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
  );
}

function BusySkeleton({ text }: { text: string }): React.ReactElement {
  return (
    <div className="space-y-3" data-testid="quiz-explain-busy">
      <div className="space-y-2">
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-3/4" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-full" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-5/6" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-2/3" />
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

      <p className="text-xs text-black/65 dark:text-white/65">{text}</p>

      <style>{`
        @keyframes quiz-explain-progress-keyframes {
          0%   { margin-left: -35%; width: 35%; }
          50%  { margin-left: 100%; width: 35%; }
          100% { margin-left: -35%; width: 35%; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .quiz-explain-progress {
            animation: quiz-explain-progress-keyframes 1.6s ease-in-out infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .quiz-explain-progress {
            margin-left: 30%;
            width: 40%;
          }
        }
      `}</style>
    </div>
  );
}
