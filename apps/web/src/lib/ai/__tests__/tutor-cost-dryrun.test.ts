// Phase 4 Module B Step B.3 — Tutor cost dry-run harness (DeepSeek V4 pro).
//
// Opt-in vitest spec: fires REAL DeepSeek API calls. Gated by env
// `RUN_TUTOR_DRYRUN=1` so the default `pnpm exec vitest run` never sends
// network traffic. Per CLAUDE.md "first LLM API call gate" + Phase 4
// PLAN.md §4 G2 second-half, this gate requires explicit user approval
// (Session 56 Turn 1: `开始 Phase 4 Module B Step B.3`).
//
// What this measures (per D-103 §2.4 + Phase 4 PLAN.md §1 row B.3):
//   - Total input/output tokens per turn + conversation
//   - DeepSeek prefix cache hit / miss tokens (via providerMetadata.deepseek)
//   - Aggregate cache hit ratio (target ≥80% per D-103 §2.4)
//   - Estimated cost per conversation + projected Phase 4 total
//   - Wall time per call + per-conversation
//
// What this validates (D-104 §2.1 default path):
//   - Model: deepseek-v4-pro with thinking.type='enabled' + reasoningEffort:'high'
//   - Cache layout: 2 system messages (SYSTEM + preamble) with anthropic
//     cache_control markers (no-op on DeepSeek per D-095 §2.3 + D-104 §2.3
//     dual-purpose); DeepSeek's automatic prefix cache fires on the
//     byte-stable prefix.
//
// How to run:
//   $ cd apps/web
//   $ RUN_TUTOR_DRYRUN=1 pnpm exec vitest run src/lib/ai/__tests__/tutor-cost-dryrun.test.ts
//
// Evidence output: evidence/phase4/module_b_step_03_cost_dryrun/{results.json, summary.md}

import { describe, it, expect, beforeAll } from "vitest";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { streamText, type ModelMessage } from "ai";
import {
  getTutorModel,
  getTutorProviderOptions,
  readCacheUsage,
} from "../provider";
import { buildTutorMessages } from "../tutorPrompt";
import type { TutorContext } from "@/lib/tutor/tutorContext";
import type { ChapterSummary } from "@/lib/book/chapterScope";

const ENABLED = process.env.RUN_TUTOR_DRYRUN === "1";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

// 16 synthetic chapters mirroring the real corpus' chapter shape.
const MOCK_CHAPTERS: ChapterSummary[] = Array.from({ length: 16 }, (_, i) => {
  const nn = String(i).padStart(2, "0");
  return {
    nn,
    chapterId: `chapter_${nn}`,
    title: `第${i + 1}章 IT分野基礎（模擬）`,
    firstPage: i * 35 + 1,
    lastPage: (i + 1) * 35,
    pageCount: 35,
  };
});

// 10 distinct scenarios covering varying user progress states.
function makeFixture(scenario: number): { label: string; ctx: TutorContext } {
  const completedCount = [0, 1, 3, 8, 15, 10, 5, 0, 12, 16][scenario] ?? 0;
  const inProgressCount = [0, 0, 1, 0, 0, 2, 0, 8, 4, 0][scenario] ?? 0;
  const completed = MOCK_CHAPTERS.slice(0, completedCount);
  const inProgress = MOCK_CHAPTERS.slice(
    completedCount,
    completedCount + inProgressCount,
  );
  const pending = MOCK_CHAPTERS.slice(completedCount + inProgressCount);

  const quizCount = [0, 0, 2, 3, 5, 5, 8, 0, 10, 10][scenario] ?? 0;
  const baseTime = new Date("2026-05-22T10:00:00.000Z").getTime();
  const recentQuiz = Array.from({ length: quizCount }, (_, qi) => ({
    questionId: `page_${String(qi * 7 + 1).padStart(3, "0")}_entity_${
      (qi % 5) + 1
    }`,
    lastAnswered: new Date(baseTime - qi * 60_000).toISOString(),
    correct: qi % 3 !== 0,
  }));

  return {
    label: `s${scenario}-${completedCount}c-${inProgressCount}p-${quizCount}q`,
    ctx: {
      completedChapters: completed,
      inProgressChapters: inProgress,
      pendingChapters: pending,
      recentQuiz,
    },
  };
}

const TURNS = [
  "次に取り組むべき章は何ですか?その理由も教えてください。",
  "その章の主要な概念について、最も大切な3つのポイントを簡潔に教えてください。",
  "学んだことを確認するための短いクイズを1問お願いします。回答後すぐに正解と解説をください。",
];

interface TurnResult {
  scenario: number;
  scenarioLabel: string;
  turn: number;
  userMessage: string;
  assistantTextPreview: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  cachedInputTokens: number | null;
  uncachedInputTokens: number | null;
  cacheHitRatio: number | null;
  durationMs: number;
}

