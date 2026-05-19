# Step 4 — file tree outline (POST-D-095)

> Updated 2026-05-19 Session 35 Turn 3 (D-095 LOCKED — DeepSeek default + Anthropic switchable).

## New files this step (final D-095 state)

```
apps/web/src/lib/ai/
├── provider.ts                            # ~140 lines — provider factory + stable-prefix builder + unified readCacheUsage
└── __tests__/
    └── provider.test.ts                   # ~190 lines — 22 unit tests covering 4 functions × all branches

apps/web/src/app/api/hello-ai/
└── route.ts                               # ~85 lines — POST streamText with stable-prefix layout + X-LLM-Provider header
```

## Deleted pre-commit (D-095 §4.1 supersede)

```
apps/web/src/lib/ai/anthropic.ts                       # (was ~70 lines, never committed; subsumed into provider.ts)
apps/web/src/lib/ai/__tests__/anthropic.test.ts        # (was ~85 lines / 8 tests; superseded by provider.test.ts 22 tests)
```

## Modified files this step (POST-D-095)

```
apps/web/package.json                     # +"ai": "^6.0.184", +"@ai-sdk/anthropic": "^3.0.78", +"@ai-sdk/deepseek": "^2.0.35"
apps/web/pnpm-lock.yaml                   # resolved +13 packages cumulative (ai 6.0.184, @ai-sdk/anthropic 3.0.78, @ai-sdk/deepseek 2.0.35, transitive)
```

## Top-level relevant tree (Module A + B Step 4 POST-D-095)

```
apps/web/
├── package.json                          # modified (3 AI deps)
├── pnpm-lock.yaml                        # modified
├── _fixtures/v1.0.3/glossary.json        # 317 KB — used by hello-ai stable-prefix corpus block
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── hello-ai/
│   │   │       └── route.ts              # POST-D-095 — uses getModel('smoke') + stable-prefix builder
│   │   ├── layout.tsx                    # Step 1 baseline
│   │   └── page.tsx                      # Step 1 baseline
│   └── lib/
│       ├── ai/                           # POST-D-095 dir (anthropic.ts removed)
│       │   ├── provider.ts               # NEW (replaces anthropic.ts)
│       │   └── __tests__/
│       │       └── provider.test.ts      # NEW (replaces anthropic.test.ts)
│       └── data/                         # Step 2-3 baseline (unchanged)
│           ├── DataSource.ts
│           ├── FsDataSource.ts
│           ├── assembleScope.ts
│           ├── index.ts
│           ├── types.ts
│           └── __tests__/
│               ├── FsDataSource.test.ts
│               ├── assembleScope.test.ts
│               └── index.test.ts
└── vitest.config.ts                      # Step 2 baseline (unchanged)
```

## Summary (POST-D-095)

- **Final new files**: 3 (`provider.ts`, `route.ts`, `provider.test.ts`)
- **Pre-commit deleted**: 2 (`anthropic.ts`, `anthropic.test.ts` — both superseded by `provider.ts` and `provider.test.ts` per D-095 §4.1)
- **Modified files**: 2 (`package.json`, `pnpm-lock.yaml`)
- **Unchanged from Step 3**: Module A `src/lib/data/` 6 files + Module A app router 2 files
