// D-180 §0-6 / D-190 — localStorage persistence of the learning record.
// v2 lives at itp:learn:v2. An unparseable v2 value is never silently dropped:
// its raw string is kept under itp:learn:v2:corrupt (first bad copy wins).
// itp:learn:v1 is what old (pre-Stage-7) tabs still write: it is read, upgraded
// (upgradeV1, v2Since = now) and merged in — at load and on its storage event —
// but never written, copied or deleted (Review Focus 1). Storage that throws
// (private mode / quota) behaves as no storage and never crashes. Writes merge
// with the stored v2 value and other tabs' writes merge in via the storage
// event, so two open tabs never drop each other's answers.
import { describe, expect, it } from "vitest";

import { applyStorageEvent, LEARNING_CORRUPT_KEY, loadLocal, saveLocal } from "../localStore";
import {
  emptyRecord,
  encodeRecord,
  LEARNING_STORAGE_KEY,
  mergeRecords,
  recordAttempt,
  type Attempt,
  type LearningRecord,
} from "../record";
import { LEARNING_V1_STORAGE_KEY, upgradeV1, type LearningRecordV1 } from "../recordV1";
import type { StorageLike } from "@/lib/storage";

function memStorage(seed: Record<string, string> = {}): StorageLike & { map: Map<string, string>; writes: string[] } {
  const map = new Map(Object.entries(seed));
  const writes: string[] = [];
  return {
    map,
    writes,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      writes.push(k);
      map.set(k, v);
    },
    removeItem: (k) => {
      writes.push(`-${k}`);
      map.delete(k);
    },
  };
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

const NOW = 1_760_000_000_000;
const V2 = "itp:learn:v2";
const V1 = "itp:learn:v1";

const att = (at: number, choice: Attempt["choice"], correct: boolean, src: Attempt["src"] = "practice"): Attempt => ({
  at,
  choice,
  correct,
  src,
});

const REC: LearningRecord = mergeRecords(
  {
    v: 2,
    attempts: {
      "2009h21a-q054": [att(1_700_000_000_000, "ア", false)],
      "2024r06-q001": [att(1_700_000_000_500, "エ", true), att(1_700_000_000_100, "イ", false)],
    },
    unitsRead: { "t-01-01": 1_690_000_000_000 },
    settings: { dailyReviewCap: { value: 40, at: 1_700_000_000_000 } },
    v2Since: 1_690_000_000_000,
  },
  emptyRecord(),
);

const wire = (r: LearningRecord): string => JSON.stringify(encodeRecord(r));

/** What an old v1 tab writes. */
const OLD_TAB: LearningRecordV1 = {
  v: 1,
  questions: {
    "2016h28h-q033": { choice: "ウ", correct: false, at: 1_650_000_000_000 },
    "2009h21a-q054": { choice: "イ", correct: true, at: 1_700_000_009_000 },
  },
  unitsRead: { "t-02-01": 1_640_000_000_000 },
};

describe("localStore", () => {
  it("uses the itp:learn:v2 key and a :corrupt sibling", () => {
    expect(LEARNING_STORAGE_KEY).toBe(V2);
    expect(LEARNING_CORRUPT_KEY).toBe("itp:learn:v2:corrupt");
    expect(LEARNING_V1_STORAGE_KEY).toBe(V1);
  });

  it("nothing stored → emptyRecord()", () => {
    expect(loadLocal(memStorage(), NOW)).toEqual(emptyRecord());
  });

  it("saveLocal then loadLocal round-trips deep-equal; the stored value is v2 wire", () => {
    const s = memStorage();
    saveLocal(s, REC);
    expect(s.map.get(V2)).toBe(wire(REC));
    expect(loadLocal(s, NOW)).toEqual(REC);
    expect(s.writes).toEqual([V2]);
  });

  it('a corrupt v2 value is copied to itp:learn:v2:corrupt once ("{bad", schema failures, v1 JSON at the v2 key)', () => {
    for (const bad of ["{bad", "[]", "42", '{"v":2}', JSON.stringify(OLD_TAB), '{"v":2,"a":{"q":[[1,4,0,"p"]]},"u":{},"s":{}}']) {
      const s = memStorage({ [V2]: bad });
      expect(loadLocal(s, NOW)).toEqual(emptyRecord());
      expect(s.map.get("itp:learn:v2:corrupt")).toBe(bad);
      expect(s.map.get(V2)).toBe(bad); // load itself never rewrites the main key
      // a second load does not copy again
      loadLocal(s, NOW);
      expect(s.writes).toEqual(["itp:learn:v2:corrupt"]);
    }
  });

  it("an existing :corrupt copy is kept (first bad copy wins)", () => {
    const s = memStorage({ [V2]: "{second", "itp:learn:v2:corrupt": "{first" });
    expect(loadLocal(s, NOW)).toEqual(emptyRecord());
    expect(s.map.get("itp:learn:v2:corrupt")).toBe("{first");
    expect(s.writes).toEqual([]);
  });

  it("a valid stored record leaves :corrupt untouched", () => {
    const s = memStorage({ [V2]: wire(REC) });
    expect(loadLocal(s, NOW)).toEqual(REC);
    expect(s.map.has("itp:learn:v2:corrupt")).toBe(false);
  });

  it("throwing storage: loadLocal → emptyRecord(), saveLocal does not throw", () => {
    expect(loadLocal(throwing, NOW)).toEqual(emptyRecord());
    expect(() => saveLocal(throwing, REC)).not.toThrow();
    expect(saveLocal(throwing, REC)).toEqual(REC);
  });

  it("setItem throwing while copying the corrupt value does not crash the load", () => {
    const s = memStorage({ [V2]: "{bad" });
    s.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    expect(loadLocal(s, NOW)).toEqual(emptyRecord());
  });
});

