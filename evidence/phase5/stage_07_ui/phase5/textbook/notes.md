# D-239 (Stage 7 Phase 5, mobile) — textbook: step figures + OQ-18 + glossary/index glance

Date 2026-11-18 (S164). Executor lane "textbook". A parallel lane did practice / AppShell in the same tree; its `app.module.css` phone gutter (16px instead of 32px, header ~76px) is in every after-build here.
Nothing committed or pushed. Local server only on :3161 (`scripts/local-cf.ts` serving a copy of `out/`, `--api` to a dead port), stopped by PID after each use.
Prod was only read by GET screenshots (standalone script `tools/shot.mjs`, no `playwright test` against prod, D-213).

## 1. Step figures — UNDECIDED DESIGN CALL (for the orchestrator / user)

D-239 says ステップ図の余白を**詰める** (shrink the blank). This change does **not** make the figure shorter. It fills the blank with dashed placeholder slots and stops every per-step jump of the buttons. The step-1 stage is 401px before (prod) and 401px after at 375/390.

**Cause.** In `figures/figures.module.css`, `.off { visibility: hidden }` keeps every node a step has not reached yet in the layout, so the stage does not jump between steps. At ≤640px `.flow` becomes a column (26px arrow gap per node). On step 1 of a 4-node flow, three hidden nodes plus their arrows (~230 CSS px) sat between the step box and the caption. Tree step figures do the same with their hidden deeper levels.

**Corpus survey.** I surveyed all 244 unit JSONs: there are 417 `flow/steps` figures with 3 to 7 nodes (largest: strategy-04-13-u02 n=7, management-12-31-u02 n=6) and 14 `tree/steps` figures.

**A second jump nobody had reported.** Stepping through every step (`tools/stepwalk.mjs`, `raw/stepwalk_*.txt`) showed the buttons still moved between steps:
- The live caption's height follows each step's caption, so the controls moved by 24–73px between steps (e.g. en management-10-27-u02 at 360: controls top 658 / 585 / 634).
- At 320, the last step's wider label (再看一遍 / Play again) made the controls row wrap from 41px to 90px tall.

**Change (phones only; desktop is pixel-identical, see below):**
- `StepStage.tsx:47-56`: the caption sits in a `.capBox` grid. Next to the live `<p aria-live>` (which still holds only the current caption), the box carries every caption as an `aria-hidden` sizer `<span>` in the same grid cell.
- `figures.module.css:145-153`: `.capBox` / `.capSizer`; the sizers are `display: none` on desktop.
- `figures.module.css:205-238` (`@media (max-width: 640px)`):
  - `.off` becomes a dashed `--rule` empty slot: text and fill transparent, `user-select: none`, still `aria-hidden`.
  - The arrow into an unreached node uses `--rule`.
  - `.capSizer` is shown with `visibility: hidden`, so the caption box always has the tallest caption's height.
  - `.fig` padding goes from 16px to 12px.
  - `.controls` gap goes from 12px to 8px, with `flex-wrap` kept only as a safety net.
  - `.btn` padding becomes 8px 10px (about 41px tall for the thumb).
- `figures.ssr.test.ts:309-312`: asserts one hidden sizer per caption and that the live region holds only the current caption.

**Result (`raw/stepwalk_after.txt`).** I checked zh PDCA (strategy-01-01-u04), en/ja strategy-04-13-u02 (n=7), and the en/zh tree management-10-27-u02, at 320/360/375/390, on every step:
- frame height: one value per case
- controls: 41px and one top value per case (**0 cases with any movement**)
- inner figure scroll: 0

**Alternatives for the call:**
- **(a) Shipped:** placeholder slots plus a fixed caption box. The figure has the same height as before, the controls never move, and the slots show how many steps remain.
- **(b) Collapse:** use `display: none` on unreached nodes and put the caption and controls *above* the frame on phones. The figure would really shrink on early steps, and the tap target would stay put, but the content below the figure would move on every step. The first paint is also the last step, and autoplay then shrinks it to step 1, which makes the page below jump once.
- **(c) Tighter rhythm (combinable with a):** shrink the arrow gap and node padding on phones. This would save roughly 50–70px on a 7-node flow.

