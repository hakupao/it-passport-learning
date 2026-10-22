import { streamText, type UIMessage, type UIMessageChunk } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createBrowserTransport } from "../browserTransport";
import { toSenseiError } from "../errors";
import { createSenseiModel, MODEL_ID } from "../model";
import { SENSEI_SYSTEM_INSTRUCTION } from "../prompt";

const KEY = "sk-ant-api03-transport-test-K9z7";
const ANCHOR = "# 教材\n回答言語: 日本語";

function user(id: string, text: string): UIMessage {
  return { id, role: "user", parts: [{ type: "text", text }] };
}

function assistant(id: string, text: string): UIMessage {
  return { id, role: "assistant", parts: [{ type: "text", text }] };
}

function send(transport: ReturnType<typeof createBrowserTransport>, messages: UIMessage[], abortSignal?: AbortSignal) {
  return transport.sendMessages({
    trigger: "submit-message",
    chatId: "c1",
    messageId: undefined,
    messages,
    abortSignal,
  });
}

async function readAll(stream: ReadableStream<UIMessageChunk>): Promise<UIMessageChunk[]> {
  const out: UIMessageChunk[] = [];
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return out;
    out.push(value);
  }
}

/** A fake streamText that records its options and returns an empty UI stream. */
function fakeStreamText() {
  const calls: Record<string, unknown>[] = [];
  const fn = ((options: Record<string, unknown>) => {
    calls.push(options);
    return {
      toUIMessageStream: () =>
        new ReadableStream<UIMessageChunk>({
          start(c) {
            c.enqueue({ type: "start" });
            c.enqueue({ type: "finish" });
            c.close();
          },
        }),
    };
  }) as unknown as typeof streamText;
  return { fn, calls };
}

const fakeModel = { fake: "model" } as unknown as ReturnType<typeof createSenseiModel>;

