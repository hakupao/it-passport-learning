// Phase 2 Step 11 — glossary list/summary helper.
//
// Session 43 4Q-locked design (Q1=a /glossary browse page → modal-like popover /
// Q2=a click-to-open / Q3=a streaming-as-it-arrives / Q4=a clone quizSseTransport):
//   - List view drives <GlossaryList />: enumerate every glossary entry in the
//     corpus, ordered by Japanese 50音 (Intl.Collator('ja')) so users can scan
//     alphabetically the way a paper-book glossary would be ordered.
//   - The surface_jp used by /api/glossary/hover is the GlossaryEntry.surface.jp
//     field (Step 7 contract). We surface it on each card as the click target.
//
// Pure logic / no React — testable under the existing vitest node env.
//
// D-085 §2.4 term-hover scope: 1 glossary entry resolved via
// glossary_index.surface_jp_to_id. This module only produces the *list* + *id*;
// the actual scope assembly happens server-side in /api/glossary/hover on click.

import type { Glossary, GlossaryEntry, IndexV2 } from "@/lib/data/types";

/**
 * Aliases above this count are truncated on the card preview to keep cards
 * compact; the full list is still passed to the hover endpoint via the
 * underlying GlossaryEntry on the server side.
 */
export const ALIAS_PREVIEW_MAX = 3;

export interface GlossarySummary {
  /** Stable identifier from the corpus (e.g. "g_001"). */
  id: string;
  /** Japanese surface — the click target (sent to /api/glossary/hover). */
  surfaceJp: string;
  /** Simplified-Chinese surface (display only). */
  surfaceZh: string;
  /** English surface (display only). */
  surfaceEn: string;
  /** Phonetic reading helper (katakana) if present in the corpus. */
  kanaReading: string | null;
  /** First page where this term appears in the source corpus. */
  firstPage: number;
  /** Total occurrences across the corpus (a rough "how common is this" hint). */
  occurrenceCount: number;
  /** Up to ALIAS_PREVIEW_MAX Japanese aliases for card display. */
  aliasesPreview: string[];
  /** Whether the alias list was truncated for the preview. */
  aliasesTruncated: boolean;
}

/**
 * Project a GlossaryEntry into the lighter summary the list page renders.
 * Defensive over partially-populated entries.
 */
export function buildGlossarySummary(entry: GlossaryEntry): GlossarySummary {
  const aliasesAll = Array.isArray(entry.aliases_jp) ? entry.aliases_jp : [];
  const aliasesPreview = aliasesAll.slice(0, ALIAS_PREVIEW_MAX);
  return {
    id: entry.id,
    surfaceJp: entry.surface?.jp ?? "",
    surfaceZh: entry.surface?.zh ?? "",
    surfaceEn: entry.surface?.en ?? "",
    kanaReading: entry.kana_helper?.reading ?? null,
    firstPage:
      typeof entry.first_page === "number" && Number.isFinite(entry.first_page)
        ? entry.first_page
        : 0,
    occurrenceCount: Array.isArray(entry.occurrences)
      ? entry.occurrences.length
      : 0,
    aliasesPreview,
    aliasesTruncated: aliasesAll.length > aliasesPreview.length,
  };
}

/**
 * Build the full summary list sorted by Japanese 50音 order using
 * Intl.Collator('ja'). Entries with an empty surface_jp are dropped (they can
 * never round-trip through /api/glossary/hover anyway). Stable secondary sort
 * by id keeps the order deterministic across renders.
 *
 * Intl.Collator with locale "ja" is broadly supported in Node 20+ (ICU baked
 * in) and modern browsers; we keep a localeCompare fallback for environments
 * where 'ja' is unavailable so tests do not become brittle.
 */
export function listGlossarySummaries(glossary: Glossary): GlossarySummary[] {
  const summaries: GlossarySummary[] = [];
  for (const entry of glossary.entries) {
    if (!entry.surface?.jp) continue;
    summaries.push(buildGlossarySummary(entry));
  }
  const collator = buildJaCollator();
  summaries.sort((a, b) => {
    const surfaceCmp = collator.compare(a.surfaceJp, b.surfaceJp);
    if (surfaceCmp !== 0) return surfaceCmp;
    return a.id.localeCompare(b.id);
  });
  return summaries;
}

interface MinimalCollator {
  compare(a: string, b: string): number;
}

function buildJaCollator(): MinimalCollator {
  try {
    return new Intl.Collator("ja", {
      sensitivity: "base",
      numeric: true,
    });
  } catch {
    return {
      compare: (a: string, b: string) => a.localeCompare(b, "ja"),
    };
  }
}

/**
 * Parse the `?term=` URL parameter back to a surface_jp candidate. Returns null
 * for missing / empty values and never throws (decodeURIComponent on a
 * malformed escape returns the raw string). Caller is expected to gate the
 * result through `isKnownSurface` before sending to the API.
 *
 * Note: useSearchParams in Next.js already decodes the param once, so callers
 * pass the already-decoded value here. We keep the function tolerant of an
 * extra encoding pass (re-decode-of-decoded-is-idempotent on valid UTF-8) so
 * server-side ?term= round-trips do not break the round trip.
 */
export function parseTermParam(raw: string | null): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  // Avoid decodeURIComponent throwing on malformed input.
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

/**
 * Predicate: is this surface_jp present in the glossary index? Cheap O(1)
 * lookup against `IndexV2.glossary_index.surface_jp_to_id`.
 */
export function isKnownSurface(idx: IndexV2, surfaceJp: string): boolean {
  if (typeof surfaceJp !== "string" || surfaceJp.length === 0) return false;
  return Boolean(idx.glossary_index?.surface_jp_to_id?.[surfaceJp]);
}

/**
 * Locate a summary by its surface_jp from a previously-built list. Returns
 * null on miss. Used by <GlossaryList /> to derive the active summary from
 * the URL `?term=` param without re-walking the corpus.
 */
export function findSummaryBySurface(
  summaries: GlossarySummary[],
  surfaceJp: string,
): GlossarySummary | null {
  if (!surfaceJp) return null;
  return summaries.find((s) => s.surfaceJp === surfaceJp) ?? null;
}
