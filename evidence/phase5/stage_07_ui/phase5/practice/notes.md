# D-239 Stage 7 Phase 5: phone layout for practice and the header (S164)

**Breakpoint.** Every change sits in `@media (max-width: 640px)`, the breakpoint the reader, figures, today
and record already use. Above 640px no rule changes, and the one JS addition (AnswerCard) does nothing there.

**Before / after.**
- **Before:** production, https://itlearn.bojiangz.com, as deployed on 2026-11-18. The build is not identified.
  The shots drove the page with a browser: a non-owner fresh context, a click on ア, and an open of the mock-exam run page.
  The task asked for this. D-213 restricts Playwright *test runs* against production; none was run there.
- **After:** a local `pnpm build` of `out/`, copied to the scratchpad and served on `:3150` by `scripts/local-cf.ts`.
  The worker and Upstash were not started (`--api http://127.0.0.1:9`), so this is a non-owner run.

**Test setup.** Shots were taken with Chromium, `isMobile` and DPR 2. The group was
`/zh/practice?ids=2024r06-q006,…(10)`. For "answered" the script picked ア (wrong) and waited 1.8 s for the
smooth scroll. Scripts are in `tools/`:
- `shots.mjs <base> <out> <tag>` produces a, b, c and `<tag>-metrics.json`.
- `extra.mjs` covers the 30-question group and the single-question page.
- `mockshot.mjs` covers the mock exam.
- `hdr.mjs` measures the header in each locale.

## Measurements

| vp | stem width (before → after) | header (before → after) | エ bottom, 1st screen (before → after) | next button after answering (before → after) |
|---|---|---|---|---|
| 375×667 | 195 → **315** | 160 → **76** | 727 (off screen) → **567** | top 1185 (518px below the viewport) → **615–659, inside** |
| 390×844 | 210 → **330** | 160 → **76** | 727 → **567** | 1211 → **792–836, inside** |
| 412×915 | 232 → **352** | 160 → **76** | 671 → **534** | 1638 → **863–907, inside** |

Header height in each locale at 375, 390 and 412 (`hdr.mjs`): ja 76, zh 76, en 74.

Session top bar, measured on the 375 shots:
- **Before:** 159px. Tag, then a path that ran to 2 lines, then progress + 10 cells + timer, then 结束 alone on a 4th row.
- **After:** 104px. Tag, then the path (1 line), then progress, 答题卡, timer and 结束 on one row.

Mock exam face at 375: stem 186 → 315. Single-question page at 375: stem 315.

## Files changed

- `apps/web/src/components/app/app.module.css:124-155`: header block for phone width.
  - Row 1 = site name (15px) + 日 / 中 / EN + 设置. Row 2 = nav (`order`, `flex-basis: 100%`).
  - en nav is 13px with 12px gaps.
  - The gutter is 16px for `.bar` and `.content`.
  - Not sticky; zoom untouched.
  - Only the visual order changes (CSS order). DOM and tab order stay name → nav → tools.
- `apps/web/src/components/practice/practice.module.css:615-653`: face block for phone width.
  - `.hang` becomes a column and `.side` a row (問 N inline, 复习三格, 頻出度 ★ inline).
  - Face padding goes from 26/28/30 to 14/14/18.
  - No white-space rule, tokens only.
- `apps/web/src/components/practice/session.module.css:269-334`: session block for phone width.
  - **Top-bar line break:** `.topBar::after`, `order: 1`, scoped to `.session[data-session]` so the
    single-question page's bar is untouched. Progress, card, timer and 终了 get `order: 2`.
  - **答题卡:** `nowrap`, `overflow-x: auto`, 14px cells, `position: relative` (see failures attempt 1).
  - **Next bar:** `.session[data-answered] .nav` becomes `position: fixed` at bottom 0.
    - `z-index: 10`, below the AI 先生 panel (z-50).
    - Paper background with a top rule, no shadow.
    - `padding-bottom: calc(8px + env(safe-area-inset-bottom))`, with side insets too.
  - **Bottom padding:** `.session[data-answered]` gets `padding-bottom: calc(61px + env(safe-area-inset-bottom))`,
    so the bar never covers the end of the page.
