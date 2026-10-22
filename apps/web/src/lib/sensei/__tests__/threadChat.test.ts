import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { describe, expect, it, vi } from "vitest";

import type { StorageLike } from "@/lib/storage";

import { createThreadChat } from "../threadChat";
import { listThreads, loadThreadMessages, threadIdFor, threadStorageKey } from "../threadStore";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

/** A transport whose stream stays open until finish() or until the request is aborted. */
function heldTransport(reply: string) {
  const state = { aborted: false, finish: () => {} };
  const transport: ChatTransport<UIMessage> = {
    sendMessages: async ({ abortSignal }) =>
      new ReadableStream<UIMessageChunk>({
        start(c) {
          c.enqueue({ type: "start" });
          c.enqueue({ type: "text-start", id: "t" });
          c.enqueue({ type: "text-delta", id: "t", delta: reply });
          state.finish = () => {
            c.enqueue({ type: "text-end", id: "t" });
            c.enqueue({ type: "finish", finishReason: "stop" });
            c.close();
          };
          abortSignal?.addEventListener("abort", () => {
            state.aborted = true;
            c.error(new DOMException("This operation was aborted", "AbortError"));
          });
        },
      }),
    reconnectToStream: async () => null,
  };
  return { transport, state };
}

async function until(cond: () => boolean): Promise<void> {
  for (let i = 0; i < 200 && !cond(); i++) await new Promise((r) => setTimeout(r, 0));
  expect(cond()).toBe(true);
}

function texts(messages: UIMessage[]): string[] {
  return messages.flatMap((m) => m.parts.flatMap((p) => (p.type === "text" ? [`${m.role}:${p.text}`] : [])));
}

const A = { kind: "question" as const, anchorId: "qA:イ", getTitle: () => "問A" };
const B = { kind: "question" as const, anchorId: "qB:reveal", getTitle: () => "問B" };

describe("createThreadChat (one Chat per thread)", () => {
  it("a response that finishes after an anchor switch is saved only into its own thread", async () => {
    const storage = memoryStorage();
    const a = heldTransport("A の回答");
    const onRefusal = vi.fn();
    const chatA = createThreadChat({ ...A, transport: a.transport, getStorage: () => storage, onRefusal });
    const sendingA = chatA.sendMessage({ text: "A の質問" });
    await until(() => chatA.status === "streaming");

    // the learner switches to anchor B while A is still streaming
    const b = heldTransport("B の回答");
    const chatB = createThreadChat({ ...B, transport: b.transport, getStorage: () => storage, onRefusal });
    const sendingB = chatB.sendMessage({ text: "B の質問" });
    await until(() => chatB.status === "streaming");
    b.state.finish();
    await sendingB;

    a.state.finish(); // A's reply completes late
    await sendingA;

    expect(texts(loadThreadMessages(storage, threadIdFor(A.kind, A.anchorId)))).toEqual([
      "user:A の質問",
      "assistant:A の回答",
    ]);
    expect(texts(loadThreadMessages(storage, threadIdFor(B.kind, B.anchorId)))).toEqual([
      "user:B の質問",
      "assistant:B の回答",
    ]);
    expect(onRefusal).not.toHaveBeenCalled();
  });

  it("stop() on the old chat (the hook's cleanup on anchor switch) aborts its stream; B stays untouched", async () => {
    const storage = memoryStorage();
    const a = heldTransport("A の途中");
    const chatA = createThreadChat({ ...A, transport: a.transport, getStorage: () => storage, onRefusal: () => {} });
    const sendingA = chatA.sendMessage({ text: "A の質問" });
    await until(() => chatA.status === "streaming");

    createThreadChat({ ...B, transport: heldTransport("B").transport, getStorage: () => storage, onRefusal: () => {} });
    await chatA.stop();
    await sendingA;

    expect(a.state.aborted).toBe(true);
    expect(texts(loadThreadMessages(storage, threadIdFor(A.kind, A.anchorId)))[0]).toBe("user:A の質問");
    expect(storage.data.has(threadStorageKey(threadIdFor(B.kind, B.anchorId)))).toBe(false);
    expect(listThreads(storage).map((t) => t.anchorId)).toEqual([A.anchorId]);
  });

  it("reports a content-filter finish through onRefusal of that chat only", async () => {
    const storage = memoryStorage();
    const transport: ChatTransport<UIMessage> = {
      sendMessages: async () =>
        new ReadableStream<UIMessageChunk>({
          start(c) {
            c.enqueue({ type: "start" });
            c.enqueue({ type: "finish", finishReason: "content-filter" });
            c.close();
          },
        }),
      reconnectToStream: async () => null,
    };
    const onRefusalA = vi.fn();
    const chatA = createThreadChat({ ...A, transport, getStorage: () => storage, onRefusal: onRefusalA });
    await chatA.sendMessage({ text: "?" });
    expect(onRefusalA).toHaveBeenCalledWith({ kind: "refusal", message: "" });
  });
});
