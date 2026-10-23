// Stage 7 Phase 1 Task 10 (D-189 §4 / D-190 §0-17) — /[locale]/practice/browse/<topicId>: one topic
// (TopicPage) with the AI 先生 topic review (the existing ReviewLauncher: `?review=1` / `&thread=`
// arrive here — the today page's 「AI 分析」 and the legacy /quiz review links). Unknown topic → 404.
//
// The topic's questions cross to the client with explanations merged (the review anchor needs them,
// as on the old quiz set page) plus only this topic's terms as cards and the exam labels it uses.
// The owner flag (cookie) gates the record sync; LearningRecordProvider is mounted here (never in the
// locale layout), so force-dynamic.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { TopicPage } from "@/components/practice/TopicPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { topicStars } from "@/lib/practice/practiceIndex";
import { loadQuestionsByIds } from "@/lib/practice/practiceReader";
import type { SearchParams } from "@/lib/practice/practiceSession";
import { loadBaseQuestions, loadQuizIndex } from "@/lib/quiz/quizReader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; topicId: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  const t = (await loadQuizIndex()).topics.find((x) => x.topic_id === topicId);
  return t ? { title: t.name_jp } : {};
}

export default async function TopicRoute({ params }: Props): Promise<React.ReactElement> {
  const { locale, topicId } = await params;
  setRequestLocale(locale);
  const index = await loadQuizIndex();
  const topic = index.topics.find((x) => x.topic_id === topicId);
  if (!topic) notFound();

  const dictPromise = loadDictionary().catch((err: unknown) => {
    console.error("[practice/browse] glossary dictionary load failed; term chips fall back to plain text", err);
    return null;
  });
  const base = await loadBaseQuestions();
  const [questions, dict, owner] = await Promise.all([
    loadQuestionsByIds(base.filter((q) => q.topic_id === topicId).map((q) => q.id)),
    dictPromise,
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
  ]);
  const used = new Set(questions.map((q) => q.exam_id));
  const exams = Object.fromEntries(index.exams.filter((e) => used.has(e.exam_id)).map((e) => [e.exam_id, e.label_jp]));

  return (
    <LearningRecordProvider isOwner={owner}>
      <TopicPage
        locale={locale}
        isOwner={owner}
        topic={{
          id: topic.topic_id,
          category: topic.category,
          name_jp: topic.name_jp,
          path: `${topic.major_jp} › ${topic.medium_jp}`,
          stars: topicStars(index)[topic.topic_id]!,
        }}
        questions={questions}
        termCards={buildTermCards(dict, questions, locale)}
        exams={exams}
      />
    </LearningRecordProvider>
  );
}
