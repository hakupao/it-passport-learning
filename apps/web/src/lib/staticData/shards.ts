// D-217 H1-2 — the public static data files (build-time JSON under /data/…): their shapes, the
// allow-list projections that build them, and the pure helpers the browser uses to pick from them.
//
// Every file is built through an explicit projection that copies display fields only, by name
// (never a spread of corpus objects): the corpus also carries provenance / audit fields
// (sidecar `source_note`, `suspect_count`, `stem_corruption_count`, the explanation's writer
// self-check block with its `note_jp`, quiz_index `generated_from`, …) that must not leave the build.
// ALLOW below declares, per file family, every key the files may hold; the allow-list test walks
// every built file against it.
//
// Layout (sizes measured in S154, see the H1-2 report):
//   /data/quiz/index.json                     locale-free: topics, exams, [id, exam, topic] rows, 中問 groups
//   /data/quiz/<examId>.<locale>.json         one exam's questions, JP + the locale's language, no explanation
//                                             (a suspect question carries `suspect: true`, H1-4 LOW-2)
//   /data/quiz-expl/<examId>-<k>.json         explanations of that exam's questions in chunk k (explChunkOf), all
//                                             three languages: ExplanationPane's 日/中/EN switch is independent of
//                                             the page locale (D-186). Practice loads them, the mock run never does.
//   /data/practice/today.<locale>.json        loadTodayIndex(locale) (the setup index = setupFromToday)
//   /data/glossary/cards.<locale>.json        term card of every term written in a question's `terms`
//   /data/textbook/units.<locale>.json        per unit: title + terms (a from=unit session)
//   /data/sensei/terms-<h>.<locale>.json      AI 先生 term contexts, sharded by the termId's first hex digit
//
// Bundler-safe: type-only imports from server modules, value imports only from client-safe ones; no node:*.

import type { TermCard } from "../glossary/dictionary";
import { isValidTermId } from "../glossary/termId";
import type { ChumonGroup, TodayIndex } from "../practice/practiceIndex";
import { QUESTION_ID_RE } from "../quiz/questionId";
import {
  CHOICE_LETTERS,
  isSuspect,
  type QuizExamRef,
  type QuizExplanation,
  type QuizIndex,
  type QuizQuestion,
  type QuizTopicRef,
} from "../quiz/quizModel";
import { REVIEW_MAX_WRONG, type SenseiTermContext } from "../sensei/anchors";

export const STATIC_LOCALES = ["ja", "zh", "en"] as const;
export type StaticLocale = (typeof STATIC_LOCALES)[number];

/** The translation language a locale's files carry besides JP (none for ja). */
function extraLang(locale: StaticLocale): "zh" | "en" | null {
  return locale === "zh" ? "zh" : locale === "en" ? "en" : null;
}

// ---- shapes -----------------------------------------------------------------

/** A question as the exam shard carries it: QuizQuestion's names, only JP + the locale's
 *  language, without `figure_type` (no reader) and without the explanation (own file); `suspect`
 *  only when true, so the caveat shows while the explanation loads or if it fails (H1-4 LOW-2). */
export interface ShardQuestion {
  id: string;
  exam_id: string;
  topic_id: string;
  category: string;
  source_label: string;
  stem_jp: string;
  choices_jp: Record<string, string>;
  correct_answer: string;
  has_figure: boolean;
  figure: string | null;
  choice_figures?: Record<string, string>;
  terms: string[];
  stem_zh?: string;
  stem_en?: string;
  choices_zh?: Record<string, string>;
  choices_en?: Record<string, string>;
  suspect?: true;
}

/** A `{jp,zh,en}` triple (explanations keep all three, see the layout note). */
export interface ShardText {
  jp: string;
  zh: string;
  en: string;
}

/** An explanation as displayed (QuizExplanation): its texts and its `suspect` flag (the caveat). */
export type ShardExplanation = QuizExplanation;

