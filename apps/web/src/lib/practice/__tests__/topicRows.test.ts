// Stage 7 Phase 2 §0-1 (D-193) — the topic page's light row: only the 5 fields the page and
// the review anchor's counting / not-yet-answered list need cross to the client.

import { describe, expect, it } from "vitest";

import type { QuizQuestion } from "@/lib/quiz/quizModel";

import { toTopicRow } from "../topicRows";

const q: QuizQuestion = {
  id: "2024r06-q001",
  exam_id: "2024r06",
  topic_id: "t-01",
  category: "technology",
  source_label: "令和6年度 問1",
  stem_jp: "JP問題文",
  choices_jp: { ア: "a", イ: "b", ウ: "c", エ: "d" },
  correct_answer: "ア",
  has_figure: false,
  figure: null,
  figure_type: null,
  terms: ["OSS"],
  stem_zh: "ZH",
  stem_en: "EN",
};

describe("toTopicRow", () => {
  it("keeps exactly id, exam_id, source_label, correct_answer and terms", () => {
    const row = toTopicRow(q);
    expect(Object.keys(row).sort()).toEqual(["correct_answer", "exam_id", "id", "source_label", "terms"]);
    expect(row).toEqual({
      id: "2024r06-q001",
      exam_id: "2024r06",
      source_label: "令和6年度 問1",
      correct_answer: "ア",
      terms: ["OSS"],
    });
  });
});
