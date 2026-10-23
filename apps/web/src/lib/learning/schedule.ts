// Stage 7 Phase 1 (D-190 §0-5〜§0-9, DESIGN §5.4 / §5.5) — spaced-review
// scheduler and daily quotas. Pure functions over the v2 learning record; the
// today page / practice pages call them in the browser.
//
// Review state (per question, derived from its stored attempts — never stored):
//   - Attempts are walked oldest → newest (compareAttempts reversed) and grouped
//     by `toDay(at)`; only the first attempt of each day counts. Same-day repeats
//     stay stored and count towards leech, but never move the box.
//   - First counted day: wrong → box 0; correct → box 2 ("first answer right",
//     earliest attempt in the stored window). Later days: wrong → box 0,
//     correct → box + 1 (max 5). due = last counted day + BOX_INTERVALS[box];
//     box 5 = mastered, dueDay null.
//   - v1 spread (§0-6 / §5.5): when the earliest attempt is `src:"v1"`, correct
//     and `at < v2Since` (or v2Since absent), its due = toDay(v2Since ?? at) +
//     fnv1a32(qid) % 14 instead of +7, so old correct answers spread over the two
//     weeks after migration. Any later counted day schedules normally.
//   - mistake = some counted day was wrong and fewer than 2 counted correct days
//     follow the last wrong day. leech = >= LEECH_WRONG wrong attempts among the
//     stored window (all of them, same-day repeats included) — a flag, not a class.
// Classes (exclusive): mistake → mastered (box 5) → due (dueDay <= today) → scheduled.
//
// Daily plan (§0-7): reviewedToday = questions answered today that had an
// attempt before today; newToday = questions whose first attempt is today.
// Today's review queue = mistakes due <= today, then due reviews, each by
// (dueDay asc, qid asc), together capped at max(0, cap − reviewedToday).
// Chumon groups are not expanded in the review lists (the task-row href does
// that, §0-26); new questions come from pickNew, which does expand (§0-8).
//
// Imports are relative (not `@/`): e2e specs import learning modules by relative path.

import { fnv1a32, mulberry32 } from "../hash";
import { compareAttempts, settingValue, type Attempt, type LearningRecord } from "./record";

export const BOX_INTERVALS = [1, 3, 7, 14, 30] as const;
export const MASTERED_BOX = 5;
export const LEECH_WRONG = 4;
export const OFFICIAL_RATIO = { strategy: 35, management: 20, technology: 45 } as const;

/** Questions per topic that count as "has been tried" for the weak-topic fill (§0-9). */
const WEAK_FILL = 5;
const V1_SPREAD_DAYS = 14;
const DAY_MS = 86_400_000;

export type ToDay = (at: number) => number;
export type Box = 0 | 1 | 2 | 3 | 4 | 5;

/** Browser-local calendar day of `at` as a day number since 1970-01-01 (§0-5). */
export function toLocalDay(at: number): number {
  const d = new Date(at);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;
}

export interface ReviewState {
  box: Box;
  /** null when mastered (box 5) */
  dueDay: number | null;
  /** last counted day (= day of the latest attempt) */
  lastDay: number;
  /** day of the earliest stored attempt */
  firstDay: number;
  isMistake: boolean;
  isLeech: boolean;
  /** correct=false attempts among the stored window, same-day repeats included */
  wrongInWindow: number;
}

/** Review state of one question from its stored attempts; null when it has none. */
export function reviewState(
  attempts: readonly Attempt[],
  v2Since: number | undefined,
  qid: string,
  toDay: ToDay,
): ReviewState | null {
  if (attempts.length === 0) return null;
  const chrono = [...attempts].sort((x, y) => compareAttempts(y, x));
  const first = chrono[0]!;
  const v1Spread = first.src === "v1" && first.correct && (v2Since === undefined || first.at < v2Since);

  let box: Box = 0;
  let dueDay: number | null = null;
  let lastDay = Number.NEGATIVE_INFINITY;
  let hadWrong = false;
  let correctDaysSinceWrong = 0;
  for (const a of chrono) {
    const day = toDay(a.at);
    if (day === lastDay) continue; // same-day repeat: stored, not counted
    if (!a.correct) {
      box = 0;
      hadWrong = true;
      correctDaysSinceWrong = 0;
    } else {
      box = a === first ? 2 : (Math.min(MASTERED_BOX, box + 1) as Box);
      if (hadWrong) correctDaysSinceWrong++;
    }
    lastDay = day;
    if (box === MASTERED_BOX) dueDay = null;
    else if (a === first && v1Spread) dueDay = toDay(v2Since ?? a.at) + (fnv1a32(qid) % V1_SPREAD_DAYS);
    else dueDay = day + BOX_INTERVALS[box];
  }
  const wrongInWindow = attempts.reduce((n, a) => (a.correct ? n : n + 1), 0);
  return {
    box,
    dueDay,
    lastDay,
    firstDay: toDay(first.at),
    isMistake: hadWrong && correctDaysSinceWrong < 2,
    isLeech: wrongInWindow >= LEECH_WRONG,
    wrongInWindow,
  };
}

