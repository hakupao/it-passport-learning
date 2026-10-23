// Stage 7 Phase 1 Task 12 (DESIGN §5.4 / §6.3, D-190 §0-20) — the mistakes book's pure model.
// Synthetic corpus (4 topics, two exams); `toDay` is the UTC day so results do not depend on the
// machine's time zone.
import { describe, expect, it, vi } from "vitest";

import { emptyRecord, recordAttempt, type LearningRecord } from "../../learning/record";
import type { TodayIndex, TopicMeta } from "../practiceIndex";
import { MAX_SCOPE_IDS } from "../practiceSession";
import { mistakesBook, rowLabel } from "../mistakesModel";

const DAY = 86_400_000;
const toDay = (at: number): number => Math.floor(at / DAY);
const D0 = toDay(Date.UTC(2026, 9, 23));
const at = (d: number, hh = 10): number => d * DAY + hh * 3_600_000;

// index.topics order: technology first, so the book's PRACTICE_CATEGORY_ORDER has to reorder
const TOPICS: TopicMeta[] = [
  { id: "technology-09-01", category: "technology", name_jp: "テク領域", stars: 3, questionCount: 200, units: [{ id: "u-tech-1", title: "単元T1", minutes: 10 }, { id: "u-tech-2", title: "単元T2", minutes: 8 }] },
  { id: "strategy-02-01", category: "strategy", name_jp: "ストラテジ領域B", stars: 2, questionCount: 100, units: [] },
  { id: "strategy-01-01", category: "strategy", name_jp: "ストラテジ領域A", stars: 1, questionCount: 100, units: [{ id: "u-str-1", title: "単元S1", minutes: 9 }] },
  { id: "management-05-01", category: "management", name_jp: "マネジメント領域", stars: 2, questionCount: 100, units: [{ id: "u-man-1", title: "単元M1", minutes: 7 }] },
];
const Q = (exam: string, n: number) => `${exam}-q${String(n).padStart(3, "0")}`;
const INDEX: TodayIndex = {
  topics: TOPICS,
  topicQuestionIds: {
    "technology-09-01": Array.from({ length: 150 }, (_, k) => Q("2025r07", k + 1)),
    "strategy-02-01": [Q("2009h21a", 1), Q("2009h21a", 2)],
    "strategy-01-01": [Q("2009h21a", 10), Q("2009h21a", 11)],
    "management-05-01": [Q("2009h21a", 40)],
  },
  groups: {},
  topicTerms: {},
  exams: { "2025r07": "令和7年度", "2009h21a": "平成21年度春期" },
};

const wrong = (r: LearningRecord, qid: string, d: number): LearningRecord => recordAttempt(r, qid, "ア", false, at(d));
const right = (r: LearningRecord, qid: string, d: number): LearningRecord => recordAttempt(r, qid, "イ", true, at(d));

describe("rowLabel", () => {
  it("exam label_jp + question number + topic name (JP) from the qid", () => {
    expect(rowLabel("2025r07-q007", INDEX)).toEqual({ exam: "令和7年度", number: 7, topicId: "technology-09-01", topic: "テク領域" });
    expect(rowLabel("2009h21a-q040", INDEX)).toEqual({ exam: "平成21年度春期", number: 40, topicId: "management-05-01", topic: "マネジメント領域" });
    // an exam without a label falls back to the exam id; an unknown topic to ""
    expect(rowLabel("2030r12-q100", INDEX)).toEqual({ exam: "2030r12", number: 100, topicId: null, topic: "" });
  });
  it("an id without -qNNN → null (no throw)", () => {
    expect(rowLabel("not-a-question", INDEX)).toBeNull();
  });
});

