// Stage 7 Phase 1 Task 9 (D-187 / D-190 §0-8 / §0-12〜§0-14 / §0-26, Review Focus 4 / 5) —
// the practice session's pure layer: URL scope parsing, the session reducer, keyboard mapping,
// sessionStorage restore, 中問 fold plan, status line, today-chain helpers.
//
// `toDay` is the UTC day so results do not depend on the machine's time zone.

import { describe, expect, it } from "vitest";

import { fnv1a32 } from "../../hash";
import { emptyRecord, recordAttempt, type LearningRecord } from "../../learning/record";
import type { StorageLike } from "../../storage";
import {
  MAX_SCOPE_IDS,
  applyAction,
  clearSession,
  parseRun,
  foldPlan,
  formatElapsed,
  isFromToday,
  keyToAction,
  loadSession,
  localDateKey,
  newSession,
  nextTodayGroup,
  nextTodayIds,
  parseKind,
  parseScope,
  practiceReducer,
  recentResults,
  saveSession,
  sessionKey,
  statusLine,
  summarize,
  todayHref,
  todayKind,
  type SessionState,
} from "../practiceSession";

const DAY = 86_400_000;
const toDay = (at: number): number => Math.floor(at / DAY);
const D0 = toDay(Date.UTC(2026, 9, 1));
const at = (d: number, hh = 10): number => d * DAY + hh * 3_600_000;

const IDS = Array.from({ length: 150 }, (_, i) => `2009h21a-q${String(i + 1).padStart(3, "0")}`);
const VALID = new Set(IDS);
const TOPICS = new Set(["strategy-01-01", "technology-12-03"]);
const EXAMS = new Set(["2009h21a", "2025r07"]);
const parse = (sp: Record<string, string | string[] | undefined>) => parseScope(sp, VALID, TOPICS, EXAMS);

class MemStorage implements StorageLike {
  m = new Map<string, string>();
  getItem(k: string): string | null {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.m.set(k, v);
  }
  removeItem(k: string): void {
    this.m.delete(k);
  }
}
const throwing: StorageLike = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

describe("parseScope (§0-12)", () => {
  it("ids keeps order, drops unknown, caps at 100", () => {
    expect(parse({ ids: "2009h21a-q003,nope-q001,2009h21a-q001" })).toEqual({
      kind: "ids",
      ids: ["2009h21a-q003", "2009h21a-q001"],
    });
    const many = parse({ ids: IDS.join(",") });
    expect(many).toEqual({ kind: "ids", ids: IDS.slice(0, MAX_SCOPE_IDS) });
    expect(MAX_SCOPE_IDS).toBe(100);
    // duplicates are dropped (first occurrence kept); an array param uses its first value
    expect(parse({ ids: ["2009h21a-q002,2009h21a-q002,2009h21a-q001", "2009h21a-q009"] })).toEqual({
      kind: "ids",
      ids: ["2009h21a-q002", "2009h21a-q001"],
    });
  });

  it("all-invalid → null", () => {
    expect(parse({ ids: "x,y,,z" })).toBeNull();
    expect(parse({ ids: "" })).toBeNull();
    expect(parse({ topic: "nope" })).toBeNull();
    expect(parse({ exam: "nope", n: "10" })).toBeNull();
    expect(parse({})).toBeNull();
    // a filter with neither topics nor exam is rejected (resolveScope would take the whole corpus)
    expect(parse({ n: "all", order: "rand", seed: "3" })).toBeNull();
    expect(parse({ topic: "nope", exam: "nope" })).toBeNull();
  });

  it("topic + n=20 + order=rand + seed", () => {
    expect(parse({ topic: "strategy-01-01,nope,technology-12-03", n: "20", order: "rand", seed: "12345" })).toEqual({
      kind: "filter",
      topics: ["strategy-01-01", "technology-12-03"],
      exam: null,
      n: 20,
      order: "rand",
      seed: 12345,
    });
    expect(parse({ exam: "2025r07", n: "all" })).toEqual({
      kind: "filter",
      topics: [],
      exam: "2025r07",
      n: "all",
      order: "seq",
      seed: 0,
    });
    expect(parse({ topic: "strategy-01-01", exam: "2009h21a", n: "50", order: "seq" })).toMatchObject({
      topics: ["strategy-01-01"],
      exam: "2009h21a",
      n: 50,
    });
    // an invalid exam next to a valid topic is dropped, not fatal
    expect(parse({ topic: "strategy-01-01", exam: "nope" })).toMatchObject({ topics: ["strategy-01-01"], exam: null });
  });

  it("garbage n → 20; garbage order → seq; garbage seed → 0", () => {
    for (const n of ["", "abc", "7", "-1", "20.5", "1e3", "ALL"]) {
      expect(parse({ topic: "strategy-01-01", n })).toMatchObject({ n: 20 });
    }
    expect(parse({ topic: "strategy-01-01", n: "10" })).toMatchObject({ n: 10 });
    expect(parse({ topic: "strategy-01-01", order: "shuffle" })).toMatchObject({ order: "seq" });
    expect(parse({ topic: "strategy-01-01", order: "rand", seed: "x1" })).toMatchObject({ seed: 0 });
    expect(parse({ topic: "strategy-01-01", order: "rand", seed: "4294967297" })).toMatchObject({ seed: 1 });
  });

  it("ids wins over a filter; prefill=1 → null (the setup panel, Task 10)", () => {
    expect(parse({ ids: "2009h21a-q001", topic: "strategy-01-01" })).toEqual({ kind: "ids", ids: ["2009h21a-q001"] });
    expect(parse({ topic: "strategy-01-01", prefill: "1" })).toBeNull();
    expect(parse({ ids: "2009h21a-q001", prefill: "1" })).toBeNull();
  });

  it("from=today", () => {
    expect(isFromToday({ from: "today" })).toBe(true);
    expect(isFromToday({ from: ["today"] })).toBe(true);
    expect(isFromToday({ from: "x" })).toBe(false);
    expect(isFromToday({})).toBe(false);
  });
});

