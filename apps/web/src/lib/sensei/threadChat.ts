// D-181 — one useChat `Chat` per AI 先生 thread. Its onFinish is bound to THIS
// thread (kind + anchorId + title fixed at creation), so a response that finishes
// after the learner switched anchors is saved into its own thread under its own
// title, never the new one's.
// useSensei creates one per threadId and stop()s the previous one on switch.
//
// clearThread() empties the chat and deletes the stored thread. A response that
// was in flight at that moment is aborted, but its onFinish still fires later
// (and a chunk already queued may still be written): that one finish is
// discarded, so the cleared thread is not recreated with the aborted reply.
//
// A turn that ends in an error, a refusal, or a length cutoff with no visible text
// is not saved (the stored thread keeps its earlier turns); a stopped (aborted)
// turn is saved with what it has.

import { Chat } from "@ai-sdk/react";
import type { ChatTransport, FinishReason, UIMessage } from "ai";

import type { StorageLike } from "@/lib/storage";

import { toSenseiError, type SenseiError } from "./errors";
import { deleteThread, openThread, saveThreadMessages, threadIdFor, type ThreadKind } from "./threadStore";

export type ThreadChat = Chat<UIMessage> & { clearThread(): void };

export function createThreadChat(opts: {
  kind: ThreadKind;
  anchorId: string;
  title: string;
  transport: ChatTransport<UIMessage>;
  getStorage(): StorageLike | null;
  /** A finished turn with no answer: a refusal, or a length cutoff before any text. */
  onUnanswered(err: SenseiError): void;
  /** After each save attempt: false when storage refused it (§0-6 notice). */
  onSaved?(ok: boolean): void;
}): ThreadChat {
  const { kind, anchorId, title } = opts;
  let discardInFlight = false;

  const chat: Chat<UIMessage> = new Chat<UIMessage>({
    id: threadIdFor(kind, anchorId),
    transport: opts.transport,
    onFinish: ({ message, messages, finishReason, isError }) => {
      if (discardInFlight) {
        discardInFlight = false;
        // drop the aborted reply if a late chunk pushed it back into the list
        chat.messages = chat.messages.filter((m) => m.id !== message.id);
        return;
      }
      // An errored, refused or empty length-cut turn (401 / 429 / network /
      // content-filter / length) is not persisted: the stored thread keeps its earlier
      // turns and the question is back in the input. Aborts still save.
      if (isError) return;
      if (finishReason === "content-filter" || isEmptyLengthCutoff(message, finishReason)) {
        opts.onUnanswered(toSenseiError({ finishReason }));
        return;
      }
      const storage = opts.getStorage();
      if (!storage || messages.length === 0) return;
      const meta = openThread(storage, { kind, anchorId, title });
      // evaluated first: `onSaved?.(save())` would skip the save when onSaved is absent
      const saved = saveThreadMessages(storage, meta.id, messages);
      opts.onSaved?.(saved);
    },
  });

  return Object.assign(chat, {
    clearThread(): void {
      if (chat.status === "submitted" || chat.status === "streaming") discardInFlight = true;
      void chat.stop();
      chat.messages = [];
      chat.clearError();
      const storage = opts.getStorage();
      if (storage) deleteThread(storage, chat.id);
    },
  });
}

/** The reply hit maxOutputTokens before any visible text (thinking counts toward the
 *  limit): the panel asks the learner to narrow the question (M5). */
export function isEmptyLengthCutoff(message: UIMessage, finishReason: FinishReason | undefined): boolean {
  if (finishReason !== "length") return false;
  return message.parts.every((p) => p.type !== "text" || p.text.trim() === "");
}

/** The messages before the last user turn: used before re-sending a question whose
 *  turn failed (error or refusal), so the model does not see it twice. */
export function dropFailedTurn(messages: UIMessage[]): UIMessage[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]!.role === "user") return messages.slice(0, i);
  }
  return messages;
}
