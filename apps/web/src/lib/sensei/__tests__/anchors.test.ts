import { describe, expect, it } from "vitest";

import type { TermCard } from "@/lib/glossary/dictionary";
import type { LearningRecord } from "@/lib/learning/record";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

import { questionAnchor, reviewAnchor } from "../anchors";

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

// ── reviewAnchor (D-181 Phase B) ─────────────────────────────────────────────

/** Topic t-01 question `n` (keyed `key`), with per-question explanation text. */
function tq(n: number, key: string, terms: string[] = []): QuizQuestion {
  const id = `2024r06-q${String(n).padStart(3, "0")}`;
  const distractors: NonNullable<QuizQuestion["explanation"]>["distractors"] = {};
  for (const L of ["ア", "イ", "ウ", "エ"]) {
    if (L !== key) distractors[L] = { jp: `JP${n}${L}誤り`, zh: `ZH${n}${L}错误`, en: `EN${n}${L} wrong` };
  }
  return {
    ...q,
    id,
    source_label: `令和6年度 問${n}`,
    stem_jp: `JP問題文${n}`,
    stem_zh: `ZH题干${n}`,
    stem_en: `EN stem ${n}`,
    choices_jp: { ア: `JP${n}ア`, イ: `JP${n}イ`, ウ: `JP${n}ウ`, エ: `JP${n}エ` },
    choices_zh: { ア: `ZH${n}甲`, イ: `ZH${n}乙`, ウ: `ZH${n}丙`, エ: `ZH${n}丁` },
    choices_en: { ア: `EN${n}a`, イ: `EN${n}b`, ウ: `EN${n}c`, エ: `EN${n}d` },
    correct_answer: key,
    terms,
    explanation: {
      key_guard: { figure_derivable: null, derived_answer: key, matches_key: true, suspect: false, note_jp: "" },
      correct: { jp: `JP${n}正解理由`, zh: `ZH${n}正确理由`, en: `EN${n} why correct` },
      distractors,
      points: [{ jp: `JP${n}要点`, zh: `ZH${n}要点`, en: `EN${n} point` }],
    },
  };
}

function record(results: Record<string, { choice: string; correct: boolean; at: number }>): LearningRecord {
  return { v: 1, questions: results, unitsRead: {} };
}

