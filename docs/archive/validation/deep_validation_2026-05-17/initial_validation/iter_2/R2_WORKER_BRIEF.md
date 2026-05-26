# R2 — Post-Fix Release Accuracy Audit Worker Brief

## Context

Round 1 fixes have been applied as parallel copies under `validation/deep_validation_2026-05-17/iter_2/fixed_output/pages/` (NOT the original release under `/data/output/pages/`). This audit confirms the **fixed** release-level files now accurately represent the source page images.

This is a different question than V1 (was Mistral OCR faithful?). Here we ask: **does the user-facing release JSON faithfully represent the page content?**

## Your task per page

For each assigned page (NNN):

1. **Read raw page image**: `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/raw/pages/page_NNN.jpg`
2. **Read FIXED release JSON**: `validation/deep_validation_2026-05-17/iter_2/fixed_output/pages/page_NNN.json`
   - If this file doesn't exist for an assigned page, fall back to `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/output/pages/page_NNN.json` and note `fixed_present: false` in the verdict.
3. **Assess release accuracy**:
   - For each entity in the release JSON, check whether it correctly represents what's on the page (jp surface, zh translation, en translation).
   - Note any visual content on the page that is NOT represented in the release entities (missing entities).
   - Note any entities whose jp/zh/en triples are materially wrong vs the image.
4. **Produce verdict JSON** at `validation/deep_validation_2026-05-17/iter_2/v_r2_release/page_NNN.json`.

## Output schema

```json
{
  "page": 61,
  "src": "raw/pages/page_061.jpg",
  "compared_against": "iter_2/fixed_output/pages/page_061.json" or "output/pages/page_061.json",
  "fixed_present": true,
  "release_verdict": "PASS" | "WARN" | "FAIL",
  "release_score": 0.0-1.0,
  "entity_count_in_release": 8,
  "findings": [
    {"category": "jp_surface_wrong|zh_drift|en_drift|missing_visual|extra_entity|table_garbled|other",
     "severity": "low|med|high",
     "entity_id": "itpassport_r6::...",
     "description": "..."}
  ],
  "reviewer_notes": "1-3 sentence summary"
}
```

### Verdict rubric

- **PASS**: 0 high-severity findings, ≤1 med-severity. release_score ≥ 0.9.
- **WARN**: 0 high-severity, ≤3 med-severity, OR several low-severity.
- **FAIL**: any high-severity, OR ≥4 med-severity. release_score < 0.7.

## Common patterns to check

- jp surface should match what's visible in the image (text quotes, captions, headings, table cells).
- zh / en should be sensible translations (not literal mistakes, not hallucinations).
- For pages with diagrams / figures, the release should have a `figure` or `table` entity that captures the diagram content (even as caption + description).
- Choice markers in user-facing zh/en should be A/B/C/D (Stage 7 normalized).

## Privacy

Do not mention textbook title or author.

## Final return

After all assigned pages are done, return a 6-line summary: pages handled, PASS/WARN/FAIL counts, top finding categories, any missing fixed_output files, errors.

JSON only on disk. Do not print verdicts inline.
