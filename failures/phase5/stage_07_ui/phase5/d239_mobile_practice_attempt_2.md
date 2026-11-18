# D-239 mobile practice — attempt 2 (S164): the explanation heading hidden under the next bar

## Input

The build after attempt 1's fixes (`failures/phase5/stage_07_ui/phase5/d239_mobile_practice_attempt_1.md`).
All e2e passed: 70 passed in the practice set, and the textbook set gave 68 passed and 2 skipped.

## Finding (advisor review, then reproduced)

After an answer, `PracticeSession`'s scroll effect skips the scroll when the explanation heading is "already
in view". It tested that as `r.bottom <= window.innerHeight`. With the fixed bar (61px plus the safe area), a
heading that lands in the bottom 61px counts as visible. The page then does not scroll, and the heading
sits under the bar.

The after-shots at 390×844 and 412×915 show `scrollY: 0`, so this branch is live on the main devices: a
slightly longer stem puts the heading in the band.

**Reproduction.** I added an e2e test, `e2e/mobile.spec.ts` "after an answer the explanation heading is never
left under the bar". It first finds the heading's position with a 2000px-tall viewport. It then sets the
viewport height to that bottom + 30px and answers again. Against the attempt-1 build it failed:
heading bottom 707 > bar top 676.

## Business verdict

This is real. On the first screen after answering, the user would see neither the heading nor the start of the explanation.

## Next attempt input

In `PracticeSession.tsx` the in-view test now uses the bar's top as the visible bottom when the prev / next
row is `position: fixed`, and `innerHeight` otherwise, so desktop is unchanged. Then: rebuild, rerun the same
test, and run the full gates.
