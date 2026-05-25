// Phase 2 Step 11 — <TermPopover /> modal (D-085 §2.4 term-hover mode surface).
//
// Session 43 4Q-locked design:
//   Q1=a Modal-like overlay triggered from /glossary list, URL `?term=` reactive backing.
//   Q2=a Click-to-open (mobile-safe single code path; hover layer deferred to Step 12).
//   Q3=a Skeleton + stream deltas live as they arrive (Module C consistency).
//   Q4=a Hand-rolled SSE consumer (glossarySseTransport) cloned from Step 10 —
//        glossary/hover is single-shot non-conversational, same as quiz/explain.
//
// D-085 §2.2 NO localStorage Resume for term hover (ephemeral; close = forget).
// D-088 §2.4 error surface = locked Chinese fallback via formatUserFacingError.
// D-097 firewall: browser HTTP auth cache carries Basic Auth from the first
// list-page load; fetch() inherits it automatically.
//
// Session 46 Step 14 a11y polish (Full WCAG 2.1 AA):
//   - Contrast bumps mirror QuizExplain (text-black/40 → /55, /50 → /60).
//   - Focus trap + restore via useFocusTrap (LD-5).
//   - aria-busy on content area (LD-7).
//   - prefers-reduced-motion gate on skeleton + progressbar (LD-6).
//   - Uniform focus-visible ring (LD-4) on close / retry / footer-close.

"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Markdown } from "@/components/Markdown";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { streamGlossaryHover } from "@/lib/glossary/glossarySseTransport";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

type StreamPhase = "idle" | "loading" | "streaming" | "done" | "error";

interface TermPopoverProps {
  /** Summary of the currently selected term; null when popover is closed. */
  summary: GlossarySummary | null;
  /** Close handler: clears `?term=` from URL and dismisses the popover. */
  onClose: () => void;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

// Surface strings flow through useTranslations("TermPopover") + Common.
// D-088 §2.4 locked Chinese error fallback now D-099 §2.5 per-locale lock.

export function TermPopover({
  summary,
  onClose,
}: TermPopoverProps): React.ReactElement | null {
  const t = useTranslations("TermPopover");
  const tCommon = useTranslations("Common");
  const [phase, setPhase] = useState<StreamPhase>("idle");
  const [output, setOutput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [usageHint, setUsageHint] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef<number>(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(summary !== null, dialogRef);

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

  const startStream = useCallback((surfaceJp: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const mySeq = ++requestSeqRef.current;
    setPhase("loading");
    setOutput("");
    setErrorMessage("");
    setUsageHint("");

    void streamGlossaryHover({
      surfaceJp,
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
          setPhase((prev) =>
            prev === "error" ? prev : prev === "loading" ? "error" : "done",
          );
        },
      },
    });
  }, [tCommon]);

  useEffect(() => {
    if (!summary) {
      abortRef.current?.abort();
      setPhase("idle");
      setOutput("");
      setErrorMessage("");
      setUsageHint("");
      return;
    }
    startStream(summary.surfaceJp);
    return () => {
      abortRef.current?.abort();
    };
  }, [summary, startStream]);

  if (!summary) return null;

  const showEmptyHint =
    phase === "error" && output === "" && errorMessage === "";
  const busyText = t("busyText");
  const closeLabel = tCommon("close");
  const isBusy = phase === "loading" || phase === "streaming";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="term-popover-title"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/[.14] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/[.08] dark:border-white/[.12] p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2
              id="term-popover-title"
              className="text-base sm:text-lg font-semibold tracking-tight"
              lang="ja"
            >
              {summary.surfaceJp}
            </h2>
            {summary.kanaReading && (
              <p className="mt-1 text-xs text-black/65 dark:text-white/65" lang="ja">
                {t("readingPrefix")}
                {summary.kanaReading}
              </p>
            )}
            <p className="mt-1 text-xs text-black/60 dark:text-white/60">
              <span lang="zh">{summary.surfaceZh}</span>
              {" · "}
              <span lang="en">{summary.surfaceEn}</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
              {t("pageOccurrence", {
                firstPage: summary.firstPage,
                count: summary.occurrenceCount,
              })}
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
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-black/[.08] dark:border-white/[.12] p-3 sm:p-4">
          {phase === "error" && (
            <button
              type="button"
              onClick={() => startStream(summary.surfaceJp)}
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
    <div className="space-y-3" data-testid="term-popover-busy">
      <div className="space-y-2">
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-3/4" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-full" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-5/6" />
      </div>

      <div
        role="progressbar"
        aria-label={text}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 rounded bg-black/[.05] dark:bg-white/[.08] overflow-hidden relative"
      >
        <div className="term-popover-progress h-full bg-black/40 dark:bg-white/40 rounded" />
      </div>

      <p className="text-xs text-black/65 dark:text-white/65">{text}</p>

      <style>{`
        @keyframes term-popover-progress-keyframes {
          0%   { margin-left: -35%; width: 35%; }
          50%  { margin-left: 100%; width: 35%; }
          100% { margin-left: -35%; width: 35%; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .term-popover-progress {
            animation: term-popover-progress-keyframes 1.6s ease-in-out infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .term-popover-progress {
            margin-left: 30%;
            width: 40%;
          }
        }
      `}</style>
    </div>
  );
}
