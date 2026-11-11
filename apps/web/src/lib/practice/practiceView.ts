// D-217 H1-3 — what /[locale]/practice shows for a URL query, worked out in the browser from the
// static data (lib/staticData) with the same pure functions the server page used, in the same order:
//
//   1. parseScope over index.json → none (or prefill=1) → the setup panel (setupFromToday of
//      today.<locale>, exams newest first, prefillOf pre-selection).
//   2. order=rand without a seed → "replace": the same query plus seed=<uint32> (was a server redirect).
//   3. from (today | unit; a unit only for an ids scope) — sessionFromUnits over units.<locale>; a
//      unit set without `run` → "replace": the same query plus run=<now> (was a server redirect).
//   4. resolveScope (中問 groups of index.json kept whole) → the exam shards without explanations
//      (ExplanationPane's text is fetched per EXPL_CHUNK-question chunk once a question is answered,
//      PracticeSession.loadExplanation); none found → the setup panel.
//   5. the session props: term cards (cards.<locale>; a failure → plain-text terms, as a dictionary
//      failure did), topic labels / ★, fold points, today.<locale> for from=today (a failure → no
//      「继续下一项」), run and kind.
// A failure of index.json / an exam shard / today.<locale> for the panel rejects (the view shows the
// load error).

import { isValidTermId } from "../glossary/termId";
import type { TermCard } from "../glossary/dictionary";
import type { StaticData } from "../staticData/client";
import { setupFromToday, termCardsFor, type StaticLocale, type UnitsFile } from "../staticData/shards";
import type { QuizQuestion } from "../quiz/quizModel";
import { groupMap, resolveScope, topicStars, type TodayIndex } from "./practiceIndex";
import { examsNewestFirst } from "./practiceLabels";
import {
  foldPlan,
  parseFrom,
  parseKind,
  parseRun,
  parseScope,
  sessionKey,
  type SearchParams,
  type SessionFrom,
  type TodayKind,
} from "./practiceSession";
import { prefillOf, settingsFromPrefill, type SetupSettings } from "./practiceSetup";

export type PracticeData = Pick<StaticData, "fetchQuizIndex" | "fetchToday" | "fetchTermCards" | "fetchUnits" | "fetchQuestions">;

export interface SetupView {
  kind: "setup";
  /** the panel's React key: a soft navigation to another pre-selection starts a fresh form */
  key: string;
  index: TodayIndex;
  exams: { id: string; label: string }[];
  initial: SetupSettings;
  prefilled: boolean;
}

export interface SessionView {
  kind: "session";
  /** one instance per group (ids + run nonce) */
  key: string;
  questions: QuizQuestion[];
  termCards: Record<string, TermCard>;
  topics: Record<string, { category: string; path: string; stars: 1 | 2 | 3 }>;
  folds: Record<string, number>;
  from: SessionFrom | null;
  today: TodayIndex | null;
  run: string | null;
  kindParam: TodayKind | null;
}

export type PracticeView = SetupView | SessionView | { kind: "replace"; query: Record<string, string> };

/** The URL's search params as a flat query (first value of each). */
export function queryOf(sp: SearchParams): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s !== undefined) query[k] = s;
  }
  return query;
}

/** URLSearchParams → SearchParams (a repeated key keeps every value, like the server's searchParams). */
export function searchParamsOf(params: URLSearchParams): SearchParams {
  const sp: SearchParams = {};
  for (const [k, v] of params) {
    const prev = sp[k];
    sp[k] = prev === undefined ? v : Array.isArray(prev) ? [...prev, v] : [prev, v];
  }
  return sp;
}

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/**
 * resolveSessionFrom (lib/practice/sessionFrom, the server version) over units.<locale>: from=today →
 * today; from=unit&unit=<id> → the unit (title + terms, `at` only when one of its termIds) when the
 * file lists it; `units` null (the file failed to load) → no from.
 */
