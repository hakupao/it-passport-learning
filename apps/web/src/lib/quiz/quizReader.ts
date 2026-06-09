// Stage 6 / Quiz 接過去問 Phase 0 (Session 86, D-134/D-135) — quiz fs layer.
//
// Reads the in-repo derived quiz corpus (data/ip/quiz/, un-gitignored per D-134;
// projected clean from the gitignored raw question_bank.json by
// scripts/build-quiz-corpus.mjs):
//   - quiz_index.json → QuizIndex   (63 topic labels [trilingual] + 29 exams + counts)
//   - questions.json  → QuizQuestion[] (2900, JP stem/choices + 出典 + figure ref)
// Figures are served statically from /quiz-figures/<id>.webp (apps/web/public).
//
// SELF-CONTAINED filesystem layer (deliberately does NOT import the dead
// lib/data/FsDataSource, whose _fixtures/v1.0.3 corpus was removed in S63) —
// mirrors the textbook reader.ts pattern (Session 85). The pure types/helpers
// live in ./quizModel (bundler-safe; imported by the client QuizSet) and are
// re-exported here for server-side consumers.

import { promises as fs } from "node:fs";
import path from "node:path";

import {
  filterByExam,
  filterByTopic,
  isValidMode,
  localized,
  mergeTranslation,
  type QuizIndex,
  type QuizMode,
  type QuizQuestion,
  type QuizTranslationEntry,
  type QuizTranslationFile,
} from "./quizModel";

export * from "./quizModel";

// Resolve straight to data/ip/quiz (sibling of data/ip/textbook). Pointing at the
// quiz dir directly keeps the gitignored IPA exams/sources/syllabus trees out of
// the route bundle (same nft reasoning as the textbook reader, Session 85).
function quizDataRoot(): string {
  const env = process.env.QUIZ_DATA_ROOT;
  return env ? path.join(env, "quiz") : path.resolve(process.cwd(), "../../data/ip/quiz");
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf-8")) as T;
}

// Module-level memo: the corpus is immutable, so load once per lambda lifetime
// rather than per request (questions.json is ~2.8 MB — avoid re-parsing it on
// every force-dynamic render).
let indexPromise: Promise<QuizIndex> | null = null;
let questionsPromise: Promise<QuizQuestion[]> | null = null;
let translationsPromise: Promise<Map<string, QuizTranslationEntry>> | null = null;

export function loadQuizIndex(): Promise<QuizIndex> {
  return (indexPromise ??= readJson<QuizIndex>(path.join(quizDataRoot(), "quiz_index.json")));
}

/**
 * Load every per-exam translation sidecar (D-136-B) into one id→entry map.
 * A MISSING translations/ directory is the legitimate pre-/partial-backfill state
 * (Phase 0, or before this exam's batch lands) → returns an empty map so the UI
 * shows JP (D-135/Q5 incremental backfill). A present-but-unreadable file is NOT
 * swallowed: only readdir's ENOENT is caught; a corrupt sidecar throws loudly.
 */
async function loadTranslationMap(): Promise<Map<string, QuizTranslationEntry>> {
  const dir = path.join(quizDataRoot(), "translations");
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return new Map();
    throw err;
  }
  const map = new Map<string, QuizTranslationEntry>();
  const loaded = await Promise.all(
    files.map((f) => readJson<QuizTranslationFile>(path.join(dir, f))),
  );
  for (const file of loaded) {
    for (const [id, entry] of Object.entries(file.questions)) map.set(id, entry);
  }
  return map;
}

export function loadTranslations(): Promise<Map<string, QuizTranslationEntry>> {
  return (translationsPromise ??= loadTranslationMap());
}

export function loadAllQuestions(): Promise<QuizQuestion[]> {
  return (questionsPromise ??= Promise.all([
    readJson<{ questions: QuizQuestion[] }>(path.join(quizDataRoot(), "questions.json")).then(
      (d) => d.questions,
    ),
    loadTranslations(),
  ]).then(([questions, tr]) => questions.map((q) => mergeTranslation(q, tr.get(q.id)))));
}

export interface QuizSet {
  mode: QuizMode;
  id: string;
  /** Localized heading for the set (topic: name_jp; exam: label_jp). */
  label: string;
  sublabel: string;
  questions: QuizQuestion[];
}

/**
 * Load the question set for a (mode,id) pair. Returns null if mode is invalid or
 * the id is not present in the index (membership allowlist — no user input ever
 * reaches a filesystem path, since questions live in one file we filter in memory).
 */
export async function loadQuestionSet(
  mode: string | undefined,
  id: string | undefined,
  locale: string,
): Promise<QuizSet | null> {
  if (!isValidMode(mode) || !id) return null;
  const [index, all] = await Promise.all([loadQuizIndex(), loadAllQuestions()]);

  if (mode === "topic") {
    const t = index.topics.find((x) => x.topic_id === id);
    if (!t) return null;
    return {
      mode,
      id,
      label: t.name_jp,
      sublabel: `${localized(t.major_jp, t.major_zh, t.major_en, locale)} › ${localized(t.medium_jp, t.medium_zh, t.medium_en, locale)}`,
      questions: filterByTopic(all, id),
    };
  }
  const e = index.exams.find((x) => x.exam_id === id);
  if (!e) return null;
  return {
    mode,
    id,
    label: e.label_jp,
    sublabel: "ITパスポート試験",
    questions: filterByExam(all, id),
  };
}
