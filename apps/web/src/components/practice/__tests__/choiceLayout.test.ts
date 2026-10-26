// Stage 7 Phase 1 Task 8 (D-190 §0-15 / §0-16) — choice layout + explanation title.
import { beforeAll, describe, expect, it } from "vitest";

import { isTableChoice } from "@/components/quiz/QuizRichText";
import { CHOICE_LETTERS, loadAllQuestions, type QuizQuestion } from "@/lib/quiz/quizReader";

import {
  charEm,
  choiceLayout,
  choiceLines,
  choiceMinEm,
  explanationTitle,
  KEY_EM,
  packLines,
  ROW4_LIMIT_EM,
  ROW4_LINE_EM,
  ROW4_MAX_LINES,
  segmentWidths,
  sourceNumber,
  SPACE_EM,
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
    // OQ-09 total-width rule (S132): row4 1101 → 751; S133 ≤ 2 packed lines: 751 → 693
    // (64 row4 → list; 6 list → row4: pairs choices whose cells take one line each, e.g. 「a：共通，b：公開」)
    expect(counts).toEqual({ row4: 693, grid2: 10, list: 2197 });
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
    expect(choiceLayout(fake(["（１）（５）", "ＡＢＣＤＥＦ", "ア", "イ"]))).toBe("row4"); // full-width forms break (6 = 2 lines)
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

  it("OQ-09: every choice must take ≤ 2 lines of the 3.87em column (3 CJK characters a line)", () => {
    expect(ROW4_LINE_EM).toBeCloseTo(58 / 15, 2);
    expect(ROW4_MAX_LINES).toBe(2);
    // a 12-code-point CJK choice folds to 4 lines → list
    expect(choiceLayout(fake(["あいうえおかきくけこさし", "a", "b", "c"]))).toBe("list");
    expect(choiceLayout(fake(["情報セキュリティ方針の策定", "a", "b", "c"]))).toBe("list");
    // 6 CJK characters = 2 lines fit; 7 = 3 + 3 + 1 (the S132 7.1em total let it through) does not
    expect(choiceLayout(fake(["あいうえおか", "a", "b", "c"]))).toBe("row4");
    expect(choiceLayout(fake(["あいうえおかき", "a", "b", "c"]))).toBe("list");
    // a 4–6 character CJK choice set stays row4
    expect(choiceLayout(fake(["請負契約", "準委任契約", "派遣契約", "雇用契約"]))).toBe("row4");
    expect(choiceLayout(fake(["機密性", "完全性", "可用性", "真正性の確保"]))).toBe("row4");
  });

  it("packLines: greedy line filling of the unbreakable segments (OQ-09 follow-up)", () => {
    expect(packLines("", 3.87)).toBe(0);
    expect(packLines("あいう", 3.87)).toBe(1);
    expect(packLines("あいうえ", 3.87)).toBe(2);
    expect(packLines("あいうえおか", 3.87)).toBe(2);
    expect(packLines("あいうえおかき", 3.87)).toBe(3); // 3 + 3 + 1: the orphan the 7.1em total let through
    // a non-CJK run is not split: 「IPv4」 (3.01em) takes a line of its own after 「の」
    expect(packLines("のIPv4", 3.87)).toBe(2);
    // whitespace between segments costs SPACE_EM
    expect(packLines("ab cd", 3.87)).toBe(1);
    expect(packLines("ab cd", 0.65 * 4 + SPACE_EM - 0.01)).toBe(2);
  });

  it("choiceLines: pairs take a line per cell (badge + value packed)", () => {
    expect(choiceLines("a：高い，b：低い")).toBe(2);
    // 2023r05-q086: the S132 total width (7.5em > 7.1em) kept this pairs set out of row4; two one-line cells fit
    expect(choiceLayout(fake(["a：共通，b：公開", "a：共通，b：秘密", "a：公開，b：共通", "a：公開，b：秘密"]))).toBe("row4");
    expect(choiceLines("あいうえおか")).toBe(2);
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
    // half-width katakana (0.5em, breakable): 12 → 6em total, inside the OQ-09 two-line limit
    expect(choiceLayout(fake(["ｱｲｳｴｵｶｷｸｹｺｻｼ", "a b c", "x　y", "z"]))).toBe("row4");
  });

  it("a choice with 13 code points → list", () => {
    expect(choiceLayout(fake(["ｱｲｳｴｵｶｷｸｹｺｻｼｽ", "a", "b", "c"]))).toBe("list"); // 6.5em: the code-point rule decides
    expect(choiceLayout(fake(["あいうえおかきくけこさしす", "a", "b", "c"]))).toBe("list");
  });

  it("code points, not UTF-16 units: 6 astral characters (12 UTF-16 units) pack as 6 characters → row4", () => {
    expect(choiceLayout(fake(["𠀋".repeat(6), "a", "b", "c"]))).toBe("row4");
    expect(choiceLayout(fake(["𠀋".repeat(7), "a", "b", "c"]))).toBe("list"); // 3 + 3 + 1 lines (OQ-09)
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
