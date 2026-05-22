# D-105 — Phase 2 routes deepseek-chat / -reasoner → V4 migration (legacy deprecation 2026-07-24)

| 字段 | 值 |
|---|---|
| ID | D-105 |
| Topic | Phase 2 four routes (`/api/chat`, `/api/quiz/explain`, `/api/glossary/hover`, `/api/hello-ai`) migrate from legacy `deepseek-chat` / `deepseek-reasoner` model IDs to V4 line (`deepseek-v4-flash` / `deepseek-v4-pro`) before 2026-07-24 deprecation deadline |
| Status | **LOCKED 2026-05-22** (Session 56 Turn 7 — D-095 §2.5(ε) tripwire FIRE handler) |
| Supersedes | D-095 §2.1 DEEPSEEK_MODEL_BY_ROLE specific model IDs (`deepseek-chat` + `deepseek-reasoner`) **for Phase 2 routes only** (Phase 1 historical unchanged) |
| Superseded by | — |
| Related | D-095 §2.5(ε) (deprecation tripwire — this ADR is the FIRE handler); D-104 (Phase 4 tutor brain matrix — co-triggered ADR same session, scopes tutor route; this ADR scopes Phase 2 four routes); D-085 §2.4 (Phase 2 frozen surface — preservation disposition §3.1 below); D-088 §2.3 + D-095 §2.3 (stable-prefix invariant — preserved across migrate) |
| Closes OQ | n/a (this is a tripwire-FIRE handler, not a new OQ; an OQ-03 "deepseek deprecation" was briefly considered Session 56 Turn 4 but skipped in favor of immediate D-105 ADR) |
| Decision-on-lock writeback | `docs/discussion/2026-05-22-session-56.md` Turn 7 same turn (per D-027 §1) |

---

## 1. 背景 / Why

D-095 §2.5(ε) installed a **mirror tripwire** for future V4 graduation:

> `deepseek-v4-pro` is NOT a callable API model string as of 2026-05-19 (verified via api-docs.deepseek.com Context7 query); D-095 §2.5(ε) DeepSeek-side mirror tripwire covers future V4 graduation.

Session 56 Turn 5 Context7 re-verification (2026-05-22, 3 days after the original check):

> Source: api-docs.deepseek.com/updates
> "The DeepSeek API now supports V4-Pro and V4-Flash models. These can be accessed using the OpenAI ChatCompletions interface or the Anthropic interface. The base URL remains the same, and you should set the model parameter to `deepseek-v4-pro` or `deepseek-v4-flash`. **The legacy model names `deepseek-chat` and `deepseek-reasoner` will be discontinued on 2026-07-24.** Currently, these legacy names map to the non-thinking and thinking modes of `deepseek-v4-flash`, respectively."

**Tripwire FIRE event** (D-095 §2.5(ε) literal: V4 graduation + legacy deprecation deadline announced). Today is 2026-05-22; deadline is ~63 days out. Phase 2 four routes currently use legacy IDs:

| Route | Current model (D-095 §2.1) | Risk |
|---|---|---|
| `/api/chat` | `deepseek-chat` (deepseek-v4-flash non-thinking mode under the hood, but the legacy alias) | Breaks 2026-07-24 |
| `/api/quiz/explain` | `deepseek-reasoner` (deepseek-v4-flash thinking mode under the hood, but the legacy alias) | Breaks 2026-07-24 |
| `/api/glossary/hover` | `deepseek-chat` | Breaks 2026-07-24 |
| `/api/hello-ai` | `deepseek-chat` | Breaks 2026-07-24 |

If we ignore the tripwire, Phase 2 prod surface breaks ~2 months from now. Per D-095 §2.5(ε) the tripwire EXISTS exactly to prevent this; this ADR is the structured response.

User Session 56 Turn 4 Q3 answer:

> "开 D-105 ADR + Phase 4 内 migrate (B.4 同时顺手换)"

---

## 2. 决定 / Decision

### §2.1 Migrate plan — 4 routes, single B.4 sitting

All four Phase 2 routes migrate in the **same commit as Module B Step B.4 `/api/tutor` ship**:

| Route | Before (D-095 §2.1) | After (D-105 lock) | Rationale |
|---|---|---|---|
| `/api/chat` | `deepseek-chat` | **`deepseek-v4-flash`** with `providerOptions.deepseek.thinking.type='disabled'` | Non-thinking general chat behavior preserved (legacy non-thinking alias was `deepseek-chat`); cheaper than V4 pro for general turns; explicit thinking disable for cache-stability |
| `/api/quiz/explain` | `deepseek-reasoner` | **`deepseek-v4-flash`** with `providerOptions.deepseek.thinking.type='enabled' + reasoningEffort='high'` | Reasoning-quiz behavior preserved (legacy reasoner = thinking mode); V4 flash with high effort = closest legacy parity; reasoningEffort:max only if quiz explain quality degrades (B.4 verification step) |
| `/api/glossary/hover` | `deepseek-chat` | **`deepseek-v4-flash`** with `providerOptions.deepseek.thinking.type='disabled'` | Light single-pass term explain; same disposition as `/api/chat` |
| `/api/hello-ai` | `deepseek-chat` | **`deepseek-v4-flash`** with `providerOptions.deepseek.thinking.type='disabled'` | Health-check smoke; minimal call; same disposition |

