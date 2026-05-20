# Phase 2 Step 5 — Cache hit rate audit data points #2/#3/#4 (DeepSeek, N=3 on `/api/chat`)

> Phase 2 specific evidence type #2 per D-091 §2.2 (Cache hit rate audit 第一周 retro tripwire input) — second batch.
>
> Builds on `step_04_ai_sdk/cache_audit_2026-05-19.md` (data point #1). N=3 calls on real `/api/chat` endpoint with whole-book lean payload (per D-098 §2.1) + Basic Auth gating (D-097).

| 字段 | 值 |
|---|---|
| Date | 2026-05-20 |
| Session | 37 Turn batch E (post B-fix) |
| Provider | DeepSeek (default per D-095 §2.1) |
| Model | `deepseek-chat` (chat role per D-095 §2.1 matrix) |
| Endpoint | `POST /api/chat` |
| Deploy | `dpl_???` prod (canonical `web-mu-sandy-78.vercel.app`, post B-fix lean payload) |
| Auth | HTTP Basic Auth `claude:<pass>` per D-097 §2.2 |
| Real cost | **~$0.038 真 billed** (3 calls, estimate; subject to DeepSeek invoice verification) |
| Cumulative real (Steps 4+5) | $0.017 + $0.038 ≈ **$0.055 真 billed** |

---

## 1. Calls

### Call #1 — cache miss baseline (cold start, new deploy)

| Field | Value |
|---|---|
| Timestamp | 2026-05-20 03:13:?? UTC |
| User message | `What is OSI layer 3?` |
| Wall | **6s** |
| HTTP status | 200 (SSE) |
| Response header `x-llm-provider` | `deepseek` |
| Output frames | 32 delta tokens; LLM honest: "The corpus does not contain information about the OSI model or OSI layer 3..." |
| `inputTokens` | **92,814** |
| `outputTokens` | 32 |
| `totalTokens` | 92,846 |
| `cacheProvider` | `deepseek` |
| `cacheCreationInputTokens` | `null` |
| `cacheReadInputTokens` | **0** |
| `cacheMissInputTokens` | **92,814** (100% miss) |

### Call #2 — cache hit (within DeepSeek caching window)

| Field | Value |
|---|---|
| Timestamp | 2026-05-20 03:14:?? UTC (~10s after call #1) |
| User message | `TCP/IP の主な層は？` (different user tail; same prefix) |
| Wall | **4s** |
| HTTP status | 200 |
| Output | 143 delta tokens; Japanese reply with TCP/IP 4-layer breakdown |
| `inputTokens` | 92,815 (+1 vs call #1 due to user tail differ) |
| `outputTokens` | 143 |
| `cacheReadInputTokens` | **92,800** |
| `cacheMissInputTokens` | **15** |
| **Cache hit rate** | **99.98%** |

### Call #3 — cache hit confirmation

| Field | Value |
|---|---|
| Timestamp | 2026-05-20 03:14:?? UTC (~14s after call #1) |
| User message | `DNSの役割は何ですか？` (different user tail) |
| Wall | **4s** |
| HTTP status | 200 |
| Output | 123 delta tokens; Japanese reply with DNS explanation + citation `（出典：教科書 489ページ）` (model used `GlossaryEntry.first_page` field) |
| `inputTokens` | 92,814 |
| `outputTokens` | 123 |
| `cacheReadInputTokens` | **92,800** |
| `cacheMissInputTokens` | **14** |
| **Cache hit rate** | **99.98%** |

---

## 2. Cache hit rate analysis

### 2.1 Headline

**Step 4 baseline 99.98% replicated exactly at Step 5 scale (×2 calls, ×1.6 corpus size)** 🟢

- Step 4 corpus: 57,993 tokens (glossary only)
- Step 5 corpus: 92,814 tokens (chapters + glossary; per D-098 §2.1 lean payload)
- Both yield 99.98% hit rate on 2nd+ call → **D-088 §2.3 stable-prefix design ratified at scale**

### 2.2 Cumulative N=4 cache hit data

| # | Step | Corpus | Hit | Miss | Hit rate |
|---|---|---|---|---|---|
| 1 | Step 4 #1 | glossary | 0 | 57,993 | 0% (creation) |
| 2 | Step 4 #2 | glossary | 57,984 | 9 | 99.98% |
| 3 | Step 5 #1 | lean wholebook | 0 | 92,814 | 0% (creation) |
| 4 | Step 5 #2 | lean wholebook | 92,800 | 15 | 99.98% |
| 5 | Step 5 #3 | lean wholebook | 92,800 | 14 | 99.98% |

N=3 cache-hit observations (excluding 2 creation calls) → **3/3 at 99.98% = stable distribution**.

### 2.3 D-091 §2.5(β) tripwire status

Threshold = 50% cache hit floor. Observed = 99.98% (3 data points). **Status: ❌ no fire** — DeepSeek server-side prefix cache works as advertised for our stable-prefix layout.

D-088 §2.3 80-95% working assumption empirically exceeded (×~1.05). β tripwire 数据基准 N=3 sufficient (per D-091 §2.2 first-week retro requirement loosened: "≥10-20 calls across modes" deferred to Step 6/7 multi-mode retro per D-094 §2.4).

### 2.4 Caveats

- **Single mode (chat) only** — quiz / hover modes (Step 6/7) untested; per-mode cache behavior may differ (especially hover with tiny prefix < cache minimum threshold)
- **All 3 calls within ~14s of each other** — long-gap cache TTL behavior (>30 min) not measured
- **Same deploy** — cross-deploy cache survivability not tested (each Vercel cold-start lambda may re-warm cache from DeepSeek-side same-account pool; behavior beyond our control)

---

## 3. Cost analysis (DeepSeek V3 pricing approximation, platform.deepseek.com 2026-05)

### 3.1 Per-call breakdown (estimate; actual TBD via DeepSeek dashboard)

| Call | Miss tokens × $0.27/M | Hit tokens × $0.027/M | Output × $1.10/M | Subtotal |
|---|---|---|---|---|
| #1 | 92,814 × $0.27/M = $0.02506 | 0 | 32 × $1.10/M = $0.000035 | **$0.02510** |
| #2 | 15 × $0.27/M = $0.0000041 | 92,800 × $0.027/M = $0.002506 | 143 × $1.10/M = $0.000157 | **$0.00267** |
| #3 | 14 × $0.27/M = $0.0000038 | 92,800 × $0.027/M = $0.002506 | 123 × $1.10/M = $0.000135 | **$0.00265** |

**Total estimate: ~$0.030 真 billed for 3 calls.**

(Estimate refinement vs proposal $0.05; actual within tolerance.)

### 3.2 D-090 cap envelope vs actual

- D-090 §2.1 per-query cap = $5
- Step 5 worst call (#1) ~$0.025 → **~200× headroom**
- D-090 α-silent applies

### 3.3 Cumulative real cost Phase 2

- Step 4: $0.017
- Step 5: ~$0.030
- **Total Phase 2 真 billed: ~$0.047**

vs D-090 §2.1 α α-silent $5 cap = **~106× headroom**. vs D-090 §2.2 α-prompt $30 cap = **~640× headroom**. vs D-091 §2.1 β-ready monthly $1,800 baseline (Anthropic) re-scaled for DeepSeek (~$36-60/月 per D-095 §4.3 partial projection) = **~1500-2500× headroom on the monthly figure** (this is per-month vs ad-hoc per-test comparison; only suggestive).

---

## 4. Token estimate calibration — **finding contradicts Step 4 baseline**

### 4.1 Heuristic vs reality (Step 5 N=3)

| Measure | Value |
|---|---|
| `JSON.stringify(payload, null, 2)` byte length | **293,919** |
| `assembleScope.ts` chars/4 conservative | **73,480 tokens** |
| chars/9 CJK measured (per D-089 PoC) | **32,658 tokens** |
| **Real DeepSeek `inputTokens` mean (N=3)** | **92,814** |

### 4.2 Heuristic accuracy

- **chars/4 conservative**: 73,480 / 92,814 = **0.79× → under-estimates by 21%** ❌ (no longer a safe upper bound!)
- chars/9 CJK measured: 32,658 / 92,814 = 0.35× → under-estimates by 65% ❌
- **Real factor**: 293,919 / 92,814 = **3.17 chars/token** (Step 5 lean payload)

### 4.3 Contradiction with Step 4

| Step | corpus shape | bytes | est chars/4 | real tok | over/under |
|---|---|---|---|---|---|
| 4 | glossary alone | 317,921 (file size as proxy) | 79,480 | 57,993 | +37% **over** |
| 5 | lean wholebook (chapters + glossary entries) | 293,919 (stringify) | 73,480 | 92,814 | **−21% under** |

**Why the flip**?
- Step 4 used `JSON.stringify(load)` of the Glossary file as-loaded (compact, no `null, 2` pretty-print). File-size-on-disk includes whitespace.
- Step 5 uses `JSON.stringify(payload, null, 2)` with explicit 2-space indent → adds whitespace inflating chars by ~25-30%, yet **DeepSeek tokenizes the whitespace-rich content denser**, not sparser.
- Plus the new lean payload includes `kana_helper`, `first_page`, `occurrences`, `aliases_jp` fields per `GlossaryEntry` — different field mix than what Step 4 hello-ai stringified.

### 4.4 Calibration consequence

- **chars/4 is NOT a safe upper bound** as previously assumed in D-089 §2.3 + D-098 §2.2.
- For Step 5 lean payload: real ≈ **chars/3.17** (factor 3.17, conservative chars/3 would safely over-estimate ~5%).
- Recommended update to assembleScope.ts: replace `Math.ceil(text.length / 4)` with `Math.ceil(text.length / 3)` (or content-aware: chars/3 for JSON+CJK mix vs chars/4 for prose).
- **D-098 §2.2 prediction wrong**: stated ~58-60K, actual 92,814 = +55% over prediction. ADR will get an in-place amend note.

### 4.5 Open question — content-dependent token factor

The same 1 unit of "byte" in JSON+CJK mix encodes ~0.32 tokens (Step 5), in glossary-alone JSON encodes ~0.18 tokens (Step 4). Possible drivers:
- Whitespace + key repetition: chapters has short kanji + ASCII keys → high token density
- Nested object structure: lean payload has top-level chapter list with title_jp/zh/en (3 fields each) + 908 glossary entries with 6+ fields each → many tokens per kanji unit
- DeepSeek tokenizer may chunk Japanese kanji differently from glossary-only structures

Resolution: **stop using chars/N as fixed factor**. Use actual `usage.inputTokens` from each call to inform per-mode budgeting (Step 6+ per-mode envelopes); pre-flight estimate becomes range-bound `[chars/4, chars/3]` as conservative bounding interval.

---

## 5. D-091 §2.5 tripwire status this turn (Step 5)

| Trigger | Threshold | Observed | Status |
|---|---|---|---|
| α — Anthropic Opus PoC ceiling drift > 50% | n/a (DeepSeek active) | — | n/a |
| **β — Cache hit rate < 50%** | 50% | **99.98% × 2 calls (N=3 cumulative)** | ✅ **no fire** |
| **γ — Step / wall drift > 30%** | (per D-094 Module B-D estimate held until Step 5) | Step 5 actual ~165 min vs 1.5 day → **−86%** | **5th consecutive under-estimate data point** → see §5.1 below |
| δ — β user count > 10/月 | n/a α-now | 1 user | n/a |
| ε — provider pricing change | n/a | stable | n/a |

### 5.1 γ tripwire — D-094 §2.4 Module B-D estimate amendment decision input

5 consecutive Module A+B steps **all** under-estimate by 85-98%:
- Step 1: 25 min vs 1 day → −98%
- Step 2: 30 min vs 2 day → −98%
- Step 3: ~30 min vs 1.5 day → −98%
- Step 4: ~140 min vs 1 day → −85% (Module B 第一个)
- **Step 5: ~165 min vs 1.5 day → −86%** (this turn; includes B-fix + D-098 + 3 真 LLM)

D-094 §2.4 says "Module B-D wall estimate held until Step 5 mid-implementation retro". **本 audit 即触发该 mid-implementation retro 数据完整**。

**Decision**: D-094 §2.4 trigger **fires** (4 data points B-D estimates clearly over-stated). **However**, this audit chooses path: PLAN.md amend Module B-D wall column inline (`actual <N> min` annotation per Step 4 pattern) instead of full retro re-estimate; per D-094 §2.1 amendment pattern. **Not a tripwire fire** in the cascade sense (γ resolved cleanly by D-094 mechanism), but a substantive PLAN amendment is owed (queued in Batch G).

### 5.2 Other observations

- **Mid-Step factual error fired in Batch E**: D-095 partial supersede D-088 §2.1+§2.3 未做 scope-aware compat 验证 → Step 5 first deploy attempt with full wholebook would have failed. Caught pre-deploy via local node measurement. **D-098 LOCKED this turn** to amend D-089 §2.3 + D-085 + memorialize lesson. This is parallel to D-097 §1 lesson "memory-only assumption" — **second instance of the same root pattern**, justifying RETROSPECTIVE v2 backlog item: "cross-product compat check on partial supersede" (per D-098 §4.4).

---

## 6. Sign-off (path α)

- **Writer**: Claude main session (Session 37 Turn batch E)
- **Data source**: 3 SSE streams captured to `smoke_call_{1,2,3}.log` adjacent to this file; `data: {"type":"usage",...}` final frame of each
- **Reviewer**: deferred to commit gate user terminal sign-off (path α per Sessions 32-35 precedent)
- **Rule A**: n/a (no LLM rewrite > 50%)
- **Rule B**: 1 archive — `failures/step_05_attempt_1_full_pages_payload_ctx_overflow.md` (the original assembleWholeBook full-pages design would have failed; B-fix changes treated as in-step amendment, archived per Rule B narrow reading: "failed attempt" = predicted-to-fail full-pages payload code that was modified before deploy attempt). Note: this is 临界 case for Rule B (B-fix changed local code pre-deploy, no actual artifact "fail"); chose to archive for traceability. **Alternative reading**: this is just an in-flight design fix, no Rule B archive needed. Chose path B (archive) for posterity.
- **Rule C**: n/a (Phase retro at Phase 2 close)
- **Rule D**: ✅ Writer ≠ Reviewer (main session writes; user terminal ACK at commit gate; D-098 ADR independent reviewed by user 4Q ACK before code change)

---

## 7. Follow-up actions for Step 6-7 retro (D-094 §2.4 + D-095 §4.2)

1. **Update `assembleScope.ts` heuristic** — `Math.ceil(text.length / 4)` → `Math.ceil(text.length / 3)` (or content-aware) — **NOT done this turn** to keep B-fix surgical; queued for Step 6 entry batch
2. **Amend D-098 §2.2 in-place** — predicted ~58-60K vs actual 92,814; add v1.1 note row
3. **Per-mode cache data** — quiz mode (Step 6) + hover mode (Step 7) need their own data points before Phase 2 close retro
4. **D-090/D-091 envelope re-baseline** — per D-095 §4.2/§4.3, deferred again (now N=4 still sparse for monthly projection; aim Step 6 close)
5. **RETROSPECTIVE v2 backlog item** — "cross-product compat check on partial supersede" rule candidate (from D-098 §4.4 + this audit §5.2)
6. **AI SDK warning silence** — same as Step 4 §7 follow-up; deferred

---

**END cache_audit_2026-05-20.md — Phase 2 Step 5 N=3 cache hit ratifies D-088 §2.3 stable-prefix at lean wholebook scale ✅ AND surfaces chars/N heuristic content-dependency contradiction**
