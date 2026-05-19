# D-088 — Phase 2 AI Model + Version Pin + Prompt Cache Policy

| 字段 | 值 |
|---|---|
| Status | **LOCKED final** — Session 29 Turn 6 user terminal sign-off path α 2026-05-19 |
| Phase | Phase 2 设计阶段 (in progress) |
| Decision date | 2026-05-19 |
| Session | Session 29 (Turn 5) |
| Supersedes | none |
| Sub-ADR of | D-087 §2.5 (Vercel AI SDK + `@ai-sdk/anthropic`) |
| Input ADRs | D-085 §2.4 (mode-dependent Chat scope) / D-069 (Phase 1 Anthropic precedent) / D-071 (cost cap pattern → feeds D-090) / D-083 §2.5 (Phase 2 大方向) |
| Input evidence | `evidence/phase2_d088_poc_2026-05-19/` (γ PoC: summary.md + quality_matrix.md + cost_table.md + 12 raw_logs) / Session 28 Turn 2 β PoC corpus + cost math |
| Granularity | **g3** (deep level: specific model + version pin policy + cache structure + fallback + tripwire) |

---

## §1 Context

D-087 locked the **stack** (Next.js 15 + Vercel AI SDK + `@ai-sdk/anthropic` + SSR) but punted model selection details. D-085 §5.3 flagged whole-book Chat LLM cost cap as Session 27+ risk. Session 28 β PoC corrected D-085 §5.3 RAG assumption (whole-book 0.84M tokens FITS 1M ctx Sonnet/Opus). Session 29 γ PoC ran 12-subagent model quality test (4 queries × 3 models) and produced quantitative quality matrix + cost table.

This ADR makes the model pick concrete. Per Q4=g3 (Session 29 Round 1), this lock includes:
- Specific default model
- Version pin strategy (α vs β)
- Prompt cache config structure
- Fallback / retry behavior
- Re-evaluation tripwire criteria

The PoC findings recommended a tiered routing (Sonnet default + Opus premium + Haiku tooltip). User overrode to **全 Opus 4.7** per Q6=c, reasoning: max-plan OAuth makes α-now cost-neutral; signature kana_helper experience (project core motivation per `feedback_no_book_identity.md` + D-012 + iter 5-8 retro) benefits most from Opus's pedagogical depth (γ PoC Q5 = ★★★★★+ external rating, syllable-level kana breakdown + 一句话锚点 mnemonic table).

---

## §2 Decisions (g3 deep level)

### §2.1 Default AI model = **Claude Opus 4.7**

All Phase 2 Chat / Explain / Summary / Hover scopes (per D-085 §2.4 mode-dependent table) use **Claude Opus 4.7** as the single model. No per-scope routing logic.

Reasoning:
- **Quality (PoC verdict)**: Opus 4.7 = ★★★★★ avg 5.0 external rating across Q1 (legal explain) / Q2 (term tooltip) / Q3 (chapter summary) / Q5 (kana edge — project signature use case). See `evidence/phase2_d088_poc_2026-05-19/quality_matrix.md`.
- **Pedagogical depth**: Opus delivers exam-prep tips (真题年份 references, sister-law cross-references, syllable-level kana scaffolding) that Sonnet 4.6 only partially matches and Haiku 4.5 misses.
- **Signature use case (Q5 kana)**: Opus's syllable-level breakdown (拗音/促音/長音 explanation) + mnemonic table directly serves the project's core motivation (kana_helper for non-native learners; D-012 + iter 5-8 retro 9 systemic patterns including katakana issues).
- **α-now cost neutrality**: max-plan OAuth (D-069 precedent) means $0 effective billing under existing Claude Max subscription (~$200/mo flat). Per-call Anthropic shadow tracked for visibility (cost_table.md §3 daily mix estimate Opus-everywhere = ~$7.92/day shadow / ~$238/mo theoretical billed).
- **Simplicity**: single-model implementation avoids routing complexity (no per-scope toggle, no model-mismatch consistency bugs).

Identifier: Anthropic model alias `claude-opus-4-7` (per §2.2 version pin policy).

### §2.2 Version pin policy = **Hybrid (α=alias, β=date string)**

| Phase stage | Pin form | Example | Rationale |
|---|---|---|---|
| α-now (Phase 2 设计 + Phase 2 实施 alpha) | Anthropic alias | `claude-opus-4-7` | Auto-track latest 4.7 minor / pick up bug fixes + quality improvements without manual ops; dev velocity priority |
| β switch (OQ-40 closes — public users come online) | Full date string | `claude-opus-4-7-YYYYMMDD` | Immutable model behavior for production reproducibility; manual升级 via D-080 v1.1 §8 amendment; β stability priority |

