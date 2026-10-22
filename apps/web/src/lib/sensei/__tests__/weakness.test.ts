import { describe, expect, it } from "vitest";

import { emptyRecord, type LearningRecord, type QuestionResult } from "@/lib/learning/record";

import { weakTopics } from "../weakness";

/** A record holding `[qid, correct]` results (choice / at are irrelevant to weakTopics). */
function rec(results: [string, boolean][]): LearningRecord {
  const questions: Record<string, QuestionResult> = {};
  results.forEach(([qid, correct], i) => {
    questions[qid] = { choice: "ア", correct, at: 1000 + i };
  });
  return { v: 1, questions, unitsRead: {} };
}

const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}-q${String(i + 1).padStart(3, "0")}`);
/** `correct` of the first `answered` ids of `prefix` are true, the rest of those answered false. */
const answers = (prefix: string, answered: number, correct: number): [string, boolean][] =>
  ids(prefix, answered).map((id, i) => [id, i < correct]);

const TOPICS: Record<string, string[]> = {
  a: ids("a", 10),
  b: ids("b", 10),
  c: ids("c", 10),
  d: ids("d", 10),
  e: ids("e", 10),
};

describe("weakTopics", () => {
  it("an empty record has no weak topic", () => {
    expect(weakTopics(emptyRecord(), TOPICS)).toEqual([]);
  });

  it("a topic with fewer than 5 answers is not picked", () => {
    const r = rec([...answers("a", 4, 0), ...answers("b", 5, 1)]);
    expect(weakTopics(r, TOPICS)).toEqual([{ topicId: "b", answered: 5, correct: 1, rate: 0.2 }]);
  });

  it("a topic answered all correct is not picked", () => {
    const r = rec([...answers("a", 8, 8), ...answers("b", 6, 5)]);
    expect(weakTopics(r, TOPICS).map((w) => w.topicId)).toEqual(["b"]);
  });

  it("sorts by rate ascending, then answered descending, then topicId; keeps the top 3", () => {
    const r = rec([
      ...answers("e", 5, 1), // 0.2, 5 answered
      ...answers("d", 10, 2), // 0.2, 10 answered → before e
      ...answers("c", 5, 4), // 0.8
      ...answers("b", 5, 1), // 0.2, 5 answered, "b" < "e"
      ...answers("a", 6, 0), // 0
    ]);
    expect(weakTopics(r, TOPICS)).toEqual([
      { topicId: "a", answered: 6, correct: 0, rate: 0 },
      { topicId: "d", answered: 10, correct: 2, rate: 0.2 },
      { topicId: "b", answered: 5, correct: 1, rate: 0.2 },
    ]);
  });

  it("the order does not depend on topic or record key order", () => {
    const results = [...answers("e", 5, 1), ...answers("b", 5, 1), ...answers("d", 5, 1)];
    const reversedTopics = Object.fromEntries(Object.entries(TOPICS).reverse());
    const a = weakTopics(rec(results), TOPICS);
    const b = weakTopics(rec([...results].reverse()), reversedTopics);
    expect(a).toEqual(b);
    expect(a.map((w) => w.topicId)).toEqual(["b", "d", "e"]);
  });

  it("uses the stored `correct` verdict and ignores answers outside the given topics", () => {
    const r = rec([...answers("a", 5, 2), ["zz-q001", false], ["zz-q002", false]]);
    expect(weakTopics(r, TOPICS)).toEqual([{ topicId: "a", answered: 5, correct: 2, rate: 0.4 }]);
  });

  it("honours minAnswered and limit", () => {
    const r = rec([...answers("a", 3, 0), ...answers("b", 5, 1), ...answers("c", 5, 2)]);
    expect(weakTopics(r, TOPICS, { minAnswered: 3 }).map((w) => w.topicId)).toEqual(["a", "b", "c"]);
    expect(weakTopics(r, TOPICS, { minAnswered: 3, limit: 1 }).map((w) => w.topicId)).toEqual(["a"]);
  });
});
