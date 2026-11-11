// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-193 §0-2 / §0-3) — /[locale]/mock/run: the timed mock exam,
// and its result after the finish (same URL).
//
// D-217 H1-3: the page depends on the locale only; MockRoute reads the query in the browser
// (lib/mock/mockView, the same checks as this page made on the server) over the static data:
//   - ?exam=<exam_id> → that exam's questions (examMockIds); an unknown exam → the not-found page.
//   - ?ids=<id,…> → the random mock drawn on the setup page (parseMockScope: unknown / repeated
//     ids dropped, at most 100); not exactly 100 left → router.replace back to /mock.
//   - The exam shards carry no explanation (§0-3: the result's rows link to /practice/q/<id>, where
//     the explanation is). Every id must resolve to a question (R3) — else the not-found page.
//   - LearningRecordProvider here (the finish writes the answers to the record); the owner flag is
//     read in the browser (useOwner, H1-1). force-dynamic stays until H1-4.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MockPending, MockRoute } from "@/components/mock/MockRoute";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Mock" });
  return { title: t("title") };
}

export default async function MockRunPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <LearningRecordProvider>
      <Suspense fallback={<MockPending />}>
        <MockRoute locale={locale} />
      </Suspense>
    </LearningRecordProvider>
  );
}