describe.runIf(ENABLED)(
  "Phase 4 B.3 — Tutor cost dry-run (DeepSeek V4 pro)",
  () => {
    beforeAll(() => {
      loadEnvLocal();
    });

    it("preflight — DEEPSEEK_API_KEY is set in env or .env.local", () => {
      const key = process.env.DEEPSEEK_API_KEY;
      expect(typeof key).toBe("string");
      expect(key && key.length > 10).toBe(true);
    });

    it(
      "5 conversations × 3 turns against locked tutor brain; persists evidence JSON incrementally",
      { timeout: 900_000 },
      async () => {
        const allResults: TurnResult[] = [];
        const startTime = Date.now();
        const errors: { scenario: number; turn: number; error: string }[] = [];

        const providerLabel =
          process.env.LLM_PROVIDER_TUTOR === "anthropic"
            ? "anthropic"
            : "deepseek";

        // Persist after every call so a timeout doesn't lose data. The file is
        // overwritten each turn with the running results so partial data
        // always lands at evidence/.../results-{provider}.json.
        const outDir = resolve(
          process.cwd(),
          "..",
          "..",
          "evidence",
          "phase4",
          "module_b_step_03_cost_dryrun",
        );
        if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
        const outPath = resolve(outDir, `results-${providerLabel}.json`);
        const persistIncrementally = (status: string) => {
          const partial = {
            status,
            providerLabel,
            timestamp: new Date().toISOString(),
            callsCompleted: allResults.length,
            errors,
            perTurnResults: allResults,
          };
          writeFileSync(outPath, JSON.stringify(partial, null, 2), "utf-8");
        };

        // Sample size reduced from 10 → 5 to fit within timeout under
        // thinking:high latency (avg ~35s/call × 15 = ~525s budget).
        const SCENARIO_COUNT = 5;
        for (let scenario = 0; scenario < SCENARIO_COUNT; scenario++) {
          const { label, ctx } = makeFixture(scenario);
          const conversation: ModelMessage[] = [];

          for (let turn = 0; turn < TURNS.length; turn++) {
            const userMessage = TURNS[turn]!;
            conversation.push({ role: "user", content: userMessage });
            const messages = buildTutorMessages(ctx, conversation);

            const turnStart = Date.now();
            try {
              // Cast: getTutorProviderOptions returns Record<string, unknown>
              // for ergonomics; streamText wants the stricter JSONObject-keyed
              // SharedV3ProviderOptions. The shape matches at runtime.
              const result = streamText({
                model: getTutorModel(),
                providerOptions:
                  getTutorProviderOptions() as Parameters<
                    typeof streamText
                  >[0]["providerOptions"],
                messages,
              });

              let text = "";
              for await (const chunk of result.textStream) {
                text += chunk;
              }
              const usage = await result.usage;
              const providerMetadata = await result.providerMetadata;
              const cache = readCacheUsage(providerMetadata);
              const durationMs = Date.now() - turnStart;

              const cachedInputTokens = cache.cacheReadInputTokens;
              const uncachedInputTokens = cache.cacheMissInputTokens;
              const totalDenom =
                (cachedInputTokens ?? 0) + (uncachedInputTokens ?? 0);
              const cacheHitRatio =
                totalDenom > 0 ? (cachedInputTokens ?? 0) / totalDenom : null;

              allResults.push({
                scenario,
                scenarioLabel: label,
                turn: turn + 1,
                userMessage,
                assistantTextPreview: text.slice(0, 240),
                inputTokens: usage.inputTokens ?? null,
                outputTokens: usage.outputTokens ?? null,
                totalTokens: usage.totalTokens ?? null,
                cachedInputTokens,
                uncachedInputTokens,
                cacheHitRatio,
                durationMs,
              });

              conversation.push({ role: "assistant", content: text });

              console.log(
                `[B.3 ${providerLabel} ${label} turn ${turn + 1}] in=${
                  usage.inputTokens ?? "?"
                } out=${
                  usage.outputTokens ?? "?"
                } cacheHit=${cachedInputTokens ?? "?"} cacheMiss=${
                  uncachedInputTokens ?? "?"
                } wall=${durationMs}ms`,
              );

              // Persist after every call so timeout/abort doesn't lose data.
              persistIncrementally("running");
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              errors.push({ scenario, turn: turn + 1, error: msg });
              console.error(
                `[B.3 ${label} turn ${turn + 1}] ERROR: ${msg.slice(0, 200)}`,
              );
              break;
            }

            await new Promise((r) => setTimeout(r, 250));
          }
          await new Promise((r) => setTimeout(r, 600));
        }

        const totalDurationMs = Date.now() - startTime;

        // Aggregates
        const totalInputTokens = allResults.reduce(
          (s, r) => s + (r.inputTokens ?? 0),
          0,
        );
        const totalOutputTokens = allResults.reduce(
          (s, r) => s + (r.outputTokens ?? 0),
          0,
        );
        const totalCachedInput = allResults.reduce(
          (s, r) => s + (r.cachedInputTokens ?? 0),
          0,
        );
        const totalUncachedInput = allResults.reduce(
          (s, r) => s + (r.uncachedInputTokens ?? 0),
          0,
        );
        const denom = totalCachedInput + totalUncachedInput;
        const aggCacheHitRatio = denom > 0 ? totalCachedInput / denom : 0;

        // Per-turn cache hit ratio breakdown (turn 1 = expected miss, 2+ = expected hit)
        const turnBreakdown = [1, 2, 3].map((turnNum) => {
          const rows = allResults.filter((r) => r.turn === turnNum);
          const cached = rows.reduce(
            (s, r) => s + (r.cachedInputTokens ?? 0),
            0,
          );
          const uncached = rows.reduce(
            (s, r) => s + (r.uncachedInputTokens ?? 0),
            0,
          );
          const d = cached + uncached;
          return {
            turn: turnNum,
            calls: rows.length,
            cachedInputTokens: cached,
            uncachedInputTokens: uncached,
            cacheHitRatio: d > 0 ? cached / d : null,
            avgInputTokens:
              rows.length > 0
                ? Math.round(
                    rows.reduce((s, r) => s + (r.inputTokens ?? 0), 0) /
                      rows.length,
                  )
                : 0,
            avgOutputTokens:
              rows.length > 0
                ? Math.round(
                    rows.reduce((s, r) => s + (r.outputTokens ?? 0), 0) /
                      rows.length,
                  )
                : 0,
            avgDurationMs:
              rows.length > 0
                ? Math.round(
                    rows.reduce((s, r) => s + r.durationMs, 0) / rows.length,
                  )
                : 0,
          };
        });

        // Provider-aware pricing — V4 pro discounted (active until 2026-05-31)
        // or Anthropic Sonnet 4.6 (per D-103 §1 baseline + Anthropic docs).
        const v4ProDiscountDeadline = Date.UTC(2026, 4, 31, 15, 59);
        const v4ProDiscountActive = Date.now() < v4ProDiscountDeadline;
        const pricingPerMillion =
          providerLabel === "anthropic"
            ? {
                inputCacheMiss: 3.0,
                inputCacheHit: 0.3, // ~10% of input rate
                inputCacheWrite: 3.75, // 25% premium over miss
                output: 15.0,
              }
            : {
                inputCacheMiss: v4ProDiscountActive ? 0.435 : 1.74,
                inputCacheHit: v4ProDiscountActive ? 0.003625 : 0.145,
                inputCacheWrite: 0, // DeepSeek doesn't charge cache_write per Context7 models.json
                output: v4ProDiscountActive ? 0.87 : 3.48,
              };
        const inputMissRatePerToken =
          pricingPerMillion.inputCacheMiss / 1_000_000;
        const inputHitRatePerToken =
          pricingPerMillion.inputCacheHit / 1_000_000;
        const outputRatePerToken = pricingPerMillion.output / 1_000_000;

        const inputMissCostUsd = totalUncachedInput * inputMissRatePerToken;
        const inputHitCostUsd = totalCachedInput * inputHitRatePerToken;
        const outputCostUsd = totalOutputTokens * outputRatePerToken;
        const totalCostUsd =
          inputMissCostUsd + inputHitCostUsd + outputCostUsd;

        // Phase 4 projection per D-103 §1 envelope (~140 calls total)
        const callsThisRun = allResults.length;
        const projectedPhase4TotalCalls = 140;
        const projectedPhase4CostUsd =
          callsThisRun > 0
            ? (totalCostUsd / callsThisRun) * projectedPhase4TotalCalls
            : 0;

        const summary = {
          phase4Step: "B.3 cost dry-run",
          status: "complete",
          providerLabel,
          timestamp: new Date().toISOString(),
          gate: "G2 second-half user-approved 2026-05-22 Session 56",
          model: {
            id:
              providerLabel === "anthropic"
                ? "claude-sonnet-4-6"
                : "deepseek-v4-pro",
            providerOptionsApplied: getTutorProviderOptions(),
          },
          cacheLayout: {
            d104Sec23: "two-marker dual-purpose (no-op on DeepSeek, active on Anthropic toggle)",
            d095Sec23: "DeepSeek server-side automatic prefix cache",
            d103Sec24CacheHitTarget: 0.8,
          },
          pricing: {
            providerLabel,
            sourceContext7Snapshot: "2026-05-22",
            v4ProDiscountActive,
            v4ProDiscountDeadline: "2026-05-31T15:59:00Z",
            inputCacheMissRatePerMillion: pricingPerMillion.inputCacheMiss,
            inputCacheHitRatePerMillion: pricingPerMillion.inputCacheHit,
            inputCacheWriteRatePerMillion: pricingPerMillion.inputCacheWrite,
            outputRatePerMillion: pricingPerMillion.output,
          },
          aggregates: {
            totalApiCalls: callsThisRun,
            totalInputTokens,
            totalOutputTokens,
            totalCachedInputTokens: totalCachedInput,
            totalUncachedInputTokens: totalUncachedInput,
            aggregateCacheHitRatio: aggCacheHitRatio,
            d103Sec24Met: aggCacheHitRatio >= 0.8,
            totalDurationMs,
            avgDurationPerCallMs:
              callsThisRun > 0 ? Math.round(totalDurationMs / callsThisRun) : 0,
          },
          turnBreakdown,
          cost: {
            inputCacheMissCostUsd: inputMissCostUsd,
            inputCacheHitCostUsd: inputHitCostUsd,
            outputCostUsd,
            totalCostUsd,
            d103CapUsd: 15,
            d103TripwireUsd: 10,
            headroomMultiplier:
              totalCostUsd > 0 ? 15 / totalCostUsd : Infinity,
          },
          phase4Projection: {
            estimatedTotalCalls: projectedPhase4TotalCalls,
            estimatedTotalCostUsd: projectedPhase4CostUsd,
            estimatedTotalUnderCapUsd: 15 - projectedPhase4CostUsd,
            estimatedTotalHeadroomMultiplier:
              projectedPhase4CostUsd > 0
                ? 15 / projectedPhase4CostUsd
                : Infinity,
          },
          errors,
          perTurnResults: allResults,
        };

        // Final persist (overwrites the incremental running checkpoints with
        // the full summary at outPath defined at it() top).
        writeFileSync(outPath, JSON.stringify(summary, null, 2), "utf-8");

        console.log("\n========== B.3 DRY-RUN SUMMARY ==========");
        console.log(
          `Model: deepseek-v4-pro (thinking=enabled, reasoningEffort=high)`,
        );
        console.log(
          `API calls: ${callsThisRun} / ${SCENARIO_COUNT * TURNS.length} expected`,
        );
        console.log(`Total input tokens: ${totalInputTokens.toLocaleString()}`);
        console.log(`Total output tokens: ${totalOutputTokens.toLocaleString()}`);
        console.log(
          `  cached input: ${totalCachedInput.toLocaleString()} | uncached: ${totalUncachedInput.toLocaleString()}`,
        );
        console.log(
          `Aggregate cache hit ratio: ${(aggCacheHitRatio * 100).toFixed(1)}%  ${
            aggCacheHitRatio >= 0.8 ? "✓" : "✗"
          } (D-103 §2.4 target ≥80%)`,
        );
        console.log("Per-turn breakdown:");
        for (const t of turnBreakdown) {
          const hitPct = t.cacheHitRatio !== null
            ? `${(t.cacheHitRatio * 100).toFixed(1)}%`
            : "n/a";
          console.log(
            `  turn ${t.turn}: calls=${t.calls} hit=${hitPct} avgIn=${t.avgInputTokens} avgOut=${t.avgOutputTokens} avgWall=${t.avgDurationMs}ms`,
          );
        }
        console.log(
          `Estimated cost (this run): $${totalCostUsd.toFixed(
            5,
          )}  ${
            providerLabel === "deepseek" && v4ProDiscountActive
              ? "(V4 pro 75% discount)"
              : `(${providerLabel} pricing)`
          }`,
        );
        console.log(
          `Phase 4 total projection (~140 calls): $${projectedPhase4CostUsd.toFixed(4)} / $15 cap = ${(15 / projectedPhase4CostUsd).toFixed(1)}× headroom`,
        );
        console.log(
          `Wall time: ${(totalDurationMs / 1000).toFixed(1)}s  (${Math.round(
            totalDurationMs / callsThisRun,
          )}ms/call avg)`,
        );
        if (errors.length > 0) {
          console.log(`\nErrors encountered: ${errors.length}`);
          for (const e of errors) {
            console.log(
              `  scenario ${e.scenario} turn ${e.turn}: ${e.error.slice(0, 120)}`,
            );
          }
        }
        console.log(`Evidence: ${outPath}`);
        console.log("==========================================\n");

        // Assertions — hard safety bounds, not D-103 §2.4 cache target
        // (cache target is informational; even if missed, B.3 just flags
        // for Module B revision per PLAN.md row B.3 disposition).
        expect(callsThisRun).toBeGreaterThan(0);
        expect(totalCostUsd).toBeLessThan(2.0); // hard upper bound for dry-run safety
        expect(errors.length).toBeLessThan(callsThisRun); // not 100% failure
      },
    );
  },
);
