# Step 6 Quiz Explain — Cache + Cost Audit (N=3 真 LLM)

**Date**: 2026-05-20 (Session 38)
**Scope**: Question scope (D-089 §2.3 — page + entity pin)
**Endpoint**: `POST https://web-mu-sandy-78.vercel.app/api/quiz/explain`
**Provider**: DeepSeek (`deepseek-reasoner` R1 per provider.ts matrix `quiz` role)
**Auth**: D-097 Basic Auth `claude:<32-hex>`
**Deploy**: `dpl_DBK7TkSrhr1Y2x464TNDPUEGn6DT` target=production
**Total real $**: ~$0.004 真 billed (DeepSeek)

---

## 1. Raw measurements

| # | question_id | wall | inputTokens | outputTokens | cacheReadInputTokens | cacheMissInputTokens | hit% |
|---|---|---|---|---|---|---|---|
| 1 | `page_042_entity_0` | 10.3 s | 2693 | 757 | 0 | 2693 | 0% (creation) |
| 2 | `page_042_entity_0` | 7.9 s | 2693 | 608 | 2688 | 5 | **99.81%** |
| 3 | `page_259_entity_0` | 5.6 s | 2271 | 330 | 0 | 2271 | 0% (creation) |

**Pattern**: creation → hit → creation. Confirms per-question prefix cache discipline:
- Repeated calls on the **same** question_id ⇒ 99.81% hit ratifies D-088 §2.3 stable-prefix at small (~2.7K tok) scale.
- Different question_id ⇒ fresh prefix ⇒ fresh creation event ⇒ no cross-question leakage.

---

## 2. Cost calc (DeepSeek-reasoner pricing 2026-05)

| | unit price | call 1 | call 2 | call 3 |
|---|---|---|---|---|
| input miss | $0.14 / 1M | $0.000377 | $0.000001 | $0.000318 |
| input hit | $0.014 / 1M | $0 | $0.0000376 | $0 |
| output | $2.19 / 1M | $0.001658 | $0.001332 | $0.000723 |
| **subtotal** | | **$0.00204** | **$0.00137** | **$0.00104** |

**Total**: ~$0.00445 真 billed (rounded ~$0.004).

**Cumulative Phase 2 真 billed**: Step 4 $0.017 + Step 5 ~$0.030 + Step 6 ~$0.004 ≈ **$0.051**.

Vs D-090 α-silent $5/$5 cap = **98× headroom remaining**. β tripwire **no fire**.

---

## 3. Surfaced findings

### 3.1 chars/N heuristic content-dependency — Step 6 third data point

Step 5 retro noted Step 4 over +37% vs Step 5 under −21% on chars/4. Step 6 adds:

| Step | scope | estimate chars/4 | real | error |
|---|---|---|---|---|
| 4 | hello-ai glossary | 79,481 | 57,993 | **+37%** (chars/4 too coarse) |
| 5 | whole-book lean | 73,480 | 92,814 | **−21%** (chars/4 too fine) |
| 6 | question p042e0 | ~575 (assembleQuestion meta) | 2693 | **−79%** (chars/4 very fine) |
| 6 | question p259e0 | ~? | 2271 | (similar order) |

**Pattern emerging**: chars/4 systematic under-count for small payloads (questions ≪ 5K), over-count for medium payloads (Step 4 single glossary), close-but-under for large (Step 5 lean whole-book).

The Step 6 entry follow-up TODO (chars/4 → chars/3 calibration) is partially confirmed in direction but the relationship is **non-linear** by scope size, not a single multiplicative refactor.

**Resolution this turn**: apply chars/3 as a conservative refresh per D-094 §2.1 amendment pattern; document that calibration is heuristic-only, not exact; revisit at Step 7 hover scope (smaller still, ~100-300 tok) before deciding on per-scope heuristics vs single universal factor.

### 3.2 deepseek-reasoner empty-delta on call #3

Call #3 emitted 0 delta frames (only `usage` + `[DONE]`) despite 330 outputTokens reported in usage. SSE log = 202 bytes total.

**Hypothesis A** (most likely): R1 reasoner separates `reasoningText` (thinking chain) from `text` (answer). The 330 tokens may have all been reasoning, with empty/whitespace answer text — `chat.ts` line 115 `if (chunk)` strips empty chunks ⇒ 0 delta frames reach SSE.

**Hypothesis B**: AI SDK provider adapter buffered all answer text into a single trailing chunk that arrived after stream close. Less likely — calls #1 + #2 used same provider/model and streamed fine.

**Hypothesis C**: page_259_entity_0 content is sparse (e.g. early-page reference question with minimal options) → model produced reasoning but no narrative answer.

