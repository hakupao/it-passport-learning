// Unit tests for D-089 §2.3 per-scope assembly fns (Session 34 Step 3).
// Uses the apps/web/_fixtures/v1.0.3 corpus via FsDataSource default path.

import { describe, expect, it } from "vitest";

import {
  assembleChapter,
  assembleQuestion,
  assembleTermHover,
  assembleWholeBook,
} from "../assembleScope";
import { FsDataSource } from "../FsDataSource";
import type { DataSource } from "../DataSource";
import type {
  Glossary,
  GlossaryEntry,
  IndexV2,
  Page,
} from "../types";

function makeFs(): FsDataSource {
  return new FsDataSource();
}

describe("assembleQuestion", () => {
  it("packs page_042 entity_0 as scope='question'", async () => {
    const ds = makeFs();
    const out = await assembleQuestion(ds, 42, 0);
    expect(out.scope).toBe("question");
    expect(out.contextBlock.length).toBeGreaterThan(0);
    expect(out.tokenEstimate).toBeGreaterThan(0);
    expect(out.meta).toMatchObject({ page: 42, entity_index: 0 });

    const payload = JSON.parse(out.contextBlock);
    expect(payload.scope).toBe("question");
    expect(payload.page).toBe(42);
    expect(payload.entity_index).toBe(0);
    expect(payload.entity.type).toBe("question");
    expect(payload.page_context.page).toBe(42);
  });

  it("rejects non-question entity (page_007 entity_0 = section)", async () => {
    const ds = makeFs();
    await expect(assembleQuestion(ds, 7, 0)).rejects.toThrow(
      /expected "question"/,
    );
  });

  it("rejects out-of-range entityIndex", async () => {
    const ds = makeFs();
    await expect(assembleQuestion(ds, 7, 9999)).rejects.toThrow(
      /out of range/,
    );
  });

  it("rejects negative entityIndex", async () => {
    const ds = makeFs();
    await expect(assembleQuestion(ds, 7, -1)).rejects.toThrow(/out of range/);
  });
});

describe("assembleChapter", () => {
  it("packs ch00 with all in-range pages", async () => {
    const ds = makeFs();
    const out = await assembleChapter(ds, "ch00");
    expect(out.scope).toBe("chapter");
    expect(out.tokenEstimate).toBeGreaterThan(0);
    expect(out.meta.chapter_id).toBe("ch00");

    const payload = JSON.parse(out.contextBlock);
    expect(payload.chapter.chapter_id).toBe("ch00");
    expect(Array.isArray(payload.pages)).toBe(true);
    expect(payload.pages.length).toBeGreaterThan(0);
    for (const p of payload.pages as Page[]) {
      expect(p.page).toBeGreaterThanOrEqual(payload.chapter.first_page);
      expect(p.page).toBeLessThanOrEqual(payload.chapter.last_page);
    }
  });

  it("rejects unknown chapter id", async () => {
    const ds = makeFs();
    await expect(assembleChapter(ds, "ch99")).rejects.toThrow(/not found/);
  });
});

describe("assembleWholeBook (D-098 lean payload)", () => {
  // Stub DataSource with explicit chapters + glossary entries (the new lean
  // payload shape per D-098 §2.1). `pages` and `loadWholeBook` are still on
  // the stub but no longer consumed by assembleWholeBook itself — kept for
  // DataSource interface conformance and to guard against accidental re-
  // introduction of the full-pages payload (asserted below).
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
  it("packs glossary entry by jp surface", async () => {
    const ds = makeFs();
    const out = await assembleTermHover(ds, "10進数");
    expect(out.scope).toBe("term-hover");
    expect(out.tokenEstimate).toBeGreaterThan(0);
    expect(out.meta).toMatchObject({
      surface_jp: "10進数",
      glossary_id: "g_003",
    });

    const payload = JSON.parse(out.contextBlock);
    expect(payload.scope).toBe("term-hover");
    expect(payload.surface_jp).toBe("10進数");
    const entry = payload.entry as GlossaryEntry;
    expect(entry.id).toBe("g_003");
    expect(entry.surface.jp).toBe("10進数");
  });

  it("rejects unknown surface", async () => {
    const ds = makeFs();
    await expect(
      assembleTermHover(ds, "this-surface-does-not-exist-12345"),
    ).rejects.toThrow(/not found in glossary_index/);
  });

  // Belt-and-suspenders: index/glossary out-of-sync path.
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
