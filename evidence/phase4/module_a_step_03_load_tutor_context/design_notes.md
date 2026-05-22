# Phase 4 Module A Step A.3 — design notes

> Per D-094 §2.1 in-source LD pattern: implementation details of locked
> D-102 §7.3 (Module A Data layer) NOT D-NNN-worthy individually.

## §1 D-102 + D-103 §-mapping

- D-102 §7.3 OQ-C 4-module decomposition: Module A Data / Profile layer (this step closes the Data layer)
- D-102 §7.5 PLAN.md cross-reference: row A.3 `loadTutorContext()` helper SSR-safe via StorageLike (Phase 3 LD-Step3-A pattern)
- D-103 unaffected (no LLM call in A.3 — localStorage read + pure projection)

## §2 PLAN.md row A.3 fulfilled

`loadTutorContext(storage, chapters, options?)` ships:

- Reads progressStore via `loadProgress(storage)` (Phase 3 helper, untouched)
- Composes A.1 projection helpers (`projectChapterStatuses` + `projectRecentQuiz`)
- Emits the `TutorContext` ready for Module B Step B.4 consumption
- SSR-safe via `StorageLike` (Phase 3 LD-Step3-A pattern) — callable from client `useEffect` (post-mount-gate per Phase 3 LD-Step3-D) OR from vitest with a memory stub

## §3 In-source LD-Module-A-3

| LD | Decision | Why |
|---|---|---|
| **LD-Module-A-3** | `loadTutorContext` is a pure I/O composer over A.1 helpers — no logic of its own | Splitting projection (A.1) from I/O (A.3) keeps A.1 vitest-able without storage stubs and keeps A.3 a thin assembly layer. Module B's tutor SYSTEM_INSTRUCTION authoring can read from either A.1 (with a synthetic TutorContext for snapshot tests) OR A.3 (with real progressStore for live integration). |
| **LD-Module-A-3b** | Storage failure → `emptyProgress()` cascade through to empty `TutorContext` (all chapters pending, no recentQuiz) | Mirrors Phase 3 LD-Step3-A first-launch posture. A user in private mode / with corrupted localStorage sees the tutor treat them as a brand-new learner — predictable graceful degradation. |
| **LD-Module-A-3c** | `LoadTutorContextOptions.recentQuizLimit` is optional, defaults to `DEFAULT_RECENT_QUIZ_LIMIT` (10) | Default is sufficient for tutor preamble; Module B can tighten the limit for cache-block size optimization if cumulative token count drifts. |
| **LD-Module-A-3d** | A.3 is in the **same file** as A.1 (`tutor/tutorContext.ts`), separated by section comment | Cohesive — A.3 is the canonical entrypoint for A.1's helpers; splitting into separate files would force consumers to import from two places. Phase 3 progressStore precedent: load/save/clear + state mutation helpers all in one file. |

## §4 Bundle Δ (A.3 contribution to module close)

Same as A.1 — `loadTutorContext` is not pulled into any client bundle yet (Module B Step B.4 /api/tutor is the first consumer, server-side only). 0 client-bundle delta.

## §5 γ tripwire row (A.3)

| Estimate | Actual | Δ |
|---|---|---|
| 60-120 min (midpoint 90 min) | ~15 min wall | **-83% under midpoint** |

A.3 was the smallest step — composer + 5 vitest cases. Phase 4 N=3:

| Step | Estimate midpoint | Actual | Δ |
|---|---|---|---|
| A.1 | 90 min | 25 min | -72% |
| A.2 | 90 min | 40 min | -56% |
| A.3 | 90 min | 15 min | -83% |
| **Mean A.1+A.2+A.3** | **90 min** | **~27 min** | **-70% under midpoint** |

This is BELOW Phase 3's -59% mean (Step 1 -71% / Step 2 -53% / Step 3 -37%). Possible explanations:

1. **Composition leverage from Phase 3 muscle memory was higher than expected** — even though Module A is the new-infra path's Data layer, the actual data layer is pure projection over the EXISTING progressStore (Phase 3 LD-Step3-A~H). So Module A behaves more like Phase 3 composition than Phase 1/2 greenfield.
2. **The PLAN.md estimates were generous** — 90-min midpoint for a ~50-line types file + 200-line test file is conservative.
3. **N=3 is too small** to draw a Phase 4 conclusion yet — Modules B/C/D are where new-infra work actually happens (Anthropic SDK + new endpoint + new UI surface + Vercel deploy). γ tripwire prediction midpoint × 1.0 may still hold at the Module level when those land.

**Implication**: PLAN.md Module A rows can be marked DONE with actual walls amended; no PLAN-level re-estimate of Modules B/C/D yet (wait for Module B N=4-7 datapoints).

## §6 Rule A/B/C/D disposition (A.3)

| Rule | Disposition |
|---|---|
| **A** 抽检 | n/a — A.3 is greenfield composer |
| **B** 失败归档 | 0 failures — composer + tests landed first try |
| **C** 阶段 retro | Phase 4 close — future commitment |
| **D** Writer ≠ Reviewer | Build-time reviewer chain fired at module close (this step) |

## §7 Anthropic cache audit (A.3)

n/a — A.3 has NO LLM call.

## §8 Module A close summary

| Item | Status |
|---|---|
| A.1 TutorContext types + projection helpers | ✅ DONE |
| A.2 persistQuizOutcome + QuizExplain self-report wire + i18n | ✅ DONE |
| A.3 loadTutorContext composer | ✅ DONE |
| vitest 366/366 PASS (+22 cases) | ✅ |
| tsc --noEmit clean | ✅ |
| eslint src clean | ✅ |
| next build 23 pages green; chat 169 kB unchanged | ✅ |
| 0 new ADR | ✅ (per D-094 §2.1 — LD-Module-A-1/2/3 are in-source patterns) |
| 0 global OQ change | ✅ (count remains 2: OQ-01 + OQ-02 Phase 1 carryover) |
| 0 Rule A 抽检 | ✅ (no compression / rewrite events) |
| 0 Rule B 失败 | ✅ (gates clean on first try) |
| Rule C deferred to Phase 4 close | ⏸ future per PLAN.md §1 row D.3 |
| Rule D reviewer chain | ✅ (vitest + tsc + eslint + next build fired) |
| Phase 1+2+3 freeze preservation | ✅ (3 tags immutable; chat 169 kB invariant preserved) |
| D-097 firewall middleware | ✅ untouched (44.2 kB) |
| D-099 next-intl chrome | ✅ untouched (3 keys added per locale = additive) |
| D-085 §2.4 QuizExplain frozen contract | ✅ honored (additive leaf UI, lifecycle unchanged) |
| LLM cost incurred | $0.00 (Module A is types + wire-up + projection helper) |
| D-103 cost cap headroom | unchanged at \$15 / cumulative ~\$0.66 = 22.7× headroom |

## §9 Module A close → Module B gate handoff

Module B Step B.1 next gate per PLAN.md §4 G2:

1. **User signal needed**: `开始 Phase 4 Module B` (gate G2 opens)
2. **First action**: B.1 lock Anthropic model + SDK setup (confirm `@anthropic-ai/sdk` version supports ephemeral cache blocks; lock default `claude-sonnet-4-6`)
3. **Critical milestone**: B.3 cost dry-run — **explicit user approval per CLAUDE.md** before first Anthropic API call (the entire Phase 4 LLM burn starts here)

Module A's TutorContext shape is the contract Module B will consume — when B.2 authors the tutor SYSTEM_INSTRUCTION + stable preamble, the preamble shape is "completed N chapters / in-progress M / pending P / recent quiz attempts: ..." derived directly from `loadTutorContext()`.
