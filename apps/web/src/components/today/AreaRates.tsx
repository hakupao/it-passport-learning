// Stage 7 Phase 1 Task 11 (D-189 §6.1, mockup A4-Home) — 三个分野的正答率: one bar per field (JP tag,
// spot fill on a rule-spot track, the percentage; "—" for a field without answers) and the pass line
// (600/1000 overall and 300/1000 in each field). rates null = loading (height kept); newUser = the
// empty-state line instead of the bars. The pass line always shows.

"use client";

import { useTranslations } from "next-intl";

import { PRACTICE_CATEGORY_LABEL_KEYS, PRACTICE_CATEGORY_ORDER } from "@/lib/practice/practiceLabels";
import type { AreaRates as Rates } from "@/lib/practice/todayModel";

import styles from "./today.module.css";

export function AreaRates({ rates, newUser }: { rates: Rates | null; newUser: boolean }): React.ReactElement {
  const t = useTranslations("Today");
  const tp = useTranslations("Practice");

  return (
    <section aria-labelledby="today-area-title">
      <h2 id="today-area-title" className={styles.areaTitle}>
        {t("areaTitle")}
      </h2>
      {rates === null ? (
        <div className={styles.areasPending} data-pending="" />
      ) : newUser ? (
        <p className={styles.empty} data-empty="areas">
          {t("areaEmpty")}
        </p>
      ) : (
        PRACTICE_CATEGORY_ORDER.map((c) => {
          const rate = rates[c];
          const pct = rate === null ? null : Math.round(rate * 100);
          return (
            <div key={c} className={styles.area} data-area={c} data-rate={pct === null ? "" : String(pct)}>
              <span className={styles.areaTag} lang="ja">
                {tp(PRACTICE_CATEGORY_LABEL_KEYS[c]!)}
              </span>
              <div className={styles.track} aria-hidden="true">
                {pct === null ? null : <div className={styles.fill} style={{ width: `${pct}%` }} />}
              </div>
              <span className={styles.pct}>{pct === null ? "—" : `${pct}%`}</span>
            </div>
          );
        })
      )}
      <p className={styles.passLine}>{t("passLine")}</p>
    </section>
  );
}
