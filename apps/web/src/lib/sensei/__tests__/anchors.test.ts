import { describe, expect, it } from "vitest";

import type { TermCard } from "@/lib/glossary/dictionary";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

import { questionAnchor } from "../anchors";

// choices_* keys deliberately permuted: the anchor must not follow object key order.
const q: QuizQuestion = {
  id: "2024r06_q01",
  exam_id: "2024r06",
  topic_id: "t-01",
  category: "technology",
  source_label: "令和6年度 ITパスポート試験 問1",
  stem_jp: "JP問題文：OSSの説明として適切なものはどれか。",
  choices_jp: { エ: "JPエ選択肢", ア: "JPア選択肢", ウ: "JPウ選択肢", イ: "JPイ選択肢" },
  correct_answer: "ア",
  has_figure: false,
  figure: null,
  figure_type: null,
  terms: ["OSS", "ライセンス"],
  stem_zh: "ZH题干：关于OSS的说明，哪一项是恰当的？",
  stem_en: "EN stem: Which is an appropriate description of OSS?",
  choices_zh: { ウ: "ZH丙", ア: "ZH甲", エ: "ZH丁", イ: "ZH乙" },
  choices_en: { イ: "EN choice b", ア: "EN choice a", エ: "EN choice d", ウ: "EN choice c" },
  explanation: {
    key_guard: { figure_derivable: null, derived_answer: "ア", matches_key: true, suspect: false, note_jp: "" },
    correct: { jp: "JP正解理由", zh: "ZH正确理由", en: "EN why correct" },
    distractors: {
      エ: { jp: "JPエ誤り", zh: "ZH丁错误", en: "EN d wrong" },
      イ: { jp: "JPイ誤り", zh: "ZH乙错误", en: "EN b wrong" },
      ウ: { jp: "JPウ誤り", zh: "ZH丙错误", en: "EN c wrong" },
    },
    points: [{ jp: "JP要点1", zh: "ZH要点1", en: "EN point 1" }],
  },
};

function card(term: string, gloss: string, definition: string, memoryHook: string): TermCard {
  return { id: `id-${term}`, term, gloss, definition, memoryHook, senseCount: 1, questionCount: 3 };
}

// cards for the zh UI (gloss / definition / hook already in the UI locale); keys in reverse order
const zhCards: Record<string, TermCard> = {
  ライセンス: card("ライセンス", "许可证", "ZH许可证定义", "ZH许可证记忆"),
  OSS: card("OSS", "开源软件", "ZH开源定义", "ZH开源记忆"),
};

describe("questionAnchor", () => {
  it("is deterministic and carries no timestamp", () => {
    const a = questionAnchor(q, "zh", { choice: "イ", termCards: zhCards });
    const b = questionAnchor(structuredClone(q), "zh", { choice: "イ", termCards: { ...zhCards } });
    expect(a).toBe(b);
    expect(a).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(a).not.toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it("lists choices in ア イ ウ エ order regardless of object key order", () => {
    const a = questionAnchor(q, "ja", { termCards: {} });
    const pos = ["JPア選択肢", "JPイ選択肢", "JPウ選択肢", "JPエ選択肢"].map((s) => a.indexOf(s));
    expect(pos.every((p) => p >= 0)).toBe(true);
    expect([...pos].sort((x, y) => x - y)).toEqual(pos);
    const d = ["JPイ誤り", "JPウ誤り", "JPエ誤り"].map((s) => a.indexOf(s));
    expect([...d].sort((x, y) => x - y)).toEqual(d);
  });

  it("re-judges the learner's choice with the current correct_answer", () => {
    // the record said correct=true at answer time, but the key is now ア
    const wrong = questionAnchor(q, "ja", { choice: "イ", termCards: {} });
    expect(wrong).toContain("学習者の解答: イ（不正解）");
    const right = questionAnchor(q, "ja", { choice: "ア", termCards: {} });
    expect(right).toContain("学習者の解答: ア（正解）");
    const none = questionAnchor(q, "ja", { termCards: {} });
    expect(none).toContain("学習者の解答: 未解答");
  });

  it("zh: Japanese original + Chinese, no English", () => {
    const a = questionAnchor(q, "zh", { choice: "イ", termCards: zhCards });
    for (const s of ["JP問題文", "JPア選択肢", "JP正解理由", "JPイ誤り", "JP要点1"]) expect(a).toContain(s);
    for (const s of ["ZH题干", "ZH甲", "ZH丁", "ZH正确理由", "ZH乙错误", "ZH要点1"]) expect(a).toContain(s);
    for (const s of ["EN stem", "EN choice", "EN why", "EN b wrong", "EN point"]) expect(a).not.toContain(s);
    expect(a).toContain("中国語");
  });

  it("ja: Japanese only", () => {
    const a = questionAnchor(q, "ja", { termCards: {} });
    expect(a).toContain("JP問題文");
    expect(a).not.toMatch(/ZH|EN /);
  });

  it("en: Japanese original + English", () => {
    const a = questionAnchor(q, "en", { termCards: {} });
    expect(a).toContain("JP問題文");
    expect(a).toContain("EN stem");
    expect(a).toContain("EN d wrong");
    expect(a).not.toContain("ZH");
    expect(a).toContain("英語");
  });

  it("names the question id, source and key, and lists term cards in q.terms order", () => {
    const a = questionAnchor(q, "zh", { termCards: zhCards });
    expect(a).toContain("#2024r06_q01");
    expect(a).toContain("令和6年度 ITパスポート試験 問1");
    expect(a).toContain("正解: ア");
    expect(a.indexOf("ZH开源定义")).toBeGreaterThan(0);
    expect(a.indexOf("ZH开源定义")).toBeLessThan(a.indexOf("ZH许可证定义"));
    expect(a).toContain("ZH开源记忆");
  });

  it("flags a key_guard suspect key and a figure the model cannot see", () => {
    const sus: QuizQuestion = {
      ...q,
      has_figure: true,
      figure: q.id,
      explanation: { ...q.explanation!, key_guard: { ...q.explanation!.key_guard, suspect: true } },
    };
    const a = questionAnchor(sus, "ja", { termCards: {} });
    expect(a).toContain("確認中");
    expect(a).toContain("図");
  });

  it("works without an explanation (pre-backfill)", () => {
    const { explanation: _omit, ...bare } = q;
    void _omit;
    const a = questionAnchor(bare, "zh", { termCards: {} });
    expect(a).toContain("JP問題文");
    expect(a).not.toContain("JP正解理由");
  });
});
