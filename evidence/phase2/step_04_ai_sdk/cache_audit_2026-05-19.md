# Phase 2 Step 4 — Cache hit rate audit data point #1 (DeepSeek baseline)

> Phase 2 specific evidence type #1 per D-091 §2.2 (Cache hit rate audit 第一周 retro tripwire input)
>
> First real LLM call evidence for Phase 2 — verifies D-095 §2.3 stable-prefix layout effectiveness on DeepSeek server-side automatic prefix caching + D-088 §2.3 cache boundary design.

| 字段 | 值 |
|---|---|
| Date | 2026-05-19 |
| Session | 35 Turn 7 (LLM gate execute) |
| Provider | DeepSeek (default per D-095 §2.1, env `LLM_PROVIDER` unset) |
| Model | `deepseek-chat` (smoke role per D-095 §2.1 matrix) |
| Endpoint | `POST /api/hello-ai` |
| Deploy | `dpl_45RWexSpH5PSu23dboxBeLimq72E` preview (`https://web-6ucf4itkl-bojiangs-projects.vercel.app`) |
| Auth | Vercel deployment protection bypass token (default preview SSO bypass) |
| Real cost | **$0.017 真 billed** (2 calls) |

---

## 1. Calls

### Call #1 — cache miss baseline

| Field | Value |
|---|---|
| Timestamp | 2026-05-19 12:55:45 UTC (21:55:45 JST) |
| HTTP status | 200 |
| Response body | `ok` |
| Response header `x-llm-provider` | `deepseek` |
| `inputTokens` | 57,993 |
| `outputTokens` | 1 |
| `totalTokens` | 57,994 |
| `cacheProvider` (unified) | `deepseek` |
| `cacheCreationInputTokens` | `null` (DeepSeek does not report explicit creation) |
| `cacheReadInputTokens` (mapped from `promptCacheHitTokens`) | **0** (no prefix cached yet) |
| `cacheMissInputTokens` (mapped from `promptCacheMissTokens`) | **57,993** (100% miss) |
| AI SDK warning | "System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks." (deliberate per D-095 §2.3 multi-system block + providerOptions namespacing; non-fatal) |

### Call #2 — cache hit (within DeepSeek caching window)

