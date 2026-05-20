# D-100 — Phase 2 cap counter persistence via Upstash Redis

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 45 Turn 3 user terminal sign-off `Q1=a Q2=a Q3=a Q4=a` blanket-ACK (fourth consecutive Phase 2; Sessions 41/43/44/45) 2026-05-20 |
| 锁定 session | `docs/discussion/2026-05-20-session-45.md` |
| 类型 | sub-ADR of **D-090 §2.1** (cap implementation persistence layer; D-090 explicitly defers accounting source to Phase 2 实施 retro — this ADR closes that gap) |
| 颗粒度 | g2 mid level (counter store provider + package + env var contract + graceful-degradation rule; does NOT lock UI dashboard shape (β optional per D-090 §2.3) nor specific pricing constants (acceptable drift per LD-9)) |
| 前置 ADR | D-090 (Phase 2 cost cap shape) / D-093 (apps/web location) / D-095 (provider switch) / D-097 (firewall sequencing) / D-099 (i18n stack add — same architectural-add pattern) |

---

## 1. Context

D-090 §2.1 锁了 daily $5/$15/$30 三档 cap + per-query $5 hard cap，并 explicitly defer accounting source 到 Phase 2 实施 retro：

> "单 session shadow cost 累计写 localStorage / cookie；用户跨设备不同 bucket（α-now single user 单设备主体，β-ready 切真 auth 后改 server-side accounting）"
>
> "Reset 行为推 Phase 2 实施 retro 细化"

D-090 §2.2 (α-silent log only) means accounting is **visibility** not **enforcement** in α — but the visibility must still be durable across:
- Vercel serverless cold starts (lambda restarts every few minutes under low traffic)
- Multi-instance fan-out (concurrent requests land on different lambdas)
- Day rollover (JST 00:00 reset semantics per D-090 §2.1)

In-memory accounting fails all three. localStorage / cookie fails (1) cross-instance and (2) cross-device. A persistent KV store at server side is necessary.

D-088 §5.2 + D-090 §1 risk note ("β cost spike Opus 5× Sonnet at multi-user scale") elevates persistence to a **gate-on-β** requirement: the same wiring that gives α-silent visibility becomes the β-mode active enforcement substrate. Implementing it now via the right pattern preserves β graduation as a constant flip (per D-090 §2.3 already-locked α-↔-β switch).

Session 45 Turn 1 4Q ACK locked Q3=a "Vercel KV (Upstash Redis)". Turn 2 Context7 audit (`/vercel/storage` + `/websites/upstash_redis`) surfaced two facts that this ADR codifies:

1. **`@vercel/kv` is DEPRECATED as of 2026** ("Vercel Storage > Deprecated Packages" README quote: "@vercel/postgres and @vercel/kv are deprecated, and the associated products are no longer supported"). Vercel's recommended migration: "for KV, the recommended path is to use Upstash Redis."
2. **Vercel Marketplace** still provides 1-click Upstash Redis provisioning that wires the standard `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` env vars automatically — only the consuming package name changes from `@vercel/kv` to `@upstash/redis`.

---

## 2. Decision

### 2.1 Counter store = Upstash Redis (HTTP REST backend)

**Lock**: cap rolling-day counter persists in an Upstash Redis instance provisioned via Vercel Marketplace integration.

Storage shape:
- Key: `phase2:cap:day:YYYY-MM-DD-JST` (one key per JST day per D-090 §2.1; ISO-like slug human-readable for `vercel logs --grep` cross-referencing)
- Value: integer micro-USD spent so far in that JST day (cumulative across all 4 /api routes)
- TTL: 172800s (48h, 2× window — absorbs clock skew + lets day-boundary calls land in correct bucket; old keys auto-evict so storage stays O(1) keys × ~10 day window worst case)
- Atomic update: `INCRBY key delta_microUSD` + (first call only) `EXPIRE key 172800`

**Reasoning**:
- Upstash Redis HTTP REST works in Node.js runtime AND Vercel Edge runtime AND browser (only Node is currently used by the 4 /api routes per their `export const runtime = "nodejs"` declaration, but Edge compatibility removes a future-migration block)
- `INCRBY` is atomic — concurrent writes from different lambdas can't lose updates (vs. a read-modify-write pattern on in-memory or filesystem)
- TTL auto-cleanup → no orphan keys, no manual maintenance
- Vercel Marketplace integration handles env-var injection automatically — no manual `vercel env add` per environment
- HTTP REST means no connection pooling pain (unlike TCP-based Redis) — suits serverless invocation model

