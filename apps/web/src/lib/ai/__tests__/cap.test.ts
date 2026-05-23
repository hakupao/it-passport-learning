import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CacheUsageReport } from "../provider";
import {
  DAILY_CAP_CENTS,
  DAILY_CAP_MICRO_USD,
  DAY_KEY_TTL_SECONDS,
  PER_QUERY_WALL_CENTS,
  PER_QUERY_WALL_MICRO_USD,
  PRICING_ANTHROPIC_OPUS,
  PRICING_ANTHROPIC_SONNET,
  PRICING_DEEPSEEK_CHAT,
  PRICING_DEEPSEEK_REASONER,
  PRICING_DEEPSEEK_V4_PRO,
  _resetCapModuleState,
  estimateCallMicroUsd,
  formatJstDayKey,
  getCapMode,
  loadRedisFromEnv,
  pricingFor,
  recordCapEvent,
  type CapDeps,
  type RedisLike,
} from "../cap";

// ---------------------------------------------------------------------------
// Helpers

function deepseekCache(hit: number, miss: number): CacheUsageReport {
  return {
    provider: "deepseek",
    cacheCreationInputTokens: null,
    cacheReadInputTokens: hit,
    cacheMissInputTokens: miss,
  };
}

function anthropicCache(creation: number, read: number): CacheUsageReport {
  return {
    provider: "anthropic",
    cacheCreationInputTokens: creation,
    cacheReadInputTokens: read,
    cacheMissInputTokens: null,
  };
}

function unknownCache(): CacheUsageReport {
  return {
    provider: "unknown",
    cacheCreationInputTokens: null,
    cacheReadInputTokens: null,
    cacheMissInputTokens: null,
  };
}

function makeMockRedis(opts?: {
  initialValue?: number;
  throwOn?: "incrby" | "expire";
}): {
  redis: RedisLike;
  incrbyCalls: Array<{ key: string; value: number }>;
  expireCalls: Array<{ key: string; seconds: number }>;
  totals: Map<string, number>;
} {
  const totals = new Map<string, number>();
  const incrbyCalls: Array<{ key: string; value: number }> = [];
  const expireCalls: Array<{ key: string; seconds: number }> = [];
  const redis: RedisLike = {
    async incrby(key, value) {
      incrbyCalls.push({ key, value });
      if (opts?.throwOn === "incrby") {
        throw new Error("simulated incrby failure");
      }
      const prev = totals.get(key) ?? opts?.initialValue ?? 0;
      const next = prev + value;
      totals.set(key, next);
      return next;
    },
    async expire(key, seconds) {
      expireCalls.push({ key, seconds });
      if (opts?.throwOn === "expire") {
        throw new Error("simulated expire failure");
      }
      return 1;
    },
  };
  return { redis, incrbyCalls, expireCalls, totals };
}

function makeDeps(overrides?: Partial<CapDeps>): CapDeps {
  return {
    loadRedis: async () => null,
    now: () => new Date("2026-05-20T12:00:00Z"),
    mode: "silent-log",
    ...overrides,
  };
}

const ORIG_ENV = { ...process.env };