The heights still are: PDCA 4-node stage 401px; the n=7 flow frame 474px; the depth-4 tree frame 507–531px (stage 635–676px).

**Shots.** Step 1 is reached via もう一度 under reduced motion; before = prod, after = local.
- `shots/before-prod_stepper_zh_strategy-01-01-u04_step1_{375x667,390x844}.png` → `shots/after-local_stepper_zh_strategy-01-01-u04_step1_*`
- `shots/before-prod_stepper-tree_en_management-10-27-u02_step1_*` → `shots/after-local_stepper-tree_en_management-10-27-u02_step1_*`
- `shots/after-local_stepper_zh_strategy-01-01-u04_laststep_320x568.png`: the last step at 320 shows 上一步 … 再看一遍 on one line.

## 2. OQ-18: page-level horizontal scroll on phones

**Measured:** all 244 units × ja/zh/en × 320/360/390 = 2,196 rows.
- Before: 11 rows over the viewport, all on the 3 known pages and no others.
- After (final build): 0.
- Table: `overflow_table.md`. Raw: `raw/overflow_{before,after}.jsonl`. Script: `tools/measure.mjs`.

**Causes.** Each was confirmed in the page by injecting the fix and re-reading scrollWidth (`tools/toggle.mjs`: 401→320, 333→320, 383/392/387→320).
- **management-08-25-u03 /en (401 at every width):** the unit `<h1>` "Test Techniques and Integration/Performance Verification". `Integration/Performance` is one unbreakable word, ~369px at 26px. It is **not** the figures-module table that S140 named; that table scrolls inside `.fig` (sw 565 / cw 254) and does not reach the page.
- **technology-22-60-u04 /en (333 at 320):** the `<h1>` word "Telecommunications" at 26px.
- **technology-22-60-u02 ja/zh/en (383/392/387):** the detail paragraph (`.prose`) holds the unbreakable example URL `https://www.example.ne.jp/news/top.html`.

**Change:**
- `reader.module.css:164-167`: `.h1 { overflow-wrap: break-word }`. This is `break-word`, not `anywhere`: it breaks only an overflowing word and leaves min-content alone, so the S137/S140 table rules are untouched.
- `reader.module.css:169-175`: `@media (max-width: 640px) { .h1 { font-size: 22px } }`. **This is a separable call.** It is cosmetic and not needed for OQ-18; break-word alone fixes the scroll but gave "Integration/Performan|ce" (see failures).
  - Titles that still overflow at 320 with wrapping off: 2 at 26px, 1 at 24px, 1 at 22px.
  - At 375, 22px keeps the word whole **only with the 16px phone gutter of the other lane** (h1 column 343 ≥ 343). With prod's 32px gutter the column is 311 < 312, so the word would break mid-word (`tools/gutter.mjs`). The CSS comment says so.
- `reader.module.css:274-276`: `.prose { overflow-wrap: break-word }`.

**Shots** (before = prod, after = local):
- `overflow_en_management-08-25-u03_h1_{375x667,390x844}`: before sw 401 → after 375/390.
- `overflow_zh_technology-22-60-u02_url_{375x667,390x844}`: before 392 → after 375/390.
- `overflow_en_technology-22-60-u04_h1_{375x667,390x844}`: no scroll before either (it overflowed at 320 only); after, the title is 22px and 3 lines.
- `overflow_en_technology-22-60-u04_h1_320x568`: 333 → 320.
- `overflow_ja_technology-22-60-u02_url_320x568`: 383 → 320.

**E2E (`e2e/textbook-v2.spec.ts:254-282`).** The old test checked `/ja` at 390 over `TEXTBOOK_E2E_UNITS`, which defaults to the 3 pilot units, none of the overflowing ones. Adding locales alone would therefore have been green before the fix. Now:
- `v2 units at {320,360,390}px /{ja,zh,en}: no horizontal page scroll` (9 tests) runs over `TEXTBOOK_E2E_UNITS` plus the 3 OQ-18 units, which are always included.
- `v2 unit at 320px: an unbreakable word in the title or a detail does not scroll the page` injects a title word and a URL (S140 pattern), so it survives content rewrites.
- The new tests were proven red on the before build (`raw/e2e-red-before.log`: 9 failed, 1 passed; only 390/ja passed, matching the sweep) and are green after.

