// Stage 7 Phase 1 Task 12 (DESIGN §6.3) — /[locale]/practice/mistakes: the mistakes book.
//
// The mistakes come from the learning record, which lives in the browser, so the server sends the
// dictionary-free today payload (loadSetupIndex: topics, question ids, exam labels — what the row
// labels and the 「做全部错题」 URL need; a glossary failure cannot break it) and MistakesList computes
// the rest. LearningRecordProvider is mounted here (never in the locale layout) and the owner flag
// reads a cookie, so the route is force-dynamic.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MistakesList } from "@/components/practice/MistakesList";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { loadSetupIndex } from "@/lib/practice/practiceReader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Mistakes" });
  return { title: t("title") };
}

export default async function MistakesPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [index, owner] = await Promise.all([
    loadSetupIndex(locale),
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
  ]);
  return (
    <LearningRecordProvider isOwner={owner}>
      <MistakesList index={index} />
    </LearningRecordProvider>
  );
}
