// Phase 2 Step 11 — glossaryScope.ts unit tests.

import { describe, expect, it } from "vitest";

import {
  ALIAS_PREVIEW_MAX,
  buildGlossarySummary,
  findSummaryBySurface,
  isKnownSurface,
  listGlossarySummaries,
  parseTermParam,
} from "../glossaryScope";
import type {
  Glossary,
  GlossaryEntry,
  IndexV2,
  Trilingual,
} from "@/lib/data/types";

function tri(jp: string, zh = jp, en = jp): Trilingual {
  return { jp, zh, en };
}

function entry(
  id: string,
  jp: string,
  overrides: Partial<GlossaryEntry> = {},
): GlossaryEntry {
  return {
    id,
    surface: tri(jp),
    kana_helper: null,
    first_page: 75,
    occurrences: [75],
    aliases_jp: [],
    ...overrides,
  };
}

function glossary(entries: GlossaryEntry[]): Glossary {
  return {
    schema_version: "v1",
    cert_id: "itpassport_r6",
    run_id: "test_run",
    generated_at: "2026-05-20T00:00:00.000Z",
    entries,
  };
}

function makeIndex(map: Record<string, string>): IndexV2 {
  return {
    schema_version: "v2",
    cert_id: "itpassport_r6",
    run_id: "test_run",
    exported_at: "2026-05-20T00:00:00.000Z",
    totals: { pages: 0, entities: 0, leaves: 0 },
    stage6_summary: {
      verdict: "PASS",
      pass_pages: 0,
      warn_pages: 0,
      fail_pages: 0,
      polish_items_count: 0,
    },
    pages: [],
    chapters: [],
    glossary_index: {
      surface_jp_to_id: map,
      id_to_surface: Object.fromEntries(
        Object.entries(map).map(([k, v]) => [v, k]),
      ),
    },
    entity_by_id: {},
    v2_built_at: "2026-05-20T00:00:00.000Z",
    v2_source_index: "index.json",
  };
}

describe("buildGlossarySummary", () => {
  it("projects an entry into a summary", () => {
    const e = entry("g_001", "プロセッサ", {
      surface: tri("プロセッサ", "处理器", "processor"),
      kana_helper: {
        surface: "プロセッサ",
        reading: "purosessa",
        zh_concept: "处理器",
        auto_backfill: false,
      },
      first_page: 120,
      occurrences: [120, 150, 200],
      aliases_jp: ["CPU", "中央処理装置"],
    });
    const s = buildGlossarySummary(e);
    expect(s.id).toBe("g_001");
    expect(s.surfaceJp).toBe("プロセッサ");
    expect(s.surfaceZh).toBe("处理器");
    expect(s.surfaceEn).toBe("processor");
    expect(s.kanaReading).toBe("purosessa");
    expect(s.firstPage).toBe(120);
    expect(s.occurrenceCount).toBe(3);
    expect(s.aliasesPreview).toEqual(["CPU", "中央処理装置"]);
    expect(s.aliasesTruncated).toBe(false);
  });

  it("truncates aliases beyond ALIAS_PREVIEW_MAX and flags it", () => {
    const aliases = ["a1", "a2", "a3", "a4", "a5"];
    const e = entry("g_001", "x", { aliases_jp: aliases });
    const s = buildGlossarySummary(e);
    expect(s.aliasesPreview).toHaveLength(ALIAS_PREVIEW_MAX);
    expect(s.aliasesTruncated).toBe(true);
  });

  it("returns null kanaReading when kana_helper is missing", () => {
    const e = entry("g_001", "x", { kana_helper: null });
    expect(buildGlossarySummary(e).kanaReading).toBeNull();
  });

  it("defaults to empty strings for partially-populated surface", () => {
    const e: GlossaryEntry = {
      id: "g_x",
      surface: { jp: "", zh: "", en: "" },
      kana_helper: null,
      first_page: 0,
      occurrences: [],
      aliases_jp: [],
    };
    const s = buildGlossarySummary(e);
    expect(s.surfaceJp).toBe("");
    expect(s.occurrenceCount).toBe(0);
    expect(s.firstPage).toBe(0);
  });

  it("survives NaN/Infinity first_page values", () => {
    const e = entry("g_001", "x");
    (e as unknown as { first_page: number }).first_page = Number.NaN;
    expect(buildGlossarySummary(e).firstPage).toBe(0);
  });
});

