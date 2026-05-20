import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { NextRequest } from "next/server";

import { config, middleware, timingSafeStringEqual } from "../middleware";

// Pre-computed base64("claude:test") for fixed-input testing.
const VALID_AUTH = "Y2xhdWRlOnRlc3Q=";
const VALID_HEADER = `Basic ${VALID_AUTH}`;

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new Request("http://test.example.com/some-path", {
    headers,
  }) as unknown as NextRequest;
}

describe("timingSafeStringEqual", () => {
  it("returns true for equal strings", () => {
    expect(timingSafeStringEqual("abc", "abc")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(timingSafeStringEqual("abc", "abd")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(timingSafeStringEqual("abc", "abcd")).toBe(false);
  });

  it("returns true for empty strings", () => {
    expect(timingSafeStringEqual("", "")).toBe(true);
  });
});

describe("middleware", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.FIREWALL_BASIC_AUTH;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.FIREWALL_BASIC_AUTH;
    } else {
      process.env.FIREWALL_BASIC_AUTH = originalEnv;
    }
  });

  it("returns 503 fail-closed when FIREWALL_BASIC_AUTH env var is missing", () => {
    delete process.env.FIREWALL_BASIC_AUTH;
    const res = middleware(makeRequest());
    expect(res.status).toBe(503);
  });

  it("returns 401 with WWW-Authenticate header when no auth header provided", () => {
    process.env.FIREWALL_BASIC_AUTH = VALID_AUTH;
    const res = middleware(makeRequest());
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toContain("Basic realm=");
  });

  it("returns 401 when auth header is wrong", () => {
    process.env.FIREWALL_BASIC_AUTH = VALID_AUTH;
    const res = middleware(makeRequest({ authorization: "Basic WRONG==" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when auth scheme is not Basic", () => {
    process.env.FIREWALL_BASIC_AUTH = VALID_AUTH;
    const res = middleware(
      makeRequest({ authorization: `Bearer ${VALID_AUTH}` }),
    );
    expect(res.status).toBe(401);
  });

  it("passes through when auth header matches expected", () => {
    process.env.FIREWALL_BASIC_AUTH = VALID_AUTH;
    const res = middleware(makeRequest({ authorization: VALID_HEADER }));
    // NextResponse.next() returns status 200 with internal x-middleware-next: 1 header.
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });
});

describe("config", () => {
  it("matcher excludes _next/static, _next/image, favicon.ico", () => {
    expect(config.matcher).toBe(
      "/((?!_next/static|_next/image|favicon.ico).*)",
    );
  });
});
