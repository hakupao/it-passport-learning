# Step 8 Audit — 1-retry-no-fallback + δ-tripwire detector

Per project convention (Rule A audit pattern + Phase 2 implementation review). Module B 5/5 ✅ COMPLETE close.

## 1. Acceptance criteria

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `STREAM_CONFIG.maxRetries = 1` per D-088 §2.4 | ✅ | `retry.ts:23` + `retry.test.ts` "pins maxRetries = 1" |
| 2 | All 4 endpoints pass `maxRetries: STREAM_CONFIG.maxRetries` to streamText | ✅ | 4 grep hits in `apps/web/src/app/api/**/route.ts` (manual verified) |
| 3 | `formatUserFacingError` returns locked Chinese surface text | ✅ | `retry.test.ts` "matches the locked Chinese text verbatim" + `chat.test.ts` "emits an error frame ... locked Chinese fallback" |
| 4 | `chat.ts` SSE encoder catch uses `formatUserFacingError` and logs raw error to `console.error` | ✅ | `chat.ts:137-150` + `chat.test.ts` errorSpy assertion |
| 5 | `evaluateCacheTripwire` returns null on healthy ≥50% hit | ✅ | 3 unit-test cases (deepseek 96% / anthropic 99.98% / exact 50%) all return null |
| 6 | `evaluateCacheTripwire` returns null on sub-threshold input < 1000 tok | ✅ | `tripwire.test.ts` "returns null when totalInputTokens < 1000 (deepseek)" |
| 7 | `evaluateCacheTripwire` returns `cache_low_hit` on <50% hit AND ≥1000 tok | ✅ | `tripwire.test.ts` "fires on deepseek cold-creation event (Step 7 call #1: 0 hit / 400 miss)" — note: test scenario uses 2693 (not 400) to be above min-tokens floor |
| 8 | `recordTripwireEvent` writes to console.warn with `[tripwire]` prefix | ✅ | `tripwire.test.ts` "writes a [tripwire] prefixed line" |
| 9 | All 4 endpoints invoke evaluateCacheTripwire + recordTripwireEvent (if non-null) inside onFinish | ✅ | 4 route grep |
| 10 | vitest 150/150 green | ✅ | `test_results.txt` snapshot |
| 11 | tsc strict exit 0 | ✅ | `pnpm exec tsc --noEmit` exit 0 (Batch C) |
| 12 | pnpm lint exit 0 | ✅ | (Batch C) |
| 13 | pnpm build green | ✅ | `build_log.txt` snapshot; 9 routes; Middleware 37.6 kB unchanged; First Load JS 119 kB unchanged |
| 14 | Vercel prod deploy READY | ✅ | `dpl_D4oQASueh2eTXrEEaApdmWNw4q3n` target=production aliased `web-mu-sandy-78.vercel.app` |
| 15 | D-097 firewall still gating post-deploy | ✅ | post-promote probe HTTP 401 + `www-authenticate: Basic realm="IT Passport Learning firewall"` |
| 16 | 5 smoke calls happy-path no regression | ✅ | smoke_call_{1..5}.log; cache hit 96-99.98% spanning hello-ai 57K / chat 92K / quiz 2.7K / hover 0.4K |
| 17 | 0 [tripwire] fires under healthy operation | ✅ | grep returned 0 lines |
| 18 | Module B 5/5 ✅ COMPLETE | ✅ | all 5 step rows in PLAN.md Module B = `actual <N> min` inline-amended (per D-094 §2.1) |

## 2. Sample N=5 spot-check (smoke-call coherence)

| Sample | Coherence | Trilingual | kana_helper / citation | Verdict |
|---|---|---|---|---|
| smoke #1 hello-ai | "ok" 1-token reply | n/a | n/a | ✅ correct per system instruction "reply with the single word: ok" |
| smoke #2 chat DNS | Japanese 4-layer reply | n/a (single lang reply by user request) | `489ページ` page citation | ✅ corpus-grounded; first_page field used per Session 37 |
| smoke #3 quiz page_042 | 459-token Japanese explain | n/a | algorithm topic walk-through | ✅ coherent; R1 emitted real text (not empty-delta this run) |
| smoke #4 hover アルゴリズム | 3-section trilingual tooltip | jp/中文/English | "(あるごりずむ)" reading surfaced | ✅ structured output as designed |
| smoke #5 quiz page_259 | 985-token Japanese explain on cold-target | n/a | concept "定義" surfaces | ✅ coherent; R1 emitted real text |

All 5 corpus-grounded; no fact invention; trilingual / structured outputs honoured. PASS.

## 3. Pre-close self-check (per D-027 §5)

| Item | Status |
|---|---|
| 0 new ADR lock | ✅ Step 8 honoured locked D-088/D-091/D-094/D-095/D-097 cleanly |
| Code green | ✅ 150/150 vitest + lint + build + tsc strict |
| Vercel env vars | ✅ DEEPSEEK_API_KEY + FIREWALL_BASIC_AUTH unchanged from Step 7 |
| Preview deploy | ✅ `dpl_WKXHR6EXes8a8bdbmDUcTEM8smBY` |
| Prod deploy | ✅ `dpl_D4oQASueh2eTXrEEaApdmWNw4q3n` target=production aliased canonical |
| Firewall gating | ✅ post-promote probe 401 + WWW-Authenticate |
| 5 真 LLM smoke | ✅ all happy + 0 tripwire fires (healthy silent) |
| Module B 5/5 ✅ | ✅ all 5 Module B steps now `actual <N> min` |
| PLAN.md Step 8 → ✅ DONE | (Batch G pending — to be done) |
| STATE.md sync | (Batch G pending) |
| Session log on disk | (Batch G pending) |
| Evidence on disk | ✅ `step_08_retry/` 11 files complete |
| Tripwire row #5 appended | (Batch F sub-step pending) |
| Rule A 抽检 | n/a wiring (not content rewrite); informal sanity audit done §2 |
| Rule B 归档 | 0 (all batches first-try) |
| Rule C Phase retro | n/a mid-Phase; Module B 收官 retro done in cache_audit §3 (NOT Rule C Phase-end retro) |
| Rule D Writer ≠ Reviewer | ✅ Writer = main session; Reviewer = user terminal `a/b/a/a` 4Q ACK + `授权 vercel --prod` ACK + `授权 decode firewall pass` ACK; commit ACK pending |
