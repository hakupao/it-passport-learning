// D-181 Phase C (§0-9) — matchTerms: the free question's terms by longest match over
// the light dictionary index (per entry: the JP headword, then the zh / en headwords of
// every sense). An entry's id is termId(JP headword). The expected entries below are
// written out by hand (as fixture labels t01…), not computed by the function under test.
//
// Matching rules pinned here:
//   - text and headwords are NFKC-normalized (full-width ⇄ half-width), English is
//     case-insensitive (ASCII letters only, so string offsets never shift);
//   - overlapping matches keep the longer one; equal lengths keep the leftmost;
//   - ids come back in order of first appearance, each once, at most `limit` (8);
//   - headwords of 1 character never match (表, 式, 辺, C, R: noise in running text);
//   - an ASCII-only headword needs a word boundary on both sides (no ASCII letter or
//     digit next to it; a Japanese / Chinese neighbour is fine: 「IoTデバイス」);
//   - an ASCII-only headword of ≤ 3 characters matches only in its own letter case,
//     so English prose words never hit acronyms (or → OR, its → ITS, etc → ETC).

import { describe, expect, it } from "vitest";

import type { TermIndexEntry } from "@/lib/glossary/dictionary";
import { termId } from "@/lib/glossary/termId";

import { matchTerms } from "../termMatch";

/** Fixture row: a label for the expectations, then the index entry's headwords. */
const LABELS: string[] = [];
const e = (label: string, ...headwords: string[]): TermIndexEntry => {
  LABELS.push(label);
  return headwords;
};

const INDEX: TermIndexEntry[] = [
  e("t01", "機能要件", "功能性需求", "Functional requirements"),
  e("t02", "非機能要件", "非功能性需求", "Non-functional requirements"),
  e("t03", "要件定義", "需求定义", "Requirements definition"),
  e("t04", "業務要件定義", "业务需求定义", "Business requirements definition"),
  e("t05", "ISO/IEC 27000", "ISO/IEC 27000", "ISO/IEC 27000"),
  e("t06", "ISO", "ISO", "ISO"),
  e("t07", "IEC", "IEC", "IEC"),
  e("t08", "キュー", "队列", "Queue"),
  e("t09", "IoT", "IoT", "IoT"),
  e("t10", "API", "API", "API"),
  e("t11", "LAN", "LAN", "LAN"),
  e("t12", "OR", "OR", "OR"),
  e("t13", "ITS", "ITS", "ITS"),
  e("t14", "ETC", "ETC", "ETC"),
  e("t15", "表", "表", "Table"),
  e("t16", "C", "C", "C"),
  e("t17", "ネットワーク", "网络", "Network"),
  e("t18", "移行", "迁移", "Migration"),
  e("t19", "マイグレーション", "迁移", "Migration"),
  e("t20", "M&A", "并购", "M&A"),
  e("t21", "C++", "C++", "C++"),
  // two senses: each sense's zh / en spelling is in the entry
  e("t22", "仮説検定", "假设检验", "Hypothesis testing", "假设检定", "Statistical hypothesis test"),
];

/** The ids (termId of the JP headword) of the fixture rows with these labels. */
const ids = (...labels: string[]): string[] =>
  labels.map((l) => {
    const i = LABELS.indexOf(l);
    if (i < 0) throw new Error(`no fixture row ${l}`);
    return termId(INDEX[i]![0]!);
  });

