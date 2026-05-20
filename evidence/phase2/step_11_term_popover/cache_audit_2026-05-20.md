# Phase 2 · Step 11 · Cache audit (Session 43 · 2026-05-20)

> 2 真 LLM hover calls via Chrome DevTools MCP on prod canonical
> `web-mu-sandy-78.vercel.app` (`dpl_GyyYvBNrFpaYb4c26zVPqrtie24E`, target=production).

## 1. Data points

| Call | Surface | tokens in | hit | miss | hit % | output | Note |
|---|---|---:|---:|---:|---:|---:|---|
| A | `アルゴリズム` | 400 | 384 | 16 | **96%** | 62 | warm — same surface as Step 7 Session 39 1st smoke (5 days ago) |
| B | `マルチコアプロセッサ` | 421 | 0 | 421 | **0%** | 98 | cold — fresh surface; never previously hit in Phase 2 |

(UI hint surfaces the rounded percentage; underlying ratio for Call A is
`Math.round(384/400 * 100) = 96` and for Call B `Math.round(0/421 * 100) = 0`.)

## 2. Cross-session DeepSeek prefix cache TTL ratchet

**Headline finding**: Call A on `アルゴリズム` measured **96% cache hit identical
to Step 7 Session 39's warm read 5 days ago** (2026-05-15 → 2026-05-20).

This **ratchets the cross-session TTL finding** as follows:

