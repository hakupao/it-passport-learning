// Stage 4 step3 — /[locale]/textbook : schema-verification index + report.
//
// Standalone verification harness (Session 81). Reads the 12 pilot units from the
// gitignored data dir at request time, runs validateUnit() on each, and renders an
// aggregate schema report. NOT the Stage 6 production reading UI.

import { setRequestLocale } from "next-intl/server";

import { SchemaReport } from "@/components/textbook/SchemaReport";
import { loadAllUnits, loadUnitIndex } from "@/lib/textbook/loader";
import { validateUnit } from "@/lib/textbook/validate";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function TextbookIndexPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);

  const index = await loadUnitIndex();
  const units = await loadAllUnits();
  const reports = await Promise.all(units.map((u) => validateUnit(u)));

  return <SchemaReport index={index} reports={reports} locale={locale} />;
}
