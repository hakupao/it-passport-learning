// Stage 7 Phase 1 Task 11 (D-189 §6.1 / D-190 §0-7 / §0-17 / §0-20 / §0-26, mockup A4-Home) — the
// home page /[locale]: what to do today.
//
// The learning record lives in the browser, so everything is computed here (todayModel) once the
// record has loaded. Before that — the server render and the first client frame — every block keeps
// its place (min-height, data-pending) and shows no number and no new-user state, so nothing flashes
// and the server's clock / time zone never reaches the markup (no hydration mismatch). One `at =
// Date.now()` gives today (toLocalDay) and the dateKey (localDateKey) of the plan.
//   - Date row: the reverse date tag + 「考试 M月D日」, or the 「设定考试日」 link to /settings when no exam
//     date is set or it is past (then no countdown either).
//   - Tasks (dailyPlan + startOfDayPlan → todayTasks): mistakes → due → new → unit; 「从第 1 项开始」
//     = primaryHref; all done → 「今天的任务都完成了」 instead of the button. A new user (no attempt)
//     gets one empty-state line and 「先做 20 题摸底」 (baselineIds, kind=fresh) instead of rows —
//     the plan's 10 new questions would contradict it — and empty-state lines in the other blocks.
//   - 薄弱领域 (weakTopicRows), the countdown box (daysUntil, answeredCount), the three-field bars
//     (areaRates) + pass line, 「今天的 3 个用语」 (todayTerms over the first open group's ids — the
//     baseline for a new user —, else the weakest topic).
// Phase 1 hides the 模拟考试 link (the page does not exist yet).

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import { settingValue, type LearningRecord } from "@/lib/learning/record";
import { dailyPlan, toLocalDay } from "@/lib/learning/schedule";
import { poolFromIndex, type TodayIndex, type TodayTermCard } from "@/lib/practice/practiceIndex";
import { localDateKey, startOfDayPlan, todayHref } from "@/lib/practice/practiceSession";
import {
  answeredCount,
  areaRates,
  baselineIds,
  daysUntil,
  isNewUser,
  primaryHref,
  todayTasks,
  todayTerms,
  weakTopicRows,
  type AreaRates as Rates,
  type WeakTopicRow,
} from "@/lib/practice/todayModel";

import { AreaRates } from "./AreaRates";
import { ExamCountdown, type CountdownView } from "./ExamCountdown";
import { TaskList, type TaskListView } from "./TaskList";
import { TodayTerms } from "./TodayTerms";
import { WeakTopics } from "./WeakTopics";
import styles from "./today.module.css";

export interface TodayPageProps {
  /** the today payload (§0-20); topicTerms all empty when the dictionary failed to load */
  index: TodayIndex;
  locale: string;
}

interface View {
  dateTag: string;
  /** the exam date label (set and not past); null → the 「设定考试日」 link */
  examLabel: string | null;
  newUser: boolean;
  tasks: TaskListView;
  weak: WeakTopicRow[];
  rates: Rates;
  countdown: CountdownView;
  terms: TodayTermCard[];
}

const DAY_MS = 86_400_000;

/** A day number (toLocalDay) as the date row shows it: 10月23日（五） / Fri, Oct 23. */
function formatDay(day: number, locale: string, weekday: boolean): string {
  const d = new Date(day * DAY_MS);
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", {
      ...(weekday ? { weekday: "short" as const } : {}),
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(d);
  }
  const md = `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
  if (!weekday) return md;
  const wd = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "zh-CN", { weekday: "narrow", timeZone: "UTC" }).format(d);
  return `${md}（${wd}）`;
}

function buildView(record: LearningRecord, index: TodayIndex, locale: string, at: number): View {
  const today = toLocalDay(at);
  const dateKey = localDateKey(new Date(at));
  const pool = poolFromIndex(index);
  const newUser = isNewUser(record);
  const weak = weakTopicRows(record, index);
  const weakest = weak[0]?.topicId ?? null;

  let tasks: TaskListView;
  let firstIds: string[] | null;
  if (newUser) {
    const ids = baselineIds(record, index, dateKey);
    tasks = { newUser, tasks: [], primary: ids.length > 0 ? { href: todayHref("fresh", ids), label: "baseline" } : null };
    firstIds = ids;
  } else {
    const plan = dailyPlan(record, pool, today, toLocalDay, dateKey);
    const rows = todayTasks(plan, record, index, weakest, startOfDayPlan(record, pool, today, toLocalDay, dateKey));
    const href = primaryHref(rows);
    tasks = { newUser, tasks: rows, primary: href === null ? null : { href, label: "start" } };
    firstIds = [plan.mistakes, plan.due, plan.fresh].find((l) => l.length > 0) ?? null;
  }

  const days = daysUntil(settingValue(record, "examDate"), today);
  const upcoming = days !== null && days >= 0 ? days : null;
  const { answered, total } = answeredCount(record, index);
  return {
    dateTag: formatDay(today, locale, true),
    examLabel: upcoming === null ? null : formatDay(today + upcoming, locale, false),
    newUser,
    tasks,
    weak: newUser ? [] : weak,
    rates: areaRates(record, index),
    countdown: { days: upcoming, answered, total },
    terms: todayTerms(index, firstIds, weakest),
  };
}

export function TodayPage({ index, locale }: TodayPageProps): React.ReactElement {
  const t = useTranslations("Today");
  const { record, loaded } = useLearningRecord();
  const view = useMemo(
    () => (loaded ? buildView(record, index, locale, Date.now()) : null),
    [loaded, record, index, locale],
  );

  return (
    <main className={styles.page} data-today="">
      <div className={styles.mainCol}>
        <div className={styles.dateRow} {...(view === null ? { "data-pending": "" } : {})}>
          {view === null ? null : (
            <>
              <span className={styles.dateTag} data-date-tag="">
                {view.dateTag}
              </span>
              {view.examLabel === null ? (
                <Link href="/settings" className={`${styles.link} ${styles.examDate}`}>
                  {t("setExamDate")}
                </Link>
              ) : (
                <span className={styles.examDate} data-exam-date="">
                  {t("examOn", { date: view.examLabel })}
                </span>
              )}
            </>
          )}
        </div>
        <h1 className={styles.title}>{t("title")}</h1>
        <TaskList view={view?.tasks ?? null} />
        <WeakTopics rows={view?.weak ?? null} />
      </div>
      <aside className={styles.side}>
        <ExamCountdown data={view?.countdown ?? null} locale={locale} />
        <AreaRates rates={view?.rates ?? null} newUser={view?.newUser ?? false} />
        <TodayTerms cards={view?.terms ?? null} />
      </aside>
    </main>
  );
}