### 2.2 Package = `@upstash/redis` (NOT deprecated `@vercel/kv`)

**Lock**: use the upstream `@upstash/redis` package, NOT the deprecated `@vercel/kv` wrapper.

Import shape:

```ts
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();  // reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
```

**Reasoning**:
- `@vercel/kv` deprecated per Vercel Storage README Turn 2 quote
- Vercel's own migration guide explicitly recommends `@upstash/redis` as the successor
- `@upstash/redis` is maintained by Upstash directly (the underlying provider); fewer abstraction layers; future API changes propagate without an intermediate-package lag
- Same env vars are wired by the Vercel Marketplace 1-click integration regardless of consuming package, so the pivot is a pure import-name change with zero ops surface change

### 2.3 Env var contract

**Lock**: code reads exactly these two env vars; no others; no fallback to alternate names:

- `UPSTASH_REDIS_REST_URL` — `https://<region>-<slug>.upstash.io`
- `UPSTASH_REDIS_REST_TOKEN` — opaque bearer token

Set automatically by Vercel Marketplace Upstash integration on:
- preview + production environments (out of the box)
- local dev: pulled via `vercel env pull` into `apps/web/.env.local` (gitignored) — same pattern as `FIREWALL_BASIC_AUTH` + `DEEPSEEK_API_KEY` per D-097 + D-095

