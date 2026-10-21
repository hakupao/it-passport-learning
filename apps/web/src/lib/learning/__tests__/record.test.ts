// Stage 6 Phase 3 (D-180 §0-6) — pure learning-record model.
//
// Guards: merge is commutative / associative / idempotent (per question the
// larger `at` wins, ties → lexicographically larger `choice`, then
// correct=false; unitsRead keeps the earliest first-read), updates never
// mutate their input, parseRecord is a never-throwing trust boundary, and
// per-topic stats count only questions of the given set.

import { describe, expect, it } from "vitest";

import {
  LEARNING_STORAGE_KEY,
  emptyRecord,
  markUnitRead,
  mergeRecords,
  parseRecord,
  recordAnswer,
  topicStats,
  type LearningRecord,
} from "../record";

const rec = (
  questions: LearningRecord["questions"] = {},
  unitsRead: LearningRecord["unitsRead"] = {},
): LearningRecord => ({ v: 1, questions, unitsRead });

const a = rec(
  {
    q1: { choice: "ア", correct: false, at: 100 },
    q2: { choice: "イ", correct: true, at: 300 },
    q3: { choice: "ウ", correct: true, at: 50 },
  },
  { u1: 10, u2: 40 },
);
const b = rec(
  {
    q1: { choice: "エ", correct: true, at: 200 },
    q2: { choice: "ア", correct: false, at: 300 },
    q4: { choice: "イ", correct: false, at: 70 },
  },
  { u1: 20, u3: 5 },
);
const c = rec(
  {
    q1: { choice: "イ", correct: false, at: 150 },
    q2: { choice: "ウ", correct: true, at: 300 },
    q5: { choice: "ア", correct: true, at: 1 },
  },
  { u2: 30, u3: 9, u4: 1 },
);

describe("constants / emptyRecord", () => {
  it("uses the locked storage key and an empty v1 record", () => {
    expect(LEARNING_STORAGE_KEY).toBe("itp:learn:v1");
    expect(emptyRecord()).toEqual({ v: 1, questions: {}, unitsRead: {} });
    expect(emptyRecord()).not.toBe(emptyRecord());
  });
});

describe("recordAnswer", () => {
  it("stores the latest result without mutating the input", () => {
    const r0 = rec({ q1: { choice: "ア", correct: false, at: 100 } });
    const snapshot = structuredClone(r0);
    const r1 = recordAnswer(r0, "q1", "イ", true, 200);
    const r2 = recordAnswer(r1, "q2", "ウ", false, 300);
    expect(r0).toEqual(snapshot);
    expect(r1.questions.q1).toEqual({ choice: "イ", correct: true, at: 200 });
    expect(r2.questions).toEqual({
      q1: { choice: "イ", correct: true, at: 200 },
      q2: { choice: "ウ", correct: false, at: 300 },
    });
  });

  it("treats __proto__ as an ordinary key (no prototype pollution)", () => {
    const r = recordAnswer(emptyRecord(), "__proto__", "ア", true, 1);
    expect(Object.keys(r.questions)).toEqual(["__proto__"]);
    expect(Object.getPrototypeOf(r.questions)).toBe(Object.prototype);
  });
});

describe("markUnitRead", () => {
  it("records the first read and keeps an existing value", () => {
    const r0 = emptyRecord();
    const r1 = markUnitRead(r0, "u1", 100);
    const r2 = markUnitRead(r1, "u1", 999);
    expect(r0.unitsRead).toEqual({});
    expect(r1.unitsRead).toEqual({ u1: 100 });
    expect(r2.unitsRead).toEqual({ u1: 100 });
  });
});

describe("non-finite at is a caller bug", () => {
  it("recordAnswer and markUnitRead throw RangeError for NaN / ±Infinity", () => {
    for (const at of [NaN, Infinity, -Infinity]) {
      expect(() => recordAnswer(emptyRecord(), "q1", "ア", true, at)).toThrow(RangeError);
      expect(() => markUnitRead(emptyRecord(), "u1", at)).toThrow(RangeError);
    }
  });

  it("recordAnswer and markUnitRead throw RangeError for a negative at (parseRecord rejects it too)", () => {
    for (const at of [-1, -0.5]) {
      expect(() => recordAnswer(emptyRecord(), "q1", "ア", true, at)).toThrow(RangeError);
      expect(() => markUnitRead(emptyRecord(), "u1", at)).toThrow(RangeError);
    }
    expect(recordAnswer(emptyRecord(), "q1", "ア", true, 0).questions.q1!.at).toBe(0);
    expect(markUnitRead(emptyRecord(), "u1", 0).unitsRead.u1).toBe(0);
  });

  it("markUnitRead rejects a non-finite at even when the unit is already read", () => {
    const r = markUnitRead(emptyRecord(), "u1", 100);
    expect(() => markUnitRead(r, "u1", NaN)).toThrow(RangeError);
  });
});