const S3 = (): SessionState => newSession(["a-q001", "a-q002", "a-q003"], 1000);

describe("practiceReducer (§0-13)", () => {
  it("pick records once (second pick ignored)", () => {
    const s1 = practiceReducer(S3(), { type: "pick", choice: "イ" });
    expect(s1.answers).toEqual({ "a-q001": "イ" });
    const s2 = practiceReducer(s1, { type: "pick", choice: "ア" });
    expect(s2).toBe(s1);
  });

  it("next at last → finished", () => {
    let s = S3();
    s = practiceReducer(s, { type: "next" });
    s = practiceReducer(s, { type: "next" });
    expect(s.pos).toBe(2);
    expect(s.finished).toBe(false);
    s = practiceReducer(s, { type: "next" });
    expect(s.finished).toBe(true);
    expect(s.pos).toBe(2);
    // a finished session ignores everything
    expect(practiceReducer(s, { type: "pick", choice: "ア" })).toBe(s);
    expect(practiceReducer(s, { type: "prev" })).toBe(s);
  });

  it("prev at 0 stays 0", () => {
    const s = S3();
    const p = practiceReducer(s, { type: "prev" });
    expect(p.pos).toBe(0);
    expect(p).toBe(s);
    expect(practiceReducer(practiceReducer(s, { type: "next" }), { type: "prev" }).pos).toBe(0);
  });

  it("finish → finished with the answered part; goto jumps inside the group only", () => {
    const s = practiceReducer(practiceReducer(S3(), { type: "pick", choice: "ウ" }), { type: "finish" });
    expect(s).toMatchObject({ finished: true, answers: { "a-q001": "ウ" }, pos: 0 });
    const g = practiceReducer(S3(), { type: "goto", pos: 2 });
    expect(g.pos).toBe(2);
    expect(practiceReducer(S3(), { type: "goto", pos: 3 }).pos).toBe(0);
    expect(practiceReducer(S3(), { type: "goto", pos: -1 }).pos).toBe(0);
    expect(practiceReducer(S3(), { type: "goto", pos: 1.5 }).pos).toBe(0);
  });
});

