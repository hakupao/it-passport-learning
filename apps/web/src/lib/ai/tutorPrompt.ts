// Phase 4 Module B Step B.2 — tutor SYSTEM_INSTRUCTION + TutorContext-as-text
// preamble + Anthropic ephemeral cache-block message builder.
//
// D-102 §7.2 locks Anthropic Sonnet 4.6 (default) / Opus 4.7 (escalation) as
// the tutor brain, with prompt caching mandatory per D-103 §2.4 (≥80% input-
// token cache-hit ratio target). This module produces the stable prefix and
// attaches the `cache_control: { type: "ephemeral" }` markers; the actual
// `streamText` call lives in Module B Step B.4 (`/api/tutor`).
//
// Architecture (cache layout):
//   [0] system  — TUTOR_SYSTEM_INSTRUCTION (invariant across users + sessions)
//                 attached cache_control:ephemeral  ← outer cache breakpoint
//   [1] system  — formatTutorPreamble(ctx) (per-user, stable within session)
//                 attached cache_control:ephemeral  ← inner cache breakpoint
//   [2..N] conversation messages (the only variable suffix per turn)
//
// Two breakpoints give Anthropic's nested-prefix cache the option to hit on
// just the SYSTEM_INSTRUCTION portion when the user's progress changes mid-
// session (preamble bytes drift → inner cache miss, outer cache still hits),
// AND to hit on the full prefix when progress is stable (both hit).
//
// This is a pure builder — no I/O, no API call. Module B Step B.3 cost dry-
// run is the first turn that exercises the real Anthropic endpoint and is
// gated on explicit user approval per CLAUDE.md.

import type { ModelMessage } from "ai";
import type { TutorContext } from "@/lib/tutor/tutorContext";

/**
 * Phase 4 tutor persona + grounding contract.
 *
 * IMPORTANT — byte-stability invariant (D-088 §2.3 / D-095 §2.3 mirror):
 * this constant is the cache key for the outer prompt-cache breakpoint.
 * Any edit that changes its byte content will invalidate every existing
 * Anthropic ephemeral cache entry (5-min TTL absorbs this naturally on
 * the next call, but the change SHOULD be intentional). The vitest
 * snapshot in `__tests__/tutorPrompt.test.ts` locks the current text to
 * catch accidental drift.
 *
 * Language policy mirrors Phase 2 chat SYSTEM_INSTRUCTION — reply in
 * Japanese by default; mirror the user's language if they write primarily
 * in English or Chinese. Length budget (≤300 tokens) is looser than Phase
 * 2 chat's 200-token cap because tutoring exchanges sometimes need to
 * walk through a topic; Module B Step B.3 cost dry-run will verify the
 * cap is workable under the D-103 \$15 envelope.
 */
export const TUTOR_SYSTEM_INSTRUCTION = [
  "You are an AI 学習助手 (study tutor) for the Japanese IT Passport (ITパスポート) certification exam.",
  "",
  "The user-state snapshot above (## User Learning Snapshot) shows the learner's current progress through the 16-chapter textbook and recent quiz self-reports.",
  "Ground your responses in WHERE they are: recommend next chapters from `Pending`, reference completed chapters when answering questions, and revisit quiz items they recently marked as wrong.",
  "",
  "When citing the corpus, use the chapter number (nn) and the Japanese title verbatim from the textbook. Do not invent topics outside the IT Passport syllabus.",
  "",
  "Reply in Japanese by default. If the user writes primarily in English or Chinese, mirror their language. Keep replies focused (≤300 tokens) unless the user asks for depth. Be encouraging, specific, never patronising — this is a coaching relationship.",
].join("\n");

/**
 * Project a `TutorContext` to its stable text form for the Anthropic prompt
 * preamble. Deterministic — same input always produces byte-identical
 * output (snapshot-test-friendly + cache-friendly).
 *
 * Layout:
 *   ## User Learning Snapshot
 *
 *   Total chapters: N
 *
 *   ### Completed (count)
 *   - nn: title
 *   ...
 *
 *   ### In progress (count)
 *   ...
 *
 *   ### Pending (count)
 *   ...
 *
 *   ### Recent quiz attempts (count)
 *   - ISO timestamp | question_id | correct|wrong
 *   ...
 *
 * Empty buckets render as `(none)` so the structure stays consistent across
 * cold / warm states — the bucket headings always appear, the tutor can
 * count on them.
 */
export function formatTutorPreamble(ctx: TutorContext): string {
  const total =
    ctx.completedChapters.length +
    ctx.inProgressChapters.length +
    ctx.pendingChapters.length;

  const lines: string[] = [];
  lines.push("## User Learning Snapshot");
  lines.push("");
  lines.push(`Total chapters: ${total}`);
  lines.push("");

  lines.push(`### Completed (${ctx.completedChapters.length})`);
  if (ctx.completedChapters.length === 0) {
    lines.push("(none)");
  } else {
    for (const c of ctx.completedChapters) {
      lines.push(`- ${c.nn}: ${c.title}`);
    }
  }
  lines.push("");

  lines.push(`### In progress (${ctx.inProgressChapters.length})`);
  if (ctx.inProgressChapters.length === 0) {
    lines.push("(none)");
  } else {
    for (const c of ctx.inProgressChapters) {
      lines.push(`- ${c.nn}: ${c.title}`);
    }
  }
  lines.push("");

  lines.push(`### Pending (${ctx.pendingChapters.length})`);
  if (ctx.pendingChapters.length === 0) {
    lines.push("(none)");
  } else {
    for (const c of ctx.pendingChapters) {
      lines.push(`- ${c.nn}: ${c.title}`);
    }
  }
  lines.push("");

  lines.push(`### Recent quiz attempts (${ctx.recentQuiz.length})`);
  if (ctx.recentQuiz.length === 0) {
    lines.push("(none)");
  } else {
    for (const q of ctx.recentQuiz) {
      lines.push(
        `- ${q.lastAnswered} | ${q.questionId} | ${q.correct ? "correct" : "wrong"}`,
      );
    }
  }

  return lines.join("\n");
}

/**
 * Compose the tutor's ModelMessage[] stable prefix + conversation suffix.
 *
 * Cache layout (D-103 §2.4 mandatory ephemeral cache):
 *   [0] system  TUTOR_SYSTEM_INSTRUCTION   cache_control: ephemeral  (outer)
 *   [1] system  formatTutorPreamble(ctx)   cache_control: ephemeral  (inner)
 *   [2..]       ...conversation
 *
 * Two breakpoints because Anthropic supports up to 4 nested cache_control
 * markers (longest-matching-prefix wins): outer hits whenever
 * SYSTEM_INSTRUCTION is byte-identical (= every tutor call), inner hits
 * whenever preamble is also byte-identical (= every turn of a session in
 * which the user did NOT just complete a chapter / self-report a quiz). The
 * 5-minute TTL covers a typical tutoring sitting.
 *
 * The conversation arg is `ModelMessage[]` (already converted from
 * UIMessage[] by the caller via `convertToModelMessages` — same posture as
 * Phase 2 chat route at `apps/web/src/app/api/chat/route.ts`).
 */
export function buildTutorMessages(
  ctx: TutorContext,
  conversation: ModelMessage[],
): ModelMessage[] {
  return [
    {
      role: "system",
      content: TUTOR_SYSTEM_INSTRUCTION,
      providerOptions: {
        anthropic: { cacheControl: { type: "ephemeral" } },
      },
    },
    {
      role: "system",
      content: formatTutorPreamble(ctx),
      providerOptions: {
        anthropic: { cacheControl: { type: "ephemeral" } },
      },
    },
    ...conversation,
  ];
}
