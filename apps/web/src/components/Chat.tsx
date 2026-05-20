// Phase 2 Step 9 — <Chat /> client component (D-085 §2.1 Chat mode surface).
//
// Session 41 4Q-locked design:
//   Q1=a AI SDK data stream + useChat hook  →  zero custom SSE consumer logic.
//   Q2=a localStorage cross-session         →  history via historyStore.ts.
//   Q3=a pin last conversation              →  restore on mount; "新しい会話"
//                                                 button is the only path to
//                                                 clear (D-085 §2.2 §5.1 — 0
//                                                 思考成本启动).
//   Q4=a hardcoded zh-CN now                →  no i18n catalog; Step 12 抽取.
//
// Step 12 will integrate this surface into the 3-tab Layout (D-085 §2.3 Top
// tabs); for Step 9 it is mounted on a standalone /chat page to give Module C
// its first UI data point per D-094 §2.4 mid-implementation retro.

"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
} from "@/lib/chat/historyStore";

const PLACEHOLDER = "教科書に関する質問をどうぞ。例：DNS とは何か？";
const SEND_LABEL = "送信";
const NEW_CHAT_LABEL = "新しい会話 / 新对话";
const TITLE = "IT パスポート — Chat";
const SUBTITLE = "教科書ベース三語チューター（α 自用）";
const EMPTY_HINT =
  "AI が教科書（令和6年度 / 554 ページ）を文脈として回答します。" +
  "ページ番号引用は教科書原文との照合に使えます。";
const STREAMING_HINT = "回答生成中…";
const ERROR_FALLBACK = "AI 暂时不可用，请稍后重试。";

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
  const errorMessage = error?.message?.trim() ? error.message : ERROR_FALLBACK;

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto p-4 sm:p-6 gap-3">
      <header className="flex items-start justify-between border-b border-black/[.08] dark:border-white/[.12] pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 mt-1">
            {SUBTITLE}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 || isStreaming}
          className="text-xs sm:text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {NEW_CHAT_LABEL}
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 py-2"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-center text-sm text-black/50 dark:text-white/50 py-12 px-4">
            {EMPTY_HINT}
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
                {text || (isUser ? "" : STREAMING_HINT)}
              </div>
            </div>
          );
        })}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-black/[.04] dark:bg-white/[.08] rounded-2xl px-4 py-2 max-w-[80%] text-sm italic text-black/60 dark:text-white/60">
              {STREAMING_HINT}
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
          placeholder={PLACEHOLDER}
          disabled={isStreaming}
          className="flex-1 border border-black/[.12] dark:border-white/[.14] rounded-lg px-3 py-2 bg-white dark:bg-black text-sm sm:text-base focus:outline-none focus:border-black/40 dark:focus:border-white/40 disabled:opacity-50"
          autoComplete="off"
          aria-label="メッセージ入力"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="bg-black text-white dark:bg-white dark:text-black rounded-lg px-4 py-2 text-sm sm:text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {SEND_LABEL}
        </button>
      </form>
    </main>
  );
}
