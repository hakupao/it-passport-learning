// Stage 7 Phase 3 (D-196 §0-11, D-195 §2) — the step stage of a `steps` figure: one frame per
// step (rendered by the figure, passed in as elements), its one-line caption, 「前へ / 次へ」,
// 「もう一度」 on the last step, and progress dots.
//
// State = lib/textbook/stepState stageReduce (unit-tested): first paint (SSR / no JS / reduced
// motion / not yet in view) shows the last step. The caption is aria-live polite from the
// first render (a region that turns live together with its first change is missed by some
// screen readers); the first client render equals the SSR one, so a page load announces
// nothing. The first time the stage is half in view (IntersectionObserver;
// none → no playback) it jumps to step 1 and plays through once. A press stops the
// playback for good and disconnects the observer.

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useReducer, useRef } from "react";

import { isLastStep, stageInit, stageReduce, stepNext, stepPrev, stepReplay } from "@/lib/textbook/stepState";

import styles from "./figures.module.css";

/** ms per step of the first-view playback */
const AUTO_MS = 1800;

interface ViewProps {
  step: number;
  frames: React.ReactNode[];
  captions: string[];
  label: string;
  onGo: (step: number) => void;
  rootRef?: React.Ref<HTMLDivElement>;
}

/** The stage at one step (stateless). 前へ on step 1 is aria-disabled, not disabled, so focus stays on it. */
export function StageView({ step, frames, captions, label, onGo, rootRef }: ViewProps): React.ReactElement {
  const t = useTranslations("Figure");
  const count = frames.length;
  const first = step === 0;
  // The last-step button keeps its DOM position, so focus stays when 次へ turns into もう一度.
  const last = isLastStep(step, count);
  return (
    <div ref={rootRef} role="group" aria-label={label} className={styles.stage}>
      <div className={styles.frame}>{frames[step]}</div>
      <p className={styles.caption} aria-live="polite">
        {captions[step]}
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btn}
          aria-disabled={first ? true : undefined}
          onClick={() => {
            if (!first) onGo(stepPrev(step));
          }}
        >
          {t("prev")}
        </button>
        <ol className={styles.dots} aria-hidden="true">
          {frames.map((_, i) => (
            <li key={i} data-dot={i === step ? "on" : "off"} className={i <= step ? styles.dotOn : styles.dot} />
          ))}
        </ol>
        <span className={styles.stepNo}>{t("stepOf", { n: step + 1, total: count })}</span>
        <button
          type="button"
          className={last ? styles.btn : `${styles.btn} ${styles.btnMain}`}
          onClick={() => onGo(last ? stepReplay() : stepNext(step, count))}
        >
          {last ? t("replay") : t("next")}
        </button>
      </div>
    </div>
  );
}

interface Props {
  /** one element per step (3〜4) */
  frames: React.ReactNode[];
  /** the active-locale caption of each step */
  captions: string[];
  /** accessible name of the stage */
  label: string;
}

export function StepStage({ frames, captions, label }: Props): React.ReactElement {
  const [s, dispatch] = useReducer(stageReduce, frames.length, stageInit);
  const ref = useRef<HTMLDivElement>(null);
  const io = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        dispatch({ type: "visible" });
      },
      { threshold: 0.5 },
    );
    io.current = obs;
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!s.auto) return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), AUTO_MS);
    return () => window.clearInterval(id);
  }, [s.auto]);

  const go = (step: number) => {
    io.current?.disconnect();
    dispatch({ type: "go", step });
  };

  return <StageView step={s.step} frames={frames} captions={captions} label={label} onGo={go} rootRef={ref} />;
}
