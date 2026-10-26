// Stage 7 Phase 2 Task 5 (DESIGN §6.6 / D-193 §0-9) — the learning record page's numbers. Pure
// functions over the v2 learning record (the page calls them in the browser, toDay = toLocalDay).
//
//   - reviewForecast: questions whose review falls on today + d (d < days); [0] also takes every
//     overdue one. Mastered (dueDay null) and ids outside the pool are not counted.
//   - dailyCounts: per day of the last `days` (oldest first, today last) the number of distinct
//     questions with at least one attempt that day — every src (practice / mock / v1), every id in
//     the record. The record keeps the latest ATTEMPTS_K attempts per question, so older days can be
//     undercounted (§0-9: no extra note on the page).
//   - recordTotals: answered / mastered (box 5) / total over the pool; attempts and studyDays over
//     the whole record (the same scope as dailyCounts).
//   - topicRows: the three fields in PRACTICE_CATEGORY_ORDER; per topic answered / total / rate by
//     the latest attempt (topicStats). "stars" = ★ desc → question count desc → id asc; "rate" =
//     rate asc with unanswered (null) last, ties by the "stars" order.

import { topicStats, type LearningRecord } from "../learning/record";
import { MASTERED_BOX, reviewState, type QuestionPool, type ToDay } from "../learning/schedule";
import type { Stars, TodayIndex } from "../practice/practiceIndex";
import { PRACTICE_CATEGORY_ORDER } from "../practice/practiceLabels";

export type RecordSort = "stars" | "rate";

export interface RecordTotals {
  answered: number;
  total: number;
  attempts: number;
  mastered: number;
  studyDays: number;
}

export interface TopicRow {
  topicId: string;
  name_jp: string;
  stars: Stars;
  answered: number;
  total: number;
  /** correct / answered by the latest attempt; null when no question was answered */
  rate: number | null;
}

export interface TopicGroup {
  category: string;
  rows: TopicRow[];
}

const own = Object.prototype.hasOwnProperty;

function poolIds(pool: QuestionPool): Set<string> {
  const ids = new Set<string>();
  for (const list of Object.values(pool.topicQuestionIds)) for (const id of list) ids.add(id);
  return ids;
}

export function reviewForecast(r: LearningRecord, pool: QuestionPool, today: number, toDay: ToDay, days = 7): number[] {
  const out = new Array<number>(days).fill(0);
  for (const qid of poolIds(pool)) {
    if (!own.call(r.attempts, qid)) continue;
    const due = reviewState(r.attempts[qid]!, r.v2Since, qid, toDay)?.dueDay ?? null;
    if (due === null) continue;
    const d = Math.max(0, due - today);
    if (d < days) out[d]!++;
  }
  return out;
}

export function dailyCounts(r: LearningRecord, today: number, toDay: ToDay, days = 35): number[] {
  const out = new Array<number>(days).fill(0);
  const first = today - days + 1;
  for (const list of Object.values(r.attempts)) {
    for (const day of new Set(list.map((a) => toDay(a.at)))) {
      if (day >= first && day <= today) out[day - first]!++;
    }
  }
  return out;
}

export function recordTotals(r: LearningRecord, pool: QuestionPool, today: number, toDay: ToDay): RecordTotals {
  void today; // the totals do not depend on the day; kept for the page's uniform call shape
  const ids = poolIds(pool);
  let answered = 0;
  let mastered = 0;
  for (const qid of ids) {
    if (!own.call(r.attempts, qid) || r.attempts[qid]!.length === 0) continue;
    answered++;
    if (reviewState(r.attempts[qid]!, r.v2Since, qid, toDay)?.box === MASTERED_BOX) mastered++;
  }
  let attempts = 0;
  const studied = new Set<number>();
  for (const list of Object.values(r.attempts)) {
    attempts += list.length;
    for (const a of list) studied.add(toDay(a.at));
  }
  return { answered, total: ids.size, attempts, mastered, studyDays: studied.size };
}

const byStars = (x: TopicRow, y: TopicRow): number =>
  y.stars - x.stars || y.total - x.total || (x.topicId < y.topicId ? -1 : x.topicId > y.topicId ? 1 : 0);

const byRate = (x: TopicRow, y: TopicRow): number => {
  if (x.rate !== y.rate) {
    if (x.rate === null) return 1;
    if (y.rate === null) return -1;
    return x.rate - y.rate;
  }
  return byStars(x, y);
};

export function topicRows(r: LearningRecord, index: TodayIndex, sort: RecordSort): TopicGroup[] {
  const stats = topicStats(
    r,
    index.topics.flatMap((t) => (index.topicQuestionIds[t.id] ?? []).map((id) => ({ id, topic_id: t.id }))),
  );
  return PRACTICE_CATEGORY_ORDER.map((category) => ({
    category,
    rows: index.topics
      .filter((t) => t.category === category)
      .map((t): TopicRow => {
        const s = stats.get(t.id);
        const answered = s?.answered ?? 0;
        return {
          topicId: t.id,
          name_jp: t.name_jp,
          stars: t.stars,
          answered,
          total: s?.total ?? 0,
          rate: answered === 0 ? null : s!.correct / answered,
        };
      })
      .sort(sort === "rate" ? byRate : byStars),
  }));
}
