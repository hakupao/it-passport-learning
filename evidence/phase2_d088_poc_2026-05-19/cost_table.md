# Cost Table — Phase 2 D-088 γ PoC

Anthropic API pricing baseline (2026-05, source: docs.anthropic.com/en/docs/about-claude/pricing) + estimated per-scope cost projections for D-088 / D-090 sizing.

---

## 1. Per-model unit prices (USD per million tokens)

| Model | Input | Output | Cache write (1.25× input) | Cache read (0.1× input) | Context |
|---|---|---|---|---|---|
| Claude Sonnet 4.6 (`claude-sonnet-4-6`) | $3.00 | $15.00 | $3.75 | $0.30 | 1M |
| Claude Opus 4.7 (`claude-opus-4-7`) | $15.00 | $75.00 | $18.75 | $1.50 | 1M |
| Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | $0.80 | $4.00 | $1.00 | $0.08 | 200K |

**Cache TTL**: 5 minutes (ephemeral, only TTL option).
**Cache discount**: 90% off input cost for cache_read.
**Cache write surcharge**: 25% extra on first call to populate cache.

---

## 2. Per-call cost estimate by scope (D-085 §2.4 mode-dependent)

Assumptions:
- Input includes system prompt (~500 tokens) + glossary block (varies by scope strategy) + corpus excerpt (varies) + user message (~50 tokens)
- Output ~800 tokens for question/term/chapter; ~1500 for whole-book "deep" answer
- "Cached" = system + glossary + corpus all cached; only user msg + output uncached

### 2.1 Question scope (single page ~3K tokens)

| Model | Uncached | First call (cache write) | Subsequent (cache read) |
|---|---|---|---|
| Sonnet 4.6 | $0.009 (in) + $0.012 (out) = **$0.021** | +25% input = **$0.024** | $0.0009 + $0.012 = **$0.013** |
| Opus 4.7 | $0.045 + $0.060 = **$0.105** | **$0.116** | $0.0045 + $0.060 = **$0.065** |
| Haiku 4.5 | $0.0024 + $0.0032 = **$0.006** | **$0.006** | $0.0002 + $0.0032 = **$0.003** |

### 2.2 Term scope (~1.5K tokens)

| Model | Uncached | Cached |
|---|---|---|
| Sonnet 4.6 | **$0.008** | **$0.005** |
| Opus 4.7 | **$0.038** | **$0.020** |
| Haiku 4.5 | **$0.002** | **$0.0008** |

### 2.3 Chapter scope (~72K tokens)

| Model | Uncached | First call | Cached (90% discount on 72K) |
|---|---|---|---|
| Sonnet 4.6 | $0.216 (in) + $0.012 (out) = **$0.228** | **$0.270** | $0.022 + $0.012 = **$0.034** |
| Opus 4.7 | $1.080 + $0.060 = **$1.140** | **$1.350** | $0.108 + $0.060 = **$0.168** |
| Haiku 4.5 | $0.058 + $0.003 = **$0.061** | **$0.072** | $0.006 + $0.003 = **$0.009** |

### 2.4 Whole-book scope (~840K tokens — Sonnet/Opus only, Haiku ctx limit)

| Model | Uncached | First call | Cached (90% discount on 840K) |
|---|---|---|---|
| Sonnet 4.6 | $2.520 (in) + $0.023 (out) = **$2.543** | **$3.150** | $0.252 + $0.023 = **$0.275** |
| Opus 4.7 | $12.600 + $0.113 (out) = **$12.713** | **$15.750** | $1.260 + $0.113 = **$1.373** |
| Haiku 4.5 | — (200K ctx limit) | — | — |

---

## 3. Daily cost estimate for α-now single user (informs D-090)

Per Session 28 β PoC baseline mix:

| Activity | Calls/day | Avg scope | Cached cost (Sonnet default) | Premium (Opus opt-in) |
|---|---|---|---|---|
| Question explain | 40 | question 3K | 40 × $0.013 = **$0.52** | 40 × $0.065 = $2.60 |
| Term hover | 30 | term 1.5K (Haiku) | 30 × $0.0008 = **$0.024** | — |
| Chapter Chat | 7 | chapter 72K | 7 × $0.034 = **$0.238** | 7 × $0.168 = $1.18 |
| Whole-book Chat | 3 | whole-book 840K | 3 × $0.275 = **$0.825** | 3 × $1.373 = $4.12 |
| **Daily total (Sonnet default + Haiku hover)** |  |  | **~$1.61/day** | |
| **Daily total (Opus everywhere)** |  |  |  | **~$7.92/day** |
| **Monthly (~30 days)** |  |  | **~$48/mo** | **~$238/mo** |

**Three-tier cost cap candidates** for D-090 (Session 30+), reusing D-071 pattern:
- **Soft cap**: $3/day (≈ 50% over expected baseline; warn user, continue)
- **Mid cap**: $10/day (≈ 5× baseline; require confirmation per query)
- **Hard cap**: $30/day (matches PoC budget; auto-halt)

Per-query hard cap: $5 (single whole-book Opus uncached = $12.71 → blocked; single Sonnet whole-book uncached = $2.54 → allowed).

---

## 4. Auth strategy cost implications

| Auth | Real billed | Visibility |
|---|---|---|
| **Max-plan OAuth** (Phase 1 default, D-069 precedent) | $0 (covered by Claude Max subscription, ~$200/mo flat) | Visible in Anthropic shadow only |
| **Real ANTHROPIC_API_KEY** (per-call billed) | Real $$$ | Visible in usage dashboard |

For α-now (single user, Phase 2 dev/prototype): **max-plan OAuth = $0 effective** as long as user has Claude Max subscription.

For β-ready (multi-user, public hosting): real API key, costs hit. D-090 cap critical.

---

## 5. Sources

- Anthropic pricing public docs (2026-05 snapshot, subject to change before β)
- Session 28 β PoC corpus measurement (`docs/discussion/2026-05-19-session-28.md` Turn 2)
- D-069 Phase 1 max-plan OAuth precedent
- D-071 Phase 1 three-tier cost cap pattern (Phase 1 used $5 / $20 / $50 mid-Stage 5 dry-run; Phase 2 scale calibrated above)
