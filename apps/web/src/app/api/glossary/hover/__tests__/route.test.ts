// Integration tests for POST /api/glossary/hover — Step 7 Batch B route layer.
//
// Strategy: mock `streamText` so no live LLM call is made, stub DataSource so
// we don't read the v1.0.3 fixtures, and stub assembleTermHover to a trivial
// payload or a throw. We are verifying the route contract layer:
//   - body parsing + validation
//   - assembleTermHover throw on unknown surface_jp → 404 (not 500)
//   - SSE shape end-to-end (delta → usage → [DONE])
//   - status codes on bad input
//   - GET health-check response

import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => {
  async function* deltas(): AsyncGenerator<string> {
    yield "プロセッサ";
    yield "：";
    yield "stub gloss";
  }
  return {
    streamText: vi.fn(() => ({
      textStream: deltas(),
      usage: Promise.resolve({
        inputTokens: 250,
        outputTokens: 60,
        totalTokens: 310,
      }),
      providerMetadata: Promise.resolve({
        deepseek: {
          promptCacheHitTokens: 0,
          promptCacheMissTokens: 250,
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
  assembleTermHover: async (_ds: unknown, surface_jp: string) => {
    if (surface_jp === "不在词典の語") {
      throw new Error(
        `assembleTermHover: surface "${surface_jp}" not found in glossary_index`,
      );
    }
    if (surface_jp === "OUT_OF_SYNC") {
      throw new Error(
        `assembleTermHover: id "g_999" missing from glossary entries (index/glossary out of sync)`,
      );
    }
    if (surface_jp === "EXPLODE") {
      throw new Error("unexpected internal failure");
    }
    return {
      scope: "term-hover" as const,
      contextBlock: JSON.stringify({ stub: true, surface_jp }),
      tokenEstimate: 50,
      meta: { surface_jp, glossary_id: `stub_g_${surface_jp}` },
    };
  },
}));

import { GET, POST } from "../route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/glossary/hover", {
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

describe("POST /api/glossary/hover — happy path", () => {
  it("returns 200 SSE with delta + usage + [DONE] for a valid surface_jp", async () => {
    const res = await POST(jsonRequest({ surface_jp: "プロセッサ" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/event-stream/);

    const frames = await readSseFrames(res);
    expect(frames.length).toBeGreaterThanOrEqual(4);
    const parsed = frames
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
    const deltaTexts = parsed
      .filter((f) => f.type === "delta")
      .map((f) => f.text);
    expect(deltaTexts.join("")).toBe("プロセッサ：stub gloss");

    const usage = parsed.find((f) => f.type === "usage") as
      | { type: string; cacheMissInputTokens: number }
      | undefined;
    expect(usage).toBeDefined();
    expect(usage!.cacheMissInputTokens).toBe(250);

    expect(frames[frames.length - 1]).toBe("[DONE]");
  });
});

describe("POST /api/glossary/hover — bad input", () => {
  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/glossary/hover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "this is not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/JSON/i);
  });

  it("returns 400 on missing surface_jp", async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/surface_jp/);
  });

  it("returns 400 on non-string surface_jp", async () => {
    const res = await POST(jsonRequest({ surface_jp: 42 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 on empty surface_jp", async () => {
    const res = await POST(jsonRequest({ surface_jp: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when surface_jp is not in glossary_index", async () => {
    const res = await POST(jsonRequest({ surface_jp: "不在词典の語" }));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/not found/);
  });

  it("returns 404 when index/glossary are out of sync (assembleTermHover throws)", async () => {
    const res = await POST(jsonRequest({ surface_jp: "OUT_OF_SYNC" }));
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/out of sync/);
  });

  it("returns 500 on unexpected assembleTermHover failure", async () => {
    const res = await POST(jsonRequest({ surface_jp: "EXPLODE" }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/assembleTermHover failed/);
  });
});

describe("GET /api/glossary/hover — health check", () => {
  it("returns 200 plain text with surface_jp contract + firewall + scope notes", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toMatch(/surface_jp/);
    expect(text).toMatch(/glossary_index/);
    expect(text).toMatch(/D-097/);
    expect(text).toMatch(/D-095/);
    expect(text).toMatch(/D-089/);
    expect(text).toMatch(/D-085/);
  });
});
