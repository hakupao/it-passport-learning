// Stage 7 Phase 1 Task 10 (D-189 §4 / D-190 §0-17) — /[locale]/practice/browse/<topicId>: one topic
// (TopicPage) with the AI 先生 topic review (the existing ReviewLauncher: `?review=1` / `&thread=`
// arrive here — the today page's 「AI 分析」 and the legacy /quiz review links — and are read in the
// browser; the page depends on the path only, D-217 H1-3). Unknown topic → 404.
//
// Only the topic's light rows cross to the client (D-193 §0-1: id / exam / source / key / terms; the
// review fetches its wrong questions' full text on open, from the static data) plus only this
// topic's terms as cards and the exam labels it uses.
// The owner flag that gates the record sync is read in the browser (useOwner, H1-1);
// LearningRecordProvider is mounted here (never in the locale layout). force-dynamic stays until H1-4.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { TopicPage } from "@/components/practice/TopicPage";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { topicStars } from "@/lib/practice/practiceIndex";
import { toTopicRow } from "@/lib/practice/topicRows";
import { loadBaseQuestions, loadQuizIndex } from "@/lib/quiz/quizReader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; topicId: string }>;
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
  const questions = (await loadBaseQuestions()).filter((q) => q.topic_id === topicId);
  const dict = await dictPromise;
  const used = new Set(questions.map((q) => q.exam_id));
  const exams = Object.fromEntries(index.exams.filter((e) => used.has(e.exam_id)).map((e) => [e.exam_id, e.label_jp]));

  return (
    <LearningRecordProvider>
      <TopicPage
        locale={locale}
        topic={{
          id: topic.topic_id,
          category: topic.category,
          name_jp: topic.name_jp,
          path: `${topic.major_jp} › ${topic.medium_jp}`,
          stars: topicStars(index)[topic.topic_id]!,
        }}
        rows={questions.map(toTopicRow)}
        termCards={buildTermCards(dict, questions, locale)}
        exams={exams}
      />
    </LearningRecordProvider>
  );
}
