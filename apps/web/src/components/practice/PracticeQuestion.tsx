// Stage 7 Phase 1 Task 8 (D-189 §6.2 / D-190 §0-15) — the practice question face, mockup A4-Practice.
//
// Props-only client component (the session / record wiring is Task 9). Left column: 「問 N」 spot block
// (N = sourceNumber(q), the source question number; no prop, so face / explanation / 解答栏 agree),
// 复习三格 (the last 3 results, newest first: ○ = correct on paper, × = wrong as an ink block), 頻出度 ★.
// Right column, hanging off it: the JP stem (default, D-186), the figure (under the stem, above the
// choices; click → <dialog>, Esc closes natively), the choices in ア〜エ order (layout from
// choiceLayout, §0-15; one ChoiceItem each), the 出典 line and — zh / en only — the translation toggle. With the translation shown, the translated stem and choices are added under the JP ones.
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
//
// `readOnly` (Task 10, the single-question page: a reference view): picking does nothing and the
// choices are aria-disabled; unanswered, the keyed answer carries its ○ (as on the explanation and the
// 解答栏 beside it), no choice is "yours".
//
// `mode="exam"` (Stage 7 Phase 2 Task 4, D-193 §0-7, the mock exam): a pick only marks the choice
// 「選択中」 (data-state "picked", aria-pressed) and another pick replaces it; nothing tells right
// from wrong — no ○ / ×, no lock, no 复习三格 (its cells are ○ / ×). `examNo` puts the mock's own
// number in the 問 block (「問 N / 100」); the 出典 line stays. The face never had the explanation,
// the AI 先生 entry or the report button — those live in the practice session around it.

"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { ChoiceBody, isTableChoice, StemBlocks } from "@/components/quiz/QuizRichText";
import type { ChoiceLetter } from "@/lib/learning/record";
import type { Stars } from "@/lib/practice/practiceIndex";
import { localizedChoices, localizedStem, type QuizQuestion } from "@/lib/quiz/quizModel";

import { choiceLayout, LANG_TAG, sourceNumber } from "./choiceLayout";
import styles from "./practice.module.css";

export interface PracticeQuestionProps {
  q: QuizQuestion;
  locale: string;
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
  /** reference view: no picking, the keyed answer marked (default false) */
  readOnly?: boolean;
  /** "exam" = the mock exam: re-pickable, no right / wrong anywhere (default "practice") */
  mode?: "practice" | "exam";
  /** the mock's own numbering (exam mode): question n of total */
  examNo?: { n: number; total: number };
}

type T = ReturnType<typeof useTranslations>;

