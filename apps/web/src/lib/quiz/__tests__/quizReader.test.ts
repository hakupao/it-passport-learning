// Stage 6 / Quiz Phase 0 (Session 86) — pure-helper unit tests for quizReader.
// Mirrors the textbook reader.test.ts approach: only the pure (no-I/O) helpers
// are tested here; the fs loaders are exercised by the build script + runtime.

import { describe, it, expect } from "vitest";

import {
  toDataLang,
  buildTopicNav,
  buildExamNav,
  orderedChoices,
  isValidMode,
  filterByTopic,
  filterByExam,
  CHOICE_LETTERS,
  type QuizIndex,
  type QuizQuestion,
} from "../quizModel";

const INDEX: QuizIndex = {
  schema_version: "quiz-v1",
  generated_from: "test",
  attribution: "test",
  stats: { questions: 5, topics: 3, exams: 2, with_figure: 1 },
  topics: [
    // deliberately out of category-path order to test grouping/sort
    { topic_id: "strategy-01-01", category: "strategy", major_jp: "企業と法務", major_zh: "企业与法务", major_en: "Corp", medium_jp: "企業活動", medium_zh: "企业活动", medium_en: "Biz", name_jp: "経営・組織論", question_count: 2 },
    { topic_id: "technology-13-33", category: "technology", major_jp: "基礎理論", major_zh: "基础理论", major_en: "Theory", medium_jp: "基礎理論", medium_zh: "基础理论", medium_en: "Theory", name_jp: "離散数学", question_count: 2 },
    { topic_id: "management-10-22", category: "management", major_jp: "開発技術", major_zh: "开发技术", major_en: "Dev", medium_jp: "システム開発", medium_zh: "系统开发", medium_en: "SysDev", name_jp: "見積り", question_count: 1 },
  ],
  exams: [
    { exam_id: "2009h21h", gregorian: 2009, wareki: "平成21年度", season: "春期", label_jp: "平成21年度 春期", question_count: 3 },
    { exam_id: "2024r06", gregorian: 2024, wareki: "令和6年度", season: "", label_jp: "令和6年度", question_count: 2 },
  ],
};

const Q = (over: Partial<QuizQuestion>): QuizQuestion => ({
  id: "2009h21h-q001",
  exam_id: "2009h21h",
  topic_id: "strategy-01-01",
  category: "strategy",
  source_label: "平成21年度 春期 ITパスポート試験 問1",
  stem_jp: "stem",
  choices_jp: { ア: "a", イ: "b", ウ: "c", エ: "d" },
  correct_answer: "ウ",
  has_figure: false,
  figure: null,
  figure_type: null,
  terms: [],
  ...over,
});

describe("toDataLang", () => {
  it("maps ja→jp, passes zh/en, defaults unknown to jp", () => {
    expect(toDataLang("ja")).toBe("jp");
    expect(toDataLang("zh")).toBe("zh");
    expect(toDataLang("en")).toBe("en");
    expect(toDataLang("fr")).toBe("jp");
  });
});

describe("buildTopicNav", () => {
  it("groups by category in D-114 path order (technology→management→strategy)", () => {
    const nav = buildTopicNav(INDEX, "ja");
    expect(nav.map((c) => c.category)).toEqual(["technology", "management", "strategy"]);
  });

  it("localizes major/medium per locale but keeps name_jp in JP", () => {
    const zh = buildTopicNav(INDEX, "zh");
    const tech = zh.find((c) => c.category === "technology")!.topics[0]!;
    expect(tech.major).toBe("基础理论"); // zh
    expect(tech.name_jp).toBe("離散数学"); // JP regardless of locale
    const ja = buildTopicNav(INDEX, "ja");
    expect(ja.find((c) => c.category === "technology")!.topics[0]!.major).toBe("基礎理論");
  });

  it("carries question_count through", () => {
    const nav = buildTopicNav(INDEX, "en");
    const strat = nav.find((c) => c.category === "strategy")!.topics[0]!;
    expect(strat.major).toBe("Corp");
    expect(strat.question_count).toBe(2);
  });
});

describe("buildExamNav", () => {
  it("returns exams chronologically (oldest first)", () => {
    const exams = buildExamNav(INDEX);
    expect(exams.map((e) => e.exam_id)).toEqual(["2009h21h", "2024r06"]);
  });
});

describe("orderedChoices", () => {
  it("returns the 4 choices in canonical ア/イ/ウ/エ order even if object keys are permuted", () => {
    const q = Q({ choices_jp: { ウ: "c", ア: "a", エ: "d", イ: "b" } });
    const oc = orderedChoices(q);
    expect(oc.map((c) => c.letter)).toEqual([...CHOICE_LETTERS]);
    expect(oc.map((c) => c.text)).toEqual(["a", "b", "c", "d"]);
  });

  it("marks the correct choice", () => {
    const oc = orderedChoices(Q({ correct_answer: "ウ" }));
    expect(oc.find((c) => c.isCorrect)!.letter).toBe("ウ");
    expect(oc.filter((c) => c.isCorrect)).toHaveLength(1);
  });
});

describe("isValidMode", () => {
  it("accepts only topic|exam", () => {
    expect(isValidMode("topic")).toBe(true);
    expect(isValidMode("exam")).toBe(true);
    expect(isValidMode("year")).toBe(false);
    expect(isValidMode(undefined)).toBe(false);
    expect(isValidMode("../etc")).toBe(false);
  });
});

describe("filters", () => {
  const qs = [
    Q({ id: "a", topic_id: "strategy-01-01", exam_id: "2009h21h" }),
    Q({ id: "b", topic_id: "technology-13-33", exam_id: "2009h21h" }),
    Q({ id: "c", topic_id: "strategy-01-01", exam_id: "2024r06" }),
  ];
  it("filterByTopic preserves source order", () => {
    expect(filterByTopic(qs, "strategy-01-01").map((q) => q.id)).toEqual(["a", "c"]);
  });
  it("filterByExam preserves source order", () => {
    expect(filterByExam(qs, "2009h21h").map((q) => q.id)).toEqual(["a", "b"]);
  });
  it("unknown id → empty", () => {
    expect(filterByTopic(qs, "nope")).toEqual([]);
    expect(filterByExam(qs, "nope")).toEqual([]);
  });
});
