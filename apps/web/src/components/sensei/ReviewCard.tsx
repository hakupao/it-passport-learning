// D-181 Phase B Task B2 — 「AI 先生の復習」 card on the quiz landing.
//
// Lists the learner's weakest topics (weakTopics: ≥ 5 answers, not all correct,
// lowest accuracy first, at most 3) with the topic name, accuracy and answer
// count; each row opens that topic set with `?review=1`, where the AI 先生 panel
// opens and sends the review opener once (ReviewLauncher / SenseiPanel). A row
// click also stores the click intent (lib/sensei/reviewIntent) — without it a
// `?review=1` link (bookmark, copied URL) only opens the panel.
// With no topic answered 5 times it shows the 「1 つの分野で 5 題以上…」 hint; when
// such topics exist but are all correct, the 「すべて全問正解」 line. The intro is
// shown only above a list.
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
import { reviewIntentStorage, writeReviewIntent } from "@/lib/sensei/reviewIntent";
import { hasQualifyingTopic, WEAK_MIN_ANSWERED, weakTopics } from "@/lib/sensei/weakness";

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
      <div className={styles.reviewBody}>
        {weak === null ? null : weak.length === 0 ? (
          hasQualifyingTopic(record, topicQuestionIds) ? (
            <p className={styles.reviewEmpty} data-testid="review-all-correct">
              {t("reviewAllCorrect", { min: WEAK_MIN_ANSWERED })}
            </p>
          ) : (
            <p className={styles.reviewEmpty} data-testid="review-empty">
              {t("reviewEmpty", { min: WEAK_MIN_ANSWERED })}
            </p>
          )
        ) : (
          <>
            <p className={styles.reviewIntro} data-testid="review-intro">
              {t("reviewIntro")}
            </p>
            <ol className={styles.topicList}>
              {weak.map((w) => (
                <li key={w.topicId} className={styles.row} data-testid="review-topic">
                  <Link
                    href={`/quiz?mode=topic&id=${encodeURIComponent(w.topicId)}&review=1`}
                    locale={locale}
                    className={styles.rowLink}
                    onClick={() => writeReviewIntent(reviewIntentStorage(), w.topicId, Date.now())}
                  >
                    <span className={styles.rowName}>{topicNames[w.topicId] ?? w.topicId}</span>{" "}
                    <span className={styles.rowCount}>
                      {t("reviewStat", { accuracy: w.rate, answered: w.answered })}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
