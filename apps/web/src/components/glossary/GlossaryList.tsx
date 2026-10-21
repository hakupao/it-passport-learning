// Stage 6 (D-179 / D-180 §0-3) — /[locale]/glossary list view.
//
// Client component: the server page builds the topic groups (buildListGroups) and
// passes them in; the search box filters them in the browser. Only `import type`
// from lib/glossary/dictionary — that module pulls in the node:fs textbook reader.
// Each item links to /glossary/<termId> (hash id, so headwords with / & ? etc. are
// safe in the path). The 小分類 heading stays JP in every locale (OQ-03).

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { DictListGroup } from "@/lib/glossary/dictionary";

import styles from "./glossary.module.css";

// Mirrors searchNorm in lib/glossary/dictionary (DictListItem.search is pre-normalized).
const norm = (s: string): string => s.normalize("NFKC").toLowerCase();

/** Case-insensitive substring match on the item's search field (JP headword + every sense's zh/en); empty groups are dropped. */
export function filterItems(groups: DictListGroup[], q: string): DictListGroup[] {
  const needle = norm(q.trim());
  if (needle === "") return groups;
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.search.includes(needle)),
    }))
    .filter((g) => g.items.length > 0);
}

export function GlossaryList({
  locale,
  groups,
}: {
  locale: string;
  groups: DictListGroup[];
}): React.ReactElement {
  const t = useTranslations("Glossary");
  const [q, setQ] = useState("");
  const shown = useMemo(() => filterItems(groups, q), [groups, q]);
  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.sub}>{t("subtitle", { n: total })}</p>
        <input
          type="search"
          className={styles.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
        />
      </header>

      {shown.length === 0 ? (
        <p className={styles.empty}>{t("noResults")}</p>
      ) : (
        shown.map((g) => (
          <section key={g.topicId} className={styles.group}>
            <h2 className={styles.groupName}>{g.nameJp}</h2>
            <p className={styles.groupMeta}>
              {g.major} · {g.medium}
            </p>
            <ul className={styles.items}>
              {g.items.map((i) => (
                <li key={i.id}>
                  <Link href={`/glossary/${i.id}`} locale={locale} className={styles.itemLink}>
                    <span className={styles.term}>{i.term}</span>
                    {i.gloss !== i.term && <span className={styles.gloss}>{i.gloss}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
