// D-149 — quiz feedback store: validation + Redis key layout (in-memory fake).

import { describe, expect, it } from "vitest";

import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_INDEX_KEY,
  createFeedback,
  feedbackQuestionKey,
  feedbackRecordKey,
  listFeedbackForQuestion,
  validateFeedbackInput,
  type FeedbackRecord,
} from "../feedback";

import { makeFakeRedis } from "./fakeFeedbackRedis";

describe("validateFeedbackInput", () => {
  const base = {
    question_id: "2016h28h-q033",
    locale: "ja",
    category: "figure_incomplete",
  };

  it("accepts a minimal valid body; note defaults to empty string", () => {
    const r = validateFeedbackInput(base);
    expect(r).toEqual({ ok: true, value: { ...base, note: "" } });
  });

  it("accepts every real id shape (tokubetsu / o-suffixed / reiwa)", () => {
    for (const id of ["2011h23tokubetsu-q100", "2020r02o-q001", "2026r08-q099", "2009h21a-q001"]) {
      expect(validateFeedbackInput({ ...base, question_id: id }).ok).toBe(true);
    }
  });

  it("trims the note and accepts exactly 1000 chars", () => {
    const r = validateFeedbackInput({ ...base, note: `  ${"あ".repeat(1000)}  ` });
    expect(r.ok && r.value.note.length).toBe(1000);
  });

  it("accepts all 6 categories", () => {
    expect(FEEDBACK_CATEGORIES).toEqual([
      "figure_incomplete",
      "figure_wrong",
      "text_error",
      "translation_error",
      "answer_or_explanation",
      "other",
    ]);
    for (const category of FEEDBACK_CATEGORIES) {
      expect(validateFeedbackInput({ ...base, category }).ok).toBe(true);
    }
  });

  it.each([
    ["non-object", "nope"],
    ["null", null],
    ["bad id", { ...base, question_id: "page_042_entity_0" }],
    ["id with path chars", { ...base, question_id: "2016h28h-q033/../x" }],
    ["missing id", { locale: "ja", category: "other" }],
    ["bad locale", { ...base, locale: "fr" }],
    ["bad category", { ...base, category: "spam" }],
    ["note not a string", { ...base, note: 5 }],
    ["note too long", { ...base, note: "x".repeat(1001) }],
  ])("rejects %s", (_label, body) => {
    const r = validateFeedbackInput(body);
    expect(r.ok).toBe(false);
  });
});

describe("createFeedback + listFeedbackForQuestion", () => {
  const now = new Date("2026-10-19T08:00:00.000Z");

  it("stores the record + global index + per-question index", async () => {
    const redis = makeFakeRedis();
    const rec = await createFeedback(
      redis,
      { question_id: "2016h28h-q033", locale: "zh", category: "figure_incomplete", note: "B 行以下切断" },
      { now: () => now, newId: () => "fb-1" },
    );
    expect(rec).toEqual<FeedbackRecord>({
      id: "fb-1",
      question_id: "2016h28h-q033",
      locale: "zh",
      category: "figure_incomplete",
      note: "B 行以下切断",
      status: "open",
      created_at: "2026-10-19T08:00:00.000Z",
      resolved_at: null,
      resolution_note: null,
    });
    expect(redis.kv.get(feedbackRecordKey("fb-1"))).toEqual(rec);
    expect(redis.zsets.get(FEEDBACK_INDEX_KEY)?.get("fb-1")).toBe(now.getTime());
    expect(redis.zsets.get(feedbackQuestionKey("2016h28h-q033"))?.get("fb-1")).toBe(now.getTime());
    expect(feedbackRecordKey("fb-1")).toBe("quiz:feedback:rec:fb-1");
    expect(feedbackQuestionKey("2016h28h-q033")).toBe("quiz:feedback:q:2016h28h-q033");
    expect(FEEDBACK_INDEX_KEY).toBe("quiz:feedback:index");
  });

  it("lists only that question's records, newest first, skipping dangling ids", async () => {
    const redis = makeFakeRedis();
    let t = now.getTime();
    let n = 0;
    const deps = { now: () => new Date((t += 1000)), newId: () => `fb-${++n}` };
    const input = { question_id: "2017h29a-q015", locale: "ja" as const, category: "other" as const, note: "" };
    await createFeedback(redis, input, deps);
    await createFeedback(redis, { ...input, question_id: "2009h21a-q001" }, deps);
    await createFeedback(redis, { ...input, category: "text_error" }, deps);
    await redis.multi().zadd(feedbackQuestionKey("2017h29a-q015"), { score: 1, member: "ghost" }).exec();

    const list = await listFeedbackForQuestion(redis, "2017h29a-q015");
    expect(list.map((r) => r.id)).toEqual(["fb-3", "fb-1"]);
  });

  it("writes nothing when the transaction fails (all-or-nothing via MULTI/EXEC)", async () => {
    const redis = makeFakeRedis();
    const realMulti = redis.multi.bind(redis);
    redis.multi = () => {
      const tx = realMulti();
      tx.exec = async () => {
        throw new Error("EXECABORT");
      };
      return tx;
    };
    await expect(
      createFeedback(redis, { question_id: "2009h21a-q001", locale: "en", category: "other", note: "" }),
    ).rejects.toThrow("EXECABORT");
    expect(redis.kv.size).toBe(0);
    expect(redis.zsets.size).toBe(0);
  });

  it("empty list for a question with no reports", async () => {
    expect(await listFeedbackForQuestion(makeFakeRedis(), "2009h21a-q001")).toEqual([]);
  });
});
