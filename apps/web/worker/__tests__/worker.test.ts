// D-217 H3 — the Cloudflare Worker's fetch handler, Request in → Response out, end to end through
// the real @upstash/redis client: `fetch` is the in-memory Upstash REST emulation
// (worker/testing/fakeUpstash.ts, base64 response encoding like the real service), env comes from
// process.env as nodejs_compat populates it in workerd. Covers every status path of /api/learning,
// /api/quiz/feedback and /api/owner, routing (404 / 405 / non-/api), the security headers and the
// owner cookie attributes; the full contract of the two APIs is also run against the Worker by the
// route tests (vitest project "worker-routes").
// Each test imports a fresh module graph: the Redis loaders cache their client (or null) per module.

import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contentSecurityPolicy } from "@/lib/export/headers";
import { emptyRecord, encodeRecord, mergeRecords, recordAttempt, type WireRecordV2 } from "@/lib/learning/record";

import { createFakeUpstash, type FakeUpstash } from "../testing/fakeUpstash";
import type { Env } from "../index";

const KEY = "owner-secret-xyz";
const KEY_HASH = createHash("sha256").update(KEY).digest("hex");
const OWNER = `itp_owner=${KEY_HASH}`;
const ORIGIN = "https://itlearn.example";

let upstash: FakeUpstash;
let worker: { fetch(request: Request, env: Env): Promise<Response> };
let errSpy: ReturnType<typeof vi.spyOn>;

async function freshWorker(): Promise<void> {
  vi.resetModules();
  worker = (await import("../index")).default;
}

