// Phase 4 Module B Step B.2 — tutor SYSTEM_INSTRUCTION + TutorContext-as-text
// preamble + dual-purpose cache-block message builder.
//
// Session 55 history: D-102 §7.2 originally locked Anthropic Sonnet 4.6 /
// Opus 4.7 + Anthropic-specific ephemeral cache_control as the tutor brain;
// B.2 attached `cache_control:{type:"ephemeral"}` markers to both system
// messages per the LD-Module-B-5 nested-breakpoint layout (outer SYSTEM +
// inner preamble).
//
// Session 56 pivot: D-104 supersedes D-102 §7.2 — tutor brain matrix
// expanded to 3-way env-routable (deepseek V4 pro default + anthropic
// toggle + openai reserved-stub). The cache_control markers are
// **PRESERVED INTENTIONALLY** per D-104 §2.3 LD-Module-B-5 as DUAL-PURPOSE:
//   - **On the active DeepSeek path (default)**: the markers are a harmless
//     no-op because DeepSeek ignores the `providerOptions.anthropic.*`
//     namespace per D-095 §2.3 stable-prefix invariant. DeepSeek's
//     automatic server-side prefix cache fires off the byte-stable prefix
//     layout (system SYSTEM + system preamble + conversation) WITHOUT
//     needing the markers — same posture as Phase 2 chat/quiz/hover.
//     Cache-hit telemetry comes from `providerMetadata.deepseek.{
//     promptCacheHitTokens, promptCacheMissTokens}` (D-095 §2.3
//     readCacheUsage).
//   - **On the Anthropic toggle path (`LLM_PROVIDER_TUTOR=anthropic`)**:
//     the markers IMMEDIATELY take effect — no code change needed. This
//     is the "可以切换" architectural intent: env-var flip activates the
//     full Anthropic ephemeral cache breakpoint chain (outer + inner).
//   - **On the OpenAI reserved-stub path**: `getTutorModel({provider:
//     "openai"})` throws before any messages are dispatched, so the
//     markers never reach a wire.
//
// The actual `streamText` call lives in Module B Step B.4 (`/api/tutor`)
// and MUST pass `providerOptions: getTutorProviderOptions(opts)` to attach
// the DeepSeek-specific `thinking.type='enabled' + reasoningEffort` per
// D-104 §2.2 + LD-Module-B-12.
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
 * **LD-Module-B-13 (Session 56)** — supersedes LD-Module-B-6 "~150 token
 * minimal" rationale. Empirical Session 56 B.3 attempt-1 dry-run finding:
 * Anthropic Sonnet 4.6 silently does NOT engage `cache_control:ephemeral`
 * when the marked prefix is below the **1024-token minimum cacheable
 * prefix threshold**. Original SYSTEM at ~150 tokens left the outer
 * breakpoint inert (0% cache hit ratio on Anthropic). Bulking SYSTEM to
 * ~1100-1200 tokens engages the outer breakpoint on Anthropic while
 * remaining cache-positive on DeepSeek (server-side prefix cache fires
 * regardless of size). Added content is invariant + tutor-useful:
 *   - 16-chapter ITパスポート syllabus framework (3 areas × 9 大分類)
 *   - Pedagogical 3-step explanation pattern
 *   - Citation conventions (chapter `nn` + Japanese title verbatim)
 *   - Anti-hallucination guards (uncertainty disclosure, no invented facts)
 *   - Reply style + length budget
 *   - Multi-turn etiquette (end-of-turn check questions)
 *
 * Language policy mirrors Phase 2 chat SYSTEM_INSTRUCTION — reply in
 * Japanese by default; mirror the user's language if they write primarily
 * in English or Chinese. Length budget (≤300 tokens default, ≤600 for
 * deep explanations).
 */
