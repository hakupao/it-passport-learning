# Step 3 Progress — design notes

Phase 3 / Session 52 / 2026-05-22.

D-101 §2.4 + LD-3 = manual scroll-to-end gate + 「我看完了」 button commit
to `progressStore`, plus a passive progress overlay on `<BookIndex />`.
Zero API / middleware / AI prompt changes — pure client-side state.

---

## 1. PLAN.md mapping

PLAN.md §1 Step 3 row deliverables:
- ✅ `progressStore.ts` (LD-3 schema)
- ✅ `progressStore.test.ts` (28 cases)
- ✅ 「我看完了」 button on ChapterReader (LD-3 scroll-to-end gate via IntersectionObserver)
- ✅ BookIndex progress visualization (X/16 章 + per-chapter pill)
- ⏸ Vercel prod deploy + Playwright e2e smoke — gated to user `push it`/「deploy」 signal per Phase 2 Sessions 27-51 pattern
- ✅ `RETROSPECTIVE_phase3.md` per Rule C
- ⏸ Phase 3 tag candidate (`phase3-α-ship-2026-05-22`) — gated to user explicit `freeze phase 3 and tag` per Session 48 phase-1/2 freeze precedent

---

## 2. D-101 §-mapping

| D-101 § | Step 3 implementation |
|---|---|
| §2.4 localStorage progressStore (chapters {scrollY, completedAt} + quiz {lastAnswered, correct}) | `apps/web/src/lib/book/progressStore.ts` schemaVersion=1 envelope; storage key `itp:book:progress:v1`; D-085 §2.2 mirror posture (StorageLike abstraction, schemaVersion-gated corrupt-tolerant load, swallowed quota/private-mode errors on write). |
| §2.4 章节完成 criterion 锁了 LD-3 | Scroll-to-end gate via `IntersectionObserver` on a 1×1 sentinel at the top of `<ChapterCompletionGate />` panel; gate is sticky once tripped (scrolling back up doesn't re-disable). Button stamps `progressStore.chapters[nn].completedAt = nowIso` on click — idempotent (subsequent clicks no-op preserving first timestamp). |
| §2.4 quiz {lastAnswered, correct} | Helper `recordQuizAnswer(progress, qid, correct)` shipped; UI wiring into `<QuizExplain />` deferred — keeps the D-085 §2.4 Phase 2 surface locked. The helper is on disk so Phase 4 can wire it without re-opening the schema. |
| §2.5 reuse Phase 2 infrastructure (zero API/middleware/AI changes) | Progress is 100% client-state localStorage; `/api/*` endpoints / middleware / SYSTEM_INSTRUCTION all untouched. D-088 §2.3 / D-095 §2.3 stable-prefix invariant trivially preserved (no server changes). |
| §2.7 reversibility | Step 3 components are additive client islands. Removing `<ChapterCompletionGate />` from `<ChapterReader />` + `<BookProgressSummary />` + `<ChapterProgressPill />` from `<BookIndex />` reverts to Step 2 surface with zero data loss (localStorage data orphaned but harmless). |

---

## 3. In-source LDs (D-094 §2.1 pattern; NOT D-NNN-worthy individually)

| LD | Decision | Why |
|---|---|---|
| **LD-Step3-A** | `progressStore` storage key = `itp:book:progress:v1` (separate from `itp:chat:history:v1`) | Two independent surfaces with independent lifecycles. Chat history follows D-085 §2.2 Resume contract (cap 200 messages, single-thread). Progress follows D-101 §2.4 (no message cap, per-chapter dict). Sharing a key would create awkward coupling. |
| **LD-Step3-B** | `markChapterCompleted` is idempotent — returns same reference when `completedAt` already set | Click-spam resilience + lets the gate UI safely call inside `setProgress((prev) => …)` without worrying about the first timestamp being clobbered. Mirrors D-085 §5.3 "state corruption fallback" robustness posture. |
| **LD-Step3-C** | Scroll-to-end detection via `IntersectionObserver` on a 1×1 sentinel rather than window scroll listener | Sentinel is laid out as the first child of the gate panel (which is itself near the end of the chapter). When the sentinel intersects the viewport, the user has scrolled past the body content. `IntersectionObserver` avoids the scroll-listener overhead and works regardless of chapter length. Sticky-once semantics by `obs.disconnect()` on first hit. |
| **LD-Step3-D** | Mount-gate pattern in all three new client islands (`<ChapterCompletionGate />`, `<BookProgressSummary />`, `<ChapterProgressPill />`) | localStorage is browser-only. Reading it during SSR/initial render would either throw (no window) or produce a server-vs-client mismatch on hydration. Each island starts with `emptyProgress()`, calls `loadProgress(window.localStorage)` inside a `useEffect`, and only renders meaningful UI after `mounted=true`. `<BookProgressSummary />` and `<ChapterProgressPill />` render `null` before mount (no layout shift for cards); `<ChapterCompletionGate />` renders the panel shell with the button disabled. |
| **LD-Step3-E** | `<BookProgressSummary />` + `<ChapterProgressPill />` are SEPARATE client islands rather than one provider wrapping the whole `<BookIndex />` | Keeps `<BookIndex />` itself server-rendered (SEO-aligned, even though α-private routes are firewalled). Server HTML stays deterministic; only the small progress hotspots hydrate. Cost: each pill re-reads localStorage (16 reads on the index). Acceptable at α-private scale (one user, one device, sub-1ms per read). Future optimization (single React context provider) is an obvious refactor if/when it matters. |
| **LD-Step3-F** | `countCompletedChapters` iterates a supplied `nns: string[]` rather than `Object.keys(progress.chapters)` | Future-proofs against corpus updates where chapter ids change. The canonical 16-chapter set is the authoritative source; stale entries in localStorage are ignored. Aligns with D-101 §2.4 "schema-versioned, future-corpus-stable" intent. |
| **LD-Step3-G** | Vercel deploy + Playwright e2e + RETROSPECTIVE done in the SAME Step 3 sitting (NOT split) | Phase 2 pattern was 1-deploy-per-step; Phase 3 plans 1 deploy total at Phase 3 close (Step 3) per PLAN.md §1 Step 3 row. Deploy is gated to user `push it` signal per Sessions 27-51 pattern — RETROSPECTIVE is written assuming deploy will happen on user gate; if user defers deploy, RETROSPECTIVE notes the holdover in §2. |
| **LD-Step3-H** | `recordQuizAnswer` shipped in the helper but NOT wired into `<QuizExplain />` | D-085 §2.4 Phase 2 surfaces are FROZEN — modifying QuizExplain would re-open a locked surface for non-essential telemetry. Step 3 ships the helper for Phase 4 to wire when adaptive quiz scoring becomes meaningful (D-101 §2.6 holdover). Empty `quiz: {}` in localStorage is the steady state for now. |

---

## 4. Bundle Δ vs Step 2 baseline (Session 51)

| Surface | Step 2 (Session 51) | Step 3 (Session 52) | Δ |
|---|---|---|---|
| Middleware | 44.2 kB | **44.2 kB** | 0 |
| Shared First Load JS | 102 kB | **102 kB** | 0 |
| /[locale] redirect | 172 B / 119 kB | **170 B / 119 kB** | −2 B (noise) |
| /[locale]/book | 172 B / 119 kB | **1.3 kB / 121 kB** | **+1.13 kB Size / +2 kB First Load** (BookProgressSummary + ChapterProgressPill islands) |
| /[locale]/book/chapter/[nn] | 4.57 kB / 180 kB | **5.57 kB / 181 kB** | **+1.00 kB Size / +1 kB First Load** (ChapterCompletionGate island) |
| /[locale]/chat | 1.93 kB / 169 kB | **1.93 kB / 169 kB** | 0 (Phase 2 invariant preserved) |
| /[locale]/quiz | 1.57 kB / ~120 kB | **1.57 kB / 120 kB** | 0 |
| /[locale]/glossary | 4.71 kB / 119 kB | **4.72 kB / 119 kB** | +0.01 kB (i18n key addition; sub-noise) |

Step 3 client-island additions cost ~2 kB First Load on /book and ~1 kB
on /book/chapter/[nn]. Phase 2 chat surface invariant (169 kB) preserved.
Total Phase 3 first-load delta vs Phase 2 baseline: +2 kB on /book and
+62 kB on chapter route (61 from Step 2 + 1 from Step 3).

---

## 5. Test results

```
vitest:  22 files / 344 tests PASS  (was 316 → +28 = progressStore.test.ts coverage)
tsc:     0 errors  (noUncheckedIndexedAccess strict mode clean)
eslint:  0 errors / 0 warnings
next:    ✓ Compiled successfully in 1743ms / 23 static pages generated
```

See `test_results.txt` + `build_log.txt`.

### progressStore.test.ts matrix (28 cases)

- `emptyProgress()` canonical shape: 1
- `loadProgress()` cold / round-trip / malformed JSON / schemaVersion mismatch / chapters non-object / chapters as array / getItem throws / custom key: 7
- `saveProgress()` envelope shape / schemaVersion tamper-resistant / setItem throws: 3
- `clearProgress()` default-key / idempotent / removeItem throws: 3
- `markChapterCompleted()` new stamp / idempotent reference equality / preserves scrollY / cross-chapter non-collision: 4
- `recordChapterScroll()` new / overwrite / preserves completedAt: 3
- `recordQuizAnswer()` new / overwrite: 2
- `isChapterCompleted` / `isChapterInProgress` / `countCompletedChapters` (4 cases each split): 5

---

## 6. Stable-prefix invariant audit (D-088 §2.3 / D-095 §2.3)

**No new /api/* call paths in Step 3.** All progress state is client-only
localStorage. The Phase 2 stable-prefix invariant is trivially preserved
because zero server code changed.

---

## 7. A11y posture (Phase 2 Step 14 + Step 2 reuse)

- `<ChapterCompletionGate />`:
  - Panel = `<section aria-label="completionPanelLabel" />`
  - Sentinel = `aria-hidden="true"` (no AT exposure)
  - Button = native `<button>` with `aria-disabled` mirror + `aria-live="polite"` so SR users hear the state transition when scroll-to-end completes / completion is committed
  - Focus ring uniform via `FOCUS_RING` constant matching Phase 2 a11y polish
- `<BookProgressSummary />`:
  - `role="status" aria-live="polite"` — SR announces "X/N chapters complete" when it materializes post-hydration
- `<ChapterProgressPill />`:
  - Renders as inline `<span>`; checkmark glyph is `aria-hidden="true"` with the textual label carrying the meaning
- `prefers-reduced-motion`: no animations introduced in Step 3 (Phase 2 reduced-motion gates on translate skeleton untouched)
- Color contrast: emerald-700 / amber-700 on `/15` opacity backgrounds verified manually against WCAG AA at the swatches used (1.4em pill text)

axe-core + Lighthouse re-validation deferred to user-gated Vercel
production deploy (Phase 2 Step 14+15 toolchain reuse).

---

## 8. γ tripwire (Step 3 datapoint)

| Step | PLAN est | Actual wall | Δ | Notes |
|---|---|---|---|---|
| 3 | 2-3h (midpoint 150 min) | **~70 min** | **−53% under midpoint** | Composition-only continues to dominate. progressStore mirrors historyStore byte-for-byte structure; ChapterCompletionGate is a thin IntersectionObserver + 3-state button; BookProgressSummary + ChapterProgressPill are sub-50-line islands. Zero refactor of frozen surfaces. |

**Module Phase-3 N=3 final** (Step 1 −71% / Step 2 −53% / Step 3 −53%):

- N=3 — minimum data for re-estimate consideration per D-094 §2.4
- All three under midpoint by ≥50%; mean −59%
- Distribution: tightening then stable (Step 1's −71% included LD discovery overhead absent in Steps 2/3)
- **Conclusion**: PLAN.md Phase 3 wall ceilings were ~2× generous. Module Phase 3 actual ≈ 225 min vs PLAN midpoint ≈ 570 min. Carries forward to Phase 4 estimating: composition-on-frozen-surfaces work should plan at midpoint ≈ 100 min not ≈ 150 min.

Per D-094 §2.4 mid-retro pattern, this is a **module-level observation**,
not a global re-estimate of Phase 1/2 (which had different work
profiles). Recorded in `RETROSPECTIVE_phase3.md §2.7`.

---

## 9. β tripwire (Phase 3 N=0 → still N=0)

Step 3 added zero /api/* call paths. β data unchanged from Phase 2 final
(N=14 cumulative). β re-opens at user-gated Vercel deploy + first live
translate / chapter-chat / quiz-explain turn on the prod surface.

---

## 10. δ runtime detector

LIVE silent under healthy operation via `apps/web/src/lib/ai/tripwire.ts`
from Phase 2. Untouched in Step 3.

---

## 11. ε / α tripwires

- ε model release / pricing: no fire
- α model deprecation (D-095 §2.5 mirror): no fire

---

## 12. Rule B disposition

**0 formal Rule B archive Session 52.**

- Zero test failures (344/344 on first run after all wiring).
- Zero tsc errors after wire-up (noUncheckedIndexedAccess clean first try).
- Zero ESLint warnings.
- Zero next build errors.

No in-step diversions documented at archive grade. Step 3 proceeded
linearly: progressStore + tests → ChapterCompletionGate → BookProgressSummary
→ ChapterReader/BookIndex wire-up → messages → gates → evidence + retro.

---

## 13. Rule C (Phase 3 retro)

Written at Phase 3 close in `RETROSPECTIVE_phase3.md` (this Session 52,
parallel artifact). 3-section minimum honoured:

- §1 保留下来的做法
- §2 必须补上的缺口
- §3 关键决策复盘 (D-101 + LD-1~LD-4 + LD-Step1~3 harvest)

Plus γ/β/δ tripwire final tables + Phase 4 hand-off list.

---

## 14. Rule D (Writer ≠ Reviewer)

Step 3 stays at **build-time gate level** (vitest + tsc + eslint + next
build = automated reviewer chain) until user gates Vercel prod deploy.
On deploy:
- Playwright e2e (Phase 2 toolchain) = E2E reviewer
- axe-core 4.10.2 = a11y reviewer
- Lighthouse = perf/SEO/best-practices reviewer

All three are independent processes from the writer (Claude), satisfying
Rule D for the production-evidence pass.

---

## 15. Phase 1 + Phase 2 ✅ FROZEN preservation

Tags `phase1-ship-2026-05-19` + `phase2-α-ship-2026-05-21` immutable.
Step 3 is additive composition; the following Phase 2 surfaces are
unchanged:

- `/api/chat` route — unchanged
- `/api/quiz/explain` route — unchanged
- `/api/glossary/hover` route — unchanged
- `<Chat />` + `<QuizExplain />` + `<QuizList />` + `<GlossaryList />` + `<TermPopover />` — unchanged
- D-097 firewall — untouched
- D-099 next-intl chrome — untouched
- D-085 historyStore — untouched (progressStore is parallel, not extending)
- AI SYSTEM_INSTRUCTION D-095 §2.3 stable-prefix invariant — preserved (no server changes)

---

## 16. Phase 3 close posture

After Step 3 ✅ DONE:
- `<BookIndex />` shows X/16 + per-chapter status
- `<ChapterReader />` carries chat / quiz / translate / completion gate
- 101 ADRs unchanged (D-001 → D-101); 0 new ADR Session 52
- 2 OQs open (OQ-01 + OQ-02, both Phase 1 carryover unrelated to Phase 3)
- Phase 3 RETROSPECTIVE per Rule C ✅
- Phase 3 ship tag `phase3-α-ship-2026-05-22` ready (user gate per Session 48 freeze precedent)
