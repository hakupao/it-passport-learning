// D-089 §2.1 — Phase 2 data source contract.
// α-now default impl = FsDataSource (reads from local FS / Vercel deploy artifact).
// β-ready alt impls = BlobDataSource / KvDataSource / DbDataSource — same interface,
// 0 code rewrite at app layer per D-086 §2.4 portability.

import type { Glossary, IndexV2, Page } from "./types";

export interface DataSource {
  /**
   * Load the v2 manifest (v1 content + v2 augmentations per D-089 §2.2).
   * Typically eager-loaded on construct.
   */
  loadIndex(): Promise<IndexV2>;

  /**
   * Load a single page by page number.
   * Throws if page is not in the corpus.
   */
  loadPage(pageId: number): Promise<Page>;

  /**
   * Load all pages within a chapter (by chapter_id, e.g. "ch01").
   * Returns pages in ascending page order. Empty array if chapter unknown.
   */
  loadChapter(chapterId: string): Promise<Page[]>;

  /**
   * Load the full glossary (eager; ~98K tokens / 312KB JSON in v1.0.3).
   * Subject to D-088 §2.3 system+glossary ephemeral cache block.
   */
  loadGlossary(): Promise<Glossary>;

  /**
   * Load every page in book order.
   * Whole-book scope per D-085 §2.4 Standalone Chat mode.
   * ~798K tokens / 4.5MB JSON in v1.0.3 — fits Opus 4.7 1M ctx per
   * `evidence/phase2_d089_poc_2026-05-19/measurement.md`.
   */
  loadWholeBook(): Promise<Page[]>;
}
