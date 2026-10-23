// Stage 6 Phase 3 (D-180 §0-6) — pure learning-record model.
//
// Guards: merge is commutative / associative / idempotent (per question the
// larger `at` wins, ties → lexicographically larger `choice`, then
// correct=false; unitsRead keeps the earliest first-read), updates never
// mutate their input, parseRecord is a never-throwing trust boundary, and
// per-topic stats count only questions of the given set.
//
// Stage 7 (D-190 §0-1 / §0-4): the v1 → v2 bridge — upgradeV1 (one "v1"
// attempt per letter answer, v2Since = now), downgradeToV1 (first attempt in
// the v2 total order) and parseAnyRecord (v2 wire or v1 JSON).

import { describe, expect, it } from "vitest";

import {
  encodeRecord,
  emptyRecord as emptyV2,
  parseRecord as parseV2,
  type Attempt,
  type LearningRecord as LearningRecordV2,
} from "../record";
import {
  LEARNING_STORAGE_KEY,
  LEARNING_V1_STORAGE_KEY,
  canonicalJson,
  deltaSince,
  downgradeToV1,
  emptyRecord,
  markUnitRead,
  mergeIfChanged,
  mergeRecords,
  parseAnyRecord,
  parseRecord,
  parseRecordV1,
  recordAnswer,
  topicStats,
  upgradeV1,
  type LearningRecord,
} from "../recordV1";

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

describe("recordAnswer on a skewed clock (re-answer on this device wins)", () => {
  it("a re-answer with an earlier clock still gets at = previous at + 1", () => {
    const r1 = recordAnswer(emptyRecord(), "q1", "ア", false, 5000);
    const r2 = recordAnswer(r1, "q1", "イ", true, 1000); // clock went back 4 s
    expect(r2.questions.q1).toEqual({ choice: "イ", correct: true, at: 5001 });
    // ...so merging it with the previous answer (e.g. the server's copy) keeps the re-answer.
    expect(mergeRecords(r1, r2).questions.q1).toEqual(r2.questions.q1);
    expect(mergeRecords(r2, r1).questions.q1).toEqual(r2.questions.q1);
  });

  it("an equal clock reading also moves forward by 1; a later clock is kept as-is", () => {
    const r1 = recordAnswer(emptyRecord(), "q1", "ア", false, 5000);
    expect(recordAnswer(r1, "q1", "ア", false, 5000).questions.q1!.at).toBe(5001);
    expect(recordAnswer(r1, "q1", "ウ", false, 9000).questions.q1!.at).toBe(9000);
    // other questions do not affect each other
    expect(recordAnswer(r1, "q2", "ウ", false, 10).questions.q2!.at).toBe(10);
  });

  it("an inherited key name (__proto__) has no previous answer", () => {
    expect(recordAnswer(emptyRecord(), "__proto__", "ア", true, 0).questions["__proto__"]!.at).toBe(0);
    expect(recordAnswer(emptyRecord(), "toString", "ア", true, 7).questions["toString"]!.at).toBe(7);
  });
});

describe("mergeIfChanged", () => {
  it("returns prev itself when the other record adds nothing", () => {
    const merged = mergeRecords(a, b);
    expect(mergeIfChanged(merged, b)).toBe(merged);
    expect(mergeIfChanged(merged, a)).toBe(merged);
    expect(mergeIfChanged(merged, emptyRecord())).toBe(merged);
    // same content, different key order / object identity → still prev
    const shuffled = rec(Object.fromEntries(Object.entries(merged.questions).reverse()), merged.unitsRead);
    expect(mergeIfChanged(shuffled, merged)).toBe(shuffled);
  });

  it("returns the merged record when the other record has something new", () => {
    const out = mergeIfChanged(a, b);
    expect(out).not.toBe(a);
    expect(out).toEqual(mergeRecords(a, b));
  });
});

describe("canonicalJson", () => {
  it("is independent of key order", () => {
    expect(canonicalJson(rec({ y: a.questions.q1!, x: a.questions.q2! }, { u2: 1, u1: 2 }))).toBe(
      canonicalJson(rec({ x: a.questions.q2!, y: a.questions.q1! }, { u1: 2, u2: 1 })),
    );
  });
});

