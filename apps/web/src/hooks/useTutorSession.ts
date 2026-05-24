"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import type { ChapterSummary } from "@/lib/book/chapterScope";
import type { TutorContext } from "@/lib/tutor/tutorContext";
import { loadTutorContext } from "@/lib/tutor/tutorContext";
import { shouldEscalate } from "@/lib/tutor/escalation";
import {
  clearTutorHistory,
  loadTutorHistory,
  saveTutorHistory,
} from "@/lib/tutor/tutorHistoryStore";
import { isBrowser } from "./useChatSession";

const tutorTransport = new DefaultChatTransport({ api: "/api/tutor" });

export interface TutorSessionState {
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

export function useTutorSession(
  chapters: ChapterSummary[],
  errorFallback: string,
): TutorSessionState {
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

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>): void => {
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
  }, [input, messages, sendMessage]);

  const handleClear = useCallback((): void => {
    setMessages([]);
    if (isBrowser()) {
      clearTutorHistory(window.localStorage);
      ctxRef.current = loadTutorContext(window.localStorage, chapters);
    }
  }, [setMessages, chapters]);

  const isStreaming = status === "submitted" || status === "streaming";
  const errorMessage = error?.message?.trim() ? error.message : errorFallback;

  return {
    messages, input, setInput, isStreaming, error, errorMessage,
    scrollRef, handleSubmit, handleClear,
  };
}
