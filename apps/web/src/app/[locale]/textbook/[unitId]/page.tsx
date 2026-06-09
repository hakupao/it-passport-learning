// Stage 6 (Session 85) — /[locale]/textbook/[unitId] : production unit reader.
//
// loadUnit() allowlists the unitId slug (path-traversal guard retained from the
// harness loader). The index is read once for in-topic prev/next + breadcrumb.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { UnitReader } from "@/components/textbook/UnitReader";
import {
  loadReaderIndex,
  loadUnit,
  neighbors,
  pick,
  type TextbookUnit,
} from "@/lib/textbook/reader";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; unitId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, unitId } = await params;
  try {
    const unit = await loadUnit(unitId);
    return { title: pick(unit as unknown as Record<string, unknown>, "title", locale) };
  } catch {
    return {};
  }
}

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

  const index = await loadReaderIndex();
  const nb = neighbors(index, unitId);

  return <UnitReader unit={unit} neighbors={nb} locale={locale} />;
}
