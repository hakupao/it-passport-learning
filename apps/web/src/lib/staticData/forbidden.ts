// D-217 H1-2 / H1-6 — what must never ship: the corpus's internal / provenance keys and the paths /
// names of the raw IPA material. Used by the /data allow-list test (./allowList re-exports them) and by
// the out/ scan (src/lib/export/outScan.ts, run by scripts/scan-out.ts with plain Node — so this
// module imports nothing).

/** Internal / provenance fields of the corpus and its sidecars. */
export const FORBIDDEN_KEYS = [
  "source_note",
  "suspect_count",
  "stem_corruption_count",
  "stem_corruption_suspected",
  "stem_reconstructed_s975",
  "key_guard",
  "key_guard_round1",
  "round1",
  "note_jp",
  "figure_derivable",
  "derived_answer",
  "matches_key",
  "generated_from",
  "attribution",
  "schema_version",
  "stem_jp_clean",
  "figure_type",
  "stats",
  "count",
  "pages",
  "page",
  "bbox",
  "svg_path",
] as const;

/** Paths / names of the raw IPA material and the extraction pipeline. */
export const FORBIDDEN_TEXT = ["data/ip/", "question_bank", ".pdf", "/exams/", "/sources/", "/syllabus/", ".source/"] as const;
