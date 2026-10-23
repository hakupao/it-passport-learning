// Stage 7 Phase 1 Task 11 (D-189 §6.1 / D-190 §0-7 / §0-9 / §0-10 / §0-20 / §0-26) — the today
// page's pure model. Synthetic corpus (8 topics × 40 questions, one 中問 pair); `toDay` is the UTC
// day so results do not depend on the machine's time zone.
import { describe, expect, it } from "vitest";

import { emptyRecord, markUnitRead, recordAttempt, type LearningRecord } from "../../learning/record";
import { dailyPlan, pickNew, type DailyPlan } from "../../learning/schedule";
import { poolFromIndex, type TodayIndex, type TopicMeta } from "../practiceIndex";
import { startOfDayPlan, TODAY_CHUNK } from "../practiceSession";
import {
  answeredCount,
  areaRates,
  baselineIds,
  BASELINE_N,
  daysUntil,
  isNewUser,
  primaryHref,
  todayTasks,
  todayTerms,
  weakTopicRows,
} from "../todayModel";

const DAY = 86_400_000;
const toDay = (at: number): number => Math.floor(at / DAY);
const D0 = toDay(Date.UTC(2026, 9, 23));
const at = (d: number, hh = 10): number => d * DAY + hh * 3_600_000;
const DK = "2026-10-23";

const CATS = ["strategy", "management", "technology"] as const;
const TOPIC_IDS = Array.from({ length: 8 }, (_, i) => `${CATS[i % 3]}-0${i + 1}-01`);
const Q = (n: number) => `2009h21a-q${String(n).padStart(3, "0")}`;
/** topic i (0-based) owns questions 40·i + 1 … 40·i + 40 */
const qOf = (topic: number, k: number) => Q(topic * 40 + k + 1);

function makeIndex(): TodayIndex {
  const topics: TopicMeta[] = TOPIC_IDS.map((id, i) => ({
    id,
    category: CATS[i % 3]!,
    name_jp: `領域${i + 1}`,
    stars: ((i % 3) + 1) as 1 | 2 | 3,
    // corpus question counts differ from the 40 listed so the §0-10 score uses questionCount
    questionCount: 40 + i * 10,
    units: [
      { id: `u${i + 1}a`, title: `単元${i + 1}a`, minutes: 9 },
      { id: `u${i + 1}b`, title: `単元${i + 1}b`, minutes: 12 },
    ],
  }));
  const topicQuestionIds = Object.fromEntries(
    TOPIC_IDS.map((id, i) => [id, Array.from({ length: 40 }, (_, k) => qOf(i, k))]),
  );
  return {
    topics,
    topicQuestionIds,
    // a 中問 pair at positions 20 / 21 of topic 0
    groups: { "2009h21a-g1": [qOf(0, 19), qOf(0, 20)] },
    topicTerms: Object.fromEntries(
      TOPIC_IDS.map((id, i) => [
        id,
        i === 7
          ? []
          : [1, 2, 3].map((k) => ({ id: `t${i}-${k}`, term: `用語${i}-${k}`, gloss: "", definition: `定義${k}` })),
      ]),
    ),
    exams: { "2009h21a": "平成21年度 春期" },
  };
}

const INDEX = makeIndex();
const POOL = poolFromIndex(INDEX);
const base = (): LearningRecord => ({ ...emptyRecord(), v2Since: 0 });
const wrongOn = (r: LearningRecord, id: string, d: number) => recordAttempt(r, id, "ア", false, at(d));
const rightOn = (r: LearningRecord, id: string, d: number) => recordAttempt(r, id, "ア", true, at(d));
const plans = (r: LearningRecord): [DailyPlan, DailyPlan] => [
  dailyPlan(r, POOL, D0, toDay, DK),
  startOfDayPlan(r, POOL, D0, toDay, DK),
];
const idsOf = (href: string): string[] => new URL(href, "http://x").searchParams.get("ids")!.split(",");
const param = (href: string, k: string): string | null => new URL(href, "http://x").searchParams.get(k);

