// Stage 7 Phase 2 Task 4 (DESIGN §6.7 / D-193 §0-2 / §0-4) — /[locale]/mock: the mock exam's setup.
// Random 100 (drawn in the browser from the record: drawRandomMock) or one past exam; an unfinished
// mock in this browser's storage is offered first (continue / discard). The setup payload is the
// today payload without the dictionary (loadSetupIndex: topics with their area, question ids,
// chumon groups, exam labels). LearningRecordProvider here (the random draw reads the record), so
// force-dynamic.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MockSetup } from "@/components/mock/MockSetup";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { examsNewestFirst } from "@/lib/practice/practiceLabels";
import { loadSetupIndex } from "@/lib/practice/practiceReader";
import { loadQuizIndex } from "@/lib/quiz/quizReader";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Mock" });
  return { title: t("title") };
}

export default async function MockPage({ params }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [index, quizIndex, owner] = await Promise.all([
    loadSetupIndex(locale),
    loadQuizIndex(),
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
  ]);
  return (
    <LearningRecordProvider isOwner={owner}>
      <MockSetup
        index={index}
        exams={examsNewestFirst(quizIndex.exams).map((e) => ({ id: e.exam_id, label: e.label_jp, n: e.question_count }))}
      />
    </LearningRecordProvider>
  );
}
