// Stage 4 step3 — /[locale]/textbook/[unitId] : single-unit schema view.
//
// Renders the full trilingual 4-part unit (overview/terms/summary/challenge) with
// inlined figures + quiz-reference resolution, plus a per-unit issue panel.

import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { UnitDetail } from "@/components/textbook/UnitDetail";
import { loadQuestionBankIds, loadUnit } from "@/lib/textbook/loader";
import type { TextbookUnit } from "@/lib/textbook/types";
import { validateUnit } from "@/lib/textbook/validate";

import styles from "@/components/textbook/textbook.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; unitId: string }> };

export default async function UnitPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale, unitId } = await params;
  setRequestLocale(locale);

  let unit: TextbookUnit;
  try {
    unit = await loadUnit(unitId);
  } catch {
    notFound();
  }

  const [resolvedIds, report] = await Promise.all([
    loadQuestionBankIds(),
    validateUnit(unit),
  ]);

  return (
    <main className={styles.page}>
      <a className={styles.backLink} href={`/${locale}/textbook`}>
        ← schema report
      </a>

      <UnitDetail unit={unit} resolvedIds={resolvedIds} />

      <div className={styles.issues}>
        <strong>schema check — </strong>
        {report.issues.length === 0 ? (
          <span className={styles.issueClean}>✓ no issues</span>
        ) : (
          <span>
            {report.errorCount} error(s), {report.warnCount} warning(s)
          </span>
        )}
        <ul>
          {report.issues.map((iss, i) => (
            <li
              key={i}
              className={
                iss.severity === "error" ? styles.issueErr : styles.issueWarn
              }
            >
              [{iss.severity}] <span className={styles.mono}>{iss.field}</span> —{" "}
              {iss.message}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
