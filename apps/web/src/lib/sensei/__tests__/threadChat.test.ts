import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { describe, expect, it, vi } from "vitest";

import type { StorageLike } from "@/lib/storage";

import { createThreadChat, dropFailedTurn } from "../threadChat";
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

/** A transport that ignores the abort signal: its stream keeps going until finish(). */
function deafTransport(reply: string) {
  const state = { finish: () => {}, calls: 0 };
  const transport: ChatTransport<UIMessage> = {
    sendMessages: async () => {
      state.calls++;
      return new ReadableStream<UIMessageChunk>({
        start(c) {
          c.enqueue({ type: "start" });
          c.enqueue({ type: "text-start", id: "t" });
          c.enqueue({ type: "text-delta", id: "t", delta: reply });
          state.finish = () => {
            c.enqueue({ type: "text-delta", id: "t", delta: "（続き）" });
            c.enqueue({ type: "text-end", id: "t" });
            c.enqueue({ type: "finish", finishReason: "stop" });
            c.close();
          };
        },
      });
    },
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

  it("clearThread() while streaming: the aborted response finishing later does not recreate the thread", async () => {
    const storage = memoryStorage();
    const deaf = deafTransport("A の途中");
    const onSaved = vi.fn();
    const chatA = createThreadChat({ ...A, transport: deaf.transport, getStorage: () => storage, onRefusal: () => {}, onSaved });
    const idA = threadIdFor(A.kind, A.anchorId);

    // a finished first turn is saved and reported
    const first = chatA.sendMessage({ text: "最初の質問" });
    await until(() => chatA.status === "streaming");
    deaf.state.finish();
    await first;
    expect(onSaved).toHaveBeenLastCalledWith(true);
    expect(texts(loadThreadMessages(storage, idA))).toHaveLength(2);

    // second turn: cleared mid-stream; the stream ignores the abort and still finishes
    const second = chatA.sendMessage({ text: "二つ目の質問" });
    await until(() => chatA.status === "streaming");
    chatA.clearThread();
    expect(chatA.messages).toEqual([]);
    deaf.state.finish();
    await second;

    expect(listThreads(storage)).toEqual([]);
    expect(storage.data.has(threadStorageKey(idA))).toBe(false);
    expect(chatA.messages).toEqual([]); // the late partial reply is not shown either
    expect(onSaved).toHaveBeenCalledTimes(1);

    // the guard is spent: the next turn is saved normally
    const third = chatA.sendMessage({ text: "三つ目の質問" });
    await until(() => chatA.status === "streaming");
    deaf.state.finish();
    await third;
    expect(texts(loadThreadMessages(storage, idA))).toEqual(["user:三つ目の質問", "assistant:A の途中（続き）"]);
  });

  it("clearThread() when idle does not swallow the next save", async () => {
    const storage = memoryStorage();
    const deaf = deafTransport("回答");
    const chatA = createThreadChat({ ...A, transport: deaf.transport, getStorage: () => storage, onRefusal: () => {} });
    chatA.clearThread();
    const sending = chatA.sendMessage({ text: "質問" });
    await until(() => chatA.status === "streaming");
    deaf.state.finish();
    await sending;
    expect(texts(loadThreadMessages(storage, threadIdFor(A.kind, A.anchorId)))).toEqual([
      "user:質問",
      "assistant:回答（続き）",
    ]);
  });

  it("an errored turn is not persisted: a new thread stays unsaved, an existing one keeps its earlier turns", async () => {
    const storage = memoryStorage();
    const state = { fail: true };
    const transport: ChatTransport<UIMessage> = {
      sendMessages: async () =>
        new ReadableStream<UIMessageChunk>({
          start(c) {
            c.enqueue({ type: "start" });
            if (state.fail) {
              c.enqueue({ type: "error", errorText: "invalid x-api-key" });
            } else {
              c.enqueue({ type: "text-start", id: "t" });
              c.enqueue({ type: "text-delta", id: "t", delta: "回答" });
              c.enqueue({ type: "text-end", id: "t" });
              c.enqueue({ type: "finish", finishReason: "stop" });
            }
            c.close();
          },
        }),
      reconnectToStream: async () => null,
    };
    const onSaved = vi.fn();
    const chatA = createThreadChat({ ...A, transport, getStorage: () => storage, onRefusal: () => {}, onSaved });
    const idA = threadIdFor(A.kind, A.anchorId);

    // first turn fails: nothing is written (no index entry, no message key)
    await chatA.sendMessage({ text: "失敗する質問" });
    expect(chatA.status).toBe("error");
    expect(listThreads(storage)).toEqual([]);
    expect(storage.data.has(threadStorageKey(idA))).toBe(false);
    expect(onSaved).not.toHaveBeenCalled();

    // a successful turn is saved; a later failed turn leaves the stored turns as they were
    state.fail = false;
    chatA.messages = [];
    await chatA.sendMessage({ text: "成功する質問" });
    expect(texts(loadThreadMessages(storage, idA))).toEqual(["user:成功する質問", "assistant:回答"]);
    state.fail = true;
    await chatA.sendMessage({ text: "二度目の失敗" });
    expect(chatA.status).toBe("error");
    expect(texts(loadThreadMessages(storage, idA))).toEqual(["user:成功する質問", "assistant:回答"]);
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("reports a refused save through onSaved(false)", async () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    const deaf = deafTransport("回答");
    const onSaved = vi.fn();
    const chatA = createThreadChat({ ...A, transport: deaf.transport, getStorage: () => storage, onRefusal: () => {}, onSaved });
    const sending = chatA.sendMessage({ text: "質問" });
    await until(() => chatA.status === "streaming");
    deaf.state.finish();
    await sending;
    expect(onSaved).toHaveBeenCalledWith(false);
  });
});

describe("dropFailedTurn", () => {
  const u = (id: string): UIMessage => ({ id, role: "user", parts: [{ type: "text", text: id }] });
  const a = (id: string, text = id): UIMessage => ({ id, role: "assistant", parts: [{ type: "text", text }] });

  it("drops the last user message and everything after it", () => {
    expect(dropFailedTurn([u("u1"), a("a1"), u("u2"), a("a2", "")])).toEqual([u("u1"), a("a1")]);
    expect(dropFailedTurn([u("u1"), a("a1"), u("u2")])).toEqual([u("u1"), a("a1")]);
    expect(dropFailedTurn([u("u1"), a("a1"), u("u2"), a("a2", "途中")])).toEqual([u("u1"), a("a1")]);
  });

  it("returns the list unchanged when there is no user message", () => {
    const only = [a("a1")];
    expect(dropFailedTurn(only)).toEqual(only);
    expect(dropFailedTurn([])).toEqual([]);
  });
});
