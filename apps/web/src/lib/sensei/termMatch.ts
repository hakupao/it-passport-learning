// D-181 Phase C (§0-9) — the terms of a free question: longest match of the light
// dictionary index (per entry: the JP headword, then the zh / en headwords of every
// sense; built into the /sensei page props) over the question text. An entry's id is
// termId(JP headword), computed here (termId is isomorphic), so the index ships no ids.
// Pure and client-safe (type-only import from the dictionary).
//
// Rules (pinned in __tests__/termMatch.test.ts, corpus probes in
// lib/glossary/__tests__/dictionaryCorpus.test.ts):
//   - text and headwords are NFKC-normalized (full-width ⇄ half-width); English is
//     case-insensitive. Only ASCII letters are folded, so offsets in the folded and
//     unfolded text stay aligned.
//   - Every occurrence of every headword is a candidate; overlapping candidates keep
//     the longer one (equal length: the leftmost; same span: the exact headword over an
//     inflected shorter one, so "HTTPS" is HTTPS, not HTTP + s). A headword shared by
//     several entries (e.g. "Migration" for 移行 and マイグレーション) yields all of
//     them, in index order.
//   - A 1-character headword never matches (表, 式, 辺, C, R: noise in running text).
//   - An ASCII-only headword needs a word boundary on both sides: no ASCII letter or
//     digit right before or after it (a Japanese / Chinese neighbour is a boundary,
//     so 「IoTデバイス」 matches IoT; "RAPID" does not match API). Before the end
//     boundary it may carry a plural "s" or "es" ("databases", "switches").
//   - Case-sensitive ASCII headwords — those of ≤ CASE_SENSITIVE_MAX characters, and
//     the all-caps English words of termMatchWords CASE_SENSITIVE_HEADWORDS (CASE,
//     LATCH, PERT, …) — match only in their own letter case, so ordinary English words
//     do not hit acronyms ("or" → OR, "its" → ITS, "in this case" → CASE); their plural
//     is a lowercase "s" only ("APIs", "LANs"; not "apis", "APIS"). Other ASCII
//     headwords are case-insensitive.
//   - A stoplisted headword (termMatchWords STOPLIST_HEADWORDS: single ordinary English
//     words such as Value, Cost, Mode, List) always counts when the matched text is in
//     all caps or touches Japanese / Chinese text on either side, directly or across one
//     ASCII space (「Valueとは」, "Value とは"). Written otherwise (English prose) it
//     counts only when no headword that is not stoplisted matched at all
//     ("what is the mode?" → Mode; "the value of a router" → Router only).
//   - Ids come back each once, in order of first appearance. When more than `limit`
//     terms match, the most specific are kept: class 1 = all-caps / ≤ 3-character
//     acronyms, multi-word headwords and non-ASCII headwords of ≥ 3 characters; class
//     2 = the rest (2-character CJK words, single words such as Router or IPv6, every
//     stoplisted word). A term takes the best class of its occurrences; within a class
//     earlier wins; the kept ids are then emitted in order of first appearance.

import type { TermIndexEntry } from "@/lib/glossary/dictionary";
import { termId } from "@/lib/glossary/termId";

import { CASE_SENSITIVE_HEADWORDS, STOPLIST_HEADWORDS } from "./termMatchWords";

export const MAX_MATCHED_TERMS = 8;
export const CASE_SENSITIVE_MAX = 3;

const ASCII_ONLY = /^[\x20-\x7e]+$/;
const ASCII_ALNUM = /[A-Za-z0-9]/;
/** Japanese / Chinese text: Han, kana, the prolonged sound mark and CJK punctuation (「」、。). */
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}、-〿・ー]/u;

/** Japanese / Chinese text right before `start` or right after `end`, directly or across one ASCII space. */
function touchesCjk(text: string, start: number, end: number): boolean {
  const before = text[start - 1] === " " ? text[start - 2] : text[start - 1];
  const after = text[end] === " " ? text[end + 1] : text[end];
  return CJK.test(before ?? "") || CJK.test(after ?? "");
}

interface Pattern {
  key: string;
  ascii: boolean;
  caseSensitive: boolean;
  stop: boolean;
  /** class 1 (see the header) */
  specific: boolean;
  ids: string[];
}

const foldAscii = (s: string): string => s.replace(/[A-Z]/g, (c) => c.toLowerCase());
const isAllCaps = (s: string): boolean => /[A-Z]/.test(s) && !/[a-z]/.test(s);

const CASE_SENSITIVE_WORDS = new Set(CASE_SENSITIVE_HEADWORDS.map((w) => w.normalize("NFKC")));
const STOPLIST = new Set(STOPLIST_HEADWORDS.map((w) => foldAscii(w.normalize("NFKC"))));

