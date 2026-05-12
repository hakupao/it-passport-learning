# Step 6.11.A.3 attempt #1 — Stage 4.5 LLM response swallowed by adaptive thinking (claude-agent-sdk 0.1.74)

> Per Rule B (失败归档不删). Failed attempt of D-080 §2.3 re-baseline polish
> validation. Resolved in attempt #2 by patching `ClaudeClient._build_options`
> to disable extended thinking by default.

## Attempt metadata

| Field | Value |
|---|---|
| Date | 2026-05-12 09:48 +09:00 |
| Session | 13 (Step 6.11.A.3, first LLM gate after D-079/080/081 lock) |
| Background task ID | `bxqi0ssf1` |
| Run id | `dry_run_2026-05-12T09-48-06_polish_a` |
| Stage attempted | Stage 4.5 `extract-glossary` (Sonnet 4.6 via claude-agent-sdk 0.1.74) |
| Wall time | 466 s (vs ~30-60 s historical baseline) |

## Input

- Structured inputs: copy of `dry_run_2026-05-06T16-58-10/structured/` (40 pages, 68 unique katakana+kanji surfaces, 99 raw harvests)
- Stage 4.5 builder: post D-080 polish (split_multi_concept + scan_katakana_terms_for_backfill)
- LLM client: `ClaudeClient(default_tier="sonnet")` → `claude-agent-sdk.query` with `max_turns=1`
- Prompt: existing `GLOSSARY_SYSTEM_PROMPT` (unchanged from pre-D-080 baseline) + 68-term list

## Output

- `glossary.json`: 0 entries (file size 184 bytes — header only)
- `cost.json`: `anthropic_tokens_input: 5`, `anthropic_tokens_output: 35 871`, `anthropic_usd: 0.7689135` (shadow / $0 billed via max-plan OAuth)
- `Stage4_5Result`: `entries_locked=0, fail_count=0, terms_harvested=99, unique_surfaces=68`
- No `skipped` items recorded → all skipped items would have rolled up into `failures` list, but `failures` was empty too

## Technical verdict

The `parse_glossary_response()` function returned `[]` because `response.text` was empty. The empty `response.text` is because:

1. claude-agent-sdk **0.1.74** defaults `ClaudeAgentOptions.thinking` to `{"type": "adaptive"}` on models that support extended thinking (Sonnet 4.6+ and Opus 4.6+) — per SDK `types.py` line 1827.
2. The default thinking `display` is `"omitted"` on Opus 4.7+ (per SDK comment line 1528-1529); empirically observed the same effect on Sonnet 4.6 in this dispatch — the model spends output tokens in **omitted (signature-only)** thinking blocks, not in user-visible TextBlocks.
3. Our `_run_query()` in `packages/extractor/src/cert_extractor/llm/claude_client.py` only iterates `TextBlock` content of `AssistantMessage`; `ThinkingBlock` content (when not omitted) and the missing-text case (when omitted) both produce empty `response.text`.

Therefore: `response.text == ""` → `parse_glossary_response("")` returns `[]` → `items_to_entries([])` returns `([], [])` → `entries_locked=0` with no skipped items to surface as failures.

## Business verdict

- **Severity**: high. Caused by an SDK behavior change since the last successful Stage 4.5 dispatch (2026-05-07 Session 09b at SDK version <0.1.74 OR pre-default-adaptive-thinking). Affects all stages that go through `ClaudeClient`: Stage 2, 4, 4.5, 5, 6 Phase 2. Every prior dispatch on the 2026-05-12 SDK build silently degrades to empty.
- **Cost lost**: $0.77 shadow (≈ 35 871 wasted output tokens) on max-plan OAuth (= $0 actually billed). 466 s wall-time wasted.
- **Pollution**: no — the failed attempt only wrote `glossary.json` (empty header) and `cost.json` (1 call recorded) to a fresh copy directory; the v1 baseline (`dry_run_2026-05-06T16-58-10`) was preserved per A.3 plan §3-b.

## Fix (attempt #2)

Patch `ClaudeClient._build_options()` to set `thinking={"type": "disabled"}` unconditionally. All cert-extractor stages are structural tasks (glossary harvest, translation, audit detector verdicts) — no extended reasoning required. Re-enabling per call site is a future opt-in.

Test: `test_build_options_disables_thinking_by_default` (asserts `opts.thinking == {"type": "disabled"}`).

Unit suite: 441 → 442 (+1) pass.

Commit: pending (will be batched into the 6.11.A.1+A.2+A.3 atomic commit at session close).

## Next attempt input

Same `extract-glossary` invocation as attempt #1, but with the patched client. Pre-step: delete the empty `glossary.json` + `cost.json` from the failed run dir so `Stage4_5Glossary.run(skip_existing=True)` doesn't short-circuit. Then re-dispatch.

## Decision artifact (no new D)

- This is a SDK-behavior workaround, not an architectural decision; no new D-NNN needed.
- Documented inline in `_build_options` docstring + the failure archive (this file).
- If future stages benefit from thinking, expose a per-call `thinking` parameter at the `ClaudeClient.call()` level. Out of scope until a stage's quality demands it.
