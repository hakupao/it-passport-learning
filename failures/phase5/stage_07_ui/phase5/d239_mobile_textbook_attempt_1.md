# D-239 mobile textbook — attempt 1 (superseded, kept per Rule B)

Date: 2026-11-18 (S164). Lane: textbook (step figures + OQ-18).

## A. Unit title: `.h1` overflow-wrap only

Input:
- `management-08-25-u03` /en title "Test Techniques and Integration/Performance Verification": 26px, one unbreakable word `Integration/Performance`.
- `technology-22-60-u04` /en "…Telecommunications Carriers" at 320px.

Product: `reader.module.css` `.h1 { overflow-wrap: break-word }` only, with the font kept at 26px.
- Technical verdict: PASS. Full sweep of 244 units × ja/zh/en × 320/360/390 found 0 rows over the viewport.
- Business verdict: FAIL (visual). At 375 and 390 the title broke mid-word as "Integration/Performan" / "ce Verification".

Probe that did not help: `hyphens: auto` on the `<h1>` (html lang="en" is set). Headless Chromium on macOS did not hyphenate.

Screenshots:
- `evidence/phase5/stage_07_ui/phase5/textbook/shots/attempt1-breakword-only_en_management-08-25-u03_h1_375.png` is the **`hyphens: auto` probe capture**: the h1 element only, 375px, break-word + hyphens:auto injected. It looks identical to the break-word-only result.
- The first full-page break-word-only after-shots (`after-local_*` from build 1) were **deleted with `rm -f`** before the reshoot. That was a mistake under Rule B, and they cannot be recovered. Their content was the same mid-word break.

Next attempt input (shipped): keep break-word as the safety net, and set the `<h1>` to 22px at ≤640px.

## B. Step figure: dashed slots only (build 1 / build 3)

Product:
- `.off` shown as dashed empty slots on phones.
- `.controls` gap 8px plus `flex-wrap`.
- `.btn` padding 8px 14px.

Result of stepping through every step (`evidence/.../textbook/raw/stepwalk_attempt1-build.txt`):
- The frame height was constant, but the controls still moved between steps by 24–73px, because the live caption's height follows each step's caption.
- At 320 on the last step (再看一遍 / Play again) the controls wrapped from 41px to 90px.
- 4 of 20 cases changed frame or controls height. All 20 had the controls top moving.
- Technical verdict: page sweep PASS (the sweep cannot see this).
- Business verdict: FAIL against "no layout jumps between steps".

Next attempt input (shipped):
- A caption box holding every caption as an `aria-hidden` sizer, shown only on phones.
- `.fig` padding 12px on phones.
- `.btn` padding 8px 10px.

After that, 0 cases moved (`raw/stepwalk_after.txt`).

## Tooling slip

The first URL screenshots used `p:has-text("example.ne.jp")`, which matched a figure caption first. They were redone with `p:has-text("https://www.example.ne.jp")` under the same file names, which overwrote the wrong shots.

## C. Step figure: (a)-only, superseded after Rule D (CONDITIONAL M-1 / L-2)

- Product: dashed slots, a fixed caption box, and controls that do not move. Desktop rhythm kept.
- Unreached labels were only `color: transparent`.
- Technical verdict: PASS (0 button movement).
- Business verdict: FAIL vs D-239 「余白を詰める」. The stage height was unchanged (step-1 figure 401 → 401px).
- L-2: find-in-page matched the hidden labels, and forced colors revealed them.
- Next attempt input (main, D-161): (a) + (c) tighter rhythm, and labels wrapped so they can be `visibility: hidden`.
- Superseded shots: `evidence/phase5/stage_07_ui/phase5/textbook/shots/superseded_option-a-only/` (moved, not deleted).
- Per-step stage heights: `raw/stepwalk_option-a_stage.txt`.
