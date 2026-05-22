# RETROSPECTIVE — Phase 3 (B 学习站 / 教科书阅读体)

> Phase 3 closing retrospective per **Rule C** (Tier 2/3 项目收尾前必写
> RETROSPECTIVE). Phase 1 + Phase 2 ✅ FROZEN; Phase 3 ✅ COMPLETE at
> Session 52 close 2026-05-22.

| 字段 | 值 |
|---|---|
| Phase | 3 — 教科书阅读体 (B 学习站) on top of frozen Phase 2 α-private app |
| Form lock ADR | **D-101** (Session 49) |
| Start | Session 49 (设计阶段) 2026-05-22 |
| Implementation start | Session 50 (实施阶段) 2026-05-22 |
| Phase close | Session 52 2026-05-22 (this retro) |
| Wall clock cumulative | ~225 min implementation (Sessions 50-52) + ~60 min design (Session 49) |
| Steps | 3 (Reader 壳 / Inline triggers / Progress + close) |
| Locked decisions | D-001 → D-101 unchanged from Phase 2 close; **0 new ADR Phase 3** |
| Open questions | 2 (OQ-01 + OQ-02 both Phase 1 carryover; Phase 3 didn't open any) |
| Rule B archives | 0 |
| Rule A audits | 0 (no >50% compression / rewrite events) |
| γ tripwire | N=3 datapoints — Step 1 −71% / Step 2 −53% / Step 3 −53% (all under midpoint, mean −59%) |
| β tripwire | N=14 cumulative final from Phase 2 (Phase 3 added 2 new /api/chat call paths but no live LLM smoke fired in development; β re-opens at user-gated deploy) |

---

## §1 保留下来的做法 (what stays)

### 1.1 D-019 §3a slow-pace design phase

Two rounds of 4Q AskUserQuestion in Session 49 (Q1-Q4 + OQ-A-D)
landed the Phase 3 architecture cleanly without rework. The product
pivot ("currently you only have chat + quiz + glossary, that's not a
textbook learning experience, I want a textbook I can read end to
end") came directly from the user in Turn 3 — and the 4Q + 4Q
discipline turned that into D-101 + 4 LDs in the same session. **Keep
this for Phase 4.**

### 1.2 D-094 §2.1 in-source LD pattern

Phase 3 produced 17 in-source LDs (LD-1~LD-4 round-2 + LD-Step1-A~E +
LD-Step2-A~H + LD-Step3-A~H) without minting a single new D-NNN ADR.
The pattern correctly distinguishes architectural decisions (D-101)
from implementation patterns (LDs) and keeps the ADR registry tight.
**Keep this; it's the right granularity.**

### 1.3 Tier 3 evidence per step

Three step folders under `evidence/phase3/step_NN_*/` with tree_outline +
build_log + test_results + design_notes each. Total ceremony cost
~30 min per step (Phase 2 estimate held). Without this, the
post-deploy verifier (Playwright + axe-core + Lighthouse) would have
no anchor for "what did Step N intend to ship?" **Keep.**

### 1.4 Composition-only architecture

D-101 §2.5 locked "reuse Phase 2 infrastructure (zero API / middleware
/ AI prompt changes)". Outcome:

- Zero `/api/*` route changes across all 3 steps
- Zero AI SYSTEM_INSTRUCTION mutations (D-088 §2.3 / D-095 §2.3
  stable-prefix invariant trivially preserved)
- Zero D-097 firewall changes
- Zero D-099 next-intl chrome changes
- Phase 2 frozen components (Chat / QuizExplain / TermPopover / Glossary)
  imported verbatim and used as-is

The result: chapter route bundle +62 kB First Load total over 3 steps,
chat surface unchanged at 169 kB First Load (Phase 2 invariant
preserved). **Keep this architectural posture for Phase 4** — the
β-graduation queue from RETROSPECTIVE_phase2.md is the right place to
break frozen surfaces, NOT inside additive phases.

### 1.5 SSR-safe localStorage with StorageLike + mount-gate

Two distinct uses of localStorage in this project now (historyStore +
progressStore) and both share the same posture:

- `StorageLike` interface decouples vitest (node env) from production (`window.localStorage`)
- `schemaVersion`-gated envelope with corrupt-tolerant load (parse error / shape mismatch → empty fallback)
- Mount-gate pattern in client islands (`useEffect → setMounted(true) + loadProgress`)

Phase 4 can reuse this exact recipe for any new client-side persistent
state. **Keep.**

### 1.6 γ wall-drift tripwire as a planning instrument

PLAN.md inline `actual ~N min` amend per step (D-094 §2.4 mid-retro
pattern) without full re-estimate. Phase 3 produced 3 datapoints all
under midpoint; the convergence narrative is in design_notes per step.
This kept PLAN.md as a working document rather than a stale wishlist.
**Keep.**

---

## §2 必须补上的缺口 (gaps to fill — β graduation queue carries forward)

### 2.1 β graduation queue from RETROSPECTIVE_phase2.md (still β-deferred)

Phase 3 did NOT close any of the Phase 2 holdovers:

| Holdover | Phase 2 source | Phase 3 disposition |
|---|---|---|
| R1 empty-delta hard fix | §2.1 | Still deferred; UI safety net in `<QuizExplain />` onComplete handles the symptom; root cause = reasoningStream consumption is still β |
| `[cap-wall]` real-prod evidence ~$1.37 真 | §2.2 | Still deferred — no prod billing event in Phase 3 (composition only) |
| `meta-description` SEO 1-line | §2.3 | Still deferred — Phase 3 routes inherit Phase 2 layout posture |
| Vercel logs CLI suppression | §2.4 | Still deferred |
| PHASE2_CAP_MODE β choice | §2.5 | Still deferred |
| Custom domain (D-092 §3) | §2.6 | Still deferred |

Phase 4 has the same β queue. None of these blocked Phase 3 shipping.

### 2.2 Phase 3 new holdovers

| Holdover | Source | Disposition |
|---|---|---|
| **`recordQuizAnswer` not wired into `<QuizExplain />`** | LD-Step3-H | Shipped as helper-only to keep D-085 §2.4 Phase 2 surface frozen. Phase 4 should wire it when adaptive quiz scoring becomes meaningful (D-101 §2.6 holdover). Currently `quiz: {}` is the steady state in localStorage. |
| **Scroll position restore on chapter re-entry** | progressStore exports `recordChapterScroll` + `scrollY` slot but no UI wires it yet | Helper + slot in schema for future "resume where you left off" UX. Not in PLAN.md §1 Step 3 row (which only required completion gate). Tier 3 ceremony preserves the slot via schemaVersion=1; no breakage cost to ship the UI later. |
| **Browser-based reviewer chain (Playwright + axe-core + Lighthouse) deferred to user-gated deploy** | LD-Step3-G | Phase 3 ships at build-time gate level (vitest + tsc + eslint + next build). On user `push it` signal: Vercel prod deploy + axe-core + Lighthouse + Playwright e2e on the new chapter routes. Phase 2 Step 14+15 toolchain reuse — no new infrastructure. |
| **β empirical data on chapter chat + paragraph translate prefix cache hit** | β tripwire | Phase 3 added 2 new /api/chat call paths but no live LLM calls fired. β data re-opens at deploy. Expected: ≥95% prefix cache hit on both paths per design_notes_step02 §6 + design_notes_step03 §6 (stable-prefix invariant audit). |
| **Adaptive recommendation (错题再来 / 弱章加强)** | D-101 rejected alternative #11 | Explicitly Phase 4 territory. Not in Phase 3 scope. |

### 2.3 Phase 4 hand-off list

For when the user opens Phase 4:

1. Wire `recordQuizAnswer` into `<QuizExplain />` finalize handler — single-line addition with localStorage write on each Q resolved
2. Wire scroll position restore using existing `recordChapterScroll` helper + `scrollY` slot — `useEffect` on chapter mount + `scrollTo(0, progress.chapters[nn].scrollY ?? 0)`
3. Decide Phase 4 form (D-101 §2.6 deferred until Phase 3 实施反馈; deferred is now lifted — Phase 3 is closed). Likely candidates: AI 学习助手 (D-083 §2.5 deferred form) or 错题学习链 (adaptive recommendation)
4. Re-open β tripwire data collection on prod for the new chapter chat / translate paths
5. Address β graduation queue items if they're now blocking (some may be)

---

## §3 关键决策复盘 (key decision review)

### 3.1 D-101 — Phase 3 形态锁 (Session 49 Turn 4)

**Decision**: B 学习站 = textbook reading trunk at `/[locale]/book` as
canonical Phase 3 form. Chat / quiz / glossary stay as Phase 2 escape
hatches with NavTabs visual demotion.

**Looking back**: This was the correct call. The user's Turn 3
substantive feedback was the strongest possible signal that the prior
3-surface flat structure was NOT the product they wanted. Locking the
book as the trunk reframed everything else as "tools inside the
book", which is what the inline triggers (Step 2) operationalize.

**Counterfactual**: Had we instead opened Phase 3 as "AI 学习助手" (the
Phase 2-rejected D-083 §2.5 deferred form), we would have shipped more
backend work (new SYSTEM prompt, possibly new endpoints) and likely
duplicated the chat surface. The book-trunk choice was strictly
additive.

### 3.2 LD-2 / LD-Step2-E — Selection toolbar = translate-only

**Decision**: Inline selection toolbar exposes only `译中` / `译英`
buttons. No chat or quiz triggers inside the toolbar.

**Looking back**: User Session 49 Turn 5 sub-clarification was the
right intuition. Mixing chat/quiz/translate in the selection toolbar
would have created a "mystery meat menu" UX problem where the user
isn't sure which action a selection enables. Restricting to translate
(the one action that naturally maps to "a selected passage") kept the
interaction model clean. The 章末区 picks up chat + quiz at a different
scope (whole chapter, not selection).

### 3.3 LD-3 / LD-Step3-C — Scroll-to-end gate via IntersectionObserver sentinel

**Decision**: 章节完成 commit gated by a 1×1 sentinel at the top of the
gate panel; sticky once tripped; manual button click commits.

**Looking back**: The scroll-gate prevents the most obvious false
positive ("scroll past everything in 2 seconds to mark complete"). The
manual button click acknowledges that "I scrolled past" ≠ "I read it";
the user has agency. Alternative considered: auto-commit on
scroll-to-end was rejected for that reason.

**Edge case**: First-visit re-entry to an already-completed chapter
shows the completion badge immediately (skips the gate sentinel logic).
This is the right thing — the gate is for the first-time-through case,
not for repeated visits.

### 3.4 LD-Step2-A / LD-Step2-C — Chapter scope via user-message prefix + separate ChapterChatModal

**Decision**: Chapter scope marker rides inside the user message body
(`[Scope: 第NN章「title」 p.A-B] `); separate `<ChapterChatModal />` rather
than reusing `<Chat />`.

**Looking back**: Both calls preserved the D-088 §2.3 / D-095 §2.3
stable-prefix cache invariant AND the D-085 §2.2 global resume contract.
A naive reuse of `<Chat />` would have polluted the global resume
history with chapter-scoped turns; a naive SYSTEM-level scope injection
would have broken DeepSeek prefix cache. The "two separate modal
lifecycles with shared transport" architecture is the right shape for
chapter-scoped chat.

### 3.5 LD-Step3-D — Mount-gate in all client islands

**Decision**: Every client island reading localStorage starts with
`emptyProgress()`, calls `loadProgress` inside `useEffect`, gates UI on
`mounted`.

**Looking back**: Avoided the classic Next 15 hydration mismatch error
that would have cost ~30 min to debug. Mirrors what Phase 2 `<Chat />`
already does for D-085 §2.2 Resume. The cost: 3-island duplication of
~3 lines each — acceptable. A future React context provider could
unify, but at α-private scale the duplication isn't paying off as
complexity yet.

### 3.6 γ tripwire convergence to PLAN inaccuracy

**Decision**: Phase 3 PLAN.md per-step wall estimates were
2-3x generous; all 3 steps came in at ≤50% of midpoint.

**Looking back**: The composition-only architecture (D-101 §2.5)
underwrote a productivity gain that Phase 1+2 estimating didn't model.
Phase 1 (greenfield Python pipeline) and Phase 2 (15-step web app
from scratch) had higher unit costs because each new surface required
new infrastructure. Phase 3's incremental cost was much lower because
the infrastructure was reused.

**Implication for Phase 4**: If Phase 4 stays composition-only on
Phase 2+3 surfaces, plan at midpoint ≈ 100 min not ≈ 150 min. If Phase
4 opens new infrastructure (e.g., adaptive recommendation needs
server-side state), the Phase 1/2 unit cost model returns.

---

## §4 Tripwire final tables

### γ wall-drift tripwire (full table — Phase 3 entries appended)

| # | Phase | Step | Wall (actual) | PLAN midpoint | Δ% | Notes |
|---|---|---|---|---|---|---|
| 13 | 3 | Step 1 Reader 壳 | ~70 min | 240 min | **−71%** | 1st Phase 3 datapoint; D-101 composition-only paid off |
| 14 | 3 | Step 2 Inline triggers | ~85 min | 180 min | **−53%** | 2nd Phase 3 datapoint; useChat + QuizExplain reuse |
| 15 | 3 | Step 3 Progress + close | ~70 min | 150 min | **−53%** | 3rd Phase 3 datapoint; progressStore mirrors historyStore |

Phase 3 mean: −59% under midpoint. Module N=3 final.

Cumulative tripwire across all phases: 16 datapoints final.

### β prefix-cache-hit tripwire

| Phase | N (cumulative) | Posture | Notes |
|---|---|---|---|
| 1 | n/a | n/a | No web LLM calls |
| 2 | 14 | ≥95% achieved | Phase 2 final (RETROSPECTIVE_phase2.md) |
| 3 | 14 (unchanged) | Pending re-open | 2 new /api/chat call paths added; no live calls fired in dev. Re-opens at user-gated Vercel deploy. |

### δ runtime detector

LIVE silent through all 3 phases via `apps/web/src/lib/ai/tripwire.ts`.

### ε model release / α model deprecation

No fires through any Phase 3 session.

---

## §5 Final posture

- 16 chapters × 554 pages textbook surface live at `/[locale]/book` with
  per-chapter route, in-chapter chat + quiz + selection-translate
  triggers, and progress tracking
- Phase 1 cert-extractor pipeline (`itpassport-r6-v1.0.3`) feeds the
  fixture data unchanged
- Phase 2 α-private app (`phase2-α-ship-2026-05-21`) frozen tag preserved
- D-001 → D-101 ADR registry preserved; **no new ADR Phase 3**
- 2 OQ open (both Phase 1 carryover); Phase 3 didn't open any
- Tests: 344 passing across 22 files
- Build: 23 static + dynamic routes, 102 kB shared First Load, 44.2 kB
  middleware
- α-private cumulative real LLM cost still well under $5 cap (no Phase 3
  prod calls yet)

**Phase 3 ✅ COMPLETE.** Next user action options:

- (a) `push it` → I run Vercel deploy + Playwright + axe-core +
  Lighthouse on prod chapter routes and update this retro with the
  empirical β + axe + Lighthouse rows
- (b) `freeze phase 3 and tag` → I create `phase3-α-ship-2026-05-22`
  annotated git tag pointing at this Session 52 close commit + GitHub
  Release with this retro as body
- (c) `open phase 4` → Phase 4 设计阶段 with D-019 §3a 4Q on form lock
  (likely D-102 candidate)
- (d) `hold` → Phase 3 ✅ COMPLETE stands; future sessions explicit
