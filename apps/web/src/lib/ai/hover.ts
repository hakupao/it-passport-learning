// Phase 2 Step 7 — request validator + system instruction for /api/glossary/hover.
//
// Session 39 4Q-locked design (Q1=a / Q2=a / Q3=a / Q4=a):
//   Q1=a route shape = POST + SSE (reuses buildChatSseResponse from chat.ts)
//   Q2=a model       = `deepseek-chat` per D-095 §2.1 (hover/smoke = deepseek-chat);
//                      sidesteps Session 38 R1 empty-delta finding by design
//   Q3=a retro       = Module B 收官 + chars/N decision bundled at Step 7 close
//   Q4=a pacing      = Batch A-G straight-through; close gates wait commit/push
//
// Input contract per D-089 §2.3 assembleTermHover(ds, surface_jp):
//   POST body = `{ surface_jp: "プロセッサ" }` resolved via
//   IndexV2.glossary_index.surface_jp_to_id → loadGlossary().entries.find(id).
//
// D-097 firewall: `/api/glossary/hover` is matcher-covered by middleware Basic Auth.
// D-095 stable-prefix: glossary entry contextBlock → instruction → fixed prompt.
// D-085 §2.4: hover model role = `deepseek-chat` (short factual lookup).
// D-088 §2.3 cache discipline: hover scope yields a DIFFERENT prefix per
//   surface_jp (single-entry payload), so cross-surface cache hits are NOT
//   expected (per-surface creation event each call). Within a single surface_jp,
//   the prefix is stable so repeat calls SHOULD hit the cache.

export interface HoverRequestBody {
  surface_jp: string;
}

export type HoverBodyValidation =
  | { ok: true; body: HoverRequestBody }
  | { ok: false; error: string };

/**
 * Hard cap on surface_jp length — defends against pathological inputs.
 * Real surfaces in the v1.0.3 glossary cap out at ~40 chars; 256 leaves
 * ample headroom for future certs without admitting attack payloads.
 */
export const SURFACE_JP_MAX_LENGTH = 256;

export function validateHoverRequestBody(raw: unknown): HoverBodyValidation {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "request body must be a JSON object" };
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.surface_jp !== "string") {
    return { ok: false, error: "surface_jp must be a string" };
  }
  if (obj.surface_jp.length === 0) {
    return { ok: false, error: "surface_jp must be a non-empty string" };
  }
  if (obj.surface_jp.length > SURFACE_JP_MAX_LENGTH) {
    return {
      ok: false,
      error: `surface_jp exceeds ${SURFACE_JP_MAX_LENGTH} character limit`,
    };
  }
  return {
    ok: true,
    body: { surface_jp: obj.surface_jp },
  };
}

/**
 * Hover system instruction. Caller wires it as the 2nd system message via
 * `buildMessagesWithStablePrefix(contextBlock, HOVER_SYSTEM_INSTRUCTION, ...)`.
 *
 * The corpus block (1st system) carries one glossary entry per D-089 §2.3
 * (assembleTermHover output: {jp, zh, en} + definition trilingual fields +
 * kana_helper + first_page + cross_refs).
 *
 * The user message slot carries a fixed prompt — hover is a server-driven
 * tooltip explanation, not multi-turn. Output target ~50-150 tokens to fit
 * the ≤7s TTFT goal documented in PLAN.md §1 γ PoC.
 */
export const HOVER_SYSTEM_INSTRUCTION = [
  "You are a popover tooltip writer for Japanese IT Passport",
  "(ITパスポート) exam learners.",
  "The corpus block above contains exactly ONE glossary entry with its",
  "trilingual surface (jp/zh/en), trilingual definition, optional",
  "kana_helper, and first-page reference. Use it as the single source of",
  "truth — do not invent facts not grounded in the entry.",
  "",
  "Write a CONCISE popover-sized explanation (target ≤120 tokens) with:",
  "1. 一行で要点 (one-line gist in Japanese).",
  "2. 中文での解説 (one short sentence in Simplified Chinese clarifying",
  "   the concept for non-native learners).",
  "3. English gloss (short sentence; mirror the en field's terminology).",
  "",
  "If kana_helper.reading is present, surface it once in the Japanese line",
  "(e.g. 「プロセッサ（reading: プロセッサ）」). Keep total reply tight",
  "— this is a tooltip, not a lecture.",
].join("\n");

/** Fixed user-slot prompt for hover — server-driven, not client text. */
export const HOVER_USER_PROMPT =
  "Write a concise trilingual popover explanation for the term above.";
