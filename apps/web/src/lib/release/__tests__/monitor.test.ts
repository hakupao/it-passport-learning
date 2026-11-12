// S154 H6 — D-224 monitoring thresholds (lib/release/monitor).
import { describe, expect, it } from "vitest";

import { type InvocationRow, parseDotEnv, RECORD_LIMIT_BYTES, summarizeDays, verdict } from "../monitor";

const row = (date: string, p50us: number, maxus: number, errors = 0): InvocationRow => ({
  dimensions: { date },
  sum: { requests: 10, errors, subrequests: 20 },
  quantiles: { cpuTimeP50: p50us, cpuTimeP99: maxus },
  max: { cpuTime: maxus },
});

describe("summarizeDays", () => {
  it("converts µs to ms (1 decimal) and sorts by date", () => {
    const d = summarizeDays([row("2026-11-13", 3_040, 8_260), row("2026-11-12", 2_900, 26_200)]);
    expect(d.map((x) => x.date)).toEqual(["2026-11-12", "2026-11-13"]);
    expect(d[1]).toMatchObject({ p50Ms: 3, maxMs: 8.3, requests: 10, errors: 0, subrequests: 20 });
  });
});

describe("verdict (D-224)", () => {
  it("is quiet for the H4 numbers (445 B, p50 ~3 ms, cold-start max 26 ms, no errors)", () => {
    const v = verdict(445, summarizeDays([row("2026-11-12", 3_000, 26_200)]));
    expect(v.askUser).toBe(false);
    expect(v.notes).toHaveLength(1);
  });

  it("asks the user above 200 KB, not at it", () => {
    expect(verdict(RECORD_LIMIT_BYTES, []).askUser).toBe(false);
    const v = verdict(RECORD_LIMIT_BYTES + 1, []);
    expect(v.askUser).toBe(true);
    expect(v.reasons[0]).toContain("200000");
  });

  it("asks the user on any error or a p50 at the 10 ms limit", () => {
    expect(verdict(445, summarizeDays([row("d", 3_000, 5_000, 1)])).askUser).toBe(true);
    expect(verdict(445, summarizeDays([row("d", 10_000, 12_000)])).askUser).toBe(true);
    expect(verdict(445, summarizeDays([row("d", 9_900, 12_000)])).askUser).toBe(false);
  });
});

describe("parseDotEnv", () => {
  it("reads KEY=VALUE, strips quotes, skips comments and bare names", () => {
    const e = parseDotEnv('# c\nA=1\nB="two words"\nexport C=\'x\'\nNAME_ONLY\n D = y \n');
    expect(e).toEqual({ A: "1", B: "two words", C: "x", D: "y" });
  });
});
