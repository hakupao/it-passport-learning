// Stage 7 Phase 3 (D-196 §0-1 / §0-5) — unit-end confirmation questions. Pure
// (no fs, no React); relative imports so client components can use it.
//
//   - pickConfirm: the unit's challenge_questions without chumon group members
//     (the practice page expands a member to its whole group); fewer than
//     CONFIRM_MIN → topped up in term order from the terms' past questions
//     (already non-fallback and member-free in the reader model), deduped, up to
//     CONFIRM_MIN; at most CONFIRM_MAX.
//   - orderConfirm: never answered → in the mistakes book (reviewState +
//     classify = "mistake", as the mistakes page) → the rest; given order kept
//     within each.
//   - pastCount: distinct past questions of the unit = confirm ∪ per-term quiz.

import type { LearningRecord } from "../learning/record";
import { classify, reviewState, toLocalDay } from "../learning/schedule";
import type { ReaderUnit } from "./reader";

const CONFIRM_MIN = 3;
const CONFIRM_MAX = 5;

/** The unit's confirmation question ids (§0-1). */
export function pickConfirm(unit: ReaderUnit, members: ReadonlySet<string>): string[] {
  const out: string[] = [];
  const add = (id: string) => {
    if (!members.has(id) && !out.includes(id)) out.push(id);
  };
  unit.challenge.forEach(add);
  for (const t of unit.terms) {
    for (const id of t.quiz) {
      if (out.length >= CONFIRM_MIN) break;
      add(id);
    }
  }
  return out.slice(0, CONFIRM_MAX);
}

/** Display order of the confirmation questions at `now` (§0-1). */
export function orderConfirm(ids: readonly string[], record: LearningRecord, now: number): string[] {
  const today = toLocalDay(now);
  const fresh: string[] = [];
  const mistakes: string[] = [];
  const rest: string[] = [];
  for (const id of ids) {
    const list = Object.prototype.hasOwnProperty.call(record.attempts, id) ? record.attempts[id]! : [];
    const s = reviewState(list, record.v2Since, id, toLocalDay);
    if (s === null) fresh.push(id);
    else if (classify(s, today) === "mistake") mistakes.push(id);
    else rest.push(id);
  }
  return [...fresh, ...mistakes, ...rest];
}

/** Distinct past questions shown in the unit (§0-5): confirm ∪ per-term quiz. */
export function pastCount(unit: ReaderUnit): number {
  return new Set([...pickConfirm(unit, new Set()), ...unit.terms.flatMap((t) => t.quiz)]).size;
}