describe("the v1 key an old tab writes (read-only, Review Focus 1)", () => {
  it("loadLocal merges an old tab's itp:learn:v1 write (upgraded with v2Since = now)", () => {
    const v1Raw = JSON.stringify(OLD_TAB);
    const s = memStorage({ [V2]: wire(REC), [V1]: v1Raw });
    const loaded = loadLocal(s, NOW);
    expect(loaded).toEqual(mergeRecords(REC, upgradeV1(OLD_TAB, NOW)));
    // the v1 answers are there, next to the v2 attempts
    expect(loaded.attempts["2016h28h-q033"]).toEqual([att(1_650_000_000_000, "ウ", false, "v1")]);
    expect(loaded.attempts["2009h21a-q054"]).toEqual([
      att(1_700_000_009_000, "イ", true, "v1"),
      att(1_700_000_000_000, "ア", false),
    ]);
    expect(loaded.unitsRead).toEqual({ "t-01-01": 1_690_000_000_000, "t-02-01": 1_640_000_000_000 });
    // the earlier v2Since wins
    expect(loaded.v2Since).toBe(1_690_000_000_000);
    // the v1 key is neither rewritten, copied nor removed
    expect(s.map.get(V1)).toBe(v1Raw);
    expect(s.writes).toEqual([]);
  });

  it("only the v1 key stored → its upgrade, v2Since = now", () => {
    const s = memStorage({ [V1]: JSON.stringify(OLD_TAB) });
    expect(loadLocal(s, NOW)).toEqual(upgradeV1(OLD_TAB, NOW));
    expect(loadLocal(s, NOW).v2Since).toBe(NOW);
  });

  it("an answer lands in itp:learn:v2; itp:learn:v1 stays byte-identical", () => {
    const v1Raw = JSON.stringify(OLD_TAB);
    const s = memStorage({ [V1]: v1Raw });
    const loaded = loadLocal(s, NOW);
    const answered = recordAttempt(loaded, "2024r06-q001", "ウ", true, NOW + 1000);
    const written = saveLocal(s, answered);
    expect(s.writes).toEqual([V2]);
    expect(s.map.get(V1)).toBe(v1Raw);
    expect(s.map.get(V2)).toBe(wire(written));
    expect(loadLocal(s, NOW + 5000).attempts["2024r06-q001"]).toEqual([att(NOW + 1000, "ウ", true)]);
    // the old tab's answers went along into v2
    expect(Object.keys(JSON.parse(s.map.get(V2)!).a).sort()).toEqual(["2009h21a-q054", "2016h28h-q033", "2024r06-q001"]);
  });

  it("a v1 answer equal to a v2 attempt on (at, choice, correct) dedupes to the practice one", () => {
    const at = 1_700_000_000_000;
    const v2 = recordAttempt(emptyRecord(), "q", "ア", false, at);
    const s = memStorage({
      [V2]: wire(v2),
      [V1]: JSON.stringify({ v: 1, questions: { q: { choice: "ア", correct: false, at } }, unitsRead: {} }),
    });
    expect(loadLocal(s, NOW).attempts.q).toEqual([att(at, "ア", false, "practice")]);
  });

  it("an invalid v1 value is ignored and left alone (no copy, no write)", () => {
    for (const bad of ["{bad", "[]", '{"v":1}', wire(REC)]) {
      const s = memStorage({ [V2]: wire(REC), [V1]: bad });
      expect(loadLocal(s, NOW)).toEqual(REC);
      expect(s.writes).toEqual([]);
      expect(s.map.get(V1)).toBe(bad);
    }
  });

  it("storage event on itp:learn:v1 key is merged (upgraded with the event's now)", () => {
    const next = applyStorageEvent(REC, { key: V1, newValue: JSON.stringify(OLD_TAB) }, NOW);
    expect(next).toEqual(mergeRecords(REC, upgradeV1(OLD_TAB, NOW)));
    expect(next.v2Since).toBe(REC.v2Since); // earlier since kept
    // the same v1 value again adds nothing → same object, even at a later now
    expect(applyStorageEvent(next, { key: V1, newValue: JSON.stringify(OLD_TAB) }, NOW + 60_000)).toBe(next);
  });
});

