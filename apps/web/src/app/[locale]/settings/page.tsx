// Stage 7 Phase 1 Task 12 (DESIGN §3.4 / §6.8) — /[locale]/settings: exam date, daily caps,
// translation default (the v2 record's settings), interface language and the /sensei entry.
//
// The settings live in the learning record (browser; synced for the owner), so the page needs no
// corpus payload. LearningRecordProvider is mounted here (never in the locale layout) and the owner
// flag reads a cookie, so the route is force-dynamic.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";

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
  const owner = await cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value));
  return (
    <LearningRecordProvider isOwner={owner}>
      <SettingsForm />
    </LearningRecordProvider>
  );
}
