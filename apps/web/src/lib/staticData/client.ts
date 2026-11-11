// D-217 H1-2 — the browser's typed fetch of the /data/… static files (./shards for the layout).
// One in-memory cache per page load: each file is fetched once, concurrent callers share the
// request, and a failed fetch is evicted so the next call retries. A non-2xx status throws.
// Client-safe: imports ./shards and client-safe modules only.

import {
  dataPaths,
  examOfId,
  explChunkOf,
  pickQuestions,
  pickSenseiTerms,
  senseiShardOf,
  toExplanation,
  type ExamShard,
  type ExplanationShard,
  type QuizIndexFile,
  type SenseiTermsFile,
  type StaticLocale,
  type TermCardsFile,
  type UnitsFile,
} from "./shards";
import type { TodayIndex } from "../practice/practiceIndex";
import { QUESTION_ID_RE } from "../quiz/feedbackModel";
import type { QuizExplanationEntry, QuizQuestion } from "../quiz/quizModel";
import type { SenseiTermContext } from "../sensei/anchors";

export type FetchImpl = (url: string) => Promise<Response>;

export function createStaticData(fetchImpl: FetchImpl = (url) => fetch(url)) {
  const cache = new Map<string, Promise<unknown>>();

  function get<T>(path: string): Promise<T> {
    let p = cache.get(path) as Promise<T> | undefined;
    if (!p) {
      p = fetchImpl(path).then(async (res) => {
        if (!res.ok) throw new Error(`${path}: ${res.status}`);
        return (await res.json()) as T;
      });
      cache.set(path, p);
      p.catch(() => cache.delete(path));
    }
    return p;
  }

  const fetchExamShard = (examId: string, locale: StaticLocale) => get<ExamShard>(dataPaths.exam(examId, locale));
  const fetchExplanationShard = (examId: string, chunk: number) =>
    get<ExplanationShard>(dataPaths.explanations(examId, chunk));
  const fetchQuizIndex = () => get<QuizIndexFile>(dataPaths.quizIndex());

  return {
    fetchQuizIndex,
    fetchExamShard,
    fetchExplanationShard,
    /** One question's explanation from its chunk file (shared with the chunk's other questions); null = none. */
    async fetchExplanation(id: string): Promise<QuizExplanationEntry | null> {
      const shard = await fetchExplanationShard(examOfId(id), explChunkOf(id));
      const e = Object.prototype.hasOwnProperty.call(shard.explanations, id) ? shard.explanations[id] : undefined;
      return e ? toExplanation(e) : null;
    },
    fetchToday: (locale: StaticLocale) => get<TodayIndex>(dataPaths.today(locale)),
    fetchTermCards: (locale: StaticLocale) => get<TermCardsFile>(dataPaths.termCards(locale)),
    fetchUnits: (locale: StaticLocale) => get<UnitsFile>(dataPaths.units(locale)),
    fetchSenseiTerms: (shard: string, locale: StaticLocale) => get<SenseiTermsFile>(dataPaths.senseiTerms(shard, locale)),

    /**
     * loadQuestionsByIds (explanations: true) or the mock run's questions (false), from the shards.
     * Same contract as loadQuestionsByIds: input order, ids that are not QUESTION_ID_RE-shaped or not
     * in index.json dropped (before any shard path is built from them), so one bad id never rejects.
     */
    async fetchQuestions(
      requested: readonly string[],
      locale: StaticLocale,
      { explanations }: { explanations: boolean },
    ): Promise<QuizQuestion[]> {
      const known = new Set((await fetchQuizIndex()).questions.map((r) => r[0]));
      const ids = requested.filter((id) => QUESTION_ID_RE.test(id) && known.has(id));
      const exams = [...new Set(ids.map(examOfId))];
      const chunks = explanations ? [...new Map(ids.map((id) => [`${examOfId(id)}-${explChunkOf(id)}`, id])).values()] : [];
      const [shards, expl] = await Promise.all([
        Promise.all(exams.map((e) => fetchExamShard(e, locale))),
        Promise.all(chunks.map((id) => fetchExplanationShard(examOfId(id), explChunkOf(id)))),
      ]);
      return pickQuestions(ids, shards, expl);
    },

    /** The term contexts the former GET /api/sensei/terms returned, for ids already checked by senseiTermIds. */
    async fetchSenseiTermContexts(ids: readonly string[], locale: StaticLocale): Promise<SenseiTermContext[]> {
      const shards = [...new Set(ids.map(senseiShardOf))];
      const files = await Promise.all(shards.map((s) => get<SenseiTermsFile>(dataPaths.senseiTerms(s, locale))));
      return pickSenseiTerms(ids, files);
    },
  };
}

export type StaticData = ReturnType<typeof createStaticData>;

/** The page-load instance. */
export const staticData: StaticData = createStaticData();
