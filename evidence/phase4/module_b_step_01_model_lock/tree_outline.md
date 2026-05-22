# Phase 4 Module B Step B.1 — tree outline

> Anthropic tutor model lock (Sonnet 4.6 default / Opus 4.7 escalation) +
> typed `getTutorModel` selector + `getModel("tutor")` routing.
> Pure typing + selector — no LLM cost. Module B Step B.3 cost dry-run
> is the first turn that exercises the real Anthropic endpoint and is
> gated on explicit user approval per CLAUDE.md.

## Changed files (MOD only — no NEW)

```
apps/web/src/lib/ai/provider.ts
  + ModelRole extended with "tutor"
  + ANTHROPIC_TUTOR_DEFAULT_MODEL_ID = "claude-sonnet-4-6"
  + ANTHROPIC_TUTOR_ESCALATION_MODEL_ID = "claude-opus-4-7"
  + GetTutorModelOptions interface (escalate?: boolean)
  + getTutorModel(options) — anthropic-pinned (ignores LLM_PROVIDER)
  + DeepseekRole = Exclude<ModelRole, "tutor"> + DEEPSEEK_MODEL_BY_ROLE typed against it
  + getModel routes "tutor" → getTutorModel() before provider switch

apps/web/src/lib/ai/__tests__/provider.test.ts
  + import getTutorModel
  + 2 new getModel cases (tutor regardless of provider arg / tutor ignores env)
  + new describe block "getTutorModel — D-102 §7.2 + D-103 §2.4" (3 cases)
```

## Test count delta

Pre-B.1 baseline: 19 (provider.test.ts).
Post-B.1: 25 = +6 (2 in getModel + 3 in getTutorModel; one was a refactor
that became a defensive default-vs-explicit-false assertion → no net rename).

## Cost ledger

- B.1 LLM API calls fired: **0**
- B.1 cumulative Phase 4 spend: **\$0.00**
- D-103 \$15 cap headroom: unchanged from Module A close — full envelope still available.
