// Stage 7 Phase 1 Task 8 (D-189 §6.2 / D-190 §0-16 / §0-24 / §0-25) — the explanation pane, mockup A4-Practice.
//
// Unanswered: the 「解説」 tab and one line 「解答すると解説が表示されます」, nothing else. Answered:
//   - heading 「問 N」 (ink tag) + the short title of points[0] (explanationTitle), dotted spot rule,
//     and a 日 / 中 / EN switch: explanation language (state explLocale, starts at the UI locale,
//     D-186); it changes the explanation only, never the question face;
//   - suspect (84 questions, key-guard could not confirm the key): one ink-muted line, §0-24 copy in
//     the UI language; the scoring is unchanged;
//   - verdict list ア〜エ: ○ row = the keyed answer with the correct reason, × rows = <details>
//     with the distractor reason; your row is tinted with 「← あなたの答え」, your wrong row open,
//     the other wrong rows closed;
//   - 「ここがポイント」 = points (1–3), term chips (TermChip), 「AI 先生に聞く」 (AskSensei; needs a
//     SenseiHost above, anchor `<question_id>:<picked>` as in QuizSet), owner-only QuizFeedback.
// Key terms (§0-25): the question's terms that have a dictionary card are spot bold where they occur
// in the explanation (splitTerms; style only, the text is unchanged). No wavy underline this phase.
// Every compared text sits alone in its data-fid element (fidelity.test.ts).
// `reveal` (Task 10, the single-question page /practice/q/<qid>: a reference view): the explanation
// is shown also while unanswered — no row is "yours", every × row starts closed, and the AI 先生
// thread anchor is `<question_id>:reveal` (the QuizSet convention for an unanswered reveal).
// The section carries EXPLANATION_ID: PracticeSession scrolls its heading into view on an answer (OQ-13 / D-194).

"use client";

import { Fragment, useState } from "react";
import { hasLocale, useTranslations } from "next-intl";

import { TermChip } from "@/components/glossary/TermChip";
import { QuizFeedback } from "@/components/quiz/QuizFeedback";
import { AskSensei } from "@/components/sensei/AskSensei";
import { routing } from "@/i18n/routing";
import type { TermCard } from "@/lib/glossary/dictionary";
import type { ChoiceLetter } from "@/lib/learning/record";
import { CHOICE_LETTERS, localizedExplanation, type QuizQuestion } from "@/lib/quiz/quizModel";
import { questionAnchor } from "@/lib/sensei/anchors";

import { explanationTitle, LANG_TAG, sourceNumber } from "./choiceLayout";
import styles from "./practice.module.css";
import { splitTerms } from "./termHighlight";

const EXPL_LOCALES = [
  ["ja", "日"],
  ["zh", "中"],
  ["en", "EN"],
] as const;

/** id of the explanation <section> (one per page) */
export const EXPLANATION_ID = "practice-explanation";

interface Props {
  q: QuizQuestion;
  locale: string;
  picked: ChoiceLetter | null;
  /** dictionary cards keyed by JP term (as in QuizQuestion.terms) */
  termCards: Record<string, TermCard>;
  isOwner: boolean;
  /** show the explanation while unanswered too (reference view; default false) */
  reveal?: boolean;
}

export function ExplanationPane({ q, locale, picked, termCards, isOwner, reveal = false }: Props): React.ReactElement {
  const t = useTranslations("Practice");
  const [explLocale, setExplLocale] = useState(locale);

  return (
    <section id={EXPLANATION_ID} className={styles.expl} aria-label={t("explanationAria")}>
      <div className={styles.tabRow}>
        <span className={styles.tab} lang="ja">
          {t("explanationTab")}
        </span>
      </div>
      {picked === null && !reveal ? (
        <p className={styles.await}>{t("awaitAnswer")}</p>
      ) : (
        <Answered
          q={q}
          locale={locale}
          picked={picked}
          termCards={termCards}
          isOwner={isOwner}
          explLocale={explLocale}
          setExplLocale={setExplLocale}
          t={t}
        />
      )}
    </section>
  );
}

