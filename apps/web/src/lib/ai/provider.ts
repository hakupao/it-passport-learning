// D-095 — Vercel AI SDK provider factory + stable-prefix message builder +
// unified cache usage reader. Default Phase 2 provider = DeepSeek; Anthropic
// retained as switchable via env `LLM_PROVIDER=anthropic`. Supersedes the
// prior `anthropic.ts` helpers (deleted pre-commit per D-095 §4.1).
//
// D-095 supersedes (partial) D-088 §2.1 (single-model pin → switchable matrix)
// + §2.3 (cache_control:ephemeral → stable-prefix reorder applied to both
// providers via providerOptions.anthropic namespacing) + §2.4 (1-retry no
// fallback retained within active provider; inter-provider auto-fallback NOT
// in scope). D-088 §2.2 (Hybrid form) + §2.5 (tripwire framework) + §2.6
// retained.
//
// D-104 (Session 56) supersedes D-102 §7.2 for the `tutor` role only — tutor
// brain matrix expanded to 3-way env-routable (deepseek default + anthropic
// toggle + openai reserved-stub). Tutor uses its own env `LLM_PROVIDER_TUTOR`
// per D-104 §2.5 (separate from `LLM_PROVIDER`).
//
// D-105 (Session 57) executes the legacy DeepSeek model ID migration for Phase
// 2 routes in this commit (B.4): `deepseek-chat` + `deepseek-reasoner` → all
// shift to `deepseek-v4-flash` with route-handler-level
// `providerOptions.deepseek.thinking.type` injection per D-105 §2.1 table.
// The model-ID change is bottom-of-stack per D-105 §2.2 — D-085 §2.4 frozen
// surface (modal lifecycle / SSE format / SYSTEM bytes / wire shape /
// stable-prefix layout) is preserved unchanged. See `getPhase2ProviderOptions`
// for the thinking.type dispatch.

import { anthropic } from "@ai-sdk/anthropic";
import { deepseek } from "@ai-sdk/deepseek";
import type { JSONValue, LanguageModel, ModelMessage } from "ai";

/**
 * Local JSON-object shape matching the AI SDK's `SharedV3ProviderOptions =
 * Record<string, JSONObject>` constraint without requiring `@ai-sdk/
 * provider-utils` as a direct dependency (it is a transitive of `ai` /
 * `@ai-sdk/anthropic` / `@ai-sdk/deepseek`, not a direct package.json entry).
 * Inner values are JSON-serialisable per the AI SDK's wire contract.
 */
type ProviderOptionsShape = Record<string, Record<string, JSONValue>>;

export type ProviderKind = "deepseek" | "anthropic";

/**
 * D-104 §2.1 tutor brain matrix providers. Superset of `ProviderKind` —
 * adds `"openai"` slot for the ChatGPT plan 代理 path (reserved-stub in
 * Phase 4 v1; implementation deferred to Phase 5 per LD-Module-B-11).
 */
export type TutorProvider = "deepseek" | "anthropic" | "openai";

/**
 * D-085 modes + `smoke` for /api/hello-ai health checks + `tutor` for the
 * Phase 4 AI 学習助手 surface. Per D-104 §2.6 LD-Module-B-2 the tutor role
 * is **env-routable** via `LLM_PROVIDER_TUTOR` (separate from the
 * `LLM_PROVIDER` env that controls Phase 2 chat/quiz/hover/smoke).
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
 * Phase 4 tutor brain model IDs — D-104 §2.1 locked matrix.
 *
 * **DeepSeek path (default, only active in Phase 4 v1)**:
 *   - V4 pro with `thinking.type='enabled'` + `reasoningEffort='high'`
 *     default (per D-104 §2.2 + LD-Module-B-12). Escalation bumps
 *     `reasoningEffort` to `'max'` on the same model — NOT a model swap
 *     like the Anthropic path.
 *   - The `thinking` + `reasoningEffort` parameters are passed via
 *     `streamText({ providerOptions: getTutorProviderOptions(opts) })`
 *     at the call site (NOT baked into the LanguageModel object).
 *   - V4 pro is anthropic-interface-compatible at the DeepSeek base URL
 *     (per Context7 2026-05-22 verification), but we route through
 *     `@ai-sdk/deepseek` for cache-metadata + telemetry consistency with
 *     existing Phase 2 paths.
 *
 * **Anthropic path (toggle, key not required in dev)**:
 *   - Default = Sonnet 4.6 (instruction-following + cost).
 *   - Escalation = Opus 4.7 (harder reasoning) — model swap per legacy
 *     D-102 §7.2 escalation pattern.
 *   - Both paths attach the `cache_control:ephemeral` markers via the
 *     message-builder (`buildTutorMessages` in `tutorPrompt.ts`).
 *
 * **OpenAI path (reserved-stub)**:
 *   - LD-Module-B-11: no SDK dep, no API key required for dev. Setting
 *     `LLM_PROVIDER_TUTOR=openai` throws at runtime with a Phase-5-reserve
 *     message. Implementation lands in D-106 candidate when the ChatGPT
 *     plan 代理 endpoint + auth are provided.
 */
