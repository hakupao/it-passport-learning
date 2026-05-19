import { describe, expect, it } from "vitest";

import { FsDataSource } from "../FsDataSource";

// Tests run against the bundled v1.0.3 fixture at apps/web/_fixtures/v1.0.3.
// Vitest cwd = apps/web, so the constructor default resolves correctly.
const newDs = () => new FsDataSource();

describe("FsDataSource — loadIndex", () => {
  it("returns the v2 manifest with expected top-level shape", async () => {
    const idx = await newDs().loadIndex();

    expect(idx.schema_version).toBe("v2");
    expect(idx.cert_id).toBe("itpassport_r6");
    expect(idx.totals.pages).toBe(554);
    expect(idx.pages).toHaveLength(554);
    expect(idx.chapters.length).toBeGreaterThanOrEqual(16);
    expect(idx.v2_source_index).toBe("index.json");
    expect(idx.v2_built_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("caches the index across calls (same reference)", async () => {
    const ds = newDs();
    const a = await ds.loadIndex();
    const b = await ds.loadIndex();
    expect(b).toBe(a);
  });

  it("exposes the 16 zero-padded chapter ids in monotonic order", async () => {
    const idx = await newDs().loadIndex();
    const ids = idx.chapters.map((c) => c.chapter_id);
    expect(ids).toEqual([...ids].sort()); // monotonic by string
    expect(ids).toContain("ch00");
    expect(ids).toContain("ch15");
    // Adjacent chapters do not overlap
    for (let i = 0; i < idx.chapters.length - 1; i += 1) {
      const cur = idx.chapters[i]!;
      const next = idx.chapters[i + 1]!;
      expect(cur.last_page).toBeLessThan(next.first_page);
    }
  });

  it("indexes glossary surface_jp ↔ id (908 entries)", async () => {
    const idx = await newDs().loadIndex();
    const jpToId = idx.glossary_index.surface_jp_to_id;
    const idToJp = idx.glossary_index.id_to_surface;
    expect(Object.keys(jpToId).length).toBeGreaterThanOrEqual(900);
    expect(Object.keys(idToJp).length).toBeGreaterThanOrEqual(900);
    // Round-trip a known entry: "1-Click で今すぐ買う" → g_001
    expect(jpToId["1-Click で今すぐ買う"]).toBe("g_001");
    expect(idToJp["g_001"]).toBe("1-Click で今すぐ買う");
  });

  it("populates entity_by_id with page_NNN_entity_M keys", async () => {
    const idx = await newDs().loadIndex();
    const e0 = idx.entity_by_id["page_007_entity_0"];
    expect(e0).toBeDefined();
    expect(e0!.page).toBe(7);
    expect(e0!.entity_index).toBe(0);
    expect(e0!.type).toBe("section");
    expect(e0!.id).toBe("itpassport_r6::section::p007::0");
    expect(Object.keys(idx.entity_by_id).length).toBeGreaterThan(2000);
  });
});

describe("FsDataSource — loadPage", () => {
  it("loads page 7 with expected page metadata + entities", async () => {
    const page = await newDs().loadPage(7);
    expect(page.page).toBe(7);
    expect(page.cert_id).toBe("itpassport_r6");
    expect(page.entities.length).toBeGreaterThan(0);
    expect(page.entities[0]!.anchor.page).toBe(7);
  });

  it("throws a descriptive error for a non-existent page", async () => {
    await expect(newDs().loadPage(99999)).rejects.toThrow(/page 99999 not found/);
  });
});

describe("FsDataSource — loadChapter", () => {
  it("returns pages within ch01's range, sorted ascending", async () => {
    const ds = newDs();
    const idx = await ds.loadIndex();
    const ch01 = idx.chapters.find((c) => c.chapter_id === "ch01")!;
    const pages = await ds.loadChapter("ch01");
    expect(pages.length).toBeGreaterThan(0);
    for (const p of pages) {
      expect(p.page).toBeGreaterThanOrEqual(ch01.first_page);
      expect(p.page).toBeLessThanOrEqual(ch01.last_page);
    }
    const nums = pages.map((p) => p.page);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it("returns [] for an unknown chapter id", async () => {
    const pages = await newDs().loadChapter("ch99");
    expect(pages).toEqual([]);
  });
});

describe("FsDataSource — loadGlossary", () => {
  it("returns 908 glossary entries with trilingual surfaces", async () => {
    const g = await newDs().loadGlossary();
    expect(g.entries).toHaveLength(908);
    const g001 = g.entries.find((e) => e.id === "g_001")!;
    expect(g001).toBeDefined();
    expect(g001.surface.jp).toBe("1-Click で今すぐ買う");
    expect(typeof g001.surface.zh).toBe("string");
    expect(typeof g001.surface.en).toBe("string");
  });

  it("caches the glossary across calls (same reference)", async () => {
    const ds = newDs();
    const a = await ds.loadGlossary();
    const b = await ds.loadGlossary();
    expect(b).toBe(a);
  });
});

describe("FsDataSource — loadWholeBook", () => {
  it("returns all 554 pages in ascending page order", async () => {
    const pages = await newDs().loadWholeBook();
    expect(pages).toHaveLength(554);
    const nums = pages.map((p) => p.page);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
    expect(nums[0]).toBe(7);
    expect(nums[nums.length - 1]).toBeGreaterThanOrEqual(566);
  });
});

describe("FsDataSource — configuration", () => {
  it("honors explicit dataPath override over env + default", async () => {
    const explicit = "/tmp/no-such-fixture-just-for-path-assertion";
    const ds = new FsDataSource({ dataPath: explicit });
    expect(ds.getDataPath()).toBe(explicit);
  });
});
