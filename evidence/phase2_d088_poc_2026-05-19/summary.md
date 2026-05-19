# Phase 2 D-088 γ PoC — Summary

> **Status**: PoC complete (Session 29 Turn 3, 2026-05-19). Findings drive D-088 g3 ADR lock in Session 29 Turn 5+.
> **Rule A note**: this summary compresses ~6.5K total tokens of model outputs into ~1.5K tokens of verdicts (>50% compression) → cite specific lines from `raw_logs/` for each verdict. Independent audit = comparing all 12 raw files line-by-line against this summary.
> **Rule D note**: Writer agents (12 × `general-purpose` subagents with sonnet/opus/haiku model overrides) ≠ Reviewer (main Opus 4.7 session, this file). Different agent contexts.

---

## 1. PoC scope (recap)

Per Session 29 Turn 2 plan L1-L11, Q5=α sign-off:

- **Hypotheses tested**: H1 (Sonnet sufficient quality) / H2 (Haiku sufficient for question/term scope) / H3 (cache hit rate ≥50%) / H4 (Vercel AI SDK stack code-level works)
- **Scaffold**: `.phase2-spike/` gitignored, hand-scaffolded minimal Next.js 15 + Vercel AI SDK demo (not `npm install`ed, not runtime-validated — code-shape only). See `.phase2-spike/README.md`.
- **Model quality dispatch**: 4 queries × 3 models = 12 subagents in parallel, each writes answer to `raw_logs/{query_id}_{model}.md`.
- **Q4 whole-book scope**: DEFERRED from PoC (β PoC math already validates 0.84M tokens fits 1M ctx; runtime cache hit measurement deferred to Phase 2 implementation).

---

## 2. Hypothesis verdicts

### H1 — Sonnet 4.6 sufficient quality for question/term/chapter explain

**Verdict**: ✅ **CONFIRMED for default**.

Evidence:
- **Q1 legal explain** (`Q1_question_p087_sonnet.md`): hits both 不正アクセス types (auth misuse + security hole), identifies correct laws for each wrong choice (著作権法 / 名誉毀損 / 刑法175), clean summary table. Self-quality 4/5 — externally agreed.
- **Q2 term explain** (`Q2_term_3D_printer_sonnet.md`): concise (~110 tokens output), mentions テクノロジ系 category placement.
- **Q3 chapter summary** (`Q3_chapter_strategy_p175_184_sonnet.md`): 5 bullets, JP term + reading + concept format, covers IoT/組込み/インダストリー4.0/レコメンデーション/Society 5.0.
- **Q5 kana edge** (`Q5_kana_edge_p181_sonnet.md`): romaji per choice, correctness reasoning, plus a kana memory tip table — handles レコメンデーション「デー」长音 correctly. Direct fit for project's signature kana_helper motivation.

Pedagogical depth is ~80-90% of Opus quality, at 5× lower cost. Strong default.

### H2 — Haiku 4.5 sufficient for question/term scope

**Verdict**: ⚠️ **CONDITIONAL** — usable for simple term lookup, weak for explain/chat.

Evidence:
- **Q1** (`Q1_question_p087_haiku.md`): correct verdict on B, identifies wrong-choice laws, but misses second access type (security hole), and incorrectly invokes 児童ポルノ禁止法 for D (technically a different framework not specifically in scope for ITパスポート explain).
- **Q2** (`Q2_term_3D_printer_haiku.md`): correct, ~95 tokens, but more generic; no ITパスポート category placement; no kana phonetic teaching.
- **Q3** (`Q3_chapter_strategy_p175_184_haiku.md`): 5 bullets, but Haiku has minor JP accuracy issues:
  - Romanizes 組込みシステム as `kumikomikomareta shisutemu` (typo, should be `kumikomi shisutemu`)
  - Lists JIT/ジャストインタイム as 5th bullet — possibly peripheral or hallucinated for the 10-page sample (need source audit)
