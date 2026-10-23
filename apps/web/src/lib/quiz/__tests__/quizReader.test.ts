// Stage 6 / Quiz Phase 0 (Session 86) — pure-helper unit tests for quizReader.
// Mirrors the textbook reader.test.ts approach: only the pure (no-I/O) helpers
// are tested here; the fs loaders are exercised by the build script + runtime.

import { describe, it, expect } from "vitest";

import {
  toDataLang,
  orderedChoices,
  localizedStem,
  localizedChoices,
  mergeTranslation,
  CHOICE_LETTERS,
  type QuizQuestion,
  type QuizTranslationEntry,
} from "../quizModel";

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
