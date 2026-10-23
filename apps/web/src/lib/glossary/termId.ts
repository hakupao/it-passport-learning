// Stage 6 (D-179 / D-180 §0-1) — URL-safe glossary term id.
//
// termId(term) = "t" + fnv1a32hex(nfc(term)) + fnv1a32hex(nfc(term) + "#")
// FNV-1a 32-bit over UTF-8 bytes (offset basis 0x811c9dc5, prime 0x01000193).
// Headwords contain `/ & ? space .` (e.g. "ISO/IEC 27000", "M&A"), so the raw
// text cannot be a path segment; a hash needs no extra mapping file.
//
// Synchronous, pure, isomorphic (browser + server). The hash lives in ../hash
// (relative import: e2e specs import this module by relative path, where `@/`
// does not resolve).

import { fnv1a32 } from "../hash";

const fnv1a32hex = (s: string): string => fnv1a32(s).toString(16).padStart(8, "0");

/** Stable id for a JP headword: `t` + 16 lowercase hex digits (/^t[0-9a-f]{16}$/). */
export function termId(term: string): string {
  const n = term.normalize("NFC");
  return "t" + fnv1a32hex(n) + fnv1a32hex(n + "#");
}

const TERM_ID_RE = /^t[0-9a-f]{16}$/;

/** True iff `id` has the termId() shape — guards the [termId] route param. */
export function isValidTermId(id: string): boolean {
  return TERM_ID_RE.test(id);
}