- **Q5** (`Q5_kana_edge_p181_haiku.md`): all 4 romaji correct in result but writes `furasshu makettingu` (missing 长音 in māketingu); no syllable-level breakdown; no signal-word mnemonic.

For project's signature use case (Q5 kana_helper), Haiku **misses the pedagogical core** — answering "what does the kana sound like" without the syllable-level scaffolding that non-native learners need.

**Routing recommendation**: Haiku acceptable for **simple term hover** (Q2-style), NOT for question explain (Q1) or kana edge (Q5).

### H3 — Prompt caching hit rate ≥50%

**Verdict**: ⛔ **NOT MEASURED IN POC** — requires real Anthropic API access with cache_control headers.

Reasoning:
- Subagent dispatch path does NOT expose `cache_read_input_tokens` / `cache_creation_input_tokens` in agent response metadata (those are Anthropic API observability surfaces, not subagent surfaces).
- Per project memory `project_max_plan_billing.md`: max-plan OAuth $0 billed but no direct API metadata access from our session.
- The `run_poc.ts` script (`.phase2-spike/scripts/run_poc.ts`) IS the canonical artifact for runtime measurement — runnable when user provides API key in Session 30+ implementation.

**Theoretical baseline** (from Anthropic docs):
- Cache write cost: 1.25× input token cost
- Cache read cost: 0.1× input token cost (90% discount)
- TTL: 5 min (ephemeral)
- Expected hit rate for IT Passport Chat with stable system prompt + corpus block: **~80-95%** for recurring queries within session (system + glossary stay constant; only user message varies)

**Deferred to D-088 implementation**: real runtime hit rate via `run_poc.ts` execution OR Phase 2 dev environment.

### H4 — Vercel AI SDK + @ai-sdk/anthropic stack works (code-level)

**Verdict**: ✅ **CONFIRMED at code-shape level**; ⚠️ **runtime not validated**.

Evidence:
- `.phase2-spike/app/api/chat/route.ts`: uses `streamText` from `ai`, `anthropic` provider from `@ai-sdk/anthropic`, ephemeral cache via `providerOptions.anthropic.cacheControl`. Standard Vercel AI SDK v5 pattern.
- `.phase2-spike/app/page.tsx`: uses `useChat` hook from `ai/react`, connects to `/api/chat`. Standard client pattern.
- `.phase2-spike/scripts/run_poc.ts`: raw `@anthropic-ai/sdk` with `cache_control: { type: 'ephemeral' }` on system block — canonical Anthropic API shape.
- `package.json` pins Next 15 + React 19 (D-087 §2.1/§2.7 compliant) + TS strict (D-087 §2.2 compliant).

**Not validated** (deferred):
- `npm install` resolves all packages without conflict
- Dev server boots and serves Chat page
- Streaming actually streams to client (not just renders at end)
- Real API call with cache_control returns expected metadata

These need `npm install` + API key — Phase 2 implementation gate (Session 30+).

---

## 3. Model pick recommendation for D-088 §2

| Scope | Recommended default | Reasoning |
|---|---|---|
| **Question explain (D-085 §2.4 Quiz mode "Explain" button)** | Claude **Sonnet 4.6** | H1 confirmed; Opus 4.7 marginal quality gain ≠ worth 5× cost for typical question; Haiku 4.5 misses access-type nuance (H2 weak) |
| **Term hover popover (D-085 §2.5 Study mode hover)** | Claude **Haiku 4.5** | H2 confirmed for simple lookup; tooltip-length output fits Haiku's strengths; 10× cheaper than Sonnet |
| **Chapter Chat (D-085 §2.4 Study mode chapter scope)** | Claude **Sonnet 4.6** | 72K tokens within Sonnet 1M ctx; Opus quality gain real on Q3 but cost premium high; Haiku JP accuracy concerns on chapter-scope content |
| **Whole-book Chat (D-085 §2.4 独立 Chat tab)** | Claude **Sonnet 4.6** (default) + **Opus 4.7** opt-in for premium | β PoC validated 840K fits 1M ctx Sonnet; Sonnet $2.52 uncached vs Opus $12.60 — let user opt into Opus for "deep dive" mode; Haiku 200K ctx excludes this scope |
| **kana_helper edge case (signature use case)** | Claude **Sonnet 4.6** minimum; **Opus 4.7** for "deep explain" mode | Q5 shows Sonnet is fully capable; Opus adds syllable-level depth which is project's core motivation — worth offering as premium |

