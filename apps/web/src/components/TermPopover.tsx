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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { streamGlossaryHover } from "@/lib/glossary/glossarySseTransport";
import type { GlossarySummary } from "@/lib/glossary/glossaryScope";

type StreamPhase = "idle" | "loading" | "streaming" | "done" | "error";

interface TermPopoverProps {
  /** Summary of the currently selected term; null when popover is closed. */
  summary: GlossarySummary | null;
  /** Close handler: clears `?term=` from URL and dismisses the popover. */
  onClose: () => void;
}

const ERROR_FALLBACK = "AI 暂时不可用，请稍后重试。";
const BUSY_TEXT_JP = "AI が用語を解説中…（数秒）";
const BUSY_TEXT_CN = "AI 正在解释术语…（数秒）";
const EMPTY_OUTPUT_HINT =
  "AI からの解説本文が空でした。もう一度お試しください。";
const RETRY_LABEL = "再試行 / 再试一次";
const CLOSE_LABEL = "閉じる / 关闭";
const READING_PREFIX = "読み：";

export function TermPopover({
  summary,
  onClose,
}: TermPopoverProps): React.ReactElement | null {
  const [phase, setPhase] = useState<StreamPhase>("idle");
  const [output, setOutput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [usageHint, setUsageHint] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef<number>(0);

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
          setErrorMessage(message || ERROR_FALLBACK);
        },
        onComplete: () => {
          if (requestSeqRef.current !== mySeq) return;
          setPhase((prev) =>
            prev === "error" ? prev : prev === "loading" ? "error" : "done",
          );
        },
      },
    });
  }, []);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="term-popover-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-black border border-black/10 dark:border-white/[.14] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
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
              <p className="mt-1 text-xs text-black/60 dark:text-white/60" lang="ja">
                {READING_PREFIX}
                {summary.kanaReading}
              </p>
            )}
            <p className="mt-1 text-xs text-black/55 dark:text-white/55">
              <span lang="zh">{summary.surfaceZh}</span>
              {" · "}
              <span lang="en">{summary.surfaceEn}</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-black/40 dark:text-white/40">
              {`第 ${summary.firstPage} ページ · 出現 ${summary.occurrenceCount}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={CLOSE_LABEL}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors"
          >
            ✕
          </button>
        </header>

        <div
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3"
          aria-live="polite"
        >
          {phase === "loading" && (
            <BusySkeleton textJp={BUSY_TEXT_JP} textCn={BUSY_TEXT_CN} />
          )}

          {(phase === "streaming" || phase === "done") && output && (
            <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
              {output}
            </article>
          )}

          {phase === "streaming" && (
            <p className="text-xs italic text-black/50 dark:text-white/50">
              {BUSY_TEXT_JP}
            </p>
          )}

          {showEmptyHint && (
            <p
              role="alert"
              className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2"
            >
              {EMPTY_OUTPUT_HINT}
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
              onClick={() => startStream(summary.surfaceJp)}
              className="text-sm rounded-lg border border-black/[.12] dark:border-white/[.14] px-3 py-1.5 hover:bg-black/[.04] dark:hover:bg-white/[.08] transition-colors"
            >
              {RETRY_LABEL}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:opacity-90 transition-opacity"
          >
            {CLOSE_LABEL}
          </button>
        </footer>
      </div>
    </div>
  );
}

function BusySkeleton({
  textJp,
  textCn,
}: {
  textJp: string;
  textCn: string;
}): React.ReactElement {
  return (
    <div className="space-y-3" data-testid="term-popover-busy">
      <div className="space-y-2">
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] animate-pulse w-3/4" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] animate-pulse w-full" />
        <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] animate-pulse w-5/6" />
      </div>

      <div
        role="progressbar"
        aria-label={textJp}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 rounded bg-black/[.05] dark:bg-white/[.08] overflow-hidden relative"
      >
        <div className="term-popover-progress h-full bg-black/40 dark:bg-white/40 rounded" />
      </div>

      <p className="text-xs text-black/60 dark:text-white/60">
        <span className="block">{textJp}</span>
        <span className="block text-black/40 dark:text-white/40">
          {textCn}
        </span>
      </p>

      <style>{`
        @keyframes term-popover-progress-keyframes {
          0%   { margin-left: -35%; width: 35%; }
          50%  { margin-left: 100%; width: 35%; }
          100% { margin-left: -35%; width: 35%; }
        }
        .term-popover-progress {
          animation: term-popover-progress-keyframes 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
