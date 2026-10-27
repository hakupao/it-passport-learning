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
