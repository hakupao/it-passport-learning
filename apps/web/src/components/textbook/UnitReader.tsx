// Stage 6 (Session 85) — production single-unit reader.
//
// Async server component, single-language per the active locale (D-019 Q3 lean).
// Renders overview → terms (definition / explanation / analogy / memory hook +
// inlined self-generated SVG) → summary, with in-topic prev/next. The JP term is
// always the headword (exam vocabulary); zh/en show a gloss beside it.
//
// Deferred to the later Quiz sub-stage (D-133): inline_quiz / challenge_questions
// (resolve against the IPA past-exam corpus, not shipped) and source_figures
// (IPA exam PNGs, not shipped). A note stands in where practice will appear.

import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  loadGeneratedSvg,
  pick,
  pickList,
  pickTerm,
  toDataLang,
  type TextbookUnit,
  type UnitNeighbors,
} from "@/lib/textbook/reader";

import styles from "./reader.module.css";

/** Typed objects → indexable record, for the trilingual `pick*` helpers. */
function rec(o: object): Record<string, unknown> {
  return o as Record<string, unknown>;
}

interface Props {
  unit: TextbookUnit;
  neighbors: UnitNeighbors;
  locale: string;
}

export async function UnitReader({
  unit,
  neighbors,
  locale,
}: Props): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Textbook" });
  const showGloss = toDataLang(locale) !== "jp";

  // Preload generated SVGs (parallel) before rendering.
  const termSvgs = await Promise.all(
    unit.terms.map((tm) =>
      tm.figure ? loadGeneratedSvg(tm.figure.svg_path) : Promise.resolve(null),
    ),
  );

  const keyPoints = pickList(rec(unit.summary), "key_points", locale);
  const memoryHooks = pickList(rec(unit.summary), "memory_hooks", locale);

  return (
    <main className={styles.page}>
      <Link href="/textbook" className={styles.back}>
        ← {t("back")}
      </Link>

      <h1 className={styles.h1}>{pick(rec(unit), "title", locale)}</h1>
      <p className={styles.meta}>
        <span className={styles.badge}>{unit.overview.freq_badge}</span>
        <span>{t("minutes", { n: unit.overview.est_minutes })}</span>
        {neighbors.topicName ? (
          <span className={styles.metaTopic}>{neighbors.topicName}</span>
        ) : null}
      </p>

      {/* ① overview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("overview")}</h2>
        <p className={styles.intro}>{pick(rec(unit.overview), "intro", locale)}</p>
      </section>

      {/* ② terms */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t("terms")}（{unit.terms.length}）
        </h2>
        {unit.terms.map((tm, i) => (
          <article key={tm.term} className={styles.term}>
            <h3 className={styles.termHead}>
              <span className={styles.termJp}>{tm.term}</span>
              {showGloss ? (
                <span className={styles.termGloss}>{pickTerm(tm, locale)}</span>
              ) : null}
            </h3>
            <p className={styles.def}>{pick(rec(tm), "definition", locale)}</p>
            <p className={styles.prose}>{pick(rec(tm), "explanation", locale)}</p>
            <p className={styles.analogy}>
              <span className={styles.fieldLabel}>{t("analogy")}</span>
              {pick(rec(tm), "analogy", locale)}
            </p>
            <p className={styles.hook}>
              <span className={styles.fieldLabel}>{t("memoryHook")}</span>
              {pick(rec(tm), "memory_hook", locale)}
            </p>
            {tm.figure && termSvgs[i] ? (
              <figure
                className={styles.figure}
                // Trusted, self-generated Mermaid SVG from our own pipeline.
                dangerouslySetInnerHTML={{ __html: termSvgs[i] as string }}
              />
            ) : null}
          </article>
        ))}
      </section>

      {/* ③ summary */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("summary")}</h2>
        {keyPoints.length > 0 ? (
          <>
            <h3 className={styles.subhead}>{t("keyPoints")}</h3>
            <ul className={styles.list}>
              {keyPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </>
        ) : null}
        {memoryHooks.length > 0 ? (
          <>
            <h3 className={styles.subhead}>{t("memoryHooks")}</h3>
            <ul className={styles.list}>
              {memoryHooks.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {/* ④ practice — deferred to the Quiz sub-stage */}
      <p className={styles.deferNote}>{t("quizDeferred")}</p>

      <nav className={styles.pager}>
        {neighbors.prev ? (
          <Link
            href={`/textbook/${neighbors.prev.unit_id}`}
            className={styles.pagerBtn}
          >
            ← {neighbors.prev.title_jp}
          </Link>
        ) : (
          <span />
        )}
        {neighbors.next ? (
          <Link
            href={`/textbook/${neighbors.next.unit_id}`}
            className={`${styles.pagerBtn} ${styles.pagerNext}`}
          >
            {neighbors.next.title_jp} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
