// Stage 7 Phase 1 Task 10 — the topic page's question rows and the single-question page's history
// (pure). `toDay` is the UTC day so results do not depend on the machine's time zone.

import { describe, expect, it } from "vitest";

import { emptyRecord, recordAttempt, type LearningRecord } from "../../learning/record";
import { attemptHistory, dayLabel, examOf, questionRowState, topicAccuracy } from "../practiceRows";

const DAY = 86_400_000;
const toDay = (at: number): number => Math.floor(at / DAY);
const D0 = toDay(Date.UTC(2026, 9, 23));
const at = (d: number, hh = 10): number => d * DAY + hh * 3_600_000;
const answer = (r: LearningRecord, id: string, correct: boolean, day: number, hh = 10): LearningRecord =>
  recordAttempt(r, id, correct ? "ウ" : "ア", correct, at(day, hh));

describe("questionRowState", () => {
  it("never answered → no result, no next day", () => {
    expect(questionRowState(emptyRecord(), "2009h21a-q001", D0, toDay)).toEqual({ result: null, next: null });
  });
  it("latest wrong → × and tomorrow", () => {
    const r = answer(answer(emptyRecord(), "a-q001", true, D0 - 9), "a-q001", false, D0);
    expect(questionRowState(r, "a-q001", D0, toDay)).toEqual({ result: "wrong", next: { kind: "date", day: D0 + 1 } });
  });
  it("due today or earlier → today", () => {
    const r = answer(emptyRecord(), "a-q001", true, D0 - 8); // box 2, due D0-1
    expect(questionRowState(r, "a-q001", D0, toDay)).toEqual({ result: "right", next: { kind: "today" } });
  });
  it("mastered → mastered", () => {
    let r = emptyRecord();
    for (const d of [0, 7, 21, 51]) r = answer(r, "a-q001", true, D0 - 100 + d); // box 2 → 3 → 4 → 5
    expect(questionRowState(r, "a-q001", D0, toDay).next).toEqual({ kind: "mastered" });
  });
});

describe("dayLabel", () => {
  it("day number → M/D of that calendar day (UTC getters: the day number encodes the local date)", () => {
    expect(dayLabel(D0)).toBe("10/23");
    expect(dayLabel(toDay(Date.UTC(2027, 0, 5)))).toBe("1/5");
  });
});

describe("topicAccuracy", () => {
  it("latest attempt of each answered question", () => {
    let r = emptyRecord();
    r = answer(answer(r, "a-q001", false, D0 - 3), "a-q001", true, D0 - 1); // latest right
    r = answer(r, "a-q002", false, D0 - 1);
    r = answer(r, "zzz-q001", true, D0 - 1); // another topic
    expect(topicAccuracy(r, ["a-q001", "a-q002", "a-q003"])).toEqual({ answered: 2, correct: 1 });
    expect(topicAccuracy(emptyRecord(), ["a-q001"])).toEqual({ answered: 0, correct: 0 });
  });
});

describe("attemptHistory", () => {
  it("q page renders history newest first, at most 10", () => {
    let r = emptyRecord();
    for (let i = 0; i < 12; i++) r = answer(r, "a-q001", i % 2 === 0, D0 - 12 + i);
    const h = attemptHistory(r, "a-q001");
    expect(h).toHaveLength(10);
    expect(h.map((a) => a.at)).toEqual([...h.map((a) => a.at)].sort((x, y) => y - x));
    expect(h[0]!.at).toBe(at(D0 - 1));
    expect(attemptHistory(r, "none")).toEqual([]);
  });
});

describe("examOf", () => {
  it("the exam id of a question id", () => {
    expect(examOf("2009h21a-q012")).toBe("2009h21a");
    expect(examOf("2026r08-q100")).toBe("2026r08");
  });
});