| Session | Date | Finding |
|---|---|---|
| 40 (Step 8) | 2026-05-20 | > 5h (smoke #5 page_259_entity_0 warm at 95.8% after a ~5h gap) |
| 41 (Step 9) | 2026-05-20 | > 5h re-confirmed (4h-gap warm read on chat scope at 99.99%) |
| 42 (Step 10) | 2026-05-20 | > 4 days (Step 6 Session 38's `page_042_entity_0` still hot at 99.81%) |
| **43 (Step 11)** | **2026-05-20** | **> 5 days** (Step 7 Session 39's `アルゴリズム` still hot at 96% identical) |

Practical implications for D-091 §2.1 cost projections:
- The static-prefix (corpus + instruction) portion of each call effectively
  costs cache-hit pricing (0.014 / 0.07 per 1M for chat/reasoner respectively)
  for any β user who returns within 5+ days.
- The marginal per-call cost is overwhelmingly dominated by output tokens.
- Module D Step 13 cap implementation can safely model α user-cost as
  `input_miss + cache_hit_input + output` with hit_input ratio assumed ≥90%
  for any repeat user.

## 3. β cache-hit data series (N=12 cumulative across Phase 2)

| # | Step | Scope | tokens in | hit % | Stable-prefix invariant |
|---|---|---|---:|---:|---|
| 1 | 4 | hello-ai (~58K glossary) | 57,993 | 99.98% | ✅ |
| 2 | 5 | whole-book lean (~93K) | 92,800 | 99.98% | ✅ |
| 3 | 5 | whole-book lean (~93K, different question) | 92,800 | 99.98% | ✅ |
| 4 | 6 | quiz question (~2.7K) | 2,693 | 99.81% | ✅ |
| 5 | 7 | term hover (~400) | 400 | 96.00% | ✅ |
| 6 | 8 | quiz question (TTL-cross at 5h) | 2,271 | 95.8% | ✅ |
| 7 | 9 | chat ~93K turn 1 | 92,808 | 99.99% | ✅ |
| 8 | 9 | chat ~93K multi-turn (turnCount=3) | 92,914 | 99.88% | ✅ |
| 9 | 10 | quiz question (4-day TTL cross) | 2,693 | 99.81% | ✅ |
| 10 | 10 | quiz question (same Q, 2nd call) | 2,693 | 99.81% | ✅ |
| **11** | **11** | **term hover (5-day TTL cross)** | **400** | **96.00%** | **✅** |
| **12** | **11** | **term hover (fresh surface creation)** | **421** | **0%** | **✅ (per-surface scope)** |

**Range: 400 → 92,914 tok = 232× scope spread**. The smallest scope (term
hover at 400 tok) caps at ~96% hit because the per-call non-cacheable
overhead (system instruction + user prompt + per-surface contextBlock)
dominates a larger fraction of the input. Scopes ≥ 2K tok converge to ≥99.8%.

This **further ratifies D-088 §2.3 stable-prefix invariant** under the
following dimensions:
- **Scope size**: 232× spread, hit rate monotonic-ish vs scope size
- **Multi-turn**: chat at turnCount=3 still 99.88%
- **Cross-session time**: now > 5 days on prod
- **Provider**: DeepSeek (both chat + reasoner)

## 4. D-091 §2.5(β) tripwire status

```
$ vercel logs https://web-mu-sandy-78.vercel.app --since=15m | grep '[tripwire]'
(no output)
```

**0 [tripwire] fires** for the 2 真 LLM smoke calls. Correct behaviour for the
silent-on-healthy detector design — both 96% and the cold-creation 0% are
expected at this scope (per-surface creation events trigger the 0% case which
the tripwire's `cache_low_hit` branch correctly does NOT fire on, since it
requires totalInputTokens ≥ 1000 per `lib/ai/tripwire.ts:evaluateCacheTripwire`;
400 and 421 are both below threshold).

## 5. γ tripwire — Module C 3/4 wall-time data point

**Step 11 actual wall**: ≈ 100 min (Session 43 from kickoff to UI smoke ✅).

Sub-segmented:
- Turn 1 4Q lock: ~3 min
- Turn 2 templates read + Batches B/C/D code writes (8 files): ~20 min
- Turn 3 Batch F pipeline: ~5 min (test + lint + tsc + build)
- Turn 4 Batch G preview + prod deploy: ~10 min
- Turn 5 Rule B diagnosis + fix + re-deploy: ~10 min
- Turn 6 UI smoke + evidence: ~50 min (this turn)

**Estimate**: 0.5 day (≈ 4 hours = 240 min).
**Drift**: −58% (vs Module B+C running −80%+ average).

⚠️ Step 11 is the **first Module C data point with drift in the −50 to −60
band rather than the −80%+ "implementation cruise" band**. Plausible drivers:
1. The Rule B archive on `kana_helper` shape consumed ~10 min of wall;
   without it Step 11 would have been ~90 min ≈ −63% drift (still above the
   −80%+ band).
2. Step 11 has the smallest scope (term hover) — but the UI work is roughly
   equivalent in shape to Step 10 (modal + list + URL state); the velocity
   multiplier on Module C UI work plateaued.

D-094 §2.4 mid-implementation retro pattern continues — PLAN.md Step 11 inline
`actual ~100 min` amend. **Module C+D full re-estimate STILL deferred** to
Step 12 close per the N=4 UI data points plan (Step 12 = 3-tab layout + i18n,
structurally different from the 2 single-page surfaces shipped so far).

## 6. Observability findings (non-failures)

1. **AI SDK system-message-in-prompts warning** continues to surface per call
   (intentional D-095 §2.3 layout — both system messages stay in the messages
   array for stable-prefix discipline; cosmetic `allowSystemInMessages: true`
   suppression still backlog).

2. **vercel logs CLI truncation** — the CLI's MESSAGE column truncates the
   `[glossary/hover]` JSON payload to "AI SDK Warning: System message…"
   prefix; the actual log body with the precise usage frame is only retrievable
   via Vercel Dashboard. Not a blocker — UI usage hint already surfaces the
   exact figures, and the cache TTL evidence is preserved in the UI screenshots.

3. **HOVER_USER_PROMPT 120-tok soft cap drift on Call B**: Call B's 98 output
   tokens are within the ≤120 tok soft cap declared in `lib/ai/hover.ts:80`.
   Call A's 62 tokens is the shorter end of the range. Behaviour appears
   well-calibrated; no drift action needed.

4. **R1 empty-delta** — not applicable to /api/glossary/hover (deepseek-chat,
   not deepseek-reasoner). Per Step 7 Q2=a design, the hover route bypasses
   the R1 empty-delta hazard by construction.

5. **Module C 3/4 data point**: as planned. Step 12 = last Module C data point
   before the full Module C+D re-estimate (D-094 §2.4 trigger).

## 7. Cost ledger update

DeepSeek-chat pricing: input miss $0.27/1M, input hit $0.07/1M, output $1.10/1M.

| Call | Cost |
|---|---|
| A: 16 × $0.27/1M + 384 × $0.07/1M + 62 × $1.10/1M | ≈ **$0.000099** |
| B: 421 × $0.27/1M + 0 × $0.07/1M + 98 × $1.10/1M | ≈ **$0.000222** |
| **Step 11 total** | **≈ $0.0003 真 billed** |

Cumulative Phase 2 真 ≈ $0.082 (Session 42 close) + $0.0003 ≈ **$0.0823** vs
D-090 α-silent $5 cap = **60× headroom unchanged**.

## 8. Module C 3/4 retro

| Item | Status |
|---|---|
| `<TermPopover />` LIVE on prod canonical /glossary | ✅ |
| `<GlossaryList />` LIVE w/ 908 entries in 50音 order | ✅ |
| `?term=` URL state contract verified e2e (router.push on click + router.replace on close) | ✅ |
| 2 真 LLM UI calls + screenshots ×4 | ✅ |
| Module C 3/4 data point captured | ✅ |
| 1 Rule B archive (kana_helper shape mismatch) | ✅ |
| 0 [tripwire] fires under healthy | ✅ |
| 0 new ADR (D-085 §2.4 / D-088 §2.3 / D-089 §2.3 / D-091 §2.5(β) / D-094 §2.1 / D-095 §2.3 / D-097 all honoured) | ✅ |
| Cross-session TTL ratchet > 5 days | ✅ |
