# Phase 4 PLAN — AI 学习助手 (D-102 + D-103 locked)

> **Status**: 设计阶段 ✅ COMPLETE per Session 53 Turn 6. Module A 实施 gate user-pending.
>
> **References**: D-102 (Phase 4 form), D-103 (cost cap), RETROSPECTIVE_phase3.md §3.6 (γ baseline reset to midpoint × 1.0).

---

## §1 Steps (4 modules × ~3-4 steps = ~14 steps total)

| # | Module | Step | Scope | Est wall | Actual | Status |
|---|---|---|---|---|---|---|
| A.1 | Data | Tutor read-surface types | Define `TutorContext` shape projecting `progressStore` → `{completedChapters: ChapterRef[], inProgress: ChapterRef[], pendingChapters: ChapterRef[], recentQuiz: QuizAttempt[]}`. Pure types + projection helpers; vitest cases for projection. No API call. | 60-120 min | TBD | ⏸ pending G1 |
| A.2 | Data | Wire `recordQuizAnswer` into `<QuizExplain />` | Promote RETROSPECTIVE_phase3 §2.3 holdover #1 per D-102 §7.1 — call `recordQuizAnswer(qid, correct)` on Q resolution. vitest update; `<QuizExplain />` surface lifecycle preserved (D-085 §2.4 frozen contract honored — wire is additive, not refactoring). | 60-120 min | TBD | ⏸ pending A.1 |
| A.3 | Data | `loadTutorContext()` helper + tests | Pure helper that reads progressStore + `recordQuizAnswer`-populated quiz dict → emits `TutorContext`. SSR-safe via `StorageLike` (Phase 3 LD-Step3-A pattern). vitest coverage: empty / partial / full progress / quiz history mixed correct+incorrect. | 60-120 min | TBD | ⏸ pending A.2 |
| B.1 | Brain | Lock Anthropic model + SDK setup | Confirm `@anthropic-ai/sdk` version in `apps/web/package.json` supports ephemeral cache blocks. Lock default model `claude-sonnet-4-6`. Document Opus 4.7 escalation criterion (likely "user explicitly asks for harder reasoning" or "Sonnet refuses / gives low-confidence answer"). | 30-90 min | TBD | ⏸ pending A.3 |
| B.2 | Brain | Tutor SYSTEM_INSTRUCTION + cache blocks | Author SYSTEM_INSTRUCTION (progress-aware tutor persona; ITPassport-domain anchored; cite-chapter conventions). Stable preamble block (TutorContext-as-text) wrapped in `cache_control: {type: "ephemeral"}` for 5-min TTL prefix cache. **Target ≥80% cache hit ratio per D-103 §2.4.** vitest snapshot for SYSTEM stability. | 90-180 min | TBD | ⏸ pending B.1 |
| B.3 | Brain | Cost dry-run + **user gate G2** | Run \~10 mock conversations against locked SYSTEM + preamble + Sonnet 4.6. Measure: input tokens / output tokens / cache hit ratio / cost per conversation. **Requires explicit user approval per CLAUDE.md** ("first LLM API call gate"). Compare projected Phase 4 burn vs D-103 \$15 cap. If projection exceeds cap, revise Module B and re-run dry-run before Step B.4. | 60-120 min + user wait | TBD | ⏸ pending B.2 + user gate G2 |
| B.4 | Brain | `/api/tutor` endpoint (or extend `/api/chat` with role=tutor) | Implement Server Action / Route Handler that takes `TutorContext` + chat history → streams Sonnet response. Reuse Phase 2 `useChat` shape if possible. D-097 Basic Auth firewall middleware passes through. vitest + handler-level test for cache-block construction. | 120-240 min | TBD | ⏸ pending B.3 + user gate G3 |
| C.1 | Surface | Decide route (`/[locale]/tutor` vs modal) | Mini D-019 §3a round-Q if intuition isn't unanimous: standalone route ⇒ NavTabs 5th tab ⇒ requires LocaleSwitcher integration; modal inside book trunk ⇒ no new route, lives at `/[locale]/book` chapter end panel as 3rd action button. Both reachable from book context. | 30-60 min | TBD | ⏸ pending B.4 |
| C.2 | Surface | Tutor UI component + i18n | Build `<Tutor />` (route) or `<TutorModal />` (modal) — `useChat` hook talking to `/api/tutor`; conversation history persistence via localStorage (own key `itp:tutor:session:v1`, NOT `historyStore` — D-085 §2.4 untouched); i18n keys via next-intl per D-099 (ja/zh/en chrome). | 120-180 min | TBD | ⏸ pending C.1 |
| C.3 | Surface | Wire to `/api/tutor` + smoke | Connect `<Tutor />` to backend; manual smoke 1 conversation per locale × 3 locales. Verify TutorContext flows in correctly + Anthropic cache blocks fire. | 60-90 min | TBD | ⏸ pending C.2 + user gate G4 |
| C.4 | Surface | NavTabs integration (if standalone route) | If C.1 = standalone, add 5th tab; if modal, skip. Visual demotion of chat/quiz/glossary (already done in Phase 3 LD-1) preserved. | 30-60 min | TBD | ⏸ pending C.3 |
| D.1 | Ship | Vercel preview deploy + Playwright e2e | Push to preview; Playwright spec for tutor surface × 3 locales (open / send message / stream completes / close). Add to existing `apps/web/e2e/` battery. | 60-120 min | TBD | ⏸ pending Module C |
| D.2 | Ship | Vercel prod deploy + axe-core + Lighthouse | Production deploy with `FIREWALL_BASIC_AUTH`; axe-core a11y check on tutor surface; Lighthouse on `/[locale]/book` + tutor route. Append empirical β + axe + Lighthouse rows to RETROSPECTIVE_phase4. | 60-120 min + user gate | TBD | ⏸ pending D.1 + user gate G5 |
| D.3 | Ship | RETROSPECTIVE_phase4.md + tag candidate | Per Rule C — 5 sections (保留下来的做法 / 必须补上的缺口 + Phase 5 hand-off / 关键决策复盘 / tripwire final tables / final posture). Tag candidate `phase4-α-ship-YYYY-MM-DD` (user-gated `freeze phase 4 and tag` per gate G6). | 90-180 min | TBD | ⏸ pending D.2 + user gate G6 |

