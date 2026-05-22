# Step 2 Inline triggers — design notes

Phase 3 / Session 51 / 2026-05-22.

D-101 §2.3 段落级 zh/en + chapter Q&A: composition only on top of Phase 2
frozen `/api/chat` + `/api/quiz/explain` endpoints. Zero backend changes,
zero AI prompt SYSTEM changes — only the per-turn user message body
varies.

---

## 1. PLAN.md mapping

PLAN.md §1 Step 2 row deliverables:
- ✅ 章末区 (LD-2 chat + quiz scoped to current chapter) → `<ChapterEndPanel />`
   - 问本章 → `<ChapterChatModal />` (chapter-scope marker injected into the first user message via `applyChapterScope`)
   - 测本章 → `<ChapterQuizPicker />` listing chapter-scoped `QuizSummary[]`, clicking a card opens existing `<QuizExplain />`
- ✅ Selection toolbar → `<SelectionToolbar />` (listens on `document.selectionchange`, scoped to `data-chapter-content="true"` containers)
- ✅ `<ParagraphTranslate />` modal calling /api/chat with translate prompt
- ✅ `lib/book/translatePrompt.ts` compose helper
- ✅ vitest cases (14 new translatePrompt + 3 new buildChapterQuestionSummaries = 17 new)

---

## 2. D-101 §-mapping

| D-101 § | Step 2 implementation |
|---|---|
| §2.3 段落级 zh/en (on-demand inline triggers, NOT permanent sidebar) | `<SelectionToolbar />` → `<ParagraphTranslate />`. Toolbar shows only on user-initiated text selection inside `data-chapter-content="true"` regions. Modal closes → conversation discarded. No permanent split-pane / pre-rendered translation. |
| §2.3 strictly ja content body | Selection toolbar reads from `lang="ja"` body text; translation output is rendered with `lang="zh-Hans"` / `lang="en"` so screen readers handle output correctly while body stays ja. |
| §2.3 LocaleSwitcher independence | Chapter chrome (page heading, prev/next, panel labels, modal titles) follows next-intl chrome locale. Body text + translate source stay ja regardless of chrome locale. |
| §2.5 reuse Phase 2 infrastructure | `/api/chat` reused for both ChapterChatModal (multi-turn scoped) and ParagraphTranslate (single-shot translate). `/api/quiz/explain` reused via existing `<QuizExplain />` modal. `<TermPopover />` already mounts on `lang="ja"` text — unchanged. |
| §2.7 reversibility | All Step 2 components are additive client islands inside the chapter route. Removing `<ChapterEndPanel />` + `<SelectionToolbar />` from `<ChapterReader />` reverts to Step 1 reader shell with zero data loss. |

---

## 3. In-source LDs (D-094 §2.1 pattern; NOT D-NNN-worthy individually)

| LD | Decision | Why |
|---|---|---|
| **LD-Step2-A** | Chapter scope conveyed via user-message prefix `[Scope: 第NN章「title」 p.A-B] ` (not via a new SYSTEM message) | SYSTEM = corpus + SYSTEM_INSTRUCTION must stay byte-identical for D-088 §2.3 / D-095 §2.3 stable-prefix cache invariant. The scope marker rides inside the user message body so DeepSeek's prefix cache keeps the corpus + SYSTEM tail warm across calls. The marker is *visible* in the user's own bubble (transparent — not a hidden instruction). |
| **LD-Step2-B** | ParagraphTranslate uses `useChat()` (AI SDK v6) rather than a custom SSE consumer | /api/chat is already on the AI SDK v6 UI message stream protocol (Phase 2 Step 9). Reusing `useChat` means zero new transport code. Modal close → component unmount → React's natural cleanup aborts the fetch — adequate for single-shot translate UX. |
| **LD-Step2-C** | Separate `<ChapterChatModal />` rather than reusing `<Chat />` directly | `<Chat />` is full-page with a D-085 §2.2 localStorage Resume contract bound to the global chat surface. Mixing chapter-scoped sessions with global resume history would corrupt both. Chapter chat is single-purpose / single-session / no persistence — different lifecycle. |
| **LD-Step2-D** | Selection toolbar scoped via `data-chapter-content="true"` data attribute (DOM walk on anchor + focus nodes), NOT via React refs / containers | Floating toolbars need to react to native browser selection events that happen outside React's tree (selectionchange fires on document). Walking up to a sentinel data attribute is the cheapest reliable scope check; works for keyboard selection too. |
| **LD-Step2-E** | Selection toolbar = translate-only (no chat/quiz buttons) | LD-2 sub-clarification Session 49 Turn 5: "selection text → inline toolbar with translate-only buttons NO chat/quiz" to avoid two interaction modes confusion. Translation is the only inline action that naturally maps to "a selected passage". |
| **LD-Step2-F** | ChapterEndPanel "测本章" picker reuses Phase 2 `<QuizExplain />` verbatim — picker is a thin wrapper that supplies the QuizSummary | Zero refactor on the locked Step 10 modal (D-085 §2.4 surface). The picker only adds filtering by chapter page range + a card list; QuizExplain semantics (R1 latency, retry, focus trap, cache usage hint) all preserved. |
| **LD-Step2-G** | `clampTranslateSource` hard-caps source at 1000 chars with truncated flag | Avoids ballooning token usage on accidental "select all" gestures + keeps the translate prompt aligned with the "段落-level" mental model. Truncation is surfaced to the user via an amber banner so they know not all of the selection was sent. |
| **LD-Step2-H** | `buildChapterQuestionSummaries` projects directly off `index.entity_by_id` filtered by page range, reusing already-loaded `Page[]` | Zero new API call; the chapter route already loads all pages for the reader, and `index.entity_by_id` is already eager-loaded in `loadIndex()`. Pure projection — fast even on a 16-chapter cold path. |