describe("mergeRecords", () => {
  it("is commutative", () => {
    expect(mergeRecords(a, b)).toEqual(mergeRecords(b, a));
    expect(mergeRecords(a, c)).toEqual(mergeRecords(c, a));
    expect(mergeRecords(b, c)).toEqual(mergeRecords(c, b));
  });

  it("is idempotent", () => {
    expect(mergeRecords(a, a)).toEqual(a);
    expect(mergeRecords(b, b)).toEqual(b);
    const ab = mergeRecords(a, b);
    expect(mergeRecords(ab, b)).toEqual(ab);
  });

  it("is associative", () => {
    expect(mergeRecords(mergeRecords(a, b), c)).toEqual(mergeRecords(a, mergeRecords(b, c)));
    expect(mergeRecords(mergeRecords(c, a), b)).toEqual(mergeRecords(c, mergeRecords(a, b)));
  });

  it("keeps the result with the larger at", () => {
    const wrong = rec({ q: { choice: "ア", correct: false, at: 100 } });
    const right = rec({ q: { choice: "イ", correct: true, at: 200 } });
    expect(mergeRecords(wrong, right).questions.q).toEqual({ choice: "イ", correct: true, at: 200 });
    expect(mergeRecords(right, wrong).questions.q).toEqual({ choice: "イ", correct: true, at: 200 });
  });

  it("on equal at keeps the lexicographically larger choice", () => {
    const x = rec({ q: { choice: "ア", correct: true, at: 100 } });
    const y = rec({ q: { choice: "イ", correct: false, at: 100 } });
    expect(mergeRecords(x, y).questions.q).toEqual({ choice: "イ", correct: false, at: 100 });
    expect(mergeRecords(y, x).questions.q).toEqual({ choice: "イ", correct: false, at: 100 });
  });

  it("on equal at and choice prefers correct=false, order-independently", () => {
    const t = rec({ q: { choice: "ア", correct: true, at: 100 } });
    const f = rec({ q: { choice: "ア", correct: false, at: 100 } });
    expect(mergeRecords(t, f).questions.q).toEqual({ choice: "ア", correct: false, at: 100 });
    expect(mergeRecords(f, t).questions.q).toEqual({ choice: "ア", correct: false, at: 100 });
  });

  it("unions questions and keeps the smaller unitsRead value", () => {
    const m = mergeRecords(a, b);
    expect(Object.keys(m.questions).sort()).toEqual(["q1", "q2", "q3", "q4"]);
    expect(m.questions.q1).toEqual({ choice: "エ", correct: true, at: 200 });
    expect(m.questions.q2).toEqual({ choice: "イ", correct: true, at: 300 });
    expect(m.unitsRead).toEqual({ u1: 10, u2: 40, u3: 5 });
  });

  it("does not mutate its inputs", () => {
    const sa = structuredClone(a);
    const sb = structuredClone(b);
    mergeRecords(a, b);
    expect(a).toEqual(sa);
    expect(b).toEqual(sb);
  });

  it("produces canonical output: same JSON regardless of argument or insertion order", () => {
    const x = rec(
      { q9: { choice: "ア", correct: true, at: 1 }, q1: { choice: "イ", correct: false, at: 2 } },
      { u9: 1, u1: 2 },
    );
    const y = rec(
      { q5: { choice: "ウ", correct: true, at: 3 }, q0: { choice: "エ", correct: true, at: 4 } },
      { u5: 3, u0: 4 },
    );
    expect(JSON.stringify(mergeRecords(x, y))).toBe(JSON.stringify(mergeRecords(y, x)));
    expect(JSON.stringify(mergeRecords(a, b))).toBe(JSON.stringify(mergeRecords(b, a)));
    const m = mergeRecords(x, y);
    expect(Object.keys(m.questions)).toEqual(["q0", "q1", "q5", "q9"]);
    expect(Object.keys(m.unitsRead)).toEqual(["u0", "u1", "u5", "u9"]);
  });
});

