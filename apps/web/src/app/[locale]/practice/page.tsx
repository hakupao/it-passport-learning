// Stage 7 Phase 1 Task 9 (D-187 / D-189 §6.2 / D-190 §0-12) — /[locale]/practice.
//
// D-217 H1-3: the page depends on the locale only. Everything the URL query decides — the scope
// (?ids / ?topic / ?exam + n / order / seed), from=today + kind, from=unit + unit / run / at, prefill —
// is worked out in the browser by PracticeRoute (lib/practice/practiceView: the same pure functions,
// in the same order, as this page used on the server) from the static data (/data/…): the setup panel
// or the session. The former server redirects (order=rand without a seed, a unit set without a run)
// are a client router.replace to the same URL. The session's questions come without explanations;
// each answered question's explanation is fetched then (its 10-question chunk file, EXPL_CHUNK).
// LearningRecordProvider is mounted here (never in the locale layout), so the record loads while the
// static data does; the owner flag is read in the browser (useOwner, H1-1).
// Prerendered per locale (D-217 H1-4).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PracticePending, PracticeRoute } from "@/components/practice/PracticeRoute";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { routing } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo/canonical";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Practice" });
  return { title: t("title"), alternates: pageAlternates(locale, "/practice") };
}

export default async function PracticePage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <LearningRecordProvider>
      <Suspense fallback={<PracticePending />}>
        <PracticeRoute locale={locale} />
      </Suspense>
    </LearningRecordProvider>
  );
}
