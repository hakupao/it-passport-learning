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

---

## Append rules

1. Date format: ISO `YYYY-MM-DD`.
2. Trigger column: one of `α` / `β` / `γ` / `δ` / `ε` per D-091 §2.5 plus a short hint.
3. Data points: the evidence that fired the trigger (file / commit / step number).
4. Resolution: ADR id + one-line summary; link to evidence dir.

Sub-ADR amend in-place is preferred over supersede chain for minor numerical drift — per D-080 v1.1 §8 pattern recurring in this project.
