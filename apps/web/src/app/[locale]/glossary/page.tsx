// Phase 2 Step 12 — /[locale]/glossary route (moved from /glossary).
//
// Server component loading the 908 GlossarySummary[] from the corpus glossary
// + hydrating the client <GlossaryList />. Metadata localized.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GlossaryList } from "@/components/GlossaryList";
import { getDataSource, warmUp } from "@/lib/data";
import {
  listGlossarySummaries,
  type GlossarySummary,
} from "@/lib/glossary/glossaryScope";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GlossaryList" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

async function loadGlossarySummaries(): Promise<GlossarySummary[]> {
  await warmUp();
  const ds = getDataSource();
  const glossary = await ds.loadGlossary();
  return listGlossarySummaries(glossary);
}

export default async function GlossaryPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const summaries = await loadGlossarySummaries();
  return <GlossaryList summaries={summaries} />;
}
