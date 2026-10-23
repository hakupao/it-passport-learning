// Stage 7 Phase 1 Task 9 (D-187 / D-189 §6.2 / D-190 §0-12) — /[locale]/practice.
//
//   - A scope in the URL (§0-12: ?ids=… | ?topic=…/?exam=… + n / order / seed, optional
//     from=today) → the practice group: one question per screen, then the summary.
//   - No (valid) scope, or prefill=1 → the setup panel. Task 10 builds it; this task renders a
//     placeholder.
// order=rand without a seed is redirected to the same URL with a fresh seed, so a reload resolves
// the same list (the sessionStorage key is the list's hash, §0-13).
//
// Server data as on the quiz page: the dictionary loads alongside the questions and a failure
// falls back to plain-text terms; the owner flag (cookie) gates the record sync and the report
// button; LearningRecordProvider is mounted here (never in the locale layout), so force-dynamic.
// Only this group's questions, their topics' labels and fold points cross to the client; the
// today payload (§0-20) only for from=today (the summary's 「继续下一项」).

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PracticeSession } from "@/components/practice/PracticeSession";
import type { SessionTopic } from "@/components/practice/SessionSummary";
import styles from "@/components/practice/session.module.css";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { redirect } from "@/i18n/navigation";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { groupMap, resolveScope, topicStars } from "@/lib/practice/practiceIndex";
import { loadChumonGroups, loadQuestionsByIds, loadTodayIndex } from "@/lib/practice/practiceReader";
import { foldPlan, isFromToday, parseScope, sessionKey, type SearchParams } from "@/lib/practice/practiceSession";
import { loadBaseQuestions, loadQuizIndex } from "@/lib/quiz/quizReader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Practice" });
  return { title: t("title") };
}

async function SetupPlaceholder({ locale }: { locale: string }): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Practice" });
  return (
    <main className={`${styles.session} ${styles.stub}`} data-setup="">
      <h1 className={styles.summaryTitle}>{t("setupTitle")}</h1>
      <p>{t("setupStub")}</p>
    </main>
  );
}

export default async function PracticePage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const [index, base] = await Promise.all([loadQuizIndex(), loadBaseQuestions()]);
  const scope = parseScope(
    sp,
    new Set(base.map((q) => q.id)),
    new Set(index.topics.map((t) => t.topic_id)),
    new Set(index.exams.map((e) => e.exam_id)),
  );
  if (!scope) return <SetupPlaceholder locale={locale} />;

  if (scope.kind === "filter" && scope.order === "rand" && sp.seed === undefined) {
    const query: Record<string, string> = {};
    for (const [k, v] of Object.entries(sp)) {
      const s = Array.isArray(v) ? v[0] : v;
      if (s !== undefined) query[k] = s;
    }
    query.seed = String(Math.floor(Math.random() * 2 ** 32));
    redirect({ href: { pathname: "/practice", query }, locale });
  }

  const dictPromise = loadDictionary().catch((err: unknown) => {
    console.error("[practice] glossary dictionary load failed; term chips fall back to plain text", err);
    return null;
  });
  const groups = await loadChumonGroups();
  const questions = await loadQuestionsByIds(resolveScope(scope, base, groupMap(groups)));
  if (questions.length === 0) return <SetupPlaceholder locale={locale} />;
  const ids = questions.map((q) => q.id);

  const fromToday = isFromToday(sp);
  const [dict, owner, today] = await Promise.all([
    dictPromise,
    cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value)),
    fromToday
      ? loadTodayIndex(locale).catch((err: unknown) => {
          console.error("[practice] today payload failed; the summary offers no 「继续下一项」", err);
          return null;
        })
      : Promise.resolve(null),
  ]);

  const stars = topicStars(index);
  const inGroup = new Set(questions.map((q) => q.topic_id));
  const topics: Record<string, SessionTopic> = {};
  for (const t of index.topics) {
    if (!inGroup.has(t.topic_id)) continue;
    topics[t.topic_id] = { category: t.category, path: `${t.medium_jp} › ${t.name_jp}`, stars: stars[t.topic_id]! };
  }

  return (
    <LearningRecordProvider isOwner={owner}>
      <PracticeSession
        // a fresh instance per request: the summary's 「只做错题再来一遍」 can lead to the same ids
        // (all wrong), which must start over (the finished group already cleared its storage)
        key={`${sessionKey(ids)}:${Date.now()}`}
        questions={questions}
        locale={locale}
        isOwner={owner}
        termCards={buildTermCards(dict, questions, locale)}
        topics={topics}
        folds={foldPlan(ids, groups)}
        fromToday={fromToday}
        today={today}
      />
    </LearningRecordProvider>
  );
}
