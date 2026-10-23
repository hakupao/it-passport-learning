// Stage 7 Phase 1 Task 8 (D-189 §6.2 / D-190 §0-15) — the practice question face, mockup A4-Practice.
//
// Props-only client component (the session / record wiring is Task 9). Left column: 「問 N」 spot block
// (N = the source question number), 复习三格 (the last 3 results, newest first: ○ = correct on paper,
// × = wrong as an ink block), 頻出度 ★. Right column, hanging off it: the JP stem (default, D-186),
// the figure (under the stem, above the choices; click → <dialog>, Esc closes natively), the choices
// in ア〜エ order (layout from choiceLayout, §0-15), the 出典 line and — zh / en only — the translation
// toggle. With the translation shown, the translated stem and choices are added under the JP ones.
//
// Display fidelity (D-189 §7 / §9): the JP stem and every choice go through the same QuizRichText
// components as the old QuizSet (StemBlocks / ChoiceBody), translated ones too, and every compared
// field carries a data-fid wrapper that holds only that field (fidelity.test.ts). A choice_figures
// question renders one <img> per choice whose alt follows the shown language (the old QuizSet used the
// locale's text); its wrapper carries choice-i (+ choice-tr-i when shown) and choice-figure-i.
//
// 中問 fold (§6.2 / Review Focus 4): with foldPreamble and a fold point (preambleChars — the caller
// passes ChumonGroup.preambleChars.jp; the count includes the trailing "\n\n"), stem.slice(0, n) goes
// into a closed <details> 「共通前文 ▸」 (data-fid="stem-preamble") and stem.slice(n) is the stem.
// Only the JP stem folds; a shown translation is always complete.
//
// Table choices: a table is flow content, so it is not put in the <button> (as in QuizSet): the
// <li> holds the button (letter + sr-only 「アを選ぶ」, aria-describedby → the table) and the table
// as a sibling that also answers on click. After an answer the buttons are aria-disabled (they keep
// focus and stay in the tab order); the result is a visible ○ / × plus sr-only text, never colour.

"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { ChoiceBody, isTableChoice, StemBlocks } from "@/components/quiz/QuizRichText";
import type { ChoiceLetter } from "@/lib/learning/record";
import type { Stars } from "@/lib/practice/practiceIndex";
import { localizedChoices, localizedStem, type QuizQuestion } from "@/lib/quiz/quizModel";

import { choiceLayout } from "./choiceLayout";
import styles from "./practice.module.css";

export interface PracticeQuestionProps {
  q: QuizQuestion;
  locale: string;
  /** 問 N — the source question number (sourceNumber(q)) */
  number: number;
  picked: ChoiceLetter | null;
  onPick: (choice: ChoiceLetter) => void;
  /** the last ≤ 3 results of this question, newest first (true = correct) */
  recent: boolean[];
  stars: Stars;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  /** JP fold point (ChumonGroup.preambleChars.jp), trailing "\n\n" included; null = never fold */
  preambleChars: number | null;
  foldPreamble: boolean;
}

/** BCP 47 tag of a UI locale's text */
export const LANG_TAG: Record<string, string> = { ja: "ja", zh: "zh-Hans", en: "en" };

