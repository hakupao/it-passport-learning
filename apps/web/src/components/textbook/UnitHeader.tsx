// Stage 7 Phase 3 (D-196 §0-5) — the unit header: breadcrumb (分野 › 中分類 › topic › 単元 n / N),
// title, meta (頻出度 · minutes · terms · the unit's past questions), then `children` (the
// 「AI 先生に聞く」 slot), then the term index (v1: headwords in a row, each jumping to its article).
// No side rail (§0-5).

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { toDataLang, type ReaderUnit, type UnitPlace } from "@/lib/textbook/reader";

import { catKey } from "./TextbookToc";
import styles from "./reader.module.css";

interface Props {
  unit: ReaderUnit;
  place: UnitPlace | null;
  locale: string;
  pastCount: number;
  children?: React.ReactNode;
}

export function UnitHeader({ unit, place, locale, pastCount, children }: Props): React.ReactElement {
  const t = useTranslations("Textbook");
  const dl = toDataLang(locale);
  const title = unit.title[dl] || unit.title.jp;
  return (
    <header>
      <nav aria-label={t("breadcrumb")} data-part="breadcrumb" className={styles.crumbs}>
        <Link href={`/textbook#${place?.category ?? unit.category}`} className={styles.crumbLink}>
          {t(catKey(place?.category ?? unit.category))}
        </Link>
        {place ? (
          <>
            <span aria-hidden="true"> › </span>
            <span>{place.medium}</span>
            <span aria-hidden="true"> › </span>
            <span>{place.topicName}</span>
            <span aria-hidden="true"> › </span>
            <span>{t("unitOf", { n: place.n, total: place.total })}</span>
          </>
        ) : null}
      </nav>
      <h1 className={styles.h1}>{title}</h1>
      <p data-part="meta" className={styles.meta}>
        <span className={styles.badge}>{unit.freqBadge}</span>
        <span>{t("minutes", { n: unit.minutes })}</span>
        <span>{t("termCount", { n: unit.terms.length })}</span>
        <span>{t("pastCount", { n: pastCount })}</span>
      </p>
      {children}
      <nav aria-label={t("termIndex")} data-part="term-index" className={styles.termIndex}>
        <ul>
          {unit.terms.map((tm) => (
            <li key={tm.id}>
              <a href={`#${tm.id}`}>{tm.term}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
