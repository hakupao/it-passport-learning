// Stage 7 Phase 1 (D-190 §0-1 / §0-2 / §0-4, DESIGN §5.2) — learning record v2 pure model.
//
// Guards: merge is commutative / associative / idempotent over random records
// (attempt lists past K, same-`at` ties, settings ties, v2Since absent/present),
// attempts follow one total order (at desc → choice desc → correct=false →
// src mock > practice > v1) with top-K = 10 and dedupe on (at, choice, correct),
// settings are last-writer-wins, the compact wire format round-trips and stays
// under the 1 MiB body limit at the 2900 × 10 extreme, parseRecord is a
// never-throwing trust boundary, and deltaSince is a lossless delta.

import { describe, expect, it } from "vitest";

import { mulberry32 } from "../../hash";
import {
  ATTEMPTS_K,
  LEARNING_STORAGE_KEY,
  SETTING_DEFAULTS,
  SETTING_RANGES,
  canonicalJson,
  compareAttempts,
  deltaSince,
  emptyRecord,
  encodeRecord,
  latestResult,
  markUnitRead,
  mergeIfChanged,
  mergeRecords,
  parseRecord,
  recordAttempt,
  setSetting,
  settingValue,
  topicStats,
  type Attempt,
  type ChoiceLetter,
  type LearningRecord,
  type LearningSettings,
} from "../record";

const LETTERS: readonly ChoiceLetter[] = ["ア", "イ", "ウ", "エ"];
const SRCS: readonly Attempt["src"][] = ["practice", "mock", "v1"];

const att = (at: number, choice: ChoiceLetter, correct: boolean, src: Attempt["src"] = "practice"): Attempt => ({
  at,
  choice,
  correct,
  src,
});

const rec = (
  attempts: Record<string, Attempt[]> = {},
  unitsRead: Record<string, number> = {},
  settings: LearningSettings = {},
  v2Since?: number,
): LearningRecord => ({ v: 2, attempts, unitsRead, settings, ...(v2Since === undefined ? {} : { v2Since }) });

// ---- random records (fixed seed, no deps) ------------------------------------

const QIDS = ["q0", "q1", "q2", "q3", "__proto__", "constructor"];
const UNITS = ["u0", "u1", "u2", "u3"];

function randomRecord(rand: () => number): LearningRecord {
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;
  const attempts: [string, Attempt[]][] = [];
  for (const q of QIDS) {
    if (rand() < 0.4) continue;
    const n = Math.floor(rand() * 16); // 0..15: empty lists and lists past K
    const list: Attempt[] = [];
    for (let i = 0; i < n; i++) list.push(att(Math.floor(rand() * 20), pick(LETTERS), rand() < 0.5, pick(SRCS)));
    attempts.push([q, list]);
  }
  const unitsRead: [string, number][] = [];
  for (const u of UNITS) if (rand() < 0.5) unitsRead.push([u, Math.floor(rand() * 50)]);
  const settings: LearningSettings = {};
  const at = () => Math.floor(rand() * 4); // small range → frequent equal-`at` ties
  if (rand() < 0.5) settings.examDate = { value: pick(["2026-11-01", "2026-12-15", "2027-01-10"]), at: at() };
  if (rand() < 0.5) settings.dailyReviewCap = { value: pick([10, 30, 55, 100]), at: at() };
  if (rand() < 0.5) settings.dailyNewTarget = { value: pick([0, 10, 25, 50]), at: at() };
  if (rand() < 0.5) settings.transDefault = { value: pick(["hidden", "shown"] as const), at: at() };
  return rec(
    Object.fromEntries(attempts),
    Object.fromEntries(unitsRead),
    settings,
    rand() < 0.5 ? Math.floor(rand() * 1000) : undefined,
  );
}

const CASES = 200;
const triples = (() => {
  const rand = mulberry32(20261023);
  return Array.from({ length: CASES }, () => [randomRecord(rand), randomRecord(rand), randomRecord(rand)] as const);
})();

const cj = canonicalJson;
const lists = (r: LearningRecord) => Object.values(r.attempts);

/** Output invariants every merge result must satisfy. */
function expectNormalized(r: LearningRecord): void {
  const qids = Object.keys(r.attempts);
  expect(qids).toEqual([...qids].sort());
  for (const list of lists(r)) {
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(ATTEMPTS_K);
    for (let i = 1; i < list.length; i++) {
      expect(compareAttempts(list[i - 1]!, list[i]!)).toBeLessThan(0);
      const [x, y] = [list[i - 1]!, list[i]!];
      expect(x.at === y.at && x.choice === y.choice && x.correct === y.correct).toBe(false);
    }
  }
}

