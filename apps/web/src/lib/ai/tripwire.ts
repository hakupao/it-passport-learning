// Phase 2 Step 8 — δ-all-tripwire runtime detector per D-088 §2.4 + D-091 §2.5.
//
// Q3=a scope (Session 40): **log-only** to keep the α-silent envelope per
// D-090. No SSE warning frame, no UI surface. Evidence is collected
// post-hoc from `vercel logs --json` filtering on the `[tripwire]` prefix.
//
// What this module watches (runtime-observable only):
//   - β (D-091 §2.5(β)): per-call cache hit rate vs the 50% floor
//
// Out of scope (manual / offline triggers):
//   - α (D-088 §2.5 α, D-091 §2.5(α)): new model release      — manual flag
//   - γ (D-091 §2.5(γ)): step wall drift                       — PLAN.md retro
//   - δ (D-091 §2.5(δ)): β user > 10/month                     — N/A at α
//   - ε (D-091 §2.5(ε)): provider pricing change               — manual flag
//
// β is the only runtime-observable trigger and is what this detector targets.
// The "δ-all-tripwire" label in PLAN.md Step 8 refers to D-088 §2.5's
// 4-condition meta-monitor (catches all of α/β/γ/Annual-floor); this file
// implements the β arm, since the others are out-of-band by nature.

import type { CacheUsageReport } from "./provider";

/** D-091 §2.5(β) floor — "cache hit rate retro 实测 < 50%". */
export const CACHE_HIT_RATE_FLOOR = 0.5;

/**
 * Minimum total input tokens before β is evaluated. Below this floor the
 * relative miss noise dominates (e.g. a 100-token /api/hello-ai ping); the
 * Step 7 hover smoke at 400 tokens already showed 96% hit so this floor is
 * conservative.
 */
export const CACHE_TRIPWIRE_MIN_INPUT_TOKENS = 1000;

export type TripwireEventKind = "cache_low_hit" | "cache_no_data";

export interface TripwireEvent {
  kind: TripwireEventKind;
  /** `null` when no/insufficient data; numeric otherwise (0..1). */
  hitRate: number | null;
  totalInputTokens: number | null;
  provider: CacheUsageReport["provider"];
  /** Route id, e.g. "/api/chat". */
  route: string;
  /** Server epoch ms at evaluation time. */
  ts: number;
}

export interface EvaluateArgs {
  usage: CacheUsageReport;
  totalInputTokens: number | null;
  route: string;
}

/**
 * Pure function. Returns a `TripwireEvent` when the call crossed β, or `null`
 * when behaviour is healthy / sub-threshold.
 *
 *   cache_no_data → provider returned unknown metadata shape
 *   cache_low_hit → hit rate < 50% AND total input ≥ CACHE_TRIPWIRE_MIN_INPUT_TOKENS
 *   null          → healthy hit rate OR sub-threshold input
 *
 * Cold-creation events on a brand-new prefix are EXPECTED by design (per the
 * Steps 4–7 cross-scope smoke data: hit rate is 0% on the first call of a new
 * prefix, then 96–99.98% on the second). The per-call detector cannot tell
 * cold-creation from a regression in isolation; that disambiguation is left
 * to manual evidence review of the longitudinal log. The detector logs both
 * cases so the audit trail is complete — sifting is cheap, missing data is
 * not.
 */
export function evaluateCacheTripwire(
  args: EvaluateArgs,
): TripwireEvent | null {
  const { usage, totalInputTokens, route } = args;

  if (usage.provider === "unknown") {
    return {
      kind: "cache_no_data",
      hitRate: null,
      totalInputTokens,
      provider: usage.provider,
      route,
      ts: Date.now(),
    };
  }

  if (
    typeof totalInputTokens !== "number" ||
    totalInputTokens < CACHE_TRIPWIRE_MIN_INPUT_TOKENS
  ) {
    return null;
  }

  const read = usage.cacheReadInputTokens ?? 0;
  const creation = usage.cacheCreationInputTokens ?? 0;
  const miss = usage.cacheMissInputTokens ?? 0;

  // DeepSeek reports read + miss; their sum is the cacheable input.
  // Anthropic reports creation + read; miss is implied (call is cached on
  // creation event).
  let denom: number;
  let cached: number;
  if (usage.provider === "anthropic") {
    denom = creation + read;
    cached = read;
  } else {
    denom = read + miss;
    cached = read;
  }

  if (denom <= 0) return null;

  const hitRate = cached / denom;
  if (hitRate >= CACHE_HIT_RATE_FLOOR) return null;

  return {
    kind: "cache_low_hit",
    hitRate,
    totalInputTokens,
    provider: usage.provider,
    route,
    ts: Date.now(),
  };
}

/**
 * Server-only recorder. Surface = console (`[tripwire]` prefix on stderr via
 * `console.warn`) per Q3=a log-only decision. Evidence is collected post-hoc
 * from `vercel logs --json | grep '\[tripwire\]'`.
 *
 * Returns the serialised payload so callers can chain richer logs without
 * re-stringifying.
 */
export function recordTripwireEvent(event: TripwireEvent): string {
  const payload = JSON.stringify(event);
  console.warn("[tripwire]", payload);
  return payload;
}