const DEEPSEEK_TUTOR_DEFAULT_MODEL_ID = "deepseek-v4-pro";
const ANTHROPIC_TUTOR_DEFAULT_MODEL_ID = "claude-sonnet-4-6";
const ANTHROPIC_TUTOR_ESCALATION_MODEL_ID = "claude-opus-4-7";

/**
 * Roles that participate in the `LLM_PROVIDER` env-routed Phase 2 matrix.
 * The `tutor` role is intentionally excluded — it has its own routing
 * via `LLM_PROVIDER_TUTOR` per D-104 §2.5 (separate concerns; Phase 2 and
 * tutor may want different providers).
 *
 * D-104 §2.6 LD-Module-B-4 note: this Exclude is preserved even though
 * tutor's default provider is now DeepSeek — the rationale is that tutor
 * has its own selector (`getTutorModel`) with `thinking` + `reasoningEffort`
 * passthrough that doesn't belong in the simple per-role model-ID table.
 */
type DeepseekRole = Exclude<ModelRole, "tutor">;

/**
 * DeepSeek per-role model matrix.
 *
 * **Original D-095 §2.1 (pre-migrate) values** (preserved here as a comment
 * trail for the D-105 supersede record):
 *   chat   → deepseek-chat       (V3.2 base, general)
 *   quiz   → deepseek-reasoner   (R1 base, reasoning)
 *   hover  → deepseek-chat
 *   smoke  → deepseek-chat
 *
 * **Post D-105 §2.1 migrate (this commit, Session 57 B.4)** — all four
 * roles shift to `deepseek-v4-flash`. The thinking-mode behavior that
 * previously came from picking `deepseek-chat` (non-thinking) vs
 * `deepseek-reasoner` (thinking) is now expressed via the per-role
 * `providerOptions.deepseek.thinking.type` field (see
 * `getPhase2ProviderOptions`):
 *   chat   → v4-flash + thinking.type='disabled'   (legacy non-thinking parity)
 *   quiz   → v4-flash + thinking.type='enabled'    (legacy thinking parity)
 *           + reasoningEffort='high'
 *   hover  → v4-flash + thinking.type='disabled'
 *   smoke  → v4-flash + thinking.type='disabled'
 *
 * Per Context7 DeepSeek API change log (verified 2026-05-22 Session 56
 * Turn 5): legacy `deepseek-chat` mapped to V4 flash non-thinking and
 * `deepseek-reasoner` mapped to V4 flash thinking. So this migrate is a
 * pricing/behavior-neutral substitution that resolves the **D-095 §2.5(ε)
 * tripwire FIRE** (legacy IDs deprecate 2026-07-24) without altering
 * Phase 2 surface behavior per D-105 §2.2 / D-085 §2.4 frozen contract.
 *
 * `tutor` is NOT in this table per D-104 §2.6 LD-Module-B-4 — see
 * `getTutorModel` for the env-routable matrix (V4 pro tier).
 */
const DEEPSEEK_MODEL_BY_ROLE: Record<DeepseekRole, string> = {
  chat: "deepseek-v4-flash",
  quiz: "deepseek-v4-flash",
  hover: "deepseek-v4-flash",
  smoke: "deepseek-v4-flash",
};

