// D-180 §0-6 — localStorage persistence of the learning record (key itp:learn:v1).
// An unparseable stored value is never silently dropped: its raw string is kept
// under itp:learn:v1:corrupt (first bad copy wins). Storage that throws (private
// mode / quota) behaves as no storage and never crashes.
import { describe, expect, it } from "vitest";

import { LEARNING_CORRUPT_KEY, loadLocal, saveLocal } from "../localStore";
import { emptyRecord, LEARNING_STORAGE_KEY, type LearningRecord } from "../record";
import type { StorageLike } from "@/lib/storage";

function memStorage(seed: Record<string, string> = {}): StorageLike & { map: Map<string, string> } {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
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

const REC: LearningRecord = {
  v: 1,
  questions: {
    "2009h21a-q054": { choice: "ア", correct: false, at: 1_700_000_000_000 },
    "2024r06-q001": { choice: "エ", correct: true, at: 1_700_000_000_500 },
  },
  unitsRead: { "t-01-01": 1_690_000_000_000 },
};

describe("localStore", () => {
  it("uses the itp:learn:v1 key and a :corrupt sibling", () => {
    expect(LEARNING_STORAGE_KEY).toBe("itp:learn:v1");
    expect(LEARNING_CORRUPT_KEY).toBe("itp:learn:v1:corrupt");
  });

  it("nothing stored → emptyRecord()", () => {
    expect(loadLocal(memStorage())).toEqual(emptyRecord());
  });

  it("saveLocal then loadLocal round-trips deep-equal", () => {
    const s = memStorage();
    saveLocal(s, REC);
    expect(JSON.parse(s.map.get("itp:learn:v1")!)).toEqual(REC);
    expect(loadLocal(s)).toEqual(REC);
  });

  it('bad JSON "{bad" → emptyRecord() and the raw string is copied to :corrupt', () => {
    const s = memStorage({ "itp:learn:v1": "{bad" });
    expect(loadLocal(s)).toEqual(emptyRecord());
    expect(s.map.get("itp:learn:v1:corrupt")).toBe("{bad");
    expect(s.map.get("itp:learn:v1")).toBe("{bad"); // load itself never rewrites the main key
  });

  it("valid JSON that fails the schema is treated the same way", () => {
    for (const bad of ['{"v":2,"questions":{},"unitsRead":{}}', "[]", "42", '{"v":1,"questions":{"q":{"choice":"ア","correct":true,"at":-1}},"unitsRead":{}}']) {
      const s = memStorage({ "itp:learn:v1": bad });
      expect(loadLocal(s)).toEqual(emptyRecord());
      expect(s.map.get("itp:learn:v1:corrupt")).toBe(bad);
    }
  });

  it("an existing :corrupt copy is kept (first bad copy wins)", () => {
    const s = memStorage({ "itp:learn:v1": "{second", "itp:learn:v1:corrupt": "{first" });
    expect(loadLocal(s)).toEqual(emptyRecord());
    expect(s.map.get("itp:learn:v1:corrupt")).toBe("{first");
  });

  it("a valid stored record leaves :corrupt untouched", () => {
    const s = memStorage({ "itp:learn:v1": JSON.stringify(REC) });
    expect(loadLocal(s)).toEqual(REC);
    expect(s.map.has("itp:learn:v1:corrupt")).toBe(false);
  });

  it("throwing storage: loadLocal → emptyRecord(), saveLocal does not throw", () => {
    expect(loadLocal(throwing)).toEqual(emptyRecord());
    expect(() => saveLocal(throwing, REC)).not.toThrow();
  });

  it("setItem throwing while copying the corrupt value does not crash the load", () => {
    const s = memStorage({ "itp:learn:v1": "{bad" });
    s.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    expect(loadLocal(s)).toEqual(emptyRecord());
  });
});