export interface ExamShard {
  exam_id: string;
  locale: StaticLocale;
  /** id order */
  questions: ShardQuestion[];
}

export interface ExplanationShard {
  exam_id: string;
  /** explChunkOf of every question in it */
  chunk: number;
  /** question id → explanation (questions without one are absent) */
  explanations: Record<string, ShardExplanation>;
}

/** [id, exam_id, topic_id] in corpus order (questions.json order). */
export type QuestionRow = [id: string, examId: string, topicId: string];

export interface QuizIndexFile {
  topics: QuizTopicRef[];
  exams: QuizExamRef[];
  questions: QuestionRow[];
  chumonGroups: ChumonGroup[];
}

export interface UnitMeta {
  /** active-locale title (JP fallback) */
  title: string;
  terms: { id: string; term: string }[];
}

export interface UnitsFile {
  locale: StaticLocale;
  units: Record<string, UnitMeta>;
}

export interface TermCardsFile {
  locale: StaticLocale;
  /** keyed by the term exactly as written in QuizQuestion.terms (buildTermCards) */
  cards: Record<string, TermCard>;
}

export interface SenseiTermsFile {
  locale: StaticLocale;
  shard: string;
  terms: Record<string, SenseiTermContext>;
}

// ---- file names ---------------------------------------------------------------

/**
 * Questions per explanation file. An exam's explanations reach 268 KB gzip in one file. H1-3 measured
 * the practice session's downloads (gzip, all questions answered): 10 per file cuts a 10-question
 * cross-exam or topic-random set from ~650–720 KB of explanations (25 per file: one ~50–100 KB file per
 * answered question, each from another exam) to ~270–320 KB, and costs a whole exam +2–4 % (10 files
 * instead of 4); 290 files instead of 116 (max 45 KB).
 */
export const EXPL_CHUNK = 10;

/** The explanation chunk of a question id (`…-qNNN` → 1 for q001–q010, 2 for q011–q020, …). */
export function explChunkOf(id: string): number {
  return Math.ceil(Number(id.slice(id.lastIndexOf("-q") + 2)) / EXPL_CHUNK);
}

export const SENSEI_SHARDS = "0123456789abcdef".split("");

/** The sensei shard of a termId (`t` + 16 hex digits): its first hex digit. */
export function senseiShardOf(termId: string): string {
  return termId.charAt(1);
}

export const dataPaths = {
  quizIndex: (): string => "/data/quiz/index.json",
  exam: (examId: string, locale: StaticLocale): string => `/data/quiz/${examId}.${locale}.json`,
  explanations: (examId: string, chunk: number): string => `/data/quiz-expl/${examId}-${chunk}.json`,
  today: (locale: StaticLocale): string => `/data/practice/today.${locale}.json`,
  termCards: (locale: StaticLocale): string => `/data/glossary/cards.${locale}.json`,
  units: (locale: StaticLocale): string => `/data/textbook/units.${locale}.json`,
  senseiTerms: (shard: string, locale: StaticLocale): string => `/data/sensei/terms-${shard}.${locale}.json`,
};

/** `<a>.<locale>.json` → [a, locale]; null for any other shape (route params). */
export function parseLocaleFile(file: string): [string, StaticLocale] | null {
  const m = /^(.+)\.(ja|zh|en)\.json$/.exec(file);
  return m ? [m[1]!, m[2] as StaticLocale] : null;
}

// ---- projections (allow-list: fields copied by name) ----------------------------

function letters(rec: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const L of CHOICE_LETTERS) if (Object.prototype.hasOwnProperty.call(rec, L)) out[L] = rec[L]!;
  return out;
}

function text(t: ShardText): ShardText {
  return { jp: t.jp, zh: t.zh, en: t.en };
}

