# D-076 — Stage 4 MUST parse the answer line; unknown answer is `-1`, never `0`

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 09b, 2026-05-07) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019; user retro caught the bug — see `docs/discussion/2026-05-07-stage5-user-retro-worksheet.md` §B + `evidence/.../page_043_translation_review_2026-05-07.md`) |
| **Source** | Plan-B fix execution; verified ground truth at `vision_full/page_*.md` answer lines |
| **Related** | D-008 (pipeline stage 4), D-056 (Discriminated Union — Question schema), D-058 (envelope export), D-061 (Stage 6 reviewer), D-063 (audit failure handling), D-073 Stage A→B, 规则 D |

---

## 1. Context

`schema.entities.Question.answer_index: int` is the ONE field on Question
entities that determines whether a learner sees the right or wrong
answer. Stage 4's job is to extract it from page-level OCR markdown.

The original Stage 4 prompt instructed:

> answer_index (0-based integer of the correct choice; **use 0 if the page does not state the answer**)

This silent-default-to-0 design caused all 5 questions on page_043 to
be emitted with `answer_index = 0`. User retro cross-checked against
`vision_full/page_043.md`'s answer line:

```
問題1-5 ウ　　問題1-6 ウ　　問題1-7 ウ　　問題1-8 エ　　問題1-9 ウ
```

Expected `answer_index` for the 5 questions = `[2, 2, 2, 3, 2]`.
Stage 4 emitted `[0, 0, 0, 0, 0]`. Stage 5 (translation only) carried
the wrong indices forward. The Stage 5 PASS verdict was thereby
**unsafe for learner-facing data** — the question entities pointed
to the wrong correct answer.

Pre-fix scope across the dry-run (10 question entities total):
- page_042 (4 questions): `[0, 1, 1, 3]` — **all correct by coincidence**
  (the LLM happened to pick the right indices, but unverifiable)
- page_043 (5 questions): `[0, 0, 0, 0, 0]` — **all wrong** (silent default)
- page_044 (1 question): `[1]` — correct (LLM read inline `> 問題1-10 イ`)

### Why "default 0" was structurally wrong

`0` is itself a valid answer index (= ア). A wrong-by-default value
that's indistinguishable from a correct value cannot be filtered or
flagged downstream. Stage 7 export, the envelope validator, and the
Phase 2 question bank all consume `answer_index` as authoritative.
There was no way to detect "Stage 4 didn't actually parse the answer".

## 2. Decision

Two interlocking changes:

### 2.1 Schema: `answer_index` accepts `-1` as the unknown sentinel

`packages/extractor/src/cert_extractor/schema/entities.py` —
`Question.answer_index` constraint relaxed from `ge=0` to `ge=-1`.
The `-1` value means **Stage 4 could not determine the correct answer
for this question**. Concrete answers remain `>= 0`.

### 2.2 Prompt: Stage 4 MUST parse the answer line, MUST emit -1 on failure

`packages/extractor/src/cert_extractor/pipeline/stage4_structure.py` —
the `STRUCTURE_SYSTEM_PROMPT` for `question` entities now requires:

```
- answer_index (0-based integer of the correct choice)
    - REQUIRED: Look at the bottom of the page for an answer line
      such as "問題1-5 ウ" or "問題1-5 ウ　問題1-6 エ". This is the
      authoritative source of the correct answer. Map markers to
      indices: ア=0, イ=1, ウ=2, エ=3 (and オ=4, カ=5, ... if more
      choices exist).
    - If a question is identified by its problem number (e.g. "問題
      1-5"), find that exact problem number in the answer line and
      use ITS letter, not the first one you see.
    - If, AFTER carefully scanning the entire page including its
      footer, you cannot find an unambiguous answer for a question,
      set answer_index to -1 (the unknown sentinel). Do NOT default
      to 0. Stage 7 export refuses -1 entries; setting -1 forces
      downstream repair instead of silently shipping a wrong answer.
```

The Python coercion path (`items_to_entities`) defaults
`answer_index` to **-1** when the LLM omits the field entirely
(was `0` previously).

### 2.3 Envelope: refuse `-1` at Stage 7 export

`packages/extractor/src/cert_extractor/schema/envelope.py` adds
`Envelope.no_unknown_question_answer` model_validator: any Question
entity with `answer_index == -1` triggers `ValidationError` at export
time. Stage 7 cannot ship a question whose answer was never determined.

### 2.4 Source-data dependency: Stage 4 needs full OCR

Stage 4 reads `cleaned/page_NNN.md` (Stage 3 hard re-OCR fallback) if
present, else `ocr/page_NNN.md` (Mistral baseline). For the answer-line
parsing requirement to succeed, the OCR output must contain the answer
line. Mistral OCR is observed to silently drop multi-column answer
lines (e.g. `問題1-5 ウ　1-6 ウ　…`) on dense layout pages — page_043
in this dry-run.