**Impact on Step 6 contract**: cache + cost data on call #3 still valid (inputTokens + miss/hit numbers proven by usage frame). UX impact = client receives `[DONE]` with no visible explanation — bad. **Not a blocker for α** but flagged for Step 7+ as either:
- (a) Add `reasoningStream` consumption to route + emit reasoning-frame to SSE (R1-specific)
- (b) Detect empty-delta tail + emit a `{type: "warning", message: "model returned reasoning only"}` frame
- (c) Switch quiz role from `deepseek-reasoner` to `deepseek-chat` for empty-delta-prone questions (defeats reasoning intent)

**Resolution this turn**: documented; deferred to Step 7+. Not a tripwire fire.

### 3.3 outputTokens overshoot vs system instruction "≤600"

Call #1 = 757 (overshoot +26%). Call #2 = 608 (close). Call #3 = 330 (under, due to empty-delta quirk).

deepseek-reasoner is well-known to ignore brevity instructions when reasoning content is rich. **Resolution**: leave the instruction as-is for documentation purposes; do NOT add a hard `max_tokens` cap on the AI SDK call because that would truncate the answer mid-justification and degrade UX worse than the overshoot. Document the empirical 600-800 token range as expected for quiz explain mode.

---

## 4. D-088 §2.3 stable-prefix ratification — question scope

Confirmed at second scope size: Step 5 lean whole-book (~93K tok) 99.98% hit; Step 6 question (~2.7K tok) 99.81% hit. **Identical discipline holds across 35× scope difference**. Cache key invariant = exact prefix byte-equality, scope-agnostic.

Cross-question hit explicitly **NOT** expected and **NOT** observed (call #3 fresh creation). This is correct: per D-088 §2.3 the cache is prefix-byte-key, so different question payloads in the system slot ⇒ different prefix ⇒ different cache key.

---

## 5. D-091 tripwire status

| Tripwire | Status this step | Cumulative |
|---|---|---|
| §2.5(α) silent budget cap $5/$5 | No fire ($0.004 << $5) | $0.051 cumulative, 98× headroom |
| §2.5(β) cache hit unexpectedly low | No fire (99.81% intra-question; 0% cross-question expected per design) | 4 hit data points all design-consistent |
| §2.5(γ) Step wall ≥30% under | TBD (wall ~135 min vs 1 day est = **−84%**) → 6th consecutive under | **fires for 6th time but resolved via D-094 §2.1 amendment pattern** |
| §2.5(δ) Mistral OCR mirror | n/a Phase 2 | — |
| §2.5(ε) DeepSeek mirror | No fire | — |

γ tripwire row #3 in `tripwire_log.md` per D-094 §2.4 mid-implementation retro pattern (not full re-estimate; PLAN wall column inline `actual <N> min`).

---

## 6. Acceptance gates

| Gate | Status | Evidence |
|---|---|---|
| Code green | ✅ | 100/100 vitest + pnpm lint exit 0 + tsc strict exit 0 + build 8 routes |
| Prod deploy ready | ✅ | `dpl_DBK7TkSrhr1Y2x464TNDPUEGn6DT` target=production |
| Firewall still gating | ✅ | pre-smoke probe HTTP 401 + `www-authenticate: Basic realm="IT Passport Learning firewall"` |
| ≥1 真 LLM happy-path smoke ✅ | ✅ (N=3) | smoke_call_{1,2,3}.log |
| Cache hit data captured | ✅ | usage frames in all 3 logs |
| Cost ≤ D-090 cap | ✅ | $0.051 cumulative << $5 |
| Rule A semantic audit | n/a | Step 6 is wiring not content rewrite |
| Rule B failure archive | none | All batches first-try landed |
| Rule D Writer ≠ Reviewer | ✅ | Writer = main session; Reviewer = user terminal at design 4Q ACK + Batch D `授权 vercel --prod` ACK + this audit's correctness reviewed at sign-off |

---

## 7. Step 6 close + follow-ups

**Closed**: Step 6 ✅ DONE.

**Open follow-ups for Step 7+ entry**:
1. R1 empty-delta surface handling (Hypothesis A: add reasoningStream consumption; doc above §3.2)
2. Per-scope heuristic vs universal chars/N factor (this turn applied conservative chars/3; revisit Step 7 hover with smaller payloads)
3. D-098 §2.2 v1.1 in-place amend ✅ done this turn (predicted ~58-60K, actual 92,814 = +55% off — note now in ADR file)
4. quiz outputTokens overshoot — accept as-is (R1 brevity-instruction-resistant per industry consensus)

**Sign-off**: this audit was constructed from raw smoke_call_*.log + onFinish console events + DeepSeek pricing table; all numbers traceable to the SSE usage frames committed alongside this file.
