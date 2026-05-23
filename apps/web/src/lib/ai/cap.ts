// Phase 2 Step 13 — D-090 cap implementation per D-100 ADR (Session 45).
//
// LOCKED design (Session 45 Turn 1 4Q user ACK `a/a/a/a`):
//   Q1=a  per-query wall ($1.00) + per-day rolling counter ($5.00, JST 00:00)
//   Q2=a  PHASE2_CAP_MODE = silent-log (α default; β stubs for warn/confirm/halt)
//   Q3=a  counter store = Upstash Redis via @upstash/redis (D-100; Vercel KV
//         pkg deprecated 2026 per Turn 2 Context7 audit)
//   Q4=a  surface = server log only (no UI in α; admin dashboard β-optional)
//
// LDs (per D-094 §2.1 in-source amend; see session-45.md §1):
//   LD-1  this file = `apps/web/src/lib/ai/cap.ts` (mirrors tripwire.ts)
//   LD-2  invoked from onFinish hooks alongside existing tripwire eval
//   LD-3  counter unit = μUSD integer; daily $5 cap = 5_000_000 μUSD
//   LD-4  day key = `phase2:cap:day:YYYY-MM-DD-JST`
//   LD-5  Redis EXPIRE 172_800s (2× window)
//   LD-6  per-query wall = 100 cents = $1.00 (tighter than D-090 §2.1 hard
//         per-query $5 because α-silent makes wall a *logging trigger* not a
//         blocker — tighter wall = better signal on outliers)
//   LD-7  PHASE2_CAP_MODE values: silent-log (α) / warn / confirm / halt
//         (β-future stubs; non-α modes degrade to silent-log + [cap-mode-stub])
//   LD-8  graceful degradation: missing env vars → log + serve (never crash)
//   LD-9  pricing table inline (LD-9 cents-tolerance per D-100 §2.5)
//   LD-10 RedisLike interface injected via deps for test isolation
//   LD-11 (Session 47 amend) env var read accepts UPSTASH_REDIS_REST_* (D-100
//         §2.3 primary) OR KV_REST_API_* (Vercel Marketplace 'Upstash for
//         Redis' / legacy 'Vercel KV powered by Upstash' integration injects
//         the latter naming). UPSTASH_* wins when both present so explicit
//         override stays authoritative. See D-100 §2.3 Session 47 amendment.
//
// Wiring: each /api route's `onFinish` callback awaits one `recordCapEvent`
// after `recordTripwireEvent`. The synchronous `[cap]` cost log emits BEFORE
// the Redis increment so the per-call telemetry is visible even on lambda
// termination before the async Redis call returns.

import type { CacheUsageReport, ModelRole, ProviderKind } from "./provider";

// ---------------------------------------------------------------------------
// Constants (LD-3, LD-5, LD-6)
// ---------------------------------------------------------------------------

/** Per-query wall in cents (LD-6); log `[cap-wall]` when single-call cost ≥ this. */
export const PER_QUERY_WALL_CENTS = 100;

/** Per-query wall in micro-USD. 1 cent = 10_000 μUSD. */
export const PER_QUERY_WALL_MICRO_USD = PER_QUERY_WALL_CENTS * 10_000;

/** Daily cap in cents (D-090 §2.1 α). */
export const DAILY_CAP_CENTS = 500;

/** Daily cap in micro-USD; $5 = 5_000_000 μUSD. */
export const DAILY_CAP_MICRO_USD = DAILY_CAP_CENTS * 10_000;

/** Day-key TTL in seconds (2× window — absorbs clock skew per LD-5). */
export const DAY_KEY_TTL_SECONDS = 172_800;

// ---------------------------------------------------------------------------
// Pricing table (LD-9)
// ---------------------------------------------------------------------------
//
// μUSD per 1M tokens. Sources (Context7 verified 2026-05-20):
//   - DeepSeek deepseek-chat:     in miss $0.27 / hit $0.07 / out $1.10 per 1M
//   - DeepSeek deepseek-reasoner: in miss $0.55 / hit $0.14 / out $2.19 per 1M
//   - Anthropic claude-opus-4-7:  in $15.00 / out $75.00 / cache creation $18.75 / read $1.50
//
// Phase 4 additions (Session 56 B.3 dry-run pricing sourced; Session 57 B.4
// LD-Module-B-15):
//   - DeepSeek deepseek-v4-pro (tutor): in miss $1.74 / hit $0.145 /
//     write $1.74 / out $3.48 per 1M (post-2026-05-31 baseline; the
//     pre-deadline 75% discount drops to $0.435 / $0.003625 / $0.435 /
//     $0.87 but cap tracker uses the post-discount baseline as a
//     conservative upper bound — α-silent visibility, under-spend is OK)
//   - Anthropic claude-sonnet-4-6 (tutor default per D-104 §2.1): in $3.00
//     / out $15.00 / cache creation $3.75 / read $0.30 per 1M (Anthropic
//     public pricing 2026-05-22). Escalation to Opus 4.7 is rare per D-104
//     §2.2 — cap tracker uses Sonnet pricing for all anthropic tutor calls.
//
// Phase 2 routes (chat/quiz/hover/smoke) post D-105 migrate continue to use
// the legacy CHAT / REASONER pricing tiers — V4 flash non-thinking-mode
// pricing matches deepseek-chat per Context7 verification, and V4 flash
// thinking-mode pricing matches deepseek-reasoner. No new pricing tier
// needed; the legacy aliases now map to V4 flash internally per DeepSeek.
//
// Pricing drift acceptable per D-100 §2.5 LD-9 (α-silent visibility, cents
// tolerance). Re-verify on β graduation; update Module D Step 14 a11y pass.

