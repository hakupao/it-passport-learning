# Phase 4 Module A Step A.1 — design notes

> Per D-094 §2.1 in-source LD pattern: implementation details of locked
> D-102 §7.3 (Module A Data layer) NOT D-NNN-worthy individually.

## §1 D-102 + D-103 §-mapping

- D-102 §2.1 form = AI 学习助手 reading progressStore signals (chapters + quiz)
- D-102 §7.1 OQ-A resolution = chapters + quiz only (progressStore baseline)
- D-102 §7.3 OQ-C resolution = Module A Data / Profile layer
- D-103 unaffected (no LLM call in A.1)

## §2 PLAN.md row A.1 fulfilled

`TutorContext` projects `progressStore` → `{completedChapters[], inProgress[], pendingChapters[], recentQuiz[]}` — exactly the shape PLAN.md §1 row A.1 prescribed. Pure types + projection helpers; no API call.

## §3 In-source LD-Module-A-2

| LD | Decision | Why |
|---|---|---|
| **LD-Module-A-2** | TutorContext reuses Phase 3 `ChapterSummary[]` as the chapter primitive | Avoids inventing a parallel chapter-shape; the AI tutor's view of "chapters" is the same chapter the user reads in `<BookIndex />` and `<ChapterReader />`. Single source of truth. |
| **LD-Module-A-2b** | 3-bucket split (completed / inProgress / pending) is **mutually exclusive + exhaustive** | Tutor SYSTEM prompt can deterministically enumerate buckets without overlap reasoning. A chapter with `completedAt` set lands in `completed` regardless of `scrollY` — matches `isChapterInProgress` contract in progressStore. |
| **LD-Module-A-2c** | `recentQuiz` sort = `lastAnswered DESC` + `questionId ASC` tiebreaker | Most-recent-first matches tutor's "recent attempts" prompt frame. Deterministic tiebreaker so snapshot tests can lock the shape. |
| **LD-Module-A-2d** | `DEFAULT_RECENT_QUIZ_LIMIT = 10` | Enough signal (~10 recent attempts = adequate trend) without bloating the SYSTEM preamble. Tunable via `loadTutorContext({recentQuizLimit})`. |
| **LD-Module-A-2e** | Pure projection — no I/O in A.1 | `loadTutorContext` (A.3, separate function in same file) is the I/O composer. Splitting keeps A.1 vitest-able without storage stubs. |

## §4 Bundle Δ (A.1 contribution to module close)

- **Middleware**: unchanged (A.1 not in middleware chain)
- **Shared First Load JS**: unchanged (A.1 not pulled into any client bundle yet — first consumer = Module B Step B.4 /api/tutor handler, server-side only)
- **Any route Size**: unchanged

A.1 ships dead code from the bundler's perspective until Module B imports it. This is intentional — testable in isolation now, integrated later.

## §5 γ tripwire row (A.1)

| Estimate | Actual | Δ |
|---|---|---|
| 60-120 min (midpoint 90 min) | ~25 min wall | **-72% under midpoint** |

Phase 4 N=1 first datapoint. Initial signal: composition-like productivity even on the new-infra path (since A.1 is pure projection helpers — no infrastructure setup work). Need N≥3 across Module A to draw any module-level conclusion vs RETROSPECTIVE_phase3 §3.6 (which predicted midpoint × 1.0 for Phase 4). Watch A.2 + A.3 walls.

## §6 Rule A/B/C/D disposition (A.1)

| Rule | Disposition |
|---|---|
| **A** 抽检 | n/a — A.1 is greenfield projection logic, no >50% compression / rewrite |
| **B** 失败归档 | 0 failures — types + tests landed first try; tsc strict mode passed without `noUncheckedIndexedAccess` catches (the existing `progress.chapters[nn]` accesses use `isChapterCompleted`/`isChapterInProgress` helpers which already type-guard) |
| **C** 阶段 retro | Phase 4 close (Module D Step D.3) — currently a future commitment per PLAN.md §1 row D.3 |
| **D** Writer ≠ Reviewer | Build-time reviewer chain (vitest + tsc + eslint + next build) ran at module close — same writer (Claude) wrote tests + code in same session, but the automated reviewer chain is the independent evaluator |

## §7 Anthropic cache audit (A.1)

n/a — A.1 has NO LLM call. First Anthropic call deferred to Module B Step B.3 cost dry-run + gate G2 user approval per CLAUDE.md.

## §8 Decision count / OQ count

- 0 new ADR Session 54 Step A.1 (LD-Module-A-2[a-e] are in-source LDs per D-094 §2.1)
- 0 OQ changes (D-019 §3a slow-pace n/a — A.1 executes locked D-102 §7.1/7.3)

## §9 Phase 1+2+3 freeze preservation

A.1 is strictly additive — 0 frozen surfaces modified. New file `apps/web/src/lib/tutor/tutorContext.ts` lives in a new `tutor/` subdirectory. No edits to chat/quiz/glossary/book surfaces.
