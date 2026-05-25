// Phase 2 Step 6 — request validator + system instruction for /api/quiz/explain.
//
// Session 38 4Q-locked design (Q1=a / Q2=a / Q3=a / Q4=a):
//   Q1=a scope = question (page + entity pin per LOCKED D-089 §2.3; the 4Q
//        "chapter context" phrasing soft-deferred to the locked ADR shape;
//        documented as Drift correction in session-38 log)
//   Q2=a input = `{question_id: string}` resolved via IndexV2.entity_by_id
//   Q3=a SSE response, reusing buildChatSseResponse from chat.ts
//   Q4=a Step 6 core first; chars/3 calibration + D-098 §2.2 v1.1 amend at close
//
// D-097 firewall: `/api/quiz/explain` is matcher-covered by middleware Basic Auth.
// D-095 stable-prefix: question contextBlock → instruction → fixed user prompt.
// D-085 §2.4: quiz model role = `deepseek-reasoner` (R1) per provider.ts matrix.

export interface QuizExplainRequestBody {
  question_id: string;
  locale?: string;
}

export type QuizExplainBodyValidation =
  | { ok: true; body: QuizExplainRequestBody }
  | { ok: false; error: string };

/** Hard cap on question_id length — defends against pathological inputs. */
export const QUESTION_ID_MAX_LENGTH = 128;

export function validateQuizExplainRequestBody(
  raw: unknown,
): QuizExplainBodyValidation {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "request body must be a JSON object" };
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.question_id !== "string") {
    return { ok: false, error: "question_id must be a string" };
  }
  if (obj.question_id.length === 0) {
    return { ok: false, error: "question_id must be a non-empty string" };
  }
  if (obj.question_id.length > QUESTION_ID_MAX_LENGTH) {
    return {
      ok: false,
      error: `question_id exceeds ${QUESTION_ID_MAX_LENGTH} character limit`,
    };
  }
  const locale = typeof obj.locale === "string" ? obj.locale : undefined;
  return {
    ok: true,
    body: { question_id: obj.question_id, locale },
  };
}

/**
 * Quiz Explain system instruction. Caller wires it as the 2nd system message
 * via `buildMessagesWithStablePrefix(contextBlock, QUIZ_SYSTEM_INSTRUCTION, ...)`.
 *
 * The corpus block (1st system) carries the page + entity pin per D-089 §2.3.
 * The user message slot carries a fixed prompt — quiz explain is server-driven,
 * not multi-turn (Q3=a stateless single-turn SSE).
 */
const JA_ENTRY = { lang: "Japanese", headings: ["問題の要点", "各選択肢の判定", "正答の理由"] as [string, string, string] };
const REPLY_LANGUAGE: Record<string, { lang: string; headings: [string, string, string] }> = {
  ja: JA_ENTRY,
  zh: { lang: "Chinese (Simplified)", headings: ["题目要点", "各选项判定", "正确答案的理由"] },
  en: { lang: "English", headings: ["Key Point", "Choice Analysis", "Correct Answer Rationale"] },
};

export function getQuizSystemInstruction(locale?: string): string {
  const { lang, headings } = REPLY_LANGUAGE[locale ?? "ja"] ?? JA_ENTRY;
  return [
    "You are a tutor for Japanese IT Passport (ITパスポート) exam learners.",
    "The corpus block above contains a single exam question with its page-level",
    "context (other entities on the same page: section text, tables, figures).",
    "Use it as the single source of truth — do not invent facts not grounded in",
    "the corpus block.",
    "",
    "Structure your reply as:",
    `1. ${headings[0]} (one-line restatement of the question).`,
    `2. ${headings[1]} (walk every choice; mark correct/incorrect and justify).`,
    `3. ${headings[2]} (why the correct answer is correct, grounded in the corpus).`,
    "",
    `Reply in ${lang}. Keep Japanese terms in their original form where appropriate.`,
    "Keep the reply concise (≤600 tokens).",
  ].join("\n");
}

export const QUIZ_SYSTEM_INSTRUCTION = getQuizSystemInstruction("ja");

/** Fixed user-slot prompt for quiz explain — server-driven, not client text. */
export const QUIZ_EXPLAIN_USER_PROMPT =
  "Explain this exam question. Walk through every choice, then justify the correct answer.";
