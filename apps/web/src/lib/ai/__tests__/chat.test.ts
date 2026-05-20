// Unit tests for the shared single-shot SSE encoder in `lib/ai/chat.ts`.
//
// Originally Step 5 also tested `validateChatRequestBody` here; those cases
// were retired in Step 9 when `/api/chat` migrated to the AI SDK v6 UI message
// stream protocol (the validator + ChatRequestBody type had no other caller).
// `buildChatSseResponse` remains in use by /api/{hello-ai, quiz/explain,
// glossary/hover}.
//
// Coverage:
//   - SSE wire format, delta ordering, usage frame derivation
//     (anthropic + deepseek + unknown), empty-chunk skip, error path
//     → error frame, header set (6 cases)

import { describe, expect, it, vi } from "vitest";

import { buildChatSseResponse } from "../chat";

async function* asyncIter<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) yield item;
}

async function* failingIter(message: string): AsyncGenerator<string> {
  yield "first chunk";
  throw new Error(message);
}

async function collectSseFrames(response: Response): Promise<string[]> {
  expect(response.body).not.toBeNull();
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const frames: string[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx = buffer.indexOf("\n\n");
    while (idx >= 0) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      if (raw.startsWith("data: ")) {
        frames.push(raw.slice("data: ".length));
      }
      idx = buffer.indexOf("\n\n");
    }
  }
  return frames;
}

describe("buildChatSseResponse — SSE wire format + framing", () => {
  it("emits delta frames in arrival order, then a usage frame, then [DONE]", async () => {
    const response = buildChatSseResponse({
      textStream: asyncIter(["alpha", "beta", "gamma"]),
      usagePromise: Promise.resolve({
        inputTokens: 1000,
        outputTokens: 30,
        totalTokens: 1030,
      }),
      providerMetadataPromise: Promise.resolve({
        deepseek: { promptCacheHitTokens: 990, promptCacheMissTokens: 10 },
      }),
      provider: "deepseek",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/text\/event-stream/);
    expect(response.headers.get("X-LLM-Provider")).toBe("deepseek");
    expect(response.headers.get("Cache-Control")).toMatch(/no-cache/);

    const frames = await collectSseFrames(response);
    expect(frames).toHaveLength(5);
    expect(JSON.parse(frames[0]!)).toEqual({ type: "delta", text: "alpha" });
    expect(JSON.parse(frames[1]!)).toEqual({ type: "delta", text: "beta" });
    expect(JSON.parse(frames[2]!)).toEqual({ type: "delta", text: "gamma" });

    const usage = JSON.parse(frames[3]!);
    expect(usage).toMatchObject({
      type: "usage",
      provider: "deepseek",
      cacheReadInputTokens: 990,
      cacheMissInputTokens: 10,
      cacheCreationInputTokens: null,
      inputTokens: 1000,
      outputTokens: 30,
      totalTokens: 1030,
    });

    expect(frames[4]).toBe("[DONE]");
  });

  it("skips empty-string chunks (so the wire is not polluted by zero-byte SSE events)", async () => {
    const response = buildChatSseResponse({
      textStream: asyncIter(["", "hi", ""]),
      usagePromise: Promise.resolve({
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      }),
      providerMetadataPromise: Promise.resolve(undefined),
      provider: "deepseek",
    });
    const frames = await collectSseFrames(response);
    // Exactly: 1 delta + 1 usage + 1 [DONE]; empties suppressed.
    expect(frames).toHaveLength(3);
    expect(JSON.parse(frames[0]!)).toEqual({ type: "delta", text: "hi" });
  });

  it("derives anthropic-shape usage frame from providerMetadata.anthropic", async () => {
    const response = buildChatSseResponse({
      textStream: asyncIter(["ok"]),
      usagePromise: Promise.resolve({
        inputTokens: 19800,
        outputTokens: 2,
        totalTokens: 19802,
      }),
      providerMetadataPromise: Promise.resolve({
        anthropic: {
          cacheCreationInputTokens: 19800,
          cacheReadInputTokens: 0,
        },
      }),
      provider: "anthropic",
    });
    const frames = await collectSseFrames(response);
    const usage = JSON.parse(frames[1]!);
    expect(usage).toMatchObject({
      type: "usage",
      provider: "anthropic",
      cacheCreationInputTokens: 19800,
      cacheReadInputTokens: 0,
      cacheMissInputTokens: null,
    });
  });

  it("emits unknown-provider usage when providerMetadata is undefined", async () => {
    const response = buildChatSseResponse({
      textStream: asyncIter(["x"]),
      usagePromise: Promise.resolve({
        inputTokens: 5,
        outputTokens: 1,
        totalTokens: 6,
      }),
      providerMetadataPromise: Promise.resolve(undefined),
      provider: "deepseek",
    });
    const frames = await collectSseFrames(response);
    const usage = JSON.parse(frames[1]!);
    expect(usage.provider).toBe("unknown");
    expect(usage.cacheCreationInputTokens).toBeNull();
    expect(usage.cacheReadInputTokens).toBeNull();
    expect(usage.cacheMissInputTokens).toBeNull();
    expect(usage.inputTokens).toBe(5);
  });

  it("emits an error frame (no usage / no [DONE]) when the textStream throws mid-flight", async () => {
    // Suppress the intentional [buildChatSseResponse] stream error log emitted
    // by the catch branch under test — keeps the test output readable while
    // the contract (locked Chinese user-facing message per D-088 §2.4) is
    // still asserted.
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      const response = buildChatSseResponse({
        textStream: failingIter("provider quota exhausted"),
        usagePromise: Promise.resolve({}),
        providerMetadataPromise: Promise.resolve(undefined),
        provider: "deepseek",
      });
      const frames = await collectSseFrames(response);
      // delta "first chunk" then error frame; no usage / no [DONE] after error.
      expect(frames).toHaveLength(2);
      expect(JSON.parse(frames[0]!)).toEqual({
        type: "delta",
        text: "first chunk",
      });
      const errFrame = JSON.parse(frames[1]!);
      expect(errFrame.type).toBe("error");
      // D-088 §2.4 user-surface contract: emit the locked Chinese fallback
      // text, NOT the raw provider error message. The raw error is captured
      // separately via console.error for debug visibility (asserted below).
      expect(errFrame.message).toBe("AI 暂时不可用，请稍后重试。");
      expect(errorSpy).toHaveBeenCalled();
      const firstCall = errorSpy.mock.calls[0];
      expect(firstCall?.[0]).toBe("[buildChatSseResponse] stream error");
      expect(firstCall?.[1]).toBeInstanceOf(Error);
      expect((firstCall?.[1] as Error).message).toBe("provider quota exhausted");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("coerces missing token totals to null in the usage frame", async () => {
    const response = buildChatSseResponse({
      textStream: asyncIter(["ok"]),
      usagePromise: Promise.resolve({}),
      providerMetadataPromise: Promise.resolve({
        anthropic: {
          cacheCreationInputTokens: 100,
          cacheReadInputTokens: 0,
        },
      }),
      provider: "anthropic",
    });
    const frames = await collectSseFrames(response);
    const usage = JSON.parse(frames[1]!);
    expect(usage.inputTokens).toBeNull();
    expect(usage.outputTokens).toBeNull();
    expect(usage.totalTokens).toBeNull();
    expect(usage.cacheCreationInputTokens).toBe(100);
  });
});