export type ReviewClass = "mistake" | "due" | "scheduled" | "mastered";

/** The one class of an answered question on `today` (DESIGN §5.4 table). */
export function classify(s: ReviewState, today: number): ReviewClass {
  if (s.isMistake) return "mistake";
  if (s.box === MASTERED_BOX || s.dueDay === null) return "mastered";
  return s.dueDay <= today ? "due" : "scheduled";
}

export interface QuestionPool {
  /** topicId → question ids */
  topicQuestionIds: Record<string, string[]>;
  /** chumon group key → member ids in question-number order */
  groups: Record<string, string[]>;
  topicStars: Record<string, 1 | 2 | 3>;
}

export interface DailyPlan {
  /** mistakes due <= today, earliest due first, ties by qid */
  mistakes: string[];
  /** due reviews, earliest due first, ties by qid */
  due: string[];
  /** new questions (pickNew, groups expanded) */
  fresh: string[];
  reviewedToday: number;
  newToday: number;
  reviewCap: number;
  newTarget: number;
}

const byDueThenId = (x: { id: string; due: number }, y: { id: string; due: number }): number =>
  x.due !== y.due ? x.due - y.due : x.id < y.id ? -1 : x.id > y.id ? 1 : 0;

/** Today's review queue and new questions (§0-6 / §0-7 / §5.4 每日量). `dateKey` = local YYYY-MM-DD. */
export function dailyPlan(
  r: LearningRecord,
  pool: QuestionPool,
  today: number,
  toDay: ToDay,
  dateKey: string,
): DailyPlan {
  const reviewCap = settingValue(r, "dailyReviewCap");
  const newTarget = settingValue(r, "dailyNewTarget");
  const mistakes: { id: string; due: number }[] = [];
  const due: { id: string; due: number }[] = [];
  let reviewedToday = 0;
  let newToday = 0;
  for (const [qid, list] of Object.entries(r.attempts)) {
    const s = reviewState(list, r.v2Since, qid, toDay);
    if (s === null) continue;
    if (s.firstDay === today) newToday++;
    else if (list.some((a) => toDay(a.at) === today)) reviewedToday++;
    const cls = classify(s, today);
    if (s.dueDay === null || s.dueDay > today) continue;
    if (cls === "mistake") mistakes.push({ id: qid, due: s.dueDay });
    else if (cls === "due") due.push({ id: qid, due: s.dueDay });
  }
  mistakes.sort(byDueThenId);
  due.sort(byDueThenId);
  const room = Math.max(0, reviewCap - reviewedToday);
  const takenMistakes = mistakes.slice(0, room).map((x) => x.id);
  const takenDue = due.slice(0, room - takenMistakes.length).map((x) => x.id);
  return {
    mistakes: takenMistakes,
    due: takenDue,
    fresh: pickNew(r, pool, Math.max(0, newTarget - newToday), dateKey),
    reviewedToday,
    newToday,
    reviewCap,
    newTarget,
  };
}

const groupIndex = (groups: Record<string, string[]>): Map<string, string[]> => {
  const m = new Map<string, string[]>();
  for (const members of Object.values(groups)) for (const id of members) if (!m.has(id)) m.set(id, members);
  return m;
};

