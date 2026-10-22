// D-181 Task A5 / §0-10 — /[locale]/sensei : the AI 先生 page (key settings, the
// threads saved in this browser, the free-question input shown as 「近日公開」
// until Phase C). Everything on it lives in the browser (SenseiHome); the server
// renders the shell only — no fs read, no cookies — so the page stays static.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SenseiHome } from "@/components/sensei/SenseiHome";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sensei" });
  return { title: t("panelTitle") };
}

export default async function SenseiPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SenseiHome />;
}