function Answered({
  q,
  locale,
  picked,
  termCards,
  isOwner,
  explLocale,
  setExplLocale,
  t,
}: Omit<Props, "picked" | "reveal"> & {
  picked: ChoiceLetter | null;
  explLocale: string;
  setExplLocale: (l: string) => void;
  t: ReturnType<typeof useTranslations>;
}): React.ReactElement {
  const ex = localizedExplanation(q, explLocale);
  const title = ex ? explanationTitle(ex.points) : null;
  const lang = LANG_TAG[explLocale] ?? explLocale;
  const needles = q.terms.flatMap((term) => {
    const card = termCards[term];
    return card ? [term, card.gloss] : [];
  });
  const marked = (text: string): React.ReactNode =>
    splitTerms(text, needles).map((r, i) =>
      r.term ? (
        <strong key={i} className={styles.term}>
          {r.text}
        </strong>
      ) : (
        <Fragment key={i}>{r.text}</Fragment>
      ),
    );
  const distractor = new Map(ex?.distractors.map((d) => [d.letter, d.text]));
  const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const yours = <strong className={styles.yours}>{t("yourAnswer")}</strong>;

  return (
    <>
      <div className={styles.explHead}>
        <h2 className={styles.explTitle}>
          <span className={styles.tagInk} lang="ja">
            {t("qLabel")} {sourceNumber(q)}
          </span>
          {title ? <span lang={lang}>{title}</span> : null}
        </h2>
        <div className={styles.langSwitch} role="group" aria-label={t("explLang")}>
          {EXPL_LOCALES.map(([l, label], i) => (
            <Fragment key={l}>
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              <button
                type="button"
                className={styles.langBtn}
                aria-pressed={explLocale === l}
                data-expl-lang={l}
                lang={LANG_TAG[l]}
                onClick={() => setExplLocale(l)}
              >
                {label}
              </button>
            </Fragment>
          ))}
        </div>
      </div>

      {ex?.suspect ? (
        <p className={styles.suspect} data-fid="suspect">
          {t("suspect")}
        </p>
      ) : null}

      <ul className={styles.verdicts} lang={lang} data-verdicts="">
        {CHOICE_LETTERS.map((L, i) => {
          const mine = picked === L;
          const letter = (
            <span className={styles.vLetter} lang="ja">
              {L}
            </span>
          );
          if (L === q.correct_answer) {
            return (
              <li key={L} className={styles.verdict} data-verdict="correct" data-letter={L} data-mine={mine}>
                <div className={styles.verdictRow}>
                  <span className={styles.vMarkSpot} aria-hidden="true">
                    ○
                  </span>
                  {letter}
                  <p className={styles.vText}>
                    <strong lang="ja">{t("correct")}</strong>{" "}
                    {ex ? <span data-fid="expl-correct">{marked(ex.correct)}</span> : null}
                    {mine ? yours : null}
                  </p>
                </div>
              </li>
            );
          }
          const text = distractor.get(L);
          return (
            <li key={L} className={styles.verdict} data-verdict="wrong" data-letter={L} data-mine={mine}>
              <details open={mine}>
                <summary>
                  <span className={mine ? styles.vMarkSpot : styles.vMark} aria-hidden="true">
                    ×
                  </span>
                  <span className="sr-only">{t("markWrong")}</span>
                  {letter}
                  {mine ? yours : null}
                  <span className={styles.disclosure} aria-hidden="true" />
                </summary>
                {text !== undefined ? (
                  <p className={styles.vBody} data-fid={`expl-${i}`}>
                    {marked(text)}
                  </p>
                ) : null}
              </details>
            </li>
          );
        })}
      </ul>

      {ex && ex.points.length > 0 ? (
        <div className={styles.points}>
          <div className={styles.pointsHead} lang="ja">
            {t("pointsTitle")}
          </div>
          <ul className={styles.pointsList} lang={lang}>
            {ex.points.map((p, i) => (
              <li key={i} data-fid={`point-${i}`}>
                {marked(p)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.termsRow}>
        {q.terms.length > 0 ? (
          <span className={styles.termsLabel} lang="ja">
            {t("terms")}
          </span>
        ) : null}
        {q.terms.map((term, i) => (
          <Fragment key={term}>
            {/* two plain-text terms side by side: a visible dot + real spaces (as in QuizSet) */}
            {i > 0 && !termCards[q.terms[i - 1]!] && !termCards[term] ? (
              <>
                {" "}
                <span aria-hidden="true">·</span>{" "}
              </>
            ) : null}
            <span lang="ja">
              <TermChip card={termCards[term]} label={term} locale={locale} />
            </span>
          </Fragment>
        ))}
        <span className={styles.ask}>
          <AskSensei
            kind="question"
            anchorId={`${q.id}:${picked ?? "reveal"}`}
            title={q.source_label}
            getAnchorText={() => questionAnchor(q, appLocale, { choice: picked ?? undefined, termCards })}
          />
        </span>
      </div>
      {isOwner ? <QuizFeedback questionId={q.id} locale={locale} /> : null}
    </>
  );
}
