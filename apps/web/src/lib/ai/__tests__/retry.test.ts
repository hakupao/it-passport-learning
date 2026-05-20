import { describe, expect, it } from "vitest";
import {
  formatUserFacingError,
  isRetryableError,
  STREAM_CONFIG,
  USER_FACING_LLM_UNAVAILABLE_MESSAGE,
} from "../retry";

describe("STREAM_CONFIG — D-088 §2.4 single-retry-no-fallback", () => {
  it("pins maxRetries = 1 (= 2 total attempts per D-088 §2.4 diagram)", () => {
    expect(STREAM_CONFIG.maxRetries).toBe(1);
  });

  it("is frozen so consumers cannot mutate the policy at runtime", () => {
    expect(Object.isFrozen(STREAM_CONFIG)).toBe(true);
  });
});

describe("USER_FACING_LLM_UNAVAILABLE_MESSAGE — D-088 §2.4 user surface", () => {
  it("matches the locked Chinese text verbatim", () => {
    expect(USER_FACING_LLM_UNAVAILABLE_MESSAGE).toBe(
      "AI 暂时不可用，请稍后重试。",
    );
  });
});

describe("formatUserFacingError — D-088 §2.4 mapping", () => {
  it("returns the locked message for any thrown value", () => {
    expect(formatUserFacingError(new Error("raw provider error"))).toBe(
      USER_FACING_LLM_UNAVAILABLE_MESSAGE,
    );
    expect(formatUserFacingError("string error")).toBe(
      USER_FACING_LLM_UNAVAILABLE_MESSAGE,
    );
    expect(formatUserFacingError(null)).toBe(
      USER_FACING_LLM_UNAVAILABLE_MESSAGE,
    );
    expect(formatUserFacingError(undefined)).toBe(
      USER_FACING_LLM_UNAVAILABLE_MESSAGE,
    );
    expect(formatUserFacingError({ statusCode: 500 })).toBe(
      USER_FACING_LLM_UNAVAILABLE_MESSAGE,
    );
  });
});

describe("isRetryableError — D-088 §2.4 transient classifier", () => {
  it("returns false for null / undefined", () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it("returns false for non-error scalars", () => {
    expect(isRetryableError("oops")).toBe(false);
    expect(isRetryableError(42)).toBe(false);
    expect(isRetryableError({})).toBe(false);
  });

  it("returns true for fetch-style TypeError (network failure)", () => {
    expect(isRetryableError(new TypeError("fetch failed"))).toBe(true);
    expect(isRetryableError(new TypeError("network unreachable"))).toBe(true);
  });

  it("returns false for unrelated TypeError", () => {
    expect(isRetryableError(new TypeError("not a function"))).toBe(false);
  });

  it("returns true for Node net codes (ECONNRESET / ETIMEDOUT / etc.)", () => {
    const make = (code: string): Error => {
      const e = new Error("net error") as Error & { code: string };
      e.code = code;
      return e;
    };
    expect(isRetryableError(make("ECONNRESET"))).toBe(true);
    expect(isRetryableError(make("ETIMEDOUT"))).toBe(true);
    expect(isRetryableError(make("ECONNREFUSED"))).toBe(true);
    expect(isRetryableError(make("EAI_AGAIN"))).toBe(true);
    expect(isRetryableError(make("EPIPE"))).toBe(true);
  });

  it("ignores unrelated net codes", () => {
    const e = new Error("net err") as Error & { code: string };
    e.code = "ENOTFOUND";
    expect(isRetryableError(e)).toBe(false);
  });

  it("returns true for AI SDK errors with statusCode 429 / 5xx", () => {
    const make = (status: number): Error => {
      const e = new Error("provider err") as Error & { statusCode: number };
      e.statusCode = status;
      return e;
    };
    expect(isRetryableError(make(429))).toBe(true);
    expect(isRetryableError(make(500))).toBe(true);
    expect(isRetryableError(make(502))).toBe(true);
    expect(isRetryableError(make(503))).toBe(true);
    expect(isRetryableError(make(504))).toBe(true);
    expect(isRetryableError(make(599))).toBe(true);
  });

  it("returns false for 4xx (except 429)", () => {
    const make = (status: number): Error => {
      const e = new Error("4xx") as Error & { statusCode: number };
      e.statusCode = status;
      return e;
    };
    expect(isRetryableError(make(400))).toBe(false);
    expect(isRetryableError(make(401))).toBe(false);
    expect(isRetryableError(make(403))).toBe(false);
    expect(isRetryableError(make(404))).toBe(false);
    expect(isRetryableError(make(422))).toBe(false);
  });

  it("returns true on Anthropic responseBody containing overloaded_error", () => {
    const e = new Error("api call failed") as Error & {
      responseBody: string;
    };
    e.responseBody = JSON.stringify({
      type: "error",
      error: { type: "overloaded_error", message: "Overloaded" },
    });
    expect(isRetryableError(e)).toBe(true);
  });

  it("returns true for messages containing 503 / overloaded / timeout substrings", () => {
    expect(isRetryableError(new Error("upstream 503 Bad Gateway"))).toBe(true);
    expect(isRetryableError(new Error("provider is overloaded"))).toBe(true);
    expect(isRetryableError(new Error("request timeout after 30s"))).toBe(true);
  });

  it("returns false for generic Errors without status / code / hint substrings", () => {
    expect(isRetryableError(new Error("validation failed"))).toBe(false);
  });
});
