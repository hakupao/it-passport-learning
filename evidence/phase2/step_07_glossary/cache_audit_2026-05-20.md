# Step 7 — `/api/glossary/hover` term-hover smoke retro + Module B 收官 retro

Session 39 · 2026-05-20 · Phase 2 Module B 4/4 ✅ — Step 7 LIVE on prod canonical
`https://web-mu-sandy-78.vercel.app/api/glossary/hover` via D-097 firewall + D-095 stable-prefix.

## 1. Configuration

| Field | Value |
|---|---|
| Provider | DeepSeek (per `LLM_PROVIDER` default = `deepseek`; D-095 §2.1) |
| Model role | `hover` → `deepseek-chat` (V3.2 base; provider.ts:42) |
| Scope | `term-hover` (assembleTermHover; D-085 §2.4; D-089 §2.3) |
| Auth | Basic Auth `claude:<32-hex>` per D-097 α firewall (RFC 7617) |
| Endpoint | `POST /api/glossary/hover` body `{surface_jp: <string>}` |
| Deploy | prod canonical `web-mu-sandy-78.vercel.app` aliased `dpl_8Zb6EE26r9RbAh54QBx9My4DdQjp` target=production |
| Stable-prefix layout | corpus contextBlock (1 glossary entry) → HOVER_SYSTEM_INSTRUCTION → HOVER_USER_PROMPT |

## 2. Smoke design (N=3)

Sequential `curl -sN -u "claude:$PASS" -X POST -H "Content-Type: application/json"` per call;
500-ms gap between calls (within DeepSeek prefix cache TTL).

| # | surface_jp | hypothesis |
|---|---|---|
| 1 | アルゴリズム | Cold creation event (new prefix → 0% hit) |
| 2 | アルゴリズム | Intra-surface stable-prefix → ≥90% hit (D-088 §2.3 invariant test at smallest scope) |
| 3 | データベース | Cross-surface different prefix → 0% hit (per-surface creation event, design-consistent) |

## 3. Smoke results

| # | wall | input_tok | output_tok | cache_hit | cache_miss | hit% | event class |
|---|---|---|---|---|---|---|---|
| 1 | 2.9 s | 400 | 75 | 0 | 400 | 0% | **cold creation** ✓ |
| 2 | 2.1 s | 400 | 71 | **384** | 16 | **96.0%** | **intra-surface hit** ✓ |
| 3 | 2.3 s | 391 | 86 | 0 | 391 | 0% | **cross-surface creation** ✓ |

Wall times all <3 s; far under PLAN.md §1 γ PoC `≤7 s` TTFT target for hover.

### 3.1 Sample SSE delta concatenations

- **#1 アルゴリズム (cold)**: Trilingual tooltip — JP one-liner + 中文 explanation + English gloss with kana_helper.reading "(あるごりずむ)" surfaced.
- **#2 アルゴリズム (repeat)**: Same surface, slight LLM stochasticity on wording (model didn't simply re-emit cached output — only the prefix portion was cached, the actual continuation was freshly sampled).
- **#3 データベース (different)**: Same 3-section structure ("一行で要点 / 中文简介 / English gloss") + kana_helper.reading "(dētabēsu)".

All 3 are corpus-grounded; no fact invention; ≤120-token target honoured.

## 4. β cache ratification — N=5 cumulative across 232× scope range

| Step | Scope | Wire format | Input tok | Within-prefix hit% | Status |
|---|---|---|---|---|---|
| 4 hello-ai | glossary preamble | full glossary as 1st system | ~58 K | **99.98%** | ratified |
| 5 chat #2 | whole-book lean | chapters + glossary | ~93 K | **99.98%** | ratified |
| 5 chat #3 | whole-book lean | chapters + glossary | ~93 K | **99.98%** | ratified |
| 6 quiz #2 | question scope | page + entity pin | ~2.7 K | **99.81%** | ratified |
| **7 hover #2** | **term-hover** | **single glossary entry** | **~400** | **96.0%** | **ratified — new** |

**D-088 §2.3 stable-prefix invariant ratified across 232× scope range (400 → 93 K input tokens).**

The slight drop at the smallest scope (96.0% vs ≥99.81% at larger scopes) is intuitive: cache
granularity is finer relative to total input at small scale (16 of 400 = 4% of prefix changes
across calls vs 5 of 2693 = 0.19% at quiz scale). Both well above the 50% threshold for
D-091 §2.5(β) tripwire.

**D-091 §2.5(β) tripwire — NO FIRE** (96% ≫ 50% threshold).

## 5. Cost

DeepSeek-chat pricing (api-docs.deepseek.com 2026-Q1; per D-095 §2.4 envelope):

