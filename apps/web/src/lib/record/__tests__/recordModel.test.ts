// Stage 7 Phase 2 Task 5 (DESIGN §6.6 / D-193 §0-9) — the learning record page's pure model.
// toDay is injected as UTC days (day n = [n·DAY, (n+1)·DAY)), so 23:59 / 00:01 is plain arithmetic.
import { describe, expect, it } from "vitest";

import { emptyRecord, type Attempt, type AttemptSrc, type LearningRecord } from "@/lib/learning/record";
import type { QuestionPool } from "@/lib/learning/schedule";
import type { TodayIndex, TopicMeta } from "@/lib/practice/practiceIndex";

import { dailyCounts, recordTotals, reviewForecast, topicRows } from "../recordModel";

const DAY = 86_400_000;
const toDay = (at: number): number => Math.floor(at / DAY);
const TODAY = 20_000;
/** noon of day `d` (+ ms offset to keep attempts distinct) */
const noon = (d: number, ms = 0): number => d * DAY + 43_200_000 + ms;

const att = (at: number, correct: boolean, src: AttemptSrc = "practice"): Attempt => ({ at, choice: "ア", correct, src });
/** attempts newest-first, as the record stores them */
const rec = (attempts: Record<string, Attempt[]>): LearningRecord => ({
  ...emptyRecord(),
  attempts: Object.fromEntries(Object.entries(attempts).map(([k, v]) => [k, [...v].sort((x, y) => y.at - x.at)])),
});

const pool = (ids: string[]): QuestionPool => ({ topicQuestionIds: { t1: ids }, groups: {}, topicStars: { t1: 2 } });

describe("reviewForecast", () => {
  // one wrong answer on day d → box 0, due d + 1; one correct (first) answer → box 2, due d + 7
  it("today includes overdue; tomorrow; mastered and out-of-pool not counted; length 7", () => {
    const r = rec({
      over1: [att(noon(TODAY - 5), false)], // due TODAY-4
      over2: [att(noon(TODAY - 9), true)], // due TODAY-2
      dueToday: [att(noon(TODAY - 1), false)], // due TODAY
      dueTomorrow: [att(noon(TODAY), false)], // due TODAY+1
      // 5 counted correct days: 2,3,4,5 → box 5 mastered
      mastered: [0, 1, 2, 3].map((i) => att(noon(TODAY - 10 + i), true)),
      outside: [att(noon(TODAY - 1), false)],
      far: [att(noon(TODAY), true)], // due TODAY+7 → outside the 7 days
    });
    const f = reviewForecast(r, pool(["over1", "over2", "dueToday", "dueTomorrow", "mastered", "far"]), TODAY, toDay);
    expect(f).toHaveLength(7);
    expect(f[0]).toBe(3);
    expect(f[1]).toBe(1);
    expect(f.reduce((a, b) => a + b, 0)).toBe(4);
  });

  it("an empty record → seven zeros", () => {
    expect(reviewForecast(emptyRecord(), pool(["a"]), TODAY, toDay)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("dailyCounts", () => {
  it("distinct questions per day; midnight split; 35-day window; mock counts", () => {
    const r = rec({
      a: [att(noon(TODAY, 0), true), att(noon(TODAY, 1), false), att(noon(TODAY, 2), true)], // 3× today → 1
      b: [att(TODAY * DAY - 60_000, true), att(TODAY * DAY + 60_000, true)], // 23:59 yesterday / 00:01 today
      c: [att(noon(TODAY - 35), true)], // 35 days ago: out
      d: [att(noon(TODAY - 34), false)], // 34 days ago: slot 0
      m: [att(noon(TODAY - 3), true, "mock")],
    });
    const c = dailyCounts(r, TODAY, toDay);
    expect(c).toHaveLength(35);
    expect(c[34]).toBe(2); // a, b
    expect(c[33]).toBe(1); // b (23:59)
    expect(c[31]).toBe(1); // mock
    expect(c[0]).toBe(1); // d
    expect(c.reduce((x, y) => x + y, 0)).toBe(5);
  });
});

describe("recordTotals", () => {
  it("answered / total in the pool, attempts, box-5 mastered, distinct study days", () => {
    const r = rec({
      mastered: [0, 1, 2, 3].map((i) => att(noon(TODAY - 10 + i), true)), // days -10..-7
      w: [att(noon(TODAY - 10, 5), false), att(noon(TODAY, 0), true, "mock")],
    });
    expect(recordTotals(r, pool(["mastered", "w", "x"]), TODAY, toDay)).toEqual({
      answered: 2,
      total: 3,
      attempts: 6,
      mastered: 1,
      studyDays: 5, // -10, -9, -8, -7, 0
    });
  });

  it("an empty record → all zero but total", () => {
    expect(recordTotals(emptyRecord(), pool(["a", "b"]), TODAY, toDay)).toEqual({
      answered: 0,
      total: 2,
      attempts: 0,
      mastered: 0,
      studyDays: 0,
    });
  });
});

describe("topicRows", () => {
  const topic = (id: string, category: string, stars: 1 | 2 | 3, n: number): TopicMeta => ({
    id,
    category,
    name_jp: `N-${id}`,
    stars,
    questionCount: n,
    units: [],
  });
  const ids = (id: string, n: number): string[] => Array.from({ length: n }, (_, i) => `${id}-q${i}`);
  const topics = [
    topic("s-b", "strategy", 2, 3),
    topic("s-a", "strategy", 2, 3),
    topic("s-c", "strategy", 3, 1),
    topic("s-d", "strategy", 2, 5),
    topic("t-x", "technology", 1, 2),
    topic("m-y", "management", 1, 2),
  ];
  const index: TodayIndex = {
    topics,
    topicQuestionIds: Object.fromEntries(topics.map((t) => [t.id, ids(t.id, t.questionCount)])),
    groups: {},
    topicTerms: {},
    exams: {},
  };
  // s-b: 1/2 right (50%), s-a: 1/1 (100%), s-c: 0/1 (0%), s-d: none (null)
  const r = rec({
    "s-b-q0": [att(noon(TODAY), true)],
    "s-b-q1": [att(noon(TODAY - 1), true), att(noon(TODAY), false)], // latest = wrong
    "s-a-q0": [att(noon(TODAY), true)],
    "s-c-q0": [att(noon(TODAY), false)],
  });

  it("three fields in PRACTICE_CATEGORY_ORDER; stars sort = ★ desc, count desc, id asc", () => {
    const out = topicRows(r, index, "stars");
    expect(out.map((g) => g.category)).toEqual(["strategy", "management", "technology"]);
    expect(out[0]!.rows.map((x) => x.topicId)).toEqual(["s-c", "s-d", "s-a", "s-b"]);
    const sb = out[0]!.rows.find((x) => x.topicId === "s-b")!;
    expect(sb).toEqual({ topicId: "s-b", name_jp: "N-s-b", stars: 2, answered: 2, total: 3, rate: 0.5 });
    expect(out[0]!.rows.find((x) => x.topicId === "s-d")!.rate).toBeNull();
  });

  it("rate sort = rate asc, unanswered (null) last", () => {
    expect(topicRows(r, index, "rate")[0]!.rows.map((x) => x.topicId)).toEqual(["s-c", "s-b", "s-a", "s-d"]);
  });
});
