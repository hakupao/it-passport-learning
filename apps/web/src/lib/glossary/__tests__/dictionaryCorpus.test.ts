// Stage 6 (D-179 / D-180 §0-1, §0-2) — glossary dictionary invariants on the REAL
// committed corpus (data/ip/textbook + data/ip/quiz/questions.json), through the
// disk loaders. Guards: 1395 unique JP headwords, the 22 multi-unit headwords keep
// every sense, termId has no collision, every past-exam term resolves, URL-special
// headwords resolve, and the list view drops no entry.

import { describe, expect, it } from "vitest";

import { loadBaseQuestions } from "../../quiz/quizReader";
import { loadAllUnits, loadReaderIndex } from "../../textbook/reader";
import { matchTerms } from "../../sensei/termMatch";
import { buildListGroups, buildTermIndex } from "../dictionary";
import { loadDictionary } from "../dictionaryReader";
import { termId } from "../termId";

describe("glossary dictionary on the real corpus", () => {
  it("loads every unit listed in unit_index", async () => {
    const [index, units] = await Promise.all([loadReaderIndex(), loadAllUnits()]);
    expect(units).toHaveLength(index.stats.units);
    expect(new Set(units.map((u) => u.unit_id)).size).toBe(index.stats.units);
  });

  it("has 1395 entries with unique ids", async () => {
    const dict = await loadDictionary();
    expect(dict.entries).toHaveLength(1395);
    expect(new Set(dict.entries.map((e) => e.id)).size).toBe(1395);
    expect(dict.byId.size).toBe(1395);
    expect(dict.byTerm.size).toBe(1395);
  });

  it("keeps every sense of the 22 multi-unit headwords", async () => {
    const dict = await loadDictionary();
    expect(dict.entries.filter((e) => e.senses.length >= 2)).toHaveLength(22);
  });

  it("never lists the same unit twice within an entry's senses", async () => {
    const dict = await loadDictionary();
    const dup = dict.entries.filter((e) => new Set(e.senses.map((s) => s.unitId)).size !== e.senses.length);
    expect(dup.map((e) => e.term)).toEqual([]);
  });

  it("stores the NFC headword so term, id and byTerm key agree", async () => {
    const dict = await loadDictionary();
    for (const e of dict.entries) {
      expect(e.term).toBe(e.term.normalize("NFC"));
      expect(e.id).toBe(termId(e.term));
      expect(dict.byTerm.get(e.term)).toBe(e);
    }
  });

  it("resolves every distinct past-exam term (999) via byTerm", async () => {
    const [dict, questions] = await Promise.all([loadDictionary(), loadBaseQuestions()]);
    const names = new Set(questions.flatMap((q) => q.terms ?? []).map((t) => t.normalize("NFC")));
    expect(names.size).toBe(999);
    const missing = [...names].filter((t) => !dict.byTerm.has(t));
    expect(missing).toEqual([]);
  });

  it("resolves a URL-special headword", async () => {
    const dict = await loadDictionary();
    expect(dict.byTerm.get("ISO/IEC 27000")).toBeDefined();
  });

  it("lists every entry exactly once in the ja list groups", async () => {
    const [dict, index] = await Promise.all([loadDictionary(), loadReaderIndex()]);
    const items = buildListGroups(dict, index, "ja").flatMap((g) => g.items);
    expect(items).toHaveLength(dict.entries.length);
    expect(new Set(items.map((i) => i.id)).size).toBe(dict.entries.length);
  });

  // D-181 §0-9 — the light index shipped to /sensei, and free-question matching on it.
  it("builds the light term index: every entry once, JP headword first, termId(jp) = the server's id", async () => {
    const dict = await loadDictionary();
    const idx = buildTermIndex(dict);
    expect(idx).toHaveLength(1395);
    idx.forEach((row, i) => {
      expect(row[0]).toBe(dict.entries[i]!.term);
      expect(termId(row[0]!)).toBe(dict.entries[i]!.id);
      expect(new Set(row).size).toBe(row.length);
      expect(row.every((h) => h.trim() !== "")).toBe(true);
    });
    // every sense's zh / en headword is in its entry's row (the 22 multi-sense headwords included)
    for (const [i, e] of dict.entries.entries()) {
      for (const s of e.senses) expect(idx[i]).toEqual(expect.arrayContaining([s.term.term_zh, s.term.term_en]));
    }
  });

  it("matches free questions on the real index (longest match, acronym case rule)", async () => {
    const idx = buildTermIndex(await loadDictionary());
    expect(matchTerms("機能要件と非機能要件の違いは？", idx)).toEqual([termId("機能要件"), termId("非機能要件")]);
    expect(matchTerms("ＩＳＯ／ＩＥＣ　２７０００とは", idx)).toEqual([termId("ISO/IEC 27000")]);
    expect(matchTerms("LAN と WAN の違い", idx)).toEqual([termId("LAN"), termId("WAN")]);
    // OR, ITS and ETC are headwords; English prose words in lower case do not hit them.
    for (const h of ["OR", "ITS", "ETC"]) expect(idx.some((row) => row[0] === h)).toBe(true);
    expect(matchTerms("this or that, its, etc.", idx)).toEqual([]);
    expect(matchTerms("こんにちは", idx)).toEqual([]);
  });
});
