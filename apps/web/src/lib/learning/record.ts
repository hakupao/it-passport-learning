// Stage 6 Phase 3 (D-180 §0-6) — pure learning-record model: schema, updates,
// merge, trust-boundary parsing and per-topic stats. No I/O, no React; safe to
// import from client components.
//
// Merge is a per-key max over a total order, so it is commutative, associative
// and idempotent (local ⇄ server sync can merge in any order):
//   - questions: larger `at` wins; equal `at` → lexicographically larger
//     `choice`; equal `choice` too → correct=false (conservative for corrupt data).
//   - unitsRead: the smaller (earliest first-read) value wins.
//
// Maps are always built with spread / Object.fromEntries (CreateDataProperty),
// so a "__proto__" key stays ordinary data and never touches the prototype.

import type { QuizQuestion } from "@/lib/quiz/quizModel";

export interface QuestionResult {
  choice: string;
  correct: boolean;
  /** epoch ms */
  at: number;
}

export interface LearningRecord {
  v: 1;
  questions: Record<string, QuestionResult>;
  /** unitId → epoch ms of the first read */
  unitsRead: Record<string, number>;
}

export interface TopicStat {
  topicId: string;
  total: number;
  answered: number;
  correct: number;
}

export const LEARNING_STORAGE_KEY = "itp:learn:v1";

const hasOwn = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

export function emptyRecord(): LearningRecord {
  return { v: 1, questions: {}, unitsRead: {} };
}

/** Store the latest result for `qid`. Returns a new record; `r` is untouched. */
export function recordAnswer(
  r: LearningRecord,
  qid: string,
  choice: string,
  correct: boolean,
  at: number,
): LearningRecord {
  return { ...r, questions: { ...r.questions, [qid]: { choice, correct, at } } };
}

/** Record the first read of `unitId`; an existing value is kept (returns `r` as-is). */
export function markUnitRead(r: LearningRecord, unitId: string, at: number): LearningRecord {
  if (hasOwn(r.unitsRead, unitId)) return r;
  return { ...r, unitsRead: { ...r.unitsRead, [unitId]: at } };
}

/** True when `x` ranks above `y` in the merge order. */
function wins(x: QuestionResult, y: QuestionResult): boolean {
  if (x.at !== y.at) return x.at > y.at;
  if (x.choice !== y.choice) return x.choice > y.choice;
  return !x.correct && y.correct;
}

export function mergeRecords(a: LearningRecord, b: LearningRecord): LearningRecord {
  const questions = new Map(Object.entries(a.questions));
  for (const [k, y] of Object.entries(b.questions)) {
    const x = questions.get(k);
    if (x === undefined || wins(y, x)) questions.set(k, y);
  }
  const unitsRead = new Map(Object.entries(a.unitsRead));
  for (const [k, y] of Object.entries(b.unitsRead)) {
    const x = unitsRead.get(k);
    if (x === undefined || y < x) unitsRead.set(k, y);
  }
  return { v: 1, questions: Object.fromEntries(questions), unitsRead: Object.fromEntries(unitsRead) };
}

const isMap = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const isTime = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x) && x >= 0;

/**
 * Trust boundary for localStorage / network data. Returns a fresh, normalized
 * record (unknown fields dropped), or null when anything does not match the
 * schema. Never throws.
 */
export function parseRecord(x: unknown): LearningRecord | null {
  if (!isMap(x) || x.v !== 1 || !isMap(x.questions) || !isMap(x.unitsRead)) return null;
  const questions: [string, QuestionResult][] = [];
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

/** Per-topic totals over `questions` (insertion order = first appearance of each topic). */
export function topicStats(
  r: LearningRecord,
  questions: Pick<QuizQuestion, "id" | "topic_id">[],
): Map<string, TopicStat> {
  const stats = new Map<string, TopicStat>();
  for (const { id, topic_id } of questions) {
    let s = stats.get(topic_id);
    if (!s) {
      s = { topicId: topic_id, total: 0, answered: 0, correct: 0 };
      stats.set(topic_id, s);
    }
    s.total++;
    const res = hasOwn(r.questions, id) ? r.questions[id] : undefined;
    if (res) {
      s.answered++;
      if (res.correct) s.correct++;
    }
  }
  return stats;
}
