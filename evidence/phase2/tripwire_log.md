# Phase 2 §2.5 cascade event log

> Per **D-091 §2.5** cascade pattern (5 triggers: α/β/γ/δ/ε) + **D-094** §2.5.
>
> Any trigger fire → append a row here, then either:
>   - Lock / amend a sub-ADR (D-094 first instance; future ones may amend D-094 in-place per D-080 v1.1 §8 pattern), or
>   - Note + resolve in-line if mechanical (e.g. drift correction within noise)
>
> File created **2026-05-19 Session 35 Turn 2** alongside D-094 lock.

---

## Event log

| Date | Trigger | Data points | Resolution |
|---|---|---|---|
| 2026-05-19 | **γ** (Step 数 / wall > 30% drift, 3 consecutive Module A data point) | Step 1 actual 25 min vs 1 day → −98% / Step 2 actual 30 min vs 2 day → −98% / Step 3 actual ~30 min vs 1.5 day → −98% | **D-094 LOCKED 2026-05-19** — Module A wall actuals recorded inline (`actual <N> min (vs estimate <M> day → −X%)`); Module B-D wall estimate held until Step 5 mid-implementation retro; D-091 §2.5(γ) 30% threshold unchanged (worked as designed). See `docs/decisions/D-094-tripwire-wall-amendment.md` §2 + §3 + §4. |
| 2026-05-20 | **β + γ + 设计 factual error**, Session 37 Step 5 | β: N=3 cache hit 99.98%×2 (no fire) / γ: Step 5 wall ~165 min vs 1.5 day → −86% (5th consecutive Module A+B under-estimate by 85%+) / 设计 factual error: assembleWholeBook full-pages payload would exceed DeepSeek 64K ctx (real 92,814 tok vs assumed 64K limit; empirically deployed model handles 93K so V3.2 128K) caught pre-deploy via local measurement | **β**: D-088 §2.3 stable-prefix design ratified at lean wholebook scale (N=4 cumulative across Steps 4+5). **γ**: D-094 §2.4 mid-implementation retro decision input collected — **path = PLAN.md Module B-D wall column inline `actual <N> min` amend (Step 4: 140 min / Step 5: 165 min) rather than full B-D re-estimate** (per D-094 §2.1 amendment pattern); D-091 §2.5(γ) 30% threshold unchanged, mechanism worked as designed. **设计**: **D-098 LOCKED 2026-05-20** — whole-book lean payload (chapters + glossary, no pages); amend D-085 + D-089 §2.3. See `docs/decisions/D-098-whole-book-lean-payload.md`. **chars/N heuristic content-dependency** surfaced (Step 4 chars/4 over by 37% vs Step 5 chars/4 under by 21% — same heuristic, different content shapes); refresh deferred to Step 6 entry per `evidence/phase2/step_05_chat/cache_audit_2026-05-20.md` §4.5. |
| 2026-05-20 | **β + γ + observability finding**, Session 38 Step 6 | β: N=3 quiz cache hit — call #1 cold creation (2693 miss / 0 hit) / call #2 same question_id (2688 hit / 5 miss = **99.81% hit**) / call #3 different question_id (2271 miss / 0 hit creation) — design-consistent across scope sizes (Step 5 lean ~93K vs Step 6 question ~2.7K, both ~99.8%+ within-prefix hit); γ: Step 6 wall ~135 min vs 1 day → **−84%** (6th consecutive Module A+B under-estimate by 84%+); observability: deepseek-reasoner call #3 emitted 0 delta frames (Hypothesis A: R1 produced reasoning-only output, `text` chunks empty + stripped by `chat.ts:115 if (chunk)` filter) — UX gap but data still captured via usage frame | **β**: cache discipline ratified at second scope size (D-088 §2.3 invariant cross-scope). **γ**: D-094 §2.4 6th data point → PLAN.md Step 6 wall column inline `actual ~135 min` amend pattern continues (no full re-estimate); 30% threshold mechanism still healthy. **D-098 §2.2 v1.1 in-place amend** done same turn (predicted ~58-60K, actual 92,814 = +55% off; note appended to ADR per D-080 v1.1 §8 pattern). **assembleScope.ts chars/4 → chars/3 calibration** applied (in-source comment refresh, no D-NNN). **observability**: empty-delta on reasoner deferred to Step 7+ as either (a) add reasoningStream consumption, (b) emit warning frame on empty tail, (c) provider-role retune; NOT a fire — documented in `evidence/phase2/step_06_quiz/cache_audit_2026-05-20.md` §3.2. |
| 2026-05-20 | **β + γ + Module B 收官**, Session 39 Step 7 | β: N=3 hover cache hit at smallest scope — call #1 `アルゴリズム` cold creation (400 miss / 0 hit) / call #2 same `アルゴリズム` (384 hit / 16 miss = **96.0% hit** at 400-tok scale) / call #3 different `データベース` (391 miss / 0 hit cross-surface creation) — **N=5 cumulative β data ratify D-088 §2.3 stable-prefix invariant across 232× scope range (400 → 93K tok)**; γ: Step 7 wall ~90 min vs 1 day → **−81%** (7th consecutive Module A+B under-estimate by 80%+; Module B average drift −84% across 4 data points, converging from [−85,−86] in Steps 4-5 to [−84,−81] in Steps 6-7 = "implementation cruise" pattern); R1 empty-delta carry-over: sidestepped by Q2=a `deepseek-chat` choice (deferred to design 4Q at next reasoner usage) | **β**: D-088 §2.3 stable-prefix invariant ratified at smallest scope (96.0% ≫ 50% threshold; finer-grained relative miss at small scale is intuitive); D-091 §2.5(β) tripwire **no fire**. **γ**: D-094 §2.4 7th data point + Module B 收官 path — PLAN.md Step 7 wall column inline `actual ~90 min` amend continues; **Module C+D full re-estimate decision: NO this turn**, deferred to Step 9 mid-implementation retro (rationale: Module B drift is API-wiring-specific velocity multiplier; UI work is structurally different and needs its own first data point per `evidence/phase2/step_07_glossary/cache_audit_2026-05-20.md` §6.1); 30% threshold mechanism still healthy. **chars/N decision (Q3=a bundled)**: KEEP universal chars/3 (no per-scope split); `assembleScope.ts` header comment updated to N=4 data table (in-source amend pattern, no D-NNN). **Module B 收官**: 4/4 ✅ — `/api/{hello-ai,chat,quiz/explain,glossary/hover}` all LIVE on prod canonical; Phase 2 真 billed $0.0515 cumulative vs $5 cap (97× headroom); 0 Rule B archive this Step. |

---

## Append rules

1. Date format: ISO `YYYY-MM-DD`.
2. Trigger column: one of `α` / `β` / `γ` / `δ` / `ε` per D-091 §2.5 plus a short hint.
3. Data points: the evidence that fired the trigger (file / commit / step number).
4. Resolution: ADR id + one-line summary; link to evidence dir.

Sub-ADR amend in-place is preferred over supersede chain for minor numerical drift — per D-080 v1.1 §8 pattern recurring in this project.
