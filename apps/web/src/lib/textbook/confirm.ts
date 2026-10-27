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
//   - confirmHref / nextRun (§0-2): the from=unit practice link and its click-time run nonce.

import type { LearningRecord } from "../learning/record";
import { classify, reviewState, toLocalDay } from "../learning/schedule";
import type { ChumonMembers } from "../practice/chumonMembers";
import type { ReaderUnit } from "./reader";

const CONFIRM_MIN = 3;
const CONFIRM_MAX = 5;

/** The unit's confirmation question ids (§0-1). */
export function pickConfirm(unit: ReaderUnit, members: ChumonMembers): string[] {
  return select(unit, (id) => members.has(id));
}

function select(unit: ReaderUnit, isMember: (id: string) => boolean): string[] {
  const out: string[] = [];
  const add = (id: string) => {
    if (!isMember(id) && !out.includes(id)) out.push(id);
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

/**
 * Display order of the confirmation questions at `now` (§0-1). Browser only: the
 * mistake / never-answered split uses the browser-local day (toLocalDay) and the
 * local learning record, so call it after mount, never during SSR.
 */
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
  // No member filter here: normalizeUnit already dropped every chumon group member from
  // `challenge` and each term's `quiz` (ReaderUnit invariant), so select() needs none.
  return new Set([...select(unit, () => false), ...unit.terms.flatMap((t) => t.quiz)]).size;
}

/**
 * The practice link of a unit's question set (§0-2): `from=unit&unit=<id>` (the summary returns
 * to the unit), `at=<termId>` for a term's past questions (the summary returns to that term, not
 * to #confirm) and, when given, the click-time `run` nonce (a new group each time).
 */
export function confirmHref(ids: readonly string[], unitId: string, run: string | null, at: string | null = null): string {
  const atPart = at !== null ? `&at=${at}` : "";
  return `/practice?ids=${ids.join(",")}&from=unit&unit=${unitId}${atPart}${run !== null ? `&run=${run}` : ""}`;
}

/** The run nonce of a click at `now` (epoch ms): strictly above the previous one, so two clicks never share it. */
export function nextRun(prev: string | null, now: number): string {
  return String(prev !== null ? Math.max(now, Number(prev) + 1) : now);
}