describe("random property tests (200 fixed-seed cases)", () => {
  it("the generator covers the hard cases", () => {
    let longLists = 0;
    let sameAtDiffChoice = 0;
    let settingTies = 0;
    let sinceMixed = 0;
    for (const [a, b] of triples) {
      for (const q of QIDS) {
        const xs = [
          ...(Object.hasOwn(a.attempts, q) ? a.attempts[q]! : []),
          ...(Object.hasOwn(b.attempts, q) ? b.attempts[q]! : []),
        ];
        if (xs.length > ATTEMPTS_K) longLists++;
        if (xs.some((x) => xs.some((y) => x.at === y.at && x.choice !== y.choice))) sameAtDiffChoice++;
      }
      for (const k of ["examDate", "dailyReviewCap", "dailyNewTarget", "transDefault"] as const) {
        const x = a.settings[k];
        const y = b.settings[k];
        if (x && y && x.at === y.at && JSON.stringify(x.value) !== JSON.stringify(y.value)) settingTies++;
      }
      if ((a.v2Since === undefined) !== (b.v2Since === undefined)) sinceMixed++;
    }
    expect(longLists).toBeGreaterThan(20);
    expect(sameAtDiffChoice).toBeGreaterThan(20);
    expect(settingTies).toBeGreaterThan(20);
    expect(sinceMixed).toBeGreaterThan(20);
  });

  it("merge is commutative / associative / idempotent", () => {
    for (const [a, b, c] of triples) {
      expect(cj(mergeRecords(a, b))).toBe(cj(mergeRecords(b, a)));
      expect(JSON.stringify(mergeRecords(a, b))).toBe(JSON.stringify(mergeRecords(b, a)));
      expect(cj(mergeRecords(mergeRecords(a, b), c))).toBe(cj(mergeRecords(a, mergeRecords(b, c))));
      expect(cj(mergeRecords(a, a))).toBe(cj(a));
      const ab = mergeRecords(a, b);
      expect(JSON.stringify(mergeRecords(ab, b))).toBe(JSON.stringify(ab));
      expect(JSON.stringify(mergeRecords(ab, ab))).toBe(JSON.stringify(ab));
      expectNormalized(ab);
    }
  });

  it("merge does not mutate its inputs", () => {
    for (const [a, b] of triples.slice(0, 20)) {
      const [sa, sb] = [structuredClone(a), structuredClone(b)];
      mergeRecords(a, b);
      expect(a).toEqual(sa);
      expect(b).toEqual(sb);
    }
  });

  it("deltaSince: merge(synced, delta) equals merge(synced, current)", () => {
    for (const [a, b, c] of triples) {
      for (const [current, synced] of [
        [mergeRecords(a, b), a],
        [mergeRecords(a, b), mergeRecords(a, c)],
        [a, b],
        [c, mergeRecords(a, c)],
      ] as const) {
        expect(cj(mergeRecords(synced, deltaSince(current, synced)))).toBe(cj(mergeRecords(synced, current)));
      }
      expect(cj(deltaSince(a, null))).toBe(cj(a));
    }
  });

  it("encode → parse round-trips (to the canonical form)", () => {
    for (const [a, b] of triples) {
      for (const r of [a, mergeRecords(a, b)]) {
        expect(parseRecord(JSON.parse(JSON.stringify(encodeRecord(r))))).toEqual(mergeRecords(r, emptyRecord()));
      }
    }
  });
});

// ---- constants / basics --------------------------------------------------------

describe("constants / emptyRecord", () => {
  it("uses the locked values", () => {
    expect(ATTEMPTS_K).toBe(10);
    expect(LEARNING_STORAGE_KEY).toBe("itp:learn:v2");
    expect(SETTING_DEFAULTS).toEqual({ dailyReviewCap: 30, dailyNewTarget: 10, transDefault: "hidden" });
    expect(SETTING_RANGES).toEqual({ dailyReviewCap: [10, 100], dailyNewTarget: [0, 50] });
  });

  it("emptyRecord is a fresh v2 record without v2Since", () => {
    expect(emptyRecord()).toEqual({ v: 2, attempts: {}, unitsRead: {}, settings: {} });
    expect("v2Since" in emptyRecord()).toBe(false);
    expect(emptyRecord()).not.toBe(emptyRecord());
  });
});

