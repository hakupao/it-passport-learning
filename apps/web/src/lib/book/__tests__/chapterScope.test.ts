// Phase 3 Step 1 — chapterScope unit tests.

import { describe, expect, it } from "vitest";

import type { ChapterRef, Entity, IndexV2, Page } from "@/lib/data/types";
import {
  buildAllChapterSummaries,
  buildChapterQuestionSummaries,
  buildChapterSummary,
  chapterIdToNn,
  findChapterByPage,
  getChapterSiblings,
  parseChapterNn,
  pickTitle,
  projectRenderEntities,
} from "../chapterScope";

const C = (
  id: string,
  fp: number,
  lp: number,
  titles: Partial<Pick<ChapterRef, "title_jp" | "title_zh" | "title_en">> = {},
): ChapterRef => ({
  chapter_id: id,
  title_jp: titles.title_jp ?? `章${id}`,
  title_zh: titles.title_zh ?? "",
  title_en: titles.title_en ?? "",
  first_page: fp,
  last_page: lp,
});

const idx = (
  chapters: ChapterRef[],
  pages: number[] = [],
): IndexV2 => ({
  schema_version: "v2",
  cert_id: "itpassport_r6",
  run_id: "test-run",
  exported_at: "2026-05-22T00:00:00Z",
  totals: { pages: pages.length, entities: 0, leaves: 0 },
  stage6_summary: {
    verdict: "PASS",
    pass_pages: pages.length,
    warn_pages: 0,
    fail_pages: 0,
    polish_items_count: 0,
  },
  pages: pages.map((p) => ({
    page: p,
    json: `pages/page_${String(p).padStart(3, "0")}.json`,
    md: `pages/page_${String(p).padStart(3, "0")}.md`,
    entity_count: 0,
    leaf_count: 0,
    verdict: "PASS",
    polish_items_count: 0,
  })),
  chapters,
  glossary_index: { surface_jp_to_id: {}, id_to_surface: {} },
  entity_by_id: {},
  v2_built_at: "2026-05-22T00:00:00Z",
  v2_source_index: "index.json",
});

describe("pickTitle", () => {
  const ref = C("ch00", 7, 24, {
    title_jp: "本書の目的",
    title_zh: "本书目的",
    title_en: "Purpose",
  });

  it("returns jp for ja locale", () => {
    expect(pickTitle(ref, "ja")).toBe("本書の目的");
  });

  it("returns zh for zh locale", () => {
    expect(pickTitle(ref, "zh")).toBe("本书目的");
  });

  it("returns en for en locale", () => {
    expect(pickTitle(ref, "en")).toBe("Purpose");
  });

  it("falls back to jp when zh/en empty", () => {
    const empty = C("ch01", 28, 57, { title_jp: "原文" });
    expect(pickTitle(empty, "zh")).toBe("原文");
    expect(pickTitle(empty, "en")).toBe("原文");
  });
});

describe("parseChapterNn", () => {
  it("accepts 00 through 15", () => {
    expect(parseChapterNn("00")).toBe("ch00");
    expect(parseChapterNn("07")).toBe("ch07");
    expect(parseChapterNn("15")).toBe("ch15");
  });

  it("rejects out-of-range numbers", () => {
    expect(parseChapterNn("16")).toBeNull();
    expect(parseChapterNn("99")).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(parseChapterNn("1")).toBeNull();
    expect(parseChapterNn("001")).toBeNull();
    expect(parseChapterNn("ab")).toBeNull();
    expect(parseChapterNn("")).toBeNull();
  });
});

describe("chapterIdToNn", () => {
  it("strips ch prefix", () => {
    expect(chapterIdToNn("ch00")).toBe("00");
    expect(chapterIdToNn("ch15")).toBe("15");
  });

  it("throws on unexpected ids", () => {
    expect(() => chapterIdToNn("c00")).toThrow();
    expect(() => chapterIdToNn("ch1")).toThrow();
    expect(() => chapterIdToNn("chapter00")).toThrow();
  });
});