export function PracticeQuestion({
  q,
  locale,
  picked,
  onPick,
  recent,
  stars,
  showTranslation,
  onToggleTranslation,
  preambleChars,
  foldPreamble,
  readOnly = false,
  mode = "practice",
  examNo,
}: PracticeQuestionProps): React.ReactElement {
  const t = useTranslations("Practice");
  const exam = mode === "exam";
  const number = examNo ? examNo.n : sourceNumber(q);
  const hasTr = locale !== "ja";
  const showTr = hasTr && showTranslation;
  const trLang = LANG_TAG[locale] ?? locale;
  // a shown translation adds a line under each choice that a 4-column cell cannot hold (Rule A attempt 3)
  const base = choiceLayout(q);
  const layout = showTr && base === "row4" ? "list" : base;
  const fold = foldPreamble && preambleChars !== null && preambleChars > 0 && preambleChars < q.stem_jp.length;

  return (
    <article id={q.id} className={styles.face} aria-label={t("question")} tabIndex={-1}>
      <div className={styles.hang}>
        <div className={styles.side}>
          <div className={styles.qNo} data-qno={number}>
            <span className={styles.qNoLabel} lang="ja">
              {t("qLabel")}
            </span>
            <span className={styles.qNoNum}>{number}</span>
            {examNo ? <span className={styles.qNoLabel}>/ {examNo.total}</span> : null}
          </div>
          {exam ? null : <RecentCells recent={recent} t={t} />}
          <div className={styles.stars}>
            <span lang="ja">{t("starsLabel")}</span>
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
                  <summary lang="ja">{t("preamble")}</summary>
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
            {localizedChoices(q, locale).map((c, i) => (
              <ChoiceItem
                key={c.letter}
                q={q}
                index={i}
                letter={c.letter as ChoiceLetter}
                trText={c.text}
                picked={picked}
                onPick={onPick}
                readOnly={readOnly}
                exam={exam}
                showTr={showTr}
                trLang={trLang}
                t={t}
              />
            ))}
          </ul>

          <div className={styles.meta}>
            <span lang="ja">
              {t("sourcePrefix")}
              {"　"}
              <span lang="ja" data-fid="source">
                {q.source_label}
              </span>
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

/** One choice <li>: plain / pairs inside the button, a choice figure inside it, a table beside it. */
function ChoiceItem({
  q,
  index: i,
  letter: L,
  trText,
  picked,
  onPick,
  readOnly,
  exam,
  showTr,
  trLang,
  t,
}: {
  q: QuizQuestion;
  index: number;
  letter: ChoiceLetter;
  /** the locale's text of this choice (JP fallback) */
  trText: string;
  picked: ChoiceLetter | null;
  onPick: (choice: ChoiceLetter) => void;
  readOnly: boolean;
  exam: boolean;
  showTr: boolean;
  trLang: string;
  t: T;
}): React.ReactElement {
  const jp = q.choices_jp[L] ?? "";
  const figure = q.choice_figures?.[L];
  // exam: never locked, never judged (a pick of another letter replaces the answer)
  const answered = !exam && (picked !== null || readOnly);
  const isPicked = picked === L;
  const isCorrect = q.correct_answer === L;
  const state = exam
    ? isPicked
      ? "picked"
      : "idle"
    : !answered
      ? "idle"
      : isCorrect
        ? "correct"
        : isPicked
          ? "picked-wrong"
          : "other";
  const pick = (): void => {
    if (exam ? !isPicked : !answered) onPick(L);
  };
  const mark = !answered ? null : isCorrect ? (
    <span className={styles.mark}>
      <span className={styles.ring} aria-hidden="true">
        ○
      </span>
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
      <li data-letter={L} data-state={state}>
        <button type="button" className={styles.choice} aria-pressed={isPicked} aria-disabled={answered} onClick={pick}>
          <span className={styles.letter}>{L}</span>
          <span className={styles.choiceText} data-fid={fids}>
            <ChoiceBody text={showTr ? trText : jp} jpText={jp} figure={figure} />
          </span>
          {mark}
        </button>
      </li>
    );
  }

  const jpBody = <ChoiceBody text={jp} jpText={jp} />;
  const trBody = showTr ? <ChoiceBody text={trText} jpText={jp} /> : null;
  if (isTableChoice(jp, jp) || (showTr && isTableChoice(trText, jp))) {
    const bodyId = `${q.id}-choice-${L}`;
    return (
      <li className={styles.tableItem} data-letter={L} data-state={state}>
        <button
          type="button"
          className={styles.choice}
          aria-pressed={isPicked}
          aria-disabled={answered}
          aria-describedby={bodyId}
          onClick={pick}
        >
          <span className={styles.letter} aria-hidden="true">
            {L}
          </span>
          <span className="sr-only">{t("pickChoice", { letter: L })}</span>
          {mark}
        </button>
        {/* Pointer convenience only; the button above is the keyboard / AT control. */}
        <div id={bodyId} className={styles.choiceTableBody} onClick={pick}>
          <div lang="ja" data-fid={`choice-${i}`}>
            {jpBody}
          </div>
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
    <li data-letter={L} data-state={state}>
      <button type="button" className={styles.choice} aria-pressed={isPicked} aria-disabled={answered} onClick={pick}>
        <span className={styles.letter}>{L}</span>
        <span className={styles.choiceText}>
          <span lang="ja" data-fid={`choice-${i}`}>
            {jpBody}
          </span>
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
}

function RecentCells({ recent, t }: { recent: boolean[]; t: T }): React.ReactElement {
  const cells = [0, 1, 2].map((i) => (i < recent.length ? (recent[i] ? "right" : "wrong") : "none"));
  const marks = recent
    .slice(0, 3)
    .map((r) => t(r ? "recentRight" : "recentWrong"))
    .join(" ");
  return (
    <div
      className={styles.recent}
      role="img"
      aria-label={recent.length ? t("recentLabel", { marks }) : t("recentNone")}
    >
      {cells.map((c, i) => (
        <span key={i} className={styles.cell} data-recent={c}>
          {c === "right" ? "○" : c === "wrong" ? "×" : ""}
        </span>
      ))}
    </div>
  );
}

function Figure({ basename, t }: { basename: string; t: T }): React.ReactElement {
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