describe("compareAttempts (the one total order)", () => {
  it("at desc → choice desc → correct=false first → src mock > practice > v1", () => {
    expect(compareAttempts(att(2, "ア", true), att(1, "エ", false, "mock"))).toBeLessThan(0);
    expect(compareAttempts(att(1, "イ", true), att(1, "ア", false))).toBeLessThan(0);
    expect(compareAttempts(att(1, "ア", false), att(1, "ア", true))).toBeLessThan(0);
    expect(compareAttempts(att(1, "ア", false, "mock"), att(1, "ア", false, "practice"))).toBeLessThan(0);
    expect(compareAttempts(att(1, "ア", false, "practice"), att(1, "ア", false, "v1"))).toBeLessThan(0);
    expect(compareAttempts(att(1, "ア", false, "v1"), att(1, "ア", false, "mock"))).toBeGreaterThan(0);
    expect(compareAttempts(att(1, "ウ", true, "v1"), att(1, "ウ", true, "v1"))).toBe(0);
  });
});

describe("mergeRecords: attempts", () => {
  it("top-K keeps the 10 highest in total order", () => {
    const x = rec({ q: Array.from({ length: 12 }, (_, i) => att(i + 1, "ア", true)) }); // at 1..12
    const y = rec({ q: [att(0, "イ", false), att(13, "ウ", true), att(7, "エ", false)] });
    const want = [13, 12, 11, 10, 9, 8, 7, 7, 6, 5];
    for (const m of [mergeRecords(x, y), mergeRecords(y, x)]) {
      expect(m.attempts.q!.map((a) => a.at)).toEqual(want);
      expect(m.attempts.q![6]).toEqual(att(7, "エ", false)); // at 7: エ ranks above ア
    }
  });

  it("dedupe key (at, choice, correct) keeps the earlier-ranked src", () => {
    const p = rec({ q: [att(5, "ア", false, "practice")] });
    const m = rec({ q: [att(5, "ア", false, "mock")] });
    const v = rec({ q: [att(5, "ア", false, "v1")] });
    expect(mergeRecords(p, m).attempts.q).toEqual([att(5, "ア", false, "mock")]);
    expect(mergeRecords(m, p).attempts.q).toEqual([att(5, "ア", false, "mock")]);
    expect(mergeRecords(v, p).attempts.q).toEqual([att(5, "ア", false, "practice")]);
    // a different choice or correctness at the same `at` is a different attempt
    const other = rec({ q: [att(5, "ア", true, "v1"), att(5, "イ", false, "v1")] });
    expect(mergeRecords(p, other).attempts.q).toEqual([
      att(5, "イ", false, "v1"),
      att(5, "ア", false, "practice"),
      att(5, "ア", true, "v1"),
    ]);
  });

  it("drops empty lists and builds canonical, key-sorted output", () => {
    const m = mergeRecords(rec({ z: [att(1, "ア", true)], a: [], m: [att(2, "イ", true)] }), emptyRecord());
    expect(Object.keys(m.attempts)).toEqual(["m", "z"]);
    expect(Object.keys(m)).toEqual(["v", "attempts", "unitsRead", "settings"]);
  });

  it("unitsRead keeps the smaller value; v2Since keeps the smaller, absent → the other", () => {
    expect(mergeRecords(rec({}, { u1: 10, u2: 40 }), rec({}, { u1: 20, u3: 5 })).unitsRead).toEqual({
      u1: 10,
      u2: 40,
      u3: 5,
    });
    expect(mergeRecords(rec({}, {}, {}, 50), rec({}, {}, {}, 30)).v2Since).toBe(30);
    expect(mergeRecords(rec({}, {}, {}, 50), rec()).v2Since).toBe(50);
    expect(mergeRecords(rec(), rec({}, {}, {}, 50)).v2Since).toBe(50);
    expect("v2Since" in mergeRecords(rec(), rec())).toBe(false);
  });
});

