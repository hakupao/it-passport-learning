// Stage 7 Phase 3 (D-196 §0-9, D-195 §4) — a 易混 pair: a side-by-side table of terms a / b, placed
// right after the later of the two terms (UnitReader), one row per aspect; the decisive row
// (`key`) is emphasised (tint fill + spot text, never red / green) and named for screen readers
// by an sr-only 「決め手」 before its label. v2 only.

import { useTranslations } from "next-intl";

import { parseInline } from "@/lib/textbook/inline";
import { toDataLang, type ReaderPair, type ReaderTerm } from "@/lib/textbook/reader";

import styles from "./reader.module.css";

interface Props {
  pair: ReaderPair;
  /** the unit's terms (headword → gloss) */
  terms: ReaderTerm[];
  locale: string;
}

export function PairBlock({ pair, terms, locale }: Props): React.ReactElement {
  const t = useTranslations("Textbook");
  const dl = toDataLang(locale);
  const gloss = (jp: string) => {
    const tm = terms.find((x) => x.term === jp);
    return (tm && (tm.gloss[dl] || tm.gloss.jp)) || jp;
  };
  const rich = (v: Record<"jp" | "zh" | "en", string>) => parseInline(v[dl] || v.jp, { key: styles.kw, jp: styles.jpWord });
  const a = gloss(pair.a);
  const b = gloss(pair.b);
  return (
    <section data-part="pair" className={styles.pair}>
      <h3 className={styles.pairTitle}>{t("pairTitle", { a, b })}</h3>
      <div className={styles.overviewScroll}>
        <table className={styles.pairTable}>
          <thead>
            <tr>
              <th scope="col">{t("pairAspect")}</th>
              <th scope="col">{a}</th>
              <th scope="col">{b}</th>
            </tr>
          </thead>
          <tbody>
            {pair.rows.map((r, i) => (
              <tr key={i} data-key={r.key ? "true" : undefined} className={r.key ? styles.pairKey : undefined}>
                <th scope="row">
                  {r.key ? <span className="sr-only">{t("pairKey")}</span> : null}
                  {rich(r.label)}
                </th>
                <td>{rich(r.a)}</td>
                <td>{rich(r.b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
