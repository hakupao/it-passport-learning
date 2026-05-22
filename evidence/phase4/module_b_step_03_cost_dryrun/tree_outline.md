# Phase 4 Module B Step B.3 — tree outline

> B.3 cost dry-run executed against locked tutor brain matrix (D-104) on
> BOTH DeepSeek V4 pro default + Anthropic Sonnet 4.6 toggle. Mid-session
> SYSTEM_INSTRUCTION bulked (LD-Module-B-13) + `readCacheUsage` reader
> fixed (LD-Module-B-14). Real Anthropic + DeepSeek API calls fired.

## NEW files

```
apps/web/src/lib/ai/__tests__/tutor-cost-dryrun.test.ts                          (~340 lines)
  Opt-in vitest harness (RUN_TUTOR_DRYRUN=1):
  - .env.local loader for DEEPSEEK_API_KEY + ANTHROPIC_API_KEY
  - 10 mock chapter fixtures + 5 progress-state scenarios
  - 3-turn Japanese tutor conversation per scenario
  - Per-call telemetry: input/output tokens + cache hit/miss + latency
  - Per-call incremental persist to results-{provider}.json (timeout-safe)
  - Per-turn breakdown aggregation + Phase 4 projection
  - Provider-aware pricing (V4 pro discounted + Sonnet 4.6)
  - Final summary console block

evidence/phase4/module_b_step_03_cost_dryrun/
  ├── results-deepseek.json     (v3 post-bulk: 70.2% agg hit, $0.014 run cost)
  ├── results-anthropic.json    (v4 post-fix: 72% cache_read of input, $0.10 corrected)
  ├── summary.md                 (comprehensive comparison + cost methodology + findings)
  ├── tree_outline.md            (THIS FILE)
  ├── design_notes.md            (LD-Module-B-13 + LD-Module-B-14 + cache mechanism)
  ├── build_log.txt              (next build green output)
  └── test_results.txt           (vitest 416 passed / 2 skipped)
```

## MOD files (Session 56)

```
apps/web/src/lib/ai/tutorPrompt.ts
  - TUTOR_SYSTEM_INSTRUCTION bulked from ~150 → ~1278 tokens (LD-Module-B-13)
  - Added curriculum framework + pedagogical style + citation conventions +
    anti-hallucination guards + reply style sections
  - Docstring updated to document LD-Module-B-13 supersede of LD-Module-B-6

apps/web/src/lib/ai/provider.ts
  - readCacheUsage now reads Anthropic cache_read_input_tokens from nested
    providerMetadata.anthropic.usage path (snake_case) as fallback when
    top-level cacheReadInputTokens absent (LD-Module-B-14)
  - Affects Phase 2 chat / quiz/explain / glossary/hover / hello-ai routes
    too (they consume readCacheUsage for β-tripwire telemetry) — fix is
    additive + backward-compatible

apps/web/src/lib/ai/__tests__/tutorPrompt.test.ts
  - Replaced brittle toMatchInlineSnapshot with length-threshold + key-phrase
    assertions (LD-Module-B-13 byte-stability + ≥1024 token invariant)
  - +7 new cases: curriculum syllabus areas (ストラテジ/マネジメント/テクノロジ
    系) / IPA mention / pedagogical 3-step pattern / citation conventions /
    anti-hallucination / chapter nn format

apps/web/src/lib/ai/__tests__/provider.test.ts
  - +4 cases for readCacheUsage nested-usage fallback path (LD-Module-B-14)
  - Covers: top-level + nested both present (top wins) / top absent + nested
    present (fallback) / both absent (null safe) / numerical typing
```

## Bundle invariants vs Session 55 close

| Surface | Session 55 close | Session 56 close (B.2 v2 + B.3) | Δ |
|---|---|---|---|
| Middleware | 44.2 kB | 44.2 kB | **UNCHANGED** |
| Shared First Load JS | 102 kB | 102 kB | **UNCHANGED** |
| `/[locale]/chat` First Load | 169 kB | 169 kB | **UNCHANGED** ← Phase 2 D-085 §2.4 invariant preserved through Module B revision |
| `/[locale]/quiz` | 1.57 kB / 120 kB | 1.57 kB / 120 kB | **UNCHANGED** |
| `/[locale]/book` | 1.38 kB / 121 kB | 1.38 kB / 121 kB | **UNCHANGED** |
| `/[locale]/book/chapter/[nn]` | 5.13 kB / 181 kB | 5.13 kB / 181 kB | **UNCHANGED** |

`tutorPrompt.ts` SYSTEM bulk + provider.ts reader fix are server-side only
(no client bundle delta). Phase 1+2+3 frozen surfaces all preserved.

## Test count delta

- Pre-B.3 (Session 55 close): 390 vitest passed
- Post-B.3 (Session 56 close): **416 passed + 2 skipped (opt-in dry-run)**
- Delta: +26 test additions across provider.test.ts + tutorPrompt.test.ts

## Cost ledger (Phase 4 cumulative)

- v1 timeout abort: ~25 partial calls × ~700 tokens × $0.435/M = ~$0.024 (one-off; not persisted JSON)
- v2 attempt: ~30 calls × ~$0.005 each ≈ $0.15 (no cache, no fix yet) — anthropic 0% hit ratio so all input at miss rate
- v3 DeepSeek post-bulk: $0.014 (clean numbers, 70% agg hit)
- v4 Anthropic post-fix: ~$0.10 (corrected; 72% cache_read of input)
- **Total Phase 4 B.3 spend: ~\$0.30-0.35 真**

vs D-103 \$15 Phase 4 cap = **42-50× headroom remaining**.
