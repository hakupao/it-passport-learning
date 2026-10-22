// D-181 Task A4 — a fake Anthropic Messages API for e2e. Tests never reach the
// real API: a catch-all route for the whole api.anthropic.com host records any
// request the fake did not answer and aborts it (the spec asserts the list is
// empty), and POST /v1/messages is answered here.
//
// The browser calls Anthropic cross-origin, so the fake answers the CORS
// preflight (OPTIONS) and puts the CORS headers on every response, allowing the
// headers the provider sends plus `authorization` (playwright.config injects a
// Basic header into every request when FIREWALL_BASIC_AUTH is set).
//
// Modes: "ok" → an SSE text stream ending in end_turn; "refusal" → an SSE stream
// ending in stop_reason "refusal"; "401" → Anthropic's authentication_error JSON.
// `delayMs` holds the response before fulfilling it. route.fulfill sends the
// whole body at once (Playwright cannot stream a fulfilled body), so the held
// window is the "submitted" phase (「考え中…」, Stop, clear, switch); the reply's
// deltas then arrive together. A request the page aborted while held is skipped.
//
// Recorded requests keep only the parsed body and the headers the spec checks;
// nothing is attached to the test report.

import type { Page, Route } from "@playwright/test";

export type FakeMode = "ok" | "401" | "refusal";

export interface FakeRequest {
  body: {
    model?: string;
    system?: unknown;
    messages?: { role: string; content: unknown }[];
  };
  headers: Record<string, string>;
}

export interface FakeAnthropic {
  mode: FakeMode;
  delayMs: number;
  /** Text deltas of the next "ok" reply. */
  reply: string[];
  readonly requests: FakeRequest[];
  /** Requests to api.anthropic.com the fake did not answer (must stay empty). */
  readonly unhandled: string[];
}

const ALLOW_HEADERS = [
  "x-api-key",
  "anthropic-version",
  "anthropic-dangerous-direct-browser-access",
  "anthropic-beta",
  "content-type",
  "authorization",
].join(", ");

function corsHeaders(route: Route): Record<string, string> {
  const requested = route.request().headers()["access-control-request-headers"];
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": requested ? `${ALLOW_HEADERS}, ${requested}` : ALLOW_HEADERS,
    "access-control-max-age": "600",
  };
}

function sse(events: Record<string, unknown>[]): string {
  return events.map((e) => `event: ${String(e.type)}\ndata: ${JSON.stringify(e)}\n\n`).join("");
}

function messageStream(deltas: string[], stopReason: "end_turn" | "refusal"): string {
  return sse([
    {
      type: "message_start",
      message: {
        id: "msg_fake",
        type: "message",
        role: "assistant",
        model: "claude-sonnet-5-5",
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 1 },
      },
    },
    { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
    ...deltas.map((text) => ({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text } })),
    { type: "content_block_stop", index: 0 },
    { type: "message_delta", delta: { stop_reason: stopReason, stop_sequence: null }, usage: { output_tokens: 20 } },
    { type: "message_stop" },
  ]);
}

export const DEFAULT_REPLY = [
  "**結論**: イ が正解です。",
  "\n\n- 理由: スタックは",
  "後入れ先出し（LIFO）です。",
  "\n\n[外部資料](https://example.com/a) [危険なリンク](javascript:alert(1)) [辞典](/ja/glossary)",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fakeAnthropic(
  page: Page,
  init: { mode?: FakeMode; delayMs?: number } = {},
): Promise<FakeAnthropic> {
  const fake: FakeAnthropic = {
    mode: init.mode ?? "ok",
    delayMs: init.delayMs ?? 0,
    reply: [...DEFAULT_REPLY],
    requests: [],
    unhandled: [],
  };

  // Registered first = matched last: anything the handler below does not take.
  await page.route("https://api.anthropic.com/**", async (route) => {
    fake.unhandled.push(`${route.request().method()} ${route.request().url()}`);
    await route.abort();
  });

  await page.route("https://api.anthropic.com/v1/messages", async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders(route) });
      return;
    }
    if (req.method() !== "POST") {
      fake.unhandled.push(`${req.method()} ${req.url()}`);
      await route.abort();
      return;
    }
    const headers = await req.allHeaders();
    fake.requests.push({
      body: req.postDataJSON() as FakeRequest["body"],
      headers: {
        "x-api-key": headers["x-api-key"] ?? "",
        "anthropic-dangerous-direct-browser-access": headers["anthropic-dangerous-direct-browser-access"] ?? "",
        "anthropic-version": headers["anthropic-version"] ?? "",
      },
    });
    const { mode, delayMs, reply } = fake;
    if (delayMs > 0) await sleep(delayMs);

    const response =
      mode === "401"
        ? {
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({
              type: "error",
              error: { type: "authentication_error", message: "invalid x-api-key" },
            }),
          }
        : {
            status: 200,
            contentType: "text/event-stream",
            body: messageStream(mode === "refusal" ? [] : reply, mode === "refusal" ? "refusal" : "end_turn"),
          };
    try {
      await route.fulfill({ ...response, headers: corsHeaders(route) });
    } catch {
      // the page aborted the request while it was held (Stop / clear / switch)
    }
  });

  return fake;
}
