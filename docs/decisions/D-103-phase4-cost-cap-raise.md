# D-103 — Phase 4 LLM α-silent cap raise: \$5 → \$15

| 字段 | 值 |
|---|---|
| ID | D-103 |
| Topic | Phase 4 LLM cost cap raise (D-090 α-silent ceiling supersede for Phase 4) |
| Status | **LOCKED 2026-05-22** (Session 53 Turn 6) |
| Supersedes | D-090 §2.x α-silent ceiling **for Phase 4 only** (Phase 1-3 historical \$5 cap unchanged in retrospective record) |
| Superseded by | — |
| Related | D-090 (original Phase 1-3 \$5 cap); D-091 (Phase 2 budget); D-095 (DeepSeek pivot — unit cost baseline for Phase 2/3); D-088 §2.3 (Anthropic prompt caching invariant); D-102 (Phase 4 form + OQ-D answer that triggered this ADR) |
| Closes OQ | n/a (OQ-D round-2 D-102 sub-question; D-102 §7.4 records the resolution cross-reference) |
| Decision-on-lock writeback | `docs/discussion/2026-05-22-session-53.md` §9 same turn (per D-027 §1) |

---

## 1. 背景 / Why

D-090 set the original α-silent ceiling at **\$5** for Phase 1 dry-run + Phase 2/3 development. Cumulative across all 3 phases came in at **\~\$0.66 真**:

- Phase 1 Mistral OCR + LLM pipeline: \~\$0.579
- Phase 2 Anthropic chat / quiz / glossary surfaces: \~\$0.085
- Phase 3 textbook reading trunk (composition-only on frozen Phase 2 SYSTEM): \~\$0

That = **7.6× headroom under cap** at Phase 3 close (`phase3-α-ship-2026-05-22`).

Phase 4 form per D-102 §2.1 = **AI 学习助手** (chat-driven personalized tutor). Per D-102 §7.2 (round-2 OQ-B Session 53 Turn 5), locked infrastructure piece = **Anthropic Claude Sonnet 4.6 / Opus 4.7 + prompt caching**.

Anthropic Claude unit cost (2026-01 pricing per Anthropic public docs):

| Model | Input \$/M | Output \$/M | Cache write premium | Cache read |
|---|---|---|---|---|
| **Sonnet 4.6** | \~\$3 | \~\$15 | 25% | 10% of input |
| **Opus 4.7** | \~\$15 | \~\$75 | 25% | 10% of input |

vs DeepSeek prefix-cached unit cost (Phase 2/3 baseline): \~\$0.07/M input + \~\$1.10/M output. **Anthropic Sonnet is \~40× DeepSeek unit cost on input; \~14× on output.** Opus is another \~5× on top of Sonnet.

Phase 4 projected burn (rough envelope per OQ-D round-2 rationale):

| Stage | Calls | Avg tokens | Cost projection (Sonnet) |
|---|---|---|---|
| Module B Step B.3 cost dry-run | \~10 | \~5K in + \~2K out | \~\$0.18 |
| Module B + C dev sittings | \~100 | \~5K in + \~2K out | \~\$1.80 |
| Module D Playwright/smoke | \~20 | \~5K in + \~2K out | \~\$0.36 |
| Possible Opus 4.7 escalation tail | \~10 | \~5K in + \~2K out | \~\$1.00 |
| **Phase 4 total envelope** | **\~140 calls** | — | **\~\$2-5 真** |

Cumulative all-phases at Phase 4 close projected: \$0.66 + \~\$2-5 = **\~\$3-6 真**. Under the current **\$5 D-090 cap** = **0.6-1.2× over** — **INSUFFICIENT headroom.**

OQ-D round-2 (Session 53 Turn 5) user picked option (b) "Lift to \$10-25 for Phase 4 (D-103 cost ADR)". Per D-029 ADR-for-major-decision threshold, cost-cap change is a major decision and gets its own standalone ADR (this one).

---

## 2. 决定 / Decision

### §2.1 New α-silent cap = \$15 for Phase 4

Lift D-090 §2.x α-silent ceiling from **\$5 → \$15** for Phase 4 development. **\$15** = midpoint of the OQ-D \$10-25 range, chosen **conservatively** to leave headroom for unexpected agentic escalation or Opus 4.7 fallback without immediately re-opening the cap question.

Projected cumulative all-phases at Phase 4 close: **\~\$3-6 真** vs **\$15** cap = **2.5-5× headroom** preserved.

### §2.2 Scope = Phase 4 only

This cap raise is **Phase 4-scoped**:

| Phase | Actual / projected | Applicable cap |
|---|---|---|
| Phase 1 | \~\$0.579 真 (historical) | \$5 D-090 (correct retrospectively) |
| Phase 2 | \~\$0.085 真 (historical) | \$5 D-090 (correct retrospectively) |
| Phase 3 | \~\$0 真 (historical) | \$5 D-090 (correct retrospectively) |
| Phase 4 | \~\$2-5 真 (projected) | **\$15 D-103** ← THIS ADR |
| Phase 5+ | TBD | Re-evaluated per future ADR (Phase 5 form not yet locked) |

### §2.3 Per-call explicit user gate UNCHANGED

Per CLAUDE.md "What you should NOT do without explicit user approval":

> Run any LLM API call (Mistral / Anthropic) that costs money. Phase 1 implementation will need them, but the user opens that gate.

This ADR raises the **visibility ceiling** (the dollar amount above which a separate cap-revision conversation triggers), NOT the **spend authorization**. Every Phase 4 LLM API call still requires explicit user gate:

- **First gate**: Module B Step B.3 cost dry-run (\~10 mock calls; user confirms projection vs cap before proceeding)
- **Second gate**: Module B Step B.4 `/api/tutor` real-LLM ship
- **Third gate**: Module C Step C.3 wire + smoke real LLM
- **Fourth gate**: Module D Step D.2 prod deploy + real-LLM Playwright

