// Stage 7 Phase 1 (D-190 §0-6 / §0-9 / §0-13) — shared pure hash + PRNG.
//
// fnv1a32: FNV-1a 32-bit over the UTF-8 bytes of `s` (offset basis 0x811c9dc5,
// prime 0x01000193), as an unsigned integer. Used by glossary termId, the v1
// correct-answer spread in scheduling, the daily new-question seed and practice
// set keys — all of which must stay byte-stable.
//
// mulberry32: tiny seeded PRNG returning floats in [0, 1).
//
// Synchronous, pure, isomorphic: TextEncoder + Math.imul only, no imports
// (e2e specs import modules that use this by relative path).

const encoder = new TextEncoder();

export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (const b of encoder.encode(s)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
