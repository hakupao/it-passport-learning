// Stage 7 Phase 2 Task 5 (DESIGN §6.6 / D-193 §0-9) — /[locale]/record: the learning record.
// Four blocks, numbers / tables / thin CSS bars only (no decorative graphics, no svg / canvas):
//   ① 累计: answered x / total, attempts, mastered (box 5), study days.
//   ② 复习预报: today (overdue included) + 6 days — date, a thin bar (width ∝ the week's max), count.
//   ③ 近 5 周: Monday-first 5 × 7 grid ending with the week of today; each cell = distinct questions
//      answered that day (every src), 0 → 「·」; days after today stay blank. Today's cell carries
//      data-day-today / data-count.
//   ④ 领域正答率: per field a table (領域 JP → topic page · ★ · answered / total · rate, 「—」 when
//      unanswered); sort 頻出度 / 正答率 by the URL (?sort=rate), passed in by the server page.
// The record lives in the browser: before it loads (the server render, the first client frame) every
// block keeps its place (data-pending) and shows no number, so the server's clock never reaches the
// markup. An empty record → one empty-state line; the totals still show 0, the other bodies are hidden.

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import type { LearningRecord } from "@/lib/learning/record";
import { toLocalDay } from "@/lib/learning/schedule";
import { poolFromIndex, type TodayIndex } from "@/lib/practice/practiceIndex";
import { PRACTICE_CATEGORY_LABEL_KEYS, starText } from "@/lib/practice/practiceLabels";
import {
  dailyCounts,
  recordTotals,
  reviewForecast,
  topicRows,
  type RecordSort,
  type RecordTotals,
  type TopicGroup,
} from "@/lib/record/recordModel";

import styles from "./record.module.css";

export interface RecordPageProps {
  index: TodayIndex;
  locale: string;
  sort: RecordSort;
}

const DAY_MS = 86_400_000;
const WEEKS = 5;

/** one grid cell: null = outside the window (after today) */
type Cell = { day: number; count: number | null };

interface View {
  today: number;
  empty: boolean;
  totals: RecordTotals;
  forecast: number[];
  weeks: Cell[][];
  groups: TopicGroup[];
}

function buildView(record: LearningRecord, index: TodayIndex, sort: RecordSort, at: number): View {
  const today = toLocalDay(at);
  const pool = poolFromIndex(index);
  const totals = recordTotals(record, pool, today, toLocalDay);
  const counts = dailyCounts(record, today, toLocalDay, WEEKS * 7);
  // day 0 (1970-01-01) is a Thursday → (day + 3) % 7 = 0 on Mondays
  const start = today - ((today + 3) % 7) - (WEEKS - 1) * 7;
  const weeks: Cell[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const row: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const day = start + w * 7 + i;
      row.push({ day, count: day > today ? null : counts[counts.length - 1 - (today - day)]! });
    }
    weeks.push(row);
  }
  return {
    today,
    empty: totals.attempts === 0,
    totals,
    forecast: reviewForecast(record, pool, today, toLocalDay),
    weeks,
    groups: topicRows(record, index, sort),
  };
}

const LOCALE_TAG: Record<string, string> = { ja: "ja-JP", zh: "zh-CN", en: "en-US" };

function dayLabel(day: number, locale: string): string {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale] ?? "ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(day * DAY_MS));
}