### §2.4 Anthropic prompt caching MANDATORY for Phase 4

To stay within the \$15 cap, Phase 4 Module B SYSTEM_INSTRUCTION + stable user-state preamble (chapters completed list + recent quiz history projected to text) **MUST** use Anthropic ephemeral cache blocks (`cache_control: {type: "ephemeral"}`). 5-minute TTL per Anthropic docs.

**Target**: **≥80% cache hit ratio** on input tokens across a single tutoring session (multiple turns within the 5-min TTL window). Below 80% triggers prompt revision in Module B Step B.2 before Step B.3 dry-run gate fires.

### §2.5 Cost tripwire (NEW Phase 4)

Cumulative real Phase 4 spend reaching **\$10 (66% of \$15 cap)** triggers a **mid-implementation cap re-review session**:

- Option 1: Continue with \$15 cap (if projection is back on track)
- Option 2: Lift via supersede ADR (D-104 candidate; \$15 → \$25 or higher)
- Option 3: Pause Phase 4 implementation; re-evaluate scope vs cost

This is independent of γ wall tripwire and runs in parallel.

### §2.6 Reversibility

- D-103 itself can be **superseded** if Phase 4 stays well under \$15 (cap can be lowered back to \$5 for Phase 5 if appropriate) OR exceeds projection (cap raised further via D-104 candidate)
- Phase 4 cap of \$15 does NOT change Phase 1-3 retrospective \$5 cap (historical record preserved per D-090)
- Per-call user gate per CLAUDE.md **also** ensures runaway burn is impossible — user can pause anytime
- Cost tripwire (§2.5) provides a structured re-review checkpoint mid-phase

---

## 3. Rejected Alternatives

| # | Alternative | Why rejected |
|---|---|---|
| 1 | Keep \$5 D-090 cap unchanged | Insufficient headroom for Anthropic-on-tutor unit cost projection (Phase 4 alone projected \~\$2-5 — would consume 40-100% of cap immediately, leaving no buffer for unexpected agentic escalation or Opus 4.7 fallback) |
| 2 | Lift to \$10 (low end of OQ-D range) | Less safety margin if Opus 4.7 escalation tail materializes; \~\$3-6 cumulative + buffer requires \$10-15 — \$10 is marginal |
| 3 | Lift to \$25 (high end of OQ-D range) | Over-provisions for the projected envelope (\~\$3-6); creates moral hazard for unconstrained burn; \$15 is sufficient + leaves room for D-104 supersede if genuinely needed |
| 4 | Lift to \$50+ | Excessive; would require multi-user / β-public posture to justify; not Phase 4 scope (α-private behind D-097 Basic Auth firewall) |
| 5 | Per-module sub-caps (Module A \$0, Module B \$5, Module C \$5, Module D \$5) | Operational overhead unjustified for α-private single-user phase; consolidated \$15 sufficient + simpler tripwire |
| 6 | No cap at all (remove visibility ceiling entirely) | D-090 §2.1 invariant ("cost cap as visibility tool, not spend gate") would be lost — per-call user gate alone doesn't surface cumulative trends |
| 7 | Switch to a cheaper model to stay under \$5 | Already considered in D-102 OQ-B round-2 — user picked Anthropic Claude for instruction-following quality + prompt caching; cost trade-off accepted explicitly via OQ-B |

---

## 4. Implications

- **Phase 4 budget envelope**: \~\$2-5 真 projected; **\$15 cap = 3-7.5× headroom**
- **Cost tripwire**: cumulative real cost ≥ **\$10 (66% of \$15 cap)** triggers mid-implementation cap re-review session per §2.5
- **γ tripwire**: independent of cost; remains **midpoint × 1.0** for Phase 4 N=1 per D-102 §4 (Phase 1/2 unit cost model returns)
- **β tripwire**: re-opens at Module D prod deploy per D-102 §2.5 + §7.4; Phase 4 likely opens a new β bucket since Anthropic ephemeral cache mechanism differs from DeepSeek prefix cache
- **Anthropic prompt caching MANDATORY**: per §2.4 — ≥80% cache hit ratio target on SYSTEM + preamble
- **Phase 5+ unaffected**: this ADR is Phase 4-scoped; Phase 5 cap re-evaluates with its own form lock
- **Per-call user gate unchanged**: CLAUDE.md invariant honored; D-103 raises visibility ceiling only

---

## 5. History

- **2026-05-12 Session 24-25 (D-090)**: Original \$5 α-silent ceiling locked for Phase 1 dry-run
- **2026-05-21 Session 48 (Phase 2 close)**: Cumulative \~\$0.085 真 (Anthropic Sonnet 4.5 across `/api/chat` + `/api/quiz/explain` + `/api/glossary/hover`) — \$5 cap held with massive headroom; D-095 DeepSeek pivot reduced Phase 2 unit cost dramatically vs early-Phase-2 Anthropic projection
- **2026-05-22 Session 52 (Phase 3 close)**: Cumulative \~\$0 真 (composition-only on frozen Phase 2 SYSTEM; zero live LLM calls Session 50-52 implementation) — \$5 cap held; cumulative all-phases at Phase 3 close \~\$0.66
- **2026-05-22 Session 53 Turn 5**: OQ-D round-2 user picked option (b) "Lift to \$10-25 for Phase 4 (D-103 cost ADR)"
- **2026-05-22 Session 53 Turn 6 (THIS ADR)**: D-103 LOCKED — \$5 → \$15 Phase 4 cap raise; ≥80% Anthropic prompt cache hit ratio mandated; cost tripwire at \$10 (66%); per-call user gate preserved per CLAUDE.md