function sse(events: Record<string, unknown>[]): Response {
  const body = events.map((e) => `event: ${String(e.type)}\ndata: ${JSON.stringify(e)}\n\n`).join("");
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

function anthropicStream(stopReason: string): Record<string, unknown>[] {
  return [
    {
      type: "message_start",
      message: {
        id: "msg_1",
        type: "message",
        role: "assistant",
        model: MODEL_ID,
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 1 },
      },
    },
    { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
    { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "はい" } },
    { type: "content_block_stop", index: 0 },
    { type: "message_delta", delta: { stop_reason: stopReason, stop_sequence: null }, usage: { output_tokens: 3 } },
    { type: "message_stop" },
  ];
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createBrowserTransport", () => {
  it("without a key: calls onMissingKey, sends nothing, rejects with an auth error", async () => {
    const st = fakeStreamText();
    const createModel = vi.fn(() => fakeModel);
    const onMissingKey = vi.fn();
    const transport = createBrowserTransport({
      getKey: () => null,
      getAnchor: () => ANCHOR,
      onMissingKey,
      deps: { streamText: st.fn, createModel },
    });
    const err = await send(transport, [user("u1", "こんにちは")]).catch((e: unknown) => e);
    expect(onMissingKey).toHaveBeenCalledTimes(1);
    expect(createModel).not.toHaveBeenCalled();
    expect(st.calls).toHaveLength(0);
    expect(toSenseiError(err).kind).toBe("auth");
  });

  it("calls streamText with the §0-1 options and the §0-4 message layout (effort low)", async () => {
    const st = fakeStreamText();
    const createModel = vi.fn(() => fakeModel);
    const transport = createBrowserTransport({
      getKey: () => KEY,
      getAnchor: () => ANCHOR,
      onMissingKey: () => {},
      deps: { streamText: st.fn, createModel },
    });
    const ac = new AbortController();
    const chunks = await readAll(await send(transport, [user("u1", "こんにちは")], ac.signal));
    expect(chunks.map((c) => c.type)).toEqual(["start", "finish"]);
    expect(createModel).toHaveBeenCalledWith(KEY);
    expect(st.calls).toHaveLength(1);
    const o = st.calls[0]!;
    expect(o.model).toBe(fakeModel);
    expect(o.providerOptions).toEqual({ anthropic: { effort: "low" } });
    expect(o.maxOutputTokens).toBe(4000);
    expect(o.maxRetries).toBe(1);
    expect(o.abortSignal).toBe(ac.signal);
    const messages = o.messages as { role: string; content: unknown }[];
    expect(messages[0]).toMatchObject({ role: "system", content: SENSEI_SYSTEM_INSTRUCTION });
    expect(messages[1]).toMatchObject({ role: "system", content: ANCHOR });
    expect(messages[2]).toMatchObject({ role: "user" });
    expect(JSON.stringify(messages[2])).toContain("こんにちは");
  });

  it("keeps effort low on the first user turn even when shouldEscalate would fire (ruling 7)", async () => {
    const st = fakeStreamText();
    const transport = createBrowserTransport({
      getKey: () => KEY,
      getAnchor: () => ANCHOR,
      onMissingKey: () => {},
      deps: { streamText: st.fn, createModel: () => fakeModel },
    });
    await send(transport, [user("u1", "なぜアが正解？")]);
    expect(st.calls[0]!.providerOptions).toEqual({ anthropic: { effort: "low" } });
  });

  it("from the second user turn on, shouldEscalate decides (high / low)", async () => {
    const st = fakeStreamText();
    const transport = createBrowserTransport({
      getKey: () => KEY,
      getAnchor: () => ANCHOR,
      onMissingKey: () => {},
      deps: { streamText: st.fn, createModel: () => fakeModel },
    });
    const first = [user("u1", "なぜアが正解？"), assistant("a1", "結論：アは OSS の定義そのものだからです。".repeat(5))];
    await send(transport, [...first, user("u2", "まだわからない")]);
    expect(st.calls[0]!.providerOptions).toEqual({ anthropic: { effort: "high" } });
    await send(transport, [...first, user("u2", "ありがとう")]);
    expect(st.calls[1]!.providerOptions).toEqual({ anthropic: { effort: "low" } });
  });

  it("reads the anchor at send time", async () => {
    const st = fakeStreamText();
    let anchor = "A1";
    const transport = createBrowserTransport({
      getKey: () => KEY,
      getAnchor: () => anchor,
      onMissingKey: () => {},
      deps: { streamText: st.fn, createModel: () => fakeModel },
    });
    anchor = "A2";
    await send(transport, [user("u1", "hi")]);
    expect((st.calls[0]!.messages as { content: unknown }[])[1]!.content).toBe("A2");
  });

  it("reconnectToStream returns null", async () => {
    const transport = createBrowserTransport({ getKey: () => KEY, getAnchor: () => ANCHOR, onMissingKey: () => {} });
    await expect(transport.reconnectToStream({ chatId: "c1" })).resolves.toBeNull();
  });
});