`/api/tutor` ships on **`deepseek-v4-pro`** (per D-104 §2.1) — V4 pro is the higher-tier model for tutor-quality multi-turn; V4 flash is the lighter / cheaper tier for single-turn Phase 2 routes.

### §2.2 D-085 §2.4 frozen surface preservation — model param change does NOT violate

D-085 §2.4 froze the Phase 2 surface "behavior" — modal lifecycle (open / stream / close), SSE wire format (`{type:"delta",text}` + `{type:"usage",...}` + `[DONE]`), SYSTEM_INSTRUCTION text bytes, prefix layout (D-095 §2.3 stable-prefix). D-105 changes are at the **bottom-of-stack SDK param** level:

- `DEEPSEEK_MODEL_BY_ROLE` const table values shift (model IDs)
- `providerOptions.deepseek` parameter added (new field, additive)
- SYSTEM_INSTRUCTION text **unchanged** (cache key preserved → DeepSeek server-side prefix cache continues to hit on byte-stable prefix)
- Wire format **unchanged** (`buildChatSseResponse` + `toUIMessageStreamResponse` callers untouched)
- Modal lifecycle **unchanged** (no client-side component changes)
- Tripwire telemetry **unchanged** (`readCacheUsage(providerMetadata.deepseek)` reads `promptCacheHitTokens` / `promptCacheMissTokens` — V4 line returns same shape per Context7 verification)

This is the same disposition pattern as D-095 supersede of D-088 §2.1 (single-model pin → switchable matrix; provider param change without surface change).

### §2.3 Phase 2 vitest + Playwright e2e regression verification

Migrate is gated by:

- **vitest full suite** — 390+ tests must pass post-migrate (existing chat / quiz / hover route tests cover the call-shape contract; new tests added if migration introduces new SDK call shape)
- **Playwright e2e** — 14-spec battery from Phase 2 + Phase 3 must pass on a preview deploy with the migrated routes (modal-open / stream / close in 3 locales)
- **Manual smoke on each migrated route** in B.4 — fire 1 representative call per route on dev / preview; verify reply shape + telemetry shape (cache hit/miss tokens populated; no provider error frames)

If any of these regresses, the migrate is rolled back (revert commit) and the issue investigated before B.4 ship completes.

### §2.4 Migration ordering inside the B.4 commit

The atomic B.4 commit should follow this internal ordering for safe rollback:

1. `apps/web/src/lib/ai/provider.ts` — `DEEPSEEK_MODEL_BY_ROLE` values updated to `deepseek-v4-flash`; new optional `providerOptions.deepseek.thinking.type='disabled'` injected at the call site of each route via existing route handler (not a global SDK config); tutor route added (separate path, per D-104)
2. Each Phase 2 route handler (`/api/chat/route.ts`, `/api/quiz/explain/route.ts`, `/api/glossary/hover/route.ts`, `/api/hello-ai/route.ts`) — `streamText` / `generateText` call updated with `providerOptions.deepseek.thinking.type` field per §2.1 table
3. `apps/web/src/lib/ai/__tests__/*.test.ts` — assertions for new `providerOptions.deepseek.*` shape added; existing tests updated to expect new model ID in mock calls
4. Phase 4 `/api/tutor/route.ts` NEW (D-104 §2.1; uses `getTutorModel` from B.1; new file, no migrate concern)
5. Manual smoke + Playwright + vitest gate sequence per §2.3

If step 2 introduces a regression on any route, revert step 2 only (steps 1+3+4 are additive and survive).

### §2.5 Deadline + buffer

- **Deprecation deadline**: 2026-07-24 (per DeepSeek API change log Context7 query 2026-05-22)
- **Target migrate ship**: B.4 commit (Phase 4 Module B Step B.4 — Session 57 or 58 estimated)
- **Safety buffer**: ~60 days between target ship and deadline; ample for prod monitoring + rollback if any issue surfaces
- **If B.4 slips beyond 2026-07-10**: migrate splits out into a standalone hotfix session per D-104 §2.4 Implications "alternative" path (Q3 round-2 option b retained as fallback)

### §2.6 Reversibility

- D-105 itself can be superseded if DeepSeek API changes the V4 thinking parameter shape, or if migrate uncovers behavioral parity regression that needs deeper redesign
- Per-route revert is supported by §2.4 ordering — each route handler is independent
- Phase 2 frozen tag `phase2-α-ship-2026-05-21` immutable; D-105 changes are on `main` after the tag → tag continues to point at pre-migrate commit `2cf48a3` historically
- Legacy `deepseek-chat` / `deepseek-reasoner` IDs continue to work until 2026-07-24 — if we miss the migrate target, the old commit still functions; the failure mode is hard-deadline-at-2026-07-24, not soft drift