interface PricingTier {
  readonly inputMissPerMillion: number;
  readonly inputHitPerMillion: number;
  readonly inputCreationPerMillion: number | null;
  readonly outputPerMillion: number;
}

export const PRICING_DEEPSEEK_CHAT: PricingTier = Object.freeze({
  inputMissPerMillion: 270_000,
  inputHitPerMillion: 70_000,
  inputCreationPerMillion: null,
  outputPerMillion: 1_100_000,
});

export const PRICING_DEEPSEEK_REASONER: PricingTier = Object.freeze({
  inputMissPerMillion: 550_000,
  inputHitPerMillion: 140_000,
  inputCreationPerMillion: null,
  outputPerMillion: 2_190_000,
});

export const PRICING_ANTHROPIC_OPUS: PricingTier = Object.freeze({
  inputMissPerMillion: 15_000_000,
  inputHitPerMillion: 1_500_000,
  inputCreationPerMillion: 18_750_000,
  outputPerMillion: 75_000_000,
});

/**
 * D-104 + LD-Module-B-15 Phase 4 tutor brain tiers. Conservative post-
 * discount baseline rates (see file-header pricing note for the discount
 * window). Cap tracker prefers under-counting cost over under-counting
 * spend, hence the post-discount baseline.
 */
export const PRICING_DEEPSEEK_V4_PRO: PricingTier = Object.freeze({
  inputMissPerMillion: 1_740_000,
  inputHitPerMillion: 145_000,
  inputCreationPerMillion: null,
  outputPerMillion: 3_480_000,
});

export const PRICING_ANTHROPIC_SONNET: PricingTier = Object.freeze({
  inputMissPerMillion: 3_000_000,
  inputHitPerMillion: 300_000,
  inputCreationPerMillion: 3_750_000,
  outputPerMillion: 15_000_000,
});

/**
 * Dispatch pricing by (provider, role) per LD-9 + LD-Module-B-15.
 *
 *   - `tutor` role on Anthropic → Sonnet 4.6 tier (D-104 §2.1 default; Opus
 *     4.7 escalation rare and undercount-acceptable per α-silent envelope)
 *   - `tutor` role on DeepSeek → V4 pro tier (D-104 §2.1 default)
 *   - all other roles on Anthropic → Opus tier (D-088 §2.1 single-model pin)
 *   - `quiz` on DeepSeek → reasoner-tier pricing (V4 flash thinking parity)
 *   - other roles on DeepSeek → chat-tier pricing (V4 flash non-thinking
 *     parity; legacy `deepseek-chat` mapped to V4 flash non-thinking per
 *     Context7 DeepSeek API change log)
 *   - unknown provider → chat-tier (conservative under-count)
 */
export function pricingFor(
  provider: ProviderKind | "unknown",
  role: ModelRole,
): PricingTier {
  if (role === "tutor") {
    return provider === "anthropic"
      ? PRICING_ANTHROPIC_SONNET
      : PRICING_DEEPSEEK_V4_PRO;
  }
  if (provider === "anthropic") return PRICING_ANTHROPIC_OPUS;
  if (role === "quiz") return PRICING_DEEPSEEK_REASONER;
  return PRICING_DEEPSEEK_CHAT;
}

// ---------------------------------------------------------------------------
// Mode env switch (LD-7)
// ---------------------------------------------------------------------------

export type CapMode = "silent-log" | "warn" | "confirm" | "halt";

/** Read PHASE2_CAP_MODE from env. Default = silent-log per D-090 §2.2. */
export function getCapMode(): CapMode {
  const raw = process.env.PHASE2_CAP_MODE;
  if (raw === "warn" || raw === "confirm" || raw === "halt") return raw;
  return "silent-log";
}

// ---------------------------------------------------------------------------
// Day key (LD-4) — JST per D-090 §2.1
// ---------------------------------------------------------------------------