describe("recordAttempt", () => {
  it("prepends a practice attempt without mutating the input; src can be mock", () => {
    const r0 = rec({ q1: [att(100, "ア", false)] });
    const snap = structuredClone(r0);
    const r1 = recordAttempt(r0, "q1", "イ", true, 200);
    const r2 = recordAttempt(r1, "q2", "ウ", false, 300, "mock");
    expect(r0).toEqual(snap);
    expect(r1.attempts.q1).toEqual([att(200, "イ", true, "practice"), att(100, "ア", false)]);
    expect(r2.attempts.q2).toEqual([att(300, "ウ", false, "mock")]);
  });

  it("recordAttempt stamps at >= previous max at + 1", () => {
    const r1 = recordAttempt(emptyRecord(), "q1", "ア", false, 5000);
    expect(recordAttempt(r1, "q1", "イ", true, 1000).attempts.q1![0]!.at).toBe(5001); // clock went back
    expect(recordAttempt(r1, "q1", "ア", false, 5000).attempts.q1![0]!.at).toBe(5001); // equal reading
    expect(recordAttempt(r1, "q1", "ウ", false, 9000).attempts.q1![0]!.at).toBe(9000); // later: as-is
    expect(recordAttempt(r1, "q2", "ウ", false, 10).attempts.q2![0]!.at).toBe(10); // per question
    // the max is taken over the whole list, whatever its order
    const unsorted = rec({ q: [att(10, "ア", true), att(70, "イ", true), att(30, "ウ", true)] });
    expect(recordAttempt(unsorted, "q", "エ", true, 0).attempts.q![0]).toEqual(att(71, "エ", true));
  });

  it("same-day repeats are all stored", () => {
    const t = Date.UTC(2026, 9, 23, 9, 0, 0);
    let r = emptyRecord();
    for (let i = 0; i < 3; i++) r = recordAttempt(r, "q1", "ア", true, t + i * 60_000);
    expect(r.attempts.q1).toEqual([att(t + 120_000, "ア", true), att(t + 60_000, "ア", true), att(t, "ア", true)]);
  });

  it("keeps only the latest K attempts", () => {
    let r = emptyRecord();
    for (let i = 0; i < 12; i++) r = recordAttempt(r, "q", "ア", i % 2 === 0, i);
    expect(r.attempts.q!.map((a) => a.at)).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  });

  it("throws RangeError for a bad at or a non-letter choice (caller bugs)", () => {
    for (const at of [NaN, Infinity, -Infinity, -1]) {
      expect(() => recordAttempt(emptyRecord(), "q", "ア", true, at)).toThrow(RangeError);
      expect(() => markUnitRead(emptyRecord(), "u", at)).toThrow(RangeError);
      expect(() => setSetting(emptyRecord(), "dailyReviewCap", 30, at)).toThrow(RangeError);
    }
    expect(() => recordAttempt(emptyRecord(), "q", "A" as ChoiceLetter, true, 1)).toThrow(RangeError);
  });

  it('"__proto__" qid stays data', () => {
    const r = recordAttempt(emptyRecord(), "__proto__", "ア", true, 1);
    expect(Object.keys(r.attempts)).toEqual(["__proto__"]);
    expect(Object.getPrototypeOf(r.attempts)).toBe(Object.prototype);
    expect(recordAttempt(r, "__proto__", "イ", true, 0).attempts["__proto__"]![0]!.at).toBe(2);
    expect(recordAttempt(emptyRecord(), "constructor", "ア", true, 0).attempts["constructor"]).toEqual([
      att(0, "ア", true),
    ]);
  });
});

describe("markUnitRead", () => {
  it("records the first read and keeps an existing value", () => {
    const r1 = markUnitRead(emptyRecord(), "u1", 100);
    expect(r1.unitsRead).toEqual({ u1: 100 });
    expect(markUnitRead(r1, "u1", 999)).toBe(r1);
  });
});

