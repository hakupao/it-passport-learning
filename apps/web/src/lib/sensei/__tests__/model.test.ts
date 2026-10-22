import { describe, expect, it } from "vitest";

import {
  createSenseiModel,
  EFFORT_DEFAULT,
  EFFORT_ESCALATED,
  MAX_OUTPUT_TOKENS,
  MODEL_ID,
} from "../model";

const KEY = "sk-ant-api03-model-test-WXYZ";

describe("sensei model", () => {
  it("pins the D-181 §0-1 constants", () => {
    expect(MODEL_ID).toBe("claude-sonnet-5-5");
    expect(EFFORT_DEFAULT).toBe("low");
    expect(EFFORT_ESCALATED).toBe("high");
    expect(MAX_OUTPUT_TOKENS).toBe(4000);
  });

  it("sends the browser-direct header and the key to the Anthropic API (fake fetch, no network)", async () => {
    let seen: { url: string; headers: Headers; body: Record<string, unknown> } | null = null;
    const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      seen = {
        url: String(input),
        headers: new Headers(init?.headers),
        body: JSON.parse(String(init?.body)) as Record<string, unknown>,
      };
      return new Response(
        JSON.stringify({
          id: "msg_1",
          type: "message",
          role: "assistant",
          model: MODEL_ID,
          content: [{ type: "text", text: "ok" }],
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: { input_tokens: 1, output_tokens: 1 },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    const model = createSenseiModel(KEY, fakeFetch);
    expect(model.modelId).toBe(MODEL_ID);
    await model.doGenerate({
      prompt: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
    });

    expect(seen).not.toBeNull();
    const s = seen!;
    expect(s.url).toBe("https://api.anthropic.com/v1/messages");
    expect(s.headers.get("anthropic-dangerous-direct-browser-access")).toBe("true");
    expect(s.headers.get("x-api-key")).toBe(KEY);
    expect(s.body.model).toBe(MODEL_ID);
  });
});
