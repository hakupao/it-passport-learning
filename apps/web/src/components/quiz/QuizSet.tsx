// Stage 6 / Quiz Phase 0 (Session 86, D-135) — question-set practice view.
//
// Client component: renders the questions for one topic/exam set with per-question
// reveal-answer (useState). v1 is JP-first (D-135): stems/choices show the raw IPA
// Japanese (structured tables rendered via QuizRichText, D-144 段 1); the figure (lossless WebP at /quiz-figures/<id>.webp) is the
// authoritative visual for figure questions. Each question carries its 出典
// (IPA attribution, D-134). Trilingual translation + explanations are Phase 1/2.
//
// D-180 §0-5 (Task 11): choices are buttons. Clicking one before reveal answers
// the question — it reveals, marks the pick (correct / wrong style) and records
// it via useLearningRecord (needs a LearningRecordProvider above). After reveal
// the choices are disabled. 「解答を表示」 still reveals without recording.

"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";

import { TermChip } from "@/components/glossary/TermChip";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import type { TermCard } from "@/lib/glossary/dictionary";
import {
  localizedChoices,
  localizedExplanation,
  localizedStem,
  type QuizQuestion,
} from "@/lib/quiz/quizModel";

import { QuizFeedback } from "./QuizFeedback";
import { ChoiceBody, StemBlocks } from "./QuizRichText";
import styles from "./quiz.module.css";

interface Props {
  locale: string;
  label: string;
  sublabel: string;
  questions: QuizQuestion[];
  /** D-179: dictionary cards for this set's terms, keyed by JP term (as in QuizQuestion.terms). */
  termCards: Record<string, TermCard>;
  /** D-149: server-resolved owner flag (D-148 cookie); gates the report button. */
  isOwner?: boolean;
}

export function QuizSet({
  locale,
  label,
  sublabel,
  questions,
  termCards,
  isOwner = false,
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
          <QuestionCard
            key={q.id}
            q={q}
            index={i + 1}
            t={t}
            locale={locale}
            isOwner={isOwner}
            termCards={termCards}
          />
        ))
      )}
    </div>
  );
}

function QuestionCard({
  q,
  index,
  t,
  locale,
  isOwner,
  termCards,
}: {
  q: QuizQuestion;
  index: number;
  t: ReturnType<typeof useTranslations>;
  locale: string;
  isOwner: boolean;
  termCards: Record<string, TermCard>;
}): React.ReactElement {
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const { answer } = useLearningRecord();
  const choices = localizedChoices(q, locale);
  const explanation = localizedExplanation(q, locale);

  return (
    <article id={q.id} className={styles.qCard}>
      <p className={styles.qSource}>
        {index}. {t("sourcePrefix")}: {q.source_label}
      </p>
      <StemBlocks stem={localizedStem(q, locale)} />
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
          <li key={c.letter}>
            <button
              type="button"
              className={[
                styles.choice,
                revealed && c.isCorrect ? styles.choiceCorrect : "",
                picked === c.letter && !c.isCorrect ? styles.choiceWrong : "",
              ].join(" ")}
              aria-pressed={picked === c.letter}
              disabled={revealed}
              onClick={() => {
                if (revealed) return;
                setPicked(c.letter);
                setRevealed(true);
                answer(q.id, c.letter, c.isCorrect);
              }}
            >
              <span className={styles.choiceLetter}>{c.letter}</span>
              <ChoiceBody text={c.text} jpText={q.choices_jp[c.letter]} figure={q.choice_figures?.[c.letter]} />
            </button>
          </li>
        ))}
      </ul>
      {revealed ? (
        <>
          <p className={styles.answerLine}>
            {t("correctLabel")}: {q.correct_answer}
          </p>
          {explanation ? (
            <div className={styles.explanation}>
              <p className={styles.explHead}>{t("explanationTitle")}</p>
              <p className={styles.explCorrect}>{explanation.correct}</p>
              {explanation.distractors.length > 0 ? (
                <ul className={styles.explDistractors}>
                  {explanation.distractors.map((d) => (
                    <li key={d.letter}>
                      <span className={styles.choiceLetter}>{d.letter}</span>
                      <span>{d.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {explanation.points.length > 0 ? (
                <div className={styles.explPoints}>
                  <p className={styles.explPointsHead}>{t("keyPoints")}</p>
                  <ul>
                    {explanation.points.map((p, pi) => (
                      <li key={pi}>{p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
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
        <div className={styles.terms}>
          {q.terms.map((term, i) => (
            <Fragment key={term}>
              {/* Two plain-text terms side by side get a visible dot, plus real
                  spaces so the text does not run together for screen readers
                  (whitespace-only flex children are not laid out). */}
              {i > 0 && !termCards[q.terms[i - 1]!] && !termCards[term] ? (
                <>
                  {" "}
                  <span aria-hidden="true">·</span>{" "}
                </>
              ) : null}
              <TermChip card={termCards[term]} label={term} locale={locale} />
            </Fragment>
          ))}
        </div>
      ) : null}
      {isOwner ? <QuizFeedback questionId={q.id} locale={locale} /> : null}
    </article>
  );
}
