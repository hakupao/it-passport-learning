// Phase 3 Step 2 — <ChapterChatModal /> chapter-scoped chat modal (LD-2).
//
// Reuses the /api/chat endpoint with the stable-prefix invariant intact
// (D-088 §2.3 / D-095 §2.3: SYSTEM messages = corpus + SYSTEM_INSTRUCTION
// stay byte-identical; only the user message body changes). The chapter
// scope is conveyed by prepending `[Scope: 第NN章「title」 p.A-B] ` to the
// first user message via applyChapterScope() — the marker is visible in
// the user's own bubble (transparent, not a hidden instruction).
//
// This is a separate component from Phase 2 <Chat /> because:
//   - <Chat /> is a full-page layout with a localStorage Resume contract
//     (D-085 §2.2) that we do NOT want to merge with chapter-scoped
//     sessions; mixing scopes would corrupt the global chat history.
//   - The chapter chat is single-purpose / single-session; closing the
//     modal forgets the conversation (matching the "I'm asking about
//     this chapter right now" mental model).

"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import {
  applyChapterScope,
  type ChapterScopeArgs,
} from "@/lib/book/translatePrompt";

interface ChapterChatModalProps {
  scope: ChapterScopeArgs | null;
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

export function ChapterChatModal({
  scope,
  onClose,
}: ChapterChatModalProps): React.ReactElement | null {
  const t = useTranslations("Book");
  const tChat = useTranslations("Chat");
  const tCommon = useTranslations("Common");
  const { messages, sendMessage, setMessages, status, error } = useChat();
  const [input, setInput] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef(true);

  useFocusTrap(scope !== null, dialogRef);

  // Reset state when the modal opens for a new scope (or closes).
  useEffect(() => {
    if (!scope) {
      setMessages([]);
      setInput("");
      firstMessageRef.current = true;
    }
  }, [scope, setMessages]);

  // ESC + scroll lock.
  useEffect(() => {
    if (!scope) return;
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
  }, [scope, onClose]);

  // Keep scroll pinned to bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  if (!scope) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const text = firstMessageRef.current
      ? applyChapterScope(trimmed, scope)
      : trimmed;
    firstMessageRef.current = false;
    sendMessage({ text });
    setInput("");
  };

  const isStreaming = status === "submitted" || status === "streaming";
  const errorMessage = error?.message?.trim()
    ? error.message
    : tCommon("errorFallback");
  const closeLabel = tCommon("close");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-chat-title"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/[.14] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-black/[.08] dark:border-white/[.12] p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2
              id="chapter-chat-title"
              className="text-base sm:text-lg font-semibold tracking-tight"
            >
              {t("askChapterModalTitle")}
            </h2>
            <p
              className="mt-1 text-xs text-black/65 dark:text-white/65"
              lang="ja"
            >
              {t("chapterBadge", { nn: scope.nn })} ·{" "}
              {t("pageRange", {
                first: scope.firstPage,
                last: scope.lastPage,
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
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3"
          aria-live="polite"
          aria-busy={isStreaming}
        >
          {messages.length === 0 && (
            <p className="text-center text-sm text-black/60 dark:text-white/60 py-8 px-2">
              {t("askChapterEmptyHint")}
            </p>
          )}
          {messages.map((m) => {
            const text = extractMessageText(m);
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isUser
                      ? "bg-black text-white dark:bg-white dark:text-black rounded-2xl px-4 py-2 max-w-[85%] whitespace-pre-wrap text-sm sm:text-base"
                      : "bg-black/[.04] dark:bg-white/[.08] rounded-2xl px-4 py-2 max-w-[85%] whitespace-pre-wrap text-sm sm:text-base"
                  }
                >
                  {text || (isUser ? "" : tChat("streaming"))}
                </div>
              </div>
            );
          })}
          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-black/[.04] dark:bg-white/[.08] rounded-2xl px-4 py-2 max-w-[85%] text-sm italic text-black/65 dark:text-white/65">
                {tChat("streaming")}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mx-4 sm:mx-5 mb-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm"
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-black/[.08] dark:border-white/[.12] p-3 sm:p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tChat("placeholder")}
            disabled={isStreaming}
            className={`flex-1 border border-black/[.18] dark:border-white/[.22] rounded-lg px-3 py-2 bg-white dark:bg-black text-sm sm:text-base disabled:opacity-50 ${FOCUS_RING}`}
            autoComplete="off"
            aria-label={tChat("inputAriaLabel")}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className={`bg-black text-white dark:bg-white dark:text-black rounded-lg px-4 py-2 text-sm sm:text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
          >
            {tCommon("send")}
          </button>
        </form>
      </div>
    </div>
  );
}
