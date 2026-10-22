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
// it via useLearningActions (needs a LearningRecordProvider above). After reveal
// the choices are aria-disabled (inert, but they keep focus and stay in the tab
// order). 「解答を表示」 still reveals without recording.
//
// Table choices (ChoiceBody kind "table" / "tables", 18 questions): a table is
// flow content, so it is not put inside the button (that would flatten the
// table for assistive tech and hide its scroll container from the keyboard).
// The <li> holds the button (letter + sr-only 「アを選ぶ」, aria-describedby →
// the table) and the table as a sibling; clicking the table answers too. The
// picked choice carries a visible ✓ / ✗ plus sr-only 正解 / 不正解, so the
// result is not conveyed by color alone; the answer line is an aria-live region.
//
// D-181 Task A4: after answering or 「解答を表示」, a 「AI 先生に聞く」 button opens
// the page's one AI 先生 panel (SenseiHost) on this question. Its thread anchor
// is `<question_id>:<picked choice>` or `<question_id>:reveal` (§0-4: another
// choice = another thread).

"use client";

import { Fragment, useState } from "react";
import { hasLocale, useTranslations } from "next-intl";

import { TermChip } from "@/components/glossary/TermChip";
import { AskSensei, SenseiHost } from "@/components/sensei/AskSensei";
import { useLearningActions } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { TermCard } from "@/lib/glossary/dictionary";
import {
  localizedChoices,
  localizedExplanation,
  localizedStem,
  type QuizQuestion,
} from "@/lib/quiz/quizModel";
import { questionAnchor } from "@/lib/sensei/anchors";

import { QuizFeedback } from "./QuizFeedback";
import { ChoiceBody, isTableChoice, StemBlocks } from "./QuizRichText";
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
    <SenseiHost>
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
    </SenseiHost>
  );
}

/** The picked choice's result: visible ✓ / ✗ (aria-hidden) + sr-only 正解 / 不正解. */
export function ChoiceMark({
  correct,
  t,
}: {
  correct: boolean;
  t: ReturnType<typeof useTranslations>;
}): React.ReactElement {
  return (
    <span className={styles.choiceMark}>
      <span aria-hidden="true">{correct ? "✓" : "✗"}</span>
      <span className="sr-only">{t(correct ? "resultCorrect" : "resultWrong")}</span>
    </span>
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
  const { answer } = useLearningActions();
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
        {choices.map((c) => {
          const jpText = q.choices_jp[c.letter];
          const figure = q.choice_figures?.[c.letter];
          const isPicked = picked === c.letter;
          const result = [
            revealed && c.isCorrect ? styles.choiceCorrect : "",
            isPicked && !c.isCorrect ? styles.choiceWrong : "",
          ].join(" ");
          const pick = () => {
            if (revealed) return;
            setPicked(c.letter);
            setRevealed(true);
            answer(q.id, c.letter, c.isCorrect);
          };
          const mark = isPicked ? <ChoiceMark correct={c.isCorrect} t={t} /> : null;
          if (!figure && isTableChoice(c.text, jpText)) {
            const bodyId = `${q.id}-choice-${c.letter}`;
            return (
              <li key={c.letter} className={`${styles.choiceTableItem} ${result}`}>
                <button
                  type="button"
                  className={styles.choice}
                  aria-pressed={isPicked}
                  aria-disabled={revealed}
                  aria-describedby={bodyId}
                  onClick={pick}
                >
                  <span className={styles.choiceLetter} aria-hidden="true">{c.letter}</span>
                  <span className="sr-only">{t("pickChoice", { letter: c.letter })}</span>
                  {mark}
                </button>
                {/* Pointer convenience only; the button above is the keyboard / AT control. */}
                <div id={bodyId} className={styles.choiceTableBody} onClick={pick}>
                  <ChoiceBody text={c.text} jpText={jpText} />
                </div>
              </li>
            );
          }
          return (
            <li key={c.letter}>
              <button
                type="button"
                className={`${styles.choice} ${result}`}
                aria-pressed={isPicked}
                aria-disabled={revealed}
                onClick={pick}
              >
                <span className={styles.choiceLetter}>{c.letter}</span>
                <ChoiceBody text={c.text} jpText={jpText} figure={figure} />
                {mark}
              </button>
            </li>
          );
        })}
      </ul>
      <p className={revealed ? styles.answerLine : undefined} aria-live="polite">
        {revealed ? `${t("correctLabel")}: ${q.correct_answer}` : null}
      </p>
      {revealed ? (
        explanation ? (
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
        ) : null
      ) : (
        <button
          type="button"
          className={styles.revealBtn}
          onClick={() => setRevealed(true)}
        >
          {t("showAnswer")}
        </button>
      )}
      {revealed ? (
        <div className={styles.askSensei}>
          <AskSensei
            kind="question"
            anchorId={`${q.id}:${picked ?? "reveal"}`}
            title={q.source_label}
            getAnchorText={() =>
              questionAnchor(q, hasLocale(routing.locales, locale) ? locale : routing.defaultLocale, {
                choice: picked ?? undefined,
                termCards,
              })
            }
          />
        </div>
      ) : null}
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
