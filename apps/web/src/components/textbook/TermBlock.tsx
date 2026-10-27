// Stage 7 Phase 3 (D-196 §0-6 / §0-9) — one term in the D-195 order: headword (+ glossary link) →
// 一句話 → figure → 展開 → たとえ / 覚え方 → 考点 (v2) → this term's past questions (from=unit,
// click-time run). v2 text goes through parseInline (keywords <strong>, JP originals lang=ja);
// v1 text is printed as stored (its markup must stay byte-identical). `article id` =
// termId(term) (the glossary's /textbook/<unitId>#<termId> target). The figure goes through the
// figure registry (§0-11): the v1 Mermaid SVG renders exactly as before (SvgFig); a v2 fig
// renders its kind, or nothing when its params are invalid.

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { parseInline } from "@/lib/textbook/inline";
import { toDataLang, type ReaderTerm } from "@/lib/textbook/reader";

import { renderFig } from "./figures/registry";
import styles from "./reader.module.css";
import { UnitPracticeLink } from "./UnitPracticeLink";

interface Props {
  term: ReaderTerm;
  unitId: string;
  /** the inlined SVG of `term.fig`; null when there is none or it could not be read */
  svg: string | null;
  locale: string;
  /** the unit is v2: text carries inline markup, the 考点 box shows */
  v2?: boolean;
}

export function TermBlock({ term, unitId, svg, locale, v2 = false }: Props): React.ReactElement {
  const t = useTranslations("Textbook");
  const tg = useTranslations("Glossary");
  const dl = toDataLang(locale);
  const pick = (v: Record<"jp" | "zh" | "en", string>) => v[dl] || v.jp;
  const rich = (v: Record<"jp" | "zh" | "en", string>) => (v2 ? parseInline(pick(v), { key: styles.kw, jp: styles.jpWord }) : pick(v));
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
        {rich(term.one)}
      </p>
      {term.fig ? renderFig(term.fig, { locale, svg }) : null}
      <p data-part="detail" className={styles.prose}>
        {rich(term.detail)}
      </p>
      {term.analogy ? (
        <p data-part="analogy" className={styles.analogy}>
          <span className={styles.fieldLabel}>{t("analogy")}</span>
          {rich(term.analogy)}
        </p>
      ) : null}
      {term.hook ? (
        <p data-part="hook" className={styles.hook}>
          <span className={styles.fieldLabel}>{t("hook")}</span>
          {rich(term.hook)}
        </p>
      ) : null}
      {v2 && term.points.length > 0 ? (
        // a note, not an <aside>: one complementary landmark per term would flood the landmark list
        <div data-part="points" role="note" aria-labelledby={`${term.id}-points`} className={styles.points}>
          <p id={`${term.id}-points`} className={styles.pointsTitle}>
            {t("points")}
          </p>
          <ul>
            {term.points.map((p, i) => (
              <li key={i} data-point={p.kind}>
                <span className={p.kind === "exam" ? styles.pointExam : styles.pointMix}>
                  {t(p.kind === "exam" ? "pointExam" : "pointMix")}
                </span>
                {rich(p.text)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {term.quiz.length > 0 ? (
        <p data-part="term-past" className={styles.termPast}>
          <UnitPracticeLink ids={term.quiz} unitId={unitId} at={term.id}>
            {t("termPast", { n: term.quiz.length })}
            <span className="sr-only"> {term.term}</span>
            <span aria-hidden="true"> →</span>
          </UnitPracticeLink>
        </p>
      ) : null}
    </article>
  );
}
