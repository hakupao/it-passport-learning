// Stage 7 Phase 1 Task 10 fix round 1 — shared practice labels / orderings (isomorphic).
import { describe, expect, it } from "vitest";

import { PRACTICE_CATEGORY_LABEL_KEYS, PRACTICE_CATEGORY_ORDER, examsNewestFirst, starText } from "../practiceLabels";

describe("practice labels", () => {
  it("fields in IPA order with their message keys", () => {
    expect(PRACTICE_CATEGORY_ORDER).toEqual(["strategy", "management", "technology"]);
    expect(PRACTICE_CATEGORY_LABEL_KEYS.technology).toBe("cat_technology");
  });
  it("starText", () => {
    expect(starText(1)).toBe("★☆☆");
    expect(starText(3)).toBe("★★★");
  });
  it("examsNewestFirst orders by gregorian, not by input order; same year keeps autumn before spring", () => {
    const exams = [
      { exam_id: "2026r08", gregorian: 2026, label_jp: "令和8年度" },
      { exam_id: "2009h21h", gregorian: 2009, label_jp: "平成21年度 春期" },
      { exam_id: "2015h27h", gregorian: 2015, label_jp: "平成27年度 春期" },
      { exam_id: "2009h21a", gregorian: 2009, label_jp: "平成21年度 秋期" },
      { exam_id: "2015h27a", gregorian: 2015, label_jp: "平成27年度 秋期" },
    ];
    // within a year: index order reversed (the corpus lists spring before autumn)
    const chrono = [exams[1]!, exams[3]!, exams[2]!, exams[4]!, exams[0]!];
    expect(examsNewestFirst(chrono).map((e) => e.exam_id)).toEqual([
      "2026r08",
      "2015h27a",
      "2015h27h",
      "2009h21a",
      "2009h21h",
    ]);
    // a shuffled index still sorts by year
    expect(examsNewestFirst(exams).map((e) => e.gregorian)).toEqual([2026, 2015, 2015, 2009, 2009]);
  });
});
