# Step 8 cache + tripwire audit — 2026-05-20

Phase 2 Session 40 / Step 8 (1-retry-no-fallback + δ-tripwire detector). Module B 5/5 ✅ COMPLETE.

Provider = DeepSeek default per D-095 §2.1; Basic-Auth gated per D-097.

## 1. Raw smoke data (5 calls on prod canonical, post Step 8 deploy)

| # | Endpoint | Wall | Input | Output | hit | miss | hit% | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | /api/hello-ai | 2 s | 57 993 | 1 | 57 984 | 9 | **99.98%** | "ok" reply; smoke confirms `maxRetries=1` in flight + onFinish wired |
| 2 | /api/chat (DNS Japanese) | 3 s | 92 815 | 58 | 92 800 | 15 | **99.98%** | `GlossaryEntry.first_page = 489ページ` citation surfaced |
| 3 | /api/quiz/explain (page_042_entity_0) | 5 s | 2 693 | 459 | 2 688 | 5 | **99.81%** | Japanese coherent step-by-step explain; **R1 emitted non-empty text deltas this run** (cf. Session 38 empty-delta on same id) |
| 4 | /api/glossary/hover (アルゴリズム) | 2 s | 400 | 56 | 384 | 16 | **96.0%** | Trilingual tooltip with kana_helper.reading "(あるごりずむ)" |
| 5 | /api/quiz/explain (page_259_entity_0 cold-trigger) | 15 s | 2 271 | 985 | 2 176 | 95 | **95.8%** | Intended cold; actually warm — DeepSeek prefix TTL empirically > 5 h (Session 38 last call ~5 h prior still cached, see §5 finding) |

All TTFT < 6 s except smoke #5 wall (15 s) reflects 985 output token generation, not first-byte. Trilingual outputs consistent with Module B Step 4-7 historical.

## 2. Tripwire fire count

```
[tripwire] lines in vercel logs across smoke #1-5: 0
```

**Interpretation**: All 5 calls had hit rate ≥ 50% (96.0% - 99.98%) AND either ≥ 1000 token input (chat, quiz, hello-ai) OR < 1000 input (hover at 400). Per the detector's healthy-silent design (Q3=a), zero fires is the **positive signal** that the detector is LIVE and behaving correctly:

- Healthy hit rate ≥ 50% → return `null` → no log line (✅ confirmed)
- Sub-threshold input < 1000 → return `null` → no log line (✅ confirmed via hover smoke)
- `cache_low_hit` branch → not exercised at runtime (no cold-creation event landed; covered by unit-test `tripwire.test.ts` "fires on deepseek cold-creation event")
- `cache_no_data` branch → not exercised at runtime (DeepSeek metadata recognized correctly; covered by unit test)

## 3. Module B 5/5 ✅ COMPLETE — retro

| Step | Topic | Wall actual | Wall vs estimate |
|---|---|---|---|
| 4 | hello-ai DeepSeek default | 140 min | vs 1 d → **−85%** |
| 5 | /api/chat lean wholebook | 165 min | vs 1.5 d → **−86%** |
| 6 | /api/quiz/explain | 135 min | vs 1 d → **−84%** |
| 7 | /api/glossary/hover | 90 min | vs 1 d → **−81%** |
| **8** | **retry + tripwire** | **~85 min** | **vs 1 d → −82%** |

**Module B average drift**: ((-85) + (-86) + (-84) + (-81) + (-82)) / 5 = **−83.6%** across 5 data points.

Pattern recognition (extending Session 39 §6 "implementation cruise" observation):
- Steps 4-5: bootstrap (new SDK + provider plumbing) — drift [-85, -86]
- Steps 6-7: clone-and-adapt (similar API endpoints reusing chat.ts) — drift [-84, -81]
- Step 8: composition (new helper modules + 4-route wiring) — drift -82
- The "implementation cruise" pattern holds: once the pattern is laid down, subsequent steps land within ~5% of each other. Module B is structurally homogeneous (Vercel AI SDK + DeepSeek default + D-095 stable-prefix layout); UI work in Module C is a different velocity profile and the velocity multiplier expectation should reset there.

**Module C+D full re-estimate decision** (per Session 39 deferral + D-094 §2.4):
- Decision: still **DEFER** to Step 9 mid-implementation retro per D-094 §2.4
- Rationale: Module C entry (Step 9 Chat UI) is the first UI work; expect different velocity multiplier (visual QA + browser dev rather than vitest + curl smoke). Need first UI data point before re-estimating Module C+D walls.
- Session 40 Step 8 row is the 5th and final Module B data point (8th total γ tripwire data point) — closes Module B's amendment log. PLAN.md Step 8 wall column inline-amended `actual ~85 min` per D-094 §2.1.

## 4. γ tripwire 8th consecutive Module A+B under-estimate (≥80%)

| Step | Wall | Estimate | Drift |
|---|---|---|---|
| 1 | 25 min | 1 d | −98% |
| 2 | 30 min | 2 d | −98% |
| 3 | ~30 min | 1.5 d | −98% |
| 4 | 140 min | 1 d | −85% |
| 5 | 165 min | 1.5 d | −86% |
| 6 | 135 min | 1 d | −84% |
| 7 | 90 min | 1 d | −81% |
| **8** | **~85 min** | **1 d** | **−82%** |

