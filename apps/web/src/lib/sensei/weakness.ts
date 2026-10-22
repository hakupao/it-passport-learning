// D-181 Phase B Task B1 — weak-topic detection for the AI 先生 review card on the
// quiz landing. Pure: record + each topic's question ids → the weakest topics.
//
// The landing has no correct_answer, so this uses the record's stored `correct`
// (the verdict at answer time) as an approximation; the review anchor built on the
// topic set page re-judges every answer against the current correct_answer.
//
// A topic qualifies with at least `minAnswered` (5) answers and at least one
// wrong one. Order: rate ascending, then answered descending (more evidence
// first), then topicId — independent of record / topic key order.

import { topicStats, type LearningRecord } from "@/lib/learning/record";

export interface WeakTopic {
  topicId: string;
  answered: number;
  correct: number;
  /** correct / answered */
  rate: number;
}

export const WEAK_MIN_ANSWERED = 5;
export const WEAK_LIMIT = 3;

function stats(record: LearningRecord, topicIds: Record<string, string[]>) {
  const questions = Object.entries(topicIds).flatMap(([topic_id, ids]) => ids.map((id) => ({ id, topic_id })));
  return [...topicStats(record, questions).values()];
}

/** Whether any topic has at least `minAnswered` answers (the card then says "all correct"
 *  rather than "answer 5 in a topic" when no topic is weak). */
export function hasQualifyingTopic(
  record: LearningRecord,
  topicIds: Record<string, string[]>,
  minAnswered: number = WEAK_MIN_ANSWERED,
): boolean {
  return stats(record, topicIds).some((s) => s.answered >= minAnswered);
}

export function weakTopics(
  record: LearningRecord,
  topicIds: Record<string, string[]>,
  opts: { minAnswered?: number; limit?: number } = {},
): WeakTopic[] {
  const minAnswered = opts.minAnswered ?? WEAK_MIN_ANSWERED;
  const limit = opts.limit ?? WEAK_LIMIT;
  const weak: WeakTopic[] = [];
  for (const s of stats(record, topicIds)) {
    if (s.answered < minAnswered || s.correct >= s.answered) continue;
    weak.push({ topicId: s.topicId, answered: s.answered, correct: s.correct, rate: s.correct / s.answered });
  }
  weak.sort(
    (x, y) =>
      x.rate - y.rate ||
      y.answered - x.answered ||
      (x.topicId < y.topicId ? -1 : x.topicId > y.topicId ? 1 : 0),
  );
  return weak.slice(0, limit);
}
