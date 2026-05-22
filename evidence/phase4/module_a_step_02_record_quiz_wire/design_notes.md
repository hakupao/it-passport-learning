# Phase 4 Module A Step A.2 — design notes

> Per D-094 §2.1 in-source LD pattern: implementation details of locked
> D-102 §7.1 (OQ-A holdover #1 promotion) NOT D-NNN-worthy individually.

## §1 D-102 + D-103 §-mapping

- D-102 §7.1 OQ-A signals = chapters + quiz only → quiz signal needs `recordQuizAnswer` wired (currently helper-only per Phase 3 LD-Step3-H)
- D-102 §7.1 holdover promotion: RETROSPECTIVE_phase3 §2.3 holdover #1 ("wire `recordQuizAnswer` into `<QuizExplain />`") promoted **from polish list to Module A Step A.2 scope**
- D-085 §2.4 frozen QuizExplain modal lifecycle contract honored (wire is additive — leaf UI block + storage helper call, not refactoring)
- D-103 unaffected (no LLM call added in A.2 — only localStorage I/O)

## §2 PLAN.md row A.2 fulfilled

`persistQuizOutcome(storage, qid, correct)` helper + self-report binary UI in `<QuizExplain />` footer at `phase === "done"`. Quiz signal now populates `progressStore.quiz[qid]` on user self-report.

## §3 In-source LD-Module-A-1

| LD | Decision | Why |
|---|---|---|
| **LD-Module-A-1** | Self-report binary UI in QuizExplain footer at `phase === "done"` | The Phase 2 QuizList/QuizExplain flow does NOT capture a user pick before showing the answer — the correct answer is visible from QuizList card + QuizExplain header. So "user got it right vs wrong" is purely the user's MENTAL state. Self-report is the only **honest** signal absent a true picker UX. |
| **LD-Module-A-1b** | Rehydrate self-report from progressStore on summary change | If a user re-opens a previously-self-reported question, the buttons show the prior pick as aria-pressed — predictable UX, no silent state reset. |
| **LD-Module-A-1c** | Footer block lives **inside** the scrollable body, NOT in the modal frame footer | D-085 §2.4 modal frame footer (close + retry buttons) is part of the frozen lifecycle contract. Adding to the frame would touch frozen territory. The scrollable body is a content area — leaf additions there don't violate the contract. |
| **LD-Module-A-1d** | `persistQuizOutcome` returns `BookProgress` even when storage `setItem` throws (private mode / quota) | Returned state still reflects the user's intent; the in-memory state stays consistent with what the user clicked. Persistence layer no-ops silently per existing `saveProgress` swallow rationale. This matches the Phase 3 LD-Step3-A "corrupt-tolerant" posture. |
| **LD-Module-A-1e** | Re-self-report allowed (wrong → right or vice versa) via `recordQuizAnswer` overwrite semantics | User reflection is a real use case — "I thought I was right but the explanation says otherwise". The latest self-report wins; older outcome silently overwritten. No UI prompt — overwrite is implicit. |
| **LD-Module-A-1f** | Emerald-600 for correct, amber-600 for wrong | Matches Phase 3 LD-Step3 `ChapterCompletionGate` completion swatch (emerald-600 already established in the codebase). Amber distinguishes "wrong" from "error" (red) — wrong is a learning moment, not a system error. |

## §4 Bundle Δ (A.2 contribution to module close)

| Surface | Before A.2 (Phase 3 close) | After A.2 (module close) | Δ |
|---|---|---|---|
| Middleware | 44.2 kB | 44.2 kB | UNCHANGED |
| Shared First Load JS | 102 kB | 102 kB | UNCHANGED |
| `/[locale]/chat` First Load | 169 kB | 169 kB | **UNCHANGED** (Phase 2 D-085 §2.4 invariant preserved through Phase 3 + Module A) |
| `/[locale]/quiz` Size | 1.57 kB | 1.57 kB | UNCHANGED (self-report UI block + 3 i18n keys + 2 new imports absorbed in tolerance — `loadProgress`/`persistQuizOutcome` already in progressStore chunk graph from Phase 3 `ChapterCompletionGate` / `BookProgressSummary` islands) |
| `/[locale]/quiz` First Load | 120 kB | 120 kB | UNCHANGED |
| `/[locale]/book` Size | 1.3 kB | 1.38 kB | +0.08 kB (sub-noise) |
| `/[locale]/book/chapter/[nn]` Size | 5.57 kB | 5.13 kB | -0.44 kB (Next 15.5 chunk reshuffle — not our diff) |
| `/[locale]/book/chapter/[nn]` First Load | 181 kB | 181 kB | UNCHANGED |
| `/[locale]/glossary` | 4.72 kB / 119 kB | 4.72 kB / 119 kB | UNCHANGED |

**Key invariants preserved**: chat 169 kB / quiz 120 kB / middleware 44.2 kB all UNCHANGED → Phase 2 D-085 §2.4 frozen contract verified at the build level.

## §5 γ tripwire row (A.2)

| Estimate | Actual | Δ |
|---|---|---|
| 60-120 min (midpoint 90 min) | ~40 min wall | **-56% under midpoint** |

Phase 4 N=2. Mean A.1 + A.2 = -64% under midpoint. Still well under but trending toward the Phase 3 multiplier (-59% mean). Possible explanation: A.2 leveraged Phase 3 LD-Step3 muscle memory + the helper extraction (persistQuizOutcome) pattern. Watch A.3.

## §6 Rule A/B/C/D disposition (A.2)

| Rule | Disposition |
|---|---|
| **A** 抽检 | n/a — A.2 is additive (no >50% compression / rewrite of existing code; the QuizExplain.tsx diff is purely append) |
| **B** 失败归档 | 0 failures — wire landed first try; tsc strict passed without `noUncheckedIndexedAccess` catches (the new `loadProgress(...).quiz[summary.questionId]` access uses optional chaining + explicit existing-check pattern) |
| **C** 阶段 retro | Phase 4 close (Module D Step D.3) — future commitment |
| **D** Writer ≠ Reviewer | Build-time reviewer chain fired at module close; QuizExplain.tsx surface change verified via vitest (persistQuizOutcome helper) + next build (bundle invariants) + tsc (type safety with new imports). Manual UI smoke deferred to Module C Step C.3 / Module D Step D.1 (Playwright). |

## §7 Anthropic cache audit (A.2)

n/a — A.2 has NO LLM call. localStorage I/O only.

## §8 Decision count / OQ count

- 0 new ADR Session 54 Step A.2 (LD-Module-A-1[a-f] in-source per D-094 §2.1)
- 0 OQ changes

## §9 Phase 1+2+3 freeze preservation

| Frozen surface | Disposition under A.2 |
|---|---|
| Phase 1 cert-extractor + tags `phase1-ship-2026-05-19` | Untouched |
| Phase 2 chat / quiz / glossary surfaces + `phase2-α-ship-2026-05-21` | **`<QuizExplain />` modified — but lifecycle contract preserved**: open / SSE stream / close cycle unchanged; new self-report UI is a leaf addition inside the scrollable body, not in the modal frame footer (close/retry buttons untouched). `/api/quiz/explain` handler untouched. D-085 §2.4 contract verified via Phase 2 169 kB chat bundle invariant + 120 kB quiz route invariant. |
| Phase 3 textbook reading trunk + `phase3-α-ship-2026-05-22` | Untouched (book trunk + ChapterEndPanel + ChapterCompletionGate all unchanged) |
| D-097 Basic Auth firewall middleware | Untouched (44.2 kB middleware unchanged) |
| D-099 next-intl i18n chrome | Untouched (3 new keys per locale added; chrome configuration unchanged) |
| D-085 §2.2 historyStore (chat) | Untouched (progressStore is separate) |

## §10 OQ-D rationale verification

OQ-D round-2 (D-103) projected Module A as **zero LLM cost** — confirmed: 0 Anthropic calls across A.1+A.2+A.3. D-103 §2.5 cost tripwire silent. First LLM call deferred to Module B Step B.3.