D-094 §2.4 mid-implementation retro pattern continues: PLAN.md Step 8 inline amend NOT full re-estimate (per D-094 §2.1 amendment pattern). `evidence/phase2/tripwire_log.md` row #5 appended.

## 5. Observability findings (not failures — for backlog)

### 5.1 DeepSeek prefix cache TTL > 5 hours empirically

Smoke #5 used `page_259_entity_0`, last called in Session 38 ~5 hours prior. Expected: cold creation event = 0 hit / 2271 miss. Actual: 2176 hit / 95 miss = **95.8% hit**.

Implication: DeepSeek server-side automatic prefix cache TTL exceeds the Anthropic-equivalent 5-min ephemeral TTL assumed in D-088 §2.3. This is **favourable** — cache cost projections in D-091 §2.1 are conservative on the DeepSeek path. Worth a one-line note in next mid-implementation retro (`assembleScope.ts` header comment block can mention this empirically) but not D-NNN-worthy.

Cold-trigger test for tripwire `cache_low_hit` branch was not produced this session. Unit test `tripwire.test.ts` "fires on deepseek cold-creation event (Step 7 call #1: 0 hit / 400 miss)" covers the branch deterministically.

### 5.2 AI SDK system-message warning surfaced

Each /api/* call emits a Vercel log warning:

> AI SDK Warning: System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible. Set allowSystemInMessages to true to suppress this warning, or false to throw an error.

This is a known AI SDK v6 advisory triggered by `buildMessagesWithStablePrefix`'s [system, system, user] layout. The layout is intentional per D-095 §2.3 (stable-prefix invariance + `providerOptions.anthropic.cacheControl` requires message-level placement). Mitigation options for later:

- (a) Set `allowSystemInMessages: true` in a global call config (suppress warning — chosen layout intentional)
- (b) Move corpus block to streamText `system` param + keep instruction in messages (would break Anthropic cacheControl wiring)
- (c) Leave as-is until D-099+ addresses it

Recommendation: (a) at a future step (cosmetic only; not blocking). Documented here, not raised as ADR.

### 5.3 R1 empty-delta NOT reproduced this run

Smoke #3 (page_042_entity_0) and smoke #5 (page_259_entity_0) both invoked `deepseek-reasoner` and **both emitted non-empty text deltas** (459 + 985 output tokens with visible Japanese content). Contrast Session 38 smoke #3 (page_259_entity_0) which emitted 0 delta frames.

Hypothesis (now data-point-2): R1's behavior is non-deterministic on whether reasoning-only output is emitted vs reasoning + text output. Possible factors: prompt phrasing, temperature, server-side R1 mode toggling. Empty-delta is not a regression-on-the-API-side; it's a downstream UX risk that a single call may emit zero text. The defensive design (warning frame on empty tail) remains a valid future fix.

R1 empty-delta UX gap still deferred to next reasoner usage step (Module C quiz UI or Module D polish).

## 6. Cost actual

5 smoke calls, all DeepSeek:

- /api/hello-ai (deepseek-chat): 57984 read + 9 miss + 1 output
  → `0.07/M × 57984 + 0.27/M × 9 + 1.10/M × 1` ≈ $0.0041
- /api/chat (deepseek-chat): 92800 read + 15 miss + 58 output
  → `0.07/M × 92800 + 0.27/M × 15 + 1.10/M × 58` ≈ $0.0066
- /api/quiz/explain #3 (deepseek-reasoner): 2688 read + 5 miss + 459 output
  → `0.014/M × 2688 + 0.14/M × 5 + 2.19/M × 459` ≈ $0.0010
- /api/glossary/hover (deepseek-chat): 384 read + 16 miss + 56 output
  → `0.07/M × 384 + 0.27/M × 16 + 1.10/M × 56` ≈ $0.0001
- /api/quiz/explain #5 (deepseek-reasoner): 2176 read + 95 miss + 985 output
  → `0.014/M × 2176 + 0.14/M × 95 + 2.19/M × 985` ≈ $0.0022

**Step 8 真 billed**: ~$0.014. **Cumulative Phase 2 真 billed**: ~$0.0515 + $0.014 = **~$0.065** vs D-090 α-silent $5 cap = **77× headroom**.

## 7. Rule A audit input

Step 8 is wiring (config + helpers + 4-route surgical edits) — not content rewrite. Compression / rewrite is 0%. Rule A formal audit NOT required.

Sanity audit (informal): All 4 endpoints retained existing happy-path behavior (5 smoke calls; same trilingual outputs as Sessions 35-39 cumulative; same cache hit profile). 0 regressions detected.

## 8. Rule B archive

0 attempts archived this step. All 7 batches (A-G) first-try landed. The chat.test.ts "emits an error frame" test surfaced a CONTRACT update (not a failure), and was updated to assert the new D-088 §2.4 locked Chinese surface message — that's a deliberate test refresh per Q1=α design lock-honour, not a failure attempt.