/** Each id in a chumon group → its whole group in member order, at the first member's position; deduped. */
export function expandGroups(ids: readonly string[], groups: Record<string, string[]>): string[] {
  const byId = groupIndex(groups);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    for (const x of byId.get(id) ?? [id]) {
      if (seen.has(x)) continue;
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

type Category = keyof typeof OFFICIAL_RATIO;
const CATEGORIES = Object.keys(OFFICIAL_RATIO) as Category[];
const categoryOf = (topicId: string): string => topicId.split("-", 1)[0]!;

/** Draws ids uniformly at random from a bag; ids already taken elsewhere are skipped lazily. */
class Bag {
  private ids: string[];
  constructor(ids: readonly string[]) {
    this.ids = [...ids];
  }
  draw(rand: () => number, taken: ReadonlySet<string>): string | undefined {
    while (this.ids.length > 0) {
      const i = Math.floor(rand() * this.ids.length);
      const id = this.ids[i]!;
      this.ids[i] = this.ids[this.ids.length - 1]!;
      this.ids.pop();
      if (!taken.has(id)) return id;
    }
    return undefined;
  }
}

/**
 * Up to `n` new (never answered) questions, stable for a given `dateKey` (§0-9):
 * seed = fnv1a32(dateKey), PRNG mulberry32. With `fillWeakTopics` (default
 * true) topics with < 5 answered questions are filled first, one question per
 * topic per round (★ high → more questions → topic id), until each reaches 5;
 * the rest is drawn by category weight 35 : 20 : 45 (strategy : management :
 * technology), uniformly inside the category. A pick inside a chumon group pulls
 * the whole group in member order (members answered before included), counted
 * by member count, so the list may exceed `n` (§0-8).
 */
export function pickNew(
  r: LearningRecord,
  pool: QuestionPool,
  n: number,
  dateKey: string,
  opts?: { fillWeakTopics?: boolean },
): string[] {
  if (n <= 0) return [];
  const fillWeakTopics = opts?.fillWeakTopics ?? true;
  const rand = mulberry32(fnv1a32(dateKey));
  const answered = (id: string): boolean => Object.prototype.hasOwnProperty.call(r.attempts, id);
  const byId = groupIndex(pool.groups);
  const topicOf = new Map<string, string>();
  const topics = Object.keys(pool.topicQuestionIds).sort();
  for (const t of topics) for (const id of pool.topicQuestionIds[t]!) if (!topicOf.has(id)) topicOf.set(id, t);

  const out: string[] = [];
  const taken = new Set<string>();
  const filled = new Map<string, number>(); // topic → answered + picked
  for (const t of topics) filled.set(t, pool.topicQuestionIds[t]!.filter(answered).length);
  const take = (id: string): void => {
    for (const x of byId.get(id) ?? [id]) {
      if (taken.has(x)) continue;
      taken.add(x);
      out.push(x);
      const t = topicOf.get(x);
      if (t !== undefined && !answered(x)) filled.set(t, filled.get(t)! + 1);
    }
  };
  const fresh = (t: string): string[] => pool.topicQuestionIds[t]!.filter((id) => !answered(id));

  if (fillWeakTopics) {
    const stars = (t: string): number => pool.topicStars[t] ?? 1;
    const weak = topics
      .filter((t) => filled.get(t)! < WEAK_FILL)
      .sort((x, y) => {
        const s = stars(y) - stars(x);
        if (s !== 0) return s;
        const c = pool.topicQuestionIds[y]!.length - pool.topicQuestionIds[x]!.length;
        return c !== 0 ? c : x < y ? -1 : x > y ? 1 : 0;
      });
    const bags = new Map(weak.map((t) => [t, new Bag(fresh(t))]));
    let progressed = true;
    while (out.length < n && progressed) {
      progressed = false;
      for (const t of weak) {
        if (out.length >= n) break;
        if (filled.get(t)! >= WEAK_FILL) continue;
        const id = bags.get(t)!.draw(rand, taken);
        if (id === undefined) continue;
        take(id);
        progressed = true;
      }
    }
  }

  const catBags = new Map<string, Bag>();
  for (const c of CATEGORIES) catBags.set(c, new Bag(topics.filter((t) => categoryOf(t) === c).flatMap(fresh)));
  const live = new Set<Category>(CATEGORIES);
  while (out.length < n && live.size > 0) {
    const cats = CATEGORIES.filter((c) => live.has(c));
    let x = rand() * cats.reduce((s, c) => s + OFFICIAL_RATIO[c], 0);
    let cat = cats[cats.length - 1]!;
    for (const c of cats) {
      x -= OFFICIAL_RATIO[c];
      if (x < 0) {
        cat = c;
        break;
      }
    }
    const id = catBags.get(cat)!.draw(rand, taken);
    if (id === undefined) live.delete(cat);
    else take(id);
  }
  return out;
}