const compiled = new WeakMap<readonly TermIndexEntry[], Pattern[]>();

function patternsOf(index: readonly TermIndexEntry[]): Pattern[] {
  const cached = compiled.get(index);
  if (cached) return cached;
  const byKey = new Map<string, Pattern>();
  for (const entry of index) {
    if (entry.length === 0) continue;
    const id = termId(entry[0]!);
    for (const headword of entry) {
      const n = headword.normalize("NFKC").trim();
      if ([...n].length < 2) continue;
      const ascii = ASCII_ONLY.test(n);
      const caseSensitive = ascii && (n.length <= CASE_SENSITIVE_MAX || CASE_SENSITIVE_WORDS.has(n));
      const stop = ascii && !isAllCaps(n) && STOPLIST.has(foldAscii(n));
      const specific = ascii
        ? !stop && (/\s/.test(n) || isAllCaps(n) || n.length <= CASE_SENSITIVE_MAX)
        : [...n].length >= 3;
      const key = caseSensitive ? n : foldAscii(n);
      const mapKey = `${caseSensitive ? "c" : "i"}${stop ? "s" : ""}${specific ? 1 : 2}:${key}`;
      let p = byKey.get(mapKey);
      if (!p) byKey.set(mapKey, (p = { key, ascii, caseSensitive, stop, specific, ids: [] }));
      if (!p.ids.includes(id)) p.ids.push(id);
    }
  }
  const patterns = [...byKey.values()];
  compiled.set(index, patterns);
  return patterns;
}

/** Where an ASCII match at `start` ends: the headword, or it + "s" / "es", followed by a
 *  word boundary; -1 when none is. */
function asciiEnd(p: Pattern, exact: string, folded: string, start: number): number {
  const base = start + p.key.length;
  const ends = [base];
  if (ASCII_ALNUM.test(p.key.at(-1)!)) {
    if (p.caseSensitive) {
      if (exact[base] === "s") ends.push(base + 1);
    } else {
      if (folded[base] === "s") ends.push(base + 1);
      if (folded.startsWith("es", base)) ends.push(base + 2);
    }
  }
  return ends.find((e) => !ASCII_ALNUM.test(exact[e] ?? "")) ?? -1;
}

/** The ids of the index entries named in `text` (see the header for the rules). */
export function matchTerms(text: string, index: readonly TermIndexEntry[], limit = MAX_MATCHED_TERMS): string[] {
  const exact = text.normalize("NFKC");
  const folded = foldAscii(exact);
  // `prose`: a stoplisted headword neither in all caps nor next to CJK text
  const found: {
    start: number;
    end: number;
    inflected: boolean;
    specific: boolean;
    stop: boolean;
    prose: boolean;
    ids: string[];
  }[] = [];
  for (const p of patternsOf(index)) {
    const hay = p.caseSensitive ? exact : folded;
    for (let i = hay.indexOf(p.key); i >= 0; i = hay.indexOf(p.key, i + 1)) {
      let end = i + p.key.length;
      let prose = false;
      if (p.ascii) {
        if (ASCII_ALNUM.test(hay[i - 1] ?? "")) continue;
        end = asciiEnd(p, exact, folded, i);
        if (end < 0) continue;
        prose = p.stop && !isAllCaps(exact.slice(i, end)) && !touchesCjk(exact, i, end);
      }
      found.push({ start: i, end, inflected: end !== i + p.key.length, specific: p.specific, stop: p.stop, prose, ids: p.ids });
    }
  }

  found.sort(
    (a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start || Number(a.inflected) - Number(b.inflected),
  );
  const resolve = (candidates: typeof found): typeof found => {
    const kept: typeof found = [];
    for (const m of candidates) {
      if (kept.every((k) => m.end <= k.start || m.start >= k.end)) kept.push(m);
    }
    return kept.sort((a, b) => a.start - b.start);
  };
  // stoplisted prose words count only when no headword that is not stoplisted matched
  let kept = resolve(found.filter((m) => !m.prose));
  if (!kept.some((m) => !m.stop)) kept = resolve(found);

  // id → its order of first appearance and its best class (Map keeps appearance order)
  const terms = new Map<string, { seq: number; specific: boolean }>();
  for (const m of kept) {
    for (const id of m.ids) {
      const t = terms.get(id);
      if (!t) terms.set(id, { seq: terms.size, specific: m.specific });
      else if (m.specific) t.specific = true;
    }
  }
  const all = [...terms].map(([id, t]) => ({ id, ...t }));
  if (all.length <= limit) return all.map((t) => t.id);
  return all
    .sort((a, b) => Number(b.specific) - Number(a.specific) || a.seq - b.seq)
    .slice(0, limit)
    .sort((a, b) => a.seq - b.seq)
    .map((t) => t.id);
}
