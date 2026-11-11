import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { config, middleware } from "../middleware.dev";

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(`http://test.example.com${pathname}`);
}

/** The one Set-Cookie line for `name` (exact name match; fails when absent). */
function cookieLine(lines: string[], name: string): string {
  const hits = lines.filter((l) => l.startsWith(`${name}=`));
  expect(hits, name).toHaveLength(1);
  return hits[0]!;
}

describe("middleware — routing", () => {
  beforeEach(() => {
    i18nHandlerCalls.length = 0;
  });

  it("passes /api/* through with NextResponse.next (i18n NOT called)", async () => {
    const res = await middleware(makeRequest("/api/chat"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("x-i18n-handler")).toBeNull();
    expect(i18nHandlerCalls).toHaveLength(0);
  });

  it("passes /api/glossary/hover too", async () => {
    const res = await middleware(makeRequest("/api/glossary/hover"));
    expect(res.status).toBe(200);
    expect(i18nHandlerCalls).toHaveLength(0);
  });

  it("forwards /ja/chat to next-intl handler", async () => {
    const res = await middleware(makeRequest("/ja/chat"));
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/ja/chat"]);
  });

  it("forwards /zh/glossary to next-intl handler", async () => {
    const res = await middleware(makeRequest("/zh/glossary"));
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/zh/glossary"]);
  });

  it("forwards unprefixed /chat to next-intl handler", async () => {
    const res = await middleware(makeRequest("/chat"));
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
    expect(i18nHandlerCalls).toEqual(["/chat"]);
  });
});

describe("config", () => {
  it("matcher excludes _next/static, _next/image, favicon.ico, robots.txt, quiz-figures/, data/", () => {
    expect(config.matcher).toBe(
      "/((?!_next/static|_next/image|favicon.ico|robots.txt|quiz-figures/|data/).*)",
    );
  });

  it("matcher boundary: skips /data/* (the static JSON files, D-217 H1-2) but not look-alikes", () => {
    const re = new RegExp(`^${config.matcher}$`);
    // excluded → served as the build-time file, no /ja/data/… redirect
    expect(re.test("/data/quiz/index.json")).toBe(false);
    expect(re.test("/data/quiz/2026r08.zh.json")).toBe(false);
    // anchored by the slash: an unrelated path still goes through the middleware
    expect(re.test("/database")).toBe(true);
    expect(re.test("/ja/data/quiz/index.json")).toBe(true);
  });

  it("matcher boundary: skips /robots.txt at the root (D-217)", () => {
    const re = new RegExp(`^${config.matcher}$`);
    // excluded → served as the static public file, no middleware, no /ja/robots.txt redirect
    expect(re.test("/robots.txt")).toBe(false);
    // a locale-prefixed path still goes through the middleware
    expect(re.test("/ja/robots.txt")).toBe(true);
  });

  it("matcher boundary: skips /quiz-figures/* but processes app routes (Session 86)", () => {
    const re = new RegExp(`^${config.matcher}$`);
    // excluded (middleware skipped → served statically)
    expect(re.test("/quiz-figures/2009h21a-q012.webp")).toBe(false);
    // anchored: an unrelated path is NOT bypassed
    expect(re.test("/quiz-figuresEVIL/x")).toBe(true);
    // normal routes still go through the i18n handler
    expect(re.test("/ja/quiz")).toBe(true);
    expect(re.test("/zh/quiz")).toBe(true);
  });
});

describe("middleware — D-148 owner_key activation", () => {
  const KEY = "owner-secret-xyz";
  const KEY_HASH = createHash("sha256").update(KEY).digest("hex");

  beforeEach(() => {
    i18nHandlerCalls.length = 0;
    vi.stubEnv("OWNER_KEY", KEY);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("correct key: redirects to the same URL without the param and sets the hashed httpOnly cookie", async () => {
    const res = await middleware(
      makeRequest(`/ja/quiz?mode=exam&owner_key=${KEY}&id=2016h28h`),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://test.example.com/ja/quiz?mode=exam&id=2016h28h",
    );
    const lines = res.headers.getSetCookie();
    expect(lines).toHaveLength(2);
    const owner = cookieLine(lines, "itp_owner");
    expect(owner).toContain(`itp_owner=${KEY_HASH};`);
    expect(owner).not.toContain(KEY + ";");
    expect(owner).toMatch(/HttpOnly/i);
    expect(owner).toMatch(/Secure/i);
    expect(owner).toMatch(/SameSite=lax/i);
    expect(owner).toMatch(/Path=\//);
    expect(owner).toMatch(/Max-Age=31536000/);
    expect(i18nHandlerCalls).toHaveLength(0);
  });

  it("correct key: also sets the readable UI hint cookie (H1-1) — value 1, not httpOnly, same scope / lifetime", async () => {
    const res = await middleware(makeRequest(`/ja/textbook?owner_key=${KEY}`));
    const hint = cookieLine(res.headers.getSetCookie(), "itp_owner_hint");
    expect(hint).toMatch(/^itp_owner_hint=1;/);
    expect(hint).not.toMatch(/HttpOnly/i);
    expect(hint).not.toContain(KEY_HASH);
    expect(hint).toMatch(/Secure/i);
    expect(hint).toMatch(/SameSite=lax/i);
    expect(hint).toMatch(/Path=\//);
    expect(hint).toMatch(/Max-Age=31536000/);
  });

  it("wrong key: strips the param, sets no cookie", async () => {
    const res = await middleware(makeRequest("/en/quiz?owner_key=wrong"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://test.example.com/en/quiz");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("OWNER_KEY unset: even an empty/any key sets no cookie (fail-closed)", async () => {
    vi.stubEnv("OWNER_KEY", "");
    const res = await middleware(makeRequest("/en/quiz?owner_key="));
    expect(res.status).toBe(307);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("owner_key=logout clears the owner cookie and the hint cookie", async () => {
    const res = await middleware(makeRequest("/zh?owner_key=logout"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://test.example.com/zh");
    const lines = res.headers.getSetCookie();
    expect(lines).toHaveLength(2);
    for (const name of ["itp_owner", "itp_owner_hint"]) {
      const line = cookieLine(lines, name);
      expect(line).toMatch(new RegExp(`^${name}=;`));
      expect(line).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
    }
  });

  it("does not intercept /api/* even with owner_key", async () => {
    const res = await middleware(makeRequest(`/api/chat?owner_key=${KEY}`));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("requests without owner_key still go to the i18n handler", async () => {
    const res = await middleware(makeRequest("/ja/quiz?mode=exam"));
    expect(res.headers.get("x-i18n-handler")).toBe("stub");
  });
});
