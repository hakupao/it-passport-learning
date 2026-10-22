// D-181 — one AI 先生 conversation bound to an anchor (question / review / term /
// unit / free). useChat runs on the browser transport (no server route); the
// thread is persisted locally through threadStore (one thread per kind +
// anchorId; it is created in the index only once something is saved). Each
// thread owns its Chat (threadChat.ts); switching anchors stops the old one.
//
// SSR-safe: the first render (server and client) has no messages and no key;
// the stored thread and key are read after mount. Messages are saved when a
// response finishes (not per token). `error` is the mapped SenseiError only —
// stream / API errors via toSenseiError, an Anthropic refusal (finishReason
// "content-filter") via the thread Chat's onFinish; the error object is never logged or stored.

"use client";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createBrowserTransport } from "@/lib/sensei/browserTransport";
import { toSenseiError, type SenseiError } from "@/lib/sensei/errors";
import { loadSenseiKey, SENSEI_KEY_STORAGE } from "@/lib/sensei/keyStore";
import { createThreadChat } from "@/lib/sensei/threadChat";
import { deleteThread, loadThreadMessages, threadIdFor, type ThreadKind } from "@/lib/sensei/threadStore";
import type { StorageLike } from "@/lib/storage";

/** window.localStorage, or null where it is unavailable (SSR, blocked storage). */
function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readHasKey(): boolean {
  const storage = browserStorage();
  return storage !== null && loadSenseiKey(storage) !== null;
}

export interface UseSenseiOptions {
  kind: ThreadKind;
  anchorId: string;
  title: string;
  anchorText: string;
}

export interface UseSenseiResult {
  messages: UIMessage[];
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
  status: UseChatHelpers<UIMessage>["status"];
  error: SenseiError | null;
  stop: () => void;
  clear: () => void;
  hasKey: boolean;
}

export function useSensei({ kind, anchorId, title, anchorText }: UseSenseiOptions): UseSenseiResult {
  const [hasKey, setHasKey] = useState(false);
  const [refusal, setRefusal] = useState<SenseiError | null>(null);

  // Read at send / save time, so the transport stays one stable object.
  const anchorRef = useRef(anchorText);
  const titleRef = useRef(title);
  useEffect(() => {
    anchorRef.current = anchorText;
    titleRef.current = title;
  }, [anchorText, title]);

  const transport = useMemo(
    () =>
      createBrowserTransport({
        getKey: () => {
          const storage = browserStorage();
          const key = storage ? loadSenseiKey(storage) : null;
          setHasKey(key !== null);
          return key;
        },
        getAnchor: () => anchorRef.current,
        onMissingKey: () => setHasKey(false),
      }),
    [],
  );

  // One Chat per thread: its onFinish saves into its own thread even if it
  // finishes after an anchor switch; only the active thread may show a refusal.
  const activeThreadRef = useRef<string | null>(null);
  const threadChat = useMemo(() => {
    const id = threadIdFor(kind, anchorId);
    return createThreadChat({
      kind,
      anchorId,
      getTitle: () => titleRef.current,
      transport,
      getStorage: browserStorage,
      onRefusal: (err) => {
        if (activeThreadRef.current === id) setRefusal(err);
      },
    });
  }, [kind, anchorId, transport]);

  const chat = useChat({ chat: threadChat });
  const { setMessages, sendMessage: chatSend, stop, clearError } = chat;

  // After mount / on anchor change: the stored thread and whether a key exists.
  // On switch (or unmount) the previous thread's in-flight response is stopped.
  useEffect(() => {
    activeThreadRef.current = threadChat.id;
    const storage = browserStorage();
    setMessages(storage ? loadThreadMessages(storage, threadChat.id) : []);
    setRefusal(null);
    setHasKey(readHasKey());
    return () => {
      void threadChat.stop();
    };
  }, [threadChat, setMessages]);

  // A key saved or deleted in another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === SENSEI_KEY_STORAGE) setHasKey(readHasKey());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sendMessage = useCallback<UseSenseiResult["sendMessage"]>(
    (...args) => {
      setRefusal(null);
      return chatSend(...args);
    },
    [chatSend],
  );

  const clear = useCallback(() => {
    void stop();
    setMessages([]);
    clearError();
    setRefusal(null);
    const storage = browserStorage();
    if (storage) deleteThread(storage, threadChat.id);
  }, [stop, setMessages, clearError, threadChat]);

  const error = useMemo(() => (chat.error ? toSenseiError(chat.error) : refusal), [chat.error, refusal]);

  return {
    messages: chat.messages,
    sendMessage,
    status: chat.status,
    error,
    stop,
    clear,
    hasKey,
  };
}