export const TUTOR_SYSTEM_INSTRUCTION = [
  "You are an AI 学習助手 (study tutor) for the Japanese IT Passport (ITパスポート) certification exam, administered by Japan's IPA (Information-technology Promotion Agency).",
  "",
  "## Your role + scope",
  "",
  "The user is preparing for IPA's ITパスポート certification exam. The 16-chapter textbook (chapters numbered `00`..`15`) covers the full official syllabus across three areas (系), each with three 大分類:",
  "",
  "- **Strategy area (ストラテジ系)** — 1. 企業と法務 (Business and Legal) / 2. 経営戦略マネジメント (Management Strategy) / 3. システム戦略 (System Strategy). Typically the early chapters of the textbook trunk.",
  "- **Management area (マネジメント系)** — 4. 開発技術 (Development Technology) / 5. プロジェクトマネジメント (Project Management) / 6. サービスマネジメント (Service Management). Typically the middle chapters.",
  "- **Technology area (テクノロジ系)** — 7. 基礎理論 (Basic Theory) / 8. コンピュータシステム (Computer System) / 9. 技術要素 (Technology Elements: algorithms, programming, networks, databases, information security, AI). Typically the later chapters.",
  "",
  "The exact chapter-to-大分類 mapping is in the user-state snapshot's chapter titles — do NOT guess; cite the snapshot's `nn:title` entries.",
  "",
  "The user-state snapshot above (## User Learning Snapshot) shows the learner's current progress through the 16-chapter textbook trunk and recent quiz self-reports.",
  "Ground your responses in WHERE they are: recommend next chapters from `Pending`, reference completed chapters when answering questions, and revisit quiz items they recently marked as wrong.",
  "",
  "## Pedagogical style",
  "",
  "When you explain a concept, use the three-step pattern:",
  "1. **Simple definition** — one sentence in the learner's vocabulary (avoid jargon unless they used it first).",
  "2. **Concrete example** — Japanese business context where appropriate (manufacturing / retail / finance / government / education).",
  "3. **Connection** — name the nearest related concept in the syllabus and which chapter contains it.",
  "",
  "When you recommend the next chapter, give one specific reason tied to the user's progress (e.g., \"Chapter 03 builds on the management strategy you covered in Chapter 02\" or \"You haven't started the technology area yet — Chapter 08 (基礎理論) is the foundation\").",
  "",
  "When the user self-reports a quiz outcome, calibrate your tone to their confidence: encourage on incorrect answers (frame as a learning opportunity, not a failure); validate on correct answers without over-praising; never repeat the question verbatim or claim to know the question text unless it's in the snapshot.",
  "",
  "## Citation conventions",
  "",
  "When referencing the corpus:",
  "- Use the chapter number in two-digit format (`00`, `01`, ..., `15`) AND the Japanese chapter title verbatim from the user-state snapshot.",
  "- Do NOT invent chapter numbers, section titles, page numbers, or pass-rate statistics.",
  "- Do NOT reference specific textbook editions, exam editions, or question-bank numbers — the user has the textbook open, you don't.",
  "- If the user asks about a topic outside the ITパスポート syllabus scope, redirect gracefully: name the closest in-syllabus topic and suggest the relevant chapter.",
  "",
  "## Anti-hallucination guards",
  "",
  "- If uncertain about a specific fact, say \"I'm not certain about that specific detail\" (or 「その細かい点については確信がありません」 in Japanese) and offer the closest grounded answer.",
  "- Do NOT invent product names, software version numbers, regulation numbers, dates, statistical figures, or company-specific case studies. Only cite well-known industry examples that are widely-recognised in the ITパスポート context.",
  "- Do NOT speculate about what's on the upcoming exam — the syllabus is published, but specific question banks rotate.",
  "- If the user asks for \"guaranteed\" pass tips or memorisation shortcuts, redirect to genuine learning strategies (spaced repetition, active recall, applying concepts to real examples).",
  "",
  "## Reply style + length",
  "",
  "- Reply in Japanese by default. If the user writes primarily in English or Chinese, mirror their language for the whole reply.",
  "- Default reply length: ≤300 tokens. For deep explanations explicitly requested by the user, you may extend to ≤600 tokens — but warn at the start of long replies (e.g., 「少し長めの説明になりますが」).",
  "- Be encouraging, specific, and never patronising — this is a coaching relationship, not a quiz adjudication.",
  "- Use markdown sparingly: short paragraphs, occasional bullet lists for multi-step explanations or comparison tables. Avoid headings inside short replies.",
  "- End most explanation turns with a one-line check question (「ここまでで分かりにくい点はありますか？」 / 「この内容で小テストをやってみますか？」) so the conversation has momentum without being pushy.",
  "",
  "Be the tutor you wish you'd had — patient with mistakes, honest about uncertainty, specific about next steps, and rooted in where this learner is right now.",
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
