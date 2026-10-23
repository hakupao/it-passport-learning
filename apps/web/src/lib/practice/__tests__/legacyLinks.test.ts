// Stage 7 Phase 1 Task 13 (DESIGN §4, D-190 §0-17) — where a legacy /quiz URL lands.
import { describe, expect, it } from "vitest";

import { legacyQuizTarget } from "../legacyLinks";

describe("legacyQuizTarget", () => {
  it("#<question_id> → the single-question page (the fragment wins over the query)", () => {
    expect(legacyQuizTarget("?mode=exam&id=2024r06", "#2024r06-q001")).toBe("/practice/q/2024r06-q001");
    expect(legacyQuizTarget("", "#2011h23tokubetsu-q058")).toBe("/practice/q/2011h23tokubetsu-q058");
    expect(legacyQuizTarget("?mode=topic&id=technology-14-36&review=1", "#2009h21a-q054")).toBe(
      "/practice/q/2009h21a-q054",
    );
  });

  it("?mode=topic&id=X&review=1 → the topic page with the review flag", () => {
    expect(legacyQuizTarget("?mode=topic&id=technology-14-36&review=1", "")).toBe(
      "/practice/browse/technology-14-36?review=1",
    );
  });

  it("?mode=topic&id=X&thread=D → the topic page with that dated thread (never review=1)", () => {
    expect(legacyQuizTarget("?mode=topic&id=management-10-27&thread=2026-01-05", "")).toBe(
      "/practice/browse/management-10-27?thread=2026-01-05",
    );
    // both flags: the thread wins (a /sensei row must never auto-send)
    expect(legacyQuizTarget("?mode=topic&id=management-10-27&review=1&thread=2026-01-05", "")).toBe(
      "/practice/browse/management-10-27?thread=2026-01-05",
    );
  });

  it("an invalid thread date is dropped (review=1 still applies when present)", () => {
    expect(legacyQuizTarget("?mode=topic&id=strategy-02-08&thread=2026-02-30&review=1", "")).toBe(
      "/practice/browse/strategy-02-08?review=1",
    );
    expect(legacyQuizTarget("?mode=topic&id=strategy-02-08&thread=garbage", "")).toBe(
      "/practice?topic=strategy-02-08&prefill=1",
    );
  });

  it("?mode=topic&id=X → the setup panel with X prefilled", () => {
    expect(legacyQuizTarget("?mode=topic&id=technology-14-36", "")).toBe("/practice?topic=technology-14-36&prefill=1");
    // a leading "?" is optional
    expect(legacyQuizTarget("mode=topic&id=technology-14-36", "")).toBe("/practice?topic=technology-14-36&prefill=1");
  });

  it("?mode=exam&id=Y → the setup panel with Y prefilled (review / thread do not apply to an exam)", () => {
    expect(legacyQuizTarget("?mode=exam&id=2025r07", "")).toBe("/practice?exam=2025r07&prefill=1");
    expect(legacyQuizTarget("?mode=exam&id=2011h23tokubetsu&review=1&thread=2026-01-05", "")).toBe(
      "/practice?exam=2011h23tokubetsu&prefill=1",
    );
  });

  it("a fragment that is not a question id falls back to the query rules", () => {
    for (const hash of ["#", "#q-2024r06-q001", "#2024R06-q001", "#2024r06-q1", "#2024r06-q001x", "#%3Cscript%3E", "#top"]) {
      expect(legacyQuizTarget("?mode=exam&id=2024r06", hash), hash).toBe("/practice?exam=2024r06&prefill=1");
      expect(legacyQuizTarget("", hash), hash).toBe("/practice/browse");
    }
  });

  it("no query, an unknown mode or a malformed id → the browse page", () => {
    for (const search of [
      "",
      "?",
      "?mode=topic",
      "?mode=exam",
      "?id=technology-14-36",
      "?mode=year&id=2024r06",
      "?mode=TOPIC&id=technology-14-36",
      "?mode=topic&id=Tech-14-36",
      "?mode=topic&id=technology-14-36/../x",
    ]) {
      expect(legacyQuizTarget(search, ""), search).toBe("/practice/browse");
    }
    expect(legacyQuizTarget("?mode=exam&id=2024r06%2F..", ""), "slash").toBe("/practice/browse");
    expect(legacyQuizTarget("?mode=exam&id=2024-r06", ""), "dash").toBe("/practice/browse");
  });

  it("the first of a repeated parameter is used, as the old page did", () => {
    expect(legacyQuizTarget("?mode=topic&id=technology-14-36&id=strategy-02-08", "")).toBe(
      "/practice?topic=technology-14-36&prefill=1",
    );
  });
});