---

## 4. Bundle Δ vs Step 1 baseline (Session 50)

| Surface | Step 1 (Session 50) | Step 2 (Session 51) | Δ |
|---|---|---|---|
| Middleware | 44.2 kB | **44.2 kB** | 0 |
| Shared First Load JS | 102 kB | **102 kB** | 0 |
| /[locale] redirect | 175 B / 119 kB | **172 B / 119 kB** | −3 B (noise) |
| /[locale]/book | 175 B / 119 kB | **172 B / 119 kB** | −3 B (noise) |
| /[locale]/book/chapter/[nn] | 175 B / 119 kB | **4.57 kB / 180 kB** | **+4.4 kB Size / +61 kB First Load** |
| /[locale]/chat | 1.93 kB / 169 kB | **1.93 kB / 169 kB** | 0 (Phase 2 invariant preserved) |
| /[locale]/quiz | 4.71 kB / ~ | **1.57 kB / 120 kB** | shared-chunk reshuffle now that `<QuizExplain />` is shared with /book/chapter/[nn] |
| /[locale]/glossary | 4.71 kB / 119 kB | **4.71 kB / 119 kB** | 0 |

**Chapter-page first-load delta drivers** (+61 kB):
- `@ai-sdk/react` `useChat` hook (3 client mount points: ChapterChatModal + ParagraphTranslate share the AI SDK code path → tree-shake friendly but ~40 kB minified)
- AI SDK supporting modules (`ai` core, message stream parser)
- Existing `<QuizExplain />` + `streamQuizExplain` SSE consumer now in this route's bundle (reused — net cost only counted here since /quiz also pulled it; some shared between)
- Focus-trap util (already in /quiz bundle, now shared)

The +61 kB is one-time per chapter route entry; subsequent navigation
between chapters reuses the chunk. Acceptable at α-private scale (no
SEO-sensitive marketing pages on this route).

---

## 5. Test results

```
vitest:  21 files / 316 tests PASS  (was 299 → +17 = +14 translatePrompt + +3 chapter quiz)
tsc:     0 errors  (noUncheckedIndexedAccess strict mode clean)
eslint:  0 errors / 0 warnings
next:    ✓ Compiled successfully in 1810ms / 23 static pages generated
```

See `test_results.txt` + `build_log.txt`.

---

## 6. Stable-prefix invariant audit (D-088 §2.3 / D-095 §2.3)

Both new /api/chat call paths preserve the byte-identical SYSTEM prefix:

1. **ChapterChatModal** — uses `useChat()`. Conversation history shipped
   as `messages: UIMessage[]`. Server prepends corpus block (system,
   ephemeral cache control) + SYSTEM_INSTRUCTION (system, no cache
   control) before the conversation. The scope marker rides inside the
   first user message body, NOT in a system role → SYSTEM prefix stays
   byte-identical to /chat + /chat-other-chapter calls.

2. **ParagraphTranslate** — single user message containing the
   composeTranslatePrompt() body. Same SYSTEM prefix as above. No
   system-role mutation.

