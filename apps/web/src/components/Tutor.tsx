// Phase 4 Module C — <Tutor /> standalone page component (D-106 §2.1).

"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";

import type { ChapterSummary } from "@/lib/book/chapterScope";
import type { TutorContext } from "@/lib/tutor/tutorContext";
import { loadTutorContext } from "@/lib/tutor/tutorContext";
import { shouldEscalate } from "@/lib/tutor/escalation";
import {
  clearTutorHistory,
  loadTutorHistory,
  saveTutorHistory,
} from "@/lib/tutor/tutorHistoryStore";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

const tutorTransport = new DefaultChatTransport({ api: "/api/tutor" });

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function extractMessageText(msg: UIMessage): string {
  const parts = (msg as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

interface TutorProps {
  chapters: ChapterSummary[];
}

export function Tutor({ chapters }: TutorProps): React.ReactElement {
  const t = useTranslations("Tutor");
  const tCommon = useTranslations("Common");
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: tutorTransport,
  });
  const [input, setInput] = useState("");
  const [restored, setRestored] = useState(false);
  const ctxRef = useRef<TutorContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isBrowser()) {
      setRestored(true);
      return;
    }
    if (window.location.href.includes("@")) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.search + window.location.hash,
      );
    }
    ctxRef.current = loadTutorContext(window.localStorage, chapters);
    const prior = loadTutorHistory(window.localStorage);
    if (prior.length > 0) setMessages(prior);
    setRestored(true);
  }, [setMessages, chapters]);

  useEffect(() => {
    if (!restored || !isBrowser()) return;
    saveTutorHistory(window.localStorage, messages);
  }, [messages, restored]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const pendingUserMsg: UIMessage = {
      id: "pending-escalation-check",
      role: "user",
      parts: [{ type: "text", text: trimmed }],
    };
    const escalate = shouldEscalate([...messages, pendingUserMsg]);

    sendMessage(
      { text: trimmed },
      { body: { tutorContext: ctxRef.current, escalate } },
    );
    setInput("");
  };

  const handleClear = (): void => {
    setMessages([]);
    if (isBrowser()) {
      clearTutorHistory(window.localStorage);
      ctxRef.current = loadTutorContext(window.localStorage, chapters);
    }
  };

  const isStreaming = status === "submitted" || status === "streaming";
  const errorMessage = error?.message?.trim()
    ? error.message
    : tCommon("errorFallback");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-col h-[calc(100vh-3rem)] max-w-3xl mx-auto p-4 sm:p-6 gap-3 focus:outline-none"
    >
      <header className="flex items-start justify-between border-b border-black/[.08] dark:border-white/[.12] pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-black/65 dark:text-white/65 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 || isStreaming}
          className={`text-xs sm:text-sm text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md px-1 ${FOCUS_RING}`}
        >
          {t("newChat")}
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 py-2"
        aria-live="polite"
        aria-busy={isStreaming}
      >
        {messages.length === 0 && (
          <p className="text-center text-sm text-black/60 dark:text-white/60 py-12 px-4">
            {t("emptyHint")}
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
                    ? "bg-black text-white dark:bg-white dark:text-black rounded-2xl px-4 py-2 max-w-[80%] whitespace-pre-wrap text-sm sm:text-base"
                    : "bg-black/[.04] dark:bg-white/[.08] rounded-2xl px-4 py-2 max-w-[80%] whitespace-pre-wrap text-sm sm:text-base"
                }
              >
                {text || (isUser ? "" : t("streaming"))}
              </div>
            </div>
          );
        })}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-black/[.04] dark:bg-white/[.08] rounded-2xl px-4 py-2 max-w-[80%] text-sm italic text-black/65 dark:text-white/65">
              {t("streaming")}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          disabled={isStreaming}
          className={`flex-1 border border-black/[.18] dark:border-white/[.22] rounded-lg px-3 py-2 bg-white dark:bg-black text-sm sm:text-base disabled:opacity-50 ${FOCUS_RING}`}
          autoComplete="off"
          aria-label={t("inputAriaLabel")}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className={`bg-black text-white dark:bg-white dark:text-black rounded-lg px-4 py-2 text-sm sm:text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
        >
          {tCommon("send")}
        </button>
      </form>
    </main>
  );
}
