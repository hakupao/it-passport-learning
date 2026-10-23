import { describe, expect, it } from "vitest";

import {
  questionThreadHref,
  REVIEW_THREAD_PARAM,
  reviewAnchorId,
  reviewThreadDate,
  reviewThreadHref,
  splitQuestionAnchor,
  termThreadHref,
  unitThreadHref,
} from "../threadLinks";
import { termId } from "@/lib/glossary/termId";

describe("splitQuestionAnchor", () => {
  // the six question_id shapes in data/ip/quiz/questions.json
  const cases: [string, string][] = [
    ["2009h21a-q054:イ", "2009h21a-q054"],
    ["2010h22h-q100:reveal", "2010h22h-q100"],
    ["2011h23tokubetsu-q058:ア", "2011h23tokubetsu-q058"],
    ["2019r01a-q001:エ", "2019r01a-q001"],
    ["2020r02o-q012:ウ", "2020r02o-q012"],
    ["2021r03-q099:reveal", "2021r03-q099"],
  ];
  for (const [anchorId, questionId] of cases) {
    it(`${anchorId} → ${questionId}`, () => {
      expect(splitQuestionAnchor(anchorId)).toBe(questionId);
    });
  }

  it("rejects anchors without a choice suffix or with an unknown id shape", () => {
    for (const bad of ["", "2009h21a-q054", ":イ", "2009h21a:イ", "2009h21a-qx:イ", "2024r06_q01:イ", "-q01:イ", "2009H21A-q054:イ", "a/b-q1:イ"]) {
      expect(splitQuestionAnchor(bad), bad).toBeNull();
    }
  });
});

describe("questionThreadHref", () => {
  it("links to the single-question page", () => {
    expect(questionThreadHref("2009h21a-q054:イ")).toBe("/practice/q/2009h21a-q054");
    expect(questionThreadHref("2011h23tokubetsu-q058:reveal")).toBe("/practice/q/2011h23tokubetsu-q058");
  });

  it("is null for an anchor it cannot parse", () => {
    expect(questionThreadHref("garbage")).toBeNull();
  });
});

describe("review anchors (D-181 Phase B)", () => {
  it("reviewAnchorId is <topic_id>:<local YYYY-MM-DD>", () => {
    expect(reviewAnchorId("technology-14-36", new Date(2026, 0, 5, 23, 59))).toBe("technology-14-36:2026-01-05");
    expect(reviewAnchorId("strategy-02-08", new Date(2026, 10, 22, 0, 0))).toBe("strategy-02-08:2026-11-22");
  });

  it("reviewThreadHref links to the topic page with the thread date, without the review flag", () => {
    expect(REVIEW_THREAD_PARAM).toBe("thread");
    expect(reviewThreadHref("technology-14-36:2026-10-22")).toBe("/practice/browse/technology-14-36?thread=2026-10-22");
    expect(reviewThreadHref("management-10-27:2026-01-05")).toBe("/practice/browse/management-10-27?thread=2026-01-05");
  });

  it("reviewThreadHref is null for an anchor it cannot parse", () => {
    for (const bad of [
      "",
      "technology-14-36",
      "technology-14-36:",
      "technology-14-36:2026-1-5",
      "technology-14-36:2026-02-30",
      "2009h21a-q054:イ",
      "Tech-14-36:2026-10-22",
      "a/b-14-36:2026-10-22",
    ]) {
      expect(reviewThreadHref(bad), bad).toBeNull();
    }
  });

  it("reviewThreadDate accepts a real calendar date only", () => {
    for (const ok of ["2026-10-22", "2026-01-05", "2024-02-29", "2026-12-31"]) expect(reviewThreadDate(ok), ok).toBe(ok);
    for (const bad of [
      null,
      undefined,
      "",
      "2026-1-5",
      "2026-13-01",
      "2026-00-10",
      "2026-02-29", // not a leap year
      "2026-04-31",
      "2026-10-00",
      "2026-10-22x",
      " 2026-10-22",
      "2026-10-22T00:00",
      "２０２６-10-22",
      "0000-01-01",
    ]) {
      expect(reviewThreadDate(bad), String(bad)).toBeNull();
    }
  });

  it("the date reviewAnchorId writes round-trips through the href and the parser", () => {
    const anchorId = reviewAnchorId("technology-14-36", new Date(2026, 1, 28, 12));
    const href = reviewThreadHref(anchorId)!;
    const date = new URLSearchParams(href.slice(href.indexOf("?"))).get(REVIEW_THREAD_PARAM);
    expect(reviewThreadDate(date)).toBe("2026-02-28");
    expect(`technology-14-36:${date}`).toBe(anchorId);
  });
});

describe("termThreadHref / unitThreadHref (Phase C)", () => {
  it("a term thread links back to its glossary page", () => {
    const id = termId("機能要件");
    expect(termThreadHref(id)).toBe(`/glossary/${id}`);
  });

  it("a term anchor not shaped like termId() has no link", () => {
    for (const bad of ["", "t0123", "T0123456789abcdef", "t0123456789abcdeg", "t0123456789abcdef0", "../t0123456789abcdef", "t0123456789abcdef#x"]) {
      expect(termThreadHref(bad), bad).toBeNull();
    }
  });

  it("a unit thread links back to its textbook page", () => {
    for (const id of ["management-08-25-u01", "technology-23-63-u10", "strategy-01-02-u08"]) {
      expect(unitThreadHref(id)).toBe(`/textbook/${id}`);
    }
  });

  it("a unit anchor not shaped like a unit id has no link", () => {
    for (const bad of ["", "management-08-25", "management-08-25-u1", "Management-08-25-u01", "../management-08-25-u01", "management-08-25-u01/x", "management-08-25-u01:2026-10-22"]) {
      expect(unitThreadHref(bad), bad).toBeNull();
    }
  });
});
