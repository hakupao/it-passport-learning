// Stage 7 Phase 1 Task 10 (D-189 §6.2 / D-190 §0-12) — the setup panel's pure layer: settings → URL,
// record-derived scopes (mistakes / due / random), last-settings storage, URL pre-selection.
// `toDay` is the UTC day so results do not depend on the machine's time zone.

import { describe, expect, it } from "vitest";

import { emptyRecord, recordAttempt, type LearningRecord } from "../../learning/record";
import type { QuestionPool } from "../../learning/schedule";
import type { StorageLike } from "../../storage";
import {
  DEFAULT_SETTINGS,
  LAST_SETTINGS_KEY,
  dueIds,
  filterHref,
  idsHref,
  loadLastSettings,
  mistakeIds,
  parseLastSettings,
  prefillOf,
  randomIds,
  saveLastSettings,
  serializeSettings,
  settingsFromPrefill,
  setupHref,
  withNonce,
  type SetupSettings,
} from "../practiceSetup";
import { MAX_SCOPE_IDS } from "../practiceSession";

const DAY = 86_400_000;
const toDay = (at: number): number => Math.floor(at / DAY);
const D0 = toDay(Date.UTC(2026, 9, 1));
const at = (d: number, hh = 10): number => d * DAY + hh * 3_600_000;

const qid = (exam: string, n: number) => `${exam}-q${String(n).padStart(3, "0")}`;
const S = Array.from({ length: 60 }, (_, i) => qid("2009h21a", i + 1));
const T = Array.from({ length: 80 }, (_, i) => qid("2010h22h", i + 1));
const M = Array.from({ length: 40 }, (_, i) => qid("2011h23a", i + 1));
const POOL: QuestionPool = {
  topicQuestionIds: { "strategy-01-01": S, "technology-12-03": T, "management-08-20": M },
  groups: { g1: [T[10]!, T[11]!, T[12]!] },
  topicStars: { "strategy-01-01": 3, "technology-12-03": 2, "management-08-20": 1 },
};
const TOPICS = new Set(Object.keys(POOL.topicQuestionIds));
const EXAMS = new Set(["2009h21a", "2010h22h", "2011h23a"]);

const s = (over: Partial<SetupSettings>): SetupSettings => ({ ...DEFAULT_SETTINGS, ...over });
const answer = (r: LearningRecord, id: string, correct: boolean, day: number): LearningRecord =>
  recordAttempt(r, id, correct ? "ア" : "イ", correct, at(day));

class MemStorage implements StorageLike {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}
const throwing: StorageLike = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("quota");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("filterHref (§0-12 filter URL)", () => {
  it("setup submit builds /practice?topic=…&n=20&order=seq", () => {
    expect(filterHref(s({ topics: ["strategy-01-01", "technology-12-03"] }), 7)).toBe(
      "/practice?topic=strategy-01-01,technology-12-03&n=20&order=seq",
    );
  });
  it("order=rand carries the seed; n=all; run appended", () => {
    expect(filterHref(s({ kind: "exam", exam: "2010h22h", n: "all", order: "rand" }), 42, 1761200000000)).toBe(
      "/practice?exam=2010h22h&n=all&order=rand&seed=42&run=1761200000000",
    );
  });
  it("nothing chosen → null", () => {
    expect(filterHref(s({ topics: [] }), 1)).toBeNull();
    expect(filterHref(s({ kind: "exam", exam: null }), 1)).toBeNull();
    expect(filterHref(s({ kind: "mistakes" }), 1)).toBeNull();
  });
});

describe("idsHref", () => {
  it("keeps the order for seq and cuts at n", () => {
    expect(idsHref(S.slice(0, 15), 10, "seq", 1)).toBe(`/practice?ids=${S.slice(0, 10).join(",")}`);
  });
  it("全部 = at most MAX_SCOPE_IDS; empty → null", () => {
    const all = [...S, ...T];
    const href = idsHref(all, "all", "seq", 1)!;
    expect(href.slice("/practice?ids=".length).split(",")).toHaveLength(MAX_SCOPE_IDS);
    expect(idsHref([], 20, "seq", 1)).toBeNull();
  });
  it("rand is a seeded permutation of the list", () => {
    const a = idsHref(S.slice(0, 20), 20, "rand", 5)!.split("=")[1]!.split(",");
    const b = idsHref(S.slice(0, 20), 20, "rand", 5)!.split("=")[1]!.split(",");
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(S.slice(0, 20));
    expect(a).not.toEqual(S.slice(0, 20));
  });
});

describe("mistakeIds / dueIds", () => {
  // S[0]: wrong on D0 (due D0+1); S[1]: wrong on D0-3 (due D0-2); S[2]: right D0-10 (box 2, due D0-3)
  // S[3]: right D0-1 (due D0+6, scheduled); T[0]: wrong today (due tomorrow, still a mistake)
  // "x-q001": not in the pool
  let r = emptyRecord();
  r = answer(r, S[0]!, false, D0 - 1);
  r = answer(r, S[1]!, false, D0 - 3);
  r = answer(r, S[2]!, true, D0 - 10);
  r = answer(r, S[3]!, true, D0 - 1);
  r = answer(r, T[0]!, false, D0);
  r = answer(r, "x-q001", false, D0 - 5);

  it("mistakes: every current mistake, also not yet due, by (due, id)", () => {
    expect(mistakeIds(r, POOL, D0, toDay)).toEqual([S[1], S[0], T[0]]);
  });
  it("due: reviews due today or earlier only", () => {
    expect(dueIds(r, POOL, D0, toDay)).toEqual([S[2]]);
  });
  it("setupHref for mistakes / due uses the ids form", () => {
    const ctx = { record: r, pool: POOL, today: D0, toDay, seed: 3 };
    expect(setupHref(s({ kind: "mistakes" }), ctx)).toBe(`/practice?ids=${S[1]},${S[0]},${T[0]}`);
    expect(setupHref(s({ kind: "due", n: 10 }), ctx)).toBe(`/practice?ids=${S[2]}`);
    expect(setupHref(s({ kind: "due" }), { ...ctx, record: emptyRecord() })).toBeNull();
  });
});

