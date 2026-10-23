// Stage 7 Phase 1 Task 10 (D-189 §4 / D-190 §0-20) — the topic page's per-question rows and the
// single-question page's history, from the browser's learning record (pure; relative imports).
//
//   - questionRowState: ○ / × of the latest attempt (latestResult) and when the question comes
//     back: a date (dueDay > today), today (dueDay <= today), mastered (box 5); none when never
//     answered. A mistake answered wrong today comes back tomorrow.
//   - dayLabel: a day number (toLocalDay: the local calendar date encoded as UTC days) → "M/D",
//     read with UTC getters so the label is that calendar day in every time zone.
//   - topicAccuracy: answered / correct over the latest attempt of each of the ids.
//   - attemptHistory: the stored attempts (≤ ATTEMPTS_K = 10), newest first (compareAttempts).

import { ATTEMPTS_K, compareAttempts, latestResult, type Attempt, type LearningRecord } from "../learning/record";
import { reviewState, type ToDay } from "../learning/schedule";

const DAY_MS = 86_400_000;

export type RowNext = { kind: "date"; day: number } | { kind: "today" } | { kind: "mastered" };

export interface QuestionRowState {
  result: "right" | "wrong" | null;
  next: RowNext | null;
}

const own = (r: LearningRecord, qid: string): readonly Attempt[] =>
  Object.prototype.hasOwnProperty.call(r.attempts, qid) ? r.attempts[qid]! : [];

export function questionRowState(r: LearningRecord, qid: string, today: number, toDay: ToDay): QuestionRowState {
  const latest = latestResult(r, qid);
  if (latest === undefined) return { result: null, next: null };
  const s = reviewState(own(r, qid), r.v2Since, qid, toDay);
  const result = latest.correct ? "right" : "wrong";
  if (s === null) return { result, next: null };
  if (s.dueDay === null) return { result, next: { kind: "mastered" } };
  return { result, next: s.dueDay <= today ? { kind: "today" } : { kind: "date", day: s.dueDay } };
}

export function dayLabel(day: number): string {
  const d = new Date(day * DAY_MS);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export function topicAccuracy(r: LearningRecord, ids: readonly string[]): { answered: number; correct: number } {
  let answered = 0;
  let correct = 0;
  for (const id of ids) {
    const a = latestResult(r, id);
    if (a === undefined) continue;
    answered++;
    if (a.correct) correct++;
  }
  return { answered, correct };
}

export function attemptHistory(r: LearningRecord, qid: string): Attempt[] {
  return [...own(r, qid)].sort(compareAttempts).slice(0, ATTEMPTS_K);
}