describe("settings", () => {
  it("settings LWW: larger at wins; equal at → larger JSON wins", () => {
    const x = rec({}, {}, { dailyReviewCap: { value: 30, at: 5 }, examDate: { value: "2026-11-01", at: 9 } });
    const y = rec({}, {}, { dailyReviewCap: { value: 50, at: 7 }, examDate: { value: "2027-01-10", at: 9 } });
    for (const m of [mergeRecords(x, y), mergeRecords(y, x)]) {
      expect(m.settings.dailyReviewCap).toEqual({ value: 50, at: 7 });
      expect(m.settings.examDate).toEqual({ value: "2027-01-10", at: 9 });
    }
    // the tie-break is on the JSON text, not the number: "55" > "100"
    const p = rec({}, {}, { dailyReviewCap: { value: 100, at: 3 } });
    const q = rec({}, {}, { dailyReviewCap: { value: 55, at: 3 } });
    expect(mergeRecords(p, q).settings.dailyReviewCap).toEqual({ value: 55, at: 3 });
    expect(mergeRecords(q, p).settings.dailyReviewCap).toEqual({ value: 55, at: 3 });
    // one side only → kept
    expect(mergeRecords(p, rec({}, {}, { transDefault: { value: "shown", at: 1 } })).settings).toEqual({
      dailyReviewCap: { value: 100, at: 3 },
      transDefault: { value: "shown", at: 1 },
    });
  });

  it("setSetting clamps 5 → 10 and 200 → 100 for dailyReviewCap", () => {
    expect(setSetting(emptyRecord(), "dailyReviewCap", 5, 1).settings.dailyReviewCap).toEqual({ value: 10, at: 1 });
    expect(setSetting(emptyRecord(), "dailyReviewCap", 200, 1).settings.dailyReviewCap).toEqual({ value: 100, at: 1 });
    expect(setSetting(emptyRecord(), "dailyNewTarget", -3, 1).settings.dailyNewTarget).toEqual({ value: 0, at: 1 });
    expect(setSetting(emptyRecord(), "dailyNewTarget", 99, 1).settings.dailyNewTarget).toEqual({ value: 50, at: 1 });
    expect(setSetting(emptyRecord(), "dailyNewTarget", 25, 1).settings.dailyNewTarget).toEqual({ value: 25, at: 1 });
  });

  it("setSetting rejects values outside the schema (caller bugs)", () => {
    expect(() => setSetting(emptyRecord(), "dailyReviewCap", NaN, 1)).toThrow(RangeError);
    expect(() => setSetting(emptyRecord(), "examDate", "11/01/2026", 1)).toThrow(RangeError);
    expect(() => setSetting(emptyRecord(), "transDefault", "dark" as "shown", 1)).toThrow(RangeError);
  });

  it("a re-set on this device wins even on a skewed clock (at >= previous at + 1), input untouched", () => {
    const r1 = setSetting(emptyRecord(), "transDefault", "shown", 5000);
    const snap = structuredClone(r1);
    const r2 = setSetting(r1, "transDefault", "hidden", 1000);
    expect(r2.settings.transDefault).toEqual({ value: "hidden", at: 5001 });
    expect(mergeRecords(r1, r2).settings.transDefault).toEqual({ value: "hidden", at: 5001 });
    expect(r1).toEqual(snap);
  });

  it("settingValue falls back to the defaults", () => {
    const r0 = emptyRecord();
    expect(settingValue(r0, "dailyReviewCap")).toBe(30);
    expect(settingValue(r0, "dailyNewTarget")).toBe(10);
    expect(settingValue(r0, "transDefault")).toBe("hidden");
    expect(settingValue(r0, "examDate")).toBeUndefined();
    const r1 = setSetting(setSetting(r0, "examDate", "2026-12-15", 1), "dailyReviewCap", 60, 1);
    expect(settingValue(r1, "examDate")).toBe("2026-12-15");
    expect(settingValue(r1, "dailyReviewCap")).toBe(60);
  });
});

describe("canonicalJson / mergeIfChanged", () => {
  const a = rec({ q1: [att(100, "ア", false)], q2: [att(300, "イ", true)] }, { u1: 10 }, {}, 7);
  const b = rec({ q1: [att(200, "エ", true)], q3: [att(50, "ウ", true)] }, { u1: 20, u3: 5 });

  it("canonicalJson ignores key, list and field order", () => {
    const shuffled: LearningRecord = {
      v2Since: 7,
      settings: {},
      unitsRead: { u1: 10 },
      attempts: { q2: [{ src: "practice", correct: true, choice: "イ", at: 300 }], q1: [att(100, "ア", false)] },
      v: 2,
    };
    expect(canonicalJson(shuffled)).toBe(canonicalJson(a));
  });

  it("mergeIfChanged returns prev itself when the other adds nothing, else the merge", () => {
    const m = mergeRecords(a, b);
    expect(mergeIfChanged(m, a)).toBe(m);
    expect(mergeIfChanged(m, b)).toBe(m);
    expect(mergeIfChanged(m, emptyRecord())).toBe(m);
    const out = mergeIfChanged(a, b);
    expect(out).not.toBe(a);
    expect(out).toEqual(m);
  });
});