beforeEach(() => {
  _resetCapModuleState();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ORIG_ENV };
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Constants

describe("cap.ts constants — D-090 §2.1 + D-100 §2.1", () => {
  it("PER_QUERY_WALL_CENTS = 100 ($1.00 per LD-6)", () => {
    expect(PER_QUERY_WALL_CENTS).toBe(100);
    expect(PER_QUERY_WALL_MICRO_USD).toBe(1_000_000);
  });

  it("DAILY_CAP_CENTS = 500 ($5.00 per D-090 §2.1 α soft cap)", () => {
    expect(DAILY_CAP_CENTS).toBe(500);
    expect(DAILY_CAP_MICRO_USD).toBe(5_000_000);
  });

  it("DAY_KEY_TTL_SECONDS = 172800 (48h, 2× window per LD-5)", () => {
    expect(DAY_KEY_TTL_SECONDS).toBe(172_800);
  });
});

// ---------------------------------------------------------------------------
// pricingFor — dispatch matrix

describe("pricingFor — provider × role dispatch (LD-9 + LD-Module-B-15)", () => {
  it("anthropic non-tutor role → opus pricing (D-088 §2.1 single-model pin)", () => {
    expect(pricingFor("anthropic", "chat")).toBe(PRICING_ANTHROPIC_OPUS);
    expect(pricingFor("anthropic", "quiz")).toBe(PRICING_ANTHROPIC_OPUS);
    expect(pricingFor("anthropic", "hover")).toBe(PRICING_ANTHROPIC_OPUS);
    expect(pricingFor("anthropic", "smoke")).toBe(PRICING_ANTHROPIC_OPUS);
  });

  it("anthropic tutor → Sonnet 4.6 pricing per D-104 §2.1 default (LD-Module-B-15)", () => {
    expect(pricingFor("anthropic", "tutor")).toBe(PRICING_ANTHROPIC_SONNET);
  });

  it("deepseek quiz → reasoner pricing (V4 flash thinking parity per Context7)", () => {
    expect(pricingFor("deepseek", "quiz")).toBe(PRICING_DEEPSEEK_REASONER);
  });

  it("deepseek non-quiz Phase 2 roles → chat pricing (V4 flash non-thinking parity)", () => {
    expect(pricingFor("deepseek", "chat")).toBe(PRICING_DEEPSEEK_CHAT);
    expect(pricingFor("deepseek", "hover")).toBe(PRICING_DEEPSEEK_CHAT);
    expect(pricingFor("deepseek", "smoke")).toBe(PRICING_DEEPSEEK_CHAT);
  });

  it("deepseek tutor → V4 pro pricing per D-104 §2.1 default (LD-Module-B-15)", () => {
    expect(pricingFor("deepseek", "tutor")).toBe(PRICING_DEEPSEEK_V4_PRO);
  });

  it("unknown provider non-tutor → deepseek-chat fallback (conservative default)", () => {
    expect(pricingFor("unknown", "chat")).toBe(PRICING_DEEPSEEK_CHAT);
    expect(pricingFor("unknown", "quiz")).toBe(PRICING_DEEPSEEK_REASONER);
  });

  it("unknown provider tutor → V4 pro fallback (conservative — matches active default)", () => {
    expect(pricingFor("unknown", "tutor")).toBe(PRICING_DEEPSEEK_V4_PRO);
  });
});

describe("PRICING_DEEPSEEK_V4_PRO + PRICING_ANTHROPIC_SONNET shape sanity", () => {
  it("V4 pro tier is frozen + has expected μUSD rates per file-header pricing note", () => {
    expect(Object.isFrozen(PRICING_DEEPSEEK_V4_PRO)).toBe(true);
    expect(PRICING_DEEPSEEK_V4_PRO.inputMissPerMillion).toBe(1_740_000);
    expect(PRICING_DEEPSEEK_V4_PRO.inputHitPerMillion).toBe(145_000);
    expect(PRICING_DEEPSEEK_V4_PRO.inputCreationPerMillion).toBeNull();
    expect(PRICING_DEEPSEEK_V4_PRO.outputPerMillion).toBe(3_480_000);
  });

  it("Sonnet 4.6 tier is frozen + has expected μUSD rates per Anthropic 2026-05-22 public pricing", () => {
    expect(Object.isFrozen(PRICING_ANTHROPIC_SONNET)).toBe(true);
    expect(PRICING_ANTHROPIC_SONNET.inputMissPerMillion).toBe(3_000_000);
    expect(PRICING_ANTHROPIC_SONNET.inputHitPerMillion).toBe(300_000);
    expect(PRICING_ANTHROPIC_SONNET.inputCreationPerMillion).toBe(3_750_000);
    expect(PRICING_ANTHROPIC_SONNET.outputPerMillion).toBe(15_000_000);
  });
});

// ---------------------------------------------------------------------------
// estimateCallMicroUsd — pure math

describe("estimateCallMicroUsd — provider-aware cost math", () => {
  it("DeepSeek: 16 miss + 384 hit + 78 out matches Session 44 ~$0.000122 baseline", () => {
    const micro = estimateCallMicroUsd({
      usage: { inputTokens: 400, outputTokens: 78 },
      cache: deepseekCache(384, 16),
      pricing: PRICING_DEEPSEEK_CHAT,
    });
    // Expected: (78 × 1_100_000 + 384 × 70_000 + 16 × 270_000) / 1_000_000
    //         = (85_800_000 + 26_880_000 + 4_320_000) / 1_000_000
    //         = 117_000_000 / 1_000_000 = 117 μUSD
    expect(micro).toBe(117);
  });

  it("DeepSeek reasoner: cold quiz call uses reasoner pricing (higher)", () => {
    const micro = estimateCallMicroUsd({
      usage: { inputTokens: 2693, outputTokens: 621 },
      cache: deepseekCache(2688, 5),
      pricing: PRICING_DEEPSEEK_REASONER,
    });
    // (621 × 2_190_000 + 2688 × 140_000 + 5 × 550_000) / 1_000_000
    // = (1_359_990_000 + 376_320_000 + 2_750_000) / 1_000_000
    // = 1_739_060_000 / 1_000_000 = ~1739 μUSD (round)
    expect(micro).toBeGreaterThan(1700);
    expect(micro).toBeLessThan(1800);
  });

  it("Anthropic: clamps implied miss to ≥0 when hit+creation exceeds inputTotal", () => {
    const micro = estimateCallMicroUsd({
      usage: { inputTokens: 100, outputTokens: 50 },
      cache: anthropicCache(50, 200), // creation+read > inputTotal
      pricing: PRICING_ANTHROPIC_OPUS,
    });
    // No negative miss; cost stays well-defined and positive
    expect(micro).toBeGreaterThan(0);
  });

  it("Anthropic: ephemeral creation + read priced per cache tiers", () => {
    const micro = estimateCallMicroUsd({
      usage: { inputTokens: 1000, outputTokens: 100 },
      cache: anthropicCache(800, 100), // 800 creation + 100 read + 100 implied miss
      pricing: PRICING_ANTHROPIC_OPUS,
    });
    // (100 × 75_000_000 + 800 × 18_750_000 + 100 × 1_500_000 + 100 × 15_000_000) / 1M
    // = (7_500_000_000 + 15_000_000_000 + 150_000_000 + 1_500_000_000) / 1M
    // = 24_150_000_000 / 1M = 24_150 μUSD ≈ $0.024
    expect(micro).toBe(24_150);
  });

  it("Unknown provider: treats all input as miss (conservative)", () => {
    const micro = estimateCallMicroUsd({
      usage: { inputTokens: 1000, outputTokens: 100 },
      cache: unknownCache(),
      pricing: PRICING_DEEPSEEK_CHAT,
    });
    // (100 × 1_100_000 + 1000 × 270_000) / 1M = (110_000_000 + 270_000_000) / 1M = 380
    expect(micro).toBe(380);
  });

  it("Null usage tokens treated as 0 (under-count not crash per LD-8)", () => {
    const micro = estimateCallMicroUsd({
      usage: { inputTokens: null, outputTokens: null },
      cache: unknownCache(),
      pricing: PRICING_DEEPSEEK_CHAT,
    });
    expect(micro).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// formatJstDayKey

describe("formatJstDayKey — JST 00:00 reset per D-090 §2.1 / LD-4", () => {
  it("UTC noon → same JST date", () => {
    expect(formatJstDayKey(new Date("2026-05-20T12:00:00Z"))).toBe(
      "phase2:cap:day:2026-05-20-JST",
    );
  });

  it("UTC 14:59 → JST 23:59 same day", () => {
    expect(formatJstDayKey(new Date("2026-05-20T14:59:00Z"))).toBe(
      "phase2:cap:day:2026-05-20-JST",
    );
  });

  it("UTC 15:00 → JST 00:00 NEXT day (boundary crossing)", () => {
    expect(formatJstDayKey(new Date("2026-05-20T15:00:00Z"))).toBe(
      "phase2:cap:day:2026-05-21-JST",
    );
  });

  it("UTC midnight Dec 31 → JST 09:00 same day", () => {
    expect(formatJstDayKey(new Date("2026-12-31T00:00:00Z"))).toBe(
      "phase2:cap:day:2026-12-31-JST",
    );
  });

  it("UTC 23:00 Dec 31 → JST 08:00 Jan 1 next year", () => {
    expect(formatJstDayKey(new Date("2026-12-31T23:00:00Z"))).toBe(
      "phase2:cap:day:2027-01-01-JST",
    );
  });
});

// ---------------------------------------------------------------------------
// getCapMode

describe("getCapMode — PHASE2_CAP_MODE env switch (LD-7)", () => {
  it("undefined env → silent-log (α default per D-090 §2.2)", () => {
    delete process.env.PHASE2_CAP_MODE;
    expect(getCapMode()).toBe("silent-log");
  });

  it("empty string → silent-log fallback", () => {
    process.env.PHASE2_CAP_MODE = "";
    expect(getCapMode()).toBe("silent-log");
  });

  it("warn → warn", () => {
    process.env.PHASE2_CAP_MODE = "warn";
    expect(getCapMode()).toBe("warn");
  });

  it("confirm → confirm", () => {
    process.env.PHASE2_CAP_MODE = "confirm";
    expect(getCapMode()).toBe("confirm");
  });

  it("halt → halt", () => {
    process.env.PHASE2_CAP_MODE = "halt";
    expect(getCapMode()).toBe("halt");
  });

  it("garbage value → silent-log fallback (no crash)", () => {
    process.env.PHASE2_CAP_MODE = "nuke-the-server-please";
    expect(getCapMode()).toBe("silent-log");
  });
});

// ---------------------------------------------------------------------------
// loadRedisFromEnv — graceful degradation

describe("loadRedisFromEnv — LD-8 graceful degradation", () => {
  it("missing both env vars → null + [cap-degraded] logged once", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    const warn = vi.spyOn(console, "warn");
    const r1 = await loadRedisFromEnv();
    const r2 = await loadRedisFromEnv();
    expect(r1).toBeNull();
    expect(r2).toBeNull();
    const degradedCalls = warn.mock.calls.filter(
      (c) => c[0] === "[cap-degraded]",
    );
    expect(degradedCalls).toHaveLength(1);
  });

  it("missing only token → null", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    expect(await loadRedisFromEnv()).toBeNull();
  });

  it("missing only url → null", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    process.env.UPSTASH_REDIS_REST_TOKEN = "abc";
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    expect(await loadRedisFromEnv()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// loadRedisFromEnv — LD-11 KV_* legacy fallback (Session 47 amend)
//
// Vercel Marketplace 'Upstash for Redis' and legacy 'Vercel KV powered by
// Upstash' integrations inject KV_REST_API_URL / KV_REST_API_TOKEN env vars.
// cap.ts accepts them as fallback so the Redis-backed counter works without
// renaming or aliasing env vars on the Vercel dashboard.

describe("loadRedisFromEnv — LD-11 KV_* legacy fallback", () => {
  it("KV_REST_API_* only present → returns Redis instance + no [cap-degraded]", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.KV_REST_API_URL = "https://kv-test.upstash.io";
    process.env.KV_REST_API_TOKEN = "kv-test-token";
    const warn = vi.spyOn(console, "warn");
    const r = await loadRedisFromEnv();
    expect(r).not.toBeNull();
    const degradedCalls = warn.mock.calls.filter(
      (c) => c[0] === "[cap-degraded]",
    );
    expect(degradedCalls).toHaveLength(0);
  });

  it("KV url present but KV token missing → null", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.KV_REST_API_URL = "https://kv-test.upstash.io";
    delete process.env.KV_REST_API_TOKEN;
    expect(await loadRedisFromEnv()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// recordCapEvent — happy path with mock Redis

describe("recordCapEvent — happy path", () => {
  it("emits [cap] log + INCRBY + EXPIRE on each call", async () => {
    const { redis, incrbyCalls, expireCalls } = makeMockRedis();
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => redis });

    const ev = await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );

    expect(ev.microUsd).toBe(117);
    expect(ev.perQueryWallBreached).toBe(false);
    expect(ev.dayCapBreached).toBe(false);
    expect(ev.dayTotalAfter).toBe(117);
    expect(ev.dayKey).toBe("phase2:cap:day:2026-05-20-JST");

    expect(incrbyCalls).toEqual([
      { key: "phase2:cap:day:2026-05-20-JST", value: 117 },
    ]);
    expect(expireCalls).toEqual([
      { key: "phase2:cap:day:2026-05-20-JST", seconds: 172_800 },
    ]);
    const capLogs = warn.mock.calls.filter((c) => c[0] === "[cap]");
    expect(capLogs).toHaveLength(1);
  });

  it("accumulates day total across multiple calls", async () => {
    const { redis, totals } = makeMockRedis();
    const deps = makeDeps({ loadRedis: async () => redis });

    await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );
    const ev2 = await recordCapEvent(
      {
        route: "/api/quiz/explain",
        role: "quiz",
        usage: { inputTokens: 2693, outputTokens: 621 },
        cache: deepseekCache(2688, 5),
      },
      deps,
    );

    // Both lands in same JST day key
    expect(totals.get("phase2:cap:day:2026-05-20-JST")).toBe(
      117 + ev2.microUsd,
    );
    expect(ev2.dayTotalAfter).toBe(117 + ev2.microUsd);
  });
});

// ---------------------------------------------------------------------------
// recordCapEvent — degraded mode

describe("recordCapEvent — degraded mode (no Redis)", () => {
  it("returns event with dayTotalAfter=null when redis null + still logs [cap]", async () => {
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => null });

    const ev = await recordCapEvent(
      {
        route: "/api/hello-ai",
        role: "smoke",
        usage: { inputTokens: 100, outputTokens: 20 },
        cache: unknownCache(),
      },
      deps,
    );

    expect(ev.dayTotalAfter).toBeNull();
    expect(ev.dayCapBreached).toBe(false);
    expect(warn.mock.calls.some((c) => c[0] === "[cap]")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// recordCapEvent — per-query wall

describe("recordCapEvent — per-query wall breach (LD-6)", () => {
  it("breaches wall on whole-book Opus uncached call (>$1)", async () => {
    const { redis } = makeMockRedis();
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => redis });

    const ev = await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 90_000, outputTokens: 200 },
        cache: anthropicCache(0, 0), // all miss
      },
      deps,
    );

    // 90_000 × 15M + 200 × 75M = 1_350_000_000_000 + 15_000_000_000
    //                          = 1_365_000_000_000 / 1M = 1_365_000 μUSD > 1M wall
    expect(ev.microUsd).toBeGreaterThan(PER_QUERY_WALL_MICRO_USD);
    expect(ev.perQueryWallBreached).toBe(true);
    const wallLogs = warn.mock.calls.filter((c) => c[0] === "[cap-wall]");
    expect(wallLogs).toHaveLength(1);
  });

  it("does NOT breach wall on typical hover call ($0.000122)", async () => {
    const { redis } = makeMockRedis();
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => redis });

    const ev = await recordCapEvent(
      {
        route: "/api/glossary/hover",
        role: "hover",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );

    expect(ev.perQueryWallBreached).toBe(false);
    const wallLogs = warn.mock.calls.filter((c) => c[0] === "[cap-wall]");
    expect(wallLogs).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// recordCapEvent — day cap breach (first crossing only)

describe("recordCapEvent — day cap breach (LD-3 + LD-6)", () => {
  it("[cap-breach] fires on the call that crosses 5_000_000 μUSD", async () => {
    const { redis } = makeMockRedis({ initialValue: 4_999_900 });
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => redis });

    const ev = await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 400, outputTokens: 78 }, // ~117 μUSD
        cache: deepseekCache(384, 16),
      },
      deps,
    );

    expect(ev.dayTotalAfter).toBe(4_999_900 + 117);
    expect(ev.dayCapBreached).toBe(true);
    const breachLogs = warn.mock.calls.filter((c) => c[0] === "[cap-breach]");
    expect(breachLogs).toHaveLength(1);
  });

  it("[cap-breach] does NOT re-fire when day total already past cap before call", async () => {
    const { redis } = makeMockRedis({ initialValue: 5_500_000 });
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => redis });

    const ev = await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );

    expect(ev.dayCapBreached).toBe(false);
    const breachLogs = warn.mock.calls.filter((c) => c[0] === "[cap-breach]");
    expect(breachLogs).toHaveLength(0);
  });

  it("dayCapBreached=false when below cap", async () => {
    const { redis } = makeMockRedis({ initialValue: 1_000_000 });
    const deps = makeDeps({ loadRedis: async () => redis });
    const ev = await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );
    expect(ev.dayCapBreached).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recordCapEvent — Redis error handling

describe("recordCapEvent — Redis error handling (LD-8)", () => {
  it("catches incrby throw → [cap-redis-error] logged + dayTotalAfter=null + returns normally", async () => {
    const { redis } = makeMockRedis({ throwOn: "incrby" });
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => redis });

    const ev = await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );

    expect(ev.dayTotalAfter).toBeNull();
    expect(ev.dayCapBreached).toBe(false);
    const errLogs = warn.mock.calls.filter(
      (c) => c[0] === "[cap-redis-error]",
    );
    expect(errLogs).toHaveLength(1);
  });

  it("catches expire throw without losing the increment value", async () => {
    const { redis } = makeMockRedis({ throwOn: "expire" });
    const warn = vi.spyOn(console, "warn");
    const deps = makeDeps({ loadRedis: async () => redis });

    const ev = await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );

    // INCRBY succeeded; EXPIRE threw; the route still serves; we logged the error
    expect(ev.dayTotalAfter).toBeNull();
    expect(
      warn.mock.calls.some((c) => c[0] === "[cap-redis-error]"),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// recordCapEvent — β mode stub annotation

describe("recordCapEvent — β mode stub annotation (LD-7)", () => {
  it("[cap-mode-stub] fires when mode=warn AND wall breached", async () => {
    const { redis } = makeMockRedis();
    const info = vi.spyOn(console, "info");
    const deps = makeDeps({ loadRedis: async () => redis, mode: "warn" });

    await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 90_000, outputTokens: 200 },
        cache: anthropicCache(0, 0),
      },
      deps,
    );

    const stubLogs = info.mock.calls.filter(
      (c) => c[0] === "[cap-mode-stub]",
    );
    expect(stubLogs).toHaveLength(1);
  });

  it("[cap-mode-stub] does NOT fire in silent-log mode", async () => {
    const { redis } = makeMockRedis();
    const info = vi.spyOn(console, "info");
    const deps = makeDeps({
      loadRedis: async () => redis,
      mode: "silent-log",
    });

    await recordCapEvent(
      {
        route: "/api/chat",
        role: "chat",
        usage: { inputTokens: 90_000, outputTokens: 200 },
        cache: anthropicCache(0, 0),
      },
      deps,
    );

    expect(
      info.mock.calls.filter((c) => c[0] === "[cap-mode-stub]"),
    ).toHaveLength(0);
  });

  it("[cap-mode-stub] does NOT fire when no breach even in non-α mode", async () => {
    const { redis } = makeMockRedis();
    const info = vi.spyOn(console, "info");
    const deps = makeDeps({ loadRedis: async () => redis, mode: "halt" });

    await recordCapEvent(
      {
        route: "/api/glossary/hover",
        role: "hover",
        usage: { inputTokens: 400, outputTokens: 78 },
        cache: deepseekCache(384, 16),
      },
      deps,
    );

    expect(
      info.mock.calls.filter((c) => c[0] === "[cap-mode-stub]"),
    ).toHaveLength(0);
  });
});
