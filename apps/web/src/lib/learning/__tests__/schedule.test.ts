// Stage 7 Phase 1 (D-190 §0-5〜§0-9, DESIGN §5.4 / §5.5) — review scheduler and daily quotas.
//
// Guards: Leitner boxes 1/3/7/14/30 counted on each day's first attempt only
// (Review Focus 2: same-day repeats, 23:59 / 00:01 day boundary), the exclusive
// classes table, leech over the stored window, the v1 migration spread, the
// daily cap 30 / new 10 with reviewed-today / new-today counting, the migration
// backlog (Review Focus 3: 800 v1 wrong + 1500 v1 correct → today ≤ 30, old
// correct answers spread over 14 days), and the seeded new-question picker
// (weak-topic fill, chumon group expansion, 35/20/45 category share).
//
// `toDay` is the UTC day (results do not depend on the machine's time zone);
// times are built with Date.UTC.

import { describe, expect, it } from "vitest";

import { fnv1a32, mulberry32 } from "../../hash";
import { compareAttempts, emptyRecord, setSetting, type Attempt, type LearningRecord } from "../record";
import {
  BOX_INTERVALS,
  LEECH_WRONG,
  MASTERED_BOX,
  OFFICIAL_RATIO,
  classify,
  dailyPlan,
  expandGroups,
  pickNew,
  reviewState,
  toLocalDay,
  type QuestionPool,
  type ReviewClass,
} from "../schedule";

const DAY = 86_400_000;
const toDay = (at: number): number => Math.floor(at / DAY);
/** 2026-10-01 00:00 UTC as a day number */
const D0 = toDay(Date.UTC(2026, 9, 1));
/** epoch ms on day `d` (day number) at hh:mm UTC */
const at = (d: number, hh = 10, mm = 0): number => d * DAY + (hh * 60 + mm) * 60_000;
const QID = "2009h21a-q001";

const att = (t: number, correct: boolean, src: Attempt["src"] = "practice"): Attempt => ({
  at: t,
  choice: "ア",
  correct,
  src,
});
/** stored order (compareAttempts) */
const stored = (...xs: Attempt[]): Attempt[] => [...xs].sort(compareAttempts);
const st = (xs: Attempt[], since?: number, qid = QID) => reviewState(stored(...xs), since, qid, toDay)!;

describe("constants", () => {
  it("boxes 1/3/7/14/30, mastered 5, leech 4, ratio 35/20/45", () => {
    expect(BOX_INTERVALS).toEqual([1, 3, 7, 14, 30]);
    expect(MASTERED_BOX).toBe(5);
    expect(LEECH_WRONG).toBe(4);
    expect(OFFICIAL_RATIO).toEqual({ strategy: 35, management: 20, technology: 45 });
  });
});

describe("toLocalDay", () => {
  it("local 23:59 and next-day 00:01 are consecutive day numbers since 1970-01-01", () => {
    const late = new Date(2026, 9, 23, 23, 59).getTime();
    const early = new Date(2026, 9, 24, 0, 1).getTime();
    expect(toLocalDay(late)).toBe(Date.UTC(2026, 9, 23) / DAY);
    expect(toLocalDay(early)).toBe(Date.UTC(2026, 9, 24) / DAY);
    expect(toLocalDay(new Date(2026, 9, 23, 0, 0).getTime())).toBe(toLocalDay(late));
  });
});

