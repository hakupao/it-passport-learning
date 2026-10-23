// Stage 7 Phase 1 Task 11 (D-189 §6.1 / D-190 §0-7 / §0-9 / §0-10 / §0-20 / §0-26) — the today
// page's pure model (no React; bundler-safe, relative imports). The page computes it in the browser,
// from the learning record and the today payload (TodayIndex).
//
//   - todayTasks: the task rows in order mistakes → due → new → unit. A practice row shows the
//     remaining count of its class (dailyPlan) and links to its first today group (todayChunk: ≤ 20
//     ids, 中問 groups whole) with `kind=` (the model's "new" is the URL's / session's "fresh");
//     minutes = 1 per remaining question. A row whose class is empty now is shown checked (done)
//     when it had questions at the start of today (startPlan = startOfDayPlan); "new" is done when
//     the new quota is used up today (newToday > 0, target > 0). Empty and not done → omitted (§0-7).
//     Mistakes and due share one daily cap, so reviewedToday alone cannot say which row is done —
//     hence the start-of-day comparison. Without startPlan nothing is done.
//     detail: mistakes → the top 2 topics by count as "name_jp N" (ties: topic id) + `others` (the
//     rest); new → up to 2 topics (JP, first appearance) the pick filled because they have < 5
//     answered questions; due → none; unit → the topic name. The page localizes the rest.
//   - unit row: the weakest topic's first unread unit (unit_order; record.unitsRead), the unit's
//     minutes; omitted without a weakest topic or when all its units are read. Never done in Phase 1.
//   - primaryHref: 「从第 1 项开始」 = the first open practice row, else the unit, else null.
//   - weakTopicRows (§0-10): per topic, accuracy over each question's latest attempt
//     (topicAccuracy); answered ≥ 5 and ≥ 1 wrong; score = (1 − rate) × the topic's corpus question
//     count, desc (compared exactly as wrong·count·answered′ products), ties rate asc → topic id;
//     max 5.
//   - areaRates: per category, right latest answers / answered questions; null when none answered.
//   - daysUntil: exam date (YYYY-MM-DD) − today in days (negative = past); null without / invalid.
//   - isNewUser: no attempt at all (settings or units read alone do not count) → the baseline:
//     pickNew(r, pool, 20, dateKey, { fillWeakTopics: false }) (§0-9: by category ratio only).
//   - todayTerms (§0-20): the topic of the first question of the first today group → its cards
//     (≤ 3); no group or no cards → the weakest topic's; none → [].
//   - answeredCount: questions in the payload with ≥ 1 attempt / all questions in the payload
//     (ids deduped, like areaRates').
//   - isAnswered: the one "answered" test of this model (an own, non-empty attempt list) — used by
//     isNewUser, the new row's < 5 check and answeredCount. A done row's href is "" (no link).

import type { LearningRecord } from "../learning/record";
import { pickNew, type DailyPlan } from "../learning/schedule";
import { poolFromIndex, type Stars, type TodayIndex, type TodayTermCard } from "./practiceIndex";
import { PRACTICE_CATEGORY_ORDER } from "./practiceLabels";
import { topicAccuracy } from "./practiceRows";
import { todayChunk, todayHref, type TodayKind } from "./practiceSession";

export type TodayTaskKind = "mistakes" | "due" | "new" | "unit";

export interface TodayTask {
  kind: TodayTaskKind;
  /** remaining questions (practice rows); 1 for the unit */
  count: number;
  done: boolean;
  /** "" for a done row (nothing to open) */
  href: string;
  minutes: number;
  detail: string[];
  /** mistakes: questions outside the topics named in `detail` */
  others?: number;
  /** practice rows: the class's size at the start of today (a done row shows it) */
  startCount?: number;
  /** unit row */
  unit?: { id: string; title: string; topicId: string; category: string };
}

export interface WeakTopicRow {
  topicId: string;
  name_jp: string;
  category: string;
  stars: Stars;
  /** right / answered, 0–1 */
  rate: number;
  answered: number;
}

export type AreaRates = Record<(typeof PRACTICE_CATEGORY_ORDER)[number], number | null>;

export const BASELINE_N = 20;
const WEAK_MIN_ANSWERED = 5;
const WEAK_ROWS = 5;
const DETAIL_TOPICS = 2;
const DAY_MS = 86_400_000;

const PLAN_KEY: Record<Exclude<TodayTaskKind, "unit">, TodayKind> = { mistakes: "mistakes", due: "due", new: "fresh" };

const byId = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function topicIndex(index: TodayIndex): Map<string, string> {
  const m = new Map<string, string>();
  for (const [t, ids] of Object.entries(index.topicQuestionIds)) for (const id of ids) if (!m.has(id)) m.set(id, t);
  return m;
}

/** `qid` has at least one stored attempt (an own key with a non-empty list). */
export function isAnswered(r: LearningRecord, qid: string): boolean {
  return Object.prototype.hasOwnProperty.call(r.attempts, qid) && r.attempts[qid]!.length > 0;
}

const answeredIn = (r: LearningRecord, ids: readonly string[]): number =>
  ids.reduce((n, id) => (isAnswered(r, id) ? n + 1 : n), 0);

const uniqueIds = (lists: readonly (readonly string[])[]): string[] => [...new Set(lists.flat())];

