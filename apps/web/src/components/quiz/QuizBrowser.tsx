// Stage 6 / Quiz Phase 0 (Session 86, D-135) — quiz landing / browser.
//
// Server component: two browse modes over the 2900-question past-exam corpus —
//   ① 分野別 (by syllabus topic, 63, grouped by category in D-114 path order)
//   ② 年度別 (by exam, 29, chronological)
// Each entry links to /quiz?mode=…&id=… (the same route renders the set).
// Mirrors TextbookToc (server + getTranslations + Link).

import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { QuizExamRef, QuizNavCategory } from "@/lib/quiz/quizModel";

import styles from "./quiz.module.css";

interface Props {
  locale: string;
  stats: { questions: number; topics: number; exams: number; with_figure: number };
  topicNav: QuizNavCategory[];
  exams: QuizExamRef[];
}

export async function QuizBrowser({
  locale,
  stats,
  topicNav,
  exams,
}: Props): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Quiz" });

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.sub}>{t("subtitle")}</p>
        <p className={styles.stats}>
          {t("statsLine", {
            questions: stats.questions,
            topics: stats.topics,
            exams: stats.exams,
          })}
        </p>
        <p className={styles.attribution}>{t("attribution")}</p>
      </header>

      <section className={styles.modeSection}>
        <h2 className={styles.modeTitle}>{t("byTopicTitle")}</h2>
        {topicNav.map((cat) => (
          <div key={cat.category} className={styles.cat}>
            <h3 className={styles.catTitle}>{t(`cat_${cat.category}`)}</h3>
            <ul className={styles.topicList}>
              {cat.topics.map((topic) => (
                <li key={topic.topic_id} className={styles.row}>
                  <Link
                    href={`/quiz?mode=topic&id=${encodeURIComponent(topic.topic_id)}`}
                    locale={locale}
                    className={styles.rowLink}
                  >
                    <span>
                      <span className={styles.rowName}>{topic.name_jp}</span>{" "}
                      <span className={styles.rowMeta}>
                        {topic.major} › {topic.medium}
                      </span>
                    </span>
                    <span className={styles.rowCount}>
                      {t("count", { n: topic.question_count })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.modeSection}>
        <h2 className={styles.modeTitle}>{t("byExamTitle")}</h2>
        <ul className={styles.examGrid}>
          {exams.map((e) => (
            <li key={e.exam_id} className={`${styles.row} ${styles.examCard}`}>
              <Link
                href={`/quiz?mode=exam&id=${encodeURIComponent(e.exam_id)}`}
                locale={locale}
                className={styles.rowLink}
              >
                <span className={styles.rowName}>{e.label_jp}</span>
                <span className={styles.rowCount}>{t("count", { n: e.question_count })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
