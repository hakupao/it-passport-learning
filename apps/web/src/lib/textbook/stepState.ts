// Stage 7 Phase 3 (D-196 §0-11) — the step figure's position (0-based) as pure functions;
// StepStage holds the number, these move it. 3〜4 steps per figure (figureSpec STEPS_MIN / MAX).

const clamp = (step: number, count: number): number => Math.min(Math.max(step, 0), Math.max(count - 1, 0));

/** First step to show: the last one under prefers-reduced-motion (no playback at all), else the first. */
export function stepInitial(count: number, reducedMotion: boolean): number {
  return reducedMotion ? clamp(count - 1, count) : 0;
}

/** 「次へ」: one forward, stopping at the last step. */
export function stepNext(step: number, count: number): number {
  return clamp(step + 1, count);
}

/** 「前へ」: one back, never before the first step. */
export function stepPrev(step: number): number {
  return Math.max(step - 1, 0);
}

/** 「もう一度」: back to the first step. */
export function stepReplay(): number {
  return 0;
}

export function isLastStep(step: number, count: number): boolean {
  return step >= count - 1;
}

// ---- the StepStage controller (useReducer) ----------------------------------------------
//
// First paint (SSR, no JS, reduced motion, not yet in view) = the last step: the whole figure
// is readable. The caption region is aria-live polite from the start; since the first client
// render equals the SSR one, nothing changes — so nothing is announced — on load. The first
// time the stage comes into view — unless the reader has already pressed a button or
// prefers reduced motion — it jumps to step 1 and plays through once. Any press stops the
// playback for good.

export interface StageState {
  step: number;
  count: number;
  /** the playback timer should run */
  auto: boolean;
  /** the one playback has started (never again) */
  played: boolean;
  /** the reader pressed a control */
  touched: boolean;
}

export type StageEvent = { type: "visible"; reduced?: boolean } | { type: "tick" } | { type: "go"; step: number };

export function stageInit(count: number): StageState {
  return { step: stepInitial(count, true), count, auto: false, played: false, touched: false };
}

export function stageReduce(s: StageState, e: StageEvent): StageState {
  switch (e.type) {
    case "visible":
      if (s.played || s.touched || e.reduced) return s;
      return { ...s, step: stepInitial(s.count, false), auto: true, played: true };
    case "tick": {
      if (!s.auto) return s;
      const step = stepNext(s.step, s.count);
      return { ...s, step, auto: !isLastStep(step, s.count) };
    }
    case "go":
      return { ...s, step: Math.min(Math.max(e.step, 0), s.count - 1), auto: false, touched: true };
  }
}
