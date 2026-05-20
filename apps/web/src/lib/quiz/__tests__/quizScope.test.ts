// Phase 2 Step 10 — quizScope.ts unit tests.

import { describe, expect, it } from "vitest";

import {
  buildQuizSummary,
  CHOICE_LETTERS_EN,
  CHOICE_LETTERS_JP,
  isKnownQuestionId,
  listQuestionIds,
  parseQuestionId,
  STEM_PREVIEW_MAX_CHARS,
} from "../quizScope";
import type {
  Entity,
  EntityByIdRef,
  IndexV2,
  Page,
  Trilingual,
} from "@/lib/data/types";

function tri(jp: string, zh = jp, en = jp): Trilingual {
  return { jp, zh, en };
}

function makeQuestionEntity(
  page: number,
  index: number,
  overrides: Partial<Entity> = {},
): Entity {
  return {
    id: `itpassport_r6::question::p${String(page).padStart(3, "0")}::${index}`,
    anchor: { page, block_id: `b${index}`, section_path: [] },
    type: "question",
    stem: tri("テスト用の問題文"),
    choices: [
      tri("ア．選択肢1"),
      tri("イ．選択肢2"),
      tri("ウ．選択肢3"),
      tri("エ．選択肢4"),
    ] as unknown as Entity["choices"],
    answer_index: 0,
    ...overrides,
  };
}

function makePage(pageNum: number, entities: Entity[]): Page {
  return {
    schema_version: "v1",
    cert_id: "itpassport_r6",
    run_id: "test_run",
    stage: 7,
    page: pageNum,
    exported_at: "2026-05-20T00:00:00.000Z",
    stage6_verdict: "PASS",
    leaf_count: entities.length,
    entities,
    polish_items_ref: null,
  };
}

function makeIndex(refs: Array<[string, EntityByIdRef]>): IndexV2 {
  return {
    schema_version: "v2",
    cert_id: "itpassport_r6",
    run_id: "test_run",
    exported_at: "2026-05-20T00:00:00.000Z",
    totals: { pages: 0, entities: refs.length, leaves: 0 },
    stage6_summary: {
      verdict: "PASS",
      pass_pages: 0,
      warn_pages: 0,
      fail_pages: 0,
      polish_items_count: 0,
    },
    pages: [],
    chapters: [],
    glossary_index: { surface_jp_to_id: {}, id_to_surface: {} },
    entity_by_id: Object.fromEntries(refs),
    v2_built_at: "2026-05-20T00:00:00.000Z",
    v2_source_index: "index.json",
  };
}

describe("CHOICE_LETTERS_JP / CHOICE_LETTERS_EN", () => {
  it("has exactly 4 katakana + 4 latin letters in order", () => {
    expect(CHOICE_LETTERS_JP).toEqual(["ア", "イ", "ウ", "エ"]);
    expect(CHOICE_LETTERS_EN).toEqual(["A", "B", "C", "D"]);
  });
});