**γ tripwire baseline**: **midpoint × 1.0** (Phase 1/2 unit cost model returns per RETROSPECTIVE_phase3 §3.6 module-level observation — do NOT use Phase 3's × 0.4 multiplier).

**Estimated total wall**: \~14 steps × \~90 min midpoint = **\~21 hours** (~3 sittings at \~7h each, or ~5-6 sittings at \~3-4h each). Per-step actuals accumulated as Phase 4 progresses; γ tripwire rows logged in RETROSPECTIVE_phase4 §4 + per-step `evidence/phase4/module_X_step_NN_*/design_notes.md` per D-094 §2.1 in-source amendment pattern.

---

## §2 Scope / Out-of-scope

### In scope (Phase 4)

- AI 学习助手 chat-driven personalized tutor reading `progressStore` (chapters + quiz)
- Anthropic Claude Sonnet 4.6 (default) + Opus 4.7 (fallback) with prompt caching (ephemeral cache blocks)
- New surface: `/[locale]/tutor` route OR modal inside book trunk (C.1 to decide)
- `/api/tutor` endpoint (or `/api/chat` extension with role=tutor)
- `recordQuizAnswer` wired into `<QuizExplain />` (RETROSPECTIVE_phase3 §2.3 holdover #1 **promoted to Module A scope** per D-102 §7.1)
- D-103 cost cap \$15 honored; ≥80% Anthropic cache hit ratio target
- Tier 3 ceremony per Phase 2 muscle memory (per-step evidence, full RETROSPECTIVE per Rule C)

### Out of scope (defer to polish / Phase 5+)

- Scroll-position restore wiring (RETROSPECTIVE_phase3 §2.3 holdover #2 — polish list per D-102 §7.1)
- β graduation queue items (RETROSPECTIVE_phase2 §2.1-§2.6 — polish list)
- 错题学习链 / adaptive recommendation (D-101 rejected #11 / D-102 §3 #1 — Phase 5 candidate)
- Multi-user / cross-device session memory (Upstash + server state — Phase 5/6 candidate per D-102 §7.2 rejection)
- Vercel AI Gateway / model A/B (Phase 5 candidate per D-102 §7.2 rejection)
- Anthropic Agent SDK with tools (agentic over-engineering for v1; Phase 5 evolution per D-102 §7.2 rejection)

---

## §3 Tier 3 evidence convention (mirror Phase 1/2/3)

Per step `X.N`:

- `evidence/phase4/module_X_step_NN_<topic>/tree_outline.md` — file tree of step changes
- `evidence/phase4/module_X_step_NN_<topic>/build_log.txt` — `next build` output (where applicable)
- `evidence/phase4/module_X_step_NN_<topic>/test_results.txt` — vitest output
- `evidence/phase4/module_X_step_NN_<topic>/design_notes.md` — LD-N inline patterns + γ tripwire row + Rule A/B disposition + Rule C/D posture

Per module mid-retro (optional, if module wall > 4 hours): brief retrospective note appended to `RETROSPECTIVE_phase4.md` interim draft.

Phase 4 close: full `RETROSPECTIVE_phase4.md` per Rule C (5 sections per RETROSPECTIVE_phase3.md template).

---

## §4 Gate sequence (per CLAUDE.md "Phase/stage signaling" + cost gate convention)

| Gate | Trigger | Action |
|---|---|---|
| **G1** Module A 实施 | User explicit `开始 Phase 4 Module A` (or step-level `开始 Phase 4 Module A Step A.1`) | Step A.1 opens; types-only work — no LLM cost |
| **G2** Module B cost dry-run | After Module A close + user explicit `开始 Phase 4 Module B` | Steps B.1 + B.2 land; Step B.3 cost dry-run triggers **explicit user approval per CLAUDE.md** before first Anthropic API call |
| **G3** Module B Step B.4 real LLM ship | After B.3 dry-run + user confirms projection vs D-103 cap | Step B.4 ships `/api/tutor` endpoint with real Anthropic burn |
| **G4** Module C 实施 | After Module B close + user explicit `开始 Phase 4 Module C` | C.1-C.4 land; C.3 fires real LLM calls (re-uses G3 approval scope) |
| **G5** Module D `push it` | After Module C close + user explicit `push it` | D.1 + D.2 deploy chain; preview then prod |
| **G6** `freeze phase 4 and tag` | After Module D + user explicit `freeze phase 4 and tag` | Annotated tag `phase4-α-ship-YYYY-MM-DD` + GitHub Release per Phase 1/2/3 precedent |
| **G7** Cost tripwire (D-103 §2.5) | Cumulative real cost ≥ \$10 (66% of D-103 cap) — any time during Phase 4 | Pause + user review session to revise D-103 (raise via D-104 candidate / lower / proceed-with-eyes-open) |

---

## §5 Tripwire baseline (Phase 4 N=1 forthcoming)

| Tripwire | Baseline | Phase 4 expectation |
|---|---|---|
| **γ** wall vs PLAN midpoint | Phase 1/2: midpoint × 1.0; Phase 3: midpoint × 0.4 (composition-only) | Phase 4 = new-infra path → **reset to midpoint × 1.0** (do NOT inherit Phase 3 multiplier) |
| **β** prefix cache hit ratio | Phase 2 N=14 cumulative: ≥95% on DeepSeek prefix cache; Phase 3 re-opens deferred | Phase 4 opens **NEW β bucket** (Anthropic ephemeral cache, different mechanism); target **≥80% on input tokens** (per D-103 §2.4) |
| **δ** runtime detector | Phase 2 LIVE silent via `apps/web/src/lib/ai/tripwire.ts` | Carries over; will catch tutor surface anomalies |
| **ε** model release / pricing | Phase 2/3 no fire | Continues; Anthropic pricing changes monitored |
| **α** model deprecation (D-095 §2.5) | Phase 2/3 no fire (DeepSeek stable) | Sonnet 4.6 stable per Anthropic public roadmap; no fire expected Phase 4 |
| **Cost tripwire (NEW Phase 4)** | n/a Phase 1-3 (cumulative \~\$0.66 vs \$5 = 7.6× headroom) | Trigger at **≥ \$10 cumulative real Phase 4 spend** (66% of D-103 \$15 cap) → cap re-review session per §4 G7 |

---

## §6 Rejected alternatives

Already enumerated in:

- **D-102 §3** (9 rejected — form / infra / holdovers / steps round-1)
- **D-102 §7** (round-2 rejected — signals / model / module-decomp / cost envelope)
- **D-103 §3** (7 rejected — cap value range)

PLAN.md inherits all rejections without re-listing here.

---

## §7 STATUS

| Field | Value |
|---|---|
| Phase 4 | **设计阶段 ✅ COMPLETE Session 53** |
| D-102 (form) | ✅ LOCKED Session 53 Turn 6 |
| D-103 (cost cap) | ✅ LOCKED Session 53 Turn 6 |
| PLAN.md | ✅ On disk (this file) |
| Module A 实施 gate (G1) | ⏸ user-pending |
| Module B/C/D gates (G2-G6) | ⏸ downstream (gated on prior module close + user signal) |
| Cost tripwire (G7) | ⏸ silent until first real Anthropic API call at Module B Step B.3 |
| RETROSPECTIVE_phase4.md | ⏸ future commitment (Phase 4 close, Module D Step D.3) |
| γ tripwire baseline | midpoint × 1.0 (NOT Phase 3 multiplier) |
| β tripwire | re-opens at Module D prod deploy with Anthropic-cache mechanism (new bucket) |
