// Stage 6 / Quiz Phase 0 (Session 86, D-135) — question-set practice view.
//
// Client component: renders the questions for one topic/exam set with per-question
// reveal-answer (useState). v1 is JP-first (D-135): stems/choices show the raw IPA
// Japanese; the figure (lossless WebP at /quiz-figures/<id>.webp) is the
// authoritative visual for figure questions. Each question carries its 出典
// (IPA attribution, D-134). Trilingual translation + explanations are Phase 1/2.

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { orderedChoices, type QuizQuestion } from "@/lib/quiz/quizModel";

import styles from "./quiz.module.css";

interface Props {
  locale: string;
  label: string;
  sublabel: string;
  questions: QuizQuestion[];
}

export function QuizSet({
  locale,
  label,
  sublabel,
  questions,
}: Props): React.ReactElement {
  const t = useTranslations("Quiz");

  return (
    <div className={styles.page}>
      <header className={styles.setHead}>
        <Link href="/quiz" locale={locale} className={styles.backLink}>
          ← {t("backToList")}
        </Link>
        <h1 className={styles.setTitle}>{label}</h1>
        <p className={styles.setSub}>
          {sublabel} · {t("count", { n: questions.length })}
        </p>
      </header>

      {questions.length === 0 ? (
        <p className={styles.empty}>{t("empty")}</p>
      ) : (
        questions.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i + 1} t={t} />
        ))
      )}
    </div>
  );
}

function QuestionCard({
  q,
  index,
  t,
}: {
  q: QuizQuestion;
  index: number;
  t: ReturnType<typeof useTranslations>;
}): React.ReactElement {
  const [revealed, setRevealed] = useState(false);
  const choices = orderedChoices(q);

  return (
    <article className={styles.qCard}>
      <p className={styles.qSource}>
        {index}. {t("sourcePrefix")}: {q.source_label}
      </p>
      <p className={styles.qStem}>{q.stem_jp}</p>
      {q.figure ? (
        // eslint-disable-next-line @next/next/no-img-element -- static pre-optimized WebP from /public, dimensions vary
        <img
          className={styles.qFigure}
          src={`/quiz-figures/${q.figure}.webp`}
          alt={t("figureAlt")}
          loading="lazy"
        />
      ) : null}
      <ul className={styles.choiceList}>
        {choices.map((c) => (
          <li
            key={c.letter}
            className={`${styles.choice} ${revealed && c.isCorrect ? styles.choiceCorrect : ""}`}
          >
            <span className={styles.choiceLetter}>{c.letter}</span>
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
      {revealed ? (
        <p className={styles.answerLine}>
          {t("correctLabel")}: {q.correct_answer}
        </p>
      ) : (
        <button
          type="button"
          className={styles.revealBtn}
          onClick={() => setRevealed(true)}
        >
          {t("showAnswer")}
        </button>
      )}
      {q.terms.length > 0 ? (
        <p className={styles.terms}>{q.terms.join(" · ")}</p>
      ) : null}
    </article>
  );
}
