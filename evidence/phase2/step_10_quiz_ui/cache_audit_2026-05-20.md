# cache_audit — Step 10 Quiz Explain UI · Session 42 · 2026-05-20

## 1. Scope

Single LLM call type exercised this Step: `/api/quiz/explain` (deepseek-reasoner R1) via the new client SSE consumer (`quizSseTransport.streamQuizExplain`) bound to a `<QuizExplain />` modal at `/quiz?qid=<id>`.

## 2. Per-call β data points

| # | Path | question_id | Wall | Input | Hit | Miss | Hit % | Output |
|---|------|---|---|---|---|---|---|---|
| A | `evaluate_script` test fetch | page_042_entity_0 | ~5-7s | 2693 | 2688 | 5 | **99.81%** | 831 |
| B | UI click smoke | page_042_entity_0 | ~5-7s | 2693 | 2688 | 5 | **99.81%** | 621 |

Both calls used the prod-v3 deploy `dpl_BqdybbaGeBEqmvX9vv5zUVwKmHEL`. Call A primed the prefix cache 2 sec before Call B; both report identical 99.81% hit ratio because **the prefix was already cached from Session 38** 4 days earlier (DeepSeek cross-session prefix cache).

## 3. β trip wire decision (D-091 §2.5(β))

- Trigger: cache hit < 50% AND total input ≥ 1000 tokens.
- Observed: 99.81% hit on both calls (≫ 50% threshold).
- δ runtime detector (`apps/web/src/lib/ai/tripwire.ts`) writes `console.warn '[tripwire]'` only on a trip; vercel logs grep `'\\[tripwire\\]'` = **empty** = correct healthy-silent behavior.

## 4. Stable-prefix invariant ratification

**N=10 cumulative β data points** now ratify D-088 §2.3 stable-prefix invariant across:

| Dimension | Range observed | Hit %  |
|---|---|---|
| Scope size | 400 → 93K tok | 96.0% → 99.99% |
| Multi-turn conversation | turnCount 1 → 3 | 99.88% → 99.99% (Session 41) |
| Cross-session time | Session 38 → Session 42 (≥ 4 days) | 99.81% identical |
| Provider | DeepSeek (chat + reasoner) | All design-consistent |

**Cross-session TTL finding** (new this Step): Session 38's call on `page_042_entity_0` produced a 99.81% hit ratio (2688/2693). Session 42 — 4 days later — produced an identical 99.81% hit on the same `page_042_entity_0`. ⇒ DeepSeek prefix cache TTL on prod is **> 4 days**, ratcheting Session 41's "> 5h" finding by ~20×. This is materially favourable for D-091 §2.1 cost projections.

## 5. Module C+D re-estimate decision (per D-094 §2.4 mid-implementation retro)

**STILL deferred** to Step 12 close.

Rationale (extended from Session 41 cache_audit §4.2):
- Step 9 (Module C 1/4 entry) = `<Chat />` UI bootstrap + useChat + localStorage Resume — **−85% drift**.
- Step 10 (Module C 2/4) = `<QuizExplain />` modal + `<QuizList />` page + hand-rolled SSE consumer — **−85% drift**.
- Both data points are within Module C's "interactive UI surface" sub-pattern. They DO NOT yet sample:
  - Step 11 = Glossary Term Popover (different surface, NOT modal; inline trigger; smaller payload — closer to Step 7 hover envelope).
  - Step 12 = 3-tab Layout integration + i18n catalog extraction (structurally distinct: not a new feature surface but a unifier).

Re-estimating Module C/D now with only Steps 9+10 data risks anchoring to a sub-pattern that may not hold for Step 11/12. The N=4 budget per `evidence/phase2/step_09_chat_ui/cache_audit_2026-05-20.md` §4.2 is preserved.

## 6. Wall drift (γ tripwire)

| Step | PLAN estimate | Actual wall | Drift |
|---|---|---|---|
| 1 | 1 day | 25 min | −98% |
| 2 | 2 day | 30 min | −98% |
| 3 | 1.5 day | ~30 min | −98% |
| 4 | 1 day | ~140 min | −85% |
| 5 | 1.5 day | ~165 min | −86% |
| 6 | 1 day | ~135 min | −84% |
| 7 | 1 day | ~90 min | −81% |
| 8 | 1 day | ~85 min | −82% |
| 9 | 1.5 day | ~110 min | −85% |
| **10** | **1 day** | **~145 min** | **−85%** |

10th consecutive Module A+B+C under-estimate by 80%+. The "implementation cruise" sub-pattern segmentation now reads:

- **Module A bootstrap** (Steps 1-3): −98% (all infra; reuse-dominated work).
- **Module B bootstrap** (Steps 4-5): −85, −86 (new SDK + first endpoint pair).
- **Module B clone-adapt** (Steps 6-7): −84, −81 (each new endpoint reuses prior shape).
- **Module B composition** (Step 8): −82 (retry + tripwire helpers).
- **Module C entry** (Step 9): −85 (new useChat surface).
- **Module C clone-adapt** (Step 10): −85 — same "second data point bootstrap range" as Module B's Step 4-5 pair. Suggests Module C may end up with a similar 5-step shape: bootstrap (Step 9) ⇒ clone-adapt (Steps 10-11) ⇒ composition (Step 12). Still need Steps 11+12 to ratify.

## 7. In-source amendments (D-094 §2.1 + D-080 v1.1 §8)

1. `quizSseTransport.ts`: `resolveEndpoint(endpoint)` helper. Resolves relative URLs against `window.location.origin` (which is strip-respecting under `history.replaceState`) instead of letting Chrome's `Request` ctor resolve them against `document.baseURI` (which is NOT strip-respecting). JSDoc block carries the full rationale + Session 41 carry-over linkage; this is NOT a D-NNN decision (implementation fix to an HTML5/WHATWG URL spec subtlety).

2. `QuizList.tsx`: defensive `history.replaceState` URL-credential strip. Carry-over from Session 41 Step 9 pattern; pairs with the absolute-URL resolution above (the strip alone is insufficient per the failure archive).

3. PLAN.md Step 10 row: wall column inline `actual ~145 min` amend per D-094 §2.1 pattern (NOT full Module C+D re-estimate; that stays deferred per §5 above).

4. STATE.md last-updated paragraph: 4-anchor sync (最后更新 + 当前阶段 + 已锁定决定数 + 下一会话).

## 8. Rule B archive

1× `failures/step_10_attempt_1_document_baseuri_credentials_pollution.md` — see file for full root-cause + fix narrative.

## 9. NOT covered by this Step (Module C+D backlog)

- Step 11 (Glossary Term Popover): inline trigger on words inside `<Chat />` and `<QuizExplain />` content.
- Step 12 (3-tab Layout + i18n): unify `/chat`, `/quiz`, `/glossary` under a single shell + extract hardcoded zh-CN strings to an i18n catalog.
- R1 reasoning-stream consumption (defensive warning-frame fix from Module C/D backlog) — not exercised this Step because the R1 empty-delta case was not reproduced.
- Cosmetic: AI SDK system-message-in-prompts warning mitigation (`allowSystemInMessages: true`). Continues to be deferred.

## 10. Cost reconciliation

- Step 10 真 billed: **$0.0033** across 2 calls (Call A $0.0019 + Call B $0.0014).
- Phase 2 cumulative 真: $0.079 (Session 41 close) + $0.0033 ≈ **$0.082** vs D-090 α-silent $5 cap = **60× headroom**.
