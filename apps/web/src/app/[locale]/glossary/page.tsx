// Stage 6 (D-179 / D-180 §0-3) — /[locale]/glossary : static trilingual dictionary list.
//
// Builds the dictionary from the committed corpus (no LLM, D-179 §2), groups it by
// representative topic in buildNav order, and hands the groups to the client list
// (search filters in the browser). Self-contained surface, no ThemedPage.
// Statically prerendered per locale (the [locale] layout supplies generateStaticParams;
// the corpus is immutable), so the 1395 links are not re-rendered per request.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GlossaryList } from "@/components/glossary/GlossaryList";
import { buildListGroups } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { loadReaderIndex } from "@/lib/textbook/reader";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Glossary" });
  return { title: t("title") };
}

export default async function GlossaryPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);

  const [dict, index] = await Promise.all([loadDictionary(), loadReaderIndex()]);
  return <GlossaryList locale={locale} groups={buildListGroups(dict, index, locale)} />;
}
