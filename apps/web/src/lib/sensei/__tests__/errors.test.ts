import { APICallError, RetryError } from "ai";
import { describe, expect, it } from "vitest";

import { formatSenseiError, toSenseiError } from "../errors";

const KEY = "sk-ant-api03-SECRETSECRETSECRET-9f3Q";

function apiError(statusCode: number, message = `HTTP ${statusCode}`): APICallError {
  return new APICallError({
    message,
    url: "https://api.anthropic.com/v1/messages",
    requestBodyValues: { model: "claude-sonnet-5-5" },
    statusCode,
    responseHeaders: {},
    responseBody: "{}",
  });
}

describe("toSenseiError", () => {
  it("maps 401 / 403 to auth", () => {
    expect(toSenseiError(apiError(401)).kind).toBe("auth");
    expect(toSenseiError(apiError(403)).kind).toBe("auth");
  });

  it("maps 429 / 529 to rate", () => {
    expect(toSenseiError(apiError(429)).kind).toBe("rate");
    expect(toSenseiError(apiError(529, "Overloaded")).kind).toBe("rate");
  });

  it("unwraps a RetryError to its last APICallError", () => {
    const last = apiError(529);
    const e = new RetryError({ message: "Failed after 2 attempts", reason: "maxRetriesExceeded", errors: [last, last] });
    expect(toSenseiError(e).kind).toBe("rate");
  });

  it("maps browser fetch failures to network", () => {
    expect(toSenseiError(new TypeError("Failed to fetch")).kind).toBe("network");
    expect(toSenseiError(new TypeError("Load failed")).kind).toBe("network");
    expect(toSenseiError(new TypeError("NetworkError when attempting to fetch resource.")).kind).toBe("network");
    const wrapped = new APICallError({
      message: "Cannot connect to API: getaddrinfo ENOTFOUND",
      url: "https://api.anthropic.com/v1/messages",
      requestBodyValues: {},
      isRetryable: true,
    });
    expect(toSenseiError(wrapped).kind).toBe("network");
  });

  it("maps the content-filter finish reason (Anthropic refusal) to refusal, and length to length", () => {
    expect(toSenseiError({ finishReason: "content-filter" }).kind).toBe("refusal");
    expect(toSenseiError({ finishReason: "length" })).toEqual({ kind: "length", message: "" });
    expect(toSenseiError(new Error(formatSenseiError({ kind: "length", message: "" }))).kind).toBe("length");
  });

  it("maps anything else to other", () => {
    expect(toSenseiError(apiError(500)).kind).toBe("other");
    expect(toSenseiError(new Error("boom")).kind).toBe("other");
    expect(toSenseiError("weird").kind).toBe("other");
    expect(toSenseiError(undefined).kind).toBe("other");
  });

  it("keeps only the message text, with the key masked to … + last 4", () => {
    const e = apiError(401, `invalid x-api-key: ${KEY}`);
    const out = toSenseiError(e, KEY);
    expect(Object.keys(out).sort()).toEqual(["kind", "message"]);
    expect(out.message).not.toContain(KEY);
    expect(out.message).toContain("…9f3Q");
    expect(JSON.stringify(out)).not.toContain("SECRETSECRET");
  });

  it("masks any sk-ant- token even when the key is not passed", () => {
    const out = toSenseiError(new Error(`bad key ${KEY} used`));
    expect(out.message).not.toContain(KEY);
    expect(out.message).toBe("bad key …9f3Q used");
  });

  it("round-trips through formatSenseiError (the UI stream errorText)", () => {
    const first = toSenseiError(apiError(429, `slow down ${KEY}`), KEY);
    const text = formatSenseiError(first);
    expect(text).not.toContain(KEY);
    // useChat surfaces the stream errorText as new Error(errorText)
    expect(toSenseiError(new Error(text))).toEqual(first);
  });
});

describe("toSenseiError on a streamed Anthropic error event (plain object)", () => {
  it("maps overloaded_error / rate_limit_error to rate", () => {
    expect(toSenseiError({ type: "overloaded_error", message: "Overloaded" })).toEqual({ kind: "rate", message: "Overloaded" });
    expect(toSenseiError({ type: "rate_limit_error", message: "slow" }).kind).toBe("rate");
  });

  it("maps authentication_error / permission_error to auth, with the message scrubbed", () => {
    const out = toSenseiError({ type: "authentication_error", message: `invalid x-api-key ${KEY}` }, KEY);
    expect(out).toEqual({ kind: "auth", message: "invalid x-api-key …9f3Q" });
    expect(toSenseiError({ type: "permission_error", message: "no" }).kind).toBe("auth");
  });

  it("maps other error types to other but keeps the message", () => {
    expect(toSenseiError({ type: "api_error", message: "Internal" })).toEqual({ kind: "other", message: "Internal" });
  });
});