describe("deltaSince", () => {
  const synced = rec(
    { q1: [att(100, "ア", false)], q2: [att(300, "イ", true)] },
    { u1: 10, u2: 40 },
    { dailyReviewCap: { value: 30, at: 1 } },
    50,
  );

  it("per question the whole list when it differs; unchanged entries left out", () => {
    const current = recordAttempt(
      markUnitRead(recordAttempt(synced, "q2", "ウ", false, 400), "u3", 60),
      "q3",
      "エ",
      true,
      500,
    );
    expect(deltaSince(current, synced)).toEqual(
      rec({ q2: [att(400, "ウ", false), att(300, "イ", true)], q3: [att(500, "エ", true)] }, { u3: 60 }),
    );
  });

  it("changed settings and an earlier v2Since are included", () => {
    const current = setSetting({ ...synced, v2Since: 20 }, "dailyReviewCap", 40, 2);
    expect(deltaSince(current, synced)).toEqual(rec({}, {}, { dailyReviewCap: { value: 40, at: 2 } }, 20));
  });

  it("empty when nothing changed; the whole record (canonical) when nothing is synced", () => {
    expect(deltaSince(synced, structuredClone(synced))).toEqual(emptyRecord());
    expect(deltaSince(synced, null)).toEqual(mergeRecords(synced, emptyRecord()));
  });
});

