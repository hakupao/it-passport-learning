// Stage 7 Phase 1 (D-190 §0-8 / §0-11 / §0-12 / §0-20) — practice index: pure
// functions over the quiz corpus that the today page and the practice pages share.
//
//   - topicStars (§0-11): 頻出度 tertiles of quiz_index.topics[].question_count.
//     Sort by (question_count desc, topic_id asc); rank 0 = most questions;
//     stars = 3 − floor(rank · 3 / topicCount). topicCount is
//     index.topics.length (= 63 in the corpus, so ranks 0–20 → ★★★, 21–41 → ★★,
//     42–62 → ★).
//   - lcpPreamble / buildChumonGroups (§0-8, Review Focus 4): a 中問 group's
//     members open with the same shared preamble. The fold point is the longest
//     common prefix of the members' displayed stems, backed off to the last
//     paragraph break "\n\n" inside it; the returned count INCLUDES that "\n\n",
//     so stem.slice(0, n) + stem.slice(n) === stem and stem.slice(0, n) is the
//     same string for every member. No "\n\n" inside the prefix, fewer than two
//     stems, a missing stem, or a fold that would swallow a whole stem → null
//     (show the stem unfolded). Stems are the displayed ones (localizedStem:
//     jp = stem_jp after the stem_jp_clean merge, zh/en with JP fallback).
//   - resolveScope (§0-12): the server-side question list of a practice URL.
//     "ids": input order, unknown ids dropped. "filter": topics are any-of, exam
//     narrows them (both empty → the whole corpus; the URL parser never sends
//     that); "seq" = corpus order (questions.json is id = exam / question-number
//     order), "rand" = Fisher–Yates driven by mulberry32(seed). Take n, then
//     expandGroups — a group member pulls its whole group in, so the list may
//     run past n (§0-8 overflow).
//   - buildTodayIndex (§0-20): the browser payload of the today page.
//     topicTerms = per topic, the terms that occur in the most of that topic's
//     questions (counted once per question) among those with a dictionary card,
//     top 3, ties by first appearance in corpus order.
//   - poolFromIndex: TodayIndex → schedule.ts QuestionPool.
//
// Bundler-safe: no node:* and only type imports from server-side modules
// (TodayIndex / poolFromIndex run in the browser). Imports are relative (not
// `@/`) like ../learning/schedule. The disk layer is ./practiceReader.

import { mulberry32 } from "../hash";
import { expandGroups, type QuestionPool } from "../learning/schedule";
import type { TermCard } from "../glossary/dictionary";
import { localized, localizedStem, type QuizIndex, type QuizQuestion } from "../quiz/quizModel";
import type { ReaderIndex } from "../textbook/reader";

export type Stars = 1 | 2 | 3;
export type StemLang = "jp" | "zh" | "en";
const STEM_LOCALES: Record<StemLang, string> = { jp: "ja", zh: "zh", en: "en" };

/** 頻出度 ★ per topic_id (§0-11). */
export function topicStars(index: Pick<QuizIndex, "topics">): Record<string, Stars> {
  const sorted = [...index.topics].sort(
    (a, b) => b.question_count - a.question_count || (a.topic_id < b.topic_id ? -1 : a.topic_id > b.topic_id ? 1 : 0),
  );
  const out: Record<string, Stars> = {};
  sorted.forEach((t, rank) => {
    out[t.topic_id] = (3 - Math.floor((rank * 3) / sorted.length)) as Stars;
  });
  return out;
}

export interface ChumonGroup {
  key: string;
  /** question-number order */
  memberIds: string[];
  /** characters of the shared preamble to fold, trailing "\n\n" included; null = do not fold */
  preambleChars: Record<StemLang, number | null>;
}

/** Fold point of a group's shared preamble (see header); null = do not fold. */
export function lcpPreamble(stems: readonly (string | null | undefined)[]): number | null {
  if (stems.length < 2) return null;
  const ss: string[] = [];
  for (const s of stems) {
    if (typeof s !== "string") return null;
    ss.push(s);
  }
  const first = ss[0]!;
  let n = first.length;
  for (const s of ss) {
    let i = 0;
    while (i < n && i < s.length && s.charCodeAt(i) === first.charCodeAt(i)) i++;
    n = i;
  }
  const k = first.slice(0, n).lastIndexOf("\n\n");
  if (k < 0) return null;
  const fold = k + 2;
  return ss.every((s) => s.length > fold) ? fold : null;
}

/**
 * Registry entries (data/ip/quiz/chumon_groups.json) → ChumonGroup with fold
 * points for each language. Throws when a member is not in the corpus (registry drift).
 */
export function buildChumonGroups(
  registry: readonly { key: string; member_ids: readonly string[] }[],
  questions: readonly QuizQuestion[],
): ChumonGroup[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  return registry.map((g) => {
    const memberIds = [...g.member_ids].sort();
    const members = memberIds.map((id) => {
      const q = byId.get(id);
      if (!q) throw new Error(`chumon group ${g.key}: member ${id} is not in the corpus`);
      return q;
    });
    const preambleChars = {} as Record<StemLang, number | null>;
    for (const lang of ["jp", "zh", "en"] as const) {
      preambleChars[lang] = lcpPreamble(members.map((q) => localizedStem(q, STEM_LOCALES[lang])));
    }
    return { key: g.key, memberIds, preambleChars };
  });
}

/** group key → member ids, the shape expandGroups / QuestionPool take. */
export function groupMap(groups: readonly ChumonGroup[]): Record<string, string[]> {
  return Object.fromEntries(groups.map((g) => [g.key, [...g.memberIds]]));
}

