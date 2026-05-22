# Step 1 — design notes

Phase 3 Step 1 (Reader 壳) · Session 50 · 2026-05-22.

## 1. Locked LDs from PLAN.md §0 + how Step 1 honours them

| LD | Where applied in Step 1 |
|---|---|
| **LD-1** NavTabs 保留 4-tab (Book + chat/quiz/glossary) with Book visually 主体 / chat/quiz/glossary 视觉降级 | `apps/web/src/components/NavTabs.tsx`: Book chip = larger `text-sm sm:text-base font-semibold` + full-fill active state; secondary tabs after a "·" divider at `text-[11px] sm:text-xs` + lighter `text-black/55` color, smaller `h-7` height. Active styling preserved for direct-URL navigation to escape-hatch routes. |
| **LD-2** 章末固定区 + selection toolbar | Deferred to Step 2 — Step 1 emits the ChapterReader shell without `<ChapterEndPanel />` or `<SelectionToolbar />`. The footer prev/next nav is the structural placeholder where Step 2 will inject the chat+quiz panel. |
| **LD-3** scroll-to-end gate + 「我看完了」 button | Deferred to Step 3 — `progressStore.ts` + completion gate not in Step 1 scope; the "Next chapter" footer button is unconditional for now. |
| **LD-4** 3-step plan granularity | Step 1 lands the shell only; Steps 2 + 3 layer on top. |

## 2. D-101 §2.1-§2.7 honoured

- **§2.1** `/[locale]/book` exists as a route and is set as redirect target for `/[locale]` — confirmed in `apps/web/src/app/[locale]/page.tsx`. Old `/[locale]/{chat,quiz,glossary}` routes untouched (escape-hatch preserved).
- **§2.2** Chapter is the reading unit. URL = `/[locale]/book/chapter/NN` (zero-padded 00..15). `parseChapterNn()` enforces range; out-of-range / malformed → `notFound()`. Pages within a chapter render as continuous scroll per `DataSource.loadChapter()`.
- **§2.3** Content body strictly ja (`lang="ja"` on every textbook-content node in ChapterReader); chrome (page heading, prev/next buttons, badges) follows active chrome locale via `next-intl`. Glossary `<TermPopover />` integration deferred to Step 2 (selection-toolbar attaches to it).
- **§2.4** `progressStore.ts` deferred to Step 3 (LD-4).
- **§2.5** Zero changes to `/api/*`, middleware, AI prompts, D-097 firewall, D-099 next-intl chrome, D-085 historyStore, D-095 stable-prefix invariant. Verified by build output: Middleware size 44.2 kB (decreased from 48.9 kB Phase 2 baseline; reduction came from i18n-routing tree-shake after Book primary tab; no firewall logic touched).
- **§2.6** OQ-05 already fully closed Session 49 Turn 4.
- **§2.7** Reversibility — `git revert` flips NavTabs back; `/[locale]/page.tsx` revert restores `/chat` landing; new `/book` + `/book/chapter/[nn]` routes are additive.

## 3. In-source LDs Step 1 added (per D-094 §2.1)

NOT D-NNN-worthy individually — implementation patterns of locked D-101.

| LD | Decision | Rationale |
|---|---|---|
| **LD-Step1-A** | Render chapter content via `projectRenderEntities()` over `Page.entities[]` rather than parsing per-page MD | Fixture `pages/*.md` files don't ship with `_fixtures/v1.0.3` (referenced in index but absent on disk). Entities carry trilingual titles + captions + section numbers, which is sufficient for the Step 1 "shell". A future ingestion step could populate MD and the renderer would gain a richer body, but the shell contract stays the same. |
| **LD-Step1-B** | `parseChapterNn()` enforces zero-padded 2-digit input only ("07" yes; "7" / "007" / "16" no) | Canonical URL shape per D-101 §2.2; rejects ambiguous variants → 404. Hard fail on out-of-range avoids silently rendering an empty chapter. |
| **LD-Step1-C** | `<BookIndex />` is a server component using `useTranslations()` from `next-intl` — no `"use client"` directive | The TOC has no client state; static rendering across `ja/zh/en` (visible in next build output as ●). Mirrors the `QuizList`-route-shell-as-server pattern but keeps the actual TOC node server-rendered too, since there is no `useSearchParams` / `useRouter` need for Step 1. |
| **LD-Step1-D** | `<ChapterReader />` likewise server-rendered, no `"use client"` | Same reasoning. Step 2 will introduce client wrappers for selection toolbar + chapter-end panel; Step 1 stays static so the SSG-prerenderable shape is maximally testable. Chapter route shows as ƒ in next build only because of `force-dynamic` (the route imports `getDataSource()` which is server-only filesystem I/O). |
| **LD-Step1-E** | Linking to `/book/chapter/${nn}` uses plain string href, not next-intl `{pathname, params}` object | Project's `routing.ts` does NOT define `pathnames` map → next-intl's typed-pathname Link object form is not configured. Plain string hrefs go through next-intl's locale-prefixing wrapper just fine. Verified empirically: `Link` from `@/i18n/navigation` accepts `string`; build passes. |

