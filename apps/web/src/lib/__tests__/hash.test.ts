// Stage 7 Phase 1 (D-190 §0-6 / §0-9 / §0-13) — shared pure hash + PRNG.
//
// Guards: fnv1a32 is FNV-1a 32-bit over UTF-8 bytes as an unsigned number
// (published test vectors), and mulberry32 is deterministic per seed with
// values in [0, 1) — scheduling spread, new-question picks and practice-set
// keys all depend on these staying fixed.

import { describe, expect, it } from "vitest";

import { fnv1a32, mulberry32 } from "../hash";

describe("fnv1a32", () => {
  it("matches the FNV-1a 32-bit test vectors (unsigned)", () => {
    expect(fnv1a32("")).toBe(0x811c9dc5); // offset basis
    expect(fnv1a32("a")).toBe(0xe40c292c); // published test vector
    expect(fnv1a32("a")).toBeGreaterThan(0x7fffffff); // never negative
  });

  it("hashes UTF-8 bytes, not UTF-16 code units", () => {
    // "ア" = U+30A2 = UTF-8 E3 82 A2; FNV-1a over those 3 bytes (computed independently).
    expect(fnv1a32("ア")).toBe(0x4e247a16);
  });
});

describe("mulberry32", () => {
  it("produces fixed values for seed 1, all in [0, 1)", () => {
    const next = mulberry32(1);
    const values = [next(), next(), next()];
    expect(values).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522]);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is deterministic per seed and independent across generators", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const xs = Array.from({ length: 5 }, () => a());
    expect(Array.from({ length: 5 }, () => b())).toEqual(xs);
    expect(Array.from({ length: 5 }, () => c())).not.toEqual(xs);
  });
});