describe("mistakesBook", () => {
  it("empty record → no groups, no href", () => {
    expect(mistakesBook(emptyRecord(), INDEX, D0, toDay)).toEqual({ total: 0, groups: [], href: null });
  });

  it("only current mistakes; grouped by topic in category order (strategy → management → technology), then index order", () => {
    let r = emptyRecord();
    r = wrong(r, Q("2025r07", 3), D0 - 2); // tech, due D0 - 1 (overdue)
    r = wrong(r, Q("2009h21a", 40), D0 - 5); // management
    r = wrong(r, Q("2009h21a", 10), D0); // strategy A, due tomorrow
    r = wrong(r, Q("2009h21a", 2), D0 - 1); // strategy B, due today
    // not a mistake any more: wrong, then right on two days
    r = wrong(r, Q("2009h21a", 11), D0 - 10);
    r = right(r, Q("2009h21a", 11), D0 - 9);
    r = right(r, Q("2009h21a", 11), D0 - 6);
    // never wrong
    r = right(r, Q("2009h21a", 1), D0 - 3);
    const book = mistakesBook(r, INDEX, D0, toDay);
    expect(book.total).toBe(4);
    expect(book.groups.map((g) => g.topicId)).toEqual(["strategy-02-01", "strategy-01-01", "management-05-01", "technology-09-01"]);
    const rows = book.groups.flatMap((g) => g.rows);
    expect(rows.map((x) => x.qid)).toEqual([Q("2009h21a", 2), Q("2009h21a", 10), Q("2009h21a", 40), Q("2025r07", 3)]);
    const byId = new Map(rows.map((x) => [x.qid, x]));
    expect(byId.get(Q("2009h21a", 2))!.next).toEqual({ kind: "today" });
    expect(byId.get(Q("2025r07", 3))!.next).toEqual({ kind: "today" }); // overdue → today
    expect(byId.get(Q("2009h21a", 10))!.next).toEqual({ kind: "date", day: D0 + 1 });
    expect(byId.get(Q("2009h21a", 40))!).toMatchObject({
      exam: "平成21年度春期",
      number: 40,
      topic: "マネジメント領域",
      wrongInWindow: 1,
      isLeech: false,
    });
    // the group carries the JP name and the category for its heading
    expect(book.groups[2]).toMatchObject({ name_jp: "マネジメント領域", category: "management" });
  });

  it("leech (≥ 4 wrong in the stored window) → isLeech + the topic's first unit; a topic without units → unitId null", () => {
    let r = emptyRecord();
    for (let k = 0; k < 4; k++) r = wrong(r, Q("2025r07", 1), D0 - 8 + k);
    for (let k = 0; k < 5; k++) r = wrong(r, Q("2009h21a", 1), D0 - 8 + k);
    r = wrong(r, Q("2009h21a", 10), D0 - 3);
    r = wrong(r, Q("2009h21a", 10), D0 - 2);
    r = wrong(r, Q("2009h21a", 10), D0 - 1);
    const rows = mistakesBook(r, INDEX, D0, toDay).groups.flatMap((g) => g.rows);
    const byId = new Map(rows.map((x) => [x.qid, x]));
    expect(byId.get(Q("2025r07", 1))).toMatchObject({ isLeech: true, wrongInWindow: 4, unitId: "u-tech-1" });
    expect(byId.get(Q("2009h21a", 1))).toMatchObject({ isLeech: true, wrongInWindow: 5, unitId: null });
    expect(byId.get(Q("2009h21a", 10))).toMatchObject({ isLeech: false, wrongInWindow: 3, unitId: "u-str-1" });
  });

  it("rows inside a topic: earliest due first, ties by qid", () => {
    let r = emptyRecord();
    r = wrong(r, Q("2025r07", 9), D0 - 1); // due D0
    r = wrong(r, Q("2025r07", 2), D0); // due D0 + 1
    r = wrong(r, Q("2025r07", 5), D0 - 1); // due D0
    const g = mistakesBook(r, INDEX, D0, toDay).groups[0]!;
    expect(g.rows.map((x) => x.number)).toEqual([5, 9, 2]);
  });

  it("做全部错题: href = /practice?ids= of every mistake by (due, qid), capped at 100; total counts all", () => {
    let r = emptyRecord();
    // 120 tech mistakes; questions 101–120 were wrong earlier (due earlier) than 1–100
    for (let k = 1; k <= 120; k++) r = wrong(r, Q("2025r07", k), k > 100 ? D0 - 3 : D0 - 1);
    const book = mistakesBook(r, INDEX, D0, toDay);
    expect(book.total).toBe(120);
    const ids = book.href!.replace(/^\/practice\?ids=/, "").split(",");
    expect(ids).toHaveLength(MAX_SCOPE_IDS);
    expect(ids.slice(0, 20)).toEqual(Array.from({ length: 20 }, (_, k) => Q("2025r07", 101 + k)));
    expect(ids.slice(20)).toEqual(Array.from({ length: 80 }, (_, k) => Q("2025r07", 1 + k)));
    expect(book.href).not.toContain("&");
  });

  it("fix round 1 (M5): a payload id without -qNNN is skipped with a warning (not counted, not in the URL)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const index: TodayIndex = {
        ...INDEX,
        topicQuestionIds: { ...INDEX.topicQuestionIds, "management-05-01": ["broken-id", Q("2009h21a", 40)] },
      };
      let r = wrong(emptyRecord(), "broken-id", D0 - 1);
      r = wrong(r, Q("2009h21a", 40), D0 - 1);
      const book = mistakesBook(r, index, D0, toDay);
      expect(book.total).toBe(1);
      expect(book.groups.flatMap((g) => g.rows.map((x) => x.qid))).toEqual([Q("2009h21a", 40)]);
      expect(book.href).toBe(`/practice?ids=${Q("2009h21a", 40)}`);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]![0])).toContain("broken-id");
    } finally {
      warn.mockRestore();
    }
  });

  it("record ids outside the payload are skipped", () => {
    const r = wrong(emptyRecord(), "1999x99a-q001", D0 - 1);
    expect(mistakesBook(r, INDEX, D0, toDay).total).toBe(0);
  });
});
