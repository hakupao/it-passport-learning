// Stage 4 step3 — proves the schema validator cannot report a false "OK".
//
// Rule-D review flagged that summary checks must catch empty arrays AND blank
// elements (not just length parity). These tests target the pure validateContent()
// with inline fixtures (no disk / no gitignored data → CI-safe) and assert that
// each corruption pattern produces an error.

import { describe, expect, it } from "vitest";

import type { TextbookUnit } from "../types";
import { validateContent } from "../validate";

/** A minimal unit that passes every content check. */
function validUnit(): TextbookUnit {
  return structuredClone({
    schema_version: "stage4-unit-v1-trilingual",
    unit_id: "test-00-00-u01",
    topic_id: "test-00-00",
    category: "test",
    title_jp: "題",
    title_zh: "标题",
    title_en: "Title",
    unit_summary_jp: "概要",
    unit_summary_zh: "概要",
    unit_summary_en: "Summary",
    order_in_topic: 1,
    prerequisites: [],
    overview: {
      intro_jp: "導入",
      intro_zh: "导入",
      intro_en: "Intro",
      freq_badge: "標準",
      est_minutes: 15,
    },
    terms: [
      {
        term: "用語",
        term_zh: "术语",
        term_en: "Term",
        definition_jp: "定義",
        definition_zh: "定义",
        definition_en: "Definition",
        explanation_jp: "解説",
        explanation_zh: "解说",
        explanation_en: "Explanation",
        analogy_jp: "例え",
        analogy_zh: "类比",
        analogy_en: "Analogy",
        memory_hook_jp: "フック",
        memory_hook_zh: "钩子",
        memory_hook_en: "Hook",
        inline_quiz: [],
        inline_fallback: false,
        figure: null,
      },
    ],
    summary: {
      memory_hooks_jp: ["h"],
      memory_hooks_zh: ["h"],
      memory_hooks_en: ["h"],
      key_points_jp: ["k"],
      key_points_zh: ["k"],
      key_points_en: ["k"],
    },
    challenge_questions: [],
    source_figures: [],
    lang_status: { jp: "generated", zh: "generated", en: "generated" },
  });
}

const hasError = (u: TextbookUnit, fieldPart: string): boolean =>
  validateContent(u).issues.some(
    (i) => i.severity === "error" && i.field.includes(fieldPart),
  );

describe("validateContent — clean unit", () => {
  it("passes with no errors and contentComplete", () => {
    const r = validateContent(validUnit());
    expect(r.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    expect(r.contentComplete).toBe(true);
  });
});

describe("validateContent — must NOT report false OK", () => {
  it("flags summary arrays that are empty in all languages (false-OK vector #1)", () => {
    const u = validUnit();
    u.summary.key_points_jp = [];
    u.summary.key_points_zh = [];
    u.summary.key_points_en = [];
    expect(hasError(u, "summary.key_points")).toBe(true);
    expect(validateContent(u).contentComplete).toBe(false);
  });

  it("flags blank string elements inside summary arrays (false-OK vector #2)", () => {
    const u = validUnit();
    u.summary.memory_hooks_jp = ["  "];
    u.summary.memory_hooks_zh = ["  "];
    u.summary.memory_hooks_en = ["  "];
    expect(hasError(u, "summary.memory_hooks")).toBe(true);
    expect(validateContent(u).contentComplete).toBe(false);
  });

  it("flags summary length mismatch across languages", () => {
    const u = validUnit();
    u.summary.key_points_en = ["k", "extra"];
    expect(hasError(u, "summary.key_points")).toBe(true);
  });

  it("flags a missing trilingual term translation", () => {
    const u = validUnit();
    u.terms[0]!.term_zh = "";
    expect(hasError(u, "term_zh")).toBe(true);
    expect(validateContent(u).contentComplete).toBe(false);
  });

  it("flags a blank trilingual prose field", () => {
    const u = validUnit();
    u.terms[0]!.explanation_en = "   ";
    expect(hasError(u, "explanation_en")).toBe(true);
    expect(validateContent(u).contentComplete).toBe(false);
  });

  it("flags an empty terms array", () => {
    const u = validUnit();
    u.terms = [];
    expect(hasError(u, "terms")).toBe(true);
  });

  it("flags missing / invalid est_minutes", () => {
    const u = validUnit();
    (u.overview as { est_minutes?: number }).est_minutes = undefined;
    expect(hasError(u, "est_minutes")).toBe(true);
  });

  it("flags a non-generated lang_status", () => {
    const u = validUnit();
    u.lang_status.en = "pending";
    expect(hasError(u, "lang_status.en")).toBe(true);
  });
});