For pages where Mistral drops the answer line, Stage 3 hard re-OCR via
Claude Vision must be run (or `vision_full/page_NNN.md` must be promoted
to `cleaned/page_NNN.md` if a parallel engine-compare run exists).
Plan-B fixed page_043 by promoting `vision_full/page_043.md` →
`cleaned/page_043.md` before re-running Stage 4.

**Open follow-up (Phase-2 enhancement, not blocking D-076)**: the
Stage 3 trigger heuristic (`pipeline/quality.py`) currently catches
OCR degeneracy patterns (8-char repetition windows) but does NOT
catch "answer line absent" on question pages. A new heuristic should
fire when a `LabeledPage` matches the question label and the OCR
text lacks an answer line pattern. Filed at
`evidence/.../step_05_audit.md` as F-MISTRAL-ANSWER-LINE-LOSS.

## 3. Rejected alternatives

- **Keep the silent default to 0.** Made the wrong answer
  indistinguishable from a correct ア; failed silently for years until
  user retro caught it. Unacceptable.
- **Use `Optional[int]` with `None` for unknown.** Idiomatic Python
  but JSON serialization yields `null`, which is harder to grep for and
  doesn't compose with Pydantic's `int` constraint. `-1` is unambiguous
  in JSON and the constraint `ge=-1` keeps the field strictly typed.
- **Always re-run Stage 3 Vision on every question page.** Expensive
  and unnecessary — most question pages have answer lines in the
  Mistral OCR output. Use Stage 3 selectively when answer-line
  detection fails post-hoc.
- **Catch this at Stage 6 reviewer only, not Stage 4.** Stage 6 LLM
  judgement on "is this answer correct" is fuzzy; deterministic
  answer-line parsing at Stage 4 is the right architectural layer.
  Stage 6 still cross-checks but Stage 4 emits the structured value.

## 4. Consequences

### Positive

- 10 question entities across the dry-run now have correct
  `answer_index = [0,1,1,3,2,2,2,3,2,1]` matching ground truth at
  `vision_full/page_*.md` answer lines.
- Stage 7 export refuses to ship `answer_index = -1`. A wrong answer
  becomes a hard error rather than a silent ship.
- Full-book run (Step 6.11, ~579 pages × ~5 questions/page-with-questions
  = potentially ~50+ question entities) inherits the fix.
- Stage 6 reviewer (D-061, Session 10) gets `answer_index` as a
  reviewer-checkable property: cross-check page-level OCR's answer
  line against the structured value. User retro worksheet §D
  candidate #11 codified this as a FAIL-level reviewer check.

### Negative

- Stage 4 prompt is longer (~30 lines added to the question section).
  Minor token cost increase per call (~$0.003 / page).
- Stage 4 re-run was required to regenerate `structured/`; this
  cascaded to Stage 5 re-run because translated/ depends on structured/.
  ~$2.40 + ~$10 shadow extra spend for the Plan-B fix; $0 billed.
- A new failure mode: if Mistral OCR drops the answer line AND no
  Stage 3 cleaned/ override exists, Stage 4 emits -1 and the question
  is blocked at export. This is by design (loud > silent) but requires
  a downstream repair playbook for the full-book run.

### Open follow-ups

- F-MISTRAL-ANSWER-LINE-LOSS — extend Stage 3 heuristic to detect
  "question page without answer line" pattern, deferred to Phase-2.
- F-CHOICE-MARKER (separate from D-076) — Stage 6 reviewer flags WARN;
  Stage 7 export normalizes. Per user worksheet §B.4.3 / §E.

## 5. Verification

- `failures/stage4_structure/answer_index_bug_2026-05-07/structured/`
  archives the pre-fix 40-page output (10 question entities with
  wrong indices).
- `packages/extractor/tests/unit/test_pipeline_stage4_structure.py`:
  `test_items_to_entities_question_missing_answer_index_defaults_to_minus_one`,
  `test_items_to_entities_question_explicit_minus_one_preserved`,
  `test_stage4_prompt_includes_answer_line_parsing_clause` — all
  passing.
- `packages/extractor/tests/unit/test_schema_entities.py`:
  `test_question_accepts_minus_one_for_unknown_answer`,
  `test_question_rejects_below_minus_one` — passing.
- `packages/extractor/tests/unit/test_schema_envelope.py`:
  `TestUnknownAnswerIndexRejection.*` 4 tests — passing.
- Plan-B re-run cross-checked against ground truth answer lines in
  `vision_full/page_042.md`, `page_043.md`, `page_044.md`:
  10/10 question entities match expected `[0,1,1,3,2,2,2,3,2,1]`.
