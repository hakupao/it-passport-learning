// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-193 §0-8) — 「回答見直し」: one cell per question of the mock.
// Glyphs, not colour: answered = reversed number (ink block), unanswered = hollow number (ruled
// frame), 「あとで見直す」 = ▲ at the number's top right. Every cell is a button that jumps to its
// question; the current one carries aria-current. 10 columns, 5 at ≤ 560px (mock.module.css).
// Nothing here says right or wrong (the exam is still running).

"use client";

import { useTranslations } from "next-intl";

import type { ChoiceLetter } from "@/lib/learning/record";

import styles from "./mock.module.css";

export interface MockReviewProps {
  ids: readonly string[];
  answers: Readonly<Record<string, ChoiceLetter>>;
  flagged: readonly string[];
  /** the question on screen before the review opened */
  pos: number;
  onGo: (pos: number) => void;
}

export function MockReview({ ids, answers, flagged, pos, onGo }: MockReviewProps): React.ReactElement {
  const t = useTranslations("Mock");
  const marked = new Set(flagged);
  const isAnswered = (id: string): boolean => Object.prototype.hasOwnProperty.call(answers, id);
  const answered = ids.filter(isAnswered).length;
  const flaggedN = ids.filter((id) => marked.has(id)).length;

  return (
    <section className={styles.review} aria-labelledby="mock-review-title" data-review="">
      <h2 id="mock-review-title" className={styles.h2}>
        {t("reviewTitle")}
      </h2>
      <p className={styles.counts}>
        <span data-count-answered={answered}>{t("countAnswered", { n: answered })}</span>
        <span data-count-unanswered={ids.length - answered}>{t("countUnanswered", { n: ids.length - answered })}</span>
        <span data-count-flagged={flaggedN}>{t("countFlagged", { n: flaggedN })}</span>
      </p>
      <p className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={`${styles.cellNum} ${styles.cellNumOn}`}>1</span>
          {t("legendAnswered")}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.cellNum}>2</span>
          {t("legendUnanswered")}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.cellNum}>
            3<span className={styles.flagMark}>▲</span>
          </span>
          {t("legendFlagged")}
        </span>
      </p>
      <p className={styles.muted}>{t("reviewLead")}</p>
      <ol className={styles.grid} data-review-grid="">
        {ids.map((id, i) => {
          const a = isAnswered(id);
          const f = marked.has(id);
          return (
            <li key={id}>
              <button
                type="button"
                className={styles.cellBtn}
                data-cell={i + 1}
                data-answered={a ? "true" : "false"}
                data-flagged={f ? "true" : "false"}
                aria-current={i === pos ? "true" : undefined}
                aria-label={t("cell", { n: i + 1, answered: a ? "yes" : "no", flagged: f ? "yes" : "no" })}
                onClick={() => onGo(i)}
              >
                <span className={a ? `${styles.cellNum} ${styles.cellNumOn}` : styles.cellNum} aria-hidden="true">
                  {i + 1}
                  {f ? <span className={styles.flagMark}>▲</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
