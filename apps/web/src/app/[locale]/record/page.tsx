// Stage 7 Phase 2 Task 5 (DESIGN §6.6 / D-193 §0-9) — /[locale]/record: the learning record.
// Every number comes from the learning record in the browser, so the server sends the today payload
// without the dictionary (loadSetupIndex: topics, ★, question ids — topicTerms are not used here)
// and RecordPage computes the rest. The topic-table sort lives in the URL (?sort=rate; anything else
// = 頻出度) and is read in the browser (RecordFromUrl, D-217 H1-3: the page depends on the locale
// only; the Suspense fallback is the 頻出度 render, which before the record loads shows no number).
// LearningRecordProvider is mounted here; the owner flag is read in the browser (useOwner, H1-1).
// Prerendered per locale (D-217 H1-4).

import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RecordFromUrl, RecordPage } from "@/components/record/RecordPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { loadSetupIndex } from "@/lib/practice/practiceReader";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Record" });
  return { title: t("title") };
}

export default async function RecordRoute({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const index = await loadSetupIndex(locale);
  return (
    <LearningRecordProvider>
      <Suspense fallback={<RecordPage index={index} locale={locale} sort="stars" />}>
        <RecordFromUrl index={index} locale={locale} />
      </Suspense>
    </LearningRecordProvider>
  );
}
