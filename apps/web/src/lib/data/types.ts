// Phase 1 v1.0.3 JSON shape mirrored as TS strict types.
// Source: data/itpassport_r6/runs/<run>/output/ — D-084 v1.0.3 immutable.
// Schema reference: cert-extractor Stage 7 export + glossary builder + per-page JSON.

export interface Trilingual {
  jp: string;
  zh: string;
  en: string;
}

export function trilingualFor(tri: Trilingual, locale: string): string | undefined {
  if (locale === "ja") return tri.jp;
  if (locale === "zh") return tri.zh;
  if (locale === "en") return tri.en;
  return undefined;
}

export interface EntityAnchor {
  page: number;
  block_id: string;
  section_path: string[];
}

// Open union: known types observed in v1.0.3 + escape hatch for future additions
// without breaking strict mode.
export type EntityType =
  | "section"
  | "figure"
  | "question"
  | "answer"
  | "explanation"
  | "text"
  | (string & {});

export interface Entity {
  id: string;
  anchor: EntityAnchor;
  type: EntityType;
  title?: Trilingual;
  caption?: Trilingual;
  section_number?: string;
  image_ref?: string;
  // permit additional fields without breaking strict mode
  [extra: string]: unknown;
}

export interface Page {
  schema_version: string;
  cert_id: string;
  run_id: string;
  stage: number;
  page: number;
  exported_at: string;
  stage6_verdict: string;
  leaf_count: number;
  entities: Entity[];
  polish_items_ref?: string | null;
}

/**
 * Phonetic reading helper for Japanese surfaces. Present on ~308 of the 908
 * v1.0.3 entries; null for the other ~600 (typically Latin acronyms / ASCII
 * surfaces where the reading equals the surface).
 *
 * Shape locked by the v1.0.3 cert-extractor glossary builder; the TS type was
 * originally declared as `string | null` from the schema sketch, but the real
 * runtime payload is an object — see Session 43 Rule B archive
 * `failures/step_11_attempt_1_kana_helper_object_shape_mismatch.md`.
 */
export interface KanaHelper {
  surface: string;
  reading: string;
  zh_concept?: string;
  auto_backfill?: boolean;
}

export interface GlossaryEntry {
  id: string;
  surface: Trilingual;
  kana_helper: KanaHelper | null;
  first_page: number;
  occurrences: number[];
  aliases_jp: string[];
}

export interface Glossary {
  schema_version: string;
  cert_id: string;
  run_id: string;
  generated_at: string;
  entries: GlossaryEntry[];
}

export interface IndexPageRef {
  page: number;
  json: string;
  md: string;
  entity_count: number;
  leaf_count: number;
  verdict: string;
  polish_items_count: number;
}

export interface Stage6Summary {
  verdict: string;
  pass_pages: number;
  warn_pages: number;
  fail_pages: number;
  polish_items_count: number;
}

export interface IndexTotals {
  pages: number;
  entities: number;
  leaves: number;
}

// v1 manifest baseline (current cert-extractor Stage 7 output).
export interface IndexV1 {
  schema_version: "v1";
  cert_id: string;
  run_id: string;
  exported_at: string;
  totals: IndexTotals;
  stage6_summary: Stage6Summary;
  pages: IndexPageRef[];
}

// D-089 §2.2 v2 augmentations.
export interface ChapterRef {
  chapter_id: string; // "ch00" .. "ch15"
  title_jp: string;
  title_zh: string;
  title_en: string;
  first_page: number;
  last_page: number;
}

export interface GlossaryIndex {
  surface_jp_to_id: Record<string, string>;
  id_to_surface: Record<string, string>;
}

export interface EntityByIdRef {
  page: number;
  entity_index: number;
  type: string;
  id: string;
}

// v2 = v1 content carried forward + v2 augmentations (single file `index.v2.json`,
// independent of immutable v1 `index.json` per D-089 §2.2).
export interface IndexV2 {
  schema_version: "v2";
  cert_id: string;
  run_id: string;
  exported_at: string;
  totals: IndexTotals;
  stage6_summary: Stage6Summary;
  pages: IndexPageRef[];
  // ↓ v2 additions
  chapters: ChapterRef[];
  glossary_index: GlossaryIndex;
  entity_by_id: Record<string, EntityByIdRef>;
  // metadata: when this v2 was built (separate from v1 exported_at)
  v2_built_at: string;
  v2_source_index: string; // path/name of v1 source
}