**No alternative reads**: no `KV_REST_API_URL` (deprecated naming) / no `REDIS_URL` (TCP form not used) / no `VERCEL_KV_*` (deprecated package's naming).

### 2.4 Graceful degradation contract

**Lock**: when `UPSTASH_REDIS_REST_URL` and/or `UPSTASH_REDIS_REST_TOKEN` is absent at runtime, the cap module MUST NOT crash any /api route. Specifically:

| Condition | Behaviour |
|---|---|
| Both env vars present | Normal: per-call cost logged + counter INCRBY + threshold-breach log |
| Either env var absent | Degraded: per-call cost still logged (visibility preserved); cross-call rolling counter unavailable; single `console.warn '[cap-degraded]'` emitted **once at module load** (NOT per call — would flood logs) |
| Redis call throws (network, 5xx, auth) | Logged as `console.warn '[cap-redis-error]'` with truncated reason; route serves normally |

**Reasoning**:
- Cap is α-silent **visibility**, not **enforcement**: degraded mode loses persistence but not service
- Routes must NEVER 500 because of an external KV outage — the call already costs money; refusing to serve compounds the loss
- One-shot degraded log preserves visibility of the misconfiguration without log spam
- This contract is verifiable via vitest with the `RedisLike` interface set to `null` in test deps

### 2.5 Cost envelope under Upstash free tier

**Lock**: $0 monthly cost under α single-user traffic projections.

Upstash free tier (as of 2026-05-20 Context7 verification): 10,000 commands/day + 256 MB storage + 100k commands/month.

α traffic projection per Phase 2 evidence cumulative $0.0824 真 billed across 9 sessions (Sessions 36-44) ≈ ~250 真 LLM calls total ≈ ~30 calls/day average even during active development. Cap operations per call = 2 (INCRBY + initial EXPIRE; EXPIRE skipped on subsequent calls within the same day): ≤ 60 Upstash commands/day at α traffic, ≤ 1800 commands/month. 167× headroom on monthly free-tier ceiling.

β cost projection (post-D-092 OQ-40 close): Even at 100× α traffic (multi-user β open), cap operations stay below 10k/day. β graduation to paid tier ($0.20/100k commands) would cost ~$0.04/month — negligible vs. β LLM bill.

### 2.6 Reversibility

**Lock**: cap module exports `RedisLike` interface; production `loadRedisFromEnv()` returns `@upstash/redis` instance; tests inject mocks; future provider swap (e.g. to Cloudflare KV / native Vercel Storage replacement / Postgres CDN) is a single-file change to `loadRedisFromEnv()` body without touching the 4 /api routes.

**Reasoning**:
- D-099 i18n stack add (Sessions 44 lock) established the "infra add via standalone ADR with reversibility clause" pattern
- Phase 3+ may move counter to a different store (e.g. when auth+user-identity ships per D-092 path α); reversibility is intentional

---

## 3. Rejected alternatives

| # | Alternative | Reason rejected |
|---|---|---|
| 1 | **In-memory ephemeral per-lambda var** | Resets on every cold start (Vercel serverless = cold starts every few minutes under low traffic); fan-out across instances loses cross-instance state; counter near-useless for 24h rolling per LD-3 sub-discussion |
| 2 | **`@vercel/kv` deprecated package** | Deprecated 2025-2026 per Vercel Storage README Turn 2 quote; package no longer maintained; migration explicitly recommended by Vercel itself |
| 3 | **Filesystem `/tmp` per-lambda** | Same cold-start + fan-out issues as in-memory; no atomicity (two concurrent writes race); Vercel `/tmp` is per-invocation-ephemeral on Edge runtime anyway |
| 4 | **Vercel KV via raw REST (no SDK)** | Same underlying Upstash service, but loses type safety + `fromEnv()` ergonomics + connection retry logic of `@upstash/redis`; not worth saving one direct dep |
| 5 | **Per-request header-passing of running total** | Stateless approach: each client carries the cumulative cost in a cookie/header. Fails (a) cross-device per D-090 §2.1 already-noted, (b) cross-session before auth lands per D-092, (c) client can spoof to bypass the cap visibility (β concern even though α-silent doesn't gate) |
| 6 | **Cloudflare KV / Workers KV** | Different vendor stack from Vercel host (D-093 = apps/web on Vercel); adds vendor sprawl; CF KV has eventually-consistent reads which makes INCRBY semantics fuzzy under fan-out; no Vercel Marketplace 1-click ops |
| 7 | **Vercel Edge Config** | Read-optimised, NOT a counter store — writes go through a separate API with latency on order of seconds (per Vercel docs Turn 2 Context7); INCRBY not supported; wrong tool for the job |

---

## 4. Implementation footprint

| File | Add/Mod | Lines | Note |
|---|---|---|---|
| `apps/web/package.json` | mod | +1 dep | `"@upstash/redis": "^1.x"` |
| `apps/web/src/lib/ai/cap.ts` | new | ~180 | core module per LD-1..10 |
| `apps/web/src/lib/ai/__tests__/cap.test.ts` | new | ~250 | unit tests w/ RedisLike mock |
| `apps/web/src/app/api/{chat,quiz/explain,glossary/hover,hello-ai}/route.ts` | mod | +3 each (12 total) | `recordCapEvent` call in onFinish |
| Vercel Marketplace Upstash integration | ops | n/a | user-gated provisioning out-of-band |

---

## 5. Verification (Step 13 close)

| # | Check | How |
|---|---|---|
| 1 | Code compiles | `tsc --noEmit` clean |
| 2 | Tests pass | `vitest run` → 237+N/237+N green |
| 3 | ESLint clean | `pnpm lint` |
| 4 | Next build green | `next build --turbopack` |
| 5 | Degraded mode safe | unit test with `redis: null` in deps → routes don't crash |
| 6 | Provisioning gate held | NO Upstash provisioning + NO deliberate spend in this session per CLAUDE.md "What you should NOT do without explicit user approval" |

Session 46 (post-provisioning) will add:
- Cap-trigger deliberate spend smoke: trigger ≥ 100 cents = $1.00 wall in a single deliberate call → log shows `[cap-breach]`; ~$0.005 budgeted
- Prod deploy with `UPSTASH_REDIS_REST_*` env vars set
- Vercel logs grep evidence: `vercel logs --grep '\[cap'`

---

## 6. Related ADRs

- **D-090** — Phase 2 LLM cost cap (this ADR is its persistence-layer sub-ADR)
- **D-093** — apps/web location (the cap module lives there)
- **D-095** — Provider switch (per-provider pricing table in cap.ts cites D-095 model matrix)
- **D-097** — Firewall middleware (cap operates after firewall passes; cap doesn't gate request entry, only telemetry exit)
- **D-099** — i18n stack add (same "architectural infra add as standalone ADR" pattern; D-100 mirrors structure)

---

## 7. History

| Session | Turn | Event |
|---|---|---|
| 30 (2026-05-19) | 4 | D-090 LOCKED (Phase 2 cost cap shape; defers persistence to Phase 2 implementation retro) |
| 44 (2026-05-20) | close | Module C 4/4 COMPLETE; Session 45 entry plan cataloged 4Q for Step 13 cap implementation |
| 45 (2026-05-20) | 1 | 4Q user ACK `a/a/a/a` (4th consecutive Phase 2 blanket-ACK after Sessions 41/43/44) |
| 45 (2026-05-20) | 2 | Context7 audit → `@vercel/kv` deprecated → pivot to `@upstash/redis` |
| 45 (2026-05-20) | 3 | D-100 LOCKED (this file) |
