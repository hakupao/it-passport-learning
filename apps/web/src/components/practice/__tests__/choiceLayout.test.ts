// Stage 7 Phase 1 Task 8 (D-190 §0-15 / §0-16) — choice layout + explanation title.
// OQ-13 / D-194: text choices are always one per line ("list"); only choice_figures keep "grid2".
import { beforeAll, describe, expect, it } from "vitest";

import { loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import { choiceLayout, explanationTitle, sourceNumber } from "../choiceLayout";

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

describe("choiceLayout (§0-15, OQ-13 / D-194) on the real corpus", () => {
  it("counts grid2 / list: no row4 any more", () => {
    const counts: Record<string, number> = {};
    for (const q of QS) {
      const l = choiceLayout(q);
      counts[l] = (counts[l] ?? 0) + 1;
    }
    expect(QS).toHaveLength(2900);
    expect(counts).toEqual({ grid2: 10, list: 2890 });
  });

  it("grid2 is exactly the choice_figures questions", () => {
    const grid = QS.filter((q) => choiceLayout(q) === "grid2").map((q) => q.id);
    const figs = QS.filter((q) => q.choice_figures).map((q) => q.id);
    expect(grid).toEqual(figs);
    expect(figs).toHaveLength(10);
  });
});

describe("choiceLayout (OQ-13 / D-194) rules", () => {
  it("short text choices → list (one per line; the former row4 sets)", () => {
    expect(choiceLayout(fake(["a", "a，b", "a，c", "b，c"]))).toBe("list");
    expect(choiceLayout(fake(["請負契約", "準委任契約", "派遣契約", "雇用契約"]))).toBe("list");
    expect(choiceLayout(fake(["IPv4", "DNS", "TCP", "UDP"]))).toBe("list");
  });

  it("long, multi-line and table choices → list", () => {
    expect(choiceLayout(fake(["あいうえおかきくけこさしす", "a", "b", "c"]))).toBe("list");
    expect(choiceLayout(fake(["a\nb", "a", "b", "c"]))).toBe("list");
    expect(choiceLayout(fake(["[表] | a | b |\n| 1 | 2 |", "a", "b", "c"]))).toBe("list");
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
