// Stage 7 Phase 1 Task 10 (D-189 §4) — /[locale]/practice/q/<qid>: one question as a reference view
// (SingleQuestion: the face on your latest answer, the explanation, your answer history). Where the
// summary's wrong list, an AI 先生 reply's `#<question_id>` outside the group and old
// `#<question_id>` links land. An id not shaped `<exam_id>-q<NNN>` or not in the corpus → 404.
//
// Only this question (explanation merged) and its terms as cards cross to the client. The owner flag
// gates the record sync and the report button; LearningRecordProvider is mounted here, so
// force-dynamic.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { SingleQuestion } from "@/components/practice/SingleQuestion";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { topicStars } from "@/lib/practice/practiceIndex";
import { loadQuestionsByIds } from "@/lib/practice/practiceReader";
import { loadQuizIndex } from "@/lib/quiz/quizReader";

export const dynamic = "force-dynamic";

const QUESTION_ID = /^[0-9a-z]{4,16}-q\d{3}$/;

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
  if (!q) notFound();

  const [index, dict, owner] = await Promise.all([
    loadQuizIndex(),
    loadDictionary().catch((err: unknown) => {
      console.error("[practice/q] glossary dictionary load failed; term chips fall back to plain text", err);
      return null;
    }),
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
  ]);
  const topic = index.topics.find((t) => t.topic_id === q.topic_id);

  return (
    <LearningRecordProvider isOwner={owner}>
      <SingleQuestion
        q={q}
        locale={locale}
        isOwner={owner}
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
