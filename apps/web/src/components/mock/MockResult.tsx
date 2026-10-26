// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-193 §0-3 / §0-5) — the finished mock: 総合評価点 and the three
// areas out of 1000 (scoreMock), 合格 / 不合格 against 600 / 300, the count and the time taken, and the
// 正誤一覧: one row per question in mock order, linking to /practice/q/<id> (the explanation lives
// there, never on the exam page). Right / wrong by glyph and text (○ spot / × ink / — for 未回答),
// never by colour.

"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { ChoiceLetter } from "@/lib/learning/record";
import type { MockScore } from "@/lib/mock/mockModel";
import { formatElapsed } from "@/lib/practice/practiceSession";
import { PRACTICE_CATEGORY_LABEL_KEYS } from "@/lib/practice/practiceLabels";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

import styles from "./mock.module.css";

export type MockResultQuestion = Pick<QuizQuestion, "id" | "source_label" | "correct_answer" | "category">;

export interface MockResultProps {
  ids: readonly string[];
  answers: Readonly<Record<string, ChoiceLetter>>;
  /** the mock's questions (every id) */
  questions: readonly MockResultQuestion[];
  score: MockScore;
  elapsedMs: number;
}

export const MOCK_RESULT_HEADING_ID = "mock-result-title";

const AREAS = ["strategy", "management", "technology"] as const;

export function MockResult({ ids, answers, questions, score, elapsedMs }: MockResultProps): React.ReactElement {
  const t = useTranslations("Mock");
  const tp = useTranslations("Practice");
  const byId = new Map(questions.map((q) => [q.id, q]));

  return (
    <section className={styles.result} data-mock-result="">
      <h1 id={MOCK_RESULT_HEADING_ID} className={styles.title} tabIndex={-1}>
        {t("resultTitle")}
      </h1>

      <div className={styles.scoreRow}>
        <div className={styles.total} data-total={score.total}>
          <span className={styles.totalLabel}>{t("totalLabel")}</span>
          <span className={styles.totalNum}>{t("outOf", { score: score.total })}</span>
        </div>
        <p className={styles.verdict} data-passed={score.passed ? "true" : "false"}>
          <strong>{t(score.passed ? "passed" : "failed")}</strong>
        </p>
      </div>
      <p className={styles.muted}>{t("passRule")}</p>

      <table className={styles.areas}>
        <tbody>
          {AREAS.map((a) => (
            <tr key={a} data-area={a} data-score={score.areas[a]}>
              <th scope="row" lang="ja">
                {tp(PRACTICE_CATEGORY_LABEL_KEYS[a]!)}
              </th>
              <td className={styles.num}>{t("outOf", { score: score.areas[a] })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.facts}>
        <span>{t("correctCount", { correct: score.correct, n: score.n, answered: score.answered })}</span>
        <span>{t("elapsed", { time: formatElapsed(elapsedMs) })}</span>
      </p>

      <div className={styles.actions}>
        <Link href="/" className={styles.btnPrimary}>
          {t("backToday")}
        </Link>
        <Link href="/mock" className={styles.btn}>
          {t("newMock")}
        </Link>
      </div>

      <h2 className={styles.h2}>{t("listTitle")}</h2>
      <p className={styles.muted}>{t("listLead")}</p>
      <ol className={styles.rows}>
        {ids.map((id, i) => {
          const q = byId.get(id);
          const yours = Object.prototype.hasOwnProperty.call(answers, id) ? answers[id]! : null;
          const result = yours === null ? "none" : yours === q?.correct_answer ? "right" : "wrong";
          return (
            <li key={id} className={styles.row} data-result-row={id} data-result={result}>
              <span className={styles.rowNo}>{i + 1}</span>
              <span className={styles.rowMark} aria-hidden="true" data-mark={result}>
                {result === "right" ? "○" : result === "wrong" ? "×" : "—"}
              </span>
              <span className={styles.rowResult}>{t(result === "right" ? "right" : result === "wrong" ? "wrong" : "unanswered")}</span>
              <Link href={`/practice/q/${id}`} className={styles.link}>
                <span lang="ja">{q?.source_label ?? id}</span>
              </Link>
              <span className={styles.rowAnswers}>
                <span>
                  {t("colYours")} <strong>{yours ?? "—"}</strong>
                </span>
                <span>
                  {t("colKey")} <strong>{q?.correct_answer ?? "—"}</strong>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
