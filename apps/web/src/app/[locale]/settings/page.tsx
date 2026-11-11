// Stage 7 Phase 1 Task 12 (DESIGN §3.4 / §6.8) — /[locale]/settings: exam date, daily caps,
// translation default (the v2 record's settings), interface language and the /sensei entry.
//
// The settings live in the learning record (browser; synced for the owner), so the page needs no
// corpus payload. LearningRecordProvider is mounted here (never in the locale layout); the owner flag
// is read in the browser (useOwner, H1-1), not here. force-dynamic stays until H1-4.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Settings" });
  return { title: t("title") };
}

export default async function SettingsPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LearningRecordProvider>
      <SettingsForm />
    </LearningRecordProvider>
  );
}
