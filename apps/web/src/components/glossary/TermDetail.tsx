// Stage 6 (D-179 / D-180 §0-3) — /[locale]/glossary/[termId] detail view.
//
// Sync, server-renderable component (no client state): the page loads the entry,
// the localized unit titles and the per-sense SVGs and passes them in. Every
// sense (one per textbook unit teaching the headword) shows definition /
// explanation / analogy / memory hook / figure plus a "learn in" link to
// /textbook/<unitId>#<termId>; past-exam questions link to the single-question
// page /practice/q/<questionId> (Stage 7 Task 13). The JP term is always the headword.
// D-181 Phase C: under the headword, 「AI 先生に聞く」 (a client island; the panel
// and the AI SDK load on the first click) with the term anchor the page built.

import { useTranslations } from "next-intl";

import { AskSensei, SenseiHost } from "@/components/sensei/AskSensei";
import { Link } from "@/i18n/navigation";
import { field, type DictEntry } from "@/lib/glossary/dictionary";
import { pickTerm } from "@/lib/textbook/reader";

import styles from "./glossary.module.css";

interface Props {
  locale: string;
  entry: DictEntry;
  /** unitId → localized unit title. */
  unitTitles: Record<string, string>;
  /** Inlined figure SVG per sense (aligned with entry.senses), null when none. */
  svgs: (string | null)[];
  /** The AI 先生 term anchor (lib/sensei/textbookAnchors termAnchor). */
  senseiAnchorText: string;
}

export function TermDetail({ locale, entry, unitTitles, svgs, senseiAnchorText }: Props): React.ReactElement {
  const t = useTranslations("Glossary");
  const gloss = pickTerm(entry.senses[0]!.term, locale);

  return (
    <main className={styles.page}>
      <Link href="/glossary" locale={locale} className={styles.back}>
        ← {t("backToList")}
      </Link>

      <h1 className={styles.detailTitle}>
        <span>{entry.term}</span>
        {gloss.trim() !== "" && gloss !== entry.term && <span className={styles.gloss}>{gloss}</span>}
      </h1>

      <SenseiHost>
        <div className={styles.askSensei}>
          <AskSensei kind="term" anchorId={entry.id} title={entry.term} anchorText={senseiAnchorText} />
        </div>
      </SenseiHost>

      {entry.senses.map((s, i) => (
        <div key={`${s.unitId}-${i}`}>
          {i === 1 && <h2 className={styles.sectionTitle}>{t("otherSenses", { n: entry.senses.length - 1 })}</h2>}
          <article className={styles.sense}>
            <p className={styles.learnIn}>
              <span className={styles.fieldLabel}>{t("learnIn")}</span>
              <Link href={`/textbook/${s.unitId}#${entry.id}`} locale={locale}>
                {unitTitles[s.unitId] ?? s.unitId}
              </Link>
            </p>
            <p className={styles.def}>
              <span className={styles.fieldLabel}>{t("definition")}</span>
              {field(s.term, "definition", locale)}
            </p>
            <p className={styles.prose}>
              <span className={styles.fieldLabel}>{t("explanation")}</span>
              {field(s.term, "explanation", locale)}
            </p>
            {/* a v2 term may have no analogy / memory hook ("" in every language, D-196 §0-9) */}
            {field(s.term, "analogy", locale).trim() !== "" && (
              <p className={styles.note}>
                <span className={styles.fieldLabel}>{t("analogy")}</span>
                {field(s.term, "analogy", locale)}
              </p>
            )}
            {field(s.term, "memory_hook", locale).trim() !== "" && (
              <p className={styles.note}>
                <span className={styles.fieldLabel}>{t("memoryHook")}</span>
                {field(s.term, "memory_hook", locale)}
              </p>
            )}
            {svgs[i] ? (
              <figure
                className={styles.figure}
                // Trusted, self-generated Mermaid SVG from our own pipeline (as UnitReader).
                dangerouslySetInnerHTML={{ __html: svgs[i] as string }}
              />
            ) : null}
          </article>
        </div>
      ))}

      {entry.questions.length > 0 && (
        <section className={styles.questions}>
          <h2 className={styles.sectionTitle}>
            {t("questions")}（{t("questionCount", { n: entry.questions.length })}）
          </h2>
          <ul className={styles.qList}>
            {entry.questions.map((q) => (
              <li key={q.id}>
                <Link href={`/practice/q/${q.id}`} locale={locale}>
                  {q.sourceLabel}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