export function todayTasks(
  plan: DailyPlan,
  r: LearningRecord,
  index: TodayIndex,
  weakest: string | null,
  startPlan?: DailyPlan,
): TodayTask[] {
  const topicOf = topicIndex(index);
  const meta = new Map(index.topics.map((t) => [t.id, t]));
  const name = (t: string): string => meta.get(t)?.name_jp ?? t;
  const tasks: TodayTask[] = [];

  for (const kind of ["mistakes", "due", "new"] as const) {
    const key = PLAN_KEY[kind];
    const ids = plan[key];
    const start = startPlan?.[key].length ?? 0;
    const done =
      ids.length === 0 && (kind === "new" ? plan.newToday > 0 && plan.newTarget > 0 && startPlan !== undefined : start > 0);
    if (ids.length === 0 && !done) continue;
    const task: TodayTask = {
      kind,
      count: ids.length,
      done,
      href: done ? "" : todayHref(key, todayChunk(ids, index.groups)),
      minutes: ids.length,
      detail: [],
      startCount: start,
    };
    if (kind === "mistakes") {
      const counts = new Map<string, number>();
      for (const id of ids) {
        const t = topicOf.get(id);
        if (t !== undefined) counts.set(t, (counts.get(t) ?? 0) + 1);
      }
      const top = [...counts].sort((a, b) => b[1] - a[1] || byId(a[0], b[0])).slice(0, DETAIL_TOPICS);
      task.detail = top.map(([t, n]) => `${name(t)} ${n}`);
      task.others = ids.length - top.reduce((s, [, n]) => s + n, 0);
    } else if (kind === "new") {
      const seen = new Set<string>();
      for (const id of ids) {
        const t = topicOf.get(id);
        if (t === undefined || seen.has(t)) continue;
        seen.add(t);
        if (answeredIn(r, index.topicQuestionIds[t]!) < WEAK_MIN_ANSWERED) task.detail.push(name(t));
        if (task.detail.length === DETAIL_TOPICS) break;
      }
    }
    tasks.push(task);
  }

  const topic = weakest === null ? undefined : meta.get(weakest);
  const unit = topic?.units.find((u) => !Object.prototype.hasOwnProperty.call(r.unitsRead, u.id));
  if (topic && unit) {
    tasks.push({
      kind: "unit",
      count: 1,
      done: false,
      href: `/textbook/${unit.id}`,
      minutes: unit.minutes,
      detail: [topic.name_jp],
      unit: { id: unit.id, title: unit.title, topicId: topic.id, category: topic.category },
    });
  }
  return tasks;
}

/** 「从第 1 项开始」: the first open practice row, else the unit row, else null (hide the button). */
export function primaryHref(tasks: readonly TodayTask[]): string | null {
  return (
    tasks.find((t) => t.kind !== "unit" && !t.done && t.count > 0)?.href ??
    tasks.find((t) => t.kind === "unit")?.href ??
    null
  );
}

export function weakTopicRows(r: LearningRecord, index: TodayIndex): WeakTopicRow[] {
  const rows: (WeakTopicRow & { wrong: number; questionCount: number })[] = [];
  for (const t of index.topics) {
    const { answered, correct } = topicAccuracy(r, index.topicQuestionIds[t.id] ?? []);
    if (answered < WEAK_MIN_ANSWERED || correct >= answered) continue;
    rows.push({
      topicId: t.id,
      name_jp: t.name_jp,
      category: t.category,
      stars: t.stars,
      rate: correct / answered,
      answered,
      wrong: answered - correct,
      questionCount: t.questionCount,
    });
  }
  // (1 − rate) · count = wrong · count / answered; compare x vs y by cross-multiplying (exact)
  rows.sort(
    (x, y) =>
      y.wrong * y.questionCount * x.answered - x.wrong * x.questionCount * y.answered ||
      x.rate - y.rate ||
      byId(x.topicId, y.topicId),
  );
  return rows.slice(0, WEAK_ROWS).map(({ topicId, name_jp, category, stars, rate, answered }) => ({
    topicId,
    name_jp,
    category,
    stars,
    rate,
    answered,
  }));
}

export function areaRates(r: LearningRecord, index: TodayIndex): AreaRates {
  const out = {} as AreaRates;
  for (const c of PRACTICE_CATEGORY_ORDER) {
    const ids = uniqueIds(index.topics.filter((t) => t.category === c).map((t) => index.topicQuestionIds[t.id] ?? []));
    const { answered, correct } = topicAccuracy(r, ids);
    out[c] = answered === 0 ? null : correct / answered;
  }
  return out;
}

export function daysUntil(examDate: string | undefined, today: number): number | null {
  const m = examDate === undefined ? null : /^(\d{4})-(\d{2})-(\d{2})$/.exec(examDate);
  if (!m) return null;
  const day = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / DAY_MS;
  return Number.isFinite(day) ? day - today : null;
}

export function isNewUser(r: LearningRecord): boolean {
  return !Object.keys(r.attempts).some((qid) => isAnswered(r, qid));
}

/** The new user's first group (DESIGN §6.1 「先做 20 题摸底」). */
export function baselineIds(r: LearningRecord, index: TodayIndex, dateKey: string): string[] {
  return pickNew(r, poolFromIndex(index), BASELINE_N, dateKey, { fillWeakTopics: false });
}

export function todayTerms(
  index: TodayIndex,
  firstIds: readonly string[] | null,
  weakest: string | null,
): TodayTermCard[] {
  const first = firstIds?.[0];
  const topic = first === undefined ? undefined : topicIndex(index).get(first);
  const cards = topic === undefined ? [] : (index.topicTerms[topic] ?? []);
  if (cards.length > 0) return cards.slice(0, 3);
  return weakest === null ? [] : (index.topicTerms[weakest] ?? []).slice(0, 3);
}

export function answeredCount(r: LearningRecord, index: TodayIndex): { answered: number; total: number } {
  const all = uniqueIds(Object.values(index.topicQuestionIds));
  return { answered: answeredIn(r, all), total: all.length };
}
