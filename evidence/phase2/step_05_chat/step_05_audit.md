# Phase 2 Step 5 — semantic audit (Rule A)

| 字段 | 值 |
|---|---|
| Step | 5 — `/api/chat` whole-book scope wiring + first-week cache hit retro |
| Session | 37 (2026-05-20) |
| Tier | 3 (Phase 2 实施阶段) |
| Status | ✅ DONE — 3 真 LLM call green + 99.98% × 2 cache hit + 81/81 vitest |
| LLM rewrite / compression > 50% on user content | **N/A** — Step 5 wires a chat endpoint; the LLM consumes the corpus but does not rewrite project artifacts. Rule A audit threshold not crossed by Step 5 mechanics. |
| Rule A independent audit | **n/a** — no qualifying artifact |

---

## 1. Scope

Per Session 37 4Q (all Recommended ACK):
- Q1=a scope = whole-book only
- Q2=a stateless single-turn SSE
- Q3=a curl-only smoke (no UI this step)
- Q4=a N≥3 真 call retro 轻

Code surface delivered:
- `apps/web/src/lib/ai/chat.ts` — SSE encoder + request body validator (130 行)
- `apps/web/src/app/api/chat/route.ts` — POST + GET handlers (115 行)
- `apps/web/src/lib/ai/__tests__/chat.test.ts` — 15 unit tests
- `apps/web/src/app/api/chat/__tests__/route.test.ts` — 6 integration tests (mocked AI SDK + DataSource)
- `apps/web/src/lib/data/assembleScope.ts` — modified `assembleWholeBook` to lean payload per D-098 §2.1
- `apps/web/src/lib/data/__tests__/assembleScope.test.ts` — assembleWholeBook test block rewritten (3 lean tests; old full-pages test deleted)
- `apps/web/vitest.config.ts` — added `resolve.alias { "@": ./src }` (was missing; route.test.ts first to need it)

Decisions locked this turn:
- **D-098** — whole-book lean payload (amend D-085 + D-089 §2.3); `docs/decisions/D-098-whole-book-lean-payload.md` ~250 行 LOCKED.

---

## 2. Audit dimensions

### 2.1 Build / lint / typecheck

| Check | Result |
|---|---|
| `pnpm test` | 81/81 ✅ (Step 5 net +2 tests; chat.test 15 + route.test 6 - 1 old assembleWholeBook + 3 new lean) |
| `pnpm exec tsc --noEmit` | exit 0 (strict) |
| `pnpm lint` | exit 0 |
| `pnpm build` | 7 routes (5 static + 2 dynamic incl. `/api/chat`); Middleware 37.6 kB; 119 kB First Load JS — no regression |

### 2.2 Real LLM smoke (3 calls, 真 billed)

All 3 calls returned HTTP 200 SSE, hit `/api/chat` through Basic Auth (D-097 firewall), used DeepSeek as active provider per D-095 §2.1 default, and exhibited the expected stable-prefix cache behavior:

| Call | Cache hit | Model output character |
|---|---|---|
| #1 (English: "What is OSI layer 3?") | 0% (creation) | Honest refusal: "The corpus does not contain information about the OSI model or OSI layer 3..." → **lean payload trade-off verified empirically**: model knows it doesn't have full pages, doesn't fabricate. |
| #2 (Japanese: "TCP/IP の主な層は？") | 99.98% | Coherent Japanese reply with 4-layer breakdown (likely synthesized from glossary entries + training data). |
| #3 (Japanese: "DNSの役割は何ですか？") | 99.98% | Coherent Japanese reply with DNS explanation + citation "（出典：教科書 489ページ）" (uses `GlossaryEntry.first_page` field). |

Full SSE streams saved adjacent: `smoke_call_1.log`, `smoke_call_2.log`, `smoke_call_3.log`.

### 2.3 D-088 §2.3 stable-prefix design ratification

Stable-prefix layout (corpus → instruction → user) delivers **99.98% cache hit on call #2+** for both:
- Step 4 (glossary corpus, 57,993 tokens)
- Step 5 (lean wholebook corpus, 92,814 tokens)

Empirical N=4 supports D-088 §2.3 working assumption ("80-95% hit rate"); observed exceeds (by ~5%).

### 2.4 D-091 §2.5(β) cache hit rate tripwire

50% floor. Observed 99.98%. **No fire.**

### 2.5 D-091 §2.5(γ) wall drift tripwire