describe("deltaSince", () => {
  const synced = rec(
    { q1: { choice: "ア", correct: false, at: 100 }, q2: { choice: "イ", correct: true, at: 300 } },
    { u1: 10, u2: 40 },
  );

  it("keeps only entries that are new or differ from the synced record", () => {
    const current = rec(
      {
        q1: { choice: "ア", correct: false, at: 100 }, // unchanged
        q2: { choice: "ウ", correct: false, at: 400 }, // re-answered
        q3: { choice: "エ", correct: true, at: 500 }, // new
      },
      { u1: 10, u2: 30, u3: 50 }, // u1 unchanged, u2 earlier, u3 new
    );
    expect(deltaSince(current, synced)).toEqual(
      rec(
        { q2: { choice: "ウ", correct: false, at: 400 }, q3: { choice: "エ", correct: true, at: 500 } },
        { u2: 30, u3: 50 },
      ),
    );
  });

  it("a field-level difference (choice / correct / at) counts as a change", () => {
    for (const q1 of [
      { choice: "イ", correct: false, at: 100 },
      { choice: "ア", correct: true, at: 100 },
      { choice: "ア", correct: false, at: 101 },
    ]) {
      expect(Object.keys(deltaSince(rec({ ...synced.questions, q1 }, synced.unitsRead), synced).questions)).toEqual([
        "q1",
      ]);
    }
  });

  it("is empty when nothing changed, and the whole record (canonical) when nothing is synced", () => {
    expect(deltaSince(synced, synced)).toEqual(emptyRecord());
    expect(deltaSince(mergeRecords(synced, emptyRecord()), structuredClone(synced))).toEqual(emptyRecord());
    expect(deltaSince(b, null)).toEqual(mergeRecords(b, emptyRecord()));
  });

  it("server merge of the delta equals the server merge of the full record", () => {
    for (const [current, base] of [
      [mergeRecords(a, b), a],
      [mergeRecords(a, c), b],
      [mergeRecords(mergeRecords(a, b), c), c],
      [a, mergeRecords(a, b)],
    ] as const) {
      expect(mergeRecords(base, deltaSince(current, base))).toEqual(mergeRecords(base, current));
    }
  });

  it("never mutates its inputs", () => {
    const cur = structuredClone(a);
    const base = structuredClone(b);
    deltaSince(cur, base);
    expect(cur).toEqual(a);
    expect(base).toEqual(b);
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

// ---- Stage 7: v1 ⇄ v2 bridge ---------------------------------------------------

const att = (at: number, choice: Attempt["choice"], correct: boolean, src: Attempt["src"] = "practice"): Attempt => ({
  at,
  choice,
  correct,
  src,
});

describe("v1 bridge constants", () => {
  it("keeps the v1 storage key and parser under their v1 names", () => {
    expect(LEARNING_V1_STORAGE_KEY).toBe("itp:learn:v1");
    expect(LEARNING_V1_STORAGE_KEY).toBe(LEARNING_STORAGE_KEY);
    expect(parseRecordV1).toBe(parseRecord);
  });
});

describe("upgradeV1", () => {
  const NOW = 1_760_000_000_000;

  it('upgradeV1 maps each question to one attempt with src "v1"', () => {
    const v2 = upgradeV1(a, NOW);
    expect(v2.v).toBe(2);
    expect(v2.attempts).toEqual({
      q1: [att(100, "ア", false, "v1")],
      q2: [att(300, "イ", true, "v1")],
      q3: [att(50, "ウ", true, "v1")],
    });
    expect(v2.unitsRead).toEqual(a.unitsRead);
    expect(v2.settings).toEqual({});
    expect(v2.unitsRead).not.toBe(a.unitsRead);
  });

  it("upgradeV1 drops non-letter choices", () => {
    const r1 = rec({
      ok: { choice: "エ", correct: true, at: 1 },
      latin: { choice: "A", correct: true, at: 2 },
      empty: { choice: "", correct: false, at: 3 },
      fifth: { choice: "オ", correct: false, at: 4 },
      two: { choice: "アイ", correct: false, at: 5 },
    });
    expect(Object.keys(upgradeV1(r1, NOW).attempts)).toEqual(["ok"]);
  });

  it("upgradeV1 sets v2Since = now", () => {
    expect(upgradeV1(a, NOW).v2Since).toBe(NOW);
    expect(upgradeV1(emptyRecord(), 0)).toEqual({ v: 2, attempts: {}, unitsRead: {}, settings: {}, v2Since: 0 });
    for (const now of [NaN, Infinity, -1]) expect(() => upgradeV1(a, now)).toThrow(RangeError);
  });

  it("is canonical, keeps __proto__ as data and does not mutate its input", () => {
    const r1 = rec(
      { z: { choice: "ア", correct: true, at: 1 }, __proto__x: { choice: "イ", correct: true, at: 2 } },
      { u9: 1, u1: 2 },
    );
    const proto = parseRecord(
      JSON.parse('{"v":1,"questions":{"__proto__":{"choice":"ア","correct":true,"at":1}},"unitsRead":{}}'),
    )!;
    const snap = structuredClone(r1);
    const v2 = upgradeV1(r1, NOW);
    expect(r1).toEqual(snap);
    expect(Object.keys(v2.attempts)).toEqual(["__proto__x", "z"]);
    expect(Object.keys(v2.unitsRead)).toEqual(["u1", "u9"]);
    const p = upgradeV1(proto, NOW);
    expect(Object.keys(p.attempts)).toEqual(["__proto__"]);
    expect(Object.getPrototypeOf(p.attempts)).toBe(Object.prototype);
  });
});

describe("downgradeToV1", () => {
  it("downgradeToV1(upgradeV1(r1)) equals r1 (canonical)", () => {
    for (const r1 of [a, b, c, mergeRecords(a, b), emptyRecord()]) {
      expect(canonicalJson(downgradeToV1(upgradeV1(r1, 9)))).toBe(canonicalJson(r1));
    }
  });

  it("downgradeToV1 picks the first attempt in total order", () => {
    const v2: LearningRecordV2 = {
      v: 2,
      attempts: {
        q: [att(100, "ア", true), att(300, "ウ", true), att(300, "エ", false, "v1"), att(200, "イ", false)],
        tie: [att(5, "ア", true, "mock"), att(5, "ア", false, "v1")],
        none: [],
      },
      unitsRead: { u: 3 },
      settings: { dailyReviewCap: { value: 50, at: 1 } },
      v2Since: 9,
    };
    expect(downgradeToV1(v2)).toEqual(
      rec(
        {
          q: { choice: "エ", correct: false, at: 300 },
          tie: { choice: "ア", correct: false, at: 5 },
        },
        { u: 3 },
      ),
    );
    expect(Object.keys(downgradeToV1(v2).questions)).toEqual(["q", "tie"]);
  });

  it("returns an empty v1 record for an empty v2 record", () => {
    expect(downgradeToV1(emptyV2())).toEqual(emptyRecord());
  });
});

describe("parseAnyRecord", () => {
  const NOW = 1_760_000_000_000;

  it("parseAnyRecord reports version", () => {
    const v2 = upgradeV1(b, 5);
    const wire = JSON.parse(JSON.stringify(encodeRecord(v2)));
    expect(parseAnyRecord(wire, NOW)).toEqual({ record: parseV2(wire), version: 2 });
    expect(parseAnyRecord(JSON.parse(JSON.stringify(a)), NOW)).toEqual({ record: upgradeV1(a, NOW), version: 1 });
  });

  it("returns null for anything that is neither, and never throws on input", () => {
    for (const x of [null, undefined, "x", 1, [], {}, { v: 3 }, { v: 2 }, { v: 1 }, { v: 1, questions: [], unitsRead: {} }]) {
      expect(parseAnyRecord(x, NOW)).toBeNull();
    }
  });
  it("a v1 record whose upgrade is not a valid v2 record (time > 8.64e15) is rejected", () => {
    const tooBig = [8.64e15 + 1, 2 ** 53, 1e300];
    for (const t of tooBig) {
      const q = { v: 1, questions: { q: { choice: "ア", correct: true, at: t } }, unitsRead: {} };
      const u = { v: 1, questions: {}, unitsRead: { u: t } };
      expect(parseAnyRecord(q, NOW)).toBeNull();
      expect(parseAnyRecord(u, NOW)).toBeNull();
    }
    // a non-letter answer is dropped on upgrade, so its time does not matter
    const dropped = { v: 1, questions: { q: { choice: "x", correct: true, at: 1e300 } }, unitsRead: {} };
    expect(parseAnyRecord(dropped, NOW)).toEqual({ record: upgradeV1(emptyRecord(), NOW), version: 1 });
    const edge = { v: 1, questions: { q: { choice: "ア", correct: true, at: 8.64e15 } }, unitsRead: {} };
    expect(parseAnyRecord(edge, NOW)?.version).toBe(1);
  });
});