describe("buildChapterSummary", () => {
  it("counts pages within first/last range", () => {
    const ref = C("ch00", 7, 24);
    const index = idx([ref], [7, 8, 9, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
    // 7..24 inclusive → 12 entries in the page list (excludes 25).
    const s = buildChapterSummary(ref, "ja", index);
    expect(s.pageCount).toBe(13);
    expect(s.nn).toBe("00");
    expect(s.firstPage).toBe(7);
    expect(s.lastPage).toBe(24);
  });
});

describe("buildAllChapterSummaries", () => {
  it("preserves source order", () => {
    const chs = [C("ch00", 7, 24), C("ch01", 28, 57), C("ch02", 70, 99)];
    const index = idx(chs, [7, 8, 28, 29, 70, 71]);
    const all = buildAllChapterSummaries(index, "ja");
    expect(all.map((s) => s.nn)).toEqual(["00", "01", "02"]);
  });
});

describe("getChapterSiblings", () => {
  const chs = [C("ch00", 7, 24), C("ch01", 28, 57), C("ch02", 70, 99)];
  const index = idx(chs);

  it("returns next-only for first chapter", () => {
    expect(getChapterSiblings("00", index)).toEqual({
      prevNn: null,
      nextNn: "01",
    });
  });

  it("returns prev+next for middle", () => {
    expect(getChapterSiblings("01", index)).toEqual({
      prevNn: "00",
      nextNn: "02",
    });
  });

  it("returns prev-only for last", () => {
    expect(getChapterSiblings("02", index)).toEqual({
      prevNn: "01",
      nextNn: null,
    });
  });

  it("returns nulls when chapter not found", () => {
    expect(getChapterSiblings("99", index)).toEqual({
      prevNn: null,
      nextNn: null,
    });
  });
});

describe("findChapterByPage", () => {
  const chs = [C("ch00", 7, 24), C("ch01", 28, 57)];
  const index = idx(chs);

  it("returns chapter when page in range", () => {
    expect(findChapterByPage(15, index)?.chapter_id).toBe("ch00");
    expect(findChapterByPage(28, index)?.chapter_id).toBe("ch01");
  });

  it("returns null when page outside any range", () => {
    expect(findChapterByPage(25, index)).toBeNull();
    expect(findChapterByPage(100, index)).toBeNull();
  });
});

describe("projectRenderEntities", () => {
  const page: Page = {
    schema_version: "v1",
    cert_id: "itpassport_r6",
    run_id: "test",
    stage: 7,
    page: 28,
    exported_at: "2026-05-22T00:00:00Z",
    stage6_verdict: "PASS",
    leaf_count: 2,
    entities: [
      {
        id: "x::section::p028::0",
        anchor: { page: 28, block_id: "page_028_block_0", section_path: [] },
        type: "section",
        title: { jp: "株式会社", zh: "股份公司", en: "Stock Company" },
        section_number: "01-01",
      },
      {
        id: "x::figure::p028::1",
        anchor: { page: 28, block_id: "page_028_block_1", section_path: [] },
        type: "figure",
        caption: { jp: "経営者は船長だ！", zh: "经营者就是船长！", en: "" },
        image_ref: "img-0.jpeg",
      },
    ],
  };

  it("returns jp text for section title", () => {
    const out = projectRenderEntities(page);
    expect(out[0]).toEqual({
      type: "section",
      textJp: "株式会社",
      sectionNumber: "01-01",
      imageRef: null,
    });
  });

  it("falls through to caption when title missing", () => {
    const out = projectRenderEntities(page);
    expect(out[1]).toEqual({
      type: "figure",
      textJp: "経営者は船長だ！",
      sectionNumber: null,
      imageRef: "img-0.jpeg",
    });
  });

  it("handles entities with neither title nor caption", () => {
    const stripped: Page = {
      ...page,
      entities: [
        {
          id: "x::text::p028::2",
          anchor: { page: 28, block_id: "page_028_block_2", section_path: [] },
          type: "text",
        },
      ],
    };
    const out = projectRenderEntities(stripped);
    const first = out[0];
    expect(first).toBeDefined();
    if (!first) throw new Error("unreachable");
    expect(first.textJp).toBeNull();
    expect(first.type).toBe("text");
  });
});

describe("buildChapterQuestionSummaries", () => {
  const makeQuestion = (
    id: string,
    page: number,
    entityIndex: number,
    stem: string,
    answerIndex = 0,
  ): Entity => ({
    id,
    anchor: { page, block_id: `page_${page}_block_${entityIndex}`, section_path: [] },
    type: "question",
    stem: { jp: stem, zh: "", en: "" },
    choices: [
      { jp: "選択肢1", zh: "", en: "" },
      { jp: "選択肢2", zh: "", en: "" },
      { jp: "選択肢3", zh: "", en: "" },
      { jp: "選択肢4", zh: "", en: "" },
    ],
    answer_index: answerIndex,
  });

  const ref = C("ch01", 28, 57);
  const pages: Page[] = [
    {
      schema_version: "v1",
      cert_id: "x",
      run_id: "x",
      stage: 7,
      page: 28,
      exported_at: "2026-05-22T00:00:00Z",
      stage6_verdict: "PASS",
      leaf_count: 1,
      entities: [
        makeQuestion("p28_e0", 28, 0, "p28 question 0"),
        makeQuestion("p28_e1", 28, 1, "p28 question 1"),
      ],
    },
    {
      schema_version: "v1",
      cert_id: "x",
      run_id: "x",
      stage: 7,
      page: 35,
      exported_at: "2026-05-22T00:00:00Z",
      stage6_verdict: "PASS",
      leaf_count: 1,
      entities: [makeQuestion("p35_e0", 35, 0, "p35 question")],
    },
  ];

  const baseIndex = idx([ref], [28, 35]);
  const index: IndexV2 = {
    ...baseIndex,
    entity_by_id: {
      // Inside chapter range:
      page_028_entity_0: { page: 28, entity_index: 0, type: "question", id: "p28_e0" },
      page_028_entity_1: { page: 28, entity_index: 1, type: "question", id: "p28_e1" },
      page_035_entity_0: { page: 35, entity_index: 0, type: "question", id: "p35_e0" },
      // Outside chapter range — must be filtered out:
      page_070_entity_0: { page: 70, entity_index: 0, type: "question", id: "p70_e0" },
      // Same range, not a question — must be filtered out:
      page_028_entity_99: { page: 28, entity_index: 99, type: "section", id: "p28_sec" },
    },
  };

  it("collects only question entities within the chapter range, ordered by (page,index)", () => {
    const out = buildChapterQuestionSummaries(ref, index, pages);
    expect(out.map((s) => s.questionId)).toEqual([
      "page_028_entity_0",
      "page_028_entity_1",
      "page_035_entity_0",
    ]);
    expect(out[0]?.stemJp).toBe("p28 question 0");
  });

  it("silently skips ids whose page is not in the provided pages array", () => {
    const partial = pages.filter((p) => p.page === 28);
    const out = buildChapterQuestionSummaries(ref, index, partial);
    expect(out.map((s) => s.questionId)).toEqual([
      "page_028_entity_0",
      "page_028_entity_1",
    ]);
  });

  it("returns an empty list when no questions live in the chapter range", () => {
    const otherChapter = C("ch07", 200, 250);
    const out = buildChapterQuestionSummaries(otherChapter, index, pages);
    expect(out).toEqual([]);
  });
});