describe("keyToAction (§0-14)", () => {
  const ctx = { answered: false, editableTarget: false, dialogOpen: false };
  it('"1"→pick ア … "4"→pick エ only when unanswered; Enter→next only when answered; ArrowLeft→prev', () => {
    expect(keyToAction("1", ctx)).toEqual({ type: "pick", choice: "ア" });
    expect(keyToAction("2", ctx)).toEqual({ type: "pick", choice: "イ" });
    expect(keyToAction("3", ctx)).toEqual({ type: "pick", choice: "ウ" });
    expect(keyToAction("4", ctx)).toEqual({ type: "pick", choice: "エ" });
    expect(keyToAction("5", ctx)).toBeNull();
    expect(keyToAction("1", { ...ctx, answered: true })).toBeNull();
    expect(keyToAction("Enter", ctx)).toBeNull();
    expect(keyToAction("Enter", { ...ctx, answered: true })).toEqual({ type: "next" });
    expect(keyToAction("ArrowLeft", ctx)).toEqual({ type: "prev" });
    expect(keyToAction("ArrowRight", ctx)).toEqual({ type: "next" });
    expect(keyToAction("ArrowRight", { ...ctx, answered: true })).toEqual({ type: "next" });
    expect(keyToAction("a", ctx)).toBeNull();
    expect(keyToAction("Escape", ctx)).toBeNull(); // the figure <dialog> closes itself
  });

  it("keyToAction ignores keys from input / textarea / contenteditable and while a dialog is open", () => {
    for (const key of ["1", "4", "ArrowLeft", "ArrowRight", "Enter"]) {
      expect(keyToAction(key, { answered: true, editableTarget: true, dialogOpen: false })).toBeNull();
      expect(keyToAction(key, { answered: false, editableTarget: true, dialogOpen: false })).toBeNull();
      expect(keyToAction(key, { answered: true, editableTarget: false, dialogOpen: true })).toBeNull();
      expect(keyToAction(key, { answered: false, editableTarget: false, dialogOpen: true })).toBeNull();
    }
  });

  it("modifier chords and Enter on a live control are left to the browser", () => {
    // Alt+← is history back, Ctrl/Cmd+1 switches tabs
    expect(keyToAction("ArrowLeft", { ...ctx, modifier: true })).toBeNull();
    expect(keyToAction("1", { ...ctx, modifier: true })).toBeNull();
    // Enter on a focused (enabled) button / link activates it natively — never a second "next"
    expect(keyToAction("Enter", { ...ctx, answered: true, activatable: true })).toBeNull();
    expect(keyToAction("ArrowRight", { ...ctx, activatable: true })).toEqual({ type: "next" });
  });
});

