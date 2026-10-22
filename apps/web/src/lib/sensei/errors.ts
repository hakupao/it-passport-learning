// D-181 §0-11 — map a failed AI 先生 call to a kind the panel can explain
// (auth → key が無効 + open settings; rate → 混雑; refusal → 答えられません;
// network → 接続できません; length → the reply hit the output limit before any
// visible text). Only the error's message text is kept: an
// APICallError carries the request data, so the error object itself is never
// stored, logged or returned. Any occurrence of the key (or of an `sk-ant-…`
// token) in the message is masked to `…` + its last 4 characters.
//
// The transport turns a stream error into UI-stream errorText with
// formatSenseiError(); useChat then surfaces it as `new Error(errorText)`, and
// toSenseiError() reads that text back unchanged (idempotent).

import { APICallError, RetryError } from "ai";

export type SenseiErrorKind = "auth" | "rate" | "refusal" | "network" | "length" | "other";

export interface SenseiError {
  kind: SenseiErrorKind;
  message: string;
}

const TAGGED = /^\[sensei:(auth|rate|refusal|network|length|other)\] ([\s\S]*)$/;
const NETWORK_MESSAGE = /failed to fetch|load failed|networkerror|fetch failed|network request failed/i;
const KEY_TOKEN = /sk-ant-[A-Za-z0-9_-]+/g;

function mask(token: string): string {
  return `…${token.slice(-4)}`;
}

function scrub(text: string, apiKey?: string): string {
  const withoutKey = apiKey ? text.split(apiKey).join(mask(apiKey)) : text;
  return withoutKey.replace(KEY_TOKEN, mask);
}

/** A streamed Anthropic SSE `error` event arrives as a plain `{ type, message }` object. */
function plainField(e: unknown, field: "type" | "message"): string | undefined {
  if (e === null || typeof e !== "object" || e instanceof Error) return undefined;
  const v = (e as Record<string, unknown>)[field];
  return typeof v === "string" ? v : undefined;
}

function messageOf(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return plainField(e, "message") ?? "";
}

function kindOf(e: unknown): SenseiErrorKind {
  if (RetryError.isInstance(e)) return kindOf(e.lastError);
  if (e !== null && typeof e === "object") {
    const finishReason = (e as { finishReason?: unknown }).finishReason;
    if (finishReason === "content-filter") return "refusal";
    if (finishReason === "length") return "length";
  }
  if (APICallError.isInstance(e)) {
    const status = e.statusCode;
    if (status === 401 || status === 403) return "auth";
    if (status === 429 || status === 529) return "rate";
    if (status === undefined && e.message.startsWith("Cannot connect to API")) return "network";
    return "other";
  }
  if (e instanceof TypeError && NETWORK_MESSAGE.test(e.message)) return "network";
  const type = plainField(e, "type");
  if (type === "authentication_error" || type === "permission_error") return "auth";
  if (type === "rate_limit_error" || type === "overloaded_error") return "rate";
  return "other";
}

export function toSenseiError(e: unknown, apiKey?: string): SenseiError {
  const text = messageOf(e);
  const tagged = TAGGED.exec(text);
  if (tagged) return { kind: tagged[1] as SenseiErrorKind, message: scrub(tagged[2]!, apiKey) };
  return { kind: kindOf(e), message: scrub(text, apiKey) };
}

/** The UI-stream errorText for a mapped error; toSenseiError() reads it back. */
export function formatSenseiError(err: SenseiError): string {
  return `[sensei:${err.kind}] ${err.message}`;
}