describe("reviewState / classify (DESIGN §5.4)", () => {
  it("no attempts → null", () => {
    expect(reviewState([], undefined, QID, toDay)).toBeNull();
  });

  it("wrong → box 0, due tomorrow, class mistake", () => {
    const s = st([att(at(D0), false)]);
    expect(s.box).toBe(0);
    expect(s.dueDay).toBe(D0 + 1);
    expect(s.isMistake).toBe(true);
    expect(classify(s, D0)).toBe("mistake");
    expect(s.firstDay).toBe(D0);
    expect(s.lastDay).toBe(D0);
  });

  it("first-ever correct → box 2, due +7", () => {
    const s = st([att(at(D0), true)]);
    expect(s.box).toBe(2);
    expect(s.dueDay).toBe(D0 + 7);
    expect(s.isMistake).toBe(false);
    expect(classify(s, D0 + 6)).toBe("scheduled");
    expect(classify(s, D0 + 7)).toBe("due");
  });

  it("wrong, correct(d+1) → still mistake (1 counted correct day)", () => {
    const s = st([att(at(D0), false), att(at(D0 + 1), true)]);
    expect(s.box).toBe(1);
    expect(s.dueDay).toBe(D0 + 1 + 3);
    expect(s.isMistake).toBe(true);
    expect(classify(s, D0 + 1)).toBe("mistake");
  });

  it("wrong, correct(d+1), correct(d+4) → leaves mistakes, box 2", () => {
    const s = st([att(at(D0), false), att(at(D0 + 1), true), att(at(D0 + 4), true)]);
    expect(s.box).toBe(2);
    expect(s.dueDay).toBe(D0 + 4 + 7);
    expect(s.isMistake).toBe(false);
    expect(classify(s, D0 + 4)).toBe("scheduled");
    expect(classify(s, D0 + 11)).toBe("due");
  });

  it("box 4 correct → mastered, dueDay null", () => {
    // first correct → 2 (+7) → 3 (+14) → 4 (+30) → 5
    const four = [att(at(D0), true), att(at(D0 + 7), true), att(at(D0 + 21), true)];
    const s4 = st(four);
    expect(s4.box).toBe(4);
    expect(s4.dueDay).toBe(D0 + 21 + 30);
    const s = st([...four, att(at(D0 + 51), true)]);
    expect(s.box).toBe(5);
    expect(s.dueDay).toBeNull();
    expect(classify(s, D0 + 51)).toBe("mastered");
    expect(classify(s, D0 + 999)).toBe("mastered");
    // a wrong day after mastery → back to box 0
    const back = st([...four, att(at(D0 + 51), true), att(at(D0 + 60), false)]);
    expect(back.box).toBe(0);
    expect(classify(back, D0 + 60)).toBe("mistake");
  });

  it("same-day repeats: only the first attempt of a day counts", () => {
    // wrong first, then right twice the same day → still box 0 / mistake
    const a = st([att(at(D0, 9), false), att(at(D0, 10), true), att(at(D0, 11), true)]);
    expect(a.box).toBe(0);
    expect(a.dueDay).toBe(D0 + 1);
    expect(a.isMistake).toBe(true);
    // right first, then wrong the same day → box 2, not a mistake (the wrong is stored and counted for leech)
    const b = st([att(at(D0, 9), true), att(at(D0, 10), false)]);
    expect(b.box).toBe(2);
    expect(b.dueDay).toBe(D0 + 7);
    expect(b.isMistake).toBe(false);
    expect(b.wrongInWindow).toBe(1);
    // repeating a correct answer the same day does not advance the box
    expect(st([att(at(D0, 9), true), att(at(D0, 10), true), att(at(D0, 23, 59), true)]).box).toBe(2);
  });

  it("day boundary: 23:59 and 00:01 are two counted days", () => {
    const s = st([att(at(D0, 23, 59), true), att(at(D0 + 1, 0, 1), true)]);
    expect(s.box).toBe(3);
    expect(s.lastDay).toBe(D0 + 1);
    expect(s.dueDay).toBe(D0 + 1 + 14);
    const w = st([att(at(D0, 23, 59), false), att(at(D0 + 1, 0, 1), true)]);
    expect(w.box).toBe(1);
    expect(w.isMistake).toBe(true);
  });

  it("leech: 4 wrong within the last 10 attempts", () => {
    const xs = [
      att(at(D0), false),
      att(at(D0 + 1), true),
      att(at(D0 + 2), false),
      att(at(D0 + 3), true),
      att(at(D0 + 4), false),
      att(at(D0 + 5), true),
      att(at(D0 + 6), false),
    ];
    const s = st(xs);
    expect(s.wrongInWindow).toBe(4);
    expect(s.isLeech).toBe(true);
    expect(s.isMistake).toBe(true);
  });

  it("3 wrong → not leech", () => {
    const s = st([att(at(D0), false), att(at(D0 + 1), false), att(at(D0 + 2), true), att(at(D0 + 3), false)]);
    expect(s.wrongInWindow).toBe(3);
    expect(s.isLeech).toBe(false);
  });

  it("leech counts same-day repeats", () => {
    const s = st([att(at(D0, 9), false), att(at(D0, 10), false), att(at(D0, 11), false), att(at(D0, 12), false)]);
    expect(s.box).toBe(0);
    expect(s.wrongInWindow).toBe(4);
    expect(s.isLeech).toBe(true);
  });

  it("v1 correct → box 2, due = day(v2Since) + fnv1a32(qid) % 14", () => {
    const since = at(D0 + 30, 12);
    for (const qid of ["2009h21a-q001", "2019r01a-q042", "2025r07-q100"]) {
      const s = st([att(at(D0, 8), true, "v1")], since, qid);
      expect(s.box).toBe(2);
      expect(s.dueDay).toBe(D0 + 30 + (fnv1a32(qid) % 14));
      expect(s.isMistake).toBe(false);
    }
  });

  it("v1 correct without v2Since → due = day(at) + fnv1a32(qid) % 14", () => {
    const s = st([att(at(D0, 8), true, "v1")], undefined);
    expect(s.dueDay).toBe(D0 + (fnv1a32(QID) % 14));
  });

  it("v1 spread never makes a v1 answer from today due today: due = max(day(v2Since) + hash % 14, firstDay + 1)", () => {
    const ids = Array.from({ length: 200 }, (_, n) => `2009h21a-q${String(n + 1).padStart(3, "0")}`);
    const zero = ids.find((id) => fnv1a32(id) % 14 === 0)!;
    const five = ids.find((id) => fnv1a32(id) % 14 === 5)!;
    const since = at(D0, 12);
    // v1 answer made this morning, migration at noon the same day
    const s0 = st([att(at(D0, 8), true, "v1")], since, zero);
    expect(s0.dueDay).toBe(D0 + 1);
    expect(classify(s0, D0)).toBe("scheduled");
    expect(st([att(at(D0, 8), true, "v1")], since, five).dueDay).toBe(D0 + 5);
    // an older v1 answer keeps the plain spread (day 0 of the 14)
    expect(st([att(at(D0 - 3, 8), true, "v1")], since, zero).dueDay).toBe(D0);
  });

  it("v1 wrong → normal: box 0, due the next day (already past → in the mistake queue)", () => {
    const s = st([att(at(D0, 8), false, "v1")], at(D0 + 30));
    expect(s.box).toBe(0);
    expect(s.dueDay).toBe(D0 + 1);
    expect(classify(s, D0 + 30)).toBe("mistake");
  });

  it("v1 correct then wrong today → mistake", () => {
    const since = at(D0 + 30, 12);
    const s = st([att(at(D0, 8), true, "v1"), att(at(D0 + 31, 9), false)], since);
    expect(s.box).toBe(0);
    expect(s.dueDay).toBe(D0 + 32);
    expect(classify(s, D0 + 31)).toBe("mistake");
  });

  it("v1 attempt that is not the earliest, or at >= v2Since → normal attempt", () => {
    const since = at(D0 + 30, 12);
    // practice correct on D0, then a v1 correct (written by an old tab) on D0+5 → box 3, due +14
    const notFirst = st([att(at(D0), true), att(at(D0 + 5), true, "v1")], since);
    expect(notFirst.box).toBe(3);
    expect(notFirst.dueDay).toBe(D0 + 5 + 14);
    // a v1 attempt stamped at or after v2Since → first-ever correct rule (+7)
    for (const t of [since, since + 1]) {
      const late = st([att(t, true, "v1")], since);
      expect(late.box).toBe(2);
      expect(late.dueDay).toBe(toDay(t) + 7);
    }
  });

  it("v1 spread applies only to the v1 day; a later counted day schedules normally", () => {
    const since = at(D0 + 30, 12);
    const s = st([att(at(D0), true, "v1"), att(at(D0 + 35), true)], since);
    expect(s.box).toBe(3);
    expect(s.dueDay).toBe(D0 + 35 + 14);
  });

  it("classes are exclusive and cover every answered question", () => {
    const rand = mulberry32(20261023);
    const today = D0 + 60;
    const seen = new Set<ReviewClass>();
    for (let q = 0; q < 200; q++) {
      const n = 1 + Math.floor(rand() * 10);
      const xs: Attempt[] = [];
      for (let i = 0; i < n; i++) {
        const day = D0 + Math.floor(rand() * 61);
        xs.push(att(at(day, Math.floor(rand() * 24), Math.floor(rand() * 60)) + i, rand() < 0.6));
      }
      const list = stored(...xs);
      const s = reviewState(list, undefined, `q${q}`, toDay)!;
      expect(s).not.toBeNull();
      // DESIGN §5.4 table, recomputed here from the counted days
      const chrono = [...list].reverse();
      const counted: Attempt[] = [];
      for (const a of chrono) if (counted.length === 0 || toDay(counted[counted.length - 1]!.at) !== toDay(a.at)) counted.push(a);
      const lastWrong = counted.map((a) => a.correct).lastIndexOf(false);
      const isMistake = lastWrong >= 0 && counted.slice(lastWrong + 1).filter((a) => a.correct).length < 2;
      const conds: Record<ReviewClass, boolean> = {
        mistake: isMistake,
        due: !isMistake && s.box <= 4 && s.dueDay !== null && s.dueDay <= today,
        scheduled: !isMistake && s.box <= 4 && s.dueDay !== null && s.dueDay > today,
        mastered: s.box === 5,
      };
      const matching = (Object.keys(conds) as ReviewClass[]).filter((k) => conds[k]);
      expect(matching).toHaveLength(1);
      expect(classify(s, today)).toBe(matching[0]);
      expect(s.isMistake).toBe(isMistake);
      expect(s.wrongInWindow).toBe(list.filter((a) => !a.correct).length);
      seen.add(matching[0]!);
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });
});

// ---- pools -----------------------------------------------------------------------

/** ids in the real `<exam_id>-q<NNN>` shape, unique per (topic index, n) */
const qidOf = (topicIdx: number, n: number): string =>
  `${2009 + (topicIdx % 17)}x${String(topicIdx).padStart(2, "0")}-q${String(n + 1).padStart(3, "0")}`;

function makePool(
  topics: { id: string; count: number; stars?: 1 | 2 | 3 }[],
  groups: Record<string, string[]> = {},
): QuestionPool {
  const topicQuestionIds: Record<string, string[]> = {};
  const topicStars: Record<string, 1 | 2 | 3> = {};
  topics.forEach((t, i) => {
    topicQuestionIds[t.id] = Array.from({ length: t.count }, (_, n) => qidOf(i, n));
    topicStars[t.id] = t.stars ?? 1;
  });
  return { topicQuestionIds, groups, topicStars };
}

/** 3 categories × `perCat` topics × `count` questions; stars cycle 3/2/1 inside each category */
function balancedPool(perCat: number, count: number): QuestionPool {
  const topics: { id: string; count: number; stars: 1 | 2 | 3 }[] = [];
  for (const c of ["strategy", "management", "technology"]) {
    for (let i = 0; i < perCat; i++) {
      topics.push({ id: `${c}-${String(i + 1).padStart(2, "0")}-01`, count, stars: ([3, 2, 1] as const)[i % 3]! });
    }
  }
  return makePool(topics);
}

const withAttempts = (r: LearningRecord, entries: [string, Attempt[]][]): LearningRecord => ({
  ...r,
  attempts: { ...r.attempts, ...Object.fromEntries(entries.map(([k, xs]) => [k, stored(...xs)])) },
});

const topicOfIn = (pool: QuestionPool) => {
  const m = new Map<string, string>();
  for (const [t, ids] of Object.entries(pool.topicQuestionIds)) for (const id of ids) m.set(id, t);
  return (id: string): string => m.get(id)!;
};

// ---- dailyPlan -------------------------------------------------------------------

describe("dailyPlan (§0-6 / §0-7, DESIGN §5.4 每日量)", () => {
  const today = D0 + 40;
  const key = "2026-11-10";
  const pool = balancedPool(3, 40);
  const ids = Object.values(pool.topicQuestionIds).flat();

  it("caps mistakes + due at 30, mistakes first, earliest due first, ties by qid", () => {
    // 20 mistakes: wrong on day today-1-k → due today-k (k = i % 5 → ties)
    const mistakeIds = ids.slice(0, 20);
    const dueIds = ids.slice(20, 40);
    const r = withAttempts(emptyRecord(), [
      ...mistakeIds.map((id, i): [string, Attempt[]] => [id, [att(at(today - 1 - (i % 5)), false)]]),
      // 20 due: first-ever correct on today-7-k → due today-k
      ...dueIds.map((id, i): [string, Attempt[]] => [id, [att(at(today - 7 - (i % 4)), true)]]),
      // wrong today → due tomorrow → not in today's queue
      [ids[40]!, [att(at(today, 8), false)]],
      // scheduled (due in the future) → not in the queue
      [ids[41]!, [att(at(today - 2), true)]],
    ]);
    const plan = dailyPlan(r, pool, today, toDay, key);
    expect(plan.reviewCap).toBe(30);
    expect(plan.newTarget).toBe(10);
    expect(plan.mistakes.length + plan.due.length).toBe(30);
    expect(plan.mistakes).toHaveLength(20);
    expect(plan.due).toHaveLength(10);
    const dueOf = (id: string) => reviewState(r.attempts[id]!, r.v2Since, id, toDay)!.dueDay!;
    const expectedMistakes = [...mistakeIds].sort((x, y) => dueOf(x) - dueOf(y) || (x < y ? -1 : 1));
    expect(plan.mistakes).toEqual(expectedMistakes);
    const expectedDue = [...dueIds].sort((x, y) => dueOf(x) - dueOf(y) || (x < y ? -1 : 1)).slice(0, 10);
    expect(plan.due).toEqual(expectedDue);
    expect(plan.mistakes).not.toContain(ids[40]);
    expect(plan.due).not.toContain(ids[41]);
    // earliest due first: the first entries are the oldest
    expect(dueOf(plan.mistakes[0]!)).toBe(today - 4);
    expect(dueOf(plan.mistakes[19]!)).toBe(today);
  });

  it("more than 30 mistakes → 30 mistakes, no due", () => {
    const r = withAttempts(
      emptyRecord(),
      ids.slice(0, 45).map((id, i): [string, Attempt[]] => [id, [att(at(today - 1 - i), false)]]),
    );
    const plan = dailyPlan(r, pool, today, toDay, key);
    expect(plan.mistakes).toHaveLength(30);
    expect(plan.due).toHaveLength(0);
    // the 30 oldest
    expect(plan.mistakes).toEqual(ids.slice(15, 45).reverse());
  });

  it("reviewedToday reduces the remaining cap", () => {
    const reviewed = ids.slice(60, 65); // answered before today and again today
    const r = withAttempts(emptyRecord(), [
      ...ids.slice(0, 40).map((id, i): [string, Attempt[]] => [id, [att(at(today - 1 - i), false)]]),
      ...reviewed.map((id): [string, Attempt[]] => [id, [att(at(today - 10), false), att(at(today, 9), true)]]),
    ]);
    const plan = dailyPlan(r, pool, today, toDay, key);
    expect(plan.reviewedToday).toBe(5);
    expect(plan.newToday).toBe(0);
    expect(plan.mistakes.length + plan.due.length).toBe(25);
    // a configured cap is used
    const r10 = setSetting(r, "dailyReviewCap", 10, at(today));
    const p10 = dailyPlan(r10, pool, today, toDay, key);
    expect(p10.reviewCap).toBe(10);
    expect(p10.mistakes.length + p10.due.length).toBe(5);
    // cap fully used → nothing left (never negative)
    const many = withAttempts(
      r10,
      ids.slice(70, 85).map((id): [string, Attempt[]] => [id, [att(at(today - 3), true), att(at(today, 9), true)]]),
    );
    const pm = dailyPlan(many, pool, today, toDay, key);
    expect(pm.reviewedToday).toBe(20);
    expect(pm.mistakes).toEqual([]);
    expect(pm.due).toEqual([]);
  });

  it("newToday reduces fresh", () => {
    const r = withAttempts(emptyRecord(), [
      ...ids.slice(0, 3).map((id): [string, Attempt[]] => [id, [att(at(today, 9), true)]]),
      // first answered today and repeated today → still one new question
      [ids[3]!, [att(at(today, 9), false), att(at(today, 10), true)]],
    ]);
    const plan = dailyPlan(r, pool, today, toDay, key);
    expect(plan.newToday).toBe(4);
    expect(plan.reviewedToday).toBe(0);
    expect(plan.fresh).toHaveLength(6);
    for (const id of plan.fresh) expect(r.attempts[id]).toBeUndefined();
    // the start-of-day pick (all 4 count as unanswered then), shortened by the new answers made outside it
    const base = pickNew(emptyRecord(), pool, 10, key);
    const inBase = base.filter((id) => r.attempts[id] !== undefined).length;
    expect(plan.fresh).toEqual(base.slice(0, 10 - (4 - inBase)).filter((id) => r.attempts[id] === undefined));
    // target reached → no fresh; target 0 → no fresh
    const done = withAttempts(r, ids.slice(4, 12).map((id): [string, Attempt[]] => [id, [att(at(today, 11), true)]]));
    expect(dailyPlan(done, pool, today, toDay, key).fresh).toEqual([]);
    const zero = setSetting(emptyRecord(), "dailyNewTarget", 0, at(today));
    expect(dailyPlan(zero, pool, today, toDay, key).fresh).toEqual([]);
  });

  it("fresh after answering 3 of today's picks = the original list minus those 3, same order", () => {
    // 63 topics × 46 = 2898 questions, 20 chumon groups of 4, ~400 answered before today
    const big0 = balancedPool(21, 46);
    const groups: Record<string, string[]> = {};
    Object.values(big0.topicQuestionIds)
      .slice(0, 20)
      .forEach((qs) => (groups[qs[0]!] = qs.slice(0, 4)));
    const big: QuestionPool = { ...big0, groups };
    const all = Object.values(big.topicQuestionIds).flat();
    const rand = mulberry32(11);
    const before = new Set<string>();
    while (before.size < 400) before.add(all[Math.floor(rand() * all.length)]!);
    const r0 = withAttempts(
      emptyRecord(),
      [...before].map((id): [string, Attempt[]] => [id, [att(at(today - 1 - Math.floor(rand() * 60)), rand() < 0.7)]]),
    );
    const plan0 = dailyPlan(r0, big, today, toDay, key);
    expect(plan0.fresh.length).toBeGreaterThanOrEqual(10);
    const unanswered = plan0.fresh.filter((id) => r0.attempts[id] === undefined);
    const done = [unanswered[0]!, unanswered[2]!, unanswered[4]!];
    const r1 = withAttempts(
      r0,
      done.map((id, i): [string, Attempt[]] => [id, [att(at(today, 9, i), i !== 1)]]),
    );
    const plan1 = dailyPlan(r1, big, today, toDay, key);
    expect(plan1.newToday).toBe(3);
    expect(plan1.fresh).toEqual(plan0.fresh.filter((id) => !done.includes(id)));
    // refreshing again the same day gives the same list
    expect(dailyPlan(r1, big, today, toDay, key).fresh).toEqual(plan1.fresh);
  });

  it("record ids outside the pool are skipped (never occupy the cap or the counts)", () => {
    const ghosts = Array.from({ length: 40 }, (_, i) => `1999x99-q${String(i + 1).padStart(3, "0")}`);
    const r = withAttempts(emptyRecord(), [
      ...ghosts.map((id, i): [string, Attempt[]] => [id, [att(at(today - 2 - i), false)]]),
      [ghosts[0]!.replace("q001", "q900"), [att(at(today, 9), true)]],
      [`${ghosts[1]!}x`, [att(at(today - 5), false), att(at(today, 9), true)]],
      [ids[0]!, [att(at(today - 3), false)]],
      [ids[1]!, [att(at(today - 9), true)]],
    ]);
    const plan = dailyPlan(r, pool, today, toDay, key);
    expect(plan.mistakes).toEqual([ids[0]]);
    expect(plan.due).toEqual([ids[1]]);
    expect(plan.newToday).toBe(0);
    expect(plan.reviewedToday).toBe(0);
    expect(plan.fresh).toHaveLength(10);
  });

  it("lists are disjoint and contain only due / mistake questions", () => {
    const r = withAttempts(
      emptyRecord(),
      ids.slice(0, 60).map((id, i): [string, Attempt[]] => [id, [att(at(today - 1 - (i % 9)), i % 3 === 0)]]),
    );
    const plan = dailyPlan(r, pool, today, toDay, key);
    const all = [...plan.mistakes, ...plan.due, ...plan.fresh];
    expect(new Set(all).size).toBe(all.length);
    for (const id of plan.mistakes) expect(classify(reviewState(r.attempts[id]!, undefined, id, toDay)!, today)).toBe("mistake");
    for (const id of plan.due) expect(classify(reviewState(r.attempts[id]!, undefined, id, toDay)!, today)).toBe("due");
  });

  it("migration backlog: 800 v1 wrong + 1500 v1 correct, v2Since today → today ≤ 30, correct ones spread over 14 days", () => {
    const since = at(today, 12);
    const exams = Array.from({ length: 29 }, (_, e) => `${2009 + e}r${String(e).padStart(2, "0")}a`);
    const qids = exams.flatMap((e) => Array.from({ length: 100 }, (_, n) => `${e}-q${String(n + 1).padStart(3, "0")}`));
    const rand = mulberry32(7);
    const v1At = () => since - DAY * (1 + Math.floor(rand() * 400)) - Math.floor(rand() * DAY);
    const wrongIds = qids.slice(0, 800);
    const rightIds = qids.slice(800, 2300);
    const migrated: LearningRecord = {
      ...withAttempts(emptyRecord(), [
        ...wrongIds.map((id): [string, Attempt[]] => [id, [att(v1At(), false, "v1")]]),
        ...rightIds.map((id): [string, Attempt[]] => [id, [att(v1At(), true, "v1")]]),
      ]),
      v2Since: since,
    };
    const migPool: QuestionPool = {
      topicQuestionIds: { "strategy-01-01": qids.slice(0, 1000), "management-01-01": qids.slice(1000, 2000), "technology-01-01": qids.slice(2000) },
      groups: {},
      topicStars: {},
    };
    const plan = dailyPlan(migrated, migPool, today, toDay, "2026-11-10");
    expect(plan.mistakes.length + plan.due.length).toBeLessThanOrEqual(30);
    expect(plan.mistakes).toHaveLength(30);
    expect(plan.reviewedToday).toBe(0);
    expect(plan.newToday).toBe(0);

    const perDay = new Map<number, number>();
    for (const id of rightIds) {
      const s = reviewState(migrated.attempts[id]!, since, id, toDay)!;
      expect(s.box).toBe(2);
      expect(s.dueDay).toBeGreaterThanOrEqual(today);
      expect(s.dueDay).toBeLessThan(today + 14);
      perDay.set(s.dueDay!, (perDay.get(s.dueDay!) ?? 0) + 1);
    }
    for (let d = today; d < today + 14; d++) expect(perDay.get(d) ?? 0).toBeLessThanOrEqual((1500 / 14) * 1.5);

    // correct ones only: the ~1/14 due today are still capped at 30
    const rightOnly: LearningRecord = {
      ...migrated,
      attempts: Object.fromEntries(rightIds.map((id) => [id, migrated.attempts[id]!])),
    };
    const p2 = dailyPlan(rightOnly, migPool, today, toDay, "2026-11-10");
    expect(p2.mistakes).toEqual([]);
    expect(p2.due).toHaveLength(30);
    // each following day stays capped too
    for (let d = today + 1; d < today + 14; d++) {
      const p = dailyPlan(rightOnly, migPool, d, toDay, "2026-11-10");
      expect(p.mistakes.length + p.due.length).toBeLessThanOrEqual(30);
    }
  });
});

// ---- pickNew / expandGroups ---------------------------------------------------------

describe("pickNew (§0-8 / §0-9)", () => {
  it("same dateKey → same list; different dateKey → different list", () => {
    const pool = balancedPool(3, 100);
    const r = emptyRecord();
    const a = pickNew(r, pool, 20, "2026-10-23");
    expect(a).toHaveLength(20);
    expect(new Set(a).size).toBe(20);
    expect(pickNew(r, pool, 20, "2026-10-23")).toEqual(a);
    expect(pickNew(r, pool, 20, "2026-10-24")).not.toEqual(a);
    expect(pickNew(r, pool, 20, "2026-10-23", { fillWeakTopics: false })).toEqual(
      pickNew(r, pool, 20, "2026-10-23", { fillWeakTopics: false }),
    );
    expect(pickNew(r, pool, 0, "2026-10-23")).toEqual([]);
  });

  it("fills topics with < 5 answered first, ★ high first", () => {
    // weak order: ★ desc → question count desc → topic id
    const pool = makePool([
      { id: "strategy-01-01", count: 30, stars: 1 }, // A: weak, ★1
      { id: "technology-01-01", count: 30, stars: 3 }, // B: weak, ★3, 30 questions
      { id: "technology-02-01", count: 20, stars: 3 }, // C: weak, ★3, 2 answered
      { id: "management-01-01", count: 30, stars: 3 }, // D: 6 answered → not weak
      { id: "management-02-01", count: 30, stars: 2 }, // E: weak, ★2, 4 answered
    ]);
    const [A, B, C, D, E] = Object.keys(pool.topicQuestionIds) as [string, string, string, string, string];
    const answer = (t: string, k: number): [string, Attempt[]][] =>
      pool.topicQuestionIds[t]!.slice(0, k).map((id) => [id, [att(at(D0), true)]]);
    const r = withAttempts(emptyRecord(), [...answer(C, 2), ...answer(D, 6), ...answer(E, 4)]);
    const topicOf = topicOfIn(pool);
    for (const key of ["2026-10-23", "2026-10-24", "2026-12-01"]) {
      const picks = pickNew(r, pool, 8, key);
      // round 1: B C E A; round 2: B C A (E reached 5); round 3: B
      expect(picks.map(topicOf)).toEqual([B, C, E, A, B, C, A, B]);
      for (const id of picks) expect(r.attempts[id]).toBeUndefined();
    }
    // past the fill (B 5, C 3 more, E 1, A 5 = 14), picks continue by category weight
    const many = pickNew(r, pool, 40, "2026-10-23");
    expect(many).toHaveLength(40);
    expect(new Set(many).size).toBe(40);
    expect(many.slice(0, 14).map(topicOf).sort()).toEqual(
      [...Array(5).fill(B), ...Array(3).fill(C), E, ...Array(5).fill(A)].sort(),
    );
    for (const id of many) expect(r.attempts[id]).toBeUndefined();
  });

  it("group member pulled → whole group, may exceed n", () => {
    const base = makePool([
      { id: "technology-01-01", count: 3, stars: 3 },
      { id: "strategy-01-01", count: 50, stars: 1 },
    ]);
    const [g1, g2, g3] = base.topicQuestionIds["technology-01-01"]! as [string, string, string];
    const pool: QuestionPool = { ...base, groups: { "2009x00-q001": [g1, g2, g3] } };
    // g1 answered before; the weak ★3 topic is filled first → one of g2/g3 → the whole group, in member order
    const r = withAttempts(emptyRecord(), [[g1, [att(at(D0), true)]]]);
    for (const key of ["2026-10-23", "2026-10-24"]) {
      const picks = pickNew(r, pool, 1, key);
      expect(picks).toEqual([g1, g2, g3]);
    }
    // the group counts by member count: n = 4 → group (3) + 1 more
    const four = pickNew(r, pool, 4, "2026-10-23");
    expect(four.slice(0, 3)).toEqual([g1, g2, g3]);
    expect(four).toHaveLength(4);
    // without the weak fill a group member drawn at random also pulls the whole group
    const solo: QuestionPool = { topicQuestionIds: { "technology-01-01": [g1, g2, g3] }, groups: pool.groups, topicStars: {} };
    expect(pickNew(emptyRecord(), solo, 1, "2026-10-23", { fillWeakTopics: false })).toEqual([g1, g2, g3]);
  });

  it("category share over 10 000 picks within ±3 points of 35/20/45", () => {
    const pool = balancedPool(3, 100);
    const topicOf = topicOfIn(pool);
    const counts: Record<string, number> = { strategy: 0, management: 0, technology: 0 };
    let total = 0;
    for (let d = 0; d < 500; d++) {
      const key = new Date(Date.UTC(2026, 0, 1) + d * DAY).toISOString().slice(0, 10);
      for (const id of pickNew(emptyRecord(), pool, 20, key, { fillWeakTopics: false })) {
        const t = topicOf(id);
        counts[t.split("-")[0]!]!++;
        total++;
      }
    }
    expect(total).toBe(10_000);
    for (const [c, w] of Object.entries(OFFICIAL_RATIO)) {
      expect(Math.abs((counts[c]! / total) * 100 - w)).toBeLessThanOrEqual(3);
    }
  });

  it("empty record + fillWeakTopics:false → not all ★★★, category share follows ratio", () => {
    // 63 topics, 21 of them ★★★ (as in the corpus)
    const pool = balancedPool(21, 10);
    const topicOf = topicOfIn(pool);
    const starOf = (id: string) => pool.topicStars[topicOf(id)];
    // with the weak fill an empty record gets one question from each of the first 20 weak topics = all ★★★
    expect(pickNew(emptyRecord(), pool, 20, "2026-10-23").every((id) => starOf(id) === 3)).toBe(true);
    const counts: Record<string, number> = { strategy: 0, management: 0, technology: 0 };
    let total = 0;
    for (let d = 0; d < 500; d++) {
      const key = new Date(Date.UTC(2026, 0, 1) + d * DAY).toISOString().slice(0, 10);
      const picks = pickNew(emptyRecord(), pool, 20, key, { fillWeakTopics: false });
      expect(picks).toHaveLength(20);
      expect(picks.every((id) => starOf(id) === 3)).toBe(false);
      for (const id of picks) {
        counts[topicOf(id).split("-")[0]!]!++;
        total++;
      }
    }
    for (const [c, w] of Object.entries(OFFICIAL_RATIO)) {
      expect(Math.abs((counts[c]! / total) * 100 - w)).toBeLessThanOrEqual(3);
    }
  });

  it("never returns answered questions outside a group; stops when the pool runs out", () => {
    const pool = makePool([
      { id: "strategy-01-01", count: 4 },
      { id: "technology-01-01", count: 3 },
    ]);
    const answeredId = pool.topicQuestionIds["strategy-01-01"]![0]!;
    const r = withAttempts(emptyRecord(), [[answeredId, [att(at(D0), false)]]]);
    const all = pickNew(r, pool, 50, "2026-10-23");
    expect(all).toHaveLength(6);
    expect(all).not.toContain(answeredId);
    expect(pickNew(r, pool, 50, "2026-10-23", { fillWeakTopics: false }).sort()).toEqual([...all].sort());
  });
});

describe("expandGroups", () => {
  it("group member → whole group in member order at the first occurrence, deduped", () => {
    const groups = { g: ["e-q005", "e-q006", "e-q007"], h: ["e-q010", "e-q011"] };
    expect(expandGroups(["x", "e-q007", "y", "e-q005", "e-q011", "x"], groups)).toEqual([
      "x",
      "e-q005",
      "e-q006",
      "e-q007",
      "y",
      "e-q010",
      "e-q011",
    ]);
    expect(expandGroups([], groups)).toEqual([]);
    expect(expandGroups(["a", "b"], {})).toEqual(["a", "b"]);
  });
});