describe("multi-tab safety (merge on write + storage event)", () => {
  const Q1 = recordAttempt(emptyRecord(), "q1", "ア", true, 10);
  const Q2: LearningRecord = { ...recordAttempt(emptyRecord(), "q2", "イ", false, 20), unitsRead: { u: 5 } };

  it("saveLocal merges with what is stored: another tab's q1 survives this tab's q2", () => {
    const s = memStorage({ [V2]: wire(Q1) });
    const written = saveLocal(s, Q2);
    const stored = loadLocal(s, NOW);
    expect(Object.keys(stored.attempts).sort()).toEqual(["q1", "q2"]);
    expect(stored).toEqual(mergeRecords(Q1, Q2));
    expect(written).toEqual(stored);
    // canonical string, so an identical re-save does not change the stored value
    expect(s.map.get(V2)).toBe(wire(mergeRecords(Q1, Q2)));
    saveLocal(s, Q2);
    expect(s.map.get(V2)).toBe(wire(mergeRecords(Q1, Q2)));
  });

  it("saveLocal over a corrupt stored value keeps the backup and writes the in-memory record", () => {
    const s = memStorage({ [V2]: "{bad" });
    saveLocal(s, Q2);
    expect(s.map.get("itp:learn:v2:corrupt")).toBe("{bad");
    expect(loadLocal(s, NOW)).toEqual(mergeRecords(Q2, emptyRecord()));
  });

  it("applyStorageEvent merges another tab's itp:learn:v2 value into state", () => {
    const next = applyStorageEvent(Q2, { key: V2, newValue: wire(Q1) }, NOW);
    expect(next).toEqual(mergeRecords(Q1, Q2));
  });

  it("applyStorageEvent returns prev unchanged for other keys, clear(), removal, bad values, or no news", () => {
    expect(applyStorageEvent(Q2, { key: "itp:theme:v1", newValue: wire(Q1) }, NOW)).toBe(Q2);
    expect(applyStorageEvent(Q2, { key: "itp:learn:v2:corrupt", newValue: wire(Q1) }, NOW)).toBe(Q2);
    expect(applyStorageEvent(Q2, { key: null, newValue: null }, NOW)).toBe(Q2);
    for (const key of [V2, V1]) {
      expect(applyStorageEvent(Q2, { key, newValue: null }, NOW)).toBe(Q2);
      expect(applyStorageEvent(Q2, { key, newValue: "{bad" }, NOW)).toBe(Q2);
      expect(applyStorageEvent(Q2, { key, newValue: '{"v":3}' }, NOW)).toBe(Q2);
    }
    // a v2 value under the v1 key (or v1 under the v2 key) is not accepted
    expect(applyStorageEvent(Q2, { key: V1, newValue: wire(Q1) }, NOW)).toBe(Q2);
    expect(applyStorageEvent(Q2, { key: V2, newValue: JSON.stringify(OLD_TAB) }, NOW)).toBe(Q2);
    // the other tab's value adds nothing new → same object (no re-render / re-save)
    const merged = mergeRecords(Q1, Q2);
    expect(applyStorageEvent(merged, { key: V2, newValue: wire(Q1) }, NOW)).toBe(merged);
  });
});
