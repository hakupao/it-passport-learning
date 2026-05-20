// Phase 2 Step 10 — quizSseTransport.ts unit tests.
//
// Drives the SSE consumer against a mocked fetch returning a hand-rolled
// ReadableStream. Each test encodes a wire-format trace and asserts the
// callbacks fire in the right order with the right payloads.

import { describe, expect, it, vi } from "vitest";

import {
  parseSseFrame,
  splitSseChunks,
  streamQuizExplain,
} from "../quizSseTransport";

function encode(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** Build a ReadableStream that emits the supplied chunks in order, then closes. */
function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encode(chunks[i] ?? ""));
      i++;
    },
  });
}

function mockOkFetch(chunks: string[]): typeof fetch {
  return vi.fn(async () => {
    return new Response(streamFromChunks(chunks), {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }) as unknown as typeof fetch;
}

describe("parseSseFrame", () => {
  it("parses a delta frame", () => {
    expect(parseSseFrame('{"type":"delta","text":"hello"}')).toEqual({
      type: "delta",
      text: "hello",
    });
  });

  it("parses a usage frame", () => {
    const frame = parseSseFrame(
      '{"type":"usage","provider":"deepseek","inputTokens":100,"outputTokens":20,"cacheReadInputTokens":80,"cacheMissInputTokens":20}',
    );
    expect(frame?.type).toBe("usage");
    if (frame?.type === "usage") {
      expect(frame.cacheReadInputTokens).toBe(80);
      expect(frame.cacheMissInputTokens).toBe(20);
    }
  });

  it("parses an error frame", () => {
    expect(parseSseFrame('{"type":"error","message":"boom"}')).toEqual({
      type: "error",
      message: "boom",
    });
  });

  it("returns null for [DONE] sentinel", () => {
    expect(parseSseFrame("[DONE]")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(parseSseFrame("not json")).toBeNull();
  });

  it("returns null for an unknown frame type", () => {
    expect(parseSseFrame('{"type":"surprise","foo":1}')).toBeNull();
  });
});

describe("splitSseChunks", () => {
  it("splits well-formed frames", () => {
    const result = splitSseChunks("data: a\n\ndata: b\n\n");
    expect(result.frames).toEqual(["a", "b"]);
    expect(result.remainder).toBe("");
  });

  it("keeps an incomplete tail in remainder", () => {
    const result = splitSseChunks("data: a\n\ndata: b");
    expect(result.frames).toEqual(["a"]);
    expect(result.remainder).toBe("data: b");
  });

  it("ignores non-data lines", () => {
    const result = splitSseChunks(":keepalive\n\ndata: a\n\n");
    expect(result.frames).toEqual(["a"]);
  });
});

describe("streamQuizExplain", () => {
  it("dispatches delta + usage + complete on a clean stream", async () => {
    const fetchImpl = mockOkFetch([
      'data: {"type":"delta","text":"Hello "}\n\n',
      'data: {"type":"delta","text":"world"}\n\n',
      'data: {"type":"usage","provider":"deepseek","inputTokens":100,"outputTokens":2,"cacheReadInputTokens":80,"cacheMissInputTokens":20}\n\n',
      "data: [DONE]\n\n",
    ]);
    const deltas: string[] = [];
    const usageHits: number[] = [];
    let completeCount = 0;
    let errorMessage: string | null = null as string | null;

    await streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl,
      callbacks: {
        onDelta: (d) => deltas.push(d.text),
        onUsage: (u) => usageHits.push(u.cacheReadInputTokens ?? -1),
        onError: (m) => (errorMessage = m),
        onComplete: () => completeCount++,
      },
    });

    expect(deltas.join("")).toBe("Hello world");
    expect(usageHits).toEqual([80]);
    expect(errorMessage).toBeNull();
    expect(completeCount).toBe(1);
  });

  it("posts the question_id as JSON body", async () => {
    const fetchSpy = vi.fn(
      async (input: string, init?: RequestInit) => {
        void input;
        void init;
        return new Response(streamFromChunks(["data: [DONE]\n\n"]), {
          status: 200,
        });
      },
    );
    await streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl: fetchSpy as unknown as typeof fetch,
      callbacks: {},
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe("/api/quiz/explain");
    expect(init?.method).toBe("POST");
    expect(JSON.parse((init?.body as string) ?? "{}")).toEqual({
      question_id: "page_042_entity_0",
    });
  });

  it("honours endpoint override", async () => {
    const fetchSpy = vi.fn(
      async (input: string, init?: RequestInit) => {
        void input;
        void init;
        return new Response(streamFromChunks(["data: [DONE]\n\n"]), {
          status: 200,
        });
      },
    );
    await streamQuizExplain({
      questionId: "page_042_entity_0",
      endpoint: "/custom/explain",
      fetchImpl: fetchSpy as unknown as typeof fetch,
      callbacks: {},
    });
    expect(fetchSpy.mock.calls[0]?.[0]).toBe("/custom/explain");
  });

  it("dispatches server error frames", async () => {
    const fetchImpl = mockOkFetch([
      'data: {"type":"error","message":"AI 暂时不可用，请稍后重试。"}\n\n',
    ]);
    let errorMessage: string | null = null as string | null;
    let completed = false;
    await streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl,
      callbacks: {
        onError: (m) => (errorMessage = m),
        onComplete: () => (completed = true),
      },
    });
    expect(errorMessage).toBe("AI 暂时不可用，请稍后重试。");
    expect(completed).toBe(true);
  });

  it("dispatches an error when the response is not ok", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response("server boom", { status: 500 });
    }) as unknown as typeof fetch;
    let errorMessage: string | null = null as string | null;
    let completed = false;
    await streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl,
      callbacks: {
        onError: (m) => (errorMessage = m),
        onComplete: () => (completed = true),
      },
    });
    expect(errorMessage).toContain("server boom");
    expect(completed).toBe(true);
  });

  it("handles fetch rejection (network error)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    let errorMessage: string | null = null as string | null;
    let completed = false;
    await streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl,
      callbacks: {
        onError: (m) => (errorMessage = m),
        onComplete: () => (completed = true),
      },
    });
    expect(errorMessage).not.toBeNull();
    expect(errorMessage?.length).toBeGreaterThan(0);
    expect(completed).toBe(true);
  });

  it("survives chunk boundaries that split a frame mid-event", async () => {
    const fetchImpl = mockOkFetch([
      'data: {"type":"del',
      'ta","text":"split frame"}\n\n',
      "data: [DONE]\n\n",
    ]);
    const deltas: string[] = [];
    await streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl,
      callbacks: { onDelta: (d) => deltas.push(d.text) },
    });
    expect(deltas).toEqual(["split frame"]);
  });

  it("fires onComplete exactly once even on the empty-delta case", async () => {
    const fetchImpl = mockOkFetch([
      'data: {"type":"usage","provider":"deepseek","inputTokens":1,"outputTokens":0,"cacheReadInputTokens":0,"cacheMissInputTokens":1}\n\n',
      "data: [DONE]\n\n",
    ]);
    const deltas: string[] = [];
    let completeCount = 0;
    await streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl,
      callbacks: {
        onDelta: (d) => deltas.push(d.text),
        onComplete: () => completeCount++,
      },
    });
    expect(deltas).toEqual([]);
    expect(completeCount).toBe(1);
  });

  it("aborts cleanly on AbortSignal without emitting onError", async () => {
    let pulls = 0;
    const stream = new ReadableStream({
      pull(controller) {
        pulls++;
        if (pulls === 1) {
          controller.enqueue(encode('data: {"type":"delta","text":"hi"}\n\n'));
        }
        // Never close — simulate a slow stream.
      },
    });
    const fetchImpl = vi.fn(async () => {
      return new Response(stream, { status: 200 });
    }) as unknown as typeof fetch;

    const controller = new AbortController();
    const deltas: string[] = [];
    let errorMessage: string | null = null as string | null;
    let completed = false;

    const promise = streamQuizExplain({
      questionId: "page_042_entity_0",
      fetchImpl,
      signal: controller.signal,
      callbacks: {
        onDelta: (d) => deltas.push(d.text),
        onError: (m) => (errorMessage = m),
        onComplete: () => (completed = true),
      },
    });

    // Let the first delta land then cancel.
    await new Promise((r) => setTimeout(r, 30));
    controller.abort();
    await promise;
    expect(deltas).toEqual(["hi"]);
    // Cancellation should NOT surface as a user-visible error.
    expect(errorMessage).toBeNull();
    expect(completed).toBe(true);
  });
});
