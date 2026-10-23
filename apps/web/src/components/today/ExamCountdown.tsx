// Stage 7 Phase 1 Task 11 (D-189 §6.1, mockup A4-Home) — the ink box of the right column:
// 「距离考试 N 天」 (exam date set and not past) + 「过去问 x / 2,900 题」 (questions with ≥ 1 attempt /
// all). Without a usable exam date the box keeps only the count (the 「设定考试日」 link sits in the
// date row). data null = the record is loading: the box frame stays, no numbers.

"use client";

import { useTranslations } from "next-intl";

import styles from "./today.module.css";

export interface CountdownView {
  /** days until the exam; null = no exam date or already past (no countdown) */
  days: number | null;
  answered: number;
  total: number;
}

export function ExamCountdown({ data, locale }: { data: CountdownView | null; locale: string }): React.ReactElement {
  const t = useTranslations("Today");
  const num = new Intl.NumberFormat(locale);
  const showDays = data !== null && data.days !== null;

  return (
    <section className={styles.box} aria-labelledby="today-countdown-title">
      <div id="today-countdown-title" className={styles.boxHead}>
        {data === null || showDays ? t("countdownTitle") : t("progressTitle")}
      </div>
      {data === null ? (
        <div className={styles.boxBody} data-pending="" />
      ) : (
        <div className={styles.boxBody} {...(showDays ? { "data-countdown": String(data.days) } : {})}>
          {showDays ? (
            <>
              <span className={styles.bigNum}>{data.days}</span>
              <span>{t("daysUnit")}</span>
            </>
          ) : null}
          <span className={styles.answered} data-answered={`${data.answered}/${data.total}`}>
            {t("answered", { done: num.format(data.answered), total: num.format(data.total) })}
          </span>
        </div>
      )}
    </section>
  );
}