describe("createBrowserTransport with the real streamText + Anthropic provider (fake fetch, no network)", () => {
  function realTransport(fakeFetch: typeof fetch) {
    return createBrowserTransport({
      getKey: () => KEY,
      getAnchor: () => ANCHOR,
      onMissingKey: () => {},
      deps: { createModel: (k: string) => createSenseiModel(k, fakeFetch) },
    });
  }

  it("sends the browser-direct header, effort and both cache breakpoints", async () => {
    let headers: Headers | null = null;
    let body: Record<string, unknown> | null = null;
    const fakeFetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      headers = new Headers(init?.headers);
      body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return sse(anthropicStream("end_turn"));
    }) as typeof fetch;
    const chunks = await readAll(await send(realTransport(fakeFetch), [user("u1", "なぜアが正解？")]));
    expect(headers!.get("anthropic-dangerous-direct-browser-access")).toBe("true");
    expect(headers!.get("x-api-key")).toBe(KEY);
    const b = body!;
    expect(b.model).toBe(MODEL_ID);
    expect(b.max_tokens).toBe(4000);
    expect(JSON.stringify(b)).toContain('"effort":"low"');
    const system = b.system as { text: string; cache_control?: unknown }[];
    expect(system.map((s) => s.text)).toEqual([SENSEI_SYSTEM_INSTRUCTION, ANCHOR]);
    expect(system.every((s) => JSON.stringify(s.cache_control) === '{"type":"ephemeral"}')).toBe(true);
    expect(chunks.find((c) => c.type === "finish")).toMatchObject({ finishReason: "stop" });
  });

  it("an Anthropic refusal (stop_reason: refusal) finishes with finishReason content-filter", async () => {
    const fakeFetch = (async () => sse(anthropicStream("refusal"))) as typeof fetch;
    const chunks = await readAll(await send(realTransport(fakeFetch), [user("u1", "hi")]));
    const finish = chunks.find((c) => c.type === "finish");
    expect(finish).toMatchObject({ finishReason: "content-filter" });
    expect(toSenseiError({ finishReason: (finish as { finishReason?: string }).finishReason }).kind).toBe("refusal");
  });

  it("a 401 becomes a key-free auth errorText and the error object is never logged", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const fakeFetch = (async () =>
      new Response(
        JSON.stringify({ type: "error", error: { type: "authentication_error", message: `invalid x-api-key ${KEY}` } }),
        { status: 401, headers: { "content-type": "application/json" } },
      )) as typeof fetch;
    const chunks = await readAll(await send(realTransport(fakeFetch), [user("u1", "hi")]));
    const err = chunks.find((c) => c.type === "error") as { errorText: string } | undefined;
    expect(err).toBeDefined();
    expect(err!.errorText).not.toContain(KEY);
    expect(toSenseiError(new Error(err!.errorText)).kind).toBe("auth");
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("a 429 maps to rate after one retry (fake timers: no real backoff wait)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers();
    let calls = 0;
    const fakeFetch = (async () => {
      calls++;
      return new Response(JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "slow down" } }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
    try {
      const pending = send(realTransport(fakeFetch), [user("u1", "hi")]).then(readAll);
      await vi.runAllTimersAsync();
      const chunks = await pending;
      const err = chunks.find((c) => c.type === "error") as { errorText: string };
      expect(toSenseiError(new Error(err.errorText)).kind).toBe("rate");
      expect(calls).toBe(2); // maxRetries: 1
    } finally {
      vi.useRealTimers();
    }
  });

  it("a streamed Anthropic error event (overloaded_error) maps to rate", async () => {
    const fakeFetch = (async () =>
      sse([
        anthropicStream("end_turn")[0]!,
        { type: "error", error: { type: "overloaded_error", message: "Overloaded" } },
      ])) as typeof fetch;
    const chunks = await readAll(await send(realTransport(fakeFetch), [user("u1", "hi")]));
    const err = chunks.find((c) => c.type === "error") as { errorText: string };
    expect(toSenseiError(new Error(err.errorText))).toEqual({ kind: "rate", message: "Overloaded" });
  });

  it("stop() before the first token ends with an abort chunk, not an error", async () => {
    const fakeFetch = ((_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("This operation was aborted", "AbortError")),
        );
      })) as typeof fetch;
    const ac = new AbortController();
    const stream = await send(realTransport(fakeFetch), [user("u1", "hi")], ac.signal);
    setTimeout(() => ac.abort(), 10);
    const types = (await readAll(stream)).map((c) => c.type);
    expect(types).toContain("abort");
    expect(types).not.toContain("error");
  });

  it("a browser fetch failure maps to network", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fakeFetch = (async () => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;
    const chunks = await readAll(await send(realTransport(fakeFetch), [user("u1", "hi")]));
    const err = chunks.find((c) => c.type === "error") as { errorText: string };
    expect(toSenseiError(new Error(err.errorText)).kind).toBe("network");
  });
});
