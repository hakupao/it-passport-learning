// D-181 Phase B Task B2 — 「AI 先生の復習」 card on the quiz landing.
//
// Lists the learner's weakest topics (weakTopics: ≥ 5 answers, not all correct,
// lowest accuracy first, at most 3) with the topic name, accuracy and answer
// count; each row opens that topic set with `?review=1`, where the AI 先生 panel
// opens and sends the review opener once (ReviewLauncher / SenseiPanel). With no
// qualifying topic it shows the 「5 題以上解くと…」 hint.
//
// The landing has no correct_answer, so accuracy here uses the record's stored
// verdicts; the review anchor on the set page re-judges against the current key.
// Imports only the record hook and the pure weakTopics: the landing never loads
// the AI SDK. Until the record has loaded the body stays empty (reserved height).

"use client";

import { useTranslations } from "next-intl";

import styles from "@/components/quiz/quiz.module.css";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import { WEAK_MIN_ANSWERED, weakTopics } from "@/lib/sensei/weakness";

export function ReviewCard({
  locale,
  topicQuestionIds,
  topicNames,
}: {
  locale: string;
  /** topic_id → that topic's question ids. */
  topicQuestionIds: Record<string, string[]>;
  /** topic_id → topic name. */
  topicNames: Record<string, string>;
}): React.ReactElement {
  const t = useTranslations("Sensei");
  const { record, loaded } = useLearningRecord();
  const weak = loaded ? weakTopics(record, topicQuestionIds) : null;

  return (
    <section className={styles.reviewCard} aria-labelledby="sensei-review-title" data-testid="review-card">
      <h2 id="sensei-review-title" className={styles.modeTitle}>
        {t("reviewTitle")}
      </h2>
      <p className={styles.reviewIntro}>{t("reviewIntro")}</p>
      <div className={styles.reviewBody}>
        {weak === null ? null : weak.length === 0 ? (
          <p className={styles.reviewEmpty} data-testid="review-empty">
            {t("reviewEmpty", { min: WEAK_MIN_ANSWERED })}
          </p>
        ) : (
          <ol className={styles.topicList}>
            {weak.map((w) => (
              <li key={w.topicId} className={styles.row} data-testid="review-topic">
                <Link
                  href={`/quiz?mode=topic&id=${encodeURIComponent(w.topicId)}&review=1`}
                  locale={locale}
                  className={styles.rowLink}
                >
                  <span className={styles.rowName}>{topicNames[w.topicId] ?? w.topicId}</span>
                  <span className={styles.rowCount}>
                    {t("reviewStat", { accuracy: w.rate, answered: w.answered })}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