describe("randomIds", () => {
  it("never-answered only, seeded, chumon groups whole", () => {
    let r = emptyRecord();
    for (const id of S.slice(0, 50)) r = answer(r, id, true, D0 - 2);
    const a = randomIds(r, POOL, 30, 11);
    expect(a).toEqual(randomIds(r, POOL, 30, 11));
    expect(a).not.toEqual(randomIds(r, POOL, 30, 12));
    expect(a.every((id) => !S.slice(0, 50).includes(id))).toBe(true);
    expect(new Set(a).size).toBe(a.length);
    const g = a.indexOf(T[10]!) >= 0 ? a.indexOf(T[10]!) : a.indexOf(T[11]!) >= 0 ? a.indexOf(T[11]!) : a.indexOf(T[12]!);
    if (g >= 0) expect(a.slice(g, g + 3)).toEqual([T[10], T[11], T[12]]);
  });
  it("setupHref random: ≤ MAX_SCOPE_IDS ids for 全部", () => {
    const href = setupHref(s({ kind: "random", n: "all" }), {
      record: emptyRecord(),
      pool: POOL,
      today: D0,
      toDay,
      seed: 9,
    })!;
    const ids = href.slice("/practice?ids=".length).split(",");
    expect(ids.length).toBeGreaterThan(90);
    expect(ids.length).toBeLessThanOrEqual(MAX_SCOPE_IDS);
  });
});

describe("last settings (itp:practice:last:v1)", () => {
  it("round-trips through storage", () => {
    const st = new MemStorage();
    const v = s({ topics: ["technology-12-03"], n: 50, order: "rand" });
    saveLastSettings(st, v);
    expect(st.m.has(LAST_SETTINGS_KEY)).toBe(true);
    expect(loadLastSettings(st, TOPICS, EXAMS)).toEqual(v);
  });
  it("rejects malformed JSON / wrong version / bad fields", () => {
    expect(parseLastSettings(null, TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings("{", TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings("[]", TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings(JSON.stringify({ v: 2, kind: "due", n: 20, order: "seq" }), TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings(JSON.stringify({ v: 1, kind: "all", n: 20, order: "seq" }), TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings(JSON.stringify({ v: 1, kind: "due", n: 30, order: "seq" }), TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings(JSON.stringify({ v: 1, kind: "due", n: 20, order: "x" }), TOPICS, EXAMS)).toBeNull();
  });
  it("drops unknown topics / exam; an emptied scope → null", () => {
    const raw = serializeSettings(s({ topics: ["gone-01-01", "strategy-01-01"] }));
    expect(parseLastSettings(raw, TOPICS, EXAMS)!.topics).toEqual(["strategy-01-01"]);
    expect(parseLastSettings(serializeSettings(s({ topics: ["gone-01-01"] })), TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings(serializeSettings(s({ kind: "exam", exam: "1999x" })), TOPICS, EXAMS)).toBeNull();
    expect(parseLastSettings(serializeSettings(s({ kind: "due", topics: ["strategy-01-01"] })), TOPICS, EXAMS)).toEqual(
      s({ kind: "due" }),
    );
  });
  it("unusable storage never throws", () => {
    expect(loadLastSettings(throwing, TOPICS, EXAMS)).toBeNull();
    expect(() => saveLastSettings(throwing, DEFAULT_SETTINGS)).not.toThrow();
    expect(loadLastSettings(null, TOPICS, EXAMS)).toBeNull();
  });
});

describe("prefillOf / settingsFromPrefill", () => {
  it("?topic=X&prefill=1 pre-selects X; unknown dropped", () => {
    const p = prefillOf({ topic: "strategy-01-01,nope,strategy-01-01", prefill: "1" }, TOPICS, EXAMS);
    expect(p).toEqual({ topics: ["strategy-01-01"], exam: null });
    expect(settingsFromPrefill(p)).toEqual(s({ kind: "topic", topics: ["strategy-01-01"] }));
  });
  it("?exam=Y pre-selects the year with 全部; nothing → defaults", () => {
    const p = prefillOf({ exam: "2010h22h", prefill: "1" }, TOPICS, EXAMS);
    expect(settingsFromPrefill(p)).toEqual(s({ kind: "exam", exam: "2010h22h", n: "all" }));
    expect(settingsFromPrefill(prefillOf({ exam: "zzz" }, TOPICS, EXAMS))).toEqual(DEFAULT_SETTINGS);
  });
});

describe("withNonce (links that start a group)", () => {
  it("appends run (and a seed when asked) to a practice URL", () => {
    expect(withNonce("/practice?ids=a-q001", 1761200000000)).toBe("/practice?ids=a-q001&run=1761200000000");
    expect(withNonce("/practice?topic=t&n=10&order=rand", 5, 0xffffffff + 3)).toBe(
      "/practice?topic=t&n=10&order=rand&seed=2&run=5",
    );
  });
});
