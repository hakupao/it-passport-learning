// D-181 Task A5 / §0-10 — /[locale]/sensei : the AI 先生 page (key settings, the
// threads saved in this browser, the free question). Everything interactive lives
// in the browser (SenseiHome). Phase C (§0-9): the server hands SenseiHome the light
// dictionary index (id + JP / zh / en headwords of every entry) for free-question
// term matching. It is built from the committed corpus at prerender — no cookies, no
// request data — so the page stays static (prerendered per locale by the [locale]
// layout's generateStaticParams); the term cards come later from /api/sensei/terms.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SenseiHome } from "@/components/sensei/SenseiHome";
import { buildTermIndex } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sensei" });
  return { title: t("panelTitle") };
}

export default async function SenseiPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SenseiHome termIndex={buildTermIndex(await loadDictionary())} />;
}
