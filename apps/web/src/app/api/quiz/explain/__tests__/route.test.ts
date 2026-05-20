// Integration tests for POST /api/quiz/explain — Step 6 Batch B route layer.
//
// Strategy: mock `streamText` so no live LLM call is made, stub DataSource so
// we don't read the 4.7 MB v1.0.3 fixtures, and stub assembleQuestion to a
// trivial payload. We are verifying the route contract layer:
//   - body parsing + validation
//   - entity_by_id lookup → 404 / 400 on type mismatch
//   - SSE shape end-to-end (delta → usage → [DONE])
//   - status codes on bad input
//   - GET health-check response

import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => {
  async function* deltas(): AsyncGenerator<string> {
    yield "問題の要点";
    yield "：";
    yield "stub explanation";
  }
  return {
    streamText: vi.fn(() => ({
      textStream: deltas(),
      usage: Promise.resolve({
        inputTokens: 2500,
        outputTokens: 120,
        totalTokens: 2620,
      }),
      providerMetadata: Promise.resolve({
        deepseek: {
          promptCacheHitTokens: 0,
          promptCacheMissTokens: 2500,
        },
      }),
    })),
  };
});

vi.mock("@/lib/data", () => ({
  getDataSource: () => ({
    loadIndex: async () => ({
      schema_version: "v2" as const,
      cert_id: "itpassport_r6",
      run_id: "test_run",
      exported_at: "2026-05-20T00:00:00Z",
      totals: { pages: 1, entities: 4, leaves: 0 },
      stage6_summary: {
        verdict: "PASS",
        pass_pages: 1,
        warn_pages: 0,
        fail_pages: 0,
        polish_items_count: 0,
      },
      pages: [],
      chapters: [],
      glossary_index: { surface_jp_to_id: {}, id_to_surface: {} },
      entity_by_id: {
        page_042_entity_0: {
          page: 42,
          entity_index: 0,
          type: "question",
          id: "itpassport_r6::question::p042::0",
        },
        page_001_entity_0: {
          page: 1,
          entity_index: 0,
          type: "section",
          id: "itpassport_r6::section::p001::0",
        },
      },
      v2_built_at: "2026-05-20T00:00:00Z",
      v2_source_index: "index.json",
    }),
  }),
  warmUp: async () => {},
}));

vi.mock("@/lib/data/assembleScope", () => ({
  assembleQuestion: async (
    _ds: unknown,
    page: number,
    entity_index: number,
  ) => ({
    scope: "question" as const,
    contextBlock: JSON.stringify({ stub: true, page, entity_index }),
    tokenEstimate: 50,
    meta: { page, entity_index, entity_id: `stub_q_${page}_${entity_index}` },
  }),
}));

import { GET, POST } from "../route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/quiz/explain", {
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

describe("POST /api/quiz/explain — happy path", () => {
  it("returns 200 SSE with delta + usage + [DONE] for a valid question_id", async () => {
    const res = await POST(
      jsonRequest({ question_id: "page_042_entity_0" }),
    );
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
    expect(deltaTexts.join("")).toBe("問題の要点：stub explanation");

    const usage = parsed.find((f) => f.type === "usage") as
      | { type: string; cacheMissInputTokens: number }
      | undefined;
    expect(usage).toBeDefined();
    expect(usage!.cacheMissInputTokens).toBe(2500);

    expect(frames[frames.length - 1]).toBe("[DONE]");
  });
});

describe("POST /api/quiz/explain — bad input", () => {
  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/quiz/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "this is not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/JSON/i);
  });

  it("returns 400 on missing question_id", async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/question_id/);
  });

  it("returns 400 on non-string question_id", async () => {
    const res = await POST(jsonRequest({ question_id: 42 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 on empty question_id", async () => {
    const res = await POST(jsonRequest({ question_id: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when question_id is not in entity_by_id", async () => {
    const res = await POST(
      jsonRequest({ question_id: "page_999_entity_0" }),
    );
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/not found/);
  });

  it("returns 400 when entity exists but type !== question", async () => {
    const res = await POST(
      jsonRequest({ question_id: "page_001_entity_0" }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/type/);
    expect(body.error).toMatch(/section/);
  });
});

describe("GET /api/quiz/explain — health check", () => {
  it("returns 200 plain text with question_id contract + firewall + scope notes", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toMatch(/question_id/);
    expect(text).toMatch(/entity_by_id/);
    expect(text).toMatch(/D-097/);
    expect(text).toMatch(/D-095/);
    expect(text).toMatch(/D-089/);
  });
});
