import { beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

const i18nHandlerCalls: string[] = [];
vi.mock("next-intl/middleware", () => ({
  default: () => (req: NextRequest) => {
    i18nHandlerCalls.push(req.nextUrl.pathname);
    return new Response("i18n-handler-stub", {
      status: 200,
      headers: { "x-i18n-handler": "stub" },
    });
  },
}));

import { config, middleware } from "../middleware";

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(`http://test.example.com${pathname}`);
}

describe("middleware — routing", () => {
  beforeEach(() => {
    i18nHandlerCalls.length = 0;
  });

  it("passes /api/* through with NextResponse.next (i18n NOT called)", () => {
    const res = middleware(makeRequest("/api/chat"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("x-i18n-handler")).toBeNull();
    expect(i18nHandlerCalls).toHaveLength(0);
  });

  it("passes /api/glossary/hover too", () => {
    const res = middleware(makeRequest("/api/glossary/hover"));
    expect(res.status).toBe(200);
    expect(i18nHandlerCalls).toHaveLength(0);
  });

  it("forwards /ja/chat to next-intl handler", () => {
    const res = middleware(makeRequest("/ja/chat"));
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/ja/chat"]);
  });

  it("forwards /zh/glossary to next-intl handler", () => {
    const res = middleware(makeRequest("/zh/glossary"));
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/zh/glossary"]);
  });

  it("forwards unprefixed /chat to next-intl handler", () => {
    const res = middleware(makeRequest("/chat"));
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
