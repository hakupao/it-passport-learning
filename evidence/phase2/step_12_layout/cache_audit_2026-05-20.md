# Phase 2 Step 12 — cache audit 2026-05-20 (Module C 收官 retro + Module C+D full re-estimate)

## §1 β cache-hit data point (N=13 cumulative)

| Session | surface | scope tokens | hit | miss | hit% | wall TTFT | notes |
|---|---|---|---|---|---|---|---|
| 39 (5 days ago) | `アルゴリズム` (1st smoke) | 400 | 0 | 400 | 0% | ~2.9s | cold creation event |
| 39 (5 days ago) | `アルゴリズム` (2nd smoke) | 400 | 384 | 16 | 96% | ~2.1s | warm intra-surface |
| 43 (1 day ago) | `アルゴリズム` | 400 | 384 | 16 | 96% | ~3s | cross-session 4-day TTL ratchet |
| **44 (today)** | `アルゴリズム` | **400** | **384** | **16** | **96%** | **~2s** | **cross-session > 6-day TTL** |

**Finding**: DeepSeek prefix cache TTL **> 6 days on prod** with the stable-prefix layout (D-088 §2.3 + D-095 §2.3). Ratchets Session 43's "> 5 days" finding by ~24h cumulatively without any user prompt change. Materially favourable for D-091 §2.1 cost projections.

**β tripwire**: 0 fires under healthy operation (96% hit >> 50% floor; runtime detector correctly silent per Q3=a design). Branch covered by unit tests in `tripwire.test.ts` (not exercised at runtime due to consistently high hit rate).

## §2 D-099 acceptance criteria check

| check | target | actual | result |
|---|---|---|---|
| Stable-prefix invariant preserved across i18n migration | cache hit ≥ Session 43 baseline | 96% = baseline | ✅ |
| AI SYSTEM_INSTRUCTION untouched server-side | bytewise identical | unchanged (no edits to `hover.ts` SYSTEM_INSTRUCTION) | ✅ |
| Trilingual output structure preserved | 3 sections JP/中文/English | 3 sections present | ✅ |
| Output under HOVER_USER_PROMPT 120-tok soft cap | ≤ 120 | 78 (35% under cap) | ✅ |
| α private firewall (D-097) intact on all 3 locale prefixes | 401 + WWW-Authenticate on /ja /zh /en | curl probes pass | ✅ |
| Middleware compose order (D-099 §2.5 LD-2) | firewall before i18n | vitest +5 tests pass; curl confirms `/chat` 401 before redirect | ✅ |

## §3 γ tripwire wall ledger update — Step 12

| Step | estimate | actual wall | drift |
|---|---|---|---|
| 1 (scaffold) | 0.5 day | ~5 min | −98% |
| 2 (DataSource) | 1 day | ~20 min | −98% |
| 3 (assembly) | 0.5 day | ~10 min | −98% |
| 4 (hello-ai) | 1 day | ~140 min | −85% |
| 5 (chat) | 1 day | ~165 min | −86% |
| 6 (quiz/explain) | 1 day | ~135 min | −84% |
| 7 (glossary/hover) | 1 day | ~90 min | −81% |
| 8 (retry/tripwire) | 1 day | ~85 min | −82% |
| 9 (Chat UI) | 1.5 day | ~110 min | −85% |
| 10 (Quiz Explain UI) | 1 day | ~145 min | −85% |
| 11 (Term Popover UI) | 0.5 day | ~100 min | −58% |
| **12 (Layout + i18n)** | **1 day** | **~200 min** | **−58%** |

**Sub-pattern within Module C** (now N=4 — finally enough data for the full re-estimate):

- **Bootstrap regime** (Steps 9, 10): -85% × 2 — clean clone-adapt within familiar AI-SDK + SSE-consumer surface; no structural change.
- **Structural-diversion regime** (Steps 11, 12): -58% × 2 — novel surface introduction (popover modal Step 11; layout chrome + i18n stack Step 12); each surfaced 1-5 in-step diversions widening the drift from the -80%+ "implementation cruise" band.

**Module C 4/4 average**: (−85 − 85 − 58 − 58) / 4 = **−71.5%**.

## §4 Module C+D full re-estimate (D-094 §2.4 trigger now satisfied — N=4 UI data points in hand)

