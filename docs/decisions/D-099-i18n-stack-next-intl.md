# D-099 — Phase 2 i18n stack: next-intl + ja default + path-based locale routing

| 字段 | 值 |
|---|---|
| 状态 | **LOCKED final** — Session 44 Turn 1 user 4Q blanket-ACK `Q1=a Q2=a Q3=a Q4=a` 2026-05-20 (path α slow-pace per D-019 §3a) |
| 锁定 session | `docs/discussion/2026-05-20-session-44.md` Turn 1 |
| 类型 | **Structural infrastructure lock** + **partial supersede of D-088 §2.4** (locked error surface → per-locale lock) |
| 颗粒度 | g1 — i18n library choice + locale set + URL strategy + middleware compose order + locked error per-locale + AI prompt scope |
| 前置 ADR | D-085 §2.1-§2.4 (mode surfaces) / D-088 §2.3 (stable-prefix invariant) / D-088 §2.4 (locked surface — partially superseded by §2.5 below) / D-093 (Next.js 15 + Vercel) / D-095 §2.3 (DeepSeek stable-prefix layout) / D-097 (Basic Auth firewall — compose order locked here in §2.4) |
| Supersede? | **YES partial** — supersede D-088 §2.4 "locked Chinese error fallback" 的 single-locale narrow definition → per-locale lock (ja/zh/en parallel locked surfaces, same principle); retain D-088 §2.1-§2.3 + D-088 §2.4 retry semantics in full |

---

## 1. Context

**Trigger**: Phase 2 Module C Step 12 entered with 4Q design lock. The Sessions 9-11 UI surfaces (`<Chat />`, `<QuizExplain />`, `<QuizList />`, `<TermPopover />`, `<GlossaryList />`) shipped with **hardcoded ja/zh mixed strings** as documented in Step 9's source comment `// Q4=a hardcoded zh-CN now → no i18n catalog; Step 12 抽取`. Module C 4/4 is the agreed point to introduce i18n.

**Pre-lock state of the surface** (Session 43 close):
- 5 client components each carried their own `const TITLE = "IT パスポート — ..."`, `const ERROR_FALLBACK = "AI 暂时不可用，请稍后重试。"` etc., totalling ~30 hardcoded chrome strings split between ja primary and zh fallback registers.
- The locked Chinese error surface from D-088 §2.4 was duplicated literally in 3 components.
- The app rendered `<html lang="en">` (stale boilerplate from create-next-app, NOT a true lang).
- No locale routing; everything lived at `/chat` `/quiz` `/glossary` with no `[locale]` segment.

**4Q ask** (Session 44 Turn 1, D-019 §3a slow-pace):

| Q | Locked answer (Q*=a — third consecutive blanket-ACK across Sessions 41/43/44) |
|---|---|
| Q1 Layout shape | Top sticky tab nav (3 mode tabs + locale switcher right) |
| Q2 i18n stack | next-intl (Next.js 15 official partner) |
| Q3 Locale + URL strategy | ja default + path-based `/ja /zh /en` (localePrefix='always') |
| Q4 i18n string scope at Step 12 | Full chrome + busy + error trilingual (AI prompts untouched per D-095 §2.3) |

**D-019 "你来定" clause obligation discharged** (sub-decisions inside the Q*=a blanket):

Claude consulted **Context7** for `/websites/next-intl_dev` (484 snippets, official docs, score 87.67) on:
- Next.js 15 App Router `[locale]` segment + `setRequestLocale` static rendering
- Middleware composition pattern with non-i18n preconditions (the D-097 firewall case)
- `localePrefix` semantics (`'always'` vs `'as-needed'`)
- `createNavigation` Link / useRouter / usePathname wrappers
- `useTranslations` shared usage across server + client components
- `getRequestConfig` request-time message loader pattern
- `NextIntlClientProvider` boundary
- Type-safe messages via `IntlMessages` global augment

All sub-decisions in §2 below are grounded in Context7-verified next-intl 4.12.0 patterns, not memory.

---

## 2. Decision

### 2.1 i18n library = next-intl (Q2=a)

**Lock**: `next-intl@^4.12.0`.

