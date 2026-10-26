// Stage 7 Phase 1 Task 10 (D-189 §4 / D-190 §0-17) — the topic page /practice/browse/<topicId>.
//
//   - Header: 分野 tag + topic path, the topic name (JP, OQ-03), 頻出度 ★, question count and the
//     accuracy over each question's latest attempt (once the record has loaded; "—" before).
//   - 「10 問解く」 → /practice?topic=<id>&n=10&order=rand (a fresh seed on click; a new tab gets one
//     from the page's redirect) and 「全問を番号順に」 → /practice?topic=<id>&n=all&order=seq.
//   - The AI 先生 topic review: ReviewLauncher (D-181 Phase B; since D-193 §0-1 it fetches the wrong
//     questions' full text when the review opens, as this page passes light TopicRows) — it handles
//     `?review=1` (the today page's 「AI 分析」, the legacy /quiz review links) and `&thread=<date>`
//     (a /sensei thread row). It needs this SenseiHost and the page's LearningRecordProvider.
//   - One row per question (corpus order = 全問を番号順に): 問 N → /practice/q/<id>, the exam label,
//     ○ / × of the latest attempt, the day it comes back (date / 今日 / 習得). The rows render on the
//     server; the record columns fill in once the record has loaded (the cells hold their width
//     before). Each row carries id=<question_id> (tabIndex -1), so a review reply's `#<question_id>`
//     link scrolls to its row (SenseiPanel).

"use client";

import { useTranslations } from "next-intl";

import { ReviewLauncher } from "@/components/sensei/ReviewLauncher";
import { SenseiHost } from "@/components/sensei/AskSensei";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import type { TermCard } from "@/lib/glossary/dictionary";
import { toLocalDay } from "@/lib/learning/schedule";
import type { Stars } from "@/lib/practice/practiceIndex";
import { PRACTICE_CATEGORY_LABEL_KEYS, starText } from "@/lib/practice/practiceLabels";
import { dayLabel, questionRowState, topicAccuracy, type QuestionRowState } from "@/lib/practice/practiceRows";
import type { TopicRow } from "@/lib/practice/topicRows";

import { sourceNumber } from "./choiceLayout";
import styles from "./browse.module.css";
import { FreshLink } from "./FreshLink";

export interface TopicPageProps {
  locale: string;
  topic: {
    id: string;
    category: string;
    name_jp: string;
    /** JP path 「大分類 › 中分類」 */
    path: string;
    stars: Stars;
  };
  /** the topic's questions in corpus order, light rows only (D-193 §0-1; the review fetches the full text) */
  rows: TopicRow[];
  termCards: Record<string, TermCard>;
  /** exam id → label_jp */
  exams: Record<string, string>;
}

type T = ReturnType<typeof useTranslations>;

function ResultCell({ state, t }: { state: QuestionRowState | null; t: T }): React.ReactElement {
  const r = state?.result ?? null;
  return (
    <td data-result={state === null ? "" : (r ?? "none")}>
      {state === null ? null : r === null ? (
        <span className={styles.muted}>
          <span aria-hidden="true">—</span>
          <span className="sr-only">{t("resultNone")}</span>
        </span>
      ) : (
        <span className={`${styles.result} ${r === "right" ? styles.resultRight : styles.resultWrong}`}>
          <span aria-hidden="true">{r === "right" ? "○" : "×"}</span>
          <span className="sr-only">{t(r === "right" ? "resultRight" : "resultWrong")}</span>
        </span>
      )}
    </td>
  );
}

function nextText(state: QuestionRowState | null, t: T): string {
  const n = state?.next ?? null;
  if (state === null) return "";
  if (n === null) return "—";
  if (n.kind === "today") return t("nextToday");
  if (n.kind === "mastered") return t("nextMastered");
  return dayLabel(n.day);
}

export function TopicPage({ locale, topic, rows, termCards, exams }: TopicPageProps): React.ReactElement {
  const t = useTranslations("Practice");
  const { record, loaded } = useLearningRecord();
  const today = loaded ? toLocalDay(Date.now()) : 0;
  const acc = loaded ? topicAccuracy(record, rows.map((q) => q.id)) : null;
  const catKey = PRACTICE_CATEGORY_LABEL_KEYS[topic.category];

  return (
    <SenseiHost>
      <main className={styles.page} data-topic={topic.id}>
        <p className={styles.crumb}>
          <Link href="/practice/browse" className={styles.link}>
            {t("backBrowse")}
          </Link>
        </p>
        <div className={styles.head}>
          {catKey ? (
            <span className={styles.catTag} lang="ja">
              {t(catKey)}
            </span>
          ) : null}
          <span className={styles.path} lang="ja">
            {topic.path}
          </span>
        </div>
        <h1 className={`${styles.title} ${styles.titleSpaced}`} lang="ja">
          {topic.name_jp}
        </h1>
        <p className={styles.facts}>
          <span>
            <span lang="ja">{t("starsLabel")}</span>{" "}
            <span className={styles.stars} role="img" aria-label={t("starsAria", { n: topic.stars })}>
              {starText(topic.stars)}
            </span>
          </span>
          <span>{t("questionsN", { n: rows.length })}</span>
          <span data-accuracy={acc ? `${acc.correct}/${acc.answered}` : ""}>
            {acc === null
              ? " "
              : acc.answered === 0
                ? t("accuracyNone")
                : t("accuracy", { pct: Math.round((acc.correct / acc.answered) * 100), answered: acc.answered })}
          </span>
        </p>
        <div className={styles.actions}>
          <FreshLink href={`/practice?topic=${topic.id}&n=10&order=rand`} seed className={styles.btnPrimary}>
            {t("topicPractice10")}
          </FreshLink>
          <FreshLink href={`/practice?topic=${topic.id}&n=all&order=seq`} className={styles.btn}>
            {t("topicAllSeq")}
          </FreshLink>
          <ReviewLauncher
            topicId={topic.id}
            title={topic.name_jp}
            rows={rows}
            termCards={termCards}
            locale={locale}
          />
        </div>

        <h2 className={styles.h2}>{t("rowsTitle")}</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t("colQuestion")}</th>
              <th scope="col">{t("colExam")}</th>
              <th scope="col">{t("colResult")}</th>
              <th scope="col">{t("colNext")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => {
              const state = loaded ? questionRowState(record, q.id, today, toLocalDay) : null;
              return (
                <tr key={q.id} id={q.id} tabIndex={-1} data-question-row={q.id}>
                  <td className={styles.strong}>
                    <Link href={`/practice/q/${q.id}`} className={styles.link} lang="ja">
                      {t("qLabel")} {sourceNumber(q)}
                    </Link>
                  </td>
                  <td lang="ja">{exams[q.exam_id] ?? q.exam_id}</td>
                  <ResultCell state={state} t={t} />
                  <td className={styles.tnum} data-next="">
                    {nextText(state, t)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </SenseiHost>
  );
}
