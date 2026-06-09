// Stage 6 (Session 85) — production textbook table-of-contents.
//
// Server component: renders the full 244-unit corpus grouped category → topic →
// unit (D-114 learning-path order), each unit linking into the reader. buildNav
// resolves per-locale labels from the enriched index (Session 85): the clickable
// unit titles + major/medium group headings localize; the 小分類 topic name stays
// JP (no translation exists in the corpus or the IPA syllabus — OQ-03).

import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { NavCategory } from "@/lib/textbook/reader";

import styles from "./reader.module.css";

const CAT_KEY = {
  technology: "cat_technology",
  management: "cat_management",
  strategy: "cat_strategy",
} as const;

type CatLabelKey = (typeof CAT_KEY)[keyof typeof CAT_KEY] | "cat_other";

function catKey(category: string): CatLabelKey {
  return (CAT_KEY as Record<string, CatLabelKey>)[category] ?? "cat_other";
}

interface Props {
  nav: NavCategory[];
  stats: { topics: number; units: number; terms: number };
  locale: string;
}

export async function TextbookToc({
  nav,
  stats,
  locale,
}: Props): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Textbook" });

  return (
    <main className={styles.page}>
      <header className={styles.tocHead}>
        <h1 className={styles.tocTitle}>{t("title")}</h1>
        <p className={styles.tocSub}>{t("subtitle")}</p>
        <p className={styles.stats}>
          {t("stats", {
            topics: stats.topics,
            units: stats.units,
            terms: stats.terms,
          })}
        </p>
      </header>

      {nav.map((cat) => (
        <section key={cat.category} className={styles.cat}>
          <h2 className={styles.catTitle}>{t(catKey(cat.category))}</h2>
          {cat.topics.map((topic) => (
            <div key={topic.topic_id} className={styles.topic}>
              <h3 className={styles.topicName}>{topic.name_jp}</h3>
              <p className={styles.topicMeta}>
                {topic.major} · {topic.medium}
              </p>
              <ul className={styles.units}>
                {topic.units.map((u) => (
                  <li key={u.unit_id}>
                    <Link href={`/textbook/${u.unit_id}`} className={styles.unitLink}>
                      <span className={styles.unitTitle}>{u.title}</span>
                      <span className={styles.badge}>{u.badge}</span>
                      <span className={styles.terms}>
                        {t("termCount", { n: u.term_count })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