export type PracticeScope =
  | { kind: "ids"; ids: string[] }
  | {
      kind: "filter";
      topics: string[];
      exam: string | null;
      n: number | "all";
      order: "seq" | "rand";
      seed: number;
    };

/** The question ids a practice scope resolves to (see header). */
export function resolveScope(
  scope: PracticeScope,
  questions: readonly Pick<QuizQuestion, "id" | "topic_id" | "exam_id">[],
  groups: Record<string, string[]>,
): string[] {
  if (scope.kind === "ids") {
    const known = new Set(questions.map((q) => q.id));
    return expandGroups(
      scope.ids.filter((id) => known.has(id)),
      groups,
    );
  }
  const topics = new Set(scope.topics);
  const ids = questions
    .filter((q) => (topics.size === 0 || topics.has(q.topic_id)) && (scope.exam === null || q.exam_id === scope.exam))
    .map((q) => q.id);
  if (scope.order === "rand") {
    const rand = mulberry32(scope.seed);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    }
  }
  return expandGroups(scope.n === "all" ? ids : ids.slice(0, scope.n), groups);
}

export interface TopicMeta {
  id: string;
  category: string;
  /** JP-only for every locale (OQ-03) */
  name_jp: string;
  stars: Stars;
  questionCount: number;
  /** textbook units in unit_order; title in the active locale */
  units: { id: string; title: string; minutes: number }[];
}

export interface TodayIndex {
  /** quiz_index order */
  topics: TopicMeta[];
  /** topicId → question ids in corpus order */
  topicQuestionIds: Record<string, string[]>;
  /** chumon group key → member ids in question-number order */
  groups: Record<string, string[]>;
  /** topicId → up to 3 cards (§0-20 「今天的 3 个用语」) */
  topicTerms: Record<string, TermCard[]>;
  /** examId → label_jp */
  exams: Record<string, string>;
}

export interface TodayIndexInput {
  quizIndex: Pick<QuizIndex, "topics" | "exams">;
  /** corpus order */
  questions: readonly Pick<QuizQuestion, "id" | "topic_id" | "terms">[];
  readerIndex: Pick<ReaderIndex, "topics">;
  /** unit_id → minutes (data/ip/textbook/unit_minutes.json) */
  unitMinutes: Record<string, number>;
  groups: readonly ChumonGroup[];
  /** buildTermCards(dict, questions, locale): cards keyed by the term as written in QuizQuestion.terms */
  termCards: Record<string, TermCard>;
  locale: string;
}

const TOPIC_TERMS = 3;

/** The today-page payload (§0-20). Throws when a listed unit has no minutes. */
export function buildTodayIndex(input: TodayIndexInput): TodayIndex {
  const { quizIndex, questions, readerIndex, unitMinutes, groups, termCards, locale } = input;
  const stars = topicStars(quizIndex);
  const topicQuestionIds: Record<string, string[]> = {};
  for (const t of quizIndex.topics) topicQuestionIds[t.topic_id] = [];
  const termCount = new Map<string, Map<string, number>>(); // topic → term → questions (insertion = first appearance)
  for (const q of questions) {
    const list = topicQuestionIds[q.topic_id];
    if (!list) continue;
    list.push(q.id);
    let counts = termCount.get(q.topic_id);
    if (!counts) termCount.set(q.topic_id, (counts = new Map()));
    for (const term of new Set(q.terms)) {
      if (Object.prototype.hasOwnProperty.call(termCards, term)) counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }

  const readerTopics = new Map(readerIndex.topics.map((t) => [t.topic_id, t]));
  const topics: TopicMeta[] = quizIndex.topics.map((t) => {
    const rt = readerTopics.get(t.topic_id);
    const unitRefs = new Map((rt?.units ?? []).map((u) => [u.unit_id, u]));
    const units = (rt?.unit_order ?? []).flatMap((id) => {
      const u = unitRefs.get(id);
      if (!u) return [];
      const minutes = unitMinutes[id];
      if (minutes === undefined) throw new Error(`unit ${id}: no entry in unit_minutes.json`);
      return [{ id, title: localized(u.title_jp, u.title_zh, u.title_en, locale), minutes }];
    });
    return {
      id: t.topic_id,
      category: t.category,
      name_jp: t.name_jp,
      stars: stars[t.topic_id]!,
      questionCount: t.question_count,
      units,
    };
  });

  const topicTerms: Record<string, TermCard[]> = {};
  for (const t of quizIndex.topics) {
    const ranked = [...(termCount.get(t.topic_id) ?? new Map<string, number>())]
      .map(([term, count], order) => ({ term, count, order }))
      .sort((a, b) => b.count - a.count || a.order - b.order);
    const cards: TermCard[] = [];
    const seen = new Set<string>();
    for (const { term } of ranked) {
      const card = termCards[term]!;
      if (seen.has(card.id)) continue; // two spellings of one headword (NFC)
      seen.add(card.id);
      cards.push(card);
      if (cards.length === TOPIC_TERMS) break;
    }
    topicTerms[t.topic_id] = cards;
  }

  return {
    topics,
    topicQuestionIds,
    groups: groupMap(groups),
    topicTerms,
    exams: Object.fromEntries(quizIndex.exams.map((e) => [e.exam_id, e.label_jp])),
  };
}

/** Scheduler input (schedule.ts) from the today payload. */
export function poolFromIndex(index: TodayIndex): QuestionPool {
  return {
    topicQuestionIds: index.topicQuestionIds,
    groups: index.groups,
    topicStars: Object.fromEntries(index.topics.map((t) => [t.id, t.stars])),
  };
}