/**
 * D-105 §2.1 per-role thinking-mode dispatch for the Phase 2 DeepSeek path.
 *
 * Returns the `providerOptions` object to pass to `streamText` so the V4
 * flash model behaves as the legacy alias did:
 *   - `chat`/`hover`/`smoke` → thinking disabled (legacy `deepseek-chat`
 *     parity; cheaper + cache-stable + no extra reasoning latency)
 *   - `quiz` → thinking enabled + reasoningEffort='high' (legacy
 *     `deepseek-reasoner` parity; high effort matches the prior R1 depth)
 *
 * The Anthropic path is untouched by D-105 — Anthropic continues to use
 * `claude-opus-4-7` for Phase 2 routes (the LLM_PROVIDER=anthropic toggle
 * remains valid). Callers should therefore only attach these options when
 * `getActiveProvider() === "deepseek"`; on the Anthropic path passing an
 * empty `providerOptions` is correct.
 *
 * Tutor role is NOT supported here — use `getTutorProviderOptions` instead.
 *
 * **LD-Module-B-15 (Session 57)** — thinking.type field lives at the
 * call-site `providerOptions.deepseek.thinking.type`, NOT baked into the
 * LanguageModel object (mirrors the tutor path symmetry per D-104 §2.2).
 * This keeps `getModel(role)` a pure model factory and isolates the
 * thinking-mode delta to one place per route handler.
 */
export function getPhase2ProviderOptions(
  role: DeepseekRole,
): ProviderOptionsShape {
  if (role === "quiz") {
    return {
      deepseek: {
        thinking: { type: "enabled" },
        reasoningEffort: "high",
      },
    };
  }
  return {
    deepseek: {
      thinking: { type: "disabled" },
    },
  };
}

/** Resolve active Phase 2 provider from env. Default = `deepseek` per D-095 §2.1. */
export function getActiveProvider(): ProviderKind {
  return process.env.LLM_PROVIDER === "anthropic" ? "anthropic" : "deepseek";
}

/**
 * Resolve the active tutor provider from env per D-104 §2.5. Default =
 * `deepseek` (LD-Module-B-10). `=anthropic` toggles to Sonnet/Opus path;
 * `=openai` selects the reserved-stub (throws at `getTutorModel` time).
 * Any other value (or unset) → `deepseek`.
 */
export function getActiveTutorProvider(): TutorProvider {
  const v = process.env.LLM_PROVIDER_TUTOR;
  if (v === "anthropic") return "anthropic";
  if (v === "openai") return "openai";
  return "deepseek";
}

/**
 * Tutor model selector — D-104 §2.1 3-way env-routable.
 *
 * Default = DeepSeek V4 pro (LD-Module-B-12); Anthropic Sonnet 4.6 / Opus 4.7
 * available via `LLM_PROVIDER_TUTOR=anthropic` or explicit `provider` arg;
 * OpenAI slot is reserved-stub per LD-Module-B-11.
 *
 * **Escalation semantics differ by provider** per D-104 §2.2:
 *   - DeepSeek: same model (V4 pro), bumps `reasoningEffort` from `high` →
 *     `max` via `getTutorProviderOptions`. The LanguageModel returned here
 *     is identical regardless of `escalate`; the call-site
 *     `providerOptions` carries the effort delta.
 *   - Anthropic: model swap from Sonnet 4.6 → Opus 4.7 (legacy D-102 §7.2
 *     escalation pattern preserved).
 *
 * Callers using DeepSeek **MUST** also pass `getTutorProviderOptions(opts)`
 * to the `streamText({ providerOptions })` field, otherwise the thinking
 * mode + reasoning effort won't activate.
 */
export interface GetTutorModelOptions {
  /**
   * Bumps reasoning depth. On DeepSeek = `reasoningEffort: 'max'` (same
   * model); on Anthropic = Opus 4.7 model swap. Defaults to false. See
   * D-102 §7.2 + D-104 §2.2 for the escalation criterion (user explicitly
   * requests harder reasoning OR retry after a low-confidence prior turn).
   */
  escalate?: boolean;
  /**
   * Explicit provider override. Defaults to `getActiveTutorProvider()`
   * (which reads `LLM_PROVIDER_TUTOR` env). Useful for tests + the future
   * Module C tutor UI that may expose a per-call provider toggle.
   */
  provider?: TutorProvider;
}

