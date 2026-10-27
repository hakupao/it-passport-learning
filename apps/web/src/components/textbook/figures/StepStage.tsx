// Stage 7 Phase 3 (D-196 §0-11, D-195 §2) — the step stage of a `steps` figure: one frame per
// step (rendered by the figure, passed in as elements), its one-line caption (aria-live),
// 「前へ / 次へ」, 「もう一度」 on the last step, and progress dots.
//
// SSR / no JS / prefers-reduced-motion: the last step (the whole figure, stepInitial). With JS
// and motion allowed: back to step 1 on mount, then one automatic play-through the first time
// the stage is half in view (IntersectionObserver; skipped when the browser has none). Any
// button press stops the playback.

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { isLastStep, stepInitial, stepNext, stepPrev, stepReplay } from "@/lib/textbook/stepState";

import styles from "./figures.module.css";

/** ms per step of the first-view playback */
const AUTO_MS = 1800;

interface Props {
  /** one element per step (3〜4) */
  frames: React.ReactNode[];
  /** the active-locale caption of each step */
  captions: string[];
  /** accessible name of the stage */
  label: string;
}

export function StepStage({ frames, captions, label }: Props): React.ReactElement {
  const t = useTranslations("Figure");
  const count = frames.length;
  const [step, setStep] = useState(() => stepInitial(count, true));
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  const stopAuto = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => {
    const el = ref.current;
    const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced || typeof IntersectionObserver === "undefined") return;
    setStep(stepInitial(count, false));
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        timer.current = window.setInterval(() => {
          setStep((s) => {
            const n = stepNext(s, count);
            if (isLastStep(n, count)) stopAuto();
            return n;
          });
        }, AUTO_MS);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stopAuto();
    };
  }, [count]);

  const go = (n: number) => {
    stopAuto();
    setStep(n);
  };
  const last = isLastStep(step, count);

  return (
    <div ref={ref} role="group" aria-label={label} className={styles.stage}>
      <div className={styles.frame}>{frames[step]}</div>
      <p className={styles.caption} aria-live="polite">
        {captions[step]}
      </p>
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={() => go(stepPrev(step))} disabled={step === 0}>
          {t("prev")}
        </button>
        <ol className={styles.dots} aria-hidden="true">
          {frames.map((_, i) => (
            <li key={i} data-dot={i === step ? "on" : "off"} className={i <= step ? styles.dotOn : styles.dot} />
          ))}
        </ol>
        <span className={styles.stepNo}>{t("stepOf", { n: step + 1, total: count })}</span>
        {last ? (
          <button type="button" className={styles.btn} onClick={() => go(stepReplay())}>
            {t("replay")}
          </button>
        ) : (
          <button type="button" className={`${styles.btn} ${styles.btnMain}`} onClick={() => go(stepNext(step, count))}>
            {t("next")}
          </button>
        )}
      </div>
    </div>
  );
}