Step 5 wall **~165 min vs 1.5 day estimate = −86%** drift. Per D-094 §2.4, this is the Module B mid-implementation retro decision data point (5th consecutive >85% under-estimate). **Resolution**: PLAN.md §1 Module B-D wall column inline amend (`actual <N> min` annotation), no full B-D re-estimate. See `tripwire_log.md` row #2.

### 2.6 D-098 LOCKED — design factual error pre-deploy catch

Pre-Batch-E local node measurement caught the assembleWholeBook full-pages design vs DeepSeek context (then assumed 64K, empirically the deploy handles 93K so V3.2 128K-ctx) physical limit mismatch. Fixed via lean payload (chapters + glossary, no pages). N=3 calls validate the fix (corpus token count 92,814 confirms within deployed-model ctx envelope).

### 2.7 chars/N heuristic contradiction surfaced

Pre-existing `assembleScope.ts` `Math.ceil(text.length / 4)` heuristic (Step 4 finding: over-estimates by 37%) **fails** on Step 5 lean payload: under-estimates by 21%. Content-dependent factor.

**Recommendation**: heuristic refresh deferred to Step 6 entry — change to chars/3 (conservative), or eliminate fixed factor and rely on actual `usage.inputTokens` post-call. Documented in `cache_audit_2026-05-20.md` §4.

---

## 3. Rule scoreboard (this Step)

| Rule | Status | Evidence |
|---|---|---|
| **A** semantic audit on > 50% compression / rewrite | n/a | Step 5 not a content-transformation step |
| **B** failed attempt archive | 0-1 (临界) | See `failures/step_05_attempt_1_full_pages_payload_ctx_overflow.md` (decision to archive the pre-deploy caught design error for traceability; alternative reading "in-flight fix no archive needed" — chose archive path for posterity) |
| **C** Phase retro | n/a mid-Phase | At Phase 2 close |
| **D** Writer ≠ Reviewer | ✅ | Writer = main session this turn; Reviewer = user terminal at 4Q ACK + ACK gates (`授权 batch D` / `授权 fix DEEPSEEK` / `授权 vercel --prod` / `授权 batch E v2`) + commit gate (pending). D-098 ADR independently reviewed by user 4Q before any code change. |

---

## 4. Wall budget actual (Session 37)

| Phase | Description | Wall |
|---|---|---|
| Entry | Read STATE + last session + 4Q | ~5 min |
| Batch A | chat.ts + route.ts code (interface-first) | ~15 min |
| Batch B | tests (chat.test + route.test) | ~10 min |
| Batch C | lint + tsc + build green; alias config fix | ~5 min |
| Batch D | DEEPSEEK prod env add (rollback + re-add) + preview deploy | ~30 min (incl. empty-placeholder rollback detour) |
| Pre-flight | Local node token measurement → ctx overflow discovery | ~5 min |
| Batch B-fix | D-098 ADR + assembleWholeBook modify + test rewrite | ~30 min |
| Batch B-fix verify | pnpm test/lint/build re-green + preview redeploy + prod deploy | ~15 min |
| Batch E | 3 真 LLM smoke + capture | ~5 min |
| Batch F (this file + cache_audit + tripwire append + light files) | Retro evidence | ~30 min (in-progress) |
| Batch G (PLAN + STATE + session log + commit gate) | Bookkeeping | ~15 min (TBD) |
| **Total estimate** | | **~165 min wall** |

vs PLAN.md Step 5 1.5 day estimate = **−86%** (5th consecutive Module A+B data point under-estimate by 85%+).

---

## 5. Pre-close self-check items contributed by Step 5 audit

(Full self-check belongs in session-37 log §5 per D-027 §5; this audit lists the artifacts that should be on disk:)

- ✅ Code green (Batch A-C + B-fix re-green)
- ✅ D-098 ADR on disk
- ✅ 3 deploys logged (1 preview pre-fix + 1 preview post-fix + 1 prod post-fix)
- ✅ 3 真 LLM SSE streams captured (smoke_call_{1,2,3}.log)
- ✅ cache_audit_2026-05-20.md with N=3 data + chars/N contradiction analysis
- ✅ step_05_audit.md (this file)
- ⏳ tripwire_log.md row #2 (Batch F next step)
- ⏳ tree_outline.md / build_log.txt / test_results.txt (Batch F next step)
- ⏳ PLAN.md Step 5 row → ✅ DONE (Batch G)
- ⏳ STATE.md 4 anchor sync (Batch G)
- ⏳ session-37 log full (Batch G)
- ⏳ Commit (Batch G, user gate)

---

**END step_05_audit.md — Step 5 closes GREEN with D-098 mid-step factual correction documented**
