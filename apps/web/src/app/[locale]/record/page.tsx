// Stage 7 Phase 2 Task 5 (DESIGN §6.6 / D-193 §0-9) — /[locale]/record: the learning record.
// Every number comes from the learning record in the browser, so the server sends the today payload
// without the dictionary (loadSetupIndex: topics, ★, question ids — topicTerms are not used here)
// and RecordPage computes the rest. The topic-table sort lives in the URL (?sort=rate; anything else
// = 頻出度). LearningRecordProvider is mounted here and the owner flag reads a cookie → force-dynamic.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RecordPage } from "@/components/record/RecordPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { loadSetupIndex } from "@/lib/practice/practiceReader";
import type { RecordSort } from "@/lib/record/recordModel";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Record" });
  return { title: t("title") };
}

export default async function RecordRoute({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const sort: RecordSort = (Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) === "rate" ? "rate" : "stars";
  const [index, owner] = await Promise.all([
    loadSetupIndex(locale),
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
  ]);
  return (
    <LearningRecordProvider isOwner={owner}>
      <RecordPage index={index} locale={locale} sort={sort} />
    </LearningRecordProvider>
  );
}
