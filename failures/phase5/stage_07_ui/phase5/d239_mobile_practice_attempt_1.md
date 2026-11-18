# D-239 mobile practice / header — attempt 1 (S164)

Stage 7 Phase 5 (mobile), practice face + session top bar + next bar + header. Attempt 1 = the first
local build (`pnpm build`, served from a copy of `out/` on :3150 via `scripts/local-cf.ts`).

## Input

- `apps/web/src/components/app/app.module.css` 640px block v1: `.bar` gap `6px 16px`, `.tools` gap 14px,
  `.nav` gap `4px 18px` at 14px, site name 16px.
- `apps/web/src/components/practice/session.module.css` 640px block v1: `.card` nowrap + `overflow-x: auto`,
  not positioned.
- `apps/web/e2e/mobile.spec.ts` v1: header measured with `page.locator("header")`.

## Output / technical verdict

`playwright test e2e/mobile.spec.ts e2e/practice.spec.ts e2e/mock.spec.ts e2e/today.spec.ts
e2e/detail-navigation.spec.ts` → run 1: 53 passed, 3 failed; run 2 (after the selector fix): 55 passed, 1 failed.

1. **Test bug.** `locator("header")` matched 2 elements on /textbook: the AppShell `<header>` and the reader's
   `.tocHead` `<header>`, so strict mode failed (ja / zh / en). Fix: `getByRole("banner")`.
2. **en header 139px at 375 (110px at 390).** Row 1 needs name 188 + tools 150 (`日 / 中 / EN` 76 + `Settings` 60
   + gap) + gap 16 = 354 > 343, so the tools dropped to row 2. The 5 en nav items are 306px at 14px,
   + 4 × 18 gap = 378 > 343, so the nav wrapped as well. ja / zh were 78px.
   Fix: site name 15px, bar column gap 12, tools gap 12, `.nav:lang(en)` 13px with gap 12
   → ja / zh 76px, en 74px at 375 / 390 / 412.
3. **Page overflow with a long group (found by the extra 30-question shot, not by a test).** At 375, question 25 / 30
   gave `scrollWidth` 552 (540 at question 1). The cells' sr-only spans are `position: absolute`. With
   no positioned ancestor up to the scroller, they escaped `.card`'s `overflow-x` clip and widened the page.
   Fix: `.card { position: relative }` in the 640px block. Added an e2e test for a 30-question group
   (no page overflow, current cell in view).

## Business verdict

Item 1 was a bug in my own test selector, not in the product. Item 2 was a real product defect, and only the e2e caught it: the zh-only screenshots showed 78px.
Failure 3 would have shipped a sideways-scrolling practice page for any group longer than ~10
questions on a phone.

## Next attempt input

The same files with the fixes above, then a rebuild and the same Playwright set plus the 30-question test.