describe("session storage (§0-13, Review Focus 5)", () => {
  const ids = ["a-q001", "a-q002", "a-q003"];
  it("sessionKey = itp:practice:v1:<fnv1a32 hex of the joined ids>", () => {
    expect(sessionKey(ids)).toBe(`itp:practice:v1:${fnv1a32(ids.join(",")).toString(16)}`);
    expect(sessionKey(ids)).not.toBe(sessionKey([...ids].reverse()));
  });

  it("loadSession restores pos/answers from storage", () => {
    const st = new MemStorage();
    let s = newSession(ids, 5000);
    s = practiceReducer(s, { type: "pick", choice: "エ" });
    s = practiceReducer(s, { type: "next" });
    saveSession(st, s);
    expect(JSON.parse(st.getItem(sessionKey(ids))!)).toEqual({ pos: 1, answers: { "a-q001": "エ" }, startedAt: 5000 });
    const r = loadSession(st, ids, 9999);
    expect(r).toEqual({
      ids,
      pos: 1,
      answers: { "a-q001": "エ" },
      startedAt: 5000,
      finished: false,
      endedAt: null,
      run: null,
    });
  });

  it("loadSession with throwing storage → fresh state", () => {
    expect(loadSession(throwing, ids, 7)).toEqual(newSession(ids, 7));
    expect(loadSession(null, ids, 7)).toEqual(newSession(ids, 7));
    expect(() => saveSession(throwing, newSession(ids, 7))).not.toThrow();
    expect(() => saveSession(null, newSession(ids, 7))).not.toThrow();
  });

  it("loadSession drops what does not fit: bad JSON, pos out of range, unknown ids, bad letters, future startedAt", () => {
    const st = new MemStorage();
    st.setItem(sessionKey(ids), "{not json");
    expect(loadSession(st, ids, 7)).toEqual(newSession(ids, 7));
    st.setItem(
      sessionKey(ids),
      `{"pos":9,"answers":{"a-q002":"イ","x-q009":"ア","a-q003":"オ","__proto__":"ア"},"startedAt":99}`,
    );
    expect(loadSession(st, ids, 50)).toEqual({ ...newSession(ids, 50), answers: { "a-q002": "イ" } });
    st.setItem(sessionKey(ids), JSON.stringify([1, 2]));
    expect(loadSession(st, ids, 7)).toEqual(newSession(ids, 7));
  });

  const KEY = new Map([
    ["a-q001", "ア"],
    ["a-q002", "イ"],
    ["a-q003", "ウ"],
  ]);

  it("finished session survives reload (summary + frozen elapsed)", () => {
    const st = new MemStorage();
    let s = applyAction(newSession(ids, 1000), { type: "pick", choice: "ア" }, KEY, 2000).next;
    saveSession(st, s);
    s = applyAction(s, { type: "finish" }, KEY, 61_000).next;
    expect(s).toMatchObject({ finished: true, endedAt: 61_000 });
    saveSession(st, s);
    expect(JSON.parse(st.getItem(sessionKey(ids))!)).toEqual({
      pos: 0,
      answers: { "a-q001": "ア" },
      startedAt: 1000,
      finished: true,
      endedAt: 61_000,
    });
    // reload much later: still the summary, elapsed = endedAt − startedAt (60 s), not now − startedAt
    const r = loadSession(st, ids, 999_000);
    expect(r).toMatchObject({ finished: true, endedAt: 61_000, startedAt: 1000, answers: { "a-q001": "ア" } });
    // a stored finished flag without a usable endedAt is not trusted
    st.setItem(
      sessionKey(ids),
      JSON.stringify({ pos: 0, answers: {}, startedAt: 1000, finished: true, endedAt: 5e15 }),
    );
    expect(loadSession(st, ids, 9000)).toMatchObject({ finished: false, endedAt: null });
  });

  it("start over clears it", () => {
    const st = new MemStorage();
    const s = applyAction(newSession(ids, 1), { type: "finish" }, KEY, 5).next;
    saveSession(st, s);
    clearSession(st, ids);
    expect(st.getItem(sessionKey(ids))).toBeNull();
    expect(loadSession(st, ids, 9)).toEqual(newSession(ids, 9));
    expect(() => clearSession(throwing, ids)).not.toThrow();
    expect(() => clearSession(null, ids)).not.toThrow();
  });

  it("retry link with run nonce gets a fresh session", () => {
    const st = new MemStorage();
    // the first run of these ids ended (stored summary)
    saveSession(st, applyAction(newSession(ids, 1), { type: "finish" }, KEY, 5).next);
    // 「只做错题再来一遍」 → same ids + &run=<endedAt>: another key, a new group
    expect(parseRun({ run: "5" })).toBe("5");
    expect(parseRun({ run: ["17", "x"] })).toBe("17");
    for (const bad of ["", "x5", "-1", "12345678901234567"]) expect(parseRun({ run: bad })).toBeNull();
    expect(parseRun({})).toBeNull();
    expect(sessionKey(ids, "5")).toBe(`${sessionKey(ids)}:5`);
    const again = loadSession(st, ids, 10, "5");
    expect(again).toEqual(newSession(ids, 10, "5"));
    saveSession(st, applyAction(again, { type: "pick", choice: "イ" }, KEY, 11).next);
    expect(loadSession(st, ids, 12, "5").answers).toEqual({ "a-q001": "イ" });
    expect(loadSession(st, ids, 12).finished).toBe(true); // the first run is untouched
  });

  it("duplicate pick after restore is rejected, so answer() is called once per question per group", () => {
    // the component calls answer() only for applyAction's `record` (an accepted pick)
    const st = new MemStorage();
    const calls: string[] = [];
    const act = (s: SessionState, a: Parameters<typeof practiceReducer>[1]): SessionState => {
      const { next, record } = applyAction(s, a, KEY, 100);
      if (record) calls.push(record.join(" "));
      saveSession(st, next);
      return next;
    };
    let s = newSession(ids, 1);
    s = act(s, { type: "pick", choice: "ア" });
    s = act(s, { type: "pick", choice: "イ" }); // double click
    // reload: same tab, same ids
    s = loadSession(st, ids, 2);
    expect(s.pos).toBe(0);
    s = act(s, { type: "pick", choice: "ウ" }); // key 3 after reload: already answered
    s = act(s, { type: "next" });
    s = act(s, { type: "pick", choice: "エ" });
    s = loadSession(st, ids, 3);
    s = act(s, { type: "pick", choice: "エ" });
    expect(s.pos).toBe(1);
    expect(calls).toEqual(["a-q001 ア true", "a-q002 エ false"]);
  });

  it("applyAction: double pick, goto then pick, endedAt stamped once", () => {
    const s0 = newSession(ids, 1);
    const a = applyAction(s0, { type: "pick", choice: "ウ" }, KEY, 2);
    expect(a.record).toEqual(["a-q001", "ウ", false]);
    const b = applyAction(a.next, { type: "pick", choice: "ア" }, KEY, 3);
    expect(b.next).toBe(a.next);
    expect(b.record).toBeUndefined();
    const g = applyAction(a.next, { type: "goto", pos: 2 }, KEY, 4);
    expect(g.record).toBeUndefined();
    expect(g.next.pos).toBe(2);
    expect(applyAction(g.next, { type: "pick", choice: "ウ" }, KEY, 5).record).toEqual(["a-q003", "ウ", true]);
    const end = applyAction(g.next, { type: "next" }, KEY, 77);
    expect(end.next).toMatchObject({ finished: true, endedAt: 77 });
    expect(applyAction(end.next, { type: "finish" }, KEY, 99).next).toBe(end.next);
    expect(applyAction(s0, { type: "prev" }, KEY, 5).next).toBe(s0);
  });
});

