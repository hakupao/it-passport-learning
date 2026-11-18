// Stage 7 Phase 1 Task 9 (D-189 §3.3 答题卡 / §6.2) — one cell per question of the group:
// ○ answered right, × answered wrong, empty = not yet; the current question is the ink cell.
// The marks are glyphs, never colour (DESIGN §3.1); each cell carries its state as sr-only text.

"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import type { ChoiceLetter } from "@/lib/learning/record";

import styles from "./session.module.css";

export function AnswerCard({
  ids,
  answers,
  keyOf,
  pos,
}: {
  ids: readonly string[];
  answers: Readonly<Record<string, ChoiceLetter>>;
  /** qid → keyed answer */
  keyOf: ReadonlyMap<string, string>;
  pos: number;
}): React.ReactElement {
  const t = useTranslations("Practice");
  const ref = useRef<HTMLOListElement>(null);
  // phone width (D-239): the row does not wrap but scrolls sideways — keep the current cell in view,
  // also after a rotation. scrollLeft only (never scrollIntoView, which would also move the page).
  useEffect(() => {
    const center = (): void => {
      const ol = ref.current;
      const cell = ol?.children[pos];
      if (!ol || !cell || ol.scrollWidth <= ol.clientWidth) return;
      const c = cell.getBoundingClientRect();
      ol.scrollLeft += c.left - ol.getBoundingClientRect().left - (ol.clientWidth - c.width) / 2;
    };
    center();
    // mobile browsers fire resize when the address bar shows / hides on vertical scroll: re-center only
    // when the width changes (rotation), so a row the reader scrolled sideways is not pulled back.
    let w = window.innerWidth;
    const onResize = (): void => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      center();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos]);
  return (
    <ol ref={ref} className={styles.card} aria-label={t("answerCard")} data-answer-card="">
      {ids.map((id, i) => {
        const a = Object.prototype.hasOwnProperty.call(answers, id) ? answers[id] : undefined;
        const state = a === undefined ? "none" : a === keyOf.get(id) ? "right" : "wrong";
        const current = i === pos;
        return (
          <li key={id} className={styles.cell} data-cell={state} data-current={current}>
            <span aria-hidden="true">{state === "right" ? "○" : state === "wrong" ? "×" : ""}</span>
            <span className="sr-only">{t("cell", { n: i + 1, state, current: current ? "yes" : "no" })}</span>
          </li>
        );
      })}
    </ol>
  );
}