**Transition trigger**: OQ-40 (β 开放时间窗 / 触发条件) close event. At that point:
1. Identify current Opus 4.7 minor version (`claude-opus-4-7-YYYYMMDD`)
2. Run regression γ PoC equivalent against the pinned date string
3. Amend D-088 §2.1 + §2.2 with locked date string
4. Document switch in session log + RETROSPECTIVE.md

Phase 1 D-069 precedent: used date strings throughout (`claude-sonnet-4-5-20240620` etc) — that was production-shipping content extraction. Phase 2 α dev velocity is different — alias is appropriate.

### §2.3 Prompt cache policy = **System + glossary block cached (ephemeral); user msg + assistant history NOT cached**

Cache config:

```ts
// Anthropic SDK / Vercel AI SDK provider config
{
  model: 'claude-opus-4-7',  // α alias per §2.2
  system: [{
    type: 'text',
    text: SYSTEM_INSTRUCTIONS + '\n\n' + GLOSSARY_BLOB,
    cache_control: { type: 'ephemeral' }  // single cache block, system + glossary
  }],
  messages: [...]  // NOT cached
}
```

Sizes (per Session 28 β PoC + Session 29 cost_table.md):
- System instructions: ~500 tokens
- Glossary blob (v1.0.3 full, 908 entries): ~90K tokens
- Total cached: ~90.5K tokens per query
- User message: ~50 tokens (not cached)
- Assistant history: variable (not cached)

Pricing impact (Opus 4.7):
- Cache write (first call): 1.25× input = 90.5K × $18.75/M = **$1.70**
- Cache read (subsequent within 5min TTL): 0.1× input = 90.5K × $1.50/M = **$0.14**
- Expected hit rate within active learning session: **80-95%** (system + glossary constant across turns; user only varies user_msg)

TTL: **5 minutes ephemeral** (only Anthropic option as of 2026-05). After 5min idle, cache cold → re-write on next query.

Corpus excerpt per query (page JSON / chapter pages bundled per D-085 §2.4 scope routing): passed as part of user message OR as separate non-cached content block (D-089 will lock the storage + loading strategy). NOT cached at α-now (per-scope corpus excerpt varies → cache write cost would exceed read savings within 5min).

### §2.4 Fallback chain + retry policy = **Single retry, no cross-model fallback**

Behavior on Opus 4.7 API failure (5xx / `overloaded_error` / timeout / network):

```
Opus 4.7 call
  ↓ (fail)
exponential-backoff wait (2s, then 4s)
  ↓
Opus 4.7 retry (1 attempt only)
  ↓ (fail again)
surface user-facing error → "AI 暂时不可用，请稍后重试。"
log internal error for debugging
```

**No cross-model fallback** (no Sonnet/Haiku as Plan B):
- Avoids behavioral inconsistency (different model = different answer for same question = confusing UX)
- α-now max-plan OAuth: real Opus 4.7 downtime statistically rare
- Implementation simplicity
- If real downtime becomes systemic issue → tripwire §2.5(β) triggers γ PoC re-run + D-088 amendment

User-facing error UX:
- Display friendly message in Chinese: "AI 暂时不可用，请稍后重试。"
- Optionally show "服务状态" link to Anthropic status page (Session 30+ implementation detail)
- Do NOT silently downgrade to a different model

### §2.5 Quality tripwire (re-evaluate model pick) = **all conditions (δ)**

D-088 §2.1 model choice + §2.2 version pin auto-flag for re-evaluation when ANY of:

| # | Trigger | Action |
|---|---|---|
| α | Anthropic releases new major Opus model (Opus 5.0 / new tier) | File new OQ-NN; auto-candidate review at release time; rerun γ PoC against new model |
| β | User reports ≥3 quality issues within 1 week (qualitative defects on Phase 2 Chat output) | File new OQ-NN; rerun γ PoC (12 subagents × current Opus 4.7 vs candidates) |
| γ | OQ-40 (β open time window) closes | Full re-eval: γ PoC + cost recalc + version pin freeze to date string per §2.2 |
| Annual floor | No trigger fires for 12 months | Lightweight γ PoC re-run (4 queries × current Opus latest minor) to detect silent drift |

Process after trigger:
1. File OQ-NN with trigger description + evidence link
2. Run γ PoC equivalent (4 queries × candidate models, evidence/phase2_d088_poc_YYYY-MM-DD/)
3. If findings ≥ 1 star difference vs current D-088 lock → amend D-088 §2.1 / §2.2 per D-080 v1.1 §8 pattern
4. Document amendment in session log + STATE.md sync + new ADR entry referencing D-088

---

## §3 Out-of-scope (deferred)