**Default model for D-088 §2.1**: **Claude Sonnet 4.6** (`claude-sonnet-4-6` alias).
**Premium routing for D-088 §2.5**: Opus 4.7 opt-in for whole-book Chat and explain "deep" mode.
**Haiku routing for D-088 §2.5**: term hover popover only (D-085 §2.5 Study hover); explicit allowlist, not default.

---

## 4. Latency observations

From subagent dispatch wall time (excludes subagent overhead, indicative only — real LLM API streaming will be different shape):

| Query | Sonnet wall | Opus wall | Haiku wall |
|---|---|---|---|
| Q1 (small) | 41s | 65s | 16s |
| Q2 (tiny) | 26s | 20s | 15s |
| Q3 (chapter ~20K input) | 28s | 40s | 16s |
| Q5 (small) | 36s | 54s | 19s |

Haiku 4.5 is ~3× faster wall time, mostly due to smaller model + less tool overhead. For Chat streaming UX, **time-to-first-token (TTFT)** matters more than total — not measurable from subagent dispatch path; deferred to runtime.

---

## 5. Open items for D-088 g3 lock (Session 29 Round 2)

The PoC validates the framework; remaining open Q for ADR sub-items:

1. **Version pin string**: `claude-sonnet-4-6` alias (auto-tracks latest 4.6 minor) vs full `claude-sonnet-4-6-20YYMMDD` (immutable, manual update)
2. **Cache TTL choice**: ephemeral (5min) is the only Anthropic option as of 2026-05; document as 5min hard
3. **Cache boundary**: system + glossary block cached (90% of prompt) / user message NOT cached / messages history NOT cached — standard pattern, confirm
4. **Fallback chain**: Sonnet 4.6 → ? on 5xx / overloaded → Opus 4.7 (higher avail) or Haiku 4.5 (cheaper)
5. **Quality bar tripwire**: when do we re-evaluate model pick? D-080 v1.1 §8 amendment trigger criteria

These = Round 2 Q9-Q12 (next turn).

---

## 6. PoC cost / wall actuals

| Metric | Estimate (γ plan) | Actual |
|---|---|---|
| Shadow LLM cost | $5-20 | **$0 visible** (max-plan OAuth via subagent dispatch; no direct billable LLM calls from main session) |
| Real billed cost | $0 | **$0** (run_poc.ts not executed; subagent dispatch on max-plan) |
| Wall time | 2-3h soft, 4h hard | **~45 min** (scaffold 15 + dispatch 5 + analysis 25) |
| Subagent calls | 12 | **12** (all returned success) |
| Subagent shadow tokens | ~250K input + 60K output | ~270K input + ~50K output (per total_tokens fields ~565K aggregate but includes prompt overhead) |

Significantly under budget — γ PoC came in faster + cheaper than estimated because subagent path bypassed real-API setup.

---

## 7. References

- Raw outputs: `evidence/phase2_d088_poc_2026-05-19/raw_logs/` (12 files)
- Side-by-side quality: `evidence/phase2_d088_poc_2026-05-19/quality_matrix.md`
- Pricing baseline: `evidence/phase2_d088_poc_2026-05-19/cost_table.md`
- Scaffold: `.phase2-spike/` (gitignored, see `.phase2-spike/README.md`)
- Session log: `docs/discussion/2026-05-19-session-29.md` Turn 3 inline
- Linked ADRs: D-087 §2.5 (stack) / D-085 §2.4 + §2.5 (form mode-dependent scope) / D-069 (Phase 1 Anthropic precedent) / D-071 (cost cap pattern for D-090)
