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
// "content-filter") or an empty length cutoff via the thread Chat's onFinish; the
// error object is never logged or stored.
// `saveFailed` is true when the last save of the active thread was refused (quota;
// §0-6 shows a notice). `refreshKey()` re-reads the key after a same-tab save /
// delete (KeySettings onChange). Re-sending after a failed or refused turn first
// drops that turn (the panel puts its text back into the input), and `clear()`
// discards a reply still in flight (threadChat.clearThread).

"use client";

// Must stay first: sets zod's jitless flag before the AI SDK loads (CSP, see the module).
import "@/lib/sensei/zodJitless";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createBrowserTransport } from "@/lib/sensei/browserTransport";
import { toSenseiError, type SenseiError } from "@/lib/sensei/errors";
import { loadSenseiKey, SENSEI_KEY_STORAGE } from "@/lib/sensei/keyStore";
import { createThreadChat, dropFailedTurn } from "@/lib/sensei/threadChat";
import { loadThreadMessages, threadIdFor, type ThreadKind } from "@/lib/sensei/threadStore";
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
  saveFailed: boolean;
  refreshKey: () => void;
}

export function useSensei({ kind, anchorId, title, anchorText }: UseSenseiOptions): UseSenseiResult {
  const [hasKey, setHasKey] = useState(false);
  const [refusal, setRefusal] = useState<SenseiError | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  // Read at send time, so the transport stays one stable object.
  const anchorRef = useRef(anchorText);
  useEffect(() => {
    anchorRef.current = anchorText;
  }, [anchorText]);

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
      title,
      transport,
      getStorage: browserStorage,
      onUnanswered: (err) => {
        if (activeThreadRef.current === id) setRefusal(err);
      },
      onSaved: (ok) => {
        if (activeThreadRef.current === id) setSaveFailed(!ok);
      },
    });
  }, [kind, anchorId, title, transport]);

  const chat = useChat({ chat: threadChat });
  const { setMessages, sendMessage: chatSend, stop } = chat;

  // After mount / on anchor change: the stored thread and whether a key exists.
  // On switch (or unmount) the previous thread's in-flight response is stopped.
  useEffect(() => {
    activeThreadRef.current = threadChat.id;
    const storage = browserStorage();
    setMessages(storage ? loadThreadMessages(storage, threadChat.id) : []);
    setRefusal(null);
    setSaveFailed(false);
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

  const lastTurnFailed = chat.error !== undefined || refusal !== null;
  const sendMessage = useCallback<UseSenseiResult["sendMessage"]>(
    (...args) => {
      if (lastTurnFailed) setMessages(dropFailedTurn(threadChat.messages));
      setRefusal(null);
      return chatSend(...args);
    },
    [chatSend, lastTurnFailed, setMessages, threadChat],
  );

  const clear = useCallback(() => {
    threadChat.clearThread();
    setRefusal(null);
    setSaveFailed(false);
  }, [threadChat]);

  const refreshKey = useCallback(() => setHasKey(readHasKey()), []);

  // The key is read only when there is an error, to mask it in the message (M2).
  const error = useMemo(() => {
    if (!chat.error) return refusal;
    const storage = browserStorage();
    return toSenseiError(chat.error, (storage && loadSenseiKey(storage)) ?? undefined);
  }, [chat.error, refusal]);

  return {
    messages: chat.messages,
    sendMessage,
    status: chat.status,
    error,
    stop,
    clear,
    hasKey,
    saveFailed,
    refreshKey,
  };
}
