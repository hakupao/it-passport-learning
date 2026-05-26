# D-074 — Stage 5 system prompt MUST include the "always translate the wrapper" clause

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 09, 2026-05-07) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019; user framing "(A)→(B)" — try prompt-tune, fall back to manual) |
| **Source** | `docs/discussion/2026-05-06-session-09.md` (TBD when written) + `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_05_audit.md` Stage B + 5 failure files at `failures/stage5_translate/stage5-2026-05-07-001..005.md` |
| **Related** | D-008 (pipeline stage 5), D-012 (kana_helper), D-019 (slow-pace), D-055 (UNTRANSLATED), D-061 (reviewer), D-069 (claude-agent-sdk), D-073 (Stage A→B launch) |

---

## 1. Context

Phase 1 dry-run Stage 5 (trilingual translation) shipped initially with
a system prompt that:

1. Embedded the locked Stage 4.5 glossary as a JSON lock-table
2. Instructed the model: "If any of these surfaces appears verbatim
   inside a string you are translating, render it EXACTLY as the
   locked translation"
3. Specified the input/output JSON contract

When run on the 40-page dry-run with opus chunk=8 (Session 09 attempt
001), 11 of 393 leaves came back as `<UNTRANSLATED>`. The failure
clustered on **2 of 32 content pages** (page_031 + page_038). Halving
chunk size to 4 (attempt 002) reduced failures to 8. Going to chunk=1
(attempt 003 with opus) further reduced to 1. Switching tier to sonnet
at chunk=1 (attempt 004) regressed back to 2.

The persistently failing leaves had a clear common property: they were
**wrapper definitions** of glossary-locked terms. Examples:

| Failed jp leaf | Glossary key it referenced |
|---|---|
| 業務を専門的な機能に分けて…「機能別組織」と呼ぶ場合もある。 | 職能別組織 (near-synonym in 「」 quotes) |
| 事業部を単位として構成する組織…職能別組織の1つ上に「事業部」… | 職能別組織 (verbatim glossary key inside body) |

The model (both opus and sonnet) intermittently returned an empty
response or fewer items than requested when an input string both:
(a) was *itself* the wrapper definition of a glossary-locked term
elsewhere in the page, and
(b) contained that locked surface (or a near-synonym) prominently
inside the body, often inside `「」` quotation marks.

Hypothesis: the original prompt's glossary clause says "render locked
surfaces verbatim" but is silent on **whether the wrapping string must
still be translated at all**. The model resolves this ambiguity by
sometimes returning *only* the locked translation and skipping the
wrapper, then the parser drops the malformed item.

## 2. Decision

The Stage 5 system prompt MUST include a clause explicitly instructing
the model to always return a complete trilingual rendering of the
input, with the glossary lock applying only to **how** locked surfaces
are rendered inside the output, not to whether the input is translated
at all.

The clause as locked into `TRANSLATE_SYSTEM_PROMPT_TEMPLATE`:

> **ALWAYS return a complete trilingual rendering for every input.**
> The glossary lock above tells you HOW to render locked surfaces
> within your output, NOT whether to translate. If an input string
> contains a locked surface as a substring (or a near-synonym of one),
> translate the rest of the string normally in zh + en and substitute
> the locked translation only for the locked substring itself. NEVER
> return an empty `zh` or `en`, and NEVER omit an item from the output
> array, just because a glossary surface appears in the input. The
> wrapper definition / sentence is itself the translation target.

A unit test
(`test_engine_system_prompt_includes_always_translate_clause` in
`packages/extractor/tests/unit/test_pipeline_stage5_translate.py`)
asserts the clause is present, regression-guarding the prompt against
accidental removal.

## 3. Rejected alternatives

- **Smaller chunk size only.** Halving chunk from 8 → 4 only reduced
  failures by 27% (11 → 8), and chunk=1 still left 1-2 stuck under the
  old prompt. Chunk size affects truncation tail behavior; it does not
  fix the prompt-ambiguity-driven refusal pattern.
- **Different model only.** Sonnet (attempt 004) was *worse* than opus
  (attempt 003) on the same content + old prompt. Model selection
  alone cannot remove the failure mode.
- **Hand-write the 11 stuck leaves.** Considered as fallback (B) per
  user's "(A)→(B)" plan. Avoided by attempt 006 success. Hand-write
  would have left the underlying prompt bug latent for the full-book
  run (579 pages → likely 100+ similar wrapper-definition cases).
- **Drop or simplify the glossary clause.** Would weaken Stage 5
  glossary adherence (D-008 requirement: "glossary 锁定 在翻译前!").
  The wrapper clause adds clarification without removing the lock.

## 4. Consequences

### Positive

- **Stage 5 dry-run reaches 393/393 leaves translated, 0 failures**
  with opus + the new clause + chunk=1 (attempt 006). Phase 1 dry-run
  is unblocked.
- The fix is permanent in source — every future Stage 5 run inherits
  the corrected prompt automatically.
- Unit test guards against regression.
- Full-book run (Step 6.11, 579 pages, ~10× the wrapper-definition
  cases) gets the fix for free.

### Negative

- The clause adds ~140 tokens to the system prompt (cached input,
  marginal cost). Acceptable.
- The fix is empirically validated on opus only (attempt 006); sonnet
  attempts 004 + 005 still failed even with the clause. Future runs
  on sonnet may need additional prompt work or a tier override on
  pages with wrapper-definition density.
- The 30 pages translated under the **old prompt** during Session 09
  Stage B attempt 001 are not re-translated. Their output is good per
  audit (5-page sample, 4 PASS + 1 cosmetic WARN). However, provenance
  for the run is now mixed: 30 pages used old prompt; 1 page (031) used
  old prompt + chunk=1; 1 page (038) used new prompt + chunk=1. This
  is documented in evidence and accepted for Phase 1 dry-run; the
  full-book run (Step 6.11) will use the new prompt across all pages.

### Open follow-ups (not blocking this decision)

- Stage 6 audit (D-061 reviewer LLM) will revisit translation quality
  on the full output and may surface additional prompt-tune candidates.
- The choice-marker rendering inconsistency on page_043 (Session 09
  Stage B audit finding F-CHOICE-MARKER) is a separate prompt-tune
  candidate, not addressed by D-074. Filed for Phase-2 enhancement
  or Stage 7 export-time normalization.

## 5. Verification

- `evidence/itpassport_r6/runs/dry_run_2026-05-06T16-58-10/step_05_audit.md`
  Stage B section: 393/393 leaves clean post-attempt-006.
- `failures/stage5_translate/stage5-2026-05-07-001..005.md`: full
  attempt-by-attempt evidence trail leading to this decision.
- `packages/extractor/tests/unit/test_pipeline_stage5_translate.py::test_engine_system_prompt_includes_always_translate_clause`: passing regression guard.
