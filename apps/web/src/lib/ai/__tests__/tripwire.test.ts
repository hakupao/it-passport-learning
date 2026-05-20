import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CacheUsageReport } from "../provider";
import {
  CACHE_HIT_RATE_FLOOR,
  CACHE_TRIPWIRE_MIN_INPUT_TOKENS,
  evaluateCacheTripwire,
  recordTripwireEvent,
  type TripwireEvent,
} from "../tripwire";

function deepseekUsage(hit: number, miss: number): CacheUsageReport {
  return {
    provider: "deepseek",
    cacheCreationInputTokens: null,
    cacheReadInputTokens: hit,
    cacheMissInputTokens: miss,
  };
}

function anthropicUsage(creation: number, read: number): CacheUsageReport {
  return {
    provider: "anthropic",
    cacheCreationInputTokens: creation,
    cacheReadInputTokens: read,
    cacheMissInputTokens: null,
  };
}

const ROUTE = "/api/chat";

describe("evaluateCacheTripwire — D-091 §2.5(β) runtime detector", () => {
  describe("threshold constants", () => {
    it("CACHE_HIT_RATE_FLOOR = 0.5 per D-091 §2.5(β)", () => {
      expect(CACHE_HIT_RATE_FLOOR).toBe(0.5);
    });

    it("CACHE_TRIPWIRE_MIN_INPUT_TOKENS = 1000 (small-call noise floor)", () => {
      expect(CACHE_TRIPWIRE_MIN_INPUT_TOKENS).toBe(1000);
    });
  });

  describe("cache_no_data branch (unknown provider metadata)", () => {
    it("returns cache_no_data event regardless of input size", () => {
      const ev = evaluateCacheTripwire({
        usage: {
          provider: "unknown",
          cacheCreationInputTokens: null,
          cacheReadInputTokens: null,
          cacheMissInputTokens: null,
        },
        totalInputTokens: 50_000,
        route: ROUTE,
      });
      expect(ev).not.toBeNull();
      expect(ev?.kind).toBe("cache_no_data");
      expect(ev?.provider).toBe("unknown");
      expect(ev?.route).toBe(ROUTE);
    });
  });

  describe("sub-threshold suppression", () => {
    it("returns null when totalInputTokens < 1000 (deepseek)", () => {
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(0, 400),
        totalInputTokens: 400,
        route: ROUTE,
      });
      expect(ev).toBeNull();
    });

    it("returns null when totalInputTokens is null", () => {
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(0, 5000),
        totalInputTokens: null,
        route: ROUTE,
      });
      expect(ev).toBeNull();
    });
  });

  describe("healthy hit-rate branch (≥50%)", () => {
    it("returns null for deepseek hit at 96.0% (Step 7 hover empirical)", () => {
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(384, 16),
        totalInputTokens: 1500,
        route: ROUTE,
      });
      expect(ev).toBeNull();
    });

    it("returns null for deepseek hit at exactly 50.0%", () => {
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(2500, 2500),
        totalInputTokens: 5000,
        route: ROUTE,
      });
      expect(ev).toBeNull();
    });

    it("returns null for anthropic hit at 99.98% (Step 5 chat empirical)", () => {
      const ev = evaluateCacheTripwire({
        usage: anthropicUsage(15, 92800),
        totalInputTokens: 92815,
        route: ROUTE,
      });
      expect(ev).toBeNull();
    });
  });

  describe("cache_low_hit branch (<50%)", () => {
    it("fires on deepseek cold-creation event (Step 7 call #1: 0 hit / 400 miss)", () => {
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(0, 2693),
        totalInputTokens: 2693,
        route: ROUTE,
      });
      expect(ev).not.toBeNull();
      expect(ev?.kind).toBe("cache_low_hit");
      expect(ev?.hitRate).toBe(0);
      expect(ev?.provider).toBe("deepseek");
      expect(ev?.totalInputTokens).toBe(2693);
    });

    it("fires below 50% threshold (deepseek 30% hit on 5000-tok call)", () => {
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(1500, 3500),
        totalInputTokens: 5000,
        route: ROUTE,
      });
      expect(ev?.kind).toBe("cache_low_hit");
      expect(ev?.hitRate).toBeCloseTo(0.3, 5);
    });

    it("fires for anthropic creation event (0% read)", () => {
      const ev = evaluateCacheTripwire({
        usage: anthropicUsage(2500, 0),
        totalInputTokens: 2500,
        route: ROUTE,
      });
      expect(ev?.kind).toBe("cache_low_hit");
      expect(ev?.hitRate).toBe(0);
      expect(ev?.provider).toBe("anthropic");
    });

    it("populates ts as a numeric epoch ms", () => {
      const before = Date.now();
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(0, 2000),
        totalInputTokens: 2000,
        route: ROUTE,
      });
      const after = Date.now();
      expect(typeof ev?.ts).toBe("number");
      expect(ev!.ts).toBeGreaterThanOrEqual(before);
      expect(ev!.ts).toBeLessThanOrEqual(after);
    });
  });

  describe("zero-denominator skip", () => {
    it("returns null when both creation+read = 0 on anthropic", () => {
      const ev = evaluateCacheTripwire({
        usage: anthropicUsage(0, 0),
        totalInputTokens: 5000,
        route: ROUTE,
      });
      expect(ev).toBeNull();
    });

    it("returns null when both read+miss = 0 on deepseek", () => {
      const ev = evaluateCacheTripwire({
        usage: deepseekUsage(0, 0),
        totalInputTokens: 5000,
        route: ROUTE,
      });
      expect(ev).toBeNull();
    });
  });
});

describe("recordTripwireEvent — log-only sink (Q3=a)", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("writes a [tripwire] prefixed line to console.warn", () => {
    const event: TripwireEvent = {
      kind: "cache_low_hit",
      hitRate: 0,
      totalInputTokens: 2693,
      provider: "deepseek",
      route: "/api/quiz/explain",
      ts: 1716147600000,
    };
    const out = recordTripwireEvent(event);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0]?.[0]).toBe("[tripwire]");
    const payload = warnSpy.mock.calls[0]?.[1];
    expect(typeof payload).toBe("string");
    expect(payload).toContain("cache_low_hit");
    expect(payload).toContain("/api/quiz/explain");
    expect(out).toBe(payload);
  });
});
