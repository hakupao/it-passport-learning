// Stage 7 Phase 2 (DESIGN §6.7, D-192, D-193 §0-5) — mock exam pure model.
//
// Guards: random draw at the official category ratio 35 / 20 / 45 with chumon
// groups whole and adjacent in member order (Review Focus 3, real corpus, many
// seeds), unanswered-first drawing, the single-exam id list, the 1000-point
// scoring with per-area pass lines (Review Focus 4: unanswered counts wrong),
// and the 120-minute timer.

import { beforeAll, describe, expect, it } from "vitest";

import { emptyRecord, type ChoiceLetter, type LearningRecord } from "../../learning/record";
import type { QuestionPool } from "../../learning/schedule";
import { groupMap } from "../../practice/practiceIndex";
import { loadChumonGroups } from "../../practice/practiceReader";
import { loadAllQuestions, type QuizQuestion } from "../../quiz/quizReader";
import {
  MOCK_MS,
  MOCK_N,
  PASS_AREA,
  PASS_TOTAL,
  deadline,
  drawRandomMock,
  examMockIds,
  remainingMs,
  scoreMock,
  type MockCategory,
} from "../mockModel";

let QS: QuizQuestion[] = [];
let POOL: QuestionPool;
let CAT: Map<string, MockCategory>;

beforeAll(async () => {
  const [qs, groups] = await Promise.all([loadAllQuestions(), loadChumonGroups()]);
  QS = qs;
  const topicQuestionIds: Record<string, string[]> = {};
  for (const q of qs) (topicQuestionIds[q.topic_id] ??= []).push(q.id);
  POOL = { topicQuestionIds, groups: groupMap(groups), topicStars: {} };
  CAT = new Map(qs.map((q) => [q.id, q.category as MockCategory]));
});

const counts = (ids: readonly string[]): Record<MockCategory, number> => {
  const c = { strategy: 0, management: 0, technology: 0 };
  for (const id of ids) c[CAT.get(id)!]++;
  return c;
};

describe("constants", () => {
  it("100 questions, 120 minutes, pass 600 total / 300 per area", () => {
    expect(MOCK_N).toBe(100);
    expect(MOCK_MS).toBe(120 * 60_000);
    expect(PASS_TOTAL).toBe(600);
    expect(PASS_AREA).toBe(300);
  });
});

describe("drawRandomMock", () => {
  it("corpus sanity: 2900 questions, chumon groups present", () => {
    expect(QS).toHaveLength(2900);
    expect(Object.keys(POOL.groups).length).toBeGreaterThan(0);
  });

  it("draw keeps groups whole and exact quotas", () => {
    let groupsSeen = 0;
    for (const prefer of [true, false]) {
      for (let seed = 1; seed <= 20; seed++) {
        const ids = drawRandomMock(emptyRecord(), POOL, CAT, seed, prefer);
        expect(ids).toHaveLength(100);
        expect(new Set(ids).size).toBe(100);
        expect(counts(ids)).toEqual({ strategy: 35, management: 20, technology: 45 });
        for (const members of Object.values(POOL.groups)) {
          const hit = members.filter((m) => ids.includes(m));
          if (hit.length === 0) continue;
          groupsSeen++;
          expect(hit).toEqual(members);
          const start = ids.indexOf(members[0]!);
          expect(ids.slice(start, start + members.length)).toEqual(members);
        }
      }
    }
    // the guard is vacuous unless some draws actually contain groups
    expect(groupsSeen).toBeGreaterThan(0);
  });

  it("preferUnanswered draws unanswered first", () => {
    const keep = drawRandomMock(emptyRecord(), POOL, CAT, 7, false);
    const keepSet = new Set(keep);
    const r: LearningRecord = emptyRecord();
    for (const q of QS) {
      if (keepSet.has(q.id)) continue;
      r.attempts[q.id] = [{ at: 1_700_000_000_000, choice: "ア", correct: true, src: "practice" }];
    }
    expect(new Set(drawRandomMock(r, POOL, CAT, 99, true))).toEqual(keepSet);
    // without the preference the answered questions are drawn too
    expect(drawRandomMock(r, POOL, CAT, 99, false).some((id) => !keepSet.has(id))).toBe(true);
  });

  it("same seed same list; another seed another list", () => {
    const a = drawRandomMock(emptyRecord(), POOL, CAT, 42, true);
    expect(drawRandomMock(emptyRecord(), POOL, CAT, 42, true)).toEqual(a);
    expect(drawRandomMock(emptyRecord(), POOL, CAT, 43, true)).not.toEqual(a);
  });

  it("output order is strategy → management → technology", () => {
    const ids = drawRandomMock(emptyRecord(), POOL, CAT, 3, false);
    const order: MockCategory[] = ["strategy", "management", "technology"];
    // the area of each unit's first member never goes backwards
    const groupOf = new Map<string, string[]>();
    for (const members of Object.values(POOL.groups)) for (const m of members) groupOf.set(m, members);
    const firstCats: number[] = [];
    for (let i = 0; i < ids.length; ) {
      const unit = groupOf.get(ids[i]!) ?? [ids[i]!];
      firstCats.push(order.indexOf(CAT.get(ids[i]!)!));
      i += unit.length;
    }
    expect(firstCats).toEqual([...firstCats].sort((x, y) => x - y));
  });
});