/** Format JST day key as `phase2:cap:day:YYYY-MM-DD-JST`. */
export function formatJstDayKey(date: Date): string {
  // JST = UTC+9. Add the offset to UTC then read UTC fields to get JST date
  // without depending on the host's tz setting (Vercel lambdas run in UTC).
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = jst.getUTCFullYear();
  const mm = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(jst.getUTCDate()).padStart(2, "0");
  return `phase2:cap:day:${yyyy}-${mm}-${dd}-JST`;
}

// ---------------------------------------------------------------------------
// Cost estimation (pure)
// ---------------------------------------------------------------------------

export interface CallUsage {
  inputTokens: number | null;
  outputTokens: number | null;
}

/**
 * Estimate single-call cost in micro-USD from usage + cache + pricing.
 *
 * Provider-aware:
 *   - Anthropic: miss = inputTokens − hit − creation (clamped ≥ 0)
 *   - DeepSeek: miss + hit reported directly by provider
 *   - unknown: treat all input as miss (conservative upper bound)
 *
 * Returns 0 (NOT null) when usage is incomplete — α-silent visibility prefers
 * under-count over crash per LD-8 graceful-degradation envelope.
 */
export function estimateCallMicroUsd(args: {
  usage: CallUsage;
  cache: CacheUsageReport;
  pricing: PricingTier;
}): number {
  const { usage, cache, pricing } = args;
  const outputTokens = usage.outputTokens ?? 0;
  let micro = (outputTokens * pricing.outputPerMillion) / 1_000_000;

  const hit = cache.cacheReadInputTokens ?? 0;
  const creation = cache.cacheCreationInputTokens ?? 0;
  const reportedMiss = cache.cacheMissInputTokens ?? 0;

  if (cache.provider === "anthropic") {
    const creationRate =
      pricing.inputCreationPerMillion ?? pricing.inputMissPerMillion;
    micro += (creation * creationRate) / 1_000_000;
    micro += (hit * pricing.inputHitPerMillion) / 1_000_000;
    const inputTotal = usage.inputTokens ?? 0;
    const impliedMiss = Math.max(0, inputTotal - hit - creation);
    micro += (impliedMiss * pricing.inputMissPerMillion) / 1_000_000;
  } else if (cache.provider === "deepseek") {
    micro += (hit * pricing.inputHitPerMillion) / 1_000_000;
    micro += (reportedMiss * pricing.inputMissPerMillion) / 1_000_000;
  } else {
    const inputTotal = usage.inputTokens ?? 0;
    micro += (inputTotal * pricing.inputMissPerMillion) / 1_000_000;
  }

  return Math.round(micro);
}

// ---------------------------------------------------------------------------
// Redis adapter (LD-8 graceful degradation, LD-10 test injection)
// ---------------------------------------------------------------------------

export interface RedisLike {
  incrby(key: string, value: number): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
}

let cachedRedis: RedisLike | null | undefined = undefined;
let degradedLoggedOnce = false;

/**
 * Lazy-load Upstash Redis from env. Memoised across calls.
 *
 *   - either flavor of env vars present → returns RedisLike instance
 *     (UPSTASH_REDIS_REST_URL/TOKEN preferred per D-100 §2.3 primary;
 *      falls back to KV_REST_API_URL/TOKEN per LD-11 — Vercel Marketplace
 *      Upstash integrations inject the latter naming on Preview+Production)
 *   - neither flavor present → returns null + emits `[cap-degraded]` once
 *   - dynamic import fails  → returns null + emits `[cap-degraded]` once
 *
 * Routes never crash on Redis absence — α-silent visibility prefers serving
 * over enforcing per D-090 §2.2.
 */
export async function loadRedisFromEnv(): Promise<RedisLike | null> {
  if (cachedRedis !== undefined) return cachedRedis;
  // LD-11: UPSTASH_* wins so explicit override stays authoritative.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (!degradedLoggedOnce) {
      console.warn(
        "[cap-degraded]",
        JSON.stringify({
          reason:
            "upstash env vars missing — cap counter unavailable; per-call cost log retained",
          urlPresent: Boolean(url),
          tokenPresent: Boolean(token),
        }),
      );
      degradedLoggedOnce = true;
    }
    cachedRedis = null;
    return null;
  }
  try {
    const mod = (await import("@upstash/redis")) as {
      Redis: new (opts: { url: string; token: string }) => RedisLike;
    };
    cachedRedis = new mod.Redis({ url, token });
    return cachedRedis;
  } catch (err) {
    if (!degradedLoggedOnce) {
      console.warn(
        "[cap-degraded]",
        JSON.stringify({
          reason: "@upstash/redis import failed",
          error: err instanceof Error ? err.message : String(err),
        }),
      );
      degradedLoggedOnce = true;
    }
    cachedRedis = null;
    return null;
  }
}

