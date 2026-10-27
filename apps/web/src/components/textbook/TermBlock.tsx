// Stage 7 Phase 3 (D-196 §0-6) — one term in the D-195 order: headword (+ glossary link) →
// 一句話 → figure → 展開 → たとえ / 覚え方 → this term's past questions (from=unit, click-time run). `article id` =
// termId(term) (the glossary's /textbook/<unitId>#<termId> target). The figure is the v1
// self-generated Mermaid SVG (trusted pipeline output, inlined).

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { toDataLang, type ReaderTerm } from "@/lib/textbook/reader";

import styles from "./reader.module.css";
import { UnitPracticeLink } from "./UnitPracticeLink";

interface Props {
  term: ReaderTerm;
  unitId: string;
  /** the inlined SVG of `term.fig`; null when there is none or it could not be read */
  svg: string | null;
  locale: string;
}

export function TermBlock({ term, unitId, svg, locale }: Props): React.ReactElement {
  const t = useTranslations("Textbook");
  const tg = useTranslations("Glossary");
  const dl = toDataLang(locale);
  const pick = (v: Record<"jp" | "zh" | "en", string>) => v[dl] || v.jp;
  return (
    <article id={term.id} className={styles.term}>
      {/* The link sits beside the h3, not inside it, so the heading's name is just the term;
          the sr-only term makes each link name unique. */}
      <div className={styles.termRow}>
        <h3 className={styles.termHead}>
          <span className={styles.termJp}>{term.term}</span>
          {dl !== "jp" ? <span className={styles.termGloss}>{pick(term.gloss)}</span> : null}
        </h3>
        <Link href={`/glossary/${term.id}`} locale={locale} className={styles.termLink}>
          {tg("openInGlossary")}
          <span className="sr-only"> {term.term}</span>
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
      <p data-part="one" className={styles.def}>
        {pick(term.one)}
      </p>
      {term.fig && svg ? (
        <figure
          data-part="fig"
          className={styles.figure}
          // Trusted, self-generated Mermaid SVG from our own pipeline.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : null}
      <p data-part="detail" className={styles.prose}>
        {pick(term.detail)}
      </p>
      {term.analogy ? (
        <p data-part="analogy" className={styles.analogy}>
          <span className={styles.fieldLabel}>{t("analogy")}</span>
          {pick(term.analogy)}
        </p>
      ) : null}
      {term.hook ? (
        <p data-part="hook" className={styles.hook}>
          <span className={styles.fieldLabel}>{t("hook")}</span>
          {pick(term.hook)}
        </p>
      ) : null}
      {term.quiz.length > 0 ? (
        <p data-part="term-past" className={styles.termPast}>
          <UnitPracticeLink ids={term.quiz} unitId={unitId}>
            {t("termPast", { n: term.quiz.length })}
            <span aria-hidden="true"> →</span>
          </UnitPracticeLink>
        </p>
      ) : null}
    </article>
  );
}
