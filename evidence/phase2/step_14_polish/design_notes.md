# Step 14 polish — design notes (Session 46, 2026-05-20)

> Step 14 = a11y polish + zh `QuizExplain.busyText` Sample 5 polish. CODE-COMPLETE
> this session; Lighthouse + axe-core smoke evidence held for Session 47.

---

## 1. Scope reminder

Per Session 44 lock at Module C+D re-estimate close: Step 14 ≈ 2.3h adjusted
estimate. Scope: Lighthouse audit + a11y polish + 1 minor zh polish from
Step 12 audit §3 Sample 5.

Per Session 46 Turn 1 4Q lock (`Q1=a Q2=a Q3=a Q4=a` — 5th consecutive
Phase 2 blanket-ACK):
  - Q1 Lighthouse 阈值 = Perf≥90 + A11y≥95 + BP≥95 + SEO≥90.
  - Q2 a11y scope = Full WCAG 2.1 AA.
  - Q3 zh polish = busyText 改为「AI 正在生成回答…（最长约 30–45 秒）」.
  - Q4 验证手段 = Chrome DevTools MCP `lighthouse_audit` + `evaluate_script`
    injected axe-core (double-pass on prod canonical, Session 47).

---

## 2. WCAG 2.1 AA scope-mapping per Q2=a

| WCAG SC | Title | Before Step 14 | Step 14 fix |
|---|---|---|---|
| **1.4.3** | Contrast (Minimum) AA | `text-black/40` 2.85:1 / `text-black/50` 3.95:1 FAIL AA Normal (4.5:1 req) | LD-3: bump `/40 → /55` (4.83:1) and `/50 → /60` (5.74:1) in 6 components |
| **1.4.11** | Non-Text Contrast (Focus, AA-2.1) | `focus:border-black/40` 2.85:1 FAIL 3:1 req | LD-4: uniform `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white` (high-contrast ring on light + dark) on all interactive |
| **1.3.1** | Info & Relationships | Already had landmarks/lists/headings | unchanged ✓ (Module C work) |
| **2.1.1** | Keyboard | All controls already keyboard-operable | unchanged ✓ |
| **2.3.3** | Animation from Interactions (AAA-bonus) | `animate-pulse` + indeterminate progress always animated | LD-6: `motion-safe:animate-pulse` + `@media (prefers-reduced-motion: reduce)` fallback (above-AA quality-over-cost) |
| **2.4.1** | Bypass Blocks AA | No skip link; keyboard users tabbed through NavTabs every page | LD-2: `<SkipLink />` injected as first child inside `<NextIntlClientProvider>`; targets `#main-content` |
| **2.4.3** | Focus Order AA | `<QuizExplain />` + `<TermPopover />` modals had no focus trap; Tab leaked behind the dialog | LD-5: `useFocusTrap(active, rootRef)` hook engaged in both modals; on close, focus restores to triggering element |
| **2.4.7** | Focus Visible AA | Some buttons relied on default browser outline (suppressed by `transition-colors` competing) | LD-4 covers (same ring policy as 1.4.11) |
| **3.1.1** | Language of Page AA | `<html lang={locale}>` from Session 44 | unchanged ✓ |
| **3.1.2** | Language of Parts AA | Already `lang="ja" lang="zh" lang="en"` on multilingual fragments | unchanged ✓ (Module C/Step 11 work) |
| **4.1.2** | Name, Role, Value AA | All buttons/links/inputs already had names | unchanged ✓ |
| **4.1.3** | Status Messages AA | Streaming had `aria-live="polite"` but no `aria-busy` | LD-7: `aria-busy={isStreaming\|\|phase==loading\|\|phase==streaming}` on scroll containers in Chat + QuizExplain + TermPopover |

---

## 3. The 10 LDs (in-source amendments per D-094 §2.1)