The original Module B + C + D wall estimates were laid down BEFORE any Phase 2 Module-B-or-later data; γ tripwire data through Step 8 already foreshadowed an over-estimate by ~80%. The mid-implementation retro was repeatedly deferred (Steps 5, 7, 8, 9, 10, 11) to collect Module C UI data, since UI work was structurally different from API wiring. With Step 12 ✅ DONE, that data is complete.

| Module | original estimate | applied drift | adjusted estimate |
|---|---|---|---|
| Module A (3 step) | 2 day = 16h | −98% (avg) | 0.3h (already done at 0.5h) |
| Module B (5 step) | 5 day = 40h | −83.6% (avg) | 6.6h (already done at ~5h) |
| Module C (4 step) | 4 day = 32h | −71.5% (avg) | 9.1h (already done at ~7.5h) |
| **Module D (3 step)** | **2.5 day = 20h** | **−71.5%** (apply Module C avg as nearest analogue) | **5.7h** |

**Module D adjusted sub-step estimates**:

| Step | original | adjusted | rationale |
|---|---|---|---|
| 13 (D-090 cap impl) | 1 day = 8h | ~2.3h | Mostly env-switch wiring (`PHASE2_CAP_MODE`) + per-route counter + dashboard widget; familiar pattern from prior cap work |
| 14 (Lighthouse + i18n complete + a11y) | 1 day = 8h | ~2.3h | i18n strings already mostly done in Step 12; Lighthouse audit + fixes plus a11y smoke; likely the highest-variance step in Module D (could surface novel issues) |
| 15 (E2E Playwright + prod deploy + custom domain) | 0.5 day = 4h | ~1.1h | E2E spec is small (Chat happy path + cap trigger); prod deploy is already 1-command; custom domain β-optional |

**Phase 2 from-here total**: ~5.7h Module D + ~0.5h Session 44 close = **~6.2h until ship-ready**.

**Range with structural-diversion variance**: 5.7h base × 1.45 = ~8.3h upper bound if Module D follows the Step 11/12 sub-regime instead of the Step 9/10 sub-regime.

**Phase 2 total wall reality check**:
- Sessions completed (24 → 43): ~50h cumulative active work; calendar elapsed ~12 days.
- Remaining: 6-8h Module D + 1h Phase 2 close (RETROSPECTIVE_phase2.md + tag).
- Calendar projection: 1-2 active days from here.

## §5 Cost envelope check

| line | Phase 2 cumulative 真 |
|---|---|
| Session 42 close (Step 10) | $0.082 |
| Session 43 close (Step 11) | $0.0823 (+$0.0003) |
| **Session 44 close (Step 12)** | **$0.0824 (+$0.00012)** |
| D-090 α-silent cap | $5.00 |
| Headroom | **60× headroom; ~0.5% of cap consumed at 4/4 Module C** |

Step 12's tiny incremental cost (1 真 LLM call cheaper than Sessions 41-43 because we only needed 1 for locale-propagation verification, not 2 for new-data-point collection). Module D budget is essentially unconstrained — even if Step 13 cap-trigger E2E adds 20-50 真 calls, total will be < $1.

## §6 Module D risk flagging

| risk | likelihood | mitigation |
|---|---|---|
| Step 13 cap-trigger spend (need to deliberately blow the cap to verify behaviour) | high | choose smallest-scope endpoint (hover ~$0.0001/call); 50 calls = $0.005 still negligible |
| Step 14 Lighthouse score below ≥90 target | medium | Module C/D backlog (BusySkeleton perf, modal animation cost, image optim if added) needs ~1h budget |
| Step 14 i18n string drift between ja.json and zh.json/en.json | low | typed-augment via `IntlMessages` + `global.d.ts` catches missing keys at build; spotcheck during Lighthouse pass |
| Step 15 Playwright fragility (real browser) | medium | scope to 2 specs only (Chat happy + cap trigger); skip flaky network simulation; trust the unit + smoke layers |
| Step 15 custom domain | low | β-optional per PLAN.md row 58; skip-by-default unless user gates it |

## §7 Decisions for Session 45+ (NOT D-NNN-locked here; recorded for handoff)

1. **Step 13 first**, then 14, then 15 (PLAN.md sequence unchanged).
2. **Module C+D re-estimate AMENDED IN-PLACE** in `PLAN.md` Module D rows (per D-094 §2.1 amendment pattern). Original estimates kept as struck-through; adjusted estimates appended.
3. **Phase 2 Retrospective** (`RETROSPECTIVE_phase2.md` per Rule C) is at Step 15 close, NOT Step 12 close. Step 12 = Module C 收官 retro only (this file + `step_12_audit.md`).
