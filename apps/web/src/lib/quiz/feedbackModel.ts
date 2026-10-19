// D-149 — quiz feedback model (Session 126): categories, record shape and
// request validation. Pure + bundler-safe (imported by the client
// QuizFeedback); the Redis side lives in ./feedback (server only), mirroring
// the quizModel / quizReader split.

export const FEEDBACK_CATEGORIES = [
  "figure_incomplete",
  "figure_wrong",
  "text_error",
  "translation_error",
  "answer_or_explanation",
  "other",
] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_LOCALES = ["ja", "zh", "en"] as const;
export type FeedbackLocale = (typeof FEEDBACK_LOCALES)[number];

export const FEEDBACK_NOTE_MAX = 1000;

/** Quiz question id as in data/ip/quiz/questions.json, e.g. `2016h28h-q033`, `2011h23tokubetsu-q100`. */
export const QUESTION_ID_RE = /^\d{4}[a-z0-9]{1,16}-q\d{3}$/;

export interface FeedbackInput {
  question_id: string;
  locale: FeedbackLocale;
  category: FeedbackCategory;
  note: string;
}

export interface FeedbackRecord extends FeedbackInput {
  id: string;
  status: "open" | "resolved";
  created_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
}

export type ValidationResult =
  | { ok: true; value: FeedbackInput }
  | { ok: false; error: string };

export function validateFeedbackInput(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "body must be a JSON object" };
  }
  const b = raw as Record<string, unknown>;
  if (typeof b.question_id !== "string" || !QUESTION_ID_RE.test(b.question_id)) {
    return { ok: false, error: "invalid question_id" };
  }
  if (!FEEDBACK_LOCALES.includes(b.locale as FeedbackLocale)) {
    return { ok: false, error: `locale must be one of ${FEEDBACK_LOCALES.join("|")}` };
  }
  if (!FEEDBACK_CATEGORIES.includes(b.category as FeedbackCategory)) {
    return { ok: false, error: `category must be one of ${FEEDBACK_CATEGORIES.join("|")}` };
  }
  if (b.note !== undefined && typeof b.note !== "string") {
    return { ok: false, error: "note must be a string" };
  }
  const note = (b.note ?? "").trim();
  if (note.length > FEEDBACK_NOTE_MAX) {
    return { ok: false, error: `note must be ≤ ${FEEDBACK_NOTE_MAX} characters` };
  }
  return {
    ok: true,
    value: {
      question_id: b.question_id,
      locale: b.locale as FeedbackLocale,
      category: b.category as FeedbackCategory,
      note,
    },
  };
}