/** topic 1: 6 answered, 3 wrong (rate .5) — the weakest; topic 2: 5 answered, 1 wrong (both leave mistakes due today) */
function withWeakTopics(r: LearningRecord): LearningRecord {
  for (let k = 0; k < 6; k++) r = k < 3 ? wrongOn(r, qOf(1, k), D0 - 20) : rightOn(r, qOf(1, k), D0 - 20);
  for (let k = 0; k < 5; k++) r = k < 1 ? wrongOn(r, qOf(2, k), D0 - 20) : rightOn(r, qOf(2, k), D0 - 20);
  return r;
}

describe("todayTasks", () => {
  it("order mistakes → due → new → unit, empty rows omitted", () => {
    let r = base();
    r = wrongOn(r, qOf(0, 0), D0 - 1); // a mistake due today
    r = rightOn(r, qOf(3, 0), D0 - 8); // a due review (box 2, due D0 − 1)
    const [plan, start] = plans(r);
    const tasks = todayTasks(plan, r, INDEX, TOPIC_IDS[1]!, start);
    expect(tasks.map((t) => t.kind)).toEqual(["mistakes", "due", "new", "unit"]);
    expect(tasks.every((t) => !t.done)).toBe(true);
    const m = tasks[0]!;
    expect(m.count).toBe(1);
    expect(idsOf(m.href)).toEqual([qOf(0, 0)]);
    expect(param(m.href, "from")).toBe("today");
    expect(param(m.href, "kind")).toBe("mistakes");
    expect(param(tasks[1]!.href, "kind")).toBe("due");
    expect(param(tasks[2]!.href, "kind")).toBe("fresh"); // the model's "new" is the URL's / session's "fresh"
    // 1 minute per remaining question
    expect(tasks[2]!.count).toBe(plan.fresh.length);
    expect(tasks[2]!.minutes).toBe(plan.fresh.length);

    // no mistakes, no due, no weakest topic → only new
    const [p2, s2] = plans(base());
    expect(todayTasks(p2, base(), INDEX, null, s2).map((t) => t.kind)).toEqual(["new"]);
    // new target 0 and nothing else → no rows
    const r3 = { ...base(), settings: { dailyNewTarget: { value: 0, at: 1 } } };
    const [p3, s3] = plans(r3);
    expect(todayTasks(p3, r3, INDEX, null, s3)).toEqual([]);
  });

  it("30 due → the row href carries the first 20 ids; a chumon group is not split (§0-26)", () => {
    let r = base();
    for (let k = 0; k < 30; k++) r = rightOn(r, qOf(0, k), D0 - 8);
    const [plan, start] = plans(r);
    expect(plan.due).toHaveLength(30);
    const due = todayTasks(plan, r, INDEX, null, start).find((t) => t.kind === "due")!;
    expect(due.count).toBe(30);
    expect(due.minutes).toBe(30); // all remaining, not just the first chunk
    // ids 1–20 end on qOf(0,19), the first member of the pair → its partner qOf(0,20) comes along
    expect(idsOf(due.href)).toEqual([...Array.from({ length: TODAY_CHUNK }, (_, k) => qOf(0, k)), qOf(0, 20)]);
  });

  it("done when remaining 0 and something done today", () => {
    let r = base();
    for (let k = 0; k < 3; k++) r = wrongOn(r, qOf(0, k), D0 - 1);
    for (let k = 3; k < 5; k++) r = rightOn(r, qOf(0, k), D0 - 8);
    r = { ...r, settings: { dailyNewTarget: { value: 2, at: 1 } } };
    const rows = (rec: LearningRecord) => {
      const [plan, start] = plans(rec);
      return { plan, tasks: todayTasks(plan, rec, INDEX, null, start) };
    };
    // morning: everything open
    let { plan, tasks } = rows(r);
    expect(tasks.map((t) => [t.kind, t.done])).toEqual([
      ["mistakes", false],
      ["due", false],
      ["new", false],
    ]);
    expect(tasks.map((t) => t.count)).toEqual([3, 2, plan.fresh.length]);
    // the mistakes worked through today (right once → still a mistake, but due in 3 days)
    for (let k = 0; k < 3; k++) r = rightOn(r, qOf(0, k), D0);
    ({ plan, tasks } = rows(r));
    expect(tasks.map((t) => [t.kind, t.count, t.done])).toEqual([
      ["mistakes", 0, true],
      ["due", 2, false],
      ["new", plan.fresh.length, false],
    ]);
    expect(tasks[0]!.startCount).toBe(3);
    // due and the new questions too
    for (let k = 3; k < 5; k++) r = rightOn(r, qOf(0, k), D0);
    for (const id of plan.fresh) r = rightOn(r, id, D0);
    ({ plan, tasks } = rows(r));
    expect(tasks.map((t) => [t.kind, t.count, t.done])).toEqual([
      ["mistakes", 0, true],
      ["due", 0, true],
      ["new", 0, true],
    ]);
    expect(primaryHref(tasks)).toBeNull();
    // a row that was empty this morning is omitted, not shown as done
    let q: LearningRecord = { ...base(), settings: { dailyNewTarget: { value: 1, at: 1 } } };
    q = rightOn(q, qOf(0, 3), D0 - 8);
    q = rightOn(q, qOf(0, 3), D0);
    expect(rows(q).tasks.map((t) => [t.kind, t.done])).toEqual([
      ["due", true],
      ["new", false],
    ]);
  });

  it("unit = first unread unit of the weakest topic, omitted when all read", () => {
    let r = withWeakTopics(base());
    const weakest = weakTopicRows(r, INDEX)[0]!.topicId;
    expect(weakest).toBe(TOPIC_IDS[1]);
    let [plan, start] = plans(r);
    let unit = todayTasks(plan, r, INDEX, weakest, start).find((t) => t.kind === "unit")!;
    expect(unit.href).toBe("/textbook/u2a");
    expect(unit.minutes).toBe(9);
    expect(unit.unit).toEqual({ id: "u2a", title: "単元2a", topicId: TOPIC_IDS[1], category: "management" });
    expect(unit.detail).toEqual(["領域2"]);
    r = markUnitRead(r, "u2a", at(D0 - 1));
    [plan, start] = plans(r);
    unit = todayTasks(plan, r, INDEX, weakest, start).find((t) => t.kind === "unit")!;
    expect(unit.href).toBe("/textbook/u2b");
    expect(unit.minutes).toBe(12);
    r = markUnitRead(r, "u2b", at(D0 - 1));
    [plan, start] = plans(r);
    expect(todayTasks(plan, r, INDEX, weakest, start).some((t) => t.kind === "unit")).toBe(false);
    // no weakest topic → no unit row
    expect(todayTasks(plan, r, INDEX, null, start).some((t) => t.kind === "unit")).toBe(false);
  });

  it("mistakes detail: the top 2 topics by count, the rest as others", () => {
    let r = base();
    for (let k = 0; k < 4; k++) r = wrongOn(r, qOf(5, k), D0 - 1);
    for (let k = 0; k < 3; k++) r = wrongOn(r, qOf(4, k), D0 - 1);
    for (let k = 0; k < 2; k++) r = wrongOn(r, qOf(6, k), D0 - 1);
    r = wrongOn(r, qOf(0, 0), D0 - 1);
    const [plan, start] = plans(r);
    const m = todayTasks(plan, r, INDEX, null, start)[0]!;
    expect(m.kind).toBe("mistakes");
    expect(m.detail).toEqual(["領域6 4", "領域5 3"]);
    expect(m.others).toBe(3);
    // one topic only → no others
    const one = wrongOn(base(), qOf(5, 0), D0 - 1);
    const [p1, s1] = plans(one);
    const m1 = todayTasks(p1, one, INDEX, null, s1)[0]!;
    expect(m1.detail).toEqual(["領域6 1"]);
    expect(m1.others).toBe(0);
  });

  it("new detail names the topics filled because they have < 5 answers", () => {
    const r = withWeakTopics(base());
    const [plan, start] = plans(r);
    const fresh = todayTasks(plan, r, INDEX, null, start).find((t) => t.kind === "new")!;
    expect(fresh.detail.length).toBeGreaterThan(0);
    expect(fresh.detail.length).toBeLessThanOrEqual(2);
    // topic 1 (6 answered) and topic 2 (5 answered) are not "under 5"
    expect(fresh.detail).not.toContain("領域2");
    expect(fresh.detail).not.toContain("領域3");
  });
});

