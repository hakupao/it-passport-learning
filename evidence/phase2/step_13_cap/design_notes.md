# Step 13 — Design notes (Session 45)

## 4Q slow-pace (per D-019 §3a) — locked

| Q | Topic | Choice | One-liner |
|---|---|---|---|
| Q1 | Cap axis | a) Per-query + per-day combined | Two-tier defence; per-query wall ($1) refuses outliers + daily rolling counter ($5 JST) tracks cumulative against D-090 §2.1 α cap. |
| Q2 | Cap mode | a) silent-log only (α-silent per D-090 §2.2) | `console.warn '[cap]'` on threshold breach; serve request anyway. Visibility, not enforcement. |
| Q3 | Counter store | a) Vercel KV (Upstash Redis) | Cross-instance persistent; Upstash free tier 10k/day × 167× headroom at α traffic. |
| Q4 | UI surface | a) Server log only — no UI in α | Pure `console.warn` to stdout; visibility via Vercel logs grep. |

**Fourth consecutive Phase 2 blanket-ACK** after Sessions 41 (Step 9), 43 (Step 11), 44 (Step 12). Established Phase 2 pattern for design-pre-locked-by-prior-ADR steps.

## LDs (in-source amendments per D-094 §2.1)

| LD | Decision | Where |
|---|---|---|
| LD-1 | Cap module = `apps/web/src/lib/ai/cap.ts` (mirrors tripwire.ts pattern) | cap.ts header |
| LD-2 | Counter increment in `onFinish` hook (post-stream, alongside tripwire) | 4 /api routes |
| LD-3 | Counter unit = μUSD integer; daily $5 cap = 5_000_000 μUSD | cap.ts constants |
| LD-4 | Day key = `phase2:cap:day:YYYY-MM-DD-JST` | cap.ts `formatJstDayKey` |
| LD-5 | Redis EXPIRE 172800s (48h, 2× window) | cap.ts constants |
| LD-6 | Per-query wall = 100 cents = $1.00 (tighter than D-090 §2.1 hard $5 — α-silent makes wall a logging trigger not blocker) | cap.ts constants |
| LD-7 | `PHASE2_CAP_MODE` env: silent-log (α default) / warn / confirm / halt (β-future stubs with `[cap-mode-stub]` annotation) | cap.ts `getCapMode` + `recordCapEvent` β annotation |
| LD-8 | Graceful degradation: missing UPSTASH env → log once + serve normally | cap.ts `loadRedisFromEnv` |
| LD-9 | Pricing table inline + provider-aware (DeepSeek chat/reasoner / Anthropic Opus) | cap.ts pricing constants |
| LD-10 | RedisLike interface injected via `CapDeps` for test isolation | cap.ts `CapDeps` + tests use mocked Redis |

## Turn 2 Context7 audit findings (critical pivot)

Per D-019 §3a "你来定" obligation, consulted `/vercel/storage` (Context7 lib id).

**Surfaced**: `@vercel/kv` is **DEPRECATED** as of 2026 — quoted from `https://github.com/vercel/storage/blob/main/README.md`:

> "The packages @vercel/postgres and @vercel/kv are deprecated, and the associated products are no longer supported. Users can find alternative storage solutions through the Vercel Marketplace as native integrations."
>
> "For Postgres, users can transition to Neon database solutions, while for KV, the recommended path is to use Upstash Redis."

**Pivot**: Q3=a "Vercel KV (Upstash Redis)" semantically correct but package surface changes from deprecated `@vercel/kv` → upstream `@upstash/redis`. Same Upstash Redis backend; Vercel Marketplace 1-click integration still wires the standard env vars; only the consuming Node package name differs.

**Verified `@upstash/redis` API** via `/websites/upstash_redis` Context7 lib id:
```ts
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
const count = await redis.incrby("counter", 122);
await redis.expire("counter", 172800);
```

Standard env vars: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. REST-based HTTP client; works in Node + Edge + browser.

## D-100 ADR essence (locked this session)

- §2.1 counter store = Upstash Redis HTTP REST
- §2.2 package = `@upstash/redis` (NOT deprecated `@vercel/kv`)
- §2.3 env contract = exactly 2 env vars (no fallback naming)
- §2.4 graceful degradation (missing env → log + serve)
- §2.5 cost envelope $0 under free tier (10k/day × 167× α-headroom)
- §2.6 reversibility via RedisLike interface

7 rejected alternatives documented.

## Implementation approach

1. **cap.ts module first** (TDD-style) — pure functions for cost estimation + JST formatting; Redis adapter with deps injection
2. **40 unit tests** covering constants + pricing dispatch + cost math + day-key boundary + env switch + degradation + happy path + wall/breach detection + Redis error handling + β mode stubs
3. **4 /api route wiring** as additive `void recordCapEvent({...})` after `recordTripwireEvent(...)` — no refactor of existing tripwire path
4. **Full pipeline check** vitest 277/277 + tsc clean + ESLint clean + Next build green

## What was NOT done this session (held at user gate)

Per CLAUDE.md "What you should NOT do without explicit user approval":

- (i) **Vercel Marketplace Upstash Redis provisioning** — manual dashboard click to provision the instance + set the integration
- (ii) **Env var pull** to local `apps/web/.env.local` + Vercel preview + production
- (iii) **Deliberate ~$0.005 真 LLM cap-trigger smoke** to generate `[cap-wall]` + `[cap-breach]` log evidence for Rule A audit

These three items open Session 46 entry actions under explicit user gate.

## Why "pure-backend wire-in" sub-regime (γ tripwire 13th data point)

Step 13 actual ~95 min vs adjusted estimate 2.3h = 138 min → **−31% drift**.

This is materially different from:
- Module A scaffold pattern (−98% trivial)
- Module B "implementation cruise" (−81 to −86%)
- Module C bootstrap (−85% × 2)
- Module C structural-diversion (−58% × 2)

The Step 13 work was:
- D-090 already fully pre-locked Session 30 (4 months prior) — zero design overhead
- Existing tripwire.ts pattern provided 1:1 template — clone-adapt
- No UI surface — no Suspense / hydration / locale / a11y considerations
- 4 routes share identical wire-in shape — copy-paste 4×

Outcome: a "pure-backend wire-in" sub-regime sitting between Module B clone-adapt (−81 to −84%) and Module C structural-diversion (−58%). At N=1 Module D data point, no re-estimate triggered. Steps 14 + 15 will give N=3 Module D data; Session 44 lock on Module D = ~5.7h remains in effect.

## Risk flags carried into Session 46

- (i) Upstash Marketplace 1-click flow may have UI changes since Vercel ops doc snapshots; verify env vars actually land
- (ii) Cap-trigger smoke: a deliberately expensive call needs to cross $1.00 wall — easiest path is a whole-book Opus uncached chat call (~$1.37 estimated). Have a $5 backstop tolerance for retries.
- (iii) Prod deploy with new env vars: confirm `vercel env ls` shows both `UPSTASH_REDIS_REST_*` for preview + production scopes
- (iv) Redis call latency may add 20-100ms to lambda close time; acceptable α-visibility tradeoff

## Carry-over to Step 14 (per Session 44 PLAN.md)

- Lighthouse audit ≥ 90 mobile+desktop
- a11y smoke
- 1 minor zh `QuizExplain.busyText` verb-choice polish from `step_12_audit.md §3 Sample 5`
- i18n catalog completion (already mostly done in Step 12)
