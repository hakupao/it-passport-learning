// Stage 7 Phase 1 (D-190 §0-8 / §0-20 / §0-21) — practice disk layer (server
// only). Reads the committed corpus once per lambda lifetime (module-level memo,
// like quizReader.ts); a rejected load is not memoized (the next call retries,
// like dictionaryReader.ts). The pure builders are ./practiceIndex.
//
// Paths resolve through quizDataRoot() / textbookRoot() (straight to
// data/ip/quiz and data/ip/textbook) so nft never traces the IPA exams /
// sources / syllabus trees into a route bundle.

import { promises as fs } from "node:fs";
import path from "node:path";

import { buildTermCards } from "../glossary/dictionary";
import { loadDictionary } from "../glossary/dictionaryReader";
import { loadAllQuestions, loadBaseQuestions, loadQuizIndex, quizDataRoot } from "../quiz/quizReader";
import { toDataLang, type QuizQuestion } from "../quiz/quizModel";
import { loadReaderIndex, textbookRoot } from "../textbook/reader";
import { buildChumonGroups, buildTodayIndex, type ChumonGroup, type TodayIndex } from "./practiceIndex";

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

/** Memoize a loader; a rejection clears the memo so the next call retries. */
function memo<T>(load: () => Promise<T>): () => Promise<T> {
  let p: Promise<T> | null = null;
  return () =>
    (p ??= load().catch((err: unknown) => {
      p = null;
      throw err;
    }));
}

interface ChumonRegistry {
  groups: { key: string; exam_id: string; member_ids: string[] }[];
}

/** data/ip/quiz/chumon_groups.json with per-language preamble fold points. */
export const loadChumonGroups: () => Promise<ChumonGroup[]> = memo(async () => {
  const [registry, questions] = await Promise.all([
    readJson<ChumonRegistry>(path.join(quizDataRoot(), "chumon_groups.json")),
    loadAllQuestions(),
  ]);
  return buildChumonGroups(registry.groups, questions);
});

/** unit_id → estimated minutes (data/ip/textbook/unit_minutes.json, §0-21). */
export const loadUnitMinutes: () => Promise<Record<string, number>> = memo(async () => {
  const doc = await readJson<{ schema_version: number; minutes: Record<string, number> }>(
    path.join(textbookRoot(), "unit_minutes.json"),
  );
  if (doc.schema_version !== 1) throw new Error(`unit_minutes.json: schema_version ${doc.schema_version} ≠ 1`);
  return doc.minutes;
});

const todayLoaders = new Map<string, () => Promise<TodayIndex>>();

/** The today-page payload for `locale` (§0-20). A dictionary load failure propagates. */
export function loadTodayIndex(locale: string): Promise<TodayIndex> {
  const lang = toDataLang(locale);
  let load = todayLoaders.get(lang);
  if (!load) {
    load = memo(async () => {
      const [quizIndex, questions, readerIndex, unitMinutes, groups, dict] = await Promise.all([
        loadQuizIndex(),
        loadBaseQuestions(),
        loadReaderIndex(),
        loadUnitMinutes(),
        loadChumonGroups(),
        loadDictionary(),
      ]);
      return buildTodayIndex({
        quizIndex,
        questions,
        readerIndex,
        unitMinutes,
        groups,
        termCards: buildTermCards(dict, questions, locale),
        locale,
      });
    });
    todayLoaders.set(lang, load);
  }
  return load();
}

const loadById = memo(async () => new Map((await loadAllQuestions()).map((q) => [q.id, q])));

/** Questions (translations + explanations merged) in input order; unknown ids dropped. */
export async function loadQuestionsByIds(ids: readonly string[]): Promise<QuizQuestion[]> {
  const byId = await loadById();
  return ids.flatMap((id) => {
    const q = byId.get(id);
    return q ? [q] : [];
  });
}
