// Quiz Phase 2 (D-137) — explanation model unit tests (mergeExplanation, localizedExplanation).

import { describe, expect, it } from "vitest";

import {
  localizedExplanation,
  mergeExplanation,
  type QuizExplanationEntry,
  type QuizQuestion,
} from "../quizModel";

function baseQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: "2025r07-q013",
    exam_id: "2025r07",
    topic_id: "strategy-01-03",
    category: "strategy",
    source_label: "令和7年度 問13",
    stem_jp: "損益分岐点となる売上高は何百万円か。",
    choices_jp: { ア: "160", イ: "250", ウ: "300", エ: "360" },
    correct_answer: "ウ",
    has_figure: true,
    figure: "2025r07-q013",
    figure_type: "table",
    terms: ["損益分岐点"],
    ...overrides,
  };
}

function entry(overrides: Partial<QuizExplanationEntry> = {}): QuizExplanationEntry {
  return {
    key_guard: { figure_derivable: true, derived_answer: "ウ", matches_key: true, suspect: false, note_jp: "120/0.4=300" },
    correct: { jp: "固定費120÷限界利益率0.4=300", zh: "固定成本120÷边际利益率0.4=300", en: "Fixed 120 / CM ratio 0.4 = 300" },
    distractors: {
      ア: { jp: "160は限界利益", zh: "160是边际利益", en: "160 is the contribution margin" },
      イ: { jp: "250は誤り", zh: "250错误", en: "250 is wrong" },
      エ: { jp: "360は誤り", zh: "360错误", en: "360 is wrong" },
    },
    points: [{ jp: "損益分岐点=固定費/限界利益率", zh: "盈亏平衡点=固定成本/边际利益率", en: "BEP = fixed cost / CM ratio" }],
    ...overrides,
  };
}

describe("mergeExplanation", () => {
  it("returns the question unchanged when entry is undefined (pre-backfill)", () => {
    const q = baseQuestion();
    expect(mergeExplanation(q, undefined)).toBe(q);
    expect(mergeExplanation(q, undefined).explanation).toBeUndefined();
  });

  it("attaches the entry without mutating the input", () => {
    const q = baseQuestion();
    const e = entry();
    const merged = mergeExplanation(q, e);
    expect(merged.explanation).toBe(e);
    expect(q.explanation).toBeUndefined(); // pure
  });
});

describe("localizedExplanation", () => {
  it("returns null when the question has no explanation", () => {
    expect(localizedExplanation(baseQuestion(), "ja")).toBeNull();
  });

  it("resolves correct/distractors/points to the active locale", () => {
    const q = mergeExplanation(baseQuestion(), entry());
    const zh = localizedExplanation(q, "zh")!;
    expect(zh.correct).toContain("边际利益率");
    expect(zh.points[0]).toContain("盈亏平衡点");
    const en = localizedExplanation(q, "en")!;
    expect(en.correct).toContain("CM ratio");
  });

  it("emits non-correct distractors in canonical ア/イ/ウ/エ order, skipping the correct letter", () => {
    const q = mergeExplanation(baseQuestion(), entry()); // correct=ウ
    const ja = localizedExplanation(q, "ja")!;
    expect(ja.distractors.map((d) => d.letter)).toEqual(["ア", "イ", "エ"]);
  });

  it("falls back to JP per field when a translation is empty", () => {
    const e = entry({
      correct: { jp: "日本語のみ", zh: "", en: "" },
    });
    const q = mergeExplanation(baseQuestion(), e);
    expect(localizedExplanation(q, "zh")!.correct).toBe("日本語のみ");
    expect(localizedExplanation(q, "en")!.correct).toBe("日本語のみ");
  });

  it("skips a distractor whose entry is missing rather than emitting a blank", () => {
    const e = entry({
      distractors: {
        ア: { jp: "160は限界利益", zh: "x", en: "x" },
        // イ intentionally missing
        エ: { jp: "360は誤り", zh: "x", en: "x" },
      },
    });
    const q = mergeExplanation(baseQuestion(), e);
    expect(localizedExplanation(q, "ja")!.distractors.map((d) => d.letter)).toEqual(["ア", "エ"]);
  });

  it("surfaces the key-guard suspect flag", () => {
    const clean = mergeExplanation(baseQuestion(), entry());
    expect(localizedExplanation(clean, "ja")!.suspect).toBe(false);
    const flagged = mergeExplanation(
      baseQuestion(),
      entry({ key_guard: { figure_derivable: true, derived_answer: "イ", matches_key: false, suspect: true, note_jp: "図はイ" } }),
    );
    expect(localizedExplanation(flagged, "ja")!.suspect).toBe(true);
  });
});