describe("parseRecord", () => {
  it("accepts a valid record and round-trips JSON", () => {
    expect(parseRecord(JSON.parse(JSON.stringify(a)))).toEqual(a);
    expect(parseRecord(emptyRecord())).toEqual(emptyRecord());
  });

  it("rejects a wrong version or non-object input", () => {
    expect(parseRecord({ v: 2 })).toBeNull();
    expect(parseRecord({ v: "1", questions: {}, unitsRead: {} })).toBeNull();
    expect(parseRecord(null)).toBeNull();
    expect(parseRecord(undefined)).toBeNull();
    expect(parseRecord("x")).toBeNull();
    expect(parseRecord(1)).toBeNull();
    expect(parseRecord([])).toBeNull();
  });

  it("rejects wrong field types inside questions", () => {
    expect(
      parseRecord({ v: 1, questions: { q: { choice: "ア", correct: "yes", at: 1 } }, unitsRead: {} }),
    ).toBeNull();
    expect(parseRecord({ v: 1, questions: { q: { choice: 1, correct: true, at: 1 } }, unitsRead: {} })).toBeNull();
    expect(parseRecord({ v: 1, questions: { q: { choice: "ア", correct: true } }, unitsRead: {} })).toBeNull();
    expect(parseRecord({ v: 1, questions: { q: null }, unitsRead: {} })).toBeNull();
    expect(parseRecord({ v: 1, questions: { q: "ア" }, unitsRead: {} })).toBeNull();
  });

  it("rejects non-finite or negative timestamps", () => {
    for (const at of [Number.NaN, Infinity, -1, "1"]) {
      expect(parseRecord({ v: 1, questions: { q: { choice: "ア", correct: true, at } }, unitsRead: {} })).toBeNull();
      expect(parseRecord({ v: 1, questions: {}, unitsRead: { u: at } })).toBeNull();
    }
  });

  it("rejects non-object maps", () => {
    expect(parseRecord({ v: 1, questions: [], unitsRead: {} })).toBeNull();
    expect(parseRecord({ v: 1, questions: {}, unitsRead: [] })).toBeNull();
    expect(parseRecord({ v: 1, questions: null, unitsRead: {} })).toBeNull();
    expect(parseRecord({ v: 1, questions: {} })).toBeNull();
    expect(parseRecord({ v: 1, unitsRead: {} })).toBeNull();
  });

  it("returns a fresh copy without unknown fields", () => {
    const input = {
      v: 1,
      extra: true,
      questions: { q: { choice: "ア", correct: true, at: 5, junk: 1 } },
      unitsRead: { u: 3 },
    };
    const out = parseRecord(input);
    expect(out).toEqual({ v: 1, questions: { q: { choice: "ア", correct: true, at: 5 } }, unitsRead: { u: 3 } });
    expect(out?.questions).not.toBe(input.questions);
  });

  it("keeps a JSON __proto__ key as data without polluting prototypes", () => {
    const out = parseRecord(
      JSON.parse('{"v":1,"questions":{"__proto__":{"choice":"ア","correct":true,"at":1}},"unitsRead":{}}'),
    );
    expect(out).not.toBeNull();
    expect(Object.keys(out!.questions)).toEqual(["__proto__"]);
    expect(Object.getPrototypeOf(out!.questions)).toBe(Object.prototype);
  });
});

describe("topicStats", () => {
  it("counts total / answered / correct per topic", () => {
    const r = rec({
      t1a: { choice: "ア", correct: true, at: 1 },
      t1b: { choice: "イ", correct: false, at: 2 },
      t2a: { choice: "ウ", correct: true, at: 3 },
      other: { choice: "ア", correct: true, at: 4 },
    });
    const stats = topicStats(r, [
      { id: "t1a", topic_id: "T1" },
      { id: "t1b", topic_id: "T1" },
      { id: "t1c", topic_id: "T1" },
      { id: "t2a", topic_id: "T2" },
      { id: "t3a", topic_id: "T3" },
    ]);
    expect(stats.get("T1")).toEqual({ topicId: "T1", total: 3, answered: 2, correct: 1 });
    expect(stats.get("T2")).toEqual({ topicId: "T2", total: 1, answered: 1, correct: 1 });
    expect(stats.get("T3")).toEqual({ topicId: "T3", total: 1, answered: 0, correct: 0 });
    expect([...stats.keys()]).toEqual(["T1", "T2", "T3"]);
  });

  it("ignores inherited properties when matching question ids", () => {
    const stats = topicStats(emptyRecord(), [{ id: "constructor", topic_id: "T" }]);
    expect(stats.get("T")).toEqual({ topicId: "T", total: 1, answered: 0, correct: 0 });
  });
});
