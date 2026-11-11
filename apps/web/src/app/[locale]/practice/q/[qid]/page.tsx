// Stage 7 Phase 1 Task 10 (D-189 §4) — /[locale]/practice/q/<qid>: one question as a reference view
// (SingleQuestion: the face on your latest answer, the explanation, your answer history). Where the
// summary's wrong list, an AI 先生 reply's `#<question_id>` outside the group and old
// `#<question_id>` links land. An id not shaped `<exam_id>-q<NNN>` or not in the corpus → 404.
//
// Only this question (explanation merged) and its terms as cards cross to the client, the question
// through the static data's allow-list projection (clientQuestion: no internal corpus field, H1-3
// MEDIUM-1). The owner flag
// that gates the record sync and the report button is read in the browser (useOwner, H1-1);
// LearningRecordProvider is mounted here. force-dynamic stays until H1-4.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { SingleQuestion } from "@/components/practice/SingleQuestion";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { routing } from "@/i18n/routing";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { topicStars } from "@/lib/practice/practiceIndex";
import { loadQuestionsByIds } from "@/lib/practice/practiceReader";
import { QUESTION_ID } from "@/lib/quiz/questionId";
import { loadQuizIndex } from "@/lib/quiz/quizReader";
import { clientQuestion } from "@/lib/staticData/shards";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; qid: string }> };

async function load(qid: string) {
  if (!QUESTION_ID.test(qid)) return null;
  return (await loadQuestionsByIds([qid]))[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { qid } = await params;
  const q = await load(qid);
  return q ? { title: q.source_label } : {};
}

export default async function QuestionRoute({ params }: Props): Promise<React.ReactElement> {
  const { locale, qid } = await params;
  setRequestLocale(locale);
  const q = await load(qid);
  if (!q || !hasLocale(routing.locales, locale)) notFound();

  const [index, dict] = await Promise.all([
    loadQuizIndex(),
    loadDictionary().catch((err: unknown) => {
      console.error("[practice/q] glossary dictionary load failed; term chips fall back to plain text", err);
      return null;
    }),
  ]);
  const topic = index.topics.find((t) => t.topic_id === q.topic_id);

  return (
    <LearningRecordProvider>
      <SingleQuestion
        q={clientQuestion(q, locale)}
        locale={locale}
        termCards={buildTermCards(dict, [q], locale)}
        stars={topicStars(index)[q.topic_id] ?? 1}
        topic={{
          id: q.topic_id,
          category: q.category,
          path: topic ? `${topic.medium_jp} › ${topic.name_jp}` : q.topic_id,
        }}
      />
    </LearningRecordProvider>
  );
}
