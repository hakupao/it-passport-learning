import { describe, expect, it } from "vitest";

import { questionThreadHref, splitQuestionAnchor } from "../threadLinks";

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