| Bucket | rate (USD/1M) | tokens | cost |
|---|---|---|---|
| Input cache miss | 0.27 | 807 (400 + 16 + 391) | $0.000218 |
| Input cache hit | 0.07 | 384 | $0.000027 |
| Output | 1.10 | 232 (75 + 71 + 86) | $0.000255 |
| **Step 7 total** | | | **$0.0005 真 billed** |

Cumulative Phase 2 真 billed: $0.047 (Step 5) + $0.004 (Step 6) + $0.0005 (Step 7) ≈ **$0.0515**.
vs D-090 α-silent $5/$5 cap = **97× headroom**.

## 6. γ tripwire 7th data point — Module B 收官 wall

| Step | Estimate | Actual | Drift |
|---|---|---|---|
| 1 scaffold (Module A) | 1 day | 25 min | −98% |
| 2 DataSource (Module A) | 2 day | 30 min | −98% |
| 3 assembly (Module A) | 1.5 day | 30 min | −98% |
| 4 hello-ai (Module B) | 1 day | 140 min | −85% |
| 5 chat (Module B) | 1.5 day | 165 min | −86% |
| 6 quiz/explain (Module B) | 1 day | 135 min | −84% |
| **7 hover (Module B 收官)** | **1 day** | **~90 min** | **−81%** |

**7 consecutive ≥80% under-estimate** across Module A 3/3 + Module B 4/4.

### 6.1 D-094 §2.4 mid-implementation retro decision — full Module B 收官 path

Module B is now 4/4 ✅. The accumulated data:
- Module A average drift: −98% (3 data points)
- Module B average drift: **−84%** (4 data points: −85%, −86%, −84%, −81%)
- Module B is **converging** — drift is tightening as patterns get established (the
  spread narrowed from [−85, −86] in Steps 4-5 to [−84, −81] in Steps 6-7, which is
  characteristic of an established codepath running at "implementation cruise" rather
  than "design + implementation").

**Resolution per D-094 §2.4 (Module B 收官 path)**:
- PLAN.md Step 7 row inline `actual ~90 min` amend continues (per D-094 §2.1 amendment pattern);
  Module B wall actuals now fully recorded across all 4 steps.
- **Module C+D re-estimate decision — NO full re-estimate this turn.** Rationale:
  - Module C = UI work (4 steps × ~0.5-1.5 day each), structurally different from API
    wiring (different agent skill profile, different verification surface — visual QA vs
    LLM contract tests).
  - Module B drift is best treated as a "API-wiring pattern" velocity multiplier (~5-8×
    faster than initial estimate); applying it blindly to UI work would over-correct.
  - Module C entry (Step 9 Chat UI) will give the first UI data point; **defer**
    Module C re-estimate decision **to Step 9 mid-implementation retro** (same pattern
    as the Step 5 mid-retro that produced this Module B path).
- γ tripwire mechanism continues to function as designed (data captured → resolution applied
  inline → no full re-estimate avalanche). D-091 §2.5(γ) 30% threshold unchanged.

### 6.2 Module B 收官 retro highlights

| Aspect | Outcome |
|---|---|
| ADR locks | 4 cumulative ADR locked across Module B (D-094 Session 35, D-095 Session 35, D-096 Session 35, D-097 Session 36, D-098 Session 37) — note D-094 lock was during Module A→B transition |
| API endpoints LIVE | 4 ✅: `/api/hello-ai` (Step 4) + `/api/chat` (Step 5) + `/api/quiz/explain` (Step 6) + `/api/glossary/hover` (Step 7) |
| D-088 §2.3 cache invariant | Ratified across N=5 cumulative data points, 232× scope range; 96.0%-99.98% intra-prefix hit |
| α firewall (D-097) | LIVE on prod canonical via Edge middleware Basic Auth, all 4 endpoints gated |
| Vitest coverage | 28 (Module A close) → 120 (Module B close); +92 cases over Module B 4 steps |
| Phase 2 真 billed | $0.0515 cumulative vs $5 cap (97× headroom) |
| Failures archived | 1 (`failures/step_05_attempt_1_full_pages_payload_ctx_overflow.md`; pre-deploy caught, D-098 resolution) |
| Observability findings | 1 deferred (Session 38 R1 empty-delta on deepseek-reasoner; not a Step 7 concern since Q2=a chose `deepseek-chat`; design 4Q at Module C boundary or whenever next reasoner usage surfaces) |

## 7. chars/N per-scope heuristic decision (Q3=a bundled at Step 7 close)

### 7.1 Data N=4