| Topic | Session | Note |
|---|---|---|
| **D-089** 数据源 contract | Session 30+ | How `/api/chat` loads v1.0.3 corpus (FS read at server boot / Vercel Blob / DB) / manifest schema / per-scope excerpt assembly |
| **D-090** LLM cost cap | Session 30+ | Three-tier $/day soft / mid / hard caps (复用 D-071 pattern) / per-query hard cap / max-plan vs billed tracking; will inherit cost_table.md §3 baseline |
| **D-091** state mgmt | Session 30+ | Chat history persistence / per-mode tab state / Resume-last per D-085 §2.2 |
| D-092+ | Session 30+ | UI library / icon set / 字体 / i18n / test stack / Lighthouse budget |
| D-093+ β-future | β open milestone | Auth / multi-user / DB / per-user cost attribution / SSO / version pin date-string switch per §2.2 |
| step 5 Tier + Phase 2 budget | Session 30+ | After D-088/D-089/D-090 all locked, evaluate Phase 2 Tier (likely Tier 3) + budget |

---

## §4 Rejected alternatives

### §4.1 Q6 routing alternatives

- **(a) Sonnet 4.6 default + Opus opt-in (whole-book / 深度) + Haiku for hover** — Recommended by γ PoC `quality_matrix.md` §Routing as path-of-least-cost. **Rejected**: α-now cost saving N/A under max-plan OAuth ($0 billed flat-rate); routing complexity (per-scope model toggle + premium opt-in UI) not worth it for α single user; signature kana_helper Q5 benefits from Opus depth.
- **(b) 全 Sonnet 4.6 single-model** — Rejected: ~80-90% of Opus quality, loses signature kana_helper syllable-level depth (γ PoC Q5 Opus = ★★★★★+ vs Sonnet ★★★★★ — the "+" matters for project's core motivation). Cost saving N/A under max-plan.
- **(d) Sonnet + Opus dual without Haiku** — Rejected: still has routing complexity, loses Haiku 10× cost saving for term hover (N/A in α anyway). Inferior to (c) all-Opus simplicity.
- **(e) 全 Haiku** — Implicit rejection (H2 conditional weak per γ PoC verdicts).

### §4.2 Q7 version pin alternatives

- **(a) Alias always** (`claude-opus-4-7`) — Rejected: β production reproducibility risk if Anthropic ships behavior-changing minor; β stability priority overrides dev velocity.
- **(b) Full date string always** (`claude-opus-4-7-YYYYMMDD`) — Rejected: α dev velocity hit (manual upgrade ritual on every Anthropic release); Phase 2 design phase doesn't need β-level immutability yet.

### §4.3 Q8 cache policy alternatives

- **(b) System ONLY cached, no glossary** — Rejected: glossary is ~99% of cached input size (90K of 90.5K total); caching system alone gives ~0.5% of the savings.
- **(c) System + glossary + per-chunk corpus cached** — Rejected: corpus chunk varies per query → cache write cost likely exceeds 5min TTL read savings for α single user; viable β-future optimization (D-090 / D-091 territory).
- **(d) Cache all including user msg + history** — Rejected: Anthropic API doesn't support; would be invalid config.

### §4.4 Q9 fallback alternatives

- **(a) Opus → Sonnet fallback** — Rejected: cross-model behavioral inconsistency; same query → different answer = confusing UX; routing complexity.
- **(b) Opus → Haiku fallback** — Same as (a) plus larger quality drop.
- **(c) No retry** — Rejected: too brittle; transient network blip kills query.

### §4.5 Tripwire alternatives

- **(α only)** Major model release only — Misses user-reported quality regressions; misses β transition.
- **(β only)** User report only — Misses silent model drift (Anthropic minor change without user noticing) + new model opportunity.
- **(γ only)** β only — Misses α-period quality changes.

---

## §5 Consequences

### §5.1 Positive

- **Highest signature quality**: Opus 4.7 = strongest kana_helper experience (project's core differentiator per D-012 + iter 5-8 retro).
- **Implementation simplicity**: single-model, no per-scope routing, no premium UI toggle to design.
- **α cost neutrality**: $0 effective via max-plan OAuth; Anthropic shadow tracking for visibility.
- **Cache efficiency**: ~90% of input cached → expected 80-95% hit rate within active sessions → effective per-query cost ~10% of uncached.
- **Version hybrid**: α dev velocity (alias) + β production stability (date string) — best of both worlds.
- **All-tripwire (δ)**: keeps D-088 honest across model releases + user feedback + β transition + annual drift.
- **No fallback / single retry**: brittle to network blips but transparent user UX; no cross-model behavioral surprise.

### §5.2 Risks + mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| β cost spike (Opus 5× Sonnet at multi-user scale) | High | D-090 cost cap (Session 30+) MUST land before OQ-40 closes; tripwire §2.5(γ) forces β re-eval |
| Opus 4.7 deprecation by Anthropic | Medium | Tripwire §2.5(α) catches major release; hybrid version pin §2.2 silently absorbs minor changes |
| 5min cache TTL idle gap | Low | 80-95% expected hit rate within active session; idle gaps re-pay write cost (1.25× input on cold) |
| No fallback → user sees error on real Opus 5xx | Low | 1-retry covers transient (98%+ of blips); persistent → tripwire §2.5(β) triggers |
| User overrides PoC routing recommendation → cost over-engineering at β | Medium | Tripwire §2.5(γ) re-evals routing at β open; user explicitly accepted via Q6=c with full awareness of max-plan OAuth offset |
| Subagent dispatch path didn't measure real cache hit rate (H3 deferred) | Low | run_poc.ts artifact at `.phase2-spike/scripts/run_poc.ts` is canonical measurement tool; Phase 2 implementation can run it before β to confirm 80-95% baseline |

### §5.3 Implementation handoff (consumed by Session 30+ implementation gate)

When Phase 2 实施 starts:

1. Pin `@ai-sdk/anthropic` to a version supporting `claude-opus-4-7` alias + `providerOptions.anthropic.cacheControl`
2. Wire `/api/chat` route per §2.3 cache structure (single ephemeral cache block on system + glossary)
3. Implement 1-retry exponential-backoff wrapper around `streamText` per §2.4
4. Log `cache_read_input_tokens` / `cache_creation_input_tokens` to internal metrics for §2.3 hit rate validation
5. **Block β open** until D-090 cost cap implemented (per §5.2 high-severity risk)
6. Document tripwire process per D-080 v1.1 §8 amendment pattern; add to RETROSPECTIVE.md Phase 2 retro template
7. At β open (OQ-40 close): execute version pin switch per §2.2 transition trigger

---

## §6 References

- `docs/decisions/D-069-anthropic-via-agent-sdk.md` — Phase 1 Anthropic max-plan OAuth + date-string pin precedent
- `docs/decisions/D-071-budget-cap-and-emergency-halt.md` — three-tier cost cap pattern, will feed D-090
- `docs/decisions/D-080-stage6-partial-polish.md` v1.1 §8 — amendment pattern referenced for tripwire response
- `docs/decisions/D-083-phase2-direction.md` §2.5 — Phase 2 partial close OQ-05; α-now / β-ready framing
- `docs/decisions/D-085-phase2-form-mainline.md` §2.4 — mode-dependent Chat scope table (question / chapter / whole-book)
- `docs/decisions/D-085-phase2-form-mainline.md` §5.3 — LLM cost cap whole-book risk handoff
- `docs/decisions/D-087-phase2-stack.md` §2.5 — Vercel AI SDK + `@ai-sdk/anthropic` integration; this ADR's parent
- `docs/discussion/2026-05-19-session-28.md` Turn 2 — β PoC corpus + cost math (0.84M tokens FITS 1M ctx; cached baseline $1.22/day cached Sonnet-default-mix)
- `docs/discussion/2026-05-19-session-29.md` Turn 2 — γ PoC plan (L1-L11)
- `docs/discussion/2026-05-19-session-29.md` Turn 3 — γ PoC findings inline
- `evidence/phase2_d088_poc_2026-05-19/summary.md` — H1-H4 hypothesis verdicts + 5 model pick recommendations
- `evidence/phase2_d088_poc_2026-05-19/quality_matrix.md` — per-query side-by-side ratings (★ scale)
- `evidence/phase2_d088_poc_2026-05-19/cost_table.md` — Anthropic pricing baseline + daily mix estimate + D-090 three-tier candidate
- `evidence/phase2_d088_poc_2026-05-19/raw_logs/` — 12 model outputs (Sonnet/Opus/Haiku × Q1/Q2/Q3/Q5)
- `.phase2-spike/` — gitignored scaffold (Next.js 15 + Vercel AI SDK shape) + `scripts/run_poc.ts` runtime artifact
- Memory `project_max_plan_billing.md` — max-plan OAuth $0 billed precedent
- Memory `feedback_no_book_identity.md` — non-native learner motivation for kana_helper depth

---

## §7 Sign-off

| # | Reviewer | Role | Date | Status |
|---|---|---|---|---|
| W | Claude (Session 29 Opus 4.7 main session) | Writer | 2026-05-19 | DRAFT → FINAL |
| 1 | (user) | Owner / Reviewer | 2026-05-19 | **APPROVED** (path α terminal sign-off, Session 29 Turn 6) |

**LOCKED final** — Session 29 Turn 6 user terminal sign-off path α 2026-05-19.
