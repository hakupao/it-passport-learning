// D-089 §2.3 per-scope excerpt assembly fns — Session 34 Step 3.
// 4 thin wrappers on top of DataSource, one per D-085 §2.4 mode-dependent scope.
//
// Session 37 D-098 amend: assembleWholeBook reshaped to lean payload (chapters
// + glossary, no pages array) so the whole-book corpus fits DeepSeek's 64K
// context window. Other 3 assemble fns unchanged.
//
// Output contract: { scope, contextBlock: string, tokenEstimate: number, meta }
//   - contextBlock = JSON.stringify(payload, null, 2) — α-now form; Step 4 may
//     reframe to markdown if Vercel AI SDK prompt template demands (sub-ADR amend).
//   - tokenEstimate = Math.ceil(contextBlock.length / 3) conservative heuristic
//     post-Step-6 calibration. Empirical chars/N ratio is content-dependent
//     across N=4 真 measurements:
//       Step 4 hello-ai glossary: chars/4 over-estimates by +37%   (actual chars/N ≈ 5.5 — large-payload English-heavy JSON)
//       Step 5 whole-book lean:   chars/4 under-estimates by −21%  (actual chars/N ≈ 3.17 — large-payload CJK-mix JSON)
//       Step 6 quiz question:     chars/4 under-estimates by −79%  (actual chars/N ≈ 0.85 — small-payload, sys+user overhead dominates total input)
//       Step 7 term-hover:        chars/3 under-estimates by ~21%  (actual chars/N ≈ 2.0-2.4 — smallest payload, ~480-char single glossary entry)
//     Step 7 close decision (Session 39 Q3=a): KEEP universal chars/3 (no
//     per-scope split). Rationale per
//     `evidence/phase2/step_07_glossary/cache_audit_2026-05-20.md` §7.2 —
//     estimator's job is rough cost pre-flight, not strict budget enforcement;
//     chars/3 sits in the middle of the N=4 empirical range (0.85 → 5.5) and
//     over-estimates the only scope close to a provider ctx limit (whole-book
//     lean at ~93K vs DeepSeek 128K). Per-scope split would couple the estimator
//     to scope identity (currently agnostic) without budget-critical accuracy gain.
//
// Cache boundary (D-088 §2.3): system_prompt + full glossary are cached; the
// per-scope excerpt assembled here is the UN-cached per-call input.

import type { DataSource } from "./DataSource";
import type { ChapterRef, GlossaryEntry } from "./types";

export type AssembledScopeKind =
  | "question"
  | "chapter"
  | "whole-book"
  | "term-hover";

export interface AssembledScope {
  scope: AssembledScopeKind;
  /** JSON-stringified payload ready to feed into a Vercel AI SDK message. */
  contextBlock: string;
  /** Conservative chars/4 token estimate; calibrate post Step 4 retro. */
  tokenEstimate: number;
  /** Lightweight identifying fields for logging / debug; not the payload itself. */
  meta: Record<string, unknown>;
}

function estimateTokens(text: string): number {
  // chars/3 conservative heuristic post-Step-6 calibration. Older chars/4 ratio
  // proved content-dependent (see file header for the N=3 measurement table).
  // Over-estimate on whole-book lean is safe (still well under provider ctx);
  // under-estimate on quiz question is acceptable because question payload sits
  // far below all provider limits.
  return Math.ceil(text.length / 3);
}

function packScope(
  scope: AssembledScopeKind,
  payload: Record<string, unknown>,
  meta: Record<string, unknown>,
): AssembledScope {
  const contextBlock = JSON.stringify(payload, null, 2);
  return {
    scope,
    contextBlock,
    tokenEstimate: estimateTokens(contextBlock),
    meta,
  };
}

/**
 * Quiz Explain mode (D-085) — 1 page + entity pin.
 * Expected token range: ~500-3000.
 */
