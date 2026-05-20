// Unit tests for /api/glossary/hover helper: request body validator + constants.
//
// Session 39 Step 7 Batch B coverage:
//   - validateHoverRequestBody: shape / type / edge cases (9 cases)
//   - HOVER_SYSTEM_INSTRUCTION + HOVER_USER_PROMPT: presence + content guards
//     so we notice if the prompt template is silently mangled later (2 cases)

import { describe, expect, it } from "vitest";

import {
  HOVER_SYSTEM_INSTRUCTION,
  HOVER_USER_PROMPT,
  SURFACE_JP_MAX_LENGTH,
  validateHoverRequestBody,
} from "../hover";

describe("validateHoverRequestBody", () => {
  it("accepts a valid surface_jp payload", () => {
    const r = validateHoverRequestBody({ surface_jp: "プロセッサ" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.body.surface_jp).toBe("プロセッサ");
    }
  });

  it("rejects null / undefined body", () => {
    expect(validateHoverRequestBody(null).ok).toBe(false);
    expect(validateHoverRequestBody(undefined).ok).toBe(false);
  });

  it("rejects non-object body (string / number / array)", () => {
    expect(validateHoverRequestBody("hi").ok).toBe(false);
    expect(validateHoverRequestBody(42).ok).toBe(false);
    expect(validateHoverRequestBody([]).ok).toBe(false);
  });

  it("rejects non-string surface_jp", () => {
    for (const surface_jp of [123, null, undefined, {}, []]) {
      const r = validateHoverRequestBody({ surface_jp });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain("surface_jp");
    }
  });

  it("rejects missing surface_jp", () => {
    const r = validateHoverRequestBody({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("surface_jp");
  });

  it("rejects empty surface_jp (length === 0)", () => {
    const r = validateHoverRequestBody({ surface_jp: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("non-empty");
  });

  it("rejects surface_jp longer than SURFACE_JP_MAX_LENGTH", () => {
    const big = "ア".repeat(SURFACE_JP_MAX_LENGTH + 1);
    const r = validateHoverRequestBody({ surface_jp: big });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(String(SURFACE_JP_MAX_LENGTH));
  });

  it("accepts surface_jp at the exact maximum length", () => {
    const exact = "ア".repeat(SURFACE_JP_MAX_LENGTH);
    const r = validateHoverRequestBody({ surface_jp: exact });
    expect(r.ok).toBe(true);
  });

  it("strips extra fields — validated body carries only surface_jp", () => {
    const r = validateHoverRequestBody({
      surface_jp: "ストラテジ",
      extra_field: "should be ignored",
      another: 42,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(Object.keys(r.body)).toEqual(["surface_jp"]);
    }
  });
});

describe("hover prompt constants", () => {
  it("HOVER_SYSTEM_INSTRUCTION contains required structure markers", () => {
    // Defends against accidental empty/half-edited prompts. Three numbered
    // section markers + the corpus-grounding clause + the trilingual targets
    // are load-bearing for reply quality and tooltip size.
    expect(HOVER_SYSTEM_INSTRUCTION).toContain("1.");
    expect(HOVER_SYSTEM_INSTRUCTION).toContain("2.");
    expect(HOVER_SYSTEM_INSTRUCTION).toContain("3.");
    expect(HOVER_SYSTEM_INSTRUCTION).toMatch(
      /corpus|grounded|source of truth/i,
    );
    expect(HOVER_SYSTEM_INSTRUCTION).toMatch(/ITパスポート|IT Passport/);
    // Tooltip size discipline marker.
    expect(HOVER_SYSTEM_INSTRUCTION).toMatch(/tooltip|popover|concise/i);
  });

  it("HOVER_USER_PROMPT is non-empty and mentions popover + trilingual intent", () => {
    expect(HOVER_USER_PROMPT.length).toBeGreaterThan(0);
    expect(HOVER_USER_PROMPT).toMatch(/popover|hover|tooltip/i);
    expect(HOVER_USER_PROMPT).toMatch(/trilingual|concise/i);
  });
});
