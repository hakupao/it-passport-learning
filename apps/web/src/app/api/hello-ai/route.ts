// Phase 2 Step 4 — /api/hello-ai smoke endpoint per D-088 §2.3 + D-095 §2.1+§2.3.
//
// Wiring proven end-to-end:
//   - Vercel AI SDK `streamText` against the active provider (env LLM_PROVIDER:
//     default DeepSeek `deepseek-chat`; switch to Anthropic `claude-opus-4-7`
//     via LLM_PROVIDER=anthropic). Provider factory at `@/lib/ai/provider`.
//   - D-095 §2.3 stable-prefix message layout (corpus→instruction→user) —
//     serves DeepSeek server-side automatic prefix caching AND Anthropic
//     ephemeral block cache (via providerOptions.anthropic namespace) at the
//     same time, in one builder.
//   - Cache usage captured uniformly via `readCacheUsage(providerMetadata)`
//     in the `onFinish` callback, surfaced in lambda stdout for `vercel logs`.
//
// HARD GATE: this endpoint costs real $ once `DEEPSEEK_API_KEY` (default path)
// or `ANTHROPIC_API_KEY` (switched path) is set. Until then, POST returns
// HTTP 500 from the SDK and no money is spent. The endpoint is harmless to
// deploy without a key.
//
// Use Node.js runtime (not Edge) — FsDataSource reads JSON via Node `fs`.

import { streamText } from "ai";
import { getDataSource, warmUp } from "@/lib/data";
import {
  buildMessagesWithStablePrefix,
  getActiveProvider,
  getModel,
  getPhase2ProviderOptions,
  readCacheUsage,
} from "@/lib/ai/provider";
import { STREAM_CONFIG } from "@/lib/ai/retry";
import { evaluateCacheTripwire, recordTripwireEvent } from "@/lib/ai/tripwire";
import { recordCapEvent } from "@/lib/ai/cap";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_INSTRUCTION = [
  "You are a helper for Japanese IT Passport exam learners.",
  "The corpus block above is the full trilingual (jp+zh+en) glossary.",
  "Use it as ground truth for term translations.",
  "If the user says 'ping' as a smoke test, reply with the single word: ok.",
  "Otherwise reply in Japanese unless the user writes in English/Chinese.",
].join("\n");

export async function POST(): Promise<Response> {
  await warmUp();
  const ds = getDataSource();
  const glossary = await ds.loadGlossary();

  // Largest stable block goes first per D-095 §2.3.
  const corpusBlock = JSON.stringify(glossary);

  const provider = getActiveProvider();
  const result = streamText({
    model: getModel("smoke"),
    maxRetries: STREAM_CONFIG.maxRetries,
    // D-105 §2.1 — V4 flash thinking disabled = legacy `deepseek-chat`
    // smoke-check parity. Anthropic SDK ignores the deepseek namespace.
    providerOptions: getPhase2ProviderOptions("smoke"),
    messages: buildMessagesWithStablePrefix(
      corpusBlock,
      SYSTEM_INSTRUCTION,
      "ping",
    ),
    onFinish: ({ usage, providerMetadata }) => {
      const cacheUsage = readCacheUsage(providerMetadata);
      console.log(
        "[hello-ai]",
        JSON.stringify({
          provider,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          cacheProvider: cacheUsage.provider,
          cacheCreationInputTokens: cacheUsage.cacheCreationInputTokens,
          cacheReadInputTokens: cacheUsage.cacheReadInputTokens,
          cacheMissInputTokens: cacheUsage.cacheMissInputTokens,
        }),
      );
      const tripwire = evaluateCacheTripwire({
        usage: cacheUsage,
        totalInputTokens: typeof usage.inputTokens === "number"
          ? usage.inputTokens
          : null,
        route: "/api/hello-ai",
      });
      if (tripwire !== null) recordTripwireEvent(tripwire);
      void recordCapEvent({
        route: "/api/hello-ai",
        role: "smoke",
        usage: {
          inputTokens:
            typeof usage.inputTokens === "number" ? usage.inputTokens : null,
          outputTokens:
            typeof usage.outputTokens === "number" ? usage.outputTokens : null,
        },
        cache: cacheUsage,
      });
    },
  });

  return result.toTextStreamResponse({
    headers: {
      "X-LLM-Provider": provider,
    },
  });
}

export async function GET(): Promise<Response> {
  const provider = getActiveProvider();
  const expectedKey =
    provider === "anthropic" ? "ANTHROPIC_API_KEY" : "DEEPSEEK_API_KEY";
  return new Response(
    `POST to this endpoint to send a 'ping' to the active LLM provider.\n` +
      `Active provider (env LLM_PROVIDER): ${provider}\n` +
      `Required env var on this deploy: ${expectedKey}\n` +
      `D-095 stable-prefix message layout is applied (corpus → system → user).\n`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-LLM-Provider": provider,
      },
    },
  );
}
