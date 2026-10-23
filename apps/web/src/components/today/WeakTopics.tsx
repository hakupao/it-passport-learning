// Stage 7 Phase 1 Task 11 (D-189 §6.1 / D-190 §0-10 / §0-17, mockup A4-Home) — 薄弱领域: a plain table
// (領域 JP · 分野 tag · 頻出度 ★ · 正答率 · 「练 10 题」 「AI 分析」), at most 5 rows (weakTopicRows).
//   - 「练 10 题」 → /practice?topic=<id>&n=10&order=rand (FreshLink: a fresh seed and run on click,
//     the same link as the topic page's).
//   - 「AI 分析」 → writes the click intent, then /practice/browse/<id>?review=1, where the existing
//     ReviewLauncher opens the AI 先生 topic review (D-181 Phase B, behaviour unchanged; §0-17).
// rows null = the record is loading (the block keeps its height); [] = the empty-state line.

"use client";

import { useTranslations } from "next-intl";

import { FreshLink } from "@/components/practice/FreshLink";
import { Link } from "@/i18n/navigation";
import { PRACTICE_CATEGORY_LABEL_KEYS, starText } from "@/lib/practice/practiceLabels";
import type { WeakTopicRow } from "@/lib/practice/todayModel";
import { reviewIntentStorage, writeReviewIntent } from "@/lib/sensei/reviewIntent";

import styles from "./today.module.css";

export function WeakTopics({ rows }: { rows: WeakTopicRow[] | null }): React.ReactElement {
  const t = useTranslations("Today");
  const tp = useTranslations("Practice");

  return (
    <section aria-labelledby="today-weak-title">
      <div className={styles.h2Row}>
        <h2 id="today-weak-title" className={styles.h2}>
          {t("weakTitle")}
        </h2>
        <span className={styles.lead}>{t("weakLead")}</span>
      </div>
      {rows === null ? (
        <div className={styles.weakPending} data-pending="" />
      ) : rows.length === 0 ? (
        <p className={styles.empty} data-empty="weak">
          {t("weakEmpty")}
        </p>
      ) : (
        <table className={styles.table} data-weak="">
          <thead>
            <tr>
              <th scope="col">{t("colTopic")}</th>
              <th scope="col">{t("colCategory")}</th>
              <th scope="col" lang="ja">
                {t("colStars")}
              </th>
              <th scope="col" className={styles.num}>
                {t("colRate")}
              </th>
              <th scope="col">
                <span className="sr-only">{t("colActions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => {
              const catKey = PRACTICE_CATEGORY_LABEL_KEYS[w.category];
              return (
                <tr key={w.topicId} data-weak-row={w.topicId}>
                  <td className={styles.topicName} lang="ja">
                    {w.name_jp}
                  </td>
                  <td>
                    {catKey ? (
                      <span className={styles.catTag} lang="ja">
                        {tp(catKey)}
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className={styles.stars} role="img" aria-label={tp("starsAria", { n: w.stars })}>
                      {starText(w.stars)}
                    </span>
                  </td>
                  <td className={styles.num}>{Math.round(w.rate * 100)}%</td>
                  <td className={styles.acts}>
                    <FreshLink href={`/practice?topic=${w.topicId}&n=10&order=rand`} seed className={styles.link}>
                      {t("practice10")}
                    </FreshLink>
                    <Link
                      href={`/practice/browse/${w.topicId}?review=1`}
                      className={styles.link}
                      onClick={() => writeReviewIntent(reviewIntentStorage(), w.topicId, Date.now())}
                    >
                      {t("aiReview")}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