describe("listGlossarySummaries", () => {
  it("orders entries by Japanese 50音 collation", () => {
    const g = glossary([
      entry("g_3", "ナノ秒"),
      entry("g_1", "アルゴリズム"),
      entry("g_2", "データベース"),
    ]);
    const result = listGlossarySummaries(g).map((s) => s.surfaceJp);
    // ア < ダ/デ < ナ in 50音 order (ICU Intl.Collator('ja'))
    expect(result).toEqual(["アルゴリズム", "データベース", "ナノ秒"]);
  });

  it("drops entries with empty surface_jp", () => {
    const g = glossary([
      entry("g_1", "ア"),
      { ...entry("g_2", ""), surface: { jp: "", zh: "x", en: "x" } },
      entry("g_3", "イ"),
    ]);
    const result = listGlossarySummaries(g).map((s) => s.id);
    expect(result).toEqual(["g_1", "g_3"]);
  });

  it("falls back to stable id order when surfaces tie", () => {
    const g = glossary([
      entry("g_2", "アイ"),
      entry("g_1", "アイ"),
    ]);
    const result = listGlossarySummaries(g).map((s) => s.id);
    expect(result).toEqual(["g_1", "g_2"]);
  });

  it("handles empty glossary cleanly", () => {
    const g = glossary([]);
    expect(listGlossarySummaries(g)).toEqual([]);
  });
});

describe("parseTermParam", () => {
  it("returns null for null / empty / whitespace input", () => {
    expect(parseTermParam(null)).toBeNull();
    expect(parseTermParam("")).toBeNull();
    expect(parseTermParam("   ")).toBeNull();
  });

  it("returns the trimmed string for plain ASCII input", () => {
    expect(parseTermParam("CPU")).toBe("CPU");
  });

  it("decodes percent-encoded non-ASCII (アルゴリズム)", () => {
    const encoded = encodeURIComponent("アルゴリズム");
    expect(parseTermParam(encoded)).toBe("アルゴリズム");
  });

  it("returns the raw string on malformed percent-encoding without throwing", () => {
    expect(parseTermParam("%E3%82%A2%XX")).toBe("%E3%82%A2%XX");
  });

  it("is idempotent on already-decoded UTF-8 (Next.js useSearchParams output)", () => {
    expect(parseTermParam("アルゴリズム")).toBe("アルゴリズム");
  });
});

describe("isKnownSurface", () => {
  it("returns true for a registered surface", () => {
    const idx = makeIndex({ アルゴリズム: "g_001" });
    expect(isKnownSurface(idx, "アルゴリズム")).toBe(true);
  });

  it("returns false for an unknown surface", () => {
    const idx = makeIndex({});
    expect(isKnownSurface(idx, "アルゴリズム")).toBe(false);
  });

  it("returns false for empty input", () => {
    const idx = makeIndex({ x: "g_001" });
    expect(isKnownSurface(idx, "")).toBe(false);
  });
});

describe("findSummaryBySurface", () => {
  it("returns the matching summary", () => {
    const summaries = listGlossarySummaries(
      glossary([entry("g_1", "アイ"), entry("g_2", "ウエ")]),
    );
    expect(findSummaryBySurface(summaries, "アイ")?.id).toBe("g_1");
  });

  it("returns null on miss", () => {
    const summaries = listGlossarySummaries(glossary([entry("g_1", "アイ")]));
    expect(findSummaryBySurface(summaries, "missing")).toBeNull();
  });

  it("returns null for empty surface input", () => {
    const summaries = listGlossarySummaries(glossary([entry("g_1", "アイ")]));
    expect(findSummaryBySurface(summaries, "")).toBeNull();
  });
});
