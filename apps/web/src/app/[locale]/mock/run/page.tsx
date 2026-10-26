// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-193 §0-2 / §0-3) — /[locale]/mock/run: the timed mock exam,
// and its result after the finish (same URL).
//
//   - ?exam=<exam_id> → that exam's questions (examMockIds); an unknown exam → 404.
//   - ?ids=<id,…> → the random mock drawn on the setup page (parseMockScope: unknown / repeated
//     ids dropped, at most 100); not exactly 100 left → back to /mock.
//   - Only questions.json + the translation sidecars cross to the client — no explanation (§0-3: the
//     result's rows link to /practice/q/<id>, where the explanation is). Every id must resolve to a
//     question (R3: scoring over fewer than the mock's questions would be silent) — else 404.
//   - LearningRecordProvider here (the finish writes the answers to the record), so force-dynamic.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MockRun } from "@/components/mock/MockRun";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { redirect } from "@/i18n/navigation";
import { examMockIds } from "@/lib/mock/mockModel";
import { parseMockScope } from "@/lib/mock/mockScope";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { topicStars, type Stars } from "@/lib/practice/practiceIndex";
import { loadChumonGroups } from "@/lib/practice/practiceReader";
import { foldPlan, type SearchParams } from "@/lib/practice/practiceSession";
import { loadBaseQuestions, loadQuizIndex, loadTranslations, mergeTranslation, type QuizQuestion } from "@/lib/quiz/quizReader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Mock" });
  return { title: t("title") };
}

export default async function MockRunPage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const [index, base] = await Promise.all([loadQuizIndex(), loadBaseQuestions()]);
  const validExams = new Set(index.exams.map((e) => e.exam_id));
  const scope = parseMockScope(sp, new Set(base.map((q) => q.id)), validExams);
  if (!scope) {
    if (sp.exam !== undefined) notFound();
    return redirect({ href: "/mock", locale });
  }

  const ids = scope.kind === "exam" ? examMockIds(scope.examId, base) : scope.ids;
  const byId = new Map(base.map((q) => [q.id, q]));
  const found = ids.flatMap((id) => {
    const q = byId.get(id);
    return q ? [q] : [];
  });
  if (ids.length === 0 || found.length !== ids.length) notFound();

  const [tr, groups, owner] = await Promise.all([
    loadTranslations(),
    loadChumonGroups(),
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
  ]);
  // translation only — base questions carry no explanation, and none is merged (§0-3)
  const questions: QuizQuestion[] = found.map((q) => mergeTranslation(q, tr.get(q.id)));

  const allStars = topicStars(index);
  const stars: Record<string, Stars> = {};
  for (const q of questions) stars[q.topic_id] = allStars[q.topic_id] ?? 1;
  const examLabel =
    scope.kind === "exam" ? (index.exams.find((e) => e.exam_id === scope.examId)?.label_jp ?? scope.examId) : null;

  return (
    <LearningRecordProvider isOwner={owner}>
      <MockRun
        key={ids.join(",")}
        kind={scope.kind}
        examId={scope.kind === "exam" ? scope.examId : null}
        examLabel={examLabel}
        questions={questions}
        locale={locale}
        folds={foldPlan(ids, groups)}
        stars={stars}
      />
    </LearningRecordProvider>
  );
}