beforeEach(async () => {
  upstash = createFakeUpstash();
  vi.stubGlobal("fetch", upstash.fetch);
  vi.stubEnv("OWNER_KEY", KEY);
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("KV_REST_API_URL", upstash.url);
  vi.stubEnv("KV_REST_API_TOKEN", upstash.token);
  vi.stubEnv("UPSTASH_DISABLE_TELEMETRY", "1");
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  await freshWorker();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function req(path: string, init: RequestInit & { cookie?: string | null } = {}): Request {
  const { cookie = OWNER, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (cookie) headers.set("cookie", cookie);
  return new Request(ORIGIN + path, { ...rest, headers });
}

const call = (r: Request, env: Env = {}) => worker.fetch(r, env);

function expectApiHeaders(res: Response): void {
  expect(res.headers.get("Content-Security-Policy")).toBe(contentSecurityPolicy(false));
  expect(res.headers.get("Cache-Control")).toBe("no-store");
  expect(res.headers.get("X-Robots-Tag")).toBe("noindex");
}

/** Everything console.error was called with, as one string. */
const logged = (): string => JSON.stringify(errSpy.mock.calls);

const WIRE: WireRecordV2 = encodeRecord(
  mergeRecords(recordAttempt(emptyRecord(), "2016h28h-q033", "イ", true, 1_700_000_000_000, "practice"), emptyRecord()),
);

describe("routing", () => {
  it("unknown /api path → 404 JSON with the API headers", async () => {
    for (const path of ["/api", "/api/", "/api/nope", "/api/learning/", "/api/quiz/questions", "/api/sensei/terms"]) {
      const res = await call(req(path));
      expect(res.status, path).toBe(404);
      expect(await res.json()).toEqual({ error: "not found" });
      expectApiHeaders(res);
    }
  });

  it("known path, other method → 405 with Allow (HEAD and OPTIONS included)", async () => {
    const cases: [string, string, string][] = [
      ["/api/learning", "POST", "GET, PUT"],
      ["/api/learning", "DELETE", "GET, PUT"],
      ["/api/learning", "HEAD", "GET, PUT"],
      ["/api/learning", "OPTIONS", "GET, PUT"],
      ["/api/quiz/feedback", "PUT", "GET, POST"],
      ["/api/owner", "POST", "GET"],
    ];
    for (const [path, method, allow] of cases) {
      const res = await call(req(path, { method }));
      expect(res.status, `${method} ${path}`).toBe(405);
      expect(res.headers.get("Allow")).toBe(allow);
      expectApiHeaders(res);
    }
    expect(upstash.calls).toEqual([]);
  });

  it("a non-GET with Sec-Fetch-Site other than same-origin → 403 before routing (even unknown path / method)", async () => {
    const cases: [string, string][] = [
      ["/api/learning", "PUT"],
      ["/api/learning", "DELETE"],
      ["/api/quiz/feedback", "POST"],
      ["/api/owner", "POST"],
      ["/api/nope", "POST"],
    ];
    for (const [path, method] of cases) {
      const res = await call(req(path, { method, headers: { "Sec-Fetch-Site": "cross-site" }, body: "{}" }));
      expect(res.status, `${method} ${path}`).toBe(403);
      expectApiHeaders(res);
    }
    expect(upstash.calls).toEqual([]);
    // a cross-site GET (e.g. the activation link opened from another site) is not blocked
    const g = await call(req("/api/owner?key=x&next=/ja", { headers: { "Sec-Fetch-Site": "cross-site" } }));
    expect(g.status).toBe(307);
  });

  it("a method name that is an Object.prototype key is not a handler", async () => {
    // Request normalizes only standard methods; a custom token like "constructor" is kept as is.
    const res = await call(req("/api/learning", { method: "constructor" }));
    expect(res.status).toBe(405);
  });

  it("outside /api/* → handed to the ASSETS binding unchanged (its 404 page)", async () => {
    const seen: string[] = [];
    const assets = {
      fetch: async (r: Request) => {
        seen.push(new URL(r.url).pathname);
        return new Response("<html>404</html>", { status: 404, headers: { "Content-Type": "text/html" } });
      },
    };
    const res = await call(req("/ja/practice/q/nope.txt"), { ASSETS: assets });
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("<html>404</html>");
    expect(seen).toEqual(["/ja/practice/q/nope.txt"]);
    expect(res.headers.get("X-Robots-Tag")).toBeNull();
    // /apiX is not /api/*
    await call(req("/apix"), { ASSETS: assets });
    expect(seen).toEqual(["/ja/practice/q/nope.txt", "/apix"]);
  });

  it("outside /api/* without an ASSETS binding → plain 404", async () => {
    const res = await call(req("/ja"));
    expect(res.status).toBe(404);
  });

  it("a handler that throws → 500 JSON, the log names the error only", async () => {
    vi.doMock("@/lib/learning/syncRoute", () => ({
      GET: async () => {
        throw new TypeError("secret detail");
      },
      PUT: async () => new Response(null),
    }));
    await freshWorker();
    const res = await call(req("/api/learning"));
    expect(res.status).toBe(500);
    expectApiHeaders(res);
    expect(logged()).toContain("[worker-error]");
    expect(logged()).toContain("TypeError");
    expect(logged()).not.toContain("secret detail");
    vi.doUnmock("@/lib/learning/syncRoute");
  });
});

describe("/api/learning through the Upstash REST client", () => {
  it("403 for no cookie / wrong cookie / OWNER_KEY unset — before any store call", async () => {
    expect((await call(req("/api/learning", { cookie: null }))).status).toBe(403);
    expect((await call(req("/api/learning", { cookie: "itp_owner=nope" }))).status).toBe(403);
    expect((await call(req("/api/learning", { cookie: "itp_owner_hint=1" }))).status).toBe(403);
    vi.stubEnv("OWNER_KEY", "");
    const res = await call(req("/api/learning", { method: "PUT", body: "{" }));
    expect(res.status).toBe(403);
    expectApiHeaders(res);
    expect(upstash.calls).toEqual([]);
  });

  it("503 when the Upstash env is missing", async () => {
    vi.stubEnv("KV_REST_API_URL", "");
    await freshWorker();
    const g = await call(req("/api/learning"));
    expect(g.status).toBe(503);
    expectApiHeaders(g);
    expect((await call(req("/api/learning", { method: "PUT", body: JSON.stringify(WIRE) }))).status).toBe(503);
  });

  it("GET on an empty store: v1 by default, v2 with ?v=2", async () => {
    const v1 = await call(req("/api/learning"));
    expect(v1.status).toBe(200);
    expect(await v1.json()).toEqual({ v: 1, questions: {}, unitsRead: {} });
    const v2 = await call(req("/api/learning?v=2"));
    expect(await v2.json()).toEqual({ v: 2, a: {}, u: {}, s: {} });
    expectApiHeaders(v2);
    expect(upstash.calls).toEqual(["get", "get", "get", "get"]); // v2 key, then the v1 fallback, twice
  });

  it("PUT v2 → 200 merged v2 wire, stored at learn:owner:v2; GET ?v=2 returns it", async () => {
    const put = await call(req("/api/learning", { method: "PUT", body: JSON.stringify(WIRE) }));
    expect(put.status).toBe(200);
    expect(await put.json()).toEqual(WIRE);
    expect(JSON.parse(upstash.strings.get("learn:owner:v2")!)).toEqual(WIRE);
    const get = await call(req("/api/learning?v=2"));
    expect(await get.json()).toEqual(WIRE);
  });

  it("PUT v1 body → 200 v1; the stored doc is v2 with a src v1 attempt", async () => {
    const body = { v: 1, questions: { "2017h29a-q015": { choice: "ア", correct: false, at: 300 } }, unitsRead: {} };
    const res = await call(req("/api/learning", { method: "PUT", body: JSON.stringify(body) }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(body);
    expect(JSON.parse(upstash.strings.get("learn:owner:v2")!).a["2017h29a-q015"]).toEqual([[300, 0, 0, "1"]]);
  });

  it("the stored v1 doc is read (upgraded) when the v2 key is missing, and never written", async () => {
    const v1 = { v: 1, questions: { "2019r01a-q001": { choice: "ウ", correct: true, at: 10 } }, unitsRead: { "t-01-01": 5 } };
    upstash.strings.set("learn:owner:v1", JSON.stringify(v1));
    const res = await call(req("/api/learning"));
    expect(await res.json()).toEqual(v1);
    await call(req("/api/learning", { method: "PUT", body: JSON.stringify(WIRE) }));
    expect(upstash.strings.get("learn:owner:v1")).toBe(JSON.stringify(v1));
    expect(Object.keys(JSON.parse(upstash.strings.get("learn:owner:v2")!).a).sort()).toEqual(["2016h28h-q033", "2019r01a-q001"]);
  });

  it("400: invalid JSON, neither v1 nor v2, over 1 MiB (declared and actual); nothing written", async () => {
    for (const body of ["{", JSON.stringify({ v: 3 }), "x".repeat(1048577)]) {
      const res = await call(req("/api/learning", { method: "PUT", body }));
      expect(res.status).toBe(400);
      expectApiHeaders(res);
    }
    const declared = await call(
      req("/api/learning", { method: "PUT", body: "{}", headers: { "content-length": "1048577" } }),
    );
    expect(declared.status).toBe(400);
    expect(upstash.calls.filter((c) => c === "set")).toEqual([]);
  });

  it("a corrupt stored doc → 500, nothing written, the log names the error only", async () => {
    upstash.strings.set("learn:owner:v2", JSON.stringify({ v: 2, a: "corrupt-marker" }));
    const g = await call(req("/api/learning?v=2"));
    expect(g.status).toBe(500);
    const p = await call(req("/api/learning", { method: "PUT", body: JSON.stringify(WIRE) }));
    expect(p.status).toBe(500);
    expect(await p.json()).toEqual({ error: "stored learning record is corrupt" });
    expect(upstash.calls.filter((c) => c === "set")).toEqual([]);
    expect(logged()).toContain("CorruptStoredRecordError");
    expect(logged()).not.toContain("corrupt-marker");
    expect(logged()).not.toContain(KEY_HASH);
  });

  it("an Upstash failure (HTTP 500 / 401 from the REST API) → 502; the log has no record, body or token", async () => {
    upstash.failWith = 500;
    const g = await call(req("/api/learning"));
    expect(g.status).toBe(502);
    expect(await g.json()).toEqual({ error: "learning store error" });
    upstash.failWith = null;
    vi.stubEnv("KV_REST_API_TOKEN", "wrong-token");
    await freshWorker();
    const p = await call(req("/api/learning", { method: "PUT", body: JSON.stringify(WIRE) }));
    expect(p.status).toBe(502);
    expectApiHeaders(p);
    const log = logged();
    expect(log).toContain("[learning-sync-error]");
    expect(log).not.toContain("2016h28h-q033");
    expect(log).not.toContain("fake outage");
    expect(log).not.toContain("wrong-token");
    expect(log).not.toContain(KEY_HASH);
  });

  it("a network error reaching Upstash → 502", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    const res = await call(req("/api/learning"));
    expect(res.status).toBe(502);
  });
});

describe("/api/quiz/feedback through the Upstash REST client", () => {
  const VALID = { question_id: "2016h28h-q033", locale: "ja", category: "text_error", note: " 誤字 " };
  const post = (body: unknown, cookie: string | null = OWNER) =>
    req("/api/quiz/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
      cookie,
    });

  it("POST → 201 record (MULTI/EXEC: record + 2 indexes); GET lists it newest first", async () => {
    const a = await call(post(VALID));
    expect(a.status).toBe(201);
    expectApiHeaders(a);
    const rec = (await a.json()) as { id: string; note: string; status: string };
    expect(rec).toMatchObject({ note: "誤字", status: "open" });
    expect(upstash.calls).toEqual(["set", "zadd", "zadd"]);
    expect(upstash.zsets.get("quiz:feedback:index")!.has(rec.id)).toBe(true);
    await new Promise((r) => setTimeout(r, 5));
    const b = (await (await call(post({ ...VALID, note: "second" }))).json()) as { id: string };
    const list = await call(req("/api/quiz/feedback?question_id=2016h28h-q033"));
    expect(list.status).toBe(200);
    const { records } = (await list.json()) as { records: { id: string }[] };
    expect(records.map((r) => r.id)).toEqual([b.id, rec.id]);
  });

  it("GET for a question without reports → 200 { records: [] }", async () => {
    const res = await call(req("/api/quiz/feedback?question_id=2017h29a-q015"));
    expect(await res.json()).toEqual({ records: [] });
  });

  it("403 / 503 / 400 in that order", async () => {
    expect((await call(post("not json", null))).status).toBe(403);
    expect((await call(req("/api/quiz/feedback?question_id=bad", { cookie: null }))).status).toBe(403);
    expect((await call(post("not json"))).status).toBe(400);
    expect((await call(post({ ...VALID, category: "nope" }))).status).toBe(400);
    expect((await call(req("/api/quiz/feedback?question_id=../x"))).status).toBe(400);
    vi.stubEnv("KV_REST_API_TOKEN", "");
    await freshWorker();
    expect((await call(post("not json"))).status).toBe(503);
    expect((await call(req("/api/quiz/feedback?question_id=bad"))).status).toBe(503);
    expect(upstash.calls).toEqual([]);
  });

  it("an Upstash failure → 502; the log names the error, not the command or the note", async () => {
    upstash.failWith = 500;
    const p = await call(post({ ...VALID, note: "note-marker" }));
    expect(p.status).toBe(502);
    expect(await p.json()).toEqual({ error: "feedback store error" });
    const g = await call(req("/api/quiz/feedback?question_id=2016h28h-q033"));
    expect(g.status).toBe(502);
    const log = logged();
    expect(log).toContain("[quiz-feedback-store-error]");
    expect(log).not.toContain("note-marker");
    expect(log).not.toContain("fake outage");
    expect(log).not.toContain("command was");
  });
});

describe("/api/owner activation", () => {
  const activate = (qs: string) => call(req(`/api/owner${qs}`, { cookie: null }));

  function cookieLine(res: Response, name: string): string {
    const hits = res.headers.getSetCookie().filter((l) => l.startsWith(`${name}=`));
    expect(hits, name).toHaveLength(1);
    return hits[0]!;
  }

  it("correct key: 307 to next, itp_owner = sha256 hex (httpOnly, Secure, Lax, Path=/, 1 year) + the readable hint", async () => {
    const res = await activate(`?key=${encodeURIComponent(KEY)}&next=${encodeURIComponent("/ja/quiz?mode=exam&id=2016h28h#q5")}`);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/ja/quiz?mode=exam&id=2016h28h#q5`);
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    expectApiHeaders(res);
    expect(res.headers.getSetCookie()).toHaveLength(2);
    const owner = cookieLine(res, "itp_owner");
    expect(owner).toMatch(new RegExp(`^itp_owner=${KEY_HASH};`));
    expect(owner).not.toContain(KEY);
    for (const re of [/; HttpOnly/i, /; Secure/i, /; SameSite=Lax/i, /; Path=\//, /; Max-Age=31536000/]) expect(owner).toMatch(re);
    const hint = cookieLine(res, "itp_owner_hint");
    expect(hint).toMatch(/^itp_owner_hint=1;/);
    expect(hint).not.toMatch(/HttpOnly/i);
    for (const re of [/; Secure/i, /; SameSite=Lax/i, /; Path=\//, /; Max-Age=31536000/]) expect(hint).toMatch(re);
    expect(upstash.calls).toEqual([]);
  });

  it("the cookie it sets is accepted by /api/learning", async () => {
    const res = await activate(`?key=${KEY}&next=/ja`);
    const value = cookieLine(res, "itp_owner").split(";")[0]!;
    expect((await call(req("/api/learning", { cookie: value }))).status).toBe(200);
  });

  it("wrong / empty / missing key: 307 to next, no cookie", async () => {
    for (const qs of ["?key=wrong&next=/en/quiz", "?key=&next=/en/quiz", "?next=/en/quiz", `?key=${KEY_HASH}&next=/en/quiz`]) {
      const res = await activate(qs);
      expect(res.status, qs).toBe(307);
      expect(res.headers.get("location")).toBe(`${ORIGIN}/en/quiz`);
      expect(res.headers.getSetCookie(), qs).toEqual([]);
    }
  });

  it("OWNER_KEY unset: no key (not even an empty one) sets a cookie", async () => {
    vi.stubEnv("OWNER_KEY", "");
    for (const qs of ["?key=", `?key=${KEY}`, "?key=undefined"]) {
      expect((await activate(qs)).headers.getSetCookie(), qs).toEqual([]);
    }
  });

  it("key=logout clears both cookies (Max-Age=0, same Path / Secure / SameSite)", async () => {
    const res = await activate("?key=logout&next=/zh");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/zh`);
    expect(res.headers.getSetCookie()).toHaveLength(2);
    for (const name of ["itp_owner", "itp_owner_hint"]) {
      const line = cookieLine(res, name);
      expect(line).toMatch(new RegExp(`^${name}=;`));
      expect(line).toMatch(/Max-Age=0/);
      expect(line).toMatch(/Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
      expect(line).toMatch(/; Path=\//);
      expect(line).toMatch(/; Secure/);
    }
    expect(cookieLine(res, "itp_owner")).toMatch(/HttpOnly/);
  });

  it("open-redirect attempts on next → /ja", async () => {
    const attempts = [
      "https://evil.example/",
      "//evil.example/x",
      "///evil.example",
      "/\\evil.example",
      "\\\\evil.example",
      "/\t/evil.example",
      "/\n/evil.example",
      "/%0a/x\r\n",
      "http:evil.example",
      "javascript:alert(1)",
      "evil.example",
      "",
      "/api/owner?key=x",
      "/api/learning",
      "/api",
    ];
    for (const next of attempts) {
      const res = await activate(`?key=${KEY}&next=${encodeURIComponent(next)}`);
      expect(res.status, JSON.stringify(next)).toBe(307);
      expect(res.headers.get("location"), JSON.stringify(next)).toBe(`${ORIGIN}/ja`);
    }
    expect((await activate(`?key=${KEY}`)).headers.get("location")).toBe(`${ORIGIN}/ja`);
  });

  it("dot segments that normalise to //host (H3 attempt 1, HIGH-1) → /ja", async () => {
    const attempts = [
      // the 7 reported forms
      "/.//evil.com",
      "/..//evil.com",
      "/%2e//evil.com",
      "/.%2E//evil.com",
      "/%2e%2e//evil.com",
      "/a/..//evil.com",
      "/ja/..//evil.com/x",
      // variants: mixed case / encodings, repeats, long chains, query + hash, /api via dots
      "/././/evil.com",
      "/%2E%2e/%2e%2E//evil.com",
      "/ja/%2e%2e/%2e%2E//evil.com?a=1#h",
      "/.%2e//evil.com",
      "/a/b/c/../../..//evil.com",
      `/${"../".repeat(300)}/evil.com`,
      `/${"a/".repeat(200)}${"../".repeat(200)}/evil.com`,
      `/${"./".repeat(500)}/evil.com`,
      "/ja/../api/learning",
      "/%2e%2e/api",
      "/.\\/evil.com",
    ];
    for (const next of attempts) {
      const res = await activate(`?key=${KEY}&next=${encodeURIComponent(next)}`);
      const location = res.headers.get("location")!;
      expect(new URL(location).origin, JSON.stringify(next)).toBe(ORIGIN);
      expect(location, JSON.stringify(next)).toBe(`${ORIGIN}/ja`);
    }
  });

  it("encoded slashes / backslashes stay on the site (a path segment, never a host)", async () => {
    for (const next of ["/%2F%2Fevil.com", "/%2f/evil.com", "/%5c/evil.com", "/%5C%5Cevil.com", "/ja/%2F%2Fevil.com", "/ja/..%2f..//evil.com"]) {
      const location = (await activate(`?key=x&next=${encodeURIComponent(next)}`)).headers.get("location")!;
      const u = new URL(location);
      expect(u.origin, next).toBe(ORIGIN);
      expect(u.pathname.startsWith("//"), next).toBe(false);
    }
  });

  it("an encoded path stays on the site; a leftover owner_key in next is dropped", async () => {
    const enc = await activate(`?key=x&next=${encodeURIComponent("/%2F%2Fevil.example")}`);
    expect(new URL(enc.headers.get("location")!).origin).toBe(ORIGIN);
    const res = await activate(`?key=x&next=${encodeURIComponent("/ja/glossary?a=1&owner_key=K")}`);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/ja/glossary?a=1`);
    const keep = await activate(`?key=x&next=${encodeURIComponent("/ja/practice?ids=a%2Cb&topic=x+y")}`);
    expect(keep.headers.get("location")).toBe(`${ORIGIN}/ja/practice?ids=a%2Cb&topic=x+y`);
  });
});
