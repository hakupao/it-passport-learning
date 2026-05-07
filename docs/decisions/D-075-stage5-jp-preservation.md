# D-075 — Stage 5 MUST preserve the input `jp` surface verbatim

| 字段 | 值 |
|---|---|
| **Status** | Locked (Session 09b, 2026-05-07) |
| **Decision Maker** | Claude (per "你来定" 委托, D-019; user retro caught the bug — see `docs/discussion/2026-05-07-stage5-user-retro-worksheet.md` §A/B/C) |
| **Source** | Plan-B fix execution; verified diff at `failures/stage5_translate/jp_mutation_bug_2026-05-07/` |
| **Related** | D-008 (pipeline stage 5), D-055 (UNTRANSLATED), D-074 (Stage 5 prompt wrapper-clause), D-073 Stage A→B, 规则 D writer/reviewer 隔离 |

---

## 1. Context

Stage 5's contract per D-008 is: read each `Trilingual` leaf, leave the
`jp` field untouched, fill `zh` and `en` (replacing the `<UNTRANSLATED>`
sentinel). Every downstream consumer (Stage 6 audit, Stage 7 export,
Phase 3 frontend) assumes `jp` is the source-of-truth string the
learner sees as "the original Japanese".

User retro on Session 09's Stage B output exposed a class of `jp` field
mutations:

| Source `jp` (structured/) | Translated `jp` (translated/) | Pages affected |
|---|---|---|
| `CSR` | `CSR（企業の社会的責任）` | page_034, page_044 |
| `CSR（Corporate Social Responsibility：企業の社会的責任）` | `CSR（企業の社会的責任）` | page_033 |
| `ダイバーシティ（多様性）` | `ダイバーシティ` | page_033 (×2) |
| `HRTech` | `HRテック` | page_045 |
| `HRテック（HRTech）` | `HRテック` | page_036 |
| `CIO` | `CIO（最高情報責任者）` | page_045 |
| `CEO` | `CEO（最高経営責任者）` | page_045 |
| `プレーンストーミング` | `ブレーンストーミング` | page_050 (alias-merged OCR typo) |

10 leaves on 7 pages — all `Term.surface` fields whose `jp` matched a
glossary key OR a glossary `aliases_jp` entry. Mid-string substitutions
(definitions, stems, captions) were NOT affected.

### Root cause

`packages/extractor/src/cert_extractor/pipeline/stage5_translate.py`
contained:

```python
def _glossary_lookup(jp: str, lookup: dict[str, GlossaryEntry]) -> Trilingual | None:
    entry = lookup.get(jp)
    if entry is None:
        return None
    return entry.surface  # ← BUG
```

The glossary's `entry.surface` is the *canonical* `Trilingual` for that
locked term — its `jp` field carries the canonical written form, which
differs from the input `jp` whenever the input matched via an alias
(e.g. `CSR` is an alias for the canonical `CSR（企業の社会的責任）`),
or when the alias was an OCR typo (`プレーンストーミング` → canonical
`ブレーンストーミング`). The runner's caller wrote that returned
`Trilingual` back to the entity, replacing the source `jp`.

The LLM-batch path (`Trilingual(jp=req.jp, zh=zh, en=en)`) correctly
preserved input `jp`. The bug was isolated to the glossary-hit path.

## 2. Decision

`pipeline/stage5_translate.py::_glossary_lookup` MUST construct a
`Trilingual` that uses the input `jp` verbatim and only the glossary
entry's locked `zh` and `en`:

```python
def _glossary_lookup(jp: str, lookup: dict[str, GlossaryEntry]) -> Trilingual | None:
    entry = lookup.get(jp)
    if entry is None:
        return None
    return Trilingual(jp=jp, zh=entry.surface.jp, en=entry.surface.en)
```

(actual implementation uses `entry.surface.zh` / `entry.surface.en`
for the locked translations; the example above shows the contract.)

A unit test
(`test_glossary_hit_preserves_input_jp_when_alias_differs_from_canonical`
in `packages/extractor/tests/unit/test_pipeline_stage5_translate.py`)
regression-guards the contract: it constructs a glossary entry with
canonical `jp = "CSR（企業の社会的責任）"` + alias `CSR`, looks up the
alias, and asserts the resolved `jp` is `"CSR"` (the input) — not the
canonical form.

## 3. Rejected alternatives

- **Use canonical `jp` everywhere** — would require Stage 4 to
  also normalize Term surfaces to canonical form, breaking the
  source-faithfulness contract (D-008: jp is "as written on the page").
- **Drop alias support in glossary** — would cause the same OCR-typo
  recovery (`プレーンストーミング` → `ブレーンストーミング`) to fail,
  leaving page_050 with an untranslated typo'd surface forever.
- **Validate post-translate that jp matches structured/ jp** — defensive,
  but doesn't prevent the bug; the `_glossary_lookup` fix is upstream.

## 4. Consequences

### Positive

- 10 leaves on 7 pages no longer have mutated `jp`. Source faithfulness
  restored across the dry-run output.
- Full-book run (Step 6.11) inherits the fix without further work;
  scales to ~120 estimated glossary-hit leaves over 579 pages.
- The unit test pins the contract; future engine refactors can't
  silently regress.
- Stage 6 reviewer LLM (D-061, designed in Session 10) gets a clean
  property to check: `translated.jp == structured.jp` for every
  Trilingual leaf. User retro worksheet §D candidate #12 codified this
  as a FAIL-level reviewer check.

### Negative

- Existing Session 08 + 09a translated/ output is invalid (10 mutated
  leaves). This ADR is the rationale for the Plan-B re-run that
  regenerates 32 content pages of translated/ data.
- Glossary canonical surfaces (e.g. `CSR（企業の社会的責任）`) are now
  *only* applied as zh + en lock-table content; the jp side is never
  rewritten by Stage 5. If a Phase 3+ consumer needs canonical jp it
  must look it up in glossary.json directly.

## 5. Verification

- `failures/stage5_translate/jp_mutation_bug_2026-05-07/translated/`
  archives the pre-fix 40-page output for diff-evidence.
- `packages/extractor/tests/unit/test_pipeline_stage5_translate.py::test_glossary_hit_preserves_input_jp_when_alias_differs_from_canonical`
  passing.
- Plan-B re-run output verified: 0 leaves where
  `translated[k].jp != structured[k].jp` across all 32 content pages.