export function sessionFromUnits(sp: SearchParams, units: UnitsFile["units"] | null): SessionFrom | null {
  if (first(sp.from) !== "unit") return first(sp.from) === "today" ? { kind: "today" } : null;
  if (!units) return null;
  const from = parseFrom(sp, (id) => Object.prototype.hasOwnProperty.call(units, id));
  if (from?.kind !== "unit") return null;
  const unit = units[from.unitId]!;
  const terms = unit.terms.map((t) => ({ id: t.id, term: t.term }));
  const at = first(sp.at);
  return {
    kind: "unit",
    unitId: from.unitId,
    title: unit.title,
    terms,
    at: at !== undefined && isValidTermId(at) && terms.some((t) => t.id === at) ? at : null,
  };
}

export interface ViewEnv {
  now: () => number;
  random: () => number;
}

const realEnv: ViewEnv = { now: () => Date.now(), random: () => Math.random() };

export async function resolvePracticeView(
  sp: SearchParams,
  locale: StaticLocale,
  data: PracticeData,
  env: ViewEnv = realEnv,
): Promise<PracticeView> {
  const index = await data.fetchQuizIndex();
  const validTopics = new Set(index.topics.map((t) => t.topic_id));
  const validExams = new Set(index.exams.map((e) => e.exam_id));

  const setup = async (): Promise<SetupView> => {
    const today = setupFromToday(await data.fetchToday(locale));
    const prefill = prefillOf(sp, validTopics, validExams);
    return {
      kind: "setup",
      key: `${prefill.topics.join(",")}|${prefill.exam ?? ""}`,
      index: today,
      exams: examsNewestFirst(index.exams).map((e) => ({ id: e.exam_id, label: e.label_jp })),
      initial: settingsFromPrefill(prefill),
      prefilled: prefill.topics.length > 0 || prefill.exam !== null,
    };
  };

  const base = index.questions.map(([id, exam_id, topic_id]) => ({ id, exam_id, topic_id }));
  const scope = parseScope(sp, new Set(base.map((q) => q.id)), validTopics, validExams);
  if (!scope) return setup();

  if (scope.kind === "filter" && scope.order === "rand" && sp.seed === undefined) {
    return { kind: "replace", query: { ...queryOf(sp), seed: String(Math.floor(env.random() * 2 ** 32)) } };
  }

  // a unit's set is always an ids list (its confirm / term links): a filter scope with from=unit is
  // not a unit set, so the textbook file is not touched for it
  let from: SessionFrom | null = null;
  if (scope.kind === "ids" || sp.from !== "unit") {
    const units =
      first(sp.from) === "unit"
        ? await data.fetchUnits(locale).then(
            (f) => f.units,
            (err: unknown) => {
              console.error("[practice] from=unit: the units file could not be loaded; the set runs without it", err);
              return null;
            },
          )
        : null;
    from = sessionFromUnits(sp, units);
  }
  // a unit's set always runs as a new round (§0-2): an entry without a run nonce gets one
  if (from?.kind === "unit" && parseRun(sp) === null) {
    return { kind: "replace", query: { ...queryOf(sp), run: String(env.now()) } };
  }

  const groups = index.chumonGroups;
  const fromToday = from?.kind === "today";
  const [questions, cards, today] = await Promise.all([
    data.fetchQuestions(resolveScope(scope, base, groupMap(groups)), locale, { explanations: false }),
    data.fetchTermCards(locale).then(
      (f) => f.cards,
      (err: unknown) => {
        console.error("[practice] term cards failed to load; term chips fall back to plain text", err);
        return {};
      },
    ),
    fromToday
      ? data.fetchToday(locale).catch((err: unknown) => {
          console.error("[practice] today payload failed; the summary offers no 「继续下一项」", err);
          return null;
        })
      : Promise.resolve(null),
  ]);
  if (questions.length === 0) return setup();
  const ids = questions.map((q) => q.id);
  const run = parseRun(sp);

  const stars = topicStars(index);
  const inGroup = new Set(questions.map((q) => q.topic_id));
  const topics: SessionView["topics"] = {};
  for (const t of index.topics) {
    if (!inGroup.has(t.topic_id)) continue;
    topics[t.topic_id] = { category: t.category, path: `${t.medium_jp} › ${t.name_jp}`, stars: stars[t.topic_id]! };
  }

  return {
    kind: "session",
    key: sessionKey(ids, run),
    questions,
    termCards: termCardsFor(questions, cards),
    topics,
    folds: foldPlan(ids, groups),
    from,
    today,
    run,
    kindParam: fromToday ? parseKind(sp) : null,
  };
}