OQ-18 is ready to close; this lane neither closed it nor edited STATE.md. The user must agree to the close.

## 3. Glance: /zh/textbook, /zh/glossary, glossary term pages (375/390)

- `/zh/textbook` and `/zh/glossary` (index) at 375: nothing broken.
- Glossary sweep (`tools/gloss.mjs`): 3 locales × (2 index pages + the 120 term pages with the longest en titles + every 12th of the rest) × 320/375 = 1,374 checks.
  - One page scrolled: the URL term `t7569633ef1e706a7`, which has the same example URL in its `.prose`. On prod, zh is 392 at both 375 and 390.
  - Fixed in `glossary/glossary.module.css:173-174` with `.prose { overflow-wrap: break-word }`. After: 0/1,374.
- New e2e `e2e/glossary.spec.ts:130-144` (`glossary detail at {320,375}px: URL's example URL does not scroll the page`): red before (ja 367 at 320, zh 376 at 375; `raw/e2e-gloss-red.log`), green after.
- Shots: `before-prod_overflow_zh_glossary-URL_*` → `after-local_overflow_zh_glossary-URL_*`.

## Desktop unchanged

I took `<main>` element screenshots at 1280×900 (reduced motion) of the 5 textbook pages above and the URL term page, on the before build and on the final after build (including the caption-box DOM change). Result: **0 differing bytes in all 6** (`raw/desktop_main_1280_cmp.txt`, `tools/desk.mjs`, `tools/cmp.mjs`).

## Tests (fresh, after the final build, all changes in)

| command | result |
|---|---|
| `cd apps/web && pnpm vitest run` | 134 files / **1496 passed**, exit 0 (the new SSR assertions are inside an existing test) |
| `pnpm vitest run src/components/textbook` | 7 files / 67 passed |
| `pnpm exec tsc --noEmit` | exit 0 |
| `pnpm lint` | exit 0: 0 errors, 2 warnings, both pre-existing (`src/lib/textbook/__tests__/cleanup-pins.test.ts:213-214`). One earlier run exited 1 only on files in the gitignored `playwright-report/` that a Playwright run was writing at that moment. |
| `pnpm build` | exit 0 |
| `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright PLAYWRIGHT_BASE_URL=http://127.0.0.1:3161 pnpm exec playwright test e2e/textbook-v2.spec.ts e2e/textbook.spec.ts e2e/glossary.spec.ts` | **49 passed, 2 skipped**. textbook-v2: 31; textbook: 9 + 2 skipped; glossary: 9. The skips are the pre-existing v1-only `test.skip` conditions ("no v1 unit left", "no v1 unit with a wide first SVG"). Log: `raw/e2e-final.log`. |

The textbook and glossary specs did not need the Worker or fake Upstash.

## Caveats

- The before measurement used `out/` built at 09:39 today, after the last textbook data commit (a1093255, 11-17 23:44). On the three pages it matches prod (401/392/383/387/333).
- The final after build was made after the other lane's last shell CSS edit (`app.module.css` 18:53, `session.module.css` 18:55).
- Superseded attempts are recorded in `failures/phase5/stage_07_ui/phase5/d239_mobile_textbook_attempt_1.md`: `.h1` break-word only, the `hyphens: auto` probe, and the first stepper build whose buttons still moved.

## Open items

- The step-figure call in §1 (a / b / c) needs a decision.
- At 320px (iPhone SE 1st gen) "Integration/Performance" still breaks mid-word at 22px. It also would at 375 if the phone gutter went back to 32px.
- No Rule D review of this diff has been done yet; it needs a separate reviewer lane.

---

## Addendum (after Rule D CONDITIONAL, `../rule_d_review.md`): main's decision = (a) + (c), plus the L-2 fix (D-161)

Main decided to keep (a), the dashed placeholders, and add (c), a tighter rhythm on phones. The buttons must still not move between steps. L-2 is fixed as well.

**Changes:**
- **(c) Tighter rhythm.** `figures/figures.module.css:78-104`, ≤640px block of the flow/tree section:
  - `.flowNode`: padding 6→5px, line-height 1.75→1.5.
  - Arrow gap 26→20px, with the `↓` at `top: -20px; line-height: 20px`.
  - Tree `li` margin 6→4px; `.treeNode` line-height 1.5.
