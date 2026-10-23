// D-180 §0-6 / D-190 §0-1 / §0-4 — what is left of record v1: parseRecordV1
// (a never-throwing trust boundary) and the v1 → v2 bridge — upgradeV1 (one
// "v1" attempt per letter answer, v2Since = now), downgradeToV1 (first attempt
// in the v2 total order) and parseAnyRecord (v2 wire or v1 JSON). The v1 model
// used as an oracle here (canonicalJsonV1 / mergeRecordsV1 / emptyRecordV1) is
// the frozen old-client copy in ./v1Client.

import { describe, expect, it } from "vitest";

import {
  encodeRecord,
  emptyRecord as emptyV2,
  parseRecord as parseV2,
  type Attempt,
  type LearningRecord as LearningRecordV2,
} from "../record";
import {
  LEARNING_V1_STORAGE_KEY,
  downgradeToV1,
  parseAnyRecord,
  parseRecordV1 as parseRecord,
  upgradeV1,
  type LearningRecordV1 as LearningRecord,
} from "../recordV1";
import { canonicalJsonV1 as canonicalJson, emptyRecordV1 as emptyRecord, mergeRecordsV1 as mergeRecords } from "./v1Client";

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

describe("parseRecordV1", () => {
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

// ---- Stage 7: v1 ⇄ v2 bridge ---------------------------------------------------

const att = (at: number, choice: Attempt["choice"], correct: boolean, src: Attempt["src"] = "practice"): Attempt => ({
  at,
  choice,
  correct,
  src,
});

describe("v1 bridge constants", () => {
  it("keeps the v1 storage key (old tabs still write it)", () => {
    expect(LEARNING_V1_STORAGE_KEY).toBe("itp:learn:v1");
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