describe("wire format", () => {
  const r = rec(
    { q1: [att(200, "エ", true, "mock"), att(100, "イ", false, "v1")], q2: [att(5, "ア", true)] },
    { u1: 10 },
    { examDate: { value: "2026-12-15", at: 3 }, transDefault: { value: "shown", at: 4 } },
    3,
  );

  it("encodes choice as an index, correct as 0/1 and src as one letter", () => {
    expect(encodeRecord(r)).toEqual({
      v: 2,
      a: {
        q1: [
          [200, 3, 1, "m"],
          [100, 1, 0, "1"],
        ],
        q2: [[5, 0, 1, "p"]],
      },
      u: { u1: 10 },
      s: { examDate: ["2026-12-15", 3], transDefault: ["shown", 4] },
      since: 3,
    });
    expect("since" in encodeRecord(emptyRecord())).toBe(false);
  });

  it("encode → parse round-trips", () => {
    expect(parseRecord(JSON.parse(JSON.stringify(encodeRecord(r))))).toEqual(r);
    expect(parseRecord(encodeRecord(emptyRecord()))).toEqual(emptyRecord());
  });

  it("a record with 2900 × 10 attempts encodes under 1048576 bytes", () => {
    const rand = mulberry32(7);
    const attempts: [string, Attempt[]][] = [];
    for (let e = 0; e < 29; e++) {
      const exam = `20${String(9 + (e >> 1)).padStart(2, "0")}h${21 + e}${e % 2 ? "o" : "a"}`; // e.g. 2009h21a
      for (let n = 1; n <= 100; n++) {
        const list: Attempt[] = [];
        for (let i = 0; i < ATTEMPTS_K; i++) {
          list.push(
            att(
              1_760_000_000_000 + Math.floor(rand() * 1e11),
              LETTERS[i % 4]!,
              rand() < 0.5,
              i % 3 ? "practice" : "mock",
            ),
          );
        }
        attempts.push([`${exam}-q${String(n).padStart(3, "0")}`, list]);
      }
    }
    const big = rec(
      Object.fromEntries(attempts),
      Object.fromEntries(Array.from({ length: 120 }, (_, i) => [`unit-${i}`, 1_760_000_000_000 + i])),
      {
        examDate: { value: "2026-12-15", at: 1_760_000_000_000 },
        dailyReviewCap: { value: 100, at: 1_760_000_000_000 },
        dailyNewTarget: { value: 50, at: 1_760_000_000_000 },
        transDefault: { value: "shown", at: 1_760_000_000_000 },
      },
      1_760_000_000_000,
    );
    expect(Object.keys(big.attempts)[0]).toMatch(/^\d{4}h\d{2}[ao]-q\d{3}$/);
    expect(lists(big).flat().length).toBe(29_000);
    const bytes = new TextEncoder().encode(JSON.stringify(encodeRecord(big))).length;
    expect(bytes).toBeLessThan(1_048_576);
  });

  const wire = (extra: Record<string, unknown> = {}) => ({ v: 2, a: {}, u: {}, s: {}, ...extra });

  it("parseRecord rejects v:1, choiceIdx 4, correct 2, unknown src, negative at", () => {
    expect(parseRecord({ v: 1, questions: {}, unitsRead: {} })).toBeNull();
    expect(parseRecord(wire({ v: 1 }))).toBeNull();
    expect(parseRecord(wire({ a: { q: [[1, 4, 1, "p"]] } }))).toBeNull();
    expect(parseRecord(wire({ a: { q: [[1, 0, 2, "p"]] } }))).toBeNull();
    expect(parseRecord(wire({ a: { q: [[1, 0, 1, "x"]] } }))).toBeNull();
    expect(parseRecord(wire({ a: { q: [[-1, 0, 1, "p"]] } }))).toBeNull();
    expect(parseRecord(wire({ a: { q: [[1, 0, 1, "p"]] } }))).not.toBeNull();
  });

  it("parseRecord rejects every other schema violation and never throws", () => {
    const bad: unknown[] = [
      null,
      undefined,
      "x",
      1,
      [],
      { v: 2 },
      wire({ v: "2" }),
      wire({ a: [] }),
      wire({ u: null }),
      wire({ s: [] }),
      { v: 2, a: {}, u: {} },
      wire({ a: { q: "x" } }),
      wire({ a: { q: [null] } }),
      wire({ a: { q: [[1, 0, 1]] } }),
      wire({ a: { q: [[1, 0, 1, "p", 9]] } }),
      wire({ a: { q: [[1, 1.5, 1, "p"]] } }),
      wire({ a: { q: [[1, "0", 1, "p"]] } }),
      wire({ a: { q: [[1, 0, true, "p"]] } }),
      wire({ a: { q: [[Infinity, 0, 1, "p"]] } }),
      wire({ a: { q: [["1", 0, 1, "p"]] } }),
      wire({ u: { u: -1 } }),
      wire({ u: { u: NaN } }),
      wire({ since: -1 }),
      wire({ since: "1" }),
      wire({ s: { dailyReviewCap: [30] } }),
      wire({ s: { dailyReviewCap: ["30", 1] } }),
      wire({ s: { dailyReviewCap: [NaN, 1] } }),
      wire({ s: { dailyReviewCap: [30, -1] } }),
      wire({ s: { transDefault: ["dark", 1] } }),
      wire({ s: { examDate: ["2026/12/15", 1] } }),
      wire({ s: { examDate: { value: "2026-12-15", at: 1 } } }),
    ];
    for (const x of bad) expect(parseRecord(x)).toBeNull();
  });

  it("parseRecord drops unknown fields", () => {
    const out = parseRecord(wire({ extra: 1, s: { theme: ["dark", 1], transDefault: ["shown", 2] }, u: { u: 3 } }));
    expect(out).toEqual(rec({}, { u: 3 }, { transDefault: { value: "shown", at: 2 } }));
  });

  it("parseRecord normalizes wire lists (order, duplicates, length)", () => {
    const list = Array.from({ length: 12 }, (_, i) => [i, 0, 1, "p"]);
    list.push([11, 0, 1, "m"]); // duplicate key of at 11, ranks above "p"
    const out = parseRecord(wire({ a: { q: list, empty: [] } }));
    expect(out!.attempts.q!.map((a) => a.at)).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    expect(out!.attempts.q![0]!.src).toBe("mock");
    expect(Object.keys(out!.attempts)).toEqual(["q"]);
  });

  it('"__proto__" qid stays data', () => {
    const out = parseRecord(JSON.parse('{"v":2,"a":{"__proto__":[[1,0,1,"p"]]},"u":{"__proto__":4},"s":{}}'));
    expect(out).not.toBeNull();
    expect(Object.keys(out!.attempts)).toEqual(["__proto__"]);
    expect(Object.keys(out!.unitsRead)).toEqual(["__proto__"]);
    expect(Object.getPrototypeOf(out!.attempts)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(out!.unitsRead)).toBe(Object.prototype);
    expect(JSON.stringify(encodeRecord(out!))).toBe(
      '{"v":2,"a":{"__proto__":[[1,0,1,"p"]]},"u":{"__proto__":4},"s":{}}',
    );
  });
});