export function projectQuestion(q: QuizQuestion, locale: StaticLocale): ShardQuestion {
  const out: ShardQuestion = {
    id: q.id,
    exam_id: q.exam_id,
    topic_id: q.topic_id,
    category: q.category,
    source_label: q.source_label,
    stem_jp: q.stem_jp,
    choices_jp: letters(q.choices_jp),
    correct_answer: q.correct_answer,
    has_figure: q.has_figure,
    figure: q.figure,
    terms: [...q.terms],
  };
  if (q.choice_figures) out.choice_figures = letters(q.choice_figures);
  if (isSuspect(q)) out.suspect = true;
  const lang = extraLang(locale);
  if (lang === "zh") {
    if (q.stem_zh !== undefined) out.stem_zh = q.stem_zh;
    if (q.choices_zh) out.choices_zh = letters(q.choices_zh);
  } else if (lang === "en") {
    if (q.stem_en !== undefined) out.stem_en = q.stem_en;
    if (q.choices_en) out.choices_en = letters(q.choices_en);
  }
  return out;
}

export function projectExplanation(e: QuizExplanation): ShardExplanation {
  const distractors: Record<string, ShardText> = {};
  for (const L of CHOICE_LETTERS) {
    const d = e.distractors[L];
    if (d) distractors[L] = text(d);
  }
  return {
    suspect: e.suspect === true,
    correct: text(e.correct),
    distractors,
    points: e.points.map(text),
  };
}

export function projectTopic(t: QuizTopicRef): QuizTopicRef {
  return {
    topic_id: t.topic_id,
    category: t.category,
    major_jp: t.major_jp,
    major_zh: t.major_zh,
    major_en: t.major_en,
    medium_jp: t.medium_jp,
    medium_zh: t.medium_zh,
    medium_en: t.medium_en,
    name_jp: t.name_jp,
    question_count: t.question_count,
  };
}

export function projectExam(e: QuizExamRef): QuizExamRef {
  return {
    exam_id: e.exam_id,
    gregorian: e.gregorian,
    wareki: e.wareki,
    season: e.season,
    label_jp: e.label_jp,
    question_count: e.question_count,
  };
}

/** The QuizIndex the pages read (topics + exams), without its provenance header. */
export function quizIndexOf(file: Pick<QuizIndexFile, "topics" | "exams">): Pick<QuizIndex, "topics" | "exams"> {
  return { topics: file.topics, exams: file.exams };
}

// ---- browser-side helpers (pure) ------------------------------------------------

/** A shard explanation as the components take it (a copy). */
export function toExplanation(explanation: ShardExplanation): QuizExplanation {
  const distractors: Record<string, ShardText> = {};
  for (const [L, d] of Object.entries(explanation.distractors)) distractors[L] = text(d);
  return {
    suspect: explanation.suspect,
    correct: text(explanation.correct),
    distractors,
    points: explanation.points.map(text),
  };
}

/**
 * A shard question (+ its explanation shard entry) back in the QuizQuestion shape the components
 * take, with no field the files do not carry (no figure_type; the explanation's suspect flag only,
 * toExplanation) — so what crosses to the client holds no internal field name either (H1-3). The
 * exam shard holds the stem / choices in JP + the page locale only (the question face's translation
 * toggle shows exactly those two); the explanation keeps all three languages (ExplanationPane's
 * switch). Rendering is identical to the loader question for every page locale × displayed
 * language the UI can reach (pinned for all 2,900 by the staticData test).
 */
export function toQuizQuestion(q: ShardQuestion, explanation?: ShardExplanation): QuizQuestion {
  const out: QuizQuestion = { ...q, choices_jp: { ...q.choices_jp }, terms: [...q.terms] };
  if (explanation) out.explanation = toExplanation(explanation);
  return out;
}

/**
 * The question as a server page may hand it to a client component (H1-3, MEDIUM-1): the loader
 * question through the same allow-list projections the static files use, then toQuizQuestion.
 */
export function clientQuestion(q: QuizQuestion, locale: StaticLocale): QuizQuestion {
  return toQuizQuestion(projectQuestion(q, locale), q.explanation ? projectExplanation(q.explanation) : undefined);
}

