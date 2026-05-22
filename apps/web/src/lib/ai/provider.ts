// D-095 — Vercel AI SDK provider factory + stable-prefix message builder +
// unified cache usage reader. Default provider = DeepSeek; Anthropic retained
// as switchable via env `LLM_PROVIDER=anthropic`. Supersedes the prior
// `anthropic.ts` helpers (deleted pre-commit per D-095 §4.1).
//
// D-095 supersedes (partial) D-088 §2.1 (single-model pin → switchable matrix)
// + §2.3 (cache_control:ephemeral → stable-prefix reorder applied to both
// providers via providerOptions.anthropic namespacing) + §2.4 (1-retry no
// fallback retained within active provider; inter-provider auto-fallback NOT
// in scope). D-088 §2.2 (Hybrid form) + §2.5 (tripwire framework) + §2.6
// retained.

import { anthropic } from "@ai-sdk/anthropic";
import { deepseek } from "@ai-sdk/deepseek";
import type { LanguageModel, ModelMessage } from "ai";

export type ProviderKind = "deepseek" | "anthropic";

/**
 * D-085 modes + `smoke` for /api/hello-ai health checks + `tutor` for the
 * Phase 4 AI 学習助手 surface (D-102 §7.2 lock — pinned to Anthropic
 * regardless of LLM_PROVIDER env).
 */
export type ModelRole = "chat" | "quiz" | "hover" | "smoke" | "tutor";

/**
 * Anthropic-side single-model pin per D-088 §2.1 (preserved when provider
 * switches to anthropic; D-095 does NOT supersede that intent on the
 * Anthropic path — only adds a provider-switch layer above it). Used by
 * chat / quiz / hover / smoke roles when LLM_PROVIDER=anthropic.
 */
const ANTHROPIC_MODEL_ID = "claude-opus-4-7";

/**
 * Phase 4 tutor brain — D-102 §7.2 locked model pair:
 *   - default = `claude-sonnet-4-6` (instruction-following + cost)
 *   - escalation = `claude-opus-4-7` (harder reasoning fallback)
 *
 * Escalation criterion (D-102 §7.2): caller passes `{ escalate: true }`
 * when the user explicitly asks for harder reasoning OR a prior Sonnet turn
 * gave a low-confidence / "I'm not sure" response and the user retries. The
 * tutor surface (Module C) wires the escalate flag; this module just
 * exposes the typed selector. Both IDs are anthropic-only — the tutor role
 * intentionally ignores LLM_PROVIDER (D-103 §2.4 mandatory ephemeral cache
 * is anthropic-specific; DeepSeek's automatic prefix cache uses a different
 * mechanism and is not the tutor path).
 */
const ANTHROPIC_TUTOR_DEFAULT_MODEL_ID = "claude-sonnet-4-6";
const ANTHROPIC_TUTOR_ESCALATION_MODEL_ID = "claude-opus-4-7";

/**
 * Roles that participate in the LLM_PROVIDER env-routed matrix. The `tutor`
 * role is intentionally excluded — it's anthropic-pinned per D-102 §7.2 and
 * has its own selector below.
 */
type DeepseekRole = Exclude<ModelRole, "tutor">;

/**
 * DeepSeek per-role model matrix per D-095 §2.1 + Q2=d 混搭：
 *   chat   → deepseek-chat       (V3.2 base, general)
 *   quiz   → deepseek-reasoner   (R1 base, reasoning)
 *   hover  → deepseek-chat       (V3.2 base, light)
 *   smoke  → deepseek-chat       (V3.2 base, health check)
 *
 * `deepseek-v4-pro` is NOT a callable API model string as of 2026-05-19
 * (verified via api-docs.deepseek.com Context7 query); D-095 §2.5(ε)
 * DeepSeek-side mirror tripwire covers future V4 graduation. The `tutor`
 * role intentionally does NOT appear here — see `getTutorModel`.
 */
const DEEPSEEK_MODEL_BY_ROLE: Record<DeepseekRole, string> = {
  chat: "deepseek-chat",
  quiz: "deepseek-reasoner",
  hover: "deepseek-chat",
  smoke: "deepseek-chat",
};

/** Resolve active provider from env. Default = `deepseek` per D-095 §2.1. */
export function getActiveProvider(): ProviderKind {
  return process.env.LLM_PROVIDER === "anthropic" ? "anthropic" : "deepseek";
}

/**
 * Tutor model selector — anthropic-pinned per D-102 §7.2.
 *
 * Default = Sonnet 4.6 (cost-efficient, strong instruction-following).
 * Escalation = Opus 4.7 (harder reasoning) when `opts.escalate === true`.
 * Per D-103 §2.4 ephemeral cache is MANDATORY on the tutor SYSTEM + preamble
 * prefix; the cache-control attachment is the caller's responsibility (see
 * `lib/ai/tutorPrompt.ts buildTutorMessages`).
 */
