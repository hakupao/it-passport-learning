# Page 022 — Stage 5 EN hand-edit (2026-05-11)

> Per Stage 6 closure worksheet Q1 = B (user sign-off 2026-05-11).
> Surgical fix to a single trilingual leaf flagged FAIL by Stage 6
> LLM Phase-2 reviewer as a translation hallucination.

## Context

Stage 6 audit (Stage B rerun #2) caught 1 real FAIL — `translation_hallucination`
on page_022 entities[2] (a syllabus table). The LLM Phase-2 reviewer identified
that the EN rendering of one table cell added a noun absent from the JP/ZH source.

Phase-1 deterministic detectors cannot see semantic hallucinations of this class
(no contract violation; the leaf is well-formed). LLM Phase-2 caught it.

## Issue (verbatim from `evidence/.../stage6_review_stageB_rerun2.json`)

```
issue_id: (LLM-assigned)
issue_type: translation_hallucination
severity: FAIL
detector: llm
dimension: fidelity
repair_stage: 5
entity_path: page_022.entities[2].rows[1][1].en
safety_field: null
rationale:
  JP source is 「企業」 (enterprises/companies); EN adds the noun 'Activities'
  that is not in the source — the previous table did contain 「企業活動」 but
  this syllabus row does not.
```

## Before / After

`translated/page_022.json` `entities[2]` is a 4-row × 2-col table titled
「分野ごとの出題内容（公式のシラバスの内容）」(Exam content by domain).
Row 1 is the "Strategy" domain syllabus bullets.

| Lang | Before | After |
|---|---|---|
| jp | `・企業と法務\n・経営戦略\n・システム戦略` | (unchanged) |
| zh | `・企业与法务\n・经营战略\n・系统战略` | (unchanged) |
| en | **`- Corporate Activities and Legal Affairs\n- Management Strategy\n- System Strategy`** | **`- Corporate and Legal Affairs\n- Management Strategy\n- System Strategy`** |

The only character difference: `Corporate Activities` → `Corporate`. The hallucinated
noun "Activities" was removed; the resulting EN now matches the JP/ZH semantic
content (Corporate **AND** Legal Affairs — two parallel syllabus items).

## How the hallucination arose (likely)

Same-page entity[3] (a Term) has the gloss text describing 「企業活動」(corporate
activities). Stage 5 translator likely received cross-entity context bleed and
re-used the "Activities" gloss when translating entity[2] row[1][1] — even though
the JP source of row[1][1] is the shorter 「企業」(corporate, without 活動).

This is a "context bleed" hallucination pattern, distinct from the Plan-B class
bugs (Stage 4 question-extraction failures, Stage 5 jp-mutation, Stage 5
glossary-lookup leakage). Phase-2 LLM reviewer is the right detector for this
class.

## Hand-edit procedure (user)

User performed the edit directly on `data/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/translated/page_022.json`
at 2026-05-11. Verified by Claude via:

```python
import json
ents = json.load(open('translated/page_022.json'))
assert 'Activities' not in ents[2]['rows'][1][1]['en']
# en is now: '- Corporate and Legal Affairs\n- Management Strategy\n- System Strategy'
```

No other leaves modified.

## Next step

Re-dispatch Stage 6 audit (rerun #3) on full 40 pages, expecting
`overall_verdict = WARN` (no FAIL) and `safety_failed = False`. If clean,
Stage 6 closes. If a new FAIL appears, build another closure decision worksheet.

## Rule references

- **Rule A (>50% rewrite ⇒ semantic audit)**: Not triggered — this is a 1-word
  removal in a 26-word EN cell. No semantic audit required.
- **Rule B (failed attempts archived)**: Not applicable — this is a fix, not
  a failure. The detector FP class fixes from Stage B (D5/D7) are documented
  in code commit history (commits pending) + Session 11 log §7.
- **Rule D (writer/reviewer separation)**: Stage 6 LLM reviewer (writer) was
  Anthropic opus (D-077 §2.2); the hand-edit reviewer is user. User retro on
  the LLM-flagged FAIL satisfies the separation contract for this closure step.
