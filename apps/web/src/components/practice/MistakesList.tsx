// Stage 7 Phase 1 Task 12 (DESIGN §5.4 leech / §6.3, D-190 §0-20) — the mistakes book
// /practice/mistakes.
//
// The record lives in the browser, so the book (mistakesModel.mistakesBook) is computed here once
// the record has loaded; before that (the server render and the first client frame) the block keeps
// its height (data-pending) and shows no number, so nothing flashes and the server's clock never
// reaches the markup.
//   - Top: 「做全部错题 (N)」 = FreshLink to /practice?ids=… (≤ 100, earliest due first; &run= on click
//     so a second start is a new group) + a note when N > 100.
//   - One section per topic (分野 tag + topic name JP + count), a table on rule lines: 問 N →
//     /practice/q/<id> · exam label_jp · topic name · 「近 10 次错 N 次」 · next (M/D, or 今天 when due) ·
//     leech → the spot 「顽固」 tag + 「读单元」 (the topic's first unit) and 「问 AI」 (the single-question
//     page, where AI 先生 is).
//   - No mistake → one empty-state line.

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import { toLocalDay } from "@/lib/learning/schedule";
import { mistakesBook, type MistakeRow } from "@/lib/practice/mistakesModel";
import type { TodayIndex } from "@/lib/practice/practiceIndex";
import { PRACTICE_CATEGORY_LABEL_KEYS } from "@/lib/practice/practiceLabels";
import { dayLabel } from "@/lib/practice/practiceRows";
import { MAX_SCOPE_IDS } from "@/lib/practice/practiceSession";

import styles from "./browse.module.css";
import own from "./mistakes.module.css";
import { FreshLink } from "./FreshLink";

export interface MistakesListProps {
  /** the dictionary-free today payload (loadSetupIndex): topics, question ids, exam labels */
  index: TodayIndex;
}

type T = ReturnType<typeof useTranslations>;

function Row({ row, t, qLabel }: { row: MistakeRow; t: T; qLabel: string }): React.ReactElement {
  return (
    <tr data-mistake-row={row.qid} {...(row.isLeech ? { "data-leech": "" } : {})}>
      <td className={styles.strong}>
        <Link href={`/practice/q/${row.qid}`} className={styles.link} lang="ja">
          {qLabel} {row.number}
        </Link>
      </td>
      <td lang="ja">{row.exam}</td>
      <td lang="ja" className={own.topicCell}>
        {row.topic}
      </td>
      <td className={styles.tnum}>{t("wrongN", { n: row.wrongInWindow })}</td>
      <td className={styles.tnum}>{row.next.kind === "today" ? t("nextToday") : dayLabel(row.next.day)}</td>
      <td>
        {row.isLeech ? (
          <span className={own.leechCell}>
            <span className={own.leech}>{t("leech")}</span>
            {row.unitId !== null ? (
              <Link href={`/textbook/${row.unitId}`} className={styles.link}>
                {t("readUnit")}
              </Link>
            ) : null}
            <Link href={`/practice/q/${row.qid}`} className={styles.link}>
              {t("askAi")}
            </Link>
          </span>
        ) : null}
      </td>
    </tr>
  );
}

export function MistakesList({ index }: MistakesListProps): React.ReactElement {
  const t = useTranslations("Mistakes");
  const tp = useTranslations("Practice");
  const { record, loaded } = useLearningRecord();
  const book = useMemo(
    () => (loaded ? mistakesBook(record, index, toLocalDay(Date.now()), toLocalDay) : null),
    [loaded, record, index],
  );

  return (
    <main className={styles.page} data-mistakes="">
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={own.lead}>{t("lead")}</p>
      {book === null ? (
        <div className={own.pending} data-pending="" aria-busy="true">
          <span className="sr-only">{t("loading")}</span>
        </div>
      ) : book.total === 0 ? (
        <p className={styles.lead} data-empty="">
          {t("empty")}
        </p>
      ) : (
        <>
          <div className={styles.actions}>
            {book.href !== null ? (
              <FreshLink href={book.href} className={styles.btnPrimary} data-do-all="">
                {t("doAll", { n: book.total })}
              </FreshLink>
            ) : null}
            {book.total > MAX_SCOPE_IDS ? <span className={own.note}>{t("capNote")}</span> : null}
          </div>
          {book.groups.map((g) => {
            const catKey = PRACTICE_CATEGORY_LABEL_KEYS[g.category];
            const headId = `mistakes-${g.topicId}`;
            return (
              <section key={g.topicId} data-mistake-group={g.topicId} aria-labelledby={headId}>
                <h2 id={headId} className={`${styles.h2} ${own.groupHead}`}>
                  {catKey ? (
                    <span className={styles.catTag} lang="ja">
                      {tp(catKey)}
                    </span>
                  ) : null}
                  <span lang="ja">{g.name_jp}</span>
                  <span className={own.count}>{t("groupCount", { n: g.rows.length })}</span>
                </h2>
                <table className={`${styles.table} ${styles.fixed}`}>
                  <thead>
                    <tr>
                      <th scope="col" className={own.colQuestion}>
                        {t("colQuestion")}
                      </th>
                      <th scope="col" className={own.colExam}>
                        {t("colExam")}
                      </th>
                      <th scope="col" className={own.colTopic}>
                        {t("colTopic")}
                      </th>
                      <th scope="col" className={own.colWrong}>
                        {t("colWrong")}
                      </th>
                      <th scope="col" className={own.colNext}>
                        {t("colNext")}
                      </th>
                      <th scope="col">{t("colNotes")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((row) => (
                      <Row key={row.qid} row={row} t={t} qLabel={tp("qLabel")} />
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}
