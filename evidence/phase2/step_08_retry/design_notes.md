# Step 8 — design notes (1-retry-no-fallback + δ-all-tripwire detector)

Session 40 D-019 §3a 4Q answers + their mapping into code.

## 1. 4Q decisions

| Q | Selected | Code location |
|---|---|---|
| Q1 | **α** = Step 8 first (close Module B 5/5 before Module C UI) | This step |
| Q2 | **b** = retry middleware at `provider.ts` factory layer | `apps/web/src/lib/ai/retry.ts` (`STREAM_CONFIG`) used by 4 routes |
| Q3 | **a** = δ-tripwire log-only (server console + evidence file) | `apps/web/src/lib/ai/tripwire.ts` (`recordTripwireEvent` → `console.warn`) |
| Q4 | **a** = Batch A-G straight-through + commit/push user gate | Sessions 35-39 pattern preserved |

## 2. Retry layer (D-088 §2.4)

D-088 §2.4 diagram: `initial call → fail → exponential backoff (2s/4s) → 1 retry → fail → surface error`.

AI SDK v6 `streamText` accepts `maxRetries` (= retries beyond the initial call). The match-up:

| D-088 §2.4 attempts | AI SDK `maxRetries` value |
|---|---|
| 2 total (1 initial + 1 retry) | **1** |
| 3 total (default SDK behavior, not D-088 compliant) | 2 (SDK default — superseded) |
| 1 only (no retry) | 0 (rejected per D-088 §4.4 too brittle) |

**Implementation**: `STREAM_CONFIG.maxRetries: 1` exported from `apps/web/src/lib/ai/retry.ts`, imported and passed to `streamText` in each of the 4 endpoints. Exponential backoff is handled inside the AI SDK; the project does not implement a custom retry loop.

**No fallback retained** per D-088 §2.4 + D-095 §2.4: same model on retry, no cross-model Plan B. User-facing terminal-failure surface: `「AI 暂时不可用，请稍后重试。」` written into `buildChatSseResponse`'s catch branch via `formatUserFacingError(err)`. The raw error is still `console.error`'d for `vercel logs` debug visibility (kept separate from the user-facing surface).

**`isRetryableError(err)` classifier**: documents which error shapes the SDK retry layer is expected to recover from (5xx / 429 / overloaded / network / timeout). NOT in the hot path — the SDK handles its own retry internally — but exported for future custom retry wrappers and for unit-test coverage of the policy intent.

## 3. Tripwire layer (D-088 §2.4 "δ-all-tripwire detector" + D-091 §2.5(β))

PLAN.md Step 8 mentions a "δ-all-tripwire detector" per D-088 §2.4. Mapping into runtime semantics:

- **D-088 §2.5** defines a 4-condition meta-monitor (α / β / γ / annual floor) labelled δ because it watches "all" conditions together. Three of the four are out-of-band (manual flags, no runtime signal). Only β (cache hit rate < 50%) is runtime-observable.
- **D-091 §2.5** has its own α/β/γ/δ/ε labels (different from D-088's). The intersection that's actually detectable from a per-call vantage is again D-091 §2.5(β) — cache hit rate floor.

This step implements the runtime-observable arm — β (cache hit rate) — and explicitly documents the rest as out-of-band (`tripwire.ts` module comment block lists each excluded trigger and why).

**Detector decisions** (per Q3=a):

| Aspect | Decision | Rationale |
|---|---|---|
| Surface | Server console only (`console.warn('[tripwire]', payload)`) | α-silent envelope per D-090; UI surface deferred to Step 13 |
| Sink | `vercel logs --json` filter post-hoc | No file write (read-only FS on Vercel serverless) |
| Threshold | 50% per D-091 §2.5(β) | `CACHE_HIT_RATE_FLOOR = 0.5` |
| Min input | 1000 tokens | Suppresses false-positive on tiny smoke calls (e.g. /api/hello-ai ping at 57K but hover at ~400 tok would be noisy without floor) |
| Cold-creation events | Logged as `cache_low_hit` | Detector cannot distinguish cold-creation from regression in isolation; sift in evidence review |
| Unknown provider metadata | Logged as `cache_no_data` | Catches future provider migrations that change metadata shape |

## 4. Wiring summary

```
streamText({
  model: getModel("hover"),
  maxRetries: STREAM_CONFIG.maxRetries,    // D-088 §2.4
  messages: buildMessagesWithStablePrefix(... ),
  onFinish: ({ usage, providerMetadata }) => {
    console.log("[hover]", ...);
    const tripwire = evaluateCacheTripwire({  // D-091 §2.5(β)
      usage: readCacheUsage(providerMetadata),
      totalInputTokens: usage.inputTokens ?? null,
      route: "/api/glossary/hover",
    });
    if (tripwire !== null) recordTripwireEvent(tripwire);  // Q3=a log-only
  },
});
```

Same shape applied to `/api/chat`, `/api/quiz/explain`, `/api/glossary/hover`, `/api/hello-ai`.

## 5. Failure-mode coverage (Rule A audit input)

| Failure mode | Coverage path |
|---|---|
| Transient network blip | AI SDK internal retry (maxRetries=1 → 2 attempts) |
| Provider 5xx / 429 / overloaded | AI SDK internal retry (same as above) |
| Both attempts fail | `buildChatSseResponse` catch branch → SSE error frame with locked Chinese message |
| Cache hit rate < 50% on ≥1000 tok call | tripwire `cache_low_hit` console.warn line |
| Cache hit rate ≥ 50% (healthy) | tripwire returns null → silent |
| Sub-threshold input (< 1000 tok) | tripwire returns null → silent (avoids hover-call noise) |
| Provider metadata is unknown shape | tripwire `cache_no_data` console.warn line |

## 6. Not implemented this step (deferred)

- **UI surface for tripwire / retry events** → Step 13 (D-090 cap dashboard widget)
- **`isRetryableError` as a hot-path classifier** → currently documentation-only; if custom retry wrapper becomes necessary (e.g. AI SDK retry behavior changes), this classifier is the seed
- **R1 empty-delta UX gap from Session 38** → still deferred; the cold quiz smoke (#5) page_259_entity_0 emitted 985 output tokens, so this run did NOT reproduce the empty-delta finding. The fix path remains: add `reasoningStream` consumption OR emit warning frame on empty tail. Will resolve at next dedicated reasoner-role design pass (Module C quiz UI most likely)
