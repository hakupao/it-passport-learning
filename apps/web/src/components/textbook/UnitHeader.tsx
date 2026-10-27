// Stage 7 Phase 3 (D-196 §0-5) — the unit header: breadcrumb (分野 › 中分類 › topic › 単元 n / N),
// title, meta (頻出度 · minutes · terms · the unit's past questions), then `children` (the
// 「AI 先生に聞く」 slot), then the term index — v1: headwords in a row, each jumping to its article;
// v2 (D-195 §3): 学習目標 + the collapsible 用語総表 (headword · one line · the extra columns), each
// headword jumping to its article. No side rail (§0-5).

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { parseInline } from "@/lib/textbook/inline";
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
      <nav aria-label={t("breadcrumb")} data-part="breadcrumb">
        <ol className={styles.crumbs}>
          <li>
            <Link href={`/textbook#${place?.category ?? unit.category}`} className={styles.crumbLink}>
              {t(catKey(place?.category ?? unit.category))}
            </Link>
          </li>
          {place ? (
            <>
              <li>
                <span aria-hidden="true">› </span>
                {place.medium}
              </li>
              <li>
                <span aria-hidden="true">› </span>
                {place.topicName}
              </li>
              <li aria-current="page">
                <span aria-hidden="true">› </span>
                {t("unitOf", { n: place.n, total: place.total })}
              </li>
            </>
          ) : null}
        </ol>
      </nav>
      <h1 className={styles.h1}>{title}</h1>
      <p data-part="meta" className={styles.meta}>
        <span className={styles.badge}>{unit.freqBadge}</span>
        <span>{t("minutes", { n: unit.minutes })}</span>
        <span>{t("termCount", { n: unit.terms.length })}</span>
        <span>{t("pastCount", { n: pastCount })}</span>
      </p>
      {children}
      {unit.schema === "v2" && unit.goals && unit.overviewRows ? (
        <V2Overview unit={unit} locale={locale} />
      ) : (
        /* Headwords stay JP in every locale: they are the exam's vocabulary (the article headings
           show the zh / en gloss beside them). */
        <nav aria-label={t("termIndex")} data-part="term-index" className={styles.termIndex}>
          <ul>
            {unit.terms.map((tm) => (
              <li key={tm.id}>
                <a href={`#${tm.id}`}>{tm.term}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

const INLINE = { key: styles.kw, jp: styles.jpWord };

/** v2: 学習目標, then the 用語総表 in a <details> (open; the reader may fold it away). */
function V2Overview({ unit, locale }: { unit: ReaderUnit; locale: string }): React.ReactElement {
  const t = useTranslations("Textbook");
  const dl = toDataLang(locale);
  const goals = unit.goals![dl].length > 0 ? unit.goals![dl] : unit.goals!.jp;
  const cols = unit.overviewCols?.[dl].length ? unit.overviewCols[dl] : (unit.overviewCols?.jp ?? []);
  const byTerm = new Map(unit.terms.map((tm) => [tm.term, tm]));
  return (
    <>
      <section data-part="goals" className={styles.goals}>
        <h2 className={styles.goalsTitle}>{t("goals")}</h2>
        <ul className={styles.list}>
          {goals.map((g, i) => (
            <li key={i}>{parseInline(g, INLINE)}</li>
          ))}
        </ul>
      </section>
      <details data-part="overview" className={styles.overview} open>
        <summary id={`${unit.id}-overview`} className={styles.overviewSummary}>
          {t("overviewTable", { n: unit.terms.length })}
        </summary>
        <div className={styles.overviewScroll}>
          <table aria-labelledby={`${unit.id}-overview`} className={styles.overviewTable}>
            <thead>
              <tr>
                <th scope="col">{t("overviewTerm")}</th>
                <th scope="col">{t("overviewOne")}</th>
                {cols.map((c, i) => (
                  <th key={i} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unit.overviewRows!.map((r) => {
                const tm = byTerm.get(r.term);
                const extra = r.extra[dl].length === cols.length ? r.extra[dl] : r.extra.jp;
                return (
                  <tr key={r.term}>
                    <th scope="row">{tm ? <a href={`#${tm.id}`}>{r.term}</a> : r.term}</th>
                    <td>{parseInline(r.one[dl] || r.one.jp, INLINE)}</td>
                    {extra.map((x, i) => (
                      <td key={i}>{parseInline(x, INLINE)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
