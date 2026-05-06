# Stage 1 Audit — Dry-Run (itpassport_r6 / dry_run_2026-05-06T16-58-10)

> Per D-073 Stage B: this is a **manual user review** (not a reviewer-LLM audit).
> The D-062 standard fields are filled where applicable; reviewer fields use the
> manual-review convention `n/a (Stage B per D-073)`.

## D-062 fields

| # | Field | Value |
|---|---|---|
| 1 | `stage` | 1 (OCR) |
| 2 | `cert_id` | `itpassport_r6` |
| 3 | `run_id` | `dry_run_2026-05-06T16-58-10` |
| 4 | `total` | 50 |
| 5 | `N` | 50 (full population, dry-run scope per D-070) |
| 6 | `sample_ids` | `page_001 … page_050` (50 contiguous pages from start) |
| 7 | `writer_agent` | `mistral-ocr-latest` (Mistral Scale plan) |
| 8 | `writer_prompt_version` | n/a (OCR engine, no prompt) |
| 9 | `reviewer_agent` | user (Stage B manual review per D-073) |
| 10 | `reviewer_prompt_version` | n/a (manual review) |
| 11 | `pass_count` | 50 |
| 12 | `fail_count` | 0 |
| 13 | `pass_rate` | 1.0 |
| 14 | `verdict` | **PASS** |
| 15 | `failures` | [] |
| 16 | `started_at` | `2026-05-06T16:58:10.942882+09:00` |
| 16 | `finished_at` | `2026-05-06T16:59:48+09:00` (approx, +97.79s wall-time) |
| 17 (opt) | `cost_estimate` | `{ tokens: 0, usd: 0.05 }` |
| 18 (opt) | `reviewer_notes` | see Stage B Retro Notes below |

## Stage B Retro Notes

### Three pages sampled

**page_001 (cover)** — title hierarchy, syllabus version, author, publisher all
extracted correctly. Minor table-rendering of "令和6年度" date-line; semantically
benign and does not affect downstream.

**page_010 (TOC)** — chapter numbering + page numbers + indent hierarchy
**100% preserved**. This is a strong signal that Stage 4 Structure extraction
(Chapter / Section entities per D-056 Discriminated Union) will have a high-
quality input.

**page_030 (content)** — sub-headings, paragraph breaks, embedded internal
references like `(p.15)`, image references in markdown form
`![img-0.jpeg](img-0.jpeg)` all preserved.

### Verdict justification

Quality clearly exceeds the Phase 1 minimum threshold. Mistral OCR is judged
adequate for the full-book run.

## Known minor issues (non-blocking)

1. **HTML entity `&amp;` not converted back to `&`** — Mistral OCR quirk; fix
   at Stage 5 input preprocessing (one-line `.replace`). Tracked.
2. **Occasional table-rendering of single dates** like "令和6年度" → 3 cell
   table — semantically benign for downstream Stage 4 / 5.
3. **Runner does not print failure details** — UX issue (the Step 5 first run
   surfaced 10 fails but stored only stringified exceptions internally; debug
   required a manual `python -c` reproduction). Fix in Step 6 by streaming
   failures to `failures/<run>/step_NN_attempt_X.md` per D-063 §2.5 + by
   echoing the first N to stdout. Not a blocker for retro outcome.

## Decision

**PASS** → proceed to Step 6 (Stage 2-7 implementation + full-book run).

## Cross-references

- Source: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/`
- Cost ledger: `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/cost.json`
- Decision context: `docs/decisions/D-073-phase1-launch-strategy.md` Stage B
- Reviewer-LLM mapping (for future stages): `docs/decisions/D-061-reviewer-mapping.md`