describe("primaryHref", () => {
  it("first open practice task, else the unit, else null", () => {
    let r = base();
    r = rightOn(r, qOf(3, 0), D0 - 8);
    const [plan, start] = plans(r);
    const tasks = todayTasks(plan, r, INDEX, TOPIC_IDS[1]!, start);
    expect(tasks.map((t) => t.kind)).toEqual(["due", "new", "unit"]);
    expect(primaryHref(tasks)).toBe(tasks[0]!.href);
    // a done row is skipped
    expect(primaryHref([{ ...tasks[0]!, count: 0, done: true }, ...tasks.slice(1)])).toBe(tasks[1]!.href);
    expect(primaryHref(tasks.filter((t) => t.kind === "unit"))).toBe("/textbook/u2a");
    expect(primaryHref([])).toBeNull();
  });
});

describe("weakTopicRows (§0-10)", () => {
  it("answered < 5 excluded, all-correct excluded, max 5, score order", () => {
    let r = base();
    // topic 0: 4 answered, all wrong → excluded (< 5)
    for (let k = 0; k < 4; k++) r = wrongOn(r, qOf(0, k), D0 - 3);
    // topic 1: 5 answered, all right → excluded
    for (let k = 0; k < 5; k++) r = rightOn(r, qOf(1, k), D0 - 3);
    // topics 2–7: 10 answered, wrong = 1..6 → rate .9 … .4; score (1 − rate) · questionCount
    for (let i = 2; i < 8; i++) {
      for (let k = 0; k < 10; k++) r = k < i - 1 ? wrongOn(r, qOf(i, k), D0 - 3) : rightOn(r, qOf(i, k), D0 - 3);
    }
    const rows = weakTopicRows(r, INDEX);
    expect(rows).toHaveLength(5);
    // scores: t2 .1·60=6, t3 .2·70=14, t4 .3·80=24, t5 .4·90=36, t6 .5·100=50, t7 .6·110=66
    expect(rows.map((x) => x.topicId)).toEqual([7, 6, 5, 4, 3].map((i) => TOPIC_IDS[i]));
    expect(rows[0]).toEqual({
      topicId: TOPIC_IDS[7],
      name_jp: "領域8",
      category: "management",
      stars: 2,
      rate: 0.4,
      answered: 10,
    });
    // the latest attempt counts: a wrong question answered right later is right
    let s = base();
    for (let k = 0; k < 5; k++) s = wrongOn(s, qOf(2, k), D0 - 5);
    for (let k = 0; k < 4; k++) s = rightOn(s, qOf(2, k), D0 - 2);
    expect(weakTopicRows(s, INDEX).map((x) => [x.topicId, x.rate])).toEqual([[TOPIC_IDS[2], 0.8]]);
  });

  it("ties: rate ascending, then topic id", () => {
    let r = base();
    // equal scores (exact, no float rounding): topic 0 (40 Qs) rate .3 → .7·40 = 28; topic 3 (70 Qs) rate .6 → .4·70 = 28
    for (let k = 0; k < 10; k++) r = k < 7 ? wrongOn(r, qOf(0, k), D0 - 3) : rightOn(r, qOf(0, k), D0 - 3);
    for (let k = 0; k < 10; k++) r = k < 4 ? wrongOn(r, qOf(3, k), D0 - 3) : rightOn(r, qOf(3, k), D0 - 3);
    expect(weakTopicRows(r, INDEX).map((x) => x.topicId)).toEqual([TOPIC_IDS[0], TOPIC_IDS[3]]);
  });
});