describe("examMockIds", () => {
  it("2025r07 → 100 ids in id order, all of that exam", () => {
    const ids = examMockIds("2025r07", QS);
    expect(ids).toHaveLength(100);
    expect(ids).toEqual([...ids].sort());
    expect(ids.every((id) => QS.find((q) => q.id === id)!.exam_id === "2025r07")).toBe(true);
    expect(counts(ids)).toEqual({ strategy: 32, management: 19, technology: 49 });
  });

  it("unknown exam → empty", () => {
    expect(examMockIds("1999x99", QS)).toEqual([]);
  });
});

describe("scoreMock (§0-5)", () => {
  // synthetic 35 / 20 / 45 key, every answer ア
  const ids: string[] = [];
  const key = new Map<string, { correct: ChoiceLetter; category: MockCategory }>();
  for (const [cat, n] of [
    ["strategy", 35],
    ["management", 20],
    ["technology", 45],
  ] as const) {
    for (let i = 0; i < n; i++) {
      const id = `${cat}-${i}`;
      ids.push(id);
      key.set(id, { correct: "ア", category: cat });
    }
  }
  const answer = (pick: (id: string, i: number) => ChoiceLetter | undefined): Record<string, ChoiceLetter> => {
    const out: Record<string, ChoiceLetter> = {};
    ids.forEach((id, i) => {
      const a = pick(id, i);
      if (a !== undefined) out[id] = a;
    });
    return out;
  };
  const inCat = (id: string, cat: MockCategory, k: number): boolean =>
    id.startsWith(`${cat}-`) && Number(id.slice(cat.length + 1)) < k;

  it("all correct → 1000, passed", () => {
    const s = scoreMock(ids, answer(() => "ア"), key);
    expect(s).toEqual({
      total: 1000,
      areas: { strategy: 1000, management: 1000, technology: 1000 },
      correct: 100,
      answered: 100,
      n: 100,
      passed: true,
    });
  });

  it("all blank → 0, nothing answered, not passed", () => {
    const s = scoreMock(ids, {}, key);
    expect(s).toEqual({
      total: 0,
      areas: { strategy: 0, management: 0, technology: 0 },
      correct: 0,
      answered: 0,
      n: 100,
      passed: false,
    });
  });

  it("unanswered counts wrong", () => {
    // 21 / 12 / 27 correct (60 % of each area), the rest unanswered
    const a = answer((id) =>
      inCat(id, "strategy", 21) || inCat(id, "management", 12) || inCat(id, "technology", 27) ? "ア" : undefined,
    );
    const s = scoreMock(ids, a, key);
    expect(s.answered).toBe(60);
    expect(s.correct).toBe(60);
    expect(s.total).toBe(600);
    expect(s.areas).toEqual({ strategy: 600, management: 600, technology: 600 });
    expect(s.passed).toBe(true);
  });

  it("wrong answers count as answered, not correct", () => {
    const s = scoreMock(ids, answer((_, i) => (i % 2 === 0 ? "ア" : "イ")), key);
    expect(s.answered).toBe(100);
    expect(s.correct).toBe(50);
    expect(s.total).toBe(500);
    expect(s.passed).toBe(false);
  });

  it("total ≥ 600 but one area below 300 → not passed", () => {
    const withMgmt = (k: number) =>
      answer((id) => (id.startsWith("management-") ? (inCat(id, "management", k) ? "ア" : "イ") : "ア"));
    const s5 = scoreMock(ids, withMgmt(5), key);
    expect(s5.areas.management).toBe(250);
    expect(s5.total).toBe(850);
    expect(s5.passed).toBe(false);
    const s6 = scoreMock(ids, withMgmt(6), key);
    expect(s6.areas.management).toBe(300);
    expect(s6.passed).toBe(true);
  });

  it("per-area scores use the actual area sizes (32 / 19 / 49)", () => {
    const realIds = examMockIds("2025r07", QS);
    const realKey = new Map(
      QS.filter((q) => q.exam_id === "2025r07").map((q) => [
        q.id,
        { correct: q.correct_answer as ChoiceLetter, category: q.category as MockCategory },
      ]),
    );
    // only the management area answered correctly
    const a: Record<string, ChoiceLetter> = {};
    for (const id of realIds) if (realKey.get(id)!.category === "management") a[id] = realKey.get(id)!.correct;
    const s = scoreMock(realIds, a, realKey);
    expect(s.n).toBe(100);
    expect(s.correct).toBe(19);
    expect(s.total).toBe(190);
    expect(s.areas).toEqual({ strategy: 0, management: 1000, technology: 0 });
  });
});

describe("timer", () => {
  const t0 = Date.UTC(2026, 9, 26, 9, 0);
  it("remaining time counts down from 120 minutes and stops at 0", () => {
    expect(remainingMs(t0, t0)).toBe(MOCK_MS);
    expect(remainingMs(t0, t0 + 119 * 60_000)).toBe(60_000);
    expect(remainingMs(t0, t0 + 121 * 60_000)).toBe(0);
  });
  it("deadline = start + 120 minutes", () => {
    expect(deadline(t0)).toBe(t0 + 120 * 60_000);
  });
});
