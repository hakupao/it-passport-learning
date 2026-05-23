# Phase 4 Module B Step B.4 — design notes

Atomic single-sitting commit landing two cross-referenced deliverables per
PLAN.md §1 B.4 row (expanded) + D-105 §2.4 ordering:

1. **`/api/tutor` ship** — Phase 4 tutor brain endpoint (D-104 §2.1)
2. **D-105 Phase 2 migrate** — four legacy DeepSeek routes shift to
   `deepseek-v4-flash` with route-handler-level
   `providerOptions.deepseek.thinking.type` injection

## 1. LD-Module-B-15 — Phase 2 thinking-mode dispatch via call-site
   `providerOptions` (NOT baked into LanguageModel)

**Rule**: the `providerOptions.deepseek.thinking.type` field lives at the
call-site `streamText({providerOptions})` level (per route handler), NOT
baked into the LanguageModel object returned by `getModel(role)`.

**Why**: mirrors the tutor path symmetry per D-104 §2.2 — both tutor and
Phase 2 routes now express thinking-mode as an orthogonal axis from model
selection. Keeps `getModel(role)` a pure model factory (returns a fresh
LanguageModel without behavioural side effects). Isolates the
thinking-mode delta to ONE expression per route handler (the
`getPhase2ProviderOptions(role)` call), so a future thinking-mode tweak
(e.g., bumping quiz reasoningEffort) touches one helper, not five
`streamText` call sites.

**How to apply**:
- `getPhase2ProviderOptions("chat" | "hover" | "smoke")` → `{deepseek:
  {thinking:{type:"disabled"}}}` (legacy `deepseek-chat` non-thinking
  parity)
- `getPhase2ProviderOptions("quiz")` → `{deepseek:{thinking:
  {type:"enabled"}, reasoningEffort:"high"}}` (legacy `deepseek-reasoner`
  thinking parity)