describe("foldPlan (§0-8 / §6.2 中問, Review Focus 4)", () => {
  const groups = [
    { key: "g1", memberIds: ["e-q081", "e-q082", "e-q083", "e-q084"], preambleChars: { jp: 120, zh: 80, en: 200 } },
    { key: "g2", memberIds: ["e-q091", "e-q092"], preambleChars: { jp: null, zh: null, en: null } },
  ];
  it("group expansion: from the 2nd member on, fold with the JP preambleChars; the 1st shows the full stem", () => {
    const ids = ["e-q001", "e-q081", "e-q082", "e-q083", "e-q084", "e-q091", "e-q092"];
    expect(foldPlan(ids, groups)).toEqual({
      "e-q082": 120,
      "e-q083": 120,
      "e-q084": 120,
    });
  });
  it("a member not preceded by its group in this session is not folded", () => {
    // e.g. a session that opens on the 3rd member (ids not expanded)
    expect(foldPlan(["e-q083", "e-q001", "e-q084"], groups)).toEqual({});
    expect(foldPlan(["e-q083", "e-q084"], groups)).toEqual({ "e-q084": 120 });
  });
});

const Q = "2009h21a-q001";
const rec = (...xs: [day: number, correct: boolean][]): LearningRecord =>
  xs.reduce((r, [d, c]) => recordAttempt(r, Q, "ア", c, at(d)), { ...emptyRecord(), v2Since: 0 } as LearningRecord);

