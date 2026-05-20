// Integration tests for POST /api/chat — Step 5 Batch B route layer.
//
// Strategy: mock `streamText` from the AI SDK so no live LLM call is made,
// and stub assembleWholeBook so we don't read the 4.7 MB v1.0.3 fixtures.
// What we are verifying here is the route's contract layer:
//   - body parsing + validation
//   - SSE shape end-to-end (delta → usage → [DONE])
//   - status codes on bad input
//   - GET health-check response

import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => {
  async function* deltas(): AsyncGenerator<string> {
    yield "Hello";
    yield ", ";
    yield "world";
  }
  return {
    streamText: vi.fn(() => ({
      textStream: deltas(),
      usage: Promise.resolve({
        inputTokens: 12345,
        outputTokens: 3,
        totalTokens: 12348,
      }),
      providerMetadata: Promise.resolve({
        deepseek: {
          promptCacheHitTokens: 12340,
          promptCacheMissTokens: 5,
        },
      }),
    })),
  };
});

vi.mock("@/lib/data", () => ({
  getDataSource: () => ({}),
  warmUp: async () => {},
}));

vi.mock("@/lib/data/assembleScope", () => ({
  assembleWholeBook: async () => ({
    scope: "whole-book" as const,
    contextBlock: "[]",
    tokenEstimate: 0,
    meta: { page_count: 0, cert_id: "test" },
  }),
}));

import { GET, POST } from "../route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function readSseFrames(response: Response): Promise<string[]> {
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
      if (raw.startsWith("data: ")) frames.push(raw.slice(6));
      idx = buffer.indexOf("\n\n");
    }
  }
  return frames;
}

describe("POST /api/chat — happy path", () => {
  it("returns 200 SSE with delta + usage + [DONE] for valid whole-book request", async () => {
    const res = await POST(
      jsonRequest({ scope: "whole-book", userMessage: "What is OSI?" }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/event-stream/);

    const frames = await readSseFrames(res);
    expect(frames.length).toBeGreaterThanOrEqual(4);
    const deltas = frames
      .map((f) => {
        try {
          return JSON.parse(f);
        } catch {
          return null;
        }
      })
      .filter(
        (f): f is { type: string; text?: string } =>
          f !== null && typeof f === "object",
      );
    const deltaTexts = deltas
      .filter((f) => f.type === "delta")
      .map((f) => f.text);
    expect(deltaTexts.join("")).toBe("Hello, world");

    const usageFrame = deltas.find((f) => f.type === "usage") as {
      type: string;
      cacheReadInputTokens: number;
    } | undefined;
    expect(usageFrame).toBeDefined();
    expect(usageFrame!.cacheReadInputTokens).toBe(12340);

    expect(frames[frames.length - 1]).toBe("[DONE]");
  });
});

describe("POST /api/chat — bad input", () => {
  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "this is not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/JSON/i);
  });

  it("returns 400 on unsupported scope (per Q1=a Step 5 whole-book only)", async () => {
    const res = await POST(
      jsonRequest({ scope: "chapter", userMessage: "x" }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/scope/i);
  });

  it("returns 400 on empty userMessage", async () => {
    const res = await POST(
      jsonRequest({ scope: "whole-book", userMessage: "" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 on missing userMessage", async () => {
    const res = await POST(jsonRequest({ scope: "whole-book" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/chat — health check", () => {
  it("returns 200 plain text with provider + firewall + SSE contract notes", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toMatch(/whole-book/);
    expect(text).toMatch(/D-097/);
    expect(text).toMatch(/D-095/);
    expect(text).toMatch(/stable-prefix/);
  });
});