describe("areaRates", () => {
  it("null when a category has no answers", () => {
    expect(areaRates(base(), INDEX)).toEqual({ strategy: null, management: null, technology: null });
    let r = base();
    r = rightOn(r, qOf(0, 0), D0 - 1); // strategy
    r = wrongOn(r, qOf(3, 0), D0 - 1); // strategy (topic 3 = strategy)
    r = rightOn(r, qOf(3, 1), D0 - 1);
    r = rightOn(r, qOf(3, 2), D0 - 1);
    r = wrongOn(r, qOf(2, 0), D0 - 1); // technology
    expect(areaRates(r, INDEX)).toEqual({ strategy: 0.75, management: null, technology: 0 });
  });
});

describe("daysUntil", () => {
  it("null without examDate; signed days otherwise", () => {
    expect(daysUntil(undefined, D0)).toBeNull();
    expect(daysUntil("not-a-date", D0)).toBeNull();
    expect(daysUntil("2026-11-30", D0)).toBe(38);
    expect(daysUntil("2026-10-23", D0)).toBe(0);
    expect(daysUntil("2026-10-01", D0)).toBe(-22);
  });
});

describe("isNewUser / baseline", () => {
  it("new = no attempt at all", () => {
    expect(isNewUser(emptyRecord())).toBe(true);
    expect(isNewUser({ ...emptyRecord(), settings: { examDate: { value: "2026-11-30", at: 1 } } })).toBe(true);
    expect(isNewUser(markUnitRead(emptyRecord(), "u1a", 5))).toBe(true);
    expect(isNewUser(rightOn(base(), qOf(0, 0), D0))).toBe(false);
  });

  it("baseline = pickNew n = 20 by category ratio only (no weak-topic fill), stable per day", () => {
    const ids = baselineIds(emptyRecord(), INDEX, DK);
    expect(BASELINE_N).toBe(20);
    expect(ids).toEqual(pickNew(emptyRecord(), POOL, 20, DK, { fillWeakTopics: false }));
    expect(ids).not.toEqual(pickNew(emptyRecord(), POOL, 20, DK));
    expect(ids.length).toBeGreaterThanOrEqual(20);
    expect(baselineIds(emptyRecord(), INDEX, DK)).toEqual(ids);
  });
});

