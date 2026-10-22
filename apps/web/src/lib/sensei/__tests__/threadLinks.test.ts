import { describe, expect, it } from "vitest";

import { questionThreadHref, reviewAnchorId, reviewThreadHref, splitQuestionAnchor } from "../threadLinks";

describe("splitQuestionAnchor", () => {
  // the six question_id shapes in data/ip/quiz/questions.json (exam_id = id before "-q<NNN>")
  const cases: [string, string, string][] = [
    ["2009h21a-q054:イ", "2009h21a-q054", "2009h21a"],
    ["2010h22h-q100:reveal", "2010h22h-q100", "2010h22h"],
    ["2011h23tokubetsu-q058:ア", "2011h23tokubetsu-q058", "2011h23tokubetsu"],
    ["2019r01a-q001:エ", "2019r01a-q001", "2019r01a"],
    ["2020r02o-q012:ウ", "2020r02o-q012", "2020r02o"],
    ["2021r03-q099:reveal", "2021r03-q099", "2021r03"],
  ];
  for (const [anchorId, questionId, examId] of cases) {
    it(`${anchorId} → ${questionId} in ${examId}`, () => {
      expect(splitQuestionAnchor(anchorId)).toEqual({ questionId, examId });
    });
  }

  it("rejects anchors without a choice suffix or with an unknown id shape", () => {
    for (const bad of ["", "2009h21a-q054", ":イ", "2009h21a:イ", "2009h21a-qx:イ", "2024r06_q01:イ", "-q01:イ", "2009H21A-q054:イ", "a/b-q1:イ"]) {
      expect(splitQuestionAnchor(bad), bad).toBeNull();
    }
  });
});

describe("questionThreadHref", () => {
  it("links to the exam set with the question as the hash", () => {
    expect(questionThreadHref("2009h21a-q054:イ")).toBe("/quiz?mode=exam&id=2009h21a#2009h21a-q054");
    expect(questionThreadHref("2011h23tokubetsu-q058:reveal")).toBe(
      "/quiz?mode=exam&id=2011h23tokubetsu#2011h23tokubetsu-q058",
    );
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

  it("reviewThreadHref links to the topic set without the review flag", () => {
    expect(reviewThreadHref("technology-14-36:2026-10-22")).toBe("/quiz?mode=topic&id=technology-14-36");
    expect(reviewThreadHref("management-10-27:2026-01-05")).toBe("/quiz?mode=topic&id=management-10-27");
  });

  it("reviewThreadHref is null for an anchor it cannot parse", () => {
    for (const bad of ["", "technology-14-36", "technology-14-36:", "technology-14-36:2026-1-5", "2009h21a-q054:イ", "Tech-14-36:2026-10-22", "a/b-14-36:2026-10-22"]) {
      expect(reviewThreadHref(bad), bad).toBeNull();
    }
  });
});