- **L-2.** Labels of unreached nodes were only `color: transparent`, so find-in-page matched them and forced colors showed them.
  - `FlowFig.tsx:32` and `TreeFig.tsx:30` now wrap each label in `<span className={styles.label}>`.
  - Phone block (`figures.module.css:219-254`): `.off .label { visibility: hidden }`. The dashed box stays. `color: transparent` and `user-select: none` are removed. `aria-hidden` / `data-off` are unchanged.
  - New SSR test in `figures.ssr.test.ts:317-325`: checks that the phone block has `.off .label { visibility: hidden }` and no `color: transparent`, and that flow/tree labels render in a `label` span. It fails on the (a)-only CSS, because that CSS has no `.off .label` rule.
- **Superseded (a)-only after-shots** were moved, not deleted, to `shots/superseded_option-a-only/`.

**Step figures per step** (`tools/stepwalk.mjs`). Every step was walked (SSR last step → もう一度 → each 次へ) at 320/360/375/390. Raw: `raw/stepwalk_option-a_stage.txt` → `raw/stepwalk_option-a+c.txt`. Stage height, (a) → (a)+(c):

| figure | 320 | 360 | 375 | 390 |
|---|---|---|---|---|
| zh strategy-01-01-u04 (PDCA, 4 nodes) | 375→335 | 375→335 | 375→335 | 375→335 |
| en strategy-04-13-u02 #2 (7 nodes) | 641→567 | 641→567 | 641→567 | 617→542 |
| ja strategy-04-13-u02 #2 (7 nodes) | 592→518 | 592→518 | 592→518 | 592→518 |
| en management-10-27-u02 (tree, depth 4) | 699→650 | 699→650 | 650→604 | 650→604 |
| zh management-10-27-u02 (tree, depth 4) | 625→580 | 625→580 | 625→580 | 625→580 |

- Savings: −40px for the 4-node flow, −74/−75px for the 7-node flow, −45 to −49px for the tree.
- In all 20 cases the frame height and the controls top each have one value across all steps: **button movement 0**. The controls are 41px and on one line everywhere, and there is no inner figure scroll.
- Whole figure (`<figure>`) height at step 1, prod → after:
  - PDCA: 401 → 361 at 375/390.
  - n=7: 618 → 593 (375) / 568 (390).
  - Tree: 651 → 630.
- New shots:
  - `shots/before-prod_stepper-n7_en_strategy-04-13-u02_step1_{375x667,390x844}` → `shots/after-local_stepper-n7_*`.
  - Re-shot: `after-local_stepper_zh_strategy-01-01-u04_step1_*`, `after-local_stepper-tree_en_management-10-27-u02_step1_*`, `after-local_stepper_zh_strategy-01-01-u04_laststep_320x568`.

**L-2 check** (`tools/l2.mjs`, zh PDCA step 1 at 390):
- With `forcedColors` none and with active: 3 unreached nodes, label `visibility: hidden`.
- `window.find("Do 执行")` = false (not found); `window.find("Plan 计划")` = true (reached node still found).
- The (a)-only build was overwritten before this check, so there is no in-browser before run. The SSR test above is the red/green guard.

**Re-run on the (a)+(c) build.** No other `next build` was running before or after `pnpm build`.

| check | result |
|---|---|
| `pnpm vitest run` | 134 files / **1497 passed** (+1 = the L-2 SSR test) |
| `pnpm vitest run src/components/textbook` | 7 files / 68 passed |
| `pnpm exec tsc --noEmit` | exit 0 |
| `pnpm lint` | exit 0: 0 errors, 2 warnings, both pre-existing in `cleanup-pins.test.ts` |
| `pnpm build` | exit 0 |
| Playwright textbook-v2 + textbook + glossary on :3161 | **49 passed, 2 skipped** (`raw/e2e-final_a+c.log`) |
| OQ-18 sweep, 244 units × 3 locales × 320/360/390 | **0/2196** over the viewport (`raw/overflow_after_a+c.jsonl`) |
| glossary sweep | **0/1374** |
| desktop `<main>` at 1280, before vs (a)+(c) build | **0 differing bytes in all 6** (`raw/desktop_main_1280_cmp_a+c.txt`) |
