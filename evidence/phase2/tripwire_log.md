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

---

## Append rules

1. Date format: ISO `YYYY-MM-DD`.
2. Trigger column: one of `α` / `β` / `γ` / `δ` / `ε` per D-091 §2.5 plus a short hint.
3. Data points: the evidence that fired the trigger (file / commit / step number).
4. Resolution: ADR id + one-line summary; link to evidence dir.

Sub-ADR amend in-place is preferred over supersede chain for minor numerical drift — per D-080 v1.1 §8 pattern recurring in this project.
