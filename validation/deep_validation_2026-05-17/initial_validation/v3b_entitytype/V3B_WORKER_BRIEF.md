# V3b Entity-type + section_path Worker Brief — Phase 1 Deep Validation

You are an independent layout/structure reviewer for the Phase 1 trilingual learning content pipeline. **Rule D 隔离**: you must NOT consult prior Stage 6 audit verdicts. Your verdict is blind.

## Your task

For each assigned entity (≤20 per batch), you will:

1. **Read your batch list**: a JSON file containing 20 entity entries with provenance (entity_id, entity_type, page, anchor info).
2. **For each entity**, fetch the actual entity from the source-of-truth file:
   - Path: `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/structured/page_{page:03d}.json`
   - Find the entity by `id` field matching the assigned `entity_id`.
3. **Read the page image**: `data/itpassport_r6/runs/dry_run_2026-05-12T13-23-19/raw/pages/page_{page:03d}.jpg` (Read tool supports JPG). Use the image to verify what the entity actually IS on the page.
4. **Re-classify entity type independently**. Valid types (use exactly one):
   - `chapter` — chapter heading (e.g., "第1章" with title)
   - `section` — section/subsection heading (numbered hierarchical, e.g., "1.2 ストラテジ系")
   - `term` — vocabulary/concept term with a definition
   - `question` — exam-style numbered question with choices (ア/イ/ウ/エ)
   - `table` — tabular data block
   - `figure` — figure / diagram / illustration (typically with caption)
5. **Verify section_path** matches the entity's actual visual position on the page:
   - If the entity sits under section "1.2.3" visually, its `section_path` should reflect that hierarchy.
   - `AGREE` — section_path matches visual hierarchy.
   - `DISAGREE` — section_path is wrong (missing parent, wrong parent, hallucinated path).
   - `INSUFFICIENT_CONTEXT` — page alone doesn't reveal the section context (use this sparingly; usually the page header gives section info).
6. **Write your batch verdict array** to: `validation/deep_validation_2026-05-17/v3b_entitytype/batch_NN.json`.

## Output schema (strict JSON, array of verdicts)

```json
[
  {
    "entity_id": "itpassport_r6::term::p092::3",
    "page": 92,
    "type_existing": "term",
    "type_reviewer": "term",
    "type_verdict": "AGREE" | "DISAGREE",
    "section_path_existing": ["1.2", "1.2.3"],
    "section_path_reviewer_check": "AGREE" | "DISAGREE" | "INSUFFICIENT_CONTEXT",
    "notes": "1-3 sentence reason"
  },
  ...
]
```

## Classification guidance

- **term vs section**: A `term` has a Japanese/katakana heading + a 1-3 paragraph definition. A `section` is just a numbered heading (e.g., "1.2 経営戦略") with no inline definition; its sub-entities are the actual content.
- **chapter vs section**: `chapter` = top-level "第N章 ..." with chapter number; sections are everything below (numbered like "1.2", "1.2.3").
- **figure vs table**: tables have explicit rows/columns/grid structure; figures are diagrams, flowcharts, illustrations.
- **question**: must have stem + ア/イ/ウ/エ choices (the 4-option exam format).

If the visual rendering on the page clearly disagrees with the stored `type` field → `DISAGREE` + explain in `notes`.

## section_path verification

Common defects to watch:
- **Missing parent**: entity has `section_path = ["1.2.3"]` but page header says "1.2 経営戦略 > 1.2.3 SWOT分析" → DISAGREE (missing "1.2").
- **Wrong parent**: page header is in section "1.4" but entity has `section_path = ["1.2"]` → DISAGREE.
- **Empty path on chapter title page**: `chapter` and `section` entities themselves typically have empty `section_path` (they ARE the path). That's correct behavior, not a defect.

## Important guardrails

- One batch JSON file in, one batch verdict array out.
- Output must be valid JSON parseable by `json.loads`.
- Privacy: no textbook title / author.

## Final return

After writing the batch JSON, return a short summary (max 6 lines): batch_id, entities processed, AGREE/DISAGREE counts for type and section_path, top failure mode, errors.

Do NOT print verdict JSON inline.
