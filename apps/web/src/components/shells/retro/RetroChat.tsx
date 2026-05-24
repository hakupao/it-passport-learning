"use client";

import { useTranslations } from "next-intl";
import { useChatSession, extractMessageText } from "@/hooks/useChatSession";

export function RetroChat(): React.ReactElement {
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
    <div className="flex flex-col h-[calc(100vh-8rem)] p-2 gap-2 text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#808080] pb-1">
        <div>
          <h1 className="text-sm font-bold">{t("title")}</h1>
          <p className="text-[10px] text-[#808080]">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 || isStreaming}
          className="text-[10px] bg-[#c0c0c0] border-2 border-outset-retro px-2 py-0.5 disabled:opacity-50 disabled:cursor-not-allowed active:border-inset-retro"
        >
          {t("newChat")}
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto border-2 border-inset-retro bg-white p-1 space-y-1"
        aria-live="polite"
        aria-busy={isStreaming}
      >
        {messages.length === 0 && (
          <p className="text-center text-[11px] text-[#808080] py-8 px-4">
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
                    ? "bg-[#ffffcc] border border-[#808080] px-3 py-1.5 max-w-[80%] whitespace-pre-wrap text-xs"
                    : "bg-[#e0e0e0] border border-[#808080] px-3 py-1.5 max-w-[80%] whitespace-pre-wrap text-xs"
                }
              >
                {text || (isUser ? "" : t("streaming"))}
              </div>
            </div>
          );
        })}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-[#e0e0e0] border border-[#808080] px-3 py-1.5 max-w-[80%] text-xs italic text-[#808080]">
              {t("streaming")}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="bg-[#ffcccc] border border-[#cc0000] text-[#cc0000] px-2 py-1 text-xs"
        >
          {errorMessage}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          disabled={isStreaming}
          className="flex-1 h-7 border-2 border-inset-retro px-2 text-xs bg-white disabled:bg-[#c0c0c0] focus:outline-none"
          autoComplete="off"
          aria-label={t("inputAriaLabel")}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="h-7 px-4 bg-[#c0c0c0] border-2 border-outset-retro text-xs disabled:opacity-50 disabled:cursor-not-allowed active:border-inset-retro"
        >
          {tCommon("send")}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 || isStreaming}
          className="h-7 px-4 bg-[#c0c0c0] border-2 border-outset-retro text-xs disabled:opacity-50 disabled:cursor-not-allowed active:border-inset-retro"
        >
          {t("newChat")}
        </button>
      </form>
    </div>
  );
}
