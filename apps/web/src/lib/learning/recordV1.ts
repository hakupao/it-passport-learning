// D-180 §0-6 / D-190 §0-1 / §0-3 / §0-4 — what is left of learning record v1
// after Stage 7 moved the app to record v2 (./record): the v1 schema, its
// storage key and trust-boundary parser, and the v1 ⇄ v2 bridge (upgradeV1 /
// downgradeToV1 / parseAnyRecord) — the one shared pure implementation used by
// the client (localStore reads the itp:learn:v1 key old tabs still write) and
// the server (route / syncStore: v1 PUT / GET and the learn:owner:v1 doc).
// No I/O, no React. This module imports ./record; ./record never imports this
// one. The old v1 model and sync client survive only as a frozen test helper
// (__tests__/v1Client.ts) that plays an old tab against the route.
//
// Maps are always built with spread / Object.fromEntries (CreateDataProperty),
// so a "__proto__" key stays ordinary data and never touches the prototype.
// Runtime imports stay relative: e2e specs import ./record by relative path.

import {
  emptyRecord as emptyRecordV2,
  encodeRecord as encodeRecordV2,
  isChoiceLetter,
  latestResult,
  mergeRecords as mergeRecordsV2,
  parseRecord as parseRecordV2,
  type Attempt,
  type LearningRecord as LearningRecordV2,
} from "./record";

export interface QuestionResultV1 {
  choice: string;
  correct: boolean;
  /** epoch ms */
  at: number;
}

export interface LearningRecordV1 {
  v: 1;
  questions: Record<string, QuestionResultV1>;
  /** unitId → epoch ms of the first read */
  unitsRead: Record<string, number>;
}

/** The v1 localStorage key: old tabs still write it; the v2 client only reads it. */
export const LEARNING_V1_STORAGE_KEY = "itp:learn:v1";

/** `at` must be finite, non-negative epoch ms; anything else is a caller bug. */
function assertFiniteAt(at: number): void {
  if (!Number.isFinite(at) || at < 0) {
    throw new RangeError(`learning record: at must be finite non-negative epoch ms, got ${at}`);
  }
}

const isMap = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const isTime = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x) && x >= 0;

const sortedObject = <T>(entries: [string, T][]): Record<string, T> =>
  Object.fromEntries(entries.sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)));

/**
 * v1 trust boundary for localStorage / network data. Returns a fresh,
 * normalized record (unknown fields dropped), or null when anything does not
 * match the schema. Never throws.
 */
export function parseRecordV1(x: unknown): LearningRecordV1 | null {
  if (!isMap(x) || x.v !== 1 || !isMap(x.questions) || !isMap(x.unitsRead)) return null;
  const questions: [string, QuestionResultV1][] = [];
  for (const [k, q] of Object.entries(x.questions)) {
    if (!isMap(q) || typeof q.choice !== "string" || typeof q.correct !== "boolean" || !isTime(q.at)) {
      return null;
    }
    questions.push([k, { choice: q.choice, correct: q.correct, at: q.at }]);
  }
  const unitsRead: [string, number][] = [];
  for (const [k, t] of Object.entries(x.unitsRead)) {
    if (!isTime(t)) return null;
    unitsRead.push([k, t]);
  }
  return { v: 1, questions: Object.fromEntries(questions), unitsRead: Object.fromEntries(unitsRead) };
}

/**
 * v1 → v2: each question's answer becomes one attempt with src "v1" (answers
 * whose choice is not ア/イ/ウ/エ are dropped), unitsRead is kept, settings are
 * empty and v2Since = `now`. Canonical output; `r1` is untouched. `now` is
 * finite, non-negative epoch ms — anything else throws RangeError.
 */
export function upgradeV1(r1: LearningRecordV1, now: number): LearningRecordV2 {
  assertFiniteAt(now);
  const attempts: [string, Attempt[]][] = [];
  for (const [k, q] of Object.entries(r1.questions)) {
    if (isChoiceLetter(q.choice)) attempts.push([k, [{ at: q.at, choice: q.choice, correct: q.correct, src: "v1" }]]);
  }
  return mergeRecordsV2(
    {
      v: 2,
      attempts: Object.fromEntries(attempts),
      unitsRead: Object.fromEntries(Object.entries(r1.unitsRead)),
      settings: {},
      v2Since: now,
    },
    emptyRecordV2(),
  );
}

/**
 * v2 → v1 (for v1 clients): each question's first attempt in the v2 total order
 * becomes its `{ choice, correct, at }`; unitsRead is kept; settings and v2Since
 * have no v1 form and are dropped. Canonical (key-sorted) output.
 */
export function downgradeToV1(r: LearningRecordV2): LearningRecordV1 {
  const questions: [string, QuestionResultV1][] = [];
  for (const k of Object.keys(r.attempts)) {
    const x = latestResult(r, k);
    if (x) questions.push([k, { choice: x.choice, correct: x.correct, at: x.at }]);
  }
  return { v: 1, questions: sortedObject(questions), unitsRead: sortedObject(Object.entries(r.unitsRead)) };
}

/**
 * Parse either a v2 wire record or a v1 record (upgraded with v2Since = `now`),
 * reporting which one it was; null when it is neither. A v1 record whose
 * upgrade is not itself a valid v2 record (v1 accepts any finite time, v2 caps
 * times at 8.64e15) is null too — otherwise it would be stored and then fail
 * every later read as corrupt. Never throws on `x`.
 */
export function parseAnyRecord(x: unknown, now: number): { record: LearningRecordV2; version: 1 | 2 } | null {
  const r2 = parseRecordV2(x);
  if (r2) return { record: r2, version: 2 };
  const r1 = parseRecordV1(x);
  if (!r1) return null;
  const up = parseRecordV2(encodeRecordV2(upgradeV1(r1, now)));
  return up ? { record: up, version: 1 } : null;
}