describe("matchTerms", () => {
  it("returns [] for an empty or term-free text", () => {
    expect(matchTerms("", INDEX)).toEqual([]);
    expect(matchTerms("こんにちは、よろしくお願いします", INDEX)).toEqual([]);
  });

  it("keeps the longer of two overlapping headwords", () => {
    expect(matchTerms("非機能要件とは何ですか", INDEX)).toEqual(ids("t02"));
    expect(matchTerms("業務要件定義書を書く", INDEX)).toEqual(ids("t04"));
    expect(matchTerms("ISO/IEC 27000 の位置づけは？", INDEX)).toEqual(ids("t05"));
  });

  it("still finds a shorter headword where it stands alone", () => {
    expect(matchTerms("機能要件と非機能要件の違い", INDEX)).toEqual(ids("t01", "t02"));
    expect(matchTerms("ISO と IEC の違い", INDEX)).toEqual(ids("t06", "t07"));
  });

  it("matches zh and en headwords, English case-insensitively", () => {
    expect(matchTerms("功能性需求是什么", INDEX)).toEqual(ids("t01"));
    expect(matchTerms("what are FUNCTIONAL requirements and non-functional requirements?", INDEX)).toEqual(ids("t01", "t02"));
    expect(matchTerms("how does a network work", INDEX)).toEqual(ids("t17"));
  });

  it("normalizes full-width / half-width forms (NFKC)", () => {
    expect(matchTerms("ＩＳＯ／ＩＥＣ　２７０００とは", INDEX)).toEqual(ids("t05"));
    expect(matchTerms("ｷｭｰとスタック", INDEX)).toEqual(ids("t08"));
    expect(matchTerms("ＩｏＴ機器", INDEX)).toEqual(ids("t09"));
  });

  it("requires word boundaries around ASCII headwords; a Japanese neighbour is a boundary", () => {
    expect(matchTerms("RAPID な開発", INDEX)).toEqual([]);
    expect(matchTerms("WLAN の設定", INDEX)).toEqual([]);
    expect(matchTerms("LAN2 と LAN", INDEX)).toEqual(ids("t11"));
    expect(matchTerms("IoTデバイスとAPIの関係", INDEX)).toEqual(ids("t09", "t10"));
    expect(matchTerms("M&A と C++ の話", INDEX)).toEqual(ids("t20", "t21"));
  });

  it("matches ASCII headwords of ≤ 3 characters only in their own case", () => {
    expect(matchTerms("this or that, its cost, etc.", INDEX)).toEqual([]);
    expect(matchTerms("Is it AND or OR?", INDEX)).toEqual(ids("t12"));
    expect(matchTerms("ITS と ETC の違い", INDEX)).toEqual(ids("t13", "t14"));
    expect(matchTerms("iot devices", INDEX)).toEqual([]);
  });

  it("never matches a 1-character headword", () => {
    expect(matchTerms("表を使う", INDEX)).toEqual([]);
    expect(matchTerms("C 言語の表現", INDEX)).toEqual([]);
  });

  it("orders ids by first appearance and lists each once", () => {
    expect(matchTerms("API と キュー と API と IoT", INDEX)).toEqual(ids("t10", "t08", "t09"));
  });

  it("matches the zh / en spelling of any sense of an entry", () => {
    expect(matchTerms("what is a statistical hypothesis test?", INDEX)).toEqual(ids("t22"));
    expect(matchTerms("Hypothesis testing と 假设检定", INDEX)).toEqual(ids("t22"));
  });

  it("skips an empty index row", () => {
    expect(matchTerms("機能要件", [[], ...INDEX])).toEqual(ids("t01"));
  });

  it("returns every entry sharing a matched headword, in index order", () => {
    expect(matchTerms("data migration plan", INDEX)).toEqual(ids("t18", "t19"));
  });

  it("stops at the limit (8 by default)", () => {
    const text = "機能要件 要件定義 ISO IEC キュー IoT API LAN ネットワーク M&A";
    expect(matchTerms(text, INDEX)).toEqual(ids("t01", "t03", "t06", "t07", "t08", "t09", "t10", "t11"));
    expect(matchTerms(text, INDEX, 2)).toEqual(ids("t01", "t03"));
  });

  it("is deterministic: the same text gives the same ids", () => {
    const text = "非機能要件と ISO/IEC 27000 と IoT";
    expect(matchTerms(text, INDEX)).toEqual(matchTerms(text, [...INDEX]));
    expect(matchTerms(text, INDEX)).toEqual(ids("t02", "t05", "t09"));
  });
});
