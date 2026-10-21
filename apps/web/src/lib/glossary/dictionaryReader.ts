// Stage 6 (D-179 / D-180 §0-2) — glossary dictionary disk loader (server-only:
// pulls in the node:fs textbook + quiz readers). Builds once from the committed
// corpus (data/ip/textbook units + data/ip/quiz/questions.json) and memoizes for
// the lambda lifetime, like quizReader.ts. A rejected load is not memoized (the
// next call retries) and still propagates to the caller. The pure builder is
// ./dictionary.
//
// Caveat (known follow-up): the memo reset only retries failures thrown inside
// buildDictionary. The sub-loaders — reader.ts loadReaderIndex / loadAllUnits and
// quizReader.ts loadBaseQuestions — memoize their own promises with no reset, so a
// rejected disk read there stays pinned for the lambda lifetime and every retry
// here re-rejects with the same error.

import { loadBaseQuestions } from "../quiz/quizReader";
import { loadAllUnits, loadReaderIndex } from "../textbook/reader";
import { buildDictionary, type Dictionary } from "./dictionary";

let dictionaryPromise: Promise<Dictionary> | null = null;

export function loadDictionary(): Promise<Dictionary> {
  return (dictionaryPromise ??= Promise.all([loadReaderIndex(), loadAllUnits(), loadBaseQuestions()])
    .then(([index, units, questions]) => buildDictionary(index, units, questions))
    .catch((err: unknown) => {
      dictionaryPromise = null;
      throw err;
    }));
}
