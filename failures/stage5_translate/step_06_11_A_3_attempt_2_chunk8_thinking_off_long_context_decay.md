# Step 6.11.A.3 attempt #2 — Stage 5 chunk=8 + thinking-disabled → 27% leaves UNTRANSLATED

> Per Rule B (失败归档不删). Stage 5 re-baseline regression caught by the
> page_020 diagnostic; resolved in attempt #3 by lowering `max-items-per-call`
> from 8 to 1.

## Attempt metadata

| Field | Value |
|---|---|
| Date | 2026-05-12 ~10:30 +09:00 |
| Session | 13 (Step 6.11.A.3, continuation after attempt #1 fix) |
| Background task ID | `bvhcsdsgn` |
| Run id | `dry_run_2026-05-12T09-48-06_polish_a` |
| Stage | Stage 5 `translate-entities` (Sonnet 4.6, claude-agent-sdk 0.1.74, thinking={"type":"disabled"}, max_items_per_call=8) |
| Wall time | 577 s |

## Input

- Structured: same 40-page copy
- Glossary: 63 entries from Stage 4.5 attempt #2 (thinking-disabled fix applied)
- Engine: `Stage5Translate` with `TranslationEngine(max_items_per_call=8)` default

## Output

- `translated/page_*.json`: 40 files emitted, but **206 UNTRANSLATED occurrences** across them (vs 0 in v1 baseline)
- `cost.json` Stage 5 lane: `{tokens: 21236, usd: 2.7786846, calls: 46}` → $2.78 shadow / $0 billed via max-plan OAuth
- `Stage5Result`: `pages_processed=40, fields_translated=279, fail_count=103, llm_calls=46`

## Technical verdict

The 103 engine-level failures break down as either:

- `"missing zh/en: {item!r}"` — LLM returned an item dict but `zh` or `en` was empty/non-string
- `"model returned short batch"` — LLM returned fewer items than the chunk size

Diagnostic on page_020 (3 figure entities, 3 unresolved leaves) with **chunk=1** produced 3/3 clean translations:

```
call 1: jp='CBTの画面例'                     → zh='CBT的界面示例'                en='Example CBT Screen'
call 2: jp='「後で見直すためにチェックする」機能を活用しよう！' → zh='善用「标记以便稍后复习」功能！'  en="Make good use of the 'Check to Review Later' feature!"
call 3: jp='事前に体験しておこう！'             → zh='提前体验一下吧！'             en="Let's try it out in advance!"
```

Same model, same prompt, same Stage 5 builder, same SDK build, same thinking-disabled setting — only the chunk size differs. Conclusion: **chunk=8 + thinking-disabled triggers long-context instruction-following decay** on Sonnet 4.6. The model occasionally returns shorter batches or items with empty zh/en when asked to handle 8 leaves at once without extended reasoning.

This is consistent with project memory `feedback_long_context_batch_size.md` (LLM long-context decay → cap batch size from day 1) — the v1 baseline (Session 09b post Plan-B) achieved 0 UNTRANSLATED with chunk=8 only because adaptive thinking was implicitly compensating; with thinking disabled by the attempt #1 patch, the chunk size needs to drop to keep quality.

## Business verdict

- **Severity**: medium-high. Affects Step 6.11.A.3 acceptance — 206 UNTRANSLATED leaves would trigger massive D2 (untranslated_residue) FAIL on Stage 6, making D-080 §2.3 acceptance unverifiable.
- **Cost lost**: $2.78 shadow on max-plan OAuth ($0 billed); 577 s wall time.
- **Pollution**: contained to the new copy run dir; v1 baseline at `dry_run_2026-05-06T16-58-10/` untouched per A.3 plan §3-b.

## Fix (attempt #3)

Re-dispatch Stage 5 with `--max-items-per-call 1`. Expected:

- ~382 LLM calls (1 per unresolved leaf, since glossary_hits=123 of 405 total stay glossary-locked)
- ~$1-2 shadow / $0 billed
- ~60 min wall time (≈ 10 s/call subprocess overhead × 382 / parallelism factor)
- 0 UNTRANSLATED leaves expected (per page_020 diagnostic evidence)

Pre-step: delete `translated/` and `cost.json` from the failed run dir to reset Stage 5's lane (otherwise default `skip_existing=True` would treat the partial output as done).

## Decision artifact (no new D)

- chunk-size choice is a tunable parameter, not an architectural decision.
- Update `feedback_long_context_batch_size.md` not needed — memory already captures the principle; this incident is a concrete example.
- Long-term consideration: when thinking is enabled per-call for stages that benefit, chunk=8 may regain feasibility. For now, chunk=1 is the safe Stage 5 default while thinking is globally disabled.

## Next attempt input

```
rm -r data/.../dry_run_2026-05-12T09-48-06_polish_a/translated
# (cost.json reset is optional — would re-zero Stage 5 lane; leaving in place
#  to preserve the diagnostic cost history)
uv run cert-extractor translate-entities \
    --structured-dir .../structured \
    --glossary-path  .../glossary/glossary.json \
    --tier sonnet \
    --max-items-per-call 1 \
    --confirm
```
