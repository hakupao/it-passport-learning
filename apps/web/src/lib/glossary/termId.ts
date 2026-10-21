// Stage 6 (D-179 / D-180 §0-1) — URL-safe glossary term id.
//
// termId(term) = "t" + fnv1a32hex(nfc(term)) + fnv1a32hex(nfc(term) + "#")
// FNV-1a 32-bit over UTF-8 bytes (offset basis 0x811c9dc5, prime 0x01000193).
// Headwords contain `/ & ? space .` (e.g. "ISO/IEC 27000", "M&A"), so the raw
// text cannot be a path segment; a hash needs no extra mapping file.
//
// Synchronous, pure, isomorphic (browser + server): TextEncoder + Math.imul only,
// no node:crypto and no other imports.

const encoder = new TextEncoder();

function fnv1a32hex(s: string): string {
  let h = 0x811c9dc5;
  for (const b of encoder.encode(s)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Stable id for a JP headword: `t` + 16 lowercase hex digits (/^t[0-9a-f]{16}$/). */
export function termId(term: string): string {
  const n = term.normalize("NFC");
  return "t" + fnv1a32hex(n) + fnv1a32hex(n + "#");
}
