// Unit tests for /api/quiz/explain helper: request body validator + constants.
//
// Session 38 Step 6 Batch B coverage:
//   - validateQuizExplainRequestBody: shape / type / edge cases (9 cases)
//   - QUIZ_SYSTEM_INSTRUCTION + QUIZ_EXPLAIN_USER_PROMPT: presence + content
//     guards so we notice if the prompt template is silently mangled later (2 cases)

import { describe, expect, it } from "vitest";

import {
  QUESTION_ID_MAX_LENGTH,
  QUIZ_EXPLAIN_USER_PROMPT,
  QUIZ_SYSTEM_INSTRUCTION,
  getQuizSystemInstruction,
  validateQuizExplainRequestBody,
} from "../quiz";

describe("validateQuizExplainRequestBody", () => {
  it("accepts a valid question_id payload", () => {
    const r = validateQuizExplainRequestBody({
      question_id: "page_042_entity_0",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.question_id).toBe("page_042_entity_0");
    }
  });

  it("rejects null / undefined body", () => {
    expect(validateQuizExplainRequestBody(null).ok).toBe(false);
    expect(validateQuizExplainRequestBody(undefined).ok).toBe(false);
  });

  it("rejects non-object body (string / number / array)", () => {
    expect(validateQuizExplainRequestBody("hi").ok).toBe(false);
    expect(validateQuizExplainRequestBody(42).ok).toBe(false);
    expect(validateQuizExplainRequestBody([]).ok).toBe(false);
  });

  it("rejects non-string question_id", () => {
    for (const question_id of [123, null, undefined, {}, []]) {
      const r = validateQuizExplainRequestBody({ question_id });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain("question_id");
    }
  });

  it("rejects missing question_id", () => {
    const r = validateQuizExplainRequestBody({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("question_id");
  });

  it("rejects empty question_id (length === 0)", () => {
    const r = validateQuizExplainRequestBody({ question_id: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("non-empty");
  });

  it("rejects question_id longer than QUESTION_ID_MAX_LENGTH", () => {
    const big = "x".repeat(QUESTION_ID_MAX_LENGTH + 1);
    const r = validateQuizExplainRequestBody({ question_id: big });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(String(QUESTION_ID_MAX_LENGTH));
  });

  it("accepts question_id at the exact maximum length", () => {
    const exact = "y".repeat(QUESTION_ID_MAX_LENGTH);
    const r = validateQuizExplainRequestBody({ question_id: exact });
    expect(r.ok).toBe(true);
  });

  it("strips extra fields — validated body carries only question_id and locale", () => {
    const r = validateQuizExplainRequestBody({
      question_id: "page_100_entity_0",
      extra_field: "should be ignored",
      another: 42,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(Object.keys(r.body)).toEqual(["question_id", "locale"]);
    }
  });

  it("passes locale through when provided", () => {
    const r = validateQuizExplainRequestBody({
      question_id: "page_042_entity_0",
      locale: "zh",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.locale).toBe("zh");
    }
  });
});

describe("quiz prompt constants", () => {
  it("QUIZ_SYSTEM_INSTRUCTION contains required structure markers", () => {
    // Defends against accidental empty/half-edited prompts. Three numbered
    // section markers + the corpus-grounding clause are load-bearing for
    // reply quality.
    expect(QUIZ_SYSTEM_INSTRUCTION).toContain("1.");
    expect(QUIZ_SYSTEM_INSTRUCTION).toContain("2.");
    expect(QUIZ_SYSTEM_INSTRUCTION).toContain("3.");
    expect(QUIZ_SYSTEM_INSTRUCTION).toMatch(
      /corpus|grounded|source of truth/i,
    );
    expect(QUIZ_SYSTEM_INSTRUCTION).toMatch(/ITパスポート|IT Passport/);
  });

  it("QUIZ_EXPLAIN_USER_PROMPT is non-empty and mentions choices + justification", () => {
    expect(QUIZ_EXPLAIN_USER_PROMPT.length).toBeGreaterThan(0);
    expect(QUIZ_EXPLAIN_USER_PROMPT).toMatch(/choice/i);
    expect(QUIZ_EXPLAIN_USER_PROMPT).toMatch(/justif|correct/i);
  });

  it("getQuizSystemInstruction returns locale-appropriate language instruction", () => {
    expect(getQuizSystemInstruction("ja")).toContain("Reply in Japanese");
    expect(getQuizSystemInstruction("zh")).toContain("Reply in Chinese");
    expect(getQuizSystemInstruction("en")).toContain("Reply in English");
    expect(getQuizSystemInstruction()).toContain("Reply in Japanese");
    expect(getQuizSystemInstruction("xx")).toContain("Reply in Japanese");
  });
});
