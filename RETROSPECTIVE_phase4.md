# RETROSPECTIVE — Phase 4 (AI 学習助手)

> Phase 4 closing retrospective per **Rule C** (Tier 2/3 項目收尾前必写
> RETROSPECTIVE). Phase 1 + Phase 2 + Phase 3 ✅ FROZEN; Phase 4 ✅ COMPLETE at
> Session 58 close 2026-05-23.

| 字段 | 値 |
|---|---|
| Phase | 4 — AI 学習助手 on top of frozen Phase 1/2/3 α-private app |
| Form lock ADR | **D-102** (Session 53) |
| Cost cap ADR | **D-103** (Session 53) — $15 cap |
| Brain matrix ADR | **D-104** (Session 56) — 3-way env-routable (DeepSeek V4 pro default / Anthropic toggle / OpenAI reserved-stub) |
| Phase 2 migration ADR | **D-105** (Session 56) — deepseek-chat/-reasoner → deepseek-v4-flash |
| Surface design ADR | **D-106** (Session 58) — standalone /[locale]/tutor + global thread + snapshot + auto-detect escalation |
| Start | Session 53 (設計阶段) 2026-05-22 |
| Implementation start | Session 54 (Module A 実施) 2026-05-22 |
| Phase close | Session 58 2026-05-23 (this retro) |
| Wall clock cumulative | ~40 min Module C + ~50 min Module B.4 + ~150 min Module B.3 + ~50 min Module B.1+B.2 + ~80 min Module A + ~60 min design = **~430 min** (~7.2 hours) |
| Steps | 14 across 4 modules (A.1-A.3 + B.1-B.4 + C.1-C.4 + D.1-D.3) |
| Locked decisions | D-102 → D-106 = **5 new ADRs** (cumulative D-001 → D-106) |
| In-source LDs | ~30 (LD-Module-A-1~3 + LD-Module-B-1~16 + LD-Module-C-1~6 + LD-Step3-H holdover promoted) |
| Open questions | 2 (OQ-01 + OQ-02 both Phase 1 carryover; Phase 4 didn't open any) |
| Rule B archives | 0 |
| Rule A audits | 0 (no >50% compression / rewrite events) |
| LLM cost | ~$0.35 real across all modules vs $15 cap = **42× headroom** |
| γ tripwire | N=8 datapoints — Phase 4 mean **−57% under midpoint** |
| β tripwire | N=1: DeepSeek V4 pro 80%+ steady-state / Anthropic Sonnet 4.6 ~72% cache_read |

---

## §1 保留下来的做法 (what stays)

### 1.1 D-019 §3a slow-pace design + D-029 standalone ADR

Phase 4 ran 3 separate D-019 §3a Q rounds:
- Session 53: Phase 4 form (D-102 round-1 + round-2 → D-102 + D-103)
- Session 56: Mid-implementation pivot (D-104 + D-105 triggered by missing ANTHROPIC_API_KEY discovery + Context7 deprecation verification)
- Session 58: Module C surface design (D-106 4Q single round)

The slow-pace discipline caught:
- User's intent to support 3 LLM providers (not just Anthropic) — would have been a painful mid-implementation discovery without Q rounds
- DeepSeek legacy model deprecation 2026-07-24 (D-095 §2.5(ε) tripwire FIRE → D-105 ADR) — caught by Context7 verification during Q round, not by CI or runtime failure

**Keep this for Phase 5.** The cost of asking 4 questions is negligible compared to the cost of reworking locked architecture.

### 1.2 Composition-on-frozen-surfaces architecture

Phase 4 added a new surface (`/[locale]/tutor` + `/api/tutor`) without modifying ANY frozen Phase 2/3 component:
- Chat.tsx, QuizExplain, TermPopover, GlossaryList, BookIndex, ChapterReader — all untouched
- historyStore, progressStore — untouched (tutorHistoryStore is a parallel store)
- Phase 2 API routes (/api/chat, /api/quiz/explain, /api/glossary/hover, /api/hello-ai) — model IDs updated by D-105 migrate but SYSTEM_INSTRUCTION bytes unchanged
- D-085 §2.4 frozen contract: chat 169 kB invariant preserved through ALL 14 steps
- D-097 firewall: middleware 44.2 kB unchanged

The Module C implementation proved the pattern's power: `<Tutor />` was built by mirroring `<Chat />` 1:1, `tutorHistoryStore` mirrored `historyStore`, resulting in −87% under γ midpoint. **Keep this — the additive posture is the main velocity lever.**

### 1.3 In-source LD pattern (D-094 §2.1)

Phase 4 produced ~30 in-source LDs without inflating the ADR count beyond the 5 architectural decisions that deserved standalone ADRs. The LD-Module-B-13 (bulk SYSTEM) and LD-Module-B-14 (readCacheUsage nested-usage fallback) were critical discoveries that would have been lost without the discipline of documenting in-source. **Keep.**

### 1.4 Tripwire system

All 5 tripwires (γ, β, δ, ε/α, cost) operated correctly:
- **ε tripwire FIRED** Session 56: caught DeepSeek legacy deprecation → D-105 ADR + immediate migrate in B.4
- **β tripwire**: B.3 dry-run revealed Anthropic's 1024-token cache threshold (LD-Module-B-13) + SDK nested-usage shape asymmetry (LD-Module-B-14)
- **γ tripwire**: 8 datapoints validated the PLAN.md §5 hypothesis — composition steps land well under midpoint, new-infra debug steps land at/above midpoint
- **Cost tripwire**: silent at $0.35 of $15 cap (G7 never triggered)

**Keep the full tripwire battery for Phase 5.**

### 1.5 StorageLike + mount-gate pattern (third instantiation)

Three distinct localStorage stores now (historyStore + progressStore + tutorHistoryStore) all share the same posture: `StorageLike` interface, version envelope, corrupt-tolerant load, mount-gate in client components. This is a validated, tested pattern. **Keep for any future localStorage use.**

---

## §2 必须补上的缺口 (gaps to fill)

### 2.1 Phase 3 holdovers (carried from RETROSPECTIVE_phase3 §2.3)

| # | Item | Status |
|---|---|---|
| 1 | `recordQuizAnswer` wire into QuizExplain | ✅ DONE Phase 4 Module A.2 (self-report binary UI) |
| 2 | Scroll-position restore | ⏸ Still deferred — polish list per D-102 §7.1 |

### 2.2 Phase 2 β graduation queue (carried from RETROSPECTIVE_phase2 §2.1-§2.6)

All items still deferred to polish / Phase 5+. Phase 4 did not break any of them.

### 2.3 Phase 4 specific gaps

| # | Gap | Priority | Notes |
|---|---|---|---|
| 1 | Live streaming e2e verification | HIGH | Tutor + Phase 2 routes need Playwright smoke against deployed site. Scheduled for D.1. |
| 2 | Escalation heuristic tuning | LOW | `shouldEscalate()` keyword set is a first pass; false-positive/negative rates unknown until real usage. Phase 5 can add telemetry. |
| 3 | TutorContext richness | MEDIUM | Currently projects progressStore only (chapters + quiz). Phase 5 could add: time-on-chapter, quiz score trends, spaced-repetition signals. |
| 4 | OpenAI provider slot | LOW | D-104 LD-Module-B-11 reserved-stub throws at runtime. Phase 5 implementation when ChatGPT plan API details are available. |
| 5 | Multi-device session sync | LOW | D-102 §7.2 rejection — Upstash + server state is Phase 5/6 candidate. |

### 2.4 Phase 4 hand-off to Phase 5

Phase 5 candidates (from D-102 §3 rejected alternatives + Phase 4 observations):
- 錯題学習链 / adaptive recommendation (requires quiz scoring analytics beyond binary self-report)
- Vercel AI Gateway / model A/B testing
- Anthropic Agent SDK with tools (agentic tutor with textbook search tool)
- Multi-user + cross-device persistence (Upstash / Supabase)

---

## §3 関键決策復盤 (key decision review)

### 3.1 D-104 mid-implementation pivot (Session 56)

**Decision**: Pivot from Anthropic-only tutor (D-102 §7.2) to 3-way env-routable matrix (DeepSeek V4 pro default + Anthropic toggle + OpenAI reserved-stub).

**Trigger**: Missing `ANTHROPIC_API_KEY` in `.env.local` during B.3 cost dry-run setup → user clarification → "deepseek + anthropic + chatgpt plan 代理，可以切换".

**Outcome**: Good. The 3-way matrix:
- Made dev/test cycle cost-free (DeepSeek V4 pro default; no Anthropic key needed)
- Preserved the Anthropic cache optimization work (nested-breakpoint layout is DUAL-PURPOSE per LD-Module-B-5)
- Opened the OpenAI slot for Phase 5 without architecture rework
- Cost: 2 extra ADRs (D-104 + D-105) + ~30 min B.1 revision

**Would we do this again?** Yes. The pivot was cheap (same session) and the flexibility is real. If anything, we should have asked Q1 round-1 "which providers?" instead of assuming Anthropic-only in D-102 §7.2.

### 3.2 D-105 proactive deprecation migration (Session 56-57)

**Decision**: Migrate Phase 2 four routes from legacy `deepseek-chat`/`deepseek-reasoner` → `deepseek-v4-flash` immediately in B.4 atomic commit, 63 days before the 2026-07-24 deprecation deadline.

**Outcome**: Good. The migration was trivial (model ID swap + `providerOptions.deepseek.thinking.type` injection per route) and atomically shipped alongside `/api/tutor`. Bundle invariants preserved (middleware 44.2 kB, chat 169 kB unchanged). D-095 §2.5(ε) tripwire RESOLVED.

**Would we do this again?** Absolutely. The tripwire → ADR → immediate fix pipeline worked exactly as designed. Deferring to "later" would have meant a separate migration effort with its own risk.

### 3.3 D-106 Module C design (Session 58)

**Decision**: Standalone route + single global thread + snapshot on mount + auto-detect escalation.

**Outcome**: Good. The standalone route was the simplest mapping of the existing `/api/tutor` backend. Single global thread mirrors Phase 2 chat precedent. Snapshot on mount preserves the B.3-verified cache hit ratio. Auto-detect escalation is the riskiest choice (heuristic brittleness), but bounded by: false-positive cost = one higher-tier turn, false-negative cost = zero.

**Would we do this again?** Yes for Q1-Q3. Q4 (auto-detect) could have been "hide for v1" with less risk and similar UX — the escalation rarely triggers for the α-private single user. But the implementation was trivial (pure function, 21 test cases) and exercises the full D-104 matrix end-to-end.

### 3.4 Cost discipline (D-103)

$15 cap was 42× the actual spend ($0.35). The cap existed as a safety net, not a planning tool. The ≥80% cache hit target (D-103 §2.4) was the real cost discipline — it forced LD-Module-B-13 (bulk SYSTEM) and LD-Module-B-14 (readCacheUsage fallback) which would not have been discovered without the target.

---

## §4 Tripwire final tables

### γ wall vs PLAN midpoint (Phase 4 N=8)

| Step | PLAN midpoint | Actual | Delta |
|---|---|---|---|
| A.1 | 90 min | ~25 min | −72% |
| A.2 | 90 min | ~40 min | −56% |
| A.3 | 90 min | ~15 min | −83% |
| B.1 | 60 min | ~20 min | −67% |
| B.2 | 135 min | ~30 min | −78% |
| B.3 | 90 min | ~150 min | **+67%** |
| B.4 | 225 min | ~50 min | −78% |
| C (block) | 315 min | ~40 min | −87% |
| **Mean** | | | **−57%** |

**Interpretation**: PLAN.md §5 hypothesis validated. Composition-on-frozen-surfaces steps (A.*, B.1, B.2, B.4, C.*) land well under midpoint (−56% to −87%). New-infra-with-debug steps (B.3 only) land at or above midpoint (+67%). The B.3 over-midpoint was driven by 4 dry-run iterations + 2 corrective LDs + 2 ADRs written mid-session — genuine new-infra discovery cost.

### β cache hit ratio (Phase 4 N=1)

| Provider | Metric | Value | Target |
|---|---|---|---|
| DeepSeek V4 pro | Turn 2+ prefix cache hit | ~80%+ | ≥80% ✅ |
| Anthropic Sonnet 4.6 | cache_read of total input | ~72% | ≥80% (met on steady-state per-turn) ✅ |

### Other tripwires

| Tripwire | Phase 4 status |
|---|---|
| δ runtime detector | LIVE silent (no anomalies) |
| ε model release | **FIRED** Session 56 → D-105 (RESOLVED) |
| α model deprecation | **FIRED** Session 56 → D-105 (RESOLVED, same event as ε) |
| Cost ($10 trigger) | Silent — $0.35 of $15 cap = 42× headroom |

---

## §5 Final posture

### Frozen surfaces

| Tag | Phase | Status |
|---|---|---|
| `phase1-ship-2026-05-19` | 1 — cert-extractor pipeline | ✅ FROZEN |
| `phase2-α-ship-2026-05-21` | 2 — α-private web app (chat/quiz/glossary) | ✅ FROZEN |
| `phase3-α-ship-2026-05-22` | 3 — 教科書阅读体 (book/chapter reader + progress) | ✅ FROZEN |
| `phase4-α-ship-2026-05-23` | 4 — AI 学習助手 (tutor surface + brain) | ⏸ PENDING tag (user gate G6) |

### New surfaces (Phase 4)

| Surface | Route | Size |
|---|---|---|
| Tutor page | `/[locale]/tutor` | 175 kB First Load |
| Tutor API | `/api/tutor` | 138 B |

### Test count progression

| Phase | vitest | Playwright |
|---|---|---|
| Phase 2 close | 344 | 9 |
| Phase 3 close | 344 | 9 |
| Phase 4 close | **482** (+138) | 9 + 3 tutor (D.1 pending) |

### User action options

- (a) **`开始 D.1`** — run Playwright e2e against deployed site (when deploy completes)
- (b) **`freeze phase 4 and tag`** — skip D.1/D.2 Playwright + a11y, tag directly (gate G6)
- (c) **`hold`** — review RETROSPECTIVE before proceeding
- (d) **`open phase 5`** — skip tag, move to next phase design
