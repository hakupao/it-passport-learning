// Phase 2 Step 10 — quiz list/summary helper.
//
// Session 42 4Q-locked design (Q1=a modal / Q2=a skeleton+progress / Q3=a
// ?qid= URL param / Q4=a new <QuizExplain /> sharing transport pattern only):
//   - List view drives <QuizList />: enumerate every question entity in the
//     corpus, ordered by (page, entity_index), with Japanese stem preview +
//     4 choice labels + answer letter.
//   - The question_id used by /api/quiz/explain is the entity_by_id key shape
//     `page_NNN_entity_M` (matches Step 6 contract). We derive it here from
//     idx.entity_by_id rather than parsing entity.id, so the surface stays in
//     lockstep with the route handler.
//
// Pure logic / no React — testable under the existing vitest node env.
//
// D-085 §2.4 quiz scope: question + page pin (assembleQuestion). This module
// only produces the *list* + *id*; the actual scope assembly happens server-side
// in /api/quiz/explain on click.

import type { IndexV2, Page, Trilingual } from "@/lib/data/types";

/** Letter prefix shown next to each choice in the UI ("ア/イ/ウ/エ" katakana). */
export const CHOICE_LETTERS_JP = ["ア", "イ", "ウ", "エ"] as const;
/** Letter prefix shown in evidence/CLI views (A/B/C/D). */
export const CHOICE_LETTERS_EN = ["A", "B", "C", "D"] as const;

/** Hard cap on stem preview chars; full stem is fetched server-side on click. */
export const STEM_PREVIEW_MAX_CHARS = 120;

/** Regex for the entity_by_id key shape `page_NNN_entity_M`. */
const QUESTION_ID_PATTERN = /^page_(\d+)_entity_(\d+)$/;

export interface QuizChoiceSummary {
  letterJp: string;
  letterEn: string;
  text: Trilingual;
}

export interface QuizSummary {
  /** entity_by_id key (matches /api/quiz/explain POST body shape). */
  questionId: string;
  /** Page number this question lives on. */
  page: number;
  /** 0-based index into Page.entities. */
  entityIndex: number;
  /** Internal entity id like `itpassport_r6::question::p042::0` (for debug). */
  entityId: string;
  /** Truncated Japanese stem for the card preview. */
  stemJp: string;
  /** Whether the stem was truncated (for "..." UI hint). */
  stemTruncated: boolean;
  /** Trilingual stem (full text) — kept for accessibility + screen reader. */
  stem: Trilingual;
  /** 4 choice summaries (letter + text). */
  choices: QuizChoiceSummary[];
  /** Letter of the correct answer (ア/イ/ウ/エ); null if entity missing the field. */
  answerLetterJp: string | null;
  /** Letter of the correct answer (A/B/C/D); null if entity missing the field. */
  answerLetterEn: string | null;
}

interface QuestionEntityShape {
  id: string;
  type: string;
  stem?: Trilingual;
  choices?: Trilingual[];
  answer_index?: number;
}

function isQuestionEntity(e: unknown): e is QuestionEntityShape {
  if (!e || typeof e !== "object") return false;
  const obj = e as Record<string, unknown>;
  return obj.type === "question" && typeof obj.id === "string";
}

function truncateStem(s: string): { text: string; truncated: boolean } {
  if (s.length <= STEM_PREVIEW_MAX_CHARS) return { text: s, truncated: false };
  return { text: `${s.slice(0, STEM_PREVIEW_MAX_CHARS - 1)}…`, truncated: true };
}

function emptyTrilingual(): Trilingual {
  return { jp: "", zh: "", en: "" };
}

function summarizeChoices(choices: Trilingual[] | undefined): QuizChoiceSummary[] {
  if (!Array.isArray(choices)) return [];
  return choices.map((c, i) => ({
    letterJp: CHOICE_LETTERS_JP[i] ?? String(i + 1),
    letterEn: CHOICE_LETTERS_EN[i] ?? String(i + 1),
    text: c ?? emptyTrilingual(),
  }));
}

function answerLetters(
  answerIndex: number | undefined,
): { jp: string | null; en: string | null } {
  if (typeof answerIndex !== "number") return { jp: null, en: null };
  if (answerIndex < 0 || answerIndex >= CHOICE_LETTERS_JP.length) {
    return { jp: null, en: null };
  }
  return {
    jp: CHOICE_LETTERS_JP[answerIndex] ?? null,
    en: CHOICE_LETTERS_EN[answerIndex] ?? null,
  };
}

/**
 * Build a QuizSummary for the entity_by_id key `questionId` against a loaded
 * Page. Returns null if the entity is missing or not a question.
 */
export function buildQuizSummary(
  questionId: string,
  page: Page,
  entityIndex: number,
): QuizSummary | null {
  if (entityIndex < 0 || entityIndex >= page.entities.length) return null;
  const entity = page.entities[entityIndex];
  if (!isQuestionEntity(entity)) return null;

  const stem = entity.stem ?? emptyTrilingual();
  const { text: stemJp, truncated } = truncateStem(stem.jp ?? "");
  const choices = summarizeChoices(entity.choices);
  const answer = answerLetters(entity.answer_index);

  return {
    questionId,
    page: page.page,
    entityIndex,
    entityId: entity.id,
    stemJp,
    stemTruncated: truncated,
    stem,
    choices,
    answerLetterJp: answer.jp,
    answerLetterEn: answer.en,
  };
}

/**
 * List every question id in the corpus, ordered by (page, entity_index).
 * Cheap: only inspects index.entity_by_id (already eager-loaded), no per-page
 * JSON read.
 */
export function listQuestionIds(idx: IndexV2): string[] {
  const refs = Object.entries(idx.entity_by_id)
    .filter(([, ref]) => ref.type === "question")
    .map(([key, ref]) => ({ key, page: ref.page, entityIndex: ref.entity_index }));
  refs.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return a.entityIndex - b.entityIndex;
  });
  return refs.map((r) => r.key);
}

/**
 * Parse a question_id back to {page, entityIndex}. Returns null on malformed input.
 * Mirrors the entity_by_id key shape `page_NNN_entity_M`.
 */
export function parseQuestionId(
  questionId: string,
): { page: number; entityIndex: number } | null {
  const match = questionId.match(QUESTION_ID_PATTERN);
  if (!match) return null;
  const page = Number(match[1]);
  const entityIndex = Number(match[2]);
  if (!Number.isInteger(page) || !Number.isInteger(entityIndex)) return null;
  if (page < 0 || entityIndex < 0) return null;
  return { page, entityIndex };
}

/**
 * Cheap predicate: is this question_id well-formed AND present in the index?
 * Used by the server <QuizList /> page to decide whether to pass an initial qid
 * down to the client component.
 */
export function isKnownQuestionId(idx: IndexV2, questionId: string): boolean {
  const ref = idx.entity_by_id[questionId];
  return Boolean(ref && ref.type === "question");
}
