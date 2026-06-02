// Stage 4 step3 — schema-verification index + report.
// Aggregates validateUnit() across the 12 pilot units and links to each detail page.

import type { UnitReport } from "@/lib/textbook/validate";
import type { UnitIndex } from "@/lib/textbook/types";

import styles from "./textbook.module.css";

export function SchemaReport({
  index,
  reports,
  locale,
}: {
  index: UnitIndex;
  reports: UnitReport[];
  locale: string;
}) {
  const totals = reports.reduce(
    (a, r) => ({
      errors: a.errors + r.errorCount,
      warns: a.warns + r.warnCount,
      genOk: a.genOk + r.figures.generatedResolved,
      gen: a.gen + r.figures.generated,
      srcOk: a.srcOk + r.figures.sourceResolved,
      src: a.src + r.figures.source,
      quizOk: a.quizOk + r.quiz.resolved,
      quiz: a.quiz + r.quiz.total,
      langOk: a.langOk + (r.langComplete ? 1 : 0),
    }),
    {
      errors: 0,
      warns: 0,
      genOk: 0,
      gen: 0,
      srcOk: 0,
      src: 0,
      quizOk: 0,
      quiz: 0,
      langOk: 0,
    },
  );
  const clean = totals.errors === 0;

  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Stage 4 教科書 schema 落地体検 (step3)</h1>
      <p className={styles.sub}>
        pilot scope: <span className={styles.mono}>{index.scope}</span> ·{" "}
        {index.stats.topics} topics / {index.stats.units} units /{" "}
        {index.stats.terms} terms · schema{" "}
        <span className={styles.mono}>{index.schema_version}</span>
      </p>

      <div
        className={`${styles.banner} ${clean ? styles.bannerOk : styles.bannerBad}`}
      >
        <strong className={clean ? styles.pass : styles.fail}>
          {clean ? "✓ SCHEMA OK" : "✗ SCHEMA ERRORS"}
        </strong>{" "}
        — errors {totals.errors}, warnings {totals.warns} · lang-complete{" "}
        {totals.langOk}/{reports.length} · generated figs {totals.genOk}/
        {totals.gen} · source figs {totals.srcOk}/{totals.src} · quiz refs{" "}
        {totals.quizOk}/{totals.quiz} resolved
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>unit</th>
            <th>lang</th>
            <th>gen figs</th>
            <th>src figs</th>
            <th>quiz refs</th>
            <th>err</th>
            <th>warn</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.unitId}>
              <td>
                <a
                  className={styles.unitLink}
                  href={`/${locale}/textbook/${r.unitId}`}
                >
                  {r.unitId}
                </a>
              </td>
              <td className={r.langComplete ? styles.pass : styles.fail}>
                {r.langComplete ? "✓" : "✗"}
              </td>
              <td className={styles.num}>
                {r.figures.generatedResolved}/{r.figures.generated}
              </td>
              <td className={styles.num}>
                {r.figures.sourceResolved}/{r.figures.source}
              </td>
              <td className={styles.num}>
                {r.quiz.resolved}/{r.quiz.total}
              </td>
              <td className={`${styles.num} ${r.errorCount ? styles.fail : ""}`}>
                {r.errorCount}
              </td>
              <td className={styles.num}>{r.warnCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {index.topics.map((t) => (
        <div key={t.topic_id} className={styles.topicCard}>
          <p className={styles.topicHead}>
            {t.name_jp}
            <span className={styles.badge}>{t.node_frequency.badge}</span>
            <span className={styles.badge}>Rule D: {t.rule_d.verdict}</span>
          </p>
          <p className={styles.topicMeta}>
            <span className={styles.mono}>{t.topic_id}</span> · {t.category} ·{" "}
            {t.major} / {t.medium} · {t.objective_jp}
          </p>
          {t.unit_order.map((uid) => {
            const u = t.units.find((x) => x.unit_id === uid);
            return (
              <a
                key={uid}
                className={styles.unitLink}
                href={`/${locale}/textbook/${uid}`}
              >
                {uid} — {u?.title_jp ?? "?"} ({u?.term_count ?? "?"} terms)
              </a>
            );
          })}
        </div>
      ))}
    </main>
  );
}
