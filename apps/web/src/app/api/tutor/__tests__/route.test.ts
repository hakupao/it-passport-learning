// Phase 4 Module B Step B.4 — /api/tutor route handler tests.
//
// Same posture as the Phase 2 route tests (chat / quiz / hover): the route
// handler does request-body validation + provider dispatch + onFinish
// telemetry. The streamText call is mocked at integration boundary; these
// tests cover the boundary contract (body shape, error frames, GET docstring)
// rather than the streamed text itself (which is exercised in Module D
// Playwright e2e + cost-dryrun harness).

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET, POST } from "../route";
import { validateTutorRequestBody } from "@/lib/ai/tutorRequest";

const CHAPTER_FIXTURE = {
  nn: "00",
  chapterId: "ch00",
  title: "コンピュータの基礎",
  firstPage: 1,
  lastPage: 10,
  pageCount: 10,
};

const QUIZ_FIXTURE = {
  questionId: "page_042_entity_0",
  lastAnswered: "2026-05-20T01:23:45.678Z",
  correct: true,
};

const VALID_CONTEXT = {
  completedChapters: [CHAPTER_FIXTURE],
  inProgressChapters: [],
  pendingChapters: [{ ...CHAPTER_FIXTURE, nn: "01", chapterId: "ch01" }],
  recentQuiz: [QUIZ_FIXTURE],
};

const VALID_MESSAGES = [
  { id: "u1", role: "user", parts: [{ type: "text", text: "次に何を学べばいい？" }] },
];

