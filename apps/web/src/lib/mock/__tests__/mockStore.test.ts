// Stage 7 Phase 2 (D-192 ② / D-193 §0-4 / §0-6) — resumable mock state.
//
// Guards: serialize → parse round-trips (Review Focus 1: resume), a mock whose
// time ran out while away ends at the deadline, not on return (Review Focus 1:
// expired while away), finishing twice keeps the first endedAt and the
// recorded flag (Review Focus 2: two tabs), answers / flags freeze after the
// finish, and parseMock is a never-throwing trust boundary.

import { describe, expect, it } from "vitest";

import { MOCK_MS } from "../mockModel";
import {
  MOCK_STORAGE_KEY,
  mockReducer,
  newMock,
  owesRecord,
  parseMock,
  sameMock,
  serializeMock,
  type MockAction,
  type MockState,
} from "../mockStore";

const T0 = 1_700_000_000_000;
const IDS = ["2024r06-q001", "2024r06-q002", "2024r06-q003"];

const run = (s: MockState, ...actions: MockAction[]): MockState => actions.reduce(mockReducer, s);

describe("newMock / storage key", () => {
  it("starts a fresh, unanswered, unfinished mock", () => {
    expect(MOCK_STORAGE_KEY).toBe("itp:mock:v1");
    expect(newMock("exam", "2024r06", IDS, T0)).toEqual({
      v: 1,
      kind: "exam",
      examId: "2024r06",
      ids: IDS,
      answers: {},
      flagged: [],
      pos: 0,
      startedAt: T0,
      endedAt: null,
      recorded: false,
    });
  });
});

describe("resume", () => {
  it("serialize → parse round-trips mid-exam and finished states", () => {
    const mid = run(
      newMock("random", null, IDS, T0),
      { type: "pick", qid: IDS[0]!, choice: "ウ" },
      { type: "flag", qid: IDS[1]! },
      { type: "go", pos: 2 },
    );
    expect(parseMock(serializeMock(mid))).toEqual(mid);
    const done = run(mid, { type: "finish", now: T0 + 60_000 }, { type: "recorded" });
    expect(parseMock(serializeMock(done))).toEqual(done);
  });
});

describe("mockReducer", () => {
  it("expired while away: a tick past the deadline ends the mock at the deadline", () => {
    const s = run(newMock("random", null, IDS, T0), { type: "tick", now: T0 + 3 * 60 * 60_000 });
    expect(s.endedAt).toBe(T0 + MOCK_MS);
  });

  it("a tick before the deadline changes nothing", () => {
    const s = newMock("random", null, IDS, T0);
    expect(mockReducer(s, { type: "tick", now: T0 + MOCK_MS - 1 })).toBe(s);
  });

  it("finish ends at now when in time, and at the deadline when late", () => {
    expect(run(newMock("random", null, IDS, T0), { type: "finish", now: T0 + 5_000 }).endedAt).toBe(T0 + 5_000);
    expect(run(newMock("random", null, IDS, T0), { type: "finish", now: T0 + MOCK_MS + 5_000 }).endedAt).toBe(
      T0 + MOCK_MS,
    );
  });

  it("finish twice keeps the first endedAt", () => {
    const s = run(
      newMock("random", null, IDS, T0),
      { type: "finish", now: T0 + 10_000 },
      { type: "finish", now: T0 + 20_000 },
      { type: "tick", now: T0 + 3 * MOCK_MS },
    );
    expect(s.endedAt).toBe(T0 + 10_000);
  });

  it("recorded flag survives a second finish", () => {
    const s = run(
      newMock("random", null, IDS, T0),
      { type: "finish", now: T0 + 10_000 },
      { type: "recorded" },
      { type: "finish", now: T0 + 20_000 },
    );
    expect(s.recorded).toBe(true);
    expect(s.endedAt).toBe(T0 + 10_000);
  });

  it("pick sets / changes the answer before the finish", () => {
    const s = run(
      newMock("random", null, IDS, T0),
      { type: "pick", qid: IDS[0]!, choice: "ア" },
      { type: "pick", qid: IDS[0]!, choice: "エ" },
    );
    expect(s.answers).toEqual({ [IDS[0]!]: "エ" });
  });

  it("pick after finish ignored", () => {
    const s = run(
      newMock("random", null, IDS, T0),
      { type: "pick", qid: IDS[0]!, choice: "ア" },
      { type: "finish", now: T0 + 1_000 },
      { type: "pick", qid: IDS[0]!, choice: "イ" },
      { type: "pick", qid: IDS[1]!, choice: "イ" },
    );
    expect(s.answers).toEqual({ [IDS[0]!]: "ア" });
  });

  it("flag toggles (and is frozen after the finish)", () => {
    const s0 = newMock("random", null, IDS, T0);
    const s1 = run(s0, { type: "flag", qid: IDS[2]! });
    expect(s1.flagged).toEqual([IDS[2]]);
    const s2 = run(s1, { type: "flag", qid: IDS[2]! });
    expect(s2.flagged).toEqual([]);
    const s3 = run(s1, { type: "finish", now: T0 + 1 }, { type: "flag", qid: IDS[2]! });
    expect(s3.flagged).toEqual([IDS[2]]);
  });

  it("ignores pick / flag for ids not in the mock", () => {
    const s = newMock("random", null, IDS, T0);
    expect(mockReducer(s, { type: "pick", qid: "nope", choice: "ア" })).toBe(s);
    expect(mockReducer(s, { type: "flag", qid: "nope" })).toBe(s);
  });

  it("go moves within the question list (clamped)", () => {
    const s = newMock("random", null, IDS, T0);
    expect(mockReducer(s, { type: "go", pos: 2 }).pos).toBe(2);
    expect(mockReducer(s, { type: "go", pos: 99 }).pos).toBe(2);
    expect(mockReducer(s, { type: "go", pos: -1 }).pos).toBe(0);
  });
});