- Helper returns a `ProviderOptionsShape = Record<string, Record<string,
  JSONValue>>` (LD-Module-B-15-A) — JSON-compatible, structurally
  assignable to AI SDK's `SharedV3ProviderOptions = Record<string,
  JSONObject>` without requiring `@ai-sdk/provider-utils` as a direct
  package.json dep
- Route handlers pass the same options object regardless of `LLM_PROVIDER`
  env — the Anthropic SDK ignores the `deepseek.*` namespace by design
  per AI SDK provider-keyed routing

**Subpoints**:
- **LD-Module-B-15-A** local `ProviderOptionsShape` type alias declared
  in `provider.ts`; rationale documented inline. Imports a single
  `JSONValue` type from "ai" (already a re-export) to keep the inner
  values JSON-serialisable.
- **LD-Module-B-15-B** `pricingFor` in `cap.ts` extended to dispatch the
  `tutor` role to dedicated Phase 4 tiers (`PRICING_DEEPSEEK_V4_PRO` +
  `PRICING_ANTHROPIC_SONNET`). Phase 2 routes unchanged (V4-flash thinking-
  disabled = legacy `deepseek-chat` pricing per Context7-verified mapping).

## 2. LD-Module-B-16 — validateTutorRequestBody extracted from route
   module per Next.js route-export restriction

**Rule**: Next.js 15 route modules (`app/api/**/route.ts`) only allow
specific exports: `GET / POST / HEAD / PUT / DELETE / PATCH / OPTIONS` +
runtime config (`runtime`, `maxDuration`, `dynamic`, etc.). Any other
named export fails the route-type-check during `next build`.

**Why**: the validator wants to be unit-testable in isolation (no streamText
mock needed for shape tests), so it cannot live inside the route module.

**How to apply**: `validateTutorRequestBody` + its private helpers
(`isChapterSummaryArray` / `isQuizAttemptArray`) + the `TutorRequestBody`
interface live in `apps/web/src/lib/ai/tutorRequest.ts`. The route module
imports + calls the validator; vitest imports it directly via
`@/lib/ai/tutorRequest`.

**Discovered when**: first `next build` attempt failed with
`Type error: "validateTutorRequestBody" is not a valid Route export field`
— good demonstration of the Rule-D writer/reviewer separation working
(Next.js compiler caught the contract violation that the writer pass
missed).

## 3. D-105 §2.1 migrate execution — atomic with `/api/tutor` ship

Per D-105 §2.4 ordering, the migrate executes alongside the tutor
endpoint ship in one atomic commit:

| Route | Before (D-095 §2.1) | After (D-105 §2.1) | Verified by |
|---|---|---|---|
| `/api/chat` | `deepseek-chat` | `deepseek-v4-flash` + thinking disabled | provider.test.ts shape + next build route signature |
| `/api/quiz/explain` | `deepseek-reasoner` | `deepseek-v4-flash` + thinking enabled + reasoningEffort=high | provider.test.ts shape + GET docstring update |
| `/api/glossary/hover` | `deepseek-chat` | `deepseek-v4-flash` + thinking disabled | provider.test.ts shape + GET docstring update |
| `/api/hello-ai` | `deepseek-chat` | `deepseek-v4-flash` + thinking disabled | provider.test.ts shape |
| `/api/tutor` (new) | n/a | `deepseek-v4-pro` + thinking enabled + reasoningEffort=high (default) | route.test.ts GET docstring case |

**D-105 §2.2 D-085 §2.4 frozen surface preservation verified** at build:
- middleware **44.2 kB** (Phase 1 LD-Step1-A baseline; unchanged through
  Phase 3 close + Module A + Module B B.1+B.2+B.3; this commit
  unchanged)
- `/[locale]/chat` First Load **169 kB** (D-085 §2.4 Phase 2 ship
  baseline; unchanged through Phase 3 close + Module A + Module B
  B.1+B.2+B.3; this commit unchanged)
- `/[locale]/quiz` First Load **120 kB** (unchanged)
- `/[locale]/book` First Load **121 kB** (unchanged)
- `/[locale]/book/chapter/[nn]` First Load **181 kB** (unchanged)
- Shared First Load JS **102 kB** (unchanged)

The new `/api/tutor` route adds **138 B** route handler bundle (parity
with existing Phase 2 API routes), no client-side surface delta.

## 4. γ tripwire row — Session 57 B.4

PLAN.md §1 B.4 estimate: **150-300 min** (expanded from 120-240 by D-105
migrate scope per D-105 §4 Implications). Actual wall: **~50 min**
(survey → 5 edits → 3 test files → debug 2 build errors → re-verify
gates). γ delta vs midpoint (~225 min): **~-78%**.

| Step | Estimate (min) | Actual (min) | γ delta |
|---|---|---|---|
| A.1 | 60-120 (mid 90) | 25 | -72% |
| A.2 | 60-120 (mid 90) | 40 | -56% |
| A.3 | 60-120 (mid 90) | 15 | -83% |
| B.1 | 30-90 (mid 60) | 20 | -67% |
| B.2 | 90-180 (mid 135) | 30 | -78% |
| B.3 | 60-120 (mid 90) | 150 | +67% |
| **B.4** | 150-300 (mid 225) | **50** | **-78%** |
| **Phase 4 N=7 mean** | — | — | **~-52%** |

B.4 reverts to the composition-leverage profile of A/B.1/B.2 because the
brain matrix + system prompt + cache layout were already done in B.1+B.2;
B.4 was a thin wiring job (route handler + 4 small config flips).
D-105's "single atomic commit" framing prevented context-switch loss
between the migrate and the tutor ship.

**PLAN.md §5 γ hypothesis status**: still validated — when a step
introduces NEW infrastructure with debug cycles (B.3), it lands at
midpoint × 1.0 or above; when a step is composition on the just-built
infrastructure (B.4), it lands well under midpoint. Module C/D will
continue to calibrate the heuristic.

## 5. Rule A / B / C / D disposition

| Rule | Status | Notes |
|---|---|---|
| **A** 抽检 | n/a | No >50% compression/rewrite this step. New code is greenfield (tutor route + helper + tests); existing code edits are additive (single field added to 4 streamText calls + cap tier table extension). |
| **B** 失败归档 | n/a (1 build-error event NOT graded as failure) | First `next build` attempt failed with the route-export-restriction error; corrective LD-Module-B-16 surfaced + fix landed within the same step. Per D-094 §2.4 distinction: this is a design DISCOVERY (Next.js compiler catching a contract violation), not a failed-attempt grading event. No `failures/` entry filed. |
| **C** Phase retro | ⏸ | RETROSPECTIVE_phase4.md commits at Phase 4 close (Module D Step D.3 per gate G6). |
| **D** Writer ≠ Reviewer | ✅ partial | Build-time reviewer chain (`tsc --noEmit` + `eslint` + `next build` route-type-check) fired; caught LD-Module-B-16 violation before commit. Browser-based reviewer chain (Playwright e2e) engages at Module D ship (G5). |

## 6. Cost ledger — Phase 4 cumulative

B.4 itself runs **\$0 real LLM cost** (atomic ship + regression gates; no
production-stream invocation in this sitting; dry-run from B.3 is the
last real burn). Phase 4 cumulative real LLM spend: **~\$0.35** (B.3 only)
vs D-103 \$15 cap = **42× headroom**. Cost tripwire G7 (\$10 / 66%)
silent.

## 7. β tripwire — Phase 4 N=1 carryover

No new β datapoints in this step (no live streaming this sitting). Module
D Step D.1 preview-deploy + Playwright e2e will be the first prod
streaming through the migrated Phase 2 routes + new `/api/tutor`,
producing the first multi-row β table for D-105 §2.3 verification + β
graduation queue evaluation.

`readCacheUsage` nested-usage fallback (LD-Module-B-14 from Session 56)
applies to both `/api/tutor` (Anthropic path) AND retroactively to Phase
2 routes (which previously emitted top-level Anthropic shape but will
gracefully handle nested if AI SDK changes again).
