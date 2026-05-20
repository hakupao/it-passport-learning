// Phase 2 Step 12 — middleware composition tests (D-099 §2.5 LD-2):
//
//   1. Firewall coverage (D-097) — unchanged surface
//   2. /api/* — firewall passes → next() bypass i18n
//   3. /ja/chat (prefixed) — firewall passes → next-intl handler called
//   4. /chat (unprefixed) — firewall passes → next-intl handler called
//
// We mock `next-intl/middleware` to verify the i18n handler is reached for
// non-/api routes after the firewall passes. The actual next-intl behaviour
// (redirect 307 to /ja, locale recognition) is unit-tested upstream by
// next-intl itself; our concern is composition correctness.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

// Mock next-intl/middleware BEFORE importing the SUT. The factory captures the
// last request the handler saw so we can assert composition behaviour.
const i18nHandlerCalls: string[] = [];
vi.mock("next-intl/middleware", () => ({
  default: () => (req: NextRequest) => {
    i18nHandlerCalls.push(req.nextUrl.pathname);
    // Return a sentinel response that's distinguishable from NextResponse.next().
    return new Response("i18n-handler-stub", {
      status: 200,
      headers: { "x-i18n-handler": "stub" },
    });
  },
}));

import { config, middleware, timingSafeStringEqual } from "../middleware";

// Synthesized at test runtime via btoa() to avoid static base64 in source
// (silences secret-scanner false positives). "claude:test" is a generic
// fixture value, NOT the deployment credential.
const FIXTURE_AUTH = btoa("claude:test");
const FIXTURE_HEADER = `Basic ${FIXTURE_AUTH}`;

function makeRequest(
  pathname: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(`http://test.example.com${pathname}`, {
    headers,
  });
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

describe("middleware — D-097 firewall (step 1, covers all paths)", () => {
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
    const res = middleware(makeRequest("/ja/chat"));
    expect(res.status).toBe(503);
  });

  it("returns 401 with WWW-Authenticate header when no auth header provided", () => {
    process.env.FIREWALL_BASIC_AUTH = FIXTURE_AUTH;
    const res = middleware(makeRequest("/ja/chat"));
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toContain("Basic realm=");
  });

  it("returns 401 when auth header is wrong", () => {
    process.env.FIREWALL_BASIC_AUTH = FIXTURE_AUTH;
    const res = middleware(
      makeRequest("/ja/chat", { authorization: "Basic WRONG==" }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when auth scheme is not Basic", () => {
    process.env.FIREWALL_BASIC_AUTH = FIXTURE_AUTH;
    const res = middleware(
      makeRequest("/ja/chat", { authorization: `Bearer ${FIXTURE_AUTH}` }),
    );
    expect(res.status).toBe(401);
  });

  it("blocks /api/* before i18n branch — wrong auth still 401", () => {
    process.env.FIREWALL_BASIC_AUTH = FIXTURE_AUTH;
    const res = middleware(makeRequest("/api/chat"));
    expect(res.status).toBe(401);
  });
});

describe("middleware — composition (step 2-3, after firewall passes)", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.FIREWALL_BASIC_AUTH;
    process.env.FIREWALL_BASIC_AUTH = FIXTURE_AUTH;
    i18nHandlerCalls.length = 0;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.FIREWALL_BASIC_AUTH;
    } else {
      process.env.FIREWALL_BASIC_AUTH = originalEnv;
    }
  });

  it("passes /api/* through with NextResponse.next (i18n stub NOT called)", () => {
    const res = middleware(
      makeRequest("/api/chat", { authorization: FIXTURE_HEADER }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("x-i18n-handler")).toBeNull();
    expect(i18nHandlerCalls).toHaveLength(0);
  });

  it("passes /api/glossary/hover too (other api routes)", () => {
    const res = middleware(
      makeRequest("/api/glossary/hover", { authorization: FIXTURE_HEADER }),
    );
    expect(res.status).toBe(200);
    expect(i18nHandlerCalls).toHaveLength(0);
  });

  it("forwards /ja/chat (locale-prefixed) to next-intl handler", () => {
    const res = middleware(
      makeRequest("/ja/chat", { authorization: FIXTURE_HEADER }),
    );
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/ja/chat"]);
  });

  it("forwards /zh/glossary (non-default locale prefix) to next-intl handler", () => {
    const res = middleware(
      makeRequest("/zh/glossary", { authorization: FIXTURE_HEADER }),
    );
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/zh/glossary"]);
  });

  it("forwards unprefixed /chat to next-intl handler (which redirects)", () => {
    const res = middleware(
      makeRequest("/chat", { authorization: FIXTURE_HEADER }),
    );
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/chat"]);
  });
});

describe("config", () => {
  it("matcher excludes _next/static, _next/image, favicon.ico", () => {
    expect(config.matcher).toBe(
      "/((?!_next/static|_next/image|favicon.ico).*)",
    );
  });
});