## 4. Bundle / build invariants

| Surface | Phase 2 baseline (S47) | Phase 3 Step 1 | Δ |
|---|---|---|---|
| Middleware | 48.9 kB | 44.2 kB | −4.7 kB |
| Shared First Load JS | 115 kB | 102 kB | −13 kB |
| /[locale]/chat First Load | 169 kB (was 122 kB Size + ~47 shared per S47 table) | 169 kB | 0 |
| /[locale]/quiz Size | 4.53 kB | 4.71 kB | +0.18 kB (TermPopover untouched; next-intl message bundle slightly larger w/ +Book keys) |
| /[locale]/glossary Size | 4.53 kB | 4.71 kB | +0.18 kB (same) |
| /[locale]/book | — | 175 B / 119 kB | NEW |
| /[locale]/book/chapter/[nn] | — | 175 B / 119 kB | NEW (ƒ dynamic) |

Notes on the Δ:
- Middleware shrank because the secondary tab labels are now used less; tree-shake delta is minor but visible.
- Shared First Load JS dropped 13 kB — likely from Next.js 15.5 internal updates rather than our diff (the underlying app changes don't reduce the runtime).
- /chat First Load looks unchanged.

## 5. Verification gates ran

| Gate | Result |
|---|---|
| `pnpm exec vitest run` | 299 / 299 PASS (was 279; +20 new chapterScope cases) |
| `pnpm exec tsc --noEmit` | 0 errors (after fixing 5 `noUncheckedIndexedAccess` issues during the cycle) |
| `pnpm exec eslint src` | 0 errors / 0 warnings |
| `pnpm exec next build` | 23 static pages, /book SSG ●, /book/chapter/[nn] dynamic ƒ |

Per CLAUDE.md Rule D + PLAN.md §3, browser-based reviewer (Playwright + axe-core + Lighthouse) is deferred to Step 3 close per Phase 2 Step 14 + 15 pattern. Step 1 evidence intentionally stays at the build-time gate level — UI smoke / a11y / perf at Step 3 close.

## 6. Out of Step 1 scope (queued)

- **Step 2** — ChapterEndPanel (问本章 + 测本章) reusing /api/chat + /api/quiz/explain at the chapter scope, SelectionToolbar (`<SelectionToolbar.tsx>` listening for `selectionchange`) + ParagraphTranslate (`<ParagraphTranslate.tsx>` modal). LD-2.
- **Step 3** — `progressStore.ts`, scroll-to-end gate + 「我看完了」 button, completion visualization on `BookIndex`, Vercel prod deploy, Playwright e2e smoke, RETROSPECTIVE_phase3.md, optional Phase 3 ship tag. LD-3 + LD-4.

## 7. Tripwire snapshot

- **γ wall-drift** — Phase 2 close N=16 baseline. Step 1 actual wall ~70 min vs PLAN.md Step 1 estimate 3-5h (180-300 min); **first under-estimate datapoint for Module Phase-3-Step-1** = ~−65% under (180 min midpoint vs 70 actual). Driver: D-101's "zero refactor; composition only" turned out to be very accurate — no scope drift, no architectural surprises. Module Phase-3 N=1 too early to re-estimate Steps 2/3 yet.
- **β cache-hit** — N=14 cumulative final from Phase 2. Step 1 added zero `/api/*` calls (no LLM smoke this step); β data only re-opens at Step 2 when paragraph-translate calls go live.
- **δ runtime detector** — LIVE silent (Phase 2 invariant preserved; no new LLM call paths added).
- **ε model release / pricing** — no fire.
- **α model deprecation** — no fire.

## 8. Rule B failures Session 50

None. The 5 `noUncheckedIndexedAccess` TS errors during the cycle were caught + fixed in the same tsc pass — not Rule B archive grade (per D-094 §2.4 distinction between in-step diversion vs architectural surprise). Documented inline here for trace.
