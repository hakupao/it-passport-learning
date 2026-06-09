// Stage 6 / Quiz Phase 0 (Session 86) — pure quiz model (types + helpers).
//
// NO Node APIs here: this module is imported by the client QuizSet component, so
// it must stay bundler-safe. The filesystem layer (loaders) lives in quizReader.ts
// and imports from here. Pure helpers are unit-tested in __tests__/quizReader.test.ts.

export type DataLang = "jp" | "zh" | "en";

/** App locale → corpus field suffix. Routing uses "ja" where the corpus uses "jp". */
export function toDataLang(locale: string): DataLang {
  return locale === "zh" ? "zh" : locale === "en" ? "en" : "jp";
}

export const CHOICE_LETTERS = ["ア", "イ", "ウ", "エ"] as const;
/** D-114 recommended learning path (matches textbook reader CATEGORY_ORDER). */
export const CATEGORY_ORDER: readonly string[] = ["technology", "management", "strategy"] as const;

// ---- corpus schema (subset we consume) ------------------------------------

export interface QuizTopicRef {
  topic_id: string;
  category: string;
  major_jp: string;
  major_zh: string;
  major_en: string;
  medium_jp: string;
  medium_zh: string;
  medium_en: string;
  /** 小分類 name is JP-only across the corpus + IPA syllabus (OQ-03). */
  name_jp: string;
  question_count: number;
}

export interface QuizExamRef {
  exam_id: string;
  gregorian: number;
  wareki: string;
  season: string;
  /** Human-readable Japanese exam label (出典 is Japanese by nature). */
  label_jp: string;
  question_count: number;
}

export interface QuizIndex {
  schema_version: string;
  generated_from: string;
  attribution: string;
  stats: { questions: number; topics: number; exams: number; with_figure: number };
  topics: QuizTopicRef[];
  exams: QuizExamRef[];
}

export interface QuizQuestion {
  id: string;
  exam_id: string;
  topic_id: string;
  category: string;
  /** 出典 (IPA attribution) e.g. "令和6年度 ITパスポート試験 問1". 出典 stays JP by nature (D-134). */
  source_label: string;
  /** Displayed JP stem. The reader overwrites it with the de-garbled clean JP when a
   *  translation sidecar carries `stem_jp_clean` (figure questions, D-136-C). */
  stem_jp: string;
  choices_jp: Record<string, string>;
  correct_answer: string;
  has_figure: boolean;
  /** Figure image basename (=id) served at /quiz-figures/<figure>.webp, or null. */
  figure: string | null;
  figure_type: string | null;
  terms: string[];
  // --- Phase 1 trilingual backfill (D-136): merged from the translation sidecar at
  //     read time; absent until a question's exam batch is translated (JP fallback). ---
  stem_zh?: string;
  stem_en?: string;
  choices_zh?: Record<string, string>;
  choices_en?: Record<string, string>;
}

/**
 * One question's translation, stored in the per-exam sidecar
 * `data/ip/quiz/translations/<exam_id>.json` (D-136-B). `stem_jp_clean` is present
 * only when Phase 1 de-garbled a figure stem (D-136-C); otherwise the raw JP stem
 * (already clean) stands.
 */
export interface QuizTranslationEntry {
  stem_jp_clean?: string;
  stem: { zh: string; en: string };
  choices: Record<string, { zh: string; en: string }>;
}

/** The on-disk shape of a per-exam translation sidecar. */
export interface QuizTranslationFile {
  schema_version: string;
  exam_id: string;
  questions: Record<string, QuizTranslationEntry>;
}

/**
 * Fold a translation sidecar entry into a JP-only question (pure). Missing entry →
 * the question is returned unchanged (JP fallback = incremental backfill, D-135/Q5).
 * A `stem_jp_clean` overrides the displayed JP stem (figure garble removal, D-136-C).
 */
export function mergeTranslation(
  q: QuizQuestion,
  entry: QuizTranslationEntry | undefined,
): QuizQuestion {
  if (!entry) return q;
  const pick = (lang: "zh" | "en"): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const L of CHOICE_LETTERS) out[L] = entry.choices?.[L]?.[lang] ?? "";
    return out;
  };
  return {
    ...q,
    stem_jp: entry.stem_jp_clean?.trim() ? entry.stem_jp_clean : q.stem_jp,
    stem_zh: entry.stem.zh,
    stem_en: entry.stem.en,
    choices_zh: pick("zh"),
    choices_en: pick("en"),
  };
}

