# R6 — Batch Vision Extraction Brief (5 pages per worker)

## Defect class
25 pages labeled `content` have empty `structured/page_NNN.json` (0 entities). Stage 4 produced nothing for these pages despite the page having extractable content. This is a release-level defect.

## Your task per page

For each of your 5 assigned pages, you will:

1. Read raw image: `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/raw/pages/page_NNN.jpg`
2. Read existing `output/pages/page_NNN.json` (Stage 7 wrapper) to confirm schema.
3. Extract ALL visible content from the page as appropriate entities:
   - section/chapter headings → `section` entity with `section_number` and `name` triple
   - Vocabulary terms with definitions → `term` entities
   - Tables → `table` entities with `rows`
   - Figures/diagrams → `figure` entities with `caption` + description
   - Question + 4 choices → `question` entity with `stem`, `choices[]`, `answer_index`
4. Provide jp + zh + en for every text element.
5. Write 3 files per page (use `page_NNN` 3-digit zero-padded):
   - `validation/deep_validation_2026-05-17/iter_2/fixed_structured/page_NNN.json`
   - `validation/deep_validation_2026-05-17/iter_2/fixed_translated/page_NNN.json`
   - `validation/deep_validation_2026-05-17/iter_2/fixed_output/pages/page_NNN.json` (Stage 7 wrapper shape — set leaf_count to total trilingual leaves, stage6_verdict to PASS)

## Schema notes

- `structured` typically has `jp` filled with `zh` and `en` = `"<UNTRANSLATED>"` placeholders. `translated` has all 3 langs filled.
- `output/pages/*.json` has the Stage 7 wrapper:
  ```json
  {
    "page": NNN,
    "leaf_count": N,
    "stage6_verdict": "PASS",
    "entities": [...]
  }
  ```
- Anchor block_ids: `page_NNN_block_0`, `page_NNN_block_1`, ... in document order.

## Privacy
No textbook title/author. Generic terms only.

## Final return per worker
6-line summary listing pages handled, entities-per-page tally, top types, errors.
JSON only on disk.
