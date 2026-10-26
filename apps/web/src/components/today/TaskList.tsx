// Stage 7 Phase 1 Task 11 (D-189 §6.1, mockup A4-Home) — the task rows, the primary button and the
// secondary links. Presentational: TodayPage passes the computed view (null = the record is still
// loading: the block keeps its height and shows no numbers).
//
// Row: checkbox (checked when done; the state is also in sr-only text) · spot tag · title (a link
// while open) + one detail line · minutes. A done row shows the start-of-day count and 「今天的部分
// 已完成」. Topic names are JP in every locale (OQ-03), marked lang="ja".

"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { PRACTICE_CATEGORY_LABEL_KEYS } from "@/lib/practice/practiceLabels";
import type { TodayTask } from "@/lib/practice/todayModel";

import styles from "./today.module.css";

export interface TaskListView {
  /** no attempt at all: the empty-state line and the baseline button instead of rows */
  newUser: boolean;
  tasks: TodayTask[];
  /** the primary button (「从第 1 项开始」 / 「先做 20 题摸底」); null = everything done today */
  primary: { href: string; label: "start" | "baseline" } | null;
}

type T = ReturnType<typeof useTranslations>;

function title(task: TodayTask, t: T): string {
  if (task.kind === "unit") return task.unit?.title ?? "";
  const n = task.done ? (task.startCount ?? 0) : task.count;
  return t(`title_${task.kind}`, { n });
}

function Detail({ task, t, tp }: { task: TodayTask; t: T; tp: T }): React.ReactNode {
  if (task.done) return t("doneLine");
  switch (task.kind) {
    case "mistakes": {
      const parts: React.ReactNode[] = task.detail.map((d) => (
        <span key={d} lang="ja">
          {d}
        </span>
      ));
      if ((task.others ?? 0) > 0) parts.push(<span key="__others">{t("others", { n: task.others ?? 0 })}</span>);
      return parts.flatMap((p, i) => (i === 0 ? [p] : [" · ", p]));
    }
    case "due":
      return t("detail_due");
    case "new":
      return task.detail.length === 0
        ? t("detail_new")
        : t.rich("detail_newWeak", {
            topics: task.detail.join("、"),
            jp: (chunks) => <span lang="ja">{chunks}</span>,
          });
    case "unit": {
      const catKey = task.unit ? PRACTICE_CATEGORY_LABEL_KEYS[task.unit.category] : undefined;
      return (
        <>
          {catKey ? <span lang="ja">{tp(catKey)}</span> : null}
          {catKey ? " · " : null}
          <span lang="ja">{task.detail[0]}</span>
        </>
      );
    }
  }
}

export function TaskList({ view }: { view: TaskListView | null }): React.ReactElement {
  const t = useTranslations("Today");
  const tp = useTranslations("Practice");
  const tm = useTranslations("Mistakes");
  const tmock = useTranslations("Mock");

  if (view === null) {
    return (
      <div className={styles.tasksPending} data-pending="" aria-busy="true">
        <span className="sr-only">{t("loading")}</span>
      </div>
    );
  }

  return (
    <>
      {view.newUser ? (
        <p className={styles.empty} data-empty="tasks">
          {t("newUserLead")}
        </p>
      ) : view.tasks.length > 0 ? (
        <ol className={styles.tasks}>
          {view.tasks.map((task) => (
            <li
              key={task.kind}
              className={`${styles.task} ${task.done ? styles.taskDone : ""}`}
              data-task={task.kind}
              data-done={String(task.done)}
            >
              <span className={`${styles.check} ${task.done ? styles.checkDone : ""}`} aria-hidden="true">
                {task.done ? "✓" : null}
              </span>
              <span className={styles.tag}>{t(`tag_${task.kind}`)}</span>
              <div className={styles.taskBody}>
                <div className={styles.taskTitle}>
                  {task.done ? (
                    title(task, t)
                  ) : (
                    <Link href={task.href} className={styles.link}>
                      {title(task, t)}
                    </Link>
                  )}
                  {task.done ? <span className="sr-only">（{t("doneMark")}）</span> : null}
                  {task.kind === "mistakes" && !task.done ? (
                    <Link href="/practice/mistakes" className={`${styles.link} ${styles.listLink}`} data-mistakes-list="">
                      {tm("viewList")}
                    </Link>
                  ) : null}
                </div>
                <div className={styles.detail}>
                  <Detail task={task} t={t} tp={tp} />
                </div>
              </div>
              {task.done ? null : <span className={styles.minutes}>{t("minutes", { n: task.minutes })}</span>}
            </li>
          ))}
        </ol>
      ) : null}
      <div className={styles.actions}>
        {view.primary ? (
          <Link href={view.primary.href} className={styles.btnPrimary} data-primary="">
            {t(view.primary.label)}
          </Link>
        ) : (
          <p className={styles.allDone} data-all-done="">
            {t("allDone")}
          </p>
        )}
        <Link href="/practice" className={styles.link}>
          {t("toSetup")}
        </Link>
        <Link href="/mock" className={styles.link}>
          {tmock("title")}
        </Link>
      </div>
    </>
  );
}
