// Stage 7 Phase 1 Task 8 (D-189 §3.3 / §6.2) — 解答栏 「解答 問N [ウ]」 (spot frame, mockup footer).
// The session footer (Task 9) places it next to the status line and the prev / next buttons.
// The letter is the keyed answer, never the picked one (fidelity.test.ts checks it for all 2900).

"use client";

import { useTranslations } from "next-intl";

import type { QuizQuestion } from "@/lib/quiz/quizModel";

import { sourceNumber } from "./choiceLayout";
import styles from "./practice.module.css";

export function AnswerBar({ q }: { q: QuizQuestion }): React.ReactElement {
  const t = useTranslations("Practice");
  const number = sourceNumber(q);
  return (
    <div className={styles.answerBar}>
      <span className={styles.answerTag}>{t("answerTag")}</span>
      <span className={styles.answerBody}>
        {t("qLabel")}
        {number}
        <span className={styles.answerLetter} lang="ja" data-fid="answer">
          {q.correct_answer}
        </span>
      </span>
    </div>
  );
}
