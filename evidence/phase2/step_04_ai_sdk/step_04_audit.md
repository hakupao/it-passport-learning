# Step 4 — AI SDK + provider switch + cache wiring audit (POST-D-095)

> Phase 2 Module B Step 4 (per `docs/phase2/PLAN.md` §1 Module B Step 4).
>
> Session 35 Turns 2-3 — scaffold complete (Turn 2 Anthropic-only baseline → Turn 3 D-095 pivot to DeepSeek default + Anthropic switchable); **HARD GATE** pending user `go LLM` for first 2 real DeepSeek calls (promptCacheHitTokens + promptCacheMissTokens measurement → `cache_audit_2026-05-19.md` data point #1).

## 0. D-095 amendment to this audit (Turn 3)

Session 35 Turn 3 user pivot `想使用 deepseek-v4-pro` → slow-pace 4Q ans `a/d/b/a` → **D-095 LOCKED** (partial supersede of D-088 §2.1 + §2.3 + §2.4; retain §2.2 + §2.5 + §2.6). Implementation: `anthropic.ts` deleted pre-commit and replaced with `provider.ts` unified factory + builder + reader. Original Turn 2 Anthropic-only baseline preserved in `vercel_deploy_dpl_9MniAsEGaGeMVKBwzLrRSzRS8zXA.log` (per Rule B append-only spirit). Sections 1-7 below reflect FINAL (POST-D-095) state of Step 4.

## 1. Goal recap (POST-D-095)

Per D-088 §2.3 cache boundary + D-091 §2.2 Phase 2 specific evidence type #1 + **D-095 §2.1+§2.3 (partial supersede)**:

> Active provider = DeepSeek default (via env `LLM_PROVIDER` default unset) with chat/quiz/hover/smoke role matrix mapping to `deepseek-chat` / `deepseek-reasoner`; Anthropic retained as switchable `LLM_PROVIDER=anthropic` path that pins `claude-opus-4-7` per D-088 §2.1 Anthropic-side intent.
>
> Message layout = stable-prefix 3-block `[corpus, instruction, user]` — serves DeepSeek server-side automatic prefix caching AND Anthropic ephemeral block cache (via `providerOptions.anthropic.cacheControl:ephemeral` on the first system block) in one builder; DeepSeek silently ignores the `anthropic.*` namespace.

Step 4 proves the **wiring** works end-to-end for BOTH provider paths:
- Vercel AI SDK `streamText` calls active provider (DeepSeek by default)
- Active provider resolved from env at server cold-start; switch is ops-level not runtime
- Cache usage uniformly captured via `readCacheUsage(providerMetadata)` handling Anthropic + DeepSeek + unknown branches
- Anthropic `cacheControl:ephemeral` markup on corpus block is namespace-isolated; safe to leave for the switch case

The **measurement** (real cache hit on either provider) is deferred to LLM gate — Step 4 does not include cache_audit data points yet.

## 2. Artifacts (POST-D-095)

### 2.1 Source files (new — final state)

| File | LoC | Purpose |
|---|---:|---|
| `apps/web/src/lib/ai/provider.ts` | ~140 | `getActiveProvider()` + `getModel(role, provider?)` + `buildMessagesWithStablePrefix(corpus, instruction, user)` + `readCacheUsage(meta)` + types |
| `apps/web/src/app/api/hello-ai/route.ts` | ~85 | POST handler `runtime=nodejs maxDuration=30` → `warmUp()` + glossary load → stable-prefix messages → `streamText({model: getModel('smoke'), messages, onFinish: log usage})` + `X-LLM-Provider` response header + GET handler advertising active provider |
| `apps/web/src/lib/ai/__tests__/provider.test.ts` | ~190 | 20 unit tests across 4 describe blocks (getActiveProvider 3 / getModel 4 / buildMessagesWithStablePrefix 4 / readCacheUsage 9) |

### 2.2 Deleted pre-commit (D-095 §4.1)

| File | LoC (pre-delete) | Reason |
|---|---:|---|
| `apps/web/src/lib/ai/anthropic.ts` | ~70 | Subsumed into `provider.ts` (model id moved + `buildCachedSystemMessages` → `buildMessagesWithStablePrefix` + `readAnthropicCacheUsage` → `readCacheUsage`) |
| `apps/web/src/lib/ai/__tests__/anthropic.test.ts` | ~85 | 8 tests subsumed and expanded into `provider.test.ts` 20 tests |

**Rule B note**: deletion is **pre-commit refactor of same-session scaffold**, not a failure attempt. The Turn 2 baseline files compiled cleanly, all 8 tests passed, build succeeded — they were superseded by user-driven design pivot, not failure. Both files traceable via git history starting from this commit (since they never landed in any prior commit, only via this session log + audit narrative).

### 2.3 Source files (modified)

| File | Change |
|---|---|
| `apps/web/package.json` | + `"ai": "^6.0.184"` + `"@ai-sdk/anthropic": "^3.0.78"` + `"@ai-sdk/deepseek": "^2.0.35"` |
| `apps/web/pnpm-lock.yaml` | resolves +13 packages cumulative |

### 2.4 Source files (Step 3 baseline — unchanged)

`apps/web/src/lib/data/` 6 files + 3 test files — **0 modified by Step 4**.

## 3. Wiring correctness check (POST-D-095)

### 3.1 Provider matrix

```
LLM_PROVIDER unset / 'deepseek' / 'anything else' → deepseek
                                                    chat   → deepseek-chat
                                                    quiz   → deepseek-reasoner
                                                    hover  → deepseek-chat
                                                    smoke  → deepseek-chat

LLM_PROVIDER='anthropic'                          → anthropic
                                                    all roles → claude-opus-4-7
                                                    (D-088 §2.1 Anthropic-side pin retained)
```

Verified by `provider.test.ts` getActiveProvider 3 tests + getModel 4 tests.

### 3.2 Stable-prefix message layout

Per D-095 §2.3 (Q3=b):
```
[0] role:'system'  content: corpus block       providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } }
[1] role:'system'  content: short instruction  (no providerOptions)
[2] role:'user'    content: per-request input  (no providerOptions)
```

Verified by `provider.test.ts` buildMessagesWithStablePrefix 4 tests (order / placement / providerOptions only-on-msg-0 / multi-line preservation).

DeepSeek silently ignores `providerOptions.anthropic.*` namespace per OpenAI-compatible API contract; Anthropic honours `cacheControl:ephemeral` and creates block cache.

### 3.3 Unified cache usage capture

`readCacheUsage(providerMetadata)` detects provider from metadata keys:
- `providerMetadata.anthropic.{cacheCreationInputTokens, cacheReadInputTokens}` → `provider='anthropic'`, fields populated, `cacheMissInputTokens=null`
- `providerMetadata.deepseek.{promptCacheHitTokens, promptCacheMissTokens}` → `provider='deepseek'`, `cacheReadInputTokens=hit`, `cacheMissInputTokens=miss`, `cacheCreationInputTokens=null`
- Other / undefined → `provider='unknown'`, all fields null

Defensive: non-numeric or undefined token fields → null (not NaN / not undefined). 9 unit tests cover all branches.

### 3.4 Cached content size requirements

- **Anthropic ephemeral cache** minimum 1024 tokens (Opus): corpus block (full glossary JSON ~317 KB ≈ 19,800 tokens by chars/4) ✅ well above threshold.
- **DeepSeek prefix cache** 64-token alignment block size, no explicit minimum: same corpus block ✅ trivially passes alignment.

### 3.5 Route Handler runtime

- `runtime = 'nodejs'` (not Edge) — FsDataSource needs Node `fs.readFile`
- `maxDuration = 30` (seconds) — headroom for cold-start + first prefix-cache write
- `X-LLM-Provider` response header — surfaces active provider for client-side debug

## 4. What this step does NOT prove

- **Real DeepSeek prefix-cache hit**: `promptCacheHitTokens > 0` only observable from second call within DeepSeek's caching window (typically 60+ minutes per docs but exact behavior is server-side). Deferred to LLM gate.
- **Real Anthropic ephemeral hit**: same, 5-minute TTL window. Deferred to LLM gate (optional second-round if switch test desired).
- **Real cost**: per-call $ depends on tokens × provider pricing. Estimated DeepSeek 2 calls < $0.01; Anthropic 2 calls < $0.15.
- **Streaming UX**: types verified; behavior on real provider deferred to LLM gate.

## 5. Wall actual (cumulative Turn 2 + Turn 3)

| Activity | Wall |
|---|---|
| Turn 1 — Round 1 4Q meta + ans (γ tripwire D-094) | ~5 min |
| Turn 2 Batch A — D-094 ADR + tripwire_log | ~10 min |
| Turn 2 Batch B-D — Anthropic-only scaffold + tests + build + lint + Vercel deploy | ~25 min |
| Turn 2 Batch E-F — PLAN + STATE + session log + evidence dump v1 | ~10 min |
| Turn 3 micro-Q — clarify ANTHROPIC_API_KEY gate | ~3 min |
| Turn 3 user pivot — `想使用 deepseek-v4-pro` push-back + Round 2 4Q | ~5 min |
| Turn 3 user ans `a/d/b/a` + hard requirement parse + execute | ~5 min |
| Turn 3 Batch G — D-095 ADR write | ~15 min |
| Turn 3 Batch H — deps install + delete anthropic.ts + write provider.ts + provider.test.ts + update route.ts | ~15 min |
| Turn 3 Batch I — local validate + lint fix-up | ~5 min |
| Turn 3 Batch J — Vercel D-095 deploy | ~2 min |
| Turn 3 Batch K — PLAN + STATE + evidence amend | ~10 min |
| Turn 4 — HARD GATE ask + (post-gate) LLM call + cache_audit + commit + push | (pending) |
| **Subtotal (Turn 1-3, pre-LLM-gate)** | **~110 min** |

PLAN.md §1 estimate for Step 4 = 1 day. Actual pre-LLM ~110 min (still well under 1 day; D-094 §2.2 estimate held — but Turn 3 pivot accounts for ~50 min that wasn't in original baseline). Final Step 4 wall accumulates after LLM gate.

## 6. Sign-off (path α)

- **Writer**: Claude main session (Turns 2-3)
- **Reviewer**: user terminal
  - Turn 1 D-094 4Q: `全部按照你推荐的来` blanket ACK c/c/b/a (2026-05-19)
  - Turn 3 D-095 4Q: `Q1-a，Q2-d，Q3-b，Q4-a。我希望别完全删除anthropic这种可能，变成可以切换的` (2026-05-19) + `请继续作业` propose-first execute ACK
- **Rule D**: ✅ Writer ≠ Reviewer
- **Rule A**: n/a (no LLM rewrite / compression > 50%; corpus block is `JSON.stringify(glossary)` non-LLM data path)
- **Rule B**: 0 failure attempts — Turn 2 scaffold superseded pre-commit by user-driven design pivot (D-095), not failure (clean compile + 36/36 pass + Vercel ✅ before user pivoted)
- **Rule C**: n/a (Phase retro at Phase 2 close; mid-retro at Step 5 + Step 12 per PLAN.md §3)

## 7. HARD GATE checklist (pending user `go LLM` — POST-D-095)

Required (default DeepSeek path per D-095 §2.1):
- [ ] `vercel env add DEEPSEEK_API_KEY preview` (interactive prompt; key masked)
- [ ] `vercel deploy --yes` (redeploy to pick up env)
- [ ] User explicit `go LLM` ACK
- [ ] Run call #1: `curl -X POST https://web-<new-sha>-bojiangs-projects.vercel.app/api/hello-ai` — capture `promptCacheMissTokens` (first call, no prefix cached)
- [ ] Run call #2 (within DeepSeek's caching window): same — capture `promptCacheHitTokens` (second call, prefix hit)
- [ ] `vercel logs <new-url>` → fetch `[hello-ai] {...}` lines for both calls
- [ ] Write `evidence/phase2/step_04_ai_sdk/cache_audit_2026-05-19.md` data point #1 (DeepSeek)

Optional (Anthropic switch verification, additional round):
- [ ] `vercel env add ANTHROPIC_API_KEY preview` (additional key)
- [ ] `vercel env add LLM_PROVIDER preview` (value = `anthropic`)
- [ ] `vercel deploy --yes` (redeploy with new env)
- [ ] Run call #3 + #4 — Anthropic path
- [ ] Append Anthropic data point to `cache_audit_2026-05-19.md` (or separate file)

Final:
- [ ] Commit + push (1 atomic per G3=a)

Estimated cost (DeepSeek 2 calls): **< $0.01 真 billed** — 几乎免费 vs D-090 $5 per-query cap ~500× margin. Cost re-baseline per D-095 §4.2 deferred to Step 5 mid-retro.