---

## 3. Rejected Alternatives

| # | Alternative | Why rejected |
|---|---|---|
| 1 | Ignore tripwire FIRE; wait for 2026-07-24 to break in prod | Prod outage on a hard deadline = unacceptable. Tripwire EXISTS to prevent exactly this |
| 2 | Q3 option (c): "先不处理,只记 OQ-03 + tripwire log,7 月接近时再开" | User-rejected in round-2 (picked option a). The "再开" risk is forgetting in 60 days; D-105 captures intent now while context is fresh |
| 3 | Q3 option (b): Separate Phase 5 / hotfix session migrate | User-rejected in round-2 (picked option a, B.4 顺手换). Single-commit pivot is more atomic; less risk of partial migrate. B.4 already touches the AI route layer (adding `/api/tutor`) — touching the four sibling routes in the same commit is incremental work |
| 4 | Migrate to `deepseek-v4-pro` for all routes (not v4-flash) | Cost overhead — V4 pro is ~tutor-tier; V4 flash is ~Phase-2-route-tier. Per Context7 the legacy `deepseek-chat` mapped to V4 flash non-thinking, so V4 flash is the natural migration target |
| 5 | Migrate to `deepseek-v4-flash` with `thinking.type='enabled'` for `/api/chat` (replace non-thinking) | Cost overhead + Phase 2 chat surface behavior change (was non-thinking; would become thinking). D-085 §2.4 surface preservation requires behavior parity; non-thinking → non-thinking is the right disposition |
| 6 | Migrate to `deepseek-v4-pro` for `/api/quiz/explain` | V4 pro is the next tier above V4 flash; legacy reasoner → V4 flash thinking is the documented mapping per DeepSeek change log. Upgrade to V4 pro can be a future polish if quiz explain quality measurably benefits |
| 7 | Auto-fall-back legacy → V4 (no code change) per DeepSeek's "legacy names map to ..." statement | Future-fragile. The mapping is documented as a transition behavior; after 2026-07-24 the legacy names are gone. Code must use canonical IDs |

---

## 4. Implications

- **B.4 scope expanded** — original PLAN.md B.4 = "/api/tutor endpoint ship" only. Post-D-105: B.4 = `/api/tutor` ship **+** 4 Phase 2 routes migrate **+** vitest + Playwright + manual smoke verification gates. Single atomic commit; D-104 + D-105 cross-referenced.
- **Phase 2 frozen tag preserved** — `phase2-α-ship-2026-05-21` immutable; D-105 changes are post-tag on `main`. Phase 2 "frozen" semantic is at the BEHAVIORAL level (D-085 §2.4) which D-105 explicitly preserves (modal lifecycle / SSE format / SYSTEM bytes / wire shape all unchanged).
- **D-095 §2.5(ε) tripwire RESOLVED** — the tripwire FIRE is handled by this ADR. Once B.4 ships with all 4 routes migrated, the tripwire entry can be marked "resolved 2026-MM-DD by D-105 B.4 migrate" in the tripwire telemetry log.
- **D-085 §2.4 frozen contract honored** — Phase 2 surface (chat / quiz / hover modal) behavior parity preserved per §2.2; only the bottom-of-stack model param changes.
- **D-095 §2.3 stable-prefix invariant preserved** — SYSTEM_INSTRUCTION text bytes + corpus + prefix layout all unchanged; DeepSeek server-side prefix cache continues to fire as before (V4 flash uses the same prefix-cache mechanism per Context7 verification).
- **β tripwire continuity** — Phase 2 N=14 cumulative β data carries forward (same prefix cache mechanism). Post-migrate β rows can be appended to verify cache hit ratio parity ≥95% (Phase 2 baseline) post-V4-flash migrate.
- **γ tripwire** — B.4 wall estimate revises upward by the 4-route migrate work (~30-60 min added). Original PLAN.md B.4 row = "120-240 min"; post-D-105 ~150-300 min. PLAN.md row updated to reflect.

---

## 5. History

- **2026-05-19 D-095 §2.5(ε)**: Mirror tripwire installed against V4 graduation + legacy deprecation
- **2026-05-22 Session 56 Turn 5**: Context7 verification of `deepseek-v4-pro` availability + 2026-07-24 deprecation deadline announcement = tripwire FIRE
- **2026-05-22 Session 56 Turn 4**: User answered round-2 Q3 = "开 D-105 ADR + B.4 顺手换"
- **2026-05-22 Session 56 Turn 7 (THIS ADR)**: D-105 LOCKED — migrate plan + B.4 execution + deadline + verification gates + frozen surface preservation rationale
- **2026-MM-DD (B.4 future commit)**: Migrate executes; 4 routes shift to V4-flash + `/api/tutor` ships on V4-pro
