# Phase 2 Step 12 — design notes (D-099 + LDs)

## 4Q lock (Session 44 Turn 1, D-019 §3a slow-pace)

User: `Q1=a Q2=a Q3=a Q4=a` — blanket-ACK all Recommended (third consecutive Phase 2 blanket-ACK after Sessions 41 and 43).

| Q | Lock | Rejected alternatives |
|---|---|---|
| Q1 | **Top sticky tab nav** + locale switcher right | Side-rail nav (eats mobile width); bottom mobile-tab (not desktop-idiomatic for learning UI); no-global-nav inline links (no consistent mode-switch affordance) |
| Q2 | **next-intl** | react-i18next (less App Router idiomatic); Lingui (heavier compiler-extract build pipeline); hand-rolled `t()` (reinvents plurals/dates without budget-critical gain) |
| Q3 | **ja default + `/ja /zh /en` path-based** (`localePrefix: 'always'`) | as-needed prefix (blurs locale boundary; rejected explicitly per Q3=a "ja default + `/ja` path"); cookie-based (URL not shareable; locale invisible to crawlers); `?lang=` query (clashes with `?qid=` `?term=` conventions); en default (misaligned with JP corpus + JP-IT-Passport target user) |
| Q4 | **Full chrome + busy + error ja/zh/en at Step 12 close** | Nav-only minimal (pushes Step 14 too heavy); layout-only defer all i18n to Step 14 (Step 14 already owns Lighthouse + a11y); ja+zh now, en defer (Step 14 carry-over couples with Module C+D re-estimate) |

## D-099 candidate ADR essence (drafted in same Turn per D-027 §1 decision-on-lock writeback)

**Title**: D-099 — Phase 2 i18n stack: next-intl + ja default + path-based locale routing.

**Locks** (Q2=a + Q3=a combined; structural Phase 2-5 infrastructure):

| § | What | Why |
|---|---|---|
| 2.1 | `next-intl@4.12.0` | Next.js 15 official partner; App Router + SSR friendly; `setRequestLocale` enables static rendering; `defineRouting`/`createMiddleware`/`createNavigation` give locale-aware Link + redirect + router + usePathname out of the box |
| 2.2 | `locales = ['ja', 'zh', 'en']`, `defaultLocale = 'ja'` | JP-IT-Passport target user has Japanese as primary literacy; English secondary (international IT terminology familiarity); Chinese tertiary (some learners) |
| 2.3 | `localePrefix: 'always'` (path-based `/ja/chat`, `/zh/chat`, `/en/chat` including default) | Q3=a explicit choice; SEO crawlable; canonical URL stable; switching locale is a real URL change shareable + bookmarkable. Rejected 'as-needed': blurs the default-locale boundary (`/chat` vs `/zh/chat` asymmetric). |
| 2.4 | Middleware compose order: D-097 firewall first → /api skip → i18n handler | Firewall MUST guard all paths (D-097 §2.3 preserved); i18n routing only applies to page routes (`/api/*` are locale-agnostic); failing this order leaks unprefixed pages briefly to unauthenticated visitors. Verified by 5 new vitest composition tests. |
| 2.5 | `D-099 partial-supersede D-088 §2.4` (locked Chinese error fallback) | Step 12 introduces ja/zh/en locales; the locked "user-facing error stays a frozen string" principle is preserved per-locale (ja: `「AI が一時的に利用できません。後ほど再度お試しください。」` / zh: `「AI 暂时不可用，请稍后重试。」` (unchanged) / en: `"AI is temporarily unavailable. Please try again later."`) |
| 2.6 | AI `SYSTEM_INSTRUCTION` strings stay server-side, **untouched** | D-095 §2.3 stable-prefix invariant preserved; cache-hit rate unchanged. UI flips locale; AI prompts and stable-prefix structure stay identical. |

**Rejected alternatives**: see Q1-Q4 table above. None D-NNN-locked; they remain on disk only here for traceability.

## LDs locked (in-source amendments per D-094 §2.1; NOT D-NNN-worthy individually)

