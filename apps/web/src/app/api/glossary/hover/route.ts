// Phase 2 Step 7 — POST /api/glossary/hover (term-hover scope, stateless single-turn SSE).
//
// Session 39 4Q-locked design (a/a/a/a):
//   Q1=a route   = POST + SSE (reuses buildChatSseResponse from chat.ts)
//   Q2=a model   = `deepseek-chat` per D-095 §2.1 (hover role)
//   Q3=a retro   = Module B 收官 + chars/N decision bundled at Step 7 close
//   Q4=a pacing  = Batch A-G straight-through; commit + push as close gates
//
// D-097 firewall: gated by middleware Basic Auth (curl `-u claude:<pass>`).
// D-095 stable-prefix: glossary contextBlock → HOVER_SYSTEM_INSTRUCTION → fixed prompt.
// D-088 §2.3 cache discipline: term-hover scope yields a DIFFERENT prefix per
//   surface_jp (single-entry payload), so cross-surface cache hits are NOT
//   expected. Intra-surface repeat calls SHOULD hit DeepSeek's automatic
//   prefix cache at ≥50% rate per the N=4 historical data series.
//
// Runtime = nodejs (FsDataSource reads JSON via fs); maxDuration = 30s
//   (target TTFT ≤7s per PLAN.md §1 γ PoC; 30s ceiling matches Steps 5/6).

import { streamText } from "ai";
import { getDataSource, warmUp } from "@/lib/data";
import { assembleTermHover } from "@/lib/data/assembleScope";
import {
  buildMessagesWithStablePrefix,
  getActiveProvider,
  getModel,
  getPhase2ProviderOptions,
  readCacheUsage,
} from "@/lib/ai/provider";
import { buildChatSseResponse } from "@/lib/ai/chat";
import {
  HOVER_SYSTEM_INSTRUCTION,
  HOVER_USER_PROMPT,
  validateHoverRequestBody,
} from "@/lib/ai/hover";
import { STREAM_CONFIG } from "@/lib/ai/retry";
import { evaluateCacheTripwire, recordTripwireEvent } from "@/lib/ai/tripwire";
import { recordCapEvent } from "@/lib/ai/cap";

export const runtime = "nodejs";
export const maxDuration = 30;

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "invalid JSON body");
  }

  const parsed = validateHoverRequestBody(rawBody);
  if (!parsed.ok) {
    return jsonError(400, parsed.error);
  }

  await warmUp();
  const ds = getDataSource();

  let scope;
  try {
    scope = await assembleTermHover(ds, parsed.body.surface_jp);
  } catch (err) {
    // assembleTermHover throws when surface_jp is not in glossary_index OR
    // when the resolved id is missing from glossary entries (index/glossary
    // out of sync — operational not user error, but still a 404 from the
    // caller's perspective). 500 reserved for unexpected exceptions.
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("not found") || message.includes("out of sync")) {
      return jsonError(404, message);
    }
    return jsonError(500, `assembleTermHover failed: ${message}`);
  }

  const provider = getActiveProvider();
  const result = streamText({
    model: getModel("hover"),
    maxRetries: STREAM_CONFIG.maxRetries,
    // D-105 §2.1 — V4 flash thinking disabled = legacy `deepseek-chat` parity
    // for light single-pass term explain. Anthropic SDK ignores `deepseek`.
    providerOptions: getPhase2ProviderOptions("hover"),
    messages: buildMessagesWithStablePrefix(
      scope.contextBlock,
      HOVER_SYSTEM_INSTRUCTION,
      HOVER_USER_PROMPT,
    ),
    onFinish: ({ usage, providerMetadata }) => {
      console.log(
        "[glossary/hover]",
        JSON.stringify({
          provider,
          scope: "term-hover",
          surface_jp: parsed.body.surface_jp,
          glossary_id: scope.meta.glossary_id,
          tokenEstimate: scope.tokenEstimate,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          providerMetadata,
        }),
      );
      const tripwire = evaluateCacheTripwire({
        usage: readCacheUsage(providerMetadata),
        totalInputTokens: typeof usage.inputTokens === "number"
          ? usage.inputTokens
          : null,
        route: "/api/glossary/hover",
      });
      if (tripwire !== null) recordTripwireEvent(tripwire);
      void recordCapEvent({
        route: "/api/glossary/hover",
        role: "hover",
        usage: {
          inputTokens:
            typeof usage.inputTokens === "number" ? usage.inputTokens : null,
          outputTokens:
            typeof usage.outputTokens === "number" ? usage.outputTokens : null,
        },
        cache: readCacheUsage(providerMetadata),
      });
    },
  });

  return buildChatSseResponse({
    textStream: result.textStream,
    usagePromise: result.usage,
    providerMetadataPromise: result.providerMetadata as PromiseLike<
      Record<string, unknown> | undefined
    >,
    provider,
  });
}

export async function GET(): Promise<Response> {
  const provider = getActiveProvider();
  const expectedKey =
    provider === "anthropic" ? "ANTHROPIC_API_KEY" : "DEEPSEEK_API_KEY";
  return new Response(
    `POST { "surface_jp": "<glossary key, e.g. プロセッサ>" } to this endpoint.\n` +
      `SSE response: text deltas as { type: 'delta', text }, then a final\n` +
      `{ type: 'usage', cacheCreationInputTokens, cacheReadInputTokens, ... } frame,\n` +
      `then [DONE].\n` +
      `Active provider (env LLM_PROVIDER): ${provider}\n` +
      `Active hover model: ${
        provider === "anthropic"
          ? "claude-opus-4-7"
          : "deepseek-v4-flash (thinking disabled)"
      }\n` +
      `Required env var on this deploy: ${expectedKey}\n` +
      `D-097 firewall: request must include Basic Auth header.\n` +
      `D-095 stable-prefix: corpus (single glossary entry) → instruction → fixed prompt.\n` +
      `D-089 §2.3 scope: 1 glossary entry resolved via glossary_index.surface_jp_to_id.\n` +
      `D-085 §2.4 mode: term-hover (smallest payload ~80-200 tok; target TTFT ≤7s).\n`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-LLM-Provider": provider,
      },
    },
  );
}
