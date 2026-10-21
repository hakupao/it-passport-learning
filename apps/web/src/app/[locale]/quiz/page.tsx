// Stage 6 / Quiz 接過去問 Phase 0 (Session 86, D-134/D-135) — /[locale]/quiz.
//
// Rebuilt off the dead _fixtures/v1.0.3 book corpus (removed S63 → 500) onto the
// in-repo derived past-exam corpus (data/ip/quiz/, D-134). One route, two views:
//   - no params        → QuizBrowser (分野別 + 年度別 landing)
//   - ?mode=…&id=…      → QuizSet (that topic/exam's questions, JP-first, reveal)
// Self-contained data layer (lib/quiz/quizReader), no ThemedPage shell (lean v1
// clean surface, matching the Session-85 textbook reader; 3-theme skinning is
// deferred per D-135).

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { QuizBrowser } from "@/components/quiz/QuizBrowser";
import { QuizSet } from "@/components/quiz/QuizSet";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import {
  buildExamNav,
  buildTopicNav,
  loadQuestionSet,
  loadQuizIndex,
} from "@/lib/quiz/quizReader";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string | string[]; id?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Quiz" });
  return { title: t("title"), description: t("subtitle") };
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function QuizPage({
  params,
  searchParams,
}: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const set = await loadQuestionSet(first(sp.mode), first(sp.id), locale);
  if (set) {
    // D-149: only the owner (D-148 cookie) sees the per-question report button.
    // Only the boolean crosses to the client — never the key or its hash.
    const owner = await isOwner((await cookies()).get(OWNER_COOKIE)?.value);
    // D-179: only this set's terms cross to the client, as summary cards. If the
    // dictionary fails to load, log it and render the terms as plain text.
    const dict = await loadDictionary().catch((err: unknown) => {
      console.error("[quiz] glossary dictionary load failed; term chips fall back to plain text", err);
      return null;
    });
    const termCards = buildTermCards(dict, set.questions, locale);
    return (
      <QuizSet
        locale={locale}
        isOwner={owner}
        label={set.label}
        sublabel={set.sublabel}
        questions={set.questions}
        termCards={termCards}
      />
    );
  }

  const index = await loadQuizIndex();
  return (
    <QuizBrowser
      locale={locale}
      stats={index.stats}
      topicNav={buildTopicNav(index, locale)}
      exams={buildExamNav(index)}
    />
  );
}
