// Integration tests for POST /api/chat — Step 9 AI SDK v6 data stream contract.
//
// Migration from Step 5 custom SSE encoder → AI SDK `toUIMessageStreamResponse`:
//   - Request body now `{messages: UIMessage[]}`, not `{scope, userMessage}`.
//   - Response framing is opaque AI SDK UI message stream (consumed by useChat),
//     so we no longer assert on the SSE wire shape per se. We DO assert:
//       (i) status + content-type + custom `X-LLM-Provider` header still flow,
//      (ii) the route still gates bad input with 400,
//     (iii) the `onFinish` callback (which carries our tripwire eval) is invoked,
//      (iv) GET health-check string is updated.
//
// Strategy: mock `streamText` so no live LLM call, and stub the whole-book
// assembler so the 4.7 MB fixture isn't read. The mock `streamText` captures
// the `onFinish` callback so we can confirm it's wired and invoke it manually.

import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";

// `vi.hoisted` is the documented escape hatch for sharing state between the
// test body and `vi.mock` factories (which are hoisted to the top of the file).
const { onFinishHolder, recordTripwireSpy } = vi.hoisted(() => ({
  onFinishHolder: { fn: null as ((args: unknown) => void) | null },
  recordTripwireSpy: vi.fn(),
}));

vi.mock("ai", async () => {
  const actual = await vi.importActual<typeof import("ai")>("ai");
  return {
    ...actual,
    // Convert UIMessage[] → ModelMessage[] for the streamText call. The real
    // converter requires AI-SDK-internal fields the test fixtures don't set,
    // so we stub it with a shape-preserving passthrough good enough for the
    // route's spread.
    convertToModelMessages: (msgs: Array<{ role: string; parts?: Array<{ type: string; text?: string }> }>) =>
      msgs.map((m) => ({
        role: m.role,
        content:
          m.parts
            ?.filter((p) => p.type === "text")
            .map((p) => p.text ?? "")
            .join("") ?? "",
      })),
    streamText: vi.fn((args: { onFinish?: (a: unknown) => void }) => {
      onFinishHolder.fn = args.onFinish ?? null;
      return {
        toUIMessageStreamResponse: ({
          onError,
          headers,
        }: {
          onError?: (e: unknown) => string;
          headers?: Record<string, string>;
        } = {}) =>
          new Response(
            "data: {\"type\":\"text-delta\",\"delta\":\"Hello\"}\n\n" +
              "data: [DONE]\n\n",
            {
              status: 200,
              headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                ...(headers ?? {}),
                "X-Mock-OnError-Set": onError ? "yes" : "no",
              },
            },
          ),
      };
    }),
  };
});

vi.mock("@/lib/data", () => ({
  getDataSource: () => ({}),
  warmUp: async () => {},
}));

vi.mock("@/lib/data/assembleScope", () => ({
  assembleWholeBook: async () => ({
    scope: "whole-book" as const,
    contextBlock: "[corpus stub]",
    tokenEstimate: 93000,
    meta: { page_count: 0, cert_id: "test" },
  }),
}));

vi.mock("@/lib/ai/tripwire", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai/tripwire")>(
    "@/lib/ai/tripwire",
  );
  return {
    ...actual,
    recordTripwireEvent: recordTripwireSpy,
  };
});

import { GET, POST } from "../route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeUserMessage(id: string, text: string): UIMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text }],
  } as UIMessage;
}

describe("POST /api/chat — happy path (AI SDK v6 UI message stream)", () => {
  it("returns 200 with X-LLM-Provider header and an AI SDK stream body for valid messages", async () => {
    const res = await POST(
      jsonRequest({
        messages: [makeUserMessage("u1", "DNS とは何か？")],
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("X-LLM-Provider")).toBe("deepseek");
    // Mock signal: confirms the route passes an `onError` handler so locked
    // Chinese fallback survives stream-time errors (D-088 §2.4).
    expect(res.headers.get("X-Mock-OnError-Set")).toBe("yes");
    const body = await res.text();
    expect(body).toContain("text-delta");
    expect(body).toContain("Hello");
  });

  it("wires onFinish so cache-tripwire telemetry survives the AI SDK migration", () => {
    expect(onFinishHolder.fn).toBeTypeOf("function");
    recordTripwireSpy.mockClear();
    // Drive the captured callback with a deepseek metadata shape that trips the
    // cache_low_hit branch (D-091 §2.5(β)): 0 hit on a 5000-tok call (>1000 floor).
    onFinishHolder.fn!({
      usage: { inputTokens: 5000, outputTokens: 10, totalTokens: 5010 },
      providerMetadata: {
        deepseek: { promptCacheHitTokens: 0, promptCacheMissTokens: 5000 },
      },
    });
    expect(recordTripwireSpy).toHaveBeenCalledOnce();
    const [event] = recordTripwireSpy.mock.calls[0]!;
    expect(event).toMatchObject({ kind: "cache_low_hit", route: "/api/chat" });
  });

  it("accepts a multi-turn messages array (user/assistant interleave)", async () => {
    const res = await POST(
      jsonRequest({
        messages: [
          makeUserMessage("u1", "DNS とは？"),
          {
            id: "a1",
            role: "assistant",
            parts: [{ type: "text", text: "DNS は…" }],
          } as UIMessage,
          makeUserMessage("u2", "もっと詳しく"),
        ],
      }),
    );
    expect(res.status).toBe(200);
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

  it("returns 400 when `messages` is missing", async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/messages/i);
  });

  it("returns 400 when `messages` is empty", async () => {
    const res = await POST(jsonRequest({ messages: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when `messages` is not an array", async () => {
    const res = await POST(jsonRequest({ messages: "not-an-array" }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/chat — health check", () => {
  it("returns 200 plain text with AI SDK v6 protocol + firewall + stable-prefix notes", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toMatch(/messages/);
    expect(text).toMatch(/useChat/);
    expect(text).toMatch(/D-097/);
    expect(text).toMatch(/D-095/);
    expect(text).toMatch(/stable-prefix/);
  });
});
