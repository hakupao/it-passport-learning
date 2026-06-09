// Stage 6 / Quiz Phase 0 (Session 86) — pure-helper unit tests for quizReader.
// Mirrors the textbook reader.test.ts approach: only the pure (no-I/O) helpers
// are tested here; the fs loaders are exercised by the build script + runtime.

import { describe, it, expect } from "vitest";

import {
  toDataLang,
  buildTopicNav,
  buildExamNav,
  orderedChoices,
  localizedStem,
  localizedChoices,
  mergeTranslation,
  isValidMode,
  filterByTopic,
  filterByExam,
  CHOICE_LETTERS,
  type QuizIndex,
  type QuizQuestion,
  type QuizTranslationEntry,
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

// --- Phase 1 trilingual backfill (D-136) -----------------------------------

const TR = (over: Partial<QuizTranslationEntry> = {}): QuizTranslationEntry => ({
  stem: { zh: "题干", en: "stem-en" },
  choices: {
    ア: { zh: "甲", en: "a-en" },
    イ: { zh: "乙", en: "b-en" },
    ウ: { zh: "丙", en: "c-en" },
    エ: { zh: "丁", en: "d-en" },
  },
  ...over,
});

describe("mergeTranslation", () => {
  it("returns the question unchanged when there is no entry (JP fallback)", () => {
    const q = Q({});
    expect(mergeTranslation(q, undefined)).toBe(q);
  });

  it("folds zh/en stem + choices into the question, leaving JP intact", () => {
    const merged = mergeTranslation(Q({ stem_jp: "原文" }), TR());
    expect(merged.stem_jp).toBe("原文"); // raw JP kept (no stem_jp_clean)
    expect(merged.stem_zh).toBe("题干");
    expect(merged.stem_en).toBe("stem-en");
    expect(merged.choices_zh).toEqual({ ア: "甲", イ: "乙", ウ: "丙", エ: "丁" });
    expect(merged.choices_en!["エ"]).toBe("d-en");
  });

  it("overrides the displayed JP stem with stem_jp_clean when present (figure de-garble, D-136-C)", () => {
    const merged = mergeTranslation(
      Q({ stem_jp: "| @ | garbled 図 OCR" }),
      TR({ stem_jp_clean: "図の④で行うものはどれか。" }),
    );
    expect(merged.stem_jp).toBe("図の④で行うものはどれか。");
  });

  it("ignores a blank stem_jp_clean (keeps the raw JP)", () => {
    const merged = mergeTranslation(Q({ stem_jp: "原文" }), TR({ stem_jp_clean: "  " }));
    expect(merged.stem_jp).toBe("原文");
  });
});

describe("localizedStem", () => {
  it("picks the active-locale stem, JP for ja/unknown", () => {
    const q = mergeTranslation(Q({ stem_jp: "JP" }), TR({ stem: { zh: "ZH", en: "EN" } }));
    expect(localizedStem(q, "ja")).toBe("JP");
    expect(localizedStem(q, "zh")).toBe("ZH");
    expect(localizedStem(q, "en")).toBe("EN");
    expect(localizedStem(q, "fr")).toBe("JP");
  });

  it("falls back to JP when the locale field is missing or blank", () => {
    const untranslated = Q({ stem_jp: "JPだけ" });
    expect(localizedStem(untranslated, "zh")).toBe("JPだけ");
    const blank = mergeTranslation(Q({ stem_jp: "JP" }), TR({ stem: { zh: "", en: "EN" } }));
    expect(localizedStem(blank, "zh")).toBe("JP"); // blank zh → JP fallback
  });
});

describe("localizedChoices", () => {
  it("returns canonical-ordered choices in the active locale, marking the correct one", () => {
    const q = mergeTranslation(Q({ correct_answer: "ウ" }), TR());
    const zh = localizedChoices(q, "zh");
    expect(zh.map((c) => c.letter)).toEqual([...CHOICE_LETTERS]);
    expect(zh.map((c) => c.text)).toEqual(["甲", "乙", "丙", "丁"]);
    expect(zh.find((c) => c.isCorrect)!.letter).toBe("ウ");
  });

  it("per-choice JP fallback: a half-translated choice never blanks", () => {
    const partial = mergeTranslation(
      Q({ choices_jp: { ア: "a", イ: "b", ウ: "c", エ: "d" } }),
      TR({ choices: { ア: { zh: "甲", en: "a" }, イ: { zh: "", en: "b" }, ウ: { zh: "丙", en: "c" }, エ: { zh: "丁", en: "d" } } }),
    );
    const zh = localizedChoices(partial, "zh");
    expect(zh.map((c) => c.text)).toEqual(["甲", "b", "丙", "丁"]); // イ blank → JP "b"
  });

  it("ja locale ignores translations and uses JP choices", () => {
    const q = mergeTranslation(Q({ choices_jp: { ア: "a", イ: "b", ウ: "c", エ: "d" } }), TR());
    expect(localizedChoices(q, "ja").map((c) => c.text)).toEqual(["a", "b", "c", "d"]);
  });
});
