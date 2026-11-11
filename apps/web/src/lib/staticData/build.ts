// D-217 H1-2 — build-time builders of the /data/… static files (server only). Each builder reads
// the same memoized loaders the server pages read today and passes the result through the
// allow-list projections of ./shards. The route handlers under src/app/data/ call these.

import "server-only";

import { buildTermCards } from "../glossary/dictionary";
import { loadDictionary } from "../glossary/dictionaryReader";
import { termId } from "../glossary/termId";
import { loadChumonGroups, loadTodayIndex } from "../practice/practiceReader";
import { loadAllQuestions, loadBaseQuestions, loadQuizIndex } from "../quiz/quizReader";
import { termContext } from "../sensei/textbookAnchors";
import { loadReaderIndex, loadUnit, toDataLang } from "../textbook/reader";
import {
  explChunkOf,
  projectExam,
  projectExplanation,
  projectQuestion,
  projectTopic,
  senseiShardOf,
  type ExamShard,
  type ExplanationShard,
  type QuizIndexFile,
  type SenseiTermsFile,
  type StaticLocale,
  type TermCardsFile,
  type UnitsFile,
} from "./shards";

const byId = (a: { id: string }, b: { id: string }): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** Exam ids in quiz_index order. */
export async function examIds(): Promise<string[]> {
  return (await loadQuizIndex()).exams.map((e) => e.exam_id);
}

export async function buildQuizIndexFile(): Promise<QuizIndexFile> {
  const [index, base, groups] = await Promise.all([loadQuizIndex(), loadBaseQuestions(), loadChumonGroups()]);
  return {
    topics: index.topics.map(projectTopic),
    exams: index.exams.map(projectExam),
    questions: base.map((q) => [q.id, q.exam_id, q.topic_id]),
    chumonGroups: groups.map((g) => ({
      key: g.key,
      memberIds: [...g.memberIds],
      preambleChars: { jp: g.preambleChars.jp, zh: g.preambleChars.zh, en: g.preambleChars.en },
    })),
  };
}

async function examQuestions(examId: string) {
  const all = await loadAllQuestions();
  const qs = all.filter((q) => q.exam_id === examId).sort(byId);
  if (qs.length === 0) throw new Error(`exam ${examId}: no questions`);
  return qs;
}

export async function buildExamShard(examId: string, locale: StaticLocale): Promise<ExamShard> {
  const qs = await examQuestions(examId);
  return { exam_id: examId, locale, questions: qs.map((q) => projectQuestion(q, locale)) };
}

/** [examId, chunk] of every explanation file (chunks that hold at least one question). */
export async function explanationChunks(): Promise<[string, number][]> {
  const seen = new Set<string>();
  const out: [string, number][] = [];
  for (const q of await loadBaseQuestions()) {
    const chunk = explChunkOf(q.id);
    const key = `${q.exam_id}-${chunk}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push([q.exam_id, chunk]);
    }
  }
  return out;
}

export async function buildExplanationShard(examId: string, chunk: number): Promise<ExplanationShard> {
  const qs = (await examQuestions(examId)).filter((q) => explChunkOf(q.id) === chunk);
  if (qs.length === 0) throw new Error(`exam ${examId} chunk ${chunk}: no questions`);
  const explanations: ExplanationShard["explanations"] = {};
  for (const q of qs) {
    if (q.explanation) explanations[q.id] = projectExplanation(q.explanation);
  }
  return { exam_id: examId, chunk, explanations };
}

export function buildTodayFile(locale: StaticLocale) {
  return loadTodayIndex(locale);
}

export async function buildTermCardsFile(locale: StaticLocale): Promise<TermCardsFile> {
  const [dict, base] = await Promise.all([loadDictionary(), loadBaseQuestions()]);
  return { locale, cards: buildTermCards(dict, base, locale) };
}

/** What resolveSessionFrom reads per unit (title in the locale, the unit's terms), every listed unit. */
export async function buildUnitsFile(locale: StaticLocale): Promise<UnitsFile> {
  const index = await loadReaderIndex();
  const dl = toDataLang(locale);
  const units: UnitsFile["units"] = {};
  for (const id of index.topics.flatMap((t) => t.unit_order)) {
    const unit = await loadUnit(id);
    units[id] = {
      title: unit[`title_${dl}`] || unit.title_jp,
      terms: unit.terms.map((t) => ({ id: termId(t.term), term: t.term })),
    };
  }
  return { locale, units };
}

export async function buildSenseiTermsFile(shard: string, locale: StaticLocale): Promise<SenseiTermsFile> {
  const [dict, index] = await Promise.all([loadDictionary(), loadReaderIndex()]);
  const unitTitlesJp: Record<string, string> = {};
  for (const u of index.topics.flatMap((t) => t.units ?? [])) unitTitlesJp[u.unit_id] = u.title_jp;
  const terms: SenseiTermsFile["terms"] = {};
  for (const entry of dict.entries) {
    if (senseiShardOf(entry.id) === shard) terms[entry.id] = termContext(entry, locale, unitTitlesJp);
  }
  return { locale, shard, terms };
}
