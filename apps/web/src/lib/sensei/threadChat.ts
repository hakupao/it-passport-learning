// D-181 — one useChat `Chat` per AI 先生 thread. Its onFinish is bound to THIS
// thread (kind + anchorId fixed at creation), so a response that finishes after
// the learner switched anchors is saved into its own thread, never the new one.
// useSensei creates one per threadId and stop()s the previous one on switch.

import { Chat } from "@ai-sdk/react";
import type { ChatTransport, UIMessage } from "ai";

import type { StorageLike } from "@/lib/storage";

import { toSenseiError, type SenseiError } from "./errors";
import { openThread, saveThreadMessages, threadIdFor, type ThreadKind } from "./threadStore";

export function createThreadChat(opts: {
  kind: ThreadKind;
  anchorId: string;
  getTitle(): string;
  transport: ChatTransport<UIMessage>;
  getStorage(): StorageLike | null;
  onRefusal(err: SenseiError): void;
}): Chat<UIMessage> {
  const { kind, anchorId } = opts;
  return new Chat<UIMessage>({
    id: threadIdFor(kind, anchorId),
    transport: opts.transport,
    onFinish: ({ messages, finishReason }) => {
      if (finishReason === "content-filter") opts.onRefusal(toSenseiError({ finishReason }));
      const storage = opts.getStorage();
      if (!storage || messages.length === 0) return;
      const meta = openThread(storage, { kind, anchorId, title: opts.getTitle() });
      saveThreadMessages(storage, meta.id, messages);
    },
  });
}
