// Phase 3 Step 2 — <ParagraphTranslate /> inline translate modal (LD-2).
//
// D-101 §2.3 段落级 zh/en mechanism: opens on a selection-toolbar click,
// streams a translation back from /api/chat (D-088 §2.3 stable-prefix
// invariant preserved — only the user message body varies per request).
//
// Architecture:
//   - useChat() drives the SSE stream against /api/chat (AI SDK v6 UI
//     message stream protocol; same wire format as Phase 2 <Chat />).
//   - composeTranslatePrompt() composes the single user message body.
//   - On open, we seed exactly one user turn; the modal is single-shot
//     (close + reopen = fresh conversation).
//   - On close, useChat is unmounted with the modal; in-flight requests
//     are aborted by React's natural unmount cleanup.
//
// A11y:
//   - role="dialog" + aria-modal + aria-labelledby (matches QuizExplain
//     pattern from Step 14 a11y polish).
//   - ESC key dismisses; scroll lock while modal open.
//   - Focus trap + initial focus on close button (LD-5 Step 14 reuse).
//   - aria-busy on the streaming container.
//   - prefers-reduced-motion gate on busy skeleton via motion-safe:animate-pulse.

"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { Markdown } from "@/components/Markdown";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import {
  clampTranslateSource,
  composeTranslatePrompt,
  type TranslateTarget,
} from "@/lib/book/translatePrompt";

export interface ParagraphTranslateRequest {
  source: string;
  target: TranslateTarget;
}

interface ParagraphTranslateProps {
  request: ParagraphTranslateRequest | null;
  onClose: () => void;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

function extractMessageText(msg: UIMessage): string {
  const parts = (msg as { parts?: Array<{ type: string; text?: string }> })
    .parts;
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

export function ParagraphTranslate({
  request,
  onClose,
}: ParagraphTranslateProps): React.ReactElement | null {
  const t = useTranslations("Book");
  const tCommon = useTranslations("Common");
  const dialogRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef<string | null>(null);

  // Fresh useChat instance per modal mount; closing the modal unmounts
  // this component → in-flight fetch is GC'd. Reopening starts a clean
  // single-turn conversation.
  const { messages, sendMessage, setMessages, status, error } = useChat();

  useFocusTrap(request !== null, dialogRef);

  // ESC + scroll lock.
  useEffect(() => {
    if (!request) return;
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
  }, [request, onClose]);

  // Seed the translate turn exactly once per (source, target) request key.
  // Using a ref-keyed guard prevents the React 18 strict-mode double-effect
  // from double-submitting.
  useEffect(() => {
    if (!request) {
      seededRef.current = null;
      setMessages([]);
      return;
    }
    const key = `${request.target}::${request.source}`;
    if (seededRef.current === key) return;
    seededRef.current = key;
    setMessages([]);
    const { text } = clampTranslateSource(request.source);
    if (!text) return;
    sendMessage({
      text: composeTranslatePrompt({ source: text, target: request.target }),
    });
  }, [request, sendMessage, setMessages]);

  if (!request) return null;

  const clamped = clampTranslateSource(request.source);
  const assistantMessage = messages.find((m) => m.role === "assistant");
  const assistantText = assistantMessage
    ? extractMessageText(assistantMessage)
    : "";
  const isStreaming = status === "submitted" || status === "streaming";
  const errorMessage = error?.message?.trim()
    ? error.message
    : tCommon("errorFallback");
  const targetLabel =
    request.target === "zh" ? t("translateZh") : t("translateEn");
  const closeLabel = tCommon("close");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paragraph-translate-title"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/[.14] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[90dvh] safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/[.08] dark:border-white/[.12] p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2
              id="paragraph-translate-title"
              className="text-base sm:text-lg font-semibold tracking-tight"
            >
              {t("translateModalTitle", { target: targetLabel })}
            </h2>
            {clamped.truncated && (
              <p className="mt-1 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                {t("translateTruncatedHint")}
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
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4"
          aria-live="polite"
          aria-busy={isStreaming}
        >
          <section className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
              {t("translateOriginal")}
            </p>
            <p
              className="text-sm sm:text-base leading-relaxed text-black/85 dark:text-white/85 whitespace-pre-wrap"
              lang="ja"
            >
              {clamped.text}
            </p>
          </section>

          <section className="space-y-1 border-t border-black/[.06] dark:border-white/[.08] pt-3">
            <p className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
              {t("translateResult", { target: targetLabel })}
            </p>
            {assistantText ? (
              <div lang={request.target === "zh" ? "zh-Hans" : "en"}>
                <Markdown className="prose prose-sm dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-black/90 dark:text-white/90">
                  {assistantText}
                </Markdown>
              </div>
            ) : isStreaming ? (
              <div className="space-y-2" data-testid="paragraph-translate-busy">
                <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-5/6" />
                <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-3/4" />
                <div className="h-3 rounded bg-black/[.06] dark:bg-white/[.10] motion-safe:animate-pulse w-4/6" />
              </div>
            ) : !error ? (
              <p className="text-sm italic text-black/55 dark:text-white/55">
                {t("translateBusy")}
              </p>
            ) : null}
          </section>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2"
            >
              {errorMessage}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-black/[.08] dark:border-white/[.12] p-3 sm:p-4">
          {error && (
            <button
              type="button"
              onClick={() => {
                seededRef.current = null;
                setMessages([]);
                const { text } = clampTranslateSource(request.source);
                if (text) {
                  sendMessage({
                    text: composeTranslatePrompt({
                      source: text,
                      target: request.target,
                    }),
                  });
                  seededRef.current = `${request.target}::${request.source}`;
                }
              }}
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