// ---- nav model (pure, testable) -------------------------------------------

export interface QuizNavTopic {
  topic_id: string;
  /** major / medium in the active locale; name_jp is JP-only (OQ-03). */
  major: string;
  medium: string;
  name_jp: string;
  question_count: number;
}
export interface QuizNavCategory {
  category: string;
  topics: QuizNavTopic[];
}

/** Pick the active-locale member of a `{jp,zh,en}` triple (jp as the fallback). */
export function localized(jp: string, zh: string, en: string, locale: string): string {
  const dl = toDataLang(locale);
  const v = dl === "zh" ? zh : dl === "en" ? en : jp;
  return v && v.trim() !== "" ? v : jp;
}

/**
 * Group topics by category (CATEGORY_ORDER first, unknowns appended in encounter
 * order), preserving index order within a category, and resolving major/medium to
 * `locale` (name_jp stays JP). Pure (no I/O).
 */
export function buildTopicNav(index: QuizIndex, locale: string): QuizNavCategory[] {
  const byCat = new Map<string, QuizNavTopic[]>();
  for (const t of index.topics) {
    const nt: QuizNavTopic = {
      topic_id: t.topic_id,
      major: localized(t.major_jp, t.major_zh, t.major_en, locale),
      medium: localized(t.medium_jp, t.medium_zh, t.medium_en, locale),
      name_jp: t.name_jp,
      question_count: t.question_count,
    };
    const arr = byCat.get(t.category) ?? [];
    arr.push(nt);
    byCat.set(t.category, arr);
  }
  const ordered: QuizNavCategory[] = [];
  const seen = new Set<string>();
  for (const cat of CATEGORY_ORDER) {
    const topics = byCat.get(cat);
    if (topics) {
      ordered.push({ category: cat, topics });
      seen.add(cat);
    }
  }
  for (const [cat, topics] of byCat) {
    if (!seen.has(cat)) ordered.push({ category: cat, topics });
  }
  return ordered;
}

/** Exams oldest-first (defensive re-sort; the corpus is already chronological). */
export function buildExamNav(index: QuizIndex): QuizExamRef[] {
  return [...index.exams].sort((a, b) => a.gregorian - b.gregorian);
}

// ---- question helpers (pure) ----------------------------------------------

export interface OrderedChoice {
  letter: string;
  text: string;
  isCorrect: boolean;
}

/** The 4 choices in canonical ア/イ/ウ/エ order (corpus object keys may be permuted). */
export function orderedChoices(q: QuizQuestion): OrderedChoice[] {
  return CHOICE_LETTERS.map((letter) => ({
    letter,
    text: q.choices_jp[letter] ?? "",
    isCorrect: q.correct_answer === letter,
  }));
}

/** The stem in the active locale, falling back to JP per-field (D-135 incremental backfill). */
export function localizedStem(q: QuizQuestion, locale: string): string {
  const dl = toDataLang(locale);
  const v = dl === "zh" ? q.stem_zh : dl === "en" ? q.stem_en : undefined;
  return v && v.trim() !== "" ? v : q.stem_jp;
}

/**
 * The 4 choices in canonical order, each resolved to the active locale with a
 * per-choice JP fallback (a half-translated batch never shows a blank choice).
 */
export function localizedChoices(q: QuizQuestion, locale: string): OrderedChoice[] {
  const dl = toDataLang(locale);
  const tr = dl === "zh" ? q.choices_zh : dl === "en" ? q.choices_en : undefined;
  return CHOICE_LETTERS.map((letter) => {
    const t = tr?.[letter];
    return {
      letter,
      text: t && t.trim() !== "" ? t : (q.choices_jp[letter] ?? ""),
      isCorrect: q.correct_answer === letter,
    };
  });
}

export type QuizMode = "topic" | "exam";
export function isValidMode(mode: string | undefined | null): mode is QuizMode {
  return mode === "topic" || mode === "exam";
}

export function filterByTopic(questions: QuizQuestion[], topicId: string): QuizQuestion[] {
  return questions.filter((q) => q.topic_id === topicId);
}
export function filterByExam(questions: QuizQuestion[], examId: string): QuizQuestion[] {
  return questions.filter((q) => q.exam_id === examId);
}
