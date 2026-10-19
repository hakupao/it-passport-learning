// D-149 — /api/quiz/feedback route contract: owner 403 → Redis 503 → 400 → 201,
// and GET listing per question. Redis is an in-memory fake via the loader mock.

import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { FeedbackRecord } from "@/lib/quiz/feedback";
import { makeFakeRedis } from "@/lib/quiz/__tests__/fakeFeedbackRedis";

const { redisHolder } = vi.hoisted(() => ({
  redisHolder: { current: null as ReturnType<typeof makeFakeRedis> | null },
}));

vi.mock("@/lib/quiz/feedback", async () => {
  const actual = await vi.importActual<typeof import("@/lib/quiz/feedback")>(
    "@/lib/quiz/feedback",
  );
  return { ...actual, loadFeedbackRedis: async () => redisHolder.current };
});

import { GET, POST } from "../route";

const OWNER_KEY = "test-owner-key";
const OWNER_COOKIE_HEADER = `itp_owner=${createHash("sha256").update(OWNER_KEY).digest("hex")}`;
const URL_BASE = "http://localhost/api/quiz/feedback";

function post(body: unknown, cookie: string | null = OWNER_COOKIE_HEADER): Request {
  return new Request(URL_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function get(qs: string, cookie: string | null = OWNER_COOKIE_HEADER): Request {
  return new Request(`${URL_BASE}${qs}`, { headers: cookie ? { cookie } : {} });
}

const VALID = {
  question_id: "2016h28h-q033",
  locale: "ja",
  category: "figure_incomplete",
  note: "  経路表が B 行で切れている  ",
};

beforeEach(() => {
  vi.stubEnv("OWNER_KEY", OWNER_KEY);
  redisHolder.current = makeFakeRedis();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/quiz/feedback", () => {
  it("201 with the stored record (trimmed note, open, null resolution)", async () => {
    const res = await POST(post(VALID));
    expect(res.status).toBe(201);
    const rec = (await res.json()) as FeedbackRecord;
    expect(rec).toMatchObject({
      question_id: "2016h28h-q033",
      locale: "ja",
      category: "figure_incomplete",
      note: "経路表が B 行で切れている",
      status: "open",
      resolved_at: null,
      resolution_note: null,
    });
    expect(rec.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(rec.created_at).toISOString()).toBe(rec.created_at);
    expect(redisHolder.current!.kv.get(`quiz:feedback:rec:${rec.id}`)).toEqual(rec);
  });

  it("403 for non-owner (no cookie / wrong cookie / OWNER_KEY unset) and writes nothing", async () => {
    expect((await POST(post(VALID, null))).status).toBe(403);
    expect((await POST(post(VALID, "itp_owner=nope"))).status).toBe(403);
    vi.stubEnv("OWNER_KEY", "");
    expect((await POST(post(VALID))).status).toBe(403);
    expect(redisHolder.current!.kv.size).toBe(0);
  });

  it("403 takes precedence over a malformed body", async () => {
    expect((await POST(post("not json", null))).status).toBe(403);
  });

  it("503 when Redis env is missing", async () => {
    redisHolder.current = null;
    const res = await POST(post(VALID));
    expect(res.status).toBe(503);
  });

  it("400 on invalid JSON / invalid fields", async () => {
    expect((await POST(post("not json"))).status).toBe(400);
    expect((await POST(post({ ...VALID, question_id: "bad" }))).status).toBe(400);
    expect((await POST(post({ ...VALID, locale: "ko" }))).status).toBe(400);
    expect((await POST(post({ ...VALID, category: "nope" }))).status).toBe(400);
    expect((await POST(post({ ...VALID, note: "x".repeat(1001) }))).status).toBe(400);
    const body = (await (await POST(post({ ...VALID, category: "nope" }))).json()) as { error: string };
    expect(body.error).toMatch(/category/);
  });
});

describe("Redis failure → 502", () => {
  it("POST and GET return 502 JSON when the store throws, and log a tagged error", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fake = redisHolder.current!;
    fake.multi = () => {
      throw new Error("ECONNRESET");
    };
    fake.zrange = async () => {
      throw new Error("ECONNRESET");
    };

    const p = await POST(post(VALID));
    expect(p.status).toBe(502);
    expect(await p.json()).toEqual({ error: "feedback store error" });
    const g = await GET(get("?question_id=2016h28h-q033"));
    expect(g.status).toBe(502);
    expect(await g.json()).toEqual({ error: "feedback store error" });

    expect(errSpy).toHaveBeenCalledTimes(2);
    expect(errSpy.mock.calls[0]![0]).toBe("[quiz-feedback-store-error]");
    errSpy.mockRestore();
  });
});

describe("GET /api/quiz/feedback", () => {
  it("returns that question's records newest first", async () => {
    await POST(post({ ...VALID, note: "first" }));
    await new Promise((r) => setTimeout(r, 5));
    await POST(post({ ...VALID, question_id: "2017h29a-q015" }));
    await new Promise((r) => setTimeout(r, 5));
    await POST(post({ ...VALID, category: "other", note: "second" }));

    const res = await GET(get("?question_id=2016h28h-q033"));
    expect(res.status).toBe(200);
    const { records } = (await res.json()) as { records: FeedbackRecord[] };
    expect(records.map((r) => r.note)).toEqual(["second", "first"]);
  });

  it("403 for non-owner, 400 for a bad id, 503 without Redis", async () => {
    expect((await GET(get("?question_id=2016h28h-q033", null))).status).toBe(403);
    expect((await GET(get("?question_id=../etc"))).status).toBe(400);
    expect((await GET(get(""))).status).toBe(400);
    redisHolder.current = null;
    expect((await GET(get("?question_id=2016h28h-q033"))).status).toBe(503);
  });
});
