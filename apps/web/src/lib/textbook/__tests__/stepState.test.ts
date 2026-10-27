// Stage 7 Phase 3 Task 7 (D-196 §0-11) — step-figure state: bounds, replay, reduced motion.
import { describe, expect, it } from "vitest";

import { isLastStep, stageInit, stageReduce, stepInitial, stepNext, stepPrev, stepReplay, type StageState } from "../stepState";

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

// The StepStage controller: SSR / first paint = the whole figure, silent; autoplay only on the
// first time in view and only if the reader has not pressed anything; a press stops it for good.
describe("stage controller", () => {
  const run = (s: StageState, ...events: Parameters<typeof stageReduce>[1][]) => events.reduce(stageReduce, s);

  // N2: the caption region is polite from the start; the first render (SSR = hydration) shows
  // this state, so nothing changes — and nothing is announced — until the first `visible` / press.
  it("starts on the last step, not playing", () => {
    expect(stageInit(4)).toEqual({ step: 3, count: 4, auto: false, played: false, touched: false });
  });

  it("first time in view: back to step 1, playing, announcing; ticks walk to the end and stop", () => {
    const s = run(stageInit(3), { type: "visible" });
    expect(s).toMatchObject({ step: 0, auto: true, played: true });
    const t = run(s, { type: "tick" }, { type: "tick" });
    expect(t).toMatchObject({ step: 2, auto: false });
    expect(run(t, { type: "tick" }).step).toBe(2);
    // a second visibility never replays
    expect(run(t, { type: "visible" })).toEqual(t);
  });

  it("a press before the figure is in view cancels the autoplay for good", () => {
    const s = run(stageInit(3), { type: "go", step: 1 }, { type: "visible" }, { type: "tick" });
    expect(s).toMatchObject({ step: 1, auto: false, touched: true });
  });

  it("a press during playback stops it where the reader put it", () => {
    const s = run(stageInit(4), { type: "visible" }, { type: "tick" }, { type: "go", step: 0 }, { type: "tick" });
    expect(s).toMatchObject({ step: 0, auto: false, touched: true });
  });

  it("reduced motion: visibility does nothing", () => {
    expect(run(stageInit(3), { type: "visible", reduced: true })).toEqual(stageInit(3));
  });

  it("go clamps to the steps", () => {
    expect(run(stageInit(3), { type: "go", step: 9 }).step).toBe(2);
    expect(run(stageInit(3), { type: "go", step: -1 }).step).toBe(0);
  });
});
