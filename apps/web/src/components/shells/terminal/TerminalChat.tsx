"use client";

import { useTranslations } from "next-intl";
import { useChatSession, extractMessageText } from "@/hooks/useChatSession";
import { TerminalPrompt } from "./TerminalPrompt";

export function TerminalChat(): React.ReactElement {
  const t = useTranslations("Chat");
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
  } = useChatSession(tCommon("errorFallback"));

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 gap-3 font-mono text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#444] pb-2">
        <div>
          <div className="text-[#4ec9b0] font-semibold"># {t("title")}</div>
          <div className="text-[#555] text-xs">{t("subtitle")}</div>
        </div>
        {messages.length > 0 && (
          <span className="text-[#555] text-xs">[ctrl+l to clear]</span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 py-1"
        aria-live="polite"
        aria-busy={isStreaming}
      >
        {messages.length === 0 && (
          <div className="text-[#555] py-8 px-2 text-xs">
            <div className="text-[#6a9955]"># {t("emptyHint")}</div>
          </div>
        )}
        {messages.map((m) => {
          const text = extractMessageText(m);
          const isUser = m.role === "user";
          return (
            <div key={m.id} className="space-y-0.5">
              {isUser ? (
                <TerminalPrompt text={text} />
              ) : (
                <div className="border-l-2 border-[#ce9178] pl-3 ml-2 text-[#ce9178] whitespace-pre-wrap leading-relaxed text-sm">
                  {text || <span className="italic text-[#555]">{t("streaming")}</span>}
                </div>
              )}
            </div>
          );
        })}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="border-l-2 border-[#ce9178] pl-3 ml-2">
            <span className="italic text-[#555]">{t("streaming")}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="text-[#f44747] border border-[#f44747] px-3 py-2 text-xs"
        >
          <span className="text-[#808080]">stderr: </span>
          {errorMessage}
        </div>
      )}

      {/* Input — terminal command line style */}
      <div className="border-t border-[#333] pt-2">
        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}
          className="flex items-center gap-0"
        >
          <span className="text-[#6a9955] shrink-0">you@itp</span>
          <span className="text-[#808080] shrink-0">:</span>
          <span className="text-[#569cd6] shrink-0">~</span>
          <span className="text-[#808080] shrink-0">$ </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "l") {
                e.preventDefault();
                handleClear();
              }
            }}
            disabled={isStreaming}
            className="flex-1 bg-transparent border-none outline-none text-[#d4d4d4] font-mono text-sm disabled:opacity-50 caret-[#d4d4d4]"
            autoComplete="off"
            autoFocus
            aria-label={t("inputAriaLabel")}
          />
        </form>
      </div>
    </div>
  );
}
