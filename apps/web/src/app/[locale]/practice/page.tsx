// Stage 7 Phase 1 Task 9 (D-187 / D-189 §6.2 / D-190 §0-12) — /[locale]/practice.
//
//   - A scope in the URL (§0-12: ?ids=… | ?topic=…/?exam=… + n / order / seed, optional
//     from=today) → the practice group: one question per screen, then the summary.
//   - No (valid) scope, a scope that resolves to no question, or prefill=1 → the setup panel
//     (PracticeSetup, Task 10) with the URL's valid topic / exam pre-selected (prefillOf: a legacy
//     /quiz?mode=topic&id=X link arrives as ?topic=X&prefill=1). It gets the today payload without the
//     dictionary (loadSetupIndex: topics, ★, question ids, chumon groups — a glossary failure cannot
//     500 the panel) and the exams newest first (examsNewestFirst). The panel is keyed by the
//     pre-selection, so a soft navigation to another pre-selection starts a fresh form.
// A from=today link's `kind=` (Task 11) names the today task; the session prefers it over inferring.
// order=rand without a seed is redirected to the same URL with a fresh seed, so a reload resolves
// the same list (the sessionStorage key is the list's hash, §0-13).
//
// Server data as on the quiz page: the dictionary loads alongside the questions and a failure
// falls back to plain-text terms; the owner flag (cookie) gates the record sync and the report
// button; LearningRecordProvider is mounted here (never in the locale layout), so force-dynamic.
// Only this group's questions, their topics' labels and fold points cross to the client; the
// today payload (§0-20) only for from=today (the summary's 「继续下一项」).
// Stage 7 Phase 3 (D-196 §0-2): `from=unit&unit=<id>` (a textbook unit's questions) — the id must
// match UNIT_ID_RE and be in the reader index, else the group has no `from`; the unit's title (active
// locale) and terms go to the session (the summary's 「単元に戻る」, the explanation's link back);
// a unit failing to load leaves the set without `from` (resolveSessionFrom). A from=unit URL without
// `run` is redirected to one with run=<now>, so every entry is a new round.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PracticeSession } from "@/components/practice/PracticeSession";
import type { SessionTopic } from "@/components/practice/SessionSummary";
import { PracticeSetup } from "@/components/practice/PracticeSetup";
import { LearningRecordProvider } from "@/hooks/useLearningRecord";
import { redirect } from "@/i18n/navigation";
import { buildTermCards } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { OWNER_COOKIE, isOwner } from "@/lib/owner";
import { groupMap, resolveScope, topicStars } from "@/lib/practice/practiceIndex";
import { examsNewestFirst } from "@/lib/practice/practiceLabels";
import { loadChumonGroups, loadQuestionsByIds, loadSetupIndex, loadTodayIndex } from "@/lib/practice/practiceReader";
import {
  foldPlan,
  parseKind,
  parseRun,
  parseScope,
  sessionKey,
  type SearchParams,
} from "@/lib/practice/practiceSession";
import { prefillOf, settingsFromPrefill } from "@/lib/practice/practiceSetup";
import { resolveSessionFrom } from "@/lib/practice/sessionFrom";
import { loadBaseQuestions, loadQuizIndex, type QuizIndex } from "@/lib/quiz/quizReader";

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

/** The URL's search params as a flat query (first value of each). */
function queryOf(sp: SearchParams): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s !== undefined) query[k] = s;
  }
  return query;
}

const ownerFlag = (): Promise<boolean> => cookies().then((c) => isOwner(c.get(OWNER_COOKIE)?.value));

async function setupPanel(
  locale: string,
  sp: SearchParams,
  quizIndex: QuizIndex,
  validTopics: ReadonlySet<string>,
  validExams: ReadonlySet<string>,
): Promise<React.ReactElement> {
  const [index, owner] = await Promise.all([loadSetupIndex(locale), ownerFlag()]);
  const prefill = prefillOf(sp, validTopics, validExams);
  return (
    <LearningRecordProvider isOwner={owner}>
      <PracticeSetup
        key={`${prefill.topics.join(",")}|${prefill.exam ?? ""}`}
        index={index}
        exams={examsNewestFirst(quizIndex.exams).map((e) => ({ id: e.exam_id, label: e.label_jp }))}
        initial={settingsFromPrefill(prefill)}
        prefilled={prefill.topics.length > 0 || prefill.exam !== null}
      />
    </LearningRecordProvider>
  );
}

export default async function PracticePage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const [index, base] = await Promise.all([loadQuizIndex(), loadBaseQuestions()]);
  const validTopics = new Set(index.topics.map((t) => t.topic_id));
  const validExams = new Set(index.exams.map((e) => e.exam_id));
  const scope = parseScope(sp, new Set(base.map((q) => q.id)), validTopics, validExams);
  if (!scope) return setupPanel(locale, sp, index, validTopics, validExams);

  if (scope.kind === "filter" && scope.order === "rand" && sp.seed === undefined) {
    const query = { ...queryOf(sp), seed: String(Math.floor(Math.random() * 2 ** 32)) };
    redirect({ href: { pathname: "/practice", query }, locale });
  }

  const from = await resolveSessionFrom(sp, locale);
  // a unit's set always runs as a new round (§0-2): an entry without a run nonce (a click before
  // hydration, a middle click, a copied link) gets one here
  if (from?.kind === "unit" && parseRun(sp) === null) {
    redirect({ href: { pathname: "/practice", query: { ...queryOf(sp), run: String(Date.now()) } }, locale });
  }

  const dictPromise = loadDictionary().catch((err: unknown) => {
    console.error("[practice] glossary dictionary load failed; term chips fall back to plain text", err);
    return null;
  });
  const groups = await loadChumonGroups();
  const questions = await loadQuestionsByIds(resolveScope(scope, base, groupMap(groups)));
  if (questions.length === 0) return setupPanel(locale, sp, index, validTopics, validExams);
  const ids = questions.map((q) => q.id);

  const fromToday = from?.kind === "today";
  const run = parseRun(sp);
  const [dict, owner, today] = await Promise.all([
    dictPromise,
    ownerFlag(),
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
        // one instance per group (ids + run nonce): the summary's links carry a new run, so the
        // same ids again (all wrong) mount a new group
        key={sessionKey(ids, run)}
        questions={questions}
        locale={locale}
        isOwner={owner}
        termCards={buildTermCards(dict, questions, locale)}
        topics={topics}
        folds={foldPlan(ids, groups)}
        from={from}
        today={today}
        run={run}
        kindParam={fromToday ? parseKind(sp) : null}
      />
    </LearningRecordProvider>
  );
}
