# Phase 4 Module B Step B.4 — tree outline

Session 57 atomic commit lands the `/api/tutor` route + D-105 Phase 2
four-route legacy → V4-flash migrate in a single sitting per PLAN.md §1
B.4 row + D-105 §2.4 ordering.

## Files modified

| Path | Change |
|---|---|
| `apps/web/src/lib/ai/provider.ts` | MOD — `DEEPSEEK_MODEL_BY_ROLE` table flipped from {deepseek-chat, deepseek-reasoner} to `deepseek-v4-flash` (all 4 roles); new `getPhase2ProviderOptions(role)` helper dispatches per-role `providerOptions.deepseek.thinking.type` (chat/hover/smoke disabled; quiz enabled+high); local `ProviderOptionsShape` type alias added (LD-Module-B-15-A — no `@ai-sdk/provider-utils` direct dep); `getTutorProviderOptions` return type tightened to same shape; docstrings updated. |
| `apps/web/src/lib/ai/cap.ts` | MOD — new `PRICING_DEEPSEEK_V4_PRO` + `PRICING_ANTHROPIC_SONNET` frozen tiers (D-104 §2.1 defaults); `pricingFor()` extended to dispatch `tutor` role to the new tiers (LD-Module-B-15-B). Phase 2 routes unchanged (V4-flash thinking-disabled = legacy `deepseek-chat` pricing per Context7 mapping). |
| `apps/web/src/app/api/chat/route.ts` | MOD — added `providerOptions: getPhase2ProviderOptions("chat")` to `streamText` call; import added. |
| `apps/web/src/app/api/quiz/explain/route.ts` | MOD — added `providerOptions: getPhase2ProviderOptions("quiz")` to `streamText` call; GET docstring updated for new model line; import added. |
| `apps/web/src/app/api/glossary/hover/route.ts` | MOD — added `providerOptions: getPhase2ProviderOptions("hover")` to `streamText` call; GET docstring updated; import added. |
| `apps/web/src/app/api/hello-ai/route.ts` | MOD — added `providerOptions: getPhase2ProviderOptions("smoke")` to `streamText` call; import added. |
| `apps/web/src/lib/ai/__tests__/provider.test.ts` | MOD — +9 new cases: `getPhase2ProviderOptions` dispatch (chat/hover/smoke/quiz/Anthropic-safe shape) + getModel-returns-v4-flash for all roles. |
| `apps/web/src/lib/ai/__tests__/cap.test.ts` | MOD — `pricingFor` test reorganised for tutor dispatch (+4 cases) + new `PRICING_DEEPSEEK_V4_PRO` + `PRICING_ANTHROPIC_SONNET` shape sanity (+2 cases). |

## Files created

| Path | Purpose |
|---|---|
| `apps/web/src/app/api/tutor/route.ts` | NEW — Phase 4 `/api/tutor` POST handler + GET docstring. `streamText` with `getTutorModel` + `getTutorProviderOptions` + `buildTutorMessages` (from B.2); AI SDK v6 `toUIMessageStreamResponse` (useChat-compatible); `onFinish` wires tripwire + cap. maxDuration=60s (tutor V4-pro thinking:high latency ~28-31s/call observed B.3). D-097 firewall gates this route same as Phase 2. |
| `apps/web/src/lib/ai/tutorRequest.ts` | NEW — `validateTutorRequestBody` extracted from the route module so it can be unit-tested without violating Next.js route-export restrictions (LD-Module-B-16). |
| `apps/web/src/app/api/tutor/__tests__/route.test.ts` | NEW — 17 cases: request-body validation (9 paths), GET docstring (3 provider variants), POST 400 paths (3 validation rejections), and OpenAI reserved-stub throws on POST (1 case). |
| `evidence/phase4/module_b_step_04_tutor_endpoint_d105_migrate/tree_outline.md` | NEW — this file. |
| `evidence/phase4/module_b_step_04_tutor_endpoint_d105_migrate/design_notes.md` | NEW — LD-Module-B-15/16 in-source amendment notes + γ row + Rule A/B/C/D disposition. |
| `evidence/phase4/module_b_step_04_tutor_endpoint_d105_migrate/summary.md` | NEW — Module B Step B.4 outcome summary. |
| `evidence/phase4/module_b_step_04_tutor_endpoint_d105_migrate/build_log.txt` | NEW — `pnpm exec next build` output. |
| `evidence/phase4/module_b_step_04_tutor_endpoint_d105_migrate/test_results.txt` | NEW — `pnpm exec vitest run` output. |
| `docs/discussion/2026-05-22-session-57.md` | NEW — session journal. |

## Files NOT modified (D-085 §2.4 frozen surface preservation verified)

- `apps/web/src/middleware.ts` (D-097 firewall — untouched; tutor route sits behind same Basic Auth gate)
- `apps/web/src/lib/ai/chat.ts` (buildChatSseResponse SSE encoder — untouched; tutor route uses AI SDK UI message stream like /api/chat)
- `apps/web/src/lib/ai/tutorPrompt.ts` (B.2 SYSTEM + buildTutorMessages — untouched; B.4 consumes as-is)
- `apps/web/src/lib/ai/tripwire.ts` (β + γ tripwire framework — untouched; tutor route registers `/api/tutor` events)
- `apps/web/src/lib/ai/retry.ts` (single-retry + user-surface error — untouched; tutor route reuses)
- All client components (Phase 3 trunk) untouched per D-101 §2.5 composition-only intent
- `apps/web/e2e/*.spec.ts` (Playwright Phase 2+3 battery — untouched; Module D adds tutor specs)
