// Stage 7 Phase 1 Task 11 (D-189 §6.1 / D-190 §0-20) — /[locale]: the today page (until now this
// redirected to the old quiz list).
//
// The tasks come from the learning record, which lives in the browser, so the server sends the today
// payload (loadTodayIndex: topics, ★, question ids, chumon groups, 3 terms per topic, exam labels) and
// TodayPage computes the rest. LearningRecordProvider is mounted here (never in the locale layout) and
// the owner flag reads a cookie, so the route is force-dynamic. A failed payload load (in practice the
// glossary dictionary, the only part the fallback skips) falls back to the dictionary-free payload
// (loadSetupIndex: topicTerms empty → no 「今天的 3 个用语」 box), as the practice setup panel does, so
// the page never 500s on it; if the fallback fails too, the error propagates.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TodayPage } from "@/components/today/TodayPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { loadSetupIndex, loadTodayIndex } from "@/lib/practice/practiceReader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "App" });
  return { title: t("siteName") };
}

export default async function HomePage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [index, owner] = await Promise.all([
    loadTodayIndex(locale).catch((err: unknown) => {
      console.error("[today] today payload failed to load; falling back to the payload without terms", err);
      return loadSetupIndex(locale);
    }),
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
  ]);
  return (
    <LearningRecordProvider isOwner={owner}>
      <TodayPage index={index} locale={locale} />
    </LearningRecordProvider>
  );
}