| LD | What | Where |
|---|---|---|
| LD-1 | Top sticky tab nav (3 mode tabs + locale switcher right) | `src/components/NavTabs.tsx` |
| LD-2 | Middleware compose order (firewall first → API skip → i18n) | `src/middleware.ts` |
| LD-3 | LocaleSwitcher = `router.replace(pathname, {locale})` + `useTransition` + preserves searchParams via `useSearchParams` | `src/components/LocaleSwitcher.tsx` |
| LD-4 | i18n string scope = full chrome + busy + error trilingual; AI prompts untouched | `messages/{ja,zh,en}.json` |
| LD-5 | Test strategy = vitest unit for middleware composition (via vi.mock); UI smoke via Chrome DevTools MCP | `src/__tests__/middleware.test.ts` + Session 44 §smoke |
| LD-6 | Type-safe messages = `global.d.ts` augments `IntlMessages` shape from `messages/ja.json` (source of truth) | `src/global.d.ts` |
| LD-7 | Root `app/layout.tsx` = pure `return children`; `[locale]/layout.tsx` owns `<html lang={locale}><body>` + `NextIntlClientProvider` + `<NavTabs />` | `src/app/{,*[locale]/}layout.tsx` |
| LD-8 | URL migration: unprefixed `/chat` → next-intl middleware redirects 307 → `/ja/chat` (default locale prefix); query params (`?qid=`, `?term=`) preserved by middleware path-rewrite | runtime behaviour, verified by middleware test + UI smoke |
| LD-9 | `<LocaleSwitcher />` wrapped in `<Suspense fallback={null}>` because `useSearchParams()` would otherwise trigger CSR bailout on static prerender of `/[locale]/chat` | `src/components/NavTabs.tsx` |
| LD-10 | next-intl `redirect()` not typed `never` in v4.12; landing page return type is `Promise<void>` (not `Promise<never>`) | `src/app/[locale]/page.tsx` |

## In-session diversions (Rule-B-equivalent; NOT formal Rule B archives per D-094 §2.4 because each was a 1-3-line config fix not a worktree-level rework)

| # | Symptom | Root cause | Fix | Cost |
|---|---|---|---|---|
| div-1 | `pnpm test` failed with `ERR_PNPM_IGNORED_BUILDS` | `pnpm-workspace.yaml allowBuilds:` had placeholder string values `set this to true or false` (pnpm 11+ requires real booleans) | replaced placeholders with `false` for `@parcel/watcher` + `@swc/core` | ~5 min |
| div-2 | `next build` ESLint plugin missing | pnpm strict-mode isolated `@next/eslint-plugin-next` + `eslint-plugin-react-hooks` from apps/web — they live in workspace store but not symlinked because eslint-config-next's package.json `dependencies` (not `peerDependencies`) requires them | added both as direct devDependencies; first pull picked too-new versions (16.x + 7.x) incompatible with eslint-config-next@15.5.18; pinned to `15.5.18` + `^5.0.0` matching transitive | ~20 min |
| div-3 | `/[locale]/chat` static prerender failed: `useSearchParams() should be wrapped in a suspense boundary` | `<LocaleSwitcher />` (rendered via `<NavTabs />` → `[locale]/layout.tsx`) uses `useSearchParams` which bails out static rendering | wrapped `<LocaleSwitcher />` in `<Suspense fallback={null}>` inside `<NavTabs />` | ~5 min |
| div-4 | Middleware vitest test failed: `Cannot find module 'next/server'` from inside next-intl's pnpm virtual store | next-intl's ESM bundle imports the bare specifier `next/server` which lacks an `exports` field in Next.js package.json; Node's ESM resolver can't walk pnpm's virtual store | `vi.mock("next-intl/middleware", ...)` in the test file stubs the import before SUT is imported; also switched `makeRequest` to construct real `NextRequest` so `req.nextUrl.pathname` resolves | ~25 min |
| div-5 | `app/[locale]/page.tsx` TS2534 "function returning 'never' cannot have a reachable end" | next-intl `redirect()` is NOT typed `never` in v4.12 (verified via Context7); my initial `Promise<never>` annotation forced TS to require unreachable end | changed return type to `Promise<void>` | ~2 min |

Total diversion cost: ~57 min wall (~28% of Step 12 total wall ~200 min). Continues the γ tripwire pattern of "Module C structural steps widen above the −80% implementation-cruise floor" first seen Step 11 (−58% / Rule B archive 1 div).

## What was DECISIVELY excluded (so the trail is clean)

- **AI prompt translation**: SYSTEM_INSTRUCTION strings stay server-side per D-095 §2.3. Translating them would break the stable-prefix invariant + ratchet cache hit rate down significantly.
- **Locale-dependent content i18n**: corpus content (textbook pages, glossary terms, quiz questions) stays JP source-of-truth; the trilingual fields already in the corpus (`.text.{jp, zh, en}`) drive any per-locale content surfaces.
- **Per-locale URL pathnames** (`/news → /neuigkeiten` in German etc): next-intl supports this via `routing.pathnames`, but our 3 routes are short English words familiar to Phase 2 α users; we keep paths uniform.
- **Number/date formatting**: deferred to Step 14 polish (Lighthouse + a11y window).
- **Locale-aware AI surface output**: the model already produces JP/中文/English 3-section trilingual via SYSTEM_INSTRUCTION; user reads their preferred section. Not changed in Step 12.