describe("statusLine", () => {
  it("wrong → mistake line; first-ever right → 7 days; later right → next due; box 5 → mastered", () => {
    const wrong = rec([D0, false]);
    expect(statusLine(wrong.attempts[Q]!, 0, Q, false, D0, toDay)).toEqual({ kind: "wrong" });
    const first = rec([D0, true]);
    expect(statusLine(first.attempts[Q]!, 0, Q, true, D0, toDay)).toEqual({ kind: "firstRight" });
    // the attempt has not reached the record yet: still the first ever
    expect(statusLine([], 0, Q, true, D0, toDay)).toEqual({ kind: "firstRight" });
    // wrong yesterday, right today → box 1 → 3 days
    const again = rec([D0 - 1, false], [D0, true]);
    expect(statusLine(again.attempts[Q]!, 0, Q, true, D0, toDay)).toEqual({ kind: "nextIn", days: 3 });
    // right on day 0 (box 2), then box 3, 4, 5
    const m = rec([D0 - 60, true], [D0 - 50, true], [D0 - 30, true], [D0, true]);
    expect(statusLine(m.attempts[Q]!, 0, Q, true, D0, toDay)).toEqual({ kind: "mastered" });
    // a same-day repeat does not move the box: due stays from today's first attempt (wrong → 1 day)
    const rep = rec([D0 - 5, true], [D0, false], [D0, true]);
    expect(statusLine(rep.attempts[Q]!, 0, Q, true, D0, toDay)).toEqual({ kind: "nextIn", days: 1 });
  });
});

describe("recentResults (复习三格)", () => {
  it("newest first, ≤ 3; the attempt made in this session is left out (its ○ / × is on the choices)", () => {
    const r = rec([D0 - 9, false], [D0 - 5, true], [D0 - 2, true], [D0, false]);
    expect(recentResults(r.attempts[Q]!, false)).toEqual([false, true, true]);
    expect(recentResults(r.attempts[Q]!, true)).toEqual([true, true, false]);
    expect(recentResults(undefined, false)).toEqual([]);
    expect(recentResults([], true)).toEqual([]);
  });
});