export function PracticeQuestion({
  q,
  locale,
  number,
  picked,
  onPick,
  recent,
  stars,
  showTranslation,
  onToggleTranslation,
  preambleChars,
  foldPreamble,
}: PracticeQuestionProps): React.ReactElement {
  const t = useTranslations("Practice");
  const hasTr = locale !== "ja";
  const showTr = hasTr && showTranslation;
  const trLang = LANG_TAG[locale] ?? locale;
  const layout = choiceLayout(q);
  const trChoices = localizedChoices(q, locale);
  const answered = picked !== null;
  const fold = foldPreamble && preambleChars !== null && preambleChars > 0 && preambleChars < q.stem_jp.length;

  return (
    <article id={q.id} className={styles.face} aria-label={t("question")} tabIndex={-1}>
      <div className={styles.hang}>
        <div className={styles.side}>
          <div className={styles.qNo} data-qno={number}>
            <span className={styles.qNoLabel}>{t("qLabel")}</span>
            <span className={styles.qNoNum}>{number}</span>
          </div>
          <RecentCells recent={recent} t={t} />
          <div className={styles.stars}>
            {t("starsLabel")}
            <span className={styles.starMarks} role="img" aria-label={t("starsAria", { n: stars })}>
              {"★".repeat(stars) + "☆".repeat(3 - stars)}
            </span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.stem}>
            {fold ? (
              <>
                <details className={styles.preamble}>
                  <summary>{t("preamble")}</summary>
                  <div lang="ja" data-fid="stem-preamble">
                    <StemBlocks stem={q.stem_jp.slice(0, preambleChars)} />
                  </div>
                </details>
                <div lang="ja" data-fid="stem">
                  <StemBlocks stem={q.stem_jp.slice(preambleChars)} />
                </div>
              </>
            ) : (
              <div lang="ja" data-fid="stem">
                <StemBlocks stem={q.stem_jp} />
              </div>
            )}
          </div>
          {showTr ? (
            <div className={styles.stemTr} lang={trLang} data-fid="stem-tr">
              <StemBlocks stem={localizedStem(q, locale)} />
            </div>
          ) : null}

          {q.figure ? <Figure basename={q.figure} t={t} /> : null}

          <ul className={`${styles.choices} ${styles[layout]}`} data-layout={layout} aria-label={t("choices")}>
            {trChoices.map((c, i) => {
              const L = c.letter as ChoiceLetter;
              const jp = q.choices_jp[L] ?? "";
              const figure = q.choice_figures?.[L];
              const isPicked = picked === L;
              const state = !answered ? "idle" : c.isCorrect ? "correct" : isPicked ? "picked-wrong" : "other";
              const pick = (): void => {
                if (!answered) onPick(L);
              };
              const mark = !answered ? null : c.isCorrect ? (
                <span className={styles.mark}>
                  <span className={styles.ring} aria-hidden="true">○</span>
                  <span className="sr-only">{t(isPicked ? "markYourCorrect" : "markCorrect")}</span>
                </span>
              ) : isPicked ? (
                <span className={styles.mark}>
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">{t("markYourWrong")}</span>
                </span>
              ) : null;

              if (figure) {
                // one image per choice; alt (= the choice text) follows the shown language
                const fids = `choice-${i}${showTr ? ` choice-tr-${i}` : ""} choice-figure-${i}`;
                return (
                  <li key={L} data-letter={L} data-state={state}>
                    <button type="button" className={styles.choice} aria-pressed={isPicked} aria-disabled={answered} onClick={pick}>
                      <span className={styles.letter}>{L}</span>
                      <span className={styles.choiceText} data-fid={fids}>
                        <ChoiceBody text={showTr ? c.text : jp} jpText={jp} figure={figure} />
                      </span>
                      {mark}
                    </button>
                  </li>
                );
              }

              const jpBody = <ChoiceBody text={jp} jpText={jp} />;
              const trBody = showTr ? <ChoiceBody text={c.text} jpText={jp} /> : null;
              if (isTableChoice(jp, jp) || (showTr && isTableChoice(c.text, jp))) {
                const bodyId = `${q.id}-choice-${L}`;
                return (
                  <li key={L} className={styles.tableItem} data-letter={L} data-state={state}>
                    <button
                      type="button"
                      className={styles.choice}
                      aria-pressed={isPicked}
                      aria-disabled={answered}
                      aria-describedby={bodyId}
                      onClick={pick}
                    >
                      <span className={styles.letter} aria-hidden="true">{L}</span>
                      <span className="sr-only">{t("pickChoice", { letter: L })}</span>
                      {mark}
                    </button>
                    {/* Pointer convenience only; the button above is the keyboard / AT control. */}
                    <div id={bodyId} className={styles.choiceTableBody} onClick={pick}>
                      <div lang="ja" data-fid={`choice-${i}`}>{jpBody}</div>
                      {trBody ? (
                        <div className={styles.choiceTr} lang={trLang} data-fid={`choice-tr-${i}`}>
                          {trBody}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              }

              return (
                <li key={L} data-letter={L} data-state={state}>
                  <button type="button" className={styles.choice} aria-pressed={isPicked} aria-disabled={answered} onClick={pick}>
                    <span className={styles.letter}>{L}</span>
                    <span className={styles.choiceText}>
                      <span lang="ja" data-fid={`choice-${i}`}>{jpBody}</span>
                      {trBody ? (
                        <span className={styles.choiceTr} lang={trLang} data-fid={`choice-tr-${i}`}>
                          {trBody}
                        </span>
                      ) : null}
                    </span>
                    {mark}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.meta}>
            <span>
              {t("sourcePrefix")}　<span lang="ja" data-fid="source">{q.source_label}</span>
            </span>
            {hasTr ? (
              <button
                type="button"
                className={styles.toggle}
                aria-pressed={showTr}
                data-translation-toggle=""
                onClick={onToggleTranslation}
              >
                {t(showTr ? "hideTranslation" : "showTranslation")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function RecentCells({
  recent,
  t,
}: {
  recent: boolean[];
  t: ReturnType<typeof useTranslations>;
}): React.ReactElement {
  const cells = [0, 1, 2].map((i) => (i < recent.length ? (recent[i] ? "right" : "wrong") : "none"));
  const marks = recent.slice(0, 3).map((r) => t(r ? "recentRight" : "recentWrong")).join(" ");
  return (
    <div className={styles.recent} role="img" aria-label={recent.length ? t("recentLabel", { marks }) : t("recentNone")}>
      {cells.map((c, i) => (
        <span key={i} className={styles.cell} data-recent={c}>
          {c === "right" ? "○" : c === "wrong" ? "×" : ""}
        </span>
      ))}
    </div>
  );
}

function Figure({ basename, t }: { basename: string; t: ReturnType<typeof useTranslations> }): React.ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const src = `/quiz-figures/${basename}.webp`;
  return (
    <figure className={styles.figure}>
      <button
        type="button"
        className={styles.figureBtn}
        aria-label={t("zoomFigure")}
        onClick={() => {
          setZoomed(true);
          dialogRef.current?.showModal();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static pre-optimized WebP from /public, dimensions vary */}
        <img className={styles.figureImg} src={src} alt={t("figureAlt")} loading="lazy" data-fid="figure" />
      </button>
      <dialog
        ref={dialogRef}
        className={styles.zoom}
        aria-label={t("figureAlt")}
        onClose={() => setZoomed(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close(); // backdrop click
        }}
      >
        {zoomed ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- same static WebP, full size */}
            <img className={styles.zoomImg} src={src} alt={t("figureAlt")} />
            <button type="button" className={styles.zoomClose} onClick={() => dialogRef.current?.close()}>
              {t("close")}
            </button>
          </>
        ) : null}
      </dialog>
    </figure>
  );
}