export function getTutorModel(
  options: GetTutorModelOptions = {},
): LanguageModel {
  const provider = options.provider ?? getActiveTutorProvider();

  if (provider === "openai") {
    // LD-Module-B-11: OpenAI slot is reserved interface-only in Phase 4 v1.
    // Implementation deferred to Phase 5 (D-106 candidate) when the
    // ChatGPT plan 代理 endpoint + auth are provided.
    throw new Error(
      "[D-104 LD-Module-B-11] tutor provider 'openai' is reserved for Phase 5 (ChatGPT plan 代理 implementation deferred). " +
        "Set LLM_PROVIDER_TUTOR=deepseek (default) or =anthropic to proceed, or unset LLM_PROVIDER_TUTOR for the default path.",
    );
  }

  if (provider === "anthropic") {
    const modelId = options.escalate
      ? ANTHROPIC_TUTOR_ESCALATION_MODEL_ID
      : ANTHROPIC_TUTOR_DEFAULT_MODEL_ID;
    return anthropic(modelId);
  }

  // provider === "deepseek" — DEFAULT path. Same model regardless of
  // escalate; the reasoningEffort delta lives in providerOptions.
  return deepseek(DEEPSEEK_TUTOR_DEFAULT_MODEL_ID);
}

/**
 * Provider-options builder for the tutor `streamText` call site — D-104
 * §2.2 thinking + reasoningEffort passthrough for the DeepSeek path.
 *
 * Usage:
 * ```ts
 * const result = streamText({
 *   model: getTutorModel(opts),
 *   providerOptions: getTutorProviderOptions(opts),
 *   messages: buildTutorMessages(ctx, conversation),
 * });
 * ```
 *
 * On DeepSeek: returns `{ deepseek: { thinking: {type:'enabled'},
 * reasoningEffort: 'high' | 'max' } }`. On Anthropic: returns `{}` — the
 * cache_control markers attached to messages by `buildTutorMessages` are
 * sufficient; no top-level providerOptions needed. On OpenAI (stub): also
 * `{}` though `getTutorModel` would throw before reaching this call.
 */
export function getTutorProviderOptions(
  options: GetTutorModelOptions = {},
): ProviderOptionsShape {
  const provider = options.provider ?? getActiveTutorProvider();

  if (provider === "deepseek") {
    return {
      deepseek: {
        thinking: { type: "enabled" },
        reasoningEffort: options.escalate ? "max" : "high",
      },
    };
  }

  // Anthropic + OpenAI: no top-level providerOptions delta from this
  // helper. (Anthropic cache_control is attached at the message level;
  // OpenAI would never reach this point because getTutorModel throws.)
  return {};
}

/**
 * Construct the LanguageModel for the given role on the given (or active)
 * provider. The `tutor` role uses its own env-routable selector per D-104
 * §2.1 (ignores the `provider` arg passed here — that arg is for the
 * Phase 2 `LLM_PROVIDER` matrix only). To override the tutor provider,
 * call `getTutorModel({ provider: ... })` directly.
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
    // The AI SDK Anthropic provider exposes `cacheCreationInputTokens` at
    // the top level (per AnthropicMessageMetadata interface) but the
    // matching `cacheReadInputTokens` only lives nested under
    // `usage.cache_read_input_tokens` (snake_case from the raw Anthropic
    // API response). Empirical verification Session 56 anthropic-debug
    // diagnostic — call 1 returned providerMetadata.anthropic.usage =
    // { cache_read_input_tokens: 1284, ... } while the top-level
    // cacheReadInputTokens field was missing entirely. We read both
    // sources for robustness against future SDK shape changes.
    const nestedUsage = anth.usage as Record<string, unknown> | undefined;
    const cacheRead =
      numericOrNull(anth.cacheReadInputTokens) ??
      numericOrNull(nestedUsage?.cache_read_input_tokens);
    const cacheCreate =
      numericOrNull(anth.cacheCreationInputTokens) ??
      numericOrNull(nestedUsage?.cache_creation_input_tokens);
    return {
      provider: "anthropic",
      cacheCreationInputTokens: cacheCreate,
      cacheReadInputTokens: cacheRead,
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
