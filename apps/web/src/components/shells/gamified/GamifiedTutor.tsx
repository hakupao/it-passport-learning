"use client";

import { useTranslations } from "next-intl";
import type { ChapterSummary } from "@/lib/book/chapterScope";
import { useTutorSession } from "@/hooks/useTutorSession";
import { Markdown } from "@/components/Markdown";
import { extractMessageText } from "@/hooks/useChatSession";

interface GamifiedTutorProps {
  chapters: ChapterSummary[];
}

export function GamifiedTutor({ chapters }: GamifiedTutorProps): React.ReactElement {
  const t = useTranslations("Tutor");
  const tCommon = useTranslations("Common");
  const {
    messages,
    input,
    setInput,
    isStreaming,
    error,
    errorMessage,
    scrollRef,
    handleSubmit,
    handleClear,
  } = useTutorSession(chapters, tCommon("errorFallback"));

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-3xl mx-auto p-4 sm:p-6 gap-5">
      <header className="flex items-start justify-between border-b border-white/[.08] pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs text-white/50 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 || isStreaming}
          className="h-7 px-3 rounded-md bg-white/[.06] border border-white/[.1] text-xs font-medium text-white/50 hover:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560]"
        >
          {t("newChat")}
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 py-2"
        aria-live="polite"
        aria-busy={isStreaming}
      >
        {messages.length === 0 && (
          <p className="text-center text-sm text-white/40 py-12 px-4">
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
                    ? "bg-[#e94560] text-white rounded-2xl px-4 py-2 max-w-[75%] whitespace-pre-wrap text-sm leading-relaxed"
                    : "bg-white/[.06] border border-white/[.08] rounded-2xl px-4 py-2 max-w-[75%] text-sm leading-relaxed"
                }
              >
                {isUser
                  ? text
                  : text
                    ? <Markdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{text}</Markdown>
                    : t("streaming")
                }
              </div>
            </div>
          );
        })}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-white/[.06] border border-white/[.08] rounded-2xl px-4 py-2 max-w-[75%] text-sm italic text-white/50">
              {t("streaming")}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-950/40 border border-red-800/60 text-red-300 px-3 py-2 rounded-lg text-sm"
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
          className="flex-1 h-10 border border-white/[.12] rounded-lg px-3 bg-white/[.04] text-white placeholder:text-white/30 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560]"
          autoComplete="off"
          aria-label={t("inputAriaLabel")}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="h-10 px-5 bg-[#e94560] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
        >
          {tCommon("send")}
        </button>
      </form>
    </div>
  );
}
