// D-181 Phase C (§0-9) — the terms of a free question: longest match of the light
// dictionary index (JP / zh / en headwords, built into the /sensei page props) over
// the question text. Pure and client-safe (type-only import from the dictionary).
//
// Rules (pinned in __tests__/termMatch.test.ts):
//   - text and headwords are NFKC-normalized (full-width ⇄ half-width); English is
//     case-insensitive. Only ASCII letters are folded, so offsets in the folded and
//     unfolded text stay aligned.
//   - Every occurrence of every headword is a candidate; overlapping candidates keep
//     the longer one (equal length: the leftmost). Ids come back in order of first
//     appearance, each once, at most `limit`. A headword shared by several entries
//     (e.g. "Migration" for 移行 and マイグレーション) yields all of them, in index order.
//   - A 1-character headword never matches (表, 式, 辺, C, R: noise in running text).
//   - An ASCII-only headword needs a word boundary on both sides: no ASCII letter or
//     digit right before or after it (a Japanese / Chinese neighbour is a boundary,
//     so 「IoTデバイス」 matches IoT; "RAPID" does not match API).
//   - An ASCII-only headword of ≤ CASE_SENSITIVE_MAX characters matches only in its
//     own letter case, so ordinary English words do not hit acronyms
//     ("or" → OR, "its" → ITS, "etc." → ETC); longer ones are case-insensitive.

import type { TermIndexEntry } from "@/lib/glossary/dictionary";

export const MAX_MATCHED_TERMS = 8;
export const CASE_SENSITIVE_MAX = 3;

const ASCII_ONLY = /^[\x20-\x7e]+$/;
const ASCII_ALNUM = /[A-Za-z0-9]/;

interface Pattern {
  key: string;
  ascii: boolean;
  caseSensitive: boolean;
  ids: string[];
}

const foldAscii = (s: string): string => s.replace(/[A-Z]/g, (c) => c.toLowerCase());

const compiled = new WeakMap<readonly TermIndexEntry[], Pattern[]>();

function patternsOf(index: readonly TermIndexEntry[]): Pattern[] {
  const cached = compiled.get(index);
  if (cached) return cached;
  const byKey = new Map<string, Pattern>();
  for (const entry of index) {
    for (const headword of [entry.jp, entry.zh, entry.en]) {
      const n = headword.normalize("NFKC").trim();
      if ([...n].length < 2) continue;
      const ascii = ASCII_ONLY.test(n);
      const caseSensitive = ascii && n.length <= CASE_SENSITIVE_MAX;
      const key = caseSensitive ? n : foldAscii(n);
      const mapKey = `${caseSensitive ? "c" : "i"}:${key}`;
      let p = byKey.get(mapKey);
      if (!p) byKey.set(mapKey, (p = { key, ascii, caseSensitive, ids: [] }));
      if (!p.ids.includes(entry.id)) p.ids.push(entry.id);
    }
  }
  const patterns = [...byKey.values()];
  compiled.set(index, patterns);
  return patterns;
}

/** The ids of the index entries named in `text`, longest match first, in order of first appearance. */
export function matchTerms(text: string, index: readonly TermIndexEntry[], limit = MAX_MATCHED_TERMS): string[] {
  const exact = text.normalize("NFKC");
  const folded = foldAscii(exact);
  const found: { start: number; end: number; ids: string[] }[] = [];
  for (const p of patternsOf(index)) {
    const hay = p.caseSensitive ? exact : folded;
    for (let i = hay.indexOf(p.key); i >= 0; i = hay.indexOf(p.key, i + 1)) {
      const end = i + p.key.length;
      if (p.ascii && (ASCII_ALNUM.test(hay[i - 1] ?? "") || ASCII_ALNUM.test(hay[end] ?? ""))) continue;
      found.push({ start: i, end, ids: p.ids });
    }
  }

  found.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const kept: typeof found = [];
  for (const m of found) {
    if (kept.every((k) => m.end <= k.start || m.start >= k.end)) kept.push(m);
  }
  kept.sort((a, b) => a.start - b.start);

  const ids: string[] = [];
  for (const m of kept) {
    for (const id of m.ids) {
      if (ids.length >= limit) return ids;
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}
