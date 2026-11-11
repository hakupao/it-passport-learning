// Stage 7 Phase 1 Task 12 (DESIGN §6.3) — /[locale]/practice/mistakes: the mistakes book.
//
// The mistakes come from the learning record, which lives in the browser, so the server sends the
// dictionary-free today payload (loadSetupIndex: topics, question ids, exam labels — what the row
// labels and the 「做全部错题」 URL need; a glossary failure cannot break it) and MistakesList computes
// the rest. LearningRecordProvider is mounted here (never in the locale layout); the owner flag is read
// in the browser (useOwner, H1-1), not here. Prerendered per locale (D-217 H1-4).

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MistakesList } from "@/components/practice/MistakesList";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { loadSetupIndex } from "@/lib/practice/practiceReader";
import { pageAlternates } from "@/lib/seo/canonical";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Mistakes" });
  return { title: t("title"), robots: { index: false }, alternates: pageAlternates(locale, "/practice/mistakes") };
}

export default async function MistakesPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const index = await loadSetupIndex(locale);
  return (
    <LearningRecordProvider>
      <MistakesList index={index} />
    </LearningRecordProvider>
  );
}
