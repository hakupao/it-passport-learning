// Stage 6 (Session 85) — /[locale]/textbook : production table of contents.
//
// Replaces the Session-81 schema-verification harness. Loads the full
// unit_index.json (in-repo per D-133), groups it (D-114 path order), and renders
// the reader ToC.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TextbookToc } from "@/components/textbook/TextbookToc";
import { buildNav, loadReaderIndex } from "@/lib/textbook/reader";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Textbook" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function TextbookIndexPage({
  params,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);

  const index = await loadReaderIndex();
  const nav = buildNav(index, locale);

  return <TextbookToc nav={nav} stats={index.stats} locale={locale} />;
}
