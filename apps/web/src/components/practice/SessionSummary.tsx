// Stage 7 Phase 1 Task 9 (D-189 §6.2 组末总结) — the end of a practice group (also after 終了:
// the answered part only). Score over the answered questions, elapsed time, the wrong list (each
// row → /practice/q/<id>, the question's own page), then 「只做错题再来一遍」 (/practice?ids=<wrong>),
// 「继续下一项」 (from=today only; nextHref is computed by the session from dailyPlan, §0-26) and
// 「回今日」, plus 「もう一度」 (the same group afresh: the stored one is cleared). The retry link
// carries `&run=<runNonce>` (the group's endedAt) so the same ids (all wrong) start a new group
// instead of reopening this stored summary. The heading takes the focus when the group ends
// (tabIndex -1). Book parts (出典 label, 正解) stay Japanese in every locale.

"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { ChoiceLetter } from "@/lib/learning/record";
import { formatElapsed, summarize } from "@/lib/practice/practiceSession";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

import styles from "./session.module.css";

export const SESSION_SUMMARY_HEADING_ID = "practice-summary";

export interface SessionTopic {
  category: string;
  /** JP topic path 「中分類 › 小分類」 (OQ-03: JP in every locale) */
  path: string;
  stars: 1 | 2 | 3;
}

export function SessionSummary({
  ids,
  answers,
  questions,
  elapsedMs,
  from,
  nextHref,
  topics,
  runNonce,
  onStartOver,
}: {
  ids: readonly string[];
  answers: Readonly<Record<string, ChoiceLetter>>;
  questions: readonly QuizQuestion[];
  elapsedMs: number;
  from: "today" | null;
  /** from=today: the next today group (or "/" when the day is done); null = not offered */
  nextHref: string | null;
  topics: Readonly<Record<string, SessionTopic>>;
  /** appended to the retry link as `&run=` (null: no nonce) */
  runNonce?: number | null;
  /** 「もう一度」: clear the stored group and start it again (absent: no button) */
  onStartOver?: () => void;
}): React.ReactElement {
  const t = useTranslations("Practice");
  const score = summarize(ids, answers, questions);
  const byId = new Map(questions.map((q) => [q.id, q]));

  return (
    <main className={`${styles.session} ${styles.summary}`} data-summary="">
      <h1 id={SESSION_SUMMARY_HEADING_ID} className={styles.summaryTitle} tabIndex={-1}>
        {t("summaryTitle")}
      </h1>
      <p className={styles.score} data-score={`${score.correct}/${score.answered}`}>
        {score.answered > 0 ? t("score", { correct: score.correct, answered: score.answered }) : t("noneAnswered")}
      </p>
      <p className={styles.facts}>
        {score.answered < score.total ? (
          <span>{t("partial", { total: score.total, answered: score.answered })}</span>
        ) : null}
        <span>
          {t("elapsed")} <strong data-elapsed="">{formatElapsed(elapsedMs)}</strong>
        </span>
      </p>

      <h2 className={styles.sectionTitle}>{t("wrongTitle")}</h2>
      {score.wrong.length > 0 ? (
        <ul className={styles.wrongList} data-wrong-list="">
          {score.wrong.map((id) => {
            const q = byId.get(id)!;
            return (
              <li key={id} className={styles.wrongRow} data-wrong={id}>
                <Link href={`/practice/q/${id}`} className={styles.wrongLink}>
                  <span lang="ja">{q.source_label}</span>
                </Link>
                <span className={styles.wrongTopic} lang="ja">
                  {topics[q.topic_id]?.path ?? ""}
                </span>
                <span className={styles.wrongAnswers}>
                  {t("yourChoice")}
                  <span className={styles.letterInk} lang="ja">
                    {answers[id]}
                  </span>
                  <span aria-hidden="true">／</span>
                  <span lang="ja">{t("correct")}</span>
                  <span className={styles.letterSpot} lang="ja">
                    {q.correct_answer}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>{t("noWrong")}</p>
      )}

      <div className={styles.actions}>
        {score.wrong.length > 0 ? (
          <Link
            href={`/practice?ids=${score.wrong.join(",")}${runNonce != null ? `&run=${runNonce}` : ""}`}
            className={styles.action}
            data-action="retry"
          >
            {t("retryWrong")}
          </Link>
        ) : null}
        {from === "today" && nextHref !== null ? (
          <Link href={nextHref} className={styles.actionPrimary} data-action="continue">
            {t("continueNext")}
          </Link>
        ) : null}
        {onStartOver ? (
          <button type="button" className={styles.action} data-action="restart" onClick={onStartOver}>
            {t("startOver")}
          </button>
        ) : null}
        <Link href="/" className={styles.action} data-action="today">
          {t("backToday")}
        </Link>
      </div>
    </main>
  );
}