| Field | Value |
|---|---|
| Timestamp | 2026-05-19 12:56:06 UTC (21:56:06 JST; **~21 seconds after call #1**) |
| HTTP status | 200 |
| Response body | `ok` |
| Response header `x-llm-provider` | `deepseek` |
| `inputTokens` | 57,993 (identical payload) |
| `outputTokens` | 1 |
| `totalTokens` | 57,994 |
| `cacheProvider` | `deepseek` |
| `cacheCreationInputTokens` | `null` |
| `cacheReadInputTokens` | **57,984** |
| `cacheMissInputTokens` | **9** |
| AI SDK warning | same as call #1 |

---

## 2. Cache hit rate analysis

### 2.1 Headline

**Call #2 prefix cache hit rate = 57,984 / 57,993 = 99.98%** 🟢

### 2.2 Breakdown

- `cacheReadInputTokens` = 57,984 → cached prefix successfully reused
- `cacheMissInputTokens` = 9 → 9 tokens uncached, likely the variable user message `"ping"` + 64-token alignment block remainder per DeepSeek docs
- Cumulative across both calls: 57,993 + 9 = 58,002 "fresh" tokens; 57,984 "cached" tokens; **49.98% effective miss rate over 2-call window**

### 2.3 D-091 §2.5(β) tripwire status

D-091 §2.5(β) trigger fires when "cache hit rate retro 实测 < 50%". This first data point is at **99.98% on call #2** — far above the 50% floor. **No tripwire fire.**

This data ratifies D-088 §2.3 cache 设计 80-95% hit rate working assumption AND empirically exceeds it on a stable-prefix payload (D-095 §2.3 layout).

### 2.4 Caveats

- **Single data point** — first-week retro per D-091 §2.2 should aggregate ≥10-20 calls across modes (chat / quiz / hover) before drawing population-level conclusions
- **Smoke role only** — hello-ai uses the full glossary as cached prefix; real Chat mode (whole-book) / Quiz Explain mode (page + entity) / Hover mode (single glossary entry) have different prefix shapes; per-mode cache behavior is Step 5-7 retro 数据
- **No within-session prefix variance tested** — second call sent identical payload; future test should vary the user message while keeping system messages identical to verify stable prefix detection works under partial variation

---

## 3. Cost (real DeepSeek pricing per platform.deepseek.com 2026-05-19)

### 3.1 Per-call breakdown

| Call | Miss tokens × price | Hit tokens × price | Output × price | Subtotal |
|---|---|---|---|---|
| #1 | 57,993 × $0.27/M = $0.01566 | 0 × $0.027/M = $0 | 1 × $1.10/M = $0.0000011 | **$0.01566** |
| #2 | 9 × $0.27/M = $0.0000024 | 57,984 × $0.027/M = $0.001566 | 1 × $1.10/M = $0.0000011 | **$0.00157** |

**Total: ~$0.017 真 billed** for 2 calls.

### 3.2 D-090 cap envelope vs actual

- D-090 §2.1 per-query cap = **$5**
- This call (~$0.01-0.02 each) → **~290-500× headroom** below cap
- D-090 α-silent mode applies → caps log silently to disk (no user prompt this small)

### 3.3 D-091 envelope re-baseline preview (per D-095 §4.2/§4.3)

D-091 §2.1 β-ready expected = **$1,800/月** (Anthropic baseline)。Per D-095 cost-driver pivot to DeepSeek, projection scaling for 5-8 users heavy use ≈ **DeepSeek $1,800 / 30-50× cheaper = ~$36-60/月 真 billed β envelope**。

Full re-baseline (envelope amend) deferred to Step 5 mid-retro per D-095 §4.2 (need multi-mode data; this is smoke-only).

---

## 4. Token estimate calibration

### 4.1 Heuristic vs reality

- `assembleScope.ts` uses `Math.ceil(text.length / 4)` chars/token heuristic
- Glossary JSON file size: 317,921 bytes; JSON.stringify(load) yields ~comparable
- **Heuristic estimate**: ~317,921 / 4 ≈ **79,480 tokens**
- **Real DeepSeek count**: 57,993 input tokens (call #1)
- **Heuristic over-estimates by ~37%** (79,480 / 57,993 = 1.37×) on this CJK-heavy JSON

### 4.2 D-095 §4.7 / D-089 PoC calibration note follow-up

Earlier project note `evidence/phase2_d089_poc_2026-05-19/measurement.md` measured ~9 chars/token for CJK text → chars/4 was thought to over-estimate by ~2×. Real-on-DeepSeek (this call) shows **~1.37× over** on JSON+CJK mix — less conservative than assumed.

**TODO Step 5** (covered by D-089 §2.5 calibration item): refine heuristic. Candidate formula: `Math.ceil(text.length / 5)` for JSON+CJK mix → would yield ~63,580 estimate, only ~10% over.

This is not a tripwire fire (chars/4 stays a safe upper bound); only an optimization note for budget visibility precision.

---

## 5. D-091 §2.5 tripwire status this turn

| Trigger | Threshold | Observed | Status |
|---|---|---|---|
| α — PoC ceiling drift > 50% | Anthropic Opus baseline $1.12/call PoC ceiling | N/A (DeepSeek post-D-095, not comparable) | n/a |
| **β — Cache hit rate < 50%** | 50% | **99.98% on call #2** | ✅ **no fire** |
| γ — Step / wall drift > 30% | covered by D-094 (Module A); B-D held | Step 4 Turn 1-7 ~135 min vs 1 day estimate (-91%); still under | observation, not fire |
| δ — β user count > 10/月 | n/a α-now | 1 user | n/a |
| ε — provider pricing change / deprecation | n/a | DeepSeek stable 2026-05-19; D-095 §2.5(ε) covers V4 graduation | n/a |

**No tripwire fire this turn.** β tripwire data point #1 logged.

---

## 6. Sign-off (path α)

- **Writer**: Claude main session (Session 35 Turn 7)
- **Data source**: `vercel logs --json` retrieval of `[hello-ai] {...}` lines emitted by `streamText.onFinish` callback in `apps/web/src/app/api/hello-ai/route.ts` POST handler
- **Reviewer**: deferred to commit gate user terminal sign-off (path α per Sessions 32-34 precedent)
- **Rule A**: n/a (no LLM rewrite / compression > 50%)
- **Rule B**: 0 failure attempts this turn (3 transient curl issues — `vercel curl` POST parser bug, log truncation, vercel logs default format — all worked around without scrapping any artifact)
- **Rule C**: n/a (Phase retro at Phase 2 close)
- **Rule D**: ✅ Writer ≠ Reviewer (Writer = main session; Reviewer = user terminal at commit gate or sub-agent in Step 5 retro)

---

## 7. Follow-up actions for Step 5 mid-retro (D-094 §2.4 + D-095 §4.2)

1. Per-mode cache hit rate data:
   - Chat mode (whole-book scope ~800K tokens) — expected lower hit rate due to larger payload + per-request user variation
   - Quiz Explain mode (page + entity scope ~500-3K tokens) — small cached prefix, marginal cache value
   - Hover mode (single glossary entry ~80-200 tokens) — too small to cache
2. D-090 / D-091 cost envelope amend numbers (D-095 §4.2/§4.3 deferred)
3. assembleScope.ts heuristic refinement (chars/4 → chars/5 candidate)
4. AI SDK warning silence: add `experimental_allowSystemInMessages: true` to streamText config OR refactor to use `system` option with cacheControl on subset (need v7 migration verification)
5. Vercel preview deployment protection ops setup per D-096 §2.6 (Session 36 entry)

---

**END cache_audit_2026-05-19.md — Phase 2 Step 4 data point #1 — DeepSeek 99.98% hit rate ratifies D-095 §2.3 stable-prefix layout ✅**
