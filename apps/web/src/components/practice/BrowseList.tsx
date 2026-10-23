// Stage 7 Phase 1 Task 10 (D-189 §4 /practice/browse) — browse by field / topic and by exam year, the
// successor of the old /quiz landing and an entry into practice. Two sections on dotted-rule headings,
// plain tables on rule lines (no card grids):
//   - 分野・領域: the three fields in IPA order (ストラテジ → マネジメント → テクノロジ, the exam's own
//     order), each a table of its topics (name JP-only, OQ-03 → the topic page; 中分類 in the UI
//     language; 頻出度 ★; question count).
//   - 年度: every exam, newest first (practice starts from the recent papers; the old landing was
//     oldest-first), each → /practice?exam=<id>&n=all&order=seq (FreshLink: a new group per start).
// Book parts (category tags, 頻出度, exam labels) stay Japanese in every locale.

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { topicStars, type Stars } from "@/lib/practice/practiceIndex";
import {
  PRACTICE_CATEGORY_LABEL_KEYS,
  PRACTICE_CATEGORY_ORDER,
  examsNewestFirst,
  starText,
} from "@/lib/practice/practiceLabels";
import { localized, type QuizIndex } from "@/lib/quiz/quizModel";

import styles from "./browse.module.css";
import { FreshLink } from "./FreshLink";

export interface BrowseTopic {
  id: string;
  name_jp: string;
  /** 中分類 in the UI language */
  medium: string;
  stars: Stars;
  count: number;
}

export interface BrowseModel {
  categories: { category: string; topics: BrowseTopic[] }[];
  /** newest first */
  exams: { id: string; label: string; count: number }[];
}

/** quiz_index → the browse lists (categories in IPA order, index order inside; exams newest first). */
export function browseModel(index: Pick<QuizIndex, "topics" | "exams">, locale: string): BrowseModel {
  const stars = topicStars(index);
  const categories = PRACTICE_CATEGORY_ORDER.map((category) => ({
    category,
    topics: index.topics
      .filter((t) => t.category === category)
      .map((t) => ({
        id: t.topic_id,
        name_jp: t.name_jp,
        medium: localized(t.medium_jp, t.medium_zh, t.medium_en, locale),
        stars: stars[t.topic_id]!,
        count: t.question_count,
      })),
  })).filter((c) => c.topics.length > 0);
  const exams = examsNewestFirst(index.exams).map((e) => ({ id: e.exam_id, label: e.label_jp, count: e.question_count }));
  return { categories, exams };
}

export function BrowseList({ categories, exams }: BrowseModel): React.ReactElement {
  const t = useTranslations("Practice");
  return (
    <main className={styles.page} data-browse="">
      <h1 className={styles.title}>{t("browseTitle")}</h1>
      <p className={styles.lead}>{t("browseLead")}</p>
      <p className={styles.lead}>
        <Link href="/practice" className={styles.link}>
          {t("toSetup")}
        </Link>
      </p>

      <section aria-labelledby="browse-topics">
        <h2 id="browse-topics" className={styles.h2}>
          {t("browseTopics")}
        </h2>
        {categories.map((c) => (
          <div key={c.category} data-cat={c.category}>
            <h3 className={styles.catHead}>
              <span className={styles.catTag} lang="ja">
                {PRACTICE_CATEGORY_LABEL_KEYS[c.category] ? t(PRACTICE_CATEGORY_LABEL_KEYS[c.category]!) : c.category}
              </span>
            </h3>
            <table className={`${styles.table} ${styles.fixed}`}>
              <thead>
                <tr>
                  <th scope="col">{t("colTopic")}</th>
                  <th scope="col" className={`${styles.colMedium} ${styles.narrowHide}`}>
                    {t("colMedium")}
                  </th>
                  <th scope="col" className={styles.colStars} lang="ja">
                    {t("starsLabel")}
                  </th>
                  <th scope="col" className={`${styles.num} ${styles.colCount}`}>
                    {t("colCount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.topics.map((x) => (
                  <tr key={x.id} data-topic-row={x.id}>
                    <td className={styles.strong}>
                      <Link href={`/practice/browse/${x.id}`} className={styles.link} lang="ja">
                        {x.name_jp}
                      </Link>
                    </td>
                    <td className={`${styles.muted} ${styles.narrowHide}`}>{x.medium}</td>
                    <td>
                      <span className={styles.stars} role="img" aria-label={t("starsAria", { n: x.stars })}>
                        {starText(x.stars)}
                      </span>
                    </td>
                    <td className={styles.num}>{t("questionsN", { n: x.count })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section aria-labelledby="browse-exams">
        <h2 id="browse-exams" className={styles.h2}>
          {t("browseExams")}
        </h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t("colExam")}</th>
              <th scope="col" className={styles.num}>
                {t("colCount")}
              </th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id} data-exam-row={e.id}>
                <td className={styles.strong}>
                  <FreshLink href={`/practice?exam=${e.id}&n=all&order=seq`} className={styles.link} lang="ja">
                    {e.label}
                  </FreshLink>
                </td>
                <td className={styles.num}>{t("questionsN", { n: e.count })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
