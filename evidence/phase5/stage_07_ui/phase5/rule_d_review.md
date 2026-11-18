# D-239 Stage 7 Phase 5 (mobile): Rule D independent review

- Reviewer lane: `oh-my-claudecode:code-reviewer` (opus), separate from both executor lanes. Read-only; this file is the only write.
- Scope: the uncommitted working tree on `main` at 6bed4a5f (16 modified files, plus the untracked evidence/failures). Notes read: `evidence/phase5/stage_07_ui/phase5/{practice,textbook}/notes.md`, `failures/phase5/stage_07_ui/phase5/*.md`.
- Re-run here: `pnpm vitest run` → 134 files, 1496 passed. `pnpm exec tsc --noEmit` → exit 0. No build, no server, no e2e re-run (the executors' e2e logs were read, not reproduced).

## Verdict: CONDITIONAL (no HIGH finding; nothing blocks the code)

The code is correct and scoped to ≤640px. Two conditions apply before the commit:
1. M-1: the user signs off on the step-figure call, or it is recorded as a D-239 deviation. D-239 says 「余白を詰める」, but the shipped change keeps the figure height (401 → 401px) and fills the blank with placeholders.
2. M-2: either add `scroll-padding-bottom` for the fixed bar (a small CSS change), or accept the gap in the session log.

The LOW items are optional.

## Stage 1: spec compliance

| D-239 item | Status |
|---|---|
| (1) Face: 問番号 / recent / 頻出度 in one row above the stem; stem and choices full width | OK. `practice.module.css:619-653`. Stem 195→315 at 375 (metrics). The mock and single-question pages get the same face. |
| (1) Top bar: progress / 答题卡 / timer / 结束 in one row; the card scrolls | OK. `session.module.css:281-307`, scoped to `.session[data-session]`, so the SingleQuestion bar is untouched. |
| (1) After an answer, the prev/next row is fixed at the bottom, safe-area aware, with matching padding | OK. One element (no duplicate), `data-answered` on `<main>`. `viewportFit: "cover"` is set (`app/[locale]/layout.tsx:40`), so `env(safe-area-inset-*)` actually resolves on iOS. |
| (2) Header about 100px, two rows, not sticky, no zoom lock, DOM order unchanged | OK at 375/390/412 (76px; en 74). `maximumScale: 5` means no zoom lock. Only CSS `order` changes. At 320–340 in en, the header becomes 3 rows (executor note; see L-1). |
| (2) Side gutter 32→16 | OK. `.content` and `.bar` are inside the 640 block. No full-bleed or negative-margin rule elsewhere depends on 32px (grep). |
| (3) Step figures: the blank is shrunk (詰める) | **Deviation (M-1).** Height unchanged. There are now placeholders, and the controls no longer move (verified by the executor's stepwalk: 0 movement cases). |
| (3) OQ-18: `overflow-wrap: break-word` on the unit h1, reader `.prose` and glossary `.prose`; mobile h1 22px; e2e for ja/zh/en × 320/360/390 | OK. The e2e was shown red on the old build (`raw/e2e-red-before.log`, `raw/e2e-gloss-red.log`). |
| Desktop unchanged | OK. Every new rule is inside `@media (max-width: 640px)` except `.capBox` grid, `.capSizer{display:none}` and `overflow-wrap: break-word`. None of these changes desktop layout: break-word does not change min-content, and the 1280 `<main>` screenshots differ by 0 bytes on 6 pages. The JS additions are no-ops on desktop: AnswerCard returns early when there is no overflow, and the bar check needs `position: fixed`. |
| Tokens / radius / no shadow / no white-space | OK. Only `var(--paper|--rule|--ink...)`; no new radius; no shadow or gradient. `tokensOnly` and `fidelity` tests pass. |

## Findings

### MEDIUM

**M-1: Step figures are not shortened, which deviates from the D-239 wording.** Spec. Confidence HIGH.
- Where: `apps/web/src/components/textbook/figures/figures.module.css:212-238`, `StepStage.tsx:44-55`.
- What happens: on step 1 of a 4-node flow at 375, the stage stays 401px tall (n=7 frame 474px, depth-4 tree 507–531px). The unreached nodes are now dashed boxes, not blank. The 「余白を詰める」 intent (less scrolling past a mostly-empty figure) is not met. The executor flagged this as an undecided call (notes §1 a/b/c).
- Fix: record a user choice. Options: (a) as shipped; (a)+(c) tighter phone rhythm (arrow gap 26→16px, node padding 4px 10px), about 50–70px saved on long flows with no movement; (b) collapse the unreached nodes. Do not close this item without the user.

**M-2: The fixed bar can hide the focused element (WCAG 2.2 SC 2.4.11, Focus Not Obscured).** a11y. Confidence MEDIUM.
- Where: `apps/web/src/components/practice/session.module.css:315-331`.
- What happens: on a phone with a hardware keyboard or VoiceOver/TalkBack (all at ≤640px), the user answers, then tabs or swipes into the explanation (term-card links, 「単元に戻る」, the AI 先生 entry). The browser scrolls a newly focused element only until it is just inside the viewport. With nothing telling it about the 61px + inset band, the element lands under the bar. This is the same class of bug as failures attempt 2, but for focus, not the scripted scroll.
- Fix (inside the 640 block): `html:has(main[data-answered]) { scroll-padding-bottom: calc(61px + env(safe-area-inset-bottom)); }`. `:has` works in Safari 15.4+ and Chromium 105+. Alternatively, toggle a class on `<html>` from SessionView.

### LOW

**L-1: The header e2e checks neither "two rows" nor 320/360.** Test quality. Confidence HIGH.
- Where: `apps/web/e2e/mobile.spec.ts:150-158`.
- What happens: `≤ 110px` passes a 3-row header (76 + ~22 = ~98px). For example, `.tools` wrapping in en at 375 after a label change would pass. The test name says "two rows" but nothing asserts it. The executor says en wraps to 3 rows below about 340px, and 320/360 are not measured.
- Fix: assert `nav.top >= tools.bottom` and `|tools.centerY − siteName.centerY| < 6`, or bound the header at ≤ 84px. Add 320/360 to the loop, or accept a 3-row en header at 320 in the session log.

**L-2: Hidden labels in placeholders can still be found and revealed on phones.** a11y/UX. Confidence MEDIUM.
- Where: `figures.module.css:213-220` (`.off { visibility: visible; color: transparent }`).
- What happens: the labels were `visibility: hidden` and are now only transparent. iOS "Find on Page" or Ctrl+F for a later step's term matches and highlights an invisible box. In `forced-colors: active` (Windows High Contrast, rare on phones) the UA overrides `color`, so every unreached label shows and the step reveal is spoiled. `aria-hidden` keeps AT correct.
- Fix: wrap the label in a `<span>` in FlowView/TreeView and set `.off > span { visibility: hidden }` on phones (the box stays visible and dashed). Or add `@media (forced-colors: active) { .off { color: Canvas } }`, which does not fix find-in-page.

**L-3: The AnswerCard re-centres only when `pos` changes.** Logic. Confidence MEDIUM.
- Where: `apps/web/src/components/practice/AnswerCard.tsx:30-36` (deps `[pos]`).
- What happens: (i) rotating from landscape (>640, the card wraps, `scrollLeft` 0) to portrait (≤640, the card scrolls) leaves the current cell, e.g. 24/30, off-screen until the next move. (ii) "Start over" or a new group with the same `pos` keeps the old `scrollLeft`. This is cosmetic only, since the progress text is still correct.
- Fix: deps `[pos, ids.length]`, plus a `matchMedia("(max-width: 640px)")` change listener (or a ResizeObserver on the `ol`) that runs the same centring.

**L-4: The 答题卡 scroller is not keyboard-focusable and its scrollbar is hidden.** a11y. Confidence LOW.
- Where: `session.module.css:298-308`.
- What happens: axe `scrollable-region-focusable` may flag it. The cells are not interactive, the script keeps the current cell in view, and Chromium 130+ makes scrollers focusable anyway, so the impact is small. `scrollbar-width: none` gives no hint that it scrolls (on iOS the overlay scrollbar shows only while scrolling).
- Fix: none required. Optionally add `tabindex="0"` to the `ol` at phone width only, or a 1px `--rule` end fade. A gradient is not allowed, so use a border.

**L-5: The bar height 61px is hard-coded in two places.** Maintainability. Confidence HIGH.
- Where: `session.module.css:312` (`calc(61px + …)`), `PracticeSession.ssr.test.ts` regex; the derivation 44 + 8 + 8 + 1 is implicit.
- What happens: a future change to the `.navBtn` height or bar padding makes the bar cover the status line, or leaves a gap. The e2e (`statusBottom <= barTop`) would catch the cover case.
- Fix: `--bar-h: 61px` on `.session` in the 640 block, used by both the padding and the planned `scroll-padding` (M-2), with a comment `/* 44 btn + 2×8 padding + 1 rule */`.

**L-6: The top-bar line-break pseudo adds a second row-gap.** Cosmetic. Confidence HIGH.
- Where: `session.module.css:285-289`.
- What happens: `::after` with `flex-basis: 100%` forms its own 0-height flex line, so the gap between the path row and the progress row is 2 × 6px = 12px, not 6px. If `catKey` and `topic` are both absent, an empty 0px line plus 6px gap sits above the progress row.
- Fix: accept it (104px measured, within the design), or use `margin-top: -6px` on `::after`.

**L-7: The fixed bar position comes from a document-global query.** Robustness. Confidence LOW.
- Where: `PracticeSession.tsx:290` (`document.querySelector('[data-nav="next"]')`).
- What happens: if another `[data-nav="next"]` ever shares the page (MockRun uses the same attribute, `MockRun.tsx:522`, but on a different route today), the check reads the wrong element and the heading may again land under the bar.
- Fix: scope it to the session, e.g. `document.querySelector('main[data-session] [data-nav="next"]')`, or use a ref to the `.nav` div.

**L-8: The unit h1 at 22px still breaks "Integration/Performance" mid-word at 320.** Spec residue, known. Confidence HIGH.
- Where: `reader.module.css:171-175`.
- What happens: on iPhone SE 1st gen it breaks as "Integration/Performan|ce". There is no page scroll (OQ-18 is met). The executor recorded this.
- Fix: accept it. Optionally add `hyphens: manual` and an explicit `<wbr>` after "/" in the title data, or drop to 20px below 340px.

## Points checked and found OK (no finding)

- **Media-query leakage:** the only always-on CSS additions are listed in Stage 1. The `.session[data-answered] .nav` and `.topBar` selectors use CSS-module hashes, so AppNav's `.nav` (a different module) is unaffected. SingleQuestion uses `.session` with `data-single` and never gets `data-answered` or the `::after` break.
- **Sizer spans:** `aria-hidden="true"` plus `visibility: hidden` on phones and `display: none` on desktop keeps them out of the a11y tree, `innerText` and find-in-page. The live `<p aria-live>` holds only the current caption (SSR test). No code reads `textContent` (grep: none in components/lib), and the e2e reads `p[aria-live]`.
- **Placeholder aria:** off nodes keep `aria-hidden` (FlowFig.tsx:28, TreeFig.tsx:26). `.flowNode.off::before` wins over `.flowNode + .flowNode::before` by source order at equal specificity.
- **AnswerCard `scrollLeft` vs `scrollIntoView`:** correct choice. It only changes the `ol`'s own scroll, and `position: relative` clips the cells' absolute sr-only text (failures attempt 1).
- **Auto-scroll calc:** it runs after `imagesSettled`, so `data-answered` has been committed and `getComputedStyle(bar).position` is reliable. On desktop it falls back to `innerHeight`. The e2e for heading-under-bar was red on attempt 1 and is green now.
- **Overlaps:** the SenseiPanel is `fixed inset-0 z-50` on phones and covers the z-10 bar. The figure zoom is a `<dialog>` in the top layer. The mock exam (`MockRun`) uses its own CSS, so no bar there, but it does get the new face. No site footer under `main-content`. No transform/filter ancestor that would break `position: fixed` (grep).
- **iOS Safari (by reading):** `viewport-fit=cover` is present, so `env()` works. Side insets are handled with `max(16px, env(...))`. `.frame` uses `100dvh`, not `100vh`. Bottom-fixed elements follow the collapsing toolbar on iOS 15+. The horizontal scroller needs no `-webkit-overflow-scrolling` (iOS 13+). This is still unverified on WebKit; a real-device pass on the SE/14 shots is recommended (D-239 (4)).
- **Old-code failure of the new tests (spot-checked):** the phone-block regex tests get `phone === ""` on the old CSS, so `toMatch` fails. `data-answered` and the sizer count are absent on old code. The e2e for the fixed bar, heading-under-bar, 30-cell overflow, header ≤110 (old 160) and textbook/glossary 320–390 would all fail before the change. The DOM-order and desktop-unchanged tests are guards and pass on both builds, which is intended.

## Positive observations

- The fixed bar is the same element as the in-flow row, so there is no duplicate button, no tab-order change and no focus-trap work. It is pinned only after an answer, so skipping a question still works.
- Failures were archived with reproductions (attempts 1/2, textbook attempt 1). Attempt 2's heading-under-bar bug came with a deterministic e2e that sizes the viewport so the heading falls in the bar band.
- The OQ-18 root cause was corrected with evidence (not the S140 "table"). The e2e injects an unbreakable title and URL, so it does not depend on content, and the overflow-causing units are always included.
- There is a byte-identical desktop screenshot diff, plus a stepwalk sweep showing 0 control movement across 320–390 × 3 locales.

---

## Round 2 (same reviewer lane, after the executors' attempt-3 / Addendum fixes)

- Re-read the current working-tree diff (now also `FlowFig.tsx`, `TreeFig.tsx`), `practice/notes.md` § "Rule D review follow-up (attempt 3)", and `textbook/notes.md` § Addendum.
- Re-run here: `pnpm vitest run` → 134 files, 1497 passed. `tsc --noEmit` → exit 0. The e2e was not re-run here; the executors report mobile/practice/mock 52 passed, and the textbook specs green, with a 0-byte desktop diff on the (a)+(c) build.

### Verdict: CONDITIONAL. One new MEDIUM (a one-line fix); everything else is resolved

| Round-1 item | Status |
|---|---|
| M-1 step figure 詰める | **Accepted deviation.** Main chose (a)+(c) under D-161. The phone-only rhythm (arrow gap 26→20px, node padding 5px, line-height 1.5, tree li margin 4px) gives −40..−75px with 0 control movement (stepwalk). The CSS is inside the 640 block, and the desktop diff is 0 bytes. Reasonable. |
| M-2 focus obscured | Fixed for browsers with `:has()`. The e2e was red before and green after. **But see R2-M1 for browsers without `:has()`.** |
| L-1 header e2e | Fixed. Covers 360/375 × ja/zh/en, asserts 2 rows and one nav line; en at 360 went 133.5 → 72px. 320 is still not asserted (accepted: no page overflow, and the header only gets taller). |
| L-2 placeholder labels | Fixed. `<span class={styles.label}>` is new and collides with no other `.label` in `figures.module.css`. It is an unstyled inline span on desktop, so desktop is unchanged: the 0-byte diff confirms this, and the desktop `.off { visibility: hidden }` still hides it by inheritance. On phones `.off .label { visibility: hidden }`, so find-in-page and forced-colors no longer reveal it. `color: transparent` is gone, and the SSR test asserts both. |
| L-3 re-centre | Mostly fixed. A resize listener is added, and cleanup is correct: the same function reference is removed on every `pos` change and on unmount, so no listener leaks. See R2-L1. The `ids` change case is not handled, which is still cosmetic. |
| L-4, L-6 | Skipped by direction; accepted. |
| L-5 bar height | Fixed. There is one `--practice-bar-h`, and the test derives 44+8+8+1 from the CSS. |
| L-7 global query | Fixed: `el.closest("main")`. |
| L-8 | Accepted, unchanged. |

### New findings

**[MEDIUM] R2-M1: without `:has()` the bottom padding disappears and the bar covers the end of the page.** Confidence HIGH.
- Where: `apps/web/src/components/practice/session.module.css`, 640 block: `html:has(.session[data-answered]) { --practice-bar-h: 61px; … }` and `.session[data-answered] { padding-bottom: calc(var(--practice-bar-h) + env(safe-area-inset-bottom)); }`.
- Cause: the only definition of `--practice-bar-h` now sits inside the `:has()` rule. A browser without `:has()` drops that whole rule. The `var()` then has no value and no fallback, so the `padding-bottom` declaration is invalid at computed-value time. It falls back to `unset`, which here means 0.
- Affected browsers: iOS Safari 15.0–15.3, Chrome/Android WebView < 105, Firefox (incl. Android) < 121, Samsung Internet < 20.
- Scenario: on such a browser at ≤640px, after an answer, scroll to the bottom. The fixed 61px bar covers the status line (「答错了…」 / 「n 天后复习」) and the end of the AnswerBar, and the page cannot be scrolled further. This is a regression from round 1, where the hard-coded `61px` worked everywhere. The `scroll-padding` part degrading to nothing on those browsers is fine; that is progressive enhancement.
- Fix (either):
  - (a) `padding-bottom: calc(var(--practice-bar-h, 61px) + env(safe-area-inset-bottom))`. Adjust the SSR regex, and keep the "defined once" check by counting `--practice-bar-h:` definitions only.
  - (b) Declare `--practice-bar-h: 61px` on `.session` as well, for the padding. That breaks the "exactly once" test, so (a) is simpler.
  - Optionally add the same fallback in the `scroll-padding` calc for symmetry.

**[LOW] R2-L1: the iOS resize listener snaps a manually scrolled 答题卡 back.** Confidence MEDIUM. Not verified on WebKit.
- Where: `apps/web/src/components/practice/AnswerCard.tsx:31-41`.
- Cause: iOS Safari (and Android Chrome) fire `resize` when the toolbar or URL bar collapses or expands during vertical page scrolling.
- Scenario: the user swipes the 30-cell card sideways to see an earlier cell. As soon as they scroll the page vertically, `center()` runs and resets `scrollLeft` to the current cell. It is cosmetic and harmless, but surprising.
- Fix: re-centre only when the width changed. Keep `let w = window.innerWidth` and `if (window.innerWidth === w) return; w = window.innerWidth;` inside the resize handler. Alternatively, use `matchMedia("(max-width: 640px)").addEventListener("change", center)` plus `orientationchange`.

### Other checks (round 2, no finding)

- `html:has(...)` in a CSS module: the selector contains the local `.session` class, so pure-mode accepts it, and the build passed. The style-invalidation cost of a single `html:has()` is negligible.
- `scroll-padding-bottom` does not change the scripted `window.scrollTo` in the explanation auto-scroll, and in-page `#anchor` jumps stay top-aligned. No interaction.
- Header 14px name and 8–10px gaps live only in the 640 block; desktop is untouched.
- Phone-only `.flowNode` padding and line-height: the `::before` arrow got an explicit `line-height: 20px` and `top: -20px` to match the 20px gap, which is consistent. The SSR tests on node text still pass with the extra span.

### Round 2 recommendation

Fix R2-M1 (one token: `var(--practice-bar-h, 61px)`), and this becomes **PASS** with no re-review needed. R2-L1 is optional.