/** The exam shard a question id lives in (`<examId>-qNNN`). */
export function examOfId(id: string): string {
  return id.slice(0, id.lastIndexOf("-q"));
}

/** Questions by id from the loaded shards, input order; unknown ids dropped (loadQuestionsByIds). */
export function pickQuestions(
  ids: readonly string[],
  shards: readonly ExamShard[],
  explanations: readonly ExplanationShard[] = [],
): QuizQuestion[] {
  const byId = new Map<string, ShardQuestion>();
  for (const s of shards) for (const q of s.questions) byId.set(q.id, q);
  const expl = new Map<string, ShardExplanation>();
  for (const s of explanations) for (const [id, e] of Object.entries(s.explanations)) expl.set(id, e);
  return ids.flatMap((id) => {
    const q = byId.get(id);
    return q ? [toQuizQuestion(q, expl.get(id))] : [];
  });
}

/** buildTermCards(dict, questions, locale) from the locale's cards file. */
export function termCardsFor(
  questions: readonly Pick<QuizQuestion, "terms">[],
  cards: Record<string, TermCard>,
): Record<string, TermCard> {
  const out: Record<string, TermCard> = {};
  for (const q of questions) {
    for (const term of q.terms) {
      if (Object.prototype.hasOwnProperty.call(cards, term)) out[term] = cards[term]!;
    }
  }
  return out;
}

/**
 * The ids the former GET /api/quiz/questions accepted for `topic` (ReviewLauncher): empty
 * segments dropped, repeats deduped (first kept); null where it answered 400 (0 or more than
 * REVIEW_MAX_WRONG ids, an id not QUESTION_ID_RE-shaped, an unknown topic, an id not of that
 * topic). The questions are then
 * pickQuestions(ids, the exam shards of examOfId(id), their explanation chunks).
 */
export function reviewIds(
  topic: string,
  requested: readonly string[],
  index: Pick<QuizIndexFile, "topics" | "questions">,
): string[] | null {
  const ids = [...new Set(requested.filter((id) => id !== ""))];
  if (ids.length === 0 || ids.length > REVIEW_MAX_WRONG) return null;
  if (!ids.every((id) => QUESTION_ID_RE.test(id))) return null;
  if (!index.topics.some((t) => t.topic_id === topic)) return null;
  const inTopic = new Set(index.questions.filter((r) => r[2] === topic).map((r) => r[0]));
  return ids.every((id) => inTopic.has(id)) ? ids : null;
}

/** At most this many term ids per lookup (the former GET /api/sensei/terms' MAX_IDS). */
export const SENSEI_MAX_IDS = 8;

/**
 * The term ids the former GET /api/sensei/terms looked up (fetchTermContexts): empty segments
 * dropped, then null when none or more than SENSEI_MAX_IDS remain (its 400); ids not
 * termId-shaped are skipped, repeats returned once, request order kept. Their files are
 * senseiShardOf(id).
 */
export function senseiTermIds(requested: readonly string[]): string[] | null {
  const ids = requested.filter((id) => id !== "");
  if (ids.length === 0 || ids.length > SENSEI_MAX_IDS) return null;
  return [...new Set(ids.filter(isValidTermId))];
}

/** The term contexts of `ids` (senseiTermIds) from the loaded shard files; ids not in the dictionary skipped. */
export function pickSenseiTerms(ids: readonly string[], files: readonly SenseiTermsFile[]): SenseiTermContext[] {
  const byId = new Map<string, SenseiTermContext>();
  for (const f of files) for (const [id, t] of Object.entries(f.terms)) byId.set(id, t);
  return ids.flatMap((id) => {
    const t = byId.get(id);
    return t ? [t] : [];
  });
}

/** loadSetupIndex(locale): the today index with every topic's terms emptied. */
export function setupFromToday(today: TodayIndex): TodayIndex {
  return { ...today, topicTerms: Object.fromEntries(Object.keys(today.topicTerms).map((k) => [k, []])) };
}
