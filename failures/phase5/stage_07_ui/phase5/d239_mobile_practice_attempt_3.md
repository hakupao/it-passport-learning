# D-239 mobile practice — attempt 3 (S164): Rule D review CONDITIONAL

## Input

The attempt-2 build (all gates green). The Rule D review (`evidence/phase5/stage_07_ui/phase5/rule_d_review.md`)
came back CONDITIONAL. It raised M-2, L-1, L-3, L-5 and L-7; L-4 and L-6 were skipped by the coordinator.

## Reproduced against the attempt-2 build (before the fixes)

- **M-2 (WCAG 2.4.11, focus not obscured): reproduced.** New e2e, `e2e/mobile.spec.ts` "a control in the
  explanation reached by Tab is not hidden under the bar".
  - Setup: the explanation's last focusable control sits fully inside the viewport but in the bottom band,
    then the user Tabs to it.
  - Result: Chromium does not scroll it, so it stays under the bar (control bottom 659 > bar top 606).
  - A first version of the test, which Tabbed with the page at the top, passed even without the fix. Chromium
    centres a focused element that is off screen, so that version could not tell the difference. I rewrote
    the test before trusting it.
- **L-1: reproduced.** New e2e "header is two rows … (en, 360)". The en header at 360px wide is 133.5px, i.e.
  3 rows. Row 1 needs 176 + 76 + 60 + 2 gaps for 328px of content, and the nav needs 285 + 4 × 12 = 333.

## Business verdict

Both are real:
- **M-2:** a keyboard / switch user could land on a control they cannot see.
- **L-1:** 360px phones (many Android phones) would get a 3-row header in en.

## Next attempt input

- `--practice-bar-h` and `html:has(.session[data-answered]) { scroll-padding-bottom }`.
- Header: 14px site name, 10px gaps, and en nav gap 8px.
- The bar query is scoped to the session's `<main>` (L-7).
- AnswerCard re-centres on resize (L-3).
- Then rebuild and rerun the gates.
