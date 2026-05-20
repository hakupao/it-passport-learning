// Phase 2 Step 9 — <Chat /> client component (D-085 §2.1 Chat mode surface).
//
// Session 41 4Q-locked design (history):
//   Q1=a AI SDK data stream + useChat hook  →  zero custom SSE consumer logic.
//   Q2=a localStorage cross-session         →  history via historyStore.ts.
//   Q3=a pin last conversation              →  restore on mount; new-chat
//                                                 button is the only clear path
//                                                 (D-085 §2.2 §5.1).
//   Q4=a hardcoded zh-CN now                →  Step 12 i18n catalog extraction.
//
// Step 12 (Session 44, D-099) integration:
//   - All surface strings now flow through useTranslations("Chat") + Common.
//   - ERROR_FALLBACK was D-088 §2.4 locked Chinese; D-099 §2.5 partial-supersede
//     extends the lock to locale-aware variants (ja/zh/en) — same principle,
//     per-locale lock.
//   - Surface is now mounted under [locale]/chat, inheriting the top NavTabs.

"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
} from "@/lib/chat/historyStore";

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

export function Chat(): React.ReactElement {
  const t = useTranslations("Chat");
  const tCommon = useTranslations("Common");
  const { messages, sendMessage, setMessages, status, error } = useChat();
  const [input, setInput] = useState("");
  const [restored, setRestored] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // On mount: restore last conversation per Q3=a pin-last. Done in an effect
  // (not as initialState) so the first server render shows the empty state and
  // React hydration stays stable; the restore happens client-side only.
  //
  // Defensive URL-credential strip: when the page is reached via a URL of the
  // shape `https://user:pass@host/chat` (e.g. an old bookmark or an automated
  // smoke harness), Chrome refuses to call `fetch()` with a same-origin URL
  // resolved against `window.location.href`, throwing "Request cannot be
  // constructed from a URL that includes credentials". `useChat`'s default
  // transport hits exactly that path. The D-097 firewall's Basic Auth has
  // already been honoured by the time this effect runs (Chrome's HTTP auth
  // cache holds the credentials for the session), so replacing the URL with a
  // credential-free copy is purely a fetch-construction fix and does not
  // weaken the firewall.
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
    const prior = loadChatHistory(window.localStorage);
    if (prior.length > 0) setMessages(prior);
    setRestored(true);
  }, [setMessages]);

  // Persist on every messages change (after the initial restore so the empty
  // initial state doesn't overwrite a saved thread before restore lands).
  useEffect(() => {
    if (!restored || !isBrowser()) return;
    saveChatHistory(window.localStorage, messages);
  }, [messages, restored]);

  // Keep the scroll pinned to the bottom as messages stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const handleClear = (): void => {
    setMessages([]);
    if (isBrowser()) clearChatHistory(window.localStorage);
  };

  const isStreaming = status === "submitted" || status === "streaming";
  const errorMessage = error?.message?.trim()
    ? error.message
    : tCommon("errorFallback");

  return (
    <main className="flex flex-col h-[calc(100vh-3rem)] max-w-3xl mx-auto p-4 sm:p-6 gap-3">
      <header className="flex items-start justify-between border-b border-black/[.08] dark:border-white/[.12] pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 || isStreaming}
          className="text-xs sm:text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t("newChat")}
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 py-2"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-center text-sm text-black/50 dark:text-white/50 py-12 px-4">
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
            <div className="bg-black/[.04] dark:bg-white/[.08] rounded-2xl px-4 py-2 max-w-[80%] text-sm italic text-black/60 dark:text-white/60">
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
          className="flex-1 border border-black/[.12] dark:border-white/[.14] rounded-lg px-3 py-2 bg-white dark:bg-black text-sm sm:text-base focus:outline-none focus:border-black/40 dark:focus:border-white/40 disabled:opacity-50"
          autoComplete="off"
          aria-label={t("inputAriaLabel")}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="bg-black text-white dark:bg-white dark:text-black rounded-lg px-4 py-2 text-sm sm:text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {tCommon("send")}
        </button>
      </form>
    </main>
  );
}