- `apps/web/src/components/practice/PracticeSession.tsx:288-292`: the answer-scroll test for "already in view" now
  uses the fixed bar's top as the visible bottom when the prev / next row is `position: fixed`. Otherwise it
  uses `innerHeight`, so desktop is unchanged. This came from failures attempt 2.
- `apps/web/src/components/practice/PracticeSession.tsx:463` (comment at :41-42): `data-answered` on the
  session `<main>` once the question on screen is answered.
  - The bar is the existing prev / next `.nav` itself, so there is one element, no duplicate button and
    no focus-trap change.
  - On the last question it says 「查看结果」 and finishes, as before.
- `apps/web/src/components/practice/AnswerCard.tsx:7,27-38`: a ref plus an effect on `pos`. When the row
  overflows, it scrolls the 答题卡 sideways so the current cell is centred. It sets `scrollLeft` only and
  never calls `scrollIntoView`, so the page does not move.
- Tests:
  - `src/components/practice/__tests__/PracticeSession.ssr.test.ts:581-` (3): `data-answered` on and off,
    one next and one prev button, the CSS for the fixed bar, safe-area and padding, and the top-bar line break.
  - `src/components/practice/__tests__/PracticeQuestion.ssr.test.ts:280-` (2): the phone block, and that the
    desktop rules are unchanged.
  - `src/components/app/__tests__/AppShell.ssr.test.ts:239-` (2): the phone block (not sticky), and that DOM
    order is unchanged.
  - `e2e/mobile.spec.ts:35-` (9 new):
    - At 375×667: stem ≥ 300, all 4 choices start on the first screen, the side row sits above the stem.
    - The top-bar row is one row.
    - After answering: next is `toBeInViewport` with ratio 1, its row is fixed, and at the page bottom the
      status line ends above the bar. Next still works.
    - After an answer, the explanation heading is never left under the bar. The viewport height is chosen so
      the heading would land in the bar band.
    - A 30-question group has no page overflow and the current cell stays in view.
    - Header ≤ 110px and static in ja, zh and en.
    - At 1280 the next row stays static (desktop guard).

## Test commands and results (final run)

- `cd apps/web && pnpm vitest run`: 134 files, **1496 passed**.
- `pnpm exec tsc --noEmit`: exit 0.
- `pnpm lint`: 0 errors. The 2 warnings were already there, in `src/lib/textbook/__tests__/cleanup-pins.test.ts`.
- `pnpm build`: exit 0.
- `PLAYWRIGHT_BROWSERS_PATH=~/Library/Caches/ms-playwright PLAYWRIGHT_BASE_URL=http://127.0.0.1:3150 pnpm exec playwright test`:
  - `e2e/mobile.spec.ts e2e/practice.spec.ts e2e/mock.spec.ts e2e/today.spec.ts e2e/detail-navigation.spec.ts e2e/settings.spec.ts e2e/glossary.spec.ts e2e/record.spec.ts`
    `e2e/textbook.spec.ts e2e/textbook-v2.spec.ts e2e/fonts.spec.ts e2e/csp.spec.ts e2e/legacy-links.spec.ts`
    → **141 passed, 2 skipped**, exit 0, in one run. The textbook specs were included because the 16px gutter
    also applies to textbook pages.
  - The served build includes whatever textbook edits the parallel executor had on disk then, so this
    does not verify their work.
  - The server was stopped by PID afterwards, and `:3150` is free.
- Failed attempts are archived:
  - Attempt 1 (en header 139px, an e2e selector bug, page overflow with long groups):
    `failures/phase5/stage_07_ui/phase5/d239_mobile_practice_attempt_1.md`.
  - Attempt 2 (the explanation heading under the bar):
    `failures/phase5/stage_07_ui/phase5/d239_mobile_practice_attempt_2.md`.

