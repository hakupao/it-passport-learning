# Phase 2 Step 12 — file tree

Step 12 brings 4 distinct changes to `apps/web/`:

1. **next-intl scaffold** under `src/i18n/`
2. **[locale] route segment** at `src/app/[locale]/` (replaces old top-level chat/quiz/glossary)
3. **Layout chrome** = NavTabs + LocaleSwitcher (top sticky nav)
4. **i18n migration** in 5 existing client components (Chat / QuizExplain / TermPopover / QuizList / GlossaryList) via `useTranslations`

```
apps/web/
├── messages/                                         NEW
│   ├── ja.json                                       NEW (Japanese — source of truth)
│   ├── zh.json                                       NEW (Chinese)
│   └── en.json                                       NEW (English)
├── next.config.ts                                    MOD (createNextIntlPlugin wrapper)
├── package.json                                      MOD (+ next-intl 4.12.0 +
│                                                          eslint-plugin-react-hooks ^5.0.0 +
│                                                          @next/eslint-plugin-next 15.5.18)
├── pnpm-lock.yaml                                    MOD (deps install)
├── vitest.config.ts                                  MOD (no functional change at
│                                                          last revision; tried
│                                                          deps.inline first then
│                                                          reverted to baseline once
│                                                          vi.mock approach landed)
├── src/
│   ├── global.d.ts                                   NEW (IntlMessages typed-augment)
│   ├── middleware.ts                                 MOD (D-097 firewall + i18n compose)
│   ├── i18n/
│   │   ├── routing.ts                                NEW (locales ja/zh/en; ja default;
│   │   │                                                  localePrefix 'always')
│   │   ├── navigation.ts                             NEW (Link/redirect/usePathname/
│   │   │                                                  useRouter wrappers)
│   │   └── request.ts                                NEW (getRequestConfig — dynamic
│   │                                                      import of <locale>.json)
│   ├── components/
│   │   ├── NavTabs.tsx                               NEW (top sticky tab nav +
│   │   │                                                  Suspense'd LocaleSwitcher)
│   │   ├── LocaleSwitcher.tsx                        NEW (combobox; router.replace
│   │   │                                                  preserves searchParams via
│   │   │                                                  useTransition)
│   │   ├── Chat.tsx                                  MOD (useTranslations)
│   │   ├── QuizExplain.tsx                           MOD (useTranslations +
│   │   │                                                  BusySkeleton single-text)
│   │   ├── TermPopover.tsx                           MOD (useTranslations +
│   │   │                                                  BusySkeleton single-text)
│   │   ├── QuizList.tsx                              MOD (useTranslations)
│   │   └── GlossaryList.tsx                          MOD (useTranslations)
│   ├── app/
│   │   ├── layout.tsx                                MOD (stripped to return children)
│   │   ├── page.tsx                                  DEL (middleware handles /)
│   │   ├── chat/                                     DEL (moved into [locale]/)
│   │   ├── quiz/                                     DEL (moved into [locale]/)
│   │   ├── glossary/                                 DEL (moved into [locale]/)
│   │   ├── api/                                      UNCHANGED (all 4 routes)
│   │   └── [locale]/                                 NEW (effective root)
│   │       ├── layout.tsx                            NEW (html/body/Provider/NavTabs)
│   │       ├── page.tsx                              NEW (redirect → /[locale]/chat)
│   │       ├── chat/page.tsx                         NEW (server wrap of <Chat />)
│   │       ├── quiz/page.tsx                         NEW (server wrap of <QuizList />)
│   │       └── glossary/page.tsx                     NEW (server wrap of <GlossaryList />)
│   └── __tests__/
│       └── middleware.test.ts                        MOD (vi.mock next-intl/middleware
│                                                          + +5 composition tests)
└── (pnpm-workspace.yaml in repo root)                MOD (allowBuilds placeholders
                                                          replaced with valid booleans)
```

Cumulative diff at Step 12 close: 25 changed files (16 new / 8 modified / 4 deleted + 1 dir-tree migration containing 3 directories DEL + 3 corresponding NEW under [locale]/).

External deps added (pinned to match Next 15.5.18):
- `next-intl@^4.12.0`
- `eslint-plugin-react-hooks@^5.0.0`
- `@next/eslint-plugin-next@15.5.18`