**Rationale**:
1. Next.js 15 **official partner** (called out by Vercel + Next.js docs as the recommended i18n solution for App Router projects).
2. **First-class App Router + RSC + SSR** support (server + client `useTranslations` are the same import; the same component can render either side without code change).
3. **Locale-aware routing** built in (`createMiddleware` + `createNavigation` wrappers around Next's native APIs).
4. **`setRequestLocale`** enables static rendering for `[locale]` pages that use `useTranslations` — otherwise they'd bail out to dynamic.
5. **Locale-aware redirect / pathname / router** preserve the `[locale]` segment automatically; no manual stitching.
6. **ICU message format** support for plurals / dates / numbers — Step 14 polish has these ready when needed.
7. **Type-safe messages** via `IntlMessages` global augment from the canonical message file.
8. Active maintenance + healthy npm release cadence (Session 44 Context7 query 2026-05-20).

**Rejected alternatives** (none locked; recorded for traceability):
- `react-i18next`: largest ecosystem but App Router idiomatic patterns are noticeably noisier (separate server-side bootstrap config; manual locale plumbing); ICU support via add-on.
- `Lingui`: compiler-extract macro requires a babel/swc plugin in the build pipeline → adds Turbopack-config maintenance burden for marginal value at α scale.
- `Hand-rolled JSON dict + t(key)`: zero deps but reinvents plurals/dates/typing without budget-critical accuracy gain; loses static-rendering optimization unless we hand-roll setRequestLocale equivalent (which is what next-intl provides).

### 2.2 Locale set + default = `['ja', 'zh', 'en']`, default `ja`

**Lock**: 3 locales with ja as default.

**Rationale** (per Q3=a + target user analysis):

| Locale | Rationale |
|---|---|
| `ja` | Primary literacy of the JP-IT-Passport target user; corpus original language; quiz answer marker convention (ア/イ/ウ/エ); brand identity in JP context |
| `zh` | Secondary user pool (JP-resident Chinese-speakers preparing for ITパスポート); some chat history already in zh suggests existing usage |
| `en` | International IT terminology familiarity (most CS concepts have canonical English names); supports non-CJK user discovery |

**Rejected default `en`**: misaligned with both the corpus (JP source-of-truth) and the primary target-user profile (ja-IT-Passport candidate). Q3=a explicit reject.

### 2.3 URL strategy = `localePrefix: 'always'` (Q3=a path-based)

**Lock**: every URL has the locale prefix; `/` itself routes via next-intl middleware to `/ja` (Accept-Language can pick a different locale on first visit).

**Rejected alternatives**:
- `'as-needed'`: default ja would be unprefixed (`/chat`) while zh/en are prefixed (`/zh/chat`); this asymmetric URL shape blurs the locale boundary and causes link-sharing confusion. Q3=a explicitly rejects this in favour of "ja default + `/ja` path".
- Cookie-based: single URL per page, locale via cookie; rejected because search engines can't see zh/en versions (Phase 3 SEO blocker) and locale state isn't shareable.
- `?lang=` query: clashes with the existing `?qid=` / `?term=` modal-discovery convention from Steps 10/11.

### 2.4 Middleware composition order

**Lock**: D-097 firewall first → /api skip → next-intl handler.

**Rationale**: D-097 firewall MUST guard ALL paths (including the new `/ja/chat` etc) before any i18n routing. Reversing the order would briefly allow unauthorized visitors to see `/chat → /ja/chat` redirects (information leak: confirming the app exists at that domain). The `/api/*` branch bypass exists because:
- API routes are locale-agnostic (the same `/api/chat` handles all locales)
- next-intl middleware would 404 on unknown segments

**Implementation** (verified by `+5 vitest tests` in `src/__tests__/middleware.test.ts` via `vi.mock` next-intl/middleware stub):

```typescript
export function middleware(req: NextRequest): NextResponse {
  // Step 1 — D-097 firewall
  const expected = process.env.FIREWALL_BASIC_AUTH;
  if (!expected) return new NextResponse("Firewall misconfigured", { status: 503 });
  const auth = req.headers.get("authorization");
  if (!auth || !timingSafeStringEqual(auth, `Basic ${expected}`)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="${REALM}"`, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  // Step 2 — /api/* bypass i18n
  if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();
  // Step 3 — locale routing
  return handleI18nRouting(req);
}
```

Matcher: `"/((?!_next/static|_next/image|favicon.ico).*)"` (unchanged from D-097 baseline — firewall scope unchanged).

### 2.5 Partial supersede of D-088 §2.4 locked-error-surface → per-locale lock

**Pre-D-099 lock** (D-088 §2.4): single locked Chinese error surface `「AI 暂时不可用，请稍后重试。」` displayed regardless of user locale.

**Post-D-099 lock**: locked surface principle preserved per locale:

| Locale | Locked error surface |
|---|---|
| `ja` | `「AI が一時的に利用できません。後ほど再度お試しください。」` (locked) |
| `zh` | `「AI 暂时不可用，请稍后重试。」` (locked, byte-identical to D-088 §2.4) |
| `en` | `"AI is temporarily unavailable. Please try again later."` (locked) |

**Retain D-088 §2.4** retry semantics (1-retry, no-fallback). D-088 §2.4's "frozen string, no model-generated error narration" principle is preserved per-locale; locale flip does NOT change the string within a locale.

### 2.6 AI `SYSTEM_INSTRUCTION` strings: untouched server-side

**Lock**: `apps/web/src/lib/ai/{chat,quiz,hover}.ts` SYSTEM_INSTRUCTION + USER_PROMPT bodies stay byte-identical to Sessions 4-8.

**Rationale**: D-095 §2.3 stable-prefix invariant requires the corpus + SYSTEM_INSTRUCTION layout to be byte-identical across calls for the DeepSeek prefix cache to hit. Translating SYSTEM_INSTRUCTION to per-locale strings would:
- Quadruple the prefix-cache "buckets" (1 → 3 locales)
- Force fresh prefix-cache creation on first call per locale (cold creation cost)
- Be a structural cost change Phase 2 doesn't need (the model already produces JP/中文/English 3-section trilingual output regardless of UI locale)

**What gets translated**:
- UI chrome (nav, buttons, labels, headings, subtitles)
- Busy hints (BusyText)
- Error fallback (per §2.5)
- Modal headers / close button / retry button labels
- Search params display (page-entity references, reading prefix)

**What stays server-side untouched**:
- All `SYSTEM_INSTRUCTION` constants in `hover.ts`, `quiz.ts`, `chat.ts`
- All `USER_PROMPT` builders
- Corpus content (JP source-of-truth; trilingual fields already pre-translated in corpus)

---

## 3. Rejected alternatives (decision log for traceability)

| # | Alternative | Why rejected |
|---|---|---|
| 1 | react-i18next | App Router idiomatic less clean; loses static-rendering ergonomics |
| 2 | Lingui | Compiler-extract adds Turbopack-config maintenance |
| 3 | Hand-rolled `t()` | Reinvents plurals/dates/typing; loses static optim |
| 4 | en default | Misaligned with JP corpus + target user (Q3=a explicit reject) |
| 5 | `localePrefix: 'as-needed'` | Asymmetric URL shape blurs locale boundary (Q3=a explicit reject) |
| 6 | Cookie-based locale | URL not shareable; locale invisible to crawlers |
| 7 | `?lang=` query | Clashes with `?qid=` / `?term=` |
| 8 | Translate SYSTEM_INSTRUCTION per locale | Breaks D-095 §2.3 stable-prefix invariant + ratchets cache hit down |

---

## 4. Implementation note

Step 12 (Session 44 Turns 4-5) lands the full surface:
- Scaffold at `apps/web/src/i18n/{routing,navigation,request}.ts`
- Catalogs at `apps/web/messages/{ja,zh,en}.json` (~30 keys × 3 locales = 90 strings)
- Type-safe via `apps/web/src/global.d.ts` (`IntlMessages` augment from ja.json shape)
- `[locale]` segment ownership of `<html lang={locale}><body>` chain; root `app/layout.tsx` is pass-through
- next.config.ts wraps via `createNextIntlPlugin("./src/i18n/request.ts")`
- 5 client components migrated to `useTranslations`
- `<NavTabs />` + `<LocaleSwitcher />` (Suspense-wrapped for static prerender)
- middleware compose verified by `+5 vitest tests`

**5 in-step diversions** (none Rule-B-archive-worthy individually; all 1-3 line fixes; collectively widened γ wall drift):
1. `pnpm-workspace.yaml allowBuilds:` placeholder strings → valid booleans
2. Plugin version pinning (`@next/eslint-plugin-next` + `eslint-plugin-react-hooks`) to match `eslint-config-next@15.5.18`
3. `<Suspense>` wrap around `<LocaleSwitcher />` (useSearchParams CSR bailout)
4. vitest `vi.mock("next-intl/middleware")` + real `NextRequest` instead of `Request` cast
5. `LocaleRootPage` return type `Promise<never>` → `Promise<void>` (next-intl `redirect()` not typed `never` in v4.12)

---

## 5. β tripwire evidence collected at lock time

Single 真 LLM call during Session 44 UI smoke confirmed D-095 §2.3 stable-prefix invariant survives the migration:
- Surface: `アルゴリズム` on `/ja/glossary?term=...`
- Cache hit: **96%** (384 hit / 16 miss) — identical to Session 39 (5 days ago) and Session 43 (1 day ago) baselines
- Cross-session DeepSeek prefix cache TTL ratcheted to **> 6 days on prod**

→ `evidence/phase2/step_12_layout/cache_audit_2026-05-20.md` §1.

---

## 6. Future amendments

Per D-080 v1.1 §8 in-place amend pattern, this ADR is the single source of truth for:
- Adding a 4th locale (e.g., Korean for IT-Passport-equivalent JITEC FE in Korean — not on roadmap)
- Switching the i18n stack (NOT planned; Phase 5 cert-extractor framework might surface this)
- Changing default locale (Phase 4 AI assistant might surface this if zh-CN user pool overtakes ja)

Until then: **next-intl + ja default + path-based** is the stable footing for Phase 2-5.
