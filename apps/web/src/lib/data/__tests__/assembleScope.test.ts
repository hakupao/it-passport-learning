import { describe, expect, it } from "vitest";

import {
  assembleTermHover,
  assembleWholeBook,
} from "../assembleScope";
import type { DataSource } from "../DataSource";
import type {
  Glossary,
  GlossaryEntry,
  IndexV2,
} from "../types";

describe("assembleWholeBook (D-098 lean payload)", () => {
  function stubDs(chapterCount: number, glossarySize: number): DataSource {
    const chapters = Array.from({ length: chapterCount }, (_, i) => ({
      chapter_id: `ch${String(i).padStart(2, "0")}`,
      title_jp: `章 ${i}`,
      title_zh: `章 ${i}`,
      title_en: `Chapter ${i}`,
      first_page: i * 30 + 1,
      last_page: i * 30 + 30,
    }));
    const glossaryEntries: GlossaryEntry[] = Array.from(
      { length: glossarySize },
      (_, i) => ({
        id: `g_${String(i).padStart(3, "0")}`,
        surface: { jp: `語${i}`, zh: `词${i}`, en: `word${i}` },
        kana_helper: null,
        first_page: i + 1,
        occurrences: [],
        aliases_jp: [],
      }),
    );
    const idx: IndexV2 = {
      schema_version: "v2",
      cert_id: "itpassport_r6",
      run_id: "stub",
      exported_at: "2026-05-19T00:00:00Z",
      totals: { pages: 0, entities: 0, leaves: 0 },
      stage6_summary: {
        verdict: "PASS",
        pass_pages: 0,
        warn_pages: 0,
        fail_pages: 0,
        polish_items_count: 0,
      },
      pages: [],
      chapters,
      glossary_index: { surface_jp_to_id: {}, id_to_surface: {} },
      entity_by_id: {},
      v2_built_at: "2026-05-19T00:00:00Z",
      v2_source_index: "stub",
    };
    return {
      loadIndex: async () => idx,
      loadPage: async () => {
        throw new Error("stub: loadPage not used by lean assembleWholeBook");
      },
      loadChapter: async () => [],
      loadGlossary: async () => ({
        schema_version: "v1",
        cert_id: "itpassport_r6",
        run_id: "stub",
        generated_at: "2026-05-19T00:00:00Z",
        entries: glossaryEntries,
      }),
      loadWholeBook: async () => {
        throw new Error(
          "stub: loadWholeBook MUST NOT be called by lean assembleWholeBook " +
            "(per D-098 §2.1 — guarding against accidental full-pages revert)",
        );
      },
    };
  }

  it("packs chapters + glossary as scope='whole-book' (no pages array)", async () => {
    const out = await assembleWholeBook(stubDs(16, 908));
    expect(out.scope).toBe("whole-book");
    expect(out.tokenEstimate).toBeGreaterThan(0);
    expect(out.meta.chapter_count).toBe(16);
    expect(out.meta.glossary_entry_count).toBe(908);
    expect(out.meta.cert_id).toBe("itpassport_r6");

    const payload = JSON.parse(out.contextBlock);
    expect(payload.scope).toBe("whole-book");
    expect(payload.cert_id).toBe("itpassport_r6");
    expect(payload.run_id).toBe("stub");
    expect(payload.totals).toEqual({ pages: 0, entities: 0, leaves: 0 });
    expect(Array.isArray(payload.chapters)).toBe(true);
    expect(payload.chapters.length).toBe(16);
    expect(payload.chapters[0].chapter_id).toBe("ch00");
    expect(Array.isArray(payload.glossary_entries)).toBe(true);
    expect(payload.glossary_entries.length).toBe(908);
    expect(payload.glossary_entries[0].id).toBe("g_000");
  });

  it("does not include a pages array (D-098 §2.1 lean invariant)", async () => {
    const out = await assembleWholeBook(stubDs(3, 5));
    const payload = JSON.parse(out.contextBlock);
    expect(payload.pages).toBeUndefined();
  });

  it("propagates empty chapters + empty glossary cleanly", async () => {
    const out = await assembleWholeBook(stubDs(0, 0));
    const payload = JSON.parse(out.contextBlock);
    expect(payload.chapters).toEqual([]);
    expect(payload.glossary_entries).toEqual([]);
    expect(out.meta.chapter_count).toBe(0);
    expect(out.meta.glossary_entry_count).toBe(0);
  });
});

describe("assembleTermHover", () => {
  it("throws when index points to id missing from glossary", async () => {
    const indexHasId: IndexV2 = {
      schema_version: "v2",
      cert_id: "x",
      run_id: "x",
      exported_at: "x",
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
        surface_jp_to_id: { 幽霊: "g_999" },
        id_to_surface: { g_999: "幽霊" },
      },
      entity_by_id: {},
      v2_built_at: "x",
      v2_source_index: "x",
    };
    const glossaryWithoutId: Glossary = {
      schema_version: "v1",
      cert_id: "x",
      run_id: "x",
      generated_at: "x",
      entries: [],
    };
    const ds: DataSource = {
      loadIndex: async () => indexHasId,
      loadPage: async () => {
        throw new Error("not used");
      },
      loadChapter: async () => [],
      loadGlossary: async () => glossaryWithoutId,
      loadWholeBook: async () => [],
    };
    await expect(assembleTermHover(ds, "幽霊")).rejects.toThrow(
      /missing from glossary entries/,
    );
  });
});
