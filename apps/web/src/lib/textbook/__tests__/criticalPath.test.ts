// Stage 7 Phase 3 Task 7 (D-196 §0-11, Review Focus 6) — critical path, against hand-computed
// arrow diagrams: a single path, two parallel critical paths, one with a dummy activity, and a
// duration change that moves the critical path.
import { describe, expect, it } from "vitest";

import { criticalPath, criticalPaths } from "../criticalPath";

describe("criticalPath — hand-computed", () => {
  it("single path: 1 →(3) 2 →(4) 3", () => {
    const r = criticalPath(["1", "2", "3"], [
      { from: "1", to: "2", days: 3 },
      { from: "2", to: "3", days: 4 },
    ]);
    expect(r.total).toBe(7);
    expect(r.critical).toEqual([0, 1]);
    expect(r.es).toEqual({ 1: 0, 2: 3, 3: 7 });
    expect(r.lf).toEqual({ 1: 0, 2: 3, 3: 7 });
  });

  it("two parallel critical paths (1-2-4 and 1-3-4 both 6 days), a slack activity 1→4", () => {
    const acts = [
      { from: "1", to: "2", days: 2 },
      { from: "1", to: "3", days: 3 },
      { from: "2", to: "4", days: 4 },
      { from: "3", to: "4", days: 3 },
      { from: "1", to: "4", days: 5 },
    ];
    const r = criticalPath(["1", "2", "3", "4"], acts);
    expect(r.total).toBe(6);
    expect(r.critical).toEqual([0, 1, 2, 3]);
    expect(r.es).toEqual({ 1: 0, 2: 2, 3: 3, 4: 6 });
    expect(r.lf).toEqual({ 1: 0, 2: 2, 3: 3, 4: 6 });
    expect(criticalPaths(["1", "2", "3", "4"], acts, r)).toEqual([
      [0, 2],
      [1, 3],
    ]);
  });

  // The v2 sample's network (management-10-27-u03 軽減): A 1→2 (3), B 1→3 (2), C 2→4 (4),
  // D 3→4 (4), dummy 2→3. ES: 1=0, 2=3, 3=max(2, 3+0)=3, 4=7. LF: 4=7, 3=3, 2=min(3, 3)=3, 1=0.
  const SAMPLE = {
    nodes: ["1", "2", "3", "4"],
    acts: [
      { from: "1", to: "2", days: 3, name: "A" },
      { from: "1", to: "3", days: 2, name: "B" },
      { from: "2", to: "4", days: 4, name: "C" },
      { from: "3", to: "4", days: 4, name: "D" },
      { from: "2", to: "3", days: 0, dummy: true },
    ],
  };

  it("with a dummy activity: the dummy carries A's finish into D (A-C and A-dummy-D are critical)", () => {
    const r = criticalPath(SAMPLE.nodes, SAMPLE.acts);
    expect(r.total).toBe(7);
    expect(r.critical).toEqual([0, 2, 3, 4]);
    expect(r.es).toEqual({ 1: 0, 2: 3, 3: 3, 4: 7 });
    expect(r.lf).toEqual({ 1: 0, 2: 3, 3: 3, 4: 7 });
    expect(criticalPaths(SAMPLE.nodes, SAMPLE.acts, r)).toEqual([
      [0, 2],
      [0, 4, 3],
    ]);
  });

  it("B 2 → 5 days moves the critical path to B-D (total 9)", () => {
    const acts = SAMPLE.acts.map((a) => (a.name === "B" ? { ...a, days: 5 } : a));
    const r = criticalPath(SAMPLE.nodes, acts);
    expect(r.total).toBe(9);
    expect(r.critical).toEqual([1, 3]);
    expect(r.es).toEqual({ 1: 0, 2: 3, 3: 5, 4: 9 });
    expect(r.lf).toEqual({ 1: 0, 2: 5, 3: 5, 4: 9 });
    expect(criticalPaths(SAMPLE.nodes, acts, r)).toEqual([[1, 3]]);
  });
});

describe("criticalPath — invalid networks throw RangeError", () => {
  it("cycle", () => {
    expect(() =>
      criticalPath(["1", "2", "3"], [
        { from: "1", to: "2", days: 1 },
        { from: "2", to: "3", days: 1 },
        { from: "3", to: "2", days: 1 },
      ]),
    ).toThrow(RangeError);
  });

  it("not connected", () => {
    expect(() => criticalPath(["1", "2", "3"], [{ from: "1", to: "2", days: 1 }])).toThrow(RangeError);
  });

  it("no nodes, fractional days", () => {
    expect(() => criticalPath([], [])).toThrow(RangeError);
    expect(() => criticalPath(["1", "2"], [{ from: "1", to: "2", days: 1.5 }])).toThrow(RangeError);
  });

  it("unknown node, negative days", () => {
    expect(() => criticalPath(["1", "2"], [{ from: "1", to: "9", days: 1 }])).toThrow(RangeError);
    expect(() => criticalPath(["1", "2"], [{ from: "1", to: "2", days: -1 }])).toThrow(RangeError);
  });
});
