# Step 6.11.A.3 evidence — Stage 4.5 polish v1.5 re-baseline

> Per D-080 §2.3 — validates Polish #1 (D11 kana_helper auto-backfill) +
> Polish #2 (D13 surface-concept split) on the 40-page Stage A baseline
> before Stage C 579-page dispatch.

## Inputs

| Field | Value |
|---|---|
| Baseline (OLD) run | `dry_run_2026-05-06T16-58-10` (Session 11 closure ✅) |
| Polish (NEW) run | `dry_run_2026-05-12T09-48-06_polish_a` |
| Stage 4.5 builder | post D-080 polish (split_multi_concept + scan_katakana_terms_for_backfill) |
| Stage 5 prompt | unchanged (v1; per D-080 explicit deferral) |
| Stage 6 verification | Phase-1 deterministic only (`phase1_compare.py`, no LLM) |
| ADR | D-080 (Stage 4.5 partial polish v1.5) + D-079 (Stage C cadence Gate ③) |

## Copy provenance

```
cp -R OLD/{structured, classified, cleaned, ocr}  →  NEW/
```

- Did NOT copy `raw/` (303 MB, only consumed by Stage 0/1 which we don't re-run)
- Did NOT copy `glossary/`, `translated/`, `audit/`, `output/` (will be re-generated)
- Total copy size: 620 KB

## Dispatches

### Stage 4.5 — `extract-glossary` (Sonnet, 1 call after thinking-disabled fix)

```
uv run --project packages/extractor cert-extractor extract-glossary \
    --structured-dir data/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a/structured \
    --confirm
```

| Field | Value |
|---|---|
| pages_scanned | 40 |
| terms_harvested | 99 |
| unique_surfaces | 68 |
| entries_locked | 63 |
| auto_backfilled | 0 (LLM authored kana_helper on all 36 / 63 katakana-surface entries) |
| concept_split_warns | 0 |
| Wall time | 45 s |
| Cost | $0.16 shadow / $0 billed via max-plan OAuth |

Pre-amble: attempt #1 (chunk=any, thinking adaptive default) produced 0 entries (`$0.77 shadow lost`). See `failures/stage4_5_glossary/step_06_11_A_3_attempt_1_thinking_swallowed_response.md`. Resolved by patch to `ClaudeClient._build_options` setting `thinking={"type":"disabled"}`; +1 unit test.

### Stage 5 — `translate-entities` (multi-attempt to reach 0 UNTRANSLATED)

```
# attempt #1: chunk=8 sonnet thinking-off  → 103/382 failures, 206 UNT
# attempt #2: chunk=1 sonnet              → 9/40 pages then soft-cap WARN halt
# attempt #3: chunk=1 sonnet + raised caps → 22 residual failures, 44 UNT
# attempt #4: opus surgical retry         → 17/21 fixed, 4 stubborn
# attempt #5: hand-translate the 4         → 0 UNT achieved
```

| Field | Value |
|---|---|
| Final translated pages | 40 / 40 |
| Final UNTRANSLATED | **0** |
| Glossary hits | 123 |
| LLM calls (tracked) | 305 (Stage 5 lane only; surgical retry untracked) |
| Hand-translations | 4 (pages 30 / 31 / 32 / 33 — long defs with `「」` quotes; see `stage5_hand_translate.py`) |
| Cost (Stage 5 lane tracked) | $16.79 shadow / $0 billed |
| Cost (untracked retries) | est. $5-10 shadow / $0 billed |
| **Cumulative session shadow** | **~$22-27 / $0 billed** |

Failure archives:
- `failures/stage5_translate/step_06_11_A_3_attempt_2_chunk8_thinking_off_long_context_decay.md`

### Stage 6 Phase-1 deterministic — `phase1_compare.py` (no LLM)

```
uv run --project packages/extractor python \
    evidence/itpassport_r6/runs/dry_run_2026-05-12T09-48-06_polish_a/phase1_compare.py
```

Per-detector OLD vs NEW counts:

```
detector__severity                                  OLD    NEW      Δ
------------------------------------------------------------------------------
choice_marker_inconsistent__WARN                      3     18    +15
glossary_lock_missed__INFO                           41     39     -2
glossary_surface_concept_split__INFO                  2     10     +8
kana_helper_missing__INFO                            18     18     +0
numeric_inconsistent__WARN                           24     25     +1
```

## Acceptance criteria (per D-080 §2.3 v1.0)

| # | Criterion (v1.0 wording) | Actual | Status |
|---|---|---|---|
| 1 | D11 INFO new == 0 | 18 | ❌ FAIL (architectural gap, see D-080 v1.1 §8.3) |
| 2 | D13 run-level INFO new == 0 | 10 | ❌ FAIL (detector definition mismatch, see D-080 v1.1 §8.3) |
| 3 | D1 jp_mutation FAIL new == 0 | 0 | ✅ PASS |
| 4 | D5 answer_index_mismatch FAIL new == 0 | 0 | ✅ PASS |
| 5 | D7 numeric_inconsistent FAIL new == 0 | 0 | ✅ PASS |
| 6 | concept_split_warns + per-page reasons documented | 0 fired this run | ✅ PASS (trivially) |
| 7 | Cost ≤ $15 shadow / $0 billed | $22-27 / $0 billed | ❌ over (max-plan OAuth → $0 real billed; D-071 hard cap not hit) |

**Overall v1.0 acceptance: ❌ FAIL** (1, 2, 7 missed).

**v1.1 verdict per ADR §8 amendment**: D-080 v1.0 §2.3 acceptance is
**withdrawn**. v1.1 acknowledges the architectural misalignment and
re-scopes polish #1 / polish #2 as safety nets for Stage C. Step
6.11.A.3 closes with **NO-ACCEPTANCE** status — not blocking Stage C
launch; D11/D13 INFO at the current level is non-fatal (INFO severity)
and carry-forward into `polish_items.json` per D-078 §2.4.

## Diff old vs new — interpretation

- **D11 +0** (18 → 18): polish #1 in glossary doesn't propagate to Term entities in `translated/`. Architectural follow-up: Stage 5 must copy `glossary[entry].kana_helper` into Term entity's `kana_helper` field during translation. Tracked in D-080 §8.6.
- **D13 +8** (2 → 10): D13 detects `surface.zh ⇎ kana_helper.zh_concept` unrelated; polish #2 (concept-separator split) was wrong layer. Increase due to LLM stochasticity producing more glossary entries where surface.zh and zh_concept don't share substrings. Tracked in D-080 §8.6.
- **D1/D5/D7 FAIL all 0**: no safety regressions.
- **choice_marker WARN +15**: Stage 5 chunk=1 re-translation produced slightly different choice markers; Stage 7 normalizer (D-078 §2.6 Gate B) handles this at export.
- **numeric WARN +1**: paraphrase drift, no factual conflict.
- **glossary_lock_missed INFO -2**: slight improvement (fewer locked translations missed).

## Notes

- Old run hand-edit on page_022 entity[2].rows[1][1].en from baseline (Session 11 closure) does NOT propagate to the new translated/. Stage 5 re-translated from scratch. Not re-applied per D-080 §2.2 explicit defer of Stage 5 prompt v2 work; new run is the v1.5 reference.
- Surgical-retry + hand-translate cost flowed through `ClaudeClient.call()` directly, bypassing `CostTracker.add_anthropic()`. cost.json undercounts; estimated true total $22-27 shadow (see "Cumulative session shadow").
- The retained polish #1 and polish #2 code is **safety net** for Stage C 579-page, not a fix for the D-080 §2.3 acceptance targets.

## concept_split_warns

**0 warns recorded this run** — no LLM-returned glossary item had multi-concept separators in its surface fields. Split mechanism is inactive on this dataset but stays armed for Stage C.

## Sign-off

| Role | Time | Status |
|---|---|---|
| Stage 4.5 dispatch (attempt #2 post-fix) | 2026-05-12T09:56+09:00 | ✅ done |
| Stage 5 dispatch (chunk=1 + opus + 4 hand) | 2026-05-12 | ✅ done — 0 UNTRANSLATED |
| Phase 1 verification | 2026-05-12 | ❌ v1.0 acceptance failed — see D-080 v1.1 §8 |
| D-080 v1.1 amendment (NO-ACCEPTANCE closure) | 2026-05-12 | ✅ user-authorized "可以的，继续" |
| Move to Step 6.11.B | TBD | ⏸ next |