/** Test hook — reset module-level memoisation. */
export function _resetCapModuleState(): void {
  cachedRedis = undefined;
  degradedLoggedOnce = false;
}

// ---------------------------------------------------------------------------
// Cap event recording (the main exported API)
// ---------------------------------------------------------------------------

export interface CapEvent {
  route: string;
  microUsd: number;
  role: ModelRole;
  provider: ProviderKind | "unknown";
  perQueryWallBreached: boolean;
  dayTotalAfter: number | null;
  dayCapBreached: boolean;
  dayKey: string;
  ts: number;
}

export interface RecordCapArgs {
  route: string;
  role: ModelRole;
  usage: CallUsage;
  cache: CacheUsageReport;
}

export interface CapDeps {
  loadRedis: () => Promise<RedisLike | null>;
  now: () => Date;
  mode: CapMode;
}

/** Factory so tests can override piece-by-piece. */
export function defaultCapDeps(): CapDeps {
  return {
    loadRedis: loadRedisFromEnv,
    now: () => new Date(),
    mode: getCapMode(),
  };
}

/**
 * Record cap event for a single call. Server-only.
 *
 * Steps:
 *   1. Estimate cost in μUSD (sync, pure)
 *   2. Emit `[cap]` per-call cost log (sync, before any await)
 *   3. If cost ≥ PER_QUERY_WALL_MICRO_USD: emit `[cap-wall]` (sync)
 *   4. INCRBY day key + EXPIRE on Redis (async; errors caught & logged)
 *   5. If new day total crosses DAILY_CAP_MICRO_USD this call: emit `[cap-breach]`
 *   6. If mode ≠ silent-log AND any breach: emit `[cap-mode-stub]` (LD-7)
 *
 * Returns the full `CapEvent` for test assertion + caller chaining.
 * α-silent: never throws. Caller MAY await but is not required to — the
 * synchronous logs (Steps 2-3) emit before any await so visibility survives
 * lambda termination.
 */
export async function recordCapEvent(
  args: RecordCapArgs,
  deps: CapDeps = defaultCapDeps(),
): Promise<CapEvent> {
  const { route, role, usage, cache } = args;
  const pricing = pricingFor(cache.provider, role);
  const microUsd = estimateCallMicroUsd({ usage, cache, pricing });
  const ts = deps.now().getTime();
  const dayKey = formatJstDayKey(deps.now());

  console.warn(
    "[cap]",
    JSON.stringify({
      route,
      microUsd,
      centsApprox: Math.round(microUsd / 10_000),
      role,
      provider: cache.provider,
      ts,
    }),
  );

  const perQueryWallBreached = microUsd >= PER_QUERY_WALL_MICRO_USD;
  if (perQueryWallBreached) {
    console.warn(
      "[cap-wall]",
      JSON.stringify({
        route,
        microUsd,
        wallMicroUsd: PER_QUERY_WALL_MICRO_USD,
        role,
        provider: cache.provider,
        ts,
      }),
    );
  }

  let dayTotalAfter: number | null = null;
  const redis = await deps.loadRedis();
  if (redis !== null) {
    try {
      dayTotalAfter = await redis.incrby(dayKey, microUsd);
      await redis.expire(dayKey, DAY_KEY_TTL_SECONDS);
    } catch (err) {
      console.warn(
        "[cap-redis-error]",
        JSON.stringify({
          reason: err instanceof Error ? err.message : String(err),
          route,
          dayKey,
          ts,
        }),
      );
      dayTotalAfter = null;
    }
  }

  const dayCapBreached =
    dayTotalAfter !== null &&
    dayTotalAfter >= DAILY_CAP_MICRO_USD &&
    dayTotalAfter - microUsd < DAILY_CAP_MICRO_USD;

  if (dayCapBreached) {
    console.warn(
      "[cap-breach]",
      JSON.stringify({
        dayKey,
        dayTotalAfter,
        capMicroUsd: DAILY_CAP_MICRO_USD,
        crossedOnRoute: route,
        mode: deps.mode,
        ts,
      }),
    );
  }

  if (
    deps.mode !== "silent-log" &&
    (perQueryWallBreached || dayCapBreached)
  ) {
    console.info(
      "[cap-mode-stub]",
      JSON.stringify({
        requestedMode: deps.mode,
        effectiveMode: "silent-log",
        reason:
          "β modes (warn/confirm/halt) are stubs in α; route serves regardless",
        ts,
      }),
    );
  }

  return {
    route,
    microUsd,
    role,
    provider: cache.provider,
    perQueryWallBreached,
    dayTotalAfter,
    dayCapBreached,
    dayKey,
    ts,
  };
}