**β cache-hit tripwire expectation**: prefix cache hit on first
ChapterChatModal turn should match Phase 2 baseline (≥95% by economic
deduction). ParagraphTranslate's first turn is cold-prefix on each
distinct selection text, but the entire SYSTEM prefix is reused → cache
read ratio still expected ≥95%. Empirical β data deferred to Step 3
prod deploy.

---

## 7. A11y posture (Phase 2 Step 14 reuse)

- All three new modals use `role="dialog"` + `aria-modal="true"` +
  `aria-labelledby` referencing the modal title.
- `useFocusTrap` from `lib/a11y/useFocusTrap` engaged on each modal
  (Step 14 LD-5 pattern reuse).
- ESC closes (with picker-stacking handed off correctly: ESC on
  QuizExplain returns to picker; ESC on picker closes both).
- `aria-busy` toggles on streaming containers.
- Floating toolbar = `role="toolbar"` + `aria-label`.
- Focus-visible ring uniform across all new buttons (FOCUS_RING constant).
- prefers-reduced-motion gated on the translate busy skeleton.
- ParagraphTranslate output rendered with `lang="zh-Hans"` / `lang="en"`
  so screen readers switch voice profile; source body keeps `lang="ja"`.

axe-core + Lighthouse re-validation deferred to Step 3 prod deploy gate
(Phase 2 Step 14+15 pattern reuse).

---

## 8. γ tripwire (Step 2 datapoint)

| Step | PLAN est | Actual wall | Δ | Notes |
|---|---|---|---|---|
| 2 | 2-4h (midpoint 180 min) | **~85 min** | **−53% under midpoint** | composition-only proceeded smoothly: useChat reuse + QuizExplain reuse cut typical "build new modal from scratch" cost ~3×. No Rule B failures; tsc/eslint clean on first try. |

**Module Phase-3 N=2** (Step 1 −71% / Step 2 −53%): both under midpoint,
but tightening (−71% → −53% = direction converging on PLAN). N=2 still
insufficient for re-estimate; D-094 §2.4 mid-retro pattern continues
PLAN inline `actual ~85 min` amend NOT full re-estimate.

---

## 9. β tripwire (Phase 3 N=0 → still N=0)

Step 2 added 2 new /api/chat call paths but no live LLM calls fired this
session (development gates only). β data re-opens at Step 3 once Vercel
deploy + manual smoke triggers the first real translate / chapter-chat
turn. Expected: ≥95% prefix cache hit on both call paths per §6 audit.

---

## 10. Rule B disposition

**0 formal Rule B archive Session 51.**

- Zero test failures across vitest (316/316 on first run after wiring).
- Zero tsc errors after wire-up (noUncheckedIndexedAccess clean).
- Zero ESLint warnings.
- Zero next build errors.

No in-step diversions documented at archive grade. Step 2 proceeded
linearly: translatePrompt → ParagraphTranslate → SelectionToolbar →
ChapterChatModal → ChapterQuizPicker → ChapterEndPanel → chapterScope
helper + tests → ChapterReader wire-up → page.tsx wire-up → gates →
evidence. (D-094 §2.4 distinction: in-cycle catches ≠ Rule B archive.)

---

## 11. Rule C (Phase retro)

Deferred to Phase 3 close (post-Step 3) per PLAN.md §3 + Rule C.

---

## 12. Rule D (Writer ≠ Reviewer)

Step 2 stays at **build-time gate level** (vitest + tsc + eslint + next
build = automated reviewer chain). Browser-based reviewer (Playwright +
axe-core + Lighthouse) deferred to Step 3 close per Phase 2 Step 14+15
pattern reuse.

---

## 13. Phase 1 + Phase 2 ✅ FROZEN preservation

Tags `phase1-ship-2026-05-19` + `phase2-α-ship-2026-05-21` immutable.
Step 2 is additive composition on top of frozen Phase 2 components:

- `/api/chat` route — unchanged.
- `/api/quiz/explain` route — unchanged.
- `<Chat />` Phase 2 component — unchanged.
- `<QuizExplain />` Phase 2 component — unchanged (now imported by
  ChapterQuizPicker; no signature/behavior change).
- `<TermPopover />` — unchanged.
- D-097 firewall — untouched.
- D-099 next-intl chrome — untouched.
- D-085 historyStore — untouched (chapter chat is a separate
  non-persisting lifecycle).
- AI SYSTEM_INSTRUCTION D-095 §2.3 stable-prefix invariant — preserved
  (chapter scope marker rides inside user-message body, not SYSTEM).