describe("summarize / formatElapsed / localDateKey", () => {
  const qs = [
    { id: "a-q001", correct_answer: "ア" },
    { id: "a-q002", correct_answer: "イ" },
    { id: "a-q003", correct_answer: "ウ" },
  ];
  it("score over the answered part, wrong ids in session order", () => {
    expect(summarize(["a-q001", "a-q002", "a-q003"], { "a-q003": "ア", "a-q001": "ア", "a-q002": "エ" }, qs)).toEqual({
      total: 3,
      answered: 3,
      correct: 1,
      wrong: ["a-q002", "a-q003"],
    });
    expect(summarize(["a-q001", "a-q002", "a-q003"], { "a-q001": "ア" }, qs)).toEqual({
      total: 3,
      answered: 1,
      correct: 1,
      wrong: [],
    });
  });
  it("mm:ss, minutes past 59 keep counting", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(522_999)).toBe("08:42");
    expect(formatElapsed(-5)).toBe("00:00");
    expect(formatElapsed(75 * 60_000 + 3_000)).toBe("75:03");
  });
  it("local YYYY-MM-DD", () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("today chain (§0-26)", () => {
  const T = (n: number) => `2009h21a-q${String(n).padStart(3, "0")}`;
  const pool = {
    topicQuestionIds: { "strategy-01-01": Array.from({ length: 40 }, (_, i) => T(i + 1)) },
    groups: { g: [T(39), T(40)] },
    topicStars: { "strategy-01-01": 3 as const },
  };
  const dk = "2026-10-01";
  const wrongOn = (r: LearningRecord, id: string, d: number) => recordAttempt(r, id, "ア", false, at(d));
  const rightOn = (r: LearningRecord, id: string, d: number) => recordAttempt(r, id, "ア", true, at(d));
  const base = (): LearningRecord => ({ ...emptyRecord(), v2Since: 0 });

  it("nextTodayIds: first non-empty of mistakes → due → fresh, ≤ 20, groups whole", () => {
    let r = base();
    for (let i = 1; i <= 25; i++) r = wrongOn(r, T(i), D0 - 1);
    const next = nextTodayIds(r, pool, D0, toDay, dk)!;
    expect(next).toEqual(Array.from({ length: 20 }, (_, i) => T(i + 1)));
    // mistakes done today (answered right) → the rest of the mistakes
    for (let i = 1; i <= 20; i++) r = rightOn(r, T(i), D0);
    expect(nextTodayIds(r, pool, D0, toDay, dk)).toEqual([T(21), T(22), T(23), T(24), T(25)]);
    // a review list that ends on a group member pulls the whole group in (may exceed 20)
    let g = base();
    for (let i = 22; i <= 39; i++) g = wrongOn(g, T(i), D0 - 1);
    for (let i = 1; i <= 2; i++) g = wrongOn(g, T(i), D0 - 1);
    const withGroup = nextTodayIds(g, pool, D0, toDay, dk)!;
    expect(withGroup.slice(0, 2)).toEqual([T(1), T(2)]);
    expect(withGroup).toContain(T(40));
    expect(withGroup.length).toBe(21);
  });

  it("nextTodayIds: nothing left today → null", () => {
    let r = setTargetZero(base());
    expect(nextTodayIds(r, pool, D0, toDay, dk)).toBeNull();
    r = wrongOn(r, T(1), D0);
    expect(nextTodayIds(r, pool, D0, toDay, dk)).toBeNull(); // wrong today → due tomorrow
  });

  it("nextTodayGroup: the kind travels with the ids (nextTodayIds = its ids)", () => {
    let r = base();
    for (let i = 1; i <= 3; i++) r = wrongOn(r, T(i), D0 - 1);
    expect(nextTodayGroup(r, pool, D0, toDay, dk)).toEqual({ kind: "mistakes", ids: [T(1), T(2), T(3)] });
    let d = base();
    for (let i = 10; i <= 12; i++) d = rightOn(d, T(i), D0 - 8);
    expect(nextTodayGroup(setTargetZero(d), pool, D0, toDay, dk)).toEqual({ kind: "due", ids: [T(10), T(11), T(12)] });
    const fresh = nextTodayGroup(base(), pool, D0, toDay, dk)!;
    expect(fresh.kind).toBe("fresh");
    expect(fresh.ids).toEqual(nextTodayIds(base(), pool, D0, toDay, dk));
    expect(nextTodayGroup(setTargetZero(base()), pool, D0, toDay, dk)).toBeNull();
  });

  it("todayHref: /practice?ids=…&from=today&kind=<kind>", () => {
    expect(todayHref("due", [T(1), T(2)])).toBe(`/practice?ids=${T(1)},${T(2)}&from=today&kind=due`);
  });

  it("parseKind: mistakes | due | fresh, anything else → null", () => {
    expect(parseKind({ kind: "mistakes" })).toBe("mistakes");
    expect(parseKind({ kind: "due" })).toBe("due");
    expect(parseKind({ kind: ["fresh", "due"] })).toBe("fresh");
    expect(parseKind({ kind: "new" })).toBeNull();
    expect(parseKind({ kind: "unit" })).toBeNull();
    expect(parseKind({ kind: "__proto__" })).toBeNull();
    expect(parseKind({})).toBeNull();
  });

  it("todayKind: the kind most of the session's ids had at the start of today", () => {
    let r = base();
    for (let i = 1; i <= 5; i++) r = wrongOn(r, T(i), D0 - 1);
    const ids = [T(1), T(2), T(3), T(4), T(5)];
    expect(todayKind(r, pool, ids, D0, toDay, dk)).toBe("mistakes");
    // answering them today does not change the label (reload mid-session)
    for (let i = 1; i <= 5; i++) r = rightOn(r, T(i), D0);
    expect(todayKind(r, pool, ids, D0, toDay, dk)).toBe("mistakes");
    // due reviews: right 7+ days ago
    let d = base();
    for (let i = 10; i <= 12; i++) d = rightOn(d, T(i), D0 - 8);
    expect(todayKind(d, pool, [T(10), T(11), T(12)], D0, toDay, dk)).toBe("due");
    // new user: fresh
    const fresh = nextTodayIds(base(), pool, D0, toDay, dk)!;
    expect(todayKind(base(), pool, fresh, D0, toDay, dk)).toBe("fresh");
    expect(todayKind(base(), pool, ["zzz-q001"], D0, toDay, dk)).toBeNull();
  });
});

function setTargetZero(r: LearningRecord): LearningRecord {
  return { ...r, settings: { ...r.settings, dailyNewTarget: { value: 0, at: 1 } } };
}