export interface GetTutorModelOptions {
  /**
   * When true, return the Opus 4.7 escalation model instead of the default
   * Sonnet 4.6. Defaults to false. See D-102 §7.2 for the escalation
   * criterion (user explicitly requests harder reasoning OR retry after a
   * low-confidence Sonnet turn).
   */
  escalate?: boolean;
}

export function getTutorModel(
  options: GetTutorModelOptions = {},
): LanguageModel {
  const modelId = options.escalate
    ? ANTHROPIC_TUTOR_ESCALATION_MODEL_ID
    : ANTHROPIC_TUTOR_DEFAULT_MODEL_ID;
  return anthropic(modelId);
}

/**
 * Construct the LanguageModel for the given role on the given (or active)
 * provider. The `tutor` role is anthropic-pinned (D-102 §7.2) and ignores
 * the `provider` arg — callers that need the escalation model must use
 * `getTutorModel({ escalate: true })` directly.
 */
export function getModel(
  role: ModelRole,
  provider: ProviderKind = getActiveProvider(),
): LanguageModel {
  if (role === "tutor") {
    return getTutorModel();
  }
  if (provider === "anthropic") {
    return anthropic(ANTHROPIC_MODEL_ID);
  }
  return deepseek(DEEPSEEK_MODEL_BY_ROLE[role]);
}

/**
 * Build messages with a stable-prefix layout per D-095 §2.3 (Q3=b):
 *
 *   [0] system  — corpus block (largest, most stable; e.g. full glossary JSON)
 *                 attached `providerOptions.anthropic.cacheControl: ephemeral`
 *                 — Anthropic honours it, DeepSeek ignores `anthropic.*`
 *                 namespace, both leveraging the stable prefix for their
 *                 respective caching strategies.
 *   [1] system  — short per-session instruction (stable across calls)
 *   [2] user    — per-request user message (the only variable suffix)
 *
 * This shape simultaneously serves:
 *   - DeepSeek server-side automatic prefix caching (stable prefix maximises
 *     `promptCacheHitTokens` on the 2nd+ call within a session)
 *   - Anthropic ephemeral block cache (5-min TTL; explicit per `cache_control`
 *     marker on the first system message)
 *   - D-088 §2.2 Hybrid form retained (no change to per-mode form decisions)
 */
export function buildMessagesWithStablePrefix(
  corpusBlock: string,
  systemInstruction: string,
  userMessage: string,
): ModelMessage[] {
  return [
    {
      role: "system",
      content: corpusBlock,
      providerOptions: {
        anthropic: { cacheControl: { type: "ephemeral" } },
      },
    },
    {
      role: "system",
      content: systemInstruction,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];
}

/**
 * Unified cache usage report. Different providers report different fields;
 * this shape normalises them so callers can log a single structure.
 *
 *   - Anthropic populates `cacheCreationInputTokens` + `cacheReadInputTokens`
 *     (block-level ephemeral); `cacheMissInputTokens` is null.
 *   - DeepSeek populates `cacheReadInputTokens` (from `promptCacheHitTokens`)
 *     + `cacheMissInputTokens` (from `promptCacheMissTokens`);
 *     `cacheCreationInputTokens` is null (no explicit creation event in the
 *     automatic prefix-cache model).
 *   - On unrecognised shapes, `provider` is `"unknown"` and all fields null.
 */
export interface CacheUsageReport {
  provider: ProviderKind | "unknown";
  cacheCreationInputTokens: number | null;
  cacheReadInputTokens: number | null;
  cacheMissInputTokens: number | null;
}

function numericOrNull(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

export function readCacheUsage(
  providerMetadata: Record<string, unknown> | undefined,
): CacheUsageReport {
  if (!providerMetadata) {
    return {
      provider: "unknown",
      cacheCreationInputTokens: null,
      cacheReadInputTokens: null,
      cacheMissInputTokens: null,
    };
  }
  const anth = providerMetadata.anthropic as
    | Record<string, unknown>
    | undefined;
  if (anth) {
    return {
      provider: "anthropic",
      cacheCreationInputTokens: numericOrNull(anth.cacheCreationInputTokens),
      cacheReadInputTokens: numericOrNull(anth.cacheReadInputTokens),
      cacheMissInputTokens: null,
    };
  }
  const ds = providerMetadata.deepseek as Record<string, unknown> | undefined;
  if (ds) {
    return {
      provider: "deepseek",
      cacheCreationInputTokens: null,
      cacheReadInputTokens: numericOrNull(ds.promptCacheHitTokens),
      cacheMissInputTokens: numericOrNull(ds.promptCacheMissTokens),
    };
  }
  return {
    provider: "unknown",
    cacheCreationInputTokens: null,
    cacheReadInputTokens: null,
    cacheMissInputTokens: null,
  };
}