describe("reviewAnchor", () => {
  const topic = [tq(1, "ア", ["OSS"]), tq(2, "ウ", ["ライセンス", "OSS"]), tq(3, "イ"), tq(4, "エ"), tq(5, "ア")];
  // q1 wrong (イ); q2 recorded correct=true but the key is now ウ → wrong; q4 recorded
  // correct=false but the key is now エ → right; q3 / q5 unanswered.
  const r = record({
    "2024r06-q001": { choice: "イ", correct: false, at: 100 },
    "2024r06-q002": { choice: "ア", correct: true, at: 300 },
    "2024r06-q004": { choice: "エ", correct: false, at: 200 },
  });

  it("is deterministic and carries no timestamp", () => {
    const a = reviewAnchor(topic, r, "zh", zhCards, "データ構造");
    const b = reviewAnchor(structuredClone(topic), structuredClone(r), "zh", { ...zhCards }, "データ構造");
    expect(a).toBe(b);
    expect(a).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(a).not.toMatch(/\d{2}:\d{2}/);
  });

  it("does not depend on record key order", () => {
    const reversed = record(Object.fromEntries(Object.entries(r.questions).reverse()));
    expect(reviewAnchor(topic, reversed, "ja", {}, "T")).toBe(reviewAnchor(topic, r, "ja", {}, "T"));
  });

  it("re-judges every answer with the current correct_answer, newest wrong answer first", () => {
    const a = reviewAnchor(topic, r, "ja", {}, "T");
    expect(a).toContain("学習記録: この分野の過去問 5 問のうち 3 問に解答、現在の正解で判定すると 1 問正解・2 問不正解");
    expect(a.indexOf("#2024r06-q002")).toBeGreaterThan(0);
    expect(a.indexOf("#2024r06-q002")).toBeLessThan(a.indexOf("#2024r06-q001")); // at 300 before at 100
    expect(a).toContain("学習者の解答: ア（不正解）");
    expect(a).toContain("学習者の解答: イ（不正解）");
    // q4 (now right) is neither a wrong question nor unanswered
    expect(a).not.toContain("#2024r06-q004");
    expect(a).not.toContain("JP問題文4");
  });

  it("keeps per wrong question: stem, choices, key, the learner's distractor note and the points only", () => {
    const a = reviewAnchor(topic, r, "zh", zhCards, "T");
    for (const s of ["JP問題文1", "ZH题干1", "JP1ア", "ZH1丁", "正解: ア", "JP1正解理由", "ZH1正确理由", "JP1要点", "ZH1要点"]) {
      expect(a).toContain(s);
    }
    expect(a).toContain("JP1イ誤り"); // the learner picked イ
    expect(a).toContain("ZH1イ错误");
    for (const s of ["JP1ウ誤り", "JP1エ誤り", "ZH1丙错误", "ZH1丁错误", "EN"]) expect(a).not.toContain(s);
    expect(a).toContain("JP2ア誤り");
    expect(a).not.toContain("JP2イ誤り");
    expect(a).not.toContain("JP2エ誤り");
  });

  it("ja: Japanese only", () => {
    const a = reviewAnchor(topic, r, "ja", {}, "T");
    expect(a).toContain("JP問題文1");
    expect(a).not.toMatch(/ZH|EN/);
  });

  it("lists not-yet-answered ids in set order and the review task lines", () => {
    const a = reviewAnchor(topic, r, "en", {}, "データ構造");
    expect(a).toContain("回答言語: 英語");
    expect(a).toContain("分野: データ構造");
    const unanswered = a.slice(a.indexOf("## まだ解いていない過去問"));
    expect(unanswered).toContain("- #2024r06-q003（令和6年度 問3）");
    expect(unanswered.indexOf("#2024r06-q003")).toBeLessThan(unanswered.indexOf("#2024r06-q005"));
    expect(a).not.toContain("JP問題文3"); // only the id + source of an unanswered question
    expect(a).toContain("[問題を開く](#問題ID)");
    expect(a).toContain("一覧にない問題 ID");
    expect(a).toContain("2〜3 問");
  });

  it("caps wrong questions at the 5 newest and unanswered ids at the first 10", () => {
    const many = Array.from({ length: 25 }, (_, i) => tq(i + 1, "ア"));
    const results: Record<string, { choice: string; correct: boolean; at: number }> = {};
    for (let i = 0; i < 12; i++) results[many[i]!.id] = { choice: "イ", correct: false, at: 1000 + i };
    const a = reviewAnchor(many, record(results), "ja", {}, "T");
    const wrongPart = a.slice(a.indexOf("## 間違えた過去問"), a.indexOf("## まだ解いていない過去問"));
    const wrongIds = [...wrongPart.matchAll(/### 問題 ID: #(\S+)/g)].map((m) => m[1]);
    expect(wrongIds).toEqual(many.slice(7, 12).map((x) => x.id).reverse()); // q012 … q008, newest first
    expect(wrongPart).toContain("最大 5 問");
    for (const old of many.slice(0, 7)) expect(a).not.toContain(`#${old.id}`); // older wrong ones are dropped
    const restPart = a.slice(a.indexOf("## まだ解いていない過去問"));
    const restIds = [...restPart.matchAll(/^- #(\S+)（/gm)].map((m) => m[1]);
    expect(restIds).toEqual(many.slice(12, 22).map((x) => x.id)); // q013 … q022
  });

  it("collects the wrong questions' terms once each, in order", () => {
    const a = reviewAnchor(topic, r, "zh", zhCards, "T");
    const terms = a.slice(a.indexOf("## 関連用語"));
    // q002 (newest wrong) lists ライセンス, OSS; q001 lists OSS again
    expect(terms.indexOf("ZH许可证定义")).toBeGreaterThan(0);
    expect(terms.indexOf("ZH许可证定义")).toBeLessThan(terms.indexOf("ZH开源定义"));
    expect(terms.split("ZH开源定义").length).toBe(2);
  });

  it("says so when nothing is wrong or everything is answered", () => {
    const allRight = record({ "2024r06-q001": { choice: "ア", correct: true, at: 1 } });
    const a = reviewAnchor([tq(1, "ア")], allRight, "ja", {}, "T");
    expect(a).toContain("間違えた過去問はありません");
    expect(a).toContain("この分野の過去問はすべて解答済みです");
    expect(a).not.toContain("## 関連用語");
  });
});