describe("buildQuizSummary", () => {
  it("returns a summary for a valid question entity", () => {
    const entity = makeQuestionEntity(42, 0);
    const page = makePage(42, [entity]);
    const summary = buildQuizSummary("page_042_entity_0", page, 0);
    expect(summary).not.toBeNull();
    expect(summary?.questionId).toBe("page_042_entity_0");
    expect(summary?.page).toBe(42);
    expect(summary?.entityIndex).toBe(0);
    expect(summary?.entityId).toBe("itpassport_r6::question::p042::0");
    expect(summary?.stem.jp).toBe("テスト用の問題文");
    expect(summary?.choices).toHaveLength(4);
    expect(summary?.choices[0]?.letterJp).toBe("ア");
    expect(summary?.choices[0]?.letterEn).toBe("A");
    expect(summary?.answerLetterJp).toBe("ア");
    expect(summary?.answerLetterEn).toBe("A");
  });

  it("truncates stems longer than STEM_PREVIEW_MAX_CHARS and flags it", () => {
    const longStem = "あ".repeat(STEM_PREVIEW_MAX_CHARS + 50);
    const entity = makeQuestionEntity(42, 0, { stem: tri(longStem) });
    const page = makePage(42, [entity]);
    const summary = buildQuizSummary("page_042_entity_0", page, 0);
    expect(summary?.stemTruncated).toBe(true);
    expect(summary?.stemJp.length).toBe(STEM_PREVIEW_MAX_CHARS);
    expect(summary?.stemJp.endsWith("…")).toBe(true);
  });

  it("does NOT truncate short stems", () => {
    const entity = makeQuestionEntity(42, 0, { stem: tri("短い") });
    const page = makePage(42, [entity]);
    const summary = buildQuizSummary("page_042_entity_0", page, 0);
    expect(summary?.stemTruncated).toBe(false);
    expect(summary?.stemJp).toBe("短い");
  });

  it("returns null for out-of-range entity index", () => {
    const entity = makeQuestionEntity(42, 0);
    const page = makePage(42, [entity]);
    expect(buildQuizSummary("page_042_entity_99", page, 99)).toBeNull();
    expect(buildQuizSummary("page_042_entity_neg", page, -1)).toBeNull();
  });

  it("returns null for non-question entities", () => {
    const sectionEntity: Entity = {
      id: "itpassport_r6::section::p042::0",
      anchor: { page: 42, block_id: "b0", section_path: [] },
      type: "section",
    };
    const page = makePage(42, [sectionEntity]);
    expect(buildQuizSummary("page_042_entity_0", page, 0)).toBeNull();
  });

  it("returns null answer letters for out-of-range answer_index", () => {
    const entity = makeQuestionEntity(42, 0, { answer_index: 7 });
    const page = makePage(42, [entity]);
    const summary = buildQuizSummary("page_042_entity_0", page, 0);
    expect(summary?.answerLetterJp).toBeNull();
    expect(summary?.answerLetterEn).toBeNull();
  });

  it("returns null answer letters when answer_index is missing", () => {
    const entity = makeQuestionEntity(42, 0);
    delete (entity as Record<string, unknown>).answer_index;
    const page = makePage(42, [entity]);
    const summary = buildQuizSummary("page_042_entity_0", page, 0);
    expect(summary?.answerLetterJp).toBeNull();
    expect(summary?.answerLetterEn).toBeNull();
  });

  it("falls back to empty trilingual stem when stem is missing", () => {
    const entity = makeQuestionEntity(42, 0);
    delete (entity as Record<string, unknown>).stem;
    const page = makePage(42, [entity]);
    const summary = buildQuizSummary("page_042_entity_0", page, 0);
    expect(summary?.stem).toEqual({ jp: "", zh: "", en: "" });
    expect(summary?.stemJp).toBe("");
  });

  it("returns empty choices when entity has none", () => {
    const entity = makeQuestionEntity(42, 0);
    delete (entity as Record<string, unknown>).choices;
    const page = makePage(42, [entity]);
    const summary = buildQuizSummary("page_042_entity_0", page, 0);
    expect(summary?.choices).toEqual([]);
  });
});

describe("listQuestionIds", () => {
  it("orders by (page, entityIndex)", () => {
    const idx = makeIndex([
      [
        "page_044_entity_2",
        { page: 44, entity_index: 2, type: "question", id: "x" },
      ],
      [
        "page_042_entity_0",
        { page: 42, entity_index: 0, type: "question", id: "x" },
      ],
      [
        "page_042_entity_1",
        { page: 42, entity_index: 1, type: "question", id: "x" },
      ],
    ]);
    expect(listQuestionIds(idx)).toEqual([
      "page_042_entity_0",
      "page_042_entity_1",
      "page_044_entity_2",
    ]);
  });

  it("skips non-question entities", () => {
    const idx = makeIndex([
      [
        "page_042_entity_0",
        { page: 42, entity_index: 0, type: "section", id: "x" },
      ],
      [
        "page_042_entity_1",
        { page: 42, entity_index: 1, type: "question", id: "x" },
      ],
    ]);
    expect(listQuestionIds(idx)).toEqual(["page_042_entity_1"]);
  });

  it("returns empty array when no questions exist", () => {
    const idx = makeIndex([]);
    expect(listQuestionIds(idx)).toEqual([]);
  });
});

describe("parseQuestionId", () => {
  it("parses a well-formed question_id", () => {
    expect(parseQuestionId("page_042_entity_0")).toEqual({
      page: 42,
      entityIndex: 0,
    });
    expect(parseQuestionId("page_557_entity_12")).toEqual({
      page: 557,
      entityIndex: 12,
    });
  });

  it("returns null for malformed ids", () => {
    expect(parseQuestionId("page_42_entity")).toBeNull();
    expect(parseQuestionId("page__entity_0")).toBeNull();
    expect(parseQuestionId("page_42_glossary_0")).toBeNull();
    expect(parseQuestionId("")).toBeNull();
    expect(parseQuestionId("page_-1_entity_0")).toBeNull();
  });
});

describe("isKnownQuestionId", () => {
  it("returns true for a registered question id", () => {
    const idx = makeIndex([
      [
        "page_042_entity_0",
        { page: 42, entity_index: 0, type: "question", id: "x" },
      ],
    ]);
    expect(isKnownQuestionId(idx, "page_042_entity_0")).toBe(true);
  });

  it("returns false for an unknown key", () => {
    const idx = makeIndex([]);
    expect(isKnownQuestionId(idx, "page_042_entity_0")).toBe(false);
  });

  it("returns false when the registered entity is not a question", () => {
    const idx = makeIndex([
      [
        "page_042_entity_0",
        { page: 42, entity_index: 0, type: "section", id: "x" },
      ],
    ]);
    expect(isKnownQuestionId(idx, "page_042_entity_0")).toBe(false);
  });
});
