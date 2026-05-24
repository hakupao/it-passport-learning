"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
} from "@/lib/chat/historyStore";

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function extractMessageText(msg: UIMessage): string {
  const parts = (msg as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (!parts) return "";
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

export interface ChatSessionState {
  messages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  isStreaming: boolean;
  error: Error | undefined;
  errorMessage: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleClear: () => void;
}

export function useChatSession(errorFallback: string): ChatSessionState {
  const { messages, sendMessage, setMessages, status, error } = useChat();
  const [input, setInput] = useState("");
  const [restored, setRestored] = useState(false);
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
    const prior = loadChatHistory(window.localStorage);
    if (prior.length > 0) setMessages(prior);
    setRestored(true);
  }, [setMessages]);

  useEffect(() => {
    if (!restored || !isBrowser()) return;
    saveChatHistory(window.localStorage, messages);
  }, [messages, restored]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage({ text: trimmed });
    setInput("");
  }, [input, sendMessage]);

  const handleClear = useCallback((): void => {
    setMessages([]);
    if (isBrowser()) clearChatHistory(window.localStorage);
  }, [setMessages]);

  const isStreaming = status === "submitted" || status === "streaming";
  const errorMessage = error?.message?.trim() ? error.message : errorFallback;

  return {
    messages, input, setInput, isStreaming, error, errorMessage,
    scrollRef, handleSubmit, handleClear,
  };
}