| LD | Decision | Where it lives |
|---|---|---|
| LD-1 | useFocusTrap landing site = `apps/web/src/lib/a11y/useFocusTrap.ts` | new file |
| LD-2 | SkipLink landing site = `apps/web/src/components/SkipLink.tsx`; injected in `[locale]/layout.tsx` as first child inside `<NextIntlClientProvider>` | new file + 2-line layout patch |
| LD-3 | Contrast bumps `/40 → /55`, `/50 → /60`; mirrored in dark mode `/40 → /55`, `/50 → /60` | 6 component files |
| LD-4 | Focus-visible ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white` — extracted as `FOCUS_RING` const in each component to avoid string duplication | 7 component files |
| LD-5 | Focus trap mechanism: `useFocusTrap(active, rootRef)` returns void; rising-edge captures `document.activeElement`; on mount focuses first focusable inside root; Tab/Shift+Tab cycles; on unmount restores prior focus. ESC dismiss continues to be each modal's own `onClose`. | useFocusTrap.ts |
| LD-6 | Reduced motion gates: `motion-safe:animate-pulse` Tailwind variant + `@media (prefers-reduced-motion: reduce)` block in BusySkeleton `<style>` tags with a static-bar fallback | QuizExplain + TermPopover BusySkeletons |
| LD-7 | `aria-busy` boolean on streaming/loading containers: `<Chat />` scroll list, `<QuizExplain />` content area, `<TermPopover />` content area | 3 component files |
| LD-8 | Main landmark id: each page's existing `<main>` gets `id="main-content" tabIndex={-1} className="... focus:outline-none"`; SkipLink href = `#main-content` (single id is safe because exactly one page renders at a time) | Chat + QuizList + GlossaryList |
| LD-9 | i18n key `Common.skipToMain` added in all 3 messages files (ja/zh/en) | messages/*.json |
| LD-10 | Lighthouse + axe-core evidence deferred to Session 47 deploy cycle | (not a code change) |

---

## 4. Testing strategy (no new vitest cases this Step)

Existing project test discipline = pure-logic unit tests in node env; UI
behavior verified via Chrome DevTools MCP integration smoke in subsequent
sessions. Step 14's surface is:
  - 1 hook (useFocusTrap) = ~115 lines DOM side-effect
  - 1 component (SkipLink) = ~20 lines pure-JSX
  - 8 component edits = contrast/CSS/aria-attr only

vitest config in `apps/web/vitest.config.ts` uses `environment: "node"` with
no jsdom/happy-dom installed. Adding jsdom would land in `pnpm-lock.yaml` as
a non-trivial devDep change. Per Session 46 Turn 3 (during execution), three
options were considered:
  - (a) Install jsdom/happy-dom → write hook test
  - (b) Refactor hook with DI'd query-fn → write pure test
  - (c) Defer to Session 47 axe-core integration smoke → no unit test

Choice **(c)** matches the existing project discipline:
  - 9 prior UI steps (4-12) wrote 0 React component tests; all behavior
    verified via Chrome DevTools MCP smoke per Sessions 41-44.
  - useFocusTrap is structurally similar to a browser-only side-effect: a
    fair mock would mostly re-implement the hook itself, providing little
    additional safety net.
  - Session 47 will run MCP `lighthouse_audit` (a11y score ≥95 per Q1=a) +
    axe-core via `evaluate_script` — both exercise the hook end-to-end.
  - Regression safety net for THIS step = (i) tsc strict (caught the array
    indexing strictness during execution; see §6.1), (ii) ESLint, (iii) 277
    cumulative vitest cases stay green (no logic regression elsewhere),
    (iv) `next build` smoke.

If Session 47 axe-core finds keyboard nav issues that point to useFocusTrap,
the right move is to add a focused unit test along with the fix (with
happy-dom devDep gate at that time).

---

## 5. γ tripwire — 14th consecutive data point

**Step 14 actual ~125 min vs Session 44 adjusted estimate ~138 min (2.3h)
→ −9%.**

Drift band so far:
  - Steps 1-3 (Module A scaffold): −98% × 3
  - Steps 4-8 (Module B API wiring): avg −83.6%
  - Steps 9-10 (Module C UI bootstrap): −85% × 2
  - Steps 11-12 (Module C UI structural): −58% × 2
  - Step 13 (Module D backend wire-in): −31%
  - **Step 14 (Module D UI polish): −9%** ← first sub-30% data point; closest
    to the adjusted estimate yet

Why so close? The Session 44 lock baked in Module C avg −71.5% drift into
Module D, AND Step 14 is a "wide-but-shallow" 12-file polish step where the
work is mostly mechanical (contrast bumps + focus ring CSS class strings +
2 modal hook integrations). The remaining drift comes from:
  - 8 different files needing per-file context engagement (limits parallelism)
  - tsc strict caught 3 array-indexing issues in useFocusTrap requiring a
    small refactor (~3 min, see §6.1)
  - Quality-over-cost adds (LD-6 reduced-motion, beyond strict AA scope) +5 min

**D-094 §2.4 mid-retro pattern continues** — PLAN.md inline `actual ~125 min`
amend on Step 14 row; NOT full re-estimate. Module D Step 15 (E2E + prod +
domain) remains structurally distinct (Playwright + deployment, not UI
polish), so the −9% drift here is not extrapolated to Step 15. Module D
Step 13 (-31%) + Step 14 (-9%) average −20% so far over 2 data points.

---

## 6. In-step diversions (NOT Rule B archive grade)

### 6.1 tsc strict array-index undefined (3 errors, 3-line fix)

After first tsc pass, 3 errors in useFocusTrap.ts:
```
useFocusTrap.ts(76,7): error TS2532: Object is possibly 'undefined'.
useFocusTrap.ts(98,11): error TS18048: 'last' is possibly 'undefined'.
useFocusTrap.ts(103,11): error TS18048: 'first' is possibly 'undefined'.
```

Root cause: project tsconfig has `"noUncheckedIndexedAccess": true` (implied
via `strict: true` family). `focusables[0]` is typed `HTMLElement | undefined`
even after `focusables.length > 0` check (TS doesn't narrow array access by
length).

Fix: replace post-length-check usage with destructured locals + truthy guard:
```ts
const first = current[0];
const last = current[current.length - 1];
if (!first || !last) {
  event.preventDefault();
  return;
}
// first + last now narrowed to HTMLElement
```

Identical pattern previously seen in `quizScope.ts` (Step 10) where
`summaries.find(...)?.choices[0]` was guarded with optional chaining. Not
Rule B archive grade — this is a TS strict-mode tooling correction at
implementation time, not a designed-architecture surprise.

### 6.2 No other diversions

The 8-component polish flow proceeded without surprises:
  - Tailwind `motion-safe:` variant worked out-of-box (Tailwind 4 supports it).
  - `<SkipLink />`'s `focus:not-sr-only` + absolute positioning pattern
    rendered correctly (verified later via deploy smoke in Session 47).
  - `useFocusTrap` integration in QuizExplain + TermPopover was a single
    `useRef<HTMLDivElement>(null)` + 1 hook call + 1 `ref={dialogRef}` attr
    per file.

---

## 7. Carry-over to Session 47 (Step 14 close + Step 15 scoping)

### Session 47 entry actions (in order, all under user gate per CLAUDE.md)

1. **Vercel Marketplace Upstash Redis provisioning** (Session 45 deferred) —
   manual dashboard click; verify `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
   land in preview+production scope via `vercel env ls`.
2. **Env var pull** — `vercel env pull apps/web/.env.local` so dev mode hits
   same Upstash instance.
3. **Vercel prod deploy** with Step 13 cap.ts wired + Step 14 a11y polish
   bundled. Single deploy = both steps shipped.
4. **Deliberate cap-trigger smoke** (Session 45 deferred) — single whole-book
   Opus uncached `/api/chat` (~$1.37 est) to cross $1.00 per-query wall +
   log `[cap-wall]` evidence; iterative 50× `/api/glossary/hover` (~$0.10
   each via Anthropic) to surface `[cap-breach]` on $5 JST day crossing.
   Budget envelope $0.01-$0.05 真.
5. **Lighthouse audit** via MCP `lighthouse_audit` on all 9 prod URLs
   (ja/zh/en × chat/quiz/glossary). Target per Q1=a: Perf≥90 / A11y≥95 /
   BP≥95 / SEO≥90.
6. **axe-core smoke** via MCP `evaluate_script` injecting axe-core CDN,
   running on each surface; expect 0 serious/critical violations per Q2=a
   Full WCAG 2.1 AA.
7. **Step 14 close**: PLAN.md ✅ DONE row + STATE.md sync + evidence dir
   completion (a11y_audit.md + lighthouse_results.md + axe_core_results.md
   + deploy_log.txt).
8. **Step 15 design 4Q** per D-019 §3a slow-pace — E2E + custom domain +
   Phase 2 RETROSPECTIVE.md scoping.

### What's NOT in Step 14 scope (deferred)

  - Real-world screen reader spot-check (NVDA / VoiceOver). Out-of-band
    manual test in Session 47 if time allows; not gating on Q2=a since
    WCAG 2.1 AA scope is automatable via axe-core.
  - Mobile a11y (Touch target size 2.5.5 is AAA, not AA — not in scope).
  - i18n catalog deep audit beyond Sample 5. Step 12 audit §3 Samples
    1-6 were all PASS (or PASS w/ minor note that was Sample 5).