| Step | Scope | contextBlock chars | Actual corpus tok | chars/N (empirical) | Notes |
|---|---|---|---|---|---|
| 4 hello-ai | glossary preamble | ~310 K | ~57 K | **5.5** | over-estimated by chars/4 (+37%) |
| 5 chat | whole-book lean | ~294 K | ~92.8 K | **3.17** | under-estimated by chars/4 (−21%) |
| 6 quiz | question (1 page + entity) | varies; ~2300 chars typical | ~2.7 K total input | **~0.85** | small-payload outlier dominated by sys instruction + user prompt overhead |
| **7 hover** | **single glossary entry** | **~480 chars (473-495 measured for 2 surfaces)** | **~200-250 corpus tok (estimated; total input 400 incl. sys+user)** | **~2.0-2.4** | **small-payload but JSON-formatted; closer to chat density than quiz outlier** |

### 7.2 Decision — keep universal chars/3 (NOT per-scope split)

**Rationale**:

1. **Heuristic's job is rough cost pre-flight, not strict budget enforcement.** Provider
   ctx limits (DeepSeek 128K observed, Anthropic 200K/1M) are the real ceiling; this
   estimator only feeds `tokenEstimate` to logs.
2. **chars/3 sits in the middle of the empirical N=4 range** (chars/N empirical = 0.85,
   2.0-2.4, 3.17, 5.5). It over-estimates whole-book (safe direction — flags potential
   cost overruns early) and under-estimates small scopes (acceptable because they're
   far below any limit).
3. **Per-scope split adds complexity without clear win.** A 4-way Map<scope, chars/N>
   in `estimateTokens()` would couple the estimator to scope identity (currently agnostic),
   require maintenance when D-085 modes evolve, and provide marginal accuracy gain on
   data points that aren't budget-critical.
4. **The Step 6 quiz chars/0.85 outlier is misleading.** It comes from the small
   contextBlock (~2300 chars) being dwarfed by HOVER_SYSTEM_INSTRUCTION + user prompt
   tokens that the contextBlock heuristic doesn't account for. The estimator measures
   only the corpus block, not the full LLM input — this gap is inherent and intentional
   (the sys/user portions are stable per-endpoint and don't need pre-flight estimation).

**Action this Session**: extend `assembleScope.ts` header comment to add the Step 7 row
to the chars/N measurement table; estimator constant `Math.ceil(text.length / 3)`
unchanged. NOT D-NNN-worthy (in-source amendment pattern per D-094 §2.1 + D-080 v1.1 §8).

### 7.3 Drift-correction (DC-39.1)

The Session 38 cache_audit listed Step 6 quiz chars/N empirical as ≈ 0.85 with a
"−79% under-estimate vs chars/4" gloss. The post-hoc interpretation in §7.1 above
clarifies that this number is the contextBlock/total-input ratio, NOT a comparable
chars/token figure for the corpus block in isolation. Both interpretations are correct
within their measurement frame; future entries should explicitly distinguish
"chars-of-contextBlock per total-input-token" vs "chars-of-contextBlock per
corpus-only-token". The §7.2 decision stands either way.

## 8. Acceptance gates

| Gate | Status | Evidence |
|---|---|---|
| Code green | ✅ | `pnpm test` → 120/120; `pnpm lint` → exit 0; `pnpm exec tsc --noEmit` → exit 0; `pnpm build` → 9 routes, ƒ Middleware 37.6 kB, 119 kB First Load JS |
| Vercel prod deploy | ✅ | `dpl_8Zb6EE26r9RbAh54QBx9My4DdQjp` aliased `web-mu-sandy-78.vercel.app` target=production |
| D-097 firewall still gating | ✅ | pre-smoke probe HTTP 401 + `www-authenticate: Basic realm="IT Passport Learning firewall"` |
| 3 真 LLM hover smoke | ✅ | N=3 sequential POST calls; coherent trilingual tooltip outputs |
| Intra-surface cache hit ≥50% | ✅ | 96.0% (call #2) ≫ 50% threshold |
| Cross-surface 0% (design-consistent) | ✅ | call #3 = 0 hit / 391 miss as expected (different prefix) |
| TTFT ≤ 7 s (γ PoC target) | ✅ | All 3 calls <3 s wall (well under target) |
| Cost ≪ D-090 cap | ✅ | $0.0005 step / $0.0515 cumulative vs $5 cap (97× headroom) |
| Module B 收官 path | ✅ | All 4 Module B endpoints LIVE; 7-data-point γ resolution per §6.1 |

## 9. Sign-off

**Step 7 ✅ DONE. Module B 4/4 ✅ COMPLETE.** Phase 2 next entry = Step 8 (1-retry-no-fallback +
δ-all-tripwire detector per D-088 §2.4) OR Module C entry (Step 9 Chat UI) per
Session 40+ design 4Q.

Pending close gates per Sessions 27-38 pattern:
- `go commit` (1 atomic commit Session 39 scope)
- `push it` (push to `origin/main`)