export async function assembleQuestion(
  ds: DataSource,
  pageId: number,
  entityIndex: number,
): Promise<AssembledScope> {
  const page = await ds.loadPage(pageId);
  if (entityIndex < 0 || entityIndex >= page.entities.length) {
    throw new Error(
      `assembleQuestion: entityIndex ${entityIndex} out of range ` +
        `(page ${pageId} has ${page.entities.length} entities)`,
    );
  }
  const entity = page.entities[entityIndex];
  if (!entity) {
    // Defensive — strict mode requires this even after the bounds check above.
    throw new Error(
      `assembleQuestion: entity at page ${pageId} index ${entityIndex} is undefined`,
    );
  }
  if (entity.type !== "question") {
    throw new Error(
      `assembleQuestion: entity at page ${pageId} index ${entityIndex} ` +
        `is type "${entity.type}", expected "question"`,
    );
  }
  const payload = {
    scope: "question" as const,
    cert_id: page.cert_id,
    run_id: page.run_id,
    page: pageId,
    entity_index: entityIndex,
    entity,
    page_context: page,
  };
  return packScope("question", payload, {
    page: pageId,
    entity_index: entityIndex,
    entity_id: entity.id,
  });
}

/**
 * Study Chat mode (D-085) — full chapter span.
 * Expected token range: ~50K-150K.
 */
export async function assembleChapter(
  ds: DataSource,
  chapterId: string,
): Promise<AssembledScope> {
  const idx = await ds.loadIndex();
  const chapter: ChapterRef | undefined = idx.chapters.find(
    (c) => c.chapter_id === chapterId,
  );
  if (!chapter) {
    throw new Error(
      `assembleChapter: chapter "${chapterId}" not found in index`,
    );
  }
  const pages = await ds.loadChapter(chapterId);
  const payload = {
    scope: "chapter" as const,
    cert_id: idx.cert_id,
    run_id: idx.run_id,
    chapter,
    pages,
  };
  return packScope("chapter", payload, {
    chapter_id: chapterId,
    page_count: pages.length,
    first_page: chapter.first_page,
    last_page: chapter.last_page,
  });
}

/**
 * Standalone Chat mode (D-085) — lean payload per D-098 §2.1.
 *
 * α-now form: chapters (16) + glossary entries (908), NO full pages array.
 * Expected token range: ~58-60K (fits DeepSeek 64K + Anthropic 200K + 1M).
 * Step 4 hello-ai measured 57,993 input tokens for glossary alone; the added
 * chapters list (~2 KB / ~300 tokens) is negligible.
 *
 * D-098 §2.4 supersedes the original D-085 "full 554-page corpus" semantics
 * for whole-book scope; full-corpus form deferred to Phase 3+ β when a 1M-ctx
 * model is selected (will be reintroduced as a separate fn — D-098 §2.4 hook).
 */
export async function assembleWholeBook(ds: DataSource): Promise<AssembledScope> {
  const [idx, glossary] = await Promise.all([
    ds.loadIndex(),
    ds.loadGlossary(),
  ]);
  const payload = {
    scope: "whole-book" as const,
    cert_id: idx.cert_id,
    run_id: idx.run_id,
    totals: idx.totals,
    chapters: idx.chapters,
    glossary_entries: glossary.entries,
  };
  return packScope("whole-book", payload, {
    chapter_count: idx.chapters.length,
    glossary_entry_count: glossary.entries.length,
    cert_id: idx.cert_id,
  });
}

/**
 * Study term tooltip mode (D-085) — single glossary entry by Japanese surface.
 * Expected token range: ~80-200.
 */
export async function assembleTermHover(
  ds: DataSource,
  surfaceJp: string,
): Promise<AssembledScope> {
  const idx = await ds.loadIndex();
  const id = idx.glossary_index.surface_jp_to_id[surfaceJp];
  if (!id) {
    throw new Error(
      `assembleTermHover: surface "${surfaceJp}" not found in glossary_index`,
    );
  }
  const glossary = await ds.loadGlossary();
  const entry: GlossaryEntry | undefined = glossary.entries.find(
    (e) => e.id === id,
  );
  if (!entry) {
    throw new Error(
      `assembleTermHover: id "${id}" missing from glossary entries ` +
        `(index/glossary out of sync)`,
    );
  }
  const payload = {
    scope: "term-hover" as const,
    cert_id: glossary.cert_id,
    run_id: glossary.run_id,
    surface_jp: surfaceJp,
    entry,
  };
  return packScope("term-hover", payload, {
    surface_jp: surfaceJp,
    glossary_id: id,
  });
}
