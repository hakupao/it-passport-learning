// Stage 7 Phase 1 Task 8 (D-190 §0-15 / §0-16) — choice layout + explanation title.
import { beforeAll, describe, expect, it } from "vitest";

import { isTableChoice } from "@/components/quiz/QuizRichText";
import { CHOICE_LETTERS, loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import {
  charEm,
  choiceLayout,
  choiceMinEm,
  explanationTitle,
  KEY_EM,
  ROW4_LIMIT_EM,
  segmentWidths,
  sourceNumber,
} from "../choiceLayout";

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
  it("counts row4 / grid2 / list (measured S132 Task 8; Rule A attempt 3 width estimate)", () => {
    const counts = { row4: 0, grid2: 0, list: 0 };
    for (const q of QS) counts[choiceLayout(q)]++;
    expect(QS).toHaveLength(2900);
    expect(counts).toEqual({ row4: 1101, grid2: 10, list: 1789 });
  });

  it("grid2 is exactly the choice_figures questions", () => {
    const grid = QS.filter((q) => choiceLayout(q) === "grid2").map((q) => q.id);
    const figs = QS.filter((q) => q.choice_figures).map((q) => q.id);
    expect(grid).toEqual(figs);
    expect(figs).toHaveLength(10);
  });
});

/** round to 1/100 em so float sums compare exactly */
const r = (a: number[]): number[] => a.map((x) => Math.round(x * 100) / 100);

describe("row4 by estimated width (Rule A attempts 1–3)", () => {
  const FAILED = [
    "2011h23tokubetsu-q059", // attempt 1: 「①and②and③」
    "2014h26h-q068", // attempt 2: ￥A￥B￥B
    "2014h26h-q083", // a→b→c
    "2018h30a-q005", // A→B→C
    "2015h27a-q007", // pairs a:BCP b:BCM
    "2019r01a-q095", // pairs a：GPU，b：暗号化
    "2022r04-q088", // pairs a: CSV / b: JSON
    "2025r07-q071", // pairs a：高い，b：GHz
  ];

  it("the questions that overflowed (attempts 1 and 2) → list", () => {
    for (const id of FAILED) expect([id, choiceLayout(QS.find((x) => x.id === id)!)]).toEqual([id, "list"]);
    expect(choiceLayout(fake(["①and②and③", "(①and②)or③", "①or(②and③)", "①or②or③"]))).toBe("list");
  });

  it("a normal short Japanese row4 question stays row4", () => {
    expect(choiceLayout(fake(["請負契約", "準委任契約", "派遣契約", "雇用契約"]))).toBe("row4");
    expect(choiceLayout(fake(["a，b", "a，c", "b，c", "a，b，c"]))).toBe("row4");
    expect(choiceLayout(fake(["（１）と（５）", "ＡＢＣＤＥＦＧ", "ア", "イ"]))).toBe("row4"); // full-width forms break
    expect(choiceLayout(fake(["IPv4", "DNS", "TCP", "UDP"]))).toBe("row4"); // short ASCII words fit
  });

  it("charEm: measured BIZ UDPGothic advances (rounded up)", () => {
    expect(charEm("a")).toBe(0.65);
    expect(charEm("m")).toBe(0.95);
    expect(charEm("A")).toBe(0.8);
    expect(charEm("W")).toBe(1.0);
    expect(charEm("7")).toBe(0.76);
    expect(charEm(":")).toBe(0.35);
    expect(charEm("/")).toBe(0.6);
    expect(charEm("ｱ")).toBe(0.5);
    for (const ch of ["漢", "あ", "→", "①", "×", "−", "￥", "，"]) expect(charEm(ch)).toBe(1.0);
  });

  it("segmentWidths: whitespace and CJK break; non-CJK runs stick (→ ① ￥ included)", () => {
    expect(r(segmentWidths("abc def"))).toEqual(r([0.65 * 3, 0.65 * 3]));
    expect(r(segmentWidths("漢字"))).toEqual(r([1, 1]));
    expect(r(segmentWidths("A→B"))).toEqual(r([2.6]));
    expect(r(segmentWidths("￥A￥B"))).toEqual(r([3.6])); // U+FFE5 is not in the CJK class
    expect(r(segmentWidths("①and②"))).toEqual(r([1 + 0.65 * 3 + 1]));
    expect(r(segmentWidths("abc漢def"))).toEqual(r([0.65 * 3, 1, 0.65 * 3]));
    expect(r(segmentWidths(""))).toEqual(r([]));
  });

  it("kinsoku: closing punctuation / small kana / ー join the run before, opening brackets the run after", () => {
    expect(r(segmentWidths("高い，"))).toEqual(r([1, 2])); // 高 | い，
    expect(r(segmentWidths("データ"))).toEqual(r([2, 1])); // デー | タ
    expect(r(segmentWidths("コーヒー"))).toEqual(r([2, 2])); // コー | ヒー
    expect(r(segmentWidths("ちょっと"))).toEqual(r([3, 1])); // ちょっ | と
    expect(r(segmentWidths("「暗号」化"))).toEqual(r([2, 2, 1])); // 「暗 | 号」 | 化
    expect(r(segmentWidths("a：GPU，"))).toEqual(r([0.65 + 1, 0.8 * 3 + 1])); // a： | GPU，
  });

  it("ASCII kinsoku (final fix 2, UAX #14 IS/CL/CP/PO/EX and OP): , . ) ] } ! ? % : join the run before, ( [ { the run after", () => {
    // 「可用性, 完全性」: the ASCII comma cannot start a line → 性, is one piece
    expect(r(segmentWidths("可用性, 完全性"))).toEqual(r([1, 1, 1 + 0.35, 1, 1, 1]));
    for (const p of [",", ".", ")", "]", "}", "!", "?", "%", ":"]) {
      expect([p, r(segmentWidths(`漢${p}字`))]).toEqual([p, r([1 + charEm(p), 1])]);
    }
    for (const p of ["(", "[", "{"]) {
      expect([p, r(segmentWidths(`漢${p}字`))]).toEqual([p, r([1, charEm(p) + 1])]);
    }
    // 2018h30h-q080 style 「10%上がる。」: 10% stays one piece (PO after NU), る。 joins
    expect(r(segmentWidths("10%上がる。"))).toEqual(r([0.76 * 2 + 0.6, 1, 1, 2]));
    // a non-listed ASCII symbol still breaks from CJK
    expect(r(segmentWidths("漢/字"))).toEqual(r([1, 0.6, 1]));
  });

  it("pairs: key badge + the widest segment of each value", () => {
    expect(choiceMinEm("a: CSV / b: JSON")).toBeCloseTo(KEY_EM + 0.8 * 4, 5); // b + JSON
    expect(choiceMinEm("a：高い，b：GHz")).toBeCloseTo(KEY_EM + 0.8 + 0.8 + 0.65, 5); // b + GHz
    expect(choiceMinEm("abc")).toBeCloseTo(0.65 * 3, 5); // not pairs: plain segments
  });

  it("the limit is the measured row4 text column (58px / 15px) minus a 0.3em margin", () => {
    expect(ROW4_LIMIT_EM).toBeCloseTo(58 / 15 - 0.3, 1);
    expect(ROW4_LIMIT_EM).toBe(3.55);
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
