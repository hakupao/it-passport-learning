// Stage 7 Phase 3 Task 7 (D-196 §0-11) — step-figure state: bounds, replay, reduced motion.
import { describe, expect, it } from "vitest";

import { isLastStep, stepInitial, stepNext, stepPrev, stepReplay } from "../stepState";

describe("stepState", () => {
  it("cannot go back from the first step", () => {
    expect(stepPrev(0)).toBe(0);
    expect(stepPrev(2)).toBe(1);
  });

  it("next stops at the last step", () => {
    expect(stepNext(0, 3)).toBe(1);
    expect(stepNext(2, 3)).toBe(2);
    expect(stepNext(3, 4)).toBe(3);
  });

  it("「もう一度」 on the last step returns to the first", () => {
    expect(isLastStep(3, 4)).toBe(true);
    expect(isLastStep(2, 4)).toBe(false);
    expect(stepReplay()).toBe(0);
  });

  it("initial step: the first, or the last under prefers-reduced-motion", () => {
    expect(stepInitial(4, false)).toBe(0);
    expect(stepInitial(4, true)).toBe(3);
    expect(stepInitial(3, true)).toBe(2);
  });

  it("clamps out-of-range input", () => {
    expect(stepNext(9, 3)).toBe(2);
    expect(stepPrev(-1)).toBe(0);
  });
});