describe("latestResult / topicStats", () => {
  it("latestResult is the first attempt in total order, whatever the list order", () => {
    const r = rec({ q: [att(100, "ア", true), att(300, "イ", true), att(300, "ウ", false), att(200, "エ", false)] });
    expect(latestResult(r, "q")).toEqual(att(300, "ウ", false));
    expect(latestResult(r, "missing")).toBeUndefined();
    expect(latestResult(r, "constructor")).toBeUndefined();
    expect(latestResult(rec({ e: [] }), "e")).toBeUndefined();
  });

  it("topicStats uses the latest attempt per question", () => {
    const r = rec({
      t1a: [att(100, "ア", false), att(200, "イ", true)], // latest correct
      t1b: [att(50, "ア", true), att(300, "イ", false)], // latest wrong
      t2a: [att(3, "ウ", true)],
      other: [att(4, "ア", true)],
    });
    const stats = topicStats(r, [
      { id: "t1a", topic_id: "T1" },
      { id: "t1b", topic_id: "T1" },
      { id: "t1c", topic_id: "T1" },
      { id: "t2a", topic_id: "T2" },
      { id: "constructor", topic_id: "T3" },
    ]);
    expect(stats.get("T1")).toEqual({ topicId: "T1", total: 3, answered: 2, correct: 1 });
    expect(stats.get("T2")).toEqual({ topicId: "T2", total: 1, answered: 1, correct: 1 });
    expect(stats.get("T3")).toEqual({ topicId: "T3", total: 1, answered: 0, correct: 0 });
    expect([...stats.keys()]).toEqual(["T1", "T2", "T3"]);
  });
});

describe("trust-boundary hardening (Task 3)", () => {
  const MAX_T = 8.64e15; // max Date value
  const wire = (extra: Record<string, unknown> = {}) => ({ v: 2, a: {}, u: {}, s: {}, ...extra });

  it("time values are capped at 8.64e15 (an at >= 2^53 would make max + 1 === max)", () => {
    for (const t of [MAX_T + 1, 2 ** 53, 1e300]) {
      expect(parseRecord(wire({ a: { q: [[t, 0, 1, "p"]] } }))).toBeNull();
      expect(parseRecord(wire({ u: { u: t } }))).toBeNull();
      expect(parseRecord(wire({ since: t }))).toBeNull();
      expect(parseRecord(wire({ s: { dailyReviewCap: [30, t] } }))).toBeNull();
      expect(() => recordAttempt(emptyRecord(), "q", "ア", true, t)).toThrow(RangeError);
      expect(() => markUnitRead(emptyRecord(), "u", t)).toThrow(RangeError);
      expect(() => setSetting(emptyRecord(), "dailyReviewCap", 30, t)).toThrow(RangeError);
    }
    expect(parseRecord(wire({ a: { q: [[MAX_T, 0, 1, "p"]] }, u: { u: MAX_T }, since: MAX_T }))).not.toBeNull();
    expect(recordAttempt(emptyRecord(), "q", "ア", true, MAX_T).attempts.q![0]!.at).toBe(MAX_T);
  });

  it("examDate must be a real calendar date", () => {
    for (const bad of ["2026-02-30", "2026-13-01", "2026-00-10", "2025-02-29", "2026-04-31"]) {
      expect(() => setSetting(emptyRecord(), "examDate", bad, 1)).toThrow(RangeError);
      expect(parseRecord(wire({ s: { examDate: [bad, 1] } }))).toBeNull();
    }
    for (const ok of ["2026-12-15", "2028-02-29", "2027-01-01"]) {
      expect(setSetting(emptyRecord(), "examDate", ok, 1).settings.examDate).toEqual({ value: ok, at: 1 });
      expect(parseRecord(wire({ s: { examDate: [ok, 1] } }))!.settings.examDate).toEqual({ value: ok, at: 1 });
    }
  });

  it("numeric settings are integers: setSetting / settingValue round, parseRecord rejects fractions", () => {
    expect(setSetting(emptyRecord(), "dailyReviewCap", 30.6, 1).settings.dailyReviewCap).toEqual({ value: 31, at: 1 });
    expect(setSetting(emptyRecord(), "dailyNewTarget", 12.4, 1).settings.dailyNewTarget).toEqual({ value: 12, at: 1 });
    expect(setSetting(emptyRecord(), "dailyReviewCap", 100.4, 1).settings.dailyReviewCap).toEqual({ value: 100, at: 1 });
    expect(settingValue(rec({}, {}, { dailyReviewCap: { value: 30.4, at: 1 } }), "dailyReviewCap")).toBe(30);
    expect(parseRecord(wire({ s: { dailyReviewCap: [30.5, 1] } }))).toBeNull();
    expect(parseRecord(wire({ s: { dailyNewTarget: [0.1, 1] } }))).toBeNull();
    expect(parseRecord(wire({ s: { dailyNewTarget: [12, 1] } }))!.settings.dailyNewTarget).toEqual({ value: 12, at: 1 });
  });

  it('recordAttempt throws RangeError for a src other than "practice" | "mock"', () => {
    for (const src of ["v1", "x", ""]) {
      expect(() => recordAttempt(emptyRecord(), "q", "ア", true, 1, src as "practice")).toThrow(RangeError);
    }
  });
});
