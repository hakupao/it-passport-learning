// Unit tests for /api/chat helper: SSE encoder + request body validator.
//
// Session 37 Step 5 Batch B coverage:
//   - validateChatRequestBody: scope/userMessage/edge cases (7 cases)
//   - buildChatSseResponse: SSE wire format, delta ordering, usage frame
//     derivation (anthropic + deepseek + unknown), empty-chunk skip,
//     error path → error frame, header set (8 cases)

import { describe, expect, it } from "vitest";

import {
  USER_MESSAGE_MAX_LENGTH,
  buildChatSseResponse,
  validateChatRequestBody,
} from "../chat";

describe("validateChatRequestBody", () => {
  it("accepts a valid whole-book + non-empty userMessage payload", () => {
    const r = validateChatRequestBody({
      scope: "whole-book",
      userMessage: "What is OSI?",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.scope).toBe("whole-book");
      expect(r.body.userMessage).toBe("What is OSI?");
    }
  });

  it("rejects null/undefined body", () => {
    expect(validateChatRequestBody(null).ok).toBe(false);
    expect(validateChatRequestBody(undefined).ok).toBe(false);
  });

  it("rejects non-object body (string / number / array)", () => {
    expect(validateChatRequestBody("hi").ok).toBe(false);
    expect(validateChatRequestBody(42).ok).toBe(false);
    // Arrays are objects in JS but the validator must still reject because
    // scope/userMessage cannot be array-indexed and yield required fields.
    const arr = validateChatRequestBody([]);
    expect(arr.ok).toBe(false);
  });

  it("rejects unsupported scope (per Q1=a Step 5 whole-book only)", () => {
    for (const scope of ["chapter", "question", "term-hover", "", "WHOLE-BOOK"]) {
      const r = validateChatRequestBody({ scope, userMessage: "x" });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain("scope");
    }
  });

  it("rejects missing scope field", () => {
    const r = validateChatRequestBody({ userMessage: "x" });
    expect(r.ok).toBe(false);
  });

  it("rejects non-string userMessage", () => {
    for (const userMessage of [123, null, undefined, {}, []]) {
      const r = validateChatRequestBody({ scope: "whole-book", userMessage });
      expect(r.ok).toBe(false);
    }
  });

  it("rejects empty userMessage (length === 0)", () => {
    const r = validateChatRequestBody({ scope: "whole-book", userMessage: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("non-empty");
  });

  it("rejects userMessage longer than USER_MESSAGE_MAX_LENGTH", () => {
    const big = "あ".repeat(USER_MESSAGE_MAX_LENGTH + 1);
    const r = validateChatRequestBody({
      scope: "whole-book",
      userMessage: big,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(String(USER_MESSAGE_MAX_LENGTH));
  });

  it("accepts userMessage at the exact maximum length", () => {
    const exact = "a".repeat(USER_MESSAGE_MAX_LENGTH);
    const r = validateChatRequestBody({
      scope: "whole-book",
      userMessage: exact,
    });
    expect(r.ok).toBe(true);
  });
});

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
    const response = buildChatSseResponse({
      textStream: failingIter("provider quota exhausted"),
      usagePromise: Promise.resolve({}),
      providerMetadataPromise: Promise.resolve(undefined),
      provider: "deepseek",
    });
    const frames = await collectSseFrames(response);
    // delta "first chunk" then error frame; no usage / no [DONE] after error.
    expect(frames).toHaveLength(2);
    expect(JSON.parse(frames[0]!)).toEqual({ type: "delta", text: "first chunk" });
    const errFrame = JSON.parse(frames[1]!);
    expect(errFrame.type).toBe("error");
    expect(errFrame.message).toContain("provider quota exhausted");
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