describe("todayTerms", () => {
  it("first question's topic → its cards (≤ 3); none → weakest topic; none → []", () => {
    expect(todayTerms(INDEX, [qOf(2, 5), qOf(0, 0)], TOPIC_IDS[1]!).map((c) => c.id)).toEqual([
      "t2-1",
      "t2-2",
      "t2-3",
    ]);
    expect(todayTerms(INDEX, null, TOPIC_IDS[1]!).map((c) => c.id)).toEqual(["t1-1", "t1-2", "t1-3"]);
    // the first topic has no cards → the weakest topic's
    expect(todayTerms(INDEX, [qOf(7, 0)], TOPIC_IDS[4]!).map((c) => c.id)).toEqual(["t4-1", "t4-2", "t4-3"]);
    expect(todayTerms(INDEX, null, null)).toEqual([]);
    expect(todayTerms(INDEX, [qOf(7, 0)], null)).toEqual([]);
  });
});

describe("answeredCount", () => {
  it("questions with ≥ 1 attempt / all questions in the index", () => {
    let r = base();
    r = rightOn(r, qOf(0, 0), D0 - 1);
    r = wrongOn(r, qOf(0, 0), D0);
    r = wrongOn(r, qOf(5, 3), D0);
    r = rightOn(r, "zzz-q001", D0); // outside the corpus
    expect(answeredCount(r, INDEX)).toEqual({ answered: 2, total: 320 });
  });
});