## Left as is / notes

- The mock exam's own top bar (`mock.module.css`) still wraps 「交卷」 to a second row at 375 (`after-extra-mock`).
  It was not in the task list. The face itself is fixed there for free.
- Before answering, the next button stays in the page flow, so you can still skip a question. Only after an
  answer does it become the bottom bar.
- At widths under ~340 the en header row may wrap again. The header just gets taller; the page does not
  scroll sideways.
- Chromium only. No WebKit in the browsers cache, so Safari / iOS rendering is unverified. In en at 375 the header has
  7px of slack on row 1 and 11px on the nav row.
- Rule D: an independent review of this change has not been done yet.

## Rule D review follow-up (attempt 3, S164)

The Rule D review (`../rule_d_review.md`) was CONDITIONAL. Fixes below. M-2 and L-1 were first reproduced
against the attempt-2 build; that record is `failures/phase5/stage_07_ui/phase5/d239_mobile_practice_attempt_3.md`.

- **M-2, WCAG 2.4.11 (focus not obscured).** In `session.module.css` (640 block), the rule
  `html:has(.session[data-answered]) { --practice-bar-h: 61px; scroll-padding-bottom: calc(var(--practice-bar-h) + env(safe-area-inset-bottom)) }`
  makes the browser keep a focused or scrolled-to element above the bar.
  - New e2e: "a control in the explanation reached by Tab is not hidden under the bar". It places the
    explanation's last focusable control inside the bottom band, then Tabs to it.
  - Before the fix it failed: bottom 659 > bar top 606. After the fix it passes.
- **L-5.** The bar height is one custom property, `--practice-bar-h`, with a comment explaining it:
  .navBtnPrimary 44 + 2 × 8 padding + 1px top rule.
  - The session's `padding-bottom` and the page's `scroll-padding-bottom` both use it.
  - The SSR test derives 44 + 8 + 8 + 1 from the CSS and checks that the property equals it. It also checks
    that the property is defined exactly once.
- **L-7.** `PracticeSession.tsx:290`: the bar is now looked up from the explanation's own `<main>`
  (`el.closest("main")`), not with a document-wide query.
- **L-1.**
  - The header e2e now runs at 360 and 375 for ja, zh and en (6 tests). It asserts:
    - Height ≤ 110px.
    - Site name and tools on row 1.
    - The nav below both, with all nav links on one line.
    - Static position, and no page overflow.
  - Against the attempt-2 build, en at 360 was 133.5px (3 rows). Fix in `app.module.css`: site name 14px,
    bar / tools gaps 10px, and en nav gap 8px (13px font).
  - Now at 360: ja 74, zh 74, en 72. At 375 / 390 / 412: ja 74, zh 74, en 72 (`tools/hdr.mjs`, `tools/hdr360.mjs`).
  - Slack at 360 in en is about 7px on row 1 and 11px on the nav row (Chromium).
- **L-3.** `AnswerCard.tsx`: the re-centre runs on `pos` changes and on window `resize`, which also fires on
  rotation. The listener is removed on cleanup.
- L-4 and L-6 were skipped, as the coordinator directed.

All `after-*` screenshots were retaken with this build. The header is now 74px; the other numbers are the same
as in the table above.

### Results (attempt 3, final)

- `pnpm vitest run`: 134 files, **1497 passed**.
- `pnpm exec tsc --noEmit`: exit 0.
- `pnpm lint`: 0 errors, 2 warnings. The warnings were already there, in `src/lib/textbook/__tests__/cleanup-pins.test.ts`.
- `pnpm build`: exit 0. Checked first that no other `next build` was running.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3150 pnpm exec playwright test e2e/mobile.spec.ts e2e/practice.spec.ts e2e/mock.spec.ts`:
  **52 passed**, 0 failed, 0 flaky, exit 0.
  - `mobile.spec.ts` alone has 17 tests: the 4 older ones and 13 for D-239.
- The `:3150` server was stopped by PID and the port is free.