describe("/api/tutor — validateTutorRequestBody", () => {
  it("rejects non-object body", () => {
    expect(validateTutorRequestBody(null)).toEqual({
      ok: false,
      error: expect.stringMatching(/must be a JSON object/),
    });
    expect(validateTutorRequestBody("string")).toEqual({
      ok: false,
      error: expect.stringMatching(/must be a JSON object/),
    });
  });

  it("rejects missing messages", () => {
    const r = validateTutorRequestBody({ tutorContext: VALID_CONTEXT });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/messages/);
  });

  it("rejects empty messages array", () => {
    const r = validateTutorRequestBody({
      tutorContext: VALID_CONTEXT,
      messages: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/non-empty/);
  });

  it("rejects missing tutorContext", () => {
    const r = validateTutorRequestBody({ messages: VALID_MESSAGES });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/tutorContext/);
  });

  it("rejects malformed completedChapters", () => {
    const r = validateTutorRequestBody({
      tutorContext: { ...VALID_CONTEXT, completedChapters: "oops" },
      messages: VALID_MESSAGES,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/completedChapters/);
  });

  it("rejects chapter item missing nn/title", () => {
    const r = validateTutorRequestBody({
      tutorContext: {
        ...VALID_CONTEXT,
        pendingChapters: [{ chapterId: "ch02" }],
      },
      messages: VALID_MESSAGES,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/pendingChapters/);
  });

  it("rejects malformed recentQuiz entries", () => {
    const r = validateTutorRequestBody({
      tutorContext: {
        ...VALID_CONTEXT,
        recentQuiz: [{ questionId: "x", lastAnswered: "y" /* correct missing */ }],
      },
      messages: VALID_MESSAGES,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/recentQuiz/);
  });

  it("accepts valid body and normalizes escalate=false default", () => {
    const r = validateTutorRequestBody({
      tutorContext: VALID_CONTEXT,
      messages: VALID_MESSAGES,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.escalate).toBe(false);
      expect(r.body.tutorContext).toEqual(VALID_CONTEXT);
      expect(r.body.messages).toEqual(VALID_MESSAGES);
    }
  });

  it("accepts explicit escalate=true", () => {
    const r = validateTutorRequestBody({
      tutorContext: VALID_CONTEXT,
      messages: VALID_MESSAGES,
      escalate: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body.escalate).toBe(true);
  });

  it("treats non-boolean escalate as false", () => {
    const r = validateTutorRequestBody({
      tutorContext: VALID_CONTEXT,
      messages: VALID_MESSAGES,
      escalate: "yes",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body.escalate).toBe(false);
  });

  it("accepts empty chapter buckets + empty recentQuiz (cold-start)", () => {
    const r = validateTutorRequestBody({
      tutorContext: {
        completedChapters: [],
        inProgressChapters: [],
        pendingChapters: [],
        recentQuiz: [],
      },
      messages: VALID_MESSAGES,
    });
    expect(r.ok).toBe(true);
  });
});

describe("/api/tutor — GET docstring", () => {
  const originalTutor = process.env.LLM_PROVIDER_TUTOR;
  afterEach(() => {
    if (originalTutor === undefined) {
      delete process.env.LLM_PROVIDER_TUTOR;
    } else {
      process.env.LLM_PROVIDER_TUTOR = originalTutor;
    }
  });

  it("default returns DeepSeek V4 pro active-model line", async () => {
    delete process.env.LLM_PROVIDER_TUTOR;
    const res = await GET();
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).toMatch(/Active tutor provider .*: deepseek/);
    expect(text).toMatch(/deepseek-v4-pro/);
    expect(text).toMatch(/DEEPSEEK_API_KEY/);
    expect(res.headers.get("X-LLM-Provider")).toBe("deepseek");
    expect(res.headers.get("X-LLM-Role")).toBe("tutor");
  });

  it("anthropic toggle returns Sonnet 4.6 active-model line", async () => {
    process.env.LLM_PROVIDER_TUTOR = "anthropic";
    const res = await GET();
    const text = await res.text();
    expect(text).toMatch(/Active tutor provider .*: anthropic/);
    expect(text).toMatch(/claude-sonnet-4-6/);
    expect(text).toMatch(/ANTHROPIC_API_KEY/);
  });

  it("openai stub returns reserved-Phase-5 active-model line", async () => {
    process.env.LLM_PROVIDER_TUTOR = "openai";
    const res = await GET();
    const text = await res.text();
    expect(text).toMatch(/Active tutor provider .*: openai/);
    expect(text).toMatch(/reserved Phase 5|reserved-stub/);
  });
});

describe("/api/tutor — POST 400 paths (validation rejection)", () => {
  it("rejects malformed JSON body", async () => {
    const req = new Request("http://localhost/api/tutor", {
      method: "POST",
      body: "{not json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid JSON/);
  });

  it("rejects missing messages", async () => {
    const req = new Request("http://localhost/api/tutor", {
      method: "POST",
      body: JSON.stringify({ tutorContext: VALID_CONTEXT }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/messages/);
  });

  it("rejects missing tutorContext", async () => {
    const req = new Request("http://localhost/api/tutor", {
      method: "POST",
      body: JSON.stringify({ messages: VALID_MESSAGES }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/tutorContext/);
  });
});

describe("/api/tutor — OpenAI reserved-stub throws on POST", () => {
  const originalTutor = process.env.LLM_PROVIDER_TUTOR;
  beforeEach(() => {
    process.env.LLM_PROVIDER_TUTOR = "openai";
  });
  afterEach(() => {
    if (originalTutor === undefined) {
      delete process.env.LLM_PROVIDER_TUTOR;
    } else {
      process.env.LLM_PROVIDER_TUTOR = originalTutor;
    }
  });

  it("LLM_PROVIDER_TUTOR=openai throws Phase-5-reserved when handler reaches getTutorModel", async () => {
    const req = new Request("http://localhost/api/tutor", {
      method: "POST",
      body: JSON.stringify({
        tutorContext: VALID_CONTEXT,
        messages: VALID_MESSAGES,
      }),
      headers: { "Content-Type": "application/json" },
    });
    await expect(POST(req)).rejects.toThrow(/reserved for Phase 5/i);
  });
});