export function RecordPage({ index, locale, sort }: RecordPageProps): React.ReactElement {
  const t = useTranslations("Record");
  const tp = useTranslations("Practice");
  const { record, loaded } = useLearningRecord();
  const view = useMemo(
    () => (loaded ? buildView(record, index, sort, Date.now()) : null),
    [loaded, record, index, sort],
  );
  const pending = { "data-pending": "" };
  const max = view === null ? 0 : Math.max(0, ...view.forecast);

  return (
    <main className={styles.page} data-record="">
      <h1 className={styles.title}>{t("title")}</h1>
      {view?.empty ? (
        <p className={styles.empty} data-empty="">
          {t("empty")}
        </p>
      ) : null}

      <section aria-labelledby="record-totals">
        <h2 id="record-totals" className={styles.h2}>
          {t("totalsTitle")}
        </h2>
        {view === null ? (
          <div className={styles.totalsPending} {...pending} />
        ) : (
          <dl className={styles.totals}>
            <div className={styles.total}>
              <dt>{t("answered")}</dt>
              <dd data-answered={view.totals.answered} data-total={view.totals.total}>
                {t("answeredValue", { done: view.totals.answered, total: view.totals.total })}
              </dd>
            </div>
            <div className={styles.total}>
              <dt>{t("attempts")}</dt>
              <dd data-attempts={view.totals.attempts}>{t("attemptsValue", { n: view.totals.attempts })}</dd>
            </div>
            <div className={styles.total}>
              <dt>{t("mastered")}</dt>
              <dd data-mastered={view.totals.mastered}>{t("masteredValue", { n: view.totals.mastered })}</dd>
            </div>
            <div className={styles.total}>
              <dt>{t("studyDays")}</dt>
              <dd data-study-days={view.totals.studyDays}>{t("studyDaysValue", { n: view.totals.studyDays })}</dd>
            </div>
          </dl>
        )}
      </section>

      <section aria-labelledby="record-forecast">
        <h2 id="record-forecast" className={styles.h2}>
          {t("forecastTitle")}
        </h2>
        {view === null ? (
          <div className={styles.forecastPending} {...pending} />
        ) : view.empty ? null : (
          <ol className={styles.forecast}>
            {view.forecast.map((n, d) => (
              <li key={d} className={styles.fRow} data-forecast={d} data-count={n}>
                <span className={styles.fDay}>{d === 0 ? t("today") : dayLabel(view.today + d, locale)}</span>
                <span className={styles.track} aria-hidden="true">
                  {n > 0 ? <span className={styles.fill} style={{ width: `${Math.round((n / max) * 100)}%` }} /> : null}
                </span>
                <span className={styles.fNum}>{t("questionsN", { n })}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="record-daily">
        <h2 id="record-daily" className={styles.h2}>
          {t("dailyTitle")}
        </h2>
        {view === null ? (
          <div className={styles.dailyPending} {...pending} />
        ) : view.empty ? null : (
          <table className={styles.daily}>
            <thead>
              <tr>
                {t("weekdays")
                  .split(",")
                  .map((w) => (
                    <th key={w} scope="col">
                      {w}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {view.weeks.map((row) => (
                <tr key={row[0]!.day}>
                  {row.map(({ day, count }) =>
                    count === null ? (
                      <td key={day} />
                    ) : (
                      <td
                        key={day}
                        className={day === view.today ? styles.todayCell : undefined}
                        title={t("dailyLabel", { date: dayLabel(day, locale), n: count })}
                        {...(day === view.today ? { "data-day-today": "" } : {})}
                        data-count={count}
                      >
                        {count === 0 ? "·" : count}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="record-topics">
        <div className={styles.h2Row}>
          <h2 id="record-topics" className={styles.h2Bare}>
            {t("topicsTitle")}
          </h2>
          <span className={styles.sort} data-sort={sort}>
            <span className={styles.sortLabel}>{t("sortBy")}</span>
            <Link
              href="/record"
              className={sort === "stars" ? styles.sortOn : styles.sortOff}
              aria-current={sort === "stars" ? "true" : undefined}
            >
              {t("sortStars")}
            </Link>
            <Link
              href="/record?sort=rate"
              className={sort === "rate" ? styles.sortOn : styles.sortOff}
              aria-current={sort === "rate" ? "true" : undefined}
            >
              {t("sortRate")}
            </Link>
          </span>
        </div>
        {view === null ? (
          <div className={styles.topicsPending} {...pending} />
        ) : view.empty ? null : (
          view.groups.map((g) => (
            <div key={g.category} data-category={g.category}>
              <h3 className={styles.h3}>
                <span className={styles.catTag} lang="ja">
                  {tp(PRACTICE_CATEGORY_LABEL_KEYS[g.category]!)}
                </span>
              </h3>
              <table className={styles.table}>
                <colgroup>
                  <col />
                  <col className={styles.colStars} />
                  <col className={styles.colAnswered} />
                  <col className={styles.colRate} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">{t("colTopic")}</th>
                    <th scope="col">{t("colStars")}</th>
                    <th scope="col" className={styles.num}>
                      {t("colAnswered")}
                    </th>
                    <th scope="col" className={styles.num}>
                      {t("colRate")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.topicId} data-topic={r.topicId}>
                      <td lang="ja">
                        <Link href={`/practice/browse/${r.topicId}`} className={styles.link}>
                          {r.name_jp}
                        </Link>
                      </td>
                      <td className={styles.stars} aria-label={String(r.stars)}>
                        {starText(r.stars)}
                      </td>
                      <td className={styles.num}>
                        {r.answered}/{r.total}
                      </td>
                      <td className={styles.num} data-rate={r.rate === null ? "" : Math.round(r.rate * 100)}>
                        {r.rate === null ? "—" : `${Math.round(r.rate * 100)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