describe("sameMock", () => {
  it("matches kind, examId and the exact id order", () => {
    const s = newMock("exam", "2024r06", IDS, T0);
    expect(sameMock(s, "exam", "2024r06", [...IDS])).toBe(true);
    expect(sameMock(s, "random", "2024r06", IDS)).toBe(false);
    expect(sameMock(s, "exam", "2025r07", IDS)).toBe(false);
    expect(sameMock(s, "exam", "2024r06", [...IDS].reverse())).toBe(false);
    expect(sameMock(s, "exam", "2024r06", IDS.slice(0, 2))).toBe(false);
  });
});

describe("parseMock (trust boundary)", () => {
  const good = (): Record<string, unknown> =>
    JSON.parse(serializeMock(run(newMock("random", null, IDS, T0), { type: "pick", qid: IDS[0]!, choice: "イ" })));

  it("returns null for missing / non-JSON / wrong-shape input, never throws", () => {
    const bad: (string | null)[] = [
      null,
      "",
      "{",
      "null",
      "[]",
      "42",
      JSON.stringify({ v: 2 }),
      JSON.stringify({ ...good(), v: 2 }),
      JSON.stringify({ ...good(), ids: "a,b" }),
      JSON.stringify({ ...good(), ids: [1, 2] }),
      JSON.stringify({ ...good(), kind: "other" }),
      JSON.stringify({ ...good(), examId: 5 }),
      JSON.stringify({ ...good(), answers: [] }),
      JSON.stringify({ ...good(), answers: { [IDS[0]!]: "A" } }),
      JSON.stringify({ ...good(), answers: null }),
      JSON.stringify({ ...good(), flagged: [3] }),
      JSON.stringify({ ...good(), pos: 1.5 }),
      JSON.stringify({ ...good(), pos: -1 }),
      JSON.stringify({ ...good(), startedAt: "1" }),
      JSON.stringify({ ...good(), startedAt: null }),
      JSON.stringify({ ...good(), endedAt: "x" }),
      JSON.stringify({ ...good(), recorded: "yes" }),
    ];
    for (const raw of bad) {
      expect(() => parseMock(raw)).not.toThrow();
      expect(parseMock(raw), String(raw)).toBeNull();
    }
  });

  it("a __proto__ answer key stays plain data", () => {
    const raw = `{"v":1,"kind":"random","examId":null,"ids":["__proto__"],"answers":{"__proto__":"ア"},"flagged":[],"pos":0,"startedAt":${T0},"endedAt":null,"recorded":false}`;
    const s = parseMock(raw);
    expect(s).not.toBeNull();
    expect(Object.getPrototypeOf(s!.answers)).toBe(Object.prototype);
    expect(Object.keys(s!.answers)).toEqual(["__proto__"]);
    expect(s!.answers["__proto__"]).toBe("ア");
  });
});

// Task 4 hardening (Task 3 review, carried as dispatch ruling R2): the exam page is the
// first consumer that reads storage written by another tab or an older build.
describe("hardening (R2)", () => {
  it("go ignores a non-finite position", () => {
    const s = run(newMock("random", null, IDS, T0), { type: "go", pos: 1 });
    for (const pos of [NaN, Infinity, -Infinity]) expect(mockReducer(s, { type: "go", pos })).toBe(s);
  });

  it("parseMock rejects negative times and a pos outside the id list", () => {
    const good = (): MockState => newMock("random", null, IDS, T0);
    const bad = [
      { ...good(), startedAt: -1 },
      { ...good(), endedAt: -5 },
      { ...good(), pos: IDS.length },
      { ...good(), ids: [], pos: 0 },
    ];
    for (const x of bad) expect(parseMock(JSON.stringify(x)), JSON.stringify(x)).toBeNull();
    expect(parseMock(JSON.stringify({ ...good(), pos: IDS.length - 1 }))?.pos).toBe(IDS.length - 1);
  });

  it("parseMock drops answers / flags for ids not in the mock (and repeated flags)", () => {
    const raw = JSON.stringify({
      ...newMock("random", null, IDS, T0),
      answers: { [IDS[0]!]: "ア", "2000x-q999": "イ" },
      flagged: [IDS[1]!, "2000x-q999", IDS[1]!],
    });
    const s = parseMock(raw)!;
    expect(s.answers).toEqual({ [IDS[0]!]: "ア" });
    expect(s.flagged).toEqual([IDS[1]!]);
  });
});

// Task 4 fix rounds 1–2 (D-192 ①): a stored mock that still owes its answers to the record — the
// setup page offers 「結果を見る」 first (discard only behind a confirmation), the exam page opens it
// before starting another mock.
describe("owesRecord", () => {
  const MS = 120 * 60_000;
  it("running in time: no; running past the deadline / finished unrecorded: yes; recorded: no", () => {
    const s = newMock("exam", "2024r06", ["a", "b"], T0);
    expect(owesRecord(s, T0 + MS - 1)).toBe(false);
    expect(owesRecord(s, T0 + MS)).toBe(true);
    const ended = mockReducer(s, { type: "finish", now: T0 + 1000 });
    expect(owesRecord(ended, T0 + 2000)).toBe(true);
    expect(owesRecord(mockReducer(ended, { type: "recorded" }), T0 + 2000)).toBe(false);
  });
});
