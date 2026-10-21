// Stage 6 (D-179 / D-180 §0-2) — glossary dictionary disk loader (server-only:
// pulls in the node:fs textbook + quiz readers). Builds once from the committed
// corpus (data/ip/textbook units + data/ip/quiz/questions.json) and memoizes for
// the lambda lifetime, like quizReader.ts. The pure builder is ./dictionary.

import { loadBaseQuestions } from "../quiz/quizReader";
import { loadAllUnits, loadReaderIndex } from "../textbook/reader";
import { buildDictionary, type Dictionary } from "./dictionary";

let dictionaryPromise: Promise<Dictionary> | null = null;

export function loadDictionary(): Promise<Dictionary> {
  return (dictionaryPromise ??= Promise.all([loadReaderIndex(), loadAllUnits(), loadBaseQuestions()]).then(
    ([index, units, questions]) => buildDictionary(index, units, questions),
  ));
}
