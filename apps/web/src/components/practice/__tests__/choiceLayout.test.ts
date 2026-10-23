// Stage 7 Phase 1 Task 8 (D-190 §0-15 / §0-16) — choice layout + explanation title.
import { beforeAll, describe, expect, it } from "vitest";

import { isTableChoice } from "@/components/quiz/QuizRichText";
import { CHOICE_LETTERS, loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import { choiceLayout, explanationTitle, longestUnbreakableRun, sourceNumber, UNBREAKABLE_MIN } from "../choiceLayout";

let QS: QuizQuestion[] = [];
beforeAll(async () => {
  QS = await loadAllQuestions();
});

function fake(choices: string[], extra: Partial<QuizQuestion> = {}): QuizQuestion {
  const [a, b, c, d] = choices;
  return {
    id: "2099x01-q001",
    exam_id: "2099x01",
    topic_id: "t",
    category: "strategy",
    source_label: "問1",
    stem_jp: "s",
    choices_jp: { ア: a ?? "", イ: b ?? "", ウ: c ?? "", エ: d ?? "" },
    correct_answer: "ア",
    has_figure: false,
    figure: null,
    figure_type: null,
    terms: [],
    ...extra,
  };
}

describe("choiceLayout (§0-15) on the real corpus", () => {
  it("counts row4 / grid2 / list (measured S132 Task 8; Rule A attempt 2 adds the unbreakable-run rule)", () => {
    const counts = { row4: 0, grid2: 0, list: 0 };
    for (const q of QS) counts[choiceLayout(q)]++;
    expect(QS).toHaveLength(2900);
    expect(counts).toEqual({ row4: 1140, grid2: 10, list: 1750 });
  });

  it("grid2 is exactly the choice_figures questions", () => {
    const grid = QS.filter((q) => choiceLayout(q) === "grid2").map((q) => q.id);
    const figs = QS.filter((q) => q.choice_figures).map((q) => q.id);
    expect(grid).toEqual(figs);
    expect(figs).toHaveLength(10);
  });
});

describe("unbreakable runs (Rule A audit attempt 1: 2011h23tokubetsu-q059 overflowed its row4 cells)", () => {
  it("q059 「①and②and③」-type choices → list", () => {
    const q = QS.find((x) => x.id === "2011h23tokubetsu-q059")!;
    expect(longestUnbreakableRun(q.choices_jp["ア"]!)).toBeGreaterThanOrEqual(UNBREAKABLE_MIN);
    expect(choiceLayout(q)).toBe("list");
    expect(choiceLayout(fake(["①and②and③", "(①and②)or③", "①or(②and③)", "①or②or③"]))).toBe("list");
  });

  it("a normal short Japanese row4 question stays row4", () => {
    expect(choiceLayout(fake(["請負契約", "準委任契約", "派遣契約", "雇用契約"]))).toBe("row4");
    expect(choiceLayout(fake(["a，b", "a，c", "b，c", "a，b，c"]))).toBe("row4");
    expect(choiceLayout(fake(["ＡＢＣＤＥＦＧ", "（１）と（５）", "ア", "イ"]))).toBe("row4"); // full-width forms break
  });

  it("the CJK class: Han / kana / ー・ / CJK punctuation / full-width forms break a run; ASCII, ①, → do not", () => {
    expect(longestUnbreakableRun("abcde")).toBe(5);
    expect(longestUnbreakableRun("abcdef")).toBe(6);
    expect(longestUnbreakableRun("abc def")).toBe(3); // whitespace breaks
    expect(longestUnbreakableRun("abc　def")).toBe(3); // U+3000
    expect(longestUnbreakableRun("abc漢def")).toBe(3);
    expect(longestUnbreakableRun("abcあdefカghiー123・456")).toBe(3);
    expect(longestUnbreakableRun("abc、def。ghi「jk」")).toBe(3);
    expect(longestUnbreakableRun("abc，def（ghi）ｶ")).toBe(3);
    expect(longestUnbreakableRun("①②③④⑤⑥")).toBe(6);
    expect(longestUnbreakableRun("a→b→c→d")).toBe(7);
    expect(longestUnbreakableRun("𠀋𠀋𠀋")).toBe(0); // astral Han
    expect(longestUnbreakableRun("")).toBe(0);
  });

  it("5 ASCII characters fit row4, 6 do not", () => {
    expect(choiceLayout(fake(["IPv4a", "a", "b", "c"]))).toBe("row4");
    expect(choiceLayout(fake(["IPv6ab", "a", "b", "c"]))).toBe("list");
  });
});

describe("choiceLayout (§0-15) rules", () => {
  it("four short choices → row4", () => {
    expect(choiceLayout(fake(["a", "a，b", "a，c", "b，c"]))).toBe("row4");
  });

  it("12 code points after removing whitespace still fits; whitespace does not count", () => {
    expect(choiceLayout(fake(["あいうえおかきくけこさし", "a b c", "x　y", "z"]))).toBe("row4");
  });

  it("a choice with 13 code points → list", () => {
    expect(choiceLayout(fake(["あいうえおかきくけこさしす", "a", "b", "c"]))).toBe("list");
  });

  it("code points, not UTF-16 units: 12 astral characters stay row4", () => {
    expect(choiceLayout(fake(["𠀋".repeat(12), "a", "b", "c"]))).toBe("row4");
  });

  it("a newline → list", () => {
    expect(choiceLayout(fake(["a\nb", "a", "b", "c"]))).toBe("list");
  });

  it("a table choice → list", () => {
    expect(choiceLayout(fake(["[表] | a | b |\n| 1 | 2 |", "a", "b", "c"]))).toBe("list");
    // every corpus question with a table choice (QuizSet header: 18) lays out as a list
    const tableQs = QS.filter((q) => CHOICE_LETTERS.some((L) => isTableChoice(q.choices_jp[L] ?? "", q.choices_jp[L])));
    expect(tableQs).toHaveLength(18);
    expect(tableQs.filter((q) => choiceLayout(q) !== "list").map((q) => q.id)).toEqual([]);
  });

  it("choice_figures → grid2 even when the texts are short", () => {
    expect(
      choiceLayout(fake(["a", "b", "c", "d"], { choice_figures: { ア: "x-a", イ: "x-i", ウ: "x-u", エ: "x-e" } })),
    ).toBe("grid2");
  });
});

describe("explanationTitle (§0-16)", () => {
  it("short: the part before the first 「。」 when ≤ 30 code points", () => {
    expect(explanationTitle(["偽装請負の判定。指揮命令者で決まる。"])).toBe("偽装請負の判定");
  });

  it("long: more than 30 code points before 「。」 → null", () => {
    expect(explanationTitle(["あ".repeat(31) + "。続き。"])).toBeNull();
    expect(explanationTitle(["あ".repeat(30) + "。続き。"])).toBe("あ".repeat(30));
  });

  it("no 「。」: the whole point is the phrase (≤ 30 → shown, longer → null)", () => {
    expect(explanationTitle(["偽装請負の判定"])).toBe("偽装請負の判定");
    expect(explanationTitle(["A de facto standard is a specification that became the standard"])).toBeNull();
  });

  it("no points / blank phrase → null", () => {
    expect(explanationTitle([])).toBeNull();
    expect(explanationTitle(["。後半"])).toBeNull();
  });
});

describe("sourceNumber", () => {
  it("is the question number of the source (id qNNN = the 問N of source_label) for all 2900", () => {
    const bad = QS.filter((q) => {
      const m = /問(\d+)$/.exec(q.source_label);
      return !m || Number(m[1]) !== sourceNumber(q);
    });
    expect(bad.map((q) => q.id)).toEqual([]);
    expect(sourceNumber(fake(["a", "b", "c", "d"], { id: "2024r06-q087" }))).toBe(87);
  });
});
